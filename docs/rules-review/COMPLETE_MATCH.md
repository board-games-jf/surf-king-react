# Surf King — End-to-End Prototype Match (P-06)

**Status:** **Earlier single-package assistant playtest hypothesis (P-06), NOT owner-approved.** The owner later requested concrete alternatives, so the **current comparative design proposal is [OPTIONS.md](OPTIONS.md) (P-07)**. This P-06 remains as historical analysis only.
**Tracking:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) and [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12).
**Source check:** `main` `e4e083f9035e314eb2107bd1cca448292cc4629e` (2026-11-16); `src/game/SurfKingGame.js`, `src/game/Cards.js`, `src/map/layout/board-layout.json`, and pass tests. **No executable or automated playtest was run.**

## 1. What is actually owner-approved

- A surfer can normally move to any of the **up to six hexagons sharing a full edge** (including backward).
- A normal drop-in attack can target only an **edge-adjacent opponent**.
- Every surfer **begins at 2 energy**.
- **0 energy means falling off the surfboard**, not resting.
- **Remove Rest** as a game mechanic.
- Design priorities: **fast, practical, fun, portable, replayable, strategic, not stalled**.

The items below are explicitly a **single candidate package to test together**, not additional approvals.

## 2. Candidate complete game loop — P-06

| Stage | Playtest rule | Why / linked effects |
| --- | --- | --- |
| Set up | 2–7 players on starting cells, **2 energy**, **2 hand cards**; maximum energy tentatively remains 4 | Existing initial hands/deck and max energy; only starting 2 is approved |
| Each turn | Optionally play **up to 1 card**, optionally attempt **up to 1 adjacent drop-in**, then perform **one mandatory legal edge-adjacent maneuver** | Gives a tactical choice plus predictable movement and short turns; attack/card order is provisional |
| Movement economy | Normal movement **costs 0 and grants 0 energy** | Avoids free falls during basic travel; cards/hazards/attacks have energy relevance |
| Card supply | **Draw 1 card following a successful normal maneuver**, hand capped at 5 | Reward progressing and keep choices available; exact draw conditions to be tested |
| Interaction | Drop-in uses energy to determine dice/strength and can reduce energy; card effects and hazards change positions or energy | WAR-like strength and position decisions; dice tie and other effects not settled |
| Shark choke point | Initial Shark row remains, but provisional damage is **-1** instead of current -2 | A healthy 2-energy surfer can cross without immediately falling; higher energy helps |
| Fall and recovery | **0 energy causes a fall**. Candidate: on next personal turn return to the board with **2 energy**, skip that turn's maneuver | Clear, finite penalty, not a voluntary Rest. Special rescue cards may accelerate recovery; needs review |
| Win | First surfer to reach any of the final 4 beach cells wins immediately | Matches current endIf goal |
| Endgame safety | If no beach winner by the **end of round 12**, furthest surfer toward the beach wins (tie-break to be designed) | Guarantees finite play even when players loop backward/forward; 12 is a test number, not verified as right |

**Critical exceptional turn rule still unresolved:** If a surfer has no legal adjacent destination because of occupants, stones, or other effects, the engine must end their turn safely without introducing Rest. This automatic forced skip cannot count as a voluntary choice; test for repeated forced immobility. The round cap ends the match but does not make this experience fun.

## 3. Illustrative three-player tabletop scenario (not an actual run)

| Rounds | What the players might experience | Why the game continues |
| --- | --- | --- |
| 1–2 | Everyone begins with 2 energy and 2 cards, moves and draws. One player saves an energy card, another uses a placement card, a third takes the direct route. | No mandatory resource expenditure to move; at least one spatial decision per active turn |
| 3–4 | Surfers converge on the middle of the board. A player with an energy card has better dice; another enters the central Shark row and loses 1 (proposal). | There is a real race-versus-strength decision; the 2-energy player survives one unmodified Shark crossing |
| 5–6 | One surfer attacks another at an adjacent cell, or a damage card causes a fall at 0. A fallen surfer loses a maneuver and returns with 2 on their next turn (proposal). | The penalty matters but does not eliminate someone from the game |
| 7–9 | A surfer who kept moving can reach a beach cell and end the match. Opponents can interfere with cards, obstacles and drop-in; actual timing depends on legal moves. | The geometric board supports a 7-maneuver path, not a guaranteed 7-turn result |
| Up to 12 | If deliberate oscillation, repeated falls or blockers prevent beach victory, the game ends by provisional progress ranking. | No infinite stalemate, though the 12-round limit needs scaling tests for 2–7 players |

The board's seven-maneuver geometric example is `0 → 7 → 14 → 21 → 28 → 35 → 42 → 49`; internal cell 28 is a built-in Shark. Other start cells, occupancy and obstacles produce different routes. The example is hypothetical, **not a simulated or verified match**.

## 4. Adversarial design checks required

1. **Everyone declines tactics:** mandatory moves plus a finite round cap avoid the current all-pass infinite game. A more attractive anti-loop incentive may still be necessary.
2. **Bad card draws:** basic movement must remain viable without drawing Energy. With starting energy 2 and Sharks at provisional -1, the center can be crossed by an otherwise unharmed surfer.
3. **Damage spikes:** current Big Wave -2 could immediately knock out a freshly started 2-energy surfer; decide whether to retune. Sunburn -1, Sharks, Storm and direct dice losses may compound in a single round.
4. **Energy snowball:** combat uses energy as both number of dice and survival points. A 4-energy player has an advantage over a 2-energy player; assess whether cards, defensive ties, attack risk and positioning give fair comebacks.
5. **Card relevance:** free movement makes current Bottled Water's ability redundant; the card should be removed or assigned a new effect only with approval. Energy-related cards may become too frequent or rare once movement no longer drains energy.
6. **Crowding, Stones, fallen occupancy:** do not force illegal movement or enable endless forced skips. Test with 2, 4 and 7 players, plus every entrance to/exit from the four Shark cells.
7. **Long matches / player count:** 12 rounds could require up to 84 player turns with 7 players; measure whether this still feels fast. Set a target duration only after playtesting.
8. **Tie-break and comeback:** furthest-toward-shore ranking may reward camping, especially with six-direction movement; define a simple tie-break and test alternative pressure rules if necessary.

## 5. Recommendation for the next discussion

**Do not seek approval of free movement or card-only energy in isolation.** First review P-06 as a **whole hypothetical match**, then examine where the first concrete breakdown occurs. The clearest stress test is the **mid-board Shark crossing at 2 energy and nearby drop-in / damage cards**. Choose a simple treatment of damage and re-entry only after seeing the consequences for the entire race.

**No gameplay implementation, tests, merge, or deployment.** New code would require a separate scoped implementation issue and owner authorization.
