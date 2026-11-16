# Surf King — Progressive Rules Review

**Status:** In discussion — **not an approved consolidated rulebook**  
**Tracking issue:** [#11](https://github.com/board-games-jf/surf-king-react/issues/11)  
**Review branch:** `docs/11-progressive-rules-review`  
**Purpose:** Retain the rule-by-rule decisions and open questions across chat threads. This draft PR is **documentation only** and **must not be merged without separate owner approval**.

## How to continue in a new conversation

1. Read [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and its chronological comments.
2. Read this draft PR's Markdown files, starting with this index and [MOVEMENT.md](MOVEMENT.md).
3. Recheck GitHub `main` and relevant code/tests before making technical claims; the original baseline was `6daa1705ff11d958a10cffd951eca9f5f2a1084c` on 2026-11-15.
4. Resume from the **Next question** below. Ask **one question at a time**, in Portuguese, briefly; use diagrams or images only where useful.
5. After each substantive interaction, add a succinct English comment to Issue #11 and update the relevant draft PR Markdown (accepted rule, pending question, proposal, or implementation observation). Do not merge or modify gameplay.

## Review states

- **Owner-confirmed:** explicitly accepted by the owner, including precisely scoped examples.
- **Pending:** requires owner discussion or confirmation.
- **Proposal:** suggested only; never accepted by inference.
- **Observed in code:** reflects reviewed source, not necessarily the intended rule or a tested outcome.

## Topics

| Topic | Status | Detail |
| --- | --- | --- |
| Movement and hex adjacency | **In discussion** | [MOVEMENT.md](MOVEMENT.md) |
| Movement direction (forward/backward) | **Owner-confirmed** | [MOVEMENT.md](MOVEMENT.md) |
| Attack / drop-in adjacency and resolution | **Range owner-confirmed; dice pending** | [ATTACK.md](ATTACK.md) |
| Energy and recovery | **2 starting energy confirmed; growth pending** | [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md) |
| Turns, action order and replenishment | **Rest removed; core-loop redesign pending** | [TURNS_AND_PACING.md](TURNS_AND_PACING.md) |
| Card effects and durations | Not started | — |
| Forced movement, obstacles and boundary cases | Not started | — |
| Victory and game balance | **3 concrete whole-match options proposed, not approved** | [OPTIONS.md](OPTIONS.md), [COMPLETE_MATCH.md](COMPLETE_MATCH.md) |

## Confirmed so far

- **Normal movement is allowed in all six directions**, including backward, **only between hexagons sharing an edge**. Owner confirmed on 2026-11-15. Energy, occupancy, obstacles and other limitations remain to be reviewed separately.
- Displayed hex **18 → 15 is not a legal normal maneuver** in the current layout; they do not share an edge. Owner confirmed this example on 2026-11-15.
- **Normal drop-in attack range is edge adjacency only:** the defender must occupy a hexagon sharing an edge with the attacker. Owner confirmed on 2026-11-15; dice and other attack conditions remain pending.
- The collaboration process is progressive: one subject/question at a time, brief conversations, visuals as needed, no code implementation during rules review.
- **Owner-confirmed (2026-11-16):** 0 energy means **falling off the surfboard**, not resting. The return-from-fall process remains pending.
- **Owner-confirmed (2026-11-16):** every surfer **starts with 2 energy**. The 4-energy maximum is existing code, not separately reconfirmed; energy gain and ordinary movement cost remain unapproved.
- **Owner-confirmed (2026-11-16):** **remove Rest as a game mechanic**; do not add voluntary or automatic Rest. This does not yet approve compulsory movement or energy-cost changes.
- **Game design north star (owner direction):** fast, practical/portable, fun, replayable, strategic and simple; balance the complete movement-energy-card-combat-victory loop rather than isolated rules. See [TURNS_AND_PACING.md](TURNS_AND_PACING.md).

## Next question

**Next focused comparison (2026-11-16):** Owner explicitly wants **concrete alternative whole-game mechanics, without code edits**. Assistant authored **P-07: A Card Race, B Tactical Surf/WAR-like, and C Risky Sprint**, each with opening, turn choices, energy, shark/fall, recovery, endgame fallback and known trade-offs. Assistant recommends **B: mandatory 1-hex move + exactly one tactical action** (+1 energy, a card, or an adjacent Drop In). **None of these mechanics beyond preexisting owner approvals are accepted.** Compare options in [OPTIONS.md](OPTIONS.md), with the earlier P-06 in [COMPLETE_MATCH.md](COMPLETE_MATCH.md).

**Deferred:** The drop-in dice tie decision remains pending until we address the all-pass stalemate.

## Implementation boundary

No gameplay code, production deployment, tests, or merger is authorized by this review. Once rules are finalized, create separate implementation issues with acceptance criteria, tests, and PRs.

## Review log

- **2026-11-15:** Owner confirmed displayed 18 → 15 is forbidden; engine adjacency still needs review.
- **2026-11-15:** Owner requested no implementation until rules are agreed.
- **2026-11-15:** Owner requested short, progressive, visual-when-useful interactions and durable GitHub issue + draft-PR Markdown documentation.
- **2026-11-15:** Owner approved normal movement in any of the six directions, provided the two cells share an edge. Next topic: drop-in attack range.
- **2026-11-15:** Owner approved drop-in only against an edge-adjacent opponent. Next topic: dice ties.
- **2026-11-15:** Owner requested design guidance rather than repeated owner-only questions and raised an all-pass stalemate. Dice tie review deferred; assistant proposed compulsory maneuver when possible, not approved.
- **2026-11-15:** Owner questioned whether optional Rest is needed at all; P-02 was proposed and then superseded, not approved.
- **2026-11-16:** Owner clarified 0 energy causes a fall and explicitly removed Rest as a mechanic. Owner requested holistic balance for fast, portable, fun, replayable and strategic games. Next: review movement/energy/combat/card economy as a complete loop; free movement is only an assistant proposal.
- **2026-11-16:** Assistant verified a seven-step start-to-goal geometric path and key interactions: only four starting energy, shark bottleneck, and current Bottled Water card losing its purpose if ordinary movement becomes free. Holistic balance analysis recorded; no new rule approved.
- **2026-11-16:** Owner proposed WAR/Risk-like energy representing combat force and considered a one-energy start with growth via progress or cards. Assistant recommended two.
- **2026-11-16:** **Owner approved 2 starting energy.** All other energy mechanics remained pending.
- **2026-11-16:** Owner called the proposed two-progress-milestone energy gain too complex. Assistant withdrew it and proposed a simpler P-05: ordinary moves cost/give no energy; cards are the main energy source. **Not approved;** energy/hazard/card balance still pending.
- **2026-11-16:** Owner remained unsatisfied by isolated rule questions and requested a clear global beginning-to-end match and evidence that the dynamics work. Assistant drafted integrated P-06 in [COMPLETE_MATCH.md](COMPLETE_MATCH.md), with an illustrative 3-player sequence and adversarial failure cases. The entire package is provisional and **has not been playtested**.
- **2026-11-16:** Owner reiterated no gameplay code edits and requested concrete options. Assistant compared three full-match variants in [OPTIONS.md](OPTIONS.md), with B recommended for its strategic trade-off of building energy vs using a card vs Drop In. All candidate mechanics remain unapproved and untested.
