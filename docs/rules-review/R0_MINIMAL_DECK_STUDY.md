# Iteration AA — simplify the R1 deck: 17 → 10 effects without losing the race

**2026-11-23 · Issue #11 · draft PR #12 · EXPERIMENTAL, not approved or implemented.** This follows the owner's preference for a **fast, interactive, easy-to-teach** game rather than an endless balance-exception system.

**User-facing handoff:** [minimal R1 quick-start](PLAYTEST_MINIMAL_R1_RULES.md) + [one-sheet 10-type/60-card print inventory](PLAYTEST_MINIMAL_R1_CARDS.md).

## What was removed, and what is left?

The prior **B60** pilot has 60 physical cards and 17 effect types. Several overlapping or multi-step effects increased learning and adjudication effort: three healing strengths, two specific rescue amounts, two defenses, random Cyclone redirect, direct player Change swap, and whole-row Tsunami.

We tested the **same 60 physical copies** with 12 effects and three different **10-effect distributions**. **No brand-new card effects** were coded. Copies of removed types become copies of effects already supported by the independent R0 model.

**Preferred next *trial*, not ratified:** `lite10Active`. Its print distribution is:

| Role | Retained type | Copies |
| --- | --- | ---: |
| Energy | Energy x2 | **12** |
| Recovery | Lifeguard Float | **9** |
| Damage 2 within 2 edges | Big Wave | **3** |
| Damage 1 within 3 edges | Sunburn | **7** |
| Blocking obstacle | Stone | **4** |
| Damage-on-entry obstacle | Storm | **7** |
| One-shot energy obstacle | Island | **3** |
| Obstacle removal | Jumping | **4** |
| Defensive immunity | Amulet | **7** |
| Two-edge movement | Surf Current | **4** |
| **TOTAL** | **10 distinct effects** | **60** |

Removed type names: `Energy`, `Coconut`, `Swimming Fin`, `Cyclone`, `Change`, `Tsunami`, `Hang Loose`. Mapping of their previous physical copies to remaining types in the selected *quantity profile*: Energy(6), Coconut(2) → Energy x2; Swimming Fin(5) → Lifeguard Float; Cyclone(3) → Storm; Change(2), Hang Loose(3) → Amulet; Tsunami(3) → Sunburn.

**No** Shark move/removal, weighted initial starts, extra starting cards, extra resource, new direct action, positional tiers or Drop In position exchange. R1 still uses **random unique starts, free mandatory edge move, one optional action, one draw after upright maneuver, free next-turn recovery, first round without direct attacks, rotate first actor one seat per round, and full-round highest-energy finish**.

## Reproducible test design and provenance

- **Script:** [R0_MINIMAL_DECK_AB.js](R0_MINIMAL_DECK_AB.js). [Model changes](R0_FULL_MATCH_MODEL.js) add only a final optional `deckProfile` argument (`b60` default, `lite12`, `lite10`, `lite10Guard`, `lite10Active`) while preserving all previous behavior. No gameplay engine file changed.
- **Exact layout:** `main` `src/map/layout/board-layout.json` blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`; 53 cells, Sharks 28–31, original 60 unique card IDs, original tactical priorities. The different deck compositions were chosen for clarity, **not** fitted to simulated win rates.
- **Controlled setup:** 2–7 players, two transparent scripted action policies (balanced/aggressive), rotating first actor, random distinct start hexes 0–6, no opening compensations, no round-one attacks, no Drop In position swaps, and round-end beach finish with remaining-energy tiebreak. A/B seeds matched within each population and batch.
- **Execution:** fetched exact JS sources from connected GitHub, executing them in a V8 JavaScript function harness with an emulated `assert` and `fs` reading the verified main map. These are **full R0 design-model games, not actual `SurfKingGame.js`, Node CLI in a cloned checkout, Jest/build, human games or observed real-world minutes**.

| Stage | Players | Seed window | Profiles × policies | Games | Model invariants passed |
| --- | --- | --- | --- | ---: | ---: |
| Initial 17/12/10 screen | 7 | 155001–158000 | b60/lite12/lite10 × 2 | 18,000 | 907,688 |
| Initial 17/12/10 screen | 4 | 158501–161000 | same | 15,000 | 484,270 |
| Initial 17/12/10 screen | 2 | 162001–164500 | same | 15,000 | 305,679 |
| Defense-biased 10-type screen | 7 | 169001–173000 | b60/lite10/lite10Guard × 2 | 24,000 | 1,206,584 |
| Defense-biased 10-type screen | 4 | 173001–177000 | same | 24,000 | 773,740 |
| Defense-biased 10-type screen | 2 | 177001–181000 | same | 24,000 | 489,867 |
| **Active 10-type candidate validation** | **7** | **184001–187000** | b60/lite10Guard/lite10Active × 2 | **18,000** | 906,864 |
| **Active 10-type candidate validation** | **4** | **187001–190000** | same | **18,000** | 581,495 |
| **Active 10-type candidate validation** | **2** | **190001–193000** | same | **18,000** | 366,687 |
| Missing-population screen | 3/5/6 | 193001–194500 | b60/lite10Active × 2 | 18,000 | 653,983 |
| **TOTAL** | **2–7** | Non-overlapping batch windows | 60-card independent model | **192,000** | **6,676,857** |

All **192,000 complete model games** finished by modeled round 16, the 60 physical card identities were conserved throughout play, the 10/12/17 profile type counts and player occupancy were checked, and every game's first round was protected from direct opponent attacks. All candidate retained types were played at least once in the studied sample.

**Additional exact model-code regressions:** 600 games after introducing deck profiles (21,352 state checks), 900 after adding guard profile (30,957 checks), 600 after introducing active profile (20,675 checks): **2,100 paired previous-behavior comparisons matched field-for-field** (total **72,984** checks). Earlier minimalist full-match/rules research remains independently recorded in [Iteration Z](R0_MINIMAL_RULES_STUDY.md).

## Findings: the quantity distribution matters as much as the type count

The first `lite12` reduced the names to twelve but **raised average falls in 7P balanced from 7.62 to 10.28**, because removed complex positional attacks were reallocated to more direct attack cards. The first `lite10` remained too attack-heavy. Merely cutting card names does **not** guarantee a better game.

The more-defensive `lite10Guard` restored the fall rate but reduced opponent-facing actions in 7P balanced from ~14.39 to ~11.03 and in 2P balanced from ~1.45 to ~1.11. Hence the final limited `lite10Active` probe: **10 attacks per deck** via 3 Big Wave + 7 Sunburn, **7 defensive Amulets**, no new effect.

### Independent final selected profile comparison (3,000 seeds per policy/profile/player count)

| Players / scripted strategy | B60: rounds / falls / opponent actions | **10-type active: rounds / falls / opponent actions** | B60 initial actor win spread | 10-type actor win spread |
| --- | --- | --- | --- | --- |
| **2P balanced** | **6.523 / 1.121 / 1.417** | **6.408 / 1.025 / 1.229** | 50.53–49.47% | **49.50–50.50%** |
| 2P aggressive | 6.551 / 1.275 / 1.743 | 6.424 / 1.198 / 1.631 | 50.50–49.50% | **50.30–49.70%** |
| **4P balanced** | **6.330 / 3.459 / 6.012** | **6.200 / 3.379 / 5.049** | 23.37–27.27% | **23.03–26.63%** |
| 4P aggressive | 6.389 / 4.596 / 8.077 | 6.223 / 4.535 / 7.418 | 23.87–26.57% | **22.63–27.67%** |
| **7P balanced** | **6.190 / 7.666 / 14.466** | **6.086 / 7.757 / 11.875** | 13.47–15.10% | **12.13–16.07%** |
| 7P aggressive | 6.290 / 11.249 / 20.979 | 6.202 / 11.553 / 20.036 | 12.53–16.23% | **12.33–16.53%** |

**Judgment:** The 10-type deck keeps the race close to six rounds, and **does not cause a major change in falls** in either scripted policy. Direct attacks, defense, rescue and terrain remain available. It **does reduce total adversary-targeting events** under balanced tactics, particularly in seven players, because row-wide Tsunami and direct Change swap are removed. Human play must decide if the resulting cleaner game is *still lively enough*. No type was never played in the validation sample.

**Fairness caveat:** The 7P conditional **worst** actor-slot×start-cell pair in the final balanced sample was ~**4.04%** with `lite10Active` versus **5.94%** with original B60; these selected minima are noisy (~400+ games per conditional pair) but warn against claiming solved positional fairness. In 3/5/6P screens (1,500 seeds per policy), finishes stayed about six rounds, but there were small shifts in seat win rates (3P aggressive 36.33/33.20/30.47% under the 10-type deck; 6P aggressive ~17.93/20.87/16.87/17.27/13.93/13.13%). **Do not create new special setup bonuses solely to smooth these numbers**; defer to the owner's actual tabletop experience.

## Keep / drop / next gate

**Keep for the next physical trial:** simple random starts, rotating start-player token, one tactic + free movement, fast fall-and-rescue, round-end beach finish. Use the **R1 10-type/60-copy card sheet** as a *single alternative to* the old 17-type B60 reference, never combine both decks.

**Drop from the proposed R1 deck:** Energy (1 healing), Coconut (full reset), Swimming Fin (weaker recovery), Cyclone (random teleport), Change (two-piece reposition), Tsunami (whole-row forced movement), Hang Loose (redundant shield). Their identities remain documented in historical B60 for reversibility.

**Next small owner manual test:** 2, 4 and 7 players, **one match with each** using [quick-start](PLAYTEST_MINIMAL_R1_RULES.md) and [ten-card sheet](PLAYTEST_MINIMAL_R1_CARDS.md). Record **minutes**, any card that caused rules lookup/delay, if each player got a meaningful interaction, if falls caused frustration, whether the 2P round-order token feels odd, and willingness to play again. No exact win-percent target or additional deck variant is a prerequisite to play.

**Release gates still open:** No human test conducted, no real play minutes/teach duration, no owner deck approval, no updated canonical rulebook, no production engine or Jest/build tests. Issue #11 / PR #12 draft and unmerged; gameplay SK-DEC-019–024 IDs in the old draft conflict with already accepted visual decision IDs on main and must be reconciled before any authorized merge. Never deploy or merge without explicit owner approval.
