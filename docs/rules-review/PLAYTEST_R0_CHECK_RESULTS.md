# Iteration L — unified R0 tabletop kit and operational smoke checks

**Date:** 2026-11-23. **Owner clarification:** The assistant's **simulations and mechanical validations** are useful; the owner **will personally run human/manual matches**. This is a handoff of the human-testing activity, **not a claim that any human game has happened**. We must not substitute scripted agents for human enjoyment measurements.

## Deliverables committed to draft PR #12

- [R0 rules](PLAYTEST_R0_RULES.md) — **one complete and coherent experimental ruleset** for 2/4/7 people, with explicit first-turn preparation, forced moves, Shark and non-Shark fall recovery, card transfer/hand overflow, adjacent Drop In with optional standing swap, terrain, speed and observational beach finishing. **Not ratified final rules**.
- [R0 60-card reference](PLAYTEST_R0_CARDS.md) — exact **60 physical copies across 17 types**, all 17 effects described, ranges, placement, active defense and physical discard/board zones. Original 4 fixed Sharks are not drawn.
- [Owner's blank manual scorecard](PLAYTEST_R0_SCORECARD.md) — one sheet per real match with clock time, round, position, opponent-facing actions, fall-card transfer, co-finishers and 5 anonymous enjoyment/agency scores.
- [Executable smoke checks](PLAYTEST_R0_CHECKS.js) — a self-contained JavaScript function reading the actual 53-cell board layout JSON. No changes to the production game engine or tests.

## Executed validation

**42 operational test cases were actually executed in the independent JavaScript fixture: 42 PASS / 0 FAIL.** The source graph is main `c6fd08e2da82ca223740e3aa944c47f87aa84f16`, layout blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`. Checks include:

| Scope | Observed model checks |
| --- | --- |
| Inventory | Candidate B60 sums to exactly **60**, contains **17 types**, no obsolete Bottled Water or Energy x3. |
| Geometry | 53 cells; symmetric true-edge adjacency; valid seven-edge Shark routes for starts 0–3; 0/1 start distance 2; four distinct beach endpoints. |
| Movement and energy | Safe move costs E0; entry 21→28 causes E2→E0, fall without displacement, one hazard discard; standing on 28 next own turn restores E1 (Fin E2/Float E3) without extra Shark damage; move 28→35 legal. |
| Opening | First-personal-turn direct damage and forced-displacement cards/Drop In are disabled in the test fixture, while preparation, energy and defensive cards are permitted. These are **trial rules**. |
| Interpersonal card/board effects | Range-2 Big Wave reaches lane 0→1 and transfers one card on a true knockout; Amulet protects; Stone14→22 blocks move from 15, and adjacent Jumping removes it; invalid Stone placement and second active Stone denied; Storm entry −1, Island first entry +2 and removal. |
| Confrontation | Normal Drop In requires adjacency; winning standing swap can replace a maneuver; knocked-down defender still occupies hex and cannot swap; ties have no effect; attacker who loses and falls transfers to the defender under a **trial-only** convention. |
| Speed, congestion and hands | Surf Current two legal consecutive steps, no occupied-cell jump, stops on Shark fall; forced Shark entry when 21 is blocked on 14/18/25; complete normal blockage without overlap; full receiving hand of six requires a **pilot-choice discard back to five**; no draw on fall, blocked turn or full hand. |
| Completion | Four disjoint seven-move routes can reach all four beach cells during the same round; first arrival and co-finishers must be recorded separately. |

**These are independent source-grounded micro-fixtures, NOT complete 2/4/7-player game matches.** They do not run original `SurfKingGame.js`, automated Jest/build or a browser. Earlier [E card boundary](CARD_BOUNDARY_VALIDATION.md), [F interpersonal](PLAYER_INTERACTION_REVIEW.md) and seeded [A–K experiments](INDEX.md) offer additional design evidence, but none establishes social fun. The R0 final playtest package has **not been manually tested by people** as of creation.

## Remaining blockers — record, do not silently approve

1. **Game attractiveness:** Real duration, accessible counterplay, clarity and enjoyment need the owner's **human 2/4/7-player scores**. Zero human matches have been reported or invented.
2. **Fairness:** Even with richer actions, early first-actor dominance was often observed in restricted two-player models. R0 first personal turn is preparation-only; the end-of-round observational tail is **not a final cure** for initiative.
3. **Deck design:** B60, Surf Current, obstacle durations, Tsunami row selection and targeting, initial two-card draw and current hand-cap policy are all **unapproved numerical/effect fixtures**. Do not let this handbook silently ratify them.
4. **Mechanics not exhaustively tested in R0:** R0's exact Tsunami multiple-target order, random Cyclone branch distribution, full seven-player congestion, every card interaction simultaneously, online multiplayer, skillful humans, attack targeting politics and real human turn times are not covered by the 42 smoke checks.
5. **Decision ID collisions:** Draft gameplay SK-DEC-019–024 conflict with unrelated Accepted visual decisions in `main`; reconcile IDs without overwriting approved visual choices before any documentation integration.
6. **App discrepancy:** Main still starts at energy 4 and charges 1 on normal movement. No gameplay engine changes are approved merely by preparing R0.

## Responsibility and next action

**Assistant:** Continue reproducible model tests, log results in GitHub (linked English report + Issue #11 comment for each iteration), analyze owner-provided real observations, propose only one change at a time. No background/asynchronous work promised.

**Owner:** Personally run R0 tabletop 2-player games first, preferably with swapped first actor and similarly ordered opening hands; use the blank scorecard. Then trial 4 and 7 players if R0 works mechanically. Share anonymized outcomes/ratings. The assistant **cannot certify manual fairness, human time or enjoyment without those observations**.

**No production code changes, automated app tests, merge or deployment.** Issue #11 remains active and PR #12 draft.
