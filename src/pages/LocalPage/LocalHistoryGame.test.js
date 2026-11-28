import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import LocalHistoryGame, { restoreState } from './LocalHistoryGame'
import { Client } from 'boardgame.io/client'
import { SurfKingR1, setupR1 } from '../../game/r1/SurfKingR1'

jest.mock('../../components/Board/Board', () => {
    const React = require('react')
    const { r1MoveTargets } = require('../../game/r1/SurfKingR1')
    return ({ G, ctx, moves }) => (
        <div>
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
