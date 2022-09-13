import React, { useState } from "react";
import { strokeWidth } from "../../constants/Hex";
import Hex from "../Hex/Hex";
import { Wrapper, Row, defaultGridWidth, hexWidth } from "./HexGrid.style";

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

const hexCoordToPosition = (coord) => {
  const n = [0, 2, 4, 6, 1, 3, 5];
  const i = n.indexOf(parseInt(coord.split(",")[0]));
  const j = parseInt(coord.split(",")[1])
  return i + (j * 7)
}

const HexGrid = (props) => {
  const [gridWidth] = useState(defaultGridWidth);

  const buildRow = (hexesPerRow, index) => {
    const even = (index / hexesPerRow) % 2 === 0;
    const sliceEnd = even ? hexesPerRow : hexesPerRow - 1;
    return hexes.slice(index, index + sliceEnd);
  }

  const getRows = (hexes) => {
    const hexesPerRow = Math.floor(
      gridWidth / (hexWidth + strokeWidth)
    );
    const rows = hexes.map((_, index) =>
      index % hexesPerRow === 0 ? buildRow(hexesPerRow, index) : null
    );
    return rows.filter((item) => item);
  }

  const hexes = new Array(56).fill(0);
  const rows = getRows(hexes);

  return (
    <Wrapper innerRef={elem => props.getRef(elem)}>
      {rows.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {row.map((_, colIndex) => (
            <Hex
              key={colIndex}
              coord={`${rowIndex},${colIndex}`}
              position={hexCoordToPosition(`${rowIndex},${colIndex}`)}
              onClick={() => props.onHexagonClick({ position: hexCoordToPosition(`${rowIndex},${colIndex}`) })}
            >
              <text
                x="50%"
                y="50%"
                fontSize={80}
                style={{ fill: "white" }}
                textAnchor="middle"
              >
                {`${hexCoordToPosition(`${rowIndex},${colIndex}`)}=${rowIndex},${colIndex}`}
              </text>
            </Hex>
          ))}
        </Row>
      ))}
    </Wrapper>
  );
};

export default HexGrid;
