# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Main before PR #38 integration:** `b51c9854262cf0289b693343d47d67e5a8dd6b99` (PR #36 merged; verification run 44995028044 passed; deployment not established).

## Current focus — character phase accepted; further work deferred

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

## Separate gameplay-design research (Issue #11 / draft PR #12, 2026-11-23)

- The owner prefers a fast, accessible, interactive surf race over perfect mathematical fairness or setup exception stacking. Design work remains **documentation/simulation-only**, independent of the approved 3D character milestone and the live `SurfKingGame.js` rules.
- [Experimental minimal R1 playtest guide](rules-review/PLAYTEST_MINIMAL_R1_RULES.md) and [394,000-game full-match research report](rules-review/R0_MINIMAL_RULES_STUDY.md) (14,517,391 passed model invariants) propose a small rule core: random starts, 2 starting energy/2 cards, zero-cost mandatory movement, one card action, immediate next-turn recovery after losing a random hand card, first round without direct opponent attacks, **rotate first player each round**, no standing Drop In swap and full-round highest-energy finish. No positional or initiative compensation.
- **Not approved or implemented:** the 17 experimental B60 card effects, one-page R1 trial, changing start player each round, round-end finish, fall/steal tuning and any other experimental R0/R1 mechanics. Human game enjoyment and actual duration remain unmeasured; the owner conducts manual tests. In 2P, rotation creates consecutive turns across some round boundaries. 7P actor×start worst-case mismatch is not eliminated.
- On 2026-11-23, latest checked `main`: `c6fd08e2da82ca223740e3aa944c47f87aa84f16`. Issue #11 open, draft PR #12 open/unmerged. **Before any future merge**, reconcile the draft SK-DEC-019–024 gameplay IDs with `main`'s already accepted visual IDs and review the rest of the branch diff. No production-game tests, merge or deployment in this gameplay research.
- **Next small task:** owner manually tests the short R1 guide; separately audit card-text clarity and redundant B60 effects, then freeze a single approved rulebook before creating an implementation task. Avoid adding more setup compensation unless a specific repeatable human-play problem justifies it.
