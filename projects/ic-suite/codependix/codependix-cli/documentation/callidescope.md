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
🚀 MapCommand.run(_passedParameters: string[], options?: MapCommandOptions): Promise<void> [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:417]
   ↳ Runs whatever the command line asked for: exports, boundaries, or both.
  └─> MapCommand.runMode(…): Promise<void> [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:161]
     ↳ Runs a resolved mode's passes and reports them.
    └─> MapCommand.runExports(context: GraphRunContext): Promise<MapRunResult> [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:147]
       ↳ Runs the export pass and warns when nothing was selected.
      └─> GraphRunService.run(context: GraphRunContext): Promise<MapRunResult> [projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:122]
         ↳ Runs every configured graph export. Every pass is attempted, since the graph types are independent.
        └─> GraphRunService.runPythonImportGraphs(context: GraphRunContext): GraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/graph-run/graph-run.service.ts:233]
           ↳ Builds and delivers the Python file-level import graphs.
          └─> PythonImportsService.runGraphs(context: GraphRunContext): GraphRunOutcome [projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:123]
             ↳ Builds and delivers the Python file-level import graphs.
            └─> PythonImportsService.runProject(…): ProjectRunResult [projects/ic-suite/codependix/codependix-output/src/modules/python-imports/python-imports.service.ts:92]
               ↳ Builds, renders, and delivers one project's Python import graph.
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

**2. `PathCommand.run`** — depth ≥ 12 · decorated-method

```text
🚀 PathCommand.run(passedParameters: string[], options?: PathCommandOptions): Promise<void> [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:218]
   ↳ Runs the path query between two nodes across active graph levels.
  └─> PathQueryService.query(args: PathQueryArguments): Promise<CombinedPathResults> [projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:303]
     ↳ Queries every enabled graph type for a connecting path between two nodes.
    └─> PathQueryService.queryFileImports(args: PathQueryArguments): null | string[] [projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:118]
       ↳ Queries the file-imports workspace graph for a path between two files.
      └─> PathQueryService.map(…)(project: PythonProject): PythonImportGraph [projects/ic-suite/codependix/codependix-output/src/modules/path-query/path-query.service.ts:121]
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

**3. `MapCommand.parseDirectory`** — depth 4 · decorated-method

```text
🚀 MapCommand.parseDirectory(value: string | undefined): string [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:241]
   ↳ Parses the directory whose Nx workspace this run reads.
  └─> ConfigurationService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:254]
     ↳ Parses a path option that falls back to the working directory.
    └─> InputService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:70]
       ↳ Parses a path option, defaulting to the working directory.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
         ↳ Trims an optional string option, treating blank as absent.
```

<details>
<summary>16 more call stacks</summary>

**4. `MapCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 MapCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:252]
   ↳ Parses `--exclude`, overriding the configured `exclude`. Refused later when the configuration never declared `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:239]
     ↳ Parses a comma-separated list, dropping blanks. Forwarded here, since `ConfigurationService` is the one public service.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:44]
       ↳ Parses a comma-separated list, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:49]
```

**5. `MapCommand.parseInclude`** — depth 4 · decorated-method

```text
🚀 MapCommand.parseInclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:286]
   ↳ Parses `--include`, a comma-separated list of globs overriding the configured `include`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:239]
     ↳ Parses a comma-separated list, dropping blanks. Forwarded here, since `ConfigurationService` is the one public service.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:44]
       ↳ Parses a comma-separated list, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:49]
```

**6. `PathCommand.parseDirectory`** — depth 4 · decorated-method

```text
🚀 PathCommand.parseDirectory(value: string | undefined): string [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:102]
   ↳ Parses the directory whose Nx workspace this run reads.
  └─> ConfigurationService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:254]
     ↳ Parses a path option that falls back to the working directory.
    └─> InputService.parsePathOption(value: string | undefined): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:70]
       ↳ Parses a path option, defaulting to the working directory.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
         ↳ Trims an optional string option, treating blank as absent.
```

**7. `PathCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 PathCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:111]
   ↳ Parses `--exclude`, a comma-separated list of globs overriding the configured `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:239]
     ↳ Parses a comma-separated list, dropping blanks. Forwarded here, since `ConfigurationService` is the one public service.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:44]
       ↳ Parses a comma-separated list, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:49]
```

**8. `PathCommand.parseInclude`** — depth 4 · decorated-method

```text
🚀 PathCommand.parseInclude(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:143]
   ↳ Parses `--include`, a comma-separated list of globs overriding the configured `include`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:239]
     ↳ Parses a comma-separated list, dropping blanks. Forwarded here, since `ConfigurationService` is the one public service.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:44]
       ↳ Parses a comma-separated list, dropping blank entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:49]
```

**9. `MapCommand.parseConfig`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseConfig(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:217]
   ↳ Parses the required configuration path from command-line input.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**10. `MapCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:273]
   ↳ Parses what `--format` prints to standard output. Validated later by `CombinedOutputService.resolveFormat`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**11. `MapCommand.parseJsonOutput`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseJsonOutput(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:299]
   ↳ Parses `--json-output`, the path to write every active graph type's combined JSON data to, keyed by graph type name.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**12. `MapCommand.parseMarkdownOutput`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseMarkdownOutput(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:312]
   ↳ Parses `--markdown-output`, the path to write every active graph type's combined, anchor-spliced Markdown diagram to.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**13. `MapCommand.parseProjects`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseProjects(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:382]
   ↳ Parses the projects a run exports for, beyond `include`. Also narrows the Workspace Graph and boundary gate to them.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**14. `MapCommand.parseTags`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseTags(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:395]
   ↳ Parses the Nx tags a run exports for, matched exactly against a project's own tags.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**15. `MapCommand.parseWrite`** — depth 3 · decorated-method

```text
🚀 MapCommand.parseWrite(value: boolean | undefined): boolean [projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:405]
   ↳ Parses the `--write` flag from command-line input.
  └─> ConfigurationService.parseFlagOption(value: boolean | undefined): boolean [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:244]
     ↳ Parses a valueless boolean flag, which is present or it is not.
    └─> InputService.parseFlagOption(value: boolean | undefined): boolean [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:56]
       ↳ Parses a valueless boolean flag: present means true.
```

**16. `PathCommand.parseConfig`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseConfig(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:92]
   ↳ Parses the required configuration path from command-line input.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**17. `PathCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:134]
   ↳ Parses what `--format` prints to standard output. Defaults to Markdown when the flag was left off entirely.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**18. `PathCommand.parseProjects`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseProjects(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:198]
   ↳ Parses the projects a query searches across beyond `include`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

**19. `PathCommand.parseTags`** — depth 3 · decorated-method

```text
🚀 PathCommand.parseTags(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:208]
   ↳ Parses the Nx tags a query searches across, matched exactly against project tags.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249]
     ↳ Trims an optional string option, treating blank as absent.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:61]
       ↳ Trims an optional string option, treating blank as absent.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MapCommand.runMode` | 7 | `MapCommand.resolveContext`, `ConfigurationService.touchesFiles`, `MapCommand.runExports`, `BoundaryCheckService.run`, `MapCommand.runCombinedOutput`, `ReportingService.reportPassOutcomes`, `ReportingService.reportSuccess` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:161` |
| `PathCommand.run` | 6 | `PathCommand.validateInputs`, `RunContextService.build`, `ConfigurationService.requireConfigurationPath`, `PathQueryService.query`, `PathQueryService.render`, `ReportingService.reportFailure` | `projects/ic-suite/codependix/codependix-cli/src/modules/path/path.command.ts:218` |
| `MapCommand.resolveContext` | 4 | `RunContextService.build`, `ConfigurationService.requireConfigurationPath`, `ReportingService.reportUnmatchedSelection`, `RunContextService.findUnmatchedSelection` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:95` |

<details>
<summary>22 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MapCommand.run` | 4 | `ConfigurationService.selectMode`, `CombinedOutputService.resolveFormat`, `MapCommand.runMode`, `ReportingService.reportFailure` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:417` |
| `MapCommand.runCombinedOutput` | 2 | `MapCommand.buildBoundaryReport`, `CombinedOutputService.run` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:118` |
| `MapCommand.runExports` | 2 | `GraphRunService.run`, `ReportingService.reportEmptySelection` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:147` |
| `MapCommand.buildBoundaryReport` | 1 | `MapCommand.map(…)` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:72` |
| `MapCommand.parseConfig` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:217` |
| `MapCommand.parseDirectory` | 1 | `ConfigurationService.parsePathOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:241` |
| `MapCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:252` |
| `MapCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:273` |
| `MapCommand.parseInclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:286` |
| `MapCommand.parseJsonOutput` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:299` |
| `MapCommand.parseMarkdownOutput` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:312` |
| `MapCommand.parseProjects` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:382` |
| `MapCommand.parseTags` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:395` |
| `MapCommand.parseWrite` | 1 | `ConfigurationService.parseFlagOption` | `projects/ic-suite/codependix/codependix-cli/src/modules/map/map.command.ts:405` |
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
