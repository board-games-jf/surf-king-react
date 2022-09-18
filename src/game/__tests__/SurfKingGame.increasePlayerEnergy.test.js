import {
    CardCoconut,
    CardEnergy,
    CardEnergyX2,
    CardEnergyX3,
    CardLifeGuardFloat,
    CardStone,
    CardSwimmingFin,
} from '../Cards'
import { createPlayer, getDeckCard, increasePlayerEnergy, MAX_ENERGY } from '../SurfKingGame'

describe('SurfKingGame increasePlayerEnergy', () => {
    describe('Coconut card', () => {
        it('happy path', () => {
            const player = { ...createPlayer(0, []), energy: 1 }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardCoconut)

            expect(player.energy).toEqual(MAX_ENERGY)
        })

        it('when player has max energy, should not change energy', () => {
            const player = { ...createPlayer(0, []), energy: MAX_ENERGY }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardCoconut)

            expect(player.energy).toEqual(MAX_ENERGY)
        })
    })

    describe('Energy card', () => {
        it('happy path', () => {
            const player = { ...createPlayer(0, []), energy: 1 }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardEnergy)

            expect(player.energy).toEqual(2)
        })

        it('when player has max energy, should not change energy', () => {
            const player = { ...createPlayer(0, []), energy: MAX_ENERGY }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardEnergy)

            expect(player.energy).toEqual(MAX_ENERGY)
        })
    })

    describe('Energy x2 card', () => {
        it('happy path', () => {
            const player = { ...createPlayer(0, []), energy: 1 }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardEnergyX2)

            expect(player.energy).toEqual(3)
        })

        it('when player has max energy, should not change energy', () => {
            const player = { ...createPlayer(0, []), energy: MAX_ENERGY }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardEnergyX2)

            expect(player.energy).toEqual(MAX_ENERGY)
        })
    })

    describe('Energy x3 card', () => {
        it('happy path', () => {
            const player = { ...createPlayer(0, []), energy: 1 }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardEnergyX3)

            expect(player.energy).toEqual(4)
        })

        it('when player has max energy, should not change energy', () => {
            const player = { ...createPlayer(0, []), energy: MAX_ENERGY }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardEnergyX3)

            expect(player.energy).toEqual(MAX_ENERGY)
        })
    })

    describe('LifeGuardFloat card', () => {
        it('happy path', () => {
            const player = { ...createPlayer(0, []), energy: 1 }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardLifeGuardFloat)

            expect(player.energy).toEqual(3)
        })

        it('when player has max energy, should not change energy', () => {
            const player = { ...createPlayer(0, []), energy: MAX_ENERGY }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardLifeGuardFloat)

            expect(player.energy).toEqual(MAX_ENERGY)
        })
    })

    describe('SwimmingFin card', () => {
        it('happy path', () => {
            const player = { ...createPlayer(0, []), energy: 1 }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardSwimmingFin)

            expect(player.energy).toEqual(2)
        })

        it('when player has max energy, should not change energy', () => {
            const player = { ...createPlayer(0, []), energy: MAX_ENERGY }
            const G = { players: [player] }
            const ctx = { currentPlayer: '0' }

            increasePlayerEnergy(G, ctx, CardSwimmingFin)

            expect(player.energy).toEqual(MAX_ENERGY)
        })
    })
})
