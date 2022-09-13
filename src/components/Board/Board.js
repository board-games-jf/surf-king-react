import React, { useEffect } from "react";
import { SharkObstacle } from "../../game/Obstacle";
import { HexGrid } from '../HexGrid'
import SharkObstacleImage from '../../assets/shark400.png';
import { seaColor } from "../../constants/Colors";
import{ GameAction } from "../../game/Game";

const Board = ({ G, ctx, moves }) => {
    useEffect(() => {
        console.log("Board::useEffect G", G);
    }, [G])

    const cellProps = (position) => {
        const cell = G.cells[position];

        if (cell.player) {
            // TODO: Implement
        }

        if (cell.obstacle) {
            return { backgroundImage: SharkObstacleImage }
        }

        return { style: { fill: seaColor } }
    }

    const renderCell = (position) => {
        const cell = G.cells[position];

        if (cell.player) {
            return (
                <text
                    x="50%"
                    y="50%"
                    fontSize={80}
                    style={{ fill: "black" }}
                    textAnchor="middle"
                >
                    {`P-${cell.player.position + 1}`}
                </text>
            )
        }

        if (cell.obstacle) {
            return;
        }

        return (
            <text
                x="50%"
                y="50%"
                fontSize={80}
                style={{ fill: "white" }}
                textAnchor="middle"
            >
                {position}
            </text>
        )
    }

    const onHexClickedHandle = (cell) => {
        GameAction(G, ctx, moves, 1, cell);
    }

    return (
        <HexGrid cellProps={cellProps} renderCell={renderCell} onHexClick={onHexClickedHandle} />
    )
}

export default Board;