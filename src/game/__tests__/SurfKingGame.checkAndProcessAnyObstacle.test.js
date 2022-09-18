import { MOVE_BACKWARD, MOVE_FORWARD } from '../Board'
import { CardCyclone, CardIsland, CardShark, CardStone, CardStorm } from '../Cards'
import { checkAndProcessAnyObstacle, createCell, createPlayer, GRID_SIZE } from '../SurfKingGame'

describe('SurfKingGame checkAndProcessAnyObstacle', () => {
    it('no obstacles', () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 0 }
        const player2 = { ...createPlayer(1, []), cellPosition: 1 }
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], cells }
        const ctx = { currentPlayer: '0' }
        const to = 7
        const energyToLose = 0

        const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

        expect({ newTo, newEnergyToLose }).toEqual({ newTo: to, newEnergyToLose: energyToLose })
    })

    it(`when the 'to' cell has an Island obstacle, the player should gain 2 energies`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 0 }
        const player2 = { ...createPlayer(1, []), cellPosition: 1 }
        const to = 7
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                if (i === to) return createCell(i, CardIsland, undefined)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], cells }
        const ctx = { currentPlayer: '0' }
        const energyToLose = 0

        const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

        expect({ newTo, newEnergyToLose }).toEqual({ newTo: to, newEnergyToLose: energyToLose - 2 })
    })

    it(`when the 'to' cell has a Storm obstacle, the player should lose 1 energy`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 0 }
        const player2 = { ...createPlayer(1, []), cellPosition: 1 }
        const to = 7
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                if (i === to) return createCell(i, CardStorm, undefined)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], cells }
        const ctx = { currentPlayer: '0' }
        const energyToLose = 0

        const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

        expect({ newTo, newEnergyToLose }).toEqual({ newTo: to, newEnergyToLose: energyToLose + 1 })
    })

    it(`when the 'to' cell has a Shark obstacle, the player should lose 2 energies`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 0 }
        const player2 = { ...createPlayer(1, []), cellPosition: 1 }
        const to = 7
        const cells = [
            ...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1)
                if (i === 1) return createCell(i, undefined, player2)
                if (i === to) return createCell(i, CardShark, undefined)
                return createCell(i, undefined, undefined)
            }),
        ]
        const G = { players: [player1, player2], cells }
        const ctx = { currentPlayer: '0' }
        const energyToLose = 0

        const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

        expect({ newTo, newEnergyToLose }).toEqual({ newTo: to, newEnergyToLose: energyToLose + 2 })
    })

    describe(`when the 'to' cell has a Cyclone obstacle`, () => {
        describe(`and Cyclone move player forward`, () => {
            beforeEach(() => {
                const diceMoveForward = 0
                jest.spyOn(global.Math, 'random').mockReturnValue(diceMoveForward)
            })

            afterEach(() => {
                jest.spyOn(global.Math, 'random').mockRestore()
            })

            it(`and new 'to' cell is unoccupied`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({ newTo: to + MOVE_FORWARD, newEnergyToLose: energyToLose })
            })

            it(`and new 'to' cell has an Island obstacle, the player should gain 2 energies`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        if (i === to + MOVE_FORWARD) return createCell(i, CardIsland, undefined)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({
                    newTo: to + MOVE_FORWARD,
                    newEnergyToLose: energyToLose - 2,
                })
            })

            it(`and new 'to' cell has a Storm obstacle, the player should lose 1 energy`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        if (i === to + MOVE_FORWARD) return createCell(i, CardStorm, undefined)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({
                    newTo: to + MOVE_FORWARD,
                    newEnergyToLose: energyToLose + 1,
                })
            })

            it(`and new 'to' cell has a Shark obstacle, the player should lose 2 energies`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        if (i === to + MOVE_FORWARD) return createCell(i, CardShark, undefined)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({
                    newTo: to + MOVE_FORWARD,
                    newEnergyToLose: energyToLose + 2,
                })
            })

            it(`and new 'to' cell has a Stone obstacle, the player should move forward again`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        if (i === to + MOVE_FORWARD) return createCell(i, CardStone, undefined)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({
                    newTo: to + MOVE_FORWARD + MOVE_FORWARD,
                    newEnergyToLose: energyToLose,
                })
            })

            it(`and new 'to' cell has another player, the player should move forward again`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        if (i === to + MOVE_FORWARD) return createCell(i, undefined, player2)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({
                    newTo: to + MOVE_FORWARD + MOVE_FORWARD,
                    newEnergyToLose: energyToLose,
                })
            })
        })

        describe(`and Cyclone move player backward`, () => {
            beforeEach(() => {
                const diceMoveBackward = 3 / 6
                jest.spyOn(global.Math, 'random').mockReturnValue(diceMoveBackward)
            })

            afterEach(() => {
                jest.spyOn(global.Math, 'random').mockRestore()
            })

            it(`for the same position, the player should be moved`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, undefined, player1)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({ newTo: 0, newEnergyToLose: energyToLose })
            })

            xit(`and new 'to' cell has a Stone obstacle, the player should move backward again`, () => {
                // TODO: Check when "To" is negative.
                const player1 = { ...createPlayer(0, []), cellPosition: 0 }
                const player2 = { ...createPlayer(1, []), cellPosition: 1 }
                const to = 7
                const cells = [
                    ...Array.from({ length: GRID_SIZE }, (_, i) => {
                        if (i === 0) return createCell(i, CardStone, undefined)
                        if (i === 1) return createCell(i, undefined, player2)
                        if (i === to) return createCell(i, CardCyclone, undefined)
                        if (i === 14) return createCell(i, undefined, player1)
                        return createCell(i, undefined, undefined)
                    }),
                ]
                const G = { players: [player1, player2], cells }
                const ctx = { currentPlayer: '0' }
                const energyToLose = 0

                const { newTo, newEnergyToLose } = checkAndProcessAnyObstacle(G, ctx, to, energyToLose)

                expect({ newTo, newEnergyToLose }).toEqual({
                    newTo: to + MOVE_BACKWARD,
                    newEnergyToLose: energyToLose,
                })
            })
        })
    })
})
