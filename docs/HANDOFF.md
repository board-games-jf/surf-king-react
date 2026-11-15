# Project Handoff

**Verified on GitHub:** 2026-11-15
**Official repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Pre-PR #14 `main` commit:** `6daa1705ff11d958a10cffd951eca9f5f2a1084c` (shared 2D/3D hex adjacency, PR #10).

## Existing gameplay and 3D baseline

- React 18 / CRA 5 and local `boardgame.io` client; online and AI routes are disabled.
- The game engine in `src/game/SurfKingGame.js` manages 53 cells, turns, cards, obstacles, and victory.
- The shared 2D/3D layout uses 53 cell IDs and a provisional coordinate manifest.
- The live Three.js board and 2D/3D switching entered `main` in PR #9. 3D shows actual players and obstacles from a public snapshot, without changing rules.
- Application Jest tests, production build, and WebGL browser behavior have not been reverified in this session.

## Obstacle refinement (PR #14)

- [Issue #13](https://github.com/board-games-jf/surf-king-react/issues/13) / [PR #14](https://github.com/board-games-jf/surf-king-react/pull/14), refines the five live Three.js obstacles with procedural meshes. Check the PR for its current merge status.
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

1. Install dependencies and run Jest and the production build on the current main.
2. Open `/#/obstacles`, inspect the five models in real WebGL and play a local match in 3D to verify obstacle placement, expiry, overlays and the 2D fallback.
3. Resolve any rendering defects in a focused follow-up issue/PR; keep Issue #13 open until its runtime acceptance checks are verified.
4. **The owner authorized merging PR #14 on 2026-11-15; no deployment authorization was granted.**
