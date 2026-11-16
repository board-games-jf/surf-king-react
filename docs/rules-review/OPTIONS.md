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

**Latest trial refinement (P-12, not owner-approved):** The shared **"fallen surfer returns next turn but cannot move"** parameter above belongs to the older P-07 exercise. After analyzing a forced Drop In displacement into a Shark, the current preferred experiment is **fall → clear active occupancy → next personal turn respawn at 2 energy on a safe vacant sea-ward cell and move normally that turn**. Otherwise a single attack could combine a backward displacement, fall and an entire skipped turn in a very short race. See [RACE_STRESS_REVIEW.md](RACE_STRESS_REVIEW.md). The current P-10/P-11 positional exchange and P-12 recovery have **not** been approved by the owner.

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

## Possible shared combat rebalance — P-08 (not approved)

The owner subsequently suggested expanding the energy cap to **5 or 6** while limiting attack and defense dice to **2**. This newer question applies to **all three** A/B/C play styles; it is not a vote for any one of them.

**Assistant test recommendation:** use **5 max energy** and **up to 2 dice per side**, with 1 die at energy 1 and 2 dice at energy 2–5, comparing the highest result and applying at most 1 damage. This is different from the earlier provisional max-energy-4, energy-sized dice pool above; **neither version was approved**. See [ATTACK.md](ATTACK.md) and [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md).

**Effect on full-game balance:** A 5-energy surfer becomes harder to knock off but has the same two-dice odds as a 2-energy surfer. This reduces dice-based runaway leads but risks making high-energy surfers slow to eliminate. In the B variant, selecting repeated +1 energy actions could make prolonged defensive accumulation too easy; card healing, drop-in rewards, Shark/Big Wave damage, and round cap therefore require simultaneous review.

## Trial direction after owner feedback — 2026-11-16

The owner **agreed to experiment with P-08 (5 energy maximum, up to 2 dice per side)**, explicitly warning that energy, cards, attacks, obstacles, pacing and comeback must be balanced together. **No full-match variant A/B/C is approved, and the combat settings are not final rules.**

### Assistant's proposed first integrated test (P-09, not approved)

Prefer the **short, tactical turn spirit of B**, but **suspend B's repeatable free +1 energy action** for this paper-playtest. Otherwise every surfer could reach energy 5 by their third +1 action, before the central Shark crossing. With only one damage per lost fight, the energy economy could become too defensive.

Test a single active turn as: **optional 1 card OR 1 adjacent Drop In → mandatory legal one-hex move without energy cost → draw 1 card** (to hand cap). At energy 1 roll 1 die; at energy 2–5 roll 2; compare highest; only a strict loser loses 1 energy; **ties without energy damage** has since been **accepted by the owner for this design trial**, not finalized. At 0, the surfer falls. Initial hazard/card candidates: Shark -1, Big Wave -1; test whether Energy x3 and Coconut should be capped to +2 rather than full restoration. Fallen recovery and a full-round cutoff remain pending, with temporary values from P-07 for tabletop scenarios.

**Why this package:** Keeps turns moving and combats short without allowing effortless repeated healing. Card luck remains a risk; do not claim this variant balanced without testing. Track whether successful Drop In should eventually have a **positional reward** to make attacks more important than conserving energy.

See [ENERGY_AND_COMBAT.md](ENERGY_AND_COMBAT.md) and [ATTACK.md](ATTACK.md) for the linked reasoning and exact two-dice probabilities.

## Next discussion

**Next epic-level scenario:** In a short seven-step race, compare an attacker with 2 energy to a leader with 5 energy under 2-dice, no-damage-tie combat. Determine whether a **strictly successful Drop In also needs a simple positional effect** to alter race outcome. Examine alongside Shark/Big Wave, card healing, falls and turn pacing before proposing any finalized rule. The owner requested the assistant lead this cross-system analysis and maintain Issue #11 plus the [INDEX.md](INDEX.md) hub for continuity. No gameplay code changes, tests, merges or deployment.

**Change boundary:** Only draft rules-review Markdown and Issue #11 may change under this review. Do **not** change application/game code, run or claim tests, merge, or deploy.
