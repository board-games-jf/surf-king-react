# Architecture

**Reference main baseline before PR #14:** `6daa1705` (2026-11-15). Deployment status is not established by merge state.

## Existing browser architecture (C4-style L2)

```mermaid
flowchart TB
  Player[Local player] --> SPA[React SPA and HashRouter]
  SPA --> Game[Local boardgame.io client]
  Game --> Controller[Board controller]
  Game --> Engine[SurfKingGame engine]
  Controller --> SVG[2D SVG HexGrid]
  Controller --> Snapshot[Public map snapshot adapter]
  Snapshot --> Three[3D Three.js board]
  Server[Separate server entry] --> Engine
```

- The local game client and standalone server entry do not establish live online multiplayer.
- `src/components/Board/Board.js` owns UI actions, the selected 2D/3D view, and card handling.
- `src/map/contract/createPublicMapSnapshot.js` exposes cell/obstacle positions, players and turn metadata to rendering, not private card/deck data.
- Both 2D and 3D share `src/map/layout/board-layout.json` (53 cells); authoritative geometry remains provisional.
- `src/map/views/Board3D/createScene.js` controls camera, cell raycast, scene updates, animation, cleanup and live obstacle groups.
- Gameplay rules and scoring remain inside `src/game/SurfKingGame.js`, not Three.js.

## 3D obstacle model component (PR #14, L3)

```mermaid
flowchart LR
  Snapshot[Public snapshot] --> Scene[Live 3D scene]
  Scene --> Factory[createObstacleModel]
  Gallery[Optional in-app model gallery] --> Factory
  Factory --> Shark[Shark fin + water]
  Factory --> Stone[Layered stone]
  Factory --> Island[Sandy island + palm]
  Factory --> Storm[Storm cloud + rain]
  Factory --> Cyclone[Animated waterspout]
```

- `obstacleModels.js` builds Three.js meshes for the five existing obstacle identifiers; `sharkModel.js` remains the dedicated dorsal-fin component.
- `createScene.js` instantiates the same factory from the authoritative public snapshot; no mock placements or image sprites are used in a match.
- The `/obstacles` route previews exactly these factories in a separate WebGL scene without modifying game state.
- Player models and coastal scenery continue using the existing `surfModels.js` and `createCoastalScenery.js` code.

## Interactive 3D board catalog (Issue #15, draft)

The standalone `/#/catalog` route uses the existing `Board3D` component rather than an independent renderer. A pure `catalogState.js` fixture creates 53 cells, model placements, surfer positions and a public snapshot matching the renderer contract. Its click tools operate only on local React state, not the real `boardgame.io` match.

```mermaid
flowchart LR
  Tools[Catalog palette and fixture] --> Snapshot[Renderer-compatible snapshot]
  Snapshot --> Board3D[Existing Board3D]
  Board3D --> Scene[Existing createScene]
  Scene --> Models[Shared obstacle, surfer and scenery models]
  Scene --> Camera[Optional focusCell camera API]
```

This is a visual design sandbox with illustrative placements, not an alternate rules engine or authoritative gameplay state. Actual browser validation is pending and the feature is not yet merged or deployed.

## Limits and validation

- Static concept illustrations guided the visual direction but are **not exact exported 3D models**.
- No imported 3D assets or new external services are required.
- Full browser, WebGL, Jest and build validation remain pending; see [HANDOFF.md](HANDOFF.md).
- No changes to authoritative turn logic, 2D fallback, backend architecture or hosting.
