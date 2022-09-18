import { INVALID_MOVE } from 'boardgame.io/core'
import { CardStone } from '../../Cards'
import { createCell, createPlayer, GRID_SIZE, MOVE_DROP_IN, MOVE_USE_CARD, useCard } from '../../SurfKingGame'

describe('SurfKingGame useCard', () => {
    it('happy path', () => {
        const card = CardStone
        const player1 = createPlayer(0, [card])
        const player2 = createPlayer(1, [])
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, discardedCards: [], cells, currentMove: MOVE_USE_CARD }
        const ctx = { currentPlayer: '0' }
        const cardPos = 0
        const targetCellPosition = 10
        const args = [targetCellPosition]

        const result = useCard(G, ctx, cardPos, args)

        expect(result).toBeUndefined()
    })

    it(`when player is using a second card should pass to the next turn 'drop in'`, () => {
        const card = CardStone
        const player1 = createPlayer(0, [card])
        const player2 = createPlayer(1, [])
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, discardedCards: [], cells, currentMove: MOVE_USE_CARD }
        const ctx = { currentPlayer: '0', numMoves: 1 }
        const cardPos = 0
        const targetCellPosition = 10
        const args = [targetCellPosition]

        const result = useCard(G, ctx, cardPos, args)

        expect(result).toBeUndefined()
        expect(G.currentMove).toEqual(MOVE_DROP_IN)
    })

    it(`when current move is not 'maneuver' should return 'INVALID_MOVE'`, () => {
        const card = CardStone
        const player1 = createPlayer(0, [card])
        const player2 = createPlayer(1, [])
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, discardedCards: [], cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const cardPos = 0
        const targetCellPosition = 10
        const args = [targetCellPosition]

        const result = useCard(G, ctx, cardPos, args)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when execution of card action failed should return 'INVALID_MOVE'`, () => {
        const card = CardStone
        const player1 = createPlayer(0, [card])
        const player2 = createPlayer(1, [])
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                if (i === 10) return createCell(i, card)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, discardedCards: [], cells, currentMove: MOVE_USE_CARD }
        const ctx = { currentPlayer: '0' }
        const cardPos = 0
        const targetCellPosition = 10
        const args = [targetCellPosition]

        const result = useCard(G, ctx, cardPos, args)

        expect(result).toEqual(INVALID_MOVE)
    })
})
