import { BOARD_LAYOUT } from '../../map/layout/boardLayout'
import {
  CATALOG_TOOLS,
  OBSTACLE_TYPES,
  createBoardCatalog,
  createEmptyBoardCatalog,
  createCatalogSnapshot,
  placeCatalogAsset,
  setCatalogSurferFallen,
  nearbyCatalogCell,
  catalogJumpTarget,
  jumpCatalogSurfer,
  catalogCurrentRoute,
  catalogChangePlan,
  applyCatalogChange,
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

  test.each(OBSTACLE_TYPES)('moving a surfer onto %s keeps the obstacle visible', type => {
    const original = placeCatalogAsset(createEmptyBoardCatalog(), 8, type)
    const moved = placeCatalogAsset(original, 8, 'Surfer', '0')
    expect(moved.obstacles[8]).toBe(type)
    expect(createCatalogSnapshot(moved).cells[8].obstacleType).toBe(type)
    expect(createCatalogSnapshot(moved).players).toEqual([{ id: '0', cellId: 8, fallen: false }])
  })

  test('keeps two surfers on one cell and rejects a third', () => {
    const first = placeCatalogAsset(createEmptyBoardCatalog(), 8, 'Surfer', '0')
    const shared = placeCatalogAsset(first, 8, 'Surfer', '1')
    expect(shared.surfers).toEqual({ '0': 8, '1': 8 })
    expect(placeCatalogAsset(shared, 8, 'Surfer', '2')).toBe(shared)
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

test('glide preview picks a nearby vacant cell and never moves a fallen surfer automatically', () => {
  const catalog = createBoardCatalog()
  const next = nearbyCatalogCell(catalog, '0')
  expect(Number.isInteger(next)).toBe(true)
  expect(Object.values(catalog.surfers)).not.toContain(next)
  expect(catalog.obstacles[next]).toBeUndefined()
  expect(nearbyCatalogCell(setCatalogSurferFallen(catalog, '0', true), '0')).toBeNull()
  expect(nearbyCatalogCell(catalog, '9')).toBeNull()
})

test('jump preview lands on an adjacent hazard without removing it or moving another surfer', () => {
  const initial = createBoardCatalog()
  expect(catalogJumpTarget(initial, '0')).toBe(8)
  const landed = jumpCatalogSurfer(initial, '0')
  expect(landed.surfers['0']).toBe(8)
  expect(landed.surfers['1']).toBe(initial.surfers['1'])
  expect(landed.obstacles[8]).toBe('Shark')
  expect(initial.surfers['0']).toBe(1)
  expect(catalogJumpTarget(setCatalogSurferFallen(initial, '0', true), '0')).toBeNull()
  expect(catalogJumpTarget(createEmptyBoardCatalog(), '0')).toBeNull()
})

test('Surf Current preview finds up to two distinct neighboring empty cells without changing the catalog', () => {
  const catalog = createBoardCatalog()
  const original = JSON.stringify(catalog)
  const route = catalogCurrentRoute(catalog, '0')
  expect(route).toHaveLength(2)
  expect(new Set([catalog.surfers['0'], ...route]).size).toBe(3)
  let from = BOARD_LAYOUT[catalog.surfers['0']]
  for (const id of route) {
    const cell = BOARD_LAYOUT[id]
    expect(Math.hypot(cell.x - from.x, cell.z - from.z)).toBeCloseTo(2.295, 2)
    expect(catalog.obstacles[id]).toBeUndefined()
    expect(Object.values(catalog.surfers)).not.toContain(id)
    expect(cell.z).toBeLessThan(from.z)
    from = cell
  }
  expect(JSON.stringify(catalog)).toBe(original)
  expect(catalogCurrentRoute(setCatalogSurferFallen(catalog, '0', true), '0')).toEqual([])
})

test('Change preview stages a nearby partner and swaps positions without changing hazards', () => {
  const catalog = createBoardCatalog()
  const plan = catalogChangePlan(catalog, '0')
  expect(plan.targetId).toBe('1')
  expect(plan.origin).toBe(catalog.surfers['0'])
  expect(catalog.obstacles[plan.targetCell]).toBeUndefined()
  const swapped = applyCatalogChange(catalog, plan)
  expect(swapped.surfers['0']).toBe(plan.targetCell)
  expect(swapped.surfers['1']).toBe(plan.origin)
  expect(swapped.obstacles).toEqual(catalog.obstacles)
  expect(catalog.surfers['1']).toBe(51)
  expect(catalogChangePlan(setCatalogSurferFallen(catalog, '1', true), '0')).toBeNull()
  expect(catalogChangePlan(createEmptyBoardCatalog(), '0')).toBeNull()
})
