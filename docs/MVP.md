# Minimum Viable Product (MVP)

## Approval status

**Incomplete.** Product-owner confirmation of high-level direction does not yet define full acceptance criteria or explicit exclusions. Do not treat the candidates below as implementation authorization.

## Confirmed direction

- Surf King is a turn-based board game with **53 logical hexagonal cells**.
- A **hybrid 3D board** is desired: clear hex boundaries with ocean, waves, and 3D characters.
- Initial deployment research prioritizes **free-tier-first** development and small-scale testing, subject to platform restrictions and verification.
- The official recovery repository is `board-games-jf/surf-king-react`.

## Candidate MVP capabilities — Proposed scope, not approved

| Capability | Existing evidence | Missing definition |
| --- | --- | --- |
| Local play | `src/pages/LocalPage/index.js` | Supported devices, play-flow criteria |
| Accurate rules engine | `src/game/SurfKingGame.js` | Canonical rulebook and disputed edge cases |
| Interactive hex board | `src/components/HexGrid/HexGrid.js` | Exact 53-cell mapping and labeling |
| Hybrid 3D scene | Not present | Camera, responsiveness, performance targets |
| Accounts, lobby, rooms, multiplayer | Server entry exists, online route disabled | Identity, authority, matchmaking, persistence |
| Cards, obstacles, attacks, victory | Game logic exists | Verified completeness and acceptance tests |

## Exclusions

**Not yet approved.** Bots/AI, expensive water physics, advanced chat and commercial release remain candidates for later prioritization; this document neither authorizes nor excludes them.

## Acceptance criteria and definition of done

MVP acceptance criteria are **pending owner approval**. They should eventually specify supported player flows, platforms, rule references, game lifecycle, 53-cell interactions, and online recovery/persistence.

Engineering completion for individual Issues follows [AGENTS.md](../AGENTS.md). The MVP itself has no approved Definition of Done yet.
