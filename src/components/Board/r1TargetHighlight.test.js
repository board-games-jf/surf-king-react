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
    expect(getR1TargetHighlight(G, ctx, selection)).toMatchObject({
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
    expect(getR1TargetHighlight(G, ctx, selection)).toEqual({ kind: 'attack', cellIds: [14], preview: false, playerIds: [1] })
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

test('attack preview and committed card distinguish protected, minimum energy and legal targets', () => {
    const ctx = { numPlayers: 4, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    // Start cells 1, 7 and 14 are within two edges of cell 0.
    for (const id of [1, 2, 3]) delete G.cells[G.players[id].cellPosition].player
    for (const [playerId, cellId] of [[1, 1], [2, 7], [3, 14]]) {
        G.players[playerId].cellPosition = cellId
        G.cells[cellId].player = { position: playerId }
    }
    G.players[1].energy = 1
    G.players[2].activeCard = [{ Name: 'Amulet' }]
    const index = G.players[0].cards.findIndex(c => c.Name === 'Big wave')
    const id = G.players[0].cards[index].id
    const before = JSON.stringify(G)
    const feedback = getR1CardFeedback(G, ctx, index)
    expect(feedback.targets).toEqual([14])
    expect(feedback.blocked.map(b => [b.id, b.code])).toEqual([[1, 'minimum'], [7, 'protected']])
    expect(getR1TargetHighlight(G, ctx, null, id)).toMatchObject({ cellIds: [14], preview: true, blocked: feedback.blocked })
    expect(r1SelectionTargets(G, ctx, null)).toEqual([])
    const selected = { kind: 'card', index }
    expect(getR1TargetHighlight(G, ctx, selected)).toMatchObject({ cellIds: [14], preview: false, blocked: feedback.blocked })
    expect(r1SelectionTargets(G, ctx, selected)).toEqual([14])
    expect(JSON.stringify(G)).toBe(before)
    G.players[3].energy = 1
    expect(getR1CardFeedback(G, ctx, index).playable).toBe(false)
    expect(getR1TargetHighlight(G, ctx, null, id).cellIds).toEqual([])
    expect(getR1TargetHighlight(G, ctx, null, id).blocked.map(b => b.code)).toEqual(['minimum', 'protected', 'minimum'])
    expect(getR1TargetHighlight(G, ctx, { kind: 'drop' }).cellIds).toEqual([1, 14])
})
test('self cards and selected Surf Current preview effects without enabling a hex click', () => {
    const { G, ctx } = fixture()
    for (const name of ['Energy x2', 'Amulet', 'Surf Current']) {
        const index = G.players[0].cards.findIndex(c => c.Name === name)
        const card = G.players[0].cards[index]
        const ids = name === 'Surf Current' ? r1MoveTargets({ ...G, currentMove: 'current_first' }, ctx) : [G.players[0].cellPosition]
        expect(getR1TargetHighlight(G, ctx, null, card.id)).toMatchObject({ cellIds: ids, preview: true })
        expect(getR1TargetHighlight(G, ctx, { kind: 'card', index })).toMatchObject({ cellIds: ids, preview: true })
        expect(r1SelectionTargets(G, ctx, { kind: 'card', index })).toEqual([])
    }
})

test('mixed eligibility within a shared hex preserves both valid and blocked feedback', () => {
    const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.turn = 2
    G.players[1].cellPosition = 7
    G.players[2].cellPosition = 7
    G.players[2].activeCard = [{ Name: 'Hang loose' }]
    G.players[0].cards = createR1Deck().filter((c,i,a) => a.findIndex(x => x.Name === c.Name) === i)
    const drop = getR1TargetHighlight(G, ctx, { kind: 'drop' })
    expect(drop.cellIds).toEqual([7])
    expect(drop.blocked).toMatchObject([{ id: 7, playerId: 2, code: 'hangloose' }])
    const index = G.players[0].cards.findIndex(c => c.Name === 'Change')
    expect(getR1CardFeedback(G, ctx, index)).toMatchObject({ playable: true, targets: [7], playerIds: [1,2] })
    G.players[2].activeCard = [{ Name: 'Amulet' }]
    expect(getR1CardFeedback(G, ctx, index)).toMatchObject({ playerIds: [1], blocked: [{ id: 7, playerId: 2, code: 'protected' }] })
})
