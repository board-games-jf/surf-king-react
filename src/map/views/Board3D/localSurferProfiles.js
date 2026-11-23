import { BOARD_TYPES, CHARACTER_TYPES } from './surferStyle'

export const LOCAL_SURFER_PROFILES_KEY = 'surf-king-local-surfer-profiles-v1'
export const LOCAL_PLAYER_COUNT = 7

export function normalizeLocalPlayerId(value) {
  const text = String(value)
  return /^[0-6]$/.test(text) ? text : null
}

function validProfile(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  if (!CHARACTER_TYPES.includes(value.character) || !BOARD_TYPES.includes(value.boardType)) return null
  return { character: value.character, boardType: value.boardType }
}

// Appearance choices never enter the authoritative boardgame.io snapshot.
export function readLocalSurferProfiles(storage) {
  try {
    const store = storage || window.localStorage
    const saved = JSON.parse(store.getItem(LOCAL_SURFER_PROFILES_KEY) || 'null')
    if (saved?.version !== 1 || !saved.players || typeof saved.players !== 'object' ||
        Array.isArray(saved.players)) return {}
    const result = {}
    Object.entries(saved.players).forEach(([id, value]) => {
      const profile = validProfile(value)
      if (normalizeLocalPlayerId(id) !== null && profile) result[id] = profile
    })
    return result
  } catch (_) {
    return {}
  }
}

export function readLastLocalSurferPlayer(storage) {
  try {
    const store = storage || window.localStorage
    const saved = JSON.parse(store.getItem(LOCAL_SURFER_PROFILES_KEY) || 'null')
    return saved?.version === 1 ? (normalizeLocalPlayerId(saved.activePlayer) || '0') : '0'
  } catch (_) { return '0' }
}

export function saveLocalSurferProfile(playerId, style, storage) {
  const id = normalizeLocalPlayerId(playerId)
  const profile = validProfile(style)
  if (id === null || !profile) throw new Error('Invalid local surfer appearance.')
  const store = storage || window.localStorage
  const players = readLocalSurferProfiles(store)
  store.setItem(LOCAL_SURFER_PROFILES_KEY, JSON.stringify({
    version: 1,
    activePlayer: id,
    players: { ...players, [id]: profile }
  }))
  return profile
}
