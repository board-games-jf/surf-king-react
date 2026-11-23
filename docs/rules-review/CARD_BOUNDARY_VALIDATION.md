# Iteration E — card effects and boundary conditions (design-model fixtures)

**Date:** 2026-11-23. **Status:** Executed independent source-grounded design-model checks; **not a real game-engine test, not a balanced/ratified deck and not permission to implement**. Issue [#11](https://github.com/board-games-jf/surf-king-react/issues/11), draft PR [#12](https://github.com/board-games-jf/surf-king-react/pull/12). The owner requested both individual effect validation and stronger player-to-player interactivity.

## Method and evidence

Read live `main` `c6fd08e2da82ca223740e3aa944c47f87aa84f16`, relevant game/card source and tests; draft [deck proposal](DECK_REBALANCE_PROPOSAL.md), [ATTACK.md](ATTACK.md), all four deck-iteration reports, SK-DEC-023/024/025 and trial SK-DEC-026. [The exact executable fixture source](CARD_INTERACTION_BOUNDARY_TESTS.js) accepts the current 53-cell layout JSON and derives true edge-adjacency. The fixtures use **proposed revised effects** and simplified model state, not legacy `executeCardAction`, so their passing does **not** imply the application currently works this way.

**Executed 44 isolated fixture cases: 44 PASS / 0 FAIL.** Cases cover the 18 existing draw-card types, fixed Shark, proposed Surf Current and cross-card rules. Assertions exercised geometry, vacant/blocked destinations, one-card loss on a new fall, source-attribution fixture, rescue/recovery choices and positional displacement; the model chooses the first valid Cyclone/Tsunami destination for reproducibility, **not a uniformly randomized destination**.

| Area | Executed positive fixture | Executed guard/boundary | What remains unverified |
| --- | --- | --- | --- |
| Energy / Energy x2 / Energy x3 / Coconut | +1/+2/+3/refill and 5-energy experimental cap | +1/+2 clamp at cap; x3 candidate removal is not implemented | Energy abundance, actual source cap 4, non-capped heal card validity |
| Bottled Water | Ordinary movement tax is zero under trial | Original waiver gives no incremental gain | Any proposed new shielding effect |
| Swimming Fin / Lifeguard Float | Fallen surfer stands at E2/E3 with respective card discarded | Cannot rescue while already standing or without card | Tactical slot, next-own-turn timing in actual engine |
| Fixed Shark | Entry from 21→28 causes E2→0 fall and one hazard discard | Getting up in cell 28 does not re-trigger −2 | Multiple forced Shark sources and who receives the card |
| Big Wave / Sunburn | Standing rival loses 2/1; on actual new fall attacking player receives one hand card | Out-of-range attack rejected; Amulet blocks | Repeated target choices, mixed damage+push resolution |
| Stone | Valid placement blocks entering its tile, expires after 3 owner turns | Occupied-cell placement fails | Multiple Stone placements and all-neighbors-blocked progression |
| Storm / Island | Enter Storm: −1; enter Island: +2 and one-shot removal | Fixed Shark is not a valid placeable Storm; Island cannot be farmed repeatedly | Precise obstacle age/owner phase, effect of card removal on deck |
| Cyclone | One bounded edge-adjacent redirection to vacant tile | When all exits except entry are occupied, remain on Cyclone, no loop | Uniform random selection, simultaneous obstacles and forced Shark attribution |
| Change | Swap two standing rivals and resolve Shark entry once | Out-of-range/Amulet rejects | Multiple arrivals, attack-only versus maneuver-replacement, fall on both ends |
| Jumping | Adjacent placed Stone removed | Fixed Shark cannot be removed | Timing with placed/active card zone |
| Tsunami | Push opponent one legal seaward edge | Blocked row exits and Amulet protection deny push | Multi-target order, owner attribution on resulting hazard, coastal boundaries |
| Hang Loose / Amulet | Hang Loose denies Drop In; Amulet denies attack | Hang Loose does not block Big Wave; Amulet does not block Shark | Lifetime across owner turns and counterplay frequency |
| Surf Current | Two consecutive true-edge moves are possible | Cannot jump through occupied tile; stops on Shark-caused fall | Leader versus trailer relative benefit and catch-up limits |
| Card transfer | New fall transfers to attacker; empty hand loses nothing; repeat damage while fallen takes no more | Attacker with full hand reaches **6 cards** in fixture — exposed unresolved recipient limit, not validated policy | Recipient overflow/random discard/choice, simultaneous attack-fall |
| Forced blockage / positional Drop In | All cell-21 neighbors can be occupied without overlap; strict attacker win can swap 35↔42 | Swap uses one normal maneuver, is not an extra distance step | Fallen defender remains occupying cell under accepted SK-DEC-023; cannot silently vacate as in historical P-11 |

**Observed source/code risks, not proven app test failures:**
1. `transferRandomCardFromPlayerToOtherOne` builds a set of allowed original hand indices but then chooses `cardPos` using `Math.random() * keys.length` **without indexing back into the allowed keys**. It can thus transfer an active/protected hand card instead of an eligible card. This source-level indexing mismatch needs a dedicated executable engine regression test before implementation.
2. Current `getDeckCard` repopulates `G.deck` from `G.discardedCards` when empty but does not visibly clear the source discard array in that branch, creating an apparent card-conservation risk until tested.
3. `Cyclone` and `Tsunami` use numeric offsets / recursive vacancy search without all edge protections. Boundary fixtures use **safer proposed rules**; they do not certify the old function.
4. `Jumping` can remove fixed Sharks, and current `Big Wave`, `Sunburn`, `Change` do not check the proposed target range. Tests verify candidate restrictions, **not existing production behavior**.
5. Historical [ATTACK.md](ATTACK.md) P-11/P-12 suggests a fallen surfer vacates the tile and retreats, **inconsistent with newer accepted SK-DEC-023**, which keeps the fallen surfer occupying their final hex. Treat that older approach as historical and do not reuse its exchange/fall exceptions.

## Outcome and next gate

**The candidate mechanics are internally coherent in the 44 executed cases, but the original engine and most multi-actor ordering are unverified.** Most important unclosed cases: forcing Shark entry with rival-controlled obstacles, defender falling during a winning Drop In (no legal swap onto their occupied cell), Swap and Tsunami attacker attribution, protected/fallen target selection, multiple hazards, receiving hand cap, and Surf Current advantage for leaders versus trailers. These directly affect the owner's requested **meaningful interaction between people**.

**Next iteration F:** Script interactive contest snapshots with and without optional positional Drop In, contested bottlenecks, proactive protection, and speed-card response. Report which player can materially affect another's path/hand, avoid inventing general card immunity or a new networking requirement. Then perform more exhaustive random-choice/dice and full-game design trials. No rules/card quantities newly approved here.

**Verification status:** 44/44 independent JavaScript model cases executed, no Jest/build/application match/human playtest. No source modifications, merge or deployment.
