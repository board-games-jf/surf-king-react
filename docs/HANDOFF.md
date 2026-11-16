# Project Handoff

**Last direct GitHub review:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Current main at work start:** `e4e083f9035e314eb2107bd1cca448292cc4629e` (PR #17, card-faithful obstacle refinement).

## Current integrated state

- The local boardgame.io game has 53 hex cell IDs, both 2D and Three.js views, and a shared public rendering snapshot.
- The Three.js map renders procedural surfers and obstacles from `src/map/views/Board3D/`. The `/#/catalog` route reuses these live game models as a design sandbox with illustrative placements.
- Obstacle visual direction is approved and integrated via PRs #14 and #17; do not reopen obstacle art without a new owner request.
- The online multiplayer and AI game flows are not active; changes to game rules are not in scope for the current visual work.

## Active work — Issue #20

- Branch `feat/20-refine-3d-surfers` / [draft PR #21](https://github.com/board-games-jf/surf-king-react/pull/21) is **not merged or deployed**. First reviewable iteration improves `surfModels.js` without changing the exported `createSurferModel()` contract.
- Surfboards now use a bevelled, tapered procedural hull and shape-based deck stripe, rear grip and swept underside fin. Existing seven player colors are unchanged.
- Riders have a deterministic multi-frequency balance pose: torso/head/arms/stance and slight board pitch. No model allocates new meshes per animation frame.
- The existing real match and board catalog consume the same model factory; no separate fake assets were added.

## Validation

- The updated model source and new tests passed JavaScript syntax checks.
- The **actual model source** was instantiated and animated in a lightweight mocked Three.js environment for seven player variants; hull color, expected named geometry and finite sample poses passed.
- Added Jest tests for colored hulls, board geometry, footprint, smooth pose, seven variants and retention of the shark animation API. **Jest was not run**; npm dependencies, production build and real browser WebGL evaluation remain pending.
- Before merging, verify front/back board direction, avatar leg/foot contact, camera-distance readability, mobile performance and no regression in the 2D/3D switch.

## Other open work

- Issues #7, #13 and #15 remain open for technical integration/validation checks; these are separate from artistic sign-off.
- Issue #11 / draft PR #12 are reserved for rules review and should not be mixed into surfboard refinement.
- The approved MVP, canonical board coordinates, complete rules acceptance and test/build baselines are not yet settled.

## Next action

1. Review the Issue #20 draft PR's real meshes in `/#/catalog` and a local 3D game.
2. Run Jest, production build and WebGL smoke checks with the app dependencies installed; record failures and adjust the visual model.
3. Request explicit approval before merging; **no deployment is authorized**.
