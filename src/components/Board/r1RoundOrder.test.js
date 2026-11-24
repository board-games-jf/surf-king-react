import { getR1RoundOrder } from './r1RoundOrder'

test('uses the full shuffled sequence and marks played/current/upcoming slots', () => {
    expect(getR1RoundOrder({ order: [2, 0, 3, 1], completedInRound: 1, winner: null }, { currentPlayer: '0' }))
        .toEqual([{ id: 2, status: 'played' }, { id: 0, status: 'now' }, { id: 3, status: 'next' }, { id: 1, status: 'next' }])
})
test('keeps the same sequence across a two-player round boundary', () => {
    const G = { order: [1, 0], completedInRound: 1, winner: null }
    expect(getR1RoundOrder(G, { currentPlayer: '0' }))
        .toEqual([{ id: 1, status: 'played' }, { id: 0, status: 'now' }])
    expect(getR1RoundOrder({ ...G, completedInRound: 0 }, { currentPlayer: '1' }))
        .toEqual([{ id: 1, status: 'now' }, { id: 0, status: 'next' }])
})
test('no active player after the last completed turn', () => {
    const result = getR1RoundOrder({ order: [2, 0, 3, 1], completedInRound: 4, winner: 0 }, { currentPlayer: '1' })
    expect(result.every(slot => slot.status === 'played')).toBe(true)
})
