# Product and Architecture Decisions

Unique IDs and explicit statuses distinguish accepted owner direction from technical options. An `Accepted` entry is not merge/deployment authorization. Update status only when the owner makes or changes a decision.

| ID | Status | Decision / option | Rationale | Related work |
| --- | --- | --- | --- | --- |
| SK-DEC-001 | Accepted | `board-games-jf/surf-king-react` is the official repository. | Preserve existing code and treat GitHub as source of truth. | [#3](https://github.com/board-games-jf/surf-king-react/issues/3) |
| SK-DEC-002 | Accepted | Pursue a hybrid 3D map with clearly defined 53 hex cells, ocean, waves, and 3D characters. | Tactical clarity with a richer presentation. | Future 3D Issue |
| SK-DEC-003 | Accepted | Start with a free-tier-first approach for development/testing. | Control costs while validating the game; availability constraints are expected. | Future hosting Issue |
| SK-DEC-004 | Proposed | Use Three.js and React Three Fiber for 3D rendering. | Reuse React-oriented rendering patterns. | Future evaluation Issue |
| SK-DEC-005 | Proposed | Compare Nakama against retaining `boardgame.io` for authoritative online matches. | Existing server/game code may reduce migration work. | Future multiplayer Issue |
| SK-DEC-006 | Proposed | Evaluate Vercel (frontend), Render (server), and Supabase (database). | Desired hosting model requires compatibility and cost checks. | Future hosting Issue |
| SK-DEC-007 | Proposed | Separate game-state logic from presentation and transport adapters. | Limit coupling and preserve testability. | Future architecture Issue |

## Safeguards

- A proposal is never an approved technical decision.
- No component is deemed implemented merely because it appears in the proposed architecture.
- Superseded decisions retain their IDs; record the approved replacement separately.
- The rulebook, MVP requirements and exclusions still need separate validation and approval.
