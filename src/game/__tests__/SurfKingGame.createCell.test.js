import { CardStone } from '../Cards';
import { createCell } from '../SurfKingGame';

describe('SurfKingGame createCell', () => {
    it('happy path', () => {
        const position = 1;
        const obstacle = CardStone;
        const player = {};

        const cell = createCell(position, obstacle, player);

        expect(cell).toEqual({ position, obstacle, player });
    });
});