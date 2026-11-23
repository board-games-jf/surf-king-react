# Iteration N — full R0 B60 match simulation (all 17 card types enabled)

**Date:** 2026-11-23. **Issue:** #11. **Status:** independent design-model evidence; **NOT a production gameplay implementation, Jest/build result, or human playtest**. The 60-card R0, free movement, opening limitations, optional Drop In exchange and effect timings remain experimental.

## Question

When the provisional 17 card types actually take actions inside **complete 2-, 4- and 7-player races**, do games finish promptly; how many attacks, falls and same-round beach arrivals occur; and how sensitive are outcomes to tactical policy and acting order?

## Evidence and reproduction

- [Executable simulator](R0_FULL_MATCH_MODEL.js): `SK_SEEDS=1000 node docs/rules-review/R0_FULL_MATCH_MODEL.js` from the repository root. It loads the 53-cell source board and enumerates **60 individually identified cards across 17 types**.
- **Primary batch:** **12,000 game executions** = 1,000 deterministic seeded shuffles × 2/4/7 players × two scripted policies (**balanced**, **aggressive**) × two orders (seat 0 first; last seat first). Identical numbered seeds are reused for paired comparisons, so these are *paired model runs*, not 12,000 independent human observations.
- **Sensitivity batch:** **13,000 further game executions** = 500 seeds × (2+4+7 distinct first-seat rotations) × two scripted policies. This overlaps the primary batch on some seeds/settings, so **do not sum to claim 25,000 independent games**. Run the snippet below with the committed module in the repo root:

```sh
node - <<'NODE'
const { play } = require('./docs/rules-review/R0_FULL_MATCH_MODEL')
for (const n of [2, 4, 7]) for (const policy of ['balanced','aggressive']) {
  const rates=[]
  for(let shift=0;shift<n;shift++){
    let wins=0
    for(let seed=1;seed<=500;seed++) wins+=Number(play(n,seed,policy,shift).winActorIndex===0)
    rates.push((100*wins/500).toFixed(1))
  }
  console.log(n,policy,rates.join('% / ')+'%')
}
NODE
```

- **Actually executed:** Node.js 22 locally. Because the public GitHub remote was inaccessible to the local runner, the execution used an exact numeric reconstruction of the **53 published coordinates**, same cell IDs/hex radius and checked edge graph (cell 21 neighbors 14,18,25,28; displayed 18→15 non-adjacent). The committed reproduction loads the real checked-out `src/map/layout/board-layout.json`. **Do not mislabel this execution as a verified cloned-checkout run.** The GitHub source was read via the connector and the reproduction was committed to the existing design PR branch.
- **Integrity assertions executed every modeled turn:** no occupied-cell overlaps, all 60 unique physical card IDs present in exactly one deck/hand/discard/active/board zone, energy within 0..5, zero energy iff down, one random eligible hand-card loss or empty-hand exception per new fall. Under R0, an attacker receives the lost card on a directly caused fall; otherwise it goes to the discard. At least one use of **each of all 17 card types** occurred in every 1,000-game primary batch. All batches completed without invariant failures.
- **Policies are illustrative heuristics, not rational humans:** balanced favors rescue/Amulet, situational attacks, score-improving swaps and Surf Current; aggressive weighs attacks and speed more strongly and spends rescue cards less often. Both use short-beach paths, uniform seeded tie choices and highly simplified targeting; no response-time decisions, deals, social dynamics, full boardgame.io turn phases, or browser UI.

## Primary observations — 1,000 games per cell

**Seat 0 first, balanced policy:**

| Metric (per match unless stated) | 2 players | 4 players | 7 players |
| --- | ---: | ---: | ---: |
| Finished within 16 rounds | 1,000 / 1,000 | 1,000 / 1,000 | 1,000 / 1,000 |
| Mean finishing round | 6.577 | 6.297 | 6.090 |
| Mean new falls | 1.408 | 3.092 | 7.351 |
| Mean attack actions (card + Drop In) | 1.462 | 3.286 | 9.881 |
| Mean opponent-facing actions (including forced movement/position) | **2.060** | **5.145** | **13.442** |
| Mean transferred fall cards | 0.569 | 1.419 | 3.960 |
| Mean forced-block movement events | 0.000 | 0.007 | 0.201 |
| At least two beach arrivals in winner's round | **26.5%** | **38.3%** | **38.9%** |
| Earliest actor wins | **72.0%** | **53.5%** | **28.6%** |

**Seat 0 first, aggressive policy:**

| Metric | 2 players | 4 players | 7 players |
| --- | ---: | ---: | ---: |
| Mean finishing round | 6.627 | 6.317 | 6.221 |
| Mean new falls | 1.516 | 3.559 | **10.692** |
| Mean opponent-facing actions | 2.299 | 5.994 | **19.618** |
| At least two beach arrivals in winner's round | 27.6% | 38.9% | 37.9% |
| Earliest actor wins | **72.9%** | **54.0%** | **29.1%** |

**Last seat first (same model, paired seeds):** balanced earliest-actor win **70.9% / 54.1% / 30.6%** for 2/4/7; aggressive **68.1% / 52.8% / 31.8%**. Other effects and route changes confound attribution; this is **not** a clean proof that initiative alone causes the difference.

**All first-seat rotations — range across 500 paired seeds each:**

| Players | Balanced first-actor wins | Aggressive first-actor wins | Equal-seat reference only |
| --- | --- | --- | --- |
| 2 | 69.2%–74.6% | 67.6%–74.8% | 50% |
| 4 | 42.2%–52.8% | 41.8%–53.0% | 25% |
| 7 | 21.0%–32.0% | 18.6%–33.0% | 14.3% |

Initial cells are **not identical in the seven-seat setup**, so first-actor advantage and spawn geometry are entangled. The equal-seat references are illustrative fairness benchmarks, not a claim that every seat is geometrically identical.

## Interpretation and limitations

1. **Pacing:** All 12,000 primary fixtures finished by round 16; typical modeled finish was about round 6–7. **Not evidence of real-world elapsed minutes**, because actual human placements, card decisions and explanations are unmeasured.
2. **First-actor / start geometry is still a high-priority fairness problem**, especially two players: across all initial-actor rotations, early actor won **67.6%–74.8%**, even with positioning cards, proactive defense and speed. An end-of-round winner rule is **not** automatically a fix: **23%–40%** of model races had additional same-round arrivals, requiring a meaningful co-finish resolution.
3. **Seven-player action volume:** balanced ~**13.44 opponent-facing actions / 7.35 falls**, aggressive ~**19.62 / 10.69**, per model race. In a physical game this **might** be too slow or frustrating, but no clock-time/social outcome is measured. Group attack targeting is only a heuristic.
4. **All 17 types are live** in the simulator and all were used at least once per primary 1,000-game batch; that does **not** establish every card's correct boundary behavior or preferred copy count. Examples: defender reactions are only previously activated Amulet/Hang Loose; no multi-action tactical planning, power-spike adaptation, difficulty modeling, or adversarial exact legality parity.
5. **No new permanent decision:** Do not yet adjust attack ranges, card quantities, Surf Current, initiative, finish tie-break or opening protection. Next **focused controlled A/B** should isolate a practical fairness intervention without changing everything at once, then compare physical owner playtest reports. Reconcile draft gameplay SK-DEC-019–024 IDs with accepted visual main IDs before any documentation merge.

**No changes to** `src/game/SurfKingGame.js`, the app UI, tests, server, deployments or main. All work belongs to open Issue #11 and draft PR #12. Merge/deploy remain unauthorized.
