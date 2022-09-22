import { Client } from 'boardgame.io/client'
import { MOVE_FORWARD } from '../../Board'
import { CardEnergy } from '../../Cards'
import { createCell, createPlayer, GRID_SIZE, setup, SurfKingGame } from '../../SurfKingGame'

describe('SurfKingGame endGame', () => {
    it('happy path', () => {
        const currentPlayer = { ...createPlayer(0, []), cellPosition: 35 }
        const nextPlayer = { ...createPlayer(1, []), cellPosition: 39 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === currentPlayer.cellPosition) return createCell(i, undefined, currentPlayer)
                if (i === nextPlayer.cellPosition) return createCell(i, undefined, nextPlayer)
                return createCell(i, undefined, undefined)
            }),
        ]
        const SurfKingGameCustomScenario = {
            ...SurfKingGame,
            setup: (ctx) => ({
                ...setup(ctx),
                players: [currentPlayer, nextPlayer],
                deck: new Array(5).fill(CardEnergy),
                cells,
            }),
        }

        const client = Client({
            game: SurfKingGameCustomScenario,
            numPlayers: 2,
        })

        // Phase A
        client.moves.maneuver(currentPlayer.cellPosition, currentPlayer.cellPosition + MOVE_FORWARD)
        client.moves.maneuver(nextPlayer.cellPosition, nextPlayer.cellPosition + MOVE_FORWARD)

        // Phase B
        client.moves.pass() // use card
        client.moves.pass() // drop in
        client.moves.maneuver(42, 49)

        const { G, ctx } = client.getState()

        const expectedCells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 46)
                    return {
                        ...G.cells[i],
                        player: { ...G.cells[i].player, cellPosition: 39 },
                    }
                if (i === 49)
                    return {
                        ...G.cells[i],
                        player: { ...G.cells[i].player, cellPosition: 35 },
                    }
                return createCell(i, undefined, undefined)
            }),
        ]
        const expectedPlayers = [
            {
                ...currentPlayer,
                cellPosition: 49,
                energy: 2,
                moved: true,
                played: true,
                cards: [CardEnergy, CardEnergy],
            },
            { ...nextPlayer, cellPosition: 46, energy: 3, moved: false, played: false, cards: [CardEnergy] },
        ]
        expect(G).toEqual({ ...G, turn: 2, cells: expectedCells, players: expectedPlayers })
        expect(G.deck).toHaveLength(2)
        expect(ctx.currentPlayer).toEqual('0')
        expect(ctx.gameover.winner.position).toEqual(currentPlayer.position)
    })
})
