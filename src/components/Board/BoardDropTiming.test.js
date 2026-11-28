import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import Board from './Board'
import { setupR1 } from '../../game/r1/SurfKingR1'

jest.mock('../../map/views/Board3D/Board3D', () => ({ viewToggle }) => <div data-testid="board-3d">{viewToggle}</div>)
jest.mock('../HexGrid', () => ({ HexGrid: () => <div data-testid="board-2d" /> }))
jest.mock('./R1Controls', () => ({ rollingDrop, onRepeatDrop }) => (
    <div>
        <button onClick={() => onRepeatDrop(4, 1, 1)}>Repeat test attack</button>
        {rollingDrop && <span>Rolling test dice</span>}
    </div>
))

test('Drop In effects wait until the dice animation finishes', () => {
    jest.useFakeTimers()
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: (xs) => xs.slice() } }
    const G = setupR1(ctx)
    const moves = { dropIn: jest.fn() }
    const { unmount } = render(<Board G={G} ctx={ctx} moves={moves} />)
    fireEvent.click(screen.getByRole('button', { name: 'Repeat test attack' }))
    expect(screen.getByText('Rolling test dice')).toBeInTheDocument()
    act(() => jest.advanceTimersByTime(1099))
    expect(moves.dropIn).not.toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(1))
    expect(moves.dropIn).toHaveBeenCalledWith(4, 1, 1)
    expect(screen.queryByText('Rolling test dice')).not.toBeInTheDocument()
    unmount()
    jest.useRealTimers()
})

test('a pending roll is cancelled if the match changes before it resolves', () => {
    jest.useFakeTimers()
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: (xs) => xs.slice() } }
    const G = setupR1(ctx)
    const moves = { dropIn: jest.fn() }
    const { rerender, unmount } = render(<Board G={G} ctx={ctx} moves={moves} />)
    fireEvent.click(screen.getByRole('button', { name: 'Repeat test attack' }))
    rerender(<Board G={{ ...G }} ctx={ctx} moves={moves} />)
    act(() => jest.advanceTimersByTime(1100))
    expect(moves.dropIn).not.toHaveBeenCalled()
    expect(screen.queryByText('Rolling test dice')).not.toBeInTheDocument()
    unmount()
    jest.useRealTimers()
})


test('Board supports a controlled view and reuses the existing view buttons', () => {
    const ctx = { numPlayers: 2, currentPlayer: '0', random: { Number: () => 0, Shuffle: (xs) => xs.slice() } }
    const G = setupR1(ctx)
    const moves = { dropIn: jest.fn() }
    const onViewModeChange = jest.fn()
    const props = { G, ctx, moves, onViewModeChange }
    const { rerender } = render(<Board {...props} viewMode="2d" />)
    expect(screen.getByTestId('board-2d')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to 3D view' }))
    expect(onViewModeChange).toHaveBeenLastCalledWith('3d')
    rerender(<Board {...props} viewMode="3d" />)
    expect(screen.getByTestId('board-3d')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Switch to 2D view' }))
    expect(onViewModeChange).toHaveBeenLastCalledWith('2d')
    expect(moves.dropIn).not.toHaveBeenCalled()
})
