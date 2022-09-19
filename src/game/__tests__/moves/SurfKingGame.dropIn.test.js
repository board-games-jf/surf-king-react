import { INVALID_MOVE } from 'boardgame.io/core'
import { CardAmulet, CardEnergy, CardHangLoose } from '../../Cards'
import { createCell, createPlayer, dropIn, GRID_SIZE, MOVE_DROP_IN, MOVE_MANEUVER } from '../../SurfKingGame'

describe('SurfKingGame dropIn', () => {
    describe('current player win and target player remains on the board', () => {
        beforeEach(() => {
            jest.spyOn(global.Math, 'random')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(5 / 6)
                .mockReturnValueOnce(5 / 6)
                .mockReturnValueOnce(5 / 6)
                .mockReturnValueOnce(5 / 6)
        })

        afterEach(() => {
            jest.spyOn(global.Math, 'random').mockRestore()
        })

        it('happy path', () => {
            const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
            const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, player1)
                    if (i === 11) return createCell(i, undefined, player2)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
            const ctx = { currentPlayer: '0' }
            const targetCellPosition = 11

            const result = dropIn(G, ctx, targetCellPosition)

            expect(result).toBeUndefined()
            expect(G.atkDices).toEqual([6, 6, 5])
            expect(G.defDices).toEqual([5, 5, 5])
            expect(player1.energy).toEqual(2)
            expect(player2.energy).toEqual(1)
            expect(player1.shouldReceiveCard).toBeTruthy()
        })
    })

    describe('current player win and target player fall off the board', () => {
        beforeEach(() => {
            jest.spyOn(global.Math, 'random')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(5 / 6)
                .mockReturnValueOnce(4 / 6)
                .mockReturnValueOnce(4 / 6)
                .mockReturnValueOnce(4 / 6)
        })

        afterEach(() => {
            jest.spyOn(global.Math, 'random').mockRestore()
        })

        it('target player there are cards', () => {
            const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
            const player2 = { ...createPlayer(1, [CardEnergy]), energy: 3, cellPosition: 11 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, player1)
                    if (i === 11) return createCell(i, undefined, player2)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
            const ctx = { currentPlayer: '0' }
            const targetCellPosition = 11

            const result = dropIn(G, ctx, targetCellPosition)

            expect(result).toBeUndefined()
            expect(G.atkDices).toEqual([6, 6, 5])
            expect(G.defDices).toEqual([4, 4, 4])
            expect(player1).toEqual({
                ...player1,
                energy: 3,
                toFellOffTheBoard: -1,
                cellPosition: 11,
                cards: [CardEnergy],
                shouldReceiveCard: true,
            })
            expect(player2).toEqual({
                ...player2,
                energy: 0,
                toFellOffTheBoard: 2,
                cellPosition: 7,
                cards: [],
            })
        })

        it('target player there are no cards', () => {
            const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
            const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, player1)
                    if (i === 11) return createCell(i, undefined, player2)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
            const ctx = { currentPlayer: '0' }
            const targetCellPosition = 11

            const result = dropIn(G, ctx, targetCellPosition)

            expect(result).toBeUndefined()
            expect(G.atkDices).toEqual([6, 6, 5])
            expect(G.defDices).toEqual([4, 4, 4])
            expect(player1).toEqual({
                ...player1,
                energy: 3,
                toFellOffTheBoard: -1,
                cellPosition: 11,
                cards: [],
                shouldReceiveCard: true,
            })
            expect(player2).toEqual({
                ...player2,
                energy: 0,
                toFellOffTheBoard: 2,
                cellPosition: 7,
                cards: [],
            })
        })
    })

    describe('current player lose and remains on the board', () => {
        beforeEach(() => {
            jest.spyOn(global.Math, 'random')
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(2 / 6)
                .mockReturnValueOnce(1 / 6)
                .mockReturnValueOnce(5 / 6)
                .mockReturnValueOnce(3 / 6)
                .mockReturnValueOnce(1 / 6)
        })

        afterEach(() => {
            jest.spyOn(global.Math, 'random').mockRestore()
        })

        it('happy path', () => {
            const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
            const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, player1)
                    if (i === 11) return createCell(i, undefined, player2)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
            const ctx = { currentPlayer: '0' }
            const targetCellPosition = 11

            const result = dropIn(G, ctx, targetCellPosition)

            expect(result).toBeUndefined()
            expect(G.atkDices).toEqual([6, 2, 1])
            expect(G.defDices).toEqual([5, 3, 1])
            expect(player1).toEqual({
                ...player1,
                energy: 1,
                toFellOffTheBoard: -1,
                cellPosition: 7,
                cards: [],
                shouldReceiveCard: true,
            })
            expect(player2).toEqual({
                ...player2,
                energy: 2,
                toFellOffTheBoard: -1,
                cellPosition: 11,
                cards: [],
            })
        })
    })

    describe('current player lose and fall off the board', () => {
        beforeEach(() => {
            jest.spyOn(global.Math, 'random')
                .mockReturnValueOnce(4 / 6)
                .mockReturnValueOnce(2 / 6)
                .mockReturnValueOnce(1 / 6)
                .mockReturnValueOnce(5 / 6)
                .mockReturnValueOnce(3 / 6)
                .mockReturnValueOnce(1 / 6)
        })

        afterEach(() => {
            jest.spyOn(global.Math, 'random').mockRestore()
        })

        it('happy path', () => {
            const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
            const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, player1)
                    if (i === 11) return createCell(i, undefined, player2)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = {
                players: [player1, player2],
                turn: 2,
                cells,
                currentMove: MOVE_DROP_IN,
                deck: [CardEnergy, CardEnergy],
            }
            const ctx = { currentPlayer: '0' }
            const targetCellPosition = 11

            const result = dropIn(G, ctx, targetCellPosition)

            expect(result).toBeUndefined()
            expect(G).toEqual({ ...G, atkDices: [4, 2, 1], defDices: [5, 3, 1], deck: [CardEnergy] })
            expect(player1).toEqual({
                ...player1,
                energy: 0,
                toFellOffTheBoard: 2,
                cellPosition: 7,
                cards: [],
                shouldReceiveCard: true,
            })
            expect(player2).toEqual({
                ...player2,
                energy: 3,
                toFellOffTheBoard: -1,
                cellPosition: 11,
                cards: [CardEnergy],
            })
        })
    })

    it(`when current move is not 'drop in' should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_MANEUVER }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 11

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when current player is blocked should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7, blocked: true }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 11

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when there is no player on target cell should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 22

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when current player there is no energy should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 0, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 11

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target player there is no energy should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 0, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 11

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target player is wearing Amulet should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11, activeCard: [CardAmulet] }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 11

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target player is using Hang Lose should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11, activeCard: [CardHangLoose] }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 11

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target player is not close to current player should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 12 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 12) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_DROP_IN }
        const ctx = { currentPlayer: '0' }
        const targetCellPosition = 12

        const result = dropIn(G, ctx, targetCellPosition)

        expect(result).toEqual(INVALID_MOVE)
    })
})
