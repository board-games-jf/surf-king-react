# Surf King R1.12.1 — Consolidated playtest rulebook

**Status: proposed for owner approval as a local human-playtest candidate. Not a final commercial rulebook, not an implementation, merge, or deployment authorization.** This is the current candidate reference; older design reports and rule/card sheets are historical experiments, not additional rules. Issue [#11](https://github.com/board-games-jf/surf-king-react/issues/11), documentation draft [#12](https://github.com/board-games-jf/surf-king-react/pull/12), implementation draft [#67](https://github.com/board-games-jf/surf-king-react/pull/67) / issue #66. Main verified at `839633b2a1b471c6f4a1b451d0925dae04894f75`. This document describes a candidate, not the currently running application. The latest inspected playtest branch is `feat/69-branching-match-history` at `5e6871a7fbe8290fb6efb697b1b25b958de7c144` (PR #71 merged into that branch; main still at the revision above). Its accepted SK-DEC-058 supersedes the earlier optional Surf Current second step. R1.12.1 incorporates that correction; other R1.12 balance recommendations are unchanged.

## 1. Goal and formats

| Format | Players | Active cells | Sharks | Victory |
|---|---:|---:|---:|---|
| Duel | 2 | 23 | 2 | First beach arrival |
| Competition | 3 | 23 | 2 | First beach arrival |
| Competition | 4–5 | 37 | 2 | First beach arrival |
| Dominion | 6–7 | 53 | 4 | First beach arrival or sole standing surfer after a genuine fall |

Beach arrival wins immediately, even with zero energy; resolve it before a Dominion victory. Dominion is checked after a resolved fall, including terrain falls, only with 6–7 players; zero standing surfers does not grant a winner. No elimination from an ordinary fall.

## 2. Setup

Use the existing 53-cell layout and stable original IDs. Active geometry is abs(x) <= 2 for 2–3 players, <= 4 for 4–5, all cells for 6–7. All movement, distance, targets, placement and redirects use the active graph. Inactive cells must not be visible or selectable. Beach IDs are 50/51 on compact/medium, 49–52 on full.

| Players | Eligible start IDs | Shark IDs |
|---:|---|---|
| 2 | 1,2 | 22,23 |
| 3 | 1,2,5 | 22,23 |
| 4 | 1,2,4,5 or 1,2,5,6 (mirror) | 29,30 |
| 5 | 1,2,4,5,6 | 29,30 |
| 6 | 0,1,2,3,4,6 | 29,30,35,38 |
| 7 | 0,1,2,3,4,5,6 | 29,31,35,37 or 28,30,36,38 (mirror) |

Choose mirror layouts randomly with equal probability when applicable. Randomly assign distinct starting cells and independently shuffle the complete turn order once. Keep the order fixed throughout the match. Shuffle the 64-card deck and deal starting resources. All start with 2 energy and 2 cards, with these one-time bonuses by turn-order slot (1-indexed):

| Players | +1 energy slots | +1 card slots |
|---:|---|---|
| 2 | 2 | 2 |
| 3 | 3 | 2,3 |
| 4 | 3,4 | none |
| 5 | 4,5 | 5 |
| 6 | 4,5,6 | 5,6 |
| 7 | 5,6,7 | 5,6,7 |

**4P recommendation awaiting approval:** use the simpler energy-only compensation from the R1.12 comparison arm, rather than the R1.11.2 candidate's additional card for slot 4. The comparison yielded narrower order and spawn win-rate gaps, but fewer card choices. The complete proposed rulebook therefore differs from the frozen primary R1.12 simulation arm in this one detail; the alternative was simulated separately with all other 4P settings identical. Bonuses are not per-turn rewards.

## 3. Turn and resource rules

- Max energy 5; standing means energy > 0. Hand limit 5. Maximum two occupants per active hex, including fallen surfers.
- At start of own turn, expire the player's previous active Amulet/Hang Loose into discard. **No automatic draw**, including an empty hand.
- Fallen player recovers on the same cell, without retriggering terrain: free recovery to 1 energy (keeps card action), or spend Lifeguard Float to recover to 3 (consumes card action).
- Play at most one card and optionally initiate repeatable Drop Ins in either order before movement, subject to eligibility. Round 1 blocks direct attack cards, Change and Drop In; other legal cards remain playable.
- Ordinary maneuver: one adjacent active hex, any direction, no energy cost, required if legal. Apply terrain upon entry. Jumping, Change, accepted Drop In conquest and Surf Current have their movement-specific rules below. If no ordinary move is legal, pass without drawing.
- End own turn: draw exactly one card if movement occurred and the actor is still standing, including a normal successful move, Jumping, Change, conquest or Surf Current (one draw total even if two steps). No draw for falling during own turn or not moving. No delayed draw penalty for being knocked down on another player's turn. Beach arrival still takes precedence.
- Any receipt of a sixth hand card triggers automatic uniform random discard from all six, including the received card. On a draw with empty deck, reshuffle the discard pile if nonempty; if neither has cards, no draw. Never recycle active defenses or deployed obstacles.
- Genuine fall: energy becomes zero; lose one uniformly random hand card if available. Drop In defender's fall transfers that card to attacker; terrain fall discards it, even if a rival originally placed the obstacle or a swap caused entry. No second loss for already-fallen surfer. Falling on own turn ends it without normal draw; recover on next own turn, no skipped turn, no retreat. Fallen surfers retain their cell.

## 4. Drop In

From round 2, a standing actor with at least 2 energy may target an individual standing rival at graph distance <=2 (including same cell), not protected by Amulet or Hang Loose. No initiation cost and no fixed attempt limit; no attacks after movement begins. Attack dice count is chosen by actor: 1 or 2, at most current energy minus 1. Defender rolls min(2, current energy). Sort both rolls descending; compare corresponding pairs. Each losing pair costs its loser 1 energy, ties and unmatched dice do nothing. Apply all losses. Attacker cannot lose final energy in own duel. Example: attack [6,2], defense [5,4] costs each 1 energy. If defender falls, steal one random hand card if available.

If the fallen defender occupies a different cell, attacker may exchange positions or keep their position. Same-cell falls do not offer a swap. Declining restores the previous phase and permits further legal actions. Accepting exchanges both occupants atomically, consumes the attacker's movement, applies ordinary entry terrain to the attacker only (not to the displaced fallen surfer), and prevents further attacks/movement. If still standing and the card action was unused, the actor may use one remaining legal non-movement card (not Jumping, Surf Current or Change) before ending the turn. If a fall ends the match by Dominion, do not continue to conquest; resolve beach precedence at completed actions. The rules do not introduce a new response/reaction phase.

## 5. Single physical deck — 64 cards, 14 types

All distances count shortest-path edges on the active graph. Cards have no separate energy price. Direct attacks cannot reduce a target below 1 energy and cannot cause a fall, steal or move a rival; target standing unprotected rivals with energy >1, from round 2. Same-cell target is legal where otherwise eligible.

| Card | Copies | Effect |
|---|---:|---|
| Energy x2 | 9 | Restore 2 energy, cap 5; playable only below cap. |
| Lifeguard Float | 7 | Fallen-only recovery to 3 energy; uses card action. |
| Big Wave | 6 | Rival loses up to 2 energy; range 3. |
| Sunburn | 6 | Rival loses 1 energy; range 4. |
| Tsunami | 3 | Rival loses up to 3 energy; range 2. |
| Stone | 4 | Place within 3 edges. Ordinary entry loses 1 energy, then discard Stone. |
| Storm | 5 | Place within 2 edges. Ordinary entry loses 1 energy; persistent. |
| Cyclone | 4 | Place within 3 edges. On ordinary entry, randomly redirect once per edge-step to a legal neighboring cell excluding origin; resolve destination terrain. If no exit, stay. No redirect chain during same step. Persistent. |
| Island | 4 | Place within 2 edges. Each ordinary entry restores 2 energy, cap 5; no stationary/recovery gain. Persistent. |
| Jumping | 3 | Move onto adjacent existing obstacle (including Shark) with capacity, without entry effects; land there, keep obstacle, end turn. |
| Change | 1 | From round 2, swap with one standing rival in a different cell within 2 edges, unless protected by Amulet. Consume card and movement; ordinary terrain entry applies to actor only. No theft merely for swap. End turn. |
| Hang Loose | 4 | Gain 1 energy, cap 5; blocks incoming Drop In until beginning of next own turn. Does not block direct damage cards or Change. Cannot activate if already protected by Amulet/Hang Loose. |
| Amulet | 4 | Blocks incoming Drop In, direct attack cards and Change until beginning of next own turn. Does not prevent terrain damage. |
| Surf Current | 4 | Once movement begins, perform two mandatory ordinary adjacent steps, resolving terrain separately each step; may attack before first step, not between steps. First-step fall or beach arrival ends movement immediately. Retain defensive no-neighbor guard; no voluntary pass/finish between steps. Accepted pre-first-step Drop In conquest still consumes all remaining movement. One normal draw total if standing. |
| **Total** | **64** | |

Placement cards require a vacant, obstacle-free active course hex ID 7–48 within respective range; no start, beach, Shark, occupied or existing obstacle placement. Persistent hazards remain until match ends; Stone is the only one consumed by ordinary entry. Jumping bypasses all effects, including Island healing and Stone removal. Shark is fixed terrain, not a deck card: ordinary entry loses 2 energy, remains in place. Protection lasts until start of next own turn, not end of round, and does not prevent hazard effects.

## 6. Validation and remaining decisions

### R1.12.1 — reconciliation with latest playtest branch

Main and latest playtest-branch R1 engine were compared line by line. The sole functional engine difference is the rejection of voluntary pass between Surf Current steps; other recent card changes (Jumping wording, quick Float recovery, shared card UI and cumulative Drop In odds) are presentation only. The latest branch's 64-card inventory and older attack/placement ranges remain unchanged from main; the R1.12 candidate inventory and balancing effects are proposals, not already integrated. SK-DEC-058 and the branch's regression fixtures explicitly require both steps and cover fall, beach and Cyclone cases. Actual source blob `92b5fdaae118b743b902c5e3d324445893d476e2`, versus main `203e859862d78bc009d5a30a1a84bd1387e62897`.

Targeted A/B: latest branch engine patched in memory with the consolidated candidate (including 4P energy-only compensation); optional-pass control restores previous behavior. 8,640 matches = 6 player counts × 2 arms × 3 policies (race/fight/mixed) × 240 seeds (`812737419 + N*100000 + i*199`). 925,389 invariant checkpoints; 2–10 rounds, zero illegal scripted actions, blocked moves, unfinished matches or failed draws. Two targeted isolated fixtures confirmed optional pass works in control and is rejected in mandatory arm before legal second step completes the turn. Results optional vs mandatory: mean rounds 6.315/6.315, Drop Ins 16.730/16.734, falls 10.264/10.263, empty starts 11.09%/11.09%; Surf Current played 8,006/8,005 times, 99.35% of legal opportunities in each. Control voluntarily stopped 20 times; mandatory arm continued in 20 comparable heuristic situations, one causing damage/fall. No blocked second-step guard occurred. Mandatory rule changes real tactical choices but barely changes aggregate metrics in these policies; this is not proof that the card is less powerful for humans, nor a repeat of the seven-profile global evaluation. Keep four copies for the playtest, monitor card power. No actual Jest/client/build or human tests executed here; no game code changed.

### R1.12 global evaluation (prior to mandatory second-step correction)

Original global evaluation [R1.12 report](https://github.com/board-games-jf/surf-king-react/issues/11#issuecomment-7237930941): 22,960 matches, 12,530 primary candidate plus 10,430 comparator; 2,602,404 invariant checkpoints, no invariant violations, blocked mandatory moves or unfinished games in the tested policies; 2–10 rounds. Candidate results:

| Players | Mean rounds | Drop Ins | Falls | Dominion wins % |
|---:|---:|---:|---:|---:|
| 2 | 6.57 | 5.77 | 3.77 | — |
| 3 | 6.58 | 11.48 | 7.11 | — |
| 4 (original R1.12 arm) | 6.51 | 16.17 | 9.88 | — |
| 4 (recommended energy-only arm) | 6.54 | 16.12 | 9.85 | — |
| 5 | 6.36 | 20.51 | 12.33 | — |
| 6 | 5.95 | 21.92 | 13.07 | 14.43 |
| 7 | 6.01 | 27.33 | 16.05 | 9.23 |

No dominant tested exploit; all 14 card types used. 11.02% of primary candidate turns start empty, all fallen in these simulations; 42,375 terrain-fall turns had no normal draw. Watch Surf Current (99.1% selected when legal), Sunburn/Storm/Change (less often selected), high fall frequency, empty hands, first/late actor and spawn bias especially 4–7 players. Seven-player spawn shares ranged 8.99–18.61%. No claim of exact fairness or proven fun; bots are heuristics, not optimal, shared seed families and smaller profile samples limit inference. Actual engine source was patched in memory and Dominion checked by harness, not integrated into the running app. No persisted reproduction runner for these latest experiments, no client/Jest/build/human tests executed in this phase. See R1.11.2 and R1.12 issue comments for full data, seed and policy details.

Owner requested no empty-hand start draw and deferred new recovery card (Second Wind). Keep random fall loss, successful-move-only draw, and existing recovery. No new mechanics, deck changes, or infrastructure proposed before human testing. Remaining approval: consolidated R1.12.1 candidate, especially 4P energy-only compensation, as a local playtest baseline; separately authorize implementation. Preserve original R1 and legacy as controls as agreed in issue #66. Follow issue → branch → tests → PR review; no merge or deployment without separate explicit authorization. Actual app regression/build and owner-run human playtests remain pending. Draft #12's historical decision-ID collisions must be reconciled before any documentation merge. 
