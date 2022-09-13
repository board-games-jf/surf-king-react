import { TurnOrder } from 'boardgame.io/core'
import { SharkCard } from "./Card.js";
import { SharkObstacle } from "./Obstacle.js";

// TODO: Move to other file
const Position_P1 = '0';
const Position_P2 = '1';
const Position_P3 = '2';
const Position_P4 = '3';
const Position_P5 = '4';
const Position_P6 = '5';
const Position_P7 = '6';

export const GRID_SIZE = 53; // TODO: Move to other file

const createPlayer = (position) => {
    const cards = [];
    // TODO: will receive 2 random cards
    cards.push(...Array(2).fill(SharkCard))
    return { position, cards, played: false, cellPosition: -1 }
}

const setup = () => {
    const players = {
        '0': createPlayer(Position_P1),
        '1': createPlayer(Position_P2),
    }

    let order = [Position_P1, Position_P2]
    order = order.sort(() => Math.random() - 0.5)

    const cells = new Array(GRID_SIZE)

    // TODO: set player positions according to number of players.
    for (let i = 0; i < 2; ++i) {
        players[order[i]].cellPosition = i + 1
        cells[i + 1] = { position: i + 1, obstacle: undefined, player: players[order[i]] }
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

    return { cells, players, events, turn: 0, order }
}

const placeObstacule = (G, ctx, position, obstacle) => {
    // TODO: Validate
    G.cells[position].obstacle = obstacle
    G.players[ctx.currentPlayer].played = true
}

const movePiece = (G, ctx, from, to) => {
    // TODO: Validate moviment or trigger action
    G.cells[to].player = G.cells[from].player
    G.cells[from].player = undefined
    G.players[ctx.currentPlayer].played = true
    G.players[ctx.currentPlayer].cellPosition = to
}

const resetPlayerPlayed = (G) => {
    Object['values'](G.players).forEach((p) => (p.played = false))
}

const phasePlaceFirstObstaculeOnEnd = (G) => {
    resetPlayerPlayed(G)
    ++G.turn
}

const phaseFirstMoveOnEnd = (G) => {
    resetPlayerPlayed(G)
    ++G.turn
}

const everyonePlay = (G) => {
    return Object['values'](G.players).every((p) => p.played === true)
}

const endIf = (G) => {
    // A player wins if he arrives at one of the cells: 50, 51, 52, or 53.
    for (let i = 50; i <= 53; ++i) {
      const cell = G.cells[i]
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
        place_first_obstacule: {
            moves: { placeObstacule },
            turn: { moveLimit: 1 },
            onEnd: phasePlaceFirstObstaculeOnEnd,
            endIf: everyonePlay,
            next: 'firt_move_piece',
            start: true,
        },
        firt_move_piece: {
            moves: { movePiece },
            turn: { moveLimit: 1 },
            onEnd: phaseFirstMoveOnEnd,
            endIf: everyonePlay,
            next: 'play',
        },
        play: {
            moves: {},
            next: 'check',
        },
        check: {
            moves: {},
            next: 'play',
        },
    },

    minPlayers: 2,
    maxPlayers: 4,

    endIf: endIf,
}