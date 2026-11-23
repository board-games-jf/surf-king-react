# Iteration W — random vs reverse-choice starting positions (2/4/7 players)

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** independent R0 design-model evidence, not an accepted gameplay rule or app implementation.

## Question and fixed controls

The owner requested the **next** focused fairness iteration: after randomizing who starts and granting modest card bonuses, can we distribute **starting hexes based on turn order** so the last actor never feels defeated before playing? Keep the strategically intentional **Sharks 28–31**, 53-cell board, all **60 physical / 17-effect** B60 cards, starting E2, one tactical action per turn, quick recovery, full-round highest-remaining-energy beach tiebreak and a separate experimental **last-actor +1 opening card**. No changes to production gameplay or the accepted rules.

## Setup methods (all trial-only)

Starting positions 0–6 are always unique. Turn order remains **fixed within a match**; no snake / consecutive actor turns.

| Mode | Experimental allocation procedure | Randomness / agency |
| --- | --- | --- |
| `random` | Draw distinct random cells among all seven starting cells for each player independently of turn order | Full random placement |
| `lateSafe1` | Last actor receives a random cell among 4/5/6; other positions randomly allocated from the remaining cells | 1 reserved low-hazard start |
| `lateSafe2` | Last **two** actors draw two different cells among 4/5/6; all other actors randomly draw from the remaining cells | 2 reserved low-hazard starts |
| `reverseTier` | Assign positions from last actor to first, always choosing one of the remaining 4/5/6 cells while any remain, then any remaining 0/1/2/3. Tie within tier shuffled | **Greedy Shark-free tier priority**, not actual human strategic choice |

**Why 4/5/6?** The exact map check from Iteration Q/R: they have a 7-step **Shark-free** route to beach; cells 0–3 take 8 Shark-free moves or risk Sharks to reach beach in 7. **But cell 5 also has higher early tactical exposure**, so this is not a claim that every 4/5/6 cell is inherently a stronger winning cell.

The independent model randomizes its seven starting positions using a separate seed stream from the B60 card/tactics RNG. Each A/B variant reuses matched seed, participant count, order shift and nominal shuffled deck. Changing setup changes interactions and subsequent card draws, which is part of the intervention. For actual **Catan-style reverse picks**, humans could prefer other cells strategically; our `reverseTier` is just **one transparent greedy-proxy policy**, not a human-choice simulation.

### Metrics and fairness guard

Report (a) **win rate by acting slot**, (b) **conditional starting cell win rate**, (c) **minimum/maximum win rate across *assignable* actor×cell pairs**, and (d) actual samples per pair/possible starting cell sets. **Never interpret an unassignable pair as zero win rate**: constraints intentionally remove some combinations. Also track modeled rounds, opponent-facing tactical interactions, falls and 60-card/occupancy/fall invariants.

Exact equality is not a ratified target. The owner wants reasonable, **reversible** advantages; cards, attacks, route decisions and interactions must still matter.

## Executed comparisons and independent confirmation

**Phase A, broad exploratory A/B (seeds 17,501–31,500 at most):**

- 7P: **112,000 complete modeled games** = 14,000 seeds × 2 behavior policies × four allocations; cells 1/2 receive +2 starting cards (pilot), last actor +1.
- 4P: **80,000** = 10,000 seeds × 2 policies × four allocations; same cell-card pilot.
- 2P: **64,000** = 8,000 seeds × 2 policies × four allocations; **no** position-specific card pilot.
- **256,000 matches**, **9,485,287 per-turn card/occupancy/energy/fall-accounting integrity checks** passed; all reached the beach before the modeled round-16 cutoff.
- **Source regression:** Compare original `random` allocation before Iteration W with revised `random` after the new allocation modes, on 600 paired 2/4/7-player seeds in both policies. **Every returned field matched exactly**, and 20,569 old-version state checks passed.

**Phase B, independently seeded setup simplification screen (17,501–31,500 explicitly excluded; seeds 31,501–37,500):**

- 7P: **108,000** = 6,000 seeds × 2 behavior policies × random/lateSafe2/reverseTier × cell-card compensation **none, +1 on cells 1/2, +2 on cells 1/2**.
- 4P: **90,000** = 5,000 seeds × 2 policies × same 3 allocations × same 3 card variants.
- **198,000 matches**, **8,332,615** successful state integrity checks.
- Reverse tier plus **one** bonus card on cells 1/2 looked especially promising for 7P. The late-two safe-tier draw **without** cell-card bonuses looked simpler/stronger for 4P.

**Phase C, independent holdout of these two candidate profiles (seeds 37,501–47,500):**

- **80,000 complete modeled games**: 10,000 new seeds × two tactics policies × **7P random+inner2 versus 7P reverseTier+inner1**, and **4P random+inner2 versus 4P lateSafe2+no cell bonus**.
- **3,301,154 per-turn integrity checks** passed. Seed ranges used for these holdouts do **not overlap** phases A/B for each player count.
- **Additional latest-runner verification:** 2,160 seeded small fixtures across 2/4/7 players × three cell bonus variants × four allocation methods × two policies, with **74,314** state checks and explicit per-game assertions that reserved actor slots really received the required 4/5/6 cell and all start cells were distinct. The runner's small-seed sample threshold was repaired after initially rejecting an empty eligible-comparison array; the final rerun passed.

**Total substantive A/B simulations:** **534,000** (256,000 + 198,000 + 80,000) and **21,119,056** completed per-turn integrity checks, plus the separately described 2,160 small fixture tests. The variants share matched seeds *within each stage*, so **they are not 534,000 independent human trials**.

**Execution provenance:** Fetched the exact model/driver JS from the GitHub repository and executed it using a V8 JavaScript runtime against the **GitHub-fetched main** `src/map/layout/board-layout.json`. The driver and model are saved in the draft PR; the Node CLI commands have **not** been separately run in a cloned repo checkout. No `SurfKingGame.js`, Jest/build, UI or human playtest was executed.

## Final 7P candidate in fresh 10,000-seed holdout

Existing baseline: random unique starts with **+2 opening cards to cell 1/2**, and **+1 to last actor**. The strongest tested 7P compromise: `reverseTier` with **only +1 opening card to cells 1/2**, retaining the last-actor +1.

| 7P scripted strategy | Baseline first / last actor wins | Reverse-tier +1 first / last wins | Baseline worst–best *eligible* actor×cell | Candidate worst–best eligible actor×cell |
| --- | --- | --- | --- | --- |
| Balanced | **19.00% / 11.47%** | **17.32% / 15.04%** | 7.37–23.07% | **10.17–18.41%** |
| Aggressive | **19.00% / 10.64%** | **18.91% / 12.98%** | 6.72–21.53% | **9.10–20.65%** |

The balanced first-last **gap shrank from 7.53 pp to 2.28 pp** and the worst possible *assigned* cell×actor combination became more viable, rather than only improving aggregate seat averages. Aggressive policy gap shrank **8.36 pp → 5.93 pp**; still needs more work.

**Risk/limits:** reverse-tier assigns the **last three actors** only cells 4/5/6 (in random order) and the **first four** only 0/1/2/3. This structurally reduces individual starting-position freedom and could feel predictable, even if within each tier cell allocation remains random. The physical **set** of all seven starts is always the same in 7P, but **who draws which tier** changes by turn slot. Under an actual choice-based setup, people may not choose Shark-free routes, so do not present the modeled result as established Catan-like choice fairness.

## Final 4P candidate in fresh 10,000-seed holdout

Baseline: fully random distinct starts and **+2 opening cards to cell 1/2**. The proposed *simpler* alternative draws two different random **4/5/6** cells for the last two actors, then randomly assigns other available starts to first two, with **no cell-specific card compensation**.

| 4P strategy | Baseline first / last actor wins | Late-two safe starts, no cell card: first / last | Baseline worst–best eligible actor×cell | Candidate worst–best eligible actor×cell |
| --- | --- | --- | --- | --- |
| Balanced | **30.10% / 23.19%** | **26.46% / 28.34%** | 18.16–33.45% | **19.22–29.77%** |
| Aggressive | **29.96% / 22.88%** | **26.57% / 27.54%** | 17.53–33.42% | **19.38–30.58%** |

This is not perfectly fair: the last actor ends slightly ahead of the first, and one of the middle actors can be ~22–23% versus the nominal 25%, but the worst eligible combo improves and the method is **less complex** than handing out +2 cards conditionally.

**Variety tradeoff:** 4P `lateSafe2` produced **22 distinct unordered four-cell starting sets** versus **35** under random (all 35 combinations of seven choose four). Full reverse-tier had only **four** such four-cell sets and generally failed to improve the weakest pair; **do not recommend full reverse-tier for 4P**.

## Two-player safeguard

On 8,000 Phase-A seeds (no cell-specific card bonus), the fully randomized allocation already produced **51.38% first / 48.63% last** wins for balanced behavior and **50.73% / 49.27%** for aggressive. Any two-safe-cell restriction reduces opening geometry variability without an established substantial benefit. **Keep random distinct starts in the 2P trial.** The last-actor extra card and full-round finish remain independently provisional.

## Proposed small, player-count-aware manual setup — not a rule ratification

All options retain randomized **first actor**, fixed in-match order, intact Sharks, original 60 cards, last-actor +1 opening card and full-round highest-energy finish as **independent trial parameters**.

- **2P:** random distinct starting cells among 0–6; **no cell-specific card bonus**.
- **4P:** random distinct cells **4/5/6 for the last two actors**, then random vacant starts for the first two. **No cell-specific card bonus**.
- **7P:** reverse-tier *lottery* (or a carefully reviewed reverse-order real choice): randomly deal cells **4/5/6 to the last three actors**, and **0/1/2/3 to the first four**; whoever receives **cell 1 or 2 gets +1 random starting card**. If such a player were also the last actor that would stack bonuses, but the strict tier allocation makes that combination **impossible at 7P**. No extra movements/energy/attacks; one tactic per turn, max five unplayed cards.
- Human manual testing by the owner should compare how players perceive fairness, opening variety and the middle acting seats, especially whether the tier lottery is too restrictive. **These are candidate rules, not authorized app changes.**

The next model step should also compare a **hybrid soft bias** (e.g. weighted reverse choice allowing all positions for all actors, preserving some surprise) against the strict tiers, rather than adding more cards. Maintain actor×cell outcomes and all 17 card effects. Any rule accepted later should receive precise written criteria and production-engine tests before implementation; gameplay SK-DEC-019–024 IDs on the draft branch currently conflict with approved visual IDs on main.

## Github status

Existing [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and unmerged draft PR #12 branch `docs/11-progressive-rules-review` only. Changed the *independent R0 simulation model* and reproducible experiment driver; no application gameplay, production tests, merge or deployment.
