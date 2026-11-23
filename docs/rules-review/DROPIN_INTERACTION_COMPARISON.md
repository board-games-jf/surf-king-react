# Iteration G — Drop In positional exchange versus damage-only, 2/4/7-player comparisons

**Date:** 2026-11-23. **Executed 1,200 independent-model seeded races** (200 per 2/4/7 players × 2 rule variants). [Source code](DROPIN_COMPARISON_REPRODUCTION.js). **NOT** game-engine/Jest/human-player testing and **NOT** approval of optional swap or a new victory/turn rule.

## Controlled question

The owner wants a game that is **interactive between people**, rather than independent parallel races. In prior seeded full-deck studies some special cards were modeled, but **normal adjacent Drop In by itself** was not shown to generate meaningful 2- or 4-player interaction. Is optional positional exchange on a strict Drop In win enough?

**Only toggled parameter:** Damage-only Drop In versus damage **plus optional swap**, if the attacker strictly wins, both stay standing and the defender is nearer to the beach; swap replaces the normal movement. To isolate unexplained terrain attribution, this experiment prohibits exchanges involving any occupied fixed Shark tile; do **not** interpret that exclusion as a ratified rule. Start cells 0..n−1 from actual layout, 2 initial energy, mandatory cost-0 travel, Shark −2, next-own-turn 1/2/3 recovery, uniform one-card fall loss to attacker on a combat fall / discard on Shark, real current **64-copy card inventory** but **NO other card actions** (all other cards are hand resources only), two starting hand cards, draw one after successful normal maneuver if fewer than 5, capped at five, randomly overflow if a defender receives a card at five. One Drop In tactical choice before normal maneuver; target an adjacent standing opponent who is no farther from beach than attacker. Max-two-d6 trial with highest winning strict loser −1, ties no damage. Direct greedy routes plus a light Shark-avoidance score; no positional special cards, obstacles or Turn-1 tactical limitations. Fixed first beach ends race, maximum 12 rounds. Initiative rotates independently of start seat by deterministic seed.

Every race asserted original 64 card identities conserved across deck/discard/hands, unique occupied player cells, and one transfer/discard/empty-hand outcome per fall. Exact source geometry/cell graph and all current deck copy quantities are inputs, not fabricated.

## Results

**Means per race, rounded; 200 races per row.** `First actor wins` = the earliest actor in that race's rotating order, **not** always starting at cell 0.

| Players | Drop In model | Finished | Mean rounds | Mean Drop Ins | Mean strict attacker wins | Mean positional swaps | Combat falls | First actor wins | Wins by starting cell |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 2 | Damage only | 200/200 | 7.00 | **0.00** | 0.00 | 0 | 0.00 | **100%** | 100 / 100 |
| 2 | Optional swap | 200/200 | 7.00 | **0.00** | 0.00 | 0 | 0.00 | **100%** | 100 / 100 |
| 4 | Damage only | 200/200 | 7.00 | **0.00** | 0.00 | 0 | 0.00 | **100%** | 50 / 50 / 50 / 50 |
| 4 | Optional swap | 200/200 | 7.00 | **0.00** | 0.00 | 0 | 0.00 | **100%** | 50 / 50 / 50 / 50 |
| 7 | Damage only | 200/200 | 7.00 | **15.86** | 6.49 | 0 | 7.11 | **61%** | 20 / 23 / 28 / 44 / 35 / 27 / 23 |
| 7 | Optional swap | 200/200 | 7.00 | **14.97** | 6.07 | **1.16** | 6.70 | **52%** | 19 / 15 / 30 / 48 / 33 / 25 / 30 |

For 7-player damage-only versus optional-swap, fall-card transfers **7.09→6.66**, card-cap overflow **2.01→1.81**, strict wins **6.49→6.07**, and positional exchanges **0→1.16**. Both completed all races at round 7 in this stylized model. These are not controlled estimates of human enjoyment or true balance. More actions are not automatically good when they delay or eliminate choices.

## Critical geometry finding — why 2/4-player interaction vanishes

The following **valid parallel 7-move Shark shortcuts** were checked against the actual graph:

| Round | Surfer A | Surfer B | Edge-graph distance | Normal adjacent Drop In possible? | Big Wave reach 2 (proposal)? |
| ---: | ---: | ---: | ---: | --- | --- |
| 0 | 0 | 1 | 2 | No | Yes |
| 1 | 7 | 8 | 2 | No | Yes |
| 2 | 14 | 15 | 2 | No | Yes |
| 3 | 21 | 22 | 2 | No | Yes |
| 4 | 28 | 29 | 2 | No | Yes (fallen target restriction applies during falls) |
| 5 | 35 | 36 | 2 | No | Yes |
| 6 | 42 | 43 | 2 | No | Yes |
| 7 | 49 | 50 | 2 | No | Yes |

In the simplified simulation, **2- and 4-player agents stay in parallel lanes for the entire race**, so the optional adjacent swap **never triggers**; no positional card or obstacle appears to bring them together. The fact that 7-player runs yield many Drop Ins is mainly due to **density**, not a universal quality of normal combat.

**Implication:** A positional Drop In alone **cannot deliver the owner's desired interpersonal interaction for 2 players**. The game needs viable **cross-lane player-to-player card play**, contested route choices and meaningful defensive responses from early/mid game, without forcing every turn into a fight. Keep confirmed Drop In strictly edge-adjacent; do **not silently expand its range**.

A testable source-derived cross-lane example: with A at cell **14** and B at **15** (distance 2), A can place an eligible **Stone at 22** under the proposed placement range 2; B's next intended move **15→22** is then blocked, allowing B to counter with adjacent Jumping or choose another legal route. With proposed **Big Wave range 2**, even starting cells **0/1** are in range immediately.

**Opening-round risk:** Starting from 2 energy, a first-actor Big Wave (−2) at graph range 2 against another starting player causes an **instant fall at cell 1**, random hand-card transfer to attacker and no movement before the victim's first turn, if first-round offensive cards are allowed under the provisional action sequence. At **two uniformly drawn initial cards**, the chance of the first player holding at least one Big Wave is **1 − C(60,2)/C(64,2) ≈ 12.20%** for the original 64 (4 copies), versus **1 − C(57,2)/C(60,2) ≈ 9.83%** in B60 (3 copies). This is **a hand probability, not measured attack frequency or overall win probability**. Before recommending attack range 2 or changing starts, compare a one-round neutral start, alternate start geometry, range 1, or ready defenses as separate unapproved fixtures. Do not approve all of them at once.

## Design interpretation and next experiment

1. **Keep player-driven interactivity as a product goal.** Cards/board choices should let a human affect another's path, resources and decisions, with visible counterplay; this does not mandate online matches, instant responses, or always-attacking.
2. **Normal Drop In is adjacent only (confirmed).** Test optional exchange for races where surfers are actually adjacent; a winning attack against an already fallen or now-fallen occupant must not teleport the attacker into that occupied tile. Damage and stealing a card can be valuable even without movement.
3. **For 2/4 players test card reach and contested lanes together.** Compare source unbounded offensive range, proposed Big Wave graph range 2, Sunburn 3, Stone placement within 2, Jumping counters, Change swaps and Tsunami push while guarding against first-turn knockdown snowballs. The previously executed full-deck model A–D does include these as *fixtures* but not human strategy.
4. **For 7 players test overload:** 15–16 Drop Ins per race can mean constant attacks and many lost cards, not necessarily enjoyable interaction. Count distinct players targeted, repeat knockdowns, time without a useful tactical choice and receiver card overflow.
5. **Compare 2/4-player reaction to a placed Stone on an actual parallel route**, then test defender's proactive Hang Loose/Amulet and limited-range attacks, varying initiative. Don't try to fix a missing cross-lane interaction solely with the Surf Current speed card.
6. **Integration blockers:** Receiver hand limit, attacker-falls reward, forced-Shark owner attribution, non-Shark fallen target immunity, turn-1 attack rule and exact tactical card timing remain unsettled. Current main visual SK-DEC-019–024 conflict with draft gameplay IDs.

**Conclusion:** Optional positional Drop In can improve direct interaction **when adjacency occurs**, but the tested 2/4-player routes never become adjacent: **the deeper issue is map/route/card interaction density**. The proposed short-reach cards and player-controlled obstacles offer testable solutions, not yet approved. **No application/game-engine Jest tests, actual human sessions, permanent card or Drop In decisions, merge or deploy.**
