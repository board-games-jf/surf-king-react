# Project Handoff

**Last GitHub verification:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Verified `main` HEAD:** `aac50d222a3437200bcd4886eb90f29e537dfc65` (PR #32 merged).

## Integrated baseline

- Local boardgame.io match and a shared 53-cell 2D/Three.js 3D renderer, standalone interactive 3D board catalog, obstacle art and an experimental surfer gallery/creator. Online multiplayer is not active.
- The current studio, catalog and 3D board reuse local Quaternius CC0 male/female rigged base GLBs. `riggedSurferArt.js` adds vertex-colored clothing, procedural hair and an extruded cosmetic board; `surferPoses.js` applies local Euler offsets to the skeleton. Per-rider clones preserve independent rigs and seven player-identifying board colors, with a procedural rendering fallback.
- The creator's appearance save remains browser-local and cosmetic; it does not assign a saved player profile in a match. Boards do not affect rules (SK-DEC-011).
- PRs #29, #31 and #32 have merged with explicit owner authorization, but their source-level pose, hair and alignment tweaks did **not** establish accepted production artwork. The owner's real 3D screenshots showed serious pose/hair/foot-contact fidelity gaps. No deployment was authorized in those merges.

## Current priority — owner-approved premium visual bar (#33)

- **Accepted direction (SK-DEC-016):** match at least the perceived quality of the owner-approved 2026-11-16 concept render for the **actual interactive 3D surfer AND sculpted surfboard**. Required qualities include believable low surf crouch, foot/deck contact, expressive stylized proportions/face, integrated hair and surfwear, and a finished board with deck stripe, rails, rounded silhouette and fin.
- **Do not equate the approved image with a 3D mesh.** Existing Quaternius GLBs are neutral mannequin bases; incremental bone-angle adjustments and procedural accessory tweaks alone have repeatedly failed visual acceptance. The final asset creation/sourcing and rigging path is not approved yet.
- [Issue #33](https://github.com/board-games-jf/surf-king-react/issues/33) is the consolidated visual quality gate. [#20](https://github.com/board-games-jf/surf-king-react/issues/20) covers earlier creator/board work, [#28](https://github.com/board-games-jf/surf-king-react/issues/28) gender rigs, and [#30](https://github.com/board-games-jf/surf-king-react/issues/30) rejected pose/hair polish; do not duplicate their past patches.
- The exact approved concept PNG exists in the owner's ChatGPT conversation, **not yet as a verified GitHub asset or issue attachment**. Attach it to #33 before declaring visual equivalence.

## Validation and blockers

- Prior Jest/build and desktop/mobile WebGL checks for the rigged poses and hair remain unverified. Do not count mock source checks or 2D concept images as actual 3D acceptance.
- A quality-matched authored model and board, bone/rig compatibility, source license, optimization, and actual three-quarter/side/full-body preview remain outstanding. No paid service or infrastructure is authorized.
- Separate game rules epic [#11](https://github.com/board-games-jf/surf-king-react/issues/11) and draft PR #12 remain outside the character/board fidelity work.

## Next small executable action

1. Secure the approved reference raster in Issue #33; evaluate authored GLB/board asset options with verified provenance and compatible rigging, without altering match logic.
2. Create **one isolated real Three.js/WebGL female surfer + board proof** that can be compared visually side-by-side with the approved reference, including foot contact and mobile scale. Present rendered screenshots to the owner **before** expanding to the male version, creator or match.
3. Execute Jest/build and real browser checks once an implementation branch exists. Keep draft PR review and separate merge/deploy authorizations mandatory.
