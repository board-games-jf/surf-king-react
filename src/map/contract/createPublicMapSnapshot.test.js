import { MOVE_MANEUVER, MOVE_DROP_IN } from '../../game/SurfKingGame'
import { createPublicMapSnapshot } from './createPublicMapSnapshot'
const game = () => ({
    cells: Array.from({ length: 53 }, (_, position) => ({ position })),
    players: {
        0: { position: 0, cellPosition: 0, cards: [{ Name: 'Hidden card' }], activeCard: [] },
        1: { position: 1, cellPosition: 6, cards: [], activeCard: [] },
    },
    deck: [{ Name: 'Secret deck card' }],
    turn: 3,
})
describe('public map snapshot', () => {
    test('projects 53 engine IDs and excludes hidden information', () => {
        const snapshot = createPublicMapSnapshot(game(), { currentPlayer: '0' }, 5)
        expect(snapshot.cells).toHaveLength(53)
        expect(snapshot.cells.map((c) => c.id)).toEqual(Array.from({ length: 53 }, (_, i) => i))
        expect(snapshot.players).toEqual([{ id: '0', cellId: 0, fallen: false }, { id: '1', cellId: 6, fallen: false }])
        expect(snapshot.selectedCellId).toBe(5)
        expect(snapshot.activePlayerId).toBe('0')
        expect(JSON.stringify(snapshot)).not.toMatch(/Hidden card|Secret deck card|deck|cards/)
    })
    test('reflects obstacles, stone duration and player moves from the live engine', () => {
        const G = game()
        G.cells[28].obstacle = { Name: 'Shark' }
        G.cells[15].obstacle = { Name: 'Stone' }
        G.players[1].activeCard = [{ Name: 'Stone', CellPosition: 15, RemaningTurn: 2 }]
        G.players[0].cellPosition = 7
        const snapshot = createPublicMapSnapshot(G, { currentPlayer: '1' })
        expect(snapshot.cells[28]).toEqual({ id: 28, obstacleType: 'Shark', remainingTurns: null })
        expect(snapshot.cells[15]).toEqual({ id: 15, obstacleType: 'Stone', remainingTurns: 2 })
        expect(snapshot.players[0].cellId).toBe(7)
        expect(snapshot.activePlayerId).toBe('1')
    })
    test('hides off-board players and rejects invalid selection', () => {
        const G = game()
        G.players[0].cellPosition = -1
        expect(createPublicMapSnapshot(G, {}, 53).players[0].cellId).toBeNull()
        expect(createPublicMapSnapshot(G, {}, 53).selectedCellId).toBeNull()
    })
    test('rejects wrong board size', () => {
        expect(() => createPublicMapSnapshot({ cells: [] }, {})).toThrow('exactly 53')
    })
})

test('marks the direct first-to-eighth move only during a maneuver', () => {
    const G = game()
    const ctx = { currentPlayer: '0' }
    G.players[0].energy = 4
    G.cells[4].obstacle = { Name: 'Stone' }
    G.currentMove = MOVE_MANEUVER
    expect(createPublicMapSnapshot(G, ctx).maneuverDestinations).toEqual([3, 7])
    G.currentMove = MOVE_DROP_IN
    expect(createPublicMapSnapshot(G, ctx).maneuverDestinations).toEqual([])
})

test('projects the engine fallen marker rather than inferring it from energy', () => {
    const G = game()
    G.players[0].energy = 0
    G.players[0].fellOffTheBoard = 3
    G.players[1].fellOffTheBoard = 4
    expect(createPublicMapSnapshot(G, {}).players.map(p => p.fallen)).toEqual([true, false])
    G.players[0].fellOffTheBoard = -1
    expect(createPublicMapSnapshot(G, {}).players[0].fallen).toBe(false)
})

test('R1 turn marker follows the active surfer and disappears at game over', () => {
    const G = { ...game(), ruleset: 'R1', currentMove: 'use_card', winner: null }
    expect(createPublicMapSnapshot(G, { currentPlayer: '0' }).turnMarkerPlayerId).toBe('0')
    expect(createPublicMapSnapshot(G, { currentPlayer: '1' }).turnMarkerPlayerId).toBe('1')
    expect(createPublicMapSnapshot(G, { currentPlayer: '0' }).winnerPlayerId).toBeUndefined()
    G.winner = 0
    expect(createPublicMapSnapshot(G, { currentPlayer: '1' }).turnMarkerPlayerId).toBeNull()
    expect(createPublicMapSnapshot(G, { currentPlayer: '1' }).winnerPlayerId).toBe('0')
    expect(createPublicMapSnapshot(game(), { currentPlayer: '0' }).turnMarkerPlayerId).toBeUndefined()
})

test('shared R1 cells retain both distinct public player identities', () => {
    const G = { ...game(), ruleset: 'R1', currentMove: 'use_card', winner: null }
    G.players[0].cellPosition = 7
    G.players[1].cellPosition = 7
    G.players[1].fellOffTheBoard = 3
    const snapshot = createPublicMapSnapshot(G, { currentPlayer: '0' })
    expect(snapshot.players).toEqual([{ id: '0', cellId: 7, fallen: false }, { id: '1', cellId: 7, fallen: true }])
})

test('R1 map exposes each active public protection for individual markers', () => {
    const G = { ...game(), ruleset: 'R1', currentMove: 'use_card', winner: null }
    G.players[0].activeCard = [{ Name: 'Hang loose' }, { Name: 'Amulet' }]
    const snapshot = createPublicMapSnapshot(G, { currentPlayer: '0' })
    expect(snapshot.players[0].activeProtections).toEqual(['Hang loose', 'Amulet'])
    expect(snapshot.players[1].activeProtections).toBeUndefined()
})

test('R1 map receives the actual Island energy gain event', () => {
    const G = { ...game(), ruleset: 'R1', currentMove: 'use_card', winner: null,
        terrainEnergyEvent: { id: 7, playerId: 1, amount: 1, source: 'Island', direction: 'gain' } }
    expect(createPublicMapSnapshot(G, { currentPlayer: '0' }).terrainEnergyEvent).toEqual(G.terrainEnergyEvent)
})


test('adaptive snapshot preserves stable IDs and rejects an inactive selection', () => {
    const G = { ...game(), ruleset: 'R1', currentMove: 'use_card', winner: null, activeCellIds: [1, 2, 5, 50, 51] }
    const snapshot = createPublicMapSnapshot(G, { currentPlayer: '0' }, 0)
    expect(snapshot.cells).toHaveLength(53)
    expect(snapshot.activeCellIds).toEqual(G.activeCellIds)
    expect(snapshot.activeCellIds).not.toBe(G.activeCellIds)
    expect(snapshot.selectedCellId).toBeNull()
    expect(createPublicMapSnapshot(G, { currentPlayer: '0' }, 50).selectedCellId).toBe(50)
})
