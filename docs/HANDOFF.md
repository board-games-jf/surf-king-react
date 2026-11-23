# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Main before PR #38 integration:** `b51c9854262cf0289b693343d47d67e5a8dd6b99` (PR #36 merged; verification run 44995028044 passed; deployment not established).

## Current focus — accepted character baseline; targeted phase 2 resumed

- Owner accepted the male/female athlete baseline, S carving, fall into water with raised board and separate board-facing remount, and explicitly authorized merging [PR #38](https://github.com/board-games-jf/surf-king-react/pull/38) on 2026-11-22. Check the linked PR for the actual integration commit and status; merge is not deployment.
- PR #36 delivered the approved distinct textured athletes, unified `/#/customize`, free orbit, standing/relaxed (right-hand wave)/surfing poses, cosmetic board shapes and colors, and shared board/catalog assets. PR #38 delivers articulated S-shaped idle/travel, acceleration and braking, staged water entry with the board partly submerged beside the rider, and distinct 2.20 s recovery facing the near rail. `/#/catalog` exposes glide, fall and remount preview controls. Motion follows the public fallen marker; authoritative rules/cells and 2D rendering are unchanged.
- Verified final code revision `3ddf4aa4071efa06f6f03ac0a559556b1fdbc2d7`: [CI run 44998838137](https://github.com/board-games-jf/surf-king-react/actions/runs/44998838137) completed successfully (36 suites and 280 tests passed; 1 suite and 2 tests skipped; strict build; actual female/male WebGL). Owner accepted the current art and motion. Hand/foot contacts and buoyancy remain approximations.
- **Character work was paused after PR #38; owner resumed targeted customization on 2026-11-23 via #40.** [Issue #33](https://github.com/board-games-jf/surf-king-react/issues/33) consolidates the accepted phase and deferred customization/animation backlog: limited Sims-like appearance options on the approved models, player-specific cosmetic profile linkage, further animation/contact polish and additional gestures subject to review, permanent male asset bundling, licensing/reference and performance validation. No new implementation authorized. The male binary is still locally prepared and hash-pinned; hair/skin/surfwear are baked into the current assets.
- Issue #37 tracks the completed motion scope and its merge verification. Historical issues #20/#22/#24/#26/#28/#30 and overlapping draft PRs #34/#35 must be reconciled against #33, not blindly merged or marked complete. No deployment authorized. Resume other project work from current main and the appropriate approved issue; gameplay rules review #11 / PR #12 is independent.

## Active draft — player-specific appearance (#40 / PR #41, 2026-11-23)

- Owner requested resuming the remaining customization work. The approved male/female athlete models and S-carving, fall and remount animation remain unchanged.
- Branch `feat/40-local-player-appearance`: creator selects one of seven local players, saves the approved character and board silhouette in a versioned browser-local mapping, and remembers the most recently saved player. The shared 3D board and catalog read the mapping at scene mount and reuse the existing independent rig clones. Fixed player identity colors remain authoritative; no gameplay snapshot, rules, network or 2D changes.
- The creator still has a global preview draft; only player character/board silhouette are effective in matches. Textured hair, skin and clothing are not edited or falsely exposed as selectable variations. Approved motions continue without any new animation experiments.
- Issue #40 and draft PR #41 track this contained first phase-2 task. Jest/build/browser checks require fresh CI results before merge consideration. Additional avatar materials/masks, surfwear and permanent source-asset work remain in #33; do not claim those deliverables have been implemented.
- Next: check GitHub Actions for #41, inspect each avatar and colored board in `/#/catalog` and the local 3D game, confirm storage behavior and mobile usability; request explicit approval before merge. No deploy authorization.

## Integrated main baseline

- Local boardgame.io play, shared 53-cell 2D/3D board, interactive 3D catalog and obstacle visuals remain in place; online multiplayer is not active.
- PRs #25/#27/#29/#31/#32 integrated Quaternius-based styled male/female GLBs, cosmetic studio, shared board renderer, pose presets, hair and procedural fallback. These are still used in main and are not removed by PR #36. Owner rejection of the earlier art quality and pose led to #33; related issues #20/#22/#24/#26/#28/#30 remain open until their actual criteria are reviewed.
- Seven player board colors, gameplay-neutral cosmetics and local-only visual drafts are unchanged. Gameplay/rules review #11 / PR #12 is independent.
- Historical provenance and earlier validations are preserved in DATA_SOURCES.md, relevant issues/PRs and Git history. Maintain regression coverage and measure production/mobile performance before release. Run `CI=true npm test -- --watchAll=false` and `npm run build` in an updated dependency-enabled checkout.

Character phase is paused; #33 remains the continuation issue. No deployment is authorized.
