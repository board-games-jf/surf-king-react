import { INVALID_MOVE } from 'boardgame.io/core'
import MockedEvents, { mockedEndTurnFn } from '../../../helpers/tests'
import { MOVE_FORWARD } from '../../Board'
import { CardBottledWater, CardEnergy, CardStone } from '../../Cards'
import { createCell, createPlayer, GRID_SIZE, maneuver, MOVE_MANEUVER, MOVE_USE_CARD } from '../../SurfKingGame'

describe('SurfKingGame maneuver', () => {
    describe('maneuver valid', () => {
        describe('phaseA', () => {
            it('happy path', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 7 }
                const player2 = { ...createPlayer(1, []), cellPosition: 11 }
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
                    currentMove: MOVE_MANEUVER,
                    deck: [CardEnergy, CardEnergy],
                }
                const ctx = { phase: 'phaseA', numPlayers: 2, currentPlayer: '0' }
                const from = player1.cellPosition
                const to = from + MOVE_FORWARD

                const result = maneuver(G, ctx, from, to)

                expect(result).toBeUndefined()
                expect(G.deck).toEqual([CardEnergy])
                expect(player1).toEqual({
                    ...player1,
                    played: true,
                    energy: 3,
                    cards: [CardEnergy],
                    moved: true,
                    cellPosition: to,
                })
                expect(player2.played).toBeFalsy()
            })
        })

        describe('phaseB', () => {
            it('happy path', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 7 }
                const player2 = { ...createPlayer(1, []), cellPosition: 11 }
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
                    currentMove: MOVE_MANEUVER,
                    deck: [CardEnergy, CardEnergy],
                }
                const ctx = { phase: 'phaseB', numPlayers: 2, currentPlayer: '0', events: new MockedEvents() }
                const from = player1.cellPosition
                const to = from + MOVE_FORWARD

                const result = maneuver(G, ctx, from, to)

                expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                expect(result).toBeUndefined()
                expect(G.deck).toEqual([CardEnergy])
                expect(player1).toEqual({
                    ...player1,
                    played: true,
                    energy: 3,
                    cards: [CardEnergy],
                    moved: true,
                    cellPosition: to,
                })
                expect(player2.played).toBeFalsy()
            })

            it('there is another player fell of the board on target cell should change position with him without lose energy', () => {
                const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
                const player2 = {
                    ...createPlayer(1, []),
                    energy: 3,
                    cellPosition: 7 + MOVE_FORWARD,
                    fellOffTheBoard: 1,
                }
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 7) return createCell(i, undefined, player1)
                        if (i === 7 + MOVE_FORWARD) return createCell(i, undefined, player2)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = {
                    players: [player1, player2],
                    turn: 2,
                    cells,
                    currentMove: MOVE_MANEUVER,
                    deck: [CardEnergy, CardEnergy],
                }
                const ctx = { phase: 'phaseB', numPlayers: 2, currentPlayer: '0', events: new MockedEvents() }
                const from = player1.cellPosition
                const to = from + MOVE_FORWARD

                const result = maneuver(G, ctx, from, to)

                expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                expect(result).toBeUndefined()
                expect(G.deck).toEqual([CardEnergy])
                expect(player1).toEqual({
                    ...player1,
                    played: true,
                    energy: 3,
                    cards: [CardEnergy],
                    moved: true,
                    cellPosition: to,
                })
                expect(player2).toEqual({
                    ...player2,
                    played: false,
                    energy: 3,
                    cards: [],
                    fellOffTheBoard: 1,
                    moved: false,
                    cellPosition: from,
                })
            })

            it('current player has used a BottledWater card should move without lose energy', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 7, activeCard: [CardBottledWater] }
                const player2 = { ...createPlayer(1, []), cellPosition: 11 }
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
                    currentMove: MOVE_MANEUVER,
                    deck: [CardEnergy, CardEnergy],
                }
                const ctx = { phase: 'phaseB', numPlayers: 2, currentPlayer: '0', events: new MockedEvents() }
                const from = player1.cellPosition
                const to = from + MOVE_FORWARD

                const result = maneuver(G, ctx, from, to)

                expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                expect(result).toBeUndefined()
                expect(G.deck).toEqual([CardEnergy])
                expect(player1).toEqual({
                    ...player1,
                    played: true,
                    energy: 4,
                    cards: [CardEnergy],
                    moved: true,
                    activeCard: [],
                    cellPosition: to,
                })
            })
        })
    })

    it(`when current move is not 'maneuver' should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_USE_CARD }
        const ctx = { currentPlayer: '0' }
        const from = player1.cellPosition
        const to = from + MOVE_FORWARD

        const result = maneuver(G, ctx, from, to)

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
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_MANEUVER }
        const ctx = { currentPlayer: '0' }
        const from = player1.cellPosition
        const to = from + MOVE_FORWARD

        const result = maneuver(G, ctx, from, to)

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
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_MANEUVER }
        const ctx = { currentPlayer: '0' }
        const from = player1.cellPosition
        const to = from + MOVE_FORWARD

        const result = maneuver(G, ctx, from, to)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when current player is fall off the board should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7, fellOffTheBoard: 2 }
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
        const from = player1.cellPosition
        const to = from + MOVE_FORWARD

        const result = maneuver(G, ctx, from, to)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target cell has another player is not fall off the board should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 7 + MOVE_FORWARD }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 7 + MOVE_FORWARD) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_MANEUVER }
        const ctx = { currentPlayer: '0' }
        const from = player1.cellPosition
        const to = player2.cellPosition

        const result = maneuver(G, ctx, from, to)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target cell has a Stone should return 'INVALID_MOVE'`, () => {
        const player1 = { ...createPlayer(0, []), energy: 3, cellPosition: 7 }
        const player2 = { ...createPlayer(1, []), energy: 3, cellPosition: 11 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 7) return createCell(i, undefined, player1)
                if (i === 11) return createCell(i, undefined, player2)
                if (i === 7 + MOVE_FORWARD) return createCell(i, CardStone)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], turn: 2, cells, currentMove: MOVE_MANEUVER }
        const ctx = { currentPlayer: '0' }
        const from = player1.cellPosition
        const to = from + MOVE_FORWARD

        const result = maneuver(G, ctx, from, to)

        expect(result).toEqual(INVALID_MOVE)
    })

    it(`when target cell is not close to current cell should return 'INVALID_MOVE'`, () => {
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
        const from = player1.cellPosition
        const to = from + 2 * MOVE_FORWARD

        const result = maneuver(G, ctx, from, to)

        expect(result).toEqual(INVALID_MOVE)
    })
})
