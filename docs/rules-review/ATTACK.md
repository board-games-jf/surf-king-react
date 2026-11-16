# Rule Review — Drop-in Attack

**Status:** Attack adjacency owner-confirmed; **ties causing no energy damage accepted for design trial** (2026-11-16). Five-energy cap, up-to-two-dice combat, strict-win 1 damage are being tested as a bundle, not finalized rules.  
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).

## Confirmed rule — attack range (2026-11-15)

The owner confirmed that **drop-in targets must be adjacent**. Here, an adjacent opponent occupies a hexagon **sharing a full edge** with the attacker's hexagon.

- A cell may have up to six edge-sharing neighbors; boundary cells have fewer.
- Touching only at a corner does not qualify.
- **No remote attacks** using normal drop-in are approved.
- This approval is limited to attack range, **not** attack cost, initiative, eligibility, dice resolution, rewards, or effects of cards.
- The previous owner-confirmed displayed **18 → 15** non-adjacency example therefore fails the same edge-sharing requirement for both normal movement and drop-in.

## Code evidence (not automatically approved)

As reviewed in `main` at `6daa1705ff11d958a10cffd951eca9f5f2a1084c`:

- `src/game/SurfKingGame.js` checks `isCloseTo` in `dropIn`, but `isCloseTo` currently uses absolute engine-ID differences 3, 4, or 7. It may allow nonadjacent attacks near boundaries.
- The current combat loop compares descending attacker and defender dice; on equal values, the `else` branch treats the comparison as a defender win, reducing attacker energy.
- These statements describe code only. No runtime or automated tests were executed during this review.

## Owner balance suggestion — 2026-11-16 (NOT an approval)

The owner asked whether the game should allow **5 or 6 maximum energy** and use **2 dice in attack and defense instead of 3**, seeking a quicker, more balanced confrontation.

**Verified code clarification:** The current engine does **not** hardcode 3 dice. It sets both sides' dice count equal to their own energy, up to the current energy cap of **4**, and compares every available sorted dice pair. One Drop In can therefore inflict multiple energy losses to either participant.

**Assistant recommendation P-08, for discussion only:**

- Set the **energy cap at 5**, rather than 6, for a shorter path to falling and to avoid excessive survivability.
- Separate energy (survival strength) from combat dice count. **Cap each side at 2 dice**: at 1 energy, roll 1 die; at 2–5 energy, roll 2 dice.
- Each participant keeps the **higher** die; compare these two results. The provisional combat winner makes the loser lose **1 energy**, no more than one loss per encounter.
- The current defender-tie advantage can be a provisional baseline, **but its effect on attack incentives must be checked**; no tie outcome has been owner-approved.

**Concrete illustration:** A surfer with 5 energy faces a surfer with 2 energy. They roll 2 dice each, not 5 vs 2. The 5-energy surfer is more resilient but does **not** get 5 chances to hit. This makes high-energy power principally about endurance, not overwhelming dice volume.

**Trade-off:** Beyond energy 2, additional energy would not increase the probability of winning one roll, only the number of losses a surfer can endure. The owner previously described a WAR/Risk-like relationship between energy and combat force; this is a partial departure from that analogy. The advantage is that a powered-up surfer is harder to knock off without automatically dominating each attack. Existing Energy x3, Coconut, Big Wave and shark values may require recalibration; at 2 starting energy, a -2 effect still means an immediate fall.

**Open:** Whether the owner means precisely two dice for every nonfallen surfer even at energy 1, versus the recommended **up to two dice**, should be confirmed as part of choosing the attack model. Do not infer the owner's answer.

## Owner agreement to **design trial** — P-08, 2026-11-16

**Owner said:** "Yes, let's try it; it looks promising; review the other elements together."

**Trial baseline authorized for rules analysis, NOT finalized rules or code authorization:**
- Maximum energy **5**; match starts at **2 energy** (previously accepted).
- **Up to 2 six-sided dice for attack and defense**: 1 die at 1 energy, 2 dice at 2–5 energy. Compare **only the highest** of each player's dice; suggested 1 energy lost by the loser, at most once per combat.
- **0 energy = fall** remains an approved rule.

**New balance discovery (mathematical enumeration, no game simulation):** With two dice on both sides and the highest-of-two comparison, attack higher 505/1296 (**38.97%**), defense higher likewise 505/1296 (**38.97%**), tied 286/1296 (**22.07%**). Therefore making the *defender win ties and damage the attacker* would cause the attacker to lose energy in **61.03%** of evenly matched encounters. This may strongly discourage the very attacks that should make the race interactive.

**Assistant suggestion for a holistic trial (P-09, NOT owner-approved):** An equal highest die produces **no damage**; a strictly higher highest die inflicts **1 damage** on the loser. This is not the current implementation; tie handling remains open. Keep combat to one quick throw each.

**Full-game dependence:** At 5 energy, single-damage exchanges can require several clashes to trigger a fall. Reassess the B variant's free +1 energy action, card restorations, Sharks and the damage cards at the **same time**, rather than deciding dice independently. See [OPTIONS.md](OPTIONS.md).

## Owner-confirmed experimental tie rule — 2026-11-16

The owner said **"vamos tentar empate sem dano"** — **try ties without damage**. Treat this as an **accepted rule for the ongoing tabletop/gameplay design trial**, **not** final rulebook approval or code authorization.

In the P-08 experimental combat model (maximum 5 energy, up to 2 dice per participant, compare the highest roll):
- Higher attack roll: defender loses **1 energy** (assistant's linked damage proposal, not yet separately finalized).
- Higher defense roll: attacker loses **1 energy** (same pending damage proposal).
- **Same highest result: neither loses any energy.** This is the precise owner-approved **trial condition**.

Do **not** infer that a tied combat also moves, pushes, swaps or awards cards: those outcomes have **not** been decided. The engine currently damages the attacker on ties, so this remains **documented design only**, not implemented.

The tie-without-damage proposal prevents the old approximately **61% attack-energy-loss probability** at equally matched two-die combat; each side instead has **505/1296 ≈ 38.97%** of a strictly higher roll and the remaining **286/1296 ≈ 22.07%** are no-damage ties. Mathematical enumeration only, not a gameplay test.

**Important gameplay risk:** A non-damaging tie and at most one damage for a decisive combat can make combat less consequential in a quick seven-step race. Test whether successful Drop In needs a tactical positional effect later, without inventing that effect now.

## Next question — one at a time

**Tie without energy damage has now been explicitly accepted for the design trial.** Continue the linked balance review: if battles are too low-impact over a seven-step race, evaluate combat's tactical value alongside cards, sharks, recovery and the race end. The max-5 / up-to-two-dice framework remains experimental, not final.

**Status:** Pending owner decision.

## Implementation boundary

Documenting a rule does not authorize altering `dropIn`, `isCloseTo`, the client, or tests. This draft PR remains documentation-only and unmerged.
