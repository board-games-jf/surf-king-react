import { INVALID_MOVE } from 'boardgame.io/core'
import { Client } from 'boardgame.io/client'
import {
    SurfKingR1, setupR1, beginR1Turn, createR1Deck, r1Neighbors,
    r1MoveTargets, r1CardTargets, r1DropTargets, useR1Card, r1Maneuver,
    r1DropIn, r1ResolveSwap, r1CardPlayable, passR1, recoverR1, r1AttackUnavailableReason, DROP_IN_RANGE, r1MaxAttackDice, r1Occupants, r1CardPlayerTargets, r1DropPlayerTargets,
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
    expect(cards).toHaveLength(64)
    expect(new Set(cards.map(c => c.id)).size).toBe(64)
    const players = Object.values(G.players)
    for (const p of players) expect(r1Occupants(G, p.cellPosition).length).toBeLessThanOrEqual(2)
}
describe('R1 rules', () => {
    test('exact deck inventory, starts, sharks and real graph for every player count', () => {
        const counts = createR1Deck().reduce((a,c) => ({ ...a, [c.Name]: (a[c.Name] || 0) + 1 }), {})
        expect(counts).toEqual({
            'Energy x2': 8, 'Lifeguard float': 6, 'Big wave': 7, Sunburn: 10,
            Tsunami: 3, Stone: 4, Storm: 5, Cyclone: 3, Island: 3, Jumping: 4, Amulet: 4, 'Surf Current': 3, Change: 1, 'Hang loose': 3,
        })
        expect(r1Neighbors(21)).toEqual([14, 18, 25, 28])
        for (let n = 2; n <= 7; n++) {
            const { G } = fixture(n)
            expect(G.cells.filter(c => c.obstacle?.Name === 'Shark').map(c => c.position)).toEqual([28,29,30,31])
            expect(Object.values(G.players).every(p => p.energy === 2 && p.cards.length === 2 && p.cellPosition < 7)).toBe(true)
            assertConserved(G)
        }
    })
    test.each(['Storm', 'Cyclone', 'Island', 'Stone'])('limits %s placement to its range and excludes blocked hexes', name => {
        const { G, ctx } = fixture()
        relocate(G, 1, 14)
        place(G, 'Storm', 21)
        const index = grant(G, 0, name)
        const targets = r1CardTargets(G, ctx, index)
        let reachable = new Set([0])
        for (let step = 0; step < (name === 'Stone' ? 3 : 2); step++) {
            reachable = new Set([...reachable, ...Array.from(reachable).flatMap(r1Neighbors)])
        }
        expect(targets).toEqual(Array.from(reachable).filter(id => id >= 7 && id < 49 &&
            !r1Occupants(G, id).length && !G.cells[id].obstacle).sort((a,b) => a-b))
        for (const invalid of [0, 6, 14, 21, 28, 31, 48, 49, 52, 53]) {
            expect(useR1Card(G, ctx, index, invalid)).toBe(INVALID_MOVE)
        }
        expect(useR1Card(G, ctx, index, 7)).toBeUndefined()
        expect(G.cells[7].obstacle.Name).toBe(name)
        assertConserved(G)
    })
    test('Stone costs one energy and disappears on ordinary entry', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 21)
        place(G, 'Stone', 25)
        const stone = G.cells[25].obstacle
        passR1(G, ctx)
        r1Maneuver(G, ctx, 25)
        expect(G.players[0].energy).toBe(1)
        expect(G.terrainEnergyEvent).toEqual({ id: 1, playerId: 0, amount: 1, source: 'Stone' })
        expect(G.cells[25].obstacle).toBeUndefined()
        expect(G.discardedCards).toContain(stone)
        assertConserved(G)
    })
    test('Tsunami attacks only adjacent opponents and deals three damage', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 0, 21)
        relocate(G, 1, 7)
        const index = grant(G, 0, 'Tsunami')
        expect(useR1Card(G, ctx, index, 7)).toBe(INVALID_MOVE)
        relocate(G, 1, 25)
        G.players[1].energy = 4
        expect(useR1Card(G, ctx, index, 25)).toBeUndefined()
        expect(G.players[1].energy).toBe(1)
        assertConserved(G)
    })
    test.each([0, 5])('full hand draws and randomly discards index %s', discardIndex => {
        const { G, ctx } = fixture()
        const p = G.players[0]
        p.cards.push(...G.deck.splice(0, 3))
        const expected = [...p.cards, G.deck[G.deck.length - 1]][discardIndex]
        const deckSize = G.deck.length
        ctx.random.Number = () => discardIndex / 6 + 0.01
        passR1(G, ctx)
        r1Maneuver(G, ctx, 7)
        expect(p.cards).toHaveLength(5)
        expect(G.deck).toHaveLength(deckSize - 1)
        expect(G.discardedCards).toContain(expected)
        assertConserved(G)
    })
    test('remote placement does not extend attack ranges or Jumping', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 42)
        place(G, 'Island', 48)
        for (const name of ['Big wave', 'Sunburn', 'Tsunami', 'Jumping']) {
            const index = grant(G, 0, name)
            expect(r1CardTargets(G, ctx, index)).toEqual([])
        }
    })
    test('ordinary movement is free, cannot pass if legal, draws one and advances', () => {
        const { G, ctx } = fixture()
        expect(passR1(G, ctx)).toBeUndefined()
        expect(passR1(G, ctx)).toBe(INVALID_MOVE)
        expect(r1Maneuver(G, ctx, 53)).toBe(INVALID_MOVE)
        const target = r1MoveTargets(G, ctx)[0]
        r1Maneuver(G, ctx, target)
        expect(G.players[0].energy).toBe(2)
        expect(G.players[0].cards).toHaveLength(3)
        expect(G.nextPlayer).toBe(1)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        assertConserved(G)
    })
    test.each(['Shark','Storm','Cyclone','Island','Stone'])('Jumping safely lands on %s and leaves it intact', name => {
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
        expect(G.terrainEnergyEvent).toBeUndefined()
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
    test('first round blocks direct attacks; only Drop In finishes a weakened opponent', () => {
        const { G, ctx } = fixture()
        relocate(G, 1, 4)
        const i = grant(G, 0, 'Big wave')
        expect(useR1Card(G, ctx, i, 4)).toBe(INVALID_MOVE)
        expect(r1DropTargets(G, ctx)).toEqual([])
        G.turn = 2
        useR1Card(G, ctx, i, 4)
        expect(G.players[1].energy).toBe(1)
        expect(G.players[1].fellOffTheBoard).toBe(-1)
        expect(G.players[1].cards).toHaveLength(2)
        expect(G.players[0].cards).toHaveLength(2)
        expect(G.currentMove).toBe('maneuver')
        const rolls = [6, 1]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4, 1)
        expect(G.players[1].energy).toBe(0)
        expect(G.players[1].cards).toHaveLength(1)
        expect(G.players[0].cards).toHaveLength(3)
        expect(G.currentMove).toBe('swap_choice')
        expect(r1ResolveSwap(G, ctx, false)).toBeUndefined()
        expect(G.currentMove).toBe('maneuver')
        assertConserved(G)
    })
    test.each(['Sunburn', 'Big wave', 'Tsunami'])('%s cannot cause a fall or take a card', name => {
        for (let energy = 1; energy <= 5; energy++) {
            const { G, ctx } = fixture()
            G.turn = 2
            relocate(G, 1, 4)
            G.players[1].energy = energy
            const index = grant(G, 0, name)
            const hand = G.players[1].cards.slice()
            const damage = { Sunburn: 1, 'Big wave': 2, Tsunami: 3 }[name]
            if (energy === 1) {
                expect(r1CardTargets(G, ctx, index)).toEqual([])
                expect(useR1Card(G, ctx, index, 4)).toBe(INVALID_MOVE)
                expect(r1DropTargets(G, ctx)).toEqual([4])
            } else {
                expect(useR1Card(G, ctx, index, 4)).toBeUndefined()
            }
            expect(G.players[1].energy).toBe(Math.max(1, energy - damage))
            expect(G.players[1].fellOffTheBoard).toBe(-1)
            expect(G.players[1].cards).toEqual(hand)
            assertConserved(G)
        }
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
        const rolls = [6, 4, 3]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 14)
        expect(G.players[1].energy).toBe(1)
        expect(G.players[0].energy).toBe(2)
        expect(G.currentMove).toBe('use_card')
        expect(r1DropTargets(G, ctx)).toEqual([14])
        const again = [6, 2]
        ctx.random.D6 = () => again.shift()
        r1DropIn(G, ctx, 14)
        expect(G.players[0].energy).toBe(2)
        expect(G.players[1].energy).toBe(0)
        expect(r1DropIn(G, ctx, 14)).toBe(INVALID_MOVE)
        assertConserved(G)
    })
    test('attack dice count preserves at least one energy and rejects unsafe counts before rolling', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        expect([0, 1, 2, 3, 4, 5].map(r1MaxAttackDice)).toEqual([0, 0, 1, 2, 2, 2])
        ctx.random.D6 = jest.fn()
        const before = JSON.stringify(G)
        for (const count of [0, 2, 3, -1, 1.5, '1', null]) {
            expect(r1DropIn(G, ctx, 4, count)).toBe(INVALID_MOVE)
        }
        expect(ctx.random.D6).toHaveBeenCalledTimes(0)
        expect(JSON.stringify(G)).toBe(before)
    })
    test.each([
        { rolls: [5, 6, 2, 4], expected: [3, 1] },
        { rolls: [2, 6, 4, 5], expected: [2, 2] },
        { rolls: [3, 5, 2, 5], expected: [3, 2] },
        { rolls: [1, 2, 4, 6], expected: [1, 3] },
        { rolls: [3, 6, 6, 3], expected: [3, 3] },
    ])('ranked dice comparisons resolve both energy losses: %s', ({ rolls, expected }) => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[0].energy = 3
        G.players[1].energy = 3
        const input = rolls.slice()
        ctx.random.D6 = () => input.shift()
        expect(r1DropIn(G, ctx, 4, 2)).toBeUndefined()
        expect([G.players[0].energy, G.players[1].energy]).toEqual(expected)
        expect(G.atkDices).toEqual(rolls.slice(0, 2).sort((a, b) => b - a))
        expect(G.defDices).toEqual(rolls.slice(2).sort((a, b) => b - a))
        assertConserved(G)
    })
    test('one-energy defender rolls once; extra attack die does not deal damage', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[0].energy = 3
        G.players[1].energy = 1
        const rolls = [6, 5, 4]
        ctx.random.D6 = () => rolls.shift()
        const hand = G.players[0].cards.length
        r1DropIn(G, ctx, 4, 2)
        expect(G.players[0].energy).toBe(3)
        expect(G.players[1].energy).toBe(0)
        expect(G.atkDices).toEqual([6, 5])
        expect(G.defDices).toEqual([4])
        expect(G.players[0].cards.length).toBe(hand + 1)
        expect(G.message).toBe('Drop In: Player 1 loses 0 energy; Player 2 loses 1 energy. Player 2 fell!')
        assertConserved(G)
    })
    test('two lost defense pairs cause a single fall and transfer one card', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[0].energy = 3
        const rolls = [6, 5, 4, 3]
        ctx.random.D6 = () => rolls.shift()
        const attackerHand = G.players[0].cards.length
        const defenderHand = G.players[1].cards.length
        r1DropIn(G, ctx, 4, 2)
        expect(G.players[0].energy).toBe(3)
        expect(G.players[1].energy).toBe(0)
        expect(G.players[0].cards.length).toBe(attackerHand + 1)
        expect(G.players[1].cards.length).toBe(defenderHand - 1)
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
        const rolls = [1, 5, 6, 2, 4, 5]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4, 1)
        expect(G.players[0].energy).toBe(2)
        r1DropIn(G, ctx, 4, 1)
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
        const rolls = [1, 5, 6, 6, 4, 3]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4)
        expect(G.players[0].energy).toBe(1)
        useR1Card(G, ctx, energyCard)
        expect(G.players[0].energy).toBe(3)
        expect(G.currentMove).toBe('maneuver')
        expect(useR1Card(G, ctx, secondCard - 1)).toBe(INVALID_MOVE)
        expect(r1DropTargets(G, ctx)).toEqual([4])
        r1DropIn(G, ctx, 4, 1)
        expect(G.players[0].energy).toBe(3)
        expect(G.players[1].energy).toBe(1)
        r1Maneuver(G, ctx, 7)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        expect(r1DropIn(G, ctx, 4)).toBe(INVALID_MOVE)
        assertConserved(G)
    })
    test.each([false, true])('automatic random overflow preserves the pre-movement phase (card used: %s)', cardUsed => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[1].energy = 1
        if (cardUsed) useR1Card(G, ctx, grant(G, 0, 'Energy x2'))
        G.players[0].cards.push(...G.deck.splice(0, 5 - G.players[0].cards.length))
        const rolls = [6, 1]
        ctx.random.D6 = () => rolls.shift()
        const energy = G.players[0].energy
        r1DropIn(G, ctx, 4, 1)
        expect(G.players[0].energy).toBe(energy)
        expect(G.players[1].energy).toBe(0)
        expect(G.discardedCards.length).toBe(cardUsed ? 2 : 1)
        expect(G.players[0].cards).toHaveLength(5)
        expect(G.currentMove).toBe('swap_choice')
        r1ResolveSwap(G, ctx, false)
        expect(G.currentMove).toBe(cardUsed ? 'maneuver' : 'use_card')
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(0)
        assertConserved(G)
    })
    test('conquest swaps occupancy, spends movement, allows an unused card and draws once', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 14)
        G.players[1].energy = 1
        const energyIndex = grant(G, 0, 'Energy x2')
        const rolls = [6, 1]
        ctx.random.D6 = () => rolls.shift()
        const deckSize = G.deck.length
        r1DropIn(G, ctx, 14, 1)
        expect(G.currentMove).toBe('swap_choice')
        expect(G.pendingSwap).toEqual({ targetPlayerId: 1, resumeMove: 'use_card' })
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1MoveTargets(G, ctx)).toEqual([])
        expect(useR1Card(G, ctx, energyIndex)).toBe(INVALID_MOVE)
        expect(passR1(G, ctx)).toBe(INVALID_MOVE)
        expect(r1ResolveSwap(G, ctx, true)).toBeUndefined()
        expect(G.players[0].cellPosition).toBe(14)
        expect(G.players[1].cellPosition).toBe(0)
        expect(G.players[1].energy).toBe(0)
        expect(G.currentMove).toBe('swap_card')
        expect(G.pendingSwap).toBeNull()
        expect(r1ResolveSwap(G, ctx, true)).toBe(INVALID_MOVE)
        expect(r1DropTargets(G, ctx)).toEqual([])
        expect(r1MoveTargets(G, ctx)).toEqual([])
        expect(useR1Card(G, ctx, energyIndex)).toBeUndefined()
        expect(G.players[0].energy).toBe(4)
        expect(G.deck).toHaveLength(deckSize - 1)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        assertConserved(G)
    })
    test.each(['Energy x2', 'Surf Current'])('swap after %s consumes all remaining movement and ends turn', name => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[1].energy = 1
        useR1Card(G, ctx, grant(G, 0, name))
        const rolls = [6, 1, 1]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4, 1)
        expect(G.currentMove).toBe('swap_choice')
        r1ResolveSwap(G, ctx, true)
        expect(G.players[0].cellPosition).toBe(4)
        expect(G.currentMove).toBe('turn_end')
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        expect(r1MoveTargets(G, ctx)).toEqual([])
        assertConserved(G)
    })
    test('declining conquest keeps both positions and restores the original card phase', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 14)
        G.players[1].energy = 1
        const rolls = [6, 1]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 14, 1)
        expect(r1ResolveSwap(G, ctx, false)).toBeUndefined()
        expect(G.players[0].cellPosition).toBe(0)
        expect(G.players[1].cellPosition).toBe(14)
        expect(G.currentMove).toBe('use_card')
        expect(G.pendingSwap).toBeNull()
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(0)
        assertConserved(G)
    })
    test('conquering a hazard applies ordinary entry only to the attacker', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 0, 21)
        relocate(G, 1, 28)
        G.players[1].energy = 1
        G.players[0].energy = 2
        const rolls = [6, 1]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 28, 1)
        const deckSize = G.deck.length
        r1ResolveSwap(G, ctx, true)
        expect(G.players[0].energy).toBe(0)
        expect(G.players[0].cellPosition).toBe(28)
        expect(G.players[1].cellPosition).toBe(21)
        expect(G.deck).toHaveLength(deckSize)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
        assertConserved(G)
    })
    test('conquest card phase excludes movement cards and can be skipped', () => {
        const { G, ctx } = fixture()
        G.turn = 2
        relocate(G, 1, 4)
        G.players[1].energy = 1
        grant(G, 0, 'Energy x2')
        grant(G, 0, 'Jumping')
        grant(G, 0, 'Surf Current')
        const rolls = [6, 1]
        ctx.random.D6 = () => rolls.shift()
        r1DropIn(G, ctx, 4, 1)
        r1ResolveSwap(G, ctx, true)
        expect(G.currentMove).toBe('swap_card')
        for (const name of ['Jumping', 'Surf Current']) {
            const i = G.players[0].cards.findIndex(c => c.Name === name)
            expect(r1CardPlayable(G, ctx, i)).toBe(false)
            expect(useR1Card(G, ctx, i)).toBe(INVALID_MOVE)
        }
        passR1(G, ctx)
        expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
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
    test('first beach arrival wins immediately regardless of energy or round order', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 42)
        relocate(G, 1, 43)
        G.players[0].energy = 1
        G.players[1].energy = 5
        passR1(G, ctx)
        r1Maneuver(G, ctx, 49)
        expect(G.winner).toBe(0)
        expect(G.currentMove).toBe('finished')
        expect(SurfKingR1.endIf(G)).toEqual({ winner: 0 })
        expect(ctx.events.endTurn).not.toHaveBeenCalled()
        expect(G.finishers).toEqual([0])
        expect(G.players[1].cellPosition).toBe(43)
        expect(r1Maneuver(G, { ...ctx, currentPlayer: '1' }, 50)).toBe(INVALID_MOVE)
        assertConserved(G)
    })
    test('Surf Current wins on its first step onto the beach', () => {
        const { G, ctx } = fixture()
        relocate(G, 0, 42)
        const index = grant(G, 0, 'Surf Current')
        useR1Card(G, ctx, index)
        r1Maneuver(G, ctx, 49)
        expect(G.winner).toBe(0)
        expect(G.currentMove).toBe('finished')
        expect(ctx.events.endTurn).not.toHaveBeenCalled()
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

test('shared hex permits two including fallen, never three; individual attacks reject ambiguity', () => {
    const { G, ctx } = fixture(3)
    relocate(G, 1, 7)
    relocate(G, 2, 7)
    G.turn = 2
    const index = grant(G, 0, 'Big wave')
    expect(r1CardPlayerTargets(G, ctx, index)).toEqual([1,2])
    expect(r1CardTargets(G, ctx, index)).toEqual([7])
    expect(useR1Card(G, ctx, index, 7)).toBe(INVALID_MOVE)
    expect(r1DropIn(G, ctx, 7, 1)).toBe(INVALID_MOVE)
    expect(useR1Card(G, ctx, index, 7, 2)).toBeUndefined()
    expect(G.players[1].energy).toBe(2)
    expect(G.players[2].energy).toBe(1)
    expect(r1MoveTargets(G, ctx)).not.toContain(7)
    G.players[2].energy = 0
    expect(r1MoveTargets(G, ctx)).not.toContain(7)
    relocate(G, 2, 14)
    expect(r1Maneuver(G, ctx, 7)).toBeUndefined()
    expect(r1Occupants(G, 7).map(p => p.position)).toEqual([0,1])
    assertConserved(G)
})
test('Change swaps one selected opponent, consumes movement and observes range/protection/round', () => {
    const { G, ctx } = fixture(3)
    relocate(G, 1, 14)
    relocate(G, 2, 14)
    const index = grant(G, 0, 'Change')
    expect(r1CardPlayerTargets(G, ctx, index)).toEqual([])
    G.turn = 2
    expect(r1CardPlayerTargets(G, ctx, index)).toEqual([1,2])
    G.players[2].activeCard.push(G.deck.splice(G.deck.findIndex(c => c.Name === 'Amulet'),1)[0])
    expect(r1CardPlayerTargets(G, ctx, index)).toEqual([1])
    expect(useR1Card(G, ctx, index, 14, 2)).toBe(INVALID_MOVE)
    expect(useR1Card(G, ctx, index, 14, 1)).toBeUndefined()
    expect(G.players[0].cellPosition).toBe(14)
    expect(G.players[1].cellPosition).toBe(0)
    expect(G.players[2].cellPosition).toBe(14)
    expect(G.moved).toBe(true)
    expect(ctx.events.endTurn).toHaveBeenCalledTimes(1)
    assertConserved(G)
})
test('Hang Loose blocks only Drop In until next personal turn', () => {
    const { G, ctx } = fixture()
    G.turn = 2
    relocate(G, 1, 7)
    ctx.currentPlayer = '1'
    useR1Card(G, ctx, grant(G, 1, 'Hang loose'))
    ctx.currentPlayer = '0'
    beginR1Turn(G, ctx)
    expect(r1DropPlayerTargets(G, ctx)).toEqual([])
    expect(r1CardPlayerTargets(G, ctx, grant(G, 0, 'Big wave'))).toEqual([1])
    expect(r1CardPlayerTargets(G, ctx, grant(G, 0, 'Change'))).toEqual([1])
    ctx.currentPlayer = '1'
    beginR1Turn(G, ctx)
    expect(G.players[1].activeCard).toHaveLength(0)
    ctx.currentPlayer = '0'
    expect(r1DropPlayerTargets(G, ctx)).toEqual([1])
    assertConserved(G)
})
test('same-cell lethal Drop In transfers a card but never offers a meaningless swap', () => {
    const { G, ctx } = fixture()
    G.turn = 2
    relocate(G, 1, 0)
    G.players[1].energy = 1
    const rolls = [6,1]
    ctx.random.D6 = () => rolls.shift()
    expect(r1DropIn(G, ctx, 0, 1, 1)).toBeUndefined()
    expect(G.players[1].energy).toBe(0)
    expect(G.pendingSwap).toBeNull()
    expect(G.currentMove).toBe('use_card')
    expect(G.players[0].cards).toHaveLength(3)
    assertConserved(G)
})

test('boardgame.io ends the actual match on the first beach arrival', () => {
    const game = { ...SurfKingR1, seed: 'R1-finish-test', setup: ctx => {
        const G = setupR1(ctx)
        G.players[G.order[0]].cellPosition = 42
        G.players[G.order[0]].energy = 1
        return G
    } }
    const client = Client({ game, numPlayers: 3 })
    client.start()
    try {
        const first = client.getState().G.order[0]
        client.moves.pass()
        client.moves.maneuver(49)
        const { G, ctx } = client.getState()
        expect(G.winner).toBe(first)
        expect(G.finishers).toEqual([first])
        expect(ctx.gameover).toEqual({ winner: first })
        expect(ctx.currentPlayer).toBe(String(first))
    } finally {
        client.stop()
    }
})

test('an empty deck shuffles the discard on the next draw without touching cards on the board', () => {
    const { G, ctx } = fixture()
    const stone = G.deck.splice(G.deck.findIndex(card => card.Name === 'Stone'), 1)[0]
    G.cells[25].obstacle = stone
    G.discardedCards = G.deck.splice(0)
    const discardedCount = G.discardedCards.length
    const shuffle = jest.spyOn(ctx.random, 'Shuffle')
    G.currentMove = 'maneuver'
    const target = r1MoveTargets(G, ctx).find(id => !G.cells[id].obstacle && id < 49)
    expect(target).toBeDefined()
    const handSize = G.players[0].cards.length
    r1Maneuver(G, ctx, target)
    expect(shuffle).toHaveBeenCalledTimes(1)
    expect(G.discardedCards).toHaveLength(0)
    expect(G.deck).toHaveLength(discardedCount - 1)
    expect(G.players[0].cards).toHaveLength(handSize + 1)
    expect(G.cells[25].obstacle).toBe(stone)
    assertConserved(G)
})


test('terrain feedback reports actual loss when a shark causes a fall', () => {
    const { G, ctx } = fixture()
    relocate(G, 0, 21)
    G.players[0].energy = 1
    passR1(G, ctx)
    r1Maneuver(G, ctx, 28)
    expect(G.players[0].energy).toBe(0)
    expect(G.terrainEnergyEvent).toEqual({ id: 1, playerId: 0, amount: 1, source: 'Shark' })
})


test('storm entry records the energy lost without removing the storm', () => {
    const { G, ctx } = fixture()
    relocate(G, 0, 21)
    place(G, 'Storm', 25)
    passR1(G, ctx)
    r1Maneuver(G, ctx, 25)
    expect(G.terrainEnergyEvent).toEqual({ id: 1, playerId: 0, amount: 1, source: 'Storm' })
    expect(G.cells[25].obstacle.Name).toBe('Storm')
})
