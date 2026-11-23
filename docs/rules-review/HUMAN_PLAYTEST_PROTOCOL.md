# Pre-implementation human tabletop validation protocol

**Created 2026-11-23; planning artifact only.** No facilitated human matches have taken place. The owner wants Surf King to be **fast, fun and meaningfully interactive between people** while validating all core mechanics and cards before software implementation. Follow [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12) and prior independent-model [iterations H](OPENING_INTERACTION_STUDY.md), [I](CROSSLANE_INTERACTION_STUDY.md), [J](CATCHUP_CARD_STUDY.md), and [K](FINISH_ORDER_STUDY.md).

## Evidence-informed hypotheses (not approved acceptance criteria)

1. **Short and engaging**: most actual games end after roughly 7–10 complete rounds; **measure elapsed minutes rather than assuming** a particular duration, including time reading cards and waiting for other players.
2. **Two-person interaction**: at least one **consequential action against an opponent** by mid-match and a plausible countermove or lead change; don't count playing a direct attack that has no effect on distance/choices as proof of fun.
3. **Fair starts and finish**: rotate turn order and starting seat across sessions. Flag if the first actor wins an overwhelming majority after several *paired* sessions; the current model often reaches **99–100% first-actor wins in two-player play** even with multiple tactical cards. A target near competitive parity is only a **research goal**, not an authorized threshold.
4. **Falling matters, without frustration**: damage to 0 triggers exactly one random eligible hand-card loss (attacker receives it if responsible; hazard discards it), the surfer stays put and acts again on their next personal turn. Record surprise, frustration and whether the fall actually altered the race.
5. **Counterplay exists**: an attacker can be challenged through proactive Amulet/Hang Loose, Jumping versus Stone, Change/Tsunami repositioning, occupied routes and an optional positional Drop In trial. Count **available** counters as well as counters actually used; sparse hands can make technically available cards inaccessible.
6. **Seven-player action load**: count turns spent waiting, repeated focus-firing of the same victim, cards stolen, forced backward movement and whether people still feel involved when it is not their turn.

## Trial groups and variable isolation

Start with short **calibration** matches at 2, then 4, then 7 people. Use paired sessions with identical predetermined deck ordering/opening hands where possible and rotate who starts; have a facilitator read the candidate rule sheet, record all deviations, and switch only **one rule per pair**. A small number of sessions is exploratory, **not statistical proof**; prioritize repeated 2-player trials because the board allows two nonadjacent parallel optimal routes.

| Test pair | Hold fixed | Change ONE thing | Question |
| --- | --- | --- | --- |
| A — opening fairness | 64 physical cards, 2 opening cards, current proposed graph ranges, same planned route | Direct offensive damage permitted immediately vs each player's first personal turn being preparation-only | Does the second player get a meaningful defense before the first knockdown? Does game tempo suffer? |
| B — short-range interaction | Fixed opening rule and deck | Damage-only Drop In vs optional strict-win standing-versus-standing swap consuming maneuver | Does a swap matter in actual adjacent clashes, including two-player games? |
| C — cross-lane counterplay | Fixed order/deck/effects | Start with Stone/Jumping disabled, then allow both | Do players reroute, counter Stones or simply lose a turn to an uncancellable block? |
| D — tempo/comeback | Same B60 candidate physical quantities, including four Surf Current cards | Speed card disabled vs unrestricted, then behind-only eligibility | Does a trailing surfer recover, or is the apparent deficit just within-round initiative? |
| E — hand economy | Same layout and deck for the pair | Draw only if below cap vs draw then chosen discard | Are cards playable, varied, not often dead/overflow? Does theft at cap reward a successful attacker? |
| F — social test | Most promising ONE consistent printed trial ruleset | 2, 4, 7 participants across rotated starts/decks | Is the game actually fun, legible, fast and competitive for humans? |

**Trial-only operational conventions to print on every play sheet (NOT ratified):** original 53-cell board, 2 energy to start, cap5, trial 0-cost one mandatory normal edge move, Shark −2, universal next-own-turn same-cell recovery 1/2/3, Fin/Float spends normal tactic, one uniformly random eligible hand-card loss on a new fall (to attacker when player-caused). For studies using the proposed 64-card active effects or B60, attach the explicit card text from [DECK_REBALANCE_PROPOSAL.md](DECK_REBALANCE_PROPOSAL.md) to avoid silent differences; two initial hand cards, one optional card **OR** adjacent Drop In before ordinary move, one draw after successful move if below hand cap. Use exact one or two D6 best-of rules and no-damage tie **only as provisional combat fixtures**. Real turns should not be timed to an arbitrary limit unless that timing is itself a tested variant.

**Unresolved cases need an explicit pilot choice and visible note, not silent approval:** if attacker falls during their Drop In, assume defender receives the lost card (trial-only); if an offensive card directly forces someone into Shark, credit initiating attacker, but if a Stone simply blocks the safest route and a surfer chooses Shark normally, discard as hazard; a fallen surfer is untargetable by normal Drop In even away from Shark (trial extension, not approved); hand receiver at five may hold sixth only until the end of that action, then choose one to discard (trial-only); a fully blocked maneuver ends without drawing or extra move (trial-only); placed Stone expires after third subsequent owner's turn (trial-only). Any rule ambiguity stops the session log until the facilitator notes the resolution.

## Minimum observable event log

Record a row whenever a tactic or fall changes another player's options, plus start and end of every personal turn; do not collect personal identifying information beyond anonymous seat labels.

| Field | Example / recording guide |
| --- | --- |
| Match and setup | `2P-A-01`, deck A64/B60, shuffled seed or recorded hand order, seating and initiative |
| Clock | Actual start/end time and time paused to clarify a rule |
| Round / actor | Round 3, seat B |
| Positions and energy | B 15 E2; A 14 E1 |
| Card/tactic | Stone at 22, Jumping, Big Wave target, Drop In roll (each die) |
| Effect on another player | Forced route, energy change, fall, stolen card, blocked hex, defensive avoidance, swapped lead |
| Counter availability | Had Jumping/Amulet/alternative legal route? Yes/no/unknown |
| Recovery and movement | Fell at cell, card lost destination, same-hex next turn stand, normal legal move completed |
| Result | Finish round/seat, whether first actor won, other simultaneous arrivals, any blocked turns |
| Feel / friction | One short non-leading note: unclear, amusing, unfair, dead card, long wait |

## End-of-match five-question check (each human participant, anonymous)

Rate 1–5 (1=strongly disagree, 5=strongly agree):
1. "My choices affected at least one opponent's plans."
2. "When someone targeted me, I had understandable ways to respond."
3. "Falling hurt my plan without keeping me out of the game."
4. "I felt I still had a chance to win until late in the match."
5. "I would choose to play another match."

Also ask: "**Which card or rule was confusing or felt unfair, and why?**" Record verbatim voluntary answers without personal details. Ask the facilitator whether anyone ceased participating because of a stalled turn or excessive focus-firing.

## Stop / revision triggers

Stop and clarify before moving from exploratory to approval if an attack causes double card loss, stolen cards exceed the trial cap with no recorded choice, forced movement overlaps another surfer, falling on a Shark re-triggers damage just from standing, a defender vacates their fallen tile, fixed Sharks are removed by Jumping without explicit trial intent, or a player can be attacked by remote Normal Drop In (edge-adjacent-only is confirmed).

Potential *design* adjustments to compare after evidence: trim excess 7-player attacks, constrain opening Big Wave, add real cross-lane defense, simplify duplicate heal types, revise Surf Current's leader/trailer condition or the finish tie rule. Never bundle them silently into a single approval or infer online multiplayer infrastructure.

## Gate before gameplay implementation approval

Do not call the game **validated as fun or balanced** until at least one complete **human-played** session for 2, 4 and 7 people is recorded, including real duration and individual interaction ratings; the critical two-player first-actor and opening-attack issues must be explicitly reviewed across rotated sessions. Human feedback should influence card effects/counts and rule complexity *before* asking the owner to accept a scoped gameplay-engine implementation issue. Any software implementation later requires a separate issue/branch, source-level regression tests (falls, displacement, card ownership, cap, endgame) and explicit review; merge and deploy require separate authorizations.

**State:** Ready for facilitation, **not performed**. No real people tested, no application code/Jest/build, merge or deployment.
