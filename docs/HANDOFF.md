# Project Handoff

**Last direct GitHub review:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Starting `main`:** `e79c02c8f008c70dc84b5273d3ce0b20e9c78410` (rigged GLB evaluation PR #23 merged).

## Integrated state

- Local boardgame.io match, shared 53-cell 2D/3D board, catalogue and card-inspired animated obstacles are integrated.
- Obstacles were visually approved in PR #17. Do not reopen obstacle art without a new request.
- PR #21 integrated the procedural gallery and cosmetic creator; localStorage holds a preview-only draft, not a real player profile.
- PR #23 integrated the local Quaternius CC0 skinned male GLB (65-joint rig) and original-base gallery comparison.
- Surfboards remain cosmetic only (SK-DEC-011); direction for characters and visual identity is SK-DEC-012/013.
- Rules issue #11 / draft PR #12 are separate; online multiplayer is not established.

## Active visual work — Issue #24

- Branch `feat/24-styled-rigged-surfer` / [PR #25](https://github.com/board-games-jf/surf-king-react/pull/25) received **explicit owner merge authorization on 2026-11-16**. Confirm actual merge status in GitHub. **No deployment is authorized.**
- New `riggedSurferArt.js` decorates the same skinned GLB body/skeleton with surfwear/skin color zones, smoothly shaped hair, a cosmetic board and a relaxed arm pose.
- `RiggedBaseViewer` reuses the loaded local GLB for styled and original modes. The gallery offers styled GLB / original GLB / procedural comparisons.
- `/#/customize` defaults to the styled GLB; the existing hairstyle, skin, outfit and board controls change this preview without re-downloading the asset. Previous procedural models remain available as fallback.
- **Art limitation:** the authored GLB is a male body. Female-presenting options are color/hairstyle experiments, **not** a dedicated female anatomical model. Final character art and surfing animation remain unfinished.
- The active visual changes are isolated to studio previews. Real match actors, game rules, obstacle models and the map renderer remain unchanged.

## Validation and next action

- `riggedSurferArt.js` source passed JavaScript syntax parsing. Executed the actual production styling module against a lightweight Three.js API mock for **9 hair/board combinations**: all constructed, animated and restored the skinned rig/materials/geometry after disposal. Added targeted Jest art/cleanup tests and updated React studio tests, but these **have not been executed in Jest**.
- CRA build, Jest, actual GLTFLoader/WebGL rendering, mobile presentation and visual quality still need validation in the application.
- Next: run `npm test -- --watchAll=false` and `npm run build`, then open `/#/surfers` and `/#/customize` at desktop and mobile sizes to review the new model.
- The owner explicitly authorized PR #25 merge on 2026-11-16. **No deployment is authorized.** Issue #24 stays open pending Jest/build/WebGL and visual review.
