import { CardAmulet, CardStone } from '../Cards';
import { createCell, createPlayer, decreaseRemainingTurnForActiveCards, GRID_SIZE } from '../SurfKingGame';

describe('SurfKingGame decreaseRemainingTurnForActiveCards', () => {
    it('no cards', () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 0 };
        const player2 = { ...createPlayer(1, []), cellPosition: 1 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 0) return createCell(i, undefined, player1);
            if (i === 1) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells, discardedCards: [] };
        const ctx = { currentPlayer: '1' };
        const playerPosition = 0;

        decreaseRemainingTurnForActiveCards(G, ctx, playerPosition);

        expect(player1.activeCard).toEqual([]);
        expect(G.discardedCards).toHaveLength(0);
    });

    it('when card has 1 remaining turn, should be removed', () => {
        const stone1 = { ...CardStone, RemaningTurn: 1, CellPosition: 10 };
        const stone2 = { ...CardStone, RemaningTurn: 1, CellPosition: 11 };
        const player1 = {
            ...createPlayer(0, []),
            cellPosition: 0,
            cards: [stone1, stone2],
            activeCard: [stone1, stone2],
        };
        const player2 = { ...createPlayer(1, []), cellPosition: 1 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 0) return createCell(i, undefined, player1);
            if (i === 1) return createCell(i, undefined, player2);
            if (i === stone1.CellPosition) return createCell(i, stone1, undefined);
            if (i === stone2.CellPosition) return createCell(i, stone2, undefined);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells, discardedCards: [] };
        const ctx = { currentPlayer: '1' };
        const playerPosition = 0;

        decreaseRemainingTurnForActiveCards(G, ctx, playerPosition);

        expect(player1.activeCard).toEqual([]);
        expect(G.discardedCards).toHaveLength(0);
        expect(G.cells[stone1.CellPosition].obstacle).toBeUndefined();
        expect(G.cells[stone2.CellPosition].obstacle).toBeUndefined();
    });

    it('when card has 2 or more remaining turns, should be decreased in 1 unit', () => {
        const stone1 = { ...CardStone, RemaningTurn: 1, CellPosition: 10 };
        const stone2 = { ...CardStone, RemaningTurn: 2, CellPosition: 11 };
        const player1 = {
            ...createPlayer(0, []),
            cellPosition: 0,
            cards: [stone1, stone2],
            activeCard: [stone1, stone2],
        };
        const player2 = { ...createPlayer(1, []), cellPosition: 1 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 0) return createCell(i, undefined, player1);
            if (i === 1) return createCell(i, undefined, player2);
            if (i === stone1.CellPosition) return createCell(i, stone1, undefined);
            if (i === stone2.CellPosition) return createCell(i, stone2, undefined);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells, discardedCards: [] };
        const ctx = { currentPlayer: '1' };
        const playerPosition = 0;

        decreaseRemainingTurnForActiveCards(G, ctx, playerPosition);

        expect(player1.activeCard).toEqual([{ ...stone2, RemaningTurn: 1 }]);
        expect(G.discardedCards).toHaveLength(0);
        expect(G.cells[stone1.CellPosition].obstacle).toBeUndefined();
        expect(G.cells[stone2.CellPosition].obstacle).toEqual({ ...stone2, RemaningTurn: 1 });
    });

    it('when card has 1 remaining turn and card is not an obstacle, should be removed', () => {
        const amulet = { ...CardAmulet, RemaningTurn: 1 };
        const player1 = {
            ...createPlayer(0, []),
            cellPosition: 0,
            cards: [amulet],
            activeCard: [amulet],
        };
        const player2 = { ...createPlayer(1, []), cellPosition: 1 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 0) return createCell(i, undefined, player1);
            if (i === 1) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells, discardedCards: [] };
        const ctx = { currentPlayer: '1' };
        const playerPosition = 0;

        decreaseRemainingTurnForActiveCards(G, ctx, playerPosition);

        expect(player1.activeCard).toEqual([]);
        expect(G.discardedCards).toEqual([amulet]);
    });
});