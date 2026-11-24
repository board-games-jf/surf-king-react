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
    expect(markers.group.children[0].children[0].material.opacity).toBe(.09)
    expect(markers.group.children[0].position.x).toBe(BOARD_LAYOUT[0].x)
    markers.update({ kind: 'attack', cellIds: [14], preview: false })
    expect(visibleIds()).toEqual([14])
    markers.update(undefined)
    expect(visibleIds()).toEqual([])
    original.forEach((marker, i) => expect(markers.group.children[i]).toBe(marker))
    geometry.dispose()
    original[0].children.forEach(child => child.material.dispose())
})
