# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Current main:** `b51c9854262cf0289b693343d47d67e5a8dd6b99` (PR #36 merged; verification run 44995028044 passed; deployment not established).

## Current focus — board surfer motion (Issue #37)

- PR #36 is already merged. Both owner-approved athletes, three creator poses, right-hand greeting, curved boards and free orbit are available in main. Male asset is prepared by the pinned hash/length script before npm start/build/test; the actual binary is not stored in Git. [CI run 44995028044](https://github.com/board-games-jf/surf-king-react/actions/runs/44995028044) passed Jest, strict build and both WebGL review steps. Issue #33 remains open for wider art quality gates; PRs #34/#35 overlap historical documentation/board proof and must be reconciled, not blindly merged.
- Owner approved the S-shaped travel in the first review on 2026-11-22, requested more articulated motion and rejected the detached fall. Shared athlete art now precomputes alternating weight-transfer poses (hips, knees, torso and balancing arms) and a staged in-place stumble (arms react, counterbalance, knees buckle into a lowered stance). Feet are targeted to original ankle positions at keyframes; no horizontal rider translation or whole-body fall rotation. Board rocks briefly; recovery reverses the staged reaction to the riding posture. Exact contact between interpolated keyframes and visual feel still require review. The S trajectory and acceleration remain unchanged.
- Public snapshot projects the existing `fellOffTheBoard` marker to a boolean. Renderer never changes authoritative cells, legal moves, energy, cards or turns. Fallen state persists until the engine clears it; initial snapshots do not replay an old fall; interrupted transitions retarget from their current value; reduced motion snaps travel and fall state. Catalog offers one-click nearby glide, manual placement, fall and recover for the chosen rider, separate from game rules.
- Baseline [CI run 44995882327](https://github.com/board-games-jf/surf-king-react/actions/runs/44995882327) passed Jest, strict build and WebGL for both characters before this refinement. Added tests for anchored rider, joint transitions, ankle endpoints and carving directions; new CI and visual acceptance are pending. The fallen state is a stylized in-place loss of balance rather than a literal water collision or hand-contact climb. Test with `/#/catalog` on this branch. No merge or deploy authorized for #37.

## Integrated main baseline

- Local boardgame.io play, shared 53-cell 2D/3D board, interactive 3D catalog and obstacle visuals remain in place; online multiplayer is not active.
- PRs #25/#27/#29/#31/#32 integrated Quaternius-based styled male/female GLBs, cosmetic studio, shared board renderer, pose presets, hair and procedural fallback. These are still used in main and are not removed by PR #36. Owner rejection of the earlier art quality and pose led to #33; related issues #20/#22/#24/#26/#28/#30 remain open until their actual criteria are reviewed.
- Seven player board colors, gameplay-neutral cosmetics and local-only visual drafts are unchanged. Gameplay/rules review #11 / PR #12 is independent.
- Historical provenance and earlier validations are preserved in DATA_SOURCES.md, relevant issues/PRs and Git history. Full Jest, CRA build and desktop/mobile WebGL acceptance are still required. Run `CI=true npm test -- --watchAll=false` and `npm run build` in an updated dependency-enabled checkout.

No merge or deployment authorized for the motion branch. Keep #33 and #37 open until their actual acceptance criteria are verified.
