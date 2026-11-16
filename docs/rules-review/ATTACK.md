# Rule Review — Drop In / Combat

**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | **Rules hub:** [INDEX.md](INDEX.md) | **Draft PR:** [#12](https://github.com/board-games-jf/surf-king-react/pull/12)
**Status:** Range is **owner-confirmed**; maximum energy, dice count and **no-damage ties accepted for design testing**; all other combat details and effects remain open.

## Owner-confirmed rule

Normal Drop In can target **only a player in an edge-sharing adjacent hexagon**. Cells touching only at corners cannot be attacked. The confirmed displayed nonadjacent example 18 → 15 is also invalid for normal Drop In.

## Owner-accepted experimental conditions (2026-11-16)

- **Test maximum energy 5**, from the **approved 2-energy match start**.
- **Test at most 2 dice per participant**: provisional interpretation, 1 die when at energy 1, 2 dice when at energy 2–5.
- **Test ties without energy damage:** if each player's **best die** is equal, **neither player loses energy**. The owner explicitly said "vamos tentar empate sem dano". This is a **provisional trial condition**, not implementation authorization or permanent approval of every combat parameter.

## Assistant's linked candidate rule (not approved)

Roll the allowed number of six-sided dice on each side; compare **only the highest value**. If the highest values differ, the lower-scoring surfer loses **1 energy**. The owner did **not** separately approve this damage amount, a positional reward, dice count at energy 1, or further effects of a tie.

| Attacker's best vs defender's best | Candidate energy outcome |
| --- | --- |
| Attacker strictly higher | Defender −1 energy |
| Defender strictly higher | Attacker −1 energy |
| **Equal highest values** | **Both −0 energy** — owner-accepted for design trial |

**Two dice vs two dice, exact enumeration:** attack strictly higher `505/1296 = 38.97%`; defender strictly higher `505/1296 = 38.97%`; tie `286/1296 = 22.07%`. The old defender-wins-ties code damages an equally matched attacker `791/1296 = 61.03%` of the time. These are exact theoretical probabilities, **not match playtest results**.

## Whole-game balance concerns

1. **Combat relevance:** With a short board (a theoretical seven-maneuver route), no-damage ties and single-energy losses, a Drop In may not be worth spending a tactical action on. Assess whether **a strictly successful attack also changes positions**; no positional rule approved.
2. **Strong-surfer durability:** A 5-energy surfer rolls **the same maximum two dice** as a 2-energy surfer. More energy means more endurance, not greater per-clash win odds.
3. **Cards and terrain:** Current Shark and Big Wave −2 cause immediate falls at the approved 2-energy start; Island +2 and Energy x3/Coconut boosts may quickly create nearly untouchable leaders. Rebalance these before finalizing combat.
4. **No forced board stall:** Moving and attacking must remain edge-legal; all-neighbors-blocked and repeated backwards moves need a match-level answer.

## Current implementation, NOT new rules

The code in `src/game/SurfKingGame.js` (rechecked from `main` on 2026-11-16) still uses `MAX_ENERGY = 4`, rolls a number of dice equal to each player's energy, compares **multiple ordered pairs**, and damages the attacker on equal pairs. A clash can therefore cause multiple energy losses. **None of the new trial settings has been implemented or tested in the game.**

## Next connected action

Explore a complete race where a 2-energy surfer tries to stop a 5-energy leader **with no-damage ties**. Determine whether a successful Drop In needs a single intuitive **positional payoff**; weigh its effect on cards, falls, accessibility and match length. Recommend one integrated rule package, not another disconnected number.

**No game code edits, runtime tests, merge or deployment.**
