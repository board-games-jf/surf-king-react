# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Current main:** `aac50d222a3437200bcd4886eb90f29e537dfc65` (PR #32 merged earlier; no deployment authorized in this session).

## Current focus — selected athlete integration (Issue #33)

The owner selected the real rigged Female Athlete after reviewing the corrected render and explicitly requested the same model in the creator, poses, customization and game board. The premium visual gate remains open: this is a draft integration for review, not a release or final visual acceptance.

- [PR #36](https://github.com/board-games-jf/surf-king-react/pull/36), branch `feat/33-rigged-asset-review`: the unchanged 24-joint Female Athlete is now the only character exposed in the unified `/#/customize` creator. Former `/#/surfers` and `/#/art-review` routes redirect there. Removed duplicate gallery navigation and old comparison UI; retained legacy source assets and board fallbacks until the replacement is verified.
- `athleteSurferArt.js` is reused by the creator and the board. Three real skeletal poses (standing, relaxed, surf), free orbit, three board shapes and five board colors are exposed. The curved board factory and tests were reused from draft PR #35 rather than authoring duplicate geometry. Deck height is a center-surface approximation, not a verified contact fit.
- The creator saves the existing browser-local style schema; poses are not saved. Its board link transfers the chosen board shape to catalog female previews. In live matches, the selected Female Athlete replaces female presets on this branch, with independent skeletons and existing per-player board colors. The old male GLB remains temporary; procedural fallback is retained. Match rules, 2D rendering and authoritative state are unchanged. Personal saved styles are not linked to player IDs.
- The asset is single-mesh/textured: no independent hairstyles, skin or clothing variants are claimed. Those require authored meshes or validated texture masks. Male counterpart, surf-specific clothing/footwear, motion clips, visual board fit and performance remain open.
- Added regression sources for pose switching, preservation of texture/material, board replacement/color/disposal and simplified controls. The earlier anatomical smoke tests passed on synthetic vectors; earlier CI on commit `252a247` failed Jest (three suites) and strict build (existing lint warnings). New CI is triggered by the draft PR; no completed result for the final integration is claimed here. Real GLB WebGL/mobile testing remains pending.
- Next: run this branch, open `/#/customize`, try the three poses and board choices, use **Ver no tabuleiro**, focus the female rider, and inspect a local 3D game. Review contact, anatomy, scale and GPU performance before considering merge. Keep #33 open.
- PR #34 records the accepted quality gate/free orbit/asset choice. PR #35's curved board code is incorporated here without merging either PR; reconcile overlapping documentation/geometry before merging any related PR.

## Integrated main baseline

- Local boardgame.io play, shared 53-cell 2D/3D board, interactive 3D catalog and obstacle visuals remain in place; online multiplayer is not active.
- PRs #25/#27/#29/#31/#32 integrated Quaternius-based styled male/female GLBs, cosmetic studio, shared board renderer, pose presets, hair and procedural fallback. These are still used in main and are not removed by PR #36. Owner rejection of the earlier art quality and pose led to #33; related issues #20/#22/#24/#26/#28/#30 remain open until their actual criteria are reviewed.
- Seven player board colors, gameplay-neutral cosmetics and local-only visual drafts are unchanged. Gameplay/rules review #11 / PR #12 is independent.
- Historical provenance and earlier validations are preserved in DATA_SOURCES.md, relevant issues/PRs and Git history. Full Jest, CRA build and desktop/mobile WebGL acceptance are still required. Run `CI=true npm test -- --watchAll=false` and `npm run build` in an updated dependency-enabled checkout.

No merge or deployment authorized. Do not close #33 on partial review.
