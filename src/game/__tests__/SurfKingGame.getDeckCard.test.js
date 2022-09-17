import { CardEnergy, CardStone } from '../Cards';
import { getDeckCard } from '../SurfKingGame';

describe('SurfKingGame getDeckCard', () => {
    it('happy path', () => {
        const G = { deck: [CardStone] };
        const card = getDeckCard(G);

        expect(card).toEqual(CardStone);
        expect(G.deck).toHaveLength(0);
    });

    it('when deck is empty, should recreate it with discarded cards', () => {
        const G = { deck: [], discardedCards: [CardEnergy, CardEnergy] };
        const card = getDeckCard(G);

        expect(card).toEqual(CardEnergy);
        expect(G.deck).toHaveLength(1);
    });
});