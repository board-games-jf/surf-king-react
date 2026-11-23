# Iteration D — new speed card ablation and hand/draw policies

**Date:** 2026-11-23. **Scope:** Independent deterministic experimental model only — **not** SurfKingGame.js, Jest, UI, human tabletop sessions, or official game balance validation. **Sources:** main c6fd08e2da82ca223740e3aa944c47f87aa84f16, gameplay blob 1a6b19eb0adcdf0ac4940e8a74096e8990efc0a4, layout blob de7a795261a4ad2a1ab6e81e8ca8f1189df708f5, [card proposal](DECK_REBALANCE_PROPOSAL.md), [executable simulator](DECK_MODEL_REPRODUCTION.js). All 64-card original and 60-card candidate quantities are directly checked. Four fixed Sharks on 28–31 are not drawn.

**Common trial only:** 2 starting energy; 0-cost mandatory ordinary movement; Shark −2; 1/2/3 same-hex next-own-turn recovery with Fin/Float spending tactic; random eligible hand-card loss per genuine fall, transferred to attacking opponent for player-caused falls otherwise discarded. One optional tactical card or adjacent Drop In followed by required movement, 2-card opening and one after-move draw, cap 5 hand/energy, max 2 dice, highest wins/strict loser −1 energy, ties no damage, first beach cell ends race. **These latter action/draw/combat numbers and all modified card effects are NOT approved.** Two movement policies: direct (every player shortest available), mixed (players seeded across direct/cautious/aggressive). Initiative rotates deterministically with seed independently of start cell; 100 seeds per 2/4/7 players × 2 policies = **600 races per variant**. All results are model estimates sensitive to heuristic choices and time limit (16 rounds).

**Safety fixture differences versus legacy code:** No out-of-range numeric-offset movement or unbounded recursive displacement: Cyclone redirects one adjacent step maximum, Tsunami takes one legal seaward move, no overlapping players, failure is a no-op. Damage/shark counts and transfers respect approved fall rules and avoid double stealing. Other cards are represented in hand, on board, in discard/deck, or active zone; original Stone expires at owner turn +3, original other placement persistent, protected targets ignored. Valid targets/turns resolved by the model; this is not an execution of the legacy exact move contract. The current code has no opponent-card range check for Big Wave/Sunburn/Change and Jumping can remove even a fixed Shark, so iteration A intentionally preserves that breadth; revised B/C constrain them. Original Bottled Water's −1 travel-cost cancellation is inert because this shared study uses trial 0-cost movement. Revised effect-only B experimentally repurposes it as single −1 terrain-damage shield (not approved), then C removes it.

**Invariant checks executed for every race:** exactly the original physical card IDs conserved across deck, discard, hands, active and placed tiles; unique ID per copy; no overlapping surfers after movement; every new fall accounted for by one transfer, discard, or empty-hand event; adjacency verified against source coordinates. **A missing action rule is not implied approved by this simulation.**

## Outcomes

Means per started race, not match-wide probabilities of balanced real players. **First-mover win** is a mean 0–1 rate with turn order rotated; wins array is by **initial cell/seat**, NOT initiative. Opponent card transfers only on true falling damage.

| Variant | Players | Policy | Runs | Finished | Mean rounds | Falls | Card theft | Hazard-fall discards | Hand-cap discards | Drop Ins | Swaps | Tsunami pushes | Surf Current used | First-mover win rate | Winners by starting cell |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| C | 2 | direct | 100 | 100/100 | 6.42 | 1.39 | 0.61 | 0.76 | 0.16 | 0.21 | 0.03 | 0.41 | 0.87 | 0.78 | 54/46 |
| C | 2 | mixed | 100 | 100/100 | 6.77 | 1.30 | 0.72 | 0.51 | 0.40 | 0.85 | 0.03 | 0.53 | 0.82 | 0.64 | 52/48 |
| C | 4 | direct | 100 | 100/100 | 6.25 | 3.35 | 1.64 | 1.50 | 0.32 | 1.24 | 0.10 | 1.44 | 1.65 | 0.45 | 29/16/27/28 |
| C | 4 | mixed | 100 | 100/100 | 6.45 | 2.95 | 1.70 | 1.13 | 0.59 | 2.02 | 0.13 | 1.34 | 1.78 | 0.38 | 29/20/21/30 |
| C | 7 | direct | 100 | 100/100 | 6.05 | 9.83 | 6.44 | 2.92 | 2.11 | 10.08 | 0.44 | 2.36 | 2.79 | 0.19 | 16/8/6/15/22/15/18 |
| C | 7 | mixed | 100 | 100/100 | 6.31 | 9.68 | 7.20 | 2.07 | 2.88 | 10.92 | 0.44 | 2.31 | 2.87 | 0.26 | 14/9/12/11/15/13/26 |
| D1 | 2 | direct | 100 | 100/100 | 7.05 | 1.53 | 0.73 | 0.78 | 0.36 | 0.41 | 0.07 | 0.64 | 0.00 | 0.73 | 61/39 |
| D1 | 2 | mixed | 100 | 100/100 | 7.32 | 1.31 | 0.80 | 0.47 | 0.56 | 0.83 | 0.09 | 0.48 | 0.00 | 0.66 | 52/48 |
| D1 | 4 | direct | 100 | 100/100 | 7.09 | 3.87 | 2.22 | 1.49 | 0.90 | 2.10 | 0.19 | 1.74 | 0.00 | 0.48 | 22/19/23/36 |
| D1 | 4 | mixed | 100 | 100/100 | 7.32 | 3.35 | 2.11 | 1.03 | 1.18 | 2.63 | 0.45 | 1.61 | 0.00 | 0.43 | 21/13/28/38 |
| D1 | 7 | direct | 100 | 100/100 | 7.08 | 11.53 | 8.18 | 2.80 | 4.14 | 12.54 | 0.79 | 3.07 | 0.00 | 0.39 | 14/5/13/16/26/12/14 |
| D1 | 7 | mixed | 100 | 100/100 | 7.12 | 11.30 | 8.64 | 2.13 | 4.83 | 13.51 | 0.70 | 3.26 | 0.00 | 0.23 | 10/11/11/12/24/17/15 |
| D2 | 2 | direct | 100 | 100/100 | 6.43 | 1.39 | 0.61 | 0.76 | 0.00 | 0.20 | 0.04 | 0.42 | 0.87 | 0.77 | 55/45 |
| D2 | 2 | mixed | 100 | 100/100 | 6.77 | 1.29 | 0.70 | 0.52 | 0.02 | 0.81 | 0.03 | 0.52 | 0.82 | 0.64 | 52/48 |
| D2 | 4 | direct | 100 | 100/100 | 6.25 | 3.34 | 1.64 | 1.48 | 0.04 | 1.24 | 0.11 | 1.44 | 1.65 | 0.43 | 27/16/28/29 |
| D2 | 4 | mixed | 100 | 100/100 | 6.44 | 2.97 | 1.69 | 1.13 | 0.05 | 1.98 | 0.14 | 1.32 | 1.78 | 0.37 | 28/20/24/28 |
| D2 | 7 | direct | 100 | 100/100 | 6.23 | 10.12 | 6.63 | 2.99 | 0.54 | 10.29 | 0.53 | 2.69 | 2.72 | 0.23 | 15/12/4/18/19/15/17 |
| D2 | 7 | mixed | 100 | 100/100 | 6.31 | 9.45 | 7.09 | 2.01 | 0.42 | 11.02 | 0.52 | 2.24 | 2.77 | 0.30 | 18/6/10/14/18/14/20 |
| D3 | 2 | direct | 100 | 100/100 | 6.42 | 1.39 | 0.61 | 0.76 | 0.14 | 0.21 | 0.03 | 0.41 | 0.88 | 0.78 | 54/46 |
| D3 | 2 | mixed | 100 | 100/100 | 6.76 | 1.31 | 0.72 | 0.52 | 0.36 | 0.84 | 0.03 | 0.52 | 0.83 | 0.64 | 52/48 |
| D3 | 4 | direct | 100 | 100/100 | 6.24 | 3.32 | 1.63 | 1.49 | 0.32 | 1.20 | 0.10 | 1.43 | 1.65 | 0.44 | 28/17/27/28 |
| D3 | 4 | mixed | 100 | 100/100 | 6.44 | 3.04 | 1.74 | 1.15 | 0.52 | 2.01 | 0.15 | 1.30 | 1.80 | 0.38 | 30/18/22/30 |
| D3 | 7 | direct | 100 | 100/100 | 6.15 | 9.98 | 6.59 | 2.93 | 2.24 | 10.17 | 0.45 | 2.33 | 2.81 | 0.20 | 14/5/7/19/16/15/24 |
| D3 | 7 | mixed | 100 | 100/100 | 6.27 | 9.57 | 7.15 | 2.00 | 2.91 | 10.88 | 0.41 | 2.17 | 2.84 | 0.29 | 16/6/12/14/16/12/24 |

## Card-by-card usage

### C — Revised effects / proposed B60

| Card | Physical copies | Total model uses in 600 races |
| --- | ---: | ---: |
| Energy | 6 | 624 |
| EnergyX2 | 4 | 820 |
| EnergyX3 | 0 | 0 |
| Coconut | 2 | 480 |
| BottledWater | 0 | 0 |
| SwimmingFin | 5 | 421 |
| LifeGuardFloat | 4 | 415 |
| BigWave | 3 | 747 |
| Sunburn | 4 | 1032 |
| Stone | 4 | 708 |
| Storm | 4 | 683 |
| Island | 3 | 472 |
| Cyclone | 3 | 540 |
| Change | 2 | 117 |
| Jumping | 4 | 122 |
| Tsunami | 3 | 577 |
| HangLoose | 3 | 380 |
| Amulet | 2 | 283 |
| SurfCurrent | 4 | 1078 |

### D1 — B60 without Surf Current (60 cards)

| Card | Physical copies | Total model uses in 600 races |
| --- | ---: | ---: |
| Energy | 6 | 763 |
| EnergyX2 | 4 | 943 |
| EnergyX3 | 0 | 0 |
| Coconut | 2 | 542 |
| BottledWater | 0 | 0 |
| SwimmingFin | 5 | 479 |
| LifeGuardFloat | 4 | 500 |
| BigWave | 3 | 849 |
| Sunburn | 4 | 1186 |
| Stone | 4 | 848 |
| Storm | 4 | 859 |
| Island | 3 | 566 |
| Cyclone | 3 | 664 |
| Change | 3 | 229 |
| Jumping | 6 | 274 |
| Tsunami | 3 | 694 |
| HangLoose | 3 | 499 |
| Amulet | 3 | 483 |
| SurfCurrent | 0 | 0 |

### D2 — B60 / do not draw when hand full

| Card | Physical copies | Total model uses in 600 races |
| --- | ---: | ---: |
| Energy | 6 | 639 |
| EnergyX2 | 4 | 829 |
| EnergyX3 | 0 | 0 |
| Coconut | 2 | 469 |
| BottledWater | 0 | 0 |
| SwimmingFin | 5 | 430 |
| LifeGuardFloat | 4 | 402 |
| BigWave | 3 | 734 |
| Sunburn | 4 | 1024 |
| Stone | 4 | 712 |
| Storm | 4 | 697 |
| Island | 3 | 481 |
| Cyclone | 3 | 552 |
| Change | 2 | 137 |
| Jumping | 4 | 130 |
| Tsunami | 3 | 593 |
| HangLoose | 3 | 387 |
| Amulet | 2 | 275 |
| SurfCurrent | 4 | 1061 |

### D3 — B60 / prioritize discarding least useful card

| Card | Physical copies | Total model uses in 600 races |
| --- | ---: | ---: |
| Energy | 6 | 635 |
| EnergyX2 | 4 | 818 |
| EnergyX3 | 0 | 0 |
| Coconut | 2 | 481 |
| BottledWater | 0 | 0 |
| SwimmingFin | 5 | 428 |
| LifeGuardFloat | 4 | 405 |
| BigWave | 3 | 747 |
| Sunburn | 4 | 1050 |
| Stone | 4 | 694 |
| Storm | 4 | 680 |
| Island | 3 | 474 |
| Cyclone | 3 | 533 |
| Change | 2 | 117 |
| Jumping | 4 | 125 |
| Tsunami | 3 | 572 |
| HangLoose | 3 | 385 |
| Amulet | 2 | 271 |
| SurfCurrent | 4 | 1081 |


## Interpretation (NOT a design acceptance)

D1 removes all four Surf Current copies and replaces them with +2 Jumping, +1 Change and +1 Amulet to preserve 60 total. D2 keeps B60 effects/counts, but declines drawing after a maneuver if the hand is already full; attacker transfers still obey cap. D3 keeps B60 and always draws, choosing the least-valued card for overflow (a provisional hand-value heuristic). Compare D1 to C for speed-card contribution, D2/D3 to C for draw/hand-limit sensitivity. This is an ablation and policy test; no card redesign or hand rule is approved.

**Next iteration:** Add targeted assertion tests for each card and adversarial corner cases; rotate different initial seating orders, test alternate initiative/win rules, explicit forced-Shark attribution, Drop In positional alternatives, full-hand reward, and human tabletop play before proposing any final deck.

## Model limitations and validation status

- This is a **bounded source-inspired design model**, not the original engine's code paths. It has no runtime card images/animations, no user decisions, no actual UI, no full boardgame.io phase logic. Mixed agents follow simple heuristics; numbers are not human win rates.
- Source main uses SK-DEC-019–024 for visual decisions, clashing with gameplay draft PR #12; do not merge governance without renumbering gameplay decisions separately. No decision IDs changed by these tests.
- Damage and displacement from immediate card effects, full-hand transfer overflow, hidden information and victory ordering are trial fixtures. A transfer to the defender if the initiating attacker loses a Drop In is likewise provisional.
- Existing app-engine Jest/build were **not run**. Model assertions passed for the run counts shown; no gameplay implementation, merge or deployment.

**Reproduction:** [DECK_MODEL_REPRODUCTION.js](DECK_MODEL_REPRODUCTION.js) contains the full executable model with a deterministic LCG. Construct counts by expanding uncommented `addCards(CardType, count)` calls of the identified `createDeck()` source, pass JSON layout and the stage parameters into `runBatch`. The precise B60 and ablation quantities are in [DECK_REBALANCE_PROPOSAL.md](DECK_REBALANCE_PROPOSAL.md) and iteration D respectively.
