# Iteration O — controlled fixed versus snake initiative A/B

**Date:** 2026-11-23 · **Issue:** #11 · **Scope:** ONE provisional rule variable: turn order across rounds. All R0 physical cards, energy, actions, geometry, initial seats, random seeds and scripted strategy are held constant. **Not an approved gameplay change.**

## Reproduce

Run `SK_ORDER_SEEDS=1500 node docs/rules-review/R0_ORDER_AB.js` from a checkout of the repository. Source: [R0_ORDER_AB.js](R0_ORDER_AB.js) using the [complete 17-card-type model](R0_FULL_MATCH_MODEL.js).

The experiment **actually executed 36,000 modeled game runs**: 2/4/7 players × two strategies (balanced, aggressive) × two initial actors (seat 0 or last seat) × **1,500 paired seeds** × fixed/snake rule. They are **paired** observations, not 36,000 independent human matches. Executed locally with Node 22 against the verified 53-cell coordinate mirror described in [Iteration N](R0_FULL_MATCH_STUDY.md); the committed scripts use the real `board-layout.json` when checked out. No production boardgame.io, Jest, build, real minutes or human tests executed.

- **Fixed order (R0 baseline):** use the same initial actor sequence every round.
- **Snake order (one-rule trial):** use the initial sequence in rounds 1,3,5,... and **reverse** it in rounds 2,4,6,...; keep all other game rules unchanged.
- **Measure:** fraction of races won by the **person who had the first turn in round 1**, not by the current round's first actor. This metric was updated in `R0_FULL_MATCH_MODEL.js` to remain correct when order changes. Compare with an equal-seat reference of 50% / 25% / 14.3% for 2/4/7, noting spawn geometry differs.
- Exact physical 60-card, occupancy, energy/fall and card-loss assertions run on each modeled turn; every A/B game finished by round 16 and no invariant failed.

## Results — first-round first actor wins

| Players | Script | First seat | Fixed order | Snake order | Reduction |
| --- | --- | ---: | ---: | ---: | ---: |
| 2 | Balanced | 0 | **73.60%** | **57.73%** | −15.87 pp |
| 2 | Balanced | 1 | **70.60%** | **51.73%** | −18.87 pp |
| 2 | Aggressive | 0 | **74.13%** | **57.13%** | −17.00 pp |
| 2 | Aggressive | 1 | **68.00%** | **53.20%** | −14.80 pp |
| 4 | Balanced | 0 | 53.53% | 38.07% | −15.46 pp |
| 4 | Balanced | 3 | 52.40% | 35.13% | −17.27 pp |
| 4 | Aggressive | 0 | 54.20% | 36.87% | −17.33 pp |
| 4 | Aggressive | 3 | 52.00% | 33.80% | −18.20 pp |
| 7 | Balanced | 0 | 28.13% | 14.53% | −13.60 pp |
| 7 | Balanced | 6 | 31.67% | 21.27% | −10.40 pp |
| 7 | Aggressive | 0 | 27.20% | 18.60% | −8.60 pp |
| 7 | Aggressive | 6 | 33.00% | 19.80% | −13.20 pp |

The change **consistently reduces** the observed first-round actor advantage across these **specific model policies and starting seats**, but some configurations still exceed equal-seat references, especially 4P and 7P seat 6. This is **not a player-independent, causal fairness guarantee**: initial seat geometry and scripted decisions still matter.

## Tempo / interaction safety check

| Scenario | Fixed mean round | Snake mean round | Fixed opponent actions | Snake opponent actions |
| --- | ---: | ---: | ---: | ---: |
| 2P balanced, seat 0 first | 6.591 | 6.685 | 2.056 | 2.282 |
| 4P balanced, seat 0 first | 6.283 | 6.361 | 5.019 | 5.179 |
| 7P balanced, seat 0 first | 6.071 | 6.145 | 13.301 | 13.081 |
| 7P aggressive, seat 0 first | 6.227 | 6.266 | 19.654 | 18.950 |

Across these selected cells, race duration increased by roughly **0.04–0.09 rounds** and opponent-facing actions remained similar. This does not predict human elapsed time.

## Critical design risk

**Snake turn order introduces consecutive personal turns at round boundaries**: the last actor of an odd round acts first in the next even round (and the last actor of even rounds acts first in the next odd round). That player may gain *two back-to-back tactical actions and maneuvers without an opponent response*—especially problematic with Big Wave, Sunburn, Stone or Surf Current. The current simulator allows that because it faithfully changes only the order variable; it does **not** enforce a special buffer or prohibit attacks across a boundary.

This **could exchange one initiative unfairness for a burst/response unfairness**, invisible in aggregate first-actor win percentages. Test that consecutive-turn exploit and compare a cyclic, non-consecutive rotating order before approving or implementing snake.

## Decision gate

**Recommendation: retain snake as a high-priority experimental candidate, NOT a final rule.** It materially improved modeled initiative fairness without substantially extending modeled round counts. Next focus **one specific adversarial case**: double-turn direct attack / position-blocking with no counterplay, then compare one alternative order without immediate consecutive turns. Do not re-balance all 60 cards at the same time. Owner will perform real enjoyment/fairness playtests.

**Governance:** Issue #11 / draft PR #12, documentation-only experimental scripts; no live app changes, PR merge, deploy, or newly accepted rule. Draft gameplay SK-DEC-019–024 ID collisions with accepted visual main decisions remain outstanding.
