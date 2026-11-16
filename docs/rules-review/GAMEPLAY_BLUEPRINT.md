# Surf King — Whole-Game Blueprint v0.1 (Design Only)

**Status:** A single coherent **assistant-recommended game-design prototype**, not a ratified complete rulebook or implementation authorization.
**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | **Draft PR:** [#12](https://github.com/board-games-jf/surf-king-react/pull/12) | **Hub:** [INDEX.md](INDEX.md).
**2026-11-16 baseline:** `main` `e79c02c8f008c70dc84b5273d3ce0b20e9c78410`; read `AGENTS.md`, mandatory docs, current issues/PRs, `src/game/SurfKingGame.js`, `src/game/Cards.js`, and relevant Drop In tests. **No code changed, automated game tests run, or actual match playtests performed.**

## 1. Design promise — ACCEPTED (SK-DEC-017)

A short, tactical, teachable and replayable race toward the beach, in which surfers **fall frequently**, but can **rejoin promptly without spending long turns inactive**. Falling should change position and decision-making; rescue cards should make a dangerous route/attack worth considering. **Optimize fall frequency and recovery downtime separately.** Do not cure stalled gameplay merely by making surfers unable to fall.

## 2. Confirmed mechanics vs experiments vs assistant proposals

| System | Owner-confirmed | Owner-accepted **trial**, not final | P-15 **candidate package**, NOT approved |
| --- | --- | --- | --- |
| Start and objective | **2 energy** per surfer (SK-DEC-016); race-to-beach product direction | — | 2 initial cards; 2–7 players; 53 hexes; first to a beach tile wins |
| Movement | Six edge-adjacent directions, backwards allowed | — | One **free required normal move** per turn when legal; no Rest; no voluntary pass |
| Turn options | — | — | **Optionally play one card OR attempt one adjacent Drop In**, then one normal move and draw one card (hand cap 5) |
| Energy | 0 energy means **fall from surfboard** | **5 maximum energy** | Energy primarily from existing cards/island, not repeatable free +1 each turn |
| Combat | Normal Drop In targets only edge-adjacent surfer | **Up to 2 d6 each; matching best results cause zero energy damage** | 1 die at 1 energy, 2 dice at 2–5; compare highest; strict loser loses 1 energy |
| Positional combat | — | — | Strict attacker win permits **optional exchange of adjacent occupied tiles**, using the attacker's one normal move |
| Terrain / cards | **Shark −2 energy on entry, owner-approved (SK-DEC-019)** | — | Storm −1, Big Wave −2 and Island +2 are existing code baseline; continue integrated tuning of card strength and obstacle entry effects |
| Fallen / rescue | Fall at 0; **frequent falls but no long downtime** (SK-DEC-017); **Shark-caused falls now have a defined design rule SK-DEC-018** | — | **Shark (accepted):** optional immediate Float +2 or Fin +1 to remain on Shark hex without retrigger; without rescue vacate, next personal turn respawn on nearest safe empty hex toward sea at 2 energy and play normally. **Other falls (candidate only):** apply analogous rules later if approved |
| Game end | — | — | Immediate first-beach win; **test** fallback after **12 completed rounds**, furthest toward beach by shortest hex distance, then higher energy, then a draw if exact tie. Needs anti-camping checks |

**Owner's later clarification supersedes the former damage hypothesis:** Shark remains **−2 energy (SK-DEC-019 Accepted)**, just as currently implemented. Thus a surfer starting with 2 energy falls immediately upon Shark entry unless they first gain energy. Under owner-proposed P-19, that surfer would stay fallen on the Shark until next personal turn, then rise at 1 energy and move normally, making the shortcut faster despite a fall. Whether such a low-energy return is a sufficient price has not been tested. Energy x3/Coconut and the trial 5 energy cap may cause a defensive snowball.

**Meaningful rescue:** An immediate rescue does **not** reverse a completed positional swap, does **not** re-trigger the same already-resolved obstacle, cannot give a second move, and does **not** permit voluntarily falling to refill energy. The exact sequence in a two-damage battle+hazard chain and the next-turn safe return cell remain unresolved; do not claim this table is executable as written.

## P-19 — New owner-proposed simplification (NOT yet accepted)

**Owner says:** Eliminate the need to choose a backward/empty cell. A Shark still deals **−2 energy (SK-DEC-019 Accepted)**. At zero, the surfer stays **fallen on the Shark** until the **start of their next own turn**, then recovers automatically with **1 energy on that same hex** and may move normally. Card use should occur on the next own turn, not interrupt another surfer. Since **Swimming Fin presently restores +1** and free recovery already grants 1, recommend as a separate card-balance experiment **no card = 1, Fin = 2, Float = 3** (each card provides its +1/+2 **on top of** the base 1); treat the card as the normal tactical card action. This **is not approved** and is needed to avoid Fin becoming pointless. No positional penalty remains, so test whether vulnerability at 1 energy gives Sharks and cards enough weight. Resolve occupancy while temporarily fallen before implementation.

**Governance:** SK-DEC-018's earlier accepted oceanward-return model remains recorded until an explicit superseding decision. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) P-19 is the current targeted proposal.

## P-16 — Specific Shark fall rule now defined (SK-DEC-018 Accepted, design only)

The owner requested a definitive answer to whether a surfer knocked off by a Shark stays in that cell or retreats. **Decision:** A surfer at zero due to a Shark remains **on that hex only if they immediately consume Lifeguard Float (+2) or Swimming Fin (+1)**; this reaction does not repeat the same Shark entry or grant extra movement. **Without a rescue**, the fallen surfer vacates the Shark cell immediately; at the start of their next personal turn they re-enter at **2 energy** in the nearest vacant obstacle-free hex one true adjacent step **toward the ocean** if possible (`28 → 21` when safe), else the nearest vacant obstacle-free oceanward cell not closer to the beach; a fall on the starting ocean edge uses a safe starting-row cell. They **play that turn normally** without an inactive-turn penalty. The temporary fall animation does not block the Shark.

**The exact same rule for non-Shark causes of falling has NOT been approved.** Full combat/terrain collision ordering, card reactivity to other hazard types and the frequency of falls remain part of the wider design trial. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) contains deterministic re-entry selection and anti-repeat details.

## 3. Turn rhythm — easy-to-learn candidate

1. **Choose at most one tactical action:** play a card, attempt an edge-adjacent Drop In, or skip tactical action.
2. **Surf to one legal edge-adjacent hex** (any of six directions, free). A strictly won attack's optional exchange uses this maneuver, so the attacker cannot move again.
3. **Draw one card after successful movement**, capped at five; finish the turn. If all neighbors are blocked, the move stage ends automatically and safely — **no voluntary Rest**. Fair blocked-player fallback remains open.
4. **Reactive rescue** is an exception outside the normal tactical action if genuine damage reduces a surfer to zero. It only preserves position and restores the card's small amount of energy.

**Why not make +1 energy a free repeatable action?** A player starting at 2 could reach the experimental cap of 5 after only three such actions, while taking only one damage per losing Drop In; this risks reducing the intended falls and making high-energy players too resistant. Save energy-building for scarce card opportunities and terrain decisions initially.

## 4. Concrete paths and tactical incentives

Verified against provisional layout geometry: from internal start tile 0 to beach tile 49, a valid **7-maneuver shortcut** `0→7→14→21→28→35→42→49` crosses Shark 28, whereas an **8-maneuver detour** `0→7→14→21→25→32→35→42→49` avoids all initially positioned Sharks. With owner-approved Shark −2, entering the shortcut at 2 energy causes a fall. Under latest owner-proposed P-19 (NOT approved), the surfer remains fallen at the Shark and resumes on the next own turn at 1 energy; prior proposals to reduce Shark damage to −1 are superseded. Occupancy and newly placed obstacles alter the actual route value. Occupancy and newly played obstacles can alter the viable routes.

With 2d6 vs 2d6, strict win/loss are each **505/1296 = 38.97%**, tied/no damage **286/1296 = 22.07%**. A player with 5 energy is more durable than one with 2, but has the **same dice count**. A strict attack that merely changes energy 5→4 without changing position would usually be unimportant in a short race. An optional exchange on victory gives a real reason to risk combat.

## 5. Illustrative 3-player tabletop match — NOT a simulated or observed game

The timeline is deliberately schematic and uses hypothetical draws, rolls and occupied cells. It establishes **what the experience should feel like**, not the actual number of turns or winning odds.

| Stage | Ana (aggressive, has a Float) | Bruno (defensive, wants energy) | Carla (route tactician, has a Fin) | Interaction lesson |
| --- | --- | --- | --- | --- |
| Rounds 1–3, opening | Moves toward the direct Shark shortcut with 2 energy; preserves Float | Chooses a safe line and holds an Energy x2 card | Follows another route, saves Fin | Normal movement keeps everyone active without paying survival energy |
| Rounds 4–5, hazard | Enters Shark at 2→0 and falls on that hex. Under the proposed P-19 next-own-turn recovery she rises there at 1 energy; a held Float could be spent on that turn for stronger recovery (candidate total 3) | Plays Energy x2 to raise endurance, taking a longer safe detour | Reaches an exposed cell near a rival | The accepted Shark −2 makes this a forced fall at 2 energy; holding a rescue would improve energy but the player may preserve progress even without one |
| Rounds 5–7, conflict | Attempts adjacent Drop In; strict success may allow swap, using her movement | May lose forward position to a winning adjacent rival while retaining enough energy to continue | Loses a battle while at energy 1 and **uses Fin** to stay at the final reached position with 1, rather than moving backwards | The attack can change rank without necessarily knocking out the defender; Float and Fin give distinct insurance |
| Rounds 7–9, comeback | Continues toward shore; may be caught if another player has a safer line | Despite higher energy, cannot automatically win every two-dice fight and might need a favorable route | If she falls again with no Fin, must leave her cell; **returns next own turn at 2 energy on a safe oceanward cell, and moves normally** | A player can experience multiple falls without spending multiple full inactive turns |
| Rounds 9–12, finish | May be closest to beach | Can still catch up using route and cards | Can still compete if the position setback was mild; if too far behind, assess severity | First to reach beach wins; only if no one wins by the trial's 12 full rounds, evaluate a simple progress fallback |

**Not a solved match:** Those three cards may not be in actual opening hands; not every player necessarily suffers those events in a real game. Individual routes and turns need explicit position-by-position validation once a test ruleset is authorized. No match-frequency or total-duration estimates are claimed.

## 6. Failure modes and countermeasures — trial design, not decisions

| Failure | Potential corrective action |
| --- | --- |
| **Too few falls:** +5 max energy, small damage, full healing make combat unimportant | Retain a few powerful but scarce threats (e.g., Big Wave −2) before weakening every Shark/attack. Measure falls per player and damage sources |
| **Too many falls / stalling:** zero energy leaves player inactive over multiple rounds | Fix **re-entry speed and position**, not all damage values; no repeat Rest |
| **Rescue-card lottery:** only 4 Float + 4 Fin in 64-card deck (12.5% of deck) | Guarantee viable no-card comeback. Measure how many players obtain a rescue, not merely whether cards exist |
| **Shield abuse:** fall to zero to gain +2 can be intentionally exploited | Cards only trigger on **genuine external/hazard combat damage**, no voluntary reset action, no bonus movement |
| **No-card fall is unpunishing:** a 1-step retreat may be immediately undone next turn | Measure the loss of progress and test 1 vs 2 steps **only if** rescue becomes uninteresting; avoid arbitrary added skipped turns |
| **Double hit swap+Shark:** a forced defender may lose 1 from combat and 1 on Shark entry | Trigger terrain once per entrance and evaluate one-off combined risk before finalizing; apply rescue only once per genuine fall event |
| **Five-energy leader too strong:** healing cards + energy cap let leader tank everything | Check Energy x3/Coconut/Island, frequency and placement of high-damage cards before changing max energy or dice |
| **All-neighbors blocked / oscillation:** one required move cannot be completed | Safe forced-turn completion and a match-end fallback; test congestion in 2, 4 and 7 players |
| **12-round fallback causes unfair camping:** leader can stop trying to win | Check current-position scoring versus other simple tie conditions; do not finalize without a real game |
| **Bottled Water obsolete:** current card saves movement cost, but movement would be free | Redesign its effect later only after the free-movement model is chosen |
| **Timing confusion:** card reaction before vs after combat exchange | Resolve **all displacement and hazard effects once**, offer eligible rescue without undoing a finished move, and define one-card-per-fall-event boundary |

## 7. What is approved vs what must be validated next

**Accepted and binding as design goals:** 2 initial energy; zero-energy fall; no Rest; true edge adjacency for movement and normal Drop In; **frequent falls with rapid return to meaningful play** (`SK-DEC-017`).

**Owner explicitly agreed only to experiment with:** max 5 energy, cap of 2 dice, equal best dice causing no energy damage.

**Shark design status:** SK-DEC-018 accepted earlier sea-ward return; owner now proposes **P-19 no retreat, automatic next-own-turn 1-energy stand-up on the same Shark**, with recovery cards for an additional +1/+2, **not yet ratified**. SK-DEC-019 specifically accepts Shark −2 on entry. **Still assistant-designed** for all other fall sources and wider system: movement cost, turn rhythm, card acquisition, damage levels, position swap, recovery timing for non-Shark causes, 12 rounds and tie-break.

**Next best step:** Walk one **position-by-position three-player match** with these rules as a provisional tabletop scenario, forcing at least one Shark shortcut, one double hit, one saved fall and one unsaved fall. Compare against the original inactive-turn design on player turns lost, energy distribution, board progress, ability to catch up and finish. Then try edge cases with 2, 4 and 7 surfers. If it fails, change **one linked rule category** rather than continuously adjusting isolated numbers. No software implementation until owner authorizes a separate scoped issue.
