# Iteration Q — randomized initiative and starting-cell geometry fairness

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** exact graph/draft-assignment design analysis, not a final rule, not the app engine/Jest, and not human playtests.

## Owner direction

The owner wants the **first player to be randomly determined**, and the **initial surfer position to be randomized**, recognizing that both initiative and starting geometry can create advantage. As in a setup-balancing mechanism for a tabletop game, the aim is not to eliminate every chance advantage but to reduce severe **within-match** unfairness. This is a **design direction, not authorization for a specific compensation rule or production implementation**.

## Exact reproduction and baseline

Run `node docs/rules-review/START_POSITION_FAIRNESS_EXACT.js` from a repository checkout. The executable reads the same 53-cell **provisional** `src/map/layout/board-layout.json` as main, builds the exact shared-edge graph and enumerates **all ordered placements of 2, 4 and 7 surfers into the seven currently implemented start cells 0–6**, without repetition. It compares the distance to any beach cell 49–52 with and without using Shark tiles 28–31.

| Starting cell | Graph shortest route | Shark-free shortest route | Other starting cells sharing an edge |
| --- | ---: | ---: | --- |
| 0 | 7 | **8** | 4 |
| 1 | 7 | **8** | 4, 5 |
| 2 | 7 | **8** | 5, 6 |
| 3 | 7 | **8** | 6 |
| 4 | 7 | **7** | 0, 1 |
| 5 | 7 | **7** | 1, 2 |
| 6 | 7 | **7** | 2, 3 |

**Key observation:** Every start can reach the beach in seven true-edge moves **if willing to traverse Shark**. Starts **4–6**, however, also have a seven-move **Shark-free** path; starts **0–3 need eight moves to avoid Shark**. Under current accepted fall principles, a Shark fall is quick but risks a randomly discarded hand card, so this difference may matter economically without a turn skip. This is a static geometry result, **not a measured probability of winning**.

## Exhaustive random-placement comparisons

Treat an ordered assignment as the list of starting cells in **acting order** (who plays first is uniformly shuffled among participant identities, independent of their allocated cells). The enumerations are exact, not sampled:

| Players | All possible ordered assignments among 0–6 | At least two different Shark-free route lengths | First actor's start has a longer Shark-free route than another |
| --- | ---: | ---: | ---: |
| 2 | **42** | **57.143%** | 28.571% |
| 4 | **840** | **97.143%** | 54.286% |
| 7 | **5,040** | **100%** | 57.143% |

With two random starts, **6 of 21 unordered pairs (28.571%)** are already normal Drop In edge-adjacent; **11/21 (52.381%)** are within two edges (candidate Big Wave range). The first-personal-turn no-damage restriction remains an R0 trial, so adjacency is not evidence of actual first-turn attacks.

**Toy winner sensitivity (NOT a full match):** If each surfer always chooses a shortest route *avoiding* Shark, no interactions/cards/blocks occur, and first beach arrival wins, the first acting seat wins **71.429% (2P), 45.714% (4P), 42.857% (7P)** of these exhaustive allocations. If all instead take the seven-step Shark route, earliest acting seat wins **100%** of this deterministic no-card toy. These outcomes are **policy artifacts** and should NOT be quoted as real win rates or used to ratify compensation.

**Fair-start subset for small games:** If 2P or 4P starts are drawn only among cells 0–3 (12/24 ordered assignments), every entrant has the **same 7-step shortest** and **8-step Shark-free shortest** route length; this removes *that specific* safe-route-length disparity. It does **not** eliminate initiative advantage, asymmetric edges, encounter proximity, or the distinct route options. For seven players this subset is impossible.

## Focused experimental 2P setup candidate: random balanced close pairs

A **candidate**, not an approved rule: to preserve initial cross-lane contact **and** avoid giving only one opponent a seven-step Shark-free lane, randomly choose one of these five unordered pairs of start cells: **(0,1), (1,2), (2,3), (4,5), (5,6)**. Randomly assign the two players to the pair, and independently randomize who takes the first action. Each pair has **exactly two true-edge steps between starting cells** (candidate Big Wave range; not normal adjacent Drop In), and its members share the **same Shark-free shortest route length**. The five pairs comprise all same-risk and ≤2-edge pairs among 0–6, found by exact graph enumeration.

**Advantages under static geometry:** neither player gets the **shorter-safe-path tier** within that match, and two-player starting positions remain within card-interaction range (unlike nearly half of completely random 0–6 pairs). **Limitations:** does not eliminate first-actor win advantage, unequal specific path options or potential early targeted card effects; pair selection introduces a non-uniform physical-position distribution and must be tested as its own setup fixture using the complete 17-type R0 card model. At 4P, the four 0–3 positions are the simplest same-tier *candidate* pool; at 7P, the full mixed pool still requires a separate fairness remedy.

## Why a naive Catan-like reverse start pick is not sufficient

Tested an illustrative **single-position reverse-selection** fixture: last actor picks a free start first, always preferring a Shark-free seven-step starting cell; ties break by cell ID. This is **not Catan's complete two-settlement setup rule**, just a comparable board-game design idea.

- **2P:** acting order starts [5,4]; both have 7-step Shark-free routes, so first actor still wins under the deterministic safe-only toy.
- **4P:** acting order starts [0,6,5,4]; first actor has an 8-step Shark-free route, and the second acts first among the seven-step safe starters.
- **7P:** acting order starts [3,2,1,0,6,5,4]; the fifth actor acts first among three seven-step Shark-free starters.

Thus an uncalibrated reverse choice can **overcompensate** in 4P/7P while doing **nothing** for 2P initiative in the safe-only toy. Do **not** approve this draft choice scheme without full-card seeded comparisons and human feedback.

## Recommendation / next executable gate

1. **Keep random first actor + unique random starting positions as an owner-supported direction to evaluate**, not yet a fixed approved setup protocol.
2. Compare in one **paired, full-effect B60 R0 test**: (A) current fixed first positions and fixed order, (B) random actor with uniform distinct starts 0–6, (C) geometry-stratified symmetric start cells for 2P/4P, and possibly (D) compensated single-start selection only after measuring B/C. Record first-actor and **starting-cell win distributions separately**, falls, card losses, interaction, blocked movement and early exits.
3. Do not introduce snake round turns as the compensation: [Iteration P](R0_ORDER_RESPONSE_STUDY.md) found consecutive attacks with no response window.
4. **Seven-player geometry must receive special attention** because it necessarily uses a mixed start pool of four longer-safe-path and three shorter-safe-path cells. Check fairness and focus-fire under existing cards before suggesting new Shark placement or one-off bonuses.
5. Do not assume a random assignment is equivalent to fair results **inside a single match**. Label outcomes as independent design-model evidence until exact production engine parity and owner-run real playtests.

## Verification / governance

This iteration actually executed the same pure exhaustive adjacency/BFS enumeration directly on the **GitHub-fetched layout**: **42 + 840 + 5,040 = 5,922 ordered setup configurations**, and checked the reported graph distances. The committed Node script reproduces the exact calculation in a checkout; **that Node script was not run in the GitHub checkout in this session**. No app gameplay engine, Jest/build, human match or deployment run. No approved gameplay decision IDs changed. The current visual `main` SK-DEC-019–024 vs experimental gameplay decision ID collision remains a documentation merge blocker.

Issue #11 remains open; PR #12 remains draft. No production gameplay changes, merge or deployment.
