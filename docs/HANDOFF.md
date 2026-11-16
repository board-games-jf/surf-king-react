# Project Handoff

**Last GitHub verification:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Current baseline `main`:** `668d2f2bcd10e2d6516c0d4ef6819217a5df823b` (3D board surfer PR #27 merged).

## Integrated baseline

- Surf King has local boardgame.io play, one shared 53-cell 2D/3D board, interactive 3D catalog, and approved 3D obstacle visuals. No online multiplayer is active.
- PR #25 merged the styled Quaternius male skinned GLB into `/#/surfers` and `/#/customize` with cosmetic clothing, hair and an upright board; PR #27 merged the same asset into the live 3D board and catalog via a shared decorator and procedural fallback.
- The existing board identifies up to seven players by board color; surfboards have no gameplay effects (SK-DEC-011). Studio saves only a local cosmetic draft; it is **not** applied to match players.
- Obstacle art, 2D/3D view choice and game rules are separate; gameplay-balance issue #11 and draft PR #12 remain outside character work.

## Active work — Issue #28 (not merged, not deployed)

- [Draft PR #29](https://github.com/board-games-jf/surf-king-react/pull/29) / branch `feat/28-female-surfer-and-poses` is **not merged or deployed**. Owner requested a genuinely distinguishable female/male face and alternatives to permanently outstretched arms.
- Imported **a distinct Quaternius Superhero Female skinned model** (65 joints) from the same CC0 *Universal Base Characters* pack as the male. Original `.gltf` geometry/bone binary was bundled into a self-contained GLB with neutral materials; see `docs/DATA_SOURCES.md` for source Git SHAs and conversion details.
- `riggedBoardSurfers.js` selects gender-specific templates and loads both local GLBs once per 3D scene. Each active player gets an independent skeleton. Failure to load either model keeps its existing procedural board actor visible.
- `surferPoses.js` provides deterministic **standing**, **relaxed** and **surfing** bone-offset poses. `riggedSurferArt.js` applies these relative to the original male/female bind poses and restores them on disposal; female hairstyle placement is adjusted to her separate head shape.
- `/#/customize` / `/#/surfers` preview the selected real male/female GLB and offer pose buttons. Switching gender remounts the model preview so in-flight loader callbacks cannot show the wrong body. Pose is intentionally **not persisted** in the saved visual draft.
- The catalog and local 3D match use the **surfing** stance automatically; game rules, positions, 2D rendering, obstacles and board colors are unaffected.

## Validation and next action

- Verified the bundled female GLB header and structure directly: glTF 2.0, 1,012,592 bytes, 65 joints, original female body and face, embedded binary, no external textures. Source provenance verified on GitHub.
- Executed production pose sampler/decorator logic with a lightweight Three.js API mock across **six combinations** (two authored body choices × three poses). Bone changes, pose restoration and flat surfing board mode passed; **these are not Jest/WebGL results**.
- Added Jest tests for female/male GLB provenance, three poses/reduced-motion behavior, board skeleton independence, gender-specific loader paths and preview switching. **Jest suite, CRA build and actual WebGL/browser/mobile QA are not yet run.**
- Next: run `npm test -- --watchAll=false` and `npm run build` in a dependency-enabled environment; visually review both faces and standing/relaxed/surfing poses in `/#/customize`, then check the local 3D board and `/#/catalog` under real WebGL.
- Do not merge without fresh explicit owner authorization. Do not deploy without separate explicit authorization. Remain open until visual and technical acceptance criteria are verified.

## Validation checkpoint — 2026-11-16 (PR #29)

- Rechecked `AGENTS.md`, main `668d2f2`, open issues/PRs and PR head `a146999`; PR #29 remains open/draft and unmerged. A review comment is recorded; a stale anatomical comment was corrected in commit `a146999`.
- Inspected the actual branch's pose sampler, asset registry, studio loader, shared skinned art decorator, board loader, and relevant test sources. These code paths select distinct gender GLBs, keep local preview pose outside persisted styling, and provide procedural board fallback. **This is source review, not WebGL verification.**
- Browser tab `http://localhost:3003/#/catalog` was readable as page text, but its running git branch and actual WebGL pixels were not verifiable through the available browser interface. Do not consider this a successful visual check.
- The isolated execution container has Node/npm but GitHub DNS resolution fails, with no checked-out application or installed project dependencies. **No Jest run, CRA build, GLTFLoader render, browser/mobile QA or screenshots were produced in this checkpoint.** No GitHub Actions PR workflow runs are recorded.
- Remaining acceptance risks: bone directions/standing-arm appearance, natural surfing knee/foot-to-board contact for both authored bodies, rapid gender toggling under delayed loads, safe studio fallback when an invalid GLB is received, and mobile readability.
- **Next concrete action:** run `CI=true npm test -- --watchAll=false` and `npm run build` on a checkout of `feat/28-female-surfer-and-poses` with dependencies, then visually inspect `/#/customize` and `/#/catalog`/live board on desktop and mobile; correct identified issues on this same branch with regression coverage. Keep PR #29 draft and Issue #28 open until verified. Merge and deploy remain unauthorized.
