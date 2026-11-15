import { BOARD_LAYOUT } from '../../map/layout/boardLayout'

export const CATALOG_TOOLS = Object.freeze(['Inspect', 'Shark', 'Stone', 'Island', 'Storm', 'Cyclone', 'Surfer', 'Erase'])
export const OBSTACLE_TYPES = Object.freeze(['Shark', 'Stone', 'Island', 'Storm', 'Cyclone'])

const DEFAULT_OBSTACLES = Object.freeze([
  [8, 'Shark'],
  [17, 'Stone'],
  [26, 'Island'],
  [35, 'Storm'],
  [44, 'Cyclone'],
])

// A showroom layout, not the initial positions or game engine state.
export function createBoardCatalog() {
  return {
    obstacles: Object.fromEntries(DEFAULT_OBSTACLES),
    surfers: { '0': 1, '1': 51 },
  }
}

export function createEmptyBoardCatalog() {
  return { obstacles: {}, surfers: {} }
}

export function placeCatalogAsset(catalog, cellId, tool, surferId = '0') {
  if (!Number.isInteger(cellId) || cellId < 0 || cellId >= BOARD_LAYOUT.length) return catalog
  if (!CATALOG_TOOLS.includes(tool) || tool === 'Inspect') return catalog

  const obstacles = { ...catalog.obstacles }
  const surfers = { ...catalog.surfers }
  delete obstacles[cellId]
  for (const id of Object.keys(surfers)) {
    if (surfers[id] === cellId) delete surfers[id]
  }

  if (OBSTACLE_TYPES.includes(tool)) {
    obstacles[cellId] = tool
  } else if (tool === 'Surfer') {
    if (!/^[0-6]$/.test(String(surferId))) return catalog
    surfers[String(surferId)] = cellId
  }
  return { obstacles, surfers }
}

export function createCatalogSnapshot(catalog, selectedCellId = null) {
  return {
    cells: BOARD_LAYOUT.map(({ id }) => ({
      id,
      obstacleType: catalog.obstacles[id] || null,
      remainingTurns: null,
    })),
    players: Object.entries(catalog.surfers)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([id, cellId]) => ({ id, cellId })),
    turn: 0,
    activePlayerId: null,
    selectedCellId: Number.isInteger(selectedCellId) && selectedCellId >= 0 && selectedCellId < BOARD_LAYOUT.length
      ? selectedCellId : null,
    maneuverDestinations: [],
  }
}
