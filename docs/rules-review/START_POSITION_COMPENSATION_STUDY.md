# Iteration U — fixing high-pressure starts 1/2 without removing Sharks

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** experimental R0 model evidence, **NOT an approved rules change or gameplay engine implementation**.

## The owner's balance requirement

Preserve the **intentional central Shark strip (28–31)**, maintain a quick interactive race, and avoid starting cells or acting order making the game feel decided before any cards are played. [Iteration T](R0_FINISH_LINE_STUDY.md) improved first-vs-last fairness using a complete final round and highest remaining energy among same-round finishers, together with one extra opening card for the last actor. It did **not** remove starting-cell disparities in larger matches. The owner authorized focused research into **positions 1 and 2**.

## Cause analysis: more incoming player attacks, not predominantly Sharks

In **seven-player games** every current start (0–6) is occupied. On an independent **2,000-seed balanced-model holdout**, using current provisional final-round energy resolution, last-actor +1 and no cell-specific bonus:

| Starting cell | Incoming targeted opponent tactics per match | Falls attributed to player attacks | Shark-caused falls | Win share |
| --- | ---: | ---: | ---: | ---: |
| 0 | 1.762 | 0.568 | 0.315 | 14.65% |
| **1** | **2.227** | **0.811** | 0.332 | **9.10%** |
| **2** | **2.204** | **0.725** | 0.313 | **8.55%** |
| 3 | 1.714 | 0.542 | 0.342 | 15.60% |
| 4 | 2.025 | 0.747 | 0.356 | 17.85% |
| 5 | 2.308 | 0.919 | 0.347 | 14.90% |
| 6 | 2.012 | 0.766 | 0.356 | 19.35% |

**Interpretation:** 1/2 are more exposed to **direct opponent tactics and opponent-caused falls**, while their Shark-caused fall counts are **comparable to 0/3**. Their lower success is not simply the Sharks: the current seven-player opening geometry and card pressure combine. This is **a finding of scripted-policy simulation**, not a causal proof for humans. These modeled incoming-tactic counts do not include every passive placed tile as an incoming target.

## Tested one-variable setup alternatives

The model otherwise held fixed: **53 authentic source-layout hexes**, fixed four Sharks, full 60-physical-card / 17-type R0 deck and active card effects, start cells randomly assigned without replacement, first actor shuffled, **normal fixed turn order**, highest remaining energy among same-round beach finishers (random only on an energy tie), **last actor +1 opening card**, 2 starting energy and maximum 5 cards.

Six independent provisional cell-specific setup rules:

1. `none`: no extra starting-cell compensation.
2. `inner1`: **one extra card** to a surfer starting on cell **1 or 2**.
3. `inner2`: **two extra cards** to a surfer starting on cell **1 or 2**.
4. `riskTier1`: one extra card to every longer-Shark-free-path cell **0–3**.
5. `innerDraft`: cell 1/2 draws one extra card then discards their **lowest model-utility** card, leaving original hand count; this is a subjective scripted draft heuristic.
6. `innerEnergy1`: cell 1/2 starts with **3 energy** instead of 2, and no extra cell-specific card.

Physical setup cards are dealt from the **same shuffled B60 draw deck**, not invented. The last actor's +1 can stack with cell 1/2 +2, producing **five opening cards at most**, exactly the R0 experimental hand cap. One tactical action and mandatory normal movement per turn remain unchanged.

## Reproduction and actual execution

[Executable driver](START_POSITION_COMPENSATION_AB.js) using the [updated full-match R0 model](R0_FULL_MATCH_MODEL.js):

```sh
SK_POSITION_SEEDS=2000 SK_POSITION_OFFSET=1500 node docs/rules-review/START_POSITION_COMPENSATION_AB.js
```

- **Preliminary screening:** actually executed **18,000 complete model games** (1,500 seeds 1–1,500 × 7 players × balanced/aggressive × six variants).
- **Confirmation/holdout:** actually executed **72,000 further complete model games** (2,000 non-overlapping seeds 1,501–3,500 × 2/4/7 players × balanced/aggressive × six variants). This is a **paired experimental comparison** within each sample, **not 90,000 independent human matches**.
- **2,485,650 modeled per-turn integrity checks** passed in the confirmation batch. Each checked the 60 unique physically identified cards across deck/hand/discard/deployed/active zones, no overlapping occupied cells, energy/fallen consistency and exactly one eligible-card-loss-or-empty-hand exception per new fall. Every one of the **72,000 confirmation games** reached the beach by the round-16 model cap.
- Executed the **exact GitHub-fetched JS model and saved experiment driver code in a V8 runtime**, injecting the current GitHub-fetched `src/map/layout/board-layout.json` and equivalent assertions. The standalone checked-in Node command has **not been separately run in a cloned working tree**; no production SurfKingGame.js, Jest, build, browser or human tabletop game was exercised.
- **Important reproducibility:** same 2,000 held-out shuffled seeds, acting-seat assignment, board and starting-cell assignment for every variant. Bonus draws naturally change later deck composition and tactical decisions; those are intervention consequences. Rates are conditional on a starting cell being *occupied*. In 7P, all seven positions occur once each per game; in 2/4P, a cell occurs less frequently (roughly 2/7 or 4/7 of 2,000 games), so subgroups are noisier.

## Confirmatory results: starting-cell winner range

For each combination below, report **lowest-to-highest conditional win percentage across seven physical starting cells**, followed by the gap (percentage points). Uniform-seat reference is **50% (2P), 25% (4P), 14.29% (7P)**, not an absolute fairness guarantee.

| Players | Policy | No cell-specific bonus | Cell 1/2: +1 card | Cell 1/2: +2 cards | All 0–3: +1 card |
| --- | --- | --- | --- | --- | --- |
| **2** | Balanced | 46.30–53.17 (**6.87 pp**) | 46.55–54.02 (7.47 pp) | 45.69–54.04 (8.35 pp) | 47.16–53.15 (5.99 pp) |
| 2 | Aggressive | 47.96–53.54 (**5.58 pp**) | 46.55–53.70 (7.15 pp) | 44.82–54.04 (9.22 pp) | 44.78–53.54 (8.76 pp) |
| **4** | Balanced | 16.75–30.60 (**13.85 pp**) | 22.54–28.51 (5.97 pp) | **22.40–26.85 (4.45 pp)** | 18.77–30.25 (11.48 pp) |
| 4 | Aggressive | 18.42–29.99 (**11.57 pp**) | 21.97–27.90 (5.93 pp) | **20.73–28.30 (7.57 pp)** | 20.92–30.60 (9.68 pp) |
| **7** | Balanced | 8.55–19.35 (**10.80 pp**) | 11.05–17.20 (6.15 pp) | **12.50–15.45 (2.95 pp)** | 10.25–16.80 (6.55 pp) |
| 7 | Aggressive | 9.75–16.55 (**6.80 pp**) | 10.25–17.60 (7.35 pp) | **12.30–17.10 (4.80 pp)** | 10.30–18.05 (7.75 pp) |

**Interpretation:**
- **Four/seven players:** two extra opening cards specifically on 1/2 were the most consistently useful *tested* opening-hand compensation: they preserve the Sharks and help convert weaker starts into more viable card-based choices. The initial **+1** has some impact but less consistently. **+1 to every 0–3** tended to make 0/3 too strong while not fully rescuing 1/2.
- **Two players:** no starting-cell bonus is clearly needed in these fixtures; with +2 on 1/2, the modeled cell spread **increased** in both policies. The conditional samples are small and outcomes noisy, so do not claim proof of a damaging 2P effect—just **no basis to add complexity**.
- Extra starting **energy** sharply reduced falls but produced **less consistent win-share balancing** than two extra cards. The discretionary draft/replace variant depended on subjective card utility and did not outperform the straightforward extra-card rule.
- The experimental **last-actor +1** is still applied throughout. A starting cell is distinct from action order; compensations solve different problems.

### Seven-player detail, balanced holdout

| Start | No extra cell cards: win % | +2 on 1/2: win % | Baseline falls / match | +2 falls / match |
| --- | ---: | ---: | ---: | ---: |
| 0 | 14.65% | 13.90% | 0.898 | 0.946 |
| **1** | **9.10%** | **15.35%** | 1.161 | **0.896** |
| **2** | **8.55%** | **14.30%** | 1.060 | **0.869** |
| 3 | 15.60% | 12.50% | 0.902 | 0.986 |
| 4 | 17.85% | 15.35% | 1.121 | 1.167 |
| 5 | 14.90% | 13.15% | 1.286 | 1.342 |
| 6 | 19.35% | 15.45% | 1.137 | 1.294 |

7P balanced: **mean finished round 6.128→6.090** and opponent-facing actions **14.252→13.804** (baseline→+2 on 1/2). 7P aggressive: **6.282→6.239** rounds and opponent-facing actions **20.945→20.956**, approximately stable. **These are modeled rounds/actions, not actual minutes or evidence of felt enjoyment.** Other seats still face significant aggression and occasional late falls.

**Residual initiative imbalance:** the 7P balanced first/last acting slots were **18.9%/12.0%** without cell compensation and **20.4%/12.8%** with +2 on 1/2. Thus the cell-specific intervention did **not** fix first-actor fairness and slightly enlarged this gap in the held-out sample. This problem should remain a separate target, not be hidden under a single overall fairness score.

## Candidate protocol for the owner's next tabletop trial — NOT approved

**Do not change Sharks or the actual app yet.** Test this understandable, **player-count-aware** setup variation:

- **Two players:** use randomly allocated distinct starting cells with **no cell-specific extra cards**; last acting player retains the separate experimental +1, and the full-round energy finish remains a trial.
- **Four or more players:** randomly allocate distinct starting cells; anyone drawn to cell **1 or 2** receives **two additional shuffled B60 cards** on setup. The normal experimental two-card hand therefore starts at **four**, or **five** if the same surfer is also the **last actor** (+1). Everyone else gets the normal R0 opening hand, with last-actor bonus as previously trialed.
- No added movement, no extra turn, no protection from Sharks, no relocation of Shark tiles, no extra tactical action. The bonus is **more strategic options**, not a guaranteed good draw or win.

This is a **candidate to playtest**, not a replacement for approved rules. Target a **narrow 4P/7P manual check** specifically on opening decision time, first interactions, whether the bonus feels deserved/understandable and whether players still perceive cells 1/2 as dangerous but playable. The owner conducts manual tests; the assistant continues simulations.

**Next technical check:** Run larger/separate holdout samples with **seat × cell cross-tabs** and alternative scripted policies, especially 7P. Define a clear practical acceptance range with the owner rather than asserting a 2.95-pp model spread equals real fairness. Review the issue-level rules only after owner approval. Draft PR #12 remains open, unmerged; gameplay SK-DEC-019–024 IDs still collide with accepted visual decisions on main.
