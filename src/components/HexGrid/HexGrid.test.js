import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import HexGrid from './HexGrid'
import { BOARD_LAYOUT } from '../../map/layout/boardLayout'

test('draws all 53 cells at the shared board coordinates and forwards the original cell ID', () => {
    const onHexClick = jest.fn()
    const { container } = render(
        <HexGrid cellProps={() => ({})} renderCell={() => null} onHexClick={onHexClick} />
    )

    const cells = container.querySelectorAll('svg > g')
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

test('renders highlighted hexes behind the surfer', () => {
    const { container } = render(<HexGrid onHexClick={jest.fn()}
        cellProps={id => id === 7 ? { highlight: { kind: 'move', color: '#9bf4d4' }, attackHighlight: { color: '#ff9882' } } : {}}
        renderCell={id => id === 7 ? <circle data-surfer="true" r="10"/> : null} />)
    const highlights = container.querySelectorAll('[data-target-highlight]')
    const surfer = container.querySelector('[data-surfer="true"]')
    expect(highlights).toHaveLength(2)
    highlights.forEach(layer => {
        expect(layer).toHaveAttribute('pointer-events', 'none')
        expect(layer.compareDocumentPosition(surfer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })
})

test('hover and leave forward exact IDs independently of clicks', () => {
    const onHexHover = jest.fn()
    const onHexClick = jest.fn()
    const { container } = render(<HexGrid cellProps={() => ({})} renderCell={() => null}
        onHexClick={onHexClick} onHexHover={onHexHover} inspectedCellId={7} />)
    const hex = container.querySelector('[data-cell-id="7"]')
    expect(hex).toHaveAttribute('data-inspected', 'true')
    fireEvent.mouseEnter(hex)
    expect(onHexHover).toHaveBeenLastCalledWith(7)
    expect(onHexClick).not.toHaveBeenCalled()
    fireEvent.mouseLeave(hex)
    expect(onHexHover).toHaveBeenLastCalledWith(null)
    fireEvent.click(hex)
    expect(onHexClick).toHaveBeenCalledWith({ position: 7 })
})

test('blocked hex icons are noninteractive and separate from valid highlights', () => {
    const onHexClick = jest.fn()
    const { container } = render(<HexGrid renderCell={() => null} onHexClick={onHexClick}
        cellProps={id => ({ blocked: id === 1 ? { code: 'minimum', symbol: 'one', color: '#ffcc82', label: '1 energy · Drop In only' } : null })}/>)
    const blocked = container.querySelector('[data-target-blocked="minimum"]')
    expect(blocked).toHaveAttribute('pointer-events', 'none')
    expect(blocked.parentElement.querySelector('svg[aria-label="1 energy · Drop In only"]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-target-highlight]')).toHaveLength(0)
    fireEvent.click(container.querySelector('[data-cell-id="1"]'))
    expect(onHexClick).toHaveBeenCalledWith({ position: 1 })
})

test('individual opponent labels replace duplicate ambiguous cell glyphs', () => {
    const { container } = render(<HexGrid renderCell={() => null} onHexClick={jest.fn()}
        cellProps={id => ({ blocked: id === 1 ? { playerId: 0, code: 'minimum', symbol: 'one', color: '#ffcc82', label: '1 energy · Drop In only' } : null })}/>)
    const blocked = container.querySelector('[data-target-blocked="minimum"]')
    expect(blocked).toBeInTheDocument()
    expect(blocked.parentElement.querySelector('svg[aria-label="1 energy · Drop In only"]')).not.toBeInTheDocument()
})
