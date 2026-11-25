# codependix-boundaries

Boundary rule validation, forbid/allow rule enforcement, and cycle detection for Codependix graphs. It depends on `@codependix/configuration`, `@codependix/core`, `@codependix/file-imports`, `@codependix/nestjs-modules`, `@codependix/nx-projects`.

## Modules

- `boundaries/` — Judges a built graph against the rules declared for its level (`BoundariesService`).
- `boundary-check/` — Judges every level's graph against its declared rules (`BoundaryCheckService`).
- `run-context/` — Resolves everything one run reads, once, before any pass runs (`RunContextService`).
