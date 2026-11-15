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
