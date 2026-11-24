# Iteration AB — Cyclone and safe-landing Jumping (R1 tabletop trial)

**2026-11-24 · Issue #11 · draft PR #12 · DESIGN MODEL ONLY.** The owner wants the Cyclone in the game and defines Jumping as **landing in an adjacent obstacle/Shark hex, staying there, and ignoring its entry effect**, not deleting an obstacle or leaping past it. The goal is to retain a fast, teachable game rather than add more card types.

## Single candidate for physical testing

Use [the minimal R1 rules](PLAYTEST_MINIMAL_R1_RULES.md) and [the R1 ten-type / 60-card sheet](PLAYTEST_MINIMAL_R1_CARDS.md) together. The currently preferred **trial-only** inventory is:

| Type | Copies |
| --- | ---: |
| Energy x2 | 12 |
| Lifeguard Float | 9 |
| Big Wave | 3 |
| Sunburn | 7 |
| Storm | 7 |
| Cyclone | 4 |
| Island | 3 |
| Jumping | 4 |
| Amulet | 7 |
| Surf Current | 4 |
| **Total** | **60** |

The four original board Sharks stay on cells **28–31**, never enter the deck, and cannot be removed. **Stone is absent only from this candidate**. The 11-type comparison retains four Stones, three Cyclones and four Storms, at the same 60 physical cards.

### Exact simple card behavior under review

- **Jumping:** Play as the turn's one optional tactic; instead of the usual movement, land on one adjacent, vacant Shark or placed-obstacle hex. Stay on that hex, leave the hazard in place, and ignore **all** its entry effects, including beneficial Island energy. The jump consumes both the card action and the maneuver, so no second movement. Normal departure on a later turn has no hazard effect. Ordinary re-entry resolves the effect again.
- **Cyclone:** Place on an allowed unoccupied, obstacle-free, non-Shark/non-beach hex within two actual edges. On an ordinary entry, relocate to one randomly selected legal adjacent vacant hex **other than the arrival origin**, or remain if no such exit exists. Resolve the destination's terrain effects; at most **one Cyclone redirect per maneuver**. The Cyclone stays placed. Jumping into Cyclone does not activate it.
- **Storm:** Ordinary entry costs one energy. **Island:** first ordinary entrant gains two energy, to max five, then Island is discarded. **Shark:** ordinary entry costs two energy. Jumping into any of these suppresses that entry effect.

## Reproducible model study

Compared four controlled variants on the **same** 53-hex source geometry and 60-card physical-count conservation:

1. `lite10Active:remove` — Stone/no Cyclone, old obstacle-removal Jumping.
2. `lite10Active:land` — Stone/no Cyclone, safe-landing Jumping.
3. `lite11Cyclone:land` — Stone **and** Cyclone (11 types), safe-landing Jumping.
4. `lite10CycloneNoStone:land` — **Cyclone/no Stone (10 types)**, safe-landing Jumping.

**Executed:** Existing [Iteration AB reproduction runner](R1_CYCLONE_JUMP_AB.js) on exact fetched GitHub source via a V8 harness with emulated Node `require` for `assert`, `fs`, `path`, using the exact `main` layout. **1,000 seeds (210001–211000)** × 2/4/7 players × balanced/aggressive scripted policies × 4 variants = **24,000 complete modeled games**. **818,329 per-state integrity checkpoints** completed; each game's 60 physical cards, unique occupancy, energy/fall consistency, fall-card accounting, Jumping card consumption/landing categorization, first-round attack restriction, and actor×start coverage were checked. All 24,000 games reached beach by modeled round 16; **no assertion failures**. The standalone Node CLI was **not independently run in a cloned checkout**.

- Full-match model: `docs/rules-review/R0_FULL_MATCH_MODEL.js`, Git blob `ae6bbec68a12abfd758458166986ecd7e88b06da`.
- Reproduction runner: `docs/rules-review/R1_CYCLONE_JUMP_AB.js`, Git blob `a74cfdcac1ccc96b8441976741187459255c2625`.
- Actual board: `src/map/layout/board-layout.json` from `main`, Git blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`.
- Command for a dependency-enabled checkout: `SK_THEME_SEEDS=1000 SK_THEME_OFFSET=210000 SK_THEME_PLAYERS=2,4,7 node docs/rules-review/R1_CYCLONE_JUMP_AB.js` (not separately executed as a Node CLI in this session).

### Results: means per game

| Players / policy | Stone, old Jump | Stone, landing Jump | Stone + Cyclone, landing | **Cyclone, no Stone, landing** |
| --- | --- | --- | --- | --- |
| 2P balanced: rounds / falls / opponent actions | 6.374 / 0.994 / 1.242 | 6.480 / 0.849 / 1.280 | 6.471 / 0.839 / 1.278 | **6.446 / 0.867 / 1.320** |
| 4P balanced | 6.192 / 3.480 / 5.172 | 6.242 / 3.117 / 5.080 | 6.208 / 2.978 / 5.023 | **6.151 / 3.057 / 4.926** |
| 7P balanced | 6.068 / 7.643 / 11.818 | 6.112 / 6.986 / 11.331 | 6.023 / 6.584 / 11.164 | **5.950 / 6.900 / 11.101** |
| 7P aggressive | 6.191 / 11.415 / 19.880 | 6.213 / 10.479 / 19.131 | 6.172 / 10.167 / 18.967 | **6.096 / 10.402 / 18.954** |

**Direct mechanical evidence in the 7P balanced 10-type Cyclone trial (1,000 matches):** 2,674 successful Jumping landings, including **1,216 on Sharks** with entry damage bypassed, plus **1,666 ordinary Cyclone redirects**. The model checks Jumping's on-tile stay and unchanged energy/obstacle on every protected landing. Jumping caused no extra automatic move. Cyclone does not redirect a protected landing. Comparable pace and falls were observed across all three landing variants, and modeled opponent-facing actions were not eliminated. In 2P, mean opponent-facing actions remain low (~1.32/match), so **human interactivity remains uncertain**.

A separate earlier **18,000-game exploratory V8 probe** on seeds 1001–2000 compared the three landing variants; its direction was consistent: approximately six rounds in 7P and modest changes to falls and opponent actions. The 24,000-game reproducible runner is the primary reported comparison, **not** a pooled 42,000-game estimate.

## Interpretation and next action

**Recommend one simple ten-effect R1 trial**, retaining Cyclone and safe-landing Jumping while excluding Stone **for now**. Adding Stone as an eleventh card type offers no large observed pace improvement and adds a blocking/expiry rule. The 10-type option does trade Stone's tactical blocking for more Cyclone/Storm; a human might prefer Stone, and the scripted model cannot judge surprise, enjoyment, teachability, or fairness. This is not permission to remove Stone from production.

**Next owner-run manual gate:** try the single 10-type R1 deck in short 2P, 4P and 7P matches; record actual duration, whether Cyclone redirects are amusing or confusing, whether Jumping is understood immediately, whether missing Stone removes useful conflict, and whether every player has a meaningful interaction. Check 2P rotating-first marker behavior. Only revisit the 11-type option if feedback identifies a concrete loss of blocking strategy.

**Not established:** real rulebook acceptance, manual play results, full engine/boardgame.io parity, Jest/build/UI tests, human win probabilities, merged rules or deployment. The draft branch also has historical gameplay SK-DEC-019–024 IDs that collide with accepted visual `main` decision IDs; resolve before any authorized documentation merge. No gameplay implementation, merge or deploy was performed.
