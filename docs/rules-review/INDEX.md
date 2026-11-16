# Surf King — Gameplay Design Epic / Rules Review Hub

**Status:** Active game-design exploration; **not** a finalized rulebook or implementation authorization.
**Single epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) — canonical status, chronological owner feedback and next action.
**Living documentation:** [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12), branch `docs/11-progressive-rules-review` — Markdown only, **do not merge without explicit approval**.
**Latest checked code:** `main` `e79c02c8f008c70dc84b5273d3ce0b20e9c78410` (2026-11-16). Game rules are not implemented from this draft.

## North star

**Frequent and dramatic falls, but no long recovery downtime**, within a **fast, easy-to-learn, portable, strategic, fun and replayable beach race**. The owner **explicitly confirmed this as the project's gameplay direction** on 2026-11-16 (**SK-DEC-015 Accepted**). The assistant must lead integrated full-match design, prioritize **cost of falling** separately from **frequency of falling**, spot stalled loops and recommend a small coherent package. **Never ask the owner to solve isolated mechanics.**

Keep one coherent whole-match candidate visible while considering one focused choice at a time. Separate proven mechanics, owner's decisions, experiments and open design proposals. Changes in this draft are **documentation only**.

## 1. Owner-confirmed design rules and product direction

| Rule | Scope |
| --- | --- |
| All surfers **start at 2 energy** | Accepted product rule; see `docs/DECISIONS.md` **SK-DEC-014** on this draft branch |
| **Frequent falls + rapid return to meaningful play** | **Approved overall direction, SK-DEC-015**; exact recovery/card/damage mechanics remain experimental |
| **0 energy means falling off the surfboard** | Not resting; timing and method of recovery unresolved |
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

## 3. Current coherent working package — P-09 to P-13, **assistant proposals only**

- Start at 2 energy, trial cap 5, edge-adjacent geometry, no Rest, fall at 0.
- Per active turn, **optionally play one card OR attempt one adjacent Drop In**, then make one legal **free normal maneuver** when possible; draw a card after moving. No separate free repeatable +1-energy choice (it would produce 2 → 5 in only three personal turns).
- Experimental Drop In: up to two d6 per surfer, compare the highest results; **tie without energy loss** (owner accepted for trial); a strictly lower result loses **1 energy** (damage value still an assistant proposal). **P-10 candidate:** when the attacker strictly wins, they may exchange hexagons with the defender; if used, this consumes the attacker's regular maneuver, avoiding a double step (not approved). **P-11 candidate:** resolve combat damage before exchanging, apply terrain once for **both entering surfers**, and remove any fallen surfer's solid board occupancy; if the defender falls from the attack, the attacker can instead move into the freed adjacent cell as their one maneuver (not approved).
- Proposed first-pass obstacle/card retune: **Shark -1**, **Big Wave -1** instead of their currently implemented -2; review energy-restoration cards (+3 and full refill), Island +2 and Bottled Water's now-obsolete waiver.
- **P-13 strategic-rescue recommendation, not approved:** on reaching 0, a player may spend **Lifeguard Float (+2)** or **Swimming Fin (+1)** as an **immediate reaction, including on another player's turn**, to **preserve their resolved cell** and avoid the seaward fall setback; no extra maneuver or card draw. **Without / declining a rescue**, use the P-12 candidate: vacate active cell, return next own turn at 2 energy in the closest **empty hazard-free cell toward the sea** and take the normal maneuver that turn. Rescue must not undo an already resolved swap or trigger a duplicate hazard. The exact timing and sea-edge fallback remain open. [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md). Proposed victory safety: first to beach wins, with a **10-round** positional fallback; no recovery/endgame rules have been finalized.

### Known linked failure modes

1. **Combat too weak:** tie ≈22% with equal two-die pools; a decisive combat under P-09 only takes 1 energy, possibly not enough to interrupt a race.
2. **Healing snowball:** cards and any automatic growth can make an energy-5 surfer effectively immune to significant interruption, even though it does not roll more dice than a surfer at energy 2.
3. **Shark shortcut vs bypass:** code starts four Sharks in the central row; the 7-move shortest example enters Shark 28, but a valid 8-move bypass avoids all Sharks. Current Shark -2 and Big Wave -2 can drop a starting 2-energy surfer immediately; the proposed -1 penalty offers a real speed/resilience trade-off.
4. **Luck vs strategy:** free movement and card-draw dependency could turn tactics into card lottery; compulsory movement alone still allows backward-forward stalling.
5. **Blocked turns / player count:** 2, 4 and 7 player congestion, Stones, fall occupancy, hand limits, 10-round cutoff and a winner tie-break need validation.
6. **Fast finish vs tactical relevance:** a theoretical start-to-goal path is seven legal maneuvers; attacks must influence race outcome, not just slowly deplete health.

## 4. Review workstreams (same epic, no duplicate issues)

| Workstream | Status and detail |
| --- | --- |
| Board / movement | Direction and true adjacency accepted; other restrictions open — [MOVEMENT.md](MOVEMENT.md) |
| Drop In / dice | Range accepted; cap/tie experimental; P-10 optional exchange proposed — [ATTACK.md](ATTACK.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md) |
| Energy / cards / hazards | Start 2 accepted; cap 5 experimental; recovery cards now part of P-13 tactical balance — [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md) |
| Turn structure / anti-stall | No Rest accepted; full loop, forced blocks and finite ending pending — [TURNS_AND_PACING.md](TURNS_AND_PACING.md) |
| Complete-match design | A/B/C alternatives, P-09 core and P-10 positional stress review — [OPTIONS.md](OPTIONS.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md); earlier [COMPLETE_MATCH.md](COMPLETE_MATCH.md) |
| Victory and comeback | P-12 normal return vs P-13 reaction rescue under review; victory/round cap open — [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md), [OPTIONS.md](OPTIONS.md) |

## 5. Strategic pivot — the owner wants **frequent falls without stalling**

**Owner clarification and explicit confirmation on 2026-11-16 (accepted direction SK-DEC-015, NOT individual rule approval):** The initial game deliberately made surfers **fall many times**, but recovery mechanisms created stalls. The owner is encouraged by the tactical direction yet has lost the overview after multiple local tweaks. Preserve **fall frequency, suspense and meaningful insurance**, while removing **long periods unable to play**. **Do not redesign Surf King into a no-fall race.**

**Core design loop:** Start at 2 energy → maneuver toward beach → choose risky Shark shortcut, card or adjacent Drop In → perhaps fall → with rare rescue card preserve position and continue; without rescue lose position but **take a normal turn again soon** → contest leadership → beach victory. This is a **hypothesis for whole-match paper playtest**, not an implemented rulebook.

**Critical distinction:** **How often players fall** and **how long they are punished for falling** are **separate balance parameters**. Existing assistant P-09 combinations (free movement + damage reduced to 1 + max 5 energy + only 1 damage per duel + no-damage ties) may make falls too rare, even if they cure the stall. We should **not finalize those proposed damage reductions**, nor automatically make all risks safe. Balance the full loop, not only the dice.

**What is fixed:** Owner-confirmed 2 starting energy (`SK-DEC-014` on this draft, latest art decision `SK-DEC-013` is preserved), 0-energy fall, no Rest, six edge-adjacent normal move directions, edge-adjacent normal Drop In. **Accepted for experimentation only:** 5 energy maximum, up to 2 combat dice, dice tie = no energy damage. **All other turn, card, swap, terrain and comeback mechanics remain assistant candidates.**

**Preferred direction for evaluating P-12/P-13:** A **fall costs position, not a full inactive turn**. Lifeguard Float / Swimming Fin are optional limited **fall insurance** preserving progress (assistant proposal); no-card players return to meaningful play at next own turn with a small seaward positional setback (assistant proposal). **No voluntary reset-to-full-energy fall**, no extra free move, no guaranteed win based on lucky card access.

**Next decisive work:** Draft and compare a **single complete 3-player race** (early start, central Sharks and cards, Drop In, 1–3 falls, late comeback and beach finish) using the old skip-turn penalty versus the position-only penalty. Track **falls per player, missed turns, chances to catch up, rescue value, and length**, then test 2/4/7-player stress cases. These are **playtest goals**, not numerical claims or simulated measurements. See [FALL_AND_RESCUE.md](FALL_AND_RESCUE.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md) and [OPTIONS.md](OPTIONS.md).

## 6. How to resume in a new conversation

1. Read the latest [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), including its chronological comments.
2. Read this INDEX and [ATTACK.md](ATTACK.md), [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [OPTIONS.md](OPTIONS.md) on draft PR #12.
3. Recheck GitHub `main`, `AGENTS.md`, mandatory docs, current issue/PR status and relevant code/tests before technical decisions.
4. Continue from the **Next action** above; report owner decisions in Portuguese and update Issue #11 comments and affected English draft Markdown for each material interaction.
5. Never modify gameplay, merge, deploy or publish under this design-review epic. A separate scoped implementation issue and explicit owner approval will be needed after game rules are settled.

**Decision ID note:** `main` accepted **SK-DEC-013 rigged 3D character evaluation**; draft **SK-DEC-014** confirms 2 starting energy, and **SK-DEC-015** now records the owner-confirmed high-level gameplay identity. Preserve all upstream decisions and do not interpret SK-DEC-015 as acceptance of individual damage/return/card rules.
