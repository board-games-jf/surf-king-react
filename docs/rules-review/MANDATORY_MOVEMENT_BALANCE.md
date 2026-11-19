# Mandatory Movement and Shark Risk — Deterministic Balance Assessment

**Date:** 2026-11-17. **Status:** Assistant assessment, NOT an accepted movement-energy change or a playable match test. **Scope:** Issue #11, draft PR #12 only.

## 2026-11-19 trial authorization update — SK-DEC-026

**After this original deterministic desk assessment, the owner explicitly approved EXPERIMENTING with ordinary movement at 0 energy cost**, tracked as **SK-DEC-026 Accepted for controlled design trials only**. This is **NOT a final permanent rule, source-code edit, game-engine run or test pass**. Previous route-length calculations stay valid because geometry does not depend on energy; historical comments describing 0 energy as unapproved referred to the time of the earlier study.

**Smallest controlled comparison from starting energy 2, no hazard or cards:**

| Two consecutive legal ordinary safe maneuvers | Old engine cost −1 per maneuver | Owner-approved trial cost 0 |
| --- | --- | --- |
| Energy after first maneuver | **1** | **2** |
| Energy after second maneuver | **0 — fall** | **2 — remains upright** |

At trial cost 0, after three safe maneuvers the surfer still has **2**, but entering a **Shark on the fourth** separately applies approved **−2**, causing a fall on that Shark, the SK-DEC-025 **one random eligible hand-card loss** to discard if the surfer has a card, and the SK-DEC-023 next-own-turn 1/2/3 recovery. **That random card-loss rule was approved after the original study**, so do not claim its outcome or recipient was actually randomized or measured in the earlier deterministic race. Keep player-caused attacks transferring the one lost card to the attacker under SK-DEC-025 and don't double the loss.

**Validation still needed:** Replay the controlled 2/4/7-player scripts with actual seeded hand/draw states and the now accepted loss/transfers; record card depletion, attacker reward, Shark shortcut versus detour, falling frequency, cycling/congestion and first-turn advantage. **Four Bottled Water copies currently waive the old travel cost** and would be effectless under this trial; no replacement/removal authorized.

---

## Evidence and method

Read current `main` commit `aac50d222a3437200bcd4886eb90f29e537dfc65`, `src/game/SurfKingGame.js` and the provisional 53-cell `src/map/layout/board-layout.json`. Exhaustively constructed true edge-neighbor connectivity using center spacing about 2.295 (`sqrt(3) * hexRadius`); used shortest-path search from actual initial cell IDs 0–6 to beach cells 49–52, both with and without initial Shark cells 28–31. Examined occupied-neighbor arrangements and enumerated two-dice trial outcome counts. **No random hands, software matches, Jest suite, or real-player sessions were run.**

The currently approved design includes 2 starting energy (SK-DEC-016), frequent falls/quick recovery (017), Shark entry damage −2 (019), same-Shark next-own-turn recovery at 1 energy without a card / 2 with Fin / 3 with Float (020), a fallen Shark surfer remaining an occupant unavailable for normal Drop In (021), and **required normal edge-adjacent movement whenever legal** (022). Standard movement energy cost and full turn/card rules remain unresolved.

## Verified route lengths, ignoring cards and opponents

| Actual starting positions | Minimum Shark-inclusive route | Minimum Shark-avoiding route |
| --- | ---: | ---: |
| 0–1 (two players) | 7 moves | 8 moves |
| 0–3 (four players) | 7 moves | 8 moves |
| 0–3 (among seven players) | 7 moves | 8 moves |
| 4–6 (among seven players) | 7 moves | **7 moves** |

Example from 0 to 49: `0→7→14→21→28→35→42→49` crosses Shark 28 in **7** moves; `0→7→14→21→25→32→35→42→49` avoids every initial Shark in **8** true edge moves. Note: `25→32` is genuinely adjacent in the source geometry.

**Important seven-player fairness risk:** Current setup puts the seventh-player game's first four surfers at cells 0–3 and the remaining three at 4–6. Those latter three have a shortest **Shark-free** route of 7 instead of 8 moves, despite every starting position having a 7-move Shark-inclusive route. This is a structural starting advantage, not proof of match outcomes. Revisit spawns before declaring seven-player balance.

## Compare mandatory movement energy costs

| Ordinary movement cost | From 2 initial energy, no cards or other damage | Assessment |
| --- | --- | --- |
| **−1 (current engine)** | First safe move: 1 energy; second safe move: 0 energy and a fall | Poor fit with compulsory movement and intended hazard-driven falls. The approved Shark recovery does not specify what to do with a fall on safe water |
| **0 (assistant recommendation)** | Safe movement preserves 2 energy; Shark entry takes 2 and causes a fall | Best next integrated trial, **NOT approved yet** |
| **0 and voluntary stay/Skip** | Can decline to move or cycle for cards | Conflicts with SK-DEC-022 and weakens pace |

Current **Bottled Water** prevents ordinary −1 movement energy; if ordinary movement is free, that card's current function is redundant (**4 copies in the existing 64-card deck**). No card alteration is authorized by this assessment.

## Geometric examples: only legal move is a Shark

A dangerous but **empty and otherwise legal** Shark cell is still legal; the already-approved mandatory-movement rule implies the player must choose it if no other legal move exists. The owner expressed enthusiasm for this tactical interaction; no new numerical rule has been accepted.

- At **cell 21**, true neighbors are **14, 18, 25, 28**. Shark is **28**. If **three opponents occupy 14, 18 and 25** simultaneously, a fourth player on 21 must move to **28**, if vacant. This is a possible **four-player** positioning scenario, **not** an observed game.
- At **cell 25**, neighbors are **18, 21, 22, 28, 29, 32**. Blocking **18, 21, 22 and 32** with four opponents leaves vacant Sharks **28/29** as the only maneuver choices (possible with **five or more players**).
- With **two players** and **no placed Stone**, one opponent alone cannot occupy all three non-Shark neighbors of cell 21; card-placed blocking could change this, but its legality and likelihood were not modeled.
- Exhaustive local geometry finds theoretically eligible Shark-only positions at **0 locations for 2 players**, **4 for 4 players** (21, 24, 35, 38), and **14 for 7 players**, if opponents can occupy all adjacent non-Shark cells. These are **possibility counts, not match frequencies**.

If every neighbor is illegal, **including a Shark already occupied by a fallen player**, there is **no legal move**; SK-DEC-022 permits only the forced blocked exception, never overlapping that player.

## Does the Shark remain punishing?

At 2 energy, the 7-move shortcut's fourth maneuver enters cell 28, loses 2, and falls **there**. At the beginning of the next own turn, the surfer gets up **there** at 1 energy without a card and can make the normal fifth move to 35. Thus, if unopposed, **the surfer still finishes the seven-maneuver route**, faster than the eight-maneuver safe bypass, **without a lost recovery movement**. The real cost is low energy plus future exposure; **while fallen, SK-DEC-021 prevents normal Drop In targeting**, which may be an unintended interim benefit.

Under the proposed trial of one die at energy 1 versus two dice at energy 2+, with best-die comparison and no-damage ties, the one-die player **loses the roll in 125/216 = 57.87%**, ties in **36/216 = 16.67%**, and wins in **55/216 = 25.46%**. This is **not** an approved combat damage probability or a match simulation. Under that dice trial, Fin (2 energy) and Float (3 energy) both restore two-die eligibility, and Float provides extra endurance.

## Recommendation and unresolved trade-offs

**Recommend retaining mandatory movement**, with **dangerous-but-legal tiles included** among its destinations. Test normal movement at **0 energy cost** while keeping approved Shark −2 and same-tile recovery. Do **not** approve a damage change or automatic safe-shark exception. The forced Shark situation is a positioning tactic rather than a new card/action.

Before an implementation issue, test controlled position-by-position sequences with **2, 4 and 7 players** for forced Shark entry, fallen-occupant traffic, safe detours, blocked turns and repeated back-and-forth movements. These remaining problems are open:

1. **Initial player placement fairness** in seven-player games (safe 7 versus safe 8).
2. **Shark shortcut strength** when no-card fall costs no positional tempo and grants temporary Drop In immunity.
3. **Back-and-forth cycling**: required movement allows `A→B→A` and may encourage card-farming under a still-unapproved post-move draw rule.
4. **Fully blocked turns**: no voluntary Skip; specify safe transition and avoid automatic repeatable energy/card rewards.
5. **Bottled Water** redesign if free movement is selected, plus all combat/card/fall sources not yet specified.

**Historical decision boundary, updated 2026-11-19:** The source-grounded geometry and arithmetic here are not a playable match or proof of balance. **SK-DEC-026 now ACCEPTS 0-energy normal movement FOR TRIAL ONLY**, not as a permanent implemented rule. Spawn changes, Bottled Water redesign and anti-loop solutions remain separate unapproved proposals.
