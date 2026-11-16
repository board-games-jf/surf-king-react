# Rule Review — Energy, Cards, Obstacles and Comeback

**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | **Rules hub:** [INDEX.md](INDEX.md) | **Draft PR:** [#12](https://github.com/board-games-jf/surf-king-react/pull/12)
**Status:** **2 starting energy SK-DEC-016**, **Shark −2 SK-DEC-019**, and **same-tile next-own-turn Shark recovery SK-DEC-020** are Accepted design decisions on draft PR #12. Prior SK-DEC-018 return-to-sea rule is Superseded. Cap **5**, up to **2 dice** and no-damage ties remain **owner-accepted experiments**, not finalized combat rules.

## Confirmed design foundations

- Each surfer **begins the match with 2 energy**.
- **0 energy causes a fall** from the surfboard.
- **No Rest mechanic** is allowed.
- The goal is a **short, portable, strategic, fun and replayable race**; balance energy with turns, cards, obstacles, combat, re-entry and victory.

## Current code baseline vs experimental package

| System | Existing engine behavior (verified `main`, 2026-11-16) | Current trial / candidate status |
| --- | --- | --- |
| Starting energy | 4 | **2 accepted**; not implemented |
| Energy cap | 4 | **5 trial** accepted |
| Normal movement | Costs 1 energy unless Bottled Water | **0 cost** is assistant P-09, not approved |
| Drop In dice | Dice count equals player's energy, up to 4 | **Up to 2 dice** is accepted for design trial; compare highest, strict loss −1 are assistant details |
| Combat tie | Attacker takes damage on equal paired dice | **No damage to either participant** accepted for trial |
| Shark, four central hexes | **−2 energy on entry** | **Owner-approved SK-DEC-019.** Shark −1 proposal superseded. At 2 energy, entry causes an immediate fall |
| Storm and Island | Storm −1; Island +2 energy | Effects remain open; Island may allow repeat-visit energy farming |
| Big Wave / Sunburn | Big Wave −2; Sunburn −1 | Big Wave **−1** is candidate only; test against 2 starting energy |
| Energy card / Energy x2 / Energy x3 | +1 / +2 / +3 | Consider capping healing per card at +2, not approved |
| Coconut | Restore to energy cap | Potentially overpowered at new cap 5; rework or restrict only if needed |
| Lifeguard Float / Swimming Fin | Rescue from fall, restore +2 / +1; deck has 4 of each (8/64 total) | **P-13 proposed optional immediate fall reaction**, preserving resolved position instead of seaward fallback; distinct strength (+2 vs +1), not approved |
| Bottled Water | Prevents the cost of a normal maneuver | Becomes redundant if normal movement becomes free; redesign/removal needs approval |
| Card acquisition | Initial 2 cards; later card supply often follows a maneuver | Must preserve meaningful choices without random-draw domination |

## Current coherent candidate P-09 — NOT approved

**Movement remains possible without burning survival energy**; optionally use **one card OR one adjacent Drop In**, then take one legal normal move and draw a card. No automatic repeatable "+1 energy" each turn: from two to the five-energy cap would otherwise take just three such actions.

**Combat:** at energy 1 roll one die; at 2–5 roll two; compare highest. **Equal best results cost no energy (owner accepted for trial)**; a strict loss costs one (assistant candidate). A full-health 5-energy rival is tougher to knock down but does not have more dice than an energy-2 rival.

**Damage/hazards:** **Shark −2 is accepted (SK-DEC-019)**; current Big Wave −2 and Storm −1 remain the existing code baseline, with wider balance unapproved. Earlier Shark −1 variants are superseded. Be careful not to make hazards harmless; their purpose is to create a risk/reward path decision. Island currently restores +2, which may need controls to stop cycling and farming.

**Recovery, updated P-12/P-13 candidates:** On real damage bringing energy to zero, the owner wants rescue cards to make **risking a fall a strategic choice**. P-13 proposes optional **immediate Lifeguard Float (+2)** or **Swimming Fin (+1)** as a reaction even on an opponent's turn, preserving the cell reached by the completed triggering effect and not giving a new maneuver. Without a card, P-12 returns the surfer from a nearby safe seaward cell next own turn at 2 energy **with the normal maneuver available**. The older 'miss next turn entirely' suggestion is superseded for exploration, not approved. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

**Match pressure:** first to beach wins, with a finite-round fallback only as a candidate. The approximately seven-step geometric shortest route means fights must affect position or momentum, not just wear down health too slowly.

## Main gameplay risks (design review, not tested)

1. **Overpowered healing:** frequent +2/+3/full-refill cards and 1-damage combats might render attackers powerless.
2. **Too many falls early:** with 2 starting energy, current Big Wave −2 and Sharks −2 cause immediate falls; repeated setbacks may discourage replay.
3. **Weak tactical attack:** 2 vs 2 dice gives 38.97% strict win, 38.97% strict loss and 22.07% no-damage tie. Positional incentives may be more important than grinding five energy to zero.
4. **All-pass or backward oscillation:** no Rest is confirmed, but compulsory movement and a fair endgame fallback are not yet finalized.
5. **Player count:** 2–7 players with hazardous central cells and possible crowding create different card, positioning and pace incentives; test representative scenarios.

## Verified geometry correction and P-10 attack trade-off

The provisional layout does **not** force everyone to cross a Shark. From internal start 0 to beach 49, the **7-maneuver route** `0→7→14→21→28→35→42→49` visits a Shark at 28; an **8-maneuver fully edge-adjacent detour** `0→7→14→21→25→32→35→42→49` avoids all four preplaced Sharks. The additional move is the price of avoiding risk. Both were checked by cell-center distances in `board-layout.json`. Occupancy and card-placed obstacles can change practical availability. See [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md).

The owner's confirmed **Shark −2** makes the direct seven-move Shark shortcut a **guaranteed fall from the approved 2-energy starting point** unless energy was raised first. The longer safe eight-move bypass remains possible. Accepted **SK-DEC-020** allows standing on the Shark at 1 energy on the next own turn **without positional loss**, or at 2/3 with Fin/Float, changing the fall's cost from distance to vulnerability.

The assistant's new **P-10 (NOT approved)** aims to make Drop In worth using: on a strict attacker win, allow an **optional attacker/defender hex exchange that counts as the attacker's single normal maneuver**, along with the candidate 1 damage to the defender. A challenger at energy 2 and leader at 5 still roll two dice each; winning only 1 energy damage would not affect the leader's odds or distance, whereas exchange can change who is ahead. Exchanging onto hazard cells cannot be treated as a free Shark bypass; resolve obstacle triggering before approving.

## P-11 — Combined attack damage and forced hazard entry (NOT approved)

In the P-10 optional occupied-cell exchange, both surfers would resolve the terrain **once on arrival**, including a surfer forced into the attacker's former hex. If the defender strictly loses the dice and is moved into a Shark or Storm, they can lose the proposed **1 energy from combat plus 1 from terrain**. This can cause an instant fall from the approved **2-energy starting strength**, even though the independent Shark / Big Wave damage is being considered for reduction to 1. **This is the biggest newly identified balance conflict.**

Recommendation for the *first* trial: keep the simple "every entrance activates terrain" principle, but **do not approve any additional forced-entry damage cap or immunity yet**. In a controlled desk scenario, compare this occasional two-point combo against the strategic risk of voluntarily remaining on a hazardous cell; decide whether it is fun, readable and fair. The exchange itself stays optional for the attacker, and using it consumes the normal maneuver.

**Fall/re-entry safety, improved P-12 candidate (NOT approved):** When reduced to zero, a surfer should leave the occupied board cell, avoiding a fallen blocker. The earlier P-09 idea of **return at 2 energy but skip the next entire turn** would **stack a turn skip** on top of being forced backward by a successful Drop In and hazardous fall. P-12 instead recommends: at start of next own turn, return at **2 energy on the nearest unoccupied hazard-free cell strictly seaward of the fall checkpoint**, **then play that turn normally**. This costs at least one step of progress without leaving the player inactive. Rescue-card effects and a safe fallback near the starting edge remain open; the current code does not implement this.

See [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md) for exact example cells, order of operations and 2–7-player stress cases.

## P-13 — Deliberate risk because rescue cards exist (owner idea; effects unapproved)

The owner explicitly wants **sometimes accepting a fall to be worthwhile when holding a rescue card**, while keeping the mechanic easy to learn. Current deck contains **4 Lifeguard Float (+2)** and **4 Swimming Fin (+1)** cards out of **64**. The likelihood that a random 2-card opening hand contains at least one is about **23.61%** (not a playtest measurement); receiving an early rescue is not guaranteed.

**Assistant response:** The rescue card should work as a **reaction when a real hazard or attack reduces energy to 0**; spent card preserves the resulting position and restores its existing +2 / +1 energy, with **no extra movement, action or draw**. Without a card, a player has a guaranteed normal P-12 fallback that loses position but does not skip an entire turn. This differentiates the cards from auto-recovery and gives a player reason to *save* one for a Shark shortcut or hard Drop In. Do **not** add a voluntary "fall to heal" move or let saving undo an already resolved exchange. Card-trigger timing, ocean-edge fallback, number of rescues per action and repeated terrain effects remain to be balanced.

**The current engine does not implement the reaction mechanic**: cards are used in the card phase only once the player is marked fallen, and `pass()` includes an unrelated fall-recovery path. Treat both as code facts, not approvals. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

## P-14 game-level correction — do not remove the falling experience

**Owner clarification (2026-11-16):** The original game was deliberately built to produce **frequent falls**; the problem was **stalled play**, not the presence of falls. The owner likes the newer tactical direction but wants the design led back toward that original experience. This is an **accepted design goal**, not approval of new numeric rules.

**Implication for the proposed energy economy:** The provisional combined package of **free movement, Shark/Big Wave reduced to −1, cap 5, only 1 damage per combat, and tie without damage** might reduce fall frequency far below the intended feel. **Do not equate lower damage with faster gameplay.** Keep the owner's accepted trial cap/dice/ties as experimental baselines while evaluating actual **falls per match** against **time inactive after falling** separately. Do not lock Shark −1 or Big Wave −1 yet; some stronger hazards may be appropriate once recovery is light and predictable.

**Preferred guiding loop:** The surfer should actively make tactical decisions every personal turn (except any unresolved truly blocked turn); if a real attack or hazard causes a fall, the immediate consequence is **loss of progress**, with a rare rescue card proposed as insurance to preserve an advanced cell. At most one core fall penalty for each event; do not compound a missed entire turn and extra backward penalties on top of the fall. Without cards, returning must remain possible and useful. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) P-14.

**Next evaluation:** Paper-test the same 3-player complete race with at least a few falls under the old full-turn skip versus the proposed next-turn active recovery. Inspect match pacing and how much a rescue card saves before asking for any damage-number approvals.

## Accepted Shark recovery — SK-DEC-020 (supersedes SK-DEC-018)

At Shark entry, lose **2 energy** (SK-DEC-019). At 0, **fall on the Shark tile and remain there**. On the **next own turn**, recover **on that same tile** to **1 energy without a card**, **2 if Swimming Fin is discarded**, or **3 if Lifeguard Float is discarded**. A recovery card is used on that next own turn, not as an interruption on another player's turn. The surfer may **maneuver normally** after recovery, with no extra movement; getting up does not re-trigger the same Shark. Do not require a sea-ward return or a skipped whole turn. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

**Open:** Whether card recovery consumes the usual tactical action, whether a fallen surfer reserves a cell and can be attacked, whether Drop In and other hazards use the same system, and whether a full 5-energy surfer makes falls too rare. **Shark −2 and 1/2/3 next-own-turn energy totals are the accepted design**, not a gameplay implementation; old P-09/P-13/P-17/P-18 damage/recovery versions are historical.

## Next integrated action

**P-14 priority:** Preserve **frequent falls without inactive turns**, not merely fewer falls. Compare an entire 3-player match under old turn-skipping recovery versus P-12/P-13 positional recovery with rescue insurance. Defer permanent adjustments to Shark damage, Big Wave, movement energy and combat damage until the complete loop is judged fun and fast. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) and [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md).

**No gameplay code edits, gameplay tests, merge or deployment.**
