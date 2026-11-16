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
| SK-DEC-008 | Accepted | Players can switch between 2D and 3D views of a single match without changing game state. | Both map styles must show the same turn, positions and interactions. | [#5](https://github.com/board-games-jf/surf-king-react/issues/5) |
| SK-DEC-009 | Proposed | Connect independently developed 3D rendering through a renderer-neutral map contract and public view-model adapter. | Allow standalone art/scene development without gameplay coupling. | [#5](https://github.com/board-games-jf/surf-king-react/issues/5) |
| SK-DEC-010 | Accepted | Obstacle meshes should sit directly in the sea without opaque blue bases. Stone and Island should follow their existing card silhouettes; lightning should branch and flash irregularly; the Cyclone should be larger but drift gently within its hex; and the Shark should move with the water. | Visual coherence between card art and gameplay, with readable animated obstacles. | [#13](https://github.com/board-games-jf/surf-king-react/issues/13) |
| SK-DEC-011 | Accepted | During the initial surfer customization phase, surfboard choice changes appearance only; surfboards do not affect speed, movement, energy, cards, or any other game rules. Gameplay attributes for different boards may be evaluated later but are not approved. | Let players personalize their surfers without complicating or unbalancing the fast board game. | [#20](https://github.com/board-games-jf/surf-king-react/issues/20) |
| SK-DEC-012 | Accepted | Use the owner's selected Surf King crown-and-wood logo concept and bright tropical beach/ocean setting as visual references for the surfer creator and broader game identity. | Keep a consistent cheerful surf-game presentation. Exact source image assets and final production styling still require separate integration and visual verification. | [#20](https://github.com/board-games-jf/surf-king-react/issues/20) |
| SK-DEC-013 | Accepted | Evaluate a genuine, licensed rigged GLB/glTF humanoid as the next surfer art foundation, beginning with one isolated model before replacing gameplay avatars. The chosen art asset itself is not yet approved. | Avoid continuing to approximate finished characters using primitive meshes while preserving a safe fallback and playable board. | [#22](https://github.com/board-games-jf/surf-king-react/issues/22), [#20](https://github.com/board-games-jf/surf-king-react/issues/20) |

| SK-DEC-014 | Accepted | All surfers start a match with **2 energy**. Maximum energy, combat dice, energy gain, movement cost, and fall recovery remain under gameplay design review. | Preserve an initial energy buffer while developing fast, strategic and recoverable falls. | [#11](https://github.com/board-games-jf/surf-king-react/issues/11), [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12) |

| SK-DEC-015 | Accepted | Surf King gameplay should **feature frequent, dramatic falls without lengthy inactivity**, in a **fast, simple, strategic and replayable race toward the beach**. Recovery cards should make calculated risks worthwhile; players without rescue cards must remain able to participate and recover. Specific fall/re-entry rules, damage amounts, card timing and victory pacing are **not** approved by this decision. | Preserve the original fall-heavy identity while solving matches stalled by prolonged recovery; optimize fall frequency and fall penalty separately. | [Gameplay epic #11](https://github.com/board-games-jf/surf-king-react/issues/11), [draft PR #12](https://github.com/board-games-jf/surf-king-react/pull/12) |

## Safeguards

- A proposal is never an approved technical decision.
- No component is deemed implemented merely because it appears in the proposed architecture.
- Superseded decisions retain their IDs; record the approved replacement separately.
- The rulebook, MVP requirements and exclusions still need separate validation and approval.
