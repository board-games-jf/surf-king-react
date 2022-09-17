import { CardStone } from '../Cards';
import { createPlayer, discardCardsIfNeeded, MAX_CARDS_ON_HAND } from '../SurfKingGame';

describe('SurfKingGame discardCardsIfNeeded', () => {
    it('happy path', () => {
        const player = createPlayer(0, [CardStone]);

        discardCardsIfNeeded(player, MAX_CARDS_ON_HAND);

        expect(player.cards).toHaveLength(1);
    });

    it('discard cards', () => {
        const player = createPlayer(0, new Array(MAX_CARDS_ON_HAND + 2).fill(CardStone));

        discardCardsIfNeeded(player, MAX_CARDS_ON_HAND - 1);

        expect(player.cards).toHaveLength(4);
    });
});