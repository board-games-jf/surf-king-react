import { TurnOrder } from 'boardgame.io/core'
import { CardAmulet, CardEnergy, CardEnergyX2, CardEnergyX3 } from "./Card.js";
import { SharkObstacle } from "./Obstacle.js";

// TODO: Move to other file
const Position_P1 = 0;
const Position_P2 = 1;
const Position_P3 = 2;
const Position_P4 = 3;
const Position_P5 = 4;
const Position_P6 = 5;
const Position_P7 = 6;

export const GRID_SIZE = 53; // TODO: Move to other file

const createDeck = () => {
    const deck = [];

    const addCards = (card, quantity) => {
        for (let i = 0; i < quantity; i++) {
            deck.push(card);
        }
    }

    // Obstacles
    // TOOD: Fill up

    // Actions
    addCards(CardEnergy, 8)
    addCards(CardEnergyX2, 4)
    addCards(CardEnergyX3, 2)
    // TOOD: Fill up

    // Acessories
    addCards(CardAmulet, 1)

    const shuffled = deck
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    return shuffled;
}

const createPlayer = (position, cards) => {
    return { position, cards, played: false, shouldReceiveCard: false, cellPosition: -1, energy: 4, fellOffTheBoard: false }
}

const setup = () => {
    // TODO: Create the deck base on game mode
    const deck = createDeck();

    // TODO: each player will receive 2 random cards
    const initialCardsP1 = [deck.pop(), deck.pop()];
    const initialCardsP2 = [deck.pop(), deck.pop()];

    // TODO: Get number of players from session
    const players = {
        '0': createPlayer(Position_P1, initialCardsP1),
        '1': createPlayer(Position_P2, initialCardsP2),
    }

    let order = [Position_P1, Position_P2]
    // order = order.sort(() => Math.random() - 0.5) // TODO: Another mode?

    const cells = new Array(GRID_SIZE)

    // TODO: set player positions according to number of players.
    for (let i = 0; i < 2; ++i) {
        players[order[i]].cellPosition = i
        cells[i] = { position: i, obstacle: undefined, player: players[order[i]] }
    }

    cells[28] = { position: 28, obstacle: SharkObstacle, player: undefined }
    cells[29] = { position: 29, obstacle: SharkObstacle, player: undefined }
    cells[30] = { position: 30, obstacle: SharkObstacle, player: undefined }
    cells[31] = { position: 31, obstacle: SharkObstacle, player: undefined }
    for (let i = 0; i < GRID_SIZE; ++i) {
        if (!cells[i]) {
            cells[i] = { position: i, obstacle: undefined, player: undefined }
        }
    }

    const events = []

    return { cells, players, events, turn: 0, order, deck }
}

const placeObstacule = (G, ctx, position, obstacle) => {
    // TODO: Validate
    G.cells[position].obstacle = obstacle
    G.players[ctx.currentPlayer].played = true
}

const attack = (G, ctx, targetPosition) => {
    // TODO: Implement

    // TODO: Validate moviment or trigger action
    G.players[ctx.currentPlayer].shouldReceiveCard = true
    G.players[ctx.currentPlayer].played = true
}

const movePiece = (G, ctx, from, to) => {
    // TODO: Validate moviment or trigger action
    G.cells[to].player = G.cells[from].player
    G.cells[from].player = undefined
    G.players[ctx.currentPlayer].cellPosition = to
    G.players[ctx.currentPlayer].energy--
    G.players[ctx.currentPlayer].shouldReceiveCard = true
    G.players[ctx.currentPlayer].played = true
}

const useCard = (G, ctx, cardPos) => {
    // TODO: Validate moviment or trigger action
    const currentPlayer = G.players[ctx.currentPlayer]
    if (!!currentPlayer) {
        return
    }

    const card = currentPlayer.cards[cardPos]
    currentPlayer.cards.splice(cardPos, 1)

    // TODO: Implement card action
    console.log("useCard:", currentPlayer, card);

    G.players[ctx.currentPlayer].shouldReceiveCard = true

    if (!currentPlayer.played && ctx.numMoves === 1) {
        skip(G, ctx);
    }
}

const getCard = (G, ctx) => {
    const card = G.deck.pop()
    G.players[ctx.currentPlayer].cards.push(card)
    G.players[ctx.currentPlayer].shouldReceiveCard = false
    G.players[ctx.currentPlayer].played = true
}

const skip = (G, ctx) => {
    G.players[ctx.currentPlayer].played = true
    ctx.events.endTurn();
}

const resetPlayerPlayed = (G) => {
    Object['values'](G.players).forEach((p) => (p.played = false))
}

const onEndPhase = (G) => {
    resetPlayerPlayed(G)
    ++G.turn
}

const getNextPhaseAfterUseCard = (G, ctx) => {
    return G.players[ctx.currentPlayer].fellOffTheBoard ? 'to_get_on_the_board' : 'to_drop_in'
}

const getNextPhaseAfterManeuver = (G, ctx) => {
    return G.players[ctx.currentPlayer].shouldReceiveCard ? 'receive_card' : 'use_card'
}

const everyonePlay = (G) => {
    return Object['values'](G.players).every((p) => p.played === true)
}

const endIf = (G) => {
    // A player wins if he arrives at one of the cells: 50, 51, 52, or 53.
    for (let i = 50; i <= 53; ++i) {
        const cell = G.cells[i - 1]
        if (cell) {
            const player = cell.player
            if (player) {
                return { winner: player }
            }
        }
    }
}

export const SurfKingGame = {
    name: 'SurfKing',

    setup: setup,

    turn: { order: TurnOrder.CUSTOM_FROM('order') },

    phases: {
        firt_move_piece: {
            moves: { movePiece },
            turn: { maxMoves: 1 },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'receive_card',
            start: true,
        },
        use_card: {
            moves: { useCard, skip },
            turn: { maxMoves: 2 },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: getNextPhaseAfterUseCard,
        },
        to_get_on_the_board: {
            moves: { skip },
            turn: { maxMoves: 1 },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'to_drop_in',
        },
        to_drop_in: {
            moves: { attack, skip },
            turn: { maxMoves: 1 },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'maneuver',
        },
        maneuver: {
            moves: { movePiece, skip },
            turn: { maxMoves: 1 },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: getNextPhaseAfterManeuver,
        },
        receive_card: {
            moves: { getCard },
            turn: { maxMoves: 1 },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'use_card',
        },
    },

    minPlayers: 2,
    maxPlayers: 4,

    disableUndo: true,

    endIf: endIf,
}

// export const SurfKingGameMode2 = {
//     name: 'SurfKing',

//     setup: setup,

//     turn: { order: TurnOrder.CUSTOM_FROM('order') },

//     phases: {
//         place_first_obstacule: {
//             moves: { placeObstacule },
//             turn: { moveLimit: 1 },
//             onEnd: phasePlaceFirstObstaculeOnEnd,
//             endIf: everyonePlay,
//             next: 'firt_move_piece',
//             start: true,
//         },
//         firt_move_piece: {
//             moves: { movePiece },
//             turn: { moveLimit: 1 },
//             onEnd: phaseFirstMoveOnEnd,
//             endIf: everyonePlay,
//             next: 'play',
//         },
//         play: {
//             moves: {},
//             next: 'check',
//         },
//         check: {
//             moves: {},
//             next: 'play',
//         },
//     },

//     minPlayers: 2,
//     maxPlayers: 4,

//     endIf: endIf,
// }