import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import LocalHistoryGame, { restoreState, describe, describeAction, HistoryAction } from './LocalHistoryGame'
import { Client } from 'boardgame.io/client'
import { SurfKingR1, setupR1 } from '../../game/r1/SurfKingR1'

jest.mock('../../components/Board/Board', () => {
    const React = require('react')
    const { r1MoveTargets } = require('../../game/r1/SurfKingR1')
    return ({ G, ctx, moves, viewMode, onViewModeChange }) => (
        <div>
            <span data-testid="view-mode">{viewMode}</span>
            <button onClick={() => onViewModeChange(viewMode === '3d' ? '2d' : '3d')}>
                {viewMode === '3d' ? 'Switch to 2D view' : 'Switch to 3D view'}
            </button>
            <span data-testid="state">
                {ctx.currentPlayer}:
                {Object.values(G.players)
                    .map((p) => p.cellPosition)
                    .join(',')}
                :{G.deck.length}
            </span>
            {r1MoveTargets({ ...G, currentMove: 'maneuver' }, ctx).map((cell) => (
                <button key={cell} onClick={() => moves.quickManeuver(cell)}>
                    Move {cell}
                </button>
            ))}
        </div>
    )
})

test('previews and forks an earlier state without losing the original timeline', () => {
    render(<LocalHistoryGame numPlayers={2} />)
    const initial = screen.getByTestId('state').textContent
    const firstMoves = screen.getAllByRole('button', { name: /^Move \d/ })
    expect(firstMoves.length).toBeGreaterThan(1)
    const alternative = firstMoves[1].textContent
    fireEvent.click(firstMoves[0])
    const original = screen.getByTestId('state').textContent
    expect(original).not.toBe(initial)
    fireEvent.click(screen.getByRole('button', { name: /History/ }))
    fireEvent.click(screen.getByRole('button', { name: /Match started/ }))
    expect(screen.getByTestId('state')).toHaveTextContent(initial)
    fireEvent.click(screen.getByRole('button', { name: 'Play from here' }))
    expect(screen.getByTestId('state')).toHaveTextContent(initial)
    fireEvent.click(screen.getByRole('button', { name: alternative }))
    expect(screen.getByTestId('state').textContent).not.toBe(original)
    fireEvent.change(screen.getByLabelText('Timeline'), { target: { value: '0' } })
    const history = screen.getByRole('complementary', { name: 'Match history' })
    fireEvent.click(within(history).getByRole('button', { name: /P[12] · Move/ }))
    expect(screen.getByTestId('state')).toHaveTextContent(original)
    fireEvent.click(screen.getByRole('button', { name: 'Back to game' }))
    expect(screen.getByTestId('state').textContent).not.toBe(original)
})

test('restoring a snapshot preserves random state for subsequent dice rolls', () => {
    const game = {
        ...SurfKingR1,
        seed: 'history-test',
        setup: (ctx) => {
            const G = setupR1(ctx)
            G.turn = 2
            Object.values(G.players).forEach((player) => {
                player.cellPosition = 5
                player.energy = 3
            })
            return G
        },
    }
    const client = Client({ game, numPlayers: 2 })
    client.start()
    try {
        const snapshot = client.store.getState()
        const target = Number(snapshot.ctx.currentPlayer) === 0 ? 1 : 0
        client.moves.dropIn(5, 2, target)
        const first = client.store.getState()
        expect(first._stateID).toBeGreaterThan(snapshot._stateID)
        restoreState(client, snapshot)
        client.moves.dropIn(5, 2, target)
        const replay = client.store.getState()
        expect(replay.G.atkDices).toEqual(first.G.atkDices)
        expect(replay.G.defDices).toEqual(first.G.defDices)
        expect(replay.plugins.random).toEqual(first.plugins.random)
    } finally {
        client.stop()
    }
})


test('history descriptions use the played card from the original hand, not the new hand', () => {
    const previous = {
        ctx: { currentPlayer: '0' },
        G: { turn: 2, players: { 0: { cards: [{ Name: 'Jumping' }] } },
            cardVisualEvent: { id: 5, name: 'Stone', playerId: 0 } },
    }
    const state = {
        ctx: { currentPlayer: '1' },
        G: { turn: 3, players: { 0: { cards: [{ Name: 'Amulet' }] } },
            cardVisualEvent: { id: 6, name: 'Jumping', playerId: 0, to: 28 } },
        deltalog: [{ action: { type: 'MAKE_MOVE', payload: { type: 'useCard', playerID: '0', args: [0, 28] } } }],
    }
    expect(describe(state, previous)).toBe('P1 · Play card: Jumping · Hex 29')
    expect(describe({ ...state, G: { ...state.G, cardVisualEvent: previous.G.cardVisualEvent } }, previous))
        .toBe('P1 · Play card: Jumping · Hex 29')
    expect(describe({ ...state, G: { ...state.G, cardVisualEvent: previous.G.cardVisualEvent } }))
        .toBe('P1 · Play card · Hex 29')
    const alternative = { ...previous, G: { ...previous.G, players: { 0: { cards: [{ Name: 'Stone' }] } } } }
    expect(describe({ ...state, G: { ...state.G, cardVisualEvent: previous.G.cardVisualEvent } }, alternative))
        .toBe('P1 · Play card: Stone · Hex 29')
})

test('history distinguishes attack targets, position decisions and ordinary movement', () => {
    const previous = { ctx: { currentPlayer: '0' }, G: { pendingSwap: { targetPlayerId: 1 } } }
    const state = (type, args, G = {}) => ({
        G, deltalog: [{ action: { type: 'MAKE_MOVE', payload: { type, args, playerID: '0' } } }],
    })
    expect(describe(state('dropIn', [7, 2, 1], { dropResult: { attackerId: 0, defenderId: 1, attackerLoss: 0, defenderLoss: 1 } }), previous))
        .toBe('P1 · Drop In · P2 · Hex 8 · −1 target energy')
    expect(describe(state('resolveSwap', [true]), previous)).toBe('P1 · Swap positions · P2')
    expect(describe(state('resolveSwap', [false]), previous)).toBe('P1 · Stay')
    expect(describe(state('quickManeuver', [7], { players: { 0: { cellPosition: 14 } } }), previous))
        .toBe('P1 · Move · Hex 8 · Landed Hex 15')
    expect(describe(state('recover', []), previous)).toBe('P1 · Recover · +1 energy')
})


test('history renders actual player circles, shared card artwork and a hex badge instead of P labels', () => {
    const previous = { ctx: { currentPlayer: '2' }, G: { players: { 2: { cards: [{ Name: 'Sunburn' }] } } } }
    const state = { G: {}, deltalog: [{ action: { type: 'MAKE_MOVE', payload: { type: 'useCard', playerID: '2', args: [0, 7, 0] } } }] }
    const action = describeAction(state, previous)
    expect(action).toEqual({ playerId: 2, move: 'useCard', cardName: 'Sunburn', label: 'Play card: Sunburn',
        details: [{ kind: 'player', playerId: 0 }, { kind: 'hex', id: 7, landed: false }] })
    const { container } = render(<HistoryAction action={action} round={4} />)
    const actor = container.querySelector('.r1-history-actor')
    const target = container.querySelector('.r1-history-target')
    expect(actor).toHaveTextContent('3')
    expect(target).toHaveTextContent('1')
    expect(actor.style.getPropertyValue('--r1-player-color')).toBe('#38b4ae')
    expect(target.style.getPropertyValue('--r1-player-color')).toBe('#ffbb41')
    expect(container.querySelector('.r1-history-card-art')).toBeInTheDocument()
    expect(container.querySelector('.r1-hex-badge')).toHaveTextContent('8')
    expect(container).not.toHaveTextContent(/P[13]/)
    expect(describe(state, previous)).toBe('P3 · Play card: Sunburn · P1 · Hex 8')
})

test('Drop In loss uses compact energy chips and no card thumbnail', () => {
    const state = { G: { dropResult: { attackerId: 2, defenderId: 0, attackerLoss: 1, defenderLoss: 2 } },
        deltalog: [{ action: { type: 'MAKE_MOVE', payload: { type: 'dropIn', playerID: '2', args: [7, 2, 0] } } }] }
    const { container } = render(<HistoryAction action={describeAction(state)} round={4} />)
    expect(container.querySelectorAll('.r1-effect-chip[data-tone="bad"]')).toHaveLength(2)
    expect(container.querySelector('.r1-history-card-art')).not.toBeInTheDocument()
    expect(container).toHaveTextContent('−1 own')
    expect(container).toHaveTextContent('−2 target')
})


test('adaptive history shows contiguous numbers while retaining exact destination IDs', () => {
    const activeCellIds = [1, 2, 5, 8, 9, 12, 15, 16, 19, 22, 23, 26, 29, 30, 33, 36, 37, 40, 43, 44, 47, 50, 51]
    const previous = { G: { activeCellIds }, ctx: { currentPlayer: '0' } }
    const state = { G: { activeCellIds, players: { 0: { cellPosition: 12 } } }, deltalog: [{ action: { type: 'MAKE_MOVE', payload: { type: 'quickManeuver', playerID: '0', args: [8] } } }] }
    const action = describeAction(state, previous)
    expect(action.details).toEqual([{ kind: 'hex', id: 8, landed: false }, { kind: 'hex', id: 12, landed: true }])
    expect(describe(state, previous)).toBe('P1 · Move · Hex 4 · Landed Hex 6')
    const { container } = render(<HistoryAction action={action} round={1} activeCellIds={activeCellIds} />)
    expect(Array.from(container.querySelectorAll('.r1-hex-badge'), node => node.textContent)).toEqual(['4', '6'])
})

test('preserves 2D and 3D across history preview, view switching, return and fork', () => {
    render(<LocalHistoryGame numPlayers={2} />)
    const mode = () => screen.getByTestId('view-mode')
    const state = () => screen.getByTestId('state').textContent
    const switchTo = (view) => fireEvent.click(screen.getByRole('button', { name: 'Switch to ' + view + ' view' }))
    const initial = state()
    expect(mode()).toHaveTextContent('3d')
    switchTo('2D')
    fireEvent.click(screen.getAllByRole('button', { name: /^Move \d/ })[0])
    const live = state()
    expect(live).not.toBe(initial)
    fireEvent.click(screen.getByRole('button', { name: /History/ }))
    const history = screen.getByRole('complementary', { name: 'Match history' })
    const previewInitial = () => fireEvent.click(within(history).getByRole('button', { name: /Match started/ }))
    previewInitial()
    expect(mode()).toHaveTextContent('2d')
    expect(state()).toBe(initial)
    switchTo('3D')
    expect(mode()).toHaveTextContent('3d')
    expect(state()).toBe(initial)
    fireEvent.click(screen.getAllByRole('button', { name: /^Move \d/ })[0])
    expect(state()).toBe(initial)
    switchTo('2D')
    expect(state()).toBe(initial)
    fireEvent.click(screen.getByRole('button', { name: 'Back to game' }))
    expect(mode()).toHaveTextContent('2d')
    expect(state()).toBe(live)
    switchTo('3D')
    previewInitial()
    expect(mode()).toHaveTextContent('3d')
    switchTo('2D')
    fireEvent.click(screen.getByRole('button', { name: 'Play from here' }))
    expect(mode()).toHaveTextContent('2d')
    expect(state()).toBe(initial)
    expect(screen.getByLabelText('Timeline')).toHaveValue('1')
})
