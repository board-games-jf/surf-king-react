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
## Rigged surfer evaluation asset (Issue #22)

| Item | Provenance and validation |
| --- | --- |
| Original author | Quaternius, **Universal Base Characters — Standard**, Superhero Male FullBody |
| Official pack | https://quaternius.com/packs/universalbasecharacters.html |
| Licence | CC0 1.0 Universal; exact original pack licence copied to `public/assets/surfers/QUATERNIUS-CC0-LICENSE.txt` |
| Source GLB conversion | `programasweights/avatar`, `public/assets/character.glb` at Git blob `b3fd79533fdb9fcedd077744f7e120920eb6cc97` |
| Converter provenance | https://github.com/programasweights/avatar/blob/main/ASSETS.md (source ZIP downloaded 2026-09-09; SHA-256 `fdbf1804c90dfc1ea03e992bff7da2dfd1a79318e13270a660180f9308455f40`) |
| Local package | `public/assets/surfers/quaternius-male-base.glb` (~741 KB), exact Git blob SHA matches the source conversion |
| Structure checked | glTF 2.0 GLB, one skinned skeleton of 65 joints, three skinned meshes, all binary buffer data embedded, no texture or external file URLs; static reference pose and jade material |
| Limitations | This is a rigged **neutral base mannequin**, not final Surf King surfer art or supplied/generated concept likeness. No surf clothing, hair customization or animations. Evaluate in the gallery before approval or any gameplay replacement. |

The upstream pack is publicly labelled CC0; any later additions need their own provenance and licence review. The application loads this copied asset locally at runtime, not from an external service.

## Distinct female skinned character (Issue #28)

| Item | Provenance and implementation |
| --- | --- |
| Original author / licence | Quaternius, **Universal Base Characters — Standard**, Superhero Female FullBody, **CC0 1.0 Universal** (same license file as existing male model) |
| Source repository | `NafisRayan/Animate-Rigged-Humanoid-No-Blender`, `Universal Base Characters[Standard]/Universal Base Characters[Standard]/Base Characters/Godot - UE/` |
| Official source pack | https://quaternius.com/packs/universalbasecharacters.html |
| Upstream glTF Git blob | `Superhero_Female_FullBody.gltf`, `804aa3d3bbbd1977d31ec25c7dbf9a00705be49d` |
| Upstream binary Git blob | `Superhero_Female_FullBody.bin`, `6e6507c85a4993e97d31f187b4d0715af300400d` (990,808 bytes) |
| Bundled file | `public/assets/surfers/quaternius-female-base.glb`, Git blob `5c102d70d1a6c0b0ed92248fe5a08af0356b020d` (1,012,592 bytes) |
| Transform | Packaged the original glTF scene, geometry, normals, skin weights, skeleton and 65 joints with its unchanged binary buffer into a glTF 2.0 GLB; removed external image/texture references and replaced PBR materials with neutral, texture-free base materials because the app applies its own cosmetic colors |
| Visual evidence | A separately authored female torso, proportions and face named `Superhero_Female`, rather than scaling or relabeling `SuperHero_Male`. Hair and surfwear remain app-authored styling accessories |
| Limitations | Female visual and the new standing/relaxed/surfing poses are experimental. Real GLTFLoader, WebGL, mobile quality and bone alignment remain unverified. No authored animation files or professional motion-capture data were imported |

The official CC0 pack covers both male and female base characters. No additional third-party runtime assets or CDN are required.
## Unverified inputs

- No canonical source version of the Surf King rulebook has been confirmed in the repository.
- The existing repository card illustrations `src/assets/cards/stone.png` and `src/assets/cards/island.png` (and matching `src/assets/obstacles/` PNGs) are the internal visual references for the 3D Stone and Island silhouettes in Issue #13. The illustrations remain unchanged and are not placed on planes as 3D substitutes.
- No original Figma design file or authoritative export has been verified.
- No external ocean/real-world datasets are verified as integrated.
- New 3D models, textures, fonts, music, and sound effects require source, license and attribution review before reuse or distribution.

## Required validation

For each external source or asset, record: provider, direct source URL, date accessed, license, redistribution restrictions, attribution, and verification method. Unverified sources must remain clearly labeled.
