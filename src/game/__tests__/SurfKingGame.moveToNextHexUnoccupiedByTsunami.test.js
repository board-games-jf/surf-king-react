import { MOVE_BACKWARD } from '../Board';
import { CardAmulet, CardCyclone, CardIsland, CardShark, CardStone, CardStorm } from '../Cards';
import { createCell, createPlayer, GRID_SIZE, moveToNextHexUnoccupiedByTsunami } from '../SurfKingGame';

describe('SurfKingGame moveToNextHexUnoccupiedByTsunami', () => {
    it('moving to an unoccupied cell', () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21 };
        const player2 = { ...createPlayer(1, []), cellPosition: 22 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 22) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeTruthy();
        expect(player1).toEqual({
            ...player1,
            energy: 4,
            cellPosition: 21 + MOVE_BACKWARD,
        });
    });

    it(`when the target player is wearing an Amulet, should not be moved`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21, activeCard: [CardAmulet] };
        const player2 = { ...createPlayer(1, []), cellPosition: 22 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 22) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeFalsy();
        expect(player1).toEqual({
            ...player1,
            energy: 4,
            cellPosition: 21,
        });
    });

    it(`when the 'to' cell has another player, the player should move to the next unoccupied cell`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21 };
        const player2 = { ...createPlayer(1, []), cellPosition: 21 + MOVE_BACKWARD };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 21 + MOVE_BACKWARD) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeTruthy();
        expect(player1).toEqual({
            ...player1,
            energy: 4,
            cellPosition: 21 + (2 * MOVE_BACKWARD),
        });
    });

    it(`when the 'to' cell has a Stone obstacle, the player should move to the next unoccupied cell`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21 };
        const player2 = { ...createPlayer(1, []), cellPosition: 22 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21 + MOVE_BACKWARD) return createCell(i, CardStone);
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 22) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeTruthy();
        expect(player1).toEqual({
            ...player1,
            energy: 4,
            cellPosition: 21 + (2 * MOVE_BACKWARD),
        });
    });

    it(`when the 'to' cell has an Island obstacle, the player should gain 2 energies`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21, energy: 2 };
        const player2 = { ...createPlayer(1, []), cellPosition: 22 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21 + MOVE_BACKWARD) return createCell(i, CardIsland);
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 22) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeTruthy();
        expect(player1).toEqual({
            ...player1,
            energy: 4,
            cellPosition: 21 + MOVE_BACKWARD,
        });
    });

    it(`when the 'to' cell has a Storm obstacle, the player should lose 1 energy`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21, energy: 2 };
        const player2 = { ...createPlayer(1, []), cellPosition: 22 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21 + MOVE_BACKWARD) return createCell(i, CardStorm);
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 22) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeTruthy();
        expect(player1).toEqual({
            ...player1,
            energy: 1,
            cellPosition: 21 + MOVE_BACKWARD,
        });
    });

    it(`when the 'to' cell has a Shark obstacle, the player should lose 2 energies`, () => {
        const player1 = { ...createPlayer(0, []), cellPosition: 21, energy: 3 };
        const player2 = { ...createPlayer(1, []), cellPosition: 22 };
        const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
            if (i === 21 + MOVE_BACKWARD) return createCell(i, CardShark);
            if (i === 21) return createCell(i, undefined, player1);
            if (i === 22) return createCell(i, undefined, player2);
            return createCell(i, undefined, undefined);
        })];
        const G = { players: [player1, player2], cells };
        const ctx = { currentPlayer: '0' };
        const playerPos = 0;
        const from = player1.cellPosition;
        const to = from + MOVE_BACKWARD;

        const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

        expect(moved).toBeTruthy();
        expect(player1).toEqual({
            ...player1,
            energy: 1,
            cellPosition: 21 + MOVE_BACKWARD,
        });
    });

    describe(`when the 'to' cell has a Cyclone obstacle`, () => {
        describe(`and Cyclone move player forward`, () => {
            beforeEach(() => {
                const diceMoveForward = 0;
                jest.spyOn(global.Math, 'random').mockReturnValue(diceMoveForward);
            });

            afterEach(() => {
                jest.spyOn(global.Math, 'random').mockRestore();
            })

            it(`and the new 'to' cell is the same as the player's old cell, the player should be moved`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 21 };
                const player2 = { ...createPlayer(1, []), cellPosition: 22 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 21 + MOVE_BACKWARD) return createCell(i, CardCyclone);
                    if (i === 21) return createCell(i, undefined, player1);
                    if (i === 22) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const playerPos = 0;
                const from = player1.cellPosition;
                const to = from + MOVE_BACKWARD;

                const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

                expect(moved).toBeTruthy();
                expect(player1).toEqual({
                    ...player1,
                    cellPosition: 21,
                });
            });
        });

        describe(`and Cyclone move player backward`, () => {
            beforeEach(() => {
                const diceMoveBackward = 3 / 6;
                jest.spyOn(global.Math, 'random').mockReturnValue(diceMoveBackward);
            });

            afterEach(() => {
                jest.spyOn(global.Math, 'random').mockRestore();
            })

            it(`and the new 'to' cell is unuccopied, the player should be moved`, () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 21 };
                const player2 = { ...createPlayer(1, []), cellPosition: 22 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 21 + MOVE_BACKWARD) return createCell(i, CardCyclone);
                    if (i === 21) return createCell(i, undefined, player1);
                    if (i === 22) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const playerPos = 0;
                const from = player1.cellPosition;
                const to = from + MOVE_BACKWARD;

                const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

                expect(moved).toBeTruthy();
                expect(player1).toEqual({
                    ...player1,
                    cellPosition: 7,
                });
            });

            it(`and new 'to' cell has a Stone obstacle, the player should move backward again`, () => { // TODO: Check when "To" is negative.
                const player1 = { ...createPlayer(0, []), cellPosition: 21 };
                const player2 = { ...createPlayer(1, []), cellPosition: 22 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 21 + (2 * MOVE_BACKWARD)) return createCell(i, CardStone);
                    if (i === 21 + MOVE_BACKWARD) return createCell(i, CardCyclone);
                    if (i === 21) return createCell(i, undefined, player1);
                    if (i === 22) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const playerPos = 0;
                const from = player1.cellPosition;
                const to = from + MOVE_BACKWARD;

                const moved = moveToNextHexUnoccupiedByTsunami(G, ctx, playerPos, from, to);

                expect(moved).toBeTruthy();
                expect(player1).toEqual({
                    ...player1,
                    cellPosition: 0,
                });
            });
        });
    });
});