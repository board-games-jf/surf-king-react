import { CardAmulet, CardCoconut, CardHangLoose, CardStone } from '../Cards';
import { createCell, createPlayer, executeCardAction, GRID_SIZE, MAX_ENERGY } from '../SurfKingGame';

describe('SurfKingGame executeCardAction', () => {
    describe('Stone card', () => {
        it('happy path', () => {
            const card = CardStone;
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], turn: 2, discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const targetCellPosition = 10;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1).toEqual({
                ...player1,
                cards: [card],
                activeCard: [{ ...card, RemaningTurn: 3, CellPosition: targetCellPosition }],
            });
            expect(G.discardedCards).toHaveLength(0);
        });

        it('card has already been used before', () => {
            const card = CardStone;
            const targetCellPosition = 10;
            const player1 = { 
                ...createPlayer(0, [card]),
                activeCard: [{ ...card, RemaningTurn: 1, CellPosition: targetCellPosition }],
            };
            const player2 = createPlayer(1, []);
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                if (i === targetCellPosition) return createCell(i, card, undefined);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], turn: 2, discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(player1).toEqual({
                ...player1,
                cards: [card],
                activeCard: [{ ...card, RemaningTurn: 1, CellPosition: targetCellPosition }],
            });
            expect(G.discardedCards).toHaveLength(0);
        });

        it('target cell has been occupied', () => {
            const card = CardStone;
            const targetCellPosition = 10;
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                if (i === targetCellPosition) return createCell(i, card, undefined);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], turn: 2, discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(player1).toEqual({
                ...player1,
                cards: [card],
                activeCard: [],
            });
            expect(G.discardedCards).toHaveLength(0);
        });
    });

    describe('Coconut card', () => {
        const card = CardCoconut;

        it('happy path', () => {
            const player1 = { ...createPlayer(0, [card]), energy: 1 };
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], turn: 2, discardedCards: [] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1).toEqual({
                ...player1,
                activeCard: [],
                cards: [],
                energy: MAX_ENERGY,
            });
            expect(G.discardedCards).toEqual([card]);
        });

        it('player energy is full', () => {
            const player1 = { ...createPlayer(0, [card]), energy: MAX_ENERGY };
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], turn: 2, discardedCards: [] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1).toEqual({
                ...player1,
                activeCard: [],
                cards: [],
                energy: MAX_ENERGY,
            });
            expect(G.discardedCards).toEqual([CardCoconut]);
        });

        it('player energy is zero', () => {
            const player1 = { ...createPlayer(0, [card]), energy: 0 };
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], turn: 2, discardedCards: [] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(player1).toEqual({
                ...player1,
                activeCard: [],
                cards: [card],
            });
            expect(G.discardedCards).toHaveLength(0);
        });

        it('player fell of the board', () => {
            const player1 = { ...createPlayer(0, [card]), toFellOffTheBoard: 1 };
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], turn: 2, discardedCards: [] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(player1).toEqual({
                ...player1,
                activeCard: [],
                cards: [card],
            });
            expect(G.discardedCards).toHaveLength(0);
        });
    });

    describe('Amulet card', () => {
        it('happy path', () => {
            const card = CardAmulet;
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1.activeCard).toEqual([{ ...card, RemaningTurn: 1 }]);
            expect(player1.cards).toEqual([card]);
        });
    });

    describe('HangLoose card', () => {
        it('happy path', () => {
            const card = CardHangLoose;
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1.activeCard).toEqual([{ ...card, RemaningTurn: 1 }]);
            expect(player1.cards).toEqual([card]);
        });
    });
});