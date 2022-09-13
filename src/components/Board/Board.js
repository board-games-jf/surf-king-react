import React, { useEffect } from "react";
import { SharkObstacle } from "../../game/Obstacle";
import { HexGrid } from '../HexGrid'
import SharkObstacleImage from '../../assets/shark400.png';
import { seaColor } from "../../constants/Colors";

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
        // TODO: Move this method to Game structure.

        // TODO: Check if the player who is playing can make the move.

        if (G.turn === 0) {
            const currentPlayer = +ctx.currentPlayer
            moves.movePiece(G.players[currentPlayer].cellPosition, cell.position)
        } else if (G.turn === 1) {
        }
    }

    const onHexClickedHandleMode2 = (cell) => {
        // TODO: Move this method to Game structure.

        // TODO: Check if the player who is playing can make the move.

        if (G.turn === 0) {
            moves.placeObstacule(cell.position, SharkObstacle)
        } else if (G.turn === 1) {
            const currentPlayer = +ctx.currentPlayer
            moves.movePiece(G.players[currentPlayer].cellPosition, cell.position)
        } else {
            // TODO: Implements
        }
    }

    return (
        <HexGrid cellProps={cellProps} renderCell={renderCell} onHexClick={onHexClickedHandle} />
    )
}

export default Board;