# Project Handoff

**Last verified:** 2026-11-14
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Verified `main` commit:** `4aed28226bed07477ee92377174373600aee47a4` (2026-11-15; provisional layout PR #8 merged)

This is a static recovery snapshot. Check GitHub for new commits, open Issues, Pull Requests, and deployed systems at the start of every task.

## Implemented code (runtime not yet verified)

- React 18 / Create React App 5 with JavaScript and routing in `src/Routes.js`.
- A local `boardgame.io` client in `src/pages/LocalPage/index.js`. Online and AI routes are commented out.
- A separate `boardgame.io` server entry point at `src/server/index.js`; its production readiness and use by the frontend are not established.
- Game state and rules in `src/game/SurfKingGame.js`, including 53 logical cells, cards, turns, energy, moves, attacks, obstacles, and win conditions.
- SVG hex board and interactions in `src/components/Board/` and `src/components/HexGrid/`. The visual grid uses 56 placeholder items; verify its mapping to 53 logical cells.
- 21 test files exist (20 game-focused and one app test). None has been executed in this recovery effort.

## Latest relevant main commits

- `53dc315c` (2026-11-14): map rendering contract PR #6 merged; no runtime changes.
- `aff1274b` (2026-11-14): governance PR #4 merged; no application runtime changes.
- `76f1a673` (2022-09-25): cyclone-related win condition.
- `e712de158` (2022-09-22): card replenishment fix.

## Active work

- [Issue #7](https://github.com/board-games-jf/surf-king-react/issues/7): candidate local 2D/3D gameplay integration in `feat/7-live-3d-gameplay`.
- [PR #8](https://github.com/board-games-jf/surf-king-react/pull/8) was merged into `main` at `4aed2822` (2026-11-15).
- This branch adds an experimental selectable Three.js view wired to the existing game controller, not a verified production release. No merge or deployment is authorized for this new branch.

- [Issue #7](https://github.com/board-games-jf/surf-king-react/issues/7): integrate the user's 3D visual preview with the live game state.
- Working branch: `feat/7-live-3d-board`; [draft PR #8](https://github.com/board-games-jf/surf-king-react/pull/8) provides a **provisional** 53-cell engine-to-3D manifest and validation tests (partial implementation of Issue #7; not authorized for merge).
- [Issue #5](https://github.com/board-games-jf/surf-king-react/issues/5) closed via merged [PR #6](https://github.com/board-games-jf/surf-king-react/pull/6).
- No runtime renderer, 2D/3D toggle or multiplayer changes have been implemented in this initial step.

## Blockers and validation gaps

- The canonical rulebook and original Figma source have not been verified against this repository.
- The standalone Three.js visual ZIP uses provisional cell numbering and fixture-based obstacle placements; its layout is not an authoritative game-state mapping.
- `package.json` names `loadsh` while the engine imports `lodash`; actual dependency failure is untested.
- Docker uses Node 16.17 and starts the client only. Server connectivity and hosting are not validated.
- Stone card initial `RemaningTurn` value is 3; reconcile with the approved four-round rule before changing behavior.
- No GitHub Actions workflows, shipped 3D models, or verified online hosting were found in the repository tree.
- Authentication, persistence, reconnection, and multiplayer authority are not established.
- MVP acceptance criteria and exclusions still require product-owner approval.

## Integration validation still required

- Run the CRA/Jest suite and production build after installing the pinned Three.js dependency, and test WebGL in actual desktop/mobile browsers.
- Verify the provisional engine-ID-to-layout mapping against the approved original board, including clickable hex positions.
- Check visual accuracy against the uploaded ZIP. This first gameplay-focused port reuses its coastal art direction but does not reproduce every visual detail or animation.
- Review gameplay flows for movement, drop-in, all card targets, obstacle timers and winning moves before requesting a merge.
- The server, lobby, online multiplayer and deployment remain unchanged.

## Next smallest action

1. Review the provisional [layout manifest](../src/map/layout/board-layout.json) and its tests against the approved board reference, then confirm actual numeric cell mapping.
2. Reproduce the full application tests and build in a compatible environment; the isolated layout checks are not a full app validation.
3. Under the same Issue #7 in a subsequent scoped PR, adapt the independent Three.js scene to the live public game snapshot and existing move callbacks, preserving the 2D view.
