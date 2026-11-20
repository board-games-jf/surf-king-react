# Project Handoff

**Last GitHub verification:** 2026-11-20
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Verified `main` HEAD:** `aac50d222a3437200bcd4886eb90f29e537dfc65` (PR #32 merged).

## Integrated baseline

- Local boardgame.io match and a shared 53-cell 2D/Three.js 3D renderer, standalone interactive 3D board catalog, obstacle art and an experimental surfer gallery/creator. Online multiplayer is not active.
- The current studio, catalog and 3D board reuse local Quaternius CC0 male/female rigged base GLBs. `riggedSurferArt.js` adds vertex-colored clothing, procedural hair and an extruded cosmetic board; `surferPoses.js` applies local Euler offsets to the skeleton. Per-rider clones preserve independent rigs and seven player-identifying board colors, with a procedural rendering fallback.
- The creator's appearance save remains browser-local and cosmetic; it does not assign a saved player profile in a match. Boards do not affect rules (SK-DEC-011).
- PRs #29, #31 and #32 have merged with explicit owner authorization, but their source-level pose, hair and alignment tweaks did **not** establish accepted production artwork. The owner's real 3D screenshots showed serious pose/hair/foot-contact fidelity gaps. No deployment was authorized in those merges.

## Current priority — owner-approved premium visual bar (#33)

- **Accepted direction (SK-DEC-016):** match at least the perceived quality of the owner-approved 2026-11-16 concept render for the **actual interactive 3D surfer AND sculpted surfboard**. Required qualities include believable low surf crouch, foot/deck contact, expressive stylized proportions/face, integrated hair and surfwear, and a finished board with deck stripe, rails, rounded silhouette and fin.
- **Do not equate the approved image with a 3D mesh.** Existing Quaternius GLBs are neutral mannequin bases; incremental bone-angle adjustments and procedural accessory tweaks alone have repeatedly failed visual acceptance. The female source asset is now selected (SK-DEC-018); the surf-specific adaptation and rigging implementation are not yet accepted.
- [Issue #33](https://github.com/board-games-jf/surf-king-react/issues/33) is the consolidated visual quality gate. [#20](https://github.com/board-games-jf/surf-king-react/issues/20) covers earlier creator/board work, [#28](https://github.com/board-games-jf/surf-king-react/issues/28) gender rigs, and [#30](https://github.com/board-games-jf/surf-king-react/issues/30) rejected pose/hair polish; do not duplicate their past patches.
- The exact approved concept PNG exists in the owner's ChatGPT conversation, **not yet as a verified GitHub asset or issue attachment**. Attach it to #33 before declaring visual equivalence.

- **Accepted camera behavior (SK-DEC-017, 2026-11-19):** the owner requires a freely orbiting camera around surfers, so fixed-angle or 2.5D sprite characters are unsuitable as the primary production rendering strategy. Keep genuinely 3D characters and surfboards as the visual target, with full-angle quality and a proper rig for poses/customization. Current `createScene.js` uses `OrbitControls` and supports azimuth rotation, but its polar-angle constraint has not been evaluated against the requested freedom; avoid claiming the camera behavior is fully accepted until visually checked.
- Recent off-app 2.5D images and the schematic pose demonstration were rejected as an acceptable visual result; no 2.5D implementation, approved animated asset or new character/board integration exists on `main`.

## Current work — approved female art foundation (2026-11-20)

- **SK-DEC-018:** the owner reports having tested the Grab3D Female Athlete and explicitly selected it as the female surfer base. This is base-model approval, not acceptance of a finished surfer/board, animation or production integration. Use this model rather than continuing to search for alternatives; the old Quaternius model remains on `main` for now.
- [Draft PR #36](https://github.com/board-games-jf/surf-king-react/pull/36), branch `feat/33-rigged-asset-review`, provides an isolated local GLB reviewer. The owner reports a successful visual evaluation of the model; the exact file hash, devices, test configuration and resulting screenshots were not supplied. The assistant has not independently inspected the delivered binary or browser render.
- Publisher-declared CC0 and rigged GLB provenance are recorded in DATA_SOURCES.md. Secure the exact tested GLB, inspect its rig/materials/textures and licence, and establish a natural surf pose on the curved board. Do not apply the Quaternius-specific bone mappings and procedural art decorator blindly to the new model.
- PRs #34 (documentation), #35 (board study) and #36 (rigged-model reviewer) remain separate drafts. No merge or deployment authorized.

## Validation and blockers

- Prior Jest/build and desktop/mobile WebGL checks for the rigged poses and hair remain unverified. Do not count mock source checks or 2D concept images as actual 3D acceptance.
- A quality-matched authored model and board, bone/rig compatibility, source license, optimization, and actual three-quarter/side/full-body preview remain outstanding. No paid service or infrastructure is authorized.
- Separate game rules epic [#11](https://github.com/board-games-jf/surf-king-react/issues/11) and draft PR #12 remain outside the character/board fidelity work.

## Next small executable action

1. Obtain the owner's tested Female Athlete rigged GLB, verify its identity/licence and inspect its skeleton and materials; secure the approved reference raster in Issue #33.
2. Adapt the approved base to create **one isolated real Three.js/WebGL female surfer + board proof** that can be compared visually side-by-side with the approved reference, including foot contact and mobile scale. Present rendered screenshots to the owner **before** expanding to the male version, creator or match.
3. Execute Jest/build and real browser checks once an implementation branch exists. Keep draft PR review and separate merge/deploy authorizations mandatory.
