import { CardEnergy, CardStone } from '../Cards';
import { createPlayer, discardCardsIfNeeded, MAX_CARDS_ON_HAND } from '../SurfKingGame';

describe('SurfKingGame discardCardsIfNeeded', () => {
    it('happy path', () => {
        const player = createPlayer(0, [CardStone]);
        const G = { discardedCards: [] };

        discardCardsIfNeeded(G, player, MAX_CARDS_ON_HAND);

        expect(player.cards).toHaveLength(1);
        expect(G.discardedCards).toHaveLength(0);
    });

    it('discard obstacle cards', () => {
        const player = createPlayer(0, new Array(MAX_CARDS_ON_HAND + 2).fill(CardStone));
        const G = { discardedCards : [] };

        discardCardsIfNeeded(G, player, MAX_CARDS_ON_HAND - 1);

        expect(player.cards).toHaveLength(4);
        expect(G.discardedCards).toHaveLength(0);
    });

    it('discard non obstacle cards', () => {
        const player = createPlayer(0, new Array(MAX_CARDS_ON_HAND + 2).fill(CardEnergy));
        const G = { discardedCards : [] };

        discardCardsIfNeeded(G, player, MAX_CARDS_ON_HAND - 1);

        expect(player.cards).toHaveLength(4);
        expect(G.discardedCards).toEqual([CardEnergy, CardEnergy, CardEnergy]);
    });
});