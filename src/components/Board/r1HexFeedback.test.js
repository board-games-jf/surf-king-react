import { setupR1, createR1Deck, r1MoveTargets, r1CardTargets } from '../../game/r1/SurfKingR1'
import { getR1HexFeedback } from './r1HexFeedback'

function fixture() {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
    const G = setupR1(ctx)
    G.players[0].cards = createR1Deck().filter((c, i, a) => a.findIndex(x => x.Name === c.Name) === i)
    return { G, ctx }
}
test('hex inspection is read-only and distinguishes movement preview from a legal click', () => {
    const { G, ctx } = fixture()
    const id = r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx)[0]
    const before = JSON.stringify(G)
    expect(getR1HexFeedback(G, ctx, id, null)).toMatchObject({ status: 'preview', action: 'Select Move first to enter this hex.' })
    expect(JSON.stringify(G)).toBe(before)
    G.currentMove = 'maneuver'
    expect(getR1HexFeedback(G, ctx, id, null)).toMatchObject({ status: 'ready', action: 'Click to move here.' })
})
test('terrain warning distinguishes a lethal ordinary entry from a safe Jumping landing', () => {
    const { G, ctx } = fixture()
    const id = r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx)[0]
    G.cells[id].obstacle = { Name: 'Shark' }
    expect(getR1HexFeedback(G, ctx, id, null)).toMatchObject({ title: 'Shark', risk: 'Entering will cause a fall.' })
    const index = G.players[0].cards.findIndex(c => c.Name === 'Jumping')
    expect(r1CardTargets(G, ctx, index)).toContain(id)
    expect(getR1HexFeedback(G, ctx, id, { kind: 'card', index })).toMatchObject({
        status: 'ready', entry: 'Safe landing: ignore this terrain effect.', risk: null,
    })
})
test('occupied cells expose public energy and legal attack guidance', () => {
    const { G, ctx } = fixture()
    G.turn = 2
    const id = 7
    delete G.cells[G.players[1].cellPosition].player
    G.players[1].cellPosition = id
    G.cells[id].player = { position: 1 }
    expect(getR1HexFeedback(G, ctx, id, null)).toMatchObject({ occupantText: 'Player 2 · 2/5 energy', status: 'preview' })
    expect(getR1HexFeedback(G, ctx, id, { kind: 'drop' })).toMatchObject({ status: 'ready', action: 'Click to attempt Drop In against Player 2.' })
    G.players[1].energy = 1
    const index = G.players[0].cards.findIndex(c => c.Name === 'Big wave')
    expect(getR1HexFeedback(G, ctx, id, { kind: 'card', index })).toMatchObject({ status: 'blocked', action: 'Only Drop In can finish this opponent.' })
})
test('placement distinguishes occupied, existing obstacle and valid hexes', () => {
    const { G, ctx } = fixture()
    const index = G.players[0].cards.findIndex(c => c.Name === 'Storm')
    const selection = { kind: 'card', index }
    const id = r1CardTargets(G, ctx, index)[0]
    expect(getR1HexFeedback(G, ctx, id, selection)).toMatchObject({ status: 'ready', action: 'Click to place Storm here.' })
    G.cells[id].obstacle = { Name: 'Stone' }
    expect(getR1HexFeedback(G, ctx, id, selection)).toMatchObject({ status: 'blocked', action: 'An obstacle is already here.' })
    expect(getR1HexFeedback(G, ctx, null, selection)).toBeNull()
})

test('shared hazard inspection retains every public element and individual attack reason', () => {
    const { G, ctx } = fixture()
    G.turn = 2
    G.players[2] = { ...G.players[1], position: 2, activeCard: [], cards: [{ Name: 'Hidden card' }] }
    G.players[1].cellPosition = G.players[2].cellPosition = 7
    G.players[1].energy = 1
    G.players[2].energy = 4
    G.players[2].activeCard = [{ Name: 'Amulet' }, { Name: 'Hang loose' }]
    G.cells[7].obstacle = { Name: 'Island' }
    const index = G.players[0].cards.findIndex(c => c.Name === 'Big wave')
    const before = JSON.stringify(G)
    const info = getR1HexFeedback(G, ctx, 7, { kind: 'card', index })
    expect(info).toMatchObject({ title: 'Island', full: true, action: 'No eligible opponents here.', status: 'blocked' })
    expect(info.entry).toContain('restores 2 energy')
    expect(info.occupants).toEqual([
        expect.objectContaining({ position: 1, energy: 1, blocked: '1 energy · Drop In only', eligible: false, states: [] }),
        expect.objectContaining({ position: 2, energy: 4, blocked: 'Amulet', eligible: false, states: ['Amulet · Protected', 'Hang Loose · Drop In shield'] }),
    ])
    expect(JSON.stringify(info)).not.toContain('Hidden card')
    expect(JSON.stringify(G)).toBe(before)
    G.players[2].activeCard = []
    const mixed = getR1HexFeedback(G, ctx, 7, { kind: 'card', index })
    expect(mixed.occupants.map(p => p.eligible)).toEqual([false, true])
    expect(mixed.status).toBe('ready')
    expect(mixed.action).toBe('Click to use Big wave on Player 3.')
    G.players[2].energy = 0
    expect(getR1HexFeedback(G, ctx, 7, null).occupants[1].states).toContain('Fallen')
})
