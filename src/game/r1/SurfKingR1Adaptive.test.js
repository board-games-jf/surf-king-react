import { INVALID_MOVE } from 'boardgame.io/core'
import { setupAdaptiveR1, setupR1, r1Neighbors, r1MoveTargets, r1CardTargets,
    r1CardPlayerTargets, r1AttackRange, r1PlacementRange, r1DropIn, r1Maneuver,
    r1QuickManeuver, useR1Card, passR1, SurfKingR1Adaptive } from './SurfKingR1'

function fixture(n, adaptive = true) {
    const ctx = { numPlayers: n, currentPlayer: '0',
        random: { Number: () => 0, Shuffle: values => values.slice(), D6: () => 6 },
        events: { endTurn: jest.fn() } }
    return { G: (adaptive ? setupAdaptiveR1 : setupR1)(ctx), ctx }
}
function grant(G, name) {
    G.players[0].cards.push(G.deck.splice(G.deck.findIndex(c => c.Name === name), 1)[0])
    return G.players[0].cards.length - 1
}
test.each([2, 3, 4, 5, 6, 7])('adaptive setup for %i players', n => {
    const { G } = fixture(n)
    expect(G.cells).toHaveLength(53)
    expect(G.activeCellIds).toHaveLength(n <= 3 ? 23 : n <= 5 ? 37 : 53)
    const starts = Object.values(G.players).map(p => p.cellPosition)
    expect(new Set(starts).size).toBe(n)
    expect(starts.every(id => G.activeCellIds.includes(id))).toBe(true)
    expect(G.activeCellIds.filter(id => id >= 49)).toEqual(n <= 5 ? [50, 51] : [49, 50, 51, 52])
    for (const id of G.activeCellIds) expect(r1Neighbors(id, G).every(to => G.activeCellIds.includes(to))).toBe(true)
    expect(G.cells.filter(c => c.obstacle?.Name === 'Shark').map(c => c.position))
        .toEqual(n <= 3 ? [22, 23] : n <= 5 ? [29, 30] : [35, 36, 37, 38])
    G.order.forEach((id, slot) => {
        expect(G.players[id].energy).toBe(2 + (slot >= Math.ceil(n / 2) && n !== 3 ? 1 : 0))
        expect(G.players[id].cards).toHaveLength(2 + (slot >= Math.ceil(n / 2) && n !== 4 ? 1 : 0))
    })
    const deck = [...G.deck, ...Object.values(G.players).flatMap(p => p.cards)]
    expect(deck).toHaveLength(64)
    expect(new Set(deck.map(c => c.id)).size).toBe(64)
})
test('inactive targets and atomic invalid quick movement', () => {
    const { G, ctx } = fixture(2)
    G.players[0].cellPosition = 8
    expect(r1QuickManeuver(G, ctx, 11)).toBe(INVALID_MOVE)
    expect(G.currentMove).toBe('use_card')
    const i = grant(G, 'Cyclone')
    const targets = r1CardTargets(G, ctx, i)
    expect(targets.includes(29)).toBe(true)
    expect(targets.every(id => G.activeCellIds.includes(id))).toBe(true)
    expect(useR1Card(G, ctx, i, 11)).toBe(INVALID_MOVE)
    G.currentMove = 'maneuver'
    expect(r1MoveTargets(G, ctx).includes(11)).toBe(false)
})
test('Tsunami reaches two edges and preserves energy floor; reference unchanged', () => {
    const { G, ctx } = fixture(2)
    G.turn = 2
    G.players[0].cellPosition = 8
    G.players[1].cellPosition = 22
    G.players[1].energy = 3
    const i = grant(G, 'Tsunami')
    expect(r1CardPlayerTargets(G, ctx, i)).toEqual([1])
    useR1Card(G, ctx, i, 22, 1)
    expect(G.players[1].energy).toBe(1)
    const old = fixture(2, false).G
    expect(r1AttackRange(old, 'Tsunami')).toBe(1)
    expect(r1PlacementRange(old, 'Cyclone')).toBe(2)
    expect(old.activeCellIds).toBeUndefined()
})
test('last standing wins before optional conquest', () => {
    const { G, ctx } = fixture(6)
    G.turn = 2
    G.players[0].cellPosition = 22
    G.players[0].energy = 3
    G.players[1].cellPosition = 23
    G.players[1].energy = 1
    for (let i = 2; i < 6; i++) G.players[i].energy = 0
    const dice = [6, 6, 1]
    ctx.random.D6 = () => dice.shift()
    r1DropIn(G, ctx, 23, 2, 1)
    expect(G.winner).toBe(0)
    expect(G.winnerReason).toBe('dominion')
    expect(G.pendingSwap).toBeNull()
    expect(SurfKingR1Adaptive.endIf(G)).toEqual({ winner: 0 })
    expect(passR1(G, ctx)).toBe(INVALID_MOVE)
})
test('terrain fall awards Dominion to other standing surfer', () => {
    const { G, ctx } = fixture(6)
    G.turn = 2
    G.currentMove = 'maneuver'
    G.players[0].cellPosition = 29
    G.players[0].energy = 2
    for (let i = 2; i < 6; i++) G.players[i].energy = 0
    r1Maneuver(G, ctx, 36)
    expect(G.players[0].energy).toBe(0)
    expect(G.winner).toBe(1)
    expect(G.winnerReason).toBe('dominion')
    expect(ctx.events.endTurn).not.toHaveBeenCalled()
})
test('no Dominion when all fall or in smaller formats', () => {
    for (const n of [5, 6]) {
        const { G, ctx } = fixture(n)
        G.turn = 2
        G.currentMove = 'maneuver'
        G.players[0].cellPosition = n === 5 ? 22 : 29
        G.players[0].energy = 2
        for (let i = n === 5 ? 2 : 1; i < n; i++) G.players[i].energy = 0
        r1Maneuver(G, ctx, n === 5 ? 29 : 36)
        expect(G.players[0].energy).toBe(0)
        expect(G.winner).toBeNull()
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
    }
})
test('first active beach wins immediately', () => {
    for (const n of [2, 6]) {
        const { G, ctx } = fixture(n)
        G.currentMove = 'maneuver'
        G.players[0].cellPosition = 43
        r1Maneuver(G, ctx, 50)
        expect(G.winner).toBe(0)
        expect(G.winnerReason).toBe('beach')
        expect(ctx.events.endTurn).not.toHaveBeenCalled()
    }
})
