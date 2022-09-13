const mode1_Action = (G, ctx, moves, cell) => {
    // TODO: Check if the player who is playing can make the move.
    if (G.turn === 0) {
        movePiece(G, ctx, moves, cell);
    } else if (G.turn === 1) {
    }
}

const mode2_Action = (G, ctx, cell) => {
    // TODO: Check if the player who is playing can make the move.
    // if (G.turn === 0) {
    //     moves.placeObstacule(cell.position, SharkObstacle)
    // } else if (G.turn === 1) {
    //     movePiece(G, ctx, moves, cell);
    // } else {
    //     // TODO: Implements
    // }
}

const movePiece = (G, ctx, moves, cell) => {
    const currentPlayer = +ctx.currentPlayer
    const currentPlayerPosition = G.players[currentPlayer].cellPosition
    const nextPosition = cell.position;

    if (G.cells[nextPosition].player) {
        return false;
    }

    if (Math.abs(nextPosition - currentPlayerPosition) === 7 || // Forward or Backward
        Math.abs(nextPosition - currentPlayerPosition) === 4 || // Forward right or Backward right
        Math.abs(nextPosition - currentPlayerPosition) === 3) { // Forward left or Backward left
        moves.movePiece(currentPlayerPosition, nextPosition);
        return true
    }

    return false;
}

const actions = {
    1: mode1_Action,
    2: mode2_Action
};
export const GameAction = (G, ctx, moves, mode, cell) => {
    return actions[mode](G, ctx, moves, cell)
}