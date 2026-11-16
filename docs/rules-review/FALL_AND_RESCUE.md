# P-13 — Strategic Falling and Rescue Cards

**Status:** Owner's **design direction** captured, with an assistant's **proposed** rule package. Not an accepted complete rule or permission to implement.
**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | [INDEX.md](INDEX.md) | [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12)
**Source verified:** `main` `df81076781a7a70845dbe079f7a8ca21a79d35e6` on 2026-11-16, `src/game/Cards.js` and `src/game/SurfKingGame.js` (deck, card-use, energy and fall functions). **No gameplay tests or playtest run.**

## P-14 — Restore the game's original identity: frequent falls, minimal downtime

**2026-11-16 owner clarification and confirmation:** The original Surf King was intentionally designed for surfers to **fall often**, but the old fall/recovery system caused stalled matches. The owner likes the new strategic direction and subsequently explicitly confirmed: **"Esse é o direcionamento."** The approved gameplay north star is **frequent, dramatic falls, immediate tactical consequences, and no long recovery downtime** in a fast, simple, strategic race. See **SK-DEC-017 (Accepted)** in draft `docs/DECISIONS.md`. This does **not** approve specific fall placement, timing, combat damage, rescue-card reactions or numerical values.

**North-star loop for a later playtest:**
`move toward beach → choose risk (Shark shortcut / card / adjacent Drop In) → possible fall → quick rejoin with a position cost (or spend limited rescue to preserve progress) → move and contest again → first to beach wins`.

**Important correction to earlier P-09 assumptions:** Starting at 2 energy, raising max to 5, reducing each attack/obstacle to **1 damage** and removing movement energy cost may collectively make falls **too rare** (especially at 4–5 energy). These mechanics were developed to cure stalling, but **frequency of falling and the penalty for falling are different tuning knobs**. Do not prematurely approve all risk-reducing changes just because faster recovery is attractive.

**Preferred integrated hypothesis (not approved):**
1. **Never eliminate a surfer for multiple inactive turns.** At 0 energy, the surfer falls; cards may protect the hard-won position (P-13), while no card still guarantees a return the next own turn with a position setback (P-12). No Rest.
2. **Keep risky shortcuts and attacks dangerous.** The initial fast path (7 moves) crosses a Shark; an 8-move bypass is safer. A 2-energy surfer taking −1 at Shark is vulnerable to the next hit. At 5 energy, a lone −1 hazard may be negligible; test damage and card healing together, rather than flattening all hazards.
3. **Cards create calculated aggression, not mandatory survival.** Lifeguard Float and Swimming Fin preserve progress when genuinely falling; without a card, the surfer can always get back into the race.
4. **Limit the downside of a single fall to one understandable core consequence**, normally loss of some forward position. Do not automatically stack forced backward exchange, entire-turn skip and another displacement. Combined combat/terrain damage can remain a tactical hazard if the resulting fall is recoverable and readable.
5. **Do not add a voluntary "fall" action.** Taking a real risk and using scarce insurance is strategic; intentionally resetting at 0 to farm energy would be an exploit.

**Practical playtest acceptance questions (NOT measured yet):** Can a player fall multiple times and remain engaged? Does a no-card fall still allow a normal action on their next turn? Does a rescue card preserve meaningful progress? Can a 5-energy leader still be disrupted without needing five separate attacks? Do backward loops, repeated Shark entries, full hands, and seven-player crowding terminate fairly? Quantify **falls per player, inactive turns, board progress, rescue effectiveness and total rounds** in a future rules prototype. Do not prescribe a numerical fall rate without actual playtest evidence.

**Immediate next step:** Freeze **this design target** and compare one full 3-player race using the same hazards/cards under **quick recovery** versus **old skipped-turn recovery**; identify whether the sole blocker was time lost or accumulated movement/energy costs. Then assess 2-, 4- and 7-player cases. **No code is authorized**, so this remains a written design exercise.

## P-16 — Shark fall and return: owner-requested definitive design rule

**Status: ACCEPTED AS A DESIGN RULE, NOT IMPLEMENTED — SK-DEC-018 (2026-11-16).** The owner explicitly asked to **settle now** whether a surfer knocked off by a Shark stays on its hex or moves backward. The following is the closed rule for **a fall caused by Shark terrain**; extending it verbatim to falls from attack, Big Wave and other terrain still requires its own review.

**Simple rule the player sees:** **"Shark knocked you off? Spend a rescue to stay, or return one safe hex toward the sea next turn with 2 energy. You never lose the whole next turn."**

1. **A Shark event brings energy to zero:** It triggers exactly once upon **entering** the Shark hex. The surfer is shown falling there. Immediately offer **one optional rescue card** from their hand.
2. **Lifeguard Float:** Discard it and **stay on that same Shark hex at 2 energy**; the Shark does not damage again until the surfer subsequently **leaves and re-enters**. No additional action, draw, or movement.
3. **Swimming Fin:** Identical, but **stay at 1 energy**. The distinct amount matters because under the ongoing two-dice experiment 1 energy rolls only one die.
4. **No rescue or card declined:** The player is now **fallen and not occupying** the Shark hex (a temporary fall animation/marker may show the original landing). They cannot be attacked or block normal occupancy there. The current action ends if they fell during their own maneuver.
5. **Start of their next personal turn:** Automatically re-enter at **2 energy** on the **vacant, obstacle-free hex one legal edge-adjacent step toward the sea** from their fall hex. If there are several, prefer the same lane/column, then the lowest cell ID. The example `28 (Shark) → 21 (safe)` is valid when cell 21 is empty and obstacle-free.
6. **Blocked direct backward cell:** Select the **closest empty obstacle-free hex** in the oceanward half of the board that is **not closer to the beach** than the fall location; prioritize minimal number of legal adjacent steps from the checkpoint, then the closest lane/column, then lowest cell ID. If a fall occurs at the starting sea boundary with no oceanward tile, choose a free safe starting-row hex instead. Do not re-enter onto a Shark, Storm, Cyclone, Island or Stone tile (avoid repeated damage, free bonus, or obstructed return), nor on another surfer.
7. **The returning player immediately takes their usual turn**, including one normal legal maneuver. The automatic sea-ward re-entry is the **position penalty**, not an extra earned movement. **No mandatory Rest or additional skipped turn.** No card is required to continue participating.

**Important safeguards:** Recovery is triggered by a genuine fall, not a voluntary "fall for healing" action. No Shark effect may recur simply from rescuing at the same tile; it triggers on new entry only. A rescue does not undo a previously completed attacker/defender displacement or grant a second normal move. The mechanics for an unrescuable collision with other hazards or forced Drop In relocation have not been accepted merely by fixing Shark falls.

**Rationale:** A deliberate Shark shortcut is still dangerous and a rescue card has a clear use: it prevents a **loss of progress**. A player who has no rescue is not penalized by entire inactive rounds. This is the least complex complete answer to the owner's concrete Shark example. **Do not mistake design approval for code implementation or proven balance.**

## P-17 — Challenge to the accepted one-hex / 2-energy Shark comeback (PROPOSED REVISION, not approved)

**Owner objection, 2026-11-16:** "mas se volta pra onde tava qual o sentido?" The owner questions the meaningful penalty when a Shark fall at cell 28 sends a surfer to 21 and on the very next turn they can maneuver straight back into 28. This is a substantive gameplay concern, **not explicit approval** to change SK-DEC-018. Keep SK-DEC-018 as the last accepted design rule until an owner decision.

**What SK-DEC-018 currently costs:** A fall on the 21→28 entry is followed by oceanward return to 21, then a normal 21→28 move next personal turn. This costs one net forward maneuver versus a successfully rescued surfer who stays at 28, and **triggers the Shark again** on re-entry. It does not leave the surfer permanently behind. With the accepted return at **2 energy**, a player who repeatedly enters the Shark at 1 energy may gain energy from the fall/recovery loop, while failing to advance, so there is a **potential energy-farming incentive** to validate.

**Assistant recommendation to investigate, P-17 (NOT accepted):** Make the loss of momentum and energy explicit without adding a skipped *future* turn:
1. A fall on entering a Shark **cancels that maneuver**, **immediately knocks the surfer back to the preceding safe vacant cell** (e.g. **28 → 21** if they came from 21), and **ends their current movement/action**. No vanishing marker or delayed placement is needed. If that tile is no longer valid, use the nearest safe vacant oceanward tile.
2. The surfer re-enters active play on their **next personal turn with only 1 energy**, but takes their full normal turn/maneuver. This is **not Rest**, and no new cards or movements are granted by falling.
3. If a Float/Fin is available when the Shark would cause a fall, the surfer may spend it **instead of being knocked back**, preserving the reached Shark tile at 2/1 energy with no retrigger or bonus movement, matching the rescue choice already accepted in SK-DEC-018.
4. When back at 21, the player can **retry the Shark** (and trigger its hazard on re-entry) or **take a safe detour**. Both are meaningful choices. 1-energy re-entry prevents intentionally falling from 1 energy just to refill to 2, and maintains the danger of the shortcut.

**Why not retreat two hexes or skip the whole next turn?** A seven-maneuver shortest path gives a one-move setback a real opportunity cost; a two-move retreat **plus** a weak return could be too punishing with the owner's desired frequent falls. Likewise, a skipped next turn recreates the original stalled recovery. Test P-17 against SK-DEC-018 and adjust only with an explicit owner decision.

**Open edge cases:** A forced Shark entry not resulting from the surfer's own maneuver may have no well-defined previous tile; selecting a safe vacant oceanward tile must then be deterministic. Ocean boundary fallback should not reward intentional falling. A rescue cannot retroactively undo a completed Drop In swap. A 1-energy return may feel too vulnerable without another safe path, especially in seven-player congestion.

**Shark intent clarification — assistant analysis, not a new rule (2026-11-16):** The owner asks why anyone would **deliberately land on a Shark**. Distinguish **deliberately risking a Shark shortcut** from **deliberately falling for its own sake**. The provisional board has a 7-edge-maneuver route `0→7→14→21→28→35→42→49` crossing Shark 28 versus an 8-maneuver safe detour `0→7→14→21→25→32→35→42→49`. With **proposed** Shark −1 damage: at 2 energy, entering Shark survives at 1 and saves one maneuver; at 1 energy **with** Float or Fin, the player may spend scarce insurance to keep the shortcut; at 1 energy **without** rescue, entry causes a deterministic fall and the attempt is strategically inferior to a safe route. **Falling itself is not a reward or an intended healing tactic.** The proposed P-17 1-energy bounce avoids a free 2-energy refill loop, but is not accepted. A single saved movement may be **too little payoff for consuming rare rescue**, especially early in the race, so do not assume the shortcut is compelling without comparative playtesting. If necessary, strengthen the *route reward* or change placement rather than grant resources for falling.

### P-17 refinement — owner proposes falling *on* the Shark, rescue there, or retreat (NOT yet approved)

**Owner (2026-11-16):** A surfer who enters the Shark should visibly **fall on that Shark cell**; **if holding a recovery card, use it and continue from the Shark**; **without a card, go back**. The owner asks the specific blocking question: **what if the previous cell already has a surfer or an obstacle?** This is a useful refinement to P-17, **not** unambiguous approval of the 1-energy penalty.

**Proposed concise resolution, not ratified:**

1. The Shark attack resolves once on **entry**; if the surfer reaches zero, **show the fall at the Shark cell**, then offer the immediate optional rescue in hand.
2. **Float / Fin used:** discard one card, **stand back up on the Shark cell** with 2 / 1 energy; do not re-trigger this already resolved Shark entry. Do not grant an extra movement or action. This preserves the accepted card use intent of SK-DEC-018.
3. **No rescue / declined:** the attempted move **fails**, the surfboard is knocked back to the **previous safe vacant hex** if still open (example `21 → 28 Shark → 21`); the player's current movement is over. Next own turn the surfer acts and maneuvers normally, with **1 energy** as a proposed anti-farming penalty (SK-DEC-018 currently says **2**, so this part requires explicit owner approval).
4. **The previous hex is occupied, has Stone, or a hazardous obstacle:** choose the **nearest unoccupied obstacle-free water hex** **on the ocean side** of the Shark checkpoint. Prefer (i) a **true edge-adjacent** seaward hex, (ii) shortest hex-distance from Shark if direct neighbors blocked, (iii) lateral distance to the prior lane/column, and (iv) lowest cell ID as a deterministic tie-break. A return **never occupies another surfer's tile**, never teleports toward the beach, and never triggers another obstacle upon fallback.
5. **An exceptional fully obstructed ocean side** remains to be specified before code; do not silently invent an occupied-overlap or indefinite lost-turn fallback. This is a boundary case for crowded 7-surfer playtests.

**Clarify display vs occupancy:** The fall animation is visually **on the Shark**, but an unrecovered surfer's active board occupancy should move to the safe retreat cell. A surfer rescued immediately remains the occupying surfer at the Shark. This avoids permanently blocking Shark tile and eliminates the original description that the player must remain invisible until the next turn.

**Why this is preferable:** A player's outcome is predictable: **“I tried the Shark; either spend a rescue and keep my progress, or get knocked backward with low energy and try something else next turn.”** The strategic decision is taking a shortcut, *not* falling to heal. This still needs owner sign-off to replace accepted SK-DEC-018's current delayed 2-energy respawn.

**Decision boundary:** P-17 is an **assistant proposal prompted by owner feedback**, not a replacement approved rule. The existing SK-DEC-018 remains current until the owner confirms a revision.

## Owner's expressed gameplay direction (not yet specific rule approval)

The owner wants a **simple, highly strategic fall mechanic** where a player may **intentionally accept the risk of falling** because they hold a rescue card: an aggressive Drop In or a hazardous shortcut can be worth taking when the player has a planned comeback. Do not mistake this for approval of a button to fall voluntarily, a free energy refill, or a particular respawn rule.

## Relevant existing cards and behavior (code facts, not accepted design)

- `CardLifeGuardFloat` / **Lifeguard float** and `CardSwimmingFin` / **Swimming fin** both exist as action cards.
- The deck has **4 copies of each**, i.e. **8 recovery cards in 64 total cards** (12.5%). With a uniformly shuffled 64-card deck and 2 starting cards, the probability that a starting hand contains at least one of these is `1 - (56/64)(55/63) = 952/4032 ≈ 23.61%`. Actual draw rates over a match depend on future draw mechanics and other cards.
- The engine currently permits these cards only when the acting surfer already has 0 energy and is counted as fallen; Lifeguard float grants **+2 energy**, Swimming fin **+1**, and sets `fellOffTheBoard = -1`.
- Current `pass()` also restores +1 energy through a separate fall-processing branch. This is existing behavior, **not the future rule**.
- In a redesigned one-card-or-Drop-In action economy, a rescue card usable only during one's **normal card phase** could be too late after damage from an opponent's turn or after a movement hazard. This is a gameplay-level reason to consider a **reaction** timing exception.

## Assistant recommendation — P-13, NOT approved

Use a simple distinction: **"A fall costs position unless you spend a rescue card."** Rescue should be an **optional immediate reaction** when damage would bring the surfer to 0, not an ordinary action that competes with attacking on a different turn.

| Outcome | Proposed effect | Strategic meaning |
| --- | --- | --- |
| At zero, use **Lifeguard float** from hand | Discard one card and immediately return to **2 energy**, preserving the cell reached by the resolved event | Strong insurance; protect a risky shortcut/advanced position |
| At zero, use **Swimming fin** from hand | Discard one card and immediately return to **1 energy**, preserving the cell reached by the resolved event | Weaker insurance; preserves position but next fight uses only 1 die |
| At zero, **no card or decline to use it** | Surfer truly falls, vacates active hex, retains fall checkpoint. On next personal turn return with **2 energy** at a **nearby empty safe cell toward the sea** and take a normal turn (P-12 candidate) | A fall costs positional progress and potentially one effective advancing turn, not an entire turn of being unable to play |

**No free movement/draw from rescue:** A reaction only prevents the automatic positional penalty and restores the printed candidate energy. It does **not** grant an extra maneuver, another attack, an extra card, or a free movement toward the beach. If a normal movement was already used when the surfer fell, the card does not reset it. Rescue also does not undo a previously completed positional displacement or grant immunity from a later separate hazard event.

**No voluntary fall command:** Deliberate *risk-taking* is strategic; self-knockout merely to restore energy would be an exploit. A rescue triggers **only** when a real combat or terrain effect would make energy zero. Ordinary Energy +1/+2/+3, Coconut and hazard rewards remain different tools; do not turn intentional falling into a cheap heal loop.

**Resolution timing needs an explicit decision before implementation:** The P-10/P-11 optional attacker-defender swap resolves strict dice damage and any entry hazards in a specified order. The rescue reaction must be offered **before permanent vacancy**, but must not undo the swap, duplicate hazard damage, or create a second attack. A falling defender who uses a card during combat may stay active and still be displaced under the normal successful-attack rule. This subtlety needs a compact consistent rule sentence after reviewing examples.

## Why this better meets the player's goal than the earlier P-12 alone

P-12 returns *everyone* next personal turn with 2 energy and a normal maneuver, after an oceanward positional setback. This alone can make **rescue cards underwhelming**, because a card held for many turns may save only one hex of progress.

The **P-13 optional immediate reaction** makes the held card's value more visible: **preserving a hard-won advanced cell and avoiding positional retreat**, even if the fall happens on the opponent's turn. The Lifeguard float provides stronger immediate protection (2 energy, 2 combat dice under trial); Swimming fin keeps the position but at 1 energy (1 die). Having a rescue card makes a risky tactical route attractive **without eliminating risk**: the player uses a scarce card, may still lose the next confrontation, and cannot get a free step or unlimited health.

**Concerns to test:**
1. The initial hand only has ~23.6% chance of holding either rescue card under the current random deck; falling should not become unwinnable just because the player never draws one. The no-card return must be guaranteed.
2. A surfer at 1 energy **choosing** to enter a Shark and using Lifeguard float on a fall would then have 2 energy, preserved position and one fewer card. This resembles a strategically planned shield, not free energy farming, but repeated rescue cards or Island bonuses can alter balance.
3. Rescue from a fall **during a forced Shark swap** may preserve a dangerous cell. Applying a Shark again on rescue at the same location would cause immediate repeat fall; do **not** create this recursive loop. Hazard activation is tied to entry, not to staying/restoring energy.
4. A no-card fallback at the seaward boundary (no safe seaward cell) needs a deterministic no-teleport solution; otherwise a deliberate fall can become an advantage.
5. If rescue can be played as a reaction on an opponent's turn, the attack result must clearly show the card consumption and resumed energy, especially for local multiplayer.
6. Hand/card supply and the existing `Coconut`, `Energy x3`, `Amulet`, `Hang loose`, fall-recovery cards and P-10 positional exchanges need joint playtesting.

## Next one-piece design check

**Review a single risky Shark shortcut with and without each rescue card**, and compare position after the next personal turn. Then test one forced position exchange causing a fall, including the case where the player can choose not to spend a rescue card. If the rescue card saves insufficient progress, consider **more distance lost on ordinary falls** before adding new movement actions or extra complexity.

**Status:** **SK-DEC-017** confirms the fall-heavy/no-downtime vision, and **SK-DEC-018** now defines **the Shark-specific** optional rescue/no-rescue return. General P-12/P-13 behavior after attacks, cards and other terrain and all balance values remain **unapproved**. No game code changed, Jest tests run, match playtest, merge or deployment.
