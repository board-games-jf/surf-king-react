import { CardStone } from '../Cards';
import { createPlayer, MAX_ENERGY } from '../SurfKingGame';

describe('SurfKingGame createPlayer', () => {
    it('happy path', () => {
        const position = 1;
        const cards = [CardStone, CardStone];

        const cell = createPlayer(position, cards);

        expect(cell).toEqual({
            position,
            cards,
            played: false,
            shouldReceiveCard: false,
            blocked: false,
            energy: MAX_ENERGY,
            cellPosition: -1,
            toFellOffTheBoard: -1,
            activeCard: [],
        });
    });
});