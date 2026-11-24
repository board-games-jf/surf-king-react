import * as THREE from 'three'
import { getTargetHighlightStyle } from '../../contract/targetHighlight'

// Presentation-only pool, sized to the complete board rather than movement's
// six neighbors. Shared geometry/materials are disposed by the scene.
export function createTargetHighlights(cells, shapeGeometry, outlineGeometry) {
    const group = new THREE.Group()
    group.name = 'target-highlights'
    const fill = new THREE.MeshBasicMaterial({
        transparent: true, opacity: .16, depthWrite: false,
        side: THREE.DoubleSide, toneMapped: false,
    })
    const stroke = new THREE.LineBasicMaterial({
        transparent: true, opacity: .95, depthWrite: false, toneMapped: false,
    })
    const markers = new Map(cells.map(cell => {
        const marker = new THREE.Group()
        marker.position.set(cell.x, .245, cell.z)
        marker.scale.set(.91, 1, .91)
        marker.visible = false
        const surface = new THREE.Mesh(shapeGeometry, fill)
        surface.rotation.x = -Math.PI / 2
        surface.renderOrder = 2
        const outline = new THREE.LineLoop(outlineGeometry, stroke)
        outline.position.y = .005
        outline.renderOrder = 3
        marker.add(surface, outline)
        group.add(marker)
        return [cell.id, marker]
    }))
    return {
        group,
        update(highlight) {
            const style = getTargetHighlightStyle(highlight?.kind)
            const ids = new Set(style ? highlight.cellIds : [])
            if (style) {
                fill.color.set(style.color)
                stroke.color.set(style.color)
                fill.opacity = highlight.preview ? .09 : .16
                stroke.opacity = highlight.preview ? .6 : .95
            }
            markers.forEach((marker, id) => { marker.visible = ids.has(id) })
        },
    }
}
