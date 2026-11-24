import { setupR1, r1MoveTargets, r1CardTargets, r1DropTargets, createR1Deck } from '../../game/r1/SurfKingR1'
import { getR1CardFeedback } from './r1CardFeedback'
import { getR1TargetHighlight, r1SelectionTargets } from './r1TargetHighlight'

function fixture() {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    return { G, ctx }
}
test('previews movement before card choice without enabling a move or modifying state', () => {
    const { G, ctx } = fixture()
    const before = JSON.stringify(G)
    const cellIds = r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx)
    expect(cellIds.length).toBeGreaterThan(0)
    expect(getR1TargetHighlight(G, ctx, null)).toEqual({ kind: 'move', cellIds, preview: true })
    expect(r1SelectionTargets(G, ctx, null)).toEqual([])
    expect(JSON.stringify(G)).toBe(before)
    G.currentMove = 'maneuver'
    expect(getR1TargetHighlight(G, ctx, null)).toEqual({ kind: 'move', cellIds, preview: false })
})
test.each([
    ['Stone', 'placement'], ['Storm', 'placement'], ['Cyclone', 'placement'], ['Island', 'placement'],
    ['Big wave', 'attack'], ['Sunburn', 'attack'], ['Tsunami', 'attack'], ['Jumping', 'jump'],
])('uses exact authoritative targets for %s', (name, kind) => {
    const { G, ctx } = fixture()
    G.turn = 2
    const index = G.players[0].cards.findIndex(c => c.Name === name)
    const selection = { kind: 'card', index }
    expect(getR1TargetHighlight(G, ctx, selection)).toEqual({
        kind, cellIds: r1CardTargets(G, ctx, index), preview: false,
    })
})
test('Drop In, cancellation, recovery and game over clear or replace highlights', () => {
    const { G, ctx } = fixture()
    G.turn = 2
    delete G.cells[1].player
    G.cells[14].player = { position: 1 }
    G.players[1].cellPosition = 14
    const selection = { kind: 'drop', diceCount: 1 }
    expect(r1DropTargets(G, ctx)).toEqual([14])
    expect(getR1TargetHighlight(G, ctx, selection)).toEqual({ kind: 'attack', cellIds: [14], preview: false })
    expect(getR1TargetHighlight(G, ctx, null).kind).toBe('move')
    G.currentMove = 'recover'
    expect(getR1TargetHighlight(G, ctx, null).cellIds).toEqual([])
    G.winner = 0
    expect(getR1TargetHighlight(G, ctx, selection).cellIds).toEqual([])
    expect(r1SelectionTargets(G, ctx, selection)).toEqual([])
})

test('card hover previews exact targets without enabling them, and selection takes priority', () => {
    const { G, ctx } = fixture()
    G.turn = 2
    const index = G.players[0].cards.findIndex(c => c.Name === 'Storm')
    const id = G.players[0].cards[index].id
    const cellIds = r1CardTargets(G, ctx, index)
    const before = JSON.stringify(G)
    expect(cellIds.length).toBeGreaterThan(0)
    expect(getR1TargetHighlight(G, ctx, null, id)).toEqual({ kind: 'placement', cellIds, preview: true })
    expect(r1SelectionTargets(G, ctx, null)).toEqual([])
    const selection = { kind: 'card', index }
    expect(getR1TargetHighlight(G, ctx, selection, id)).toEqual({ kind: 'placement', cellIds, preview: false })
    expect(getR1TargetHighlight(G, ctx, null).kind).toBe('move')
    expect(JSON.stringify(G)).toBe(before)
})
test('feedback distinguishes playable, first-round blocked, full energy and recovery cards', () => {
    const { G, ctx } = fixture()
    const find = name => G.players[0].cards.findIndex(c => c.Name === name)
    expect(getR1CardFeedback(G, ctx, find('Energy x2'))).toMatchObject({ playable: true, action: '2 → 4 energy' })
    G.players[0].energy = 5
    expect(getR1CardFeedback(G, ctx, find('Energy x2'))).toMatchObject({ playable: false, reason: 'Energy already full (5/5).' })
    expect(getR1CardFeedback(G, ctx, find('Big wave'))).toMatchObject({ playable: false, reason: 'Attacks unlock in round 2.', previewIds: [] })
    expect(getR1CardFeedback(G, ctx, find('Lifeguard float'))).toMatchObject({ playable: false, reason: 'Only usable after falling.' })
    G.players[0].energy = 0
    G.currentMove = 'recover'
    expect(getR1CardFeedback(G, ctx, find('Lifeguard float'))).toMatchObject({ playable: true, action: '0 → 3 energy' })
    expect(getR1CardFeedback(G, ctx, find('Storm'))).toMatchObject({ playable: false, reason: 'Recover before playing this card.' })
})
test('Surf Current hover previews first step and swap phase blocks additional movement', () => {
    const { G, ctx } = fixture()
    const index = G.players[0].cards.findIndex(c => c.Name === 'Surf Current')
    const ids = r1MoveTargets({ ...G, currentMove: 'current_first' }, ctx)
    const card = G.players[0].cards[index]
    expect(getR1TargetHighlight(G, ctx, null, card.id)).toEqual({ kind: 'move', cellIds: ids, preview: true })
    expect(r1SelectionTargets(G, ctx, null)).toEqual([])
    G.currentMove = 'swap_card'
    expect(getR1CardFeedback(G, ctx, index)).toMatchObject({ playable: false, reason: 'Your swap already used your movement.' })
})
