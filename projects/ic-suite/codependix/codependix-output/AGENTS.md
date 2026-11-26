# codependix-output

Mermaid diagram rendering, Markdown anchor splicing, and JSON export for Codependix dependency graphs. It depends on `@codependix/boundaries`, `@codependix/configuration`, `@codependix/core`, `@codependix/file-imports`, `@codependix/nestjs-modules`, `@codependix/nx-projects`.

## Modules

- `anchors/` — Reads and rewrites codependix's named anchor blocks in a Markdown file (`AnchorsService`).
- `combined-output/` — Prints and writes the combined output of a run: every active graph type's whole-workspace data, plus any boundary findings (`CombinedOutputService`).
- `delivery/` — Delivers a resolved graph export to whichever destinations it names (`DeliveryService`).
- `graph-run/` — Orchestrates every configured graph export, one pass per graph type (`GraphRunService`).
- `path-query/` — Searches for connecting paths between two nodes in codependix graphs and renders results (`PathQueryService`).
- `project-graphs/` — Builds, renders, and delivers each included project's graph for the three per-project graph types (`ProjectGraphsService`).
- `python-imports/` — Builds and delivers every configured Python file-level import graph export (`PythonImportsService`).
- `reporting/` — Logs what `MapCommand`'s passes found, and decides whether each pass should fail the run (`ReportingService`).
- `workspace-graphs/` — Builds and delivers every whole-workspace graph: the Nx Workspace Graph, the file-imports graph, and the NestJS module graph (`WorkspaceGraphsService`).
