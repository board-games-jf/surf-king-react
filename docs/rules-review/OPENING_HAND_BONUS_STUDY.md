# Iteration S — Can one extra opening card compensate the last actor?

**Date:** 2026-11-23 · **Issue:** #11 · **Status:** controlled experimental design model, not approved gameplay, a production engine test or a human playtest.

## Owner objective and context

The owner placed Sharks in the central band intentionally to **make edge/outer starting positions less trivially advantaged** and wants every player, particularly the **last actor**, to feel they still have a path to victory. The owner suggested compensating the last actor (or several late actors) with **extra cards at setup** rather than making starting positions identical. Cards should supply options; they should not make the game won before play begins.

## One-parameter randomized-start A/B

[Reproduction](OPENING_HAND_BONUS_AB.js) using the [complete experimental R0 17-card-type / B60 match model](R0_FULL_MATCH_MODEL.js):

- **Actually executed:** **24,000 complete simulated match runs** = 2/4/7 players × 2 scripted policy modes (balanced, aggressive) × **4 initial-hand policies** × 1,000 **paired seeds per configuration**. Exactly **7 existing starting cells** (0–6), sampled uniformly without replacement for each match; first actor randomized across identities/seat order using a deterministic seed; order remains **fixed within each game** (no snake/response-window exploit).
- **Control:** 2 cards to everyone. **Last+1:** 3 cards for last actor only. **Last two+1:** last and penultimate receive 3 cards each when 3+ players (same as Last+1 for 2P). **Last+2:** last actor receives 4 cards. All use the **same 60 individually identifiable physical cards** and shuffled deck in the model; extra initial draws shift later deck contents naturally. R0 5-card hand cap, 1 tactic/turn, preparation-only personal first turn, movement energy 0, Shark −2, active effects and random fall-card transfer all retained.
- **A/B pairing:** same seed => same positional assignments and nominal draw-deck permutation at deal start. Actual later draws diverge when additional starting cards are dealt, a genuine effect of the intervention, not an extra policy variable.
- **Model verification:** All 24,000 games reached beach by the model's round-16 limit. Every modeled turn asserted **60 distinct cards across zones, no occupied-hex overlaps, coherent fallen/energy state, and correct one-card-or-empty-hand penalty for each new fall**. No assertions failed. All 17 effects are supported and available in every variant, but this is a scripted independent approximation, not authoritative app rule parity.
- **Execution environment:** The **exact committed JS model code** was fetched through the connected GitHub tool and executed in a V8 JS function sandbox with a source-layout injection and equivalent simple assertion shims. The source was read from **current main**, layout blob `de7a795261a4ad2a1ab6e81e8ca8f1189df708f5`. The standalone Node A/B wrapper was committed for reproducibility in a checkout but **not itself executed inside a repository clone**; no Jest, build, app UI or human playtest ran. Earlier experiment results and this one must not be conflated with official engine outcomes.

## Balanced policy results — 1,000 matches per row

| Players | Opening hand rule | First actor wins | Last actor wins | Average rounds | Average opponent-facing actions |
| --- | --- | ---: | ---: | ---: | ---: |
| **2** | Everyone 2 | **71.0%** | **29.0%** | 6.52 | 1.42 |
| 2 | Last 3 | 69.0% | 31.0% | 6.47 | 1.45 |
| 2 | Last 4 | **66.8%** | **33.2%** | 6.43 | 1.45 |
| **4** | Everyone 2 | **46.4%** | **13.6%** | 6.34 | 5.64 |
| 4 | Last 3 | 42.7% | 16.2% | 6.28 | 5.62 |
| 4 | Last two 3 | 40.5% | **13.2%** | 6.25 | 5.63 |
| 4 | Last 4 | **39.6%** | **16.4%** | 6.27 | 5.78 |
| **7** | Everyone 2 | **27.9%** | **5.2%** | 6.13 | 13.15 |
| 7 | Last 3 | 25.5% | 7.8% | 6.16 | 13.20 |
| 7 | Last two 3 | 26.8% | **7.9%** | 6.11 | 13.02 |
| 7 | Last 4 | 25.5% | **9.4%** | 6.12 | 13.08 |

**Equal-seat references** (not a demand for perfect equality): 50%, 25% and 14.3% for 2P, 4P and 7P. Card bonuses **improve options** but do not remove large initiative asymmetry in this model, especially 7P. Note last-two+1 helps both late actors, but does not consistently increase last *alone*; the penultimate actor competes for the same winner slot.

## Policy robustness and position interactions

- **Aggressive 2P:** first/last win **70.9%/29.1%** (none), **67.8%/32.2%** (last+1), **65.8%/34.2%** (last+2).
- **Aggressive 4P:** first/last **45.4%/14.9%** (none); **41.7%/14.6%** (last+1), **40.3%/13.6%** (last two+1), **41.0%/17.7%** (last+2). In some 1,000-match cells the +1 advantage *did not* improve the last actor; the intervention is **not uniformly beneficial at this sample size/heuristic**.
- **Aggressive 7P:** first/last **29.2%/4.6%** (none); **30.0%/6.5%** (last+1); **25.8%/6.7%** (last two+1); **27.0%/8.6%** (last+2). Attacks/falls remain high: for baseline aggressive 7P, mean **19.28 opponent-facing actions / 10.56 new falls**, varying little across bonuses.
- **Starting-cell effects after randomizing assignments:** In **7P balanced, no bonus**, conditional winning share per start cell (each of seven starts assigned once per match) was **0: 15.0%, 1: 8.6%, 2: 8.4%, 3: 16.2%, 4: 19.0%, 5: 15.5%, 6: 17.3%**. This is not a static shortest-path ranking: **central exposure and tactical choices materially change results**. 4 had the highest model win share in this batch, not 5; 1 and 2 had the lowest. These are noisy outcomes from **1,000 modeled 7P matches**, **not** proven optimal positions or real player odds.
- Because **shuffling an extra card changes subsequent draw order**, some seed-level outcomes switch in either direction; more cards can also make an attacker target the recipient or change game flow. Model policy selection is deterministic/heuristic and not human optimization.

## Decision implication: modest bonus ≠ full initiative solution

**Provisional recommendation:** Test **one extra random starting card for the last actor** as an intelligible **opt-in tabletop variant**, preserving first-turn preparation-only and normal turn order. It is simple and keeps card-driven reversals possible. In **5–7 player games**, adding one to the penultimate actor is a *second* experimental option, not automatically preferable: it distributes opening opportunities but can dilute the last actor's gains.

**Do not yet ratify** a uniform bonus: even **last+2** leaves the 7P last actor winning **9.4% / 8.6%** in scripted model trials versus a 14.3% equal-seat reference, while the first actor often wins ~25–30%. For 2P last+1 yields ~31–32% versus 50% reference. The player could still feel disadvantaged. The main problem is **not only the number of initial cards**; first-turn tempo, fixed action order, winner-first-beach resolution, geometry and multi-player attacks all contribute. Pure RNG randomizes who suffers the disadvantage across repeat games; it does not eliminate it **within** a specific game.

**Small next test:** Keep positions random and card rules fixed, but A/B **the finishing opportunity / end-of-round photo-finish procedure** alongside last+1 (e.g. contenders who enter the beach before every player completes that round, with a simple fair tiebreak). Existing R0 model shows many same-round arrivals, so winner-on-first-arrival can produce visible hopelessness even after giving cards. Any tiebreak is a **new experiment**, not approved. Avoid snake initiative because Iteration P demonstrated an unresolved back-to-back attack response problem.

## Governance

Issue #11 / draft PR #12 only. Changed only experimental model parameters and documentation/test runner in the existing docs branch. No `src/game` code changes, Jest/build, main merge, deployment or owner tabletop session. Draft gameplay SK-DEC-019–024 identifiers still conflict with approved visual main identifiers and must be reconciled before any docs merge.
