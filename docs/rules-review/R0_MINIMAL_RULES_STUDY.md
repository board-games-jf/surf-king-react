# Iteration Z — simplify Surf King instead of adding more setup exceptions

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** experimental minimal-rules R1 *candidate only*, not owner-approved gameplay. [One-page quick-start](PLAYTEST_MINIMAL_R1_RULES.md) · [reproducible exact-53-cell model A/B](R0_MINIMAL_RULES_AB.js) · [pilot B60 card text](PLAYTEST_R0_CARDS.md).

## Goal and decision principle

Owner feedback: **no rule-heavy, complicated game**; prioritize a fast, intuitive, interactive surf race that players can begin after a brief explanation. Do not keep stacking weighted starts, late-slot cards, bonuses for cell 1/2, a special first-turn attack exception plus optional Drop In exchange unless the actual *experience* warrants each rule.

**Candidate:** no player-count-specific setup compensation at all. Shuffle unique start cells 0–6, 2 starting energy/2 hand cards, no bonuses. One optional card/Drop In per turn; one required free edge-step if possible; draw one card after an upright maneuver; one random card lost on falling (to attacker for opponent-caused fall, else discard); recover on next turn for free, or use Fin/Float. First round: defensive/preparatory play only (no attacking opponents). **Move the first-player token to the next surfer each round**, while retaining the same cyclic direction. At beach, complete that round and award victory among same-round beach entrants to whoever has the most energy; randomly resolve energy ties. **No standing Drop In position exchange.** Keep all four Sharks in cells 28–31.

This is short enough to fit in a quick-start, but note that the experimental **B60 still has 17 types**, some with complicated targeting/placement. Its type count is an **outstanding simplification decision**, not a proven five-minute learning time.

## A/B comparisons

**Seeded full-game model:** exact main 53-cell geometry, 60-card/17-effect B60 model, all four central Sharks, two scripted play policies (balanced and aggressive), random unique starts, randomized *initial* acting slot via seed shift. All games end when a beach cell is entered, with end-of-round handling preserved. We compare:

| Key | Position/setup | First-round attacks | Round order | Drop In exchange | Victory |
| --- | --- | --- | --- | --- | --- |
| `coreFirst` | Random, no bonus | On | Fixed | Off | First entrant |
| `coreRound` | Random, no bonus | On | Fixed | Off | Round-end energy |
| `coreRoundLottery` | Random, no bonus | On | Fixed | Off | Random among same-round entrants |
| `coreRoundProtected` | Random, no bonus | **Off** | Fixed | Off | Round-end energy |
| `coreRoundLastCard` | Random, last actor +1 opening card | On | Fixed | Off | Round-end energy |
| `coreRoundLastProtected` | Random, last actor +1 card | **Off** | Fixed | Off | Round-end energy |
| `coreRoundSwap` | Random, no bonus | On | Fixed | On | Round-end energy |
| `coreSnake` / `coreSnakeProtected` | Random, no bonus | On / Off | Reverse direction each round | Off | Round-end energy |
| `coreRotate` / **`coreRotateProtected`** | Random, no bonus | On / **Off** | **Shift first actor one seat each round** | Off | Round-end energy |
| `referenceComplex` | 2× weighted lottery, last actor +1 card, cells1/2 +1 card | Off | Fixed | On | Round-end energy |

For the rotation alternative, `A,B,C,D → B,C,D,A → C,D,A,B`: all actors retain access to every starting cell. Unlike reversing all players, it creates **no back-to-back turns at the round boundary for 3+ players**. **At 2P rotation does create consecutive turns**, an explicit owner human-test question.

### Model execution evidence

Every variant shares its seed with comparisons **within** its population/policy/batch. To manage JS execution limits, actual code was executed in batches with the GitHub-fetched R0 JS model and the exact **main** `src/map/layout/board-layout.json`. All random outcomes are simulated and should not be confused with real player choices.

| Batch | N players | Seed interval | Policies × variants | Full games | Integrity checks |
| --- | --- | --- | --- | ---: | ---: |
| Minimal main screen | 7 | 93,001–95,000 | 2 × 8 | 32,000 | 1,621,664 |
| Minimal main screen | 4 | 95,001–98,000 | 2 × 8 | 48,000 | 1,568,215 |
| Two-player comparison | 2 | 98,001–100,500 | 2 × 8 | 40,000 | 821,809 |
| Snake-order comparison | 7 | 101,001–104,000 | 2 × 7 | 42,000 | 2,129,096 |
| Snake-order comparison | 4 | 105,001–108,500 | 2 × 5 | 35,000 | 1,142,700 |
| Rotate-order comparison | 7 | 113,001–116,000 | 2 × 5 | 30,000 | 1,527,704 |
| Rotate-order comparison | 4 | 119,001–122,500 | 2 × 5 | 35,000 | 1,145,825 |
| Missing-population screen | 3,5,6 | 124,001–125,500 | 3 × 2 × 4 | 36,000 | 1,325,175 |
| **Independent selected-candidate confirmation** | **7** | **127,001–132,000** | 2 × 3 | **30,000** | **1,516,840** |
| **Independent selected-candidate confirmation** | **4** | **133,001–138,000** | 2 × 3 | **30,000** | **978,305** |
| **Independent selected-candidate confirmation** | **2** | **139,001–143,500** | 2 × 4 | **36,000** | **740,058** |
| **Total** | 2–7 | Nonoverlapping batch seed ranges | Mixed | **394,000** | **14,517,391** |

**All 394,000 model games finished by round 16** and **14,517,391 per-turn card-conservation/unique-occupancy/energy/fall-accounting assertions passed**; baseline model was compared with the newly exposed first-turn/swap toggles on **1,200 games** (every field identical, 42,615 checks); after adding rotating first-player token, both historical fixed/snake orders also exactly matched across **1,200 fresh games** (43,081 checks), plus 12 rotate-mode completion smoke checks. These checks were executed using fetched JS source and an emulated Node `fs`/assert harness inside V8; **the Node CLI has not been separately invoked in a cloned checkout, and no real engine Jest/UI/build or human tabletop game was executed.**

## Critical learning: a simple first-beach victory is too biased

**2,000-seed 7P balanced**: first beach entrant with fixed turn order, no setup bonuses: first actor wins **28.80%**, last actor **6.00%**; aggressive **26.65% / 6.55%**. **3,000-seed 4P balanced**: first **45.13%**, last **13.67%**. **2,500-seed 2P balanced**: first **70.00%**, last **30.00%**. This is a *systemic* acting-order defect in the test model. **Retain end-of-round victory** even though it takes one extra sentence: the model does not need a longer game (roughly the same ~6-round finish).

## Selected-candidate confirmation — independent seeds

The *minimal R1 candidate* is `coreRotateProtected`: **random starts, fixed B60 deck, first round no attacks, rotating starting-player token, one card action, free movement, no setup bonuses, no Drop In swap, round-end highest-energy finisher**. The comparison uses 5,000 matched seeds per policy and variant for 4P/7P, 4,500 for 2P.

| Player count / scripted policy | Minimal rotating start: win % **by initial actor slot** | Old fixed-turn, last-card-only baseline: win % by initial actor slot |
| --- | --- | --- |
| **2P balanced** | **49.93 / 50.07** | 50.71 / 49.29 |
| 2P aggressive | **50.64 / 49.36** | 48.47 / 51.53 |
| **4P balanced** | **24.28 / 25.34 / 26.54 / 23.84** | 29.40 / 25.30 / 21.34 / 23.96 |
| 4P aggressive | **23.56 / 27.18 / 26.04 / 23.22** | 29.04 / 25.28 / 22.26 / 23.42 |
| **7P balanced** | **13.92 / 14.48 / 14.52 / 14.10 / 15.06 / 13.72 / 14.20** | 18.54 / 16.28 / 15.56 / 14.00 / 13.26 / 10.10 / 12.26 |
| 7P aggressive | **15.86 / 15.60 / 14.70 / 13.48 / 14.02 / 13.44 / 12.90** | 17.88 / 16.80 / 15.04 / 14.32 / 12.74 / 11.00 / 12.22 |

The `referenceComplex` comparator (weighted 2×, last-card bonus, inner-cell bonus, fixed order, Drop In swap) performed **less evenly by actor slot** in the fresh 7P batch: balanced 17.28% first / 13.32% last and aggressive 17.70% first / 11.84% last; also far more setup exceptions. **Simpler is better on the primary actor-order fairness criterion here.**

### How quickly / how much action is preserved?

| N and scripted policy | Mean full rounds | Mean opponent-targeting actions / game | Mean falls | Mean recovery turns | Same-round multiple beach entries |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2P balanced | **6.538** | **1.456** | **1.107** | **1.083** | 33.58% |
| 4P balanced | **6.347** | **6.064** | **3.537** | **3.248** | 38.20% |
| 7P balanced | **6.160** | **14.454** | **7.623** | **6.619** | 38.46% |
| 7P aggressive | **6.268** | **21.054** | **11.287** | **9.828** | 37.60% |

With the first-round attack restriction, **zero modeled players fell before taking their first personal turn**, versus ~0.30 pre-first-turn falls *per 7P match* when round-one attacks were unrestricted. It also removes some early attack interactions: 7P balanced rotate no-first-turn-restriction ~15.708 opponent actions, protected ~14.509 (3k exploratory seeds), a reasonable model tradeoff for letting everyone get started. All **17 physical card types were actually used** across the 7P 5k candidate comparisons; this is **not** evidence all 17 are needed, intuitively learnable or balanced.

## What this does *not* prove

- **Worst actor×starting-cell conditions remain weak:** 7P holdout with R1 rotating/first-round-protected: worst observed conditional initial actor×cell win **5.48%** (both policies), versus nominal 14.29% per seat. With 4P R1: worst about **15–16%** versus nominal 25%. For 2P: worst ~**45%**. Thus **no guarantee** that a late player on a risky start has a fair *conditional* win chance, even if marginal seat fairness is excellent. These observed extremes are noisy conditional estimates and should not be used to design an endless exception stack. Explicit user preference: prefer replayability and simplicity to mathematical perfection. Escalate only if owner human sessions identify consistent frustration.
- A rotating first-player token **changes acting order each round**; first turn each round may no longer be the same person. **2P** creates back-to-back turns across some round boundaries. Check whether actual people like this. It is a **proposed** rule rather than ratified.
- Model **round count is not minutes**; AI behavior is scripted, not human experimentation or measured enjoyment. A five-minute teach is a *target*, not verified.
- The B60 deck still has **17 card types** and some conditional effects (Drop In highest die, Cyclone redirect, card-forced displacement). Their **text complexity** and count must be addressed in the next small **card simplification** pass; a one-page core rulebook does not imply all card interactions are self-evident.
- No gameplay changes in production. The draft PR's historical `docs/HANDOFF.md` and SK-DEC-019–024 decision ID collisions with accepted main visual IDs require reconciliation before any merge; do not copy stale docs into main.

## Recommended next gate (small, bounded)

1. **Use the new one-page R1 quick-start as a candidate** for owner's manual tabletop trials with 2, 4 and 7 players, and record game minutes, turn rotation feel, whether early attacks are missed, unclear card text, whether anyone felt defeated at setup.
2. **One limited card-language prune**, not another large tournament of setup exceptions: identify low-clarity 17-type card texts, prefer combining/removing similar effects and preserving the fall/steal/rescue/attacking core. **No deck changes approved without explicit owner review.**
3. If playtests expose a real issue, fix only that issue; otherwise **freeze the R1 core**, produce accepted rules/criteria and then open a separately authorized production implementation issue. Do not merge/deploy PR #12 as-is.

Owner conducts manual games; assistant can continue reproducible simulations and doc/test validation. **No need to chase 0.00-point fairness.**
