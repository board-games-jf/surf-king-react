# R1 Drop In: cumulative knockdown probability

## Question and scope

For a currently legal Drop In, what is the probability that the current attacker knocks down the same defender before the attacker reaches one energy, assuming that the attacker immediately repeats the attack whenever possible?

This is **not** the probability of winning the match, or of winning against a defender who takes subsequent turns. It is a conditional, presentation-only analysis of repeated attacks in the same turn. It assumes no movement, cards, protection changes or other intervening effects, and that both players remain eligible until the attacker reaches one energy or the defender falls. A tie permits another attempt. The defender's fall ends the calculation, before any subsequent card transfer or position-swap decision.

The attacker uses the maximum legal number of dice on every attempt: `min(2, attacker energy - 1)`. The defender uses `min(2, defender energy)`. Dice are independent fair six-sided dice. Each side sorts its dice from highest to lowest; corresponding pairs are compared. A losing die costs its player one energy; ties cost nothing. Both sides can lose energy on the same roll. Unpaired dice cause no energy loss. These assumptions match `r1DropIn` and `r1MaxAttackDice` in `src/game/r1/SurfKingR1.js` at main commit `839633b2a1b471c6f4a1b451d0925dae04894f75`.

In the current engine, an attacker with one energy cannot initiate another Drop In, while a defender reaching zero falls. The attacker cannot lose their last energy in their own Drop In: the maximum number of attacking dice is limited to energy minus one. This stopping condition is **not** the attacker falling or the defender winning the game.

## Results

Percentages are rounded to two decimal places. Rows are attacker energy; columns are defender energy. Both players start standing and the attack is assumed legal.

| Attacker ↓ / Defender → | 1 | 2 | 3 | 4 | 5 |
| --- | ---: | ---: | ---: | ---: | ---: |
| **2** | 50.00% | 15.28% | 4.67% | 1.43% | 0.44% |
| **3** | 84.72% | 50.00% | 32.58% | 18.83% | **11.49%** |
| **4** | 95.33% | 67.42% | 50.00% | 34.12% | 23.32% |
| **5** | 98.57% | 81.17% | 65.88% | 50.00% | 37.22% |

For **3 versus 5**, the exact probability is `39912662939 / 347282443008`, or approximately **11.49285365%**. The current in-game **Balanced** indicator instead compares the chances of a favorable or unfavorable **net energy result in one roll**, excluding equal-net outcomes; it does not represent this cumulative knockdown probability. Equal starting energy does not necessarily yield 50% in this analysis: the attacker stops at one energy whereas the defender must reach zero.

## Calculation

Let `P(a, d)` be the probability from attacker energy `a` and defender energy `d`. Define `P(a, 0) = 1` and `P(a, d) = 0` for `a < 2` and `d > 0`. For each nonterminal state, enumerate all ordered dice outcomes. If `N` is the number of outcomes, `T` is the number producing no energy loss, and each other outcome has losses `(la, ld)`, then:

```text
P(a, d) = sum(P(a - la, d - ld) for all outcomes where la + ld > 0) / (N - T)
```

Removing no-loss outcomes from the denominator solves the self-loop exactly; it does not discard ties from the actual game. Outcomes in which both players lose energy are included with both losses applied. The following independent reference enumerator uses exact rational arithmetic and reproduces the table:

```python
from fractions import Fraction
from functools import lru_cache
from itertools import product

@lru_cache(None)
def knockdown(attacker, defender):
    if defender <= 0:
        return Fraction(1)
    if attacker < 2:
        return Fraction(0)
    attack_dice = min(2, attacker - 1)
    defense_dice = min(2, defender)
    total = 6 ** (attack_dice + defense_dice)
    no_loss = 0
    winning_sum = Fraction(0)
    for roll in product(range(1, 7), repeat=attack_dice + defense_dice):
        attack = sorted(roll[:attack_dice], reverse=True)
        defense = sorted(roll[attack_dice:], reverse=True)
        attacker_loss = sum(a < d for a, d in zip(attack, defense))
        defender_loss = sum(a > d for a, d in zip(attack, defense))
        if attacker_loss == defender_loss == 0:
            no_loss += 1
        else:
            winning_sum += knockdown(attacker - attacker_loss, defender - defender_loss)
    return winning_sum / (total - no_loss)

for attacker in range(2, 6):
    print(attacker, *(f'{float(knockdown(attacker, defender)) * 100:.2f}%'
                      for defender in range(1, 6)))
print('3 vs 5:', knockdown(3, 5))
```

## Validation and limits

Executed the reference enumerator with Python's `Fraction` on 2026-11-27, covering all 20 energy pairs shown above. A separate exact enumeration that maximizes the knockdown probability by choosing one or two legal attacking dice at each state produced the same displayed values for these 20 states; this does not establish an optimal policy for other rules or objectives. These are independent model calculations, not a test of the running game or a human-play balance study.

This document does not change the existing indicator or its accepted design (SK-DEC-050). Replacing it with cumulative odds requires an explicit product decision about the wording and display, particularly whether this conditional model should be presented as a probability.
