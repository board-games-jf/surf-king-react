import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core'
import { MOVE_BACKWARD, MOVE_BACKWARD_LEFT, MOVE_BACKWARD_RIGHT, MOVE_FORWARD, MOVE_FORWARD_LEFT, MOVE_FORWARD_RIGHT } from './Board';
import { CardAmulet, CardBigWave, CardBottledWater, CardChange, CardCoconut, CardCyclone, CardEnergy, CardEnergyX2, CardEnergyX3, CardHangLoose, CardIsland, CardJumping, CardLifeGuardFloat, CardShark, CardStone, CardStorm, CardSunburn, CardSwimmingFin, CardTsunami } from "./Cards";

const MAX_ENERGY = 4;
const GRID_SIZE = 53;

// TODO: Get number of players from session
export const NUMBER_OF_PLAYERS = 2;

/********************************************************************************/
// Auxiliary functions
/********************************************************************************/
const applyEnergyToLose = (G, player, energyToLose) => {
    player.energy = Math.min(Math.max(player.energy - energyToLose, 0), MAX_ENERGY);
    if (player.energy === 0) {
        player.toFellOffTheBoard = G.turn;
    }
};

const changePlayer = (G, ctx, targetCellPosition, card) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    const currentPlayerCellPosition = currentPlayer.cellPosition;
    const targetPlayer = G.players[G.cells[targetCellPosition].player.position];

    if (card && isPlayerWearingAmulet(targetPlayer)) {
        return false;
    }

    let energyToLose = 0;
    const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, targetCellPosition, energyToLose);
    targetCellPosition = newTo;
    energyToLose = newEnergyToLose;

    applyEnergyToLose(G, currentPlayer, energyToLose);

    currentPlayer.cellPosition = targetCellPosition;
    targetPlayer.cellPosition = currentPlayerCellPosition;

    G.cells[currentPlayerCellPosition].player = targetPlayer;
    G.cells[targetCellPosition].player = currentPlayer;

    return true
}

const checkAndProcessAnyObstacle = (G, ctx, to, energyToLose) => {
    // TODO: Create unit test.

    switch (G.cells[to].obstacle?.Name) {
        case CardCyclone.Name:
            const dice = rollDice();
            const newPos = [MOVE_FORWARD, MOVE_FORWARD_RIGHT, MOVE_BACKWARD_LEFT, MOVE_BACKWARD, MOVE_BACKWARD_RIGHT, MOVE_FORWARD_LEFT];
            let occupied = true;
            while (occupied) {
                // TODO: Check when "To" is negative.
                // while (to - newPos[dice] < 0) {
                //     dice = Math.floor(Math.random() * 6);
                // }
                to += newPos[dice];
                occupied = (G.cells[to].player && G.cells[to].player.position !== G.players[ctx.currentPlayer].position) ||
                    (G.cells[to].obstacle?.Name === CardStone.Name);
            }
            return checkAndProcessAnyObstacle(G, ctx, to, energyToLose);
        case CardIsland.Name:
            energyToLose -= 2;
            break;
        case CardStorm.Name:
            ++energyToLose;
            break;
        case CardShark.Name:
            energyToLose += 2;
            break;
        default:
            break;
    }

    return { newTo: to, newEnergyToLose: energyToLose }
}

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
    // addCards(CardShark, 4) // NOTE: Already on board.

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
    return { position, cards, played: false, shouldReceiveCard: false, cellPosition: -1, energy: 4, toFellOffTheBoard: -1, activeCard: [] }
}

const decreasePlayerEnergy = (G, ctx, position, card) => {
    const targetPlayer = G.players[G.cells[position].player.position];
    if (targetPlayer && ([CardBigWave.Name, CardSunburn.Name].includes(card.Name))) {
        if (isPlayerWearingAmulet(targetPlayer)) {
            return false
        }

        applyEnergyToLose(G, targetPlayer, 1);

        if (targetPlayer.energy === 0) {
            transferRandomCardFromPlayerToOtherOne(targetPlayer, G.players[ctx.currentPlayer]);
        }
    }

    return true
}

const decreaseTurnRemaningForActiveCards = (G, ctx, currentPlayerPosition) => {
    const currentPlayer = G.players[currentPlayerPosition];

    currentPlayer.activeCard.forEach(card => --card.TurnRemaning);
    currentPlayer.activeCard
        .filter(card => card.TurnRemaning === 0)
        .forEach(card => {
            const cardPos = currentPlayer.cards.findIndex(c => c.Name === card.Name);
            if (cardPos >= 0) {
                currentPlayer.cards.splice(cardPos, 1);
            }
        });

    currentPlayer.activeCard = currentPlayer.activeCard.filter(card => {
        return card.TurnRemaning > 0;
    });
}

const executeCardAction = (G, ctx, cardPos, args) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    const card = currentPlayer.cards[cardPos];

    let hasBeenUsed = true;
    let mustBeDiscarded = true;
    switch (card.Name) {
        case CardCyclone.Name:
        case CardIsland.Name:
        case CardStone.Name:
        case CardStorm.Name:
        case CardShark.Name:
            hasBeenUsed = placeObstacle(G, ctx, args[0], card)
            break;
        case CardBigWave.Name:
        case CardSunburn.Name:
            hasBeenUsed = decreasePlayerEnergy(G, ctx, args[0], card);
            break;
        case CardBottledWater.Name:
            currentPlayer.activeCard.push(card);
            break;
        case CardCoconut.Name:
        case CardEnergy.Name:
        case CardEnergyX2.Name:
        case CardEnergyX3.Name:
            hasBeenUsed = currentPlayer.energy > 0 && !isFallOfTheBoard(G, currentPlayer);
            if (hasBeenUsed) {
                increasePlayerEnergy(G, ctx, card);
            }
            break;
        case CardLifeGuardFloat.Name:
        case CardSwimmingFin.Name:
            hasBeenUsed = currentPlayer.energy === 0 && isFallOfTheBoard(G, currentPlayer);
            if (hasBeenUsed) {
                increasePlayerEnergy(G, ctx, card);
                currentPlayer.toFellOffTheBoard = -1;
            }
            break;
        case CardChange.Name:
            hasBeenUsed = changePlayer(G, ctx, args[0], card);
            break;
        case CardJumping.Name:
            hasBeenUsed = removeObstacle(G, ctx, args[0], card);
            break;
        case CardTsunami.Name:
            tsunami(G, ctx, args[0], card);
            break;
        case CardAmulet.Name:
        case CardHangLoose.Name:
            currentPlayer.activeCard.push({ ...card, TurnRemaning: 1 });
            mustBeDiscarded = false;
            break;
        default:
            break;
    }

    if (hasBeenUsed && mustBeDiscarded) {
        currentPlayer.cards.splice(cardPos, 1);
    }

    return hasBeenUsed;
}

const getDeckCard = (G) => G.deck.pop(); // TODO: Implenent when deck is empty.

const increasePlayerEnergy = (G, ctx, card) => {
    const currentPlayer = G.players[ctx.currentPlayer];

    switch (card.Name) {
        case CardCoconut.Name:
            currentPlayer.energy = MAX_ENERGY;
            break;
        case CardEnergy.Name:
            ++currentPlayer.energy;
            break;
        case CardEnergyX2.Name:
            currentPlayer.energy = Math.min(currentPlayer.energy + 2, MAX_ENERGY);
            break;
        case CardEnergyX3.Name:
            currentPlayer.energy = Math.min(currentPlayer.energy + 3, MAX_ENERGY);
            break;
        case CardLifeGuardFloat.Name:
            currentPlayer.energy = Math.min(currentPlayer.energy + 2, MAX_ENERGY);
            break;
        case CardSwimmingFin.Name:
            currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY);
            break;
        default:
            break;
    }
}

const isCloseTo = (a, b) => {
    return Math.abs(a - b) === MOVE_FORWARD || // Forward or Backward
        Math.abs(a - b) === MOVE_FORWARD_RIGHT || // Forward right or Backward right
        Math.abs(a - b) === MOVE_FORWARD_LEFT // Forward left or Backward left
}

const isFallOfTheBoard = (G, player) => player.toFellOffTheBoard > -1 && player.toFellOffTheBoard <= G.turn;

const isPlayerUsingHangLoose = (player) => player.activeCard.find(card => card.Name === CardHangLoose.Name);

const isPlayerWearingAmulet = (player) => player.activeCard.find(card => card.Name === CardAmulet.Name);

const movePlayer = (G, ctx, player, from, to, energyToLose) => {
    const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose);
    to = newTo;
    energyToLose = newEnergyToLose;

    if (to !== from) {
        G.cells[to].player = G.cells[from].player;
        G.cells[from].player = undefined;
    }

    player.cellPosition = to;

    applyEnergyToLose(G, player, energyToLose);

    return true;
}

const moveToNextHexUnoccupiedByTsunami = (G, ctx, playerPos, from, to) => {
    // TODO: Create unit test.

    // TODO: Check when "To" is negative.

    if (G.cells[to].player) {
        return moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to + MOVE_BACKWARD);
    }

    if (G.cells[to].obstacle?.Name === CardCyclone.Name) {
        const dice = rollDice();
        const newPos = [MOVE_FORWARD, MOVE_FORWARD_RIGHT, MOVE_BACKWARD_LEFT, MOVE_BACKWARD, MOVE_BACKWARD_RIGHT, MOVE_FORWARD_LEFT];
        let occupied = true;
        while (occupied) {
            // TODO: Check when "To" is negative.
            // while (to - newPos[dice] < 0) {
            //     dice = Math.floor(Math.random() * 6);
            // }
            to += newPos[dice];
            occupied = (G.cells[to].player && G.cells[to].player.position !== G.players[playerPos].position) ||
                (G.cells[to].obstacle?.Name === CardStone.Name);
        }
        return moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);
    }

    const targetPlayer = G.players[playerPos];
    if (isPlayerWearingAmulet(targetPlayer)) {
        return false;
    }

    return movePlayer(G, ctx, targetPlayer, from, to, 0);
}

const placeObstacle = (G, ctx, position, obstacle) => {
    if (!G.cells[position].player && !G.cells[position].obstacle) {
        G.cells[position].obstacle = obstacle;
        return true;
    }
    return false;
}

const removeObstacle = (G, ctx, position, obstacle) => {
    if (G.cells[position].obstacle) {
        G.cells[position].obstacle = undefined;
        return true;
    }
    return false;
}

const rollDice = () => Math.floor(Math.random() * 6)

const tsunami = (G, ctx, position, obstacle) => {
    if (G.cells[position].player) {
        moveToNextHexUnoccupiedByTsunami(G, ctx, G.cells[position].player.position, position, position + MOVE_BACKWARD);
    }

    for (let i = 0; i < 3; ++i) {
        position += MOVE_FORWARD_RIGHT;
        if (G.cells[position].player) {
            moveToNextHexUnoccupiedByTsunami(G, ctx, G.cells[position].player.position, position, position + MOVE_BACKWARD);
        }

        position += MOVE_BACKWARD_LEFT;
        if (G.cells[position].player) {
            moveToNextHexUnoccupiedByTsunami(G, ctx, G.cells[position].player.position, position, position + MOVE_BACKWARD);
        }
    }
}

/********************************************************************************/
// Moves
/********************************************************************************/
const useCard = (G, ctx, cardPos, args) => {
    // TODO: Validate moviment or trigger action
    const currentPlayer = G.players[ctx.currentPlayer];
    const card = currentPlayer.cards[cardPos];

    const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);
    console.log("useCard:", { hasBeenUsed, card: card.Name, args });
    if (!hasBeenUsed) {
        return INVALID_MOVE;
    }

    currentPlayer.shouldReceiveCard = true

    if (!currentPlayer.played && ctx.numMoves === 1) {
        pass(G, ctx);
    }
}

const transferRandomCardFromPlayerToOtherOne = (fromPlayer, toPlayer) => {
    const cardPos = Math.floor(Math.random() * fromPlayer.cards.length);
    const card = { ...fromPlayer.cards[cardPos] };
    fromPlayer.cards.splice(cardPos, 1);
    toPlayer.cards.push(card);
}

const attack = (G, ctx, targetCellPosition) => {
    if (!G.cells[targetCellPosition].player) {
        return INVALID_MOVE;
    }

    const currentPlayer = G.players[ctx.currentPlayer];
    const targetPlayer = G.players[G.cells[targetCellPosition].player.position];

    if (currentPlayer.energy === 0 ||
        targetPlayer.energy === 0 ||
        isPlayerWearingAmulet(targetPlayer) ||
        isPlayerUsingHangLoose(targetPlayer) ||
        !isCloseTo(currentPlayer.cellPosition, targetCellPosition)) {
        return INVALID_MOVE;
    }

    let atkLosses = 0;
    let defLosses = 0;
    G.atkDices = Array.from({ length: currentPlayer.energy }, () => rollDice()).sort().reverse();
    G.defDices = Array.from({ length: targetPlayer.energy }, () => rollDice()).sort().reverse();
    for (let i = 0; i < MAX_ENERGY; ++i) {
        if (i >= G.atkDices.length || i >= G.defDices.length) {
            break;
        }

        if (G.atkDices[i] > G.defDices[i]) { // atk win
            ++defLosses;
        } else { // def win
            ++atkLosses;
        }
    }

    currentPlayer.energy = Math.max(currentPlayer.energy - atkLosses, 0);
    if (currentPlayer.energy === 0) {
        currentPlayer.toFellOffTheBoard = G.turn;

        targetPlayer.cards.push(getDeckCard(G));
    }

    targetPlayer.energy = Math.max(targetPlayer.energy - defLosses, 0);
    if (targetPlayer.energy === 0) {
        targetPlayer.toFellOffTheBoard = G.turn;

        if (targetPlayer.cards.length > 0) {
            transferRandomCardFromPlayerToOtherOne(targetPlayer, currentPlayer);

            if (!changePlayer(G, ctx, targetPlayer.cellPosition, null)) {
                return INVALID_MOVE;
            }
        }
    }

    currentPlayer.shouldReceiveCard = true;
}

const movePiece = (G, ctx, from, to) => {
    const currentPlayer = G.players[ctx.currentPlayer];

    if (currentPlayer.energy === 0 ||
        isFallOfTheBoard(G, currentPlayer) ||
        (G.cells[to].player && !isFallOfTheBoard(G, G.players[G.cells[to].player.position])) ||
        G.cells[to].obstacle?.Name === CardStone.Name ||
        !isCloseTo(to, from)) {
        return INVALID_MOVE;
    }

    if (G.cells[to].player && isFallOfTheBoard(G, G.players[G.cells[to].player.position])) {
        if (!changePlayer(G, ctx, to, null)) {
            return INVALID_MOVE;
        }
        return;
    }

    let energyToLose = 1;
    const hasCardBottledWater = currentPlayer.activeCard.find(card => card.Name === CardBottledWater.Name);
    if (hasCardBottledWater) {
        energyToLose = 0;
        currentPlayer.activeCard = currentPlayer.activeCard.filter(card => {
            return card.Name !== CardBottledWater.Name;
        });
    }

    if (!movePlayer(G, ctx, currentPlayer, from, to, energyToLose)) {
        return INVALID_MOVE;
    }

    currentPlayer.shouldReceiveCard = true;
    currentPlayer.played = true;
}

const getCard = (G, ctx) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    if (currentPlayer.shouldReceiveCard) {
        const card = getDeckCard(G);
        currentPlayer.cards.push(card);
    }
    currentPlayer.shouldReceiveCard = false;
    currentPlayer.played = true;
}

const pass = (G, ctx) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    if (ctx.phase === 'maneuver' && !isFallOfTheBoard(G, currentPlayer)) {
        currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY);
    }

    if (ctx.phase === 'use_card') {
        if (isFallOfTheBoard(G, currentPlayer)) {
            ++currentPlayer.energy;
            currentPlayer.toFellOffTheBoard = -1;
        }
    }

    currentPlayer.played = true
    ctx.events.endTurn();
}

/********************************************************************************/
// Moves
/********************************************************************************/

const resetPlayerPlayed = (G) => {
    Object.values(G.players).forEach((p) => (p.played = false))
}

const onBeginUseCard = (G, ctx) => {
    // NOTE: currentPlayerPosition - Workaround. Check with boardgame.io why that.
    const currentPlayerPosition = (parseInt(ctx.currentPlayer) + 1) % NUMBER_OF_PLAYERS;
    decreaseTurnRemaningForActiveCards(G, ctx, currentPlayerPosition);
    ++G.turn;
}

const onEndPhase = (G) => {
    resetPlayerPlayed(G)
}

const everyonePlay = (G) => {
    return Object.values(G.players).every((p) => p.played === true)
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
// Setup
/********************************************************************************/

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
            moves: { useCard, pass },
            turn: { maxMoves: 2 },
            onBegin: onBeginUseCard,
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'to_drop_in',
        },
        to_drop_in: {
            moves: { attack, pass },
            turn: { maxMoves: MAX_ENERGY },
            onEnd: onEndPhase,
            endIf: everyonePlay,
            next: 'maneuver',
        },
        maneuver: {
            moves: { movePiece, pass },
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
