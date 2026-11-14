# Project Handoff

**Last verified:** 2026-11-14
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Verified `main` commit:** `aff1274b687ead0b595007960962133b7a4ce31a` (2026-11-14; governance PR #4 merged)

This is a static recovery snapshot. Check GitHub for new commits, open Issues, Pull Requests, and deployed systems at the start of every task.

## Implemented code (runtime not yet verified)

- React 18 / Create React App 5 with JavaScript and routing in `src/Routes.js`.
- A local `boardgame.io` client in `src/pages/LocalPage/index.js`. Online and AI routes are commented out.
- A separate `boardgame.io` server entry point at `src/server/index.js`; its production readiness and use by the frontend are not established.
- Game state and rules in `src/game/SurfKingGame.js`, including 53 logical cells, cards, turns, energy, moves, attacks, obstacles, and win conditions.
- SVG hex board and interactions in `src/components/Board/` and `src/components/HexGrid/`. The visual grid uses 56 placeholder items; verify its mapping to 53 logical cells.
- 21 test files exist (20 game-focused and one app test). None has been executed in this recovery effort.

## Latest relevant main commits

- `aff1274b` (2026-11-14): governance PR #4 merged; no application runtime changes.
- `76f1a673` (2022-09-25): cyclone-related win condition.
- `e712de158` (2022-09-22): card replenishment fix.

## Active work

- [Issue #5](https://github.com/board-games-jf/surf-king-react/issues/5): define interchangeable 2D and independent 3D map contract.
- Working branch: `docs/5-map-view-contract`; check [live Pull Requests](https://github.com/board-games-jf/surf-king-react/pulls) for its review status.
- [Issue #3](https://github.com/board-games-jf/surf-king-react/issues/3) was completed by merged [PR #4](https://github.com/board-games-jf/surf-king-react/pull/4).
- No application code, runtime tests or deployment changes have been made as part of Issue #5.

## Blockers and validation gaps

- The canonical rulebook and original Figma source have not been verified against this repository.
- `package.json` names `loadsh` while the engine imports `lodash`; actual dependency failure is untested.
- Docker uses Node 16.17 and starts the client only. Server connectivity and hosting are not validated.
- Stone card initial `RemaningTurn` value is 3; reconcile with the approved four-round rule before changing behavior.
- No GitHub Actions workflows, shipped 3D models, or verified online hosting were found in the repository tree.
- Authentication, persistence, reconnection, and multiplayer authority are not established.
- MVP acceptance criteria and exclusions still require product-owner approval.

## Next smallest action

1. Review the [map view contract](MAP_RENDERING.md) in Issue #5's PR; merge only with explicit owner approval.
2. Separately reproduce baseline dependency installation, tests and build.
3. Validate the 53 logical cell IDs against the existing 2D geometry before implementing the view switch or importing 3D assets.
