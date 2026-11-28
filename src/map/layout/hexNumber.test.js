import { hexNumber } from './hexNumber'
import { BOARD_LAYOUT } from './boardLayout'

test.each([[2, 23], [4, 37], [6, 53]])('numbers active cells continuously for width %i', (cut, count) => {
    const ids = BOARD_LAYOUT.filter(c => Math.abs(c.x) <= cut).map(c => c.id)
    expect(ids).toHaveLength(count)
    expect(ids.map(id => hexNumber(id, ids))).toEqual(Array.from({ length: count }, (_, i) => i + 1))
    expect(ids.map(id => hexNumber(id, [...ids].reverse()))).toEqual(ids.map(id => hexNumber(id, ids)))
    expect(ids.at(-1)).toBe(cut === 6 ? 52 : 51)
    expect(hexNumber(ids.at(-1), ids)).toBe(count)
    expect(BOARD_LAYOUT.filter(c => !ids.includes(c.id)).every(c => hexNumber(c.id, ids) === null)).toBe(true)
})

test('preserves reference numbering and rejects invalid IDs', () => {
    expect(BOARD_LAYOUT.map(c => hexNumber(c.id))).toEqual(Array.from({ length: 53 }, (_, i) => i + 1))
    for (const id of [null, undefined, -1, 53, 1.5, '1']) expect(hexNumber(id)).toBeNull()
})
