# Controlled Four-Player Match Study — Movement, Shark Falls and Blocking

**Date:** 2026-11-19. **Status:** Deterministic **design-model walkthrough** with executed adjacency/occupancy/energy assertions; **NOT a run of the SurfKingGame engine, not a complete randomized deck-based playtest, and not approval for implementation.** Issue [#11](https://github.com/board-games-jf/surf-king-react/issues/11); draft PR [#12](https://github.com/board-games-jf/surf-king-react/pull/12).

## Sources, constraints and explicit simulation assumptions

Verified `AGENTS.md`, mandatory main docs, live `main` `aac50d222a3437200bcd4886eb90f29e537dfc65`, Issue #11/PR #12, `src/map/layout/board-layout.json` (provisional 53-cell centers), `src/game/SurfKingGame.js` and the maneuver tests. Used the actual current **four-player start cells 0, 1, 2, 3**, Shark cells **28–31**, and beach cells **49–52**. Every move below was checked for true edge-neighbor center spacing (approximately 2.295) and destination vacancy **at the actual time in turn order A, B, C, D**.

**Approved design applied:** SK-DEC-016 (start 2 energy), SK-DEC-019 (−2 energy upon entering Shark), SK-DEC-020 (fall remains on Shark, next own turn stand there at no-card 1 / Fin 2 / Float 3), SK-DEC-021 (one surfer per tile, fallen occupant blocks normal moves/Drop In), SK-DEC-022 (must move if a legal adjacent cell exists, including backward/sideways). No repeated Shark damage just from standing up.

**Hypotheses isolated rather than silently ratified:**
- Ordinary movement costs **0 energy** (assistant recommendation, not yet approved). No extra obstacle placement and no Stone/Cyclone/Storm interactions. Victory is **immediate first beach-cell entry**, following the existing engine's ending direction.
- To isolate positional strategy and guarantee a reproducible sequence, **all decisions, turn order and the single combat roll are scripted**. Random initial hands, post-move draws, card redistribution and the 64-card deck are **not simulated**. In scenario A Diogo is explicitly assumed to **hold Lifeguard Float**; the other players do not use tactical cards.
- Scenario A uses exactly **one hypothetical Drop In**: Carla at energy 2 rolls **[6,1]** against Diogo (3 energy) **[3,2]**. The trial's highest-die resolution yields a Carla win and **−1 energy to Diogo**. This `−1` combat damage and die resolution are **not approved final rules**; no exchange or other unapproved displacement occurs.
- The **use of recovery Float** at start of Diogo's own round-5 turn is approved Shark recovery; whether this consumes an ordinary tactical-action slot remains open, so **Diogo takes no other tactical action** in that turn. No recovery mechanic for non-Shark falls is assumed.

All cell IDs in this study are **internal 0–52 IDs**; user-facing board numbering is 1–53.

## Scenario A — Full race-to-first-beach under the fixed trial package

Four players: **Ana** (start 0, aggressive 7-move Shark line); **Bruno** (start 1, 8-move Shark-free line); **Carla** (start 2, 8-move Shark-free line, attacks Diogo once); **Diogo** (start 3, aggressive 7-move Shark line, holds Float).

| Round | Ana (start 0) | Bruno (start 1) | Carla (start 2) | Diogo (start 3) | Event |
| --- | --- | --- | --- | --- | --- |
| 0 | 0, E2 | 1, E2 | 2, E2 | 3, E2 | Starting positions |
| 1 | 7, E2 | 5, E2 | 9, E2 | 10, E2 | Everyone takes one legal move |
| 2 | 14, E2 | 12, E2 | 16, E2 | 17, E2 | No overlap |
| 3 | 21, E2 | 19, E2 | 23, E2 | 24, E2 | Lanes separate |
| 4 | **28, E0, fallen** | 26, E2 | 27, E2 | **31, E0, fallen** | Two approved −2 Shark events; both occupy their Shark hexes |
| 5 | 35, **E1** | 33, E2 | 34, E2 | 38, **E3** | Ana returns at 1 without card; Diogo spends **Float** to return at 3; each then makes ordinary move |
| 6 | 42, E1 | 36, E2 | 37, E2 | 45, **E2** | Carla at 34 attacks adjacent standing Diogo at 38 **before** moving; scripted [6,1] vs [3,2], hypothetical −1 to Diogo. All four move legally |
| 7 | **49, E1 — WIN** | — | — | — | Ana acts first, reaches beach; immediate victory ends match before the other three act |

**Executed design-model assertions:** 25 individual turns (6 complete four-player rounds plus Ana's round-7 turn), 25 legal true edge-adjacent maneuvers, **zero illegal overlaps**, **two Shark-caused falls**, **two approved Shark recoveries** (one no card, one Float), **one optional trial Drop In**, and **no involuntary blocked turns**. After Ana's win: Ana at 49/E1, Bruno at 36/E2, Carla at 37/E2, Diogo at 45/E2. This result is **conditional on the scripted strategy, initiative and trial combat assumptions**, not evidence of typical match duration or player-win rates.

**Key result:** The approved Shark fall did **not** cost Ana a movement, positional distance, or an entire future turn: `0→7→14→21→28 [fall]→35 [stand 1]→42→49` is a legal **7-maneuver finish**, versus an **8-maneuver** Shark-free route. At this speed a rescue card strengthens energy but does **not automatically accelerate movement**. Diogo's rescue makes him stronger against Carla's proposed combat hit; without it, an energy-1 Diogo losing one energy to Carla would enter a **non-Shark fall state whose recovery is not yet defined**. A race with two seven-move Shark users is also **sensitive to turn order**: Ana acts before Diogo and therefore arrives first in this chosen sequence. No generalized initiative fix was approved.

## Scenario B — A forced Shark entry reachable from actual four-player starting positions

**Question:** Can opponents really force an occupied surfer into the Shark, instead of only describing an artificial board snapshot?

**Yes, geometrically:** The following **24 verified legal moves over six complete rounds** take initial cells 0/1/2/3 to **Ana 21, Bruno 14, Carla 18, Diogo 25**, without overlap and without entering any Shark. Other players' intended moves intentionally coordinate a trap; **this is a constructive reachability example, not evidence that adversaries would naturally cooperate in a competitive match**.

| Round | Ana (0 start) | Bruno (1 start) | Carla (2 start) | Diogo (3 start) |
| --- | --- | --- | --- | --- |
| 0 | 0 | 1 | 2 | 3 |
| 1 | 7 | 4 | 5 | 6 |
| 2 | 11 | 0 | 1 | 9 |
| 3 | 14 | 7 | 4 | 12 |
| 4 | 18 | 11 | 7 | 15 |
| 5 | 14 | 18 | 11 | 22 |
| 6 | **21** | **14** | **18** | **25** |
| 7 | **28 🦈, fallen E0** | 7 | 11 | 32 |
| 8 | **35, recovered E1** | 14 | 18 | 39 |

**Forced step at start of round 7:** Actual edge-adjacent neighbors of Ana's cell **21** are exactly **14 (Bruno), 18 (Carla), 25 (Diogo) and 28 (vacant Shark)**. Under accepted SK-DEC-021 and -022 the first three destinations are illegal because occupied; **28 is hazardous but legal and therefore the only legal maneuver**. Ana enters it, loses 2, falls there at 0. Later that round the three blockers leave their positions by legal mandatory moves. On round 8, Ana automatically stands on 28 with 1 and legally moves to 35. The 32 scripted moves through round 8 were validated for adjacency, turn order, destination vacancy and Shark energy changes.

**Tactical interpretation:** Compulsory movement creates real geometry-based coercion, not an arbitrary forced hazard card. However, even after being forced into Shark **Ana preserves her progress and moves past it next turn**. The vulnerability penalty, temporary immunity from normal Drop In while fallen, and costs for opponents to spend moves maintaining a trap deserve measured follow-up, not assumed balance.

## Findings, unresolved rules and next test

1. **Compulsory movement creates positional tactics**, but the four-player Shark trap above requires **deliberately coordinated six-round setup**. This is a possibility proof, **not a claim of frequency or a dominant tactic**.
2. **Shark currently doubles as a speed shortcut**, even for a two-energy surfer who falls without a rescue. The one-energy drawback may be insufficient if nobody can attack them afterward. Consider the effect under opposing attackers and realistic hands before adding more punishments.
3. **No-card recovery and Float recovery preserve race tempo equally** in this scenario. Their benefit is combat/second-hit survival, not free distance.
4. **Turn-order advantage** can decide a seven-maneuver finish; the current engine's ordered first-beach condition should be measured before any change.
5. **Core systems still missing:** Recovery after non-Shark falls, card/draw frequency, tactical action cost for rescue, special-card displacement, multi-hit effects, blocked-turn handling, anti-oscillation and seven-player starting-position fairness. The current engine still charges 1 energy for normal moves, allows maneuver-pass/Skip and may swap with fallen occupants, i.e. these owner-approved design rules **have not been implemented**.

**Next concrete experiment:** Repeat the same four-player race with **controlled scripted card draws and one actual attempt to deny a legal Shark bypass**, then run a 2- and 7-player position-by-position comparison. Record the exact extra hypothesis at each unapproved subsystem. **Do not silently add a turn penalty, change Shark −2, or declare 0-energy movement approved.**

**Validation record:** Two custom deterministic geometry/state walkthroughs **executed**, with 25 and 32 maneuver assertions respectively; **not the application engine**. No Jest, actual app match, randomized combat/deck trials, browser QA, gameplay code changes, merges or deployments.
