import React, { useState } from 'react'
import { strokeWidth, Hex } from '../Hex'
import { Wrapper, Row, defaultGridWidth, hexWidth } from './HexGrid.style'

// TODO: Move to a helper file
// const positionToHexCoords = () => {
//   const coords = [];
//   const n = [0, 2, 4, 6, 1, 3, 5];
//   let j = 0;
//   for (let i = 0; i < 53; i++) {
//     coords.push(n[i % 7] + "," + j)
//     if ((i + 1) % 7 === 0) {
//       j++
//     }
//   }
//   return coords
// }

// TODO: Move to a helper file
const hexCoordToPosition = (coord) => {
    const n = [0, 2, 4, 6, 1, 3, 5]
    const i = n.indexOf(parseInt(coord.split(',')[0]))
    const j = parseInt(coord.split(',')[1])
    return i + j * 7
}

const HexGrid = (props) => {
    const [gridWidth] = useState(defaultGridWidth)

    const buildRow = (hexesPerRow, index) => {
        const even = (index / hexesPerRow) % 2 === 0
        const sliceEnd = even ? hexesPerRow : hexesPerRow - 1
        return hexes.slice(index, index + sliceEnd)
    }

    const getRows = (hexes) => {
        const hexesPerRow = Math.floor(gridWidth / (hexWidth + strokeWidth))
        const rows = hexes.map((_, index) => (index % hexesPerRow === 0 ? buildRow(hexesPerRow, index) : null))
        return rows.filter((item) => item)
    }

    const hexes = new Array(56).fill(0)
    const rows = getRows(hexes)

    return (
        <Wrapper innerRef={(elem) => props.getRef(elem)}>
            {rows.map((row, rowIndex) => (
                <Row key={rowIndex}>
                    {row.map((_, colIndex) => (
                        <Hex
                            key={colIndex}
                            onClick={() =>
                                props.onHexClick({ position: hexCoordToPosition(`${rowIndex},${colIndex}`) })
                            }
                            {...props.cellProps(hexCoordToPosition(`${rowIndex},${colIndex}`))}
                        >
                            {props.renderCell(hexCoordToPosition(`${rowIndex},${colIndex}`))}
                        </Hex>
                    ))}
                </Row>
            ))}
        </Wrapper>
    )
}

export default HexGrid
