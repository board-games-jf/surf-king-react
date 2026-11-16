# Surf King — Gameplay Design Epic / Rules Review Hub

**Status:** Active game-design exploration; **not** a finalized rulebook or implementation authorization.
**Single epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) — canonical status, chronological owner feedback and next action.
**Living documentation:** [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12), branch `docs/11-progressive-rules-review` — Markdown only, **do not merge without explicit approval**.
**Latest checked code:** `main` `df81076781a7a70845dbe079f7a8ca21a79d35e6` (2026-11-16). Game rules are not implemented from this draft.

## North star

**Fast, easy-to-learn, portable, genuinely strategic, fun and replayable.** The assistant should lead integrated game-system design: show a complete match, compare concrete alternatives, identify loops and unbalanced incentives, recommend a compact rule package, and explain trade-offs. **Never ask the owner to solve a collection of isolated mechanics.**

Keep one coherent whole-match candidate visible while considering one focused choice at a time. Separate proven mechanics, owner's decisions, experiments and open design proposals. Changes in this draft are **documentation only**.

## 1. Owner-confirmed design rules

| Rule | Scope |
| --- | --- |
| All surfers **start at 2 energy** | Accepted product rule; see `docs/DECISIONS.md` **SK-DEC-013** on this draft branch |
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

## 3. Current coherent working package — P-09 / P-10 / P-11, **assistant proposals only**

- Start at 2 energy, trial cap 5, edge-adjacent geometry, no Rest, fall at 0.
- Per active turn, **optionally play one card OR attempt one adjacent Drop In**, then make one legal **free normal maneuver** when possible; draw a card after moving. No separate free repeatable +1-energy choice (it would produce 2 → 5 in only three personal turns).
- Experimental Drop In: up to two d6 per surfer, compare the highest results; **tie without energy loss** (owner accepted for trial); a strictly lower result loses **1 energy** (damage value still an assistant proposal). **P-10 candidate:** when the attacker strictly wins, they may exchange hexagons with the defender; if used, this consumes the attacker's regular maneuver, avoiding a double step (not approved). **P-11 candidate:** resolve combat damage before exchanging, apply terrain once for **both entering surfers**, and remove any fallen surfer's solid board occupancy; if the defender falls from the attack, the attacker can instead move into the freed adjacent cell as their one maneuver (not approved).
- Proposed first-pass obstacle/card retune: **Shark -1**, **Big Wave -1** instead of their currently implemented -2; review energy-restoration cards (+3 and full refill), Island +2 and Bottled Water's now-obsolete waiver.
- Proposed fall return: rejoin on next own turn at 2 energy, without maneuver that turn. Proposed victory safety: first to beach wins, with a **10-round** positional fallback. **Neither re-entry nor round limit has been approved.**

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
| Energy / cards / hazards | Start 2 accepted; cap 5 experimental; economy/card balance pending — [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md) |
| Turn structure / anti-stall | No Rest accepted; full loop, forced blocks and finite ending pending — [TURNS_AND_PACING.md](TURNS_AND_PACING.md) |
| Complete-match design | A/B/C alternatives, P-09 core and P-10 positional stress review — [OPTIONS.md](OPTIONS.md), [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md); earlier [COMPLETE_MATCH.md](COMPLETE_MATCH.md) |
| Victory and comeback | Beach victory as implemented; final rule, rounds, tie-break and re-entry open — [OPTIONS.md](OPTIONS.md) |

## 5. Completed desk analysis and next design action

**Verified race routes (provisional layout):** From engine cell 0 to beach 49, **7 valid moves through Shark 28** versus **8 valid moves avoiding all initial Sharks**. This creates a genuine speed-versus-resilience choice without any extra progress counters.

**Exact trial combat odds (2 dice vs 2 dice):** Strict attacker win **38.97%**, strict defender win **38.97%**, owner-trial **no-damage tie 22.07%**. A win that only removes 1 energy leaves a 5-energy leader at 4 in the same leading cell; P-10's **optional occupied-cell exchange consuming the attacker's maneuver** offers a meaningful positional payoff.

**P-11 desk review (NOT approved):** Combat resolves **before** any exchange. If a defender drops to 0, they vacate, and the attacker may enter the freed adjacent hex as their single maneuver. If both remain afloat, optional exchange occurs simultaneously, using the attacker's maneuver; **both** displaced surfers resolve destination terrain **once**. Any surfer reduced to zero leaves the active board rather than remaining as a solid obstacle. No damage on dice ties and no exchange on ties.

**Important newly discovered risk:** An opponent forcibly relocated to Shark or Storm might suffer **−1 from losing combat plus −1 from hazardous entry**, falling even from 2 starting energy. This may be fun positional strategy or too punitive; it needs explicit balancing. Forced-entry hazards, falling occupancy and the exact return-cell rule are **assistant proposals**, not owner approvals.

**Recommended next analysis:** Compare a two-energy surfer suffering a two-point swap+Shark fall against the comeback rule (return next personal turn near the fall location), rescue cards and a race ending around seven to ten moves. Check whether this creates a fair penalty or an unrecoverable loss, including at seven players. Do **not** lock down an exception for forced movement until this is checked.

**Full desk evidence:** [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md), [ATTACK.md](ATTACK.md) and [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md). No match simulation, production change, game tests, merge or deploy.

## 6. How to resume in a new conversation

1. Read the latest [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), including its chronological comments.
2. Read this INDEX and [ATTACK.md](ATTACK.md), [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [OPTIONS.md](OPTIONS.md) on draft PR #12.
3. Recheck GitHub `main`, `AGENTS.md`, mandatory docs, current issue/PR status and relevant code/tests before technical decisions.
4. Continue from the **Next action** above; report owner decisions in Portuguese and update Issue #11 comments and affected English draft Markdown for each material interaction.
5. Never modify gameplay, merge, deploy or publish under this design-review epic. A separate scoped implementation issue and explicit owner approval will be needed after game rules are settled.

**Decision ID note:** Current `main` reserves SK-DEC-011 and SK-DEC-012 for cosmetic/visual choices. The confirmed **2 starting energy** rule is correctly recorded as **SK-DEC-013** in the draft `docs/DECISIONS.md`; never reuse old draft ID 011 for gameplay.
