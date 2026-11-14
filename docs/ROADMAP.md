# Recovery Roadmap

**Status:** Proposed sequence; this is not a delivery commitment. Issues and PRs are the authoritative execution record.

| Phase | Outcome | Priority | Gate |
| --- | --- | --- | --- |
| 0. Governance | Approved `AGENTS.md` and initial truthful documentation | First | [Issue #3](https://github.com/board-games-jf/surf-king-react/issues/3), review and explicit merge approval |
| 1. Baseline health | Reproducible dependency installation, test suite and build evidence | High | Compatible isolated environment |
| 2. Gameplay validation | Compare rules against the canonical approved rulebook; create scoped issues | High | Verified rulebook and MVP criteria |
| 3. Architecture boundaries | Assess minimal rule-engine decoupling and network contracts | Medium | Tests protect existing behavior |
| 4. Hybrid 3D prototype | 53 mapped hex cells, camera, interaction, basic water | Medium | Performance and coordinate contracts |
| 5. Multiplayer validation | Compare existing boardgame.io server with Nakama, authority/reconnect/persistence | Medium | Technical evidence and owner decision |
| 6. Hosted testing | Evaluate free tiers with reliability constraints | Later | Explicit infrastructure and deployment authorization |

No fixed dates are approved. Phases may be reordered according to test evidence and owner decisions.

Next action after governance approval: document actual baseline test/build results; see [HANDOFF.md](HANDOFF.md).
