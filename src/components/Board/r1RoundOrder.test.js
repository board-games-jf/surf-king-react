import { getR1RoundOrder } from './r1RoundOrder'

const players = { 0: {}, 1: {}, 2: {}, 3: {} }

test('uses rotating first actor and marks played/current/upcoming slots', () => {
    expect(getR1RoundOrder({ players, firstPlayer: 2, completedInRound: 1, winner: null }, { currentPlayer: '3' }))
        .toEqual([{ id: 2, status: 'played' }, { id: 3, status: 'now' }, { id: 0, status: 'next' }, { id: 1, status: 'next' }])
})
test('updates across a round boundary, including consecutive turns in two-player matches', () => {
    const two = { 0: {}, 1: {} }
    expect(getR1RoundOrder({ players: two, firstPlayer: 0, completedInRound: 1, winner: null }, { currentPlayer: '1' }))
        .toEqual([{ id: 0, status: 'played' }, { id: 1, status: 'now' }])
    expect(getR1RoundOrder({ players: two, firstPlayer: 1, completedInRound: 0, winner: null }, { currentPlayer: '1' }))
        .toEqual([{ id: 1, status: 'now' }, { id: 0, status: 'next' }])
})
test('no active player after the last completed turn', () => {
    const result = getR1RoundOrder({ players, firstPlayer: 2, completedInRound: 4, winner: 0 }, { currentPlayer: '1' })
    expect(result.every(slot => slot.status === 'played')).toBe(true)
})
