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

## Next design review — complete match first

The owner explicitly said the isolated P-05 energy question does not yet show how the entire match works. **Defer approval of P-05** and review the complete hypothetical match [COMPLETE_MATCH.md](COMPLETE_MATCH.md), including the central Shark crossing, dice/card effects, fall recovery, turn duration and match end. No code modified, game tests executed, merge or deployment.
