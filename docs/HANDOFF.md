# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Main before PR #38 integration:** `b51c9854262cf0289b693343d47d67e5a8dd6b99` (PR #36 merged; verification run 44995028044 passed; deployment not established).

## R1 local rules pilot — implementation branch (2026-11-24)

- Owner explicitly authorized implementing the experimental R1 for local testing, **not** final rulebook ratification, merge or deploy. [Issue #42](https://github.com/board-games-jf/surf-king-react/issues/42), branch `feat/42-r1-local-pilot` from main `c6fd08e2`; separate from historical design [#11](https://github.com/board-games-jf/surf-king-react/issues/11) / [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).
- Branch adds `src/game/r1/SurfKingR1.js`, a separate boardgame.io ruleset, selected by default on the local setup screen with original rules still available. Both rulesets reuse the 53-cell board and public snapshot. R1 controls expose legal targets, recovery, card descriptions, Drop In, movement and overflow choice. No 3D asset changes.
- Tested exact fetched engine in an isolated V8 harness with deterministic random/event adapters: 14 rule fixtures passed; 600 complete scripted games (200 each for 2/4/7 players), 15,952 state checkpoints, all ten cards and Drop In exercised. This is **not** the actual boardgame.io client/Jest/build/browser run. The branch includes a real client integration test and a PR-only test/build workflow; verify results before marking acceptance criteria complete.
- Next: verify CI, test both board views and actual 2/4/7-person local matches, collect feedback on Cyclone, Jumping, interaction and balance. No merge or deployment authorized.

## Character phase — accepted; further work deferred

- Owner accepted the male/female athlete baseline, S carving, fall into water with raised board and separate board-facing remount, and explicitly authorized merging [PR #38](https://github.com/board-games-jf/surf-king-react/pull/38) on 2026-11-22. Check the linked PR for the actual integration commit and status; merge is not deployment.
- PR #36 delivered the approved distinct textured athletes, unified `/#/customize`, free orbit, standing/relaxed (right-hand wave)/surfing poses, cosmetic board shapes and colors, and shared board/catalog assets. PR #38 delivers articulated S-shaped idle/travel, acceleration and braking, staged water entry with the board partly submerged beside the rider, and distinct 2.20 s recovery facing the near rail. `/#/catalog` exposes glide, fall and remount preview controls. Motion follows the public fallen marker; authoritative rules/cells and 2D rendering are unchanged.
- Verified final code revision `3ddf4aa4071efa06f6f03ac0a559556b1fdbc2d7`: [CI run 44998838137](https://github.com/board-games-jf/surf-king-react/actions/runs/44998838137) completed successfully (36 suites and 280 tests passed; 1 suite and 2 tests skipped; strict build; actual female/male WebGL). Owner accepted the current art and motion. Hand/foot contacts and buoyancy remain approximations.
- **Pause character development.** [Issue #33](https://github.com/board-games-jf/surf-king-react/issues/33) consolidates the accepted phase and deferred customization/animation backlog: limited Sims-like appearance options on the approved models, player-specific cosmetic profile linkage, further animation/contact polish and additional gestures subject to review, permanent male asset bundling, licensing/reference and performance validation. No new implementation authorized. The male binary is still locally prepared and hash-pinned; hair/skin/surfwear are baked into the current assets.
- Issue #37 tracks the completed motion scope and its merge verification. Historical issues #20/#22/#24/#26/#28/#30 and overlapping draft PRs #34/#35 must be reconciled against #33, not blindly merged or marked complete. No deployment authorized. Resume other project work from current main and the appropriate approved issue; gameplay rules review #11 / PR #12 is independent.

## Integrated main baseline

- Local boardgame.io play, shared 53-cell 2D/3D board, interactive 3D catalog and obstacle visuals remain in place; online multiplayer is not active.
- PRs #25/#27/#29/#31/#32 integrated Quaternius-based styled male/female GLBs, cosmetic studio, shared board renderer, pose presets, hair and procedural fallback. These are still used in main and are not removed by PR #36. Owner rejection of the earlier art quality and pose led to #33; related issues #20/#22/#24/#26/#28/#30 remain open until their actual criteria are reviewed.
- Seven player board colors, gameplay-neutral cosmetics and local-only visual drafts are unchanged. Gameplay/rules review #11 / PR #12 is independent.
- Historical provenance and earlier validations are preserved in DATA_SOURCES.md, relevant issues/PRs and Git history. Maintain regression coverage and measure production/mobile performance before release. Run `CI=true npm test -- --watchAll=false` and `npm run build` in an updated dependency-enabled checkout.

Character phase is paused; #33 remains the continuation issue. No deployment is authorized.
