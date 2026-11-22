# Project Handoff

**Last GitHub verification:** 2026-11-22  
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)  
**Current main:** `aac50d222a3437200bcd4886eb90f29e537dfc65` (PR #32 merged earlier; no deployment authorized in this session).

## Current focus — selected athlete integration (Issue #33)

The owner selected the real rigged Female Athlete after reviewing the corrected render and explicitly requested the same model in the creator, poses, customization and game board. The premium visual gate remains open: this is a draft integration for review, not a release or final visual acceptance.

- [PR #36](https://github.com/board-games-jf/surf-king-react/pull/36), branch `feat/33-rigged-asset-review`, now exposes both owner-approved rigged athletes in the unified `/#/customize` creator. Female Athlete remains the default, while either character can be selected and saved. Older routes redirect there. The exact female binary is bundled; the male is prepared locally by `npm run prepare:surfer-assets` (also before npm start/test/build/client), pinned by SHA-256 and byte length. Optional local input: `npm run prepare:surfer-assets -- /path/to/man-base-character-rigged.glb`. No browser runtime download, no new service, no permanent male binary committed in this environment.
- Both character types reuse `athleteSurferArt.js`, three poses, free orbit and the curved board factory. Owner accepted the male preview on 2026-11-22 and requested direct selection and board visibility (SK-DEC-020). The relaxed pose now raises the right forearm and waves gently at the elbow with reduced-motion handling; the left arm stays loose, hips retain the existing weight shift. Standing and surf code unchanged. No finger bones or individual finger motion.
- The creator saves the gender and existing cosmetic style locally. **Ver no tabuleiro** opens the catalog with the chosen character focused; both models are loaded using independent skeletons for their respective player presets in catalog and local 3D games. Board shape transfers to the preview; board identity colors remain unique. No per-player saved profile assignment, gameplay or 2D changes. Procedural fallback retained.
- Prior [CI run 44994596123](https://github.com/board-games-jf/surf-king-react/actions/runs/44994596123) passed Jest, strict build and female/male WebGL review for the prior revision. New selection, asset identity, wave regression and real WebGL board navigation tests added; latest revision results and visual acceptance of the greeting are pending. Independent rights-chain audit and GPU/device checks remain outstanding.
- Next: update the branch and run npm start (Node 18+; CI uses Node 20), verify both selections and catalog focus, review both right-hand waves and actual board stance, then reconcile PRs and decide on merge separately. Both are textured single meshes; independent clothing/hair/skin variants and player-profile integration remain out of scope.
- PR #34 records the accepted quality gate/free orbit/asset choice. PR #35's curved board code is incorporated here without merging either PR; reconcile overlapping documentation/geometry before merging any related PR.

## Integrated main baseline

- Local boardgame.io play, shared 53-cell 2D/3D board, interactive 3D catalog and obstacle visuals remain in place; online multiplayer is not active.
- PRs #25/#27/#29/#31/#32 integrated Quaternius-based styled male/female GLBs, cosmetic studio, shared board renderer, pose presets, hair and procedural fallback. These are still used in main and are not removed by PR #36. Owner rejection of the earlier art quality and pose led to #33; related issues #20/#22/#24/#26/#28/#30 remain open until their actual criteria are reviewed.
- Seven player board colors, gameplay-neutral cosmetics and local-only visual drafts are unchanged. Gameplay/rules review #11 / PR #12 is independent.
- Historical provenance and earlier validations are preserved in DATA_SOURCES.md, relevant issues/PRs and Git history. Full Jest, CRA build and desktop/mobile WebGL acceptance are still required. Run `CI=true npm test -- --watchAll=false` and `npm run build` in an updated dependency-enabled checkout.

No merge or deployment authorized. Do not close #33 on partial review.
