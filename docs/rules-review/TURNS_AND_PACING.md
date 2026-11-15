# Rule Review — Turn Flow, Passing, and Game Pace

**Status:** Problem identified; anti-stall rule is a **proposal**, not owner-approved.  
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).  
**Code baseline inspected:** `main` `6daa1705ff11d958a10cffd951eca9f5f2a1084c` (2026-11-15).

## Design target — owner request

The owner wants a **simple, fast, fun game that cannot stall**. They identified a concrete problem: **if every player continually skips their actions, the match makes no spatial progress**. The assistant should bring grounded design recommendations and discuss them one at a time, not ask the owner to design each rule without guidance.

These goals and the reported problem are confirmed context; the proposed remedy below is **not yet approved**.

## Observed implementation

From `src/game/SurfKingGame.js`:

- Opening `phaseA` offers `maneuver` only, then the main `phaseB` cycles through `MOVE_USE_CARD`, `MOVE_DROP_IN`, and `MOVE_MANEUVER`.
- In `phaseB`, `pass` is permitted at each stage. Passing from `MOVE_MANEUVER` ends that player's turn.
- A player who finishes the maneuver stage **without moving**, while not fallen or blocked, gains **one energy**, up to `MAX_ENERGY = 4`.
- No rule advances a surfer toward the beach solely because everyone passed. The round counter and some active-card timers can still advance.
- Normal movement spends one energy (except applicable card effects); successfully maneuvering also qualifies for a replacement card.
- If a fallen player passes the card stage, the code restores one energy, clears the fall state, and sets a blocked flag for that turn.

**Diagnosis (derived from code, not a runtime simulation):** In the main phase, a group can repeatedly skip every action, regain full energy, and remain on their original cells indefinitely. This prevents the victory condition (reaching one of the final four hexagons) from ever being reached.

## Assistant recommendation — not an accepted rule

**Proposal P-01: Compulsory normal maneuver when possible.**

1. Using a card is optional.
2. Attempting a drop-in attack is optional.
3. At the maneuver stage, **if the surfer has enough energy and at least one otherwise legal normal destination**, they **must move to one of those destinations**. The chosen destination may be in any of the six edge-sharing directions (separate owner-approved Rule 1).
4. If no normal maneuver is possible (for example zero energy, a blocked state, or no legal destination), the player may **rest/pass**; for ordinary non-fallen, non-blocked circumstances, regain one energy, capped at four. Recovery for fallen/blocked players is a separate pending rule and should not be assumed to work identically.
5. A forced action must never require an illegal move through occupied cells, stones, or board edges.

**Why:** Removes the simple all-pass stalemate without introducing a clock, random event, new cards, or an automatic current. It also preserves choice among valid directions and optional tactical attacks.

**Trade-off:** Mandatory movement can force an undesirable move (backward, onto a hazard) and does not prevent intentionally alternating between two cells. A later review should assess a finite round cap or another end-of-game fallback rather than assuming P-01 solves *all* stalls.

## Deferred questions

- Should there also be a maximum number of rounds with a fallback winner if players avoid victory?
- How should compulsory movement interact with zero energy, fallen surfers, card effects, and blocking obstacles?
- Combat dice tie resolution remains **pending**; the current code favors defenders on ties, but no redesign decision has been made.

## One next question

**Does the owner want to approve Proposal P-01: mandatory normal movement whenever the surfer has energy and at least one legal destination, with resting only when movement is impossible?**

**Status:** Awaiting owner response.

## Implementation boundary

Documentation only. Do not change code, create a gameplay PR, merge, run tests, or deploy based on this unapproved proposal.
