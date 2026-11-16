# Data Sources and Asset Provenance

## Repository sources

| Source | Role | Verification | Licence status |
| --- | --- | --- | --- |
| `src/game/SurfKingGame.js` | Implemented game rules and state | Read from `main` on 2026-11-14; behavior not executed | Repository code; not a canonical external rulebook |
| `src/game/Cards.js` | Card identifiers/categories | Read in baseline inspection | Repository code |
| `src/assets/` and `public/` | Existing image/application assets | Paths visible in repository; individual provenance not audited | External rights/attribution unverified |
| `LICENSE` | Repository license | File exists in repository | May not cover imported assets |

## New visual integration inputs

- The game owner supplied `1-surf-king-preview-toolkit.zip` as a standalone 3D visual prototype. The Issue #7 rendering candidate reproduces its coastal art direction with source-defined procedural geometry; external model/textures from the ZIP were not imported.
- Three.js `0.170.0` is specified as a new dependency (MIT), with package metadata from the supplied prototype lockfile. Dependency installation and browser compatibility remain to be verified.

## User-approved visual reference

- The user selected the Surf King wooden/crown logo and sunny tropical beach character-creator concept in the conversation on 2026-11-16. These supplied/generated images are **visual references**, not mesh files or packaged repository assets.
- The experimental `/#/surfers` and `/#/customize` pages use procedural Three.js geometry and CSS-drawn scenery; they do not embed the exact supplied raster logo, create a rigged character from a screenshot, or claim its fidelity.
- For final production artwork, integrate reviewed binary assets and document their provenance and rights.
## Unverified inputs

- No canonical source version of the Surf King rulebook has been confirmed in the repository.
- The existing repository card illustrations `src/assets/cards/stone.png` and `src/assets/cards/island.png` (and matching `src/assets/obstacles/` PNGs) are the internal visual references for the 3D Stone and Island silhouettes in Issue #13. The illustrations remain unchanged and are not placed on planes as 3D substitutes.
- No original Figma design file or authoritative export has been verified.
- No external ocean/real-world datasets are verified as integrated.
- New 3D models, textures, fonts, music, and sound effects require source, license and attribution review before reuse or distribution.

## Required validation

For each external source or asset, record: provider, direct source URL, date accessed, license, redistribution restrictions, attribution, and verification method. Unverified sources must remain clearly labeled.
