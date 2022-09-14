import { TurnOrder } from 'boardgame.io/core'
import { CardAmulet, CardBigWave, CardBottledWater, CardChange, CardCoconut, CardCyclone, CardEnergy, CardEnergyX2, CardEnergyX3, CardHangLoose, CardIsland, CardJumping, CardLifeGuardFloat, CardShark, CardStone, CardStorm, CardSunburn, CardSwimmingFin, CardTsunami } from "./Cards";

/********************************************************************************/
// Setup
/********************************************************************************/

const MAX_ENERGY = 4;
const GRID_SIZE = 53;

// TODO: Get number of players from session
export const NUMBER_OF_PLAYERS = 2;

const createDeck = () => {
    const deck = [];

    const addCards = (card, quantity) => {
        for (let i = 0; i < quantity; i++) {
            deck.push(card);
        }
    }

    // Obstacles
    addCards(CardCyclone, 4)
    addCards(CardIsland, 4)
    addCards(CardStone, 4)
    addCards(CardStorm, 4)

    // Actions
    addCards(CardBigWave, 4)
    addCards(CardBottledWater, 4)
    addCards(CardCoconut, 4)
    addCards(CardChange, 2)
    addCards(CardEnergy, 8)
    addCards(CardEnergyX2, 4)
    addCards(CardEnergyX3, 2)
    addCards(CardHangLoose, 1)
    addCards(CardJumping, 2)
    addCards(CardLifeGuardFloat, 4)
    addCards(CardSwimmingFin, 4)
    addCards(CardSunburn, 4)
    addCards(CardTsunami, 4)

    // Acessories
    addCards(CardAmulet, 1)

    const shuffled = deck
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    return shuffled;
}

const createPlayer = (position, cards) => {
    return { position, cards, played: false, shouldReceiveCard: false, cellPosition: -1, energy: 4, fellOffTheBoard: false, activeCard: null }
}

const placeObstacle = (G, ctx, position, obstacle) => {
    if (!G.cells[position].player && !G.cells[position].obstacle) {
        G.cells[position] = { position, obstacle, player: undefined }
    }
}

const setup = () => {
    const cells = new Array(GRID_SIZE);

    // TODO: Create the deck base on game mode
    const deck = createDeck();

    const players = {}
    for (let i = 0; i < NUMBER_OF_PLAYERS; ++i) {
        const initialCards = [deck.pop(), deck.pop()];
        players[i] = createPlayer(i, initialCards);
    }

    let order = Object.keys(players);
    // order = order.sort(() => Math.random() - 0.5) // TODO: Other mode?

    // TODO: set player positions according to number of players.
    for (let i = 0; i < NUMBER_OF_PLAYERS; ++i) {
        players[order[i]].cellPosition = i
        cells[i] = { position: i, obstacle: undefined, player: players[order[i]] }
    }

    cells[28] = { position: 28, obstacle: CardShark, player: undefined }
    cells[29] = { position: 29, obstacle: CardShark, player: undefined }
    cells[30] = { position: 30, obstacle: CardShark, player: undefined }
    cells[31] = { position: 31, obstacle: CardShark, player: undefined }
    for (let i = 0; i < GRID_SIZE; ++i) {
        if (!cells[i]) {
            cells[i] = { position: i, obstacle: undefined, player: undefined }
        }
    }

    const events = []

    return { cells, players, events, turn: 0, order, deck }
}

/********************************************************************************/
// Moves
/********************************************************************************/
const executeCardAction = (G, ctx, card, args) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    switch (card.Name) {
        // Obstacles
        case CardCyclone.Name:
            placeObstacle(G, ctx, args[0], card)
            break
        case CardIsland.Name:
            placeObstacle(G, ctx, args[0], card)
            break
        case CardStone.Name:
            placeObstacle(G, ctx, args[0], card)
            break
        case CardStorm.Name:
            placeObstacle(G, ctx, args[0], card)
            break
        case CardShark.Name:
            placeObstacle(G, ctx, args[0], card)
            break
        // Actions
        case CardBigWave.Name:
            // TODO: Implement
            break
        case CardBottledWater.Name:
            // TODO: Implement
            currentPlayer.activeCard = card;
            break
        case CardCoconut.Name:
            currentPlayer.energy = MAX_ENERGY;
            break
        case CardChange.Name:
            // TODO: Implement
            break
        case CardEnergy.Name:
            ++currentPlayer.energy;
            break;
        case CardEnergyX2.Name:
            currentPlayer.energy = Math.min(currentPlayer.energy + 2, MAX_ENERGY);
            break;
        case CardEnergyX3.Name:
            currentPlayer.energy = Math.min(currentPlayer.energy + 3, MAX_ENERGY);
            break;
        case CardHangLoose.Name:
            // TODO: Implement
            break
        case CardJumping.Name:
            // TODO: Implement
            break
        case CardLifeGuardFloat.Name:
            // TODO: Implement
            break
        case CardSwimmingFin.Name:
            // TODO: Implement
            break
        case CardSunburn.Name:
            // TODO: Implement
            break
        case CardTsunami.Name:
            // TODO: Implement
            break
        // Acessories
        case CardAmulet.Name:
            break;
        default:
            break;
    }
}

const useCard = (G, ctx, cardPos, args) => {
    // TODO: Validate moviment or trigger action
    const currentPlayer = G.players[ctx.currentPlayer]
    const card = currentPlayer.cards[cardPos]
    currentPlayer.cards.splice(cardPos, 1)

    console.log("useCard:", { cardPos, args, cardName: card.Name });
    executeCardAction(G, ctx, card, args);

    currentPlayer.shouldReceiveCard = true

    if (!currentPlayer.played && ctx.numMoves === 1) {
        skip(G, ctx);
    }
}

const toGetOnTheBoard = (G, ctx, playerPos) => {
    // TODO: Implement
    skip(G, ctx)
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

    const currentPlayer = G.players[ctx.currentPlayer];
    let energyToLose = 1;
    if (currentPlayer.activeCard && currentPlayer.activeCard.Name === CardBottledWater.Name) {
        energyToLose = 0;
        currentPlayer.activeCard = null;
    }
    currentPlayer.energy = Math.max(currentPlayer.energy - energyToLose, 0);
    currentPlayer.cellPosition = to
    currentPlayer.shouldReceiveCard = true
    currentPlayer.played = true
}

const getCard = (G, ctx) => {
    if (G.players[ctx.currentPlayer].shouldReceiveCard) {
        const card = G.deck.pop()
        G.players[ctx.currentPlayer].cards.push(card)
    }
    G.players[ctx.currentPlayer].shouldReceiveCard = false
    G.players[ctx.currentPlayer].played = true
}

const skip = (G, ctx) => {
    if (ctx.phase === 'maneuver') {
        ++G.players[ctx.currentPlayer].energy;
    }

    G.players[ctx.currentPlayer].played = true
    ctx.events.endTurn();
}

/********************************************************************************/
// Moves
/********************************************************************************/

const resetPlayerPlayed = (G) => {
    Object['values'](G.players).forEach((p) => (p.played = false))
}

const onEndPhase = (G) => {
    resetPlayerPlayed(G)
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

/********************************************************************************/
// Board
/********************************************************************************/

export const SurfKingGame = {
    name: 'SurfKing',

    setup: setup,

    // moves: {
    //     A: (G, ctx, ...args) => {},
    // },

    turn: {
        order: TurnOrder.CUSTOM_FROM('order'),
        maxMoves: 1,
    },

    phases: {
        firt_move_piece: {
            moves: { movePiece },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'receive_card',
            start: true,
        },
        use_card: {
            moves: { useCard, skip },
            turn: { maxMoves: 2 },
            onBegin: (G, ctx) => { ++G.turn },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'to_get_on_the_board',
        },
        to_get_on_the_board: {
            moves: { toGetOnTheBoard, skip },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'to_drop_in',
        },
        to_drop_in: {
            moves: { attack, skip },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'maneuver',
        },
        maneuver: {
            moves: { movePiece, skip },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'receive_card',
        },
        receive_card: {
            moves: { getCard },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'use_card',
        },
    },

    minPlayers: 2,
    maxPlayers: 7,

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
//     maxPlayers: 7,

//     endIf: endIf,
// }