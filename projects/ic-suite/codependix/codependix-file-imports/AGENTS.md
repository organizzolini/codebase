# codependix-file-imports

TypeScript and JavaScript file-level import graph extraction and circularity detection for Codependix. It depends on nothing else in the toolchain.

## Modules

- `file-imports-workspace-graph/` — Builds the whole-workspace file-level import graph, combining every TypeScript and Python project's import graph into one (`FileImportsWorkspaceGraphService`).
- `python/` — Discovers the workspace's Python projects and lists each one's source files (`PythonProjectService`).
- `typescript/` — Discovers the workspace's TypeScript projects and builds a `ts.Program` for each one (`TypescriptProjectService`).
