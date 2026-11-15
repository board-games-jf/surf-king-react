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
| Energy and recovery | Not started | — |
| Turns, action order and replenishment | Not started | — |
| Card effects and durations | Not started | — |
| Forced movement, obstacles and boundary cases | Not started | — |
| Victory and game balance | Not started | — |

## Confirmed so far

- **Normal movement is allowed in all six directions**, including backward, **only between hexagons sharing an edge**. Owner confirmed on 2026-11-15. Energy, occupancy, obstacles and other limitations remain to be reviewed separately.
- Displayed hex **18 → 15 is not a legal normal maneuver** in the current layout; they do not share an edge. Owner confirmed this example on 2026-11-15.
- **Normal drop-in attack range is edge adjacency only:** the defender must occupy a hexagon sharing an edge with the attacker. Owner confirmed on 2026-11-15; dice and other attack conditions remain pending.
- The collaboration process is progressive: one subject/question at a time, brief conversations, visuals as needed, no code implementation during rules review.

## Next question

**When the attacker and defender roll equal dice values during a drop-in, should the defender win that tie (as current code does), or should ties resolve differently?** Pending owner confirmation.

## Implementation boundary

No gameplay code, production deployment, tests, or merger is authorized by this review. Once rules are finalized, create separate implementation issues with acceptance criteria, tests, and PRs.

## Review log

- **2026-11-15:** Owner confirmed displayed 18 → 15 is forbidden; engine adjacency still needs review.
- **2026-11-15:** Owner requested no implementation until rules are agreed.
- **2026-11-15:** Owner requested short, progressive, visual-when-useful interactions and durable GitHub issue + draft-PR Markdown documentation.
- **2026-11-15:** Owner approved normal movement in any of the six directions, provided the two cells share an edge. Next topic: drop-in attack range.
- **2026-11-15:** Owner approved drop-in only against an edge-adjacent opponent. Next topic: dice ties.
