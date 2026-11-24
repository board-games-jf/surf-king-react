import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import HexGrid from './HexGrid'
import { BOARD_LAYOUT } from '../../map/layout/boardLayout'

test('draws all 53 cells at the shared board coordinates and forwards the original cell ID', () => {
    const onHexClick = jest.fn()
    const { container } = render(
        <HexGrid cellProps={() => ({})} renderCell={() => null} onHexClick={onHexClick} />
    )

    const cells = container.querySelectorAll('g')
    expect(cells).toHaveLength(53)
    BOARD_LAYOUT.forEach(({ id, x, z }) => {
        expect(cells[id].getAttribute('transform')).toBe(`translate(${x} ${z})`)
    })
    fireEvent.click(cells[7].querySelector('polygon'))
    expect(onHexClick).toHaveBeenCalledWith({ position: 7 })
})

test('draws noninteractive inset highlights without changing original cell click IDs', () => {
    const onHexClick = jest.fn()
    const props = { renderCell: () => null, onHexClick }
    const { container, rerender } = render(<HexGrid {...props} cellProps={id => ({
        highlight: [7, 14].includes(id) ? { kind: 'move', color: '#9bf4d4', preview: true } : null,
    })} />)
    const overlays = container.querySelectorAll('[data-target-highlight="move"]')
    expect(overlays).toHaveLength(2)
    expect(overlays[0]).toHaveAttribute('pointer-events', 'none')
    expect(overlays[0]).toHaveAttribute('data-target-preview', 'true')
    fireEvent.click(overlays[0].parentElement.querySelector('polygon'))
    expect(onHexClick).toHaveBeenCalledWith({ position: 7 })
    rerender(<HexGrid {...props} cellProps={id => ({
        highlight: id === 14 ? { kind: 'attack', color: '#ff9882', preview: false } : null,
    })} />)
    expect(container.querySelectorAll('[data-target-highlight="move"]')).toHaveLength(0)
    expect(container.querySelectorAll('[data-target-highlight="attack"]')).toHaveLength(1)
})
