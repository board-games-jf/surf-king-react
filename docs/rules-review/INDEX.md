# Surf King — Gameplay Design Epic / Rules Review Hub

**Status:** Active game-design exploration; **not** a finalized rulebook or implementation authorization.
**Single epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) — canonical status, chronological owner feedback and next action.
**Living documentation:** [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12), branch `docs/11-progressive-rules-review` — Markdown only, **do not merge without explicit approval**.
**Current single complete-match design reference (NOT approved):** [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md) — recommended v0.1 loop, decisions, illustrative 3-player race, interdependencies and playtest gates.
**Latest checked code:** `main` `aac50d222a3437200bcd4886eb90f29e537dfc65` (2026-11-16). Game rules are not implemented from this draft.

## North star

**Frequent and dramatic falls, but no long recovery downtime**, within a **fast, easy-to-learn, portable, strategic, fun and replayable beach race**. The owner **explicitly confirmed this as the project's gameplay direction** on 2026-11-16 (**SK-DEC-017 Accepted**). The assistant must lead integrated full-match design, prioritize **cost of falling** separately from **frequency of falling**, spot stalled loops and recommend a small coherent package. **Never ask the owner to solve isolated mechanics.**

Keep one coherent whole-match candidate visible while considering one focused choice at a time. Separate proven mechanics, owner's decisions, experiments and open design proposals. Changes in this draft are **documentation only**.

## 1. Owner-confirmed design rules and product direction

| Rule | Scope |
| --- | --- |
| All surfers **start at 2 energy** | Accepted product rule; see `docs/DECISIONS.md` **SK-DEC-016** on this draft branch |
| **Frequent falls + rapid return to meaningful play** | **Approved overall direction, SK-DEC-017**; exact recovery/card/damage mechanics remain experimental |
| **0 energy means falling off the surfboard** | Not resting; timing and method of recovery unresolved |
| **Shark −2 damage on entry (SK-DEC-019)** | **Accepted**; no numerical Shark damage reduction |
| **Shark fall and next-turn recovery (SK-DEC-020)** | **Accepted Shark case:** fall stays on same Shark; next own turn **no card 1**, **Fin 2**, **Float 3** energy; move normally. **SK-DEC-018 superseded** |
| **Unified recovery from ALL zero-energy falls (SK-DEC-023)** | **Accepted 2026-11-19** for Shark, other terrain, cards, normal combat: stay on final hex; next own turn get up **1 / 2 / 3** (no card / Fin / Float), mandatory legal move; special forced-displacement and targeting remain open |
| **Rescue cards spend the tactical action (SK-DEC-024)** | **Accepted 2026-11-19:** recovering with Fin/Float uses the turn's normal card / Drop In action; movement remains compulsory when legal. Free recovery at 1 spends no tactical card action |
| **Fallen surfer occupies Shark and blocks normal movement (SK-DEC-021)** | **Accepted:** one surfer per tile, no normal entry onto fallen occupant and **no normal Drop In targeting them**; normal alternative moves/actions remain possible; forced displacement/cards and full-block fallback still unresolved |
| **No Rest mechanic** | No voluntary or automatic Rest action; forced inability to move needs a separate safety rule |
| Normal movement in **any of six edge-sharing directions**, backward included | Any adjacency, occupancy or obstacle limitations still need review; displayed 18 → 15 was confirmed illegal |
| **Mandatory movement when legal (SK-DEC-022)** | **Accepted**: player must move to a legal adjacent hex (back/sideways allowed); voluntary Skip/standing still forbidden; if **no legal move**, the movement step may end as a forced blocked exception. Whether movement costs energy is **NOT approved** |
| Normal **Drop In only against an edge-sharing adjacent opponent** | Dice resolution, card effects and other attack conditions are separate |

## 2. Owner-accepted **design experiments**, NOT finalized rules

| Experiment | What has been agreed for testing |
| --- | --- |
| **Energy ceiling 5** | Try 5 rather than the currently implemented 4 |
| **Up to 2 dice** for each attacker and defender | Experimental comparison: at energy 1, roll 1; at 2–5, roll 2. The highest-of-two resolution is the assistant's working method |
| **Equal best dice: no energy damage to either player** | Explicitly accepted for experimentation on 2026-11-16; **not yet in the game engine** |

The trial has not yet been playtested or proved balanced. Approval to **try** these does not authorize implementing or merging anything.

## 3. Accepted general fall recovery — SK-DEC-023 (design only, NOT implemented)

**Owner confirmed on 2026-11-19 (SK-DEC-023):** Every zero-energy fall—Shark, terrain, Big Wave/Sunburn or combat—leaves the surfer **fallen on the final cell of the damage effect**, without an additional fall-caused backward move. At the **start of their next own turn**, they stand **on the same cell** and choose their recovery total:

| Choice at start of own turn | Final energy | What happens |
| --- | ---: | --- |
| **No rescue card** | **1** | Stand on the same Shark, continue normal turn |
| **Swimming Fin** | **2** | Discard the card, stand on the same Shark, continue normal turn |
| **Lifeguard Float** | **3** | Discard the card, stand on the same Shark, continue normal turn |

**Each card is a bonus of +1/+2 above the automatic 1-energy baseline**, not an extra play. Recovery at the **next personal turn** applies everywhere and allows normal movement that turn (**mandatory when a legal move exists**, SK-DEC-022); no extra maneuver is granted. **SK-DEC-024 Accepted:** Using Fin or Float on the recovery turn **consumes the ordinary tactical card / Drop In action**; with no rescue card this action-slot cost does not apply. Standing up alone is not re-entering terrain. This **extends SK-DEC-020** from Sharks to all falls and retains **SK-DEC-018 Superseded**. Details: [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

**SK-DEC-021 ACCEPTED (2026-11-17):** A fallen surfer **continues occupying their Shark cell**; no other surfer can enter it by normal maneuver or perform normal Drop In against that fallen surfer. The other surfer may choose another legal move or independently allowed action. At recovery, the surfer remains the cell's occupant until moving out. This is the board-occupancy rule, not approval of interactions with special card displacement.

**2026-11-19 newest accepted decision:** **SK-DEC-024** — A Fin/Float used to recover at 2/3 energy **uses the current turn's tactical action** but the player **still makes the normal mandatory maneuver**. The **low penalty of a fall without a card** remains an active balancing question, not owner approval of any new setback. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

**2026-11-19 latest accepted design:** **SK-DEC-023 generalizes next-own-turn same-cell recovery to any zero-energy fall**. The earlier card study's unresolved Big Wave recovery is now settled **as a rule, not a new executed study**. Special displacement and normal Drop In targeting outside the Shark context are still open. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md).

**2026-11-19 controlled card responses and 2-/7-player comparisons — [CARD_AND_PLAYER_COUNT_STUDY.md](CARD_AND_PLAYER_COUNT_STUDY.md):** Executed further **isolated deterministic geometry/energy/card-copy assertions** with an explicitly scripted 64-card deck scenario, trial one-after-move draw/hand cap, and same early routes. A held **Big Wave** used by Carla after Ana recovers/moves to cell 35 causes **a new non-Shark fall** if Ana took no recovery card (**1→0**) or Fin (**2→0**); with Float (**3→1**) she survives to win on round 7. **Recovery from non-Shark falls is NOT approved**, so affected branches stop rather than inventing outcomes. Controlled two-player direct lines finish on round 7 with the first mover winning (13 validated moves, two Shark falls). Two seven-player sequences from actual starts 0–6 were also verified: an all-Shark-avoiding configuration yields **E (start 4) winning in round 7 after 47 moves, zero falls**; an early-Shark configuration yields **A (start 0) winning in round 7 after 43 moves, four Shark falls**. **Route policy and turn order matter**, but these are constructed examples, **not observed win rates**. Next design priority: **general non-Shark fall recovery**, then recovery-card action cost and controlled full-turn playtests. No new accepted numerical rules or game-code changes.

**2026-11-19 controlled four-player study — [CONTROLLED_FOUR_PLAYER_MATCH.md](CONTROLLED_FOUR_PLAYER_MATCH.md):** Two **executed deterministic design-model walkthroughs** based on live geometry, approved 2-energy/Shark-fall/occupation/compulsory-movement rules, and explicitly **unapproved zero-cost normal travel**. Scenario A: a scripted first-to-beach race with starts 0–3, **25 legal moves in 6 complete rounds plus one winning turn**, **Ana wins at cell 49 on round 7**, two Shark falls (Ana 28, Diogo 31), one no-card 1-energy recovery, one Float 3-energy recovery, and one **hypothetical −1 Drop In with fixed dice**. The Shark fall does not delay Ana's 7-move shortcut vs an 8-move bypass. Scenario B: **a reachable four-player forced Shark entry**: 24 validated movements over six rounds put Ana 21, Bruno 14, Carla 18, Diogo 25, leaving **vacant Shark 28 as Ana's sole legal neighbor**; on round 7 she must enter/fall, then on round 8 recover on 28 at 1 energy and continue to 35. Both scenarios enforce **true adjacency, turn order and one-surfer-per-cell occupancy**. The trap requires coordinated choices and is not evidence of normal match frequency. **No random hands/post-move draws, application-engine tests or actual human playtest were performed**. **Those follow-up comparisons have now been executed as separate controlled scenarios; see the newer report above.** No new mechanics accepted.

**2026-11-17 verified movement/balance desk assessment — [MANDATORY_MOVEMENT_BALANCE.md](MANDATORY_MOVEMENT_BALANCE.md):** Normal movement remains compulsory when legal (SK-DEC-022). The source geometry confirms that **from cell 21, if other surfers occupy 14, 18 and 25, the only free neighbor can be Shark 28**, a possible tactical position with **four players**; a five-player congestion setup can similarly make **28/29** the only choices from cell 25. **The owner likes compulsory Shark entry**; this is positive feedback, not independent approval for new effects. Comparing route lengths from actual starts: in 2/4-player games, each starter has **7 moves through a Shark / 8 avoiding them**; in seven-player games, starts 4–6 have a **Shark-free route of 7** while starts 0–3 need **8**, revealing a start-position fairness risk. **Compulsory −1-energy travel** drops a 2-energy surfer after **two safe movements**; **0-energy normal movement is therefore the preferred unapproved trial**. Under the accepted same-tile Shark recovery, an unrescued shortcut still reaches the beach in 7 moves (only lower energy), and falling prevents normal Drop In until recovery, so a Shark shortcut can be strategically *beneficial*. Back-and-forth cycling, blocked-turn automation, special cards and seven-player fairness remain unresolved. The detailed geometric and exact dice-count methods are in the linked report. Current engine still permits Skip/pass; gameplay changes and full-match tests are unauthorized.

**Still open:** Forced displacement and special card targeting of fallen surfers, **normal Drop In targeting after non-Shark falls**, whether EVERY fall (even without a card) should separately cost the next turn's tactical action, safe completion when all neighbors are blocked, numeric combat/card balancing, and whether same-cell recovery makes the Shark shortcut too favorable. **All zero-energy fall recovery IS now generalized under SK-DEC-023**, but special attack/forced-movement edge cases are not. **No gameplay code, suite tests, merge or deployment.**

## 4. Recommended integrated whole-match v0.1 — **assistant proposal only**

The newest comprehensive synthesis is [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md) (**P-15, not approved**). It is now the preferred end-to-end tabletop trial and takes precedence **as a proposal** over earlier isolated P-06 through P-13 draft variants. Do not treat earlier round-10 or all-damage-−1 candidates as accepted. The earlier individual research below remains context.

- Start at 2 energy, trial cap 5, edge-adjacent geometry, no Rest, fall at 0.
- Per active turn, **optionally play one card OR attempt one adjacent Drop In**, then make one legal **free normal maneuver** when possible; draw a card after moving. No separate free repeatable +1-energy choice (it would produce 2 → 5 in only three personal turns).
- Experimental Drop In: up to two d6 per surfer, compare the highest results; **tie without energy loss** (owner accepted for trial); a strictly lower result loses **1 energy** (damage value still an assistant proposal). **P-10 candidate:** when the attacker strictly wins, they may exchange hexagons with the defender; if used, this consumes the attacker's regular maneuver, avoiding a double step (not approved). **P-11 candidate:** resolve combat damage before exchanging, apply terrain once for **both entering surfers**, and remove any fallen surfer's solid board occupancy; if the defender falls from the attack, the attacker can instead move into the freed adjacent cell as their one maneuver (not approved).
- **Owner-approved Shark −2 (SK-DEC-019)**, matching the current engine; Storm −1 and Big Wave −2 are existing code values, with broader card/energy tuning still under review. Any prior proposal to reduce Shark to −1 is **superseded**. Review Energy x3, Coconut, Island +2 and the potentially obsolete Bottled Water.
- **Universal recovery SK-DEC-023 Accepted:** All zero-energy falls remain on their final occupied hex; next personal turn stand there at **1 / 2 / 3 energy** (no card / Fin / Float), take required legal movement, no immediate card reaction or bonus movement. This **generalizes SK-DEC-020** (Shark-specific; Shark −2 persists); **SK-DEC-018 Superseded**. Special forced movement/attack cases remain open. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md). A 12-round cap remains just a trial.

### Known linked failure modes

1. **Combat too weak:** tie ≈22% with equal two-die pools; a decisive combat under P-09 only takes 1 energy, possibly not enough to interrupt a race.
2. **Healing snowball:** cards and any automatic growth can make an energy-5 surfer effectively immune to significant interruption, even though it does not roll more dice than a surfer at energy 2.
3. **Shark shortcut vs bypass:** four Sharks lie on the initial central row. The 7-maneuver shortcut crosses Shark 28; a legal 8-maneuver bypass avoids Sharks. **Shark −2 is now Accepted (SK-DEC-019)**: entering it from 2 energy causes a fall, but SK-DEC-020 lets the surfer keep that tile and recover next own turn, so the shortcut's risk/reward needs playtesting.
4. **Luck vs strategy:** free movement and card-draw dependency could turn tactics into card lottery; compulsory movement alone still allows backward-forward stalling.
5. **Blocked turns / player count:** 2, 4 and 7 player congestion, Stones, fall occupancy, hand limits, the current **12-round proposal** and tie-break need validation.
6. **Fast finish vs tactical relevance:** a theoretical start-to-goal path is seven legal maneuvers; attacks must influence race outcome, not just slowly deplete health.

## 5. Review workstreams (same epic, no duplicate issues)

| Workstream | Status and detail |
| --- | --- |
| Board / movement | Six directions, true adjacency **and movement when legal (SK-DEC-022) Accepted**; energy cost and special card movement still open — [MOVEMENT.md](MOVEMENT.md) |
| Drop In / dice | Range accepted; cap/tie experimental; P-10 optional exchange proposed — [ATTACK.md](ATTACK.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md) |
| Energy / cards / hazards | Start 2 accepted; cap 5 experimental; recovery cards now part of P-13 tactical balance — [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) |
| Turn structure / anti-stall | **No Rest and compulsory movement when legal accepted (SK-DEC-022)**; free movement COST and fully blocked transition remain unresolved — [TURNS_AND_PACING.md](TURNS_AND_PACING.md) |
| Mandatory movement, Sharks, route fairness | **2026-11-17 deterministic graph and dice assessment**, including 2/4/7-player start-position asymmetry and forced Shark examples — [MANDATORY_MOVEMENT_BALANCE.md](MANDATORY_MOVEMENT_BALANCE.md) |
| Four-player controlled race and forced hazard | **2026-11-19 executed design-model sequences** with 25-move beach finish and 32-move Shark-trap recovery; unapproved turn/card assumptions explicit — [CONTROLLED_FOUR_PLAYER_MATCH.md](CONTROLLED_FOUR_PLAYER_MATCH.md) |
| Controlled cards and 2-/7-player routes | **2026-11-19** Big Wave counterplay, Float/Fin thresholds, 2-player initiative and two collision-free 7-player races — [CARD_AND_PLAYER_COUNT_STUDY.md](CARD_AND_PLAYER_COUNT_STUDY.md) |
| Complete-match design | A/B/C alternatives, P-09 core and P-10 positional stress review — [OPTIONS.md](OPTIONS.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md); earlier [COMPLETE_MATCH.md](COMPLETE_MATCH.md) |
| Victory and comeback | P-12 normal return vs P-13 reaction rescue under review; victory/round cap open — [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md), [OPTIONS.md](OPTIONS.md) |

## 6. Full gameplay proposal prepared (P-15, NOT approved)

**Owner request:** No code; provide **clear definitions and the full picture** from start to end. See **[GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md)**, the current integrated design reference.

**Updated candidate whole-match system:** Approved: 2 initial energy, Shark −2, normal movement **mandatory when legal (SK-DEC-022)**, fall/return **on the same Shark cell** at 1/2/3 energy next own turn (no card/Fin/Float), fallen Shark occupant blocks normal entry/Drop In. Still candidate: **0 energy cost for ordinary movement**, one optional card OR adjacent Drop In before the maneuver, after-move draw, max-5 energy experiment, up-to-2-dice/tie-no-damage trial, strictly lost duel −1 energy, optional positional swap consuming maneuver, and first beach arrival with a possible 12-round cap. **Do not reuse P-15's historical immediate rescue / sea-ward respawn**. Full sequence is not yet playtested.

**Why these are linked:** Frequent dramatic falls are explicitly approved as identity; an auto-return that removes players for entire rounds is not. The owner retained Shark −2, which causes a fall at the approved 2-energy start, so the actual decision is how to recover and keep the shortcut risk strategic; the previous Shark −1 experiment is superseded. Rescue becomes a scarce strategic choice rather than mandatory eligibility to play. Successful Drop In needs positional meaning or strong surfers can ignore weak damage. The exact fall frequency, cards/healing snowball, round cap and rescue timing remain **unverified**.

**Next step:** Position-by-position three-player tabletop scenario comparing the full v0.1 prototype with the previous inactive-turn recovery; then stressed 2/4/7-player variants. The walkthrough in the blueprint is explicitly **illustrative, not an executed match**. Update only the affected design documents after actual owner feedback.

## 7. Previously agreed design north star

**Owner clarification and explicit confirmation on 2026-11-16 (accepted direction SK-DEC-017, NOT individual rule approval):** The initial game deliberately made surfers **fall many times**, but recovery mechanisms created stalls. The owner is encouraged by the tactical direction yet has lost the overview after multiple local tweaks. Preserve **fall frequency, suspense and meaningful insurance**, while removing **long periods unable to play**. **Do not redesign Surf King into a no-fall race.**

**Core design loop:** Start at 2 energy → maneuver toward beach → choose risky Shark shortcut, card or adjacent Drop In → perhaps fall → **Shark fall stays on its tile; on the next own turn recover with 1 energy or upgrade to 2/3 using a rescue card** → keep racing toward beach. Other causes of fall still need aligned review. This is a **hypothesis for whole-match paper playtest**, not an implemented rulebook.

**Critical distinction:** **How often players fall** and **how long they are punished for falling** are **separate balance parameters**. Existing assistant P-09 combinations (free movement + damage reduced to 1 + max 5 energy + only 1 damage per duel + no-damage ties) may make falls too rare, even if they cure the stall. We should **not finalize those proposed damage reductions**, nor automatically make all risks safe. Balance the full loop, not only the dice.

**What is fixed:** Owner-confirmed 2 starting energy (`SK-DEC-016`), fall at 0, no Rest, six true edge-adjacent directions, adjacent Drop In, **Shark −2 SK-DEC-019**, **same-cell recovery SK-DEC-020**, **fallen Shark occupancy SK-DEC-021**, and **mandatory movement when legal SK-DEC-022** (old `SK-DEC-018` Superseded). All upstream visual decisions through `SK-DEC-015` are preserved. **Accepted for experimentation only:** 5 energy maximum, up to 2 combat dice, dice tie = no energy damage. **All other turn, card, swap, terrain and comeback mechanics remain assistant candidates.**

**2026-11-19 recovery decision:** SK-DEC-023 explicitly **generalizes the approved Shark recovery to all zero-energy falls** at their final cell, including Big Wave and combat, with next-own-turn **1 / 2 / 3 energy**. The controlled [card comparison](CARD_AND_PLAYER_COUNT_STUDY.md) historically stopped a Big Wave branch because the rule was not defined *at that time*. The new decision resolves that design gap, **but no new match simulation was executed**. Earlier sea-ward-fallback P-12/P-13 proposals remain superseded.

**Next decisive design action (2026-11-19):** **SK-DEC-024 Accepted**: Fin/Float now use the normal tactical action and **never replace the mandatory movement**. The remaining balance question is **what consequence a no-card fall should have**, given same-hex 1-energy recovery preserves the full seven-move Shark shortcut. **Unapproved candidate:** every fall costs the next own turn's tactical action (even with no rescue card), but still allows ordinary mandatory movement. Evaluate this against the no-extra-penalty baseline and possible hand/card loss before any further approval. Then simulate a consistent 2/4/7-player full turn/card economy, forced displacement, blocked cells, initial-start differences and first-mover bias. The actual app engine and game tests remain unexecuted.

## 8. How to resume in a new conversation

1. Read the latest [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), including its chronological comments.
2. Read this INDEX, **[CARD_AND_PLAYER_COUNT_STUDY.md](CARD_AND_PLAYER_COUNT_STUDY.md)**, **[CONTROLLED_FOUR_PLAYER_MATCH.md](CONTROLLED_FOUR_PLAYER_MATCH.md)**, **[MANDATORY_MOVEMENT_BALANCE.md](MANDATORY_MOVEMENT_BALANCE.md)**, **[GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md)**, then supporting [ATTACK.md](ATTACK.md), [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) on draft PR #12.
3. Recheck GitHub `main`, `AGENTS.md`, mandatory docs, current issue/PR status and relevant code/tests before technical decisions.
4. Continue from the **Next action** above; report owner decisions in Portuguese and update Issue #11 comments and affected English draft Markdown for each material interaction.
5. Never modify gameplay, merge, deploy or publish under this design-review epic. A separate scoped implementation issue and explicit owner approval will be needed after game rules are settled.

**Decision ID note:** `main` owns visual SK-DEC-013 through SK-DEC-015; this draft owns gameplay SK-DEC-016 (start 2), SK-DEC-017 (fall-heavy identity), SK-DEC-018 (superseded old Shark retreat), SK-DEC-019 (Shark −2), SK-DEC-020 (approved same-tile next-turn 1/2/3 recovery) SK-DEC-021 (fallen occupant blocks normal entry and Drop In), SK-DEC-022 (mandatory movement, blocked-only exception), SK-DEC-023 (universal zero-energy fall recovery), and SK-DEC-024 (Fin/Float recovery consumes normal tactical action). Preserve IDs. No gameplay code changes, merge or deploy.
