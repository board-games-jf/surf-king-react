import { INVALID_MOVE } from 'boardgame.io/core'
import { Client } from 'boardgame.io/client'
import {
    SurfKingR1, setupR1, beginR1Turn, createR1Deck, r1Neighbors,
    r1MoveTargets, r1CardTargets, r1DropTargets, useR1Card, r1Maneuver,
    r1DropIn, passR1, recoverR1, discardR1Overflow, r1AttackUnavailableReason, DROP_IN_RANGE,
} from './SurfKingR1'

function fixture(n = 2) {
    const ctx = {
        numPlayers: n, currentPlayer: '0',
        random: { Number: () => 0, Shuffle: values => values.slice(), D6: () => 6 },
        events: { endTurn: jest.fn() },
    }
    return { G: setupR1(ctx), ctx }
}
function relocate(G, id, to) {
    const p = G.players[id]
    delete G.cells[p.cellPosition].player
    p.cellPosition = to
    G.cells[to].player = { position: id }
}
function grant(G, id, name) {
    const card = G.deck.find(c => c.Name === name)
    if (!card) {
        const owner = Object.values(G.players).find(p => p.cards.some(c => c.Name === name))
        const index = owner.cards.findIndex(c => c.Name === name)
        G.players[id].cards.push(...owner.cards.splice(index, 1))
    } else G.players[id].cards.push(...G.deck.splice(G.deck.indexOf(card), 1))
    return G.players[id].cards.length - 1
}
function place(G, name, cell) {
    const index = G.deck.findIndex(c => c.Name === name)
    G.cells[cell].obstacle = G.deck.splice(index, 1)[0]
}
function assertConserved(G) {
    const cards = [...G.deck, ...G.discardedCards,
        ...Object.values(G.players).flatMap(p => [...p.cards, ...p.activeCard]),
        ...G.cells.flatMap(c => c.obstacle?.id !== undefined ? [c.obstacle] : [])]
    expect(cards).toHaveLength(60)
    expect(new Set(cards.map(c => c.id)).size).toBe(60)
    const players = Object.values(G.players)
    expect(new Set(players.map(p => p.cellPosition)).size).toBe(players.length)
    for (const p of players) expect(G.cells[p.cellPosition].player.position).toBe(p.position)
}
describe('R1 rules', () => {
    test('exact deck inventory, starts, sharks and real graph for every player count', () => {
        const counts = createR1Deck().reduce((a,c) => ({ ...a, [c.Name]: (a[c.Name] || 0) + 1 }), {})
        expect(counts).toEqual({
            'Energy x2': 12, 'Lifeguard float': 9, 'Big wave': 3, Sunburn: 7,
            Storm: 7, Cyclone: 4, Island: 3, Jumping: 4, Amulet: 7, 'Surf Current': 4,
        })
        expect(r1Neighbors(21)).toEqual([14, 18, 25, 28])
        for (let n = 2; n <= 7; n++) {
            const { G } = fixture(n)
            expect(G.cells.filter(c => c.obstacle?.Name === 'Shark').map(c => c.position)).toEqual([28,29,30,31])
            expect(Object.values(G.players).every(p => p.energy === 2 && p.cards.length === 2 && p.cellPosition < 7)).toBe(true)
            assertConserved(G)
        }
    })
    test.each(['Storm', 'Cyclone', 'Island'])('places %s anywhere on the free course, not on starts, beaches, sharks or occupied hexes', name => {
        const { G, ctx } = fixture()
        relocate(G, 1, 14)
        place(G, 'Storm', 21)
        const index = grant(G, 0, name)
        const targets = r1CardTargets(G, ctx, index)
        expect(targets).toEqual(Array.from({ length: 42 }, (_, i) => i + 7)
            .filter(id => ![14, 21, 28, 29, 30, 31].includes(id)))
        for (const invalid of [0, 6, 14, 21, 28, 31, 49, 52, 53]) {
            expect(useR1Card(G, ctx, index, invalid)).toBe(INVALID_MOVE)
        }
        expect(useR1Card(G, ctx, index, 48)).toBeUndefined()
        expect(G.cells[48].obstacle.Name).toBe(name)
        expect(G.currentMove).toBe('maneuver')
        assertConserved(G)
    })
    test('remote placement does not extend attack ranges or Jumping', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 42)
        place(G, 'Island', 48)
        for (const name of ['Big wave', 'Sunburn', 'Jumping']) {
            const index = grant(G, 0, name)
            expect(r1CardTargets(G, ctx, index)).toEqual([])
        }
    })
    test('ordinary movement is free, cannot pass if legal, draws one and advances', () => {
        const { G, ctx } = fixture()
        expect(passR1(G, ctx)).toBeUndefined()
        expect(passR1(G, ctx)).toBe(INVALID_MOVE)
        expect(r1Maneuver(G, ctx, 1)).toBe(INVALID_MOVE)
        const target = r1MoveTargets(G, ctx)[0]
        r1Maneuver(G, ctx, target)
        expect(G.players[0].energy).toBe(2)
        expect(G.players[0].cards).toHaveLength(3)
        expect(G.nextPlayer).toBe(1)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        assertConserved(G)
    })
    test.each(['Shark','Storm','Cyclone','Island'])('Jumping safely lands on %s and leaves it intact', name => {
        const { G, ctx } = fixture()
        relocate(G, 0, 21)
        if (name !== 'Shark') place(G, name, 25)
        const to = name === 'Shark' ? 28 : 25
        const obstacle = G.cells[to].obstacle
        const index = grant(G, 0, 'Jumping')
        expect(r1CardTargets(G, ctx, index)).toContain(to)
        useR1Card(G, ctx, index, to)
        expect(G.players[0].cellPosition).toBe(to)
        expect(G.players[0].energy).toBe(2)
        expect(G.cells[to].obstacle).toBe(obstacle)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        assertConserved(G)
    })
    test('shark fall loses one hand card, occupies cell, free recovery does not repeat terrain', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 21)
        passR1(G, ctx)
        r1Maneuver(G, ctx, 28)
        expect(G.players[0]).toMatchObject({ cellPosition: 28, energy: 0, fellOffTheBoard: 1 })
        expect(G.players[0].cards).toHaveLength(1)
        expect(G.discardedCards).toHaveLength(1)
        beginR1Turn(G, ctx)
        expect(G.currentMove).toBe('recover')
        recoverR1(G, ctx)
        expect(G.players[0].energy).toBe(1)
        expect(G.currentMove).toBe('use_card')
        assertConserved(G)
    })
    test('Cyclone excludes origin and redirects only once; destination effect resolves', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 21)
        place(G, 'Cyclone', 25)
        place(G, 'Cyclone', 18)
        passR1(G, ctx)
        r1Maneuver(G, ctx, 25)
        expect(G.players[0].cellPosition).toBe(18)
        expect(G.cells[25].obstacle.Name).toBe('Cyclone')
        expect(G.cells[18].obstacle.Name).toBe('Cyclone')
        assertConserved(G)
        const second = fixture()
        relocate(second.G, 0, 21)
        place(second.G, 'Cyclone', 25)
        place(second.G, 'Storm', 18)
        passR1(second.G, second.ctx)
        r1Maneuver(second.G, second.ctx, 25)
        expect(second.G.players[0].energy).toBe(1)
    })
    test('first round blocks direct attacks; second round fall transfers card', () => {
        const { G, ctx } = fixture()
        relocate(G, 1, 4)
        const i = grant(G, 0, 'Big wave')
        expect(useR1Card(G, ctx, i, 4)).toBe(INVALID_MOVE)
        expect(r1DropTargets(G, ctx)).toEqual([])
        G.turn = 2
        useR1Card(G, ctx, i, 4)
        expect(G.players[1].energy).toBe(0)
        expect(G.players[1].cards).toHaveLength(1)
        expect(G.players[0].cards).toHaveLength(3)
        expect(G.currentMove).toBe('maneuver')
        assertConserved(G)
    })
    test('Amulet protects against attacks but expires at next personal turn', () => {
        const { G, ctx } = fixture()
        relocate(G, 1, 4)
        G.turn = 2
        ctx.currentPlayer = '1'
        const i = grant(G, 1, 'Amulet')
        useR1Card(G, ctx, i)
        ctx.currentPlayer = '0'
        beginR1Turn(G, ctx)
        const attack = grant(G, 0, 'Big wave')
        expect(r1CardTargets(G, ctx, attack)).toEqual([])
        expect(r1DropTargets(G, ctx)).toEqual([])
        ctx.currentPlayer = '1'
        beginR1Turn(G, ctx)
        expect(G.players[1].activeCard).toHaveLength(0)
        assertConserved(G)
    })
    test('Drop In reaches two graph edges but not three, with unchanged damage and no energy cost', () => {
        const { G, ctx } = fixture()
        relocate(G, 1, 14)
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, [])).toBe('Attacks unlock in round 2.')
        G.turn = 2
        relocate(G, 1, 21)
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, [])).toBe('No opponent within 2 hexes.')
        expect(r1DropIn(G, ctx, 21)).toBe(INVALID_MOVE)
        relocate(G, 1, 14)
        expect(r1DropTargets(G, ctx)).toEqual([14])
        expect(r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, [14])).toBeNull()
        const rolls = [6, 2, 4, 3]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 14)
        expect(G.players[1].energy).toBe(1)
        expect(G.players[0].energy).toBe(2)
        expect(G.currentMove).toBe('use_card')
        expect(r1DropTargets(G, ctx)).toEqual([14])
        const again = [6, 1, 2]
        ctx.random.D6 = () => again.shift()
        r1DropIn(G, ctx, 14)
        expect(G.players[0].energy).toBe(2)
        expect(G.players[1].energy).toBe(0)
        expect(r1DropIn(G, ctx, 14)).toBe(INVALID_MOVE)
        assertConserved(G)
    })
    test('two-edge opponents remain protected or unavailable when fallen or finished', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 14)
        ctx.currentPlayer = '1'
        useR1Card(G, ctx, grant(G, 1, 'Amulet'))
        ctx.currentPlayer = '0'
        beginR1Turn(G, ctx)
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, [])).toBe('Nearby standing opponents are protected by Amulet.')
        G.players[1].energy = 0
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, [])).toBe('Nearby opponents are fallen or finished.')
        G.players[1].energy = 2
        relocate(G, 0, 42)
        relocate(G, 1, 49)
        expect(r1DropTargets(G, ctx)).toEqual([])
        assertConserved(G)
    })
    test('Drop In ties cost nothing and losses stop attacks at one energy', () => {
        const { G, ctx } = fixture()
        relocate(G, 1, 4)
        G.turn = 2
        G.players[0].energy = 3
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(3)
        expect(G.players[1].energy).toBe(2)
        const rolls = [1, 2, 5, 6, 2, 3, 4, 5]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(2)
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(1)
        expect(G.players[1].energy).toBe(2)
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1DropIn(G, ctx, 4)).toBe(INVALID_MOVE)
        expect(r1AttackUnavailableReason(G, ctx, DROP_IN_RANGE, [])).toBe('Drop In requires at least 2 energy.')
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(0)
        assertConserved(G)
    })
    test('one card and repeatable Drop In can be combined before movement', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        const energyCard = grant(G, 0, 'Energy x2')
        const secondCard = grant(G, 0, 'Energy x2')
        const rolls = [1, 2, 5, 6, 6, 2, 4, 3]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(1)
        useR1Card(G, ctx, energyCard)
        expect(G.players[0].energy).toBe(3)
        expect(G.currentMove).toBe('maneuver')
        expect(useR1Card(G, ctx, secondCard - 1)).toBe(INVALID_MOVE)
        expect(r1DropTargets(G, ctx)).toEqual([4])
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(3)
        expect(G.players[1].energy).toBe(1)
        r1Maneuver(G, ctx, 7)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        expect(r1DropIn(G, ctx, 4)).toBe(INVALID_MOVE)
        assertConserved(G)
    })
    test.each([false, true])('discard overflow resumes the original pre-movement phase (card used: %s)', cardUsed => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[1].energy = 1
        if (cardUsed) useR1Card(G, ctx, grant(G, 0, 'Energy x2'))
        G.players[0].cards.push(...G.deck.splice(0, 5 - G.players[0].cards.length))
        const rolls = [6, 4, 1]
        ctx.random.D6 = () => rolls.shift()
        const energy = G.players[0].energy
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(energy)
        expect(G.players[1].energy).toBe(0)
        expect(G.currentMove).toBe('discard')
        expect(G.overflowPlayer).toBe(0)
        expect(G.players[0].cards).toHaveLength(6)
        discardR1Overflow(G, ctx, 0)
        expect(G.players[0].cards).toHaveLength(5)
        expect(G.currentMove).toBe(cardUsed ? 'maneuver' : 'use_card')
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(0)
        assertConserved(G)
    })
    test('Surf Current permits attacks before its first step but not between steps', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        useR1Card(G, ctx, grant(G, 0, 'Surf Current'))
        expect(G.currentMove).toBe('current_first')
        r1DropIn(G, ctx, 4)
        expect(G.currentMove).toBe('current_first')
        r1Maneuver(G, ctx, 7)
        expect(G.currentMove).toBe('current_second')
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1DropIn(G, ctx, 4)).toBe(INVALID_MOVE)
        assertConserved(G)
    })
    test('Surf Current uses one card, up to two steps and one draw', () => {
        const { G, ctx } = fixture()
        const index = grant(G, 0, 'Surf Current')
        const opening = G.players[0].cards.length
        useR1Card(G, ctx, index)
        r1Maneuver(G, ctx, 7)
        expect(G.currentMove).toBe('current_second')
        expect(G.players[0].cards).toHaveLength(opening - 1)
        r1Maneuver(G, ctx, 14)
        expect(G.players[0].cards).toHaveLength(opening)
        expect(G.players[0].cellPosition).toBe(14)
        assertConserved(G)
    })
    test('finish round and highest energy wins among beach arrivals', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 42)
        relocate(G, 1, 43)
        G.players[1].energy = 5
        passR1(G, ctx)
        r1Maneuver(G, ctx, 49)
        expect(G.winner).toBeNull()
        ctx.currentPlayer = '1'
        beginR1Turn(G, ctx)
        passR1(G, ctx)
        r1Maneuver(G, ctx, 50)
        expect(G.winner).toBe(1)
        expect(G.finishers).toEqual([0,1])
        assertConserved(G)
    })
    test('Island remains on the board after entry by multiple surfers and re-entry', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 21)
        relocate(G, 1, 18)
        place(G, 'Island', 25)
        const island = G.cells[25].obstacle
        passR1(G, ctx)
        r1Maneuver(G, ctx, 25)
        expect(G.players[0].energy).toBe(4)
        expect(G.cells[25].obstacle).toBe(island)
        beginR1Turn(G, ctx)
        expect(G.players[0].energy).toBe(4)
        passR1(G, ctx)
        r1Maneuver(G, ctx, 21)
        beginR1Turn(G, ctx)
        passR1(G, ctx)
        r1Maneuver(G, ctx, 25)
        expect(G.players[0].energy).toBe(5)
        expect(G.cells[25].obstacle).toBe(island)
        relocate(G, 0, 21)
        ctx.currentPlayer = '1'
        beginR1Turn(G, ctx)
        passR1(G, ctx)
        r1Maneuver(G, ctx, 25)
        expect(G.players[1].energy).toBe(4)
        expect(G.cells[25].obstacle).toBe(island)
        expect(G.discardedCards.some(card => card.id === island.id)).toBe(false)
        assertConserved(G)
    })
    test('shuffles the complete player sequence once and repeats it for every round', () => {
        const { ctx } = fixture(4)
        ctx.random.Shuffle = values => values.length === 4 ? [2, 0, 3, 1] : values.slice()
        const G = setupR1(ctx)
        expect(G.order).toEqual([2, 0, 3, 1])
        expect(G.nextPlayer).toBe(2)
        for (let i = 0; i < 8; i++) {
            const expected = [2, 0, 3, 1][i % 4]
            expect(G.nextPlayer).toBe(expected)
            ctx.currentPlayer = String(expected)
            beginR1Turn(G, ctx)
            passR1(G, ctx)
            const targets = r1MoveTargets(G, ctx)
            if (targets.length) r1Maneuver(G, ctx, targets[0])
            else passR1(G, ctx)
            expect(G.order).toEqual([2, 0, 3, 1])
        }
        expect(G.turn).toBe(3)
        expect(G.completedInRound).toBe(0)
        expect(G.nextPlayer).toBe(2)
        assertConserved(G)
    })
    test.each([2, 3, 7])('boardgame.io client repeats the fixed shuffled order for %s players', numPlayers => {
        const client = Client({ game: { ...SurfKingR1, seed: 'R1-test-' + numPlayers }, numPlayers })
        client.start()
        const order = client.getState().G.order.slice()
        expect(order.slice().sort((a,b) => a-b)).toEqual(Array.from({ length: numPlayers }, (_, id) => id))
        const seen = []
        for (let i = 0; i < numPlayers * 2; i++) {
            const { G, ctx } = client.getState()
            seen.push(Number(ctx.currentPlayer))
            expect(G.order).toEqual(order)
            if (G.currentMove === 'recover') client.moves.recover()
            client.moves.pass()
            const state = client.getState()
            const targets = r1MoveTargets(state.G, state.ctx)
            if (targets.length) client.moves.maneuver(targets[0])
            else client.moves.pass()
        }
        expect(seen).toEqual([...order, ...order])
        const { G, ctx } = client.getState()
        expect(G.turn).toBe(3)
        expect(Number(ctx.currentPlayer)).toBe(order[0])
        assertConserved(G)
        client.stop()
    })
})
