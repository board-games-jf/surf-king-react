# Rule Review — Movement and Adjacency

**Status:** Movement direction and edge-adjacency approved; other movement constraints still under review  
**Owner confirmation:** Six directions are allowed only when cells share an edge. The 18 → 15 exception remains confirmed.  
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and its comments.

## 1. Confirmed example

The owner explicitly confirmed on 2026-11-15:

> A normal move from **displayed hex 18 to displayed hex 15 is forbidden**.

The cells do not share an edge on the current honeycomb. This example was later supplemented by an explicit owner decision on six-direction normal movement. The attack-range question was subsequently confirmed separately: drop-in is also restricted to edge-sharing adjacent cells (see [ATTACK.md](ATTACK.md)). This still does **not** settle energy, obstacles, other restrictions, or special card-driven movement.

The board shown to players is **1-based (1–53)**. The internal engine is **0-based (0–52)**. Thus the reported move corresponds to internal IDs **17 → 14**.

## 2. Observed implementation (not the approved rule)

At the reviewed `main` baseline `6daa1705ff11d958a10cffd951eca9f5f2a1084c`:

- `src/game/SurfKingGame.js` uses `isCloseTo(a, b)` with absolute index differences **3, 4, or 7**.
- `maneuver` and `dropIn` use this proximity check; `canManeuver` reuses it for highlighting maneuver destinations.
- Thus displayed **18 → 15** (internal 17 → 14; difference 3) is considered close by that predicate, even though the cells are not edge neighbors in the board layout.
- `src/map/layout/board-layout.json` is the current 53-cell position manifest. Its exact visual geometry is still marked provisional.

**Risk:** Index-offset adjacency alone can incorrectly connect cells at row transitions and board boundaries. This is a source-code observation, not a runtime test result.

## 3. Owner-approved rule — normal movement

**Confirmed on 2026-11-15:** A surfer's **normal maneuver** may move **in any of the six directions**, including backward, **provided the destination shares an entire edge with the origin hex**. Edge and corner hexes have fewer than six adjacent cells.

This approval covers **normal movement direction and geometric adjacency only**. Energy cost, occupancy, special card-driven movement and obstacles remain separate decisions. The range of **drop-in** was independently confirmed as edge adjacency; see [ATTACK.md](ATTACK.md). The range semantics for tsunami, cyclone, and cards must be decided separately.

## 4. Examples and status

| Displayed move | Status | Explanation |
| --- | --- | --- |
| **18 → 15** | **Owner-confirmed: forbidden** | Not edge-adjacent |
| **18 → 21** | Direction and geometry permitted by owner-approved rule | Overall legality still depends on energy, occupancy, obstacles, and other conditions |

## 5. Follow-up: attack range confirmed

**Confirmed on 2026-11-15:** Drop-in attacks, like normal movement, require the defender to be on an edge-sharing neighboring cell. This was explicitly confirmed in a separate interaction. See [ATTACK.md](ATTACK.md).

**Next question:** Should equal attack and defense dice results favor the defender? Track this in [ATTACK.md](ATTACK.md).

## 6. Future implementation validation — only after rule approval

Suggested checks, not actions authorized now:
- Enumerate true edge neighbors for every one of the 53 cells.
- Protect boundary/row transitions (including 18 → 15).
- Validate normal movement and attack adjacency against the separately confirmed edge-neighbor rule.
- Add regression tests for approved legal and illegal moves.
- Preserve UI display labels and internal ID distinctions.

## 7. Conversation checkpoint — 2026-11-15

Owner explicitly confirmed: "Normal movement may occur in all six directions, provided the hexagons share an edge." Recorded in Issue #11. The next owner answer separately confirmed drop-in range as edge adjacency; attack resolution remains open.

**No gameplay code modified or tests run as part of this rules-review document.**
