import React from "react";
import { SharkObstacle } from "../../game/Obstacle";
import { HexGrid } from '../HexGrid'

const Board = ({ G, ctx, moves }) => {

    const onHexagonClickedHandle = (cell) => {
        // TODO: Check if the player who is playing can make the move.
        console.log("onHexagonClickedHandle", cell, G, ctx)
        if (G.turn === 0) {
            moves.placeObstacule(cell.position, SharkObstacle)
        } else if (G.turn === 1) {
            const currentPlayer = +ctx.currentPlayer
            console.log("onHexagonClickedHandle", currentPlayer);
            moves.movePiece(G.players[currentPlayer].cellPosition, cell.position)
        } else {
            // TODO: Implements
        }
    }

    return (
        <HexGrid onHexagonClick={onHexagonClickedHandle} />
    )
}

export default Board;