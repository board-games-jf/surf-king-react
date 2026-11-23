# Iteration X — soft reverse-weighted opening lottery (owner-requested)

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** independent full-match R0 design simulation. **NOT an approved rule, production engine validation, or human playtest.**

## Goal

The owner rejected rigid setup tiers even though they had improved the average first-vs-last winning rates in Iteration W. The requirement is **unpredictable distinct starts**, with **every actor able to receive every hex** and a *small*, reversible compensation for later turn slots. We therefore tested **1.5× and 2× weighted position lotteries** rather than force-assigning cells 4/5/6.

The four Sharks remain at 28–31, exactly as intentionally designed. Other constant R0 parameters: exact 53-cell main layout; full 60-card/17-type active model; fixed turn order (no snake double turns); nominal start energy 2; optional opening card bonus; one tactical action per turn; mandatory zero-energy-cost movement; fall/attack/steal/hand conservation; full current round after beach entry; highest remaining energy among same-round beach finishers, random only on an energy tie. **All are experimental game-design conventions, not production approvals.**

## Exact allocation algorithm

1. Shuffle the seven distinct start cells **0–6** using a random stream separate from the deck/gameplay RNG.
2. Assign from **last actor to first actor**, removing each selected start from the available pool.
3. For the actor currently choosing, each available cell **0–3 gets weight 1**, while each remaining cell **4–6 gets weight `w`**.
4. Under `weighted1p5` / `weighted2`, `w = 1 + (maximum - 1) × (actor slot - 1)/(number of actors - 1)`. The first acting slot has 1×, the final acting slot has 1.5× or 2×, and middle actors interpolate. Under `weightedLate1p5` / `weightedLate2`, only the last two acting slots get increased weights (penultimate half the extra weight).
5. Draw with probabilities proportional to the weights **among the remaining cells**. **All weights stay strictly positive**. No actor is guaranteed or forbidden any starting cell, and starts are always unique.

At the **first** draw, performed by the last actor, the theoretical chance of landing on 4–6 is **3/7 = 42.86%** (unweighted), **4.5/8.5 = 52.94%** (1.5×), and **6/10 = 60%** (2×). In a controlled 7P 5,000-game test, observed rates were **42.94%, 53.28%, 60.66%**. These values are *unconditional* setup probabilities for the last actor; probabilities of specific individual hexes depend on which other cells are still available when each earlier actor draws.

**Note:** cells 4–6 have a seven-step Shark-free option under static geometry, but the more exposed cell 5 is **not** automatically a better winning position under aggressive tactics. Weighting all three equally is a deliberate simple trial, not an evidence-based optimal numeric rating. The algorithm **never models actual human position picking**.

## Reproduction, tests and provenance

[Model](R0_FULL_MATCH_MODEL.js) · [new full-match cross-cell A/B runner](R0_WEIGHTED_START_AB.js)

```sh
# E.g., 7 players, soft preference and same-hex conditional comparisons:
SK_WEIGHTED_SEEDS=5000 SK_WEIGHTED_OFFSET=52000 \
 SK_WEIGHTED_PLAYERS=7 SK_WEIGHTED_MODES=random,weighted1p5,weighted2,reverseTier \
 SK_WEIGHTED_COMPS=inner1 SK_WEIGHTED_BONUSES=last1 \
 node docs/rules-review/R0_WEIGHTED_START_AB.js
```

Actual run batches, all against the connected GitHub **main layout blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`**, model blob `02ee6556253bb0980f999adeb7a308c7b225f619` and runner blob `ca71765d5ffb663c504e943e7a4e1e55c4dfc779`:

| Group | Players | Seed window | Tested allocations / setup | Full-match executions | Internal state checks |
| --- | --- | --- | --- | ---: | ---: |
| Initial broad screen | 7 | 50,001–51,000 | Random, 1.5×, 2×, last-two-only at both weights, rigid reverse-tier; no/+1/+2 cell 1/2 bonus, two tactics policies, last +1 | **36,000** | **1,816,280** |
| 7P focused comparison | 7 | 52,001–57,000 | Random, 1.5×, 2×, reverse-tier; cell 1/2 +1, last actor +1, two policies | **40,000** | **2,016,112** |
| 4P focused comparison | 4 | 56,001–60,000 | Random, 1.5×, 2×, last-two rigid safe starts; no or +1 cell bonus; last +1, two policies | **64,000** | **2,081,635** |
| Missing-population screen | 3/5/6 | 60,001–61,500 | Random, 1.5×, 2×; no or +1 cell bonus; last +1, two policies | **54,000** | **1,971,056** |
| Two-player ablation | 2 | 65,001–68,000 | Random, 1.5×, 2×; last bonus none/+1, two policies | **36,000** | **743,451** |
| Seven-player last-card ablation | 7 | 70,001–74,000 | Random, 2×, rigid reverse-tier; +1 on cell 1/2; last bonus none/+1, two policies | **48,000** | **2,416,728** |
| Four-player last-card ablation | 4 | 76,001–80,000 | Random, 2×, late-two rigid starts; no cell bonus; last bonus none/+1, two policies | **48,000** | **1,565,415** |
| **Main experiment total** | **2–7** | *Different nonoverlapping seed windows per player count* | **Paired seeded variants within each group** | **326,000** | **12,610,677** |

All **326,000** complete games reached a beach by round 16 and passed the R0 model's conservation, unique occupancy, energy/fallen and fall-card checks **without assertion failure**. All **soft-weighted modes**, in the large enough 7P samples, produced observed starts in **every one of the 49 actor-slot×start-cell combinations**. The model also tracks the number of eligible winning combinations, not treating forbidden rigid-tier combinations as zero-probability wins.

Additional verification (not included in the 326k): **600 exact baseline-versus-new-model randomized game comparisons** across 2/3/4/5/6/7 and both scripted policies, matching all result fields unchanged (21,392 per-turn checks); **21,600 small fixtures** from the final saved runner covering all 2–7 players, two policies, six start methods, three cell-bonus options and both last-card bonus options, passing **764,501** further integrity checks.

**Execution method:** the *exact committed JavaScript model and runner source* were fetched through the connected GitHub connector and executed with a JavaScript/V8 function harness using the GitHub-fetched main layout, equivalent assertion and filesystem fixtures. The reproduction command was **not** separately executed with Node inside a cloned repository. No actual app `SurfKingGame.js` gameplay test, Jest, browser, build, runtime minutes or human player study occurred. Scripted model games are paired experiments, **not real player winning probabilities**.

## Seven-player findings: all 49 start×seat pairs remain possible

### 5,000 paired seed focus, last actor +1 card, cell 1/2 +1 card

| Tactic policy | Allocation | First-actor win | Last-actor win | Lowest / highest **conditional** actor×hex win | Last actor starts on 4–6 |
| --- | --- | ---: | ---: | ---: | ---: |
| Balanced | Random | **19.96%** | **11.70%** | **6.52–21.47%** | 42.94% |
| Balanced | Soft 1.5× | 19.40% | 12.82% | 6.18–21.03% | 53.28% |
| Balanced | **Soft 2×** | **18.66%** | **13.42%** | **7.36–20.09%** | 60.66% |
| Balanced | Rigid reverse-tier | 16.82% | 14.44% | 11.12–18.77% among **25/49 assignable** pairs | 100% |
| Aggressive | Random | **18.90%** | **11.90%** | **6.94–22.25%** | 42.94% |
| Aggressive | Soft 1.5× | 18.70% | 11.88% | 5.84–19.87% | 53.28% |
| Aggressive | **Soft 2×** | **18.82%** | **11.52%** | **4.75–19.79%** | 60.66% |
| Aggressive | Rigid reverse-tier | 17.40% | 13.88% | 10.09–18.90% among **25/49 assignable** pairs | 100% |

**Interpretation:** Soft 2× is a *reasonable average compromise* under balanced play but **not enough to eliminate very weak combinations**. Aggressive play can make the worst pair (last actor on cell 2) win only **4.75%** of scripted games on this 5,000-seed screen. The model does **not** justify saying the match is fair for someone unlucky enough to draw that actor×cell combination. The observed min/max across 49 conditions are exploratory **selected extremes** and subject to statistical uncertainty and multiple comparisons, especially when weighted selection makes the risky late pair less common (e.g. ~484 assignments).

The **initial 1,000-seed** broad screen showed that +2 initial cards on cells 1/2 can also make early acting players on those starts stronger; pushing more cards onto the entire setup is not a proven fix. Weighted last-two-only variants were not consistently better than graduated full-order weights. **No rigid-tier or positive-weight scheme made a cell automatically win.**

## Seven-player last-card ablation: keep it as an independent provisional option

**Fresh 4,000-seed screen**, cell 1/2 +1; balanced:

| Allocation | First / last wins with NO last-card bonus | First / last wins with last +1 card |
| --- | --- | --- |
| Random | **20.15% / 9.63%** | **18.53% / 12.90%** |
| **Soft 2×** | **20.05% / 9.68%** | **17.95% / 13.10%** |
| Rigid reverse-tier | **17.88% / 11.80%** | **17.20% / 14.90%** |

Aggressive policies also show a weaker last actor **without** the extra initial card (e.g. soft 2× last actor 9.50% without versus **12.40%** with it). Therefore, **no justification yet to remove** the last actor's single extra opening card simply because their starting-cell allocation is weighted. This is not owner approval of the extra card.

## Four players: softer, but not a universal cure

**4,000 matched seeds**, no positional cards, last actor +1:

| Policy | Allocation | First / last wins | Worst / best assignable actor×cell | Distinct sets of occupied starting cells |
| --- | --- | --- | --- | ---: |
| Balanced | Random | **29.83% / 23.93%** | 15.02–34.25% | **35** |
| Balanced | Soft **1.5×** | 28.78% / 24.08% | 14.16–32.34% | **35** |
| Balanced | Soft **2×** | **28.98% / 24.30%** | 14.95–32.77% | **35** |
| Balanced | Rigid last-two safe | 26.30% / 27.58% | 19.85–32.46% among 20 eligible pairs | **22** |
| Aggressive | Random | 28.95% / 23.68% | 15.60–35.62% | **35** |
| Aggressive | Soft **2×** | **29.40% / 25.05%** | **15.26–32.28%** | **35** |
| Aggressive | Rigid last-two safe | 26.23% / 26.18% | 18.35–31.68% among 20 eligible pairs | **22** |

The soft 2× improvement in **first-versus-last average** is modest. Its worst *start×actor* condition remains well below the equal-seat reference of 25%, while rigid grouping sacrifices position variety to raise the floor. The user's rejection of rigid groups should **not** be ignored merely because they numerically equalize marginals.

### Extra card to last actor in 4P

**4,000 new seeds**, no cell bonus: under soft 2× balanced, **29.80% / 21.13%** without the last card versus **27.98% / 25.43%** with it. Under aggressive play, **29.98% / 20.85%** without versus **29.28% / 24.63%** with. Again, no evidence to remove the one-card bonus at setup.

## Two, three, five and six players: avoid overgeneralizing

- **2P (3,000-seed paired, no cell cards):** randomized starts + last actor +1 remained close to parity (**51.83% / 48.17%** balanced; **50.73% / 49.27%** aggressive). Soft 1.5× and 2× produced near-parity marginals too, but additional weighting is **unnecessary complexity**; recommend random starts for the next manual 2P trial.
- **3P (1,500-seed screen):** weighted placement did not reliably help; balanced first actor approximately **37–39%**, still ahead of a uniform 33.3%, and some weighted actor×cell minimum estimates fell below the random baseline. Keep unweighted as the simpler provisional default until better evidence.
- **5P (1,500-seed screen):** modest reallocation of first/last wins under the weights, but **weak actor×cell pair estimates** remained around **5–13%** depending on bonus and scripted policy. No reliable universal fair weight yet.
- **6P (1,500-seed screen):** gradual weights moved balanced first/last from **22.53/14.40%** (random, no cell bonus) to **20.27/16.67%** (2×, no cell bonus), but worst joint combinations could still fall below 5% in the small sample. With cell 1/2 +1, the results varied by policy and no robust fix emerged.
- These smaller 3/5/6 samples contain many comparisons and are **not strong enough to ratify rules**; they are directional warnings and help prioritize follow-up tests.

## Decision and next smallest action

**Do not adopt 2× as a settled universal balance rule.** The request for unpredictability is fully met (every actor×hex remains assignable), but **the worst-case late, risky-hex pairing remains too weak** in important 7P matches despite a modest improvement in marginal winner shares. Higher weights would reduce the chance of a weak pairing without preventing it; a pure weight change alone cannot mathematically guarantee an acceptable *conditional* win chance once that pairing occurs.

**Recommended next isolated A/B**: keep a soft 1.5×–2× start lottery and compare **one player-facing, rare, conditional safeguard** for a player who acts among the last two **and** happens to draw an exposed starting cell 1/2 (e.g. one optional opening-hand mulligan or one temporary defensive choice), against existing random/weighted conditions. This must be defined so it neither moves Sharks nor guarantees a strong opening and does not make first-turn interactions inert. Alternatively, test a **small player choice from two random position candidates**, with a clear tie-breaking/return process for seven occupied starts. Preserve all 49 possible 7P actor×cell combinations and test attacks, pairwise fairness, rounds and complexity. These are **unapproved hypotheses**.

Human testing by the owner remains necessary to decide whether the residual risk is *fun tactical variance* or a discouraging pre-game disadvantage. As before, all design-model experiments are tracked under **Issue #11 / open draft PR #12**, not in the app; the experimental gameplay SK-DEC-019–024 identifiers still conflict with main's accepted visual IDs and require a controlled documentation repair before any eventual authorized merge.
