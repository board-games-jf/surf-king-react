import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import HexInspector from './HexInspector'
test('selecting an option is read-only until explicitly confirmed; Escape closes', () => {
    const confirm = jest.fn(), close = jest.fn()
    const props = { info: { id: 22, title: 'Open water', entry: 'No terrain penalty.', action: 'Move here.', occupants: [] },
        options: [{ key: 'move', kind: 'move', label: 'Move', cost: 'Free', detail: 'End turn after movement' }],
        blocks: [], placement: { left: 8, top: 8, width: 300, maxHeight: 400, side: 'right' }, onConfirm: confirm, onClose: close }
    render(<HexInspector {...props}/>)
    expect(screen.getByLabelText('0 of 2 spaces occupied')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Confirm move' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Move.*Free/ }))
    expect(confirm).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm move' }))
    expect(confirm).toHaveBeenCalledWith('move')
    fireEvent.keyDown(screen.getByLabelText('Hex information'), { key: 'Escape' })
    expect(close).toHaveBeenCalledTimes(1)
})

test('Drop In options identify each target with the shared player circle', () => {
    render(<HexInspector info={{ id: 7, title: 'Open water', entry: 'No terrain penalty.', action: 'Choose an action.', occupants: [] }} blocks={[]}
        options={[{ key: 'drop-1', kind: 'drop', playerId: 1, label: 'Drop In · Player 2', detail: 'Choose dice next' }]}
        placement={{ left: 8, top: 8, width: 300, maxHeight: 400, side: 'sheet' }} onConfirm={jest.fn()} onClose={jest.fn()}/>)
    const option = screen.getByRole('button', { name: /Drop In · Player 2/ })
    expect(option.querySelector('.r1-player-avatar')).toHaveTextContent('2')
    expect(within(option).queryByText(/Player 2/)).not.toBeInTheDocument()
})
