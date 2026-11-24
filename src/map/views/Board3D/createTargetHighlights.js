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

// Presentation-only pool, sized to the complete board rather than movement's
// six neighbors. Shared geometry/materials are disposed by the scene.
export function createTargetHighlights(cells, shapeGeometry, outlineGeometry) {
    const group = new THREE.Group()
    group.name = 'target-highlights'
    const fill = new THREE.MeshBasicMaterial({
        transparent: true, opacity: .32, depthWrite: false,
        side: THREE.DoubleSide, toneMapped: false,
    })
    const stroke = new THREE.LineBasicMaterial({
        transparent: true, opacity: 1, depthWrite: false, toneMapped: false,
    })
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
        marker.position.set(cell.x, .36, cell.z)
        marker.scale.set(.91, 1, .91)
        marker.visible = false
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
        marker.add(surface, outline, icon)
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
        update(highlight) {
            const style = getTargetHighlightStyle(highlight?.kind)
            const ids = new Set(style ? highlight.cellIds : [])
            const blocked = new Map((highlight?.blocked || []).map(item => [item.id, item.code]))
            if (style) {
                fill.color.set(style.color)
                stroke.color.set(style.color)
                fill.opacity = highlight.preview ? .24 : .32
                stroke.opacity = highlight.preview ? .9 : 1
            }
            markers.forEach((marker, id) => {
                const valid = ids.has(id)
                const code = blocked.get(id)
                const [surface, outline, icon] = marker.children
                marker.visible = valid || !!code
                marker.userData.blocked = code
                if (!valid && code) {
                    const m = materials(code)
                    surface.material = m.fill
                    outline.material = m.stroke
                    icon.material = m.icon
                    icon.visible = true
                } else {
                    surface.material = fill
                    outline.material = stroke
                    icon.visible = !!code
                    if (code) icon.material = materials(code).icon
                }
            })
        },
    }
}
