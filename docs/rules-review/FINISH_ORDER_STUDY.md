# Iteration K — exact first-beach versus complete-round finish counterexample

**Date:** 2026-11-23. **Two deterministic board-layout tests executed successfully** (2 players and 4 players), each with exactly source-legal, nonoverlapping moves. [Reproducible source](FINISH_ORDER_GEOMETRY_TEST.js). No stochastic full match, other card actions or app-engine execution.

## Setup

Start surfers at cells 0..(n−1), **2 energy each**, one compulsory **zero-energy-cost ordinary move** per own turn (trial SK-DEC-026), fixed Sharks −2 on entry, immediate **fall stays in the Shark tile** (accepted draft gameplay SK-DEC-019/020/023). At start of next personal turn, stand there at 1 energy and make that turn's normal legal move. Deliberately exclude all card/tactical actions; the one-card fall penalty may discard a card but changes no travel time in this isolated case. Players move along the following four exact legal source-graph paths, using separate lanes, with no overlapping cells:

| Starting seat | Legal path | Shortest move count | Shark fall |
| --- | --- | ---: | --- |
| 0 | `0→7→14→21→28→35→42→49` | 7 | 28 |
| 1 | `1→8→15→22→29→36→43→50` | 7 | 29 |
| 2 | `2→9→16→23→30→37→44→51` | 7 | 30 |
| 3 | `3→10→17→24→31→38→45→52` | 7 | 31 |

Each surfer falls once when crossing the Shark at their fourth move, then stands and completes the fifth movement on time. The simulated energy and next-turn recovery constraints were asserted, as were edge adjacency and no overlapping occupancy.

## Outcome

| Players | First beach arrival rule | Complete round-7 resolution | Shark falls |
| --- | --- | --- | ---: |
| 2 | Earliest actor wins 100% on these identical plans | **Both reach beach in round 7: 2-person finish tie** | 2 |
| 4 | Earliest actor wins 100% on these identical plans | **All four reach beach in round 7: 4-person finish tie** | 4 |

This is a **constructive counterexample**, NOT a claim that actual cards/attack choices will always create a 2-/4-person tie. It verifies why fixing the finish rule alone is not a free balance solution: **continue to round-end** changes a fixed initiative advantage into a **tie-breaking design requirement**. A tiebreak by energy or card inventory may reward power/hand management, but would need explicit owner approval and separate simulations; a dice roll at the end may feel arbitrary. Other mechanisms that produce **real distance differences** (opponent-induced obstacles, positional swap, limited speed) deserve controlled human-play tests.

## Next action

Keep first-beach victory as the **current working assumption**, not yet endorsed as globally fair. Compare (a) first beach, (b) complete round with explicit symmetric tie-breaker fixture, and (c) a consistent positional catch-up response with real human decisions before selecting a final victory rule. Also test 7-player crowding separately—only four beach cells exist, so this construction does **not** assert all seven can occupy distinct beach tiles in one round. The first actor was not assigned a fixed physical person across runs; rotate order for fairness measurement.

**No new approved victory rule, app-engine Jest/build, online multiplayer, merge or deploy.** Draft gameplay decision IDs 019–024 still conflict with accepted visual main IDs.
