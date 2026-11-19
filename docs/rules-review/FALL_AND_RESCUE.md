# P-13 — Strategic Falling and Rescue Cards

**Current accepted general fall rule: SK-DEC-023 (design only, NOT implemented).** It applies the Shark-specific SK-DEC-020 recovery to **all** causes of zero-energy falls; SK-DEC-019 Shark −2 and SK-DEC-021 Shark occupancy/Drop In restrictions remain in force. Earlier P-12/P-13/P-16/P-17/P-18 alternatives are historical. Forced displacement, special-card effects, tactical-action costs and combat damage amounts remain under review. This is not an accepted complete rulebook or implementation authorization.
**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | [INDEX.md](INDEX.md) | [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12)
**Source verified:** `main` `aac50d222a3437200bcd4886eb90f29e537dfc65` on 2026-11-16, `src/game/Cards.js` and `src/game/SurfKingGame.js` (deck, card-use, energy and fall functions). **No gameplay tests or playtest run.**

## SK-DEC-023 — Universal fall recovery (ACCEPTED; design only)

**Owner approval (2026-11-19):** Following the controlled Big Wave card study, the assistant proposed that **any** zero-energy fall—not only a Shark fall—should follow the same quick no-retreat recovery rule. The owner explicitly replied **"Vamos fechar"**, approving that unified baseline.

**Accepted sequence for Shark, other terrain, Big Wave/Sunburn, Drop In/combat or other zero-energy damage:**

1. **A real damage event reduces energy to 0:** The surfer is now **fallen**, visibly remaining on the **cell where the triggering effect finishes**. Falling **itself** does not trigger a retreat, teleport, exchange or free movement. If a separate card effect also forcibly displaces a surfer, its timing and final-cell resolution require a separate rule.
2. **Occupancy:** The fallen surfer continues to **occupy** that cell. Normal moves cannot place two surfers in one hex. The specifically accepted Shark-fall rule SK-DEC-021 also prohibits **normal Drop In targeting a fallen Shark occupant**; the precise generalization of this attack-target restriction to non-Shark falls is **not settled** by SK-DEC-023.
3. **Recovery decision at the start of the surfer's NEXT personal turn:** **No card → stand on the same hex at 1 total energy**; discard **Swimming Fin → 2 total energy**; discard **Lifeguard Float → 3 total energy**. Cards are optional; this is **not** a reaction on an opponent's turn. No double addition of base energy and card totals.
4. **Usual movement that turn:** After standing, the surfer may and **must** make their normal edge-adjacent maneuver **if a legal destination exists** (SK-DEC-022), including sideways or backward. The act of recovery grants **no bonus movement** and does not enforce a completely inactive recovery turn. If no legal maneuver exists, apply only the accepted blocked-only exception; exact safe auto-transition and rewards are still pending.
5. **No duplicate terrain entry:** Standing up **without changing hex** is **not entering** that hex again. The original Shark −2 remains a single event on entry under SK-DEC-019. A later new entry triggers the effect normally.

**Concrete card example:** A surfer reaches cell 35 after recovering from a Shark. An opponent's **Big Wave** (legacy −2) reduces their energy from 1 to 0. They **fall on cell 35** and, under newly accepted SK-DEC-023, stand **on 35** at the **start of their next own turn** with 1/2/3 energy, then perform a legal normal maneuver when possible. Earlier [CARD_AND_PLAYER_COUNT_STUDY.md](CARD_AND_PLAYER_COUNT_STUDY.md) intentionally stopped this outcome because at the **time of that experiment** non-Shark recovery was not defined. The new decision **resolves the missing recovery rule**, but those prior runs were **not rerun** or converted into observed wins.

**Not silently approved:** Numerical damage for combat/other terrain, how special cards or swaps forcibly move someone in the same effect as falling, other card targeting of a fallen surfer, whether a recovery card uses the ordinary tactical-action slot, whether a new attack is possible immediately after recovering, forced-all-neighbor-blocked transitions, and the movement energy cost (0 remains a trial only). No engine tests or complete card/deck match were executed by this decision.

---

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

## P-19 — Owner-approved no-retreat Shark recovery (SK-DEC-020 ACCEPTED; design only)

**Explicit owner approval on 2026-11-16:** The owner requested removing all backward movement from a Shark fall and returning at 1 energy on the same cell, then explicitly confirmed **"Sim"** to the complete suggested recovery table: **no card 1 / Swimming Fin 2 / Lifeguard Float 3**. This **supersedes old SK-DEC-018** (immediate rescue and sea-ward 2-energy respawn), which remains in `docs/DECISIONS.md` as **Superseded**. Shark **−2 energy on entry** stays Accepted in **SK-DEC-019**.

**Accepted Shark-fall flow:**

1. On entering a Shark tile, take **2 energy damage** once. If energy falls to 0, **fall there and remain on that Shark tile**: no backward movement, no teleport to another hex.
2. **Wait until the start of that surfer's next personal turn** for the recovery decision, rather than interrupting another player as an immediate reaction.
3. At that turn start, automatically stand up on the **same Shark tile** with **1 energy**, or optionally discard **Swimming Fin** for **2 energy total** or **Lifeguard Float** for **3 energy total**. These are recovery totals, **not** +2 or +3 on top of another bonus. Each card is +1 / +2 on top of the normal 1-energy recovery baseline.
4. **Whether a recovery card consumes the normal tactical card/action choice is still open**; recovery itself does not grant a bonus movement, second attack or extra card draw. **Regardless of card choice**, the surfer may perform their **normal single legal maneuver** on that return turn.
5. **Standing up is not a new entry** into the Shark tile: never re-trigger the same −2 damage simply because the surfer recovered there. If they later leave and enter a Shark tile again, that is a new entry and the −2 applies again.

**Why it is strategic:** A Shark shortcut can save a movement relative to a longer detour, but at **2 energy** a Shark's **−2 causes a fall**; on recovery without a card the surfer is vulnerable at **1 energy**, and scarce cards can improve survival to 2 or 3. **There is no positional penalty for an unsaved Shark fall**. The intended trade-off is vulnerability; a later tabletop test must verify this is sufficient danger and card value.

**Scope update (2026-11-19):** This section records the original Shark-specific acceptance SK-DEC-020. **SK-DEC-023 now extends its exact 1/2/3 next-turn recovery to all zero-energy falls**. SK-DEC-021 separately settles normal Drop In against fallen **Shark** occupants. Special displacement, other targeting rules and full blockage remain open; see the canonical SK-DEC-023 section above.

## SK-DEC-021 — A fallen surfer continues to occupy the Shark tile (ACCEPTED; design only)

**Owner approval (2026-11-17):** The owner answered "**ta otimo**" to the proposed interaction: **a fallen surfer continues to occupy their Shark hex; another surfer cannot enter that occupied cell or Drop In against the fallen surfer; instead the other surfer chooses a different legal maneuver or an otherwise permitted action**.

**Canonical Shark-cell occupancy rule:**

1. **One surfer per hex.** A surfer at zero energy remains visible and occupying their Shark cell. They **block normal maneuver entry** into that cell even while fallen.
2. **No normal Drop In against a fallen surfer.** They cannot defend in combat at zero energy; normal Drop In may be attempted against an adjacent **standing** surfer under the separate approved adjacency restriction.
3. **Other players act normally elsewhere:** choose a different **legal** neighboring cell, or another **independently permitted** action; do not forcibly relocate or overlap the fallen surfer merely to unblock the route.
4. **At the start of the fallen surfer's next personal turn**, apply **SK-DEC-020**: stand on the same Shark cell at **1 energy without a card**, **2 with Swimming Fin**, or **3 with Lifeguard Float**, then take the normal legal maneuver. **Only when that surfer actually leaves** is the Shark hex released. The same Shark does not retrigger on standing up.
5. **Unresolved interactions:** The precise fallback if *all* legal adjacent cells are blocked; whether a forced swap/Change/Tsunami/other card may displace or target a fallen surfer; and how many active surfers can cluster around a Shark in a 7-player match. **SK-DEC-021 does not authorize** these special card/forced-movement cases.

**Why it fits the game:** Falling creates a temporary tactical obstruction while allowing the fallen player to rejoin play on their next turn without a lost move or positional retreat. Unlike the historical engine's fallen-surfer swap on normal maneuver, the intended rule prohibits that swap; this needs a future scoped implementation with regression tests, not just a visual change.

## Historical proposals superseded for Shark falls (read only)

The sections below record prior alternatives that **do not control Shark recovery** after SK-DEC-020; do not use their retreat, immediate rescue, 2-energy free respawn or previous Float/Fin totals as the current rule.

## P-18 — Next-personal-turn rescue timing, owner clarification (PROPOSED AMENDMENT)

**Owner follow-up, 2026-11-16:** After explicitly confirming that Shark damage should **remain −2 energy** (accepted in **SK-DEC-019**), the owner asked whether a recovery card would be played **only on the surfer's next own turn**, rather than immediately upon falling. The assistant recommends **yes** for simplicity. This is an **owner-raised timing preference and assistant recommendation**, NOT yet an explicitly ratified amendment of existing SK-DEC-018, which currently specifies **immediate rescue**.

**Recommended P-18 timing (NOT YET ACCEPTED):**

1. **Entry:** Shark deals **−2 energy on entry** (accepted SK-DEC-019), capped at zero as normal. On reaching 0, show the surfer as **fallen on the Shark hex**. Their current movement ends. **Do not interrupt play to demand a rescue card on that event**, even when it is another player's turn.
2. **Temporary cell reservation (candidate):** Until the start of that surfer's next personal turn, the fallen surfer remains **associated with and temporarily reserves the Shark hex**. Other surfers cannot occupy that same hex during that interval. A temporary obstacle to traffic is a short-lived consequence, not an indefinite knock-out; review especially 7-player congestion.
3. **At the START of the next own turn, BEFORE ordinary tactical action or movement:** The surfer chooses **one** of:
   - **Float:** Discard held **Lifeguard Float**, stand up **on the Shark** with **2 energy**, and continue that turn with their one normal maneuver. The card occupies the turn's normal **one card OR Drop In tactical-action slot**; no extra attack/card action.
   - **Fin:** Discard **Swimming Fin**, stand up there with **1 energy**, same no-extra-action rule.
   - **No rescue / decline:** The Shark attempt does not retain the advancement. **Move back** to the last safe free hex before the Shark if valid, otherwise the closest vacant obstacle-free oceanward hex (favor true edge adjacency, then prior lane, then lowest cell ID). Release the Shark cell reservation and carry on that normal turn. **P-17 suggests 1 energy on no-card return** to prevent voluntary energy farming, but **SK-DEC-018 currently says 2 energy**: do not treat P-17 value as approved yet.
4. **No double Shark hit:** Standing on the Shark again after a successful rescue is **not a new entry**; it does not immediately deal another −2. A subsequent move **out and back in** is a new entry and does deal −2.
5. **No invalid overlapping occupancy:** If the previous tile now has a player, Stone, Shark or any obstacle, do not overlap or displace them. Use another safe empty oceanward hex. If the entire oceanward region is blocked, the fallback requires a separate deterministic resolution before implementation; do not invent teleports or indefinitely skip turns.

**The key experiential rule:** **"Fall now; decide rescue or retreat at the start of your next own turn; then play normally."** This creates a single predictable recovery checkpoint and avoids reactions interrupting opponents. It also changes the established card-action economy compared with earlier P-13 proposals, so the card's scarcity and use need a full-match review.

**Status separation:** **Accepted**: SK-DEC-019 Shark **−2**, SK-DEC-017 high-fall/quick-rejoin direction, SK-DEC-016 starting 2 energy. **Current last accepted Shark-return rule:** SK-DEC-018 (immediate Float/Fin reaction, no-card next-own-turn return at 2 energy). **Unapproved amendment:** P-18 deferred Float/Fin to next own turn, temporarily reserves fallen Shark cell, and P-17 candidate immediate knockback / 1 energy may need reconciliation. If owner clearly confirms P-18, record a **new superseding decision**, preserving old IDs, and remove conflicting candidate descriptions. No gameplay code has changed.

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

**Current status (2026-11-19):** **SK-DEC-023 Accepted** now controls next-own-turn 1/2/3 recovery after **all** zero-energy falls, building on **SK-DEC-020** (Shark specifics) while retaining **SK-DEC-019** Shark −2 and **SK-DEC-021** Shark occupancy/Drop In exclusion. **SK-DEC-018 Superseded**. Special forced displacement/card targeting, recovery action economy, damage balancing and full match tests remain open. No source changes, Jest runs, real app playtests, merge or deployment.
