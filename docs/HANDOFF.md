# Project Handoff

**Last direct GitHub verification:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Base `main` commit:** `6c80c80b28b6d115b3d2267e9462c2cc91fc6311` (interactive board catalog PR #16 merged).

## Existing game

- React 18 / CRA 5 local `boardgame.io` game with 53 hexagon IDs and selectable 2D/Three.js views. Card actions and game turns stay in the game engine.
- The 3D board uses shared procedural models and an ocean/beach scene; the public map snapshot supplies real in-game obstacles and players.
- The `/#/obstacles` individual viewer and `/#/catalog` interactive full-board showroom reuse the same 3D constructors. The showroom has illustrative placements, not an authoritative match.
- PR #14 merged the first version of the five 3D obstacles; PR #16 merged the board showroom. Both still require real browser/Jest/build verification.

## Active visual refinement — Issue #13

- Branch `feat/13-card-faithful-obstacle-effects` implements the owner-approved visual direction (SK-DEC-010) and remains **unmerged** until separately authorized.
- Stone is now a mint-green faceted twin crag following `src/assets/cards/stone.png`; Island is orange sand with two leaning palms following `src/assets/cards/island.png`.
- Removed opaque blue disk meshes beneath Shark, Storm and Cyclone; the shared scene ocean remains the water surface, with only local foam and wakes.
- Storm uses five prebuilt jagged/branched lightning shapes with deterministic but irregular flash timing; Cyclone is taller and drifts smoothly within a bounded hex-center radius; Shark has a bounded moving fin and foam trail.
- No game rules, matchmaking, server code, cards, textures, or external services changed.

## Evidence and open validations

- Relevant code and original card images were read directly from GitHub.
- Actual production code was evaluated in a lightweight Three.js geometry mock; all five constructors and animation callbacks passed. Pure drift sampling stayed within a radius of 0.319 units. This **does not** verify WebGL rendering.
- New Jest tests cover silhouettes, removal of opaque bases, bounded drift, irregular lightning, and finite animated transforms. **Jest suite and build were not run** because the project dependencies are not present here.
- Browser evaluation of shaders, animation quality, performance and touch controls remains pending. The older issue #15 catalog checks also remain pending.
- Separate issue #11 and draft PR #12 discuss game rules; do not merge rules work as part of the visual refinement.

## Next actions

1. Review the current Issue #13 draft PR and run Jest/build in a full project environment.
2. Inspect `/#/catalog` and `/#/obstacles` in a real WebGL browser, confirm card resemblance and adjust individual models if needed.
3. Test a live local 3D match, multiple same-type obstacles, hover and turn badges, and the 2D fallback.
4. Request **separate** owner permission for merge or deploy. Neither is authorized by visual-design feedback.
