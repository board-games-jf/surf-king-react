# Iteration B — changed effects only, unchanged 64-card counts

**Date:** 2026-11-23. **Scope:** Independent deterministic experimental model only — **not** SurfKingGame.js, Jest, UI, human tabletop sessions, or official game balance validation. **Sources:** main c6fd08e2da82ca223740e3aa944c47f87aa84f16, gameplay blob 1a6b19eb0adcdf0ac4940e8a74096e8990efc0a4, layout blob de7a795261a4ad2a1ab6e81e8ca8f1189df708f5, [card proposal](DECK_REBALANCE_PROPOSAL.md), [executable simulator](DECK_MODEL_REPRODUCTION.js). All 64-card original and 60-card candidate quantities are directly checked. Four fixed Sharks on 28–31 are not drawn.

**Common trial only:** 2 starting energy; 0-cost mandatory ordinary movement; Shark −2; 1/2/3 same-hex next-own-turn recovery with Fin/Float spending tactic; random eligible hand-card loss per genuine fall, transferred to attacking opponent for player-caused falls otherwise discarded. One optional tactical card or adjacent Drop In followed by required movement, 2-card opening and one after-move draw, cap 5 hand/energy, max 2 dice, highest wins/strict loser −1 energy, ties no damage, first beach cell ends race. **These latter action/draw/combat numbers and all modified card effects are NOT approved.** Two movement policies: direct (every player shortest available), mixed (players seeded across direct/cautious/aggressive). Initiative rotates deterministically with seed independently of start cell; 100 seeds per 2/4/7 players × 2 policies = **600 races per variant**. All results are model estimates sensitive to heuristic choices and time limit (16 rounds).

**Safety fixture differences versus legacy code:** No out-of-range numeric-offset movement or unbounded recursive displacement: Cyclone redirects one adjacent step maximum, Tsunami takes one legal seaward move, no overlapping players, failure is a no-op. Damage/shark counts and transfers respect approved fall rules and avoid double stealing. Other cards are represented in hand, on board, in discard/deck, or active zone; original Stone expires at owner turn +3, original other placement persistent, protected targets ignored. Valid targets/turns resolved by the model; this is not an execution of the legacy exact move contract. The current code has no opponent-card range check for Big Wave/Sunburn/Change and Jumping can remove even a fixed Shark, so iteration A intentionally preserves that breadth; revised B/C constrain them. Original Bottled Water's −1 travel-cost cancellation is inert because this shared study uses trial 0-cost movement. Revised effect-only B experimentally repurposes it as single −1 terrain-damage shield (not approved), then C removes it.

**Invariant checks executed for every race:** exactly the original physical card IDs conserved across deck, discard, hands, active and placed tiles; unique ID per copy; no overlapping surfers after movement; every new fall accounted for by one transfer, discard, or empty-hand event; adjacency verified against source coordinates. **A missing action rule is not implied approved by this simulation.**

## Outcomes

Means per started race, not match-wide probabilities of balanced real players. **First-mover win** is a mean 0–1 rate with turn order rotated; wins array is by **initial cell/seat**, NOT initiative. Opponent card transfers only on true falling damage.

| Variant | Players | Policy | Runs | Finished | Mean rounds | Falls | Card theft | Hazard-fall discards | Hand-cap discards | Drop Ins | Swaps | Tsunami pushes | Surf Current used | First-mover win rate | Winners by starting cell |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| A | 2 | direct | 100 | 100/100 | 7.25 | 1.30 | 0.75 | 0.55 | 0.39 | 0.95 | 0.13 | 0.76 | 0.00 | 0.59 | 55/45 |
| A | 2 | mixed | 100 | 100/100 | 7.60 | 1.32 | 0.79 | 0.45 | 0.62 | 1.14 | 0.13 | 0.85 | 0.00 | 0.68 | 60/40 |
| A | 4 | direct | 100 | 100/100 | 7.01 | 4.36 | 3.01 | 1.15 | 1.19 | 2.86 | 0.34 | 2.21 | 0.00 | 0.34 | 26/20/30/24 |
| A | 4 | mixed | 100 | 100/100 | 7.00 | 3.61 | 2.69 | 0.74 | 1.53 | 3.27 | 0.48 | 2.32 | 0.00 | 0.20 | 24/20/32/24 |
| A | 7 | direct | 100 | 100/100 | 6.92 | 10.52 | 7.72 | 2.39 | 4.64 | 13.10 | 0.72 | 4.32 | 0.00 | 0.14 | 17/10/13/8/20/18/14 |
| A | 7 | mixed | 100 | 100/100 | 7.03 | 10.45 | 8.13 | 1.85 | 5.00 | 13.44 | 0.92 | 4.16 | 0.00 | 0.20 | 20/19/8/13/13/15/12 |
| B | 2 | direct | 100 | 100/100 | 7.08 | 1.14 | 0.65 | 0.48 | 0.33 | 0.45 | 0.08 | 0.63 | 0.00 | 0.76 | 48/52 |
| B | 2 | mixed | 100 | 100/100 | 7.34 | 1.05 | 0.64 | 0.36 | 0.57 | 0.68 | 0.08 | 0.61 | 0.00 | 0.76 | 54/46 |
| B | 4 | direct | 100 | 100/100 | 7.12 | 3.37 | 2.09 | 1.14 | 0.86 | 2.13 | 0.15 | 2.26 | 0.00 | 0.50 | 25/17/25/33 |
| B | 4 | mixed | 100 | 100/100 | 7.37 | 3.02 | 2.19 | 0.71 | 1.61 | 3.51 | 0.24 | 2.46 | 0.00 | 0.44 | 24/12/27/37 |
| B | 7 | direct | 100 | 100/100 | 7.15 | 10.63 | 7.75 | 2.36 | 4.79 | 13.29 | 0.56 | 4.27 | 0.00 | 0.26 | 13/9/12/13/10/21/22 |
| B | 7 | mixed | 100 | 100/100 | 7.29 | 10.22 | 7.90 | 1.69 | 5.22 | 13.78 | 0.54 | 4.85 | 0.00 | 0.31 | 11/11/8/17/21/19/13 |

## Card-by-card usage

### A — Legacy 64 cards / source-inspired effects

| Card | Physical copies | Total model uses in 600 races |
| --- | ---: | ---: |
| Cyclone | 4 | 760 |
| Island | 4 | 573 |
| Stone | 4 | 773 |
| Storm | 4 | 768 |
| BigWave | 4 | 1109 |
| BottledWater | 4 | 0 |
| Coconut | 4 | 898 |
| Change | 2 | 272 |
| Energy | 8 | 716 |
| EnergyX2 | 4 | 744 |
| EnergyX3 | 2 | 424 |
| HangLoose | 1 | 128 |
| Jumping | 2 | 220 |
| LifeGuardFloat | 4 | 418 |
| SwimmingFin | 4 | 364 |
| Sunburn | 4 | 1106 |
| Tsunami | 4 | 934 |
| Amulet | 1 | 133 |

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


## Interpretation (NOT a design acceptance)

Same 64 card copies and trial rules as A; only card-effect fixtures change. New ranges (Big Wave ≤2, Sunburn ≤3, Change ≤2), Change consuming normal movement, Island one-shot, Jumping not removing permanent Sharks, protection and finite relocation should be interpreted separately from later quantity changes. Bottled Water temporarily gains a one-use terrain shield effect to test an alternate identity; this is not approval. Consult per-card usage and 2/4/7 race differences to identify dead/overpowered effects.

**Next iteration:** Change quantities according to the already documented B60 proposal (including new Surf Current), without silently treating effect adjustments as settled.

## Model limitations and validation status

- This is a **bounded source-inspired design model**, not the original engine's code paths. It has no runtime card images/animations, no user decisions, no actual UI, no full boardgame.io phase logic. Mixed agents follow simple heuristics; numbers are not human win rates.
- Source main uses SK-DEC-019–024 for visual decisions, clashing with gameplay draft PR #12; do not merge governance without renumbering gameplay decisions separately. No decision IDs changed by these tests.
- Damage and displacement from immediate card effects, full-hand transfer overflow, hidden information and victory ordering are trial fixtures. A transfer to the defender if the initiating attacker loses a Drop In is likewise provisional.
- Existing app-engine Jest/build were **not run**. Model assertions passed for the run counts shown; no gameplay implementation, merge or deployment.

**Reproduction:** [DECK_MODEL_REPRODUCTION.js](DECK_MODEL_REPRODUCTION.js) contains the full executable model with a deterministic LCG. Construct counts by expanding uncommented `addCards(CardType, count)` calls of the identified `createDeck()` source, pass JSON layout and the stage parameters into `runBatch`. The precise B60 and ablation quantities are in [DECK_REBALANCE_PROPOSAL.md](DECK_REBALANCE_PROPOSAL.md) and iteration D respectively.
