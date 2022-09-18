import { CardAmulet, CardBigWave, CardBottledWater, CardChange, CardCoconut, CardCyclone, CardJumping, CardLifeGuardFloat, CardStone } from '../Cards';
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

    describe('Cyclone/Island/Storm/Shark cards', () => {
        const card = CardCyclone;

        it('happy path - these obstacles should not be discarded', () => {
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
                cards: [],
                activeCard: [],
            });
            expect(G.discardedCards).toHaveLength(0);
        });

        it('target cell has been occupied', () => {
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

    describe('BigWave/Sunburn cards', () => {
        const card = CardBigWave;

        it('happy path', () => {
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const targetCellPosition = 0;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1.energy).toEqual(2);
            expect(G.discardedCards).toEqual([card]);
        });

        it('cannot be used', () => {
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const thereIsNoPlayerOnCellPosition = 20;
            const args = [thereIsNoPlayerOnCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(G.discardedCards).toHaveLength(0);
        });
    });

    describe('BottledWater card', () => {
        it('happy path', () => {
            const card = CardBottledWater;
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], discardedCards: [] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1).toEqual({ ...player1, cards: [] });
            expect(G.discardedCards).toEqual([card]);
        });
    });

    describe('Coconut/Energy/EnergyX2/EnergyX3 cards', () => {
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

    describe('LifeGuardFloat/SwimmingFin cards', () => {
        const card = CardLifeGuardFloat;

        it('happy path', () => {
            const player1 = { ...createPlayer(0, [card]), energy: 0, toFellOffTheBoard: 1 };
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
                energy: 2,
                toFellOffTheBoard: -1,
            });
            expect(G.discardedCards).toEqual([card]);
        });

        it('player has energy', () => {
            const player1 = { ...createPlayer(0, [card]), energy: MAX_ENERGY };
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
                energy: MAX_ENERGY,
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
                toFellOffTheBoard: 1,
            });
            expect(G.discardedCards).toHaveLength(0);
        });
    });

    describe('Change card', () => {
        const card = CardChange;

        it('happy path', () => {
            const player1 = { ...createPlayer(0, [card]), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1 };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const targetCellPosition = 1;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1.cellPosition).toEqual(1);
            expect(player2.cellPosition).toEqual(0);
            expect(G.discardedCards).toEqual([card]);
        });

        it('there is no player on target cell', () => {
            const player1 = { ...createPlayer(0, [card]), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1 };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const targetCellPosition = 10;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(player1.cellPosition).toEqual(0);
            expect(player2.cellPosition).toEqual(1);
            expect(G.discardedCards).toEqual([]);
        });

        it('target player is wearing Amulet', () => {
            const player1 = { ...createPlayer(0, [card]), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1, activeCard: [CardAmulet] };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const targetCellPosition = 1;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(player1.cellPosition).toEqual(0);
            expect(player2.cellPosition).toEqual(1);
            expect(G.discardedCards).toEqual([]);
        });
    });

    describe('Jumping card', () => {
        const card = CardJumping;

        it('happy path', () => {
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const targetCellPosition = 10;
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                if (i === targetCellPosition) return createCell(i, CardStone);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(G.cells[targetCellPosition]).toEqual(createCell(targetCellPosition, undefined, undefined));
            expect(G.discardedCards).toEqual([card]);
        });

        it('cannot be used', () => {
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                if (i === 10) return createCell(i, CardStone);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], discardedCards: [], cells };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const targetCellPosition = 1;
            const args = [targetCellPosition];

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeFalsy();
            expect(G.cells[10]).toEqual(createCell(10, CardStone));
            expect(G.discardedCards).toHaveLength(0);
        });
    });

    describe('Amulet/HangLoose cards', () => {
        it('happy path', () => {
            const card = CardAmulet;
            const player1 = createPlayer(0, [card]);
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], discardedCards: [] };
            const ctx = { currentPlayer: '0' };
            const cardPos = 0;
            const args = undefined;

            const hasBeenUsed = executeCardAction(G, ctx, cardPos, args);

            expect(hasBeenUsed).toBeTruthy();
            expect(player1).toEqual({
                ...player1,
                cards: [card],
                activeCard: [{ ...card, RemaningTurn: 1 }],
            });
            expect(G.discardedCards).toHaveLength(0);
        });
    });
});