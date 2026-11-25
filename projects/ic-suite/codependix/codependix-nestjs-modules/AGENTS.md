# codependix-nestjs-modules

NestJS module container inspection and module-level dependency graph extraction for Codependix. It depends on nothing else in the toolchain.

## Modules

- `module-graph/` — Reduces an explored NestJS container into a graph and renders it (`ModuleGraphService`).
- `nestjs-modules-workspace-graph/` — Builds the whole-workspace NestJS module graph, combining every project's module graph into one (`NestjsModulesWorkspaceGraphService`).
- `nestjs-project/` — Discovers the workspace's `framework:nestjs` projects and explores each one's container (`NestjsProjectService`).
