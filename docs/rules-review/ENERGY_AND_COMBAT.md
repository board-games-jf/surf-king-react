# Rule Review — Energy, Cards, Obstacles and Comeback

**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | **Rules hub:** [INDEX.md](INDEX.md) | **Draft PR:** [#12](https://github.com/board-games-jf/surf-king-react/pull/12)
**Status:** Initial energy **2 is accepted** (`SK-DEC-013`, draft DECISIONS). Cap **5**, up to **2 combat dice** and no-damage ties are **owner-accepted experiments**, not finalized game rules.

## Confirmed design foundations

- Each surfer **begins the match with 2 energy**.
- **0 energy causes a fall** from the surfboard.
- **No Rest mechanic** is allowed.
- The goal is a **short, portable, strategic, fun and replayable race**; balance energy with turns, cards, obstacles, combat, re-entry and victory.

## Current code baseline vs experimental package

| System | Existing engine behavior (verified `main`, 2026-11-16) | Current trial / candidate status |
| --- | --- | --- |
| Starting energy | 4 | **2 accepted**; not implemented |
| Energy cap | 4 | **5 trial** accepted |
| Normal movement | Costs 1 energy unless Bottled Water | **0 cost** is assistant P-09, not approved |
| Drop In dice | Dice count equals player's energy, up to 4 | **Up to 2 dice** is accepted for design trial; compare highest, strict loss −1 are assistant details |
| Combat tie | Attacker takes damage on equal paired dice | **No damage to either participant** accepted for trial |
| Shark, four central hexes | −2 energy on entry | **−1** is candidate only; −2 instantly drops a healthy 2-energy starter |
| Storm and Island | Storm −1; Island +2 energy | Effects remain open; Island may allow repeat-visit energy farming |
| Big Wave / Sunburn | Big Wave −2; Sunburn −1 | Big Wave **−1** is candidate only; test against 2 starting energy |
| Energy card / Energy x2 / Energy x3 | +1 / +2 / +3 | Consider capping healing per card at +2, not approved |
| Coconut | Restore to energy cap | Potentially overpowered at new cap 5; rework or restrict only if needed |
| Lifeguard Float / Swimming Fin | Rescue from fall, restore +2 / +1 | Need review alongside automatic return rules |
| Bottled Water | Prevents the cost of a normal maneuver | Becomes redundant if normal movement becomes free; redesign/removal needs approval |
| Card acquisition | Initial 2 cards; later card supply often follows a maneuver | Must preserve meaningful choices without random-draw domination |

## Current coherent candidate P-09 — NOT approved

**Movement remains possible without burning survival energy**; optionally use **one card OR one adjacent Drop In**, then take one legal normal move and draw a card. No automatic repeatable "+1 energy" each turn: from two to the five-energy cap would otherwise take just three such actions.

**Combat:** at energy 1 roll one die; at 2–5 roll two; compare highest. **Equal best results cost no energy (owner accepted for trial)**; a strict loss costs one (assistant candidate). A full-health 5-energy rival is tougher to knock down but does not have more dice than an energy-2 rival.

**Damage/hazards:** first trial candidate: Shark −1, Big Wave −1, Storm −1. Be careful not to make hazards harmless; their purpose is to create a risk/reward path decision. Island currently restores +2, which may need controls to stop cycling and farming.

**Recovery:** being at zero means fallen. Experiment with a guaranteed short comeback (return at 2 energy next personal turn, losing that maneuver), **not Rest**. Rescue cards should provide an advantage but should never be the only way to resume play. Recovery timing is not approved.

**Match pressure:** first to beach wins, with a finite-round fallback only as a candidate. The approximately seven-step geometric shortest route means fights must affect position or momentum, not just wear down health too slowly.

## Main gameplay risks (design review, not tested)

1. **Overpowered healing:** frequent +2/+3/full-refill cards and 1-damage combats might render attackers powerless.
2. **Too many falls early:** with 2 starting energy, current Big Wave −2 and Sharks −2 cause immediate falls; repeated setbacks may discourage replay.
3. **Weak tactical attack:** 2 vs 2 dice gives 38.97% strict win, 38.97% strict loss and 22.07% no-damage tie. Positional incentives may be more important than grinding five energy to zero.
4. **All-pass or backward oscillation:** no Rest is confirmed, but compulsory movement and a fair endgame fallback are not yet finalized.
5. **Player count:** 2–7 players with shared choke points create different card, positioning and pace incentives; test representative scenarios.

## Next integrated action

Paper-review a full race at 2, 3, 4 and 7 players under these **clearly provisional** parameters. Pay special attention to a **2-energy challenger versus a 5-energy leader**, central Shark crossing and recovery after one fall. Recommend one compact positional incentive for Drop In **only if** damage alone cannot influence the race meaningfully.

**No gameplay code edits, gameplay tests, merge or deployment.**
