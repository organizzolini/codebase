<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-file-imports`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 100 |
| Files | 27 |
| Calls traced | 100 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TypescriptImportGraphService.buildGraph` | 8 | `TypescriptImportGraphService.resolveOwnedFileNames`, `TypescriptImportGraphService.listOwnedSourceFileNames`, `TypescriptImportGraphService.dedupeEdges`, `TypescriptImportGraphService.flatMap(…)`, `TypescriptImportGraphService.flatMap(…)`, `TypescriptImportGraphService.toSorted(…)`, `TypescriptImportGraphService.map(…)`, `TypescriptImportGraphService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:185` |
| `PythonImportGraphService.buildGraph` | 7 | `PythonProjectService.listSourceFileNames`, `PythonImportGraphService.dedupeEdges`, `PythonImportGraphService.flatMap(…)`, `PythonImportGraphService.flatMap(…)`, `PythonImportGraphService.toSorted(…)`, `PythonImportGraphService.map(…)`, `PythonImportGraphService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:180` |
| `FileImportsWorkspaceGraphService.buildWorkspaceGraph` | 4 | `FileImportsWorkspaceGraphService.sortNames`, `FileImportsWorkspaceGraphService.flatMap(…)`, `FileImportsWorkspaceGraphService.toSorted(…)`, `FileImportsWorkspaceGraphService.flatMap(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:84` |

<details>
<summary>53 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PythonImportParserService.parseImportStatement` | 3 | `PythonImportParserService.map(…)`, `PythonImportParserService.filter(…)`, `PythonImportParserService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:105` |
| `PythonImportParserService.parseImportSpecifiers` | 3 | `PythonImportParserService.isTopLevelImportStart`, `PythonImportParserService.collectStatement`, `PythonImportParserService.parseStatement` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:158` |
| `PythonImportGraphService.collectEdgesForFile` | 3 | `PythonImportParserService.parseImportSpecifiers`, `PythonImportGraphService.resolveSpecifierPath`, `PythonImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:64` |
| `TypescriptProjectService.parseConfiguration` | 3 | `TypescriptProjectService.readJsonConfigFile(…)`, `TypescriptProjectConfigurationError.constructor`, `TypescriptProjectService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:51` |
| `TypescriptImportGraphService.listOwnedSourceFileNames` | 3 | `TypescriptImportGraphService.toSorted(…)`, `TypescriptImportGraphService.filter(…)`, `TypescriptImportGraphService.resolveOwnedFileNames` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:122` |
| `FileImportsWorkspaceGraphService.renderMermaid` | 2 | `FileImportsWorkspaceGraphService.map(…)`, `FileImportsWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:109` |
| `PythonImportParserService.collectStatement` | 2 | `PythonImportParserService.stripComment`, `PythonImportParserService.countCharacter` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:42` |
| `PythonImportParserService.isTopLevelImportStart` | 2 | `PythonImportParserService.measureIndent`, `PythonImportParserService.stripComment` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:79` |
| `PythonImportParserService.parseStatement` | 2 | `PythonImportParserService.parseFromStatement`, `PythonImportParserService.parseImportStatement` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-parser.service.ts:126` |
| `PythonProjectService.discoverProjects` | 2 | `PythonProjectService.map(…)`, `PythonProjectService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:69` |
| `PythonProjectService.listSourceFileNames` | 2 | `PythonProjectService.toSorted(…)`, `PythonProjectService.listSourceFilesInDirectory` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:85` |
| `PythonImportGraphService.renderMermaid` | 2 | `PythonImportGraphService.map(…)`, `PythonImportGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:207` |
| `TypescriptProjectService.discoverProjects` | 2 | `TypescriptProjectService.map(…)`, `TypescriptProjectService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:107` |
| `TypescriptImportGraphService.collectEdgesForFile` | 2 | `TypescriptImportGraphService.resolveImportTarget`, `TypescriptImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:49` |
| `TypescriptImportGraphService.renderMermaid` | 2 | `TypescriptImportGraphService.map(…)`, `TypescriptImportGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:215` |
| `FileImportsWorkspaceGraphService.renderNode` | 1 | `FileImportsWorkspaceGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:64` |
| `FileImportsWorkspaceGraphService.sortNames` | 1 | `FileImportsWorkspaceGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:69` |
| `FileImportsWorkspaceGraphService.flatMap(…)` | 1 | `FileImportsWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:90` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.qualifyFileName` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:91` |
| `FileImportsWorkspaceGraphService.flatMap(…)` | 1 | `FileImportsWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:97` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.qualifyFileName` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:98` |
| `FileImportsWorkspaceGraphService.toSorted(…)` | 1 | `FileImportsWorkspaceGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:103` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.renderNode` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:117` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:119` |
| `PythonProjectService.filter(…)` | 1 | `PythonProjectService.isPythonProject` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:73` |
| `PythonProjectService.map(…)` | 1 | `PythonProjectService.describeProject` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:74` |
| `PythonImportGraphService.dedupeEdges` | 1 | `PythonImportGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:107` |
| `PythonImportGraphService.toSorted(…)` | 1 | `PythonImportGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:114` |
| `PythonImportGraphService.renderNode` | 1 | `PythonImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:120` |
| `PythonImportGraphService.resolveSpecifierPath` | 1 | `PythonImportGraphService.ascendDirectories` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:133` |
| `PythonImportGraphService.flatMap(…)` | 1 | `PythonImportGraphService.collectEdgesForFile` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:185` |
| `PythonImportGraphService.map(…)` | 1 | `PythonImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:193` |
| `PythonImportGraphService.map(…)` | 1 | `PythonImportGraphService.renderNode` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:215` |
| `PythonImportGraphService.map(…)` | 1 | `PythonImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:217` |
| `PythonService.buildGraph` | 1 | `PythonImportGraphService.buildGraph` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:39` |
| `PythonService.discoverProjects` | 1 | `PythonProjectService.discoverProjects` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:47` |
| `PythonService.renderMermaid` | 1 | `PythonImportGraphService.renderMermaid` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:54` |
| `TypescriptProjectService.buildProgram` | 1 | `TypescriptProjectService.parseConfiguration` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:78` |
| `TypescriptProjectService.map(…)` | 1 | `TypescriptProjectService.describeProject` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:116` |
| `TypescriptImportGraphService.dedupeEdges` | 1 | `TypescriptImportGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:100` |
| `TypescriptImportGraphService.toSorted(…)` | 1 | `TypescriptImportGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:109` |
| `TypescriptImportGraphService.renderNode` | 1 | `TypescriptImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:131` |
| `TypescriptImportGraphService.resolveImportTarget` | 1 | `TypescriptProjectService.toRealPath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:136` |
| `TypescriptImportGraphService.resolveOwnedFileNames` | 1 | `TypescriptImportGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:156` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptProjectService.toRealPath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:162` |
| `TypescriptImportGraphService.flatMap(…)` | 1 | `TypescriptImportGraphService.collectEdgesForFile` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:189` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:201` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptImportGraphService.renderNode` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:223` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:225` |
| `TypescriptService.buildGraph` | 1 | `TypescriptImportGraphService.buildGraph` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:44` |
| `TypescriptService.buildProgram` | 1 | `TypescriptProjectService.buildProgram` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:49` |
| `TypescriptService.discoverProjects` | 1 | `TypescriptProjectService.discoverProjects` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:57` |
| `TypescriptService.renderMermaid` | 1 | `TypescriptImportGraphService.renderMermaid` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:64` |

</details>
<!-- callidescope:end -->
