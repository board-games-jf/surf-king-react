# P-13 — Strategic Falling and Rescue Cards

**Status:** Owner's **design direction** captured, with an assistant's **proposed** rule package. Not an accepted complete rule or permission to implement.
**Epic:** [Issue #11](https://github.com/board-games-jf/surf-king-react/issues/11) | [INDEX.md](INDEX.md) | [Draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12)
**Source verified:** `main` `df81076781a7a70845dbe079f7a8ca21a79d35e6` on 2026-11-16, `src/game/Cards.js` and `src/game/SurfKingGame.js` (deck, card-use, energy and fall functions). **No gameplay tests or playtest run.**

## P-14 — Restore the game's original identity: frequent falls, minimal downtime

**2026-11-16 owner clarification and confirmation:** The original Surf King was intentionally designed for surfers to **fall often**, but the old fall/recovery system caused stalled matches. The owner likes the new strategic direction and subsequently explicitly confirmed: **"Esse é o direcionamento."** The approved gameplay north star is **frequent, dramatic falls, immediate tactical consequences, and no long recovery downtime** in a fast, simple, strategic race. See **SK-DEC-015 (Accepted)** in draft `docs/DECISIONS.md`. This does **not** approve specific fall placement, timing, combat damage, rescue-card reactions or numerical values.

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

**Status:** Owner **confirmed** the original high-frequency-fall, quick-recovery gameplay identity (**SK-DEC-015 Accepted**). P-12/P-13 timing, precise positions, rescue-card effects and the whole-match balance remain **assistant proposals**. No game code changed, Jest tests run, match playtest, merge or deployment.
