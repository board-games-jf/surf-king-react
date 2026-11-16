# Project Handoff

**Verified on GitHub:** 2026-11-16
**Repository:** [board-games-jf/surf-king-react](https://github.com/board-games-jf/surf-king-react)
**Source `main`:** `2e1dd3b4dad8faafffad9c3320eb9ab183790466` (styled GLB preview PR #25 merged).

## Integrated baseline

- Local boardgame.io play, 53-cell shared 2D/3D board, interactive catalog and five 3D obstacles are integrated. No online multiplayer is active.
- The owner approved the visual direction of the styled rigged GLB surfer after the merged studio PR #25. `/#/surfers` and `/#/customize` inspect that local CC0 asset, and store cosmetic choices only as a browser-local draft; no saved profile is applied to a match.
- The authored Quaternius GLB is a male-bodied model with a 65-joint rig. Female presentation and finished surfing animation still need distinct artistic validation.
- The existing player colors, 2D fallback and cosmetic-only surfboard rule (SK-DEC-011) remain authoritative. The owner requested this approved art direction on the board (SK-DEC-014).
- Rules epic #11 / draft PR #12 are independent; do not modify game rules under visual issues.

## Active board integration — Issue #26

- Branch `feat/26-rigged-surfer-board` is **not merged or deployed**.
- The styled GLB decorator was moved to the shared `src/map/views/Board3D/riggedSurferArt.js` so studio and board use the same mesh and materials.
- Board presentation lays the cosmetic surfboard under the rider's feet, angles the figure sideways and scales the full model to fit the existing hex footprint.
- `riggedBoardSurfers.js` loads the local GLB once per 3D scene and uses `SkeletonUtils.clone` for independent skinned riders. All seven original player colors remain identifiable on their boards; outfits/hairstyles use fixed preview presets, not a live-player profile.
- `createScene.js` upgrades the same moving actor groups when the GLB is ready, preserving positions and focus; it keeps the previous procedural model as a loading/error fallback.
- `/#/catalog` has a **Focus on the new 3D surfer** shortcut. Because game and catalog share `Board3D`, both display the new model. The logic/2D gameplay, obstacles, public snapshot and movement rules remain unchanged.

## Validation and next action

- **Executed:** source-module syntax parsing for the shared art, GLB board adapter and scene; production decorator + board adapter were instantiated, animated and cleaned up for seven rider colors against a lightweight Three.js interface mock. All seven checks passed. This is **not** a Jest or browser result.
- **Added but not executed:** Jest tests for independent rig clones, colors, board footprint and load/fallback, plus existing studio tests updated to import the shared file.
- **Pending:** install actual dependencies, run Jest and CRA build, inspect the GLB on the real WebGL board/catalog and mobile view, and evaluate surfing stance/readability from board camera height.
- **Review path:** open `/#/catalog`, choose **Focus on the new 3D surfer**, then check an actual local 3D match and `/#/customize`. If GLB loading fails, inspect console and verify the old procedural fallback.
- **Next:** complete those checks, correct visuals or performance, and request separate explicit merge authorization; deployment needs its own independent authorization.
