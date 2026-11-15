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
        expect(snapshot.players).toEqual([{ id: '0', cellId: 0 }, { id: '1', cellId: 6 }])
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
