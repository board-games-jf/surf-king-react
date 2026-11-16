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

## Integrated rule-interaction audit — 2026-11-16 (assistant analysis, not approved)

A concrete geometric path from the first starting cell (engine ID 0) to the first winning cell (49) is `0 → 7 → 14 → 21 → 28 → 35 → 42 → 49`: **seven edge-adjacent normal maneuvers** in the provisional 53-cell layout. This demonstrates the board's relatively short fastest theoretical route; it is **not** a guaranteed seven-turn match because occupied cells, card effects, obstacle damage and interference matter. The route includes the initially placed **Shark** at internal cell 28.

The currently implemented energy economy starts at 4 and spends 1 per normal maneuver. On that route, without energy cards or recovery, four maneuvers alone are enough to reach zero; the Shark damages energy as well (currently +2 energy loss on entry). **The player can fall simply by traveling, before the goal**. Making movement compulsory while retaining this economy would create repeated forced falls and downtime unless additional mechanisms are designed.

Conversely, making ordinary movement **free** avoids automatic attrition but changes several other mechanics:

- **Bottled Water** presently prevents exactly the ordinary maneuver's 1-energy cost. With free normal movement, its current effect would become **redundant** and the deck would need to remove or repurpose it.
- **Energy restoration cards** (Energy, Energy x2/x3, Coconut, Lifeguard Float, Swimming Fin) would be used mostly to recover from combat, card attacks and hazards, instead of routine travel. Their frequency and power would need rebalancing; this is **not** a simple isolated cost change.
- **Drop-in** uses energy to determine dice count and damage can cause a fall. Preserving energy until combat changes attack strength and target vulnerability. Combat incentives must be reviewed together with any movement change.
- Four **Shark** cells are initially placed across a central row (IDs 28–31). They remain a meaningful high-risk bottleneck, with risk magnitude contingent on the energy rule.
- A **mandatory but free** normal maneuver would remove voluntary all-pass stalemates but still permits back-and-forth motion, so a separate simple endgame pressure / round limit may ultimately be required.

**Working hypothesis for further design, not approval:** ordinary edge-adjacent movement costs 0 energy; energy is a scarce survival/combat resource affected by hazards and attacks; cards are rebalanced to this economy; normal movement is required when legal, and an explicit falling/re-entry mechanic replaces any mistaken Rest state. The next design work should compare this complete package with a minimal alternative that retains movement cost, **before asking the owner to lock a single number**.

No probabilities were simulated and no gameplay tests were executed. These are deductions from source and layout, not observed playtest results.

## Next small design step

The owner suggested a **WAR/Risk-like energy economy** in which energy grows into attack/defense strength. See [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md) for the newer **P-04 (unapproved)** proposal: start at 2 energy rather than 1 (avoid instant opening falls), free normal movement, +1 on each newly reached personal furthest-forward row to max 4, and cards as recovery/strength boosts. This **refines P-03**, which was only a design hypothesis. Evaluate opening strength **first**, then gain-rate, combat snowballing, card relevance and fall return before approving a core loop.

**Next dependency:** The owner requested a complete start-to-finish match instead of more isolated mechanic questions. See [COMPLETE_MATCH.md](COMPLETE_MATCH.md) (P-06, entire package **not approved**) for the candidate opening, optional tactics + mandatory move, energy and hazards, falls and return, victory and a provisional round cap. All unapproved choices remain open until a whole-game assessment.

**Drop-in dice-tie resolution remains deferred.** No gameplay code, merge or deployment is authorized by this review.
