# Rules Review — Energy as Combat Strength

**Status:** Owner-approved opening energy: **2**. All gain/cost mechanics below remain **assistant proposals, not accepted rules**.
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) / [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).
**Rules-engine baseline checked:** `main` `e4e083f9035e314eb2107bd1cca448292cc4629e` (2026-11-16).

## Owner-approved rules and design goal

- Every surfer starts with **2 energy**.
- **0 energy means falling off the surfboard**, not resting.
- **Rest is removed** as a game mechanic.
- Movement/attacks are geographically limited to true edge-adjacent cells in the separately approved contexts.
- Gameplay should be **fast, simple, portable, fun, repeatable and strategic**, with energy resembling WAR/Risk combat strength rather than a complicated progress counter.

## Current implementation facts (not the new rules)

- The engine still starts players at 4 energy, its present maximum; normal movement costs 1 energy.
- A successful normal maneuver can replace a card; several deck cards restore energy.
- Drop-in uses energy as **dice count and remaining strength**; zero energy causes a fall.
- Shark currently deals 2 energy damage; Island currently adds 2. Sunburn deals 1, Big Wave 2.
- Bottled Water currently prevents a normal maneuver's 1-energy cost.

## Simplified assistant proposal — P-05 (NOT approved)

**Normal movement should neither consume nor grant energy. Energy would increase through cards, not by crossing rows or counting movement progress.** A surfer still starts at 2; the existing maximum of 4 is a candidate to retain pending balance testing. This replaces the assistant's earlier P-04 recommendation to gain energy by reaching a new highest row or every two distinct milestones.

**Why simplify:** The owner explicitly found the record/progress milestone mechanic too complex. A one-line rule is easier to teach, implement and understand. It prevents gain loops through backward/forward maneuvers with no extra counters.

**Consequences requiring review before implementation:**
- Bottled Water's existing effect becomes redundant if normal movement is free; remove or redesign it later.
- Energy gains become more dependent on random card draws. Keep card supply and deck composition under review so players have reasonable access to strength/recovery.
- Island's current +2 energy effect is an environmental bonus, not a card played from the hand. Decide separately whether to keep it as an exception, retune it or change it.
- At 2 starting energy, Shark's current -2 causes an immediate fall; hazard intensity must be balanced with this start.
- Combat still has leader-strength snowball concerns (energy influences both dice count and survival); test card-based catch-up opportunities.
- Rules for recovery after falling, positional deadlocks, compulsory movement and victory-time limit remain undecided.

## P-08 agreed as a design experiment — 2026-11-16 (not finalized)

The owner proposed **5 or 6 maximum energy**, alongside **2 dice for attack and defense instead of 3**, then agreed to **try the assistant's 5-energy / up-to-two-dice recommendation**, explicitly requiring other parts of the game to be reviewed together. This is approval to **evaluate a design trial**, not approval of a permanent rule or permission to change gameplay code. Current code has maximum energy 4 and rolls `energy` dice, not a fixed 3.

**Assistant's preferred test:** **5 maximum energy** and **up to 2 dice on either side** (one die at energy 1, two dice at energy 2–5), comparing the highest die and inflicting at most 1 energy damage in a Drop In. This distinguishes **energy capacity** from **dice count**, preventing five-energy surfers from automatically rolling five dice. At 5 vs 2 energy, both roll two dice, so the 5-energy surfer has more staying power but not a larger dice pool. It is faster and less swingy than comparing 5 pairs. Six maximum energy may extend matches unnecessarily.

**This is not a confirmed rule.** The earlier P-07 full-match variants assume a **tentative cap of 4** and a different dice rule. For any future comparison, explicitly test the same A/B/C gameplay options under the P-08 cap/dice hypothesis rather than silently treating P-08 as accepted.

**Systemic concerns:** Starting energy stays **2 (approved)**, and 0 is a fall. Energy beyond 2 no longer increases per-roll odds, so the WAR-like army progression becomes primarily survivability. If each clash does only one damage, a five-energy player needs repeated successful hits to fall; sharks, Big Wave, healing cards, and re-entry need coordinated balancing. The tie outcome remains unresolved. No probability or match simulations executed.

## Integrated 5-energy / two-dice test — P-09 (assistant proposal, NOT approved)

Under the proposed **two-dice cap**, energy **2 and 5 have the same roll distribution**; the higher energy mainly grants more survivability. A surfist who can simply select "+1 energy" every turn (the earlier **B** variant) reaches 5 from 2 in three ordinary turns. Paired with single-point combat losses and recovery cards, this risks making conflict inconsequential.

**Recommendation for the first paper-playtest:**
- Keep **2 starting / 5 maximum energy**, **up to 2 dice**, highest die compared, and **1 energy loss** on a strictly lost exchange (P-08 testing baseline).
- Try **equal highest dice = neither surfer loses energy** (P-09 only). For two dice each, this happens in **286/1296 = 22.07%** of possible equally likely rolls. With defender-wins-ties, an equally powered attacker loses energy in **791/1296 = 61.03%** of rolls; strictly attacker-higher is only **505/1296 = 38.97%**. Mathematics only: no game simulation.
- Treat **ordinary movement as free** and mandatory where legal; successful moves draw a card. Give **one optional tactical action per turn: play a card OR perform an adjacent Drop In**. Do **not** offer a free repeatable +1 energy action in this trial.
- Start with the currently implemented card catalogue but **test capping healing from a single normal energy card at +2**, especially Energy x3 / Coconut. Their names/effects would need an explicit separate decision later; do not assume approved remapping.
- **Shark -1** and **Big Wave -1** as initial damage candidates (both currently -2, causing immediate fall at the approved 2-energy start). Storm remains -1. Island's existing +2 energy still needs review for repeat-visit farming.
- At zero energy, **fall**; test returning on the next personal turn at 2 energy but unable to move that turn. This is **not Rest** and is not approved.
- Preserve beach victory; test a finite **10-round fallback** from P-07, and check whether it is fair with 2 and 7 participants.

**Main open questions:** If nobody can get a usable card, a card-or-attack system can become a plain race; card availability and attack positioning matter. Two dice with single damage may lead to slow combat, so Drop In may need a simple *positional* payoff in a later candidate. Do not accept new combat/card rules without whole-game evaluation.

## Next design review — complete match first

The owner explicitly said the isolated P-05 energy question does not yet show how the entire match works. **Defer approval of P-05** and review the complete hypothetical match [COMPLETE_MATCH.md](COMPLETE_MATCH.md), including the central Shark crossing, dice/card effects, fall recovery, turn duration and match end. No code modified, game tests executed, merge or deployment.
