# Iteration T — final-round finish arbitration and starting-actor fairness

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** experimental comparative design evidence only. **No gameplay rule ratified, no production engine changes, no human games.**

## Problem / owner gate

The owner judged the Iteration S baseline gap **unacceptably large**: with seven players, first actor won **27.9%** of experimental balanced games while the seventh won **5.2%**. Last-actor +1 initial card alone yielded **25.5% / 7.8%**. We should avoid the sense that the last player has effectively already lost. **Do not solve this by randomizing identities only**; what matters is a meaningful comeback within one match.

## Controlled 48,000-match A/B

[Reproduction driver](R0_FINISH_LINE_AB.js), using the [same full B60/17-type R0 model](R0_FULL_MATCH_MODEL.js) with a single experimental finish arbitration parameter:

`SK_FINISH_SEEDS=1000 node docs/rules-review/R0_FINISH_LINE_AB.js`

**Actually executed** **48,000 complete simulated games** (1,000 paired seeds × 2/4/7 players × two tactics policies balanced/aggressive × two opening card variants none/last+1 × four finish schemes). Every fixture independently shuffles seven unique starting cells 0–6, rotates the initial actor identity by deterministic seed, maintains a **fixed turn order throughout** the match and uses the same 60 physical B60 cards with all 17 effect types enabled. All 48,000 games completed within the model's 16-round cap; **1,662,944 per-turn state integrity checks** were executed without failure (each asserting 60 unique cards across zones, occupied-cell uniqueness, energy/fallen consistency and fall-card accounting). The exact JS was fetched through the linked GitHub connector and executed with a V8 function harness against the source 53-cell main layout (blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`). The saved Node driver itself was not run inside a cloned checkout. These are **paired model fixtures, not statistically independent human trials, a boardgame.io validation or actual minutes**.

**Finishing alternatives:**

- `first`: current experimental R0 rule. The **first physical beach arrival** wins immediately. To preserve prior baseline-model comparisons, any remaining actors in that round continue with movement only and **no tactical card action**.
- `roundRandom`: after the first arrival, complete the current round with each remaining eligible player taking their **normal tactic and mandatory movement**. All surfers who reach beach during that round are treated as finishers; select one uniformly at random. A model-specific random stream is used solely for finishing choice, preserving a paired seeded deck/movement baseline.
- `roundReverse`: same full-round completion, but **the latest-acting finisher** wins any same-round tie. This is a compensatory extreme test, not the recommended mechanic.
- `roundEnergy`: same full-round completion, with **highest remaining energy among same-round finishers** winning; use a uniform lottery only if energy is tied. This adds a straightforward, tactical criterion without granting double turns.
- **Model-only finish clarification:** an entrant at beach no longer takes turns, is **not an eligible target for attacks after arrival**, and still occupies its physical beach cell. A finite set of four beach cells can constrain how many can co-finish. All of these details require explicit tabletop review if a rule is adopted.

The two opening hand variants were everyone 2 cards and the last acting player with 3 cards (one bonus). Normal max hand 5, normal turn 1 preparation and current fall-card penalties were unchanged. All tests use the same fixed board Shark locations; **no Shark relocation**.

## Observed win rates — balanced scripted strategy, 1,000 matches per row

| Players | Opening hand | Finish method | First actor wins | Last actor wins | Mean finish round |
| --- | --- | --- | ---: | ---: | ---: |
| 2 | All 2 | First reaches | **71.0%** | **29.0%** | 6.522 |
| 2 | Last 3 | First reaches | 69.0% | 31.0% | 6.473 |
| 2 | All 2 | Complete round, energy | **52.9%** | **47.1%** | 6.522 |
| 2 | Last 3 | Complete round, energy | **51.1%** | **48.9%** | 6.473 |
| 4 | All 2 | First reaches | **46.4%** | **13.6%** | 6.343 |
| 4 | Last 3 | First reaches | 42.7% | 16.2% | 6.280 |
| 4 | All 2 | Complete round, energy | **30.3%** | **21.5%** | 6.343 |
| 4 | Last 3 | Complete round, energy | **29.0%** | **24.8%** | 6.280 |
| 7 | All 2 | First reaches | **27.9%** | **5.2%** | 6.130 |
| 7 | Last 3 | First reaches | 25.5% | 7.8% | 6.159 |
| 7 | All 2 | Complete round, energy | **19.4%** | **9.2%** | 6.130 |
| **7** | **Last 3** | **Complete round, energy** | **17.7%** | **11.6%** | **6.159** |

**Equal-seat benchmarks:** 50% for 2 players, 25% for 4, 14.286% for 7; not a requirement that identical outcomes are achievable for every geometrically distinct seat.

**Other end-of-round tie policies, balanced, with last +1:**

| Players | Random co-finisher wins: first/last | Latest-acting co-finisher wins: first/last | Energy wins: first/last |
| --- | --- | --- | --- |
| 2 | 51.7% / 48.3% | 34.8% / **65.2%** | **51.1% / 48.9%** |
| 4 | 28.4% / 24.9% | 18.2% / **36.3%** | **29.0% / 24.8%** |
| 7 | 17.8% / 11.5% | 10.7% / **16.4%** | **17.7% / 11.6%** |

`roundReverse` *overcompensates badly* in 2- and 4-player games; reject it as the next default candidate. `roundRandom` and `roundEnergy` are comparable in this model; `roundEnergy` is more strategically legible because maintaining energy matters at the finish, though the way energy is collected/healed could create fresh card bias.

**Aggressive-policy robustness with last +1:**

| Players | First reaches: first/last | Complete round, energy: first/last | Complete round, random: first/last |
| --- | --- | --- | --- |
| 2 | 67.8% / 32.2% | **49.4% / 50.6%** | 50.7% / 49.3% |
| 4 | 41.7% / 14.6% | **29.8% / 24.1%** | 28.8% / 23.9% |
| 7 | 30.0% / 6.5% | **19.6% / 11.1%** | 20.1% / 11.1% |

**Full seven-player position-by-order percentages are available from the deterministic driver**; the last-player result is not an estimate of a guaranteed physical win, and the remaining 4–6 player slots should also be checked before considering this fair.

## Tempo, interaction and hidden tradeoffs

- With **7P balanced and last+1**, the finish round remained **6.159** under both finish rules, because the model ends at the end of the first-arrival round. **Human minutes are not measured.**
- **Opponent-facing modeled actions increased** from **13.203** (first arrival) to **14.379** (complete round), and modeled new falls rose from **7.250** to **7.770**, because later actors **retain their tactical choices** after the first finish. That is desirable for agency, but may prolong the table finish and increase last-minute frustration. The 2P and 4P action changes were much smaller.
- The **chance of two or more beach arrivals in a final round** was **38.6%** for 7P balanced last+1 and **34.2%** for 2P balanced last+1 (higher than old baseline because later tactics are active). So the finishing procedure matters often, but not every game.
- **Winner's remaining energy is a tactical tiebreak, not an inherently fair universal scoring rule**. Energy restoration (Coconut/Island), Shark routes and reactive attacker cards may bias it. It must be tested with real players for clarity, agency and satisfaction. Random lottery among equal-energy finishers is still a chance mechanism.
- No extra movement, repeated turns or instant energy bonuses were added. This avoids the documented snake initiative no-response double turn. The role of the fixed initiative order, 2P path choices and 7P congestion remains unresolved.

## Additional 7P stress: starting-cell fairness is still not fixed

**Executed an additional 4,000 seeded 7P games per condition** × balanced/aggressive × first-arrival/end-round-energy, **16,000 game executions** total. These overlap the first 1,000 seeds of the main 48,000-game A/B and **must not be added as statistically independent 64,000 observations**. They use randomized start positions, randomized first actor, fixed order, last+1 card and the same complete R0 model/invariants.

| Seven players, 4,000 seeds | First-arrival rule: first / last | End-round-energy rule: first / last |
| --- | --- | --- |
| Balanced | **28.10% / 7.85%** | **19.05% / 12.38%** |
| Aggressive | **28.07% / 6.78%** | **18.63% / 11.43%** |

The end-round-energy procedure reduces **initiative bias** in both policies, but **position selection still matters a lot**:

| Starting cell (all 7 occupied) | Balanced 7P, first-arrival win share | Balanced 7P, end-round-energy win share |
| --- | ---: | ---: |
| 0 | 14.85% | 14.50% |
| **1** | **10.57%** | **9.60%** |
| **2** | **9.43%** | **8.57%** |
| 3 | 14.85% | 15.57% |
| 4 | 16.98% | 17.57% |
| 5 | 15.82% | 16.27% |
| 6 | 17.50% | 17.90% |

Thus the candidate **cannot yet be called fair for seven players**: starts **1/2 appear relatively disadvantaged** and 4/6 relatively favored in this model. Randomizing starts makes assignment fair *across repeated games*, but within-match variance persists. Do not respond by moving Sharks without testing the owner's intended peripheral hazard; instead isolate why 1/2 fare poorly under pressure and whether a **small position-sensitive, card-driven compensation** could preserve interaction without making any cell automatically winning. Also examine spawn-relative attack exposure and whether the higher-energy tiebreak rewards avoiding Shark too strongly. This subgroup remains an approximation under scripted policies, not human causal evidence.

## Decision / targeted next step

**Working candidate for owner review, NOT an approved rule:** **fixed turn order**, randomized first actor and distinct random starting cells, **last actor +1 opening card**, and **finish the current round after the first beach arrival; among same-round beach finishers, highest remaining energy wins; roll/draw only for an energy tie**. This reduced balanced 7P modeled first-last gap from **22.7 percentage points to 6.1 pp**, balanced 2P from **42.0 pp to 2.2 pp**, and 4P from **32.8 pp to 4.2 pp**. These results are promising but **not complete fairness**, especially with 7P (17.7% first vs 11.6% last). Players can still lose before the final round through card play, so a second A/B is warranted.

**Do not ratify on model alone.** The next narrow experiments should (1) quantify conditional win share by starting hex and turn slot, **especially seven-player** late slots; (2) compare the energy tiebreak with other strategic tie criteria (e.g. score for cards retained) without changing the 60-card deck simultaneously; and (3) have the owner human-test actual feel and total minutes. Preserve the central Sharks as the intentional path-risk feature unless subsequent evidence proves them oppressive.

**Governance:** Issue #11 / open draft PR #12, documentation and independent scripts only; no `src/game` implementation, Jest/build or human play, merge or deploy. Draft gameplay SK-DEC-019–024 decision IDs still conflict with accepted visual main IDs, blocking any documentation merge.
