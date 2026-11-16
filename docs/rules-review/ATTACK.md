# Rule Review — Drop-in Attack

**Status:** Attack range confirmed; dice resolution and other attack conditions pending.  
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).

## Confirmed rule — attack range (2026-11-15)

The owner confirmed that **drop-in targets must be adjacent**. Here, an adjacent opponent occupies a hexagon **sharing a full edge** with the attacker's hexagon.

- A cell may have up to six edge-sharing neighbors; boundary cells have fewer.
- Touching only at a corner does not qualify.
- **No remote attacks** using normal drop-in are approved.
- This approval is limited to attack range, **not** attack cost, initiative, eligibility, dice resolution, rewards, or effects of cards.
- The previous owner-confirmed displayed **18 → 15** non-adjacency example therefore fails the same edge-sharing requirement for both normal movement and drop-in.

## Code evidence (not automatically approved)

As reviewed in `main` at `6daa1705ff11d958a10cffd951eca9f5f2a1084c`:

- `src/game/SurfKingGame.js` checks `isCloseTo` in `dropIn`, but `isCloseTo` currently uses absolute engine-ID differences 3, 4, or 7. It may allow nonadjacent attacks near boundaries.
- The current combat loop compares descending attacker and defender dice; on equal values, the `else` branch treats the comparison as a defender win, reducing attacker energy.
- These statements describe code only. No runtime or automated tests were executed during this review.

## Next question — one at a time

**When the attacker and defender roll equal dice values in a drop-in, should the defender win the tie (as the current code does), or should a tie have another outcome?**

**Status:** Pending owner decision.

## Implementation boundary

Documenting a rule does not authorize altering `dropIn`, `isCloseTo`, the client, or tests. This draft PR remains documentation-only and unmerged.
