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
🚀 BoundaryCheckService.nestjsModules(levelArguments: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:170]
  └─> BoundaryCheckService.runNestjsLevel(args: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:183]
     ↳ Judges every `framework:nestjs` project's module graph.
    └─> BoundaryCheckService.runProjectLevel(…): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:254]
       ↳ Judges every project in the build set at one level, isolating each project's failure.
      └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:258]
         ↳ Every violation one graph's rules report, in the order the rules were declared.
        └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:259]
          └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:174]
             ↳ Reports every cycle an `acyclic` rule's selected nodes still form, each charged to every project owning a node on it:…
            └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:106]
               ↳ The ids of every node a selector claims.
              └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:116]
                └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:86]
                   ↳ Whether a selector claims a node.
                  └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
                     ↳ Whether a node carries a tag matching one of a list of globs.
                    └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:71]
                      └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:72]
```

**2. `BoundaryCheckService.python`** — depth ≥ 12 · orphan-root

```text
🚀 BoundaryCheckService.python(levelArguments: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:173]
  └─> BoundaryCheckService.runPythonImportsLevel(args: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:285]
     ↳ Judges every `language:python` project's file-level import graph.
    └─> BoundaryCheckService.runProjectLevel(…): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:254]
       ↳ Judges every project in the build set at one level, isolating each project's failure.
      └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:258]
         ↳ Every violation one graph's rules report, in the order the rules were declared.
        └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:259]
          └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:174]
             ↳ Reports every cycle an `acyclic` rule's selected nodes still form, each charged to every project owning a node on it:…
            └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:106]
               ↳ The ids of every node a selector claims.
              └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:116]
                └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:86]
                   ↳ Whether a selector claims a node.
                  └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
                     ↳ Whether a node carries a tag matching one of a list of globs.
                    └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:71]
                      └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:72]
```

**3. `BoundaryCheckService.typescript`** — depth ≥ 12 · orphan-root

```text
🚀 BoundaryCheckService.typescript(levelArguments: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:175]
  └─> BoundaryCheckService.runTypescriptImportsLevel(args: LevelCheckArguments): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:299]
     ↳ Judges every TypeScript project's file-level import graph.
    └─> BoundaryCheckService.runProjectLevel(…): Promise<BoundaryLevelOutcome> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:254]
       ↳ Judges every project in the build set at one level, isolating each project's failure.
      └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:258]
         ↳ Every violation one graph's rules report, in the order the rules were declared.
        └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:259]
          └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:174]
             ↳ Reports every cycle an `acyclic` rule's selected nodes still form, each charged to every project owning a node on it:…
            └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:106]
               ↳ The ids of every node a selector claims.
              └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:116]
                └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:86]
                   ↳ Whether a selector claims a node.
                  └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
                     ↳ Whether a node carries a tag matching one of a list of globs.
                    └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:71]
                      └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:72]
```

<details>
<summary>4 more call stacks</summary>

**4. `BoundaryCheckService.nxProjects`** — depth 11 · orphan-root

```text
🚀 BoundaryCheckService.nxProjects(levelArguments: LevelCheckArguments): BoundaryLevelOutcome [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:172]
  └─> BoundaryCheckService.runNxLevel(args: LevelCheckArguments): BoundaryLevelOutcome [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:209]
     ↳ Judges the whole-workspace Nx project graph, drawn over the build set so no edge from a judged project into a…
    └─> BoundariesService.evaluate(args: EvaluateBoundariesArguments): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:258]
       ↳ Every violation one graph's rules report, in the order the rules were declared.
      └─> BoundariesService.flatMap(…)(this: undefined, rule: CodependixBoundaryRule): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:259]
        └─> BoundariesService.evaluateAcyclicRule(…): BoundaryViolation[] [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:174]
           ↳ Reports every cycle an `acyclic` rule's selected nodes still form, each charged to every project owning a node on it:…
          └─> BoundarySelectorService.selectIds(…): Set<string> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:106]
             ↳ The ids of every node a selector claims.
            └─> BoundarySelectorService.filter(…)(node: BoundaryNode): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:116]
              └─> BoundarySelectorService.matches(node: BoundaryNode, selector: CodependixBoundarySelector): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:86]
                 ↳ Whether a selector claims a node.
                └─> BoundarySelectorService.matchesTags(…): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59]
                   ↳ Whether a node carries a tag matching one of a list of globs.
                  └─> BoundarySelectorService.some(…)(glob: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:71]
                    └─> BoundarySelectorService.some(…)(tag: string): boolean [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:72]
```

**5. `BoundaryCheckService.buildGraph`** — depth 9 · orphan-root

```text
🚀 BoundaryCheckService.buildGraph(project: PythonProject): BoundaryGraph [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:289]
  └─> PythonService.buildGraph(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:39]
     ↳ Builds a Python project's internal file-level import Graph.
    └─> PythonImportGraphService.buildGraph(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:180]
       ↳ Builds a Python project's internal file-level import Graph.
      └─> PythonImportGraphService.flatMap(…)(this: undefined, sourceFileName: string): PythonImportGraphEdge[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:185]
        └─> PythonImportGraphService.collectEdgesForFile(…): PythonImportGraphEdge[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:64]
           ↳ Collects every internal import edge one source file declares.
          └─> PythonImportParserService.parseImportSpecifiers(source: string): PythonImportSpecifier[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:158]
             ↳ Parses every module-level import statement in a Python source file.
            └─> PythonImportParserService.parseStatement(statement: string): PythonImportSpecifier[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:126]
               ↳ Parses one joined statement into the module(s) it names.
              └─> PythonImportParserService.parseImportStatement(statement: string): PythonImportSpecifier[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:105]
                 ↳ Parses a joined `import <specifiers>` statement.
                └─> PythonImportParserService.map(…)(modulePath: string): { level: number; modulePath: string; } [projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:122]
```

**6. `BoundaryCheckService.buildGraph`** — depth ≥ 7 · orphan-root

```text
🚀 BoundaryCheckService.buildGraph(project: TypescriptProject): BoundaryGraph [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:303]
  └─> TypescriptService.buildGraph(projectProgram: TypescriptProjectProgram): TypescriptImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:44]
     ↳ Builds a project's internal file-level import Graph from its program.
    └─> TypescriptImportGraphService.buildGraph(projectProgram: TypescriptProjectProgram): TypescriptImportGraph [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:185]
       ↳ Builds a project's internal file-level import Graph from its program.
      └─> TypescriptImportGraphService.listOwnedSourceFileNames(projectProgram: TypescriptProjectProgram): string[] [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:122]
         ↳ Lists a program's own source files, excluding declaration files. `program.getRootFileNames()` is the same file list…
        └─> TypescriptImportGraphService.resolveOwnedFileNames(projectProgram: TypescriptProjectProgram): Set<string> [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:156]
           ↳ Resolves the real, absolute file names a program owns.
          └─> TypescriptImportGraphService.map(…)(fileName: string): string [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:162]
            └─> TypescriptProjectService.toRealPath(filePath: string): string [projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:122]
               ↳ Resolves a path through symlinks, which is how pnpm workspaces link.
```

**7. `BoundaryCheckService.buildGraph`** — depth ≥ 5 · orphan-root

```text
🚀 BoundaryCheckService.buildGraph(project: NestjsProject): Promise<BoundaryGraph> [projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:187]
  └─> ModuleGraphService.buildGraph(tree: NestjsExploredModule[], projectName: string): NestjsModuleGraph [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:168]
     ↳ Reduces an explored container to a Graph of its module imports.
    └─> ModuleGraphService.collectEdgesAndNodes(…): { connectedModuleNames: Set<string>; edges: NestjsModuleGraphEdge[]; nodes: NestjsModuleGraphNode[]; } [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:49]
       ↳ Walks the tree into the edges worth drawing and the nodes they touch.
      └─> ModuleGraphService.addNode(name: string, declaringFile: string): void [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:61]
        └─> ModuleGraphService.some(…)(node: NestjsModuleGraphNode): boolean [projects/ic-suite/codependix/codependix-nestjs-modules/src/modules/module-graph/module-graph.service.ts:64]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `RunContextService.build` | 7 | `RunContextService.loadConfiguration`, `NeighborhoodService.readProjectGraph`, `RunContextService.resolveProjectGraphPath`, `NeighborhoodService.readProjects`, `RunContextService.loadProjectConfigurations`, `RunContextService.resolveProjectSets`, `RunContextService.resolveEnabledGraphTypes` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:246` |
| `BoundaryCheckService.run` | 6 | `BoundaryCheckService.graphTypeForLevel`, `BoundaryCheckService.rulesForLevel`, `BoundaryCheckService.runLevel`, `BoundaryCheckService.judge`, `BoundaryCheckService.flatMap(…)`, `BoundaryCheckService.flatMap(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:330` |
| `BoundaryOutcomeReportService.renderMarkdown` | 6 | `BoundaryOutcomeReportService.findWorkspaceFailures`, `BoundaryOutcomeReportService.flatMap(…)`, `BoundaryOutcomeReportService.flatMap(…)`, `BoundaryOutcomeReportService.findProjectFailures`, `BoundaryOutcomeReportService.renderWorkspaceGroup`, `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:240` |

<details>
<summary>84 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `BoundariesService.evaluateAccessRule` | 5 | `BoundariesService.indexNodes`, `BoundariesService.judgesEdge`, `BoundariesService.resolveNode`, `BoundarySelectorService.matches`, `BoundariesService.buildAccessViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:137` |
| `BoundaryCheckService.runNxLevel` | 5 | `BoundaryGraphService.buildNxGraph`, `WorkspaceGraphService.buildWorkspaceGraph`, `BoundariesService.evaluate`, `BoundaryFailureService.collect`, `BoundaryCheckService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:209` |
| `BoundaryOutcomeReportService.renderProjectGroup` | 5 | `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.filter(…)`, `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.filter(…)`, `BoundaryOutcomeReportService.findProjectFailures` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:122` |
| `BoundariesService.evaluateAcyclicRule` | 4 | `BoundariesService.indexNodes`, `BoundarySelectorService.selectIds`, `BoundaryCyclesService.findCycles`, `BoundariesService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:174` |
| `BoundaryFailureService.resolveOwnerProject` | 4 | `NeighborhoodService.resolveDependencyClosure`, `BoundaryFailureService.filter(…)`, `BoundaryFailureService.readFramePath`, `BoundaryFailureService.findProjectHolding` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:127` |
| `BoundarySelectorService.selectIds` | 3 | `BoundarySelectorService.map(…)`, `BoundarySelectorService.map(…)`, `BoundarySelectorService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:106` |
| `BoundariesService.map(…)` | 3 | `BoundariesService.buildMessage`, `describeCycle`, `BoundariesService.chargeProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:186` |
| `BoundaryCheckService.judge` | 3 | `BoundaryCheckService.map(…)`, `BoundaryCheckService.map(…)`, `BoundaryCheckService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:101` |
| `BoundaryCheckService.buildGraph` | 3 | `BoundaryGraphService.buildNestjsGraph`, `ModuleGraphService.buildGraph`, `NestjsProjectService.exploreProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:187` |
| `BoundaryCheckService.buildGraph` | 3 | `BoundaryGraphService.buildTypescriptImportGraph`, `TypescriptService.buildGraph`, `TypescriptService.buildProgram` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:303` |
| `RunContextService.resolveBuildProjects` | 3 | `NeighborhoodService.resolveDependencyClosure`, `RunContextService.map(…)`, `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:128` |
| `RunContextService.resolveProjectSets` | 3 | `RunContextService.selectProjects`, `emptySelectionError`, `RunContextService.resolveBuildProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:191` |
| `BoundaryCyclesService.findCycles` | 2 | `BoundaryCyclesService.buildAdjacency`, `BoundaryCyclesService.walk` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-cycles.service.ts:127` |
| `BoundarySelectorService.matches` | 2 | `BoundarySelectorService.matchesGlobs`, `BoundarySelectorService.matchesTags` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:86` |
| `BoundariesService.buildAccessViolation` | 2 | `BoundariesService.buildMessage`, `BoundariesService.chargeProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:58` |
| `BoundariesService.chargeProjects` | 2 | `BoundariesService.map(…)`, `BoundariesService.toSorted(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:113` |
| `BoundariesService.flatMap(…)` | 2 | `BoundariesService.evaluateAcyclicRule`, `BoundariesService.evaluateAccessRule` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:259` |
| `BoundaryFailureService.findProjectHolding` | 2 | `BoundaryFailureService.filter(…)`, `BoundaryFailureService.toSorted(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:51` |
| `BoundaryGraphService.buildNxGraph` | 2 | `BoundaryGraphService.map(…)`, `BoundaryGraphService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:101` |
| `BoundaryCheckService.runNestjsLevel` | 2 | `BoundaryCheckService.runProjectLevel`, `NestjsProjectService.discoverProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:183` |
| `BoundaryCheckService.runProjectLevel` | 2 | `BoundariesService.evaluate`, `BoundaryFailureService.collect` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:254` |
| `BoundaryCheckService.runPythonImportsLevel` | 2 | `BoundaryCheckService.runProjectLevel`, `PythonService.discoverProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:285` |
| `BoundaryCheckService.buildGraph` | 2 | `BoundaryGraphService.buildPythonImportGraph`, `PythonService.buildGraph` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:289` |
| `BoundaryCheckService.runTypescriptImportsLevel` | 2 | `BoundaryCheckService.runProjectLevel`, `TypescriptService.discoverProjects` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:299` |
| `BoundaryOutcomeReportService.map(…)` | 2 | `BoundaryOutcomeReportService.renderBullet`, `BoundaryOutcomeReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:130` |
| `BoundaryOutcomeReportService.map(…)` | 2 | `BoundaryOutcomeReportService.renderBullet`, `BoundaryOutcomeReportService.renderFailure` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:135` |
| `BoundaryOutcomeReportService.renderWorkspaceGroup` | 2 | `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.findWorkspaceFailures` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:166` |
| `BoundaryOutcomeReportService.map(…)` | 2 | `BoundaryOutcomeReportService.renderBullet`, `BoundaryOutcomeReportService.renderFailure` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:167` |
| `BoundaryOutcomeReportService.buildReport` | 2 | `BoundaryOutcomeReportService.map(…)`, `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:187` |
| `RunContextService.findUnmatchedSelection` | 2 | `RunContextService.filter(…)`, `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:299` |
| `BoundaryCyclesService.recordCycle` | 1 | `BoundaryCyclesService.buildCycleKey` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-cycles.service.ts:73` |
| `BoundaryCyclesService.walk` | 1 | `BoundaryCyclesService.recordCycle` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-cycles.service.ts:91` |
| `BoundarySelectorService.matchesGlobs` | 1 | `BoundarySelectorService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:37` |
| `BoundarySelectorService.matchesTags` | 1 | `BoundarySelectorService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:59` |
| `BoundarySelectorService.some(…)` | 1 | `BoundarySelectorService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:71` |
| `BoundarySelectorService.filter(…)` | 1 | `BoundarySelectorService.matches` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-selector.service.ts:116` |
| `BoundariesService.map(…)` | 1 | `BoundariesService.resolveNode` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:120` |
| `BoundariesService.indexNodes` | 1 | `BoundariesService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:202` |
| `BoundariesService.evaluate` | 1 | `BoundariesService.flatMap(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundaries.service.ts:258` |
| `BoundaryReportService.describeCharge` | 1 | `BoundaryReportService.isChargedToEveryProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:43` |
| `BoundaryReportService.isChargedToEveryProject` | 1 | `BoundaryReportService.every(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:67` |
| `BoundaryReportService.renderNotes` | 1 | `BoundaryReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:84` |
| `BoundaryReportService.map(…)` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:85` |
| `BoundaryReportService.renderSummary` | 1 | `BoundaryReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:97` |
| `BoundaryReportService.renderViolation` | 1 | `BoundaryReportService.describeCharge` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:118` |
| `BoundaryReportService.renderViolations` | 1 | `BoundaryReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:143` |
| `BoundaryReportService.map(…)` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundaries/boundary-report.service.ts:144` |
| `BoundaryFailureService.readFramePath` | 1 | `BoundaryFailureService.readFrameLocation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:102` |
| `BoundaryFailureService.collect` | 1 | `BoundaryFailureService.resolveOwnerProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-failure.service.ts:165` |
| `BoundaryGraphService.buildFileNodes` | 1 | `BoundaryGraphService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:45` |
| `BoundaryGraphService.buildNestjsGraph` | 1 | `BoundaryGraphService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:77` |
| `BoundaryGraphService.map(…)` | 1 | `BoundaryGraphService.resolveProjectRoot` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:114` |
| `BoundaryGraphService.buildPythonImportGraph` | 1 | `BoundaryGraphService.buildFileNodes` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:128` |
| `BoundaryGraphService.buildTypescriptImportGraph` | 1 | `BoundaryGraphService.buildFileNodes` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-graph.service.ts:141` |
| `BoundaryCheckService.map(…)` | 1 | `BoundaryCheckService.resolveVerdict` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:110` |
| `BoundaryCheckService.map(…)` | 1 | `BoundaryCheckService.resolveVerdict` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:114` |
| `BoundaryCheckService.resolveVerdict` | 1 | `BoundaryCheckService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:122` |
| `BoundaryCheckService.nestjsModules` | 1 | `BoundaryCheckService.runNestjsLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:170` |
| `BoundaryCheckService.nxProjects` | 1 | `BoundaryCheckService.runNxLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:172` |
| `BoundaryCheckService.python` | 1 | `BoundaryCheckService.runPythonImportsLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:173` |
| `BoundaryCheckService.typescript` | 1 | `BoundaryCheckService.runTypescriptImportsLevel` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-check.service.ts:175` |
| `BoundaryOutcomeReportService.findProjectFailures` | 1 | `BoundaryOutcomeReportService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:41` |
| `BoundaryOutcomeReportService.filter(…)` | 1 | `BoundaryOutcomeReportService.isWorkspaceWide` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:45` |
| `BoundaryOutcomeReportService.findWorkspaceFailures` | 1 | `BoundaryOutcomeReportService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:50` |
| `BoundaryOutcomeReportService.filter(…)` | 1 | `BoundaryOutcomeReportService.isWorkspaceWide` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:53` |
| `BoundaryOutcomeReportService.isWorkspaceWide` | 1 | `BoundaryReportService.isChargedToEveryProject` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:59` |
| `BoundaryOutcomeReportService.renderBullet` | 1 | `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:77` |
| `BoundaryOutcomeReportService.renderFailure` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:95` |
| `BoundaryOutcomeReportService.renderViolation` | 1 | `BoundaryReportService.renderViolation` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:150` |
| `BoundaryOutcomeReportService.renderFailures` | 1 | `BoundaryOutcomeReportService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:220` |
| `BoundaryOutcomeReportService.map(…)` | 1 | `BoundaryOutcomeReportService.renderFailure` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:224` |
| `BoundaryOutcomeReportService.map(…)` | 1 | `BoundaryOutcomeReportService.renderProjectGroup` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/boundary-check/boundary-outcome-report.service.ts:265` |
| `emptySelectionError` | 1 | `InputError.constructor` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.constants.ts:15` |
| `RunContextService.isSelectedBy` | 1 | `ConfigurationService.isProjectSelected` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:54` |
| `RunContextService.loadConfiguration` | 1 | `ConfigurationService.loadConfiguration` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:74` |
| `RunContextService.loadProjectConfigurations` | 1 | `RunContextService.map(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:99` |
| `RunContextService.map(…)` | 1 | `ConfigurationService.loadProjectConfiguration` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:104` |
| `RunContextService.resolveEnabledGraphTypes` | 1 | `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:157` |
| `RunContextService.selectProjects` | 1 | `RunContextService.filter(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:222` |
| `RunContextService.filter(…)` | 1 | `RunContextService.isSelectedBy` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:227` |
| `RunContextService.matches` | 1 | `RunContextService.some(…)` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:306` |
| `RunContextService.some(…)` | 1 | `RunContextService.isSelectedBy` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:310` |
| `RunContextService.filter(…)` | 1 | `RunContextService.matches` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:323` |
| `RunContextService.filter(…)` | 1 | `RunContextService.matches` | `projects/ic-suite/codependix/codependix-boundaries/src/modules/run-context/run-context.service.ts:326` |

</details>
<!-- callidescope:end -->
