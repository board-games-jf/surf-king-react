# Iteration M — R0 early focus-fire exposure and first-round congestion

**Date:** 2026-11-23. **Status:** Executed independent design-model scenarios, not actual matches, app/Jest tests, or evidence of human enjoyment. **No permanent rule change.**

## Question and reproduction

Does the experimental first-personal-turn preparation rule and B60 card mix protect a late actor from multiple attacks **before their second personal turn**? Does reversing initiative produce first-round congestion?

Run `node docs/rules-review/OPENING_FOCUS_PRESSURE_REPRODUCTION.js` from the project root. The script reads the verified **53-cell provisional** `src/map/layout/board-layout.json` from current main (`c6fd08e2`) and uses the exact proposed **60 physical cards / 17 types**.

- **120,000 shuffled opening fixtures:** 20,000 per 2/4/7 players × ascending/descending initiative. Deal two unique cards per player. On the first own turn, automatically activate Amulet *if held*, otherwise do no tactic, make one nearest-beach legal edge move, and draw once after a successful move. This assumes **optimistic proactive protection**, not human card use.
- With those frozen post-round-1 positions, check whether opponents acting **earlier in round 2** hold an in-range **Big Wave (2 edges, −2)** or **Sunburn (3 edges, −1)**. Existing active Amulet prevents exposure. **No actual attack, knockout, card theft or other card effect is executed**: these are *possible targeting opportunities*, not observed events or victory probabilities.
- **120,000 independent route-tie fixtures:** 20,000 per 2/4/7 players × ascending/descending order. Each player picks uniformly among currently legal vacant edge-neighbors with the shortest distance to a beach cell; forced blocked if none. This is not a distribution of real human strategy.
- Node 22 local execution against a numeric mirror of verified main layout coordinates passed adjacency, physical card-type conservation and collision assertions. The committed reproduction reads the repository layout directly; this was **not** a cloned-checkout Jest or build execution. Displayed 18→15 is internal 17→14, explicitly non-adjacent.

## Main results — potential incoming damage cards before the target's second turn

| Fixture | Any unblocked card opportunity | Big Wave opportunity | 2+ potential attackers |
| --- | ---: | ---: | ---: |
| 2P, seat 1 after seat 0 | **29.26%** | 13.45% | 0.00% |
| 4P, seat 3 last | **29.55%** | 13.71% | 0.00% |
| 7P, seat 4 fifth | **59.41%** | 25.69% | 15.89% |
| 7P, seat 5 sixth | **76.34%** | **36.80%** | **37.57%** |
| 7P, seat 6 last | **71.44%** | 36.62% | 29.64% |

Each row is 20,000 independently dealt opening-card fixtures, with the indicated deterministic first-round route. **These are not percentages of damage actually inflicted or of games won**. Candidate attackers may target someone else, be interrupted or respond to cards; interactions can change positions and hands. Only proactively played initial-hand Amulet protects in this isolate; it appeared for roughly **6.5–6.9%** of seats. Hang Loose does not protect from direct attack cards. The first actor has **zero** incoming pre-second-turn opportunities by definition of the measured window.

**Reverse-order congestion:** With seven starting cells 0–6 unchanged and the deterministic greedy first-round route, descending initiative generated positions `[0,4,5,10,7,8,9]` and left **seat 0 blocked**, with no first-turn draw. This is **one route sequence, not inevitable**. Among 20,000 randomized tied-shortest choices, reversed seven-player order caused seat-0 first-turn blockage **2,404 times (12.02%)**; ascending order caused **0/20,000** in this same model. The 2P and 4P tied-shortest tests also had **0/20,000** first-round blockages in either order. These are model policy frequencies, not gameplay or human-playtest rates.

Under reversed 7P deterministic routes, seat 0 had **71.69%** potential incoming damage-card exposure and **36.65%** Big Wave exposure, compared with 0% when acting first. **Both initiative and board occupancy changed**, so this difference is not a clean causal initiative-only effect.

## Design implications, not approved decisions

1. Preparation-only first personal turn avoids a hit before the target ever acts, but not **multiple plausible hits before their second turn** in crowded seven-player configurations. The proposed two Amulets may offer too little reactive counterplay; **do not change their count yet**.
2. An incoming Big Wave can instantly down an unprotected E2 target under trial card damage, and the accepted one-card fall loss could compound focused attacks. This fixture did not execute falls, counterplays, deck cycles, other 15 types, or full matches.
3. Rotating initiative without a concurrent **seven-player start/movement review** can lead to physical congestion. Full blocked-turn behavior and start-slot fairness need explicit testing.
4. **Next simulation:** matched-seed active-card *complete R0* rounds, with real target choices, effects and defense, 2/4/7 player counts, card conservation and actual fall accounting. Compare with owner-run human scorecards before proposing numerical rules.

Issue #11 / draft PR #12 only. No gameplay implementation, merge or deploy; draft gameplay SK-DEC-019–024 identifier conflicts with accepted visual `main` decisions still block documentation integration.
