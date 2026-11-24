import { INVALID_MOVE } from 'boardgame.io/core'
import layout from '../../map/layout/board-layout.json'
import {
    CardAmulet, CardBigWave, CardCyclone, CardEnergyX2, CardIsland,
    CardJumping, CardLifeGuardFloat, CardShark, CardStorm, CardSunburn,
} from '../Cards'

export const R1 = 'R1'
export const MAX_ENERGY = 5
export const MAX_HAND = 5
export const CardSurfCurrent = { Name: 'Surf Current', Category: 'Action' }
export const R1_INVENTORY = [
    [CardEnergyX2, 12], [CardLifeGuardFloat, 9], [CardBigWave, 3],
    [CardSunburn, 7], [CardStorm, 7], [CardCyclone, 4], [CardIsland, 3],
    [CardJumping, 4], [CardAmulet, 7], [CardSurfCurrent, 4],
]
const ADJ = layout.cells.map(c => layout.cells.filter(d => d.id !== c.id &&
    Math.abs(Math.hypot(c.x - d.x, c.z - d.z) - Math.sqrt(3) * layout.hexRadius) < 0.005
).map(d => d.id))
const DIST = ADJ.map((_, start) => {
    const distances = Array(ADJ.length).fill(Infinity)
    const queue = [start]
    distances[start] = 0
    for (let i = 0; i < queue.length; i++) {
        ADJ[queue[i]].forEach(to => {
            if (distances[to] !== Infinity) return
            distances[to] = distances[queue[i]] + 1
            queue.push(to)
        })
    }
    return distances
})
export const isBeach = id => Number.isInteger(id) && id >= 49 && id <= 52
const choose = (ctx, values) => values[Math.floor(ctx.random.Number() * values.length)]
const actor = (G, ctx) => G.players[ctx.currentPlayer]
const shielded = p => p.activeCard.some(c => c.Name === CardAmulet.Name)
const freeNeighbors = (G, from) => (ADJ[from] || []).filter(to => !G.cells[to].player)
export const r1Neighbors = from => (ADJ[from] || []).slice()
const alive = p => p.energy > 0 && !isBeach(p.cellPosition)
const capEnergy = (p, value) => { p.energy = Math.min(MAX_ENERGY, value) }
const placementNames = [CardStorm.Name, CardCyclone.Name, CardIsland.Name]
const attackNames = [CardBigWave.Name, CardSunburn.Name]
const validCell = id => Number.isInteger(id) && id >= 0 && id < ADJ.length

export function createR1Deck() {
    let id = 0
    return R1_INVENTORY.flatMap(([card, count]) =>
        Array.from({ length: count }, () => ({ ...card, id: id++ })))
}
function draw(G, ctx, p) {
    if (p.cards.length >= MAX_HAND) return
    if (!G.deck.length && G.discardedCards.length) {
        G.deck = ctx.random.Shuffle(G.discardedCards)
        G.discardedCards = []
    }
    if (G.deck.length) p.cards.push(G.deck.pop())
}
export function setupR1(ctx) {
    const starts = ctx.random.Shuffle([0, 1, 2, 3, 4, 5, 6])
    const order = ctx.random.Shuffle(Array.from({ length: ctx.numPlayers }, (_, id) => id))
    const G = {
        ruleset: R1, cells: layout.cells.map(c => ({ position: c.id })),
        players: {}, deck: ctx.random.Shuffle(createR1Deck()), discardedCards: [],
        turn: 1, order, nextPlayer: order[0], completedInRound: 0,
        currentMove: 'use_card', moved: false, redirected: false,
        winner: null, finishers: [], overflowPlayer: null, pendingEnd: false,
        message: 'Round 1: no attacks.', atkDices: [], defDices: [],
    }
    for (const id of [28, 29, 30, 31]) G.cells[id].obstacle = { ...CardShark }
    for (let i = 0; i < ctx.numPlayers; i++) {
        const p = { position: i, cellPosition: starts[i], energy: 2, cards: [],
            activeCard: [], fellOffTheBoard: -1 }
        G.players[i] = p
        G.cells[p.cellPosition].player = { position: i }
        draw(G, ctx, p)
        draw(G, ctx, p)
    }
    return G
}
export function beginR1Turn(G, ctx) {
    const p = actor(G, ctx)
    G.discardedCards.push(...p.activeCard)
    p.activeCard = []
    G.currentMove = p.energy === 0 ? 'recover' : 'use_card'
    G.moved = false
    G.redirected = false
    G.atkDices = []
    G.defDices = []
    G.message = G.turn === 1 ? 'Round 1: no attacks.' :
        p.energy === 0 ? 'Recover on your board.' : 'Choose one tactic or move.'
}
function spend(G, p, index, zone = 'discard') {
    const [card] = p.cards.splice(index, 1)
    if (zone === 'discard') G.discardedCards.push(card)
    return card
}
function hurt(G, ctx, p, damage, attacker = null) {
    if (!alive(p)) return
    p.energy = Math.max(0, p.energy - damage)
    if (p.energy !== 0) return
    p.fellOffTheBoard = G.turn
    G.message = 'Player ' + (p.position + 1) + ' fell!'
    if (!p.cards.length) return
    const index = Math.floor(ctx.random.Number() * p.cards.length)
    const [card] = p.cards.splice(index, 1)
    if (attacker && attacker.position !== p.position) {
        attacker.cards.push(card)
        if (attacker.cards.length > MAX_HAND) G.overflowPlayer = attacker.position
    } else G.discardedCards.push(card)
}
function relocate(G, p, to) {
    delete G.cells[p.cellPosition].player
    p.cellPosition = to
    G.cells[to].player = { position: p.position }
}
function arrive(G, ctx, p, from, to) {
    const tile = G.cells[to].obstacle
    switch (tile?.Name) {
        case CardShark.Name: hurt(G, ctx, p, 2); break
        case CardStorm.Name: hurt(G, ctx, p, 1); break
        case CardIsland.Name:
            capEnergy(p, p.energy + 2)
            // Island is persistent terrain; every ordinary entry restores energy.
            break
        case CardCyclone.Name: {
            if (G.redirected) break
            const exits = freeNeighbors(G, to).filter(id => id !== from)
            if (!exits.length) break
            const destination = choose(ctx, exits)
            G.redirected = true
            relocate(G, p, destination)
            G.message = 'Cyclone redirected Player ' + (p.position + 1) + '.'
            arrive(G, ctx, p, to, destination)
            break
        }
        default: break
    }
}
function endR1Turn(G, ctx) {
    const p = actor(G, ctx)
    if (G.moved && p.energy > 0) draw(G, ctx, p)
    if (isBeach(p.cellPosition)) G.finishers.push(p.position)
    G.completedInRound++
    if (G.completedInRound === ctx.numPlayers) {
        if (G.finishers.length) {
            const highest = Math.max(...G.finishers.map(id => G.players[id].energy))
            const tied = G.finishers.filter(id => G.players[id].energy === highest)
            G.winner = tied.length === 1 ? tied[0] : choose(ctx, tied)
            G.currentMove = 'finished'
            return
        }
        G.turn++
        G.completedInRound = 0
    }
    G.nextPlayer = G.order[G.completedInRound]
    ctx.events.endTurn()
}
function continueAfterTactic(G, ctx) {
    const p = actor(G, ctx)
    const mustEnd = p.energy === 0 || isBeach(p.cellPosition)
    if (G.overflowPlayer !== null) {
        G.currentMove = 'discard'
        G.pendingEnd = mustEnd
    } else if (mustEnd) endR1Turn(G, ctx)
    else G.currentMove = 'maneuver'
}
export function r1MoveTargets(G, ctx) {
    const p = actor(G, ctx)
    if (!p || !alive(p) || !['maneuver', 'current_first', 'current_second'].includes(G.currentMove)) return []
    return freeNeighbors(G, p.cellPosition)
}
export function r1CardTargets(G, ctx, index) {
    const p = actor(G, ctx)
    const name = p?.cards[index]?.Name
    if (!p || G.currentMove !== 'use_card' || !alive(p)) return []
    const from = p.cellPosition
    if (placementNames.includes(name)) return G.cells.filter(c => c.position >= 7 && c.position < 49 &&
        !c.player && !c.obstacle).map(c => c.position)
    if (name === CardJumping.Name) return freeNeighbors(G, from).filter(to => !!G.cells[to].obstacle)
    if (attackNames.includes(name) && G.turn > 1) {
        const range = name === CardBigWave.Name ? 2 : 3
        return Object.values(G.players).filter(q => q.position !== p.position && alive(q) &&
            !shielded(q) && DIST[from][q.cellPosition] <= range).map(q => q.cellPosition)
    }
    return []
}
export function r1DropTargets(G, ctx) {
    const p = actor(G, ctx)
    if (!p || !alive(p) || G.currentMove !== 'use_card' || G.turn === 1) return []
    return Object.values(G.players).filter(q => q.position !== p.position && alive(q) &&
        !shielded(q) && ADJ[p.cellPosition].includes(q.cellPosition)).map(q => q.cellPosition)
}
export function r1CardPlayable(G, ctx, index) {
    const p = actor(G, ctx)
    const name = p?.cards[index]?.Name
    if (!name) return false
    if (G.currentMove === 'recover') return name === CardLifeGuardFloat.Name && p.energy === 0
    if (G.currentMove !== 'use_card' || !alive(p)) return false
    if (name === CardEnergyX2.Name) return p.energy < MAX_ENERGY
    if (name === CardAmulet.Name) return !shielded(p)
    if (name === CardSurfCurrent.Name) return freeNeighbors(G, p.cellPosition).length > 0
    return r1CardTargets(G, ctx, index).length > 0
}
export function recoverR1(G, ctx) {
    const p = actor(G, ctx)
    if (G.currentMove !== 'recover' || p.energy !== 0) return INVALID_MOVE
    p.energy = 1
    p.fellOffTheBoard = -1
    G.currentMove = 'use_card'
    G.message = 'Recovered with 1 energy.'
}
export function useR1Card(G, ctx, index, to) {
    if (!Number.isInteger(index) || !r1CardPlayable(G, ctx, index)) return INVALID_MOVE
    const p = actor(G, ctx)
    const name = p.cards[index].Name
    if (G.currentMove === 'recover') {
        spend(G, p, index)
        p.energy = 3
        p.fellOffTheBoard = -1
        G.currentMove = 'maneuver'
        G.message = 'Recovered with Lifeguard Float.'
        return
    }
    if ([...placementNames, ...attackNames, CardJumping.Name].includes(name) &&
        !r1CardTargets(G, ctx, index).includes(to)) return INVALID_MOVE
    if (placementNames.includes(name)) {
        G.cells[to].obstacle = spend(G, p, index, 'board')
    } else if (name === CardAmulet.Name) {
        p.activeCard.push(spend(G, p, index, 'active'))
    } else {
        spend(G, p, index)
        if (name === CardEnergyX2.Name) capEnergy(p, p.energy + 2)
        else if (attackNames.includes(name)) {
            hurt(G, ctx, G.players[G.cells[to].player.position], name === CardBigWave.Name ? 2 : 1, p)
        } else if (name === CardJumping.Name) {
            relocate(G, p, to)
            G.moved = true
            G.message = 'Jumped safely onto ' + G.cells[to].obstacle.Name + '.'
            endR1Turn(G, ctx)
            return
        } else if (name === CardSurfCurrent.Name) {
            G.currentMove = 'current_first'
            G.message = 'Surf Current: choose your first step.'
            return
        }
    }
    continueAfterTactic(G, ctx)
}
export function r1DropIn(G, ctx, to) {
    if (!r1DropTargets(G, ctx).includes(to)) return INVALID_MOVE
    const p = actor(G, ctx)
    const q = G.players[G.cells[to].player.position]
    const roll = player => Array.from({ length: player.energy === 1 ? 1 : 2 }, () => ctx.random.D6())
    G.atkDices = roll(p)
    G.defDices = roll(q)
    const attack = Math.max(...G.atkDices)
    const defense = Math.max(...G.defDices)
    G.message = 'Drop In: ' + attack + ' vs ' + defense + '.'
    if (attack > defense) hurt(G, ctx, q, 1, p)
    else if (defense > attack) hurt(G, ctx, p, 1, q)
    continueAfterTactic(G, ctx)
}
export function discardR1Overflow(G, ctx, index) {
    if (G.currentMove !== 'discard' || G.overflowPlayer === null || !Number.isInteger(index)) return INVALID_MOVE
    const p = G.players[G.overflowPlayer]
    if (!p.cards[index] || p.cards.length !== MAX_HAND + 1) return INVALID_MOVE
    spend(G, p, index)
    G.overflowPlayer = null
    const end = G.pendingEnd
    G.pendingEnd = false
    if (end) endR1Turn(G, ctx)
    else G.currentMove = 'maneuver'
}
export function r1Maneuver(G, ctx, to) {
    if (!validCell(to) || !r1MoveTargets(G, ctx).includes(to)) return INVALID_MOVE
    const p = actor(G, ctx)
    const from = p.cellPosition
    const first = G.currentMove === 'current_first'
    relocate(G, p, to)
    G.moved = true
    // Each chosen edge-step is a maneuver; never chain Cyclones during a step.
    G.redirected = false
    arrive(G, ctx, p, from, to)
    if (first && alive(p) && freeNeighbors(G, p.cellPosition).length) {
        G.currentMove = 'current_second'
        G.message = 'Surf Current: choose a second step or finish.'
    } else endR1Turn(G, ctx)
}
export function passR1(G, ctx) {
    if (G.currentMove === 'use_card') { G.currentMove = 'maneuver'; return }
    if (G.currentMove === 'current_second' ||
        (G.currentMove === 'maneuver' && r1MoveTargets(G, ctx).length === 0)) endR1Turn(G, ctx)
    else return INVALID_MOVE
}

export const SurfKingR1 = {
    name: 'SurfKingR1',
    minPlayers: 2, maxPlayers: 7, disableUndo: true,
    setup: setupR1,
    moves: {
        recover: recoverR1, useCard: useR1Card, dropIn: r1DropIn,
        maneuver: r1Maneuver, pass: passR1, discardOverflow: discardR1Overflow,
    },
    turn: {
        order: { first: G => G.order[0], next: G => G.nextPlayer },
        onBegin: beginR1Turn,
    },
    endIf: G => G.winner !== null ? { winner: G.winner } : undefined,
}
