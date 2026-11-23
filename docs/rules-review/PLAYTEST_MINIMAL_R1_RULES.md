# Surf King — Minimal R1 quick-start (ONE-PAGE TRIAL, NOT APPROVED)

**For manual tabletop play, 2–7 surfers.** Experimental successor to [R0](PLAYTEST_R0_RULES.md); uses the unchanged provisional [B60 card reference](PLAYTEST_R0_CARDS.md). This is **not** what the production app currently implements.

## Goal and setup

Race across the **53 connected hexes** to the beach (**49–52**). Four **Sharks** at **28–31** stay in place. Randomly deal each player a **different starting hex from 0–6**, then randomly choose who acts first. Every surfer starts with **2 energy**, **2 random cards**, and their board piece. Maximum energy **5**, maximum **5 cards in hand**. Shuffle used cards back into the deck when necessary.

**No special starting positions, weighted lotteries, bonus cards or bonus energy.**

## A turn, in three steps

1. **Get up:** If fallen, stand in the **same cell with 1 energy**, for free, at the beginning of your next turn. Instead, one *Swimming Fin* (2 energy) or *Lifeguard Float* (3 energy) may be spent to recover, using your card/action slot. You **do not miss a turn**.
2. **One optional action:** Play **one card**, attempt **one adjacent Drop In**, or play nothing. Read the effect directly on the card; the [B60 reference](PLAYTEST_R0_CARDS.md) resolves corner cases. **The first round is a friendly start: no attacks or displacement of opponents; defensive/terrain cards are allowed.** For a Drop In, both players roll **one d6 if at energy 1, otherwise two d6**; only their **highest die** counts. Higher score wins; the loser loses **1 energy**; a tie does nothing. **No Drop In position exchange**.
3. **Move and draw:** If upright and a free, legal edge-neighbor exists, move **exactly one shared-edge hex**; the move costs **0 energy**. You may not pass or share a cell. An obstacle/explicit movement card can modify that maneuver as written. Resolve terrain on entry. If you finish a successful maneuver **upright** and have fewer than five cards, **draw one**. If every neighboring cell is blocked, stay; there is no draw.

## Falls, Sharks and combat

**Entering** a Shark cell costs **2 energy**; simply staying there does not hurt again. **At 0 energy you fall but stay on the hex.** Immediately lose **one random card from your hand** (if any). If another player knocked you down or deliberately pushed you into danger, **they receive that card**; otherwise discard it. No second card penalty for the same fall. If the recipient would exceed five cards, they choose one to discard. Other terrain and card specifics are printed in the B60 reference.

## Round order and victory

Finish **every round**, then **move the first-player marker to the next surfer** (the normal cyclic order is preserved). Example: **A–B–C–D → B–C–D–A → C–D–A–B**. No positional compensation.

When a surfer first enters a beach cell, **everyone else finishes that same round** with their normal turns; surfers already on the beach are safe and stop acting. Among surfers who reached the beach **during that round**, the one with **the most energy remaining wins**. Equal energy? **Draw lots** between those tied finishers.

---

**Test notes, not additional gameplay rules:** The owner records human enjoyment, clarity, falls, interaction and **actual minutes**; the simulation only establishes modeled rounds and agent decisions. For 2P, cyclic rotation causes the player who finished one round to immediately begin the next: decide in manual play if that feels natural. The 17 card types still require a separate simplification audit. Any disputed card interpretation should be logged, not silently made permanent. Model experiments [Iteration Z](R0_MINIMAL_RULES_STUDY.md) do not authorize implementation, PR merge or deployment.
