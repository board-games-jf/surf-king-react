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

## 3. Current coherent working package — P-09 + positional P-10, **assistant proposals only**

- Start at 2 energy, trial cap 5, edge-adjacent geometry, no Rest, fall at 0.
- Per active turn, **optionally play one card OR attempt one adjacent Drop In**, then make one legal **free normal maneuver** when possible; draw a card after moving. No separate free repeatable +1-energy choice (it would produce 2 → 5 in only three personal turns).
- Experimental Drop In: up to two d6 per surfer, compare the highest results; **tie without energy loss** (owner accepted for trial); a strictly lower result loses **1 energy** (damage value still an assistant proposal). **P-10 candidate:** when the attacker strictly wins, they may exchange hexagons with the defender; if used, this consumes the attacker's regular maneuver, avoiding a double step (not approved).
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

**Source-verified route contrast:** Same starting cell 0 to goal 49: **7 legal maneuvers via Shark 28** vs **8 legal maneuvers avoiding all four initial Sharks**. Actual geometry creates a meaningful risk-versus-speed choice without a new counter or rule. These are geometric checks, not gameplay playtests.

**Exact combat maths, energy 2 vs 5:** each uses two dice under the agreed trial. Strict attacker win **38.97%**, strict loss **38.97%**, tied/no damage **22.07%**. If only 1 energy is lost on a strict win, the defender drops from 5 to 4 with unchanged dice and board position — likely too little impact to alter a seven-move race.

**Assistant recommendation P-10 (NOT owner approved):** On a strict attacker victory, optionally **swap the two surfers' cells** in addition to the candidate −1 damage to the defender, with swap **counting as the attacker's single normal movement** for that turn. A late-race challenger at cell 35 can attempt to take a leader's occupied cell 42 (next to the beach at 49); the winner gains position while pushing the defender back. No second free movement. On tie or failure, normal legal movement still occurs if able. The reward creates strategy without extra dice, repeated health grinding or an empty-cell push algorithm.

**Risks to settle before approval:** Whether moving into a Shark during exchange triggers damage; fall/occupancy rules; a defender counter-swapping next turn; card interactions and hand economy; crowded 7-player turns; and fair round-limit handling. **Next focused step:** Evaluate obstacle triggering and fall safety for this proposed exchange, then decide whether the tactic is preferable to damage-only combat. Full analysis in [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md).

## 6. How to resume in a new conversation

1. Read the latest [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11), including its chronological comments.
2. Read this INDEX and [ATTACK.md](ATTACK.md), [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md), [OPTIONS.md](OPTIONS.md) on draft PR #12.
3. Recheck GitHub `main`, `AGENTS.md`, mandatory docs, current issue/PR status and relevant code/tests before technical decisions.
4. Continue from the **Next action** above; report owner decisions in Portuguese and update Issue #11 comments and affected English draft Markdown for each material interaction.
5. Never modify gameplay, merge, deploy or publish under this design-review epic. A separate scoped implementation issue and explicit owner approval will be needed after game rules are settled.

**Decision ID note:** Current `main` reserves SK-DEC-011 and SK-DEC-012 for cosmetic/visual choices. The confirmed **2 starting energy** rule is correctly recorded as **SK-DEC-013** in the draft `docs/DECISIONS.md`; never reuse old draft ID 011 for gameplay.
