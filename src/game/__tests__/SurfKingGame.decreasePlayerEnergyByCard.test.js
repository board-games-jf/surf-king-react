import { CardAmulet, CardBigWave, CardEnergy, CardSunburn } from '../Cards';
import { createCell, createPlayer, decreasePlayerEnergyByCard, GRID_SIZE } from '../SurfKingGame';

describe('SurfKingGame decreasePlayerEnergyByCard', () => {
    describe('when current player uses the Big Wave card', () => {
        it('happy path', () => {
            const player1 = { ...createPlayer(0, []), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1 };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], cells };
            const ctx = { currentPlayer: '0' };
            const cellPosition = 1;

            const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardBigWave);

            expect(decreased).toBeTruthy();
            expect(player2.energy).toEqual(2);
        });

        it('and there is no player, should return false and do nothing', () => {
            const player1 = { ...createPlayer(0, []), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1 };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], cells };
            const ctx = { currentPlayer: '0' };
            const cellPosition = 10;

            const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardBigWave);

            expect(decreased).toBeFalsy();
            expect(player2.energy).toEqual(4);
        });

        it('and target player wearing Amulet, should return false and do nothing', () => {
            const player1 = { ...createPlayer(0, []), cellPosition: 0 };
            const player2 = {
                ...createPlayer(1, []),
                cellPosition: 1,
                activeCard: [{ ...CardAmulet, RemaningTurn: 1 }],
            };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], cells };
            const ctx = { currentPlayer: '0' };
            const cellPosition = 1;

            const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardBigWave);

            expect(decreased).toBeFalsy();
            expect(player2.energy).toEqual(4);
        });

        describe('and target player to fall off the board', () => {
            it('and target player no cards, should return true and do nothing', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 };
                const player2 = { ...createPlayer(1, []), cellPosition: 1, energy: 1 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 0) return createCell(i, undefined, player1);
                    if (i === 1) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const cellPosition = 1;

                const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardBigWave);

                expect(decreased).toBeTruthy();
                expect(player2.energy).toEqual(0);
                expect(player2.cards).toEqual([]);
                expect(player1.cards).toEqual([]);
            });

            it('and target player has cards, should return true and current player get one card from target player', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 };
                const player2 = { ...createPlayer(1, [CardEnergy]), cellPosition: 1, energy: 1 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 0) return createCell(i, undefined, player1);
                    if (i === 1) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const cellPosition = 1;

                const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardBigWave);

                expect(decreased).toBeTruthy();
                expect(player2.energy).toEqual(0);
                expect(player2.cards).toEqual([]);
                expect(player1.cards).toEqual([CardEnergy]);
            });
        });
    });

    describe('when current player uses the Sunburn card', () => {
        it('happy path', () => {
            const player1 = { ...createPlayer(0, []), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1 };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], cells };
            const ctx = { currentPlayer: '0' };
            const cellPosition = 1;

            const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardSunburn);

            expect(decreased).toBeTruthy();
            expect(player2.energy).toEqual(3);
        });

        it('and there is no player, should return false and do nothing', () => {
            const player1 = { ...createPlayer(0, []), cellPosition: 0 };
            const player2 = { ...createPlayer(1, []), cellPosition: 1 };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], cells };
            const ctx = { currentPlayer: '0' };
            const cellPosition = 10;

            const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardSunburn);

            expect(decreased).toBeFalsy();
            expect(player2.energy).toEqual(4);
        });

        it('and target player wearing Amulet, should return false and do nothing', () => {
            const player1 = { ...createPlayer(0, []), cellPosition: 0 };
            const player2 = {
                ...createPlayer(1, []),
                cellPosition: 1,
                activeCard: [{ ...CardAmulet, RemaningTurn: 1 }],
            };
            const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                if (i === 0) return createCell(i, undefined, player1);
                if (i === 1) return createCell(i, undefined, player2);
                return createCell(i, undefined, undefined);
            })];
            const G = { players: [player1, player2], cells };
            const ctx = { currentPlayer: '0' };
            const cellPosition = 1;

            const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardSunburn);

            expect(decreased).toBeFalsy();
            expect(player2.energy).toEqual(4);
        });

        describe('and target player to fall off the board', () => {
            it('and target player no cards, should return true and do nothing', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 };
                const player2 = { ...createPlayer(1, []), cellPosition: 1, energy: 1 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 0) return createCell(i, undefined, player1);
                    if (i === 1) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const cellPosition = 1;

                const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardSunburn);

                expect(decreased).toBeTruthy();
                expect(player2.energy).toEqual(0);
                expect(player2.cards).toEqual([]);
                expect(player1.cards).toEqual([]);
            });

            it('and target player has cards, should return true and current player get one card from target player', () => {
                const player1 = { ...createPlayer(0, []), cellPosition: 0 };
                const player2 = { ...createPlayer(1, [CardEnergy]), cellPosition: 1, energy: 1 };
                const cells = [...Array.from({ length: GRID_SIZE }, (_, i) => {
                    if (i === 0) return createCell(i, undefined, player1);
                    if (i === 1) return createCell(i, undefined, player2);
                    return createCell(i, undefined, undefined);
                })];
                const G = { players: [player1, player2], cells };
                const ctx = { currentPlayer: '0' };
                const cellPosition = 1;

                const decreased = decreasePlayerEnergyByCard(G, ctx, cellPosition, CardSunburn);

                expect(decreased).toBeTruthy();
                expect(player2.energy).toEqual(0);
                expect(player2.cards).toEqual([]);
                expect(player1.cards).toEqual([CardEnergy]);
            });
        });
    });
});