# Minimum Viable Product (MVP)

## Approval status

**Incomplete.** Product-owner confirmation of high-level direction does not yet define full acceptance criteria or explicit exclusions. Do not treat the candidates below as implementation authorization.

## Confirmed direction

- Surf King is a turn-based board game with **53 logical hexagonal cells**.
- A **hybrid 3D board** is desired: clear hex boundaries with ocean, waves, and 3D characters.
- Players should be able to choose between 2D and 3D representations of the same match without restarting it.
- Initial deployment research prioritizes **free-tier-first** development and small-scale testing, subject to platform restrictions and verification.
- The official recovery repository is `board-games-jf/surf-king-react`.

## Candidate MVP capabilities — Proposed scope, not approved

| Capability | Existing evidence | Missing definition |
| --- | --- | --- |
| Local play | `src/pages/LocalPage/index.js` | Supported devices, play-flow criteria |
| Accurate rules engine | `src/game/SurfKingGame.js` | Canonical rulebook and disputed edge cases |
| Interactive hex board | `src/components/HexGrid/HexGrid.js` | Exact 53-cell mapping and labeling |
| Hybrid 3D scene | Not present | Camera, responsiveness, performance targets |
| Switchable 2D/3D views | Not present | View switching, accessibility and fallback acceptance criteria |
| Accounts, lobby, rooms, multiplayer | Server entry exists, online route disabled | Identity, authority, matchmaking, persistence |
| Cards, obstacles, attacks, victory | Game logic exists | Verified completeness and acceptance tests |

## Exclusions

**Not yet approved.** Bots/AI, expensive water physics, advanced chat and commercial release remain candidates for later prioritization; this document neither authorizes nor excludes them.

## Acceptance criteria and definition of done

MVP acceptance criteria are **pending owner approval**. They should eventually specify supported player flows, platforms, rule references, game lifecycle, 53-cell interactions, and online recovery/persistence.

Engineering completion for individual Issues follows [AGENTS.md](../AGENTS.md). The MVP itself has no approved Definition of Done yet.

## Approved local adaptive playtest subset

The owner approved Duel (2 players, 23 hexes), Competition (3 players on 23; 4–5 on 37), and Dominion (6–7 players, 53). First active beach arrival wins in every format; Dominion also ends after a fall leaves exactly one standing player. Unlimited Drop In remains. [Issue #66](https://github.com/board-games-jf/surf-king-react/issues/66) implements the separate selectable local trial; exact starts, shark locations, compensation and card ranges remain experimental. Acceptance for this subset requires both views to show only active hexes, authoritative legal targeting, correct immediate victory, reference R1/legacy regression protection and manual testing at each player count. This does not ratify the entire MVP or authorize release.
