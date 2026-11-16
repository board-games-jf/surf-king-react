# Surf King — Three Complete Gameplay Options (P-07)

**Status:** Assistant-designed complete **playtest alternatives**, NOT approved or implemented.
**Purpose:** The owner explicitly requested **concrete, comparable options**, no gameplay code changes, and a focus on the **start-to-finish playing experience** rather than isolated questions.
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) / [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).
**Verified source baseline:** `main` `e4e083f9035e314eb2107bd1cca448292cc4629e` on 2026-11-16. These variants have **not** been simulated or playtested.

## Confirmed constraints across all options

- Each surfer starts at **2 energy**.
- **Zero energy = fall from the board**. No Rest action.
- Normal movement can go in all six edge-adjacent directions; normal Drop In targets only edge-adjacent opponents.
- Design should be short, teachable, strategic and repeatable, with no infinite pass/camping stalemate.

## Common proposed playtest parameters (all unapproved except above)

- Start with **2 cards** (as the current code does), tentative **energy cap 4** and **hand cap 5**.
- One normal edge-adjacent maneuver is **mandatory when a legal destination exists**; when involuntarily blocked, the move stage safely ends without a Rest option.
- Draw **one card on a successful normal maneuver**, up to hand cap. Assess whether cards are too abundant.
- Tentative combat simplification: each combatant rolls as many six-sided dice as their current energy, compare **only the single highest roll**. **Defender wins ties**; the losing surfer loses **one energy**. This is a **proposal**, distinct from current code comparing multiple ordered die pairs, and must not be described as a confirmed rule.
- Tentative central Sharks: **-1 energy**, not the current -2; avoid automatically knocking a 2-energy starting surfer off their board on first contact.
- At 0 energy surfer **falls** (approved); suggested re-entry on **their next turn at 2 energy without a move that turn** (not approved). Rescue cards and physical occupancy need separate review.
- First reaching the beach (one of the 4 final cells) **wins immediately** (the present implemented victory condition; not separately owner-approved in this review).
- Tentative **end-of-round 10 limit** to prevent infinite stalling; if no beach winner, closest to the beach wins (graph distance to the final cells). If equally close, higher energy wins; an exact tie is a shared draw. This is a *fallback*, not a proven balanced duration; 2–7 player testing needed. Specify completion at end of the entire round, not mid-round.
- Existing damage cards such as Big Wave -2 should be evaluated for spikes against 2-energy starters; do **not** silently modify their effect in these proposals.

## Three comparable complete alternatives

| Rule | A — Card Race | B — Tactical Surf / WAR-like (**assistant's preferred playtest**) | C — Risky Sprint |
| --- | --- | --- | --- |
| At start | 2 energy, 2 cards | 2 energy, 2 cards | 2 energy, 2 cards |
| One active turn | Up to 1 card, up to 1 adjacent Drop In, then mandatory 1 free normal maneuver, draw 1 card | Mandatory 1 free normal maneuver, **choose one**: +1 energy (max 4) OR play 1 card OR attempt 1 adjacent Drop In; draw 1 card | Choose 1 free normal maneuver OR up to 2 consecutive legal maneuvers spending 1 energy; optionally 1 card and/or 1 adjacent Drop In; draw 1 card |
| Energy growth | Cards (and any separately approved environmental bonuses) | The choice of +1 on the turn, or cards when used; no row counters | Cards (and any separately approved environmental bonuses) |
| Combat and obstacles | Common model above | Common model above | Common model above, including each traversed tile if sprinting |
| Fall / return | Common model above | Common model above | Common model above |
| Win / anti-stall | Beach or after ten full rounds positional fallback | Same | Same |
| Distinct appeal | Fastest rules, strong card variety | Clear trade-off: build strength vs use cards vs fight; avoids all-energy-draw dependence | High adrenaline: spend strength to move twice; race vs survival |
| Primary risk | Random draw decides power; playing card AND attack AND movement increases turn complexity | Gaining +1 may dominate early turns; need test combat choices and whether repeated boosting is too effective | A two-hex sprint may make a shortest route just 4 personal turns; leaders may be hard to catch; sprint through central Sharks could be punitive |

**Action-order caution:** In option B, Move → Choose means a player can move next to an opponent and immediately attack that opponent; this is a conscious test hypothesis. In options A/C, the attack timing differs and must be consistently specified before any rules are approved. No card may bypass the separately approved normal Drop In edge-neighbor requirement merely by being chosen in the same turn.

**Why recommend B first:** It gives a simple `move + choose one meaningful action` ritual. Every player can proactively build combat strength without lucky Energy draws, and there is an opportunity cost to boosting rather than using cards or fighting. No bookkeeping for rows, streaks, or territory control.

## Illustrative 3-player experience for B (NOT a test result)

- Rounds **1–2**: All start with two energy/two cards; each moves toward the beach. One elects +1 energy, another plays an obstacle card, another stores a high-value card for later. Everyone progresses; nobody needs to Rest or pass normal movement.
- Rounds **3–4**: They reach or approach the central Shark row, with Shark tentatively dealing one damage. A high-energy surfer is stronger in adjacent Drop In, but must choose whether to attack or continue gaining strength/use a card.
- Rounds **5–7**: Players jockey for open adjacent cells, use a card or risk a single-result Drop In. Someone can fall at zero, losing their next maneuver before returning at 2. The shortest geometric path contains seven maneuvers, although hazards/occupancy will change actual paths.
- Rounds **7–10**: A player who kept a legal direct route can reach the beach. If rivals frustrate the finish or players loop backwards, the provisional round limit guarantees an end.

This **does not establish** which option is most balanced, how long it takes to play, or which cards should change. Test a few hypothetical edge cases and run playtests **only when authorized**.

## Open design risks to resolve

1. Four initial Sharks at engine cells 28–31 create a major central chokepoint; when using two starting energy, the current -2 instantly knocks a surfer off the board.
2. The current Big Wave card also deals -2 and can remove 2 starting energy instantly; stronger players might also become more durable AND roll more dice.
3. Free normal movement makes Bottled Water's current energy-cost waiver redundant. Revisit that card after selecting a variant.
4. Cards include Energy +1/+2/+3, Coconut refill and special rescue cards, which may be over- or underpowered for option B's on-demand +1 action.
5. At most seven players, ten rounds can produce up to seventy personal turns. User-perceived match duration remains untested.
6. If all adjacent destinations are blocked by stones and players, an involuntary skipped maneuver needs an explicit exit or recovery rule. No Rest mechanic should be reintroduced.
7. The fastest current board route is approximately seven edge-adjacent maneuvers; the exact optimal distance for every starting player requires board validation. Variant C could drastically shorten matches.

## Next discussion

**Owner choice:** Which **whole-game feel** should be explored first — **A (card race)**, **B (tactical move + one action)**, or **C (fast sprint/risk)**? The assistant recommends **B** as the first prototype to balance. The owner has not yet approved any complete variant.

**Change boundary:** Only draft rules-review Markdown and Issue #11 may change under this review. Do **not** change application/game code, run or claim tests, merge, or deploy.
