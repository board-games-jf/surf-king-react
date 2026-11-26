import { BOARD_LAYOUT } from '../../map/layout/boardLayout'
import layoutManifest from '../../map/layout/board-layout.json'

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
  if (tool === 'Surfer') {
    if (!/^[0-6]$/.test(String(surferId))) return catalog
    const occupants = Object.entries(surfers).filter(([id, position]) => id !== String(surferId) && position === cellId)
    if (occupants.length >= 2) return catalog
  } else {
    delete obstacles[cellId]
    for (const id of Object.keys(surfers)) {
      if (surfers[id] === cellId) delete surfers[id]
    }
  }

  if (OBSTACLE_TYPES.includes(tool)) {
    obstacles[cellId] = tool
  } else if (tool === 'Surfer') {
    surfers[String(surferId)] = cellId
  }
  const fallen = Object.fromEntries(Object.entries(catalog.fallen || {}).filter(([id]) => id in surfers))
  return Object.keys(fallen).length ? { obstacles, surfers, fallen } : { obstacles, surfers }
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
      .map(([id, cellId]) => ({ id, cellId, fallen: catalog.fallen?.[id] === true })),
    turn: 0,
    activePlayerId: null,
    selectedCellId: Number.isInteger(selectedCellId) && selectedCellId >= 0 && selectedCellId < BOARD_LAYOUT.length
      ? selectedCellId : null,
    maneuverDestinations: [],
  }
}

export function setCatalogSurferFallen(catalog, id, fallen) {
  if (!Object.prototype.hasOwnProperty.call(catalog.surfers, id)) return catalog
  const next = { ...catalog.fallen }
  if (fallen) next[id] = true
  else delete next[id]
  return { ...catalog, fallen: next }
}

// A deterministic showcase movement to an empty nearby cell, not a legal move check.
export function nearbyCatalogCell(catalog, id) {
  const origin = BOARD_LAYOUT[catalog.surfers[id]]
  if (!origin || catalog.fallen?.[id]) return null
  const used = new Set([...Object.values(catalog.surfers), ...Object.keys(catalog.obstacles).map(Number)])
  let best = null, distance = Infinity
  for (const cell of BOARD_LAYOUT) {
    if (used.has(cell.id)) continue
    const d = (cell.x - origin.x) ** 2 + (cell.z - origin.z) ** 2
    if (d < distance) { distance = d; best = cell.id }
  }
  return best
}

// Isolated preview: land on a neighboring hazard without removing it.
export function catalogJumpTarget(catalog, id) {
  const origin = BOARD_LAYOUT[catalog.surfers[id]]
  if (!origin || catalog.fallen?.[id]) return null
  const occupied = new Set(Object.entries(catalog.surfers).filter(([other]) => other !== String(id)).map(([, cell]) => cell))
  const spacing = Math.sqrt(3) * layoutManifest.hexRadius
  const target = Object.keys(catalog.obstacles).map(Number).find(cellId => {
    const cell = BOARD_LAYOUT[cellId]
    return cell && !occupied.has(cellId) && Math.abs(Math.hypot(cell.x - origin.x, cell.z - origin.z) - spacing) < .005
  })
  return target === undefined ? null : target
}

export function jumpCatalogSurfer(catalog, id) {
  const target = catalogJumpTarget(catalog, id)
  return target === null ? catalog : { ...catalog, surfers: { ...catalog.surfers, [id]: target } }
}

// Illustrative two-step route through neighboring empty cells, isolated from a match.
export function catalogCurrentRoute(catalog, id) {
  const start = catalog.surfers[id]
  if (!BOARD_LAYOUT[start] || catalog.fallen?.[id]) return []
  const occupied = new Set([...Object.values(catalog.surfers), ...Object.keys(catalog.obstacles).map(Number)])
  const spacing = Math.sqrt(3) * layoutManifest.hexRadius
  const route = []
  let from = start
  for (let step = 0; step < 2; step++) {
    const origin = BOARD_LAYOUT[from]
    const next = BOARD_LAYOUT.filter(cell => !occupied.has(cell.id) &&
      Math.abs(Math.hypot(cell.x - origin.x, cell.z - origin.z) - spacing) < .005)
      .sort((a, b) => a.z - b.z || a.id - b.id)[0]
    if (!next) break
    route.push(next.id)
    occupied.add(next.id)
    from = next.id
  }
  return route
}

// Prepare a nearby partner for an isolated position-exchange preview.
export function catalogChangePlan(catalog, id) {
  const origin = catalog.surfers[id]
  if (!BOARD_LAYOUT[origin] || catalog.fallen?.[id]) return null
  const targetId = Object.keys(catalog.surfers).find(other => other !== String(id) && !catalog.fallen?.[other])
  if (targetId === undefined) return null
  const source = BOARD_LAYOUT[origin], partner = BOARD_LAYOUT[catalog.surfers[targetId]]
  const spacing = Math.sqrt(3) * layoutManifest.hexRadius
  const adjacent = Math.abs(Math.hypot(partner.x - source.x, partner.z - source.z) - spacing) < .005
  const used = new Set([...Object.values(catalog.surfers), ...Object.keys(catalog.obstacles).map(Number)])
  const nearby = BOARD_LAYOUT.find(cell => !used.has(cell.id) &&
    Math.abs(Math.hypot(cell.x - source.x, cell.z - source.z) - spacing) < .005)
  const targetCell = adjacent ? partner.id : nearby?.id
  return targetCell === undefined ? null : { playerId: String(id), targetId, origin, targetCell }
}

export function applyCatalogChange(catalog, plan) {
  if (!plan || catalog.surfers[plan.playerId] !== plan.origin || !(plan.targetId in catalog.surfers) || catalog.fallen?.[plan.playerId] || catalog.fallen?.[plan.targetId]) return catalog
  return { ...catalog, surfers: { ...catalog.surfers, [plan.playerId]: plan.targetCell, [plan.targetId]: plan.origin } }
}
