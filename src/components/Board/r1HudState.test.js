import { getCardRailState, getRoundHudProgress } from './r1HudState'
test('confirmed card use is scoped to current player and turn, never inferred from phase', () => {
    const G = { turn: 3, completedInRound: 1, currentMove: 'maneuver' }
    const ctx = { currentPlayer: '2' }
    expect(getCardRailState(G, ctx, false)).toBe('unavailable')
    expect(getCardRailState(G, ctx, true)).toBe('available')
    G.cardVisualEvent = { playerId: 2, round: 3, turnSlot: 1 }
    expect(getCardRailState(G, ctx, false)).toBe('used')
    expect(getCardRailState({ ...G, turn: 4 }, ctx, false)).toBe('unavailable')
    expect(getCardRailState({ ...G, completedInRound: 2 }, ctx, false)).toBe('unavailable')
    expect(getCardRailState(G, { currentPlayer: '1' }, false)).toBe('unavailable')
    expect(getCardRailState({ ...G, cardVisualEvent: { playerId: 2 } }, ctx, false)).toBe('unavailable')
})
test('round progress is based on order slots rather than player IDs', () => {
    expect(getRoundHudProgress([{id: 2, status: 'played'}, {id: 0, status: 'now'}, {id: 1, status: 'next'}])).toEqual({completed: 1, current: 2, total: 3})
})
