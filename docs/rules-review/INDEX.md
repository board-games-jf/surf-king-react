# Surf King — Gameplay Design Epic / Rules Review Hub

**Status:** Active game-design exploration; **not** a finalized rulebook or implementation authorization.
**Single epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) — canonical status, chronological owner feedback and next action.
**Living documentation:** [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12), branch `docs/11-progressive-rules-review` — Markdown only, **do not merge without explicit approval**.
**Current single complete-match design reference (NOT approved):** [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md) — recommended v0.1 loop, decisions, illustrative 3-player race, interdependencies and playtest gates.
**Latest checked code:** `main` `ea8c4d3a3c7d62525fbf14aab0e711a4e1c0ce2e` (2026-11-16). Game rules are not implemented from this draft.

## North star

**Frequent and dramatic falls, but no long recovery downtime**, within a **fast, easy-to-learn, portable, strategic, fun and replayable beach race**. The owner **explicitly confirmed this as the project's gameplay direction** on 2026-11-16 (**SK-DEC-017 Accepted**). The assistant must lead integrated full-match design, prioritize **cost of falling** separately from **frequency of falling**, spot stalled loops and recommend a small coherent package. **Never ask the owner to solve isolated mechanics.**

Keep one coherent whole-match candidate visible while considering one focused choice at a time. Separate proven mechanics, owner's decisions, experiments and open design proposals. Changes in this draft are **documentation only**.

## 1. Owner-confirmed design rules and product direction

| Rule | Scope |
| --- | --- |
| All surfers **start at 2 energy** | Accepted product rule; see `docs/DECISIONS.md` **SK-DEC-016** on this draft branch |
| **Frequent falls + rapid return to meaningful play** | **Approved overall direction, SK-DEC-017**; exact recovery/card/damage mechanics remain experimental |
| **0 energy means falling off the surfboard** | Not resting; timing and method of recovery unresolved |
| **Shark-caused fall return (SK-DEC-018)** | **Accepted design rule:** rescue with Float/Fin keeps surfer on Shark; otherwise vacate and return safe oceanward on next own active turn. Does not automatically settle other fall causes. |
| **No Rest mechanic** | No voluntary or automatic Rest action; forced inability to move needs a separate safety rule |
| Normal movement in **any of six edge-sharing directions**, backward included | Any adjacency, occupancy or obstacle limitations still need review; displayed 18 → 15 was confirmed illegal |
| Normal **Drop In only against an edge-sharing adjacent opponent** | Dice resolution, card effects and other attack conditions are separate |

## 2. Owner-accepted **design experiments**, NOT finalized rules

| Experiment | What has been agreed for testing |
| --- | --- |
| **Energy ceiling 5** | Try 5 rather than the currently implemented 4 |
| **Up to 2 dice** for each attacker and defender | Experimental comparison: at energy 1, roll 1; at 2–5, roll 2. The highest-of-two resolution is the assistant's working method |
| **Equal best dice: no energy damage to either player** | Explicitly accepted for experimentation on 2026-11-16; **not yet in the game engine** |

The trial has not yet been playtested or proved balanced. Approval to **try** these does not authorize implementing or merging anything.

## 3. Latest owner direction: fall stays on Shark, 1-energy return (P-19, NOT yet accepted)

**Owner's latest idea (2026-11-16):** Remove backward placement entirely. A surfer entering a Shark takes the **approved −2 energy (SK-DEC-019)** and, at 0, **falls on the Shark and remains there**. **At the start of their next own turn** they stand up **on that same tile with 1 energy**, able to maneuver normally. No retreat, no delayed teleport and no full missed turn. This is a clear **owner-proposed revision**; it conflicts with currently accepted SK-DEC-018's sea-ward return at 2 energy, so **do not treat it as ratified until explicit confirmation**.

**Assistant's linked card-balance recommendation, P-19 (unapproved):** Existing Swimming Fin +1 becomes pointless if it restores the **same 1 energy** as a free no-card return. Test **no card = 1, Fin = 2, Float = 3** on the next own turn, interpreting recovery cards' +1/+2 as **bonuses to the baseline**. Cards should cost the normal tactical card slot and not grant extra movement. This is a **suggested rebalance**, not a previously approved card value.

**Critical risk:** If a fallen surfer already advanced to the Shark and can move again on their next personal turn, there is **no position/movement punishment**, only vulnerability at energy 1. With Shark −2 and 2 initial energy, this may make the shortcut attractive **without** a rescue card and reduce the cards' strategic importance. Check this before locking the new design. Crowding/occupancy while a surfer is fallen on the Shark also remains unresolved.

**Status:** SK-DEC-019 **accepted Shark −2**. SK-DEC-018 currently **accepted original retreat**. P-19 **pending owner approval**. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) P-19.

## 4. Earlier Shark fall design — SK-DEC-018 Accepted, challenged by P-19

**Explicitly defined at the owner's request on 2026-11-16:** A Shark tile reduces a surfer to zero → optional immediate **Lifeguard Float** to stay on that Shark at **2 energy**, or **Swimming Fin** to stay at **1 energy**. Either card is discarded, gives no additional maneuver or draw, and the **same Shark entry is not re-triggered**. Without/declining rescue, the fallen surfer **vacates** the tile; at the start of their **next personal turn** they return at **2 energy** to the nearest **empty, obstacle-free legal adjacent hex toward the ocean** (e.g., **28 → 21**). If blocked, use the nearest safe vacant oceanward hex **no closer to the beach**; at the ocean start edge use a safe vacant starting-row hex. The surfer **plays normally on that turn** — no skipped turn. A fall animation marker may show the original landing but never blocks its cell.

**Scope:** Shark-specific falling is now **accepted as a design rule**, and its precise timing/return cell is no longer an unresolved proposal. Applying the same rules to attacks, cards, other obstacles, simultaneous effects or positional swaps **still needs evaluation**. All game source remains unchanged. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md), [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md).

## 5. P-17 challenge — is the one-hex fall penalty meaningful?

**Owner objection (2026-11-16):** "mas se volta pra onde tava qual o sentido?" The currently accepted **SK-DEC-018** Shark rule (fall at 28 → next own turn return at 21 with 2 energy → ordinary maneuver may re-enter 28) costs a forward move and re-triggers the Shark, but may **feel like negligible progress loss or reward an energy refill loop at 1 energy**. The owner has **not yet approved changing SK-DEC-018**.

**Assistant P-17 revision to review, NOT approved:** On an unrecovered Shark fall, **immediately bounce back to the previously occupied safe tile** (28→21 if entering from 21), **end the current movement**, and **play normally on the next personal turn with 1 energy**. A rescue instead consumes Float/Fin and keeps the Shark tile at 2/1 energy, with no extra move. This maintains the real cost of the failed maneuver, prevents farming 2 energy by repeatedly falling, and still avoids multi-turn inactivity. Alternate safe oceanward tile if previous one is occupied/hazardous; forced displacement and re-entry edge cases remain open.

**Historical Shark −1 analysis, superseded by SK-DEC-019:** Under the rejected provisional Shark −1, an energy-2 surfer can **choose** a 7-maneuver Shark shortcut instead of an 8-maneuver safe route (survives at 1 energy, saves one move); an energy-1 surfer needs a held Float/Fin to **spend** for the shortcut; at energy 1 **without rescue**, the fall is certain and choosing the Shark would be a mistake, not a clever healing move. Even with Float/Fin, sacrificing a rare card just to save one move may be a weak payoff. **Do not add intentional fall-to-heal rewards**; examine route reward versus card cost. This is a design observation, not an accepted numerical rule.

**Owner's newest P-17 clarification, NOT a settled revision:** The fallen surfer is **shown falling on the Shark**. With Float / Fin they spend it immediately and **remain at the Shark** (2 / 1 energy, no repeat activation); otherwise the move **fails** and they **retreat immediately** to the previous **safe vacant** tile. If occupied or obstacle-bearing, search nearest safe vacant **oceanward** tile (prefer adjacent then same lane then cell ID), without displacing another surfer or returning toward beach. The assistant recommends **1 energy** on unsaved retreat to prevent intentional fall-to-refill. This last value and immediate bounce differ from accepted SK-DEC-018 and are **not approved**. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) contains the complete edge-case proposal.

**Current status:** Preserve **SK-DEC-018 Accepted** (return next own turn at 2) until the owner accepts a change. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) P-17 for the exact issue and proposal.

## 6. Recommended integrated whole-match v0.1 — **assistant proposal only**

The newest comprehensive synthesis is [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md) (**P-15, not approved**). It is now the preferred end-to-end tabletop trial and takes precedence **as a proposal** over earlier isolated P-06 through P-13 draft variants. Do not treat earlier round-10 or all-damage-−1 candidates as accepted. The earlier individual research below remains context.

- Start at 2 energy, trial cap 5, edge-adjacent geometry, no Rest, fall at 0.
- Per active turn, **optionally play one card OR attempt one adjacent Drop In**, then make one legal **free normal maneuver** when possible; draw a card after moving. No separate free repeatable +1-energy choice (it would produce 2 → 5 in only three personal turns).
- Experimental Drop In: up to two d6 per surfer, compare the highest results; **tie without energy loss** (owner accepted for trial); a strictly lower result loses **1 energy** (damage value still an assistant proposal). **P-10 candidate:** when the attacker strictly wins, they may exchange hexagons with the defender; if used, this consumes the attacker's regular maneuver, avoiding a double step (not approved). **P-11 candidate:** resolve combat damage before exchanging, apply terrain once for **both entering surfers**, and remove any fallen surfer's solid board occupancy; if the defender falls from the attack, the attacker can instead move into the freed adjacent cell as their one maneuver (not approved).
- **Owner-approved Shark −2 (SK-DEC-019)**, matching the current engine; Storm −1 and Big Wave −2 are existing code values, with broader card/energy tuning still under review. Any prior proposal to reduce Shark to −1 is **superseded**. Review Energy x3, Coconut, Island +2 and the potentially obsolete Bottled Water.
- **Shark falls are now defined (SK-DEC-018 Accepted):** a rescue card immediately preserves the Shark cell with Float +2 / Fin +1; without one the surfer vacates and returns next own turn to a vacant safe sea-ward hex at 2 energy and can move. **P-13 for non-Shark falls remains a proposal**; precise exchanges and other terrain causes have not been approved. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md). Endgame cap is an open **12-round tabletop candidate** in [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md), not an approved rule.

### Known linked failure modes

1. **Combat too weak:** tie ≈22% with equal two-die pools; a decisive combat under P-09 only takes 1 energy, possibly not enough to interrupt a race.
2. **Healing snowball:** cards and any automatic growth can make an energy-5 surfer effectively immune to significant interruption, even though it does not roll more dice than a surfer at energy 2.
3. **Shark shortcut vs bypass:** code starts four Sharks in the central row; the 7-move shortest example enters Shark 28, but a valid 8-move bypass avoids all Sharks. Current Shark -2 and Big Wave -2 can drop a starting 2-energy surfer immediately; the proposed -1 penalty offers a real speed/resilience trade-off.
4. **Luck vs strategy:** free movement and card-draw dependency could turn tactics into card lottery; compulsory movement alone still allows backward-forward stalling.
5. **Blocked turns / player count:** 2, 4 and 7 player congestion, Stones, fall occupancy, hand limits, the current **12-round proposal** and tie-break need validation.
6. **Fast finish vs tactical relevance:** a theoretical start-to-goal path is seven legal maneuvers; attacks must influence race outcome, not just slowly deplete health.

## 7. Review workstreams (same epic, no duplicate issues)

| Workstream | Status and detail |
| --- | --- |
| Board / movement | Direction and true adjacency accepted; other restrictions open — [MOVEMENT.md](MOVEMENT.md) |
| Drop In / dice | Range accepted; cap/tie experimental; P-10 optional exchange proposed — [ATTACK.md](ATTACK.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md) |
| Energy / cards / hazards | Start 2 accepted; cap 5 experimental; recovery cards now part of P-13 tactical balance — [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) |
| Turn structure / anti-stall | No Rest accepted; full loop, forced blocks and finite ending pending — [TURNS_AND_PACING.md](TURNS_AND_PACING.md) |
| Complete-match design | A/B/C alternatives, P-09 core and P-10 positional stress review — [OPTIONS.md](OPTIONS.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md); earlier [COMPLETE_MATCH.md](COMPLETE_MATCH.md) |
| Victory and comeback | P-12 normal return vs P-13 reaction rescue under review; victory/round cap open — [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md), [OPTIONS.md](OPTIONS.md) |

## 8. Full gameplay proposal prepared (P-15, NOT approved)

**Owner request:** No code; provide **clear definitions and the full picture** from start to end. See **[GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md)**, the current integrated design reference.

**Candidate whole-match system:** 2 starting energy + 2 cards; experimental energy max 5; free compulsory one-hex move; one optional normal card **or** adjacent Drop In, then draw after successful movement; experimental up-to-2-dice and no-damage tie; provisional 1 energy lost on strictly losing fight; optional position exchange on a strict attacker win consumes the maneuver; **approved Shark −2** / Storm −1 / Big Wave −2 for a meaningful threat (all damage proposals); optional immediate Float (+2)/Fin (+1) on a real fall preserves position, while no-card fall returns next personal turn with 2 energy and a short seaward positional setback but a normal active turn; first beach arrival wins, with provisional **12-completed-round** fallback only if necessary.

**Why these are linked:** Frequent dramatic falls are explicitly approved as identity; an auto-return that removes players for entire rounds is not. The owner retained Shark −2, which causes a fall at the approved 2-energy start, so the actual decision is how to recover and keep the shortcut risk strategic; the previous Shark −1 experiment is superseded. Rescue becomes a scarce strategic choice rather than mandatory eligibility to play. Successful Drop In needs positional meaning or strong surfers can ignore weak damage. The exact fall frequency, cards/healing snowball, round cap and rescue timing remain **unverified**.

**Next step:** Position-by-position three-player tabletop scenario comparing the full v0.1 prototype with the previous inactive-turn recovery; then stressed 2/4/7-player variants. The walkthrough in the blueprint is explicitly **illustrative, not an executed match**. Update only the affected design documents after actual owner feedback.

## 9. Previously agreed design north star

**Owner clarification and explicit confirmation on 2026-11-16 (accepted direction SK-DEC-017, NOT individual rule approval):** The initial game deliberately made surfers **fall many times**, but recovery mechanisms created stalls. The owner is encouraged by the tactical direction yet has lost the overview after multiple local tweaks. Preserve **fall frequency, suspense and meaningful insurance**, while removing **long periods unable to play**. **Do not redesign Surf King into a no-fall race.**

**Core design loop:** Start at 2 energy → maneuver toward beach → choose risky Shark shortcut, card or adjacent Drop In → perhaps fall → with rare rescue card preserve position and continue; without rescue lose position but **take a normal turn again soon** → contest leadership → beach victory. This is a **hypothesis for whole-match paper playtest**, not an implemented rulebook.

**Critical distinction:** **How often players fall** and **how long they are punished for falling** are **separate balance parameters**. Existing assistant P-09 combinations (free movement + damage reduced to 1 + max 5 energy + only 1 damage per duel + no-damage ties) may make falls too rare, even if they cure the stall. We should **not finalize those proposed damage reductions**, nor automatically make all risks safe. Balance the full loop, not only the dice.

**What is fixed:** Owner-confirmed 2 starting energy (`SK-DEC-016`), fall at 0, no Rest, six true edge-adjacent directions, edge-adjacent Drop In, and **Shark-specific fall return SK-DEC-018**. All upstream visual decisions through `SK-DEC-015` are preserved. **Accepted for experimentation only:** 5 energy maximum, up to 2 combat dice, dice tie = no energy damage. **All other turn, card, swap, terrain and comeback mechanics remain assistant candidates.**

**Preferred direction for evaluating P-12/P-13:** A **fall costs position, not a full inactive turn**. Lifeguard Float / Swimming Fin are optional limited **fall insurance** preserving progress (assistant proposal); no-card players return to meaningful play at next own turn with a small seaward positional setback (assistant proposal). **No voluntary reset-to-full-energy fall**, no extra free move, no guaranteed win based on lucky card access.

**Next decisive work:** The integrated v0.1 synthesis and schematic 3-player timeline are now in [GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md). Next compare a **position-by-position complete 3-player race** (early start, central Sharks and cards, Drop In, 1–3 falls, late comeback and beach finish) under the old skip-turn penalty versus the candidate position-only penalty. Track **falls per player, missed turns, chances to catch up, rescue value, and length**, then test 2/4/7-player stress cases. These are **playtest goals**, not numerical claims or simulated measurements. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md) and [OPTIONS.md](OPTIONS.md).

## 10. How to resume in a new conversation

1. Read the latest [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), including its chronological comments.
2. Read this INDEX, **[GAMEPLAY_BLUEPRINT.md](GAMEPLAY_BLUEPRINT.md)**, then supporting [ATTACK.md](ATTACK.md), [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) on draft PR #12.
3. Recheck GitHub `main`, `AGENTS.md`, mandatory docs, current issue/PR status and relevant code/tests before technical decisions.
4. Continue from the **Next action** above; report owner decisions in Portuguese and update Issue #11 comments and affected English draft Markdown for each material interaction.
5. Never modify gameplay, merge, deploy or publish under this design-review epic. A separate scoped implementation issue and explicit owner approval will be needed after game rules are settled.

**Decision ID note:** Current `main` owns SK-DEC-013 (3D base), SK-DEC-014 (3D board avatar) and SK-DEC-015 (male/female + poses); this draft owns SK-DEC-016 (start 2), SK-DEC-017 (frequent falls/fast recovery), SK-DEC-018 (previous accepted Shark-return rule) and SK-DEC-019 (accepted Shark −2). P-19 return-on-Shark is not yet ratified. Keep IDs unique; no code merge or deploy.
