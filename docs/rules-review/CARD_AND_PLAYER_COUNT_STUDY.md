# Controlled Card Response and 2/7-Player Comparisons

**2026-11-19 — design analysis; NOT a gameplay implementation or approved complete ruleset.** Existing [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), draft [PR #12](https://github.com/board-games-jf/surf-king-react/pull/12). This extends [CONTROLLED_FOUR_PLAYER_MATCH.md](CONTROLLED_FOUR_PLAYER_MATCH.md) without replacing its original deterministic evidence.

## Post-study decision update (2026-11-19): SK-DEC-023 ACCEPTED

**The study below remains a truthful historical record of what was tested at that time.** After it exposed the missing non-Shark fall recovery, the owner explicitly approved **SK-DEC-023**, extending **the same next-own-turn same-cell recovery** (no card 1 / Swimming Fin 2 / Lifeguard Float 3 energy) to **all zero-energy falls**, including those caused by Big Wave and Drop In. A newly fallen surfer remains on the final resolved hex with normal occupancy; there is no additional retreat caused solely by falling. Mandatory normal movement follows recovery when legal. This closes the *rule definition* gap that stopped the original no-card/Fin Big Wave branches.

**No earlier simulation was rerun:** The branch results below still **stop at the point where non-Shark recovery had not yet been approved**. The next independent model should apply SK-DEC-023 to these branches and distinguish existing card inventory from newly obtained rescue cards; action-slot costs, displacement exceptions and non-Shark fallen targeting need further design. **This approval changes design status, not evidence of match results.**

## Source and authority

Rechecked current `main` `aac50d222a3437200bcd4886eb90f29e537dfc65`; mandatory governance docs; draft SK-DEC-016–022; Issue #11 and open PR #12; `src/map/layout/board-layout.json`, `src/game/Cards.js`, `src/game/SurfKingGame.js` and relevant Drop In/maneuver tests. **The hex geometry manifest is provisional.** A separate Python design-model executed neighbor, turn order, vacancy, energy and drawn-card copy-count assertions. This was **not the application's `SurfKingGame` engine**, a Jest run, randomized real match, or human playtest.

**Approved design constraints:** initial energy **2**; Shark entry **−2**; on reaching 0 on Shark, occupy it until next own turn; stand there on return at **1 without card / 2 with Swimming Fin / 3 with Lifeguard Float**, then move normally (SK-DEC-020); one surfer per cell and no normal Drop In on fallen Shark occupant (021); normal movement mandatory when a legal true edge-neighbor exists (022).

**Unapproved trial mechanics used explicitly:** ordinary movement **costs 0 energy**; one card may be drawn after every successful normal maneuver (five-card hand cap); tactical action (one card or Drop In) can precede mandatory normal maneuver; losing an experimental Drop In costs **1 energy** and is resolved using trial max-of-up-to-two-d6 with no-damage ties; first player to enter a beach hex ends the match. The actual legacy engine still costs −1 energy for a normal move and does not follow this approved design; none of these trial parameters is ratified solely by this report.

## A. Four-player controlled draw and Big Wave counterfactual

The underlying route and order are the previous scenario's legal geometry: Ana `0→7→14→21→28→35→42→49`; Bruno `1→5→12→19→26→33→36→43`; Carla `2→9→16→23→27→34→37→44`; Diogo `3→10→17→24→31→38→45→52`. Sharks are 28–31; Ana and Diogo each fall at round 4 with 2→0 energy and remain in those cells.

**Controlled actual-deck inventory:** The existing `createDeck()` contains **64 cards**, including **4 Big Wave**, **4 Swimming Fin**, **4 Lifeguard Float**, **4 Bottled Water**, and **8 single Energy**. All cards were drawn without replacement in the isolated test. The deliberately specified opening hands were:

| Player | Two controlled opening cards |
| --- | --- |
| Ana | **Swimming Fin**, **Lifeguard Float** |
| Bruno | Energy x2, Storm |
| Carla | **Big Wave**, Stone |
| Diogo | Coconut, Jumping |

These are **artificial stress-case hands**, not a randomly typical deal: the probability of Ana receiving both Fin and Float as her first two cards from a uniformly shuffled 64-card deck is **32/4032 ≈ 0.79%**. They allow all three recovery choices to be compared without changing any other variable.

With an independent deterministic shuffling of the other **56 card copies** using seed **20261119**, one draw **after each successful normal maneuver** yields this opening log:

| Round | Ana draw | Bruno draw | Carla draw | Diogo draw |
| --- | --- | --- | --- | --- |
| 1 | Sunburn | Energy | Swimming Fin | Energy |
| 2 | Tsunami | Sunburn | Hang Loose | Storm |
| 3 | Cyclone | Big Wave | Energy x2 | Swimming Fin |
| 4 | Energy | Coconut | Cyclone | Bottled Water |

Under the **provisional five-card cap**, a sixth card triggers **deterministic disposal of the oldest unprotected card**, preserving the declared rescue choices for Ana and Carla's intended Big Wave at round 5. This is a test fixture convention, **not the live game's actual randomized discard policy**. Other drawn cards are deliberately left unused to isolate the test. The fixed deal, deterministic draw schedule and discard convention were validated to respect actual card-copy counts.

**Branch event:** Ana stands at the beginning of round 5 on **Shark 28**, chooses no card / Fin / Float, then legally maneuvers **28→35**. Bruno moves; Carla, still in **27**, plays held **Big Wave on the occupied cell 35** and then moves legally **27→34**. **The current code permits targeting an occupied cell with Big Wave without an adjacency check** (subject to Amulet), but range/turn actions are **not yet approved as final rules**. Diogo stands on Shark 31 at energy 1 without a recovery card, moves legally 31→38.

| Ana's approved Shark recovery choice | Energy on cell 35 before Big Wave | Big Wave effect (legacy card: −2) | Status after Carla's round-5 action |
| --- | ---: | --- | --- |
| **Decline card** | 1 | 1→0 | **Fallen at ordinary cell 35. Further recovery undefined** |
| **Swimming Fin** | 2 | 2→0 | **Fallen at ordinary cell 35. Further recovery undefined** |
| **Lifeguard Float** | 3 | 3→1 | **Survives. Can continue 35→42 in round 6 and 42→49 in round 7; Ana wins conditionally** |

**Design-model assertions executed:** All 20 normal maneuvers through round 5 were geometrically adjacent and destination-vacant in all three branches; draws and initial hands stayed within card copy limits; no turn was skipped or hex overlapped; Float branch continued to **25 maneuvers**, with Ana reaching beach on round 7. Branches ending with Ana fallen after **Big Wave** must **stop at the unresolved non-Shark fall**; do **not** apply SK-DEC-020 to arbitrary card falls or invent a recovery to force an outcome.

**Important distinction:** This is a constructive **conditional counterexample**, not a measured card win-rate. The Float has a credible **second-hit survival** purpose where Fin does not, despite both preserving position on Shark recovery. If the no-card/Fin branch later allows immediate normal recovery in cell 35, the final race result may change; that rule is not approved.

For scale only: under uniform sampling **without replacement** from the existing 64-card deck, the probability of **at least one Float in the first two cards** is `1 − C(60,2)/C(64,2) ≈ 12.20%`; **at least one of Float/Fin in the first two** is `1 − C(56,2)/C(64,2) ≈ 23.61%`. Seeing a rescue among six successive draws would be approximately **56.69%**, but that **is not** the probability the player is still holding it after hand-size discards or that the current game actually guarantees those six draws.

## B. Two-player control: symmetric fast lines

Starting from actual two-player cells **0** and **1**; fixed mutually vacant edge-legal lines and **no card use/extra obstacles**:

- A: `0→7→14→21→28[Shark fall]→35[stand at 1]→42→49[beach]`.
- B: `1→8→15→22→29[Shark fall]→36[stand at 1]→43→50[beach if turn reached]`.

The isolated model checks **13 valid individual maneuvers** through the winner's arrival: A enters beach **49 at the start of round 7**, so the immediate-first-arrival rule stops the game before B's round-7 move, although both planned routes contain seven movements. **Two Shark falls, no collisions**. This demonstrates a **turn-order tie advantage** under otherwise identical seven-maneuver tracks; it does not prove first player always wins with tactical cards and interference.

## C. Seven-player controls: all-safe vs early-Shark race

The actual engine assigns seven starting cells **0–6**. A and B etc. below correspond to player indices 0–6, in turn order. Each sequence was verified **move by move** for actual edge geometry, no occupied destinations and mandatory movement when legal. No random card draws, combat or dynamic obstacles are included, so this isolates **starting-position and lane congestion** rather than predicting real multiplayer win rates.

### Scenario C1 — Everyone avoids the Shark row (47 legal moves to winner)

| Round | A (0) | B (1) | C (2) | D (3) | E (4) | F (5) | G (6) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| 1 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
| 2 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
| 3 | 21 | 22 | 23 | 24 | 25 | 26 | 27 |
| 4 | **18** | **19** | **20** | **17** | 32 | 33 | 34 |
| 5 | 25 | 26 | 27 | 24 | 35 | 36 | 37 |
| 6 | 32 | 33 | 34 | 27 | 42 | 43 | 44 |
| 7 | 35 | 36 | 37 | 34 | **49 — E WINS** | — | — |

**Verified:** 47 edge-legal individual maneuvers, **0 Shark falls**, **0 overlaps**. The earliest safe finishing player is **E (starting cell 4)** in round 7; the 0–3 starters have an extra safe-route move and in this collision-free arrangement initially retreat/side-step around earlier group 4–6 blockers. This is **one specific coordinated movement policy**, not a frequency estimate for seven-player games.

### Scenario C2 — Four front-row racers accept Sharks (43 legal moves to winner)

| Round | A (0) | B (1) | C (2) | D (3) | E (4) | F (5) | G (6) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0 | 1 | 2 | 3 | 4 | 5 | 6 |
| 1 | 7 | 8 | 9 | 10 | 11 | 12 | 13 |
| 2 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
| 3 | 21 | 22 | 23 | 24 | 25 | 26 | 27 |
| 4 | **28 falls** | **29 falls** | **30 falls** | **31 falls** | 32 | 33 | 34 |
| 5 | 35 (E1) | 36 (E1) | 37 (E1) | 38 (E1) | 39 | 40 | 41 |
| 6 | 42 | 43 | 44 | 45 | 46 | 47 | 48 |
| 7 | **49 — A WINS** | — | — | — | — | — | — |

**Verified:** 43 legal individual maneuvers through A's round-7 win, **4 Shark falls** and **4 next-own-turn recoveries** at 1 energy without cards, **0 overlaps**. E/F/G also have seven-move safe paths to the beach but do not take their round-7 turns because A acts first. The winner **reverses from E in C1 to A in C2 solely by changing path policy**. This is why neither a starting-row advantage nor first-to-act advantage can be called a conclusive statistical imbalance without a full behavioral/card model.

## D. Findings, statuses and next gate

1. **Priority blocker: non-Shark fall recovery.** A legacy Big Wave deals **−2** from anywhere to an occupied target cell in the inspected code. After a no-card/Fin Shark recovery the leader can fall **again on a safe hex**, but the approved recovery rule is Shark-specific. This makes the next-turn outcome **undefined** and prevents full tactical-card match validation.
2. **Float vs Fin:** In the chosen second-hit test, a Float recovery at **3** avoids Big Wave-caused fall whereas Fin recovery at **2** does not; neither card grants extra movement. Do not infer that Fin lacks value in every other matchup.
3. **Deck/tempo:** 8 rescue copies in 64, 4 Bottled Water copies whose current effect would be redundant under free movement, and a hand-cap/discard policy that can make rescue retention a strategic variable. The 1-card-after-move rule, discard policy and rescue-action-slot cost remain unapproved.
4. **Seven-player geometry:** Safe-only paths favor starts **4–6**, while Shark-inclusive paths let starts **0–3** finish in seven maneuvers; traffic and arrival order decide the shown examples. Validate spawn fairness and turn-order fairness together rather than separately.
5. **Quick-win/exposure risk:** In uncomplicated, unopposed seven-move races, everyone can finish by round 7 despite falling. Temporary protection from normal Drop In while fallen, card targeting of fallen surfers and the ability to contest the Shark shortcut need a complete design pass.

**Recommendation for the next owner decision:** Define **what happens on the next own turn after a fall caused by a card/combat, not by a Shark**. Prefer a single simple general fall protocol only if it preserves approved Shark behavior; do not silently treat this as ratified. Then decide **whether a recovery card uses the ordinary tactical action**. Only then run broader seeded/randomized full match experiments with attack/card choices and evaluate whether ordinary movement should definitively cost 0 energy.

**No new approved decisions, no gameplay implementation, no application automated tests, no merge or deploy.** Only deterministic Python design-model assertions were run; source code and test suites were inspected but not executed.
