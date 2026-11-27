import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
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
