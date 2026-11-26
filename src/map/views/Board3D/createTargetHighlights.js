import * as THREE from 'three'
import { getTargetHighlightStyle, getTargetBlockStyle, TARGET_BLOCK_SYMBOL_PATHS } from '../../contract/targetHighlight'

// Small, shared, camera-facing icon texture, independent of DOM/canvas support.
function createBlockTexture(symbol, color) {
    const size = 64
    const pixels = new Uint8Array(size * size * 4)
    const rgb = color.slice(1).match(/../g).map(v => parseInt(v, 16))
    const segments = TARGET_BLOCK_SYMBOL_PATHS[symbol].flatMap(path =>
        path.slice(1).map((point, i) => [path[i], point]))
    const distance = (x, y, [a, b]) => {
        const dx = b[0] - a[0], dy = b[1] - a[1]
        const t = Math.max(0, Math.min(1, ((x-a[0])*dx + (y-a[1])*dy)/(dx*dx+dy*dy)))
        return Math.hypot(x-a[0]-t*dx, y-a[1]-t*dy)
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const u = (x+.5)/size, v = 1-(y+.5)/size
        const radius = Math.hypot(u-.5,v-.5)
        if (radius > .48) continue
        const ink = radius > .43 || segments.some(segment => distance(u,v,segment) < .045)
        pixels.set([...(ink ? rgb : [21,54,64]), 255], (y*size+x)*4)
    }
    const texture = new THREE.DataTexture(pixels, size, size)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.magFilter = THREE.LinearFilter
    texture.minFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
}

// A soft radial texture gives the floating plate a reflection on the water.
function createReflectionTexture() {
    const size = 64
    const pixels = new Uint8Array(size * size * 4)
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const distance = Math.hypot((x + .5) / size * 2 - 1, (y + .5) / size * 2 - 1)
        const alpha = Math.pow(Math.max(0, 1 - distance), 2) * 150
        pixels.set([255, 255, 255, Math.round(alpha)], (y * size + x) * 4)
    }
    const texture = new THREE.DataTexture(pixels, size, size)
    texture.magFilter = texture.minFilter = THREE.LinearFilter
    texture.needsUpdate = true
    return texture
}

function createPlateSides(outlineGeometry) {
    const outline = outlineGeometry.getAttribute('position')
    const vertices = []
    if (outline) for (let i = 0; i + 1 < outline.count; i++) {
        const x1 = outline.getX(i), z1 = outline.getZ(i)
        const x2 = outline.getX(i + 1), z2 = outline.getZ(i + 1)
        vertices.push(x1, 0, z1, x2, 0, z2, x2, -.07, z2, x1, 0, z1, x2, -.07, z2, x1, -.07, z1)
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
}

// Presentation-only pool, sized to the complete board rather than movement's
// six neighbors. Shared geometry/materials are disposed by the scene.
export function createTargetHighlights(cells, shapeGeometry, outlineGeometry) {
    const group = new THREE.Group()
    group.name = 'target-highlights'
    const fill = new THREE.MeshPhysicalMaterial({
        transparent: true, opacity: .32, depthWrite: false, roughness: .24, metalness: .08, clearcoat: .65,
        side: THREE.DoubleSide, toneMapped: false,
    })
    const stroke = new THREE.LineBasicMaterial({
        transparent: true, opacity: 1, depthWrite: false, toneMapped: false,
    })
    const attackFill = new THREE.MeshPhysicalMaterial({ color: getTargetHighlightStyle('attack').color,
        transparent: true, opacity: .36, depthWrite: false, roughness: .24, metalness: .08, clearcoat: .65, side: THREE.DoubleSide, toneMapped: false })
    const attackStroke = new THREE.LineBasicMaterial({ color: getTargetHighlightStyle('attack').color,
        transparent: true, opacity: 1, depthWrite: false, toneMapped: false })
    const sideGeometry = createPlateSides(outlineGeometry)
    const sideMaterial = new THREE.MeshBasicMaterial({ transparent: true, opacity: .25, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
    const attackSideMaterial = sideMaterial.clone()
    attackSideMaterial.color.set(getTargetHighlightStyle('attack').color)
    const reflectionGeometry = new THREE.PlaneGeometry(3.2, 3.2)
    const reflectionMaterial = new THREE.MeshBasicMaterial({ map: createReflectionTexture(), transparent: true,
        opacity: .32, depthWrite: false, side: THREE.DoubleSide, toneMapped: false })
    const attackReflectionMaterial = reflectionMaterial.clone()
    attackReflectionMaterial.color.set(getTargetHighlightStyle('attack').color)
    let lastElapsed = null
    const blockedMaterials = new Map()
    function materials(code) {
        const style = getTargetBlockStyle(code)
        const key = style.symbol + style.color
        if (!blockedMaterials.has(key)) blockedMaterials.set(key, {
            fill: new THREE.MeshBasicMaterial({ color: style.color, transparent: true,
                opacity: .08, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }),
            stroke: new THREE.LineBasicMaterial({ color: style.color, transparent: true,
                opacity: .85, depthWrite: false, toneMapped: false }),
            icon: new THREE.SpriteMaterial({ map: createBlockTexture(style.symbol, style.color),
                transparent: true, depthTest: false, depthWrite: false, toneMapped: false }),
        })
        return blockedMaterials.get(key)
    }
    // All three icon variants are referenced by the scene for its lifetime.
    // Hidden holders let the existing scene disposal collect every material.
    const icons = ['protected', 'hangloose', 'minimum', 'range'].map(materials)
    const markers = new Map(cells.map(cell => {
        const marker = new THREE.Group()
        marker.position.set(cell.x, .15, cell.z)
        marker.scale.set(.91, 1, .91)
        marker.visible = false
        marker.userData.active = false
        marker.userData.progress = 0
        const surface = new THREE.Mesh(shapeGeometry, fill)
        surface.rotation.x = -Math.PI / 2
        surface.renderOrder = 2
        const outline = new THREE.LineLoop(outlineGeometry, stroke)
        outline.position.y = .005
        outline.renderOrder = 3
        const icon = new THREE.Sprite(icons[0].icon)
        icon.position.set(.65, .88, 0)
        icon.scale.set(.65, .65, 1)
        icon.renderOrder = 999
        icon.visible = false
        const attack = new THREE.Group()
        const attackSurface = new THREE.Mesh(shapeGeometry, attackFill)
        attackSurface.rotation.x = -Math.PI / 2
        attackSurface.position.y = .012
        attackSurface.renderOrder = 4
        const attackOutline = new THREE.LineLoop(outlineGeometry, attackStroke)
        attackOutline.position.y = .017
        attackOutline.renderOrder = 5
        attack.add(attackSurface, attackOutline)
        attack.visible = false
        const reflection = new THREE.Mesh(reflectionGeometry, reflectionMaterial)
        reflection.rotation.x = -Math.PI / 2
        reflection.position.y = .04
        reflection.renderOrder = 1
        const sides = new THREE.Mesh(sideGeometry, sideMaterial)
        sides.renderOrder = 2
        marker.add(surface, outline, icon, attack, reflection, sides)
        group.add(marker)
        return [cell.id, marker]
    }))
    // Dispose unused variants through scene traversal without adding marker children.
    const resources = new THREE.Group()
    resources.visible = false
    icons.forEach(m => resources.add(new THREE.Mesh(shapeGeometry, m.fill),
        new THREE.LineLoop(outlineGeometry, m.stroke), new THREE.Sprite(m.icon)))
    if (group.children.length) group.children[0].add(resources)
    return {
        group,
        update(highlight, useIndividualLabels = false, occupiedCells = new Set()) {
            const style = getTargetHighlightStyle(highlight?.kind)
            const baseOpacity = highlight?.preview ? .24 : .32
            const ids = new Set(style ? highlight.cellIds : [])
            const attackIds = new Set(highlight?.attackCellIds || [])
            const blocked = new Map((highlight?.blocked || []).map(item => [item.id, item.code]))
            const labeledCells = new Set((highlight?.blocked || []).filter(item => item.playerId != null).map(item => item.id))
            if (style) {
                fill.color.set(style.color)
                stroke.color.set(style.color)
                sideMaterial.color.set(style.color)
                reflectionMaterial.color.set(style.color)
                fill.opacity = baseOpacity
                stroke.opacity = highlight.preview ? .9 : 1
            }
            markers.forEach((marker, id) => {
                const valid = ids.has(id)
                const code = blocked.get(id)
                const [surface, outline, icon, attack, reflection, sides] = marker.children
                const attackable = attackIds.has(id)
                const active = valid || !!code || attackable
                marker.userData.active = active
                marker.userData.occupied = occupiedCells.has(id)
                if (!active) return
                marker.visible = true
                surface.visible = valid || !!code
                outline.visible = valid || !!code
                attack.visible = attackable
                reflection.material = attackable && !valid ? attackReflectionMaterial : reflectionMaterial
                sides.material = attackable && !valid ? attackSideMaterial : sideMaterial
                sides.visible = valid || attackable
                attack.scale.setScalar(valid ? .84 : 1)
                marker.userData.blocked = code
                if (!valid && code) {
                    const m = materials(code)
                    surface.material = m.fill
                    outline.material = m.stroke
                    icon.material = m.icon
                    icon.visible = !(useIndividualLabels && labeledCells.has(id))
                } else {
                    surface.material = fill
                    outline.material = stroke
                    icon.visible = !!code && !(useIndividualLabels && labeledCells.has(id))
                    if (code) icon.material = materials(code).icon
                }
            })
        },
        animate(elapsed, reduced) {
            const dt = lastElapsed === null ? 0 : Math.min(.1, Math.max(0, elapsed - lastElapsed))
            lastElapsed = elapsed
            markers.forEach(marker => {
                const active = marker.userData.active
                const progress = reduced ? (active ? 1 : 0) : THREE.MathUtils.clamp(marker.userData.progress + (active ? 1 : -1) * dt / .36, 0, 1)
                marker.userData.progress = progress
                if (!active && progress === 0) { marker.visible = false; return }
                const eased = progress * progress * (3 - 2 * progress)
                // Keep the plate near the water when a surfer occupies the hex,
                // so the rider and board remain in front of the translucent surface.
                const lift = (marker.userData.occupied ? .02 : .26) * eased +
                    (reduced ? 0 : (marker.userData.occupied ? .004 : .025) * eased * Math.sin(elapsed * 1.8))
                marker.position.y = .15 + lift
                const reflection = marker.children[4]
                reflection.position.y = .04 - lift
                reflection.scale.setScalar(.7 + .3 * eased)
                reflection.visible = progress > 0
            })
        },
    }
}
