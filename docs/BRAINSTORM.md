# Brainstorm — Unapproved Ideas

Ideas below are not authorization to implement. See [DECISIONS.md](DECISIONS.md) and [MVP.md](MVP.md) for decision and scope status.

## Multiplayer
- Keep `boardgame.io` and verify its existing server/lobby functionality.
- Evaluate Nakama; estimate rule migration, hosting resources and persistence requirements.
- Define reconnection and match restoration requirements before choosing a service.

## Rendering
- Build an indexed 53-cell React Three Fiber scene with a stable logical-to-world coordinate transform.
- Evaluate a tilted camera, cell picking, water animation, readable overlays and mobile performance.
- Treat complex wave physics and detailed character rigs as optional future scope.

## Tooling and hosting
- Compare modest React maintenance with conversion to TypeScript and a modern bundler.
- Measure constraints of Vercel, Render and Supabase free tiers, particularly sleeping services.
- Do not activate automatic deploys or paid/external infrastructure without owner approval.

## Future
- Consider AI opponents, advanced animations and richer social features only after MVP prioritization.
