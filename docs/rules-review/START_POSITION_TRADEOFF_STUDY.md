# Iteration R — starting-position advantage must be a tradeoff, not a predetermined winner

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** exact, static 53-cell board analysis and clarified owner design intent. **No new approved gameplay rule and no production implementation.**

## Design clarification from owner

Random first actor and random player start should make the opening **variable, not predetermined**. A starting cell may confer a modest tactical advantage, but **cards, other players' actions and choices must be able to overturn it**. The goal is **not to force every start to be identical**; a little different positioning is strategically desirable. Prevent a nearly automatic "I started on this cell; therefore I win" outcome.

## Verified geometry / shortest route opportunities

Run [`START_POSITION_TRADEOFFS.js`](START_POSITION_TRADEOFFS.js) from a repository checkout. The same 53-cell source layout was fetched from current main for this study. The calculations below were actually executed against that fetched layout using exact reciprocal-edge adjacency and shortest-path enumeration in a separate JS runtime; **the committed standalone Node file has not itself been executed inside a GitHub checkout**.

| Start ID | Shortest beach distance | Shortest Shark-free beach distance | Number of 7-step beach routes | Number of shortest Shark-free routes | Adjacent cells |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0 | 7 | 8 | 1 | 24 (8-step) | 2 |
| 1 | 7 | 8 | 1 | 48 (8-step) | 3 |
| 2 | 7 | 8 | 1 | 48 (8-step) | 3 |
| 3 | 7 | 8 | 1 | 24 (8-step) | 2 |
| 4 | 7 | **7** | **14** | **6 (7-step)** | **5** |
| 5 | 7 | **7** | **14** | **6 (7-step)** | **5** |
| 6 | 7 | **7** | **14** | **6 (7-step)** | **5** |

Path counts enumerate graph shortest paths in an *otherwise empty board*: some routes may be blocked by other players, placed Stone, movement policies, or terrain; they are **options, not independently playable guarantees**. The same 4/5/6 tier is more route-flexible than 0/1/2/3, even before the Shark-risk difference.

## Early mutual interaction exposure if all seven starting cells were occupied

| Start | Other start cells within 2 graph steps (candidate Big Wave range) | Others within 3 steps (candidate Sunburn range) |
| --- | ---: | ---: |
| 0 | 2 | 3 |
| 1 | 4 | 5 |
| 2 | 4 | 5 |
| 3 | 2 | 3 |
| 4 | 3 | 4 |
| **5** | **4** | **6** |
| 6 | 3 | 4 |

**Interpretation:** 4, 5 and 6 are jointly the **best *static safe-route tier***, not three measured winning positions. **5 is central**, giving access to more opponents and conversely being in more opponents' ranged attack windows. This is a meaningful potential **advantage/disadvantage tradeoff**, especially in crowded matches. Neither first-turn attacks nor proactive targeting is counted; R0 starts with a preparation-only first personal turn. For 2P or 4P randomly selected setups, opponent exposure differs from this fully occupied seven-start snapshot.

## Why the earlier fair-pair restriction is not automatically preferable

Iteration Q proposed a **trial-only** two-player random draw from five same-risk pairs to equalize Shark-free distances. The owner now explicitly values **position-dependent advantages that cards and interactions can reverse**; exact path symmetry is therefore **not itself the goal**. Do not install that pair restriction as an approved rule. Treat it only as a controlled baseline to compare with genuinely random unique starts.

A suitable **model acceptance approach to propose (not yet ratified)**:

- Randomly allocate **who acts first** and **unique starting positions**, but retain fixed turn order during the match unless a safer turn mechanism is demonstrated (snake creates no-response double turns).
- Evaluate each start conditional on player count, relative initiative and tactical policy, using full 17-type B60 card shuffles and several opponents. Measure **win share, falls, lost hand cards, available tactical actions and player-to-player interactions**, not just fastest unopposed path.
- A starting cell may improve odds moderately; **no single cell/actor combination should nearly guarantee a win** across policies and shuffled hands. Matchup variance and situational tactical reversal are desirable; measure the improvement from **good versus poor card play** rather than only location averages.
- Any compensation must be **small, legible and grounded in matched-seed results** (e.g. a slight setup economy difference only if needed), not a blanket ban on advantageous positions or a new off-turn resolution procedure.
- Keep positional imbalance and initiative bias separate: randomized actor identity eliminates persistent *player identity* privilege over repeated games, **not within-match first-actor advantage**.

## Status and follow-up

This iteration is **structural evidence only**: no seeded complete-game model with randomized starts, no win-probability proof, no production engine/Jest/build, no owner tabletop session. **Next controlled full-card B60 experiment:** paired combinations of starting cells and randomized initiative in 2/4/7-player games, with start-tier win rates, tactics and fall-card consequences, to decide whether a slight balancing measure is needed **without making every start the same**.

Existing [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and draft PR #12; no main merge/deployment authorization. The unrelated main visual decision-ID collision with draft SK-DEC-019–024 remains unresolved.
