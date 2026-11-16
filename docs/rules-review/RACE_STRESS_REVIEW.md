# P-10 — Race, Shark Routes and Drop In Positional Value

**Status:** Assistant's **unapproved** integrated design analysis, not an executable test or owner-accepted rule.
**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | **Index:** [INDEX.md](INDEX.md) | **Draft PR:** [#12](https://github.com/board-games-jf/surf-king-react/pull/12).
**Sources checked on 2026-11-16:** `main` `df81076781a7a70845dbe079f7a8ca21a79d35e6`, `src/game/SurfKingGame.js`, `src/game/__tests__/moves/SurfKingGame.dropIn.test.js`, `src/map/layout/board-layout.json`. The board mapping is marked **provisional**. No app code changed or game/test suite executed.

## 1. Owner-approved design and active experiments

Confirmed rules: start with **2 energy**; fall at 0; **no Rest**; legal edge-sharing normal movements in all six directions, including backward; normal Drop In only targets edge-adjacent opponents.

Design experiments agreed to (not permanent rules): **5 maximum energy**, **up to two dice per participant**, and **equal highest dice cause no energy damage to either surfer**. Comparing **the highest** dice and applying **one damage on a strict loss** remain assistant test details.

## 2. Geometry-verified Shark trade-off — real choice already present

Using current provisional hex centers, `distance = sqrt(3) × hexRadius ≈ 2.295` represents adjacent hex centers. The following two routes starting at internal cell 0 and finishing at beach cell 49 were checked step by step; all successive cells have this center spacing and share an edge:

| Route | Internal cell IDs | Legal normal moves | Initial Sharks visited |
| --- | --- | --- | --- |
| **Fast / risky** | `0 → 7 → 14 → 21 → 28 → 35 → 42 → 49` | **7** | **28** |
| **Safer detour** | `0 → 7 → 14 → 21 → 25 → 32 → 35 → 42 → 49` | **8** | **none** |

Therefore the four preplaced Sharks on 28–31 form a **hazardous central row, not an unavoidable blockade**. One additional edge-adjacent maneuver can avoid all Shark hexes in this example. Earlier notes suggesting that crossing the Shark row is compulsory should be interpreted only as a *possible* route, not a universal constraint.

**Gameplay implication:** With experimental Shark damage **−1** and starting energy **2**, a player can choose a one-turn-shorter but weaker path, versus a one-turn-longer energy-preserving path. This is an organically meaningful tactical choice without tracking progress milestones or inventing a new bonus system. Other obstacles and occupying surfers may change which route is practically available.

## 3. Combat strength vs positional value

Under the experimental cap 5 and two-dice rule, a surfer at energy 2 and one at energy 5 each roll **two d6**. With highest-die comparison and no-damage ties:

| Outcome for 2-energy attacker against 5-energy defender | Exact outcomes | Probability |
| --- | --- | --- |
| Attacker best die higher | 505 / 1296 | **38.97%** |
| Defender best die higher | 505 / 1296 | **38.97%** |
| Same best die | 286 / 1296 | **22.07%** |

A strict win causing only **−1 energy** leaves the leader at **4 energy**, with the **same two dice** and the **same board position** on the next turn. In a short seven-maneuver race, the attacker could spend its tactical action for virtually no improvement in its chance to catch the leader. This is a **design inference**: no real match outcome is being claimed.

At one energy versus a two-dice defender, the attacker's strict win drops to **55/216 = 25.46%**, strict loss rises to **125/216 = 57.87%**, and ties are **36/216 = 16.67%**. Energy is thus especially valuable for **surviving a failed challenge or crossing hazards**, even though energy from 2 to 5 no longer increases die count.

## 4. Assistant's P-10 recommendation — optional successful Drop In exchange (NOT approved)

**Try a positional payoff without new counters:** when the attacker **strictly wins** a normal Drop In, the defender loses the candidate **1 energy**, and the attacker **may exchange hexagons with the defender**. If the attacker chooses the exchange, **it counts as that surfer's one normal maneuver this turn** — no extra free move afterward.

- **Strict attacker win + choose exchange:** attacker takes the defender's occupied cell, defender moves to the attacker's former cell, loser −1 energy, attacker's maneuver used.
- **Strict attacker win + decline exchange:** defender −1 energy, attacker may still make their normal legal maneuver.
- **Strict defender win:** attacker −1 energy; may still maneuver if energy remains above 0.
- **Tie:** no energy loss and no exchange; normal legal maneuver remains available.
- **Fall at zero:** retains owner-confirmed fall. If the losing defender falls, physical occupancy/re-entry treatment still requires a single consistent rule.

**Why exchange instead of pushing a defender into an empty cell:** no need to search or choose a spare adjacent cell, so it works better in crowded 4- or 7-player conditions; edge-neighbor legitimacy is already guaranteed. **Why consume the maneuver:** otherwise a lucky attack would produce a free swap **and** an extra step, allowing a two-cell personal advance in a single turn and compressing the short race excessively.

**Concrete late-race scenario (illustrative, not observed):** Leader B sits on cell **42** (one safe edge move from beach cell 49) with **5 energy**. Challenger A is behind on cell **35**, adjacent, with **2 energy**. On a strict attacker win (≈39%), A exchanges 35 ↔ 42, B goes back to 35 and loses 1 energy, and A has **used their maneuver**. This actually alters who is closer to winning even though B remains at energy 4. On a tie (≈22%), nothing happens and A may seek a separate legal maneuver. On a strict loss (≈39%), A drops to 1 energy and may try to move away; attacking is a meaningful risk.

**Mid-Shark scenario:** A at 21 attacks B at Shark cell 28, both adjacent. An exchange would move A onto Shark cell 28; whether entering the tile **triggers the Shark's damage**, and how involuntary displacement interacts with obstacles, must be defined consistently before any approval. **Do not silently permit attacks to bypass hazard penalties.** A at energy 2 can instead take the 8-step detour above to avoid the Shark altogether.

## 5. Whole-game stress matrix — qualitative, not simulated

| Scenario | With damage-only P-09 | With optional exchange P-10 | Remaining risk |
| --- | --- | --- | --- |
| **2 players, late race** | Leader at 5 can absorb an isolated −1; no positional change | ~39% win chance for an energy-2 challenger to seize the lead's adjacent hex; leader pushed back | Counter-swap on next turn; need a short but fair endgame |
| **3 players, central sector** | Faster racer can ignore combat if already ahead | Players can use terrain and adjacency to contest route; crowded hexes exchange rather than push | Multiple counterattacks and card effects can magnify swings |
| **4 players** | Weak collisions may fail to change positions | Exchange is legal even when other adjacent hexes occupied | Fall occupancy and obstacle displacement rules unresolved |
| **7 players** | The board can jam; a successful attack may not relieve blocking | Exchange itself needs no extra empty destination | Anti-stall rule needed if all moves blocked; card duration and round limit become important |
| **Energy 1 vs 2+** | Strict win only 25.46%; repeated attacks risky | Successful underdog exchange can still be valuable | Higher chance of losing the last energy and falling |
| **Central Shark choice** | Shorter 7-step route costs energy; 8-step bypass is safer | Attempting an exchange into a Shark needs a consistent hazard rule | Avoid accidental obstacle bypass through forced swaps |
| **Fallen comeback** | Returning after a lost turn may be too slow | Exchange can give an underdog a way to gain space after recovery | Falling recovery and card rescues not finalized |
| **Deliberate backward loop** | Mandatory movement alone cannot guarantee a finish | Exchange increases interaction but still cannot guarantee progress | Finite endgame and blocked-turn handling need agreement |

## 6. P-11 — Swap, obstacles, falls and re-entry: integrated edge-case review (NOT approved)

**Goal:** Keep the P-10 exchange intuitively explained and prevent inconsistent occupancy, obstacle bypass or repeated forced falls. Only the owner-confirmed **0-energy fall** and **trial no-damage tie** are accepted. P-10/P-11 are assistant proposals.

### Recommended resolution order (P-11, not approved)

1. **Check adjacent attack eligibility, then roll the two-dice-cap fight.** Compare the highest result only (candidate rule). A tie causes **zero energy damage** and **no exchange**, as agreed for the trial.
2. **Resolve combat energy damage first:** candidate **−1 to the strictly losing surfer**. If the **attacker** reaches zero, they fall and cannot move or exchange. If the **defender** reaches zero, they fall and vacate their cell immediately; there is no longer a live opponent with whom to exchange.
3. **Strict attacker win and defender still afloat:** attacker can **decline** exchange and later make their normal legal one-hex maneuver, or **choose** to exchange their two adjacent occupied cells. Exchange consumes the attacker's one normal maneuver.
4. **Defender fell:** attacker may use that turn's **one legal normal maneuver** to occupy the just-vacated neighboring hex, including its terrain effects. This is entering an empty destination, **not a swap** and not a bonus second movement.
5. **Resolve terrain for every character entering a cell due to an exchange**, including the involuntarily displaced defender. Both surfers exchange positions simultaneously, then each receives the destination effect once. If terrain drops either to zero, the fallen surfer vacates their new cell. **No effect repeats for a player merely remaining in the same hex.**
6. **After a nonlethal failed attack or tie**, the attacker may still take a legal normal maneuver; if they fell at zero, their turn's movement ends.

**Illustrative hazards and reward cases:**

| Current/target geometry | Candidate P-11 outcome | Why it matters |
| --- | --- | --- |
| A at **21**, B at **28** (initial Shark), B survives an attack and A elects swap | A enters Shark 28, takes proposed Shark −1; B moves to 21. If A had only 1 energy, A now falls despite winning the dice. | Attacker can decline swap; no free Shark immunity |
| A on a Shark cell, B in ordinary adjacent sea, A strictly wins and elects swap | B takes candidate attack −1 and Shark −1 upon being moved onto A's old cell. This **can cause a fall even from 2 starting energy**. | Forced terrain plus attack is a **potentially severe double hit** and needs explicit owner judgment before acceptance |
| Either new cell holds a **Storm** | Entering surfer takes Storm's existing −1 (provisionally keep); if zero, they fall and vacate. | Same entry rule as normal movement |
| Either new cell holds an **Island** | Entering surfer receives its current +2 (subject to separate rebalance); repeated swaps/moves could farm healing | The entry rule is consistent, but Island's effect/economy may need a **single-use or smaller benefit** |
| A attacks B at energy **1**, wins strictly, B reaches **0** from proposed −1 | B falls, vacates the target hex. A may maneuver into that empty adjacent hex, receiving its terrain effect; cannot also move a second time. | Avoid placing a fallen defender in two occupied cells |
| Defender wins / ties | No exchange; attacker loses proposed −1 only on strict loss; ordinary maneuver remains if afloat | Keeps the trial no-damage tie |
| **Stone or Cyclone** in the exchange endpoint | Current `placeObstacle` refuses occupied cells, and a surfer entering Cyclone is displaced rather than remaining there. They are **not normally occupiable endpoints** in the existing engine | Do not invent a complex special-case chain for a swap whose target is an occupied live surfer |

**Counter-swap and anti-stall risk:** The new trade-off may generate alternating A↔B exchanges if adjacent players repeatedly attack. The probability of an equally matched attack strictly succeeding on a single attempt is 38.97%, and exchanges consume the attacker's movement, but that **does not mathematically prevent recurring stall**. A finite match end or other simple race-pressure rule remains necessary; do **not** force a novel anti-attack cooldown yet.

### What does a fall mean for board occupancy?

A fallen surfer is **off their board** (owner-confirmed) and should not remain a permanent solid blocker. Recommend **remove the active occupant from the hex while keeping a private fall-location checkpoint**. An earlier P-09 proposal returned the surfer at 2 energy but skipped their normal maneuver; **P-12 below now recommends a less punitive return** based on the combined positional-loss analysis. The selection and treatment of an occupied or hazardous checkpoint must be deterministic; treat it as an **implementation-independent design open issue** rather than a rule already specified and accepted. Never give a fallen surfer a free step toward the beach. A visual fallen marker could remain, but must not block another surfer's legal movement.

**Re-entry risks:** A return on Shark/Storm may cause an instant repeat fall if damage applies to re-entry; granting hazard immunity on re-entry is a new special rule; Island healing on re-entry could create a free refill. The preferred next refinement is a **safe water return one step toward the ocean followed by the normal action/movement** (P-12 below), rather than both a positional setback and an entire skipped turn. The exact tile-selection algorithm, blocked fallback and rescue-card effects remain unapproved.

### What we learned and what still needs decision

- **Prefer consistent entry triggers** for a positional exchange to avoid gamey Shark shortcuts, but flag **combined attack + hazard damage** as the highest-risk corner case for 2-energy starters.
- **Prefer a single maneuver budget** for movement/exchange, and handle pre-exchange knockouts by vacating the cell first.
- **Do not finalize return from fall** before testing available cells, terrain on return, occupied return points and rescue cards.
- This desk analysis uses **existing code/geometry, deterministic rule walkthroughs and exact dice enumeration**, not a run of the actual game engine, a match simulation or a proven balance test.

## 7. P-12 — Fall penalty should cost **position**, not a whole extra turn (NOT approved)

**New concrete Shark duel:** A has **1 energy at Shark cell 28**, B has **2 energy at adjacent normal cell 35**. In the trial 1d6 vs 2d6 highest-result combat: attacker strict win **55/216 = 25.46%**, strict loss **125/216 = 57.87%**, no-damage tie **36/216 = 16.67%**.

- **A wins:** under P-10/P-11, A may exchange and move to 35. B takes the candidate −1 combat damage, then is forced into Shark 28 and takes candidate −1 Shark damage: B falls at zero. The rare attacker victory creates a dramatic comeback; whether a forced defender should take both damage sources remains pending.
- **A loses:** A takes candidate −1, falls at zero at cell 28 and vacates; B remains at 35.
- **Tie:** neither loses energy, no exchange; A may choose another legal normal movement if available.
- **Race consequence:** If the loser also **misses the entire following turn** as earlier P-09 proposed, the combined setback (forced backward exchange, fall location, missed maneuver) may render a short 7–8-maneuver race effectively unwinnable.

**Preferred P-12 recovery experiment (assistant proposal, not owner-approved):**

> **Fall:** Immediately leave the occupied board hex and remember the fall location. **At the start of the surfer's next turn**, return at **2 energy** on the **nearest empty, hazard-free hex strictly closer to the sea** than the fall location (prefer an immediately adjacent safe hex; if blocked, search farther sea-side cells deterministically). Then the surfer **may take their normal legal maneuver during that same turn**. Do not appear closer to the beach than the fall location. Do not trigger a new Shark/Island/Storm effect simply by materializing on a recovery hex (the chosen hex is hazard-free).

**Why this is simpler and more fun to play:** On the player's screen: *"You fell? Return one safe hex toward the sea on your next turn with 2 energy, and continue surfing."* The setback costs at least one unit of position/progress, but players avoid spending a full turn inactive. The system can choose the safe destination without user-facing bookkeeping. A player falling in a simple free-water cell can recover the lost position by moving back into it on return, effectively spending the next turn regaining momentum rather than advancing, which is a penalty.

**Boundary cases needing design:**

- **Ocean-edge fall:** From starting row 0 there may be no more seaward hex. A fallback may respawn the surfer in a free starting-row cell with 2 energy; this is a rare exception but could make early deliberate falling beneficial. Need an anti-exploit rule if tests show it matters.
- **Crowding:** Choose the nearest valid vacant sea-side hex, prioritizing **one edge-adjacent step** to avoid huge backward teleports; select deterministic tie-break by distance, sea-side row and cell ID. With seven surfers and Stones, no safe cell might be immediately adjacent.
- **Rescue cards:** Lifeguard Float and Swimming Fin currently revive/recharge a fallen surfer. They should remain distinctly useful under immediate-next-turn recovery, perhaps as **same-turn rescue** or preventing the backward relocation. Neither effect is approved.
- **Player order:** A fallen surfer cannot be attacked or occupy a solid cell until their next turn. Respawn before their standard turn; all game actions remain subject to ordinary limits.
- **Multiple fall damage in one tactical action:** Resolve the single fight, then entered-cell terrain **once each**; never recursively trigger the same hex effect on an already fallen surfer.
- **Endgame:** Falling in the last one or two rounds of a provisional round-cap race may still effectively lose the game. Compare the comeback margin with leader distance before approving a cap.

**Recommendation:** Prefer **P-12** to P-09's "return at 2 but skip the entire turn" because a positional Drop In and hazardous entry already provide a setback. This proposal still requires owner discussion and full-match validation; it is **not** a final gameplay decision.

## 8. P-13 owner insight: falling is strategic when a rescue card is held

The owner correctly identified a missing payoff: a player should sometimes **choose a risky Shark shortcut or Drop In** because they hold a real **fall-recovery card**. The owner has not accepted detailed mechanics. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

**Assistant improvement over P-12 alone (NOT approved):** A rescue is an **optional immediate reaction** when a legitimate damage event first reduces energy to zero. The existing **Lifeguard float (+2)** or **Swimming fin (+1)** is discarded; the surfer **keeps the position reached by the triggering event**, with no bonus maneuver, additional draw or immunity to subsequent independent damage. Without/declining a card, use P-12's safe seaward return with 2 energy on the next personal turn plus its normal movement.

**Important ordering issue:** Combat damage may cause a defender to reach zero **before** the attacker's optional exchange. If the defender spends a rescue in response, the defender remains active and **may still be displaced by a successful attack**; the card cannot retrospectively cancel the exchange. On a later Shark forced-entry fall, the resolved final cell is the position that may be preserved by a different eligible rescue. Avoid implementing reaction timing until the state transitions are explicitly resolved and protect against multiple card use within one damage event.

**Design reason:** Card + fall should be a planned *risk shield*, **not** a move to intentionally knock oneself out to receive more energy than an ordinary card. The old P-12 return already limits damage to a position setback; P-13 makes keeping that hard-won position a distinct, meaningful card advantage. The rescue card is currently scarce enough for opportunistic decisions (8 copies in a 64-card deck). It should not be mandatory for continued participation.

**Next:** Compare one Shark shortcut with no rescue/Fin/Float and one attack+swap+Shark double hit under the same P-09/P-10/P-11 combat candidate. No match simulation or gameplay code changes.

## 9. Recommendation and review boundary

**Preferred next single candidate:** P-10 optional position exchange **only on a strict attacker win**, and **it consumes the player's normal maneuver**. This preserves the owner's no-damage-tie trial; keeps the max-two-dice confrontation quick; and makes a contested cell meaningfully valuable without damage inflation or new progress counters.

**P-11/P-12 addition (NOT approved):** Combat damage first, vacate fallen occupants, optional simultaneous exchange of still-active surfers with destination terrain applied once each. Combined forced Shark/Storm damage can knock a two-energy defender off in one attack. The 1-energy Shark attacker scenario gives **25.46%** strict win / **57.87%** strict loss / **16.67%** tie. To avoid a triple punishment, P-12 now proposes **return next own turn at a safe sea-ward cell with 2 energy and the normal maneuver available**, rather than losing the following turn as well. Next evaluate rescue cards, re-entry selection and late-game recovery before asking the owner to approve.

**Implementation status:** Source inspected and routes/dice probabilities checked by deterministic arithmetic. No executable game simulation, match playtest, Jest or production code change. No merge or deployment.
