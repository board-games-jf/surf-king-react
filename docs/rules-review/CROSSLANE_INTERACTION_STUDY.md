# Iteration I — 2/4/7-player cross-lane interaction and first-turn fairness comparison

**Date:** 2026-11-23. **Executed 2,400 independently modeled seeded races**: 200 seeds × (2, 4, 7 players) × (4 treatment variants). [Executable reproduction](CROSSLANE_INTERACTION_REPRODUCTION.js), source inputs [current layout](https://github.com/board-games-jf/surf-king-react/blob/main/src/map/layout/board-layout.json), [current gameplay deck](https://github.com/board-games-jf/surf-king-react/blob/main/src/game/SurfKingGame.js) from main `c6fd08e2da82ca223740e3aa944c47f87aa84f16`. **Not** app/Jest matches, human playtests, full-deck active behavior or permanent game-rule approvals.

## Controlled variants

All variants use identical original physical 64-card inventory, uniformly shuffled and dealt two cards at start, draw one after an available ordinary maneuver (skip draw at cap 5), recycle discards when deck empty, 2 starting energy, 0-cost mandatory movement as trial only, fixed Shark −2, next-own-turn same-cell 1/2/3 recovery, random fall-card transfer to attacking player / hazard discard, and experimental cap5 energy/hand. One tactical action before required movement, dice trial 1 or 2 best-of-d6, strict loser −1, tie no damage. Normal Drop In stays adjacent. Players move greedily along shortest beach graph paths with small Shark aversion. Initiative rotates by seed, independently of starting cell 0..n−1. Each pair of variants starts with the same seed/deal; subsequent random draws can diverge. Race censored after 16 rounds if no beach arrival.

- **P0 — no tactical actions:** parallel-race baseline with cards serving only as potential fall-loss items.
- **P1 — cross-lane offense:** allow Big Wave at proposed true-graph range ≤2 and Sunburn ≤3 plus adjacent normal Drop In and familiar healing. All other card types are **inert**. No special first-round rule.
- **P2 — offense + counterplay:** P1 plus proposed Stone within 2 edges, Jumping to remove an adjacent placed Stone, active Amulet (protects against offensive damage) and Hang Loose (blocks normal Drop In), each lasting until user's next personal turn. A Stone owner may not occupy/reuse its tile until expiration after 3 subsequent own turns; these timing choices are **unapproved fixtures**. Stone targets a rival's legal path if it improves blockage in the heuristic. Shields are proactively played.
- **P3 — P2 + first-personal-turn preparation:** no **direct damaging offensive card or Drop In** during any player's very first own turn; Stone, Jumping, protective cards and movement remain available. Direct damage is allowed from each player's second own turn. This is a **trial-only candidate** opening convention, NOT an accepted rule. It does not prevent a first-turn placed obstacle or future initiative advantage.

**Partial-card scope:** Only Big Wave, Sunburn, Stone, Jumping, Amulet, Hang Loose, Energy/+2/+3/Coconut, Swimming Fin/Lifeguard Float have active effects. Other original cards (Cyclone, Island, Storm, Tsunami, Change, Bottled Water) exist as physical hand/deck/discard cards but **their tactical effects are disabled to isolate this question**. No positional Drop In exchange or Surf Current. Purely model-generated policies (prioritize lethal attacks, legal Stone obstruction, Jumping counter, proactive protections, other attack/healing) are **not representative of skilled human decisions**. Range, duration, hand/draw and damage values are provisional.

## Results

**Means per started race, 200 seeds per row.** Opponent actions = attempted offensive effects plus placed lane-interfering Stones and Jumping obstacle counters; not guaranteed meaningful fun. Stone path delays = placements increasing graph shortest path length immediately, not necessarily proven human tempo loss. 'First actor' is the first in the seeded rotating initiative, not always starting cell 0.

| Players | Variant | Finished | Mean rounds | First actor wins | Opponent-facing actions | Damaging attacks | Stones | Stones raising path distance | Jumping removals | Cards transferred on fall | Falls before target's first turn | Damaging actions on actor's first turn | Wins by starting cell |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | P0 | 200/200 | 7.00 | 100.0% | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 100/100 |
| 2 | P1 | 200/200 | 7.00 | 100.0% | 1.83 | 1.83 | 0.00 | 0.00 | 0.00 | 0.63 | 0.13 | 0.47 | 100/100 |
| 2 | P2 | 200/200 | 7.05 | 99.5% | 3.09 | 2.08 | 0.86 | 0.33 | 0.08 | 0.72 | 0.13 | 0.43 | 101/99 |
| 2 | P3 | 200/200 | 7.08 | 99.0% | 3.13 | 2.12 | 0.85 | 0.34 | 0.09 | 0.68 | 0.00 | 0.00 | 100/100 |
| 4 | P0 | 200/200 | 7.00 | 100.0% | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 50/50/50/50 |
| 4 | P1 | 200/200 | 7.00 | 100.0% | 3.46 | 3.46 | 0.00 | 0.00 | 0.00 | 1.57 | 0.23 | 0.96 | 50/50/50/50 |
| 4 | P2 | 200/200 | 7.00 | 93.5% | 6.53 | 4.32 | 1.70 | 0.80 | 0.23 | 1.77 | 0.23 | 0.94 | 46/46/55/53 |
| 4 | P3 | 200/200 | 7.00 | 96.0% | 6.47 | 4.22 | 1.72 | 0.80 | 0.26 | 1.55 | 0.00 | 0.00 | 49/46/54/51 |
| 7 | P0 | 200/200 | 7.00 | 100.0% | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 28/29/29/28/29/28/29 |
| 7 | P1 | 200/200 | 7.00 | 66.0% | 22.70 | 19.14 | 0.00 | 0.00 | 0.00 | 8.04 | 0.42 | 3.86 | 23/20/32/37/25/25/38 |
| 7 | P2 | 200/200 | 7.00 | 62.0% | 22.92 | 16.52 | 2.85 | 1.49 | 0.58 | 6.61 | 0.37 | 3.10 | 14/15/32/34/46/29/30 |
| 7 | P3 | 200/200 | 7.00 | 65.0% | 20.56 | 14.80 | 2.87 | 1.49 | 0.62 | 5.83 | 0.00 | 0.00 | 20/20/26/30/36/36/32 |

## Interpretation and safeguards

**P0→P1** isolates direct cross-lane offensive reach in an otherwise parallel race; **P1→P2** adds route interference and proactive counterplay; **P2→P3** changes only opening-round permission for direct damage. Even if P1/P2 create many attacks, beware that **a damage-only knockdown retains the target's hex** and can merely transfer a card without delaying travel; a long/high-action match is not automatically more enjoyable. The effect of first-turn preparation is limited: it prevents direct damage before initial turns, not all early game advantage or forced hazard movement.

**Assertions executed for each of 2,400 games:** unique physical ID conservation across deck, hand, discard, placed Stone, active protection; no two players on the same logical hex; all fall events equal exactly one card transfer, one discard or an empty-hand result. No implementation/game-engine tests. Turn-order rotation and seeded deck repetition help comparative reasoning but do **not** eliminate heuristic/model bias or guarantee pairs share identical later hand streams.

**Key limitations:** No random-distribution confidence intervals computed, insufficient to set final numerical balancing thresholds; player-specific deterministic route/attack policy and nonstrategic victim decision-making; many cards inert; no skill, time-to-think/real seconds or fun score; winner is first beach, no alternate finish rules. Card design/effects/copy-counts and first-round protection remain unapproved. Before approving, build targeted adversarial sequences (opening Big Wave vs Amulet, Stone on rival path with Jumping answer, player-forced Shark versus indirect Stone owner, full receiver hand, low-energy attacker loses Drop In) and actual human tabletop sessions; separately vary deck frequencies and two-player map start positions.

**Next:** Analyze these results without assuming high attacks = high fun. Compare opening protection policies and player response probabilities, test card-draw/hand scarcity, and run a facilitated human playtest protocol with measurable targets. Do not implement the engine, auto-create multiplayer infrastructure, or merge/deploy without the owner's separate approval.
