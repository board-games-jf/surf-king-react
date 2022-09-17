import { MOVE_DROP_IN, MOVE_MANEUVER } from "./SurfKingGame";

const hexClickAction_mode1 = (G, ctx, moves, cell) => {
    // TODO: Check if the player who is playing can make the move.
    if (G.currentMove === MOVE_MANEUVER) {
        return maneuver(G, ctx, moves, cell);
    } else if (G.currentMove === MOVE_DROP_IN) {
        return moves.attack(cell.position)
    }
}

const hexClickAction_mode2 = (G, ctx, cell) => {
    // TODO: Check if the player who is playing can make the move.
    // if (G.turn === 0) {
    //     moves.placeObstacule(cell.position, SharkObstacle)
    // } else if (G.turn === 1) {
    //     maneuver(G, ctx, moves, cell);
    // } else {
    //     // TODO: Implements
    // }
}

const maneuver = (G, ctx, moves, cell) => {
    const currentPlayer = ctx.currentPlayer
    const currentPlayerPosition = G.players[currentPlayer].cellPosition
    const nextPosition = cell.position;

    return moves.maneuver(currentPlayerPosition, nextPosition);
}

const actions = {
    1: hexClickAction_mode1,
    2: hexClickAction_mode2
};
export const HexClickAction = (G, ctx, moves, mode, cell) => {
    return actions[mode](G, ctx, moves, cell);
}

export const UseCardAction = (G, ctx, moves, mode, card, cardPos, args) => {
    return moves.useCard(cardPos, args);
}