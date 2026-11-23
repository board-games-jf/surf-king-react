# Iteration H — exact opening attack risk and two-player cross-lane counterplay

**Date:** 2026-11-23. **Status:** Exact static enumeration of two-card opening draws and graph distances, not a Monte Carlo match or app-engine execution. [Reproduction](OPENING_INTERACTION_ANALYSIS.js). Owner requested fast, fun, meaningfully player-interactive gameplay before implementation. Source: main `c6fd08e2da82ca223740e3aa944c47f87aa84f16`, current 64-copy `SurfKingGame.js` deck `1a6b19eb0adcdf0ac4940e8a74096e8990efc0a4` and 53-cell layout `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`; proposed 60-copy mix from [DECK_REBALANCE_PROPOSAL.md](DECK_REBALANCE_PROPOSAL.md). All non-approved card range, starting hand, turn pacing and caps are **trial fixtures**.

## Exact two-card opening risks

Two initial cards are drawn uniformly without replacement from the complete deck; this is a **model assumption**, not an accepted setup rule.

| Metric | Current 64 (4 Big Wave / 4 Sunburn / 1 Amulet) | Proposed B60 (3 / 4 / 2) |
| --- | ---: | ---: |
| First actor holds at least one Big Wave | 12.20% | 9.83% |
| First actor holds Big Wave OR Sunburn | 23.61% | 22.15% |
| Defender already **holds** an Amulet, given first actor has Big Wave | 3.17% | 6.72% |

The last quantity is **not** protection: under normal turns, the second actor has **not yet played** that Amulet when struck. The initial two players stand at cells 0/1 (**graph distance 2**). A range-2 Big Wave used by the first actor while they each have the **accepted 2 starting energy** immediately takes the target to **0 energy**, making them fall on their starting hex and transfer exactly one random eligible hand card to the attacker under draft SK-DEC-025. **At the beginning of the victim's FIRST own turn they recover automatically at E1 and move normally** under draft SK-DEC-023/022; do not claim they lose that entire first movement. The attack does, however, reduce their energy, card inventory and later tactical possibilities. The probability of a Big Wave opening hand is **not** necessarily the probability of using it; tactical priority/targeting, card constraints and opportunity costs are unresolved.

**Candidate opening alternatives to evaluate, NOT approved:**
- **O0: no opening restriction:** offensive Big Wave can be used immediately; more interaction but asymmetric unanswerable first hit.
- **O1: first personal turn is preparation-only:** every player may play preparation/defense/positioning but cannot deal direct energy damage to another surfer until everyone has taken their first turn; movement still mandatory. Removes **first-turn instant damage**, allows prepared Amulet counterplay but does **not** prove elimination of initiative advantage in later rounds.
- **O2: initial damage protection for everyone until their first personal turn** while other normal actions are permitted; more complex trigger timing/hidden state. Do not adopt it just because it prevents immediate first hit.
- **O3: revise range/starting spacing, keeping normal adjacent Drop In unchanged**; may reduce interaction too much in 2-player matches.

## Verified cross-lane geometry

The two shortest Shark routes are both true-edge legal:
- A: `0→7→14→21→28→35→42→49`.
- B: `1→8→15→22→29→36→43→50`.

Each corresponding A/B cell is **exactly 2 graph edges apart**. Therefore normal adjacent Drop In never becomes available if both follow those lanes exactly; this was also observed in [Iteration G](DROPIN_INTERACTION_COMPARISON.md). However an attack with 2-edge range **can** reach the opponent in every corresponding lane position (except explicit fallen-target restrictions), as can 3-edge-range Sunburn.

**Stone+Jumping response fixture:** A at **14** can place Stone at **22** (range **2**) before the rival at **15** enters it; the rival normally can move **15→22**, but the obstacle blocks that destination. Graph shortest remaining route to a beach tile from **15** changes from **5 to 6 moves** under that one placed Stone. With fixed Sharks forbidden, the shortest hazard-free route changes from **6 to 6**. Because 15 is edge-adjacent to Stone22, if the rival **holds Jumping** and may use it as tactical action, they can remove it **before** taking normal movement in the revised candidate, restoring the planned lane. **These are reachability facts, not a proven real-hand counterplay frequency.**

**Interaction design lesson:** A player can alter another person's route without being adjacent for Drop In, but allowing all offensive cards on the first personal turn may make the first-actor advantage worse. Defense should usually be a meaningful **advance choice** rather than automatic reaction; test how often an opponent genuinely holds/can play a counter and how much it delays them. Interaction means contestable choices, not necessarily maximum number of attacks.

## Next gate

Run **matched-seed card-inclusive 2/4/7-player trials** contrasting passive parallel racing, ranged attacks, Stone/Jumping counterplay, and O1 preparation-only opening; track actual opponent-directed actions, disrupted path length, first-actor wins, fall theft, post-fall participation, attack frequency and card availability. Do not infer tabletop enjoyment or real-world game duration from model rounds. After that, prioritize a small human playtest and reconsider B60/Surf Current rather than ratifying now. Existing `main` uses unrelated visual IDs SK-DEC-019–024; this document references **draft gameplay decisions** only, which need conflict-free renumbering before integration.

**No approved new opening/cards/ranges or implementation. No application Jest/build, human match, merge or deploy.**
