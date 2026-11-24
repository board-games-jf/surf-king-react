import * as THREE from 'three'
import { BOARD_LAYOUT } from '../../layout/boardLayout'
import { createTargetHighlights } from './createTargetHighlights'
import { getTargetHighlightStyle } from '../../contract/targetHighlight'

test('shows all valid hexes, updates colors and clears stale markers without new allocations', () => {
    const geometry = new THREE.BufferGeometry()
    const markers = createTargetHighlights(BOARD_LAYOUT, geometry, geometry)
    const original = markers.group.children.slice()
    const visibleIds = () => markers.group.children.flatMap((m, i) => m.visible ? [BOARD_LAYOUT[i].id] : [])
    expect(visibleIds()).toEqual([])
    const cellIds = BOARD_LAYOUT.map(c => c.id)
    markers.update({ kind: 'placement', cellIds, preview: false })
    expect(visibleIds()).toEqual(cellIds)
    expect(markers.group.children[0].children[0].material.color.getHexString()).toBe(getTargetHighlightStyle('placement').color.slice(1))
    markers.update({ kind: 'move', cellIds: [0, 7], preview: true })
    expect(visibleIds()).toEqual([0, 7])
    expect(markers.group.children[0].children[0].material.opacity).toBe(.24)
    expect(markers.group.children[0].position.x).toBe(BOARD_LAYOUT[0].x)
    markers.update({ kind: 'attack', cellIds: [14], preview: false })
    expect(visibleIds()).toEqual([14])
    markers.update(undefined)
    expect(visibleIds()).toEqual([])
    original.forEach((marker, i) => expect(markers.group.children[i]).toBe(marker))
    geometry.dispose()
    const materials = new Set()
    markers.group.traverse(child => { if (child.material) materials.add(child.material) })
    materials.forEach(material => { material.map?.dispose(); material.dispose() })
})

test('blocked opponent icons are distinct from valid targets and clear on cancellation', () => {
    const geometry = new THREE.BufferGeometry()
    const markers = createTargetHighlights(BOARD_LAYOUT, geometry, geometry)
    const [a,b,c] = markers.group.children
    markers.update({ kind: 'attack', cellIds: [0], preview: true,
        blocked: [{ id: 1, code: 'minimum' }, { id: 2, code: 'protected' }] })
    expect(a.visible).toBe(true)
    expect(a.children[2].visible).toBe(false)
    expect(b.userData.blocked).toBe('minimum')
    expect(c.userData.blocked).toBe('protected')
    expect(b.children[2].visible).toBe(true)
    expect(c.children[2].visible).toBe(true)
    expect(b.children[2].material).not.toBe(c.children[2].material)
    markers.update(undefined)
    expect(markers.group.children.every(marker => !marker.visible)).toBe(true)
    geometry.dispose()
    const materials = new Set()
    markers.group.traverse(child => { if (child.material) materials.add(child.material) })
    materials.forEach(material => { material.map?.dispose(); material.dispose() })
})
