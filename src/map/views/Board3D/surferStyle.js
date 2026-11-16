// Cosmetic choices only. They never influence boardgame.io rules or movement.
export const CHARACTER_TYPES = Object.freeze(['male', 'female'])
export const HAIRSTYLES = Object.freeze(['short', 'wavy', 'ponytail'])
export const HAIR_COLORS = Object.freeze({
  brown: '#644027', black: '#24282b', blonde: '#d1a052', auburn: '#a85536'
})
export const SKIN_TONES = Object.freeze({
  light: '#efbd91', tan: '#c9875d', deep: '#86513c'
})
export const SURFWEAR_COLORS = Object.freeze({
  coral: '#ec716b', aqua: '#28b4b2', yellow: '#f2ba48', green: '#64ad69'
})
export const BOARD_TYPES = Object.freeze(['shortboard', 'fish', 'longboard'])
export const BOARD_COLORS = Object.freeze({
  turquoise: '#33b9c4', pink: '#ef8290', orange: '#f3b354',
  green: '#60aa69', blue: '#4d90d3'
})

export const DEFAULT_SURFER_STYLE = Object.freeze({
  character: 'female',
  hairstyle: 'ponytail',
  hairColor: 'brown',
  skinTone: 'tan',
  surfwear: 'yellow',
  boardType: 'shortboard',
  boardColor: 'pink'
})

const isAllowed = (values, value) => values.includes(value)

export function normalizeSurferStyle(value = {}) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const defaults = DEFAULT_SURFER_STYLE
  const choice = (name, values) => isAllowed(values, input[name]) ? input[name] : defaults[name]
  return {
    character: choice('character', CHARACTER_TYPES),
    hairstyle: choice('hairstyle', HAIRSTYLES),
    hairColor: choice('hairColor', Object.keys(HAIR_COLORS)),
    skinTone: choice('skinTone', Object.keys(SKIN_TONES)),
    surfwear: choice('surfwear', Object.keys(SURFWEAR_COLORS)),
    boardType: choice('boardType', BOARD_TYPES),
    boardColor: choice('boardColor', Object.keys(BOARD_COLORS))
  }
}

export const PRESET_SURFERS = Object.freeze([
  Object.freeze({ ...DEFAULT_SURFER_STYLE, character: 'male', hairstyle: 'short',
    surfwear: 'coral', boardType: 'shortboard', boardColor: 'turquoise' }),
  Object.freeze({ ...DEFAULT_SURFER_STYLE, character: 'female', hairstyle: 'ponytail',
    surfwear: 'yellow', boardType: 'fish', boardColor: 'pink' }),
  Object.freeze({ ...DEFAULT_SURFER_STYLE, character: 'male', hairstyle: 'wavy',
    hairColor: 'black', skinTone: 'deep', surfwear: 'aqua',
    boardType: 'longboard', boardColor: 'orange' }),
  Object.freeze({ ...DEFAULT_SURFER_STYLE, character: 'female', hairstyle: 'wavy',
    hairColor: 'auburn', skinTone: 'light', surfwear: 'green',
    boardType: 'shortboard', boardColor: 'green' })
])
