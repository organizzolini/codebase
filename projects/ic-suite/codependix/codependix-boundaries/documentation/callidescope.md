<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-boundaries`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 139 |
| Files | 26 |
| Calls traced | 158 |
| Call stacks | 7 |
| Deepest stack | 12 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 12 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `BoundaryCheckService.nestjsModules`** — depth ≥ 12 · orphan-root

```text
🚀 BoundaryCheckService.nestjsModules(levelArguments: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:146]
  └─> BoundaryCheckService.runNestjsLevel(args: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:159]
     ↳ Judges every `framework:nestjs` project's module graph.
    └─> BoundaryCheckService.runProjectLevel(…): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:220]
       ↳ Judges each build-set project at one level, isolating failures per project so one raise does not stop the rest.
      └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:214]
         ↳ Every violation one graph's rules report, in declaration order, so the report reads like the configuration.
        └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:215]
          └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:153]
             ↳ Reports each cycle the selected nodes still form, charged to every project on it.
            └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:85]
               ↳ The ids of every node a selector claims.
              └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:95]
                └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:69]
                   ↳ Whether a selector claims a node.
                  └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:46]
                     ↳ Whether a node tag matches a list of globs. One matching tag suffices, as in an Nx tag list.
                    └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:58]
                      └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
```

**2. `BoundaryCheckService.python`** — depth ≥ 12 · orphan-root

```text
🚀 BoundaryCheckService.python(levelArguments: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:149]
  └─> BoundaryCheckService.runPythonImportsLevel(args: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:251]
     ↳ Judges every `language:python` project's file-level import graph.
    └─> BoundaryCheckService.runProjectLevel(…): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:220]
       ↳ Judges each build-set project at one level, isolating failures per project so one raise does not stop the rest.
      └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:214]
         ↳ Every violation one graph's rules report, in declaration order, so the report reads like the configuration.
        └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:215]
          └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:153]
             ↳ Reports each cycle the selected nodes still form, charged to every project on it.
            └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:85]
               ↳ The ids of every node a selector claims.
              └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:95]
                └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:69]
                   ↳ Whether a selector claims a node.
                  └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:46]
                     ↳ Whether a node tag matches a list of globs. One matching tag suffices, as in an Nx tag list.
                    └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:58]
                      └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
```

**3. `BoundaryCheckService.typescript`** — depth ≥ 12 · orphan-root

```text
🚀 BoundaryCheckService.typescript(levelArguments: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:151]
  └─> BoundaryCheckService.runTypescriptImportsLevel(args: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:265]
     ↳ Judges every TypeScript project's file-level import graph.
    └─> BoundaryCheckService.runProjectLevel(…): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:220]
       ↳ Judges each build-set project at one level, isolating failures per project so one raise does not stop the rest.
      └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:214]
         ↳ Every violation one graph's rules report, in declaration order, so the report reads like the configuration.
        └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:215]
          └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:153]
             ↳ Reports each cycle the selected nodes still form, charged to every project on it.
            └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:85]
               ↳ The ids of every node a selector claims.
              └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:95]
                └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:69]
                   ↳ Whether a selector claims a node.
                  └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:46]
                     ↳ Whether a node tag matches a list of globs. One matching tag suffices, as in an Nx tag list.
                    └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:58]
                      └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
```

<details>
<summary>4 more call stacks</summary>

**4. `BoundaryCheckService.nxProjects`** — depth 11 · orphan-root

```text
🚀 BoundaryCheckService.nxProjects(levelArguments: LevelCheckArguments): BoundaryLevelOutcome [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:148]
  └─> BoundaryCheckService.runNxLevel(args: LevelCheckArguments): BoundaryLevelOutcome [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:182]
     ↳ Judges the whole-workspace Nx graph over the build set. A graph that cannot be built is charged to every judged project.
    └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:214]
       ↳ Every violation one graph's rules report, in declaration order, so the report reads like the configuration.
      └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:215]
        └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:153]
           ↳ Reports each cycle the selected nodes still form, charged to every project on it.
          └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:85]
             ↳ The ids of every node a selector claims.
            └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:95]
              └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:69]
                 ↳ Whether a selector claims a node.
                └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:46]
                   ↳ Whether a node tag matches a list of globs. One matching tag suffices, as in an Nx tag list.
                  └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:58]
                    └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
```

**5. `BoundaryCheckService.buildGraph`** — depth 9 · orphan-root

```text
🚀 BoundaryCheckService.buildGraph(project: PythonProject): BoundaryGraph [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:255]
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

**6. `BoundaryCheckService.buildGraph`** — depth ≥ 7 · orphan-root

```text
🚀 BoundaryCheckService.buildGraph(project: TypescriptProject): BoundaryGraph [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:269]
  └─> TypescriptService.buildGraph(projectProgram: TypescriptProjectProgram): TypescriptImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:37]
     ↳ Builds a project's internal file-level import Graph from its program.
    └─> TypescriptImportGraphService.buildGraph(projectProgram: TypescriptProjectProgram): TypescriptImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:174]
       ↳ Builds a project's internal file-level import Graph from its program.
      └─> TypescriptImportGraphService.listOwnedSourceFileNames(projectProgram: TypescriptProjectProgram): string[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:111]
         ↳ Lists a program's own source files, excluding declaration files. Files pulled in only as dependencies are left out.
        └─> TypescriptImportGraphService.resolveOwnedFileNames(projectProgram: TypescriptProjectProgram): Set<string> [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:145]
           ↳ Resolves the real, absolute file names a program owns.
          └─> TypescriptImportGraphService.map(…)(fileName: string): string [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:151]
            └─> TypescriptProjectService.toRealPath(filePath: string): string [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:110]
               ↳ Resolves a path through symlinks, which is how pnpm workspaces link.
```

**7. `BoundaryCheckService.buildGraph`** — depth ≥ 5 · orphan-root

```text
🚀 BoundaryCheckService.buildGraph(project: NestjsProject): Promise<BoundaryGraph> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:163]
  └─> ModuleGraphService.buildGraph(tree: NestjsExploredModule[], projectName: string): NestjsModuleGraph [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:155]
     ↳ Reduces an explored container to a Graph of its module imports.
    └─> ModuleGraphService.collectEdgesAndNodes(…): { connectedModuleNames: Set<string>; edges: NestjsModuleGraphEdge[]; nodes: NestjsModuleGraphNode[]; } [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:39]
       ↳ Walks the tree into the edges worth drawing and the nodes they touch.
      └─> ModuleGraphService.addNode(name: string, declaringFile: string): void [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:51]
        └─> ModuleGraphService.some(…)(node: NestjsModuleGraphNode): boolean [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:54]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `RunContextService.build` | 7 | `RunContextService.loadConfiguration`, `NeighborhoodService.readProjectGraph`, `RunContextService.resolveProjectGraphPath`, `NeighborhoodService.readProjects`, `RunContextService.loadProjectConfigurations`, `RunContextService.resolveProjectSets`, `RunContextService.resolveEnabledGraphTypes` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:204` |
| `BoundaryCheckService.run` | 6 | `BoundaryCheckService.graphTypeForLevel`, `BoundaryCheckService.rulesForLevel`, `BoundaryCheckService.runLevel`, `BoundaryCheckService.judge`, `BoundaryCheckService.flatMap(…)`, `BoundaryCheckService.flatMap(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:289` |
| `BoundaryOutcomeReportService.renderMarkdown` | 6 | `BoundaryOutcomeReportService.findWorkspaceFailures`, `BoundaryOutcomeReportService.flatMap(…)`, `BoundaryOutcomeReportService.flatMap(…)`, `BoundaryOutcomeReportService.findProjectFailures`, `BoundaryOutcomeReportService.renderWorkspaceGroup`, `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:214` |

<details>
<summary>84 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `BoundariesService.evaluateAccessRule` | 5 | `BoundariesService.indexNodes`, `BoundariesService.judgesEdge`, `BoundariesService.resolveNode`, `BoundarySelectorService.matches`, `BoundariesService.buildAccessViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:117` |
| `BoundaryCheckService.runNxLevel` | 5 | `BoundaryGraphService.buildNxGraph`, `WorkspaceGraphService.buildWorkspaceGraph`, `BoundariesService.evaluate`, `BoundaryFailureService.collect`, `BoundaryCheckService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:182` |
| `BoundaryOutcomeReportService.renderProjectGroup` | 5 | `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.filter(…)`, `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.filter(…)`, `BoundaryOutcomeReportService.findProjectFailures` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:110` |
| `BoundariesService.evaluateAcyclicRule` | 4 | `BoundariesService.indexNodes`, `BoundarySelectorService.selectIds`, `BoundaryCyclesService.findCycles`, `BoundariesService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:153` |
| `BoundaryFailureService.resolveOwnerProject` | 4 | `NeighborhoodService.resolveDependencyClosure`, `BoundaryFailureService.filter(…)`, `BoundaryFailureService.readFramePath`, `BoundaryFailureService.findProjectHolding` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:103` |
| `BoundarySelectorService.selectIds` | 3 | `BoundarySelectorService.map(…)`, `BoundarySelectorService.map(…)`, `BoundarySelectorService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:85` |
| `BoundariesService.map(…)` | 3 | `BoundariesService.buildMessage`, `describeCycle`, `BoundariesService.chargeProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:165` |
| `BoundaryCheckService.judge` | 3 | `BoundaryCheckService.map(…)`, `BoundaryCheckService.map(…)`, `BoundaryCheckService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:86` |
| `BoundaryCheckService.buildGraph` | 3 | `BoundaryGraphService.buildNestjsGraph`, `ModuleGraphService.buildGraph`, `NestjsProjectService.exploreProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:163` |
| `BoundaryCheckService.buildGraph` | 3 | `BoundaryGraphService.buildTypescriptImportGraph`, `TypescriptService.buildGraph`, `TypescriptService.buildProgram` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:269` |
| `RunContextService.resolveBuildProjects` | 3 | `NeighborhoodService.resolveDependencyClosure`, `RunContextService.map(…)`, `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:109` |
| `RunContextService.resolveProjectSets` | 3 | `RunContextService.selectProjects`, `emptySelectionError`, `RunContextService.resolveBuildProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:159` |
| `BoundaryCyclesService.findCycles` | 2 | `BoundaryCyclesService.buildAdjacency`, `BoundaryCyclesService.walk` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-cycles.service.ts:109` |
| `BoundarySelectorService.matches` | 2 | `BoundarySelectorService.matchesGlobs`, `BoundarySelectorService.matchesTags` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:69` |
| `BoundariesService.buildAccessViolation` | 2 | `BoundariesService.buildMessage`, `BoundariesService.chargeProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:49` |
| `BoundariesService.chargeProjects` | 2 | `BoundariesService.map(…)`, `BoundariesService.toSorted(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:96` |
| `BoundariesService.flatMap(…)` | 2 | `BoundariesService.evaluateAcyclicRule`, `BoundariesService.evaluateAccessRule` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:215` |
| `BoundaryFailureService.findProjectHolding` | 2 | `BoundaryFailureService.filter(…)`, `BoundaryFailureService.toSorted(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:39` |
| `BoundaryGraphService.buildNxGraph` | 2 | `BoundaryGraphService.map(…)`, `BoundaryGraphService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:83` |
| `BoundaryCheckService.runNestjsLevel` | 2 | `BoundaryCheckService.runProjectLevel`, `NestjsProjectService.discoverProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:159` |
| `BoundaryCheckService.runProjectLevel` | 2 | `BoundariesService.evaluate`, `BoundaryFailureService.collect` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:220` |
| `BoundaryCheckService.runPythonImportsLevel` | 2 | `BoundaryCheckService.runProjectLevel`, `PythonService.discoverProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:251` |
| `BoundaryCheckService.buildGraph` | 2 | `BoundaryGraphService.buildPythonImportGraph`, `PythonService.buildGraph` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:255` |
| `BoundaryCheckService.runTypescriptImportsLevel` | 2 | `BoundaryCheckService.runProjectLevel`, `TypescriptService.discoverProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:265` |
| `BoundaryOutcomeReportService.map(…)` | 2 | `BoundaryOutcomeReportService.renderBullet`, `BoundaryOutcomeReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:118` |
| `BoundaryOutcomeReportService.map(…)` | 2 | `BoundaryOutcomeReportService.renderBullet`, `BoundaryOutcomeReportService.renderFailure` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:123` |
| `BoundaryOutcomeReportService.renderWorkspaceGroup` | 2 | `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.findWorkspaceFailures` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:154` |
| `BoundaryOutcomeReportService.map(…)` | 2 | `BoundaryOutcomeReportService.renderBullet`, `BoundaryOutcomeReportService.renderFailure` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:155` |
| `BoundaryOutcomeReportService.buildReport` | 2 | `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:171` |
| `RunContextService.findUnmatchedSelection` | 2 | `RunContextService.filter(…)`, `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:251` |
| `BoundaryCyclesService.recordCycle` | 1 | `BoundaryCyclesService.buildCycleKey` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-cycles.service.ts:60` |
| `BoundaryCyclesService.walk` | 1 | `BoundaryCyclesService.recordCycle` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-cycles.service.ts:78` |
| `BoundarySelectorService.matchesGlobs` | 1 | `BoundarySelectorService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:28` |
| `BoundarySelectorService.matchesTags` | 1 | `BoundarySelectorService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:46` |
| `BoundarySelectorService.some(…)` | 1 | `BoundarySelectorService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:58` |
| `BoundarySelectorService.filter(…)` | 1 | `BoundarySelectorService.matches` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:95` |
| `BoundariesService.map(…)` | 1 | `BoundariesService.resolveNode` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:103` |
| `BoundariesService.indexNodes` | 1 | `BoundariesService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:181` |
| `BoundariesService.evaluate` | 1 | `BoundariesService.flatMap(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:214` |
| `BoundaryReportService.describeCharge` | 1 | `BoundaryReportService.isChargedToEveryProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:27` |
| `BoundaryReportService.isChargedToEveryProject` | 1 | `BoundaryReportService.every(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:49` |
| `BoundaryReportService.renderNotes` | 1 | `BoundaryReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:66` |
| `BoundaryReportService.map(…)` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:67` |
| `BoundaryReportService.renderSummary` | 1 | `BoundaryReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:75` |
| `BoundaryReportService.renderViolation` | 1 | `BoundaryReportService.describeCharge` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:90` |
| `BoundaryReportService.renderViolations` | 1 | `BoundaryReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:108` |
| `BoundaryReportService.map(…)` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:109` |
| `BoundaryFailureService.readFramePath` | 1 | `BoundaryFailureService.readFrameLocation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:83` |
| `BoundaryFailureService.collect` | 1 | `BoundaryFailureService.resolveOwnerProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:138` |
| `BoundaryGraphService.buildFileNodes` | 1 | `BoundaryGraphService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:34` |
| `BoundaryGraphService.buildNestjsGraph` | 1 | `BoundaryGraphService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:66` |
| `BoundaryGraphService.map(…)` | 1 | `BoundaryGraphService.resolveProjectRoot` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:96` |
| `BoundaryGraphService.buildPythonImportGraph` | 1 | `BoundaryGraphService.buildFileNodes` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:110` |
| `BoundaryGraphService.buildTypescriptImportGraph` | 1 | `BoundaryGraphService.buildFileNodes` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:123` |
| `BoundaryCheckService.map(…)` | 1 | `BoundaryCheckService.resolveVerdict` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:95` |
| `BoundaryCheckService.map(…)` | 1 | `BoundaryCheckService.resolveVerdict` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:99` |
| `BoundaryCheckService.resolveVerdict` | 1 | `BoundaryCheckService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:107` |
| `BoundaryCheckService.nestjsModules` | 1 | `BoundaryCheckService.runNestjsLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:146` |
| `BoundaryCheckService.nxProjects` | 1 | `BoundaryCheckService.runNxLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:148` |
| `BoundaryCheckService.python` | 1 | `BoundaryCheckService.runPythonImportsLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:149` |
| `BoundaryCheckService.typescript` | 1 | `BoundaryCheckService.runTypescriptImportsLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:151` |
| `BoundaryOutcomeReportService.findProjectFailures` | 1 | `BoundaryOutcomeReportService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:37` |
| `BoundaryOutcomeReportService.filter(…)` | 1 | `BoundaryOutcomeReportService.isWorkspaceWide` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:41` |
| `BoundaryOutcomeReportService.findWorkspaceFailures` | 1 | `BoundaryOutcomeReportService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:46` |
| `BoundaryOutcomeReportService.filter(…)` | 1 | `BoundaryOutcomeReportService.isWorkspaceWide` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:49` |
| `BoundaryOutcomeReportService.isWorkspaceWide` | 1 | `BoundaryReportService.isChargedToEveryProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:55` |
| `BoundaryOutcomeReportService.renderBullet` | 1 | `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:69` |
| `BoundaryOutcomeReportService.renderFailure` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:85` |
| `BoundaryOutcomeReportService.renderViolation` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:138` |
| `BoundaryOutcomeReportService.renderFailures` | 1 | `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:201` |
| `BoundaryOutcomeReportService.map(…)` | 1 | `BoundaryOutcomeReportService.renderFailure` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:205` |
| `BoundaryOutcomeReportService.map(…)` | 1 | `BoundaryOutcomeReportService.renderProjectGroup` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:239` |
| `emptySelectionError` | 1 | `InputError.constructor` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.constants.ts:8` |
| `RunContextService.isSelectedBy` | 1 | `ConfigurationService.isProjectSelected` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:45` |
| `RunContextService.loadConfiguration` | 1 | `ConfigurationService.loadConfiguration` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:65` |
| `RunContextService.loadProjectConfigurations` | 1 | `RunContextService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:85` |
| `RunContextService.map(…)` | 1 | `ConfigurationService.loadProjectConfiguration` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:91` |
| `RunContextService.resolveEnabledGraphTypes` | 1 | `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:133` |
| `RunContextService.selectProjects` | 1 | `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:185` |
| `RunContextService.filter(…)` | 1 | `RunContextService.isSelectedBy` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:190` |
| `RunContextService.matches` | 1 | `RunContextService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:258` |
| `RunContextService.some(…)` | 1 | `RunContextService.isSelectedBy` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:262` |
| `RunContextService.filter(…)` | 1 | `RunContextService.matches` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:275` |
| `RunContextService.filter(…)` | 1 | `RunContextService.matches` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:278` |

</details>
<!-- callidescope:end -->
