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

## 6. Recommendation and review boundary

**Preferred next single candidate:** P-10 optional position exchange **only on a strict attacker win**, and **it consumes the player's normal maneuver**. This preserves the owner's no-damage-tie trial; keeps the max-two-dice confrontation quick; and makes a contested cell meaningfully valuable without damage inflation or new progress counters.

**Conditions before endorsing:** Decide whether exchange into a Shark/Storm/Island triggers obstacles, define the fall/occupied-cell interaction, and validate counter-swaps and the 10-round fallback. Compare card effects and one tactical action per turn as a whole. None is approved.

**Implementation status:** Source inspected and routes/dice probabilities checked by deterministic arithmetic. No executable game simulation, match playtest, Jest or production code change. No merge or deployment.
