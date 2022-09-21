import { CardAmulet, CardEnergy, CardStone } from '../Cards'
import { createPlayer, transferRandomCardFromPlayerToOtherOne } from '../SurfKingGame'

describe('SurfKingGame transferRandomCardFromPlayerToOtherOne', () => {
    it('happy path', () => {
        const fromPlayer = { ...createPlayer(0, []), cards: [CardStone] }
        const toPlayer = { ...createPlayer(1, []), cards: [] }

        transferRandomCardFromPlayerToOtherOne(fromPlayer, toPlayer)

        expect(fromPlayer).toEqual({ ...fromPlayer, cards: [] })
        expect(toPlayer).toEqual({ ...toPlayer, cards: [CardStone] })
    })

    it('should not transfer an active card - fromPlayer does not have a transferable Stone card', () => {
        const fromPlayer = {
            ...createPlayer(0, []),
            cards: [{ ...CardStone, CellPosition: 10 }],
            activeCard: [{ ...CardStone, CellPosition: 10, RemainingTurn: 3 }],
        }
        const toPlayer = { ...createPlayer(1, []), cards: [] }

        transferRandomCardFromPlayerToOtherOne(fromPlayer, toPlayer)

        expect(fromPlayer).toEqual({
            ...fromPlayer,
            cards: [{ ...CardStone, CellPosition: 10 }],
            activeCard: [{ ...CardStone, CellPosition: 10, RemainingTurn: 3 }],
        })
        expect(toPlayer).toEqual({ ...toPlayer, cards: [] })
    })

    it('should not transfer an active card - fromPlayer has a transferable Stone card', () => {
        const fromPlayer = {
            ...createPlayer(0, []),
            cards: [CardStone, { ...CardStone, CellPosition: 10 }],
            activeCard: [{ ...CardStone, CellPosition: 10, RemainingTurn: 3 }],
        }
        const toPlayer = { ...createPlayer(1, []), cards: [] }

        transferRandomCardFromPlayerToOtherOne(fromPlayer, toPlayer)

        expect(fromPlayer).toEqual({
            ...fromPlayer,
            cards: [{ ...CardStone, CellPosition: 10 }],
            activeCard: [{ ...CardStone, CellPosition: 10, RemainingTurn: 3 }],
        })
        expect(toPlayer).toEqual({ ...toPlayer, cards: [CardStone] })
    })

    it('should not transfer an active card - fromPlayer does not have a transferable Amulet card', () => {
        const fromPlayer = {
            ...createPlayer(0, []),
            cards: [CardAmulet],
            activeCard: [CardAmulet],
        }
        const toPlayer = { ...createPlayer(1, []), cards: [] }

        transferRandomCardFromPlayerToOtherOne(fromPlayer, toPlayer)

        expect(fromPlayer).toEqual({
            ...fromPlayer,
            cards: [CardAmulet],
            activeCard: [CardAmulet],
        })
        expect(toPlayer).toEqual({ ...toPlayer, cards: [] })
    })

    it('should not transfer an active card - fromPlayer has a transferable Amulet card', () => {
        const fromPlayer = {
            ...createPlayer(0, []),
            cards: [CardEnergy, CardAmulet],
            activeCard: [CardAmulet],
        }
        const toPlayer = { ...createPlayer(1, []), cards: [] }

        transferRandomCardFromPlayerToOtherOne(fromPlayer, toPlayer)

        expect(fromPlayer).toEqual({
            ...fromPlayer,
            cards: [CardAmulet],
            activeCard: [CardAmulet],
        })
        expect(toPlayer).toEqual({ ...toPlayer, cards: [CardEnergy] })
    })
})
