<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 48 |
| Files | 20 |
| Calls traced | 44 |
| Call stacks | 19 |
| Deepest stack | 15 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 15 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `MapCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 MapCommand.run(_passedParameters: string[], options?: MapCommandOptions): Promise<void> [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:479]
   ↳ Runs whatever the command line asked for: exports, boundaries, or both.
  └─> MapCommand.runMode(…): Promise<void> [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:193]
     ↳ Runs the passes a resolved mode selected, and reports what they found.
    └─> MapCommand.runExports(context: GraphRunContext): Promise<MapRunResult> [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:174]
       ↳ Runs the export pass, warning when nothing was selected.
      └─> GraphRunService.run(context: GraphRunContext): Promise<MapRunResult> [projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:144]
         ↳ Runs every configured graph export against an already-resolved context.
        └─> GraphRunService.runPythonImportGraphs(context: GraphRunContext): GraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:266]
           ↳ Builds and delivers every configured Python file-level import graph export.
          └─> PythonImportsService.runGraphs(context: GraphRunContext): GraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:135]
             ↳ Builds and delivers every configured Python file-level import graph export.
            └─> PythonImportsService.runProject(…): ProjectRunResult [projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:99]
               ↳ Builds, renders, and delivers one project's Python import graph.
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

**2. `PathCommand.run`** — depth ≥ 12 · decorated-method

```text
🚀 PathCommand.run(passedParameters: string[], options?: PathCommandOptions): Promise<void> [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:218]
   ↳ Runs the path query between two nodes across active graph levels.
  └─> PathQueryService.query(args: PathQueryArguments): Promise<CombinedPathResults> [projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:300]
     ↳ Queries every enabled graph type for a connecting path between two nodes.
    └─> PathQueryService.queryFileImports(args: PathQueryArguments): null | string[] [projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:118]
       ↳ Queries the file-imports workspace graph for a path between two files.
      └─> PathQueryService.map(…)(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:121]
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

**3. `MapCommand.parseDirectory`** — depth 4 · decorated-method

```text
🚀 MapCommand.parseDirectory(value: string | undefined): string [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:278]
   ↳ Parses the directory whose Nx workspace this run reads.
  └─> ConfigurationService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:297]
     ↳ Parses a path option that falls back to the working directory.
    └─> InputService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:87]
       ↳ Parses a path option that falls back to the working directory.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
         ↳ Trims an optional string option, treating blank as absent.
```

<details>
<summary>16 more call stacks</summary>

**4. `MapCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 MapCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:294]
   ↳ Parses `--exclude`, a comma-separated list of globs overriding the configured `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:282]
     ↳ Parses a comma-separated list option, dropping blank entries.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:54]
       ↳ Parses a comma-separated list option, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:59]
```

**5. `MapCommand.parseInclude`** — depth 4 · decorated-method

```text
🚀 MapCommand.parseInclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:333]
   ↳ Parses `--include`, a comma-separated list of globs overriding the configured `include`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:282]
     ↳ Parses a comma-separated list option, dropping blank entries.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:54]
       ↳ Parses a comma-separated list option, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:59]
```

**6. `PathCommand.parseDirectory`** — depth 4 · decorated-method

```text
🚀 PathCommand.parseDirectory(value: string | undefined): string [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:102]
   ↳ Parses the directory whose Nx workspace this run reads.
  └─> ConfigurationService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:297]
     ↳ Parses a path option that falls back to the working directory.
    └─> InputService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:87]
       ↳ Parses a path option that falls back to the working directory.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
         ↳ Trims an optional string option, treating blank as absent.
```

**7. `PathCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 PathCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:111]
   ↳ Parses `--exclude`, a comma-separated list of globs overriding the configured `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:282]
     ↳ Parses a comma-separated list option, dropping blank entries.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:54]
       ↳ Parses a comma-separated list option, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:59]
```

**8. `PathCommand.parseInclude`** — depth 4 · decorated-method

```text
🚀 PathCommand.parseInclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:143]
   ↳ Parses `--include`, a comma-separated list of globs overriding the configured `include`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:282]
     ↳ Parses a comma-separated list option, dropping blank entries.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:54]
       ↳ Parses a comma-separated list option, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:59]
```

**9. `MapCommand.parseConfig`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseConfig(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:254]
   ↳ Parses the required configuration path from command-line input.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**10. `MapCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:318]
   ↳ Parses what `--format` prints to standard output.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**11. `MapCommand.parseJsonOutput`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseJsonOutput(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:346]
   ↳ Parses `--json-output`, the path to write every active graph type's combined JSON data to, keyed by graph type name.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**12. `MapCommand.parseMarkdownOutput`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseMarkdownOutput(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:359]
   ↳ Parses `--markdown-output`, the path to write every active graph type's combined, anchor-spliced Markdown diagram to.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**13. `MapCommand.parseProjects`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseProjects(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:438]
   ↳ Parses the projects a run exports for beyond `include`. **Widening, and narrowing.** A named project is added to…
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**14. `MapCommand.parseTags`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseTags(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:451]
   ↳ Parses the Nx tags a run exports for, matched exactly against a project's own tags.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**15. `MapCommand.parseWrite`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseWrite(value: boolean | undefined): boolean [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:461]
   ↳ Parses the `--write` flag from command-line input.
  └─> ConfigurationService.parseFlagOption(value: boolean | undefined): boolean [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:287]
     ↳ Parses a valueless boolean flag, which is present or it is not.
    └─> InputService.parseFlagOption(value: boolean | undefined): boolean [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:70]
       ↳ Parses a valueless boolean flag, which is present or it is not.
```

**16. `PathCommand.parseConfig`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseConfig(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:92]
   ↳ Parses the required configuration path from command-line input.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**17. `PathCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:134]
   ↳ Parses what `--format` prints to standard output. Defaults to Markdown when the flag was left off entirely.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**18. `PathCommand.parseProjects`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseProjects(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:198]
   ↳ Parses the projects a query searches across beyond `include`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

**19. `PathCommand.parseTags`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseTags(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:208]
   ↳ Parses the Nx tags a query searches across, matched exactly against project tags.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75]
       ↳ Trims an optional string option, treating blank as absent.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MapCommand.runMode` | 7 | `MapCommand.resolveContext`, `ConfigurationService.touchesFiles`, `MapCommand.runExports`, `BoundaryCheckService.run`, `MapCommand.runCombinedOutput`, `ReportingService.reportPassOutcomes`, `ReportingService.reportSuccess` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:193` |
| `PathCommand.run` | 6 | `PathCommand.validateInputs`, `RunContextService.build`, `ConfigurationService.requireConfigurationPath`, `PathQueryService.query`, `PathQueryService.render`, `ReportingService.reportFailure` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:218` |
| `MapCommand.resolveContext` | 4 | `RunContextService.build`, `ConfigurationService.requireConfigurationPath`, `ReportingService.reportUnmatchedSelection`, `RunContextService.findUnmatchedSelection` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:116` |

<details>
<summary>22 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MapCommand.run` | 4 | `ConfigurationService.selectMode`, `CombinedOutputService.resolveFormat`, `MapCommand.runMode`, `ReportingService.reportFailure` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:479` |
| `MapCommand.runCombinedOutput` | 2 | `MapCommand.buildBoundaryReport`, `CombinedOutputService.run` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:141` |
| `MapCommand.runExports` | 2 | `GraphRunService.run`, `ReportingService.reportEmptySelection` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:174` |
| `MapCommand.buildBoundaryReport` | 1 | `MapCommand.map(…)` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:89` |
| `MapCommand.parseConfig` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:254` |
| `MapCommand.parseDirectory` | 1 | `ConfigurationService.parsePathOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:278` |
| `MapCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:294` |
| `MapCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:318` |
| `MapCommand.parseInclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:333` |
| `MapCommand.parseJsonOutput` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:346` |
| `MapCommand.parseMarkdownOutput` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:359` |
| `MapCommand.parseProjects` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:438` |
| `MapCommand.parseTags` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:451` |
| `MapCommand.parseWrite` | 1 | `ConfigurationService.parseFlagOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:461` |
| `PathCommand.validateInputs` | 1 | `PathQueryService.resolveFormat` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:56` |
| `PathCommand.parseConfig` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:92` |
| `PathCommand.parseDirectory` | 1 | `ConfigurationService.parsePathOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:102` |
| `PathCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:111` |
| `PathCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:134` |
| `PathCommand.parseInclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:143` |
| `PathCommand.parseProjects` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:198` |
| `PathCommand.parseTags` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:208` |

</details>
<!-- callidescope:end -->
