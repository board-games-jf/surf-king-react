# Full deck review and candidate B60 — 2026-11-22

**Status:** Proposal only; no card addition, removal, quantity or changed effect approved or implemented. Owner requests review of the complete deck before implementation. Part of [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), draft [PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).

## Evidence and baseline

Verified main c6fd08e2da82ca223740e3aa944c47f87aa84f16, SurfKingGame.js blob 1a6b19eb0adcdf0ac4940e8a74096e8990efc0a4, Cards.js blob 5f7ae4c30d06b977d83eccc4b5f6d4574ee5385a, useCard tests, draft gameplay decisions and [previous 2,400-race model](SEEDED_MOVEMENT_CARD_EXPERIMENT.md). Current deck 64 cards / 18 types; candidate 60 / 17 types (sums checked). Four Sharks are preplaced, not drawn. Nine old types were inert in the preceding model, so those races were not complete-deck tests. Preserve starting 2, Shark −2, mandatory legal movement, next-own-turn 1/2/3 recovery, Fin/Float action cost and random fall card loss/attacker transfer; free movement and cap 5 remain trials. Draft gameplay decision IDs overlap unrelated main visual decisions: reconcile before doc integration.

## Card-by-card review

All candidate ranges, quantities and effects are unapproved except previously accepted fall/recovery/Shark rules. Distances use true hex-edge adjacency. A card spends the tactical action; ordinary movement follows unless explicitly replaced. Only valid actions spend a card; active/deployed cards are not included in hand loss. Exclude fallen targets from candidate offensive/displacement effects for testing only.

| Card | Current copies | Observed current code | B60 copies | Candidate effect |
| --- | ---: | --- | ---: | --- |
| Energy | 8 | +1 | 6 | +1 |
| Energy x2 | 4 | +2 | 4 | +2 |
| Energy x3 | 2 | +3 | 0 | Remove overlapping strong healing |
| Coconut | 4 | Refill to cap 4 | 2 | Rare refill to trial cap 5; compare +3 later |
| Bottled Water | 4 | Waive ordinary −1 movement cost | 0 | Remove from free-movement trial; redesign alternative possible |
| Swimming Fin | 4 | Fallen player +1 | 5 | Approved recovery at total 2, spends tactic |
| Lifeguard Float | 4 | Fallen player +2 | 4 | Approved recovery at total 3, spends tactic |
| Big Wave | 4 | −2, occupied target, no range check, Amulet blocks | 3 | −2 to standing rival within 2 edges; fall card transferred |
| Sunburn | 4 | −1, same targeting as Big Wave | 4 | −1 to standing rival within 3 edges; fall card transferred |
| Stone | 4 | Empty obstacle-free tile; blocks entry, 3 remaining turns, owner tracked | 4 | Place within 2 edges on empty non-start/non-beach tile; expires at start of placing player's third subsequent turn; max one active per owner |
| Storm | 4 | Place obstacle; −1 on entry, no explicit expiry in placement branch | 4 | Same −1; candidate placement rules below; persists until removed |
| Island | 4 | +2 on entry before movement tax | 3 | +2 on first entry per placed Island; remove/discard after use to prevent repeat farming |
| Cyclone | 4 | Random numeric-offset redirection, can chain | 3 | Uniformly redirect on entry to one vacant legal true-edge neighbor, excluding prior cell; if none remain there. Resolve arrival hazard once, no further Cyclone redirect that maneuver; persists until removed |
| Change | 2 | Swap with target, no range check; only initiator's destination processed, Amulet blocks | 2 | Swap with standing rival within 2 edges; consumes maneuver as well as tactic. Both arrivals resolve, no overlap; reject invalid destinations |
| Jumping | 2 | Remove targeted obstacle, including Shark, no range check | 4 | Remove one adjacent player-placed obstacle (not fixed Shark); normal maneuver follows |
| Tsunami | 4 | Select row anchor; push surfers seaward via numeric offsets and recursive vacancy search; Amulet blocks | 3 | Target non-start/non-beach row within 2 edges of caster; move opponents in row one legal seaward edge if possible, otherwise stay. Caster unaffected. Resolve terrain, deterministic seaward-first order, seeded tie choices |
| Hang Loose | 1 | Active 1 remaining turn; blocks normal Drop In | 3 | Block Drop In only until start of next own turn |
| Amulet | 1 | Active 1 remaining turn; blocks attacks and certain forced moves | 2 | Protect from opponent card damage, forced opponent-card moves and Drop In until next own turn; not terrain. Compare consolidation with Hang Loose |
| Surf Current (new; provisional name) | 0 | None | 4 | Spend tactic to replace normal maneuver with up to two consecutive legal edge moves; first compulsory if possible, second optional. Resolve both arrivals, stop on fall or beach, no bypass of occupied/Stone cells; max one draw |
| **Total** | **64** | | **60** | **17 types** |

Fixed Sharks: four cells 28–31, approved −2 on entry, no damage on standing up. Candidate regular obstacle placement (Storm/Island/Cyclone/Stone): within 2 edges, vacant obstacle-free non-start/non-beach cell. Start row definition and durations require fixture verification. The new speed card may also help a leader; do not assume it eliminates initiative advantage.

| Functional category | Current | B60 |
| --- | ---: | ---: |
| Energy restoration | 18 | 12 |
| Rescue | 8 | 9 |
| Obstacles | 16 | 14 |
| Direct attack | 8 | 7 |
| Positional effects | 8 | 13 |
| Defense | 2 | 5 |
| Travel-cost cancellation | 4 | 0 |
| **Total** | **64** | **60** |

Rationale: reduce healing from 28.1% to 20%; prioritize rescue, positioning, and counterplay; clarify ranges, limit remote leader bullying and preserve recognizable effects. Two-card opening probabilities alone cannot prove balance.

## Cases and trial sequence

- Resolve genuine fall once, no duplicate transfers; an immediate opponent-forced hazard fall credited to that opponent and later voluntary hazard entry discarded are **provisional attribution fixtures**, as is defender receiving card if initiating attacker falls. Verify before approval. No extra tactical action or draw merely for displacement.
- Verify blocked turns, simultaneous arrivals, occupied/Stone boundaries, no recursive Cyclone loop, terrain effects on both swap destinations, fallen targets, beach-edge behavior, multiple arrivals, active card expiry and card conservation across deck/hand/board/active/discard. Compare allowing Jumping on fixed Sharks separately.
- Complete the existing 64-card model with explicit effect fixtures compatible with approved occupancy/recovery; compare same counts with revised effects, then quantify multiplicity changes (B60), and isolate Surf Current by replacing its four copies with existing positional/defense cards in a matched 60-card variant. Do not conflate the effects of all changes. Rotate initiative independently of starting positions and mix direct/cautious/aggressive policies.
- Evaluate hand cap five: no draw when full vs forced random or chosen discard, and recipient overflow on theft. Keep two opening cards and one draw after a successful maneuver as provisional baseline; no free draw on blocked turn. Track dead cards, used/lost rescues, falls, steals, cap drops, overtakes, round count, finishes by turn order and spawn, and available decisions. Recycle discards only when deck is exhausted, with conservation checks. Previous zero-cost seven-player direct trials averaged 7.35 overflow discards, 1.56 hazard-fall discards and 8.84 steals; hand economy matters.
- 2/4/7-player seeded trials, constructive forced-Shark and full-block tests, at least positive and negative scenario for every active card, then tabletop evaluation with humans. Keep free movement experimental. No final deck or victory rule without review.

**Validation so far:** live source inspection and arithmetic only (64 and 60 totals checked). No new card-effect simulations, application code, automated test execution, merge or deploy. No new accepted decision. The full 64-card baseline must be evaluated before adopting B60.
