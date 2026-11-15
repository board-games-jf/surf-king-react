# Rule Review — Movement and Adjacency

**Status:** In discussion  
**Owner confirmation:** One concrete invalid move (18 → 15) only.  
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and its comments.

## 1. Confirmed example

The owner explicitly confirmed on 2026-11-15:

> A normal move from **displayed hex 18 to displayed hex 15 is forbidden**.

The cells do not share an edge on the current honeycomb. This does **not**, by itself, settle movement direction, all other adjacency cases, attack range, or unusual card-driven movement.

The board shown to players is **1-based (1–53)**. The internal engine is **0-based (0–52)**. Thus the reported move corresponds to internal IDs **17 → 14**.

## 2. Observed implementation (not the approved rule)

At the reviewed `main` baseline `6daa1705ff11d958a10cffd951eca9f5f2a1084c`:

- `src/game/SurfKingGame.js` uses `isCloseTo(a, b)` with absolute index differences **3, 4, or 7**.
- `maneuver` and `dropIn` use this proximity check; `canManeuver` reuses it for highlighting maneuver destinations.
- Thus displayed **18 → 15** (internal 17 → 14; difference 3) is considered close by that predicate, even though the cells are not edge neighbors in the board layout.
- `src/map/layout/board-layout.json` is the current 53-cell position manifest. Its exact visual geometry is still marked provisional.

**Risk:** Index-offset adjacency alone can incorrectly connect cells at row transitions and board boundaries. This is a source-code observation, not a runtime test result.

## 3. Candidate design principle — not yet fully approved

**Proposal:** A normal maneuver may target only a physically **edge-sharing** hex, within all other valid energy, occupancy and obstacle constraints. A cell can have **up to six** actual neighbors; edge cells have fewer.

The corresponding range semantics for **drop-in**, tsunami, cyclone, and cards must be decided separately. Do not infer those rules from this example.

## 4. Examples and status

| Displayed move | Status | Explanation |
| --- | --- | --- |
| **18 → 15** | **Owner-confirmed: forbidden** | Not edge-adjacent |
| **18 → 21** | Geometrically edge-adjacent, but overall move legality not yet owner-confirmed | Other constraints and permitted directions still need review |

## 5. One open question (next interaction)

**Can a surfer move in any of the six edge-sharing directions, including backward, or must some directions be restricted?**

**Status:** Pending owner response.

## 6. Future implementation validation — only after rule approval

Suggested checks, not actions authorized now:
- Enumerate true edge neighbors for every one of the 53 cells.
- Protect boundary/row transitions (including 18 → 15).
- Validate normal movement and discuss attack adjacency separately.
- Add regression tests for approved legal and illegal moves.
- Preserve UI display labels and internal ID distinctions.

**No code modified or tests run as part of this rules-review document.**
