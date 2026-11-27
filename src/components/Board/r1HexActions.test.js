import { getR1HexActions, placeHexInspector } from './r1HexActions'
import { setupR1 } from '../../game/r1/SurfKingR1'
const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
test('ordinary move and Drop In are separate and full hex retains attack', () => {
    const G = setupR1(ctx)
    G.turn = 2
    G.currentMove = 'use_card'
    G.players[0].cellPosition = 7
    G.players[0].energy = 3
    G.players[1].cellPosition = 8
    G.players[2].cellPosition = 20
    G.cells[8].obstacle = { Name: 'Shark' }
    const options = getR1HexActions(G, ctx, 8)
    expect(options.find(o => o.kind === 'move')).toMatchObject({ cost: '−2 energy', risky: true })
    expect(options.find(o => o.kind === 'drop')).toMatchObject({ playerId: 1, cost: 'Risk 0–2 energy' })
    G.players[2].cellPosition = 8
    expect(getR1HexActions(G, ctx, 8).map(o => o.kind)).toEqual(['drop', 'drop'])
})
test('inspector placement is bounded on desktop, compact and short viewports', () => {
    for (const [width, height] of [[1200,800],[320,460],[780,320],[200,180]]) {
        for (const x of [0,width/2,width]) for (const y of [0,height/2,height]) {
            const p = placeHexInspector(width,height,x,y)
            expect(p.left).toBeGreaterThanOrEqual(0)
            expect(p.top).toBeGreaterThanOrEqual(0)
            expect(p.left+p.width).toBeLessThanOrEqual(width)
            expect(p.top+p.maxHeight).toBeLessThanOrEqual(height)
        }
    }
})
