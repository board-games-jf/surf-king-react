import { BOARD_LAYOUT } from '../../map/layout/boardLayout'
import {
  CATALOG_TOOLS,
  OBSTACLE_TYPES,
  createBoardCatalog,
  createEmptyBoardCatalog,
  createCatalogSnapshot,
  placeCatalogAsset,
  setCatalogSurferFallen,
} from './catalogState'

describe('interactive board catalog fixtures', () => {
  test('starts with all five real obstacle identifiers and illustrative surfers', () => {
    const catalog = createBoardCatalog()
    expect(Object.values(catalog.obstacles).sort()).toEqual([...OBSTACLE_TYPES].sort())
    expect(catalog.surfers).toEqual({ '0': 1, '1': 51 })
    expect(new Set([...Object.keys(catalog.obstacles).map(Number), ...Object.values(catalog.surfers)]).size)
      .toBe(7)
  })

  test('adapts its fixture to the 53-cell render snapshot without match state', () => {
    const snapshot = createCatalogSnapshot(createBoardCatalog(), 8)
    expect(snapshot.cells).toHaveLength(BOARD_LAYOUT.length)
    expect(snapshot.cells.map(cell => cell.id)).toEqual(BOARD_LAYOUT.map(cell => cell.id))
    expect(snapshot.cells[8]).toEqual({ id: 8, obstacleType: 'Shark', remainingTurns: null })
    expect(snapshot.players).toEqual([{ id: '0', cellId: 1, fallen: false }, { id: '1', cellId: 51, fallen: false }])
    expect(snapshot.selectedCellId).toBe(8)
    expect(snapshot.maneuverDestinations).toEqual([])
    expect(snapshot.activePlayerId).toBeNull()
    expect(JSON.stringify(snapshot)).not.toMatch(/cards|moves|deck|gameState/)
  })

  test.each(OBSTACLE_TYPES)('places and replaces a %s in any valid empty cell', (type) => {
    const original = createBoardCatalog()
    const updated = placeCatalogAsset(original, 20, type)
    expect(updated.obstacles[20]).toBe(type)
    expect(original.obstacles[20]).toBeUndefined()
    expect(updated.surfers).toEqual(original.surfers)
  })

  test('moving a surfer clears conflicting objects and avoids duplicate surfers', () => {
    const original = createBoardCatalog()
    const moved = placeCatalogAsset(original, 8, 'Surfer', '0')
    expect(moved.obstacles[8]).toBeUndefined()
    expect(moved.surfers['0']).toBe(8)
    expect(Object.values(moved.surfers)).not.toContain(1)
    expect(createCatalogSnapshot(moved).players).toHaveLength(2)

    const replaced = placeCatalogAsset(moved, 8, 'Surfer', '1')
    expect(replaced.surfers).toEqual({ '1': 8 })
    expect(original.surfers).toEqual({ '0': 1, '1': 51 })
  })

  test('placing an obstacle over a surfer removes the surfer from the catalog only', () => {
    const updated = placeCatalogAsset(createBoardCatalog(), 1, 'Cyclone')
    expect(updated.obstacles[1]).toBe('Cyclone')
    expect(updated.surfers['0']).toBeUndefined()
  })

  test('inspecting, erasing, resetting and clearing are isolated operations', () => {
    const initial = createBoardCatalog()
    expect(placeCatalogAsset(initial, 0, 'Inspect')).toBe(initial)
    const erased = placeCatalogAsset(initial, 8, 'Erase')
    expect(erased.obstacles[8]).toBeUndefined()
    expect(initial.obstacles[8]).toBe('Shark')
    expect(createEmptyBoardCatalog()).toEqual({ obstacles: {}, surfers: {} })
    expect(createBoardCatalog()).toEqual(initial)
  })

  test('rejects invalid cells, tools and surfer variants', () => {
    const initial = createBoardCatalog()
    for (const id of [-1, 53, 1.5, null, '8']) {
      expect(placeCatalogAsset(initial, id, 'Stone')).toBe(initial)
    }
    expect(placeCatalogAsset(initial, 12, 'Invalid')).toBe(initial)
    expect(placeCatalogAsset(initial, 12, 'Surfer', '7')).toBe(initial)
    expect(CATALOG_TOOLS).toContain('Inspect')
    expect(createCatalogSnapshot(initial, 53).selectedCellId).toBeNull()
  })
})

test('catalog fall and remount preserve positions and stay isolated from other players', () => {
  const original = createBoardCatalog()
  const fallen = setCatalogSurferFallen(original, '0', true)
  expect(createCatalogSnapshot(fallen).players.map(p => p.fallen)).toEqual([true, false])
  expect(fallen.surfers).toEqual(original.surfers)
  expect(createCatalogSnapshot(setCatalogSurferFallen(fallen, '0', false)).players[0].fallen).toBe(false)
  expect(setCatalogSurferFallen(original, '9', true)).toBe(original)
})
