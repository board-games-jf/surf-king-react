# Rule Review — Game Pace, Energy, and Turn Flow

**Status:** In design review. The owner has removed **Rest** as a game mechanic. Mandatory movement and energy costs remain **proposals**.
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).
**Verified rules-engine baseline:** `main` `6c80c80b28b6d115b3d2267e9462c2cc91fc6311` (2026-11-16). No runtime tests executed.

## Product design goal — owner-confirmed direction

Design Surf King **as a complete game**, not as independent rule tweaks, to be:
- **Fast**: short turns and match progression; avoid stalls.
- **Practical and portable**: easy to learn and replay almost anywhere.
- **Fun and replayable**: meaningful interactions, surprises, and reasons to play again.
- **Strategic**: consequential choices about direction, position, cards, combat, risk and victory.
- **Simple**: do not add mechanics unless they solve a demonstrated design problem.

Avoid posing implementation details as owner decisions. Offer reasoned design proposals with trade-offs, one focused topic per conversation.

## Owner-confirmed facts and decisions

1. **Zero energy means falling off the surfboard.** It is not resting. This matches the engine's fall-state trigger; the return-to-board rule still needs review.
2. **Remove Rest as a game mechanic.** The owner explicitly requested this on 2026-11-16. Do not invent a Rest button, Rest reward or optional Rest action.
3. The main-phase all-pass stalemate is unacceptable as a design target. The owner wants gameplay that progresses without players agreeing to skip indefinitely.
4. Normal movement in any of six edge-sharing directions, and edge-sharing-only drop-in range, were separately approved (see `MOVEMENT.md` and `ATTACK.md`).

**Not yet approved:** Making normal movement compulsory, changing energy costs, automatic stand-up behavior following a fall, or any anti-oscillation / round-limit mechanism. Removing Rest does not by itself specify these systems.

## Observed current code (different from desired design)

`src/game/SurfKingGame.js` currently:
- Starts normal surfers at maximum 4 energy.
- Consumes 1 energy per ordinary maneuver unless the applicable Bottled Water effect intervenes.
- Marks a fall at 0 energy (also after combat / card damage).
- Lets players `pass` the maneuver stage and recover 1 energy if they did not move and are not blocked or fallen.
- Handles a fallen player by giving 1 energy and blocking that player's actions temporarily when passing the card stage.
- Allows players to pass card, attack and movement stages in the main phase; repeating that cycle can leave every surfer stationary indefinitely.

These are implementation observations, **not** approvals of the current rules.

## Why the mechanics must be balanced together

| Rule subsystem | Interaction / risk |
| --- | --- |
| Movement vs energy | Mandatory movement at -1 energy can force a fall after just a few turns. |
| Energy vs combat | Energy determines the number of dice, so changes to regeneration or movement cost also alter attack strength and strategy. |
| Cards and hazards | Energy-restoration cards and damage obstacles change value when ordinary movement stops costing energy. |
| Zero energy / fall | A fall needs a separate short, understandable return mechanism; never re-label it Rest. |
| Progress and victory | Removing passing alone still permits back-and-forth movement with no progress toward the beach. |
| Portability and pace | Avoid timers, additional choices and special cases before confirming they actually improve play. |

## Assistant design direction — P-03 (proposal, not approved)

- Eliminate voluntary Rest as the owner requested; whether `pass` is also disallowed for normal movement still needs a decision.
- **Candidate:** make a normal one-hex maneuver cost **0 energy** so players are not forced to fall merely by moving; retain energy as a combat/survival resource and make card/obstacle risks meaningful.
- **Candidate:** require an otherwise legal move each active turn, while allowing card-play and drop-in to remain optional.
- **Confirmed consequence, not a new recovery rule:** If energy reaches zero, the surfer **falls**. The length and manner of returning to play are **open**.
- Keep exceptional immobilization (card effects, no legal adjacent destination) as a separate rule, with no fictitious Rest action.
- Consider an anti-loop victory/pressure rule only if a core-loop review shows mandatory movement alone is insufficient.

The previous P-01/P-02 optional/automatic Rest proposals are **discarded**, not accepted rules.

## Next small design step

**Review the energy economy as a whole before approving compulsory movement:** compare routine movement at **0 energy cost** against the current **1 energy cost**, including typical travel time, combat dice, energy cards, falls and comeback opportunities. Then propose **one coherent minimal core loop** for owner approval.

**Drop-in dice-tie resolution remains deferred.** No gameplay code, merge or deployment is authorized by this review.
