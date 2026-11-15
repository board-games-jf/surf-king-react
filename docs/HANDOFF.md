# Project Handoff

**Verified on GitHub:** 2026-11-15
**Official repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Base `main` commit:** `6daa1705ff11d958a10cffd951eca9f5f2a1084c` (shared 2D/3D hex adjacency, PR #10).

## Current main

- React 18 / CRA 5 and local `boardgame.io` client; online and AI routes are disabled.
- The game engine in `src/game/SurfKingGame.js` manages 53 cells, turns, cards, obstacles, and victory.
- The shared 2D/3D layout uses 53 cell IDs and a provisional coordinate manifest.
- The live Three.js board and 2D/3D switching entered `main` in PR #9. 3D shows actual players and obstacles from a public snapshot, without changing rules.
- Application Jest tests, production build, and WebGL browser behavior have not been reverified in this session.

## Active work — not merged

- [Issue #13](https://github.com/board-games-jf/surf-king-react/issues/13) / [draft PR #14](https://github.com/board-games-jf/surf-king-react/pull/14), branch `feat/13-refine-3d-obstacles`: refined procedural meshes for five obstacle types.
- The live Three.js scene uses `obstacleModels.js` for Shark, Stone, Island, Storm and Cyclone.
- An in-app `/obstacles` gallery reuses those same models for rotation, zoom and per-type review without creating a match.
- These are approximate 3D interpretations of approved illustration concepts; no generated image or external 3D file is embedded.
- [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) / [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12) contain a separate rules review. Keep its decisions separate from visual work.

## Validation

- Modified non-JSX JavaScript syntax was checked successfully.
- Mocked-Three.js obstacle factory construction and update checks passed for all five types.
- Jest geometry/bounds checks were added but **not executed**; there are no installed application dependencies available for a full test/build here.
- Real WebGL appearance, performance, mobile scaling, gallery interaction and in-game obstacle effects are **not yet verified**.
- Legacy `loadsh` dependency typo, original rulebook and canonical board layout are unresolved and outside this visual-only PR.

## Next action

1. Install dependencies, run Jest and the production build on PR #14.
2. Start the branch locally, open `/#/obstacles`, inspect each model and play a local match in 3D.
3. Refine the actual rendered meshes based on owner feedback, then review the PR.
4. **Do not merge or deploy without explicit separate authorization.**
