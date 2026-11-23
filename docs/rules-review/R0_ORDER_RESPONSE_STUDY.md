# Iteration P — deterministic snake-order consecutive-turn counterplay exploit

**Date:** 2026-11-23. **Status:** executable scripted rule fixture only; not a full engine test, randomized game frequency, or approved turn-order decision. See [script](R0_ORDER_RESPONSE_CHECKS.js), [Iteration O A/B](R0_ORDER_AB_STUDY.md).

## Purpose

The complete-game initiative comparison showed that alternating round order (snake) dramatically reduces *first-actor wins*. This test asks whether the last actor of one round and first actor of the next can use **two tactical attacks without an intervening defender turn**. Only the turn-order variable is different.

## Reproduce / executed result

Run `node docs/rules-review/R0_ORDER_RESPONSE_CHECKS.js` in a checkout. The script imports true-edge adjacency from the committed [R0 model](R0_FULL_MATCH_MODEL.js) and checks the same legal R0 moves against a deterministic two-player midgame state. **Executed locally with Node 22: both explicit scenarios passed their assertions (2 PASS / 0 FAIL)** against the 53-cell numeric coordinate mirror, not the production app or a cloned-checkout run.

**Fixture:** attacker A starts the relevant sequence at hex 35 with two physical Big Waves (permitted: the B60 inventory has three), defender B at hex 36, **4 energy**, one unplayed Amulet, no active shield. The first personal turn is long over; attacks take place on personal turns 2 and 3. Planned edge moves remain legal: A 35→42→46, B 36→43, both retaining Big Wave range 2 where needed. Optional tactic or no tactic and mandatory 0-cost normal movement are respected.

| Controlled branch | Event sequence | Defender's energy after second Big Wave | Fallen / random card consequence |
| --- | --- | --- | --- |
| **Fixed** | A hits (E4→2), moves; B gets own turn, activates Amulet and moves; A's next hit is blocked | **2** | Standing; Amulet face-up until next own start |
| **Snake** | B acts first in round 2 and **chooses not to deploy** Amulet yet; A hits (E4→2) at end of round 2, moves; A immediately hits again at start of round 3 (E2→0) | **0** | Falls on hex 43; attacking A receives B's single Amulet card |

**Important:** This does **not** show that B had no defense whatsoever. Under snake, B **could have played Amulet proactively** on its round-2 turn; what disappears is the **ability to react between these two attacks after the first damage has been revealed**. The fixture is one reachable positional/card setup, not the probability that it occurs in a shuffled match. Even without this specific draw, the scheduling property remains: snake permits consecutive turns.

## Decision implication

The previous Iteration O win-rate improvement cannot by itself justify approval of snake. An explicit back-to-back action / reaction policy is needed if snake is considered. Introducing a prohibition on a second attack, a reaction window, or some other compensation would itself be a **new trial rule requiring a separate model comparison and owner validation**. Avoid silently patching it into production.

**Recommendation:** Do not ratify fixed or snake order yet. Keep the priority on (1) avoiding initiative bias in two-player games, (2) preserving fair response opportunities, and (3) not increasing turn procedures. Model one minimal counterplay safeguard or order alternative, then consult real owner-played R0 games.

Issue #11 / draft PR #12 only. No actual engine code changes, app tests, main merge or deploy; no human testing claimed.
