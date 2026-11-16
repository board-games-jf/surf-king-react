import {
  normalizeSurferStyle, DEFAULT_SURFER_STYLE, PRESET_SURFERS,
  BOARD_TYPES, BOARD_COLORS, SKIN_TONES
} from './surferStyle'

describe('cosmetic surfer selections', () => {
  test('normalizes empty/invalid user preferences safely', () => {
    expect(normalizeSurferStyle()).toEqual(DEFAULT_SURFER_STYLE)
    expect(normalizeSurferStyle(null)).toEqual(DEFAULT_SURFER_STYLE)
    expect(normalizeSurferStyle([])).toEqual(DEFAULT_SURFER_STYLE)
    expect(normalizeSurferStyle({ boardType: 'jet-ski', skinTone: 'invisible' }))
      .toEqual(DEFAULT_SURFER_STYLE)
  })

  test.each(BOARD_TYPES)('%s changes only the board selection', boardType => {
    const style = normalizeSurferStyle({ ...DEFAULT_SURFER_STYLE, boardType })
    expect(style.boardType).toBe(boardType)
    const { boardType: ignored, ...rest } = style
    const { boardType: defaultBoard, ...baseline } = DEFAULT_SURFER_STYLE
    expect(rest).toEqual(baseline)
    expect(BOARD_COLORS[style.boardColor]).toBeDefined()
  })

  test('supports independent appearance and board choices', () => {
    const style = normalizeSurferStyle({
      character: 'male', hairstyle: 'wavy', hairColor: 'black',
      skinTone: 'deep', surfwear: 'green',
      boardType: 'fish', boardColor: 'orange'
    })
    expect(style.character).toBe('male')
    expect(style.hairstyle).toBe('wavy')
    expect(style.skinTone).toBe('deep')
    expect(SKIN_TONES[style.skinTone]).toBeDefined()
    expect(style.boardType).toBe('fish')
    expect(style.boardColor).toBe('orange')
    expect(style).not.toHaveProperty('speed')
    expect(style).not.toHaveProperty('energy')
    expect(style).not.toHaveProperty('moves')
  })

  test('gallery exposes distinct presets without mutations', () => {
    expect(PRESET_SURFERS).toHaveLength(4)
    expect(new Set(PRESET_SURFERS.map(s => s.character))).toEqual(new Set(['male', 'female']))
    expect(new Set(PRESET_SURFERS.map(s => s.boardType)).size).toBe(3)
    expect(Object.isFrozen(PRESET_SURFERS)).toBe(true)
    PRESET_SURFERS.forEach(preset => {
      expect(normalizeSurferStyle(preset)).toEqual(preset)
      expect(Object.isFrozen(preset)).toBe(true)
    })
  })
})
