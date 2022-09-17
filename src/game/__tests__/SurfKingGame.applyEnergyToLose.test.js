import { applyEnergyToLose, createPlayer, MAX_ENERGY } from '../SurfKingGame';

describe('SurfKingGame applyEnergyToLose', () => {
    describe('decrease energy', () => {
        it('happy path', () => {
            const player1 = createPlayer(0, []);
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2] };
            const ctx = {};
            applyEnergyToLose(G, ctx, player1, 1);
            expect(G.players).toEqual([{ ...player1, energy: 3 }, player2]);
        });

        it('the minimum energy is zero', () => {
            const player1 = { ...createPlayer(0, []), energy: 1 }
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2] };
            const ctx = {};
            applyEnergyToLose(G, ctx, player1, 2);
            expect(G.players).toEqual([{ ...player1, energy: 0 }, player2]);
        })

        it('when energy is equal to zero, the player should fall off the board', () => {
            const player1 = { ...createPlayer(0, []), energy: 1 }
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2], turn: 2 };
            const ctx = {};
            applyEnergyToLose(G, ctx, player1, 2);
            expect(G.players).toEqual([{ ...player1, energy: 0, toFellOffTheBoard: 2 }, player2]);
        })
    });

    describe('gain energy', () => {
        it(`happy path`, () => {
            const player1 = { ...createPlayer(0, []), energy: 1 }
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2] };
            const ctx = {};
            applyEnergyToLose(G, ctx, player1, -2);
            expect(G.players).toEqual([{ ...player1, energy: 3 }, player2]);
        });

        it(`the maximum energy is four`, () => {
            const player1 = createPlayer(0, []);
            const player2 = createPlayer(1, []);
            const G = { players: [player1, player2] };
            const ctx = {};
            applyEnergyToLose(G, ctx, player1, -2);
            expect(G.players).toEqual([{ ...player1, energy: MAX_ENERGY }, player2]);
        });
    });
});