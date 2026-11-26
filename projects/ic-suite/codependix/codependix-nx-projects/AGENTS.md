# codependix-nx-projects

Nx workspace project graph extractor and neighborhood relationship builder for Codependix. It depends on nothing else in the toolchain.

## Modules

- `neighborhood/` — Builds each project's one-hop Nx dependency neighborhood (`NeighborhoodService`).
- `workspace-graph/` — Builds the whole-repository Nx dependency graph, with every project and edge (`WorkspaceGraphService`).
