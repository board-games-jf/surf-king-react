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

## Card artwork — compact treatment
- Explore a simplified sculptural cartoon treatment with one clear subject, clean background, strong silhouette and minimal decorative detail. Preserve the approved tropical visual identity (SK-DEC-ART-001); the detailed concepts can inform promotional artwork.
- Candidate palette: ocean #087D9E, turquoise #29C6B5, sand #F4D59A, sun #FFB733, coral #F36B50. Category colors and symbols are proposals, not fixed rules.
- Review the illustrated card mockup (orange obstacles, teal actions, purple accessories, common branded back) and test actual hand size. Mockup costs and effects are illustrative and must not be used as rules. Keep frame, text and effect/range/energy indicators separate from illustrations; never rely on color alone.
- Reconcile the evolving R1 deck (#42) with the 19 legacy types before producing all unique illustrations. No rule changes or full asset production authorized yet. See [#44](https://github.com/board-games-jf/surf-king-react/issues/44).
