import { INVALID_MOVE, TurnOrder } from 'boardgame.io/core'
import _ from 'lodash'
import {
    MOVE_BACKWARD,
    MOVE_BACKWARD_LEFT,
    MOVE_BACKWARD_RIGHT,
    MOVE_FORWARD,
    MOVE_FORWARD_LEFT,
    MOVE_FORWARD_RIGHT,
} from './Board'
import {
    CardAmulet,
    CardBigWave,
    CardBottledWater,
    CardCategoryObstacle,
    CardChange,
    CardCoconut,
    CardCyclone,
    CardEnergy,
    CardEnergyX2,
    CardEnergyX3,
    CardHangLoose,
    CardIsland,
    CardJumping,
    CardLifeGuardFloat,
    CardShark,
    CardStone,
    CardStorm,
    CardSunburn,
    CardSwimmingFin,
    CardTsunami,
} from './Cards'

export const MAX_ENERGY = 4
export const MAX_CARDS_ON_HAND = 5
export const GRID_SIZE = 53

export const MOVE_USE_CARD = 'use_card'
export const MOVE_DROP_IN = 'drop_in'
export const MOVE_MANEUVER = 'maneuver'

/********************************************************************************/
// Auxiliary functions
/********************************************************************************/
export const applyEnergyToLose = (G, ctx, player, energyToLose) => {
    player.energy = Math.min(Math.max(player.energy - energyToLose, 0), MAX_ENERGY)
    if (player.energy === 0) {
        player.fellOffTheBoard = getTurn(G, ctx)
    }
}

const changePlayer = (G, ctx, targetCellPosition, card) => {
    const currentPlayer = G.players[ctx.currentPlayer]
    const currentPlayerCellPosition = currentPlayer.cellPosition
    const targetPlayer = G.players[G.cells[targetCellPosition]?.player?.position]

    if (!targetPlayer || (card && isPlayerWearingAmulet(targetPlayer))) {
        return false
    }

    let energyToLose = 0
    const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, targetCellPosition, energyToLose)
    targetCellPosition = newTo
    energyToLose = newEnergyToLose

    applyEnergyToLose(G, ctx, currentPlayer, energyToLose)

    currentPlayer.cellPosition = targetCellPosition
    targetPlayer.cellPosition = currentPlayerCellPosition

    G.cells[currentPlayerCellPosition].player = targetPlayer
    G.cells[targetCellPosition].player = currentPlayer

    return true
}

const nextCellUnoccupied = (G, cellPosition, playerIndex) => {
    let nextUnoccupiedPosition = cellPosition
    const dice = rollDice()
    const newPos = [
        MOVE_FORWARD,
        MOVE_FORWARD_RIGHT,
        MOVE_BACKWARD_LEFT,
        MOVE_BACKWARD,
        MOVE_BACKWARD_RIGHT,
        MOVE_FORWARD_LEFT,
    ]
    let occupied = true
    while (occupied) {
        // TODO: Check when "To" is negative.
        // while (to - newPos[dice] < 0) {
        //     dice = Math.floor(Math.random() * 6);
        // }
        nextUnoccupiedPosition += newPos[dice]
        const hasAnotherPlayer =
            G.cells[nextUnoccupiedPosition].player &&
            G.cells[nextUnoccupiedPosition].player.position !== G.players[playerIndex].position
        const hasStone = G.cells[nextUnoccupiedPosition].obstacle?.Name === CardStone.Name
        occupied = hasAnotherPlayer || hasStone
    }

    return nextUnoccupiedPosition
}

export const checkAndProcessAnyObstacle = (G, ctx, to, energyToLose) => {
    switch (G.cells[to].obstacle?.Name) {
        case CardCyclone.Name:
            // TODO: Check when "To" is negative.
            to = nextCellUnoccupied(G, to, ctx.currentPlayer)
            return checkAndProcessAnyObstacle(G, ctx, to, energyToLose)
        case CardIsland.Name:
            energyToLose -= 2
            break
        case CardStorm.Name:
            ++energyToLose
            break
        case CardShark.Name:
            energyToLose += 2
            break
        default:
            break
    }

    return { newTo: to, newEnergyToLose: energyToLose }
}

export const createDeck = () => {
    const deck = []

    const addCards = (card, quantity) => {
        for (let i = 0; i < quantity; i++) {
            deck.push(card)
        }
    }

    // Obstacles
    addCards(CardCyclone, 4)
    addCards(CardIsland, 4)
    addCards(CardStone, 4)
    addCards(CardStorm, 4)
    // addCards(CardShark, 0); // NOTE: The board already have 4 Sharks

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
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value)

    return shuffled
}

export const createCell = (position, obstacle, player) => ({ position, obstacle, player })

export const createPlayer = (position, cards) => ({
    position,
    cards,
    played: false,
    shouldReceiveCard: false,
    blocked: false,
    energy: MAX_ENERGY,
    cellPosition: -1,
    fellOffTheBoard: -1,
    activeCard: [],
    moved: false,
})

export const decreasePlayerEnergyByCard = (G, ctx, cellPosition, card) => {
    const targetPlayer = G.players[G.cells[cellPosition].player?.position]
    if (targetPlayer && [CardBigWave.Name, CardSunburn.Name].includes(card.Name)) {
        if (isPlayerWearingAmulet(targetPlayer)) {
            return false
        }

        const energyToLose = card.Name === CardBigWave.Name ? 2 : 1
        applyEnergyToLose(G, ctx, targetPlayer, energyToLose)

        if (targetPlayer.energy === 0) {
            transferRandomCardFromPlayerToOtherOne(targetPlayer, G.players[ctx.currentPlayer])
        }

        return true
    }

    return false
}

export const decreaseRemainingTurnForActiveCards = (G, ctx, playerPosition) => {
    const player = G.players[playerPosition]

    player.activeCard.forEach((card) => --card.RemaningTurn)
    player.activeCard.forEach((card) => {
        if (G.cells?.[card.CellPosition]?.obstacle) {
            if (card.RemaningTurn === 0) {
                G.cells[card.CellPosition].obstacle = undefined
            } else {
                G.cells[card.CellPosition].obstacle = {
                    ...G.cells[card.CellPosition].obstacle,
                    RemaningTurn: card.RemaningTurn,
                }
            }
        }
    })
    player.activeCard
        .filter((card) => card.RemaningTurn === 0)
        .forEach((card) => {
            const cardPos = player.cards.findIndex((c) => c.Name === card.Name && c.CellPosition === card.CellPosition)
            if (cardPos >= 0) {
                const card = player.cards[cardPos]
                if (card.Category !== CardCategoryObstacle) {
                    G.discardedCards.push(card)
                }
                player.cards.splice(cardPos, 1)
            }
        })

    player.activeCard = player.activeCard.filter((card) => card.RemaningTurn > 0)
}

export const discardCardsIfNeeded = (G, player, cardLimitOnHand) => {
    if (player.cards.length >= MAX_CARDS_ON_HAND) {
        let i = player.cards.length - cardLimitOnHand
        while (i-- > 0) {
            const cardPos = Math.floor(Math.random() * player.cards.length)
            const card = player.cards[cardPos]
            if (card.Category !== CardCategoryObstacle) {
                G.discardedCards.push(card)
            }
            player.cards.splice(cardPos, 1)
        }
    }
}

export const executeCardAction = (G, ctx, cardPos, args) => {
    const currentPlayer = G.players[ctx.currentPlayer]
    const card = currentPlayer.cards[cardPos]

    let hasBeenUsed = true
    let mustBeDiscarded = true
    switch (card.Name) {
        case CardStone.Name: {
            const cellPosition = args[0]
            const hasCardBeenUsedBefore = currentPlayer.activeCard.find(
                (ac) => ac.Name === card.Name && ac.RemaningTurn > 0
            )
            if (hasCardBeenUsedBefore) {
                hasBeenUsed = false
            } else {
                const obstacle = { ...card, CellPosition: cellPosition, OwnerPosition: currentPlayer.position }
                hasBeenUsed = placeObstacle(G, ctx, cellPosition, obstacle)
                if (hasBeenUsed) {
                    card.CellPosition = cellPosition
                    currentPlayer.activeCard.push({ ...card, RemaningTurn: 3 })
                }
            }
            mustBeDiscarded = false
            break
        }
        case CardCyclone.Name:
        case CardIsland.Name:
        case CardStorm.Name:
        case CardShark.Name: {
            const cellPosition = args[0]
            const obstacle = { ...card, CellPosition: cellPosition, OwnerPosition: currentPlayer.position }
            hasBeenUsed = placeObstacle(G, ctx, cellPosition, obstacle)
            break
        }
        case CardBigWave.Name:
        case CardSunburn.Name:
            hasBeenUsed = decreasePlayerEnergyByCard(G, ctx, args[0], card)
            break
        case CardBottledWater.Name:
            currentPlayer.activeCard.push(card)
            break
        case CardCoconut.Name:
        case CardEnergy.Name:
        case CardEnergyX2.Name:
        case CardEnergyX3.Name:
            hasBeenUsed = currentPlayer.energy > 0 && !isFallOfTheBoard(getTurn(G, ctx), currentPlayer)
            if (hasBeenUsed) {
                increasePlayerEnergy(G, ctx, card)
            }
            break
        case CardLifeGuardFloat.Name:
        case CardSwimmingFin.Name:
            hasBeenUsed = currentPlayer.energy === 0 && isFallOfTheBoard(getTurn(G, ctx), currentPlayer)
            if (hasBeenUsed) {
                increasePlayerEnergy(G, ctx, card)
                currentPlayer.fellOffTheBoard = -1
            }
            break
        case CardChange.Name:
            hasBeenUsed = changePlayer(G, ctx, args[0], card)
            break
        case CardJumping.Name:
            hasBeenUsed = removeObstacle(G, ctx, args[0])
            break
        case CardTsunami.Name:
            hasBeenUsed = tsunami(G, ctx, args[0])
            break
        case CardAmulet.Name:
        case CardHangLoose.Name:
            currentPlayer.activeCard.push({ ...card, RemaningTurn: 1 })
            mustBeDiscarded = false
            break
        default:
            break
    }

    if (hasBeenUsed && mustBeDiscarded) {
        const card = currentPlayer.cards[cardPos]
        if (card.Category !== CardCategoryObstacle) {
            G.discardedCards.push(card)
        }
        currentPlayer.cards.splice(cardPos, 1)
    }

    return hasBeenUsed
}

export const getCard = (G, ctx) => {
    const currentPlayer = G.players[ctx.currentPlayer]
    if (currentPlayer.shouldReceiveCard) {
        currentPlayer.shouldReceiveCard = false
        discardCardsIfNeeded(G, currentPlayer, MAX_CARDS_ON_HAND - 1)
        const card = getDeckCard(G)
        currentPlayer.cards.push(card)
    } else {
        discardCardsIfNeeded(G, currentPlayer, MAX_CARDS_ON_HAND)
    }
}

export const getDeckCard = (G) => {
    if (G.deck.length === 0) {
        G.deck = G.discardedCards
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value)
    }

    return G.deck.pop()
}

const getTurn = (G, ctx) => G.turn

const gotoNextMove = (G, ctx) => {
    switch (G.currentMove) {
        case MOVE_USE_CARD:
            G.currentMove = MOVE_DROP_IN
            break
        case MOVE_DROP_IN:
            G.currentMove = MOVE_MANEUVER
            break
        case MOVE_MANEUVER:
            G.currentMove = MOVE_USE_CARD
            break
        default:
            break
    }
}

export const increasePlayerEnergy = (G, ctx, card) => {
    const currentPlayer = G.players[ctx.currentPlayer]

    const values = {
        [CardCoconut.Name]: () => (currentPlayer.energy = MAX_ENERGY),
        [CardEnergy.Name]: () => (currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY)),
        [CardEnergyX2.Name]: () => (currentPlayer.energy = Math.min(currentPlayer.energy + 2, MAX_ENERGY)),
        [CardEnergyX3.Name]: () => (currentPlayer.energy = Math.min(currentPlayer.energy + 3, MAX_ENERGY)),
        [CardLifeGuardFloat.Name]: () => (currentPlayer.energy = Math.min(currentPlayer.energy + 2, MAX_ENERGY)),
        [CardSwimmingFin.Name]: () => (currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY)),
    }
    values[card.Name]()
}

export const isCloseTo = (a, b) => {
    const forwardOrBackward = Math.abs(a - b) === MOVE_FORWARD
    const forwardOrBackward_Right = Math.abs(a - b) === MOVE_FORWARD_RIGHT
    const forwardOrBackward_Left = Math.abs(a - b) === MOVE_FORWARD_LEFT
    return forwardOrBackward || forwardOrBackward_Right || forwardOrBackward_Left
}

// TODO: Shall we consider player.energy === 0?
const isFallOfTheBoard = (turn, player) => player.fellOffTheBoard > -1 && player.fellOffTheBoard <= turn

const isPlayerUsingHangLoose = (player) => player.activeCard.find((card) => card.Name === CardHangLoose.Name)

const isPlayerWearingAmulet = (player) => player.activeCard.find((card) => card.Name === CardAmulet.Name)

const movePlayer = (G, ctx, player, from, to, energyToLose) => {
    const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)
    to = newTo
    energyToLose = newEnergyToLose

    if (to !== from) {
        G.cells[to].player = G.cells[from].player
        G.cells[from].player = undefined
    }

    player.cellPosition = to

    applyEnergyToLose(G, ctx, player, energyToLose)
}

export const moveToNextHexUnoccupiedByTsunami = (G, ctx, playerPos, from, to) => {
    const targetPlayer = G.players[playerPos]
    if (isPlayerWearingAmulet(targetPlayer)) {
        return false
    }

    const hasAnotherPlayer = G.cells[to].player && G.cells[to].player.position !== playerPos
    if (hasAnotherPlayer) {
        return moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to + MOVE_BACKWARD)
    }

    if (G.cells[to].obstacle?.Name === CardStone.Name) {
        return moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to + MOVE_BACKWARD)
    }

    if (G.cells[to].obstacle?.Name === CardCyclone.Name) {
        // TODO: Check when "To" is negative.
        to = nextCellUnoccupied(G, to, playerPos)
        return moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to)
    }

    movePlayer(G, ctx, targetPlayer, from, to, 0)

    return true
}

const placeObstacle = (G, ctx, cellPosition, obstacle) => {
    if (!G.cells[cellPosition].player && !G.cells[cellPosition].obstacle) {
        G.cells[cellPosition].obstacle = obstacle
        return true
    }
    return false
}

const removeObstacle = (G, ctx, cellPosition) => {
    const obstacle = G.cells[cellPosition].obstacle
    if (obstacle) {
        G.players[obstacle.OwnerPosition].activeCard = G.players[obstacle.OwnerPosition].activeCard.filter(
            (card) =>
                card.Name !== CardStone.Name ||
                (card.Name === CardStone.Name && card.CellPosition !== obstacle.CellPosition)
        )

        G.players[obstacle.OwnerPosition].cards = G.players[obstacle.OwnerPosition].cards.filter(
            (card) =>
                card.Name !== CardStone.Name ||
                (card.Name === CardStone.Name && card.CellPosition !== obstacle.CellPosition)
        )

        G.cells[cellPosition].obstacle = undefined
        return true
    }

    return false
}

const resetPlayerPlayed = (G) => {
    Object.values(G.players).forEach((p) => (p.played = false))
}

const rollDice = () => Math.floor(Math.random() * 6)

export const transferRandomCardFromPlayerToOtherOne = (fromPlayer, toPlayer) => {
    const allowed = {}
    fromPlayer.cards.forEach((card, index) => {
        if (!fromPlayer.activeCard.find((c) => c.Name === card.Name && c.CellPosition === card.CellPosition)) {
            allowed[index] = card
        }
    })

    const keys = [...Object.keys(allowed)]
    if (keys.length > 0) {
        const cardPos = Math.floor(Math.random() * keys.length)
        const card = { ...fromPlayer.cards[cardPos] }
        fromPlayer.cards.splice(cardPos, 1)
        if (!_.isEmpty(card)) {
            toPlayer.cards.push(card)
        }
    }
}

const tsunami = (G, ctx, cellPosition) => {
    const allowedCellPositions = Array.from({ length: 8 }, (_, i) => 0 + i * MOVE_FORWARD)
    if (!allowedCellPositions.includes(cellPosition)) {
        return false
    }

    if (G.cells[cellPosition].player) {
        moveToNextHexUnoccupiedByTsunami(
            G,
            ctx,
            G.cells[cellPosition].player.position,
            cellPosition,
            cellPosition + MOVE_BACKWARD
        )
    }

    for (let i = 0; i < 3; ++i) {
        cellPosition += MOVE_FORWARD_RIGHT
        if (G.cells[cellPosition].player) {
            moveToNextHexUnoccupiedByTsunami(
                G,
                ctx,
                G.cells[cellPosition].player.position,
                cellPosition,
                cellPosition + MOVE_BACKWARD
            )
        }

        cellPosition += MOVE_BACKWARD_LEFT
        if (G.cells[cellPosition].player) {
            moveToNextHexUnoccupiedByTsunami(
                G,
                ctx,
                G.cells[cellPosition].player.position,
                cellPosition,
                cellPosition + MOVE_BACKWARD
            )
        }
    }

    return true
}

/********************************************************************************/
// Moves
/********************************************************************************/
export const useCard = (G, ctx, cardPos, args) => {
    if (G.currentMove !== MOVE_USE_CARD) {
        return INVALID_MOVE
    }

    const currentPlayer = G.players[ctx.currentPlayer]

    const hasBeenUsed = executeCardAction(G, ctx, cardPos, args)
    if (!hasBeenUsed) {
        return INVALID_MOVE
    }

    currentPlayer.shouldReceiveCard = true

    if (!currentPlayer.played && ctx.numMoves === 1) {
        pass(G, ctx)
    }
}

export const dropIn = (G, ctx, targetCellPosition) => {
    if (G.currentMove !== MOVE_DROP_IN) {
        return INVALID_MOVE
    }

    const currentPlayer = G.players[ctx.currentPlayer]

    if (currentPlayer.blocked || !G.cells[targetCellPosition].player) {
        return INVALID_MOVE
    }

    const targetPlayer = G.players[G.cells[targetCellPosition].player.position]

    if (
        currentPlayer.energy === 0 ||
        targetPlayer.energy === 0 ||
        isPlayerWearingAmulet(targetPlayer) ||
        isPlayerUsingHangLoose(targetPlayer) ||
        !isCloseTo(currentPlayer.cellPosition, targetCellPosition)
    ) {
        return INVALID_MOVE
    }

    let atkLosses = 0
    let defLosses = 0
    G.atkDices = Array.from({ length: currentPlayer.energy }, () => rollDice())
        .sort()
        .reverse()
    G.defDices = Array.from({ length: targetPlayer.energy }, () => rollDice())
        .sort()
        .reverse()
    for (let i = 0; i < MAX_ENERGY; ++i) {
        if (i >= G.atkDices.length || i >= G.defDices.length) {
            break
        }

        if (G.atkDices[i] > G.defDices[i]) {
            // atk win
            ++defLosses
        } else {
            // def win
            ++atkLosses
        }
    }

    currentPlayer.energy = Math.max(currentPlayer.energy - atkLosses, 0)
    if (currentPlayer.energy === 0) {
        currentPlayer.fellOffTheBoard = getTurn(G, ctx)

        targetPlayer.cards.push(getDeckCard(G))
    }

    targetPlayer.energy = Math.max(targetPlayer.energy - defLosses, 0)
    if (targetPlayer.energy === 0) {
        targetPlayer.fellOffTheBoard = getTurn(G, ctx)

        if (targetPlayer.cards.length > 0) {
            transferRandomCardFromPlayerToOtherOne(targetPlayer, currentPlayer)
        }

        if (!changePlayer(G, ctx, targetPlayer.cellPosition, null)) {
            // TODO: Is it possible to get here?
            return INVALID_MOVE
        }
    }

    currentPlayer.shouldReceiveCard = true
}

export const maneuver = (G, ctx, from, to) => {
    if (G.currentMove !== MOVE_MANEUVER) {
        return INVALID_MOVE
    }

    const currentPlayer = G.players[ctx.currentPlayer]

    if (
        currentPlayer.blocked ||
        currentPlayer.energy === 0 ||
        isFallOfTheBoard(getTurn(G, ctx), currentPlayer) ||
        (G.cells[to].player && !isFallOfTheBoard(getTurn(G, ctx), G.players[G.cells[to].player.position])) ||
        G.cells[to].obstacle?.Name === CardStone.Name ||
        !isCloseTo(to, from)
    ) {
        return INVALID_MOVE
    }

    const hasCardBottledWater = currentPlayer.activeCard.find((card) => card.Name === CardBottledWater.Name)

    if (G.cells[to].player && isFallOfTheBoard(getTurn(G, ctx), G.players[G.cells[to].player.position])) {
        if (!changePlayer(G, ctx, to, null)) {
            // TODO: Is it possible to get here?
            return INVALID_MOVE
        }
    } else {
        const energyToLose = hasCardBottledWater ? 0 : 1
        movePlayer(G, ctx, currentPlayer, from, to, energyToLose)
    }

    if (hasCardBottledWater) {
        currentPlayer.activeCard = currentPlayer.activeCard.filter((card) => {
            return card.Name !== CardBottledWater.Name
        })
    }

    currentPlayer.moved = true

    currentPlayer.shouldReceiveCard = true
    getCard(G, ctx)

    pass(G, ctx)
}

export const pass = (G, ctx) => {
    const currentPlayer = G.players[ctx.currentPlayer]

    switch (G.currentMove) {
        case MOVE_USE_CARD:
            if (isFallOfTheBoard(getTurn(G, ctx), currentPlayer)) {
                currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY)
                currentPlayer.fellOffTheBoard = -1
                currentPlayer.blocked = true
            } else {
                currentPlayer.blocked = false
            }

            gotoNextMove(G, ctx)

            break
        case MOVE_DROP_IN:
            gotoNextMove(G, ctx)

            break
        case MOVE_MANEUVER:
            if (ctx.phase === 'phaseA') {
                currentPlayer.played = true
                return
            }

            console.log('MOVE_MANEUVER', {
                isFallOfTheBoard: isFallOfTheBoard(getTurn(G, ctx), currentPlayer),
                blocked: currentPlayer.blocked,
                moved: currentPlayer.moved,
            })
            if (!isFallOfTheBoard(getTurn(G, ctx), currentPlayer) && !currentPlayer.blocked && !currentPlayer.moved) {
                currentPlayer.energy = Math.min(currentPlayer.energy + 1, MAX_ENERGY)
            }

            discardCardsIfNeeded(G, currentPlayer, MAX_CARDS_ON_HAND)

            gotoNextMove(G, ctx)

            currentPlayer.played = true
            if (everyonePlay(G)) {
                resetPlayerPlayed(G)
                ++G.turn
            }
            ctx.events.endTurn()

            // NOTE: This is the way to decrease the remaining turn of active cards for the next player before he plays a card.
            const nextPlayerPosition = (currentPlayer.position + 1) % ctx.numPlayers
            decreaseRemainingTurnForActiveCards(G, ctx, nextPlayerPosition)

            G.players[nextPlayerPosition].moved = false

            break
        default:
            break
    }
}

/********************************************************************************/
// Setup
/********************************************************************************/
const endIf = (G) => {
    for (let i = GRID_SIZE - 4; i < GRID_SIZE; ++i) {
        const player = G.players[G.cells?.[i]?.player?.position]
        if (player) {
            return { winner: player }
        }
    }
}

const everyonePlay = (G) => {
    return Object.values(G.players).every((p) => p.played === true)
}

const onEndPhaseA = (G, ctx) => {
    gotoNextMove(G, ctx)
    resetPlayerPlayed(G)
    ++G.turn
}

export const setup = (ctx) => {
    const cells = new Array(GRID_SIZE)

    // TODO: Create the deck base on game mode
    const deck = createDeck()

    const players = {}
    for (let i = 0; i < ctx.numPlayers; ++i) {
        const initialCards = [CardStone, CardJumping] //[deck.pop(), deck.pop()]
        players[i] = createPlayer(i, initialCards)
    }

    let order = Object.keys(players)
    // order = order.sort(() => Math.random() - 0.5) // TODO: Other mode?

    // TODO: set player positions according to number of players.
    for (let i = 0; i < ctx.numPlayers; ++i) {
        players[order[i]].cellPosition = i
        cells[i] = createCell(i, undefined, players[order[i]])
    }

    cells[28] = { position: 28, obstacle: CardShark, player: undefined }
    cells[29] = { position: 29, obstacle: CardShark, player: undefined }
    cells[30] = { position: 30, obstacle: CardShark, player: undefined }
    cells[31] = { position: 31, obstacle: CardShark, player: undefined }
    for (let i = 0; i < GRID_SIZE; ++i) {
        if (!cells[i]) {
            cells[i] = createCell(i, undefined, undefined)
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
            turn: { minMoves: 1, maxMoves: 1 },
            onBegin: (G, ctx) => {
                ++G.turn
            },
            onEnd: onEndPhaseA,
            endIf: everyonePlay,
            next: 'phaseB',
            start: true,
        },
        phaseB: {
            moves: { useCard, dropIn, maneuver, pass },
            onBegin: (G, ctx) => {
                resetPlayerPlayed(G)
            },
        },
    },

    minPlayers: 2,
    maxPlayers: 7,

    disableUndo: true,

    endIf: endIf,
}
