# Iteration V — cross-check opening hex × initiative order (no predetermined loss)

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** controlled independent R0 design-model simulations, NOT approved gameplay or production code.

## Why this check matters

Iteration U's **marginal** win rates (averaged across first/last acting positions) looked promising for cells 1/2 with extra opening cards. The owner wants each person to feel they can still win even when drawn into a dangerous start and one of the last turn slots. **The correct fairness test must condition on BOTH starting cell and acting slot, not just either average.**

We preserved the intent of **four central Sharks (28–31)**, randomly shuffled distinct starting cells 0–6 and first actor identity, 17 B60 card types, a fixed non-snake round order, one normal tactical action and maneuver, falls/steals, and the trial finish rule: complete the first beach-arrival round, then higher remaining energy among same-round finishers (uniform random on energy tie).

## Executed test scope

[Reproducible runner](R0_START_ORDER_CROSSTAB.js), backed by the [updated independently scripted R0 model](R0_FULL_MATCH_MODEL.js):

- **Seven players:** 14,000 paired seeds (3,501–17,500) × 2 policies (balanced/aggressive) × **7 variants** = **196,000 complete game executions**. Every one of the 49 actor-slot × starting-cell combinations has **1,960–2,043 observed assignments per variant/policy**, instead of the much noisier handful produced by a 1,000-game aggregate. The seven variants were baseline no cell compensation, cells 1/2 +2 cards with last +1 card, same with last +2 cards, last TWO actors +1 card, plus three distinct energy compensations.
- **Two and four players:** 8,000 paired seeds (3,501–11,500) × 2 policies × 2 variants (no cell bonus versus cell 1/2 +2) × 2 player counts = **64,000 more complete game executions**. Each actor-slot × cell combination received **1,061–1,189 assignments** across the two counts.
- **Total: 260,000 complete scripted model game executions**, each reaching the beach by round 16, with **11,557,743 integrity checks** passing. Each per-turn check asserts 60 distinct physical cards properly conserved, no double-occupied hex, valid fallen/energy state and exactly one uniformly random eligible unplayed-hand card lost per newly incurred fall (or the empty-hand exception). No production tests, human sessions or clock-time trials were run.
- **Exact baseline-regression test:** independently re-executed the pre-Iteration-V model at GitHub commit `e7d0d62620431ba42dfd4f53dffaee9f7287faed` against current model `orderComp='none'` for **1,200 games** (2/4/7 players × balanced/aggressive × 200 paired seeds). All old result fields matched **bit-for-bit** (excluding only two newly added bookkeeping fields), with **41,304 per-turn checks**. The parameter addition did not change the old experimental reference scenario.

**Reproduction command samples (repo checkout):**

```sh
SK_CROSS_SEEDS=14000 SK_CROSS_OFFSET=3500 SK_CROSS_PLAYERS=7 SK_CROSS_VARIANTS=base,inner2,inner2Last2 node docs/rules-review/R0_START_ORDER_CROSSTAB.js
SK_CROSS_SEEDS=14000 SK_CROSS_OFFSET=3500 SK_CROSS_PLAYERS=7 SK_CROSS_VARIANTS=inner2LastTwo node docs/rules-review/R0_START_ORDER_CROSSTAB.js
SK_CROSS_SEEDS=14000 SK_CROSS_OFFSET=3500 SK_CROSS_PLAYERS=7 SK_CROSS_VARIANTS=inner2LateInnerE,inner2LateAllE,inner2LastE node docs/rules-review/R0_START_ORDER_CROSSTAB.js
SK_CROSS_SEEDS=8000 SK_CROSS_OFFSET=3500 SK_CROSS_PLAYERS=2,4 SK_CROSS_VARIANTS=base,inner2 node docs/rules-review/R0_START_ORDER_CROSSTAB.js
```

This was **actually executed** using the exact JS code fetched from the connected GitHub source inside a V8 JS runtime with the exact GitHub-fetched 53-cell main layout. The saved standalone Node entry point **was not separately executed inside an actual repo checkout**. Its full output includes `cross[actingSlot][startingCell]` numerators, denominators, win rates, mean falls and target rates, for reproducing each finding. All variants share the same matched seeds/start-cell assignments; bonus draws and tactic choices naturally alter later play. **260k execution samples are intentionally paired, not 260k statistically independent human matches.**

## Seven-player crossed-position outcomes

All variants below retain the original **one additional opening card to the last actor** unless explicitly stated. `inner2` means **two extra random opening cards at cells 1/2**, with a maximum hand size of five.

| Model policy | Variant | First actor / last actor win share | Least favorable actor×cell win rate | Most favorable actor×cell win rate |
| --- | --- | --- | --- | --- |
| Balanced | No cell bonus | 18.44% / 12.59% | **5.76%**, 6th actor on cell 1 | 20.89%, 1st on cell 0 |
| Balanced | Cells 1/2 +2 cards | 18.61% / 12.39% | **7.69%**, 6th on cell 2 | **22.03%**, 1st on cell 2 |
| Aggressive | No cell bonus | 18.40% / 12.05% | **4.71%**, 6th on cell 1 | **22.76%**, 1st on cell 3 |
| Aggressive | Cells 1/2 +2 cards | 19.01% / 11.50% | **7.00%**, 7th on cell 1 | **21.68%**, 1st on cell 2 |

**This is a material remaining gap:** the position-specific +2-card compensation raises the worst tested conditional combination but **can leave a first-actor cell-1/2 surfer almost three times as likely to win** as a last-actor cell-1/2 surfer (under the scripted policy). The first-to-last marginal rate alone misses that.

### Seven-player candidate with cells 1/2 +2 cards: first and last actors by starting cell

Conditional modeled win rate **given that exact starting cell and actor slot**, balanced policy, 14,000 games:

| Starting cell | 1st actor win % | 7th actor win % |
| --- | ---: | ---: |
| 0 | 18.35 | 11.08 |
| **1** | **21.81** | **9.38** |
| **2** | **22.03** | **8.82** |
| 3 | 18.99 | 10.05 |
| 4 | 17.38 | 17.80 |
| 5 | 14.94 | 13.14 |
| 6 | 16.69 | 16.46 |

Each cell×actor pair was present **about 2,000 times** out of the 14,000 games. These are observed win proportions within an independent scripted simulator, **not human win probabilities** and not proof that any given player can or cannot win. It would be premature to claim an acceptable fairness target from the zero observed cells with 0 wins: every combination produced wins, but some chances remain meaningfully worse.

### Testing help for the last actors: no uniformly successful simple fix

Also tested the same `inner2` cell bonus with three opening-card/turn-position variants and three starting-energy variants, **14,000 paired seeds each per policy**:

| 7P condition with inner2 | Balanced worst actor×cell | Aggressive worst actor×cell | Balanced 1st / 7th overall |
| --- | ---: | ---: | ---: |
| **Last actor +1 card** (reference) | **7.69%** | **7.00%** | 18.61% / 12.39% |
| Last actor +2 cards (hand max 5) | 7.46% | 6.81% | 18.77% / 13.53% |
| Last TWO actors +1 card each | 6.85% | 6.60% | 18.45% / 11.26% |
| +1 opening energy to late actors on cells 1/2 only | 8.60% | 7.75% | 18.47% / 12.41% |
| +1 opening energy to both late actors on any cell | **9.02%** | **8.09%** | 18.12% / 13.36% |
| +1 opening energy to last actor on any cell | 8.01% | 7.80% | 18.19% / 13.76% |

**Risk:** adding energy to the last two seems to modestly raise the minimum observed combination, but the maximum remains about **22%**, preserving a large cross-combination spread; it also intertwines starting-resource compensation with a **highest-energy beach tiebreak**, potentially introducing an artificial finish advantage. Card bonuses improve or worsen different late slots and may hit the five-card cap (last actor at cell 1/2 already starts with five under the reference +2 cell bonus and +1 late bonus). **Do not ratify any of these as a rule or call the problem solved.**

## Two and four players: position averages conceal the same pattern

On **8,000 paired seeds per policy/variant**:

| Players/policy | No cell bonus: worst–best slot×cell | Cells 1/2 +2: worst–best slot×cell | First/last actor win share, +2 variant |
| --- | --- | --- | --- |
| 2P balanced | 44.67–54.20% | **45.77–57.63%** | 51.42% / 48.58% |
| 2P aggressive | 46.29–54.40% | **45.48–57.03%** | 50.16% / 49.84% |
| 4P balanced | 14.37–33.60% | **18.21–35.57%** | 30.34% / 23.27% |
| 4P aggressive | 14.64–33.86% | **18.54–33.91%** | 30.31% / 22.26% |

**Implications:** the 2P game remains fairly balanced *without cell-specific bonus* (conditional win rates roughly 45–54%). At 4P, `inner2` improves the vulnerable **minimum**, but does not remove a high first-actor × advantageous-card combination. It is not a universally fair opening setup. Previous Iteration U marginal cell-rate improvements were genuine observations but were **insufficient to evaluate crossed fairness**.

## Interpretation / recommended next small experiment

**Do not overclaim:** No start×order combination had *zero* wins in these model fixtures, but the worst 7P combinations remain sufficiently disadvantaged that an owner might reasonably regard them as discouraging. The minimum and maximum are selected from dozens of cells (multiple-comparison selection), with limited statistical precision despite ~2,000 observations each. The more important robust signal is a **consistent late-slot disadvantage on starting cells 1/2 across both scripted policies**.

A card-only initial-hand bonus saturates at the max-five hand limit and may not overcome **later action timing and exposure**. Small generic energy boosts also failed to remove cross-combination imbalance. Next, **isolate a minimal setup/order balancing mechanism**, e.g. a reverse-choice starting-position allocation or a simple constrained random allocation by turn slot, with the same 17 cards, fixed turn order, no extra moves, no relocated Sharks and no additional card types. A start-choice mechanism must preserve some randomness and player agency; do **not** claim it works until run paired full matches. Do not change the first-turn action structure or invent a reaction mechanism without a separate review.

Continue to record first-vs-last **and** actor×cell conditional outcomes, positional exposure, attacks/falls, mean rounds and player-to-player interactions. The owner performs human games; the assistant performs automated experiments.

**Governance:** documentation and the independent model only in branch `docs/11-progressive-rules-review`, linked to Issue #11/open draft PR #12. No production app/Jest/build, human tabletop session, gameplay decision approval, main merge or deployment. Draft rules SK-DEC-019–024 still collide with main visual decision IDs, so do not merge without repair and owner authorization.
