# callidescope-core

The contracts leaf of the callidescope package graph: the types every other package speaks, covering call graphs, stacks, frames, findings, and entry points. Keep it to types; logic belongs in the package that owns the behavior. The service and module beside the types are the generator's unused placeholder, with a `TODO` for their JSDoc. It depends on no other workspace package.

## Modules

- `callidescope-core/` — `callidescope-core.types.ts` declares the call-graph, stack, and finding contracts, and `src/index.ts` re-exports them.
