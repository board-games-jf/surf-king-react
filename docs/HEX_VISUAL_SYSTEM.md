# Hex Visual System

Scope: R1 board, PR #58 stacked on #56. Presentation only; gameplay eligibility is engine-owned. See SK-DEC-048 and #57.

| Layer / state | Treatment | Timing / behavior |
| --- | --- | --- |
| Idle | Thin neutral board outline | Static |
| Move / Drop In | Mint #9bf4d4 / coral #ff9882, translucent floating plates | 360 ms rise/fall; empty lift .26, occupied .02; soft reflection for single action |
| Mixed actions | Two contiguous segments, clear center | Same elevation as single actions |
| Hover | Strengthen existing semantic color; white #f8ffff if neutral | 150 ms |
| Selected | Separate outer gold #ffda57 halo and two pale water rings | 1.8 s repeating ripples |
| Occupied / full | Edge capacity badge 1/2 or 2/2, mint / amber #ffd080 | 150 ms entrance; no legal action suppressed |
| Danger | Red #ff6868 inner outline and warning icon; red water ripple on legal ordinary move, hover or selection | 1.8 s pulse and ripple; no danger cue for legal Jumping |
| Fully unavailable | Dark translucent shade and lock, existing per-opponent reason icons retained | No action relief for blocked-only targets; a full hex can still be attackable |

These independent layers compose; e.g. a legal attack on a full hazardous cell retains its attack color, capacity and hazard cues. A selected cell retains semantic colors and gold halo. Risk text and individual opponent reasons remain in the existing inspector. Reduced motion resolves hover and badge transitions immediately, fixes ripple size and pulse opacity, and stops floating oscillation.

Implementation: shared `targetHighlight` and `hexStatus` contracts; Board derives status descriptors; SVG HexGrid and pooled Three.js meshes/sprites are non-picking overlays. Current R1 capacity is two; no new rules or dependencies.

Pending: compact authoritative per-action cost/choice indicators and complete explicit confirmation, desktop/mobile visual acceptance, real automated tests/build, keyboard/accessibility and performance review. Exact colors and placement require owner visual review.
