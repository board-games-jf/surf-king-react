import MockedEvents, { mockedEndTurnFn } from '../../../helpers/tests'
import { CardEnergy, CardStone } from '../../Cards'
import {
    createCell,
    createPlayer,
    GRID_SIZE,
    MOVE_DROP_IN,
    MOVE_MANEUVER,
    MOVE_USE_CARD,
    pass,
} from '../../SurfKingGame'

describe('SurfKingGame pass', () => {
    describe('MOVE_USE_CARD -> MOVE_DROP_IN', () => {
        it('current player has fell off the board', () => {
            const currentPlayer = { ...createPlayer(0, []), cellPosition: 7, energy: 0, fellOffTheBoard: 1 }
            const nextPlayer = { ...createPlayer(1, []), cellPosition: 11, energy: 3 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, currentPlayer)
                    if (i === 11) return createCell(i, undefined, nextPlayer)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = {
                players: [currentPlayer, nextPlayer],
                turn: 2,
                currentMove: MOVE_USE_CARD,
                deck: [CardEnergy, CardEnergy],
                cells,
            }
            const ctx = { currentPlayer: '0' }

            pass(G, ctx)

            expect(G).toEqual({ ...G, currentMove: MOVE_DROP_IN, turn: 2 })
            expect(currentPlayer).toEqual({ ...currentPlayer, blocked: true, energy: 1, fellOffTheBoard: -1 })
        })

        it('current player has not fell off the board', () => {
            const currentPlayer = { ...createPlayer(0, []), cellPosition: 7 }
            const nextPlayer = { ...createPlayer(1, []), cellPosition: 11 }
            const cells = [
                ...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 7) return createCell(i, undefined, currentPlayer)
                    if (i === 11) return createCell(i, undefined, nextPlayer)
                    return createCell(i, undefined, undefined)
                }),
            ]
            const G = {
                players: [currentPlayer, nextPlayer],
                turn: 2,
                currentMove: MOVE_USE_CARD,
                deck: [CardEnergy, CardEnergy],
                cells,
            }
            const ctx = { currentPlayer: '0' }

            pass(G, ctx)

            expect(G).toEqual({ ...G, currentMove: MOVE_DROP_IN, turn: 2 })
            expect(currentPlayer).toEqual({ ...currentPlayer, blocked: false })
        })
    })

    it('MOVE_DROP_IN -> MOVE_MANEUVER', () => {
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
            currentMove: MOVE_DROP_IN,
            deck: [CardEnergy, CardEnergy],
            cells,
        }
        const ctx = { currentPlayer: '0' }

        pass(G, ctx)

        expect(G).toEqual({ ...G, currentMove: MOVE_MANEUVER, turn: 2 })
        expect(player1.played).toBeFalsy()
    })

    describe('MOVE_MANEUVER', () => {
        it('phaseA', () => {
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
            const ctx = { phase: 'phaseA', currentPlayer: '0' }

            pass(G, ctx)

            expect(G).toEqual({ ...G, currentMove: MOVE_MANEUVER, turn: 2 })
            expect(player1.played).toBeTruthy()
        })

        describe('phaseB', () => {
            describe('everyone has been played', () => {
                it('next player has active cards', () => {
                    const stone1 = { ...CardStone, RemaningTurn: 2, CellPosition: 14 }
                    const stone2 = { ...CardStone, RemaningTurn: 2, CellPosition: 15 }
                    const nextPlayer = {
                        ...createPlayer(0, []),
                        cellPosition: 7,
                        played: true,
                        activeCard: [stone1],
                    }
                    const currentPlayer = {
                        ...createPlayer(1, []),
                        cellPosition: 11,
                        played: true,
                        activeCard: [stone2],
                    }
                    const cells = [
                        ...Array.from({ length: GRID_SIZE }, (_, i) => {
                            if (i === 7) return createCell(i, undefined, nextPlayer)
                            if (i === 11) return createCell(i, undefined, currentPlayer)
                            if (i === stone1.CellPosition) return createCell(i, stone1)
                            if (i === stone2.CellPosition) return createCell(i, stone2)
                            return createCell(i, undefined, undefined)
                        }),
                    ]
                    const G = {
                        players: [nextPlayer, currentPlayer],
                        turn: 2,
                        cells,
                        currentMove: MOVE_MANEUVER,
                        deck: [CardEnergy, CardEnergy],
                    }
                    const ctx = { phase: 'phaseB', currentPlayer: '1', events: new MockedEvents() }

                    pass(G, ctx)

                    expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                    expect(G).toEqual({ ...G, currentMove: MOVE_USE_CARD, turn: 3 })
                    expect(nextPlayer).toEqual({
                        ...nextPlayer,
                        played: false,
                        activeCard: [{ ...stone1, RemaningTurn: 1 }],
                    })
                    expect(currentPlayer).toEqual({
                        ...currentPlayer,
                        played: false,
                        activeCard: [{ ...stone2, RemaningTurn: 2 }],
                    })
                    expect(stone1.RemaningTurn).toEqual(1)
                    expect(stone2.RemaningTurn).toEqual(2)
                    expect(cells[stone1.CellPosition].obstacle).toEqual({ ...stone1, RemaningTurn: 1 })
                    expect(cells[stone2.CellPosition].obstacle).toEqual({ ...stone2, RemaningTurn: 2 })
                })

                it('next player has no active cards', () => {
                    const stone = { ...CardStone, RemaningTurn: 2, CellPosition: 14 }
                    const nextPlayer = {
                        ...createPlayer(0, []),
                        cellPosition: 7,
                        played: true,
                        activeCard: [],
                    }
                    const currentPlayer = {
                        ...createPlayer(1, []),
                        cellPosition: 11,
                        played: true,
                        activeCard: [stone],
                    }
                    const cells = [
                        ...Array.from({ length: GRID_SIZE }, (_, i) => {
                            if (i === 7) return createCell(i, undefined, nextPlayer)
                            if (i === 11) return createCell(i, undefined, currentPlayer)
                            if (i === stone.CellPosition) return createCell(i, stone)
                            return createCell(i, undefined, undefined)
                        }),
                    ]
                    const G = {
                        players: [nextPlayer, currentPlayer],
                        turn: 2,
                        cells,
                        currentMove: MOVE_MANEUVER,
                        deck: [CardEnergy, CardEnergy],
                    }
                    const ctx = { phase: 'phaseB', currentPlayer: '1', events: new MockedEvents() }

                    pass(G, ctx)

                    expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                    expect(G).toEqual({ ...G, currentMove: MOVE_USE_CARD, turn: 3 })
                    expect(nextPlayer).toEqual({
                        ...nextPlayer,
                        played: false,
                        activeCard: [],
                    })
                    expect(currentPlayer).toEqual({
                        ...currentPlayer,
                        played: false,
                        activeCard: [{ ...stone, RemaningTurn: 2 }],
                    })
                    expect(stone.RemaningTurn).toEqual(2)
                    expect(cells[stone.CellPosition].obstacle).toEqual({ ...stone, RemaningTurn: 2 })
                })
            })

            describe('everyone has not played yet', () => {
                it('current player has not been moved', () => {
                    const currentPlayer = {
                        ...createPlayer(1, []),
                        energy: 3,
                        cellPosition: 7,
                        played: false,
                    }
                    const nextPlayer = {
                        ...createPlayer(0, []),
                        cellPosition: 11,
                        played: false,
                    }
                    const cells = [
                        ...Array.from({ length: GRID_SIZE }, (_, i) => {
                            if (i === 7) return createCell(i, undefined, currentPlayer)
                            if (i === 11) return createCell(i, undefined, nextPlayer)
                            return createCell(i, undefined, undefined)
                        }),
                    ]
                    const G = {
                        players: [currentPlayer, nextPlayer],
                        turn: 2,
                        cells,
                        currentMove: MOVE_MANEUVER,
                        deck: [CardEnergy, CardEnergy],
                    }
                    const ctx = { phase: 'phaseB', currentPlayer: '0', events: new MockedEvents() }

                    pass(G, ctx)

                    expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                    expect(G).toEqual({ ...G, currentMove: MOVE_USE_CARD, turn: 2 })
                    expect(currentPlayer).toEqual({
                        ...currentPlayer,
                        energy: 4,
                        moved: false,
                        played: true,
                        cards: [],
                    })
                    expect(nextPlayer).toEqual({
                        ...nextPlayer,
                        played: false,
                    })
                })

                it('next player has active cards', () => {
                    const stone1 = { ...CardStone, RemaningTurn: 2, CellPosition: 14 }
                    const stone2 = { ...CardStone, RemaningTurn: 2, CellPosition: 15 }
                    const currentPlayer = {
                        ...createPlayer(0, []),
                        cellPosition: 7,
                        played: false,
                        activeCard: [stone1],
                    }
                    const nextPlayer = { ...createPlayer(1, []), cellPosition: 11, played: false, activeCard: [stone2] }
                    const cells = [
                        ...Array.from({ length: GRID_SIZE }, (_, i) => {
                            if (i === 7) return createCell(i, undefined, currentPlayer)
                            if (i === 11) return createCell(i, undefined, nextPlayer)
                            if (i === stone1.CellPosition) return createCell(i, stone1)
                            if (i === stone2.CellPosition) return createCell(i, stone2)
                            return createCell(i, undefined, undefined)
                        }),
                    ]
                    const G = {
                        players: [currentPlayer, nextPlayer],
                        turn: 2,
                        cells,
                        currentMove: MOVE_MANEUVER,
                        deck: [CardEnergy, CardEnergy],
                    }
                    const ctx = { phase: 'phaseB', currentPlayer: '0', events: new MockedEvents() }

                    pass(G, ctx)

                    expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                    expect(G).toEqual({ ...G, currentMove: MOVE_USE_CARD, turn: 2 })
                    expect(currentPlayer).toEqual({
                        ...currentPlayer,
                        played: true,
                        activeCard: [{ ...stone1, RemaningTurn: 2 }],
                    })
                    expect(nextPlayer).toEqual({
                        ...nextPlayer,
                        played: false,
                        activeCard: [{ ...stone2, RemaningTurn: 1 }],
                    })
                    expect(stone1.RemaningTurn).toEqual(2)
                    expect(stone2.RemaningTurn).toEqual(1)
                    expect(cells[stone1.CellPosition].obstacle).toEqual({ ...stone1, RemaningTurn: 2 })
                    expect(cells[stone2.CellPosition].obstacle).toEqual({ ...stone2, RemaningTurn: 1 })
                })

                it('next player has no active cards', () => {
                    const stone = { ...CardStone, RemaningTurn: 2, CellPosition: 14 }
                    const currentPlayer = {
                        ...createPlayer(0, []),
                        cellPosition: 7,
                        played: false,
                        activeCard: [stone],
                    }
                    const nextPlayer = { ...createPlayer(1, []), cellPosition: 11, played: false, activeCard: [] }
                    const cells = [
                        ...Array.from({ length: GRID_SIZE }, (_, i) => {
                            if (i === 7) return createCell(i, undefined, currentPlayer)
                            if (i === 11) return createCell(i, undefined, nextPlayer)
                            if (i === stone.CellPosition) return createCell(i, stone)
                            return createCell(i, undefined, undefined)
                        }),
                    ]
                    const G = {
                        players: [currentPlayer, nextPlayer],
                        turn: 2,
                        cells,
                        currentMove: MOVE_MANEUVER,
                        deck: [CardEnergy, CardEnergy],
                    }
                    const ctx = { phase: 'phaseB', currentPlayer: '0', events: new MockedEvents() }

                    pass(G, ctx)

                    expect(mockedEndTurnFn.mock.calls.length).toEqual(1)
                    expect(G).toEqual({ ...G, currentMove: MOVE_USE_CARD, turn: 2 })
                    expect(currentPlayer).toEqual({
                        ...currentPlayer,
                        played: true,
                        activeCard: [{ ...stone, RemaningTurn: 2 }],
                    })
                    expect(nextPlayer).toEqual({
                        ...nextPlayer,
                        played: false,
                        activeCard: [],
                    })
                    expect(stone.RemaningTurn).toEqual(2)
                    expect(cells[stone.CellPosition].obstacle).toEqual({ ...stone, RemaningTurn: 2 })
                })
            })
        })
    })
})
