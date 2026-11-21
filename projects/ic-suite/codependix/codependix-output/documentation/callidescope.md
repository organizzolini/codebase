<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-output`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 117 |
| Files | 44 |
| Calls traced | 194 |
| Call stacks | 2 |
| Deepest stack | 11 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 14 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `GraphRunService.build`** — depth ≥ 11 · orphan-root

```text
🚀 GraphRunService.build(): WorkspaceGraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:167]
  └─> WorkspaceGraphsService.runFileImportsWorkspaceGraph(context: GraphRunContext): WorkspaceGraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:153]
     ↳ Builds, renders, and delivers the whole-workspace file-level import graph. Not built at all when the target is `"none"`.
    └─> WorkspaceGraphsService.map(…)(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:172]
      └─> PythonService.buildGraph(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:33]
         ↳ Builds a Python project's internal file-level import Graph.
        └─> PythonImportGraphService.buildGraph(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:167]
           ↳ Builds a Python project's internal file-level import Graph.
          └─> PythonImportGraphService.flatMap(…)(this: undefined, sourceFileName: string): PythonImportGraphEdge[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:172]
            └─> PythonImportGraphService.collectEdgesForFile(…): PythonImportGraphEdge[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:56]
               ↳ Collects every internal import edge one source file declares.
              └─> PythonImportParserService.parseImportSpecifiers(source: string): PythonImportSpecifier[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:150]
                 ↳ Parses every module-level import statement in a Python source file.
                └─> PythonImportParserService.parseStatement(statement: string): PythonImportSpecifier[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:118]
                   ↳ Parses one joined statement into the module(s) it names.
                  └─> PythonImportParserService.parseImportStatement(statement: string): PythonImportSpecifier[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:97]
                     ↳ Parses a joined `import <specifiers>` statement.
                    └─> PythonImportParserService.map(…)(modulePath: string): { level: number; modulePath: string; } [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:114]
```

**2. `GraphRunService.build`** — depth ≥ 10 · orphan-root

```text
🚀 GraphRunService.build(): WorkspaceGraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:221]
  └─> WorkspaceGraphsService.runNxWorkspaceGraph(context: GraphRunContext): WorkspaceGraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:238]
     ↳ Renders and delivers the Nx Workspace Graph's configured destinations, from the already-read Nx project graph.
    └─> WorkspaceGraphsService.deliverWorkspaceGraph(…): ProjectRunResult [projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:120]
       ↳ Delivers one already-built whole-workspace graph's configured destinations, at the workspace root.
      └─> DeliveryService.deliverGraphOutput(args: DeliverGraphOutputArguments): ProjectRunResult [projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:353]
         ↳ Delivers whichever destinations a resolved graph output names.
        └─> DeliveryService.deliverMarkdown(…): void [projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:159]
           ↳ Delivers a Markdown destination, recording it as stale if needed.
          └─> DeliveryService.checkAnchoredMarkdown(…): void [projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:42]
             ↳ Checks whether a named anchor block is current. A missing anchor is reported as stale, not thrown.
            └─> AnchorsService.checkAnchor(args: AnchorLocationArguments & { freshContent: string; }): AnchorCheckResult [projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:85]
               ↳ Compares a Markdown file's anchor against a freshly computed export.
              └─> AnchorsService.extractAnchorContent(args: AnchorLocationArguments): string | undefined [projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:102]
                 ↳ Reads a named anchor's current content, or `undefined` when it is absent.
                └─> AnchorsService.buildAnchorPattern(anchorName: string): RegExp [projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:47]
                   ↳ Builds the pattern matching a named anchor block and its inner content.
                  └─> AnchorsService.escapeForPattern(value: string): string [projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:55]
                     ↳ Escapes a string so it can be embedded literally in a regular expression.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `WorkspaceGraphsService.runFileImportsWorkspaceGraph` | 7 | `ConfigurationService.resolveForWorkspace`, `WorkspaceGraphsService.buildTypescriptGraphs`, `WorkspaceGraphsService.map(…)`, `PythonService.discoverProjects`, `FileImportsWorkspaceGraphService.buildWorkspaceGraph`, `FileImportsWorkspaceGraphService.renderMermaid`, `WorkspaceGraphsService.deliverWorkspaceGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:153` |
| `AnchorsService.replaceAnchorContent` | 6 | `AnchorsService.hasAnchor`, `AnchorNotFoundError.constructor`, `buildStartMarker`, `buildEndMarker`, `AnchorsService.replace(…)`, `AnchorsService.buildAnchorPattern` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:144` |
| `ProjectGraphsService.runImportProject` | 6 | `TypescriptService.buildProgram`, `TypescriptService.buildGraph`, `DeliveryService.deliverGraphOutput`, `DeliveryService.renderJson`, `TypescriptService.renderMermaid`, `ProjectGraphsService.buildMarkdownSection` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:122` |

<details>
<summary>62 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ProjectGraphsService.runNestjsProject` | 6 | `NestjsProjectService.exploreProject`, `ModuleGraphService.buildGraph`, `DeliveryService.deliverGraphOutput`, `DeliveryService.renderJson`, `ModuleGraphService.renderMermaid`, `ProjectGraphsService.buildMarkdownSection` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:151` |
| `PathQueryService.queryFileImports` | 6 | `PathQueryService.map(…)`, `PythonService.discoverProjects`, `PathQueryService.map(…)`, `TypescriptService.discoverProjects`, `FileImportsWorkspaceGraphService.buildWorkspaceGraph`, `PathQueryService.findShortestPath` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:118` |
| `DeliveryService.writeAnchoredMarkdown` | 5 | `AnchorNotFoundError.constructor`, `DeliveryService.readFileOrEmpty`, `AnchorsService.hasAnchor`, `DeliveryService.writeAutoCreatedAnchorSection`, `AnchorsService.replaceAnchorContent` | `projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:271` |
| `ProjectGraphsService.runNxProject` | 5 | `DeliveryService.deliverGraphOutput`, `DeliveryService.renderJson`, `ProjectGraphsService.buildNeighborhoodJsonExport`, `NeighborhoodService.renderMermaid`, `ProjectGraphsService.buildMarkdownSection` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:180` |
| `PythonImportsService.runProject` | 5 | `PythonService.buildGraph`, `DeliveryService.deliverGraphOutput`, `DeliveryService.renderJson`, `PythonService.renderMermaid`, `PythonImportsService.buildMarkdownSection` | `projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:92` |
| `WorkspaceGraphsService.runNestjsModulesWorkspaceGraph` | 5 | `ConfigurationService.resolveForWorkspace`, `WorkspaceGraphsService.buildNestjsModuleGraphs`, `NestjsModulesWorkspaceGraphService.buildWorkspaceGraph`, `NestjsModulesWorkspaceGraphService.renderMermaid`, `WorkspaceGraphsService.deliverWorkspaceGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:198` |
| `GraphRunService.run` | 5 | `GraphRunService.runNxGraphs`, `GraphRunService.runNestjsGraphs`, `GraphRunService.runImportGraphs`, `GraphRunService.runPythonImportGraphs`, `GraphRunService.collectCombinedGraphs` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:122` |
| `ReportingService.reportBoundaries` | 5 | `ReportingService.filterVerdict`, `BoundaryOutcomeReportService.renderFailures`, `BoundaryReportService.renderSummary`, `BoundaryReportService.renderViolations`, `ReportingService.reportBoundaryNotes` | `projects/ic-suite/codependix/codependix-output/src/modules/reporting/reporting.service.ts:83` |
| `AnchorsService.insertAnchorSection` | 4 | `AnchorsService.wrapInAnchors`, `AnchorsService.escapeForPattern`, `AnchorsService.appendCodependixSection`, `AnchorsService.insertIntoCodependixSection` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:115` |
| `CombinedOutputService.run` | 4 | `CombinedOutputService.printConsole`, `CombinedOutputService.writeFile`, `CombinedOutputService.renderJson`, `CombinedOutputService.renderMarkdown` | `projects/ic-suite/codependix/codependix-output/src/modules/combined-output/combined-output.service.ts:157` |
| `DeliveryService.checkAnchoredMarkdown` | 4 | `AnchorNotFoundError.constructor`, `AnchorsService.hasAnchor`, `AnchorsService.checkAnchor`, `DeliveryService.classifyDifference` | `projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:42` |
| `DeliveryService.deliverMarkdown` | 4 | `DeliveryService.readFileOrEmpty`, `DeliveryService.classifyDifference`, `DeliveryService.checkAnchoredMarkdown`, `DeliveryService.writeAnchoredMarkdown` | `projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:159` |
| `DeliveryService.deliverGraphOutput` | 4 | `DeliveryService.resolveJsonDelivery`, `DeliveryService.resolveMarkdownDelivery`, `DeliveryService.deliverJson`, `DeliveryService.deliverMarkdown` | `projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:353` |
| `ProjectGraphsService.runFileImportsProjects` | 4 | `TypescriptService.discoverProjects`, `ProjectGraphsService.resolveProjectOutput`, `ProjectGraphsService.runImportProject`, `ProjectGraphsService.collectProjectFailure` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:211` |
| `ProjectGraphsService.runNestjsModulesProjects` | 4 | `NestjsProjectService.discoverProjects`, `ProjectGraphsService.resolveProjectOutput`, `ProjectGraphsService.runNestjsProject`, `ProjectGraphsService.collectProjectFailure` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:247` |
| `PythonImportsService.runGraphs` | 4 | `PythonService.discoverProjects`, `PythonImportsService.resolveProjectOutput`, `PythonImportsService.runProject`, `PythonImportsService.collectProjectFailure` | `projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:123` |
| `WorkspaceGraphsService.runNxWorkspaceGraph` | 4 | `ConfigurationService.resolveForWorkspace`, `WorkspaceGraphService.buildWorkspaceGraph`, `WorkspaceGraphService.renderMermaid`, `WorkspaceGraphsService.deliverWorkspaceGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:238` |
| `AnchorsService.buildAnchorPattern` | 3 | `AnchorsService.escapeForPattern`, `buildStartMarker`, `buildEndMarker` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:47` |
| `CombinedOutputService.renderMarkdown` | 3 | `AnchorsService.insertAnchorSection`, `BoundaryOutcomeReportService.renderMarkdown`, `BoundaryOutcomeReportService.buildReport` | `projects/ic-suite/codependix/codependix-output/src/modules/combined-output/combined-output.service.ts:84` |
| `ProjectGraphsService.runNxProjectsGraphs` | 3 | `ProjectGraphsService.resolveProjectOutput`, `ProjectGraphsService.runNxProject`, `ProjectGraphsService.collectProjectFailure` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:285` |
| `WorkspaceGraphsService.buildNestjsModuleGraphs` | 3 | `NestjsProjectService.discoverProjects`, `NestjsProjectService.exploreProject`, `ModuleGraphService.buildGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:78` |
| `WorkspaceGraphsService.deliverWorkspaceGraph` | 3 | `DeliveryService.deliverGraphOutput`, `DeliveryService.renderJson`, `WorkspaceGraphsService.buildMarkdownSection` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:120` |
| `GraphRunService.runNestjsGraphs` | 3 | `ProjectGraphsService.runNestjsModulesProjects`, `WorkspaceGraphsService.runNestjsModulesWorkspaceGraph`, `GraphRunService.collectProjectFailure` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:179` |
| `GraphRunService.runNxGraphs` | 3 | `NeighborhoodService.buildNeighborhoods`, `ProjectGraphsService.runNxProjectsGraphs`, `GraphRunService.collectWorkspaceOutcome` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:212` |
| `PathQueryService.buildNestjsModuleGraphs` | 3 | `NestjsProjectService.discoverProjects`, `NestjsProjectService.exploreProject`, `ModuleGraphService.buildGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:85` |
| `PathQueryService.queryNestjsModules` | 3 | `PathQueryService.buildNestjsModuleGraphs`, `NestjsModulesWorkspaceGraphService.buildWorkspaceGraph`, `PathQueryService.findShortestPath` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:146` |
| `PathQueryService.renderMermaidSection` | 3 | `buildNoPathMessage`, `PathQueryService.map(…)`, `PathQueryService.toMermaidId` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:214` |
| `PathQueryService.findShortestPath` | 3 | `PathQueryService.isKnownNode`, `PathQueryService.searchBfs`, `PathQueryService.buildAdjacency` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:276` |
| `PathQueryService.query` | 3 | `PathQueryService.queryNxProjects`, `PathQueryService.queryFileImports`, `PathQueryService.queryNestjsModules` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:303` |
| `ReportingService.reportOutcome` | 3 | `ReportingService.filter(…)`, `ReportingService.map(…)`, `ReportingService.flatMap(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/reporting/reporting.service.ts:144` |
| `ReportingService.reportPassOutcomes` | 3 | `ReportingService.reportOutcome`, `ReportingService.reportBoundaries`, `ReportingService.map(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/reporting/reporting.service.ts:186` |
| `AnchorsService.checkAnchor` | 2 | `AnchorsService.extractAnchorContent`, `AnchorNotFoundError.constructor` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:85` |
| `AnchorsService.wrapInAnchors` | 2 | `buildStartMarker`, `buildEndMarker` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:162` |
| `CombinedOutputService.printConsole` | 2 | `CombinedOutputService.renderJson`, `CombinedOutputService.renderMarkdown` | `projects/ic-suite/codependix/codependix-output/src/modules/combined-output/combined-output.service.ts:47` |
| `CombinedOutputService.resolveFormat` | 2 | `CombinedOutputService.find(…)`, `CombinedOutputService.map(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/combined-output/combined-output.service.ts:131` |
| `DeliveryService.deliverJson` | 2 | `DeliveryService.readFileOrEmpty`, `DeliveryService.classifyDifference` | `projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:126` |
| `DeliveryService.writeAutoCreatedAnchorSection` | 2 | `AnchorNotFoundError.constructor`, `AnchorsService.insertAnchorSection` | `projects/ic-suite/codependix/codependix-output/src/modules/delivery/delivery.service.ts:323` |
| `ProjectGraphsService.resolveProjectOutput` | 2 | `ConfigurationService.resolveForProject`, `ProjectGraphsService.find(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/project-graphs/project-graphs.service.ts:99` |
| `PythonImportsService.resolveProjectOutput` | 2 | `ConfigurationService.resolveForProject`, `PythonImportsService.find(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:70` |
| `WorkspaceGraphsService.buildTypescriptGraphs` | 2 | `WorkspaceGraphsService.map(…)`, `TypescriptService.discoverProjects` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:103` |
| `WorkspaceGraphsService.map(…)` | 2 | `TypescriptService.buildGraph`, `TypescriptService.buildProgram` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:109` |
| `GraphRunService.runImportGraphs` | 2 | `ProjectGraphsService.runFileImportsProjects`, `GraphRunService.collectWorkspaceOutcome` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:163` |
| `PathQueryService.map(…)` | 2 | `TypescriptService.buildGraph`, `TypescriptService.buildProgram` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:127` |
| `PathQueryService.queryNxProjects` | 2 | `WorkspaceGraphService.buildWorkspaceGraph`, `PathQueryService.findShortestPath` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:165` |
| `PathQueryService.renderMarkdown` | 2 | `buildNoPathMessage`, `PathQueryService.map(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:180` |
| `PathQueryService.render` | 2 | `PathQueryService.renderMermaid`, `PathQueryService.renderMarkdown` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:335` |
| `PathQueryService.resolveFormat` | 2 | `PathQueryService.find(…)`, `PathQueryService.map(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:351` |
| `ReportingService.filterVerdict` | 2 | `ReportingService.filter(…)`, `ReportingService.filter(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/reporting/reporting.service.ts:43` |
| `ReportingService.reportBoundaryNotes` | 2 | `BoundaryOutcomeReportService.renderFailures`, `BoundaryReportService.renderNotes` | `projects/ic-suite/codependix/codependix-output/src/modules/reporting/reporting.service.ts:61` |
| `AnchorsService.extractAnchorContent` | 1 | `AnchorsService.buildAnchorPattern` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:102` |
| `AnchorsService.hasAnchor` | 1 | `AnchorsService.buildAnchorPattern` | `projects/ic-suite/codependix/codependix-output/src/modules/anchors/anchors.service.ts:107` |
| `CombinedOutputService.renderJson` | 1 | `BoundaryOutcomeReportService.buildReport` | `projects/ic-suite/codependix/codependix-output/src/modules/combined-output/combined-output.service.ts:60` |
| `WorkspaceGraphsService.map(…)` | 1 | `PythonService.buildGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/workspace-graphs/workspace-graphs.service.ts:172` |
| `GraphRunService.collectWorkspaceOutcome` | 1 | `GraphRunService.collectProjectFailure` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:96` |
| `GraphRunService.build` | 1 | `WorkspaceGraphsService.runFileImportsWorkspaceGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:167` |
| `GraphRunService.build` | 1 | `WorkspaceGraphsService.runNxWorkspaceGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:221` |
| `GraphRunService.runPythonImportGraphs` | 1 | `PythonImportsService.runGraphs` | `projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:233` |
| `PathQueryService.isKnownNode` | 1 | `PathQueryService.some(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:105` |
| `PathQueryService.map(…)` | 1 | `PythonService.buildGraph` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:121` |
| `PathQueryService.renderMermaid` | 1 | `PathQueryService.renderMermaidSection` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:200` |
| `PathQueryService.map(…)` | 1 | `PathQueryService.toMermaidId` | `projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:223` |
| `ReportingService.flatMap(…)` | 1 | `ReportingService.map(…)` | `projects/ic-suite/codependix/codependix-output/src/modules/reporting/reporting.service.ts:159` |

</details>
<!-- callidescope:end -->
