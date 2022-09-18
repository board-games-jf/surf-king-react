import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core';
import _ from 'lodash';
import { MOVE_BACKWARD, MOVE_BACKWARD_LEFT, MOVE_BACKWARD_RIGHT, MOVE_FORWARD, MOVE_FORWARD_LEFT, MOVE_FORWARD_RIGHT } from './Board';
import { CardAmulet, CardBigWave, CardBottledWater, CardCategoryObstacle, CardChange, CardCoconut, CardCyclone, CardEnergy, CardEnergyX2, CardEnergyX3, CardHangLoose, CardIsland, CardJumping, CardLifeGuardFloat, CardShark, CardStone, CardStorm, CardSunburn, CardSwimmingFin, CardTsunami } from "./Cards";

export const MAX_ENERGY = 4;
export const MAX_CARDS_ON_HAND = 5;
export const GRID_SIZE = 53;

// TODO: Get number of players from session
export const NUMBER_OF_PLAYERS = 2;

export const MOVE_USE_CARD = 'use_card';
export const MOVE_DROP_IN = 'drop_in';
export const MOVE_MANEUVER = 'maneuver';

/********************************************************************************/
// Auxiliary functions
/********************************************************************************/
export const applyEnergyToLose = (G, ctx, player, energyToLose) => {
    player.energy = Math.min(Math.max(player.energy - energyToLose, 0), MAX_ENERGY);
    if (player.energy === 0) {
        player.toFellOffTheBoard = getTurn(G, ctx);
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

    applyEnergyToLose(G, ctx, currentPlayer, energyToLose);

    currentPlayer.cellPosition = targetCellPosition;
    targetPlayer.cellPosition = currentPlayerCellPosition;

    G.cells[currentPlayerCellPosition].player = targetPlayer;
    G.cells[targetCellPosition].player = currentPlayer;

    return true
}

export const checkAndProcessAnyObstacle = (G, ctx, to, energyToLose) => {
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

export const createDeck = () => {
    const deck = [];

    const addCards = (card, quantity) => {
        for (let i = 0; i < quantity; i++) {
            deck.push(card);
        }
    }

    // Obstacles
    addCards(CardCyclone, 4);
    addCards(CardIsland, 4);
    addCards(CardStone, 4);
    addCards(CardStorm, 4);
    // addCards(CardShark, 0); // NOTE: The board already have 4 Sharks

    // Actions
    addCards(CardBigWave, 4);
    addCards(CardBottledWater, 4);
    addCards(CardCoconut, 4);
    addCards(CardChange, 2);
    addCards(CardEnergy, 8);
    addCards(CardEnergyX2, 4);
    addCards(CardEnergyX3, 2);
    addCards(CardHangLoose, 1);
    addCards(CardJumping, 2);
    addCards(CardLifeGuardFloat, 4);
    addCards(CardSwimmingFin, 4);
    addCards(CardSunburn, 4);
    addCards(CardTsunami, 4);

    // Acessories
    addCards(CardAmulet, 1);

    const shuffled = deck
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .map(value => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

    return shuffled;
}

export const createCell = (position, obstacle, player) => ({ position, obstacle, player });

export const createPlayer = (position, cards) => ({
    position,
    cards,
    played: false,
    shouldReceiveCard: false,
    blocked: false,
    energy: MAX_ENERGY,
    cellPosition: -1,
    toFellOffTheBoard: -1,
    activeCard: [],
})

export const decreasePlayerEnergyByCard = (G, ctx, cellPosition, card) => {
    const targetPlayer = G.players[G.cells[cellPosition].player?.position];
    if (targetPlayer && ([CardBigWave.Name, CardSunburn.Name].includes(card.Name))) {
        if (isPlayerWearingAmulet(targetPlayer)) {
            return false;
        }

        const energyToLose = card.Name === CardBigWave.Name ? 2 : 1
        applyEnergyToLose(G, ctx, targetPlayer, energyToLose);

        if (targetPlayer.energy === 0) {
            transferRandomCardFromPlayerToOtherOne(targetPlayer, G.players[ctx.currentPlayer]);
        }

        return true;
    }

    return false;
}

export const decreaseRemainingTurnForActiveCards = (G, ctx, playerPosition) => {
    const player = G.players[playerPosition];

    player.activeCard.forEach(card => --card.RemaningTurn);
    player.activeCard
        .filter(card => card.RemaningTurn === 0)
        .forEach(card => {
            const cardPos = player.cards.findIndex(c => c.Name === card.Name);
            if (cardPos >= 0) {
                const card = player.cards[cardPos];
                if (card.Category !== CardCategoryObstacle) {
                    G.discardedCards.push(card);
                } else {
                    G.cells[card.CellPosition].obstacle = undefined;
                }
                player.cards.splice(cardPos, 1);
            }
        });

    player.activeCard = player.activeCard.filter(card => card.RemaningTurn > 0);
}

export const discardCardsIfNeeded = (G, player, cardLimitOnHand) => {
    if (player.cards.length >= MAX_CARDS_ON_HAND) {
        let i = player.cards.length - cardLimitOnHand;
        while (i-- > 0) {
            const cardPos = Math.floor(Math.random() * player.cards.length);
            const card = player.cards[cardPos];
            if (card.Category !== CardCategoryObstacle) {
                G.discardedCards.push(card);
            }
            player.cards.splice(cardPos, 1);
        }
    }
}

export const executeCardAction = (G, ctx, cardPos, args) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    const card = currentPlayer.cards[cardPos];

    let hasBeenUsed = true;
    let mustBeDiscarded = true;
    switch (card.Name) {
        case CardStone.Name:
            const cellPosition = args[0];
            const hasCardBeenUsedBefore = currentPlayer.activeCard
                .find(ac => ac.Name === card.Name && ac.CellPosition === cellPosition && ac.RemaningTurn > 0)
            if (hasCardBeenUsedBefore) {
                hasBeenUsed = false;
            } else {
                hasBeenUsed = placeObstacle(G, ctx, cellPosition, card);
                if (hasBeenUsed) {
                    card.CellPosition = cellPosition;
                    currentPlayer.activeCard.push({ ...card, RemaningTurn: 3 });
                }
            }
            mustBeDiscarded = false;
            break;
        case CardCyclone.Name:
        case CardIsland.Name:
        case CardStorm.Name:
        case CardShark.Name:
            hasBeenUsed = placeObstacle(G, ctx, args[0], card);
            break;
        case CardBigWave.Name:
        case CardSunburn.Name:
            hasBeenUsed = decreasePlayerEnergyByCard(G, ctx, args[0], card);
            break;
        case CardBottledWater.Name:
            currentPlayer.activeCard.push(card);
            break;
        case CardCoconut.Name:
        case CardEnergy.Name:
        case CardEnergyX2.Name:
        case CardEnergyX3.Name:
            hasBeenUsed = currentPlayer.energy > 0 && !isFallOfTheBoard(getTurn(G, ctx), currentPlayer);
            if (hasBeenUsed) {
                increasePlayerEnergy(G, ctx, card);
            }
            break;
        case CardLifeGuardFloat.Name:
        case CardSwimmingFin.Name:
            hasBeenUsed = currentPlayer.energy === 0 && isFallOfTheBoard(getTurn(G, ctx), currentPlayer);
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
            currentPlayer.activeCard.push({ ...card, RemaningTurn: 1 });
            mustBeDiscarded = false;
            break;
        default:
            break;
    }

    if (hasBeenUsed && mustBeDiscarded) {
        const card = currentPlayer.cards[cardPos];
        if (card.Category !== CardCategoryObstacle) {
            G.discardedCards.push(card);
        }
        currentPlayer.cards.splice(cardPos, 1);
    }

    return hasBeenUsed;
}

const getCard = (G, ctx) => {
    const currentPlayer = G.players[ctx.currentPlayer];
    if (currentPlayer.shouldReceiveCard) {
        currentPlayer.shouldReceiveCard = false;
        discardCardsIfNeeded(G, currentPlayer, MAX_CARDS_ON_HAND - 1);
        const card = getDeckCard(G);
        currentPlayer.cards.push(card);
    } else {
        discardCardsIfNeeded(G, currentPlayer, MAX_CARDS_ON_HAND);
    }
}

export const getDeckCard = (G) => {
    if (G.deck.length === 0) {
        G.deck = G.discardedCards
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }

    return G.deck.pop();
}

const getTurn = (G, ctx) => G.turn;

const gotoNextMove = (G, ctx) => {
    switch (G.currentMove) {
        case MOVE_USE_CARD:
            G.currentMove = MOVE_DROP_IN;
            break;
        case MOVE_DROP_IN:
            G.currentMove = MOVE_MANEUVER;
            break;
        case MOVE_MANEUVER:
            G.currentMove = MOVE_USE_CARD;
            break;
        default:
            break;
    }
}

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

const isFallOfTheBoard = (turn, player) => player.toFellOffTheBoard > -1 && player.toFellOffTheBoard <= turn;

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

    applyEnergyToLose(G, ctx, player, energyToLose);

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

const transferRandomCardFromPlayerToOtherOne = (fromPlayer, toPlayer) => {
    const cardPos = Math.floor(Math.random() * fromPlayer.cards.length);
    const card = { ...fromPlayer.cards[cardPos] };
    fromPlayer.cards.splice(cardPos, 1);
    if (!_.isEmpty(card)) {
        toPlayer.cards.push(card);
    }
}

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
    if (G.currentMove !== MOVE_USE_CARD) {
        return INVALID_MOVE;
    }

    const currentPlayer = G.players[ctx.currentPlayer];

    const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);
    if (!hasBeenUsed) {
        return INVALID_MOVE;
    }

    currentPlayer.shouldReceiveCard = true

    if (!currentPlayer.played && ctx.numMoves === 1) {
        pass(G, ctx);
        // gotoNextMove(G, ctx);
    }
}

const dropIn = (G, ctx, targetCellPosition) => {
    if (G.currentMove !== MOVE_DROP_IN) {
        return INVALID_MOVE;
    }

    const currentPlayer = G.players[ctx.currentPlayer];

    if (currentPlayer.blocked ||
        !G.cells[targetCellPosition].player) {
        return INVALID_MOVE;
    }

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
        currentPlayer.toFellOffTheBoard = getTurn(G, ctx);

        targetPlayer.cards.push(getDeckCard(G));
    }

    targetPlayer.energy = Math.max(targetPlayer.energy - defLosses, 0);
    if (targetPlayer.energy === 0) {
        targetPlayer.toFellOffTheBoard = getTurn(G, ctx);

        if (targetPlayer.cards.length > 0) {
            transferRandomCardFromPlayerToOtherOne(targetPlayer, currentPlayer);

            if (!changePlayer(G, ctx, targetPlayer.cellPosition, null)) {
                return INVALID_MOVE;
            }
        }
    }

    currentPlayer.shouldReceiveCard = true;
}

const maneuver = (G, ctx, from, to) => {
    if (G.currentMove !== MOVE_MANEUVER) {
        return INVALID_MOVE;
    }

    const currentPlayer = G.players[ctx.currentPlayer];

    if (currentPlayer.blocked ||
        currentPlayer.energy === 0 ||
        isFallOfTheBoard(getTurn(G, ctx), currentPlayer) ||
        (G.cells[to].player && !isFallOfTheBoard(getTurn(G, ctx), G.players[G.cells[to].player.position])) ||
        G.cells[to].obstacle?.Name === CardStone.Name ||
        !isCloseTo(to, from)) {
        return INVALID_MOVE;
    }

    if (G.cells[to].player && isFallOfTheBoard(getTurn(G, ctx), G.players[G.cells[to].player.position])) {
        if (!changePlayer(G, ctx, to, null)) {
            return INVALID_MOVE;
        }

        pass(G, ctx);
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
    getCard(G, ctx);

    pass(G, ctx);
}

const pass = (G, ctx) => {
    const currentPlayer = G.players[ctx.currentPlayer];

    if (G.currentMove === MOVE_USE_CARD) {
        if (isFallOfTheBoard(getTurn(G, ctx), currentPlayer)) {
            ++currentPlayer.energy;
            currentPlayer.toFellOffTheBoard = -1;
            currentPlayer.blocked = true;
        } else {
            currentPlayer.blocked = false;
        }

        gotoNextMove(G, ctx);
    } else if (G.currentMove === MOVE_DROP_IN) {
        gotoNextMove(G, ctx);
    } else if (G.currentMove === MOVE_MANEUVER) {
        if (ctx.phase === 'phaseA') {
            currentPlayer.played = true;
            return;
        }

        if (!isFallOfTheBoard(getTurn(G, ctx), currentPlayer) && !currentPlayer.blocked) {
            currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY);
        }

        discardCardsIfNeeded(G, currentPlayer, MAX_CARDS_ON_HAND);

        gotoNextMove(G, ctx);

        currentPlayer.played = true;
        if (everyonePlay(G)) {
            resetPlayerPlayed(G);
            ++G.turn;
        }
        ctx.events.endTurn();

        // NOTE: This is the way to decrease the remaining turn of active cards for the next player before he plays a card.
        const nextPlayerPosition = (currentPlayer.position + 1) % NUMBER_OF_PLAYERS;
        decreaseRemainingTurnForActiveCards(G, ctx, nextPlayerPosition);
    }
}

/********************************************************************************/
// Moves
/********************************************************************************/

const resetPlayerPlayed = (G) => {
    Object.values(G.players).forEach((p) => (p.played = false))
}

const onEndPhaseA = (G, ctx) => {
    gotoNextMove(G, ctx);
    resetPlayerPlayed(G);
    ++G.turn;
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
        cells[i] = createCell(i, undefined, players[order[i]]);
    }

    cells[28] = { position: 28, obstacle: CardShark, player: undefined }
    cells[29] = { position: 29, obstacle: CardShark, player: undefined }
    cells[30] = { position: 30, obstacle: CardShark, player: undefined }
    cells[31] = { position: 31, obstacle: CardShark, player: undefined }
    for (let i = 0; i < GRID_SIZE; ++i) {
        if (!cells[i]) {
            cells[i] = createCell(i, undefined, undefined);
        }
    }

    const events = []

    return { cells, players, events, turn: 0, order, deck, discardedCards: [], currentMove: MOVE_MANEUVER }
}

/********************************************************************************/
// Board
/********************************************************************************/

export const SurfKingGame = {
    name: 'SurfKing',

    setup: setup,

    turn: {
        order: TurnOrder.CUSTOM_FROM('order'),
    },

    phases: {
        phaseA: {
            moves: { maneuver },
            turn: { minMoves: 1, maxMoves: 1, },
            onBegin: (G, ctx) => { ++G.turn; },
            onEnd: onEndPhaseA,
            endIf: everyonePlay,
            next: 'phaseB',
            start: true,
        },
        phaseB: {
            moves: { useCard, dropIn, maneuver, pass },
            onBegin: (G, ctx) => { resetPlayerPlayed(G); }
        },
    },

    minPlayers: 2,
    maxPlayers: 7,

    disableUndo: true,

    endIf: endIf,
}
