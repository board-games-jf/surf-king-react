# Iteration J — Surf Current as a catch-up mechanic versus unconditional speed

**Date:** 2026-11-23. **Executed 3,600 seeded standalone design-model races** (400 × 2/4/7 players × three speed rules) using real board graph `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`, candidate B60 counts (including four Surf Current cards) from [DECK_REBALANCE_PROPOSAL.md](DECK_REBALANCE_PROPOSAL.md). [Executable model](CATCHUP_CARD_REPRODUCTION.js).

**Goal:** Verify whether the proposed Surf Current actually helps trailers recover the lead, rather than mainly speeding up the first runner. This model **does not** simulate other card effects, player-to-player attacks or human decisions; deck contains all 60 physical cards but only Surf Current and Fin/Float recovery are active. No results apply to online multiplayer, game engine or all-card play.

## Matched variants

Each variant starts with identical seed, all current start cells 0…n−1, two opening cards, one draw after moving if below five cards, recycle discard if deck exhausted, same-cell next-own-turn 1/2/3 rescue, Shark −2 and one random discard on each new hazard fall, mandatory ordinary free travel and no extra normal actions. Max 14 rounds. Different later draws can diverge. Three rules:

- **disabled:** Surf Current exists as inert inventory to isolate no speed without changing card count.
- **any:** holding Surf Current permits replacing usual normal one-edge maneuver with **up to two legal consecutive steps**, consuming one tactical action, including use by leader; no occupied cell jump.
- **behind:** same two steps but **only while the user is strictly farther from beach than the closest other participant at the beginning of their own turn**. First actor in an equal-distance opening does not qualify; trailing second actor may. The gap is based on graph distances, not score. This rule is a **trial fixture only**.

## Results (means per race, 400 per row)

| Players | Speed variant | Finished | Mean rounds | First actor wins | Surf Current uses | Uses while leading/tied | Uses while behind | Catch-ups to equal/ahead distance | Moves from behind to strictly ahead | Finish on speed-card turn | Wins by starting seat |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | disabled | 400/400 | 7.00 | 100.0% | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 200/200 |
| 2 | any | 400/400 | 6.38 | 77.0% | 0.84 | 0.47 | 0.37 | 0.36 | 0.26 | 0.17 | 200/200 |
| 2 | behind | 400/400 | 6.71 | 74.5% | 0.41 | 0.00 | 0.41 | 0.41 | 0.33 | 0.07 | 196/204 |
| 4 | disabled | 400/400 | 7.00 | 100.0% | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 100/100/100/100 |
| 4 | any | 400/400 | 6.00 | 42.5% | 1.63 | 0.46 | 1.17 | 1.12 | 0.78 | 0.25 | 87/100/109/104 |
| 4 | behind | 400/400 | 6.21 | 38.5% | 1.34 | 0.00 | 1.34 | 1.31 | 1.04 | 0.19 | 87/99/110/104 |
| 7 | disabled | 400/400 | 7.00 | 100.0% | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 57/57/58/57/57/57/57 |
| 7 | any | 400/400 | 5.83 | 32.3% | 2.72 | 0.44 | 2.28 | 1.73 | 1.07 | 0.23 | 51/55/47/65/70/58/54 |
| 7 | behind | 400/400 | 6.03 | 27.0% | 2.47 | 0.00 | 2.47 | 1.97 | 1.34 | 0.17 | 52/56/43/66/77/54/52 |

## Interpretation

- Any movement bonus has potential to benefit a front-runner. Strictly-behind eligibility avoids enabling a **leading** surfer to activate Surf Current, but may allow a second player who is behind only because the first player already moved in the same round to sprint immediately. This is not the same as fair assistance to a player who has **actually fallen behind in prior rounds**.
- The **race-relative gap must be measured carefully**: comparing who is behind at the start of each personal turn is influenced by the order of turns. A more robust proposed alternative to test is **compare each player's distance at the same completed round boundary** or require trailing by at least two edge steps, rather than one in the current turn. Do not approve "behind" restriction without that test.
- Surf Current is **not directly interactive** with another human; it only alters arrival order. Combine this evidence with [Iteration I](CROSSLANE_INTERACTION_STUDY.md), in which cross-lane attack/Stone created choices but barely changed first-actor winning rates in 2-player races.
- Model speed use is deterministic when eligible/held, without human hand value choices. No effect on direct obstacle removal or card interaction is simulated. Card physical-identity conservation, unique player cell occupancy and fall accounting were asserted for each run.

**Status:** Only an isolated card-mechanic experiment. Neither B60, Surf Current, behind-only eligibility, two-opening cards nor first-beach win tie rules is finally approved or implemented. No app Jest/build, UI testing, human gameplay, merge or deployment. Prioritize a short human design-session protocol and explicit two-player initiative/leader catch-up test before rule ratification.
