import { CardStone } from "./Cards";

const hexClickAction_mode1 = (G, ctx, moves, cell) => {
    // TODO: Check if the player who is playing can make the move.
    if (ctx.phase === 'firt_move_piece' || ctx.phase === 'maneuver') {
        movePiece(G, ctx, moves, cell);
    }
}

const hexClickAction_mode2 = (G, ctx, cell) => {
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

    if (G.players[currentPlayer].energy === 0) {
        return false;
    }

    if (G.cells[nextPosition].player) {
        return false;
    }

    if (G.cells[nextPosition].obstacle?.Name === CardStone.Name) {
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
    1: hexClickAction_mode1,
    2: hexClickAction_mode2
};
export const HexClickAction = (G, ctx, moves, mode, cell) => {
    return actions[mode](G, ctx, moves, cell);
}

export const UseCardAction = (G, ctx, moves, mode, cardPos, args) => {
    // TODO: Validate
    return moves.useCard(cardPos, args);
}