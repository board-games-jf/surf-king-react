# Project Handoff

**Verified on GitHub:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Source main baseline:** `e4e083f9035e314eb2107bd1cca448292cc4629e` (obstacle PR #17).

## Integrated baseline

- Local boardgame.io gameplay, 53-cell 2D/3D views and public map snapshot are integrated. No online multiplayer is active.
- The obstacle meshes/animations are visually approved and merged (PRs #14, #17). The standalone board catalog is merged (PR #16). The old Jest/build/WebGL browser checks remain pending.
- Issue #11 / draft PR #12 are for a separate game-rules review. Do not mix them into visual work.

## Active surfer and board studio (Issue #20 / draft PR #21)

- The latest `feat/20-refine-3d-surfers` branch / PR #21 received **explicit owner merge authorization on 2026-11-16**. Check GitHub for actual merged status after integration; **deployment remains unauthorized**.
- The existing `createSurferModel()` remains compatible with the live match and now accepts a seventh optional cosmetic style argument. Its scene uses actual Three.js geometry: expressive face, alternative hair, male/female body presentation, colored surfwear and three distinct board hulls (shortboard, fish, longboard). These are procedural approximations and **not** a rigged GLB conversion of the owner's polished 2D character concept.
- `/#/surfers` is a dedicated gallery of four selectable presets with a real draggable/zoomable Three.js viewer and route links from Home/Obstacles/Catalog.
- `/#/customize` is a responsive tropical creator with character, hairstyle, hair/skin/surfwear colors, board silhouette/color and same live reusable model. The action **Guardar visual** persists only an isolated draft in browser localStorage; it is not connected to player creation or a real match.
- Approved decisions: SK-DEC-011 (boards cosmetic-only) and SK-DEC-012 (wood/crown logo and tropical beach visual direction). Current logo/background are **CSS interpretations**, not imported exact source artwork.

## Validation and risks

- Existing tests were extended and new tests added for cosmetic normalization and the route UI interactions.
- JavaScript syntax checks passed for the model, option module and relevant non-JSX files. On 2026-11-16 the four actual production model presets were recreated and animated against a lightweight Three.js mock (40, 44, 47, 48 meshes; all finite).
- Executed the actual production model source against a lightweight Three.js mock with four presets and animation samples; geometry parts existed and transforms stayed finite. **This is not a Jest result or WebGL rendering proof.**
- **Jest, production CRA build, actual WebGL gallery and responsive browser checks were not executed**; a browser with the project dependencies is required before claiming a working user-facing release.
- Artistic fidelity to the owner's 2D image needs dedicated 3D asset creation and validation. The current procedural models are an interactive foundation, not a promise of pixel-perfect likeness.

## Rigged character asset evaluation (Issue #22)

- **Open draft work:** [PR #23](https://github.com/board-games-jf/surf-king-react/pull/23) / branch `feat/22-rigged-glb-surfer-base`. Starting `main`: `df81076781a7a70845dbe079f7a8ca21a79d35e6` (PR #21 merged). This is a visual exploration **not merged or deployed**.
- The first licensed rigged male GLB base (Quaternius Universal Base Characters, CC0) and source license are bundled in `public/assets/surfers/`, with provenance recorded in `DATA_SOURCES.md`.
- `/#/surfers` gallery can now opt into a separate `RiggedBaseViewer` to inspect the imported model, or revert to the original procedural viewer. The existing `/#/customize` interface and real match avatars remain unchanged.
- The candidate has 65 skeletal joints and skinned meshes, but deliberately **does not yet have surfwear, selectable hair, finished surfboard, or animation**. The owner has *not* approved its final artistic fidelity.
- Source GLB header, glTF JSON, skin joints, mesh attributes, local embedded buffer and upstream CC0 licence were inspected. Dedicated tests were added for GLB content and studio mode switching. **Full Jest, build and WebGL/mobile visual QA remain to be executed**.
- **Next action:** run Jest and production build, open the gallery in a real browser to review the imported model, then decide whether to author a surfer-specific appearance/rig or evaluate another model. Do not substitute the model in gameplay before visual approval.

## Next action

1. Install dependencies and run `npm test -- --watchAll=false` plus `npm run build`, correcting failures.
2. Start the branch locally and check `/#/surfers`, `/#/customize` and `/#/catalog` on desktop and mobile: shader compatibility, eyes facing camera, all swaps, form input, touch/zoom, geometry disposal.
3. Review the actual 3D avatar look against the owner's image and refine or import professionally modelled 3D assets before final art approval.
4. PR #21 merge was **explicitly authorized by the owner on 2026-11-16** despite pending real Jest/build/WebGL checks. Confirm merged status and keep issue #20 open for unfinished validations and styling. **Deploy still requires separate authorization.**
