# Rules Review — Energy as Combat Strength

**Status:** Assistant proposal for playtesting; **not owner-approved**.
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) / [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).
**Current main reviewed:** `e4e083f9035e314eb2107bd1cca448292cc4629e` (2026-11-16).

## Owner concept

The owner suggested a **WAR/Risk-like interpretation** of energy: energy behaves like soldiers/strength in combat, possibly starting everyone at one energy and growing through movement or cards. This is a **question and design direction, not approval of the start value or gain rule**.

## Current implementation facts

- All players start with 4 energy, the maximum is 4.
- Each normal maneuver currently costs 1 energy, except with the Bottled Water effect.
- Drop-in rolls as many dice as each combatant's energy. Descending dice are compared; defender wins ties.
- Zero energy triggers falling off the board.
- Cards increase energy (+1, +2, +3, or to maximum), and some damage it (Big Wave -2; Sunburn -1).
- The four built-in Shark cells (28–31) each currently impose 2 energy damage.
- Island currently adds 2 energy on entry (through negative damage). This needs rebalancing with the proposed economy.
- A one-energy attacker or defender can be knocked off the board after losing a single paired die; this is the main early-game risk of starting with 1.

## Assistant recommendation — P-04 (not approved)

**Start with 2 energy**, rather than 1, to avoid first-hit elimination. For design evaluation, propose a small, coherent package:

1. A normal edge-adjacent maneuver costs **0 energy**.
2. Gain **+1 energy** (up to 4) only when reaching a **new personal furthest-forward row** toward the beach. This does not award energy for moving sideways, backward, or returning to an already reached row.
3. Energy cards still increase strength/recovery; energy measures combat dice and resilience to hazards. Their relative deck frequency will need review after adjusting progression.
4. At **0 energy**, the surfer **falls**, as owner-confirmed. **Return timing/energy remains unresolved.**
5. No Rest mechanic, as explicitly owner-approved. Whether movement is compulsory, and how to handle physical immobilization, remain to be confirmed separately.

**Illustrative progression:** Start at 2; first new forward row → 3; next new forward row → 4. Further movement does not increase energy unless it was reduced earlier and a still newer row is reached, or cards restore it.

### Why two rather than one?

Starting at 1 could produce a highly punitive opening: one loss is a fall, especially with a Sunburn card (-1) or an early attack. Two grants a small buffer while still making a third and fourth energy point worth earning. Both numbers should eventually be playtested rather than assumed balanced.

### Known cross-system risks (not solved yet)

- The leading player gains energy fastest and could snowball. Cards and combat might enable comebacks, but this needs playtesting.
- The +1 progression cap is reached within two fresh forward rows from a start of 2; most later energy growth would depend on cards after taking damage. Check that energy cards remain worthwhile but not dominant.
- If ordinary movement is free, Bottled Water's current cost-waiver effect becomes obsolete and needs a redesign or removal.
- Island's current +2 and Shark's -2 become major positioning incentives. An initial 1-energy start could be particularly punishing for a surfer forced into an obstacle or targeted by cards.
- The drop-in combat system currently uses energy as both **dice count and damage capacity**, so an advantaged leader is doubly stronger.
- The **furthest-forward row** condition is proposed to prevent repeatedly moving back and forth to farm energy. This requires tracking each surfer's maximum progress but no extra player-facing choice.
- Mandatory movement does not alone guarantee forward progress; a separate simple anti-stall end condition might be needed.

## One focused next decision

**Would the owner like to explore a 2-energy opening, rather than the proposed 1-energy opening, as a provisional design baseline for balance testing?**

No code implementation, tests, merge or deployment approved. Other mechanics should not be finalized until cross-system review.
