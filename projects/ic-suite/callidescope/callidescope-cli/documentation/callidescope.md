<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 113 |
| Files | 35 |
| Calls traced | 155 |
| Call stacks | 42 |
| Deepest stack | 15 |
| Stacks through recursion | 0 |
| Unfollowable calls | 5 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 15 |
| `maximumBreadth` | 11 |

### Call stacks (depth)

**1. `CallidescopeCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 CallidescopeCommand.run(passedParameters: string[], options: CallidescopeCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:422]
   ↳ Traces the workspace and reports.
  └─> CallidescopeCommand.traceWorkspace(options: CallidescopeCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:151]
     ↳ Traces the workspace, reports, and sets the exit code.
    └─> CallidescopeService.trace(args: TraceArguments): Promise<TraceOutcome> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:358]
       ↳ Traces a workspace and returns everything the run found.
      └─> CallidescopeService.analyze(…): AnalyzeOutcome [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:262]
         ↳ Derives every finding from the collected callables.
        └─> GraphAssemblyService.assemble(args: AssembleGraphArguments): AssembledGraph [projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43]
           ↳ Builds the call graph and everything derived from it.
          └─> EdgesService.build(args: BuildEdgesArguments): EdgeCollection [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:243]
             ↳ Builds every edge in the graph, and records the calls it could not.
            └─> EdgesService.buildSiteEdges(…): { edges: CallEdge[]; unresolved: UnresolvedCall[]; } [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:58]
               ↳ Turns one call site into the edges and non-resolutions it produced.
              └─> EdgesService.resolveSite(…): ResolvedCallSite | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:218]
                 ↳ Resolves one call site, choosing the right strategy for its shape.
                └─> SymbolResolutionService.resolve(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:253]
                   ↳ Resolves a call expression to every declaration it can reach.
                  └─> SymbolResolutionService.resolveSymbol(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:154]
                     ↳ Resolves an already-identified callee symbol to its declarations.
                    └─> SymbolResolutionService.resolveThroughHierarchy(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:203]
                       ↳ Expands an interface or abstract member to its implementations.
                      └─> ClassesService.resolveImplementations(…): ImplementationLookup [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:190]
                         ↳ Finds the concrete declarations an interface member resolves to.
                        └─> ClassesService.flatMap(…)(this: undefined, candidate: ts.ClassDeclaration): ts.Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:218]
                          └─> ClassesService.readMemberDeclarations(…): Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:138]
                             ↳ Reads one member's concrete declarations off a candidate class.
                            └─> ClassesService.filter(…)(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:152]
```

**2. `BreadthCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 BreadthCommand.run(_passedParameters: string[], options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:292]
   ↳ Prints each callable's direct callers and callees.
  └─> BreadthCommand.printBreadth(options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:119]
     ↳ Resolves the addresses and prints their direct callers and callees.
    └─> AddressLookupService.locate(options: AddressCommandOptions): Promise<LocatedWorkspace> [projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:76]
       ↳ Loads the configuration and traces the workspace, matching nothing yet.
      └─> CallidescopeService.locate(args: TraceArguments): Promise<LocateOutcome> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:344]
         ↳ Collects and assembles the graph without the full analysis, for `depth` and `breadth`.
        └─> GraphAssemblyService.assemble(args: AssembleGraphArguments): AssembledGraph [projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43]
           ↳ Builds the call graph and everything derived from it.
          └─> EdgesService.build(args: BuildEdgesArguments): EdgeCollection [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:243]
             ↳ Builds every edge in the graph, and records the calls it could not.
            └─> EdgesService.buildSiteEdges(…): { edges: CallEdge[]; unresolved: UnresolvedCall[]; } [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:58]
               ↳ Turns one call site into the edges and non-resolutions it produced.
              └─> EdgesService.resolveSite(…): ResolvedCallSite | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:218]
                 ↳ Resolves one call site, choosing the right strategy for its shape.
                └─> SymbolResolutionService.resolve(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:253]
                   ↳ Resolves a call expression to every declaration it can reach.
                  └─> SymbolResolutionService.resolveSymbol(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:154]
                     ↳ Resolves an already-identified callee symbol to its declarations.
                    └─> SymbolResolutionService.resolveThroughHierarchy(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:203]
                       ↳ Expands an interface or abstract member to its implementations.
                      └─> ClassesService.resolveImplementations(…): ImplementationLookup [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:190]
                         ↳ Finds the concrete declarations an interface member resolves to.
                        └─> ClassesService.flatMap(…)(this: undefined, candidate: ts.ClassDeclaration): ts.Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:218]
                          └─> ClassesService.readMemberDeclarations(…): Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:138]
                             ↳ Reads one member's concrete declarations off a candidate class.
                            └─> ClassesService.filter(…)(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:152]
```

**3. `DepthCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 DepthCommand.run(_passedParameters: string[], options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:270]
   ↳ Prints every path above and below each address.
  └─> DepthCommand.printDepth(options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:85]
     ↳ Traces every path above and below each resolved address, and prints them.
    └─> AddressLookupService.locate(options: AddressCommandOptions): Promise<LocatedWorkspace> [projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:76]
       ↳ Loads the configuration and traces the workspace, matching nothing yet.
      └─> CallidescopeService.locate(args: TraceArguments): Promise<LocateOutcome> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:344]
         ↳ Collects and assembles the graph without the full analysis, for `depth` and `breadth`.
        └─> GraphAssemblyService.assemble(args: AssembleGraphArguments): AssembledGraph [projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43]
           ↳ Builds the call graph and everything derived from it.
          └─> EdgesService.build(args: BuildEdgesArguments): EdgeCollection [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:243]
             ↳ Builds every edge in the graph, and records the calls it could not.
            └─> EdgesService.buildSiteEdges(…): { edges: CallEdge[]; unresolved: UnresolvedCall[]; } [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:58]
               ↳ Turns one call site into the edges and non-resolutions it produced.
              └─> EdgesService.resolveSite(…): ResolvedCallSite | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:218]
                 ↳ Resolves one call site, choosing the right strategy for its shape.
                └─> SymbolResolutionService.resolve(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:253]
                   ↳ Resolves a call expression to every declaration it can reach.
                  └─> SymbolResolutionService.resolveSymbol(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:154]
                     ↳ Resolves an already-identified callee symbol to its declarations.
                    └─> SymbolResolutionService.resolveThroughHierarchy(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:203]
                       ↳ Expands an interface or abstract member to its implementations.
                      └─> ClassesService.resolveImplementations(…): ImplementationLookup [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:190]
                         ↳ Finds the concrete declarations an interface member resolves to.
                        └─> ClassesService.flatMap(…)(this: undefined, candidate: ts.ClassDeclaration): ts.Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:218]
                          └─> ClassesService.readMemberDeclarations(…): Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:138]
                             ↳ Reads one member's concrete declarations off a candidate class.
                            └─> ClassesService.filter(…)(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:152]
```

<details>
<summary>39 more call stacks</summary>

**4. `LimitsCommand.run`** — depth ≥ 7 · decorated-method

```text
🚀 LimitsCommand.run(_passedParameters: string[], options: LimitsCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:76]
   ↳ Prints every project's resolved limits to standard output, since nothing downstream reads it as a file.
  └─> LimitsService.list(options: LimitsCommandOptions): Promise<ProjectLimitRow[]> [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:124]
     ↳ Resolves every project's limits, workspace default first.
    └─> LimitsService.discoverProjects(…): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:48]
       ↳ Finds the workspace's projects, using the run's filter rather than any project's.
      └─> WorkspaceService.discoverProjects(args: DiscoverProjectsArguments): WorkspaceProject[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:152]
         ↳ Resolves the project directories a run will trace.
        └─> WorkspaceService.findAllProjectDirectories(args: { projectTsconfigPath: string; workspaceRoot: string; }): string[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:43]
           ↳ Walks the whole workspace for every directory holding a file at `projectTsconfigPath`.
          └─> WorkspaceService.findProjectDirectories(…): void [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:64]
             ↳ Walks a directory recursively, collecting every subdirectory holding a file at `projectTsconfigPath`, including nested…
            └─> WorkspaceService.toWorkspaceRelative(args: { absolutePath: string; workspaceRoot: string; }): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:250]
               ↳ Rewrites an absolute path as workspace-relative with POSIX separators.
```

**5. `CallidescopeCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 CallidescopeCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:255]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:123]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:179]
       ↳ Trims the configuration path, refusing an absent or blank one, and names the surface it came from.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
         ↳ Trims an optional string option, treating blank as absent.
```

**6. `CallidescopeCommand.parseDirectories`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseDirectories(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:269]
   ↳ Parses `--directories`, a comma-separated list of project directories.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**7. `CallidescopeCommand.parseEntryPointAddresses`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseEntryPointAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:278]
   ↳ Parses `--entry-point-addresses`, overriding `entryPoints.addresses`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**8. `CallidescopeCommand.parseEntryPointDecorators`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseEntryPointDecorators(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:287]
   ↳ Parses `--entry-point-decorators`, overriding `entryPoints.decorators`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**9. `CallidescopeCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:296]
   ↳ Parses `--exclude`, overriding `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**10. `CallidescopeCommand.parseExcludeCallees`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseExcludeCallees(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:305]
   ↳ Parses `--exclude-callees`, overriding `excludeCallees`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**11. `BreadthCommand.parseAddresses`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:178]
   ↳ Parses `--addresses`, a comma-separated list of callable addresses.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**12. `BreadthCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 BreadthCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:188]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:123]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:179]
       ↳ Trims the configuration path, refusing an absent or blank one, and names the surface it came from.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
         ↳ Trims an optional string option, treating blank as absent.
```

**13. `BreadthCommand.parseDirectories`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseDirectories(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:202]
   ↳ Parses `--directories`, a comma-separated list of project directories.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**14. `BreadthCommand.parseEntryPointAddresses`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseEntryPointAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:211]
   ↳ Parses `--entry-point-addresses`, overriding `entryPoints.addresses`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**15. `BreadthCommand.parseEntryPointDecorators`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseEntryPointDecorators(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:220]
   ↳ Parses `--entry-point-decorators`, overriding `entryPoints.decorators`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**16. `BreadthCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:229]
   ↳ Parses `--exclude`, overriding `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**17. `BreadthCommand.parseExcludeCallees`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseExcludeCallees(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:238]
   ↳ Parses `--exclude-callees`, overriding `excludeCallees`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**18. `DepthCommand.parseAddresses`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:156]
   ↳ Parses `--addresses`, a comma-separated list of callable addresses.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**19. `DepthCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 DepthCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:166]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:123]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:179]
       ↳ Trims the configuration path, refusing an absent or blank one, and names the surface it came from.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
         ↳ Trims an optional string option, treating blank as absent.
```

**20. `DepthCommand.parseDirectories`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseDirectories(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:180]
   ↳ Parses `--directories`, a comma-separated list of project directories.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**21. `DepthCommand.parseEntryPointAddresses`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseEntryPointAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:189]
   ↳ Parses `--entry-point-addresses`, overriding `entryPoints.addresses`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**22. `DepthCommand.parseEntryPointDecorators`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseEntryPointDecorators(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:198]
   ↳ Parses `--entry-point-decorators`, overriding `entryPoints.decorators`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**23. `DepthCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:207]
   ↳ Parses `--exclude`, overriding `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**24. `DepthCommand.parseExcludeCallees`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseExcludeCallees(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:216]
   ↳ Parses `--exclude-callees`, overriding `excludeCallees`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77]
       ↳ Splits a comma-separated flag into trimmed, non-empty entries.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:82]
```

**25. `LimitsCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 LimitsCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:60]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:123]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:179]
       ↳ Trims the configuration path, refusing an absent or blank one, and names the surface it came from.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
         ↳ Trims an optional string option, treating blank as absent.
```

**26. `CallidescopeCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:316]
   ↳ Parses `--format`, which decides what the run prints.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**27. `CallidescopeCommand.parseIncludeExportedFunctions`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseIncludeExportedFunctions(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:327]
   ↳ Parses `--include-exported-functions`, carried through as written like `--format`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**28. `CallidescopeCommand.parseIncludeOrphans`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseIncludeOrphans(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:338]
   ↳ Parses `--include-orphans`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**29. `CallidescopeCommand.parseIncludeTests`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseIncludeTests(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:347]
   ↳ Parses `--include-tests`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**30. `CallidescopeCommand.parseJson`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseJson(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:356]
   ↳ Parses `--json`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**31. `CallidescopeCommand.parseMarkdown`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMarkdown(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:366]
   ↳ Parses `--markdown`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**32. `CallidescopeCommand.parseMaximumBreadth`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMaximumBreadth(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:379]
   ↳ Parses `--maximum-breadth`, overriding `limits.maximumBreadth`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**33. `CallidescopeCommand.parseMaximumDepth`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMaximumDepth(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:388]
   ↳ Parses `--maximum-depth`, overriding `limits.maximumDepth`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**34. `CallidescopeCommand.parseMermaid`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMermaid(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:397]
   ↳ Parses `--mermaid`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**35. `BreadthCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:249]
   ↳ Parses `--format`, carried through as written: the resolver that knows the formats refuses an unknown one.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**36. `BreadthCommand.parseIncludeExportedFunctions`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseIncludeExportedFunctions(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:260]
   ↳ Parses `--include-exported-functions`, carried through as written like `--format`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**37. `BreadthCommand.parseIncludeOrphans`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseIncludeOrphans(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:271]
   ↳ Parses `--include-orphans`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**38. `BreadthCommand.parseIncludeTests`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseIncludeTests(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:280]
   ↳ Parses `--include-tests`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**39. `DepthCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:227]
   ↳ Parses `--format`, carried through as written: the resolver that knows the formats refuses an unknown one.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**40. `DepthCommand.parseIncludeExportedFunctions`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseIncludeExportedFunctions(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:238]
   ↳ Parses `--include-exported-functions`, carried through as written like `--format`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**41. `DepthCommand.parseIncludeOrphans`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseIncludeOrphans(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:249]
   ↳ Parses `--include-orphans`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

**42. `DepthCommand.parseIncludeTests`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseIncludeTests(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:258]
   ↳ Parses `--include-tests`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:87]
       ↳ Trims an optional string option, treating blank as absent.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CallidescopeCommand.traceWorkspace` | 10 | `ConfigurationService.resolveFormatOption`, `ConfigurationService.prepareRun`, `CallidescopeCommand.reject`, `CallidescopeService.trace`, `UnresolvedEntryPointAddressError.constructor`, `CallidescopeCommand.map(…)`, `CallidescopeCommand.report`, `ConfigurationService.touchesFiles`, `WriteDestinationsService.syncDestinations`, `ReportFindingsService.reportFindings` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:151` |
| `CallidescopeService.discoverCallables` | 9 | `CallidescopeService.discoverPrograms`, `CallidescopeService.map(…)`, `CallidescopeService.loadProjectDeclarations`, `ExternalService.configure`, `ClassesService.build`, `CallablesService.collect`, `FileFilterService.buildProjectFileFilter`, `CallidescopeService.map(…)`, `CallidescopeService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:76` |
| `CallidescopeService.analyze` | 7 | `GraphAssemblyService.assemble`, `EntriesService.resolve`, `ProjectReportsService.build`, `CallidescopeService.filter(…)`, `CallidescopeService.readMaximumDepth`, `ProjectReportsService.findDeepStacks`, `ProjectReportsService.findWideCallables` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:262` |

<details>
<summary>73 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CallidescopeService.loadProjectDeclarations` | 6 | `ConfigurationService.loadProjectConfigurations`, `CallidescopeService.map(…)`, `CallidescopeService.map(…)`, `CallidescopeService.filter(…)`, `ConfigurationService.resolveLimits`, `CallidescopeService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:195` |
| `DepthCommand.printDepth` | 6 | `ConfigurationService.resolveFormatOption`, `AddressLookupService.locate`, `DepthCommand.resolveAddresses`, `DepthCommand.identifyAddresses`, `AddressReportService.renderDepthReports`, `DepthCommand.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:85` |
| `LimitsService.list` | 6 | `ConfigurationService.loadConfigurationFile`, `LimitsService.discoverProjects`, `ConfigurationService.loadProjectConfigurations`, `ConfigurationService.resolveLimits`, `LimitsService.toWorkspaceRows`, `LimitsService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:124` |
| `CallidescopeService.discoverPrograms` | 5 | `FileFilterService.buildFileFilter`, `ConfigurationService.requireProjectTsconfigPath`, `WorkspaceService.discoverProjects`, `ProgramService.buildPrograms`, `CallidescopeService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:139` |
| `BreadthCommand.printBreadth` | 5 | `ConfigurationService.resolveFormatOption`, `AddressLookupService.locate`, `BreadthCommand.resolveAddresses`, `BreadthCommand.buildReports`, `AddressReportService.renderBreadthReports` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:119` |
| `CallidescopeCommand.run` | 4 | `CallidescopeCommand.reject`, `buildUnknownCommandMessage`, `CallidescopeCommand.traceWorkspace`, `readRefusalHeadline` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:422` |
| `LimitsService.discoverProjects` | 4 | `FileFilterService.buildFileFilter`, `LimitsService.map(…)`, `WorkspaceService.discoverProjects`, `ConfigurationService.requireProjectTsconfigPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:48` |
| `LimitsCommand.run` | 4 | `LimitsService.list`, `RenderLimitsService.render`, `readRefusalHeadline`, `LimitsCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:76` |
| `BreadthCommand.describeAddress` | 3 | `AddressLookupService.resolve`, `AddressLookupService.describeProblem`, `BreadthService.describeDirectCalls` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:83` |
| `BreadthCommand.run` | 3 | `BreadthCommand.printBreadth`, `readRefusalHeadline`, `BreadthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:292` |
| `DepthCommand.identifyAddresses` | 3 | `AddressLookupService.resolve`, `AddressLookupService.describeProblem`, `DepthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:51` |
| `DepthCommand.run` | 3 | `DepthCommand.printDepth`, `readRefusalHeadline`, `DepthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:270` |
| `RenderLimitsService.renderTable` | 3 | `RenderLimitsService.renderRow`, `RenderLimitsService.map(…)`, `RenderLimitsService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/render-limits.service.ts:49` |
| `CallidescopeService.locate` | 2 | `CallidescopeService.discoverCallables`, `GraphAssemblyService.assemble` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:344` |
| `CallidescopeService.trace` | 2 | `CallidescopeService.discoverCallables`, `CallidescopeService.analyze` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:358` |
| `CallidescopeCommand.report` | 2 | `OutputJsonService.buildReport`, `MarkdownReportService.renderRun` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:112` |
| `AddressLookupService.locate` | 2 | `ConfigurationService.prepareLookup`, `CallidescopeService.locate` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:76` |
| `BreadthCommand.buildReports` | 2 | `BreadthCommand.describeAddress`, `BreadthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:51` |
| `BreadthCommand.resolveAddresses` | 2 | `ConfigurationService.promptForAutocompleteMultiselect`, `AddressLookupService.listAddresses` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:157` |
| `DepthCommand.map(…)` | 2 | `AddressDepthService.buildDownwardStacks`, `AddressDepthService.buildUpwardStacks` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:105` |
| `DepthCommand.resolveAddresses` | 2 | `ConfigurationService.promptForAutocompleteMultiselect`, `AddressLookupService.listAddresses` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:135` |
| `RenderLimitsService.map(…)` | 2 | `RenderLimitsService.renderRow`, `RenderLimitsService.renderProject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/render-limits.service.ts:53` |
| `readRefusalHeadline` | 1 | `isRefusedProjectConfiguration` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.constants.ts:31` |
| `UnresolvedEntryPointAddressError.constructor` | 1 | `UnresolvedEntryPointAddressError.joinDescriptions` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.constants.ts:59` |
| `UnresolvedEntryPointAddressError.joinDescriptions` | 1 | `UnresolvedEntryPointAddressError.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.constants.ts:68` |
| `CallidescopeService.readMaximumDepth` | 1 | `CallidescopeService.reduce(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:252` |
| `CallidescopeCommand.describeUnresolvedAddress` | 1 | `AddressService.describeCandidates` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:79` |
| `CallidescopeCommand.map(…)` | 1 | `CallidescopeCommand.describeUnresolvedAddress` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:202` |
| `CallidescopeCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:255` |
| `CallidescopeCommand.parseDirectories` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:269` |
| `CallidescopeCommand.parseEntryPointAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:278` |
| `CallidescopeCommand.parseEntryPointDecorators` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:287` |
| `CallidescopeCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:296` |
| `CallidescopeCommand.parseExcludeCallees` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:305` |
| `CallidescopeCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:316` |
| `CallidescopeCommand.parseIncludeExportedFunctions` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:327` |
| `CallidescopeCommand.parseIncludeOrphans` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:338` |
| `CallidescopeCommand.parseIncludeTests` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:347` |
| `CallidescopeCommand.parseJson` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:356` |
| `CallidescopeCommand.parseMarkdown` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:366` |
| `CallidescopeCommand.parseMaximumBreadth` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:379` |
| `CallidescopeCommand.parseMaximumDepth` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:388` |
| `CallidescopeCommand.parseMermaid` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:397` |
| `AddressLookupService.describeProblem` | 1 | `AddressService.describeCandidates` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:44` |
| `AddressLookupService.listAddresses` | 1 | `AddressService.listAddresses` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:71` |
| `AddressLookupService.resolve` | 1 | `AddressService.resolve` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:101` |
| `BreadthCommand.parseAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:178` |
| `BreadthCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:188` |
| `BreadthCommand.parseDirectories` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:202` |
| `BreadthCommand.parseEntryPointAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:211` |
| `BreadthCommand.parseEntryPointDecorators` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:220` |
| `BreadthCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:229` |
| `BreadthCommand.parseExcludeCallees` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:238` |
| `BreadthCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:249` |
| `BreadthCommand.parseIncludeExportedFunctions` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:260` |
| `BreadthCommand.parseIncludeOrphans` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:271` |
| `BreadthCommand.parseIncludeTests` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:280` |
| `DepthCommand.parseAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:156` |
| `DepthCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:166` |
| `DepthCommand.parseDirectories` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:180` |
| `DepthCommand.parseEntryPointAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:189` |
| `DepthCommand.parseEntryPointDecorators` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:198` |
| `DepthCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:207` |
| `DepthCommand.parseExcludeCallees` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:216` |
| `DepthCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:227` |
| `DepthCommand.parseIncludeExportedFunctions` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:238` |
| `DepthCommand.parseIncludeOrphans` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:249` |
| `DepthCommand.parseIncludeTests` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:258` |
| `LimitsService.toProjectRows` | 1 | `LimitsService.toRow` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:74` |
| `LimitsService.toWorkspaceRows` | 1 | `LimitsService.toRow` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:108` |
| `LimitsService.flatMap(…)` | 1 | `LimitsService.toProjectRows` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:163` |
| `RenderLimitsService.render` | 1 | `RenderLimitsService.renderTable` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/render-limits.service.ts:67` |
| `LimitsCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:60` |

</details>
<!-- callidescope:end -->
