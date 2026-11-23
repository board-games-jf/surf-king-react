# Iteration C — proposed B60 composition vs revised-effect 64

**Date:** 2026-11-23. **Scope:** Independent deterministic experimental model only — **not** SurfKingGame.js, Jest, UI, human tabletop sessions, or official game balance validation. **Sources:** main c6fd08e2da82ca223740e3aa944c47f87aa84f16, gameplay blob 1a6b19eb0adcdf0ac4940e8a74096e8990efc0a4, layout blob de7a795261a4ad2a1ab6e81e8ca8f1189df708f5, [card proposal](DECK_REBALANCE_PROPOSAL.md), [executable simulator](DECK_MODEL_REPRODUCTION.js). All 64-card original and 60-card candidate quantities are directly checked. Four fixed Sharks on 28–31 are not drawn.

**Common trial only:** 2 starting energy; 0-cost mandatory ordinary movement; Shark −2; 1/2/3 same-hex next-own-turn recovery with Fin/Float spending tactic; random eligible hand-card loss per genuine fall, transferred to attacking opponent for player-caused falls otherwise discarded. One optional tactical card or adjacent Drop In followed by required movement, 2-card opening and one after-move draw, cap 5 hand/energy, max 2 dice, highest wins/strict loser −1 energy, ties no damage, first beach cell ends race. **These latter action/draw/combat numbers and all modified card effects are NOT approved.** Two movement policies: direct (every player shortest available), mixed (players seeded across direct/cautious/aggressive). Initiative rotates deterministically with seed independently of start cell; 100 seeds per 2/4/7 players × 2 policies = **600 races per variant**. All results are model estimates sensitive to heuristic choices and time limit (16 rounds).

**Safety fixture differences versus legacy code:** No out-of-range numeric-offset movement or unbounded recursive displacement: Cyclone redirects one adjacent step maximum, Tsunami takes one legal seaward move, no overlapping players, failure is a no-op. Damage/shark counts and transfers respect approved fall rules and avoid double stealing. Other cards are represented in hand, on board, in discard/deck, or active zone; original Stone expires at owner turn +3, original other placement persistent, protected targets ignored. Valid targets/turns resolved by the model; this is not an execution of the legacy exact move contract. The current code has no opponent-card range check for Big Wave/Sunburn/Change and Jumping can remove even a fixed Shark, so iteration A intentionally preserves that breadth; revised B/C constrain them. Original Bottled Water's −1 travel-cost cancellation is inert because this shared study uses trial 0-cost movement. Revised effect-only B experimentally repurposes it as single −1 terrain-damage shield (not approved), then C removes it.

**Invariant checks executed for every race:** exactly the original physical card IDs conserved across deck, discard, hands, active and placed tiles; unique ID per copy; no overlapping surfers after movement; every new fall accounted for by one transfer, discard, or empty-hand event; adjacency verified against source coordinates. **A missing action rule is not implied approved by this simulation.**

## Outcomes

Means per started race, not match-wide probabilities of balanced real players. **First-mover win** is a mean 0–1 rate with turn order rotated; wins array is by **initial cell/seat**, NOT initiative. Opponent card transfers only on true falling damage.

| Variant | Players | Policy | Runs | Finished | Mean rounds | Falls | Card theft | Hazard-fall discards | Hand-cap discards | Drop Ins | Swaps | Tsunami pushes | Surf Current used | First-mover win rate | Winners by starting cell |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| B | 2 | direct | 100 | 100/100 | 7.08 | 1.14 | 0.65 | 0.48 | 0.33 | 0.45 | 0.08 | 0.63 | 0.00 | 0.76 | 48/52 |
| B | 2 | mixed | 100 | 100/100 | 7.34 | 1.05 | 0.64 | 0.36 | 0.57 | 0.68 | 0.08 | 0.61 | 0.00 | 0.76 | 54/46 |
| B | 4 | direct | 100 | 100/100 | 7.12 | 3.37 | 2.09 | 1.14 | 0.86 | 2.13 | 0.15 | 2.26 | 0.00 | 0.50 | 25/17/25/33 |
| B | 4 | mixed | 100 | 100/100 | 7.37 | 3.02 | 2.19 | 0.71 | 1.61 | 3.51 | 0.24 | 2.46 | 0.00 | 0.44 | 24/12/27/37 |
| B | 7 | direct | 100 | 100/100 | 7.15 | 10.63 | 7.75 | 2.36 | 4.79 | 13.29 | 0.56 | 4.27 | 0.00 | 0.26 | 13/9/12/13/10/21/22 |
| B | 7 | mixed | 100 | 100/100 | 7.29 | 10.22 | 7.90 | 1.69 | 5.22 | 13.78 | 0.54 | 4.85 | 0.00 | 0.31 | 11/11/8/17/21/19/13 |
| C | 2 | direct | 100 | 100/100 | 6.42 | 1.39 | 0.61 | 0.76 | 0.16 | 0.21 | 0.03 | 0.41 | 0.87 | 0.78 | 54/46 |
| C | 2 | mixed | 100 | 100/100 | 6.77 | 1.30 | 0.72 | 0.51 | 0.40 | 0.85 | 0.03 | 0.53 | 0.82 | 0.64 | 52/48 |
| C | 4 | direct | 100 | 100/100 | 6.25 | 3.35 | 1.64 | 1.50 | 0.32 | 1.24 | 0.10 | 1.44 | 1.65 | 0.45 | 29/16/27/28 |
| C | 4 | mixed | 100 | 100/100 | 6.45 | 2.95 | 1.70 | 1.13 | 0.59 | 2.02 | 0.13 | 1.34 | 1.78 | 0.38 | 29/20/21/30 |
| C | 7 | direct | 100 | 100/100 | 6.05 | 9.83 | 6.44 | 2.92 | 2.11 | 10.08 | 0.44 | 2.36 | 2.79 | 0.19 | 16/8/6/15/22/15/18 |
| C | 7 | mixed | 100 | 100/100 | 6.31 | 9.68 | 7.20 | 2.07 | 2.88 | 10.92 | 0.44 | 2.31 | 2.87 | 0.26 | 14/9/12/11/15/13/26 |

## Card-by-card usage

### B — Revised effects / original 64 counts

| Card | Physical copies | Total model uses in 600 races |
| --- | ---: | ---: |
| Cyclone | 4 | 760 |
| Island | 4 | 606 |
| Stone | 4 | 769 |
| Storm | 4 | 785 |
| BigWave | 4 | 1023 |
| BottledWater | 4 | 196 |
| Coconut | 4 | 958 |
| Change | 2 | 165 |
| Energy | 8 | 753 |
| EnergyX2 | 4 | 814 |
| EnergyX3 | 2 | 453 |
| HangLoose | 1 | 142 |
| Jumping | 2 | 100 |
| LifeGuardFloat | 4 | 386 |
| SwimmingFin | 4 | 361 |
| Sunburn | 4 | 1077 |
| Tsunami | 4 | 899 |
| Amulet | 1 | 151 |

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


## Interpretation (NOT a design acceptance)

Revised-effect A/B fixtures are retained for shared card types. B60 removes four Bottled Water and two Energy x3, cuts Energy/Coconut, adds one Fin, additional Hang Loose/Amulet/Jumping, and introduces four Surf Current cards. Therefore C versus B combines card-count and new-card changes; it is NOT a pure frequency causal estimate. Its independent ablation follows in D.

**Next iteration:** Ablate Surf Current with an exactly 60-card comparator, and compare random hand overflow to skip-full-draw and choose-lowest-overflow policies.

## Model limitations and validation status

- This is a **bounded source-inspired design model**, not the original engine's code paths. It has no runtime card images/animations, no user decisions, no actual UI, no full boardgame.io phase logic. Mixed agents follow simple heuristics; numbers are not human win rates.
- Source main uses SK-DEC-019–024 for visual decisions, clashing with gameplay draft PR #12; do not merge governance without renumbering gameplay decisions separately. No decision IDs changed by these tests.
- Damage and displacement from immediate card effects, full-hand transfer overflow, hidden information and victory ordering are trial fixtures. A transfer to the defender if the initiating attacker loses a Drop In is likewise provisional.
- Existing app-engine Jest/build were **not run**. Model assertions passed for the run counts shown; no gameplay implementation, merge or deployment.

**Reproduction:** [DECK_MODEL_REPRODUCTION.js](DECK_MODEL_REPRODUCTION.js) contains the full executable model with a deterministic LCG. Construct counts by expanding uncommented `addCards(CardType, count)` calls of the identified `createDeck()` source, pass JSON layout and the stage parameters into `runBatch`. The precise B60 and ablation quantities are in [DECK_REBALANCE_PROPOSAL.md](DECK_REBALANCE_PROPOSAL.md) and iteration D respectively.
