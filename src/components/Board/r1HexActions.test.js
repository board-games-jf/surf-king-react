import { getR1HexActions, placeHexInspector } from './r1HexActions'
import { setupR1, r1MoveTargets } from '../../game/r1/SurfKingR1'
const ctx = { numPlayers: 3, currentPlayer: '0', random: { Number: () => 0, Shuffle: xs => xs.slice() } }
test('ordinary move and Drop In are separate and full hex retains attack', () => {
    const G = setupR1(ctx)
    G.turn = 2
    G.currentMove = 'use_card'
    G.players[0].cellPosition = 7
    G.players[0].energy = 3
    G.players[1].cellPosition = 40
    G.players[2].cellPosition = 41
    const target = r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx)[0]
    expect(target).toBeDefined()
    G.players[1].cellPosition = target
    G.cells[target].obstacle = { Name: 'Shark' }
    const options = getR1HexActions(G, ctx, target)
    expect(options.find(o => o.kind === 'move')).toMatchObject({ cost: '−2 energy', risky: true })
    expect(options.find(o => o.kind === 'drop')).toMatchObject({ playerId: 1, odds: { dice: 2, defenseDice: 2, tone: 'balanced' } })
    G.players[2].cellPosition = target
    expect(getR1HexActions(G, ctx, target).map(o => o.kind)).toEqual(['drop', 'drop'])
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

test('connector starts on the hex edge closest to the inspector', () => {
    const hex = [{ x: 180, y: 180 }, { x: 220, y: 180 }, { x: 240, y: 200 }, { x: 220, y: 220 }, { x: 180, y: 220 }, { x: 160, y: 200 }]
    const right = placeHexInspector(1200, 800, 180, 200, hex)
    expect(right.side).toBe('right')
    expect(right.anchorX).toBeGreaterThan(220)
    const left = placeHexInspector(1200, 800, 1000, 200, hex.map(p => ({ x: p.x + 800, y: p.y })))
    expect(left.side).toBe('left')
    expect(left.anchorX).toBeLessThan(980)
})

test('free water movement has no zero energy cost label', () => {
    const G = setupR1(ctx)
    G.players[0].cellPosition = 7
    const target = r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx)[0]
    delete G.cells[target].obstacle
    expect(getR1HexActions(G, ctx, target).find(o => o.kind === 'move').cost).toBe('Free')
})


test('Surf Current target feedback distinguishes mandatory first and final steps', () => {
    const G = setupR1(ctx)
    G.players[0].cellPosition = 7
    G.currentMove = 'current_first'
    expect(getR1HexActions(G, ctx, 14).find(o => o.kind === 'move').detail).toBe('Step 1/2 · Second step required')
    G.currentMove = 'current_second'
    expect(getR1HexActions(G, ctx, 14).find(o => o.kind === 'move').detail).toBe('Step 2/2 · End turn')
    G.currentMove = 'current_first'
    G.players[0].cellPosition = 42
    expect(getR1HexActions(G, ctx, 49).find(o => o.kind === 'move').detail).toBe('Finish the race')
})
