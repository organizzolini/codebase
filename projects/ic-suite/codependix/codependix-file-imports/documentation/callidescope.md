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
| `TypescriptImportGraphService.buildGraph` | 8 | `TypescriptImportGraphService.resolveOwnedFileNames`, `TypescriptImportGraphService.listOwnedSourceFileNames`, `TypescriptImportGraphService.dedupeEdges`, `TypescriptImportGraphService.flatMap(…)`, `TypescriptImportGraphService.flatMap(…)`, `TypescriptImportGraphService.toSorted(…)`, `TypescriptImportGraphService.map(…)`, `TypescriptImportGraphService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:174` |
| `PythonImportGraphService.buildGraph` | 7 | `PythonProjectService.listSourceFileNames`, `PythonImportGraphService.dedupeEdges`, `PythonImportGraphService.flatMap(…)`, `PythonImportGraphService.flatMap(…)`, `PythonImportGraphService.toSorted(…)`, `PythonImportGraphService.map(…)`, `PythonImportGraphService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:167` |
| `FileImportsWorkspaceGraphService.buildWorkspaceGraph` | 4 | `FileImportsWorkspaceGraphService.sortNames`, `FileImportsWorkspaceGraphService.flatMap(…)`, `FileImportsWorkspaceGraphService.toSorted(…)`, `FileImportsWorkspaceGraphService.flatMap(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:70` |

<details>
<summary>53 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PythonImportParserService.parseImportStatement` | 3 | `PythonImportParserService.map(…)`, `PythonImportParserService.filter(…)`, `PythonImportParserService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:97` |
| `PythonImportParserService.parseImportSpecifiers` | 3 | `PythonImportParserService.isTopLevelImportStart`, `PythonImportParserService.collectStatement`, `PythonImportParserService.parseStatement` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:150` |
| `PythonImportGraphService.collectEdgesForFile` | 3 | `PythonImportParserService.parseImportSpecifiers`, `PythonImportGraphService.resolveSpecifierPath`, `PythonImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:56` |
| `TypescriptProjectService.parseConfiguration` | 3 | `TypescriptProjectService.readJsonConfigFile(…)`, `TypescriptProjectConfigurationError.constructor`, `TypescriptProjectService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:36` |
| `TypescriptImportGraphService.listOwnedSourceFileNames` | 3 | `TypescriptImportGraphService.toSorted(…)`, `TypescriptImportGraphService.filter(…)`, `TypescriptImportGraphService.resolveOwnedFileNames` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:111` |
| `FileImportsWorkspaceGraphService.renderMermaid` | 2 | `FileImportsWorkspaceGraphService.map(…)`, `FileImportsWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:95` |
| `PythonImportParserService.collectStatement` | 2 | `PythonImportParserService.stripComment`, `PythonImportParserService.countCharacter` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:34` |
| `PythonImportParserService.isTopLevelImportStart` | 2 | `PythonImportParserService.measureIndent`, `PythonImportParserService.stripComment` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:71` |
| `PythonImportParserService.parseStatement` | 2 | `PythonImportParserService.parseFromStatement`, `PythonImportParserService.parseImportStatement` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/modules/import-parser/python-import-parser.service.ts:118` |
| `PythonProjectService.discoverProjects` | 2 | `PythonProjectService.map(…)`, `PythonProjectService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:59` |
| `PythonProjectService.listSourceFileNames` | 2 | `PythonProjectService.toSorted(…)`, `PythonProjectService.listSourceFilesInDirectory` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:75` |
| `PythonImportGraphService.renderMermaid` | 2 | `PythonImportGraphService.map(…)`, `PythonImportGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:194` |
| `TypescriptProjectService.discoverProjects` | 2 | `TypescriptProjectService.map(…)`, `TypescriptProjectService.filter(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:92` |
| `TypescriptImportGraphService.collectEdgesForFile` | 2 | `TypescriptImportGraphService.resolveImportTarget`, `TypescriptImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:42` |
| `TypescriptImportGraphService.renderMermaid` | 2 | `TypescriptImportGraphService.map(…)`, `TypescriptImportGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:204` |
| `FileImportsWorkspaceGraphService.renderNode` | 1 | `FileImportsWorkspaceGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:50` |
| `FileImportsWorkspaceGraphService.sortNames` | 1 | `FileImportsWorkspaceGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:55` |
| `FileImportsWorkspaceGraphService.flatMap(…)` | 1 | `FileImportsWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:76` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.qualifyFileName` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:77` |
| `FileImportsWorkspaceGraphService.flatMap(…)` | 1 | `FileImportsWorkspaceGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:83` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.qualifyFileName` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:84` |
| `FileImportsWorkspaceGraphService.toSorted(…)` | 1 | `FileImportsWorkspaceGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:89` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.renderNode` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:103` |
| `FileImportsWorkspaceGraphService.map(…)` | 1 | `FileImportsWorkspaceGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/file-imports-workspace-graph/file-imports-workspace-graph.service.ts:105` |
| `PythonProjectService.filter(…)` | 1 | `PythonProjectService.isPythonProject` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:63` |
| `PythonProjectService.map(…)` | 1 | `PythonProjectService.describeProject` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-project.service.ts:64` |
| `PythonImportGraphService.dedupeEdges` | 1 | `PythonImportGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:99` |
| `PythonImportGraphService.toSorted(…)` | 1 | `PythonImportGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:106` |
| `PythonImportGraphService.renderNode` | 1 | `PythonImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:112` |
| `PythonImportGraphService.resolveSpecifierPath` | 1 | `PythonImportGraphService.ascendDirectories` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:120` |
| `PythonImportGraphService.flatMap(…)` | 1 | `PythonImportGraphService.collectEdgesForFile` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:172` |
| `PythonImportGraphService.map(…)` | 1 | `PythonImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:180` |
| `PythonImportGraphService.map(…)` | 1 | `PythonImportGraphService.renderNode` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:202` |
| `PythonImportGraphService.map(…)` | 1 | `PythonImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python-import-graph.service.ts:204` |
| `PythonService.buildGraph` | 1 | `PythonImportGraphService.buildGraph` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:33` |
| `PythonService.discoverProjects` | 1 | `PythonProjectService.discoverProjects` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:41` |
| `PythonService.renderMermaid` | 1 | `PythonImportGraphService.renderMermaid` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/python/python.service.ts:48` |
| `TypescriptProjectService.buildProgram` | 1 | `TypescriptProjectService.parseConfiguration` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:63` |
| `TypescriptProjectService.map(…)` | 1 | `TypescriptProjectService.describeProject` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-project.service.ts:100` |
| `TypescriptImportGraphService.dedupeEdges` | 1 | `TypescriptImportGraphService.toSorted(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:93` |
| `TypescriptImportGraphService.toSorted(…)` | 1 | `TypescriptImportGraphService.compareEdges` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:102` |
| `TypescriptImportGraphService.renderNode` | 1 | `TypescriptImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:120` |
| `TypescriptImportGraphService.resolveImportTarget` | 1 | `TypescriptProjectService.toRealPath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:125` |
| `TypescriptImportGraphService.resolveOwnedFileNames` | 1 | `TypescriptImportGraphService.map(…)` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:145` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptProjectService.toRealPath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:151` |
| `TypescriptImportGraphService.flatMap(…)` | 1 | `TypescriptImportGraphService.collectEdgesForFile` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:178` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptImportGraphService.toRelativePath` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:190` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptImportGraphService.renderNode` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:212` |
| `TypescriptImportGraphService.map(…)` | 1 | `TypescriptImportGraphService.toNodeIdentifier` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript-import-graph.service.ts:214` |
| `TypescriptService.buildGraph` | 1 | `TypescriptImportGraphService.buildGraph` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:37` |
| `TypescriptService.buildProgram` | 1 | `TypescriptProjectService.buildProgram` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:42` |
| `TypescriptService.discoverProjects` | 1 | `TypescriptProjectService.discoverProjects` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:50` |
| `TypescriptService.renderMermaid` | 1 | `TypescriptImportGraphService.renderMermaid` | `projects/ic-suite/codependix/codependix-file-imports/src/modules/typescript/typescript.service.ts:61` |

</details>
<!-- callidescope:end -->
