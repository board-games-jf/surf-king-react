# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Current main:** `aac50d222a3437200bcd4886eb90f29e537dfc65` (PR #32 merged earlier; no deployment authorized in this session).

## Current focus — selected female surfer (Issue #33)

The owner reviewed the real WebGL screenshot of the corrected Female Athlete stance, reported a substantial improvement and explicitly chose this rigged model as the foundation for further work. Stop exploring alternative female bodies for this workstream. This is base-model selection, not acceptance of the final production pose/board. The full premium visual gate remains in [#33](https://github.com/board-games-jf/surf-king-react/issues/33) and the approved direction is recorded in draft [PR #34](https://github.com/board-games-jf/surf-king-react/pull/34), including SK-DEC-018.

- **Active draft [PR #36](https://github.com/board-games-jf/surf-king-react/pull/36)** — branch `feat/33-rigged-asset-review`: `/#/art-review` automatically loads the unchanged owner-supplied 24-joint rigged GLB and opens in Surf. Only Surf and Base controls, free orbit and zoom remain. Removed manual model/board upload, animation selector, statistics panel and associated unused upload logic. Source identity, license evidence and embedded walk/run clips remain documented in DATA_SOURCES.md; clips are no longer exposed in this UI.
- Refined the previously owner-reviewed forward-knee solve: lower hips with mild lead-side weight shift; diagonal lead shoe and nearly transverse rear shoe; knee poles follow shoe directions; asymmetric arms stay on their anatomical sides with more elbow flexion; chest and head turn toward the left-leading board nose. The board mesh and original character asset are unchanged.
- **Validation:** 17 smoke cases passed using the fetched geometry helper and synthetic vector implementation (four headings × two toe directions, original and refined knee/arm cases, plus unreachable target). Added Jest regression cases for direction asymmetry and horizontal footwear. These are not Jest or real Three.js/WebGL results. No dependency checkout or real GLB render available in this session. The new pose has not been visually approved; actual soles/deck contact, anatomy, torso/head orientation, mobile view and performance remain open. Left-leading stance remains a review default.
- **Related work:** [PR #34](https://github.com/board-games-jf/surf-king-react/pull/34) records the accepted quality gate, free orbit and selected female model; [PR #35](https://github.com/board-games-jf/surf-king-react/pull/35) contains a separate curved surfboard proof. Do not duplicate these decisions or board geometry in new experiments. Both remain separate draft PRs. Their handoff edits may need reconciliation when integrating.
- **Next:** update the PR #36 branch, open `/#/art-review`, verify the refined stance from front/side/three-quarter views and test the Base/Surf toggle. If accepted, consolidate the selected surfer and approved board in a shared production renderer, then select and validate a male counterpart. Keep #33 open.

## Integrated main baseline

- Local boardgame.io play, shared 53-cell 2D/3D board, interactive 3D catalog and obstacle visuals remain in place; online multiplayer is not active.
- PRs #25/#27/#29/#31/#32 integrated Quaternius-based styled male/female GLBs, cosmetic studio, shared board renderer, pose presets, hair and procedural fallback. These are still used in main and are not removed by PR #36. Owner rejection of the earlier art quality and pose led to #33; related issues #20/#22/#24/#26/#28/#30 remain open until their actual criteria are reviewed.
- Seven player board colors, gameplay-neutral cosmetics and local-only visual drafts are unchanged. Gameplay/rules review #11 / PR #12 is independent.
- Historical provenance and earlier validations are preserved in DATA_SOURCES.md, relevant issues/PRs and Git history. Full Jest, CRA build and desktop/mobile WebGL acceptance are still required. Run `CI=true npm test -- --watchAll=false` and `npm run build` in an updated dependency-enabled checkout.

No merge or deployment authorized. Do not close #33 on partial review.
