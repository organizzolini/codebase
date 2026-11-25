# codependix-core

The contracts leaf of the codependix package graph: the types for a run's mode and outcome and for stale exports and anchor checks. Keep it to types; logic belongs in the package that owns the behavior. The service and module beside the types are the generator's unused placeholder, with a `TODO` for their JSDoc. It depends on no other workspace package.

## Modules

- `codependix-core/` — `codependix-core.types.ts` declares `RunMode`, `GraphRunOutcome`, `StaleExport`, `AnchorCheckResult`, and the per-project run results.
