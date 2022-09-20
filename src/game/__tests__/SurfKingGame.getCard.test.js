import { CardEnergy, CardStone } from '../Cards'
import { createPlayer, getCard } from '../SurfKingGame'

describe('SurfKingGame getCard', () => {
    describe('when current player should receive card', () => {
        it('and not needed discard cards to receive a new one', () => {
            const currentPlayer = { ...createPlayer(0, []), shouldReceiveCard: true, cards: [] }
            const nextPlayer = createPlayer(1, [])
            const G = { players: [currentPlayer, nextPlayer], deck: [CardEnergy, CardEnergy] }
            const ctx = { currentPlayer: '0' }

            getCard(G, ctx)

            expect(G).toEqual({
                ...G,
                players: [{ ...currentPlayer, shouldReceiveCard: false, cards: [CardEnergy] }, nextPlayer],
                deck: [CardEnergy],
            })
        })

        it('and needed discard cards to receive a new one', () => {
            const currentPlayer = {
                ...createPlayer(0, []),
                shouldReceiveCard: true,
                cards: [CardStone, CardStone, CardStone, CardStone, CardStone],
            }
            const nextPlayer = createPlayer(1, [])
            const G = { players: [currentPlayer, nextPlayer], deck: [CardEnergy, CardEnergy] }
            const ctx = { currentPlayer: '0' }

            getCard(G, ctx)

            expect(G).toEqual({
                ...G,
                players: [
                    {
                        ...currentPlayer,
                        shouldReceiveCard: false,
                        cards: [CardStone, CardStone, CardStone, CardStone, CardEnergy],
                    },
                    nextPlayer,
                ],
                deck: [CardEnergy],
            })
        })
    })

    describe('when current player should not receive card', () => {
        it('and not needed discard cards', () => {
            const currentPlayer = { ...createPlayer(0, []), shouldReceiveCard: false, cards: [] }
            const nextPlayer = createPlayer(1, [])
            const G = { players: [currentPlayer, nextPlayer], deck: [CardEnergy, CardEnergy] }
            const ctx = { currentPlayer: '0' }

            getCard(G, ctx)

            expect(G).toEqual({
                ...G,
                players: [{ ...currentPlayer, cards: [] }, nextPlayer],
                deck: [CardEnergy, CardEnergy],
            })
        })

        it('and needed discard cards', () => {
            const currentPlayer = {
                ...createPlayer(0, []),
                shouldReceiveCard: false,
                cards: [CardStone, CardStone, CardStone, CardStone, CardStone, CardStone],
            }
            const nextPlayer = createPlayer(1, [])
            const G = { players: [currentPlayer, nextPlayer], deck: [CardEnergy, CardEnergy] }
            const ctx = { currentPlayer: '0' }

            getCard(G, ctx)

            expect(G).toEqual({
                ...G,
                players: [
                    { ...currentPlayer, cards: [CardStone, CardStone, CardStone, CardStone, CardStone] },
                    nextPlayer,
                ],
                deck: [CardEnergy, CardEnergy],
            })
        })
    })
})
