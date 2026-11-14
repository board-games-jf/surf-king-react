# Project Handoff

**Last verified:** 2026-11-14
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Baseline `main` commit:** `76f1a673219cbc8be28fd97dc76c1ecabf3394f3` (2022-09-25)

This is a static recovery snapshot. Check GitHub for new commits, open Issues, Pull Requests, and deployed systems at the start of every task.

## Implemented code (runtime not yet verified)

- React 18 / Create React App 5 with JavaScript and routing in `src/Routes.js`.
- A local `boardgame.io` client in `src/pages/LocalPage/index.js`. Online and AI routes are commented out.
- A separate `boardgame.io` server entry point at `src/server/index.js`; its production readiness and use by the frontend are not established.
- Game state and rules in `src/game/SurfKingGame.js`, including 53 logical cells, cards, turns, energy, moves, attacks, obstacles, and win conditions.
- SVG hex board and interactions in `src/components/Board/` and `src/components/HexGrid/`. The visual grid uses 56 placeholder items; verify its mapping to 53 logical cells.
- 21 test files exist (20 game-focused and one app test). None has been executed in this recovery effort.

## Latest relevant main commits

- `76f1a673` (2022-09-25): cyclone-related win condition.
- `e712de158` (2022-09-22): card replenishment fix.

## Active work

- [Issue #3](https://github.com/board-games-jf/surf-king-react/issues/3): documentation governance and recovery baseline.
- Working branch: `docs/3-recovery-baseline`. Refer to the live GitHub [Pull Requests page](https://github.com/board-games-jf/surf-king-react/pulls) for the review/merge state; this branch must not be merged without explicit owner authorization.
- Historical Issues #1 and #2 are closed. No open PRs existed when the recovery task began.
- Root `AGENTS.md` and `docs/` did not exist before this issue.

## Blockers and validation gaps

- The canonical rulebook and original Figma source have not been verified against this repository.
- `package.json` names `loadsh` while the engine imports `lodash`; actual dependency failure is untested.
- Docker uses Node 16.17 and starts the client only. Server connectivity and hosting are not validated.
- Stone card initial `RemaningTurn` value is 3; reconcile with the approved four-round rule before changing behavior.
- No GitHub Actions workflows, shipped 3D models, or verified online hosting were found in the repository tree.
- Authentication, persistence, reconnection, and multiplayer authority are not established.
- MVP acceptance criteria and exclusions still require product-owner approval.

## Next smallest action

1. Review and obtain explicit merge authorization for Issue #3's documentation PR; do not deploy.
2. After authorization and merge, open a separate Issue to reproduce dependency installation, existing tests, and build from the lockfile in an isolated environment.
3. Compare implemented rules against the approved canonical rulebook before refactoring or implementing the hybrid 3D renderer.
