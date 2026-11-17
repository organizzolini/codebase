<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 113 |
| Files | 35 |
| Calls traced | 153 |
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
🚀 CallidescopeCommand.run(passedParameters: string[], options: CallidescopeCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:474]
   ↳ Traces the workspace, reports, and sets the exit code.
  └─> CallidescopeCommand.traceWorkspace(options: CallidescopeCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:174]
     ↳ Traces the workspace, reports, and sets the exit code.
    └─> CallidescopeService.trace(args: TraceArguments): Promise<TraceOutcome> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:408]
       ↳ Traces a workspace and returns everything the run found.
      └─> CallidescopeService.analyze(…): AnalyzeOutcome [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:295]
         ↳ Derives every finding from the collected callables.
        └─> GraphAssemblyService.assemble(args: AssembleGraphArguments): AssembledGraph [projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43]
           ↳ Builds the call graph and everything derived from it.
          └─> EdgesService.build(args: BuildEdgesArguments): EdgeCollection [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:251]
             ↳ Builds every edge in the graph, and records the calls it could not.
            └─> EdgesService.buildSiteEdges(…): { edges: CallEdge[]; unresolved: UnresolvedCall[]; } [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:59]
               ↳ Turns one call site into the edges and non-resolutions it produced.
              └─> EdgesService.resolveSite(…): ResolvedCallSite | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:226]
                 ↳ Resolves one call site, choosing the right strategy for its shape.
                └─> SymbolResolutionService.resolve(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:267]
                   ↳ Resolves a call expression to every declaration it can reach.
                  └─> SymbolResolutionService.resolveSymbol(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:165]
                     ↳ Resolves an already-identified callee symbol to its declarations.
                    └─> SymbolResolutionService.resolveThroughHierarchy(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:217]
                       ↳ Expands an interface or abstract member to its implementations.
                      └─> ClassesService.resolveImplementations(…): ImplementationLookup [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:204]
                         ↳ Finds the concrete declarations one interface member resolves to.
                        └─> ClassesService.flatMap(…)(this: undefined, candidate: ts.ClassDeclaration): ts.Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:232]
                          └─> ClassesService.readMemberDeclarations(…): Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:148]
                             ↳ Reads one member's concrete declarations off a candidate class.
                            └─> ClassesService.filter(…)(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:162]
```

**2. `BreadthCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 BreadthCommand.run(_passedParameters: string[], options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:320]
   ↳ Prints each named callable's direct callers and callees.
  └─> BreadthCommand.printBreadth(options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:127]
     ↳ Resolves the addresses and prints their direct callers and callees.
    └─> AddressLookupService.locate(options: AddressCommandOptions): Promise<LocatedWorkspace> [projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:87]
       ↳ Loads the configuration and traces the workspace, matching nothing yet.
      └─> CallidescopeService.locate(args: TraceArguments): Promise<LocateOutcome> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:394]
         ↳ Collects every callable and assembles the graph over them, without running the analysis a full trace does.
        └─> GraphAssemblyService.assemble(args: AssembleGraphArguments): AssembledGraph [projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43]
           ↳ Builds the call graph and everything derived from it.
          └─> EdgesService.build(args: BuildEdgesArguments): EdgeCollection [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:251]
             ↳ Builds every edge in the graph, and records the calls it could not.
            └─> EdgesService.buildSiteEdges(…): { edges: CallEdge[]; unresolved: UnresolvedCall[]; } [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:59]
               ↳ Turns one call site into the edges and non-resolutions it produced.
              └─> EdgesService.resolveSite(…): ResolvedCallSite | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:226]
                 ↳ Resolves one call site, choosing the right strategy for its shape.
                └─> SymbolResolutionService.resolve(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:267]
                   ↳ Resolves a call expression to every declaration it can reach.
                  └─> SymbolResolutionService.resolveSymbol(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:165]
                     ↳ Resolves an already-identified callee symbol to its declarations.
                    └─> SymbolResolutionService.resolveThroughHierarchy(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:217]
                       ↳ Expands an interface or abstract member to its implementations.
                      └─> ClassesService.resolveImplementations(…): ImplementationLookup [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:204]
                         ↳ Finds the concrete declarations one interface member resolves to.
                        └─> ClassesService.flatMap(…)(this: undefined, candidate: ts.ClassDeclaration): ts.Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:232]
                          └─> ClassesService.readMemberDeclarations(…): Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:148]
                             ↳ Reads one member's concrete declarations off a candidate class.
                            └─> ClassesService.filter(…)(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:162]
```

**3. `DepthCommand.run`** — depth ≥ 15 · decorated-method

```text
🚀 DepthCommand.run(_passedParameters: string[], options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:295]
   ↳ Resolves the addresses, traces every path above and below each, and prints them.
  └─> DepthCommand.printDepth(options: AddressCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:89]
     ↳ Traces every path above and below each resolved address, and prints them.
    └─> AddressLookupService.locate(options: AddressCommandOptions): Promise<LocatedWorkspace> [projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:87]
       ↳ Loads the configuration and traces the workspace, matching nothing yet.
      └─> CallidescopeService.locate(args: TraceArguments): Promise<LocateOutcome> [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:394]
         ↳ Collects every callable and assembles the graph over them, without running the analysis a full trace does.
        └─> GraphAssemblyService.assemble(args: AssembleGraphArguments): AssembledGraph [projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43]
           ↳ Builds the call graph and everything derived from it.
          └─> EdgesService.build(args: BuildEdgesArguments): EdgeCollection [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:251]
             ↳ Builds every edge in the graph, and records the calls it could not.
            └─> EdgesService.buildSiteEdges(…): { edges: CallEdge[]; unresolved: UnresolvedCall[]; } [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:59]
               ↳ Turns one call site into the edges and non-resolutions it produced.
              └─> EdgesService.resolveSite(…): ResolvedCallSite | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:226]
                 ↳ Resolves one call site, choosing the right strategy for its shape.
                └─> SymbolResolutionService.resolve(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:267]
                   ↳ Resolves a call expression to every declaration it can reach.
                  └─> SymbolResolutionService.resolveSymbol(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:165]
                     ↳ Resolves an already-identified callee symbol to its declarations.
                    └─> SymbolResolutionService.resolveThroughHierarchy(…): ResolvedCallSite [projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:217]
                       ↳ Expands an interface or abstract member to its implementations.
                      └─> ClassesService.resolveImplementations(…): ImplementationLookup [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:204]
                         ↳ Finds the concrete declarations one interface member resolves to.
                        └─> ClassesService.flatMap(…)(this: undefined, candidate: ts.ClassDeclaration): ts.Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:232]
                          └─> ClassesService.readMemberDeclarations(…): Declaration[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:148]
                             ↳ Reads one member's concrete declarations off a candidate class.
                            └─> ClassesService.filter(…)(member: ts.PropertyDeclaration | ts.MethodDeclaration): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:162]
```

<details>
<summary>39 more call stacks</summary>

**4. `LimitsCommand.run`** — depth ≥ 7 · decorated-method

```text
🚀 LimitsCommand.run(_passedParameters: string[], options: LimitsCommandOptions): Promise<void> [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:90]
   ↳ Prints every project's resolved limits.
  └─> LimitsService.list(options: LimitsCommandOptions): Promise<ProjectLimitRow[]> [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:150]
     ↳ Resolves every project's limits, workspace default first.
    └─> ConfigurationService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:80]
       ↳ Loads a configuration, and says what the file itself declared and which file answered.
      └─> ConfigurationFileService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:290]
         ↳ Loads a configuration, and says what the file itself declared and which file answered.
        └─> ConfigurationFileService.resolveConfigurationPath(configurationPath: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:130]
           ↳ Resolves a configuration path against the cwd, then the repository root.
          └─> ConfigurationFileService.findRepositoryRoot(): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:69]
             ↳ Walks upward from the process cwd looking for the repository root.
            └─> ConfigurationFileService.some(…)(marker: ".git" | "pnpm-workspace.yaml"): boolean [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:74]
```

**5. `CallidescopeCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 CallidescopeCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:283]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:139]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:217]
       ↳ Trims the configuration path, refusing an absent or blank one.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
         ↳ Trims an optional string option, treating blank as absent.
```

**6. `CallidescopeCommand.parseDirectories`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseDirectories(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:297]
   ↳ Parses `--directories`, a comma-separated list of project directories.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**7. `CallidescopeCommand.parseEntryPointAddresses`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseEntryPointAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:306]
   ↳ Parses `--entry-point-addresses`, overriding `entryPoints.addresses`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**8. `CallidescopeCommand.parseEntryPointDecorators`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseEntryPointDecorators(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:315]
   ↳ Parses `--entry-point-decorators`, overriding `entryPoints.decorators`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**9. `CallidescopeCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:324]
   ↳ Parses `--exclude`, overriding `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**10. `CallidescopeCommand.parseExcludeCallees`** — depth 4 · decorated-method

```text
🚀 CallidescopeCommand.parseExcludeCallees(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:333]
   ↳ Parses `--exclude-callees`, overriding `excludeCallees`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**11. `BreadthCommand.parseAddresses`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:194]
   ↳ Parses `--addresses`, a comma-separated list of callable addresses.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**12. `BreadthCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 BreadthCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:204]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:139]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:217]
       ↳ Trims the configuration path, refusing an absent or blank one.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
         ↳ Trims an optional string option, treating blank as absent.
```

**13. `BreadthCommand.parseDirectories`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseDirectories(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:218]
   ↳ Parses `--directories`, a comma-separated list of project directories.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**14. `BreadthCommand.parseEntryPointAddresses`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseEntryPointAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:227]
   ↳ Parses `--entry-point-addresses`, overriding `entryPoints.addresses`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**15. `BreadthCommand.parseEntryPointDecorators`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseEntryPointDecorators(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:236]
   ↳ Parses `--entry-point-decorators`, overriding `entryPoints.decorators`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**16. `BreadthCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:245]
   ↳ Parses `--exclude`, overriding `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**17. `BreadthCommand.parseExcludeCallees`** — depth 4 · decorated-method

```text
🚀 BreadthCommand.parseExcludeCallees(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:254]
   ↳ Parses `--exclude-callees`, overriding `excludeCallees`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**18. `DepthCommand.parseAddresses`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:168]
   ↳ Parses `--addresses`, a comma-separated list of callable addresses.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**19. `DepthCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 DepthCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:178]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:139]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:217]
       ↳ Trims the configuration path, refusing an absent or blank one.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
         ↳ Trims an optional string option, treating blank as absent.
```

**20. `DepthCommand.parseDirectories`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseDirectories(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:192]
   ↳ Parses `--directories`, a comma-separated list of project directories.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**21. `DepthCommand.parseEntryPointAddresses`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseEntryPointAddresses(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:201]
   ↳ Parses `--entry-point-addresses`, overriding `entryPoints.addresses`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**22. `DepthCommand.parseEntryPointDecorators`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseEntryPointDecorators(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:210]
   ↳ Parses `--entry-point-decorators`, overriding `entryPoints.decorators`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**23. `DepthCommand.parseExclude`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseExclude(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:219]
   ↳ Parses `--exclude`, overriding `exclude`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**24. `DepthCommand.parseExcludeCallees`** — depth 4 · decorated-method

```text
🚀 DepthCommand.parseExcludeCallees(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:228]
   ↳ Parses `--exclude-callees`, overriding `excludeCallees`.
  └─> ConfigurationService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97]
     ↳ Splits a comma-separated flag value into its parts.
    └─> InputService.parseCommaDelimitedOption(value: string | undefined): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102]
       ↳ Splits `--directories`, a comma-separated list of project directories.
      └─> InputService.map(…)(entry: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:107]
```

**25. `LimitsCommand.parseConfig`** — depth ≥ 4 · decorated-method

```text
🚀 LimitsCommand.parseConfig(value: string | undefined): string [projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:70]
   ↳ Parses `--config`, which every command that loads a configuration requires.
  └─> ConfigurationService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:139]
     ↳ Reads the configuration path, refusing an absent or blank one by surface.
    └─> InputService.requireConfigurationPath(path: string | undefined, surface: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:217]
       ↳ Trims the configuration path, refusing an absent or blank one.
      └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
         ↳ Trims an optional string option, treating blank as absent.
```

**26. `CallidescopeCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:348]
   ↳ Parses `--format`, which decides what the run prints.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**27. `CallidescopeCommand.parseIncludeExportedFunctions`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseIncludeExportedFunctions(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:362]
   ↳ Parses `--include-exported-functions`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**28. `CallidescopeCommand.parseIncludeOrphans`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseIncludeOrphans(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:373]
   ↳ Parses `--include-orphans`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**29. `CallidescopeCommand.parseIncludeTests`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseIncludeTests(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:382]
   ↳ Parses `--include-tests`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**30. `CallidescopeCommand.parseJson`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseJson(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:391]
   ↳ Parses `--json`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**31. `CallidescopeCommand.parseMarkdown`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMarkdown(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:401]
   ↳ Parses `--markdown`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**32. `CallidescopeCommand.parseMaximumBreadth`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMaximumBreadth(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:417]
   ↳ Parses `--maximum-breadth`, overriding `limits.maximumBreadth`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**33. `CallidescopeCommand.parseMaximumDepth`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMaximumDepth(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:426]
   ↳ Parses `--maximum-depth`, overriding `limits.maximumDepth`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**34. `CallidescopeCommand.parseMermaid`** — depth 3 · decorated-method

```text
🚀 CallidescopeCommand.parseMermaid(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:435]
   ↳ Parses `--mermaid`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**35. `BreadthCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:269]
   ↳ Parses `--format`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**36. `BreadthCommand.parseIncludeExportedFunctions`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseIncludeExportedFunctions(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:283]
   ↳ Parses `--include-exported-functions`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**37. `BreadthCommand.parseIncludeOrphans`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseIncludeOrphans(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:294]
   ↳ Parses `--include-orphans`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**38. `BreadthCommand.parseIncludeTests`** — depth 3 · decorated-method

```text
🚀 BreadthCommand.parseIncludeTests(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:303]
   ↳ Parses `--include-tests`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**39. `DepthCommand.parseFormat`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseFormat(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:243]
   ↳ Parses `--format`.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**40. `DepthCommand.parseIncludeExportedFunctions`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseIncludeExportedFunctions(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:257]
   ↳ Parses `--include-exported-functions`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**41. `DepthCommand.parseIncludeOrphans`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseIncludeOrphans(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:268]
   ↳ Parses `--include-orphans`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

**42. `DepthCommand.parseIncludeTests`** — depth 3 · decorated-method

```text
🚀 DepthCommand.parseIncludeTests(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:277]
   ↳ Parses `--include-tests`, overriding the entry-point rule.
  └─> ConfigurationService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102]
     ↳ Reads a flag that may have been written without a value.
    └─> InputService.parseOptionalOption(value: string | undefined): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:112]
       ↳ Trims an optional string option, treating blank as absent.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CallidescopeCommand.traceWorkspace` | 10 | `ConfigurationService.resolveFormatOption`, `ConfigurationService.prepareRun`, `CallidescopeCommand.reject`, `CallidescopeService.trace`, `UnresolvedEntryPointAddressError.constructor`, `CallidescopeCommand.map(…)`, `CallidescopeCommand.report`, `ConfigurationService.touchesFiles`, `WriteDestinationsService.syncDestinations`, `ReportFindingsService.reportFindings` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:174` |
| `CallidescopeService.discoverCallables` | 9 | `CallidescopeService.discoverPrograms`, `CallidescopeService.map(…)`, `CallidescopeService.loadProjectDeclarations`, `ExternalService.configure`, `ClassesService.build`, `CallablesService.collect`, `FileFilterService.buildProjectFileFilter`, `CallidescopeService.map(…)`, `CallidescopeService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:83` |
| `CallidescopeService.analyze` | 7 | `GraphAssemblyService.assemble`, `EntriesService.resolve`, `ProjectReportsService.build`, `CallidescopeService.filter(…)`, `CallidescopeService.readMaximumDepth`, `ProjectReportsService.findDeepStacks`, `ProjectReportsService.findWideCallables` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:295` |

<details>
<summary>73 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CallidescopeService.loadProjectDeclarations` | 6 | `ConfigurationService.loadProjectConfigurations`, `CallidescopeService.map(…)`, `CallidescopeService.map(…)`, `CallidescopeService.filter(…)`, `ConfigurationService.resolveLimits`, `CallidescopeService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:224` |
| `DepthCommand.printDepth` | 6 | `ConfigurationService.resolveFormatOption`, `AddressLookupService.locate`, `DepthCommand.resolveAddresses`, `DepthCommand.identifyAddresses`, `AddressReportService.renderDepthReports`, `DepthCommand.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:89` |
| `LimitsService.list` | 6 | `ConfigurationService.loadConfigurationFile`, `LimitsService.discoverProjects`, `ConfigurationService.loadProjectConfigurations`, `ConfigurationService.resolveLimits`, `LimitsService.toWorkspaceRows`, `LimitsService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:150` |
| `BreadthCommand.printBreadth` | 5 | `ConfigurationService.resolveFormatOption`, `AddressLookupService.locate`, `BreadthCommand.resolveAddresses`, `BreadthCommand.buildReports`, `AddressReportService.renderBreadthReports` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:127` |
| `CallidescopeService.discoverPrograms` | 4 | `FileFilterService.buildFileFilter`, `WorkspaceService.discoverProjects`, `ProgramService.buildPrograms`, `CallidescopeService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:150` |
| `CallidescopeCommand.run` | 4 | `CallidescopeCommand.reject`, `buildUnknownCommandMessage`, `CallidescopeCommand.traceWorkspace`, `readRefusalHeadline` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:474` |
| `LimitsCommand.run` | 4 | `LimitsService.list`, `RenderLimitsService.render`, `readRefusalHeadline`, `LimitsCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:90` |
| `BreadthCommand.describeAddress` | 3 | `AddressLookupService.resolve`, `AddressLookupService.describeProblem`, `BreadthService.describeDirectCalls` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:91` |
| `BreadthCommand.run` | 3 | `BreadthCommand.printBreadth`, `readRefusalHeadline`, `BreadthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:320` |
| `DepthCommand.identifyAddresses` | 3 | `AddressLookupService.resolve`, `AddressLookupService.describeProblem`, `DepthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:55` |
| `DepthCommand.run` | 3 | `DepthCommand.printDepth`, `readRefusalHeadline`, `DepthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:295` |
| `LimitsService.discoverProjects` | 3 | `FileFilterService.buildFileFilter`, `LimitsService.map(…)`, `WorkspaceService.discoverProjects` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:68` |
| `RenderLimitsService.renderTable` | 3 | `RenderLimitsService.renderRow`, `RenderLimitsService.map(…)`, `RenderLimitsService.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/render-limits.service.ts:57` |
| `CallidescopeService.locate` | 2 | `CallidescopeService.discoverCallables`, `GraphAssemblyService.assemble` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:394` |
| `CallidescopeService.trace` | 2 | `CallidescopeService.discoverCallables`, `CallidescopeService.analyze` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:408` |
| `CallidescopeCommand.report` | 2 | `OutputJsonService.buildReport`, `MarkdownReportService.renderRun` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:135` |
| `AddressLookupService.locate` | 2 | `ConfigurationService.prepareLookup`, `CallidescopeService.locate` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:87` |
| `BreadthCommand.buildReports` | 2 | `BreadthCommand.describeAddress`, `BreadthCommand.reject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:55` |
| `BreadthCommand.resolveAddresses` | 2 | `ConfigurationService.promptForAutocompleteMultiselect`, `AddressLookupService.listAddresses` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:173` |
| `DepthCommand.map(…)` | 2 | `AddressDepthService.buildDownwardStacks`, `AddressDepthService.buildUpwardStacks` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:109` |
| `DepthCommand.resolveAddresses` | 2 | `ConfigurationService.promptForAutocompleteMultiselect`, `AddressLookupService.listAddresses` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:147` |
| `RenderLimitsService.map(…)` | 2 | `RenderLimitsService.renderRow`, `RenderLimitsService.renderProject` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/render-limits.service.ts:61` |
| `readRefusalHeadline` | 1 | `isRefusedProjectConfiguration` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.constants.ts:61` |
| `UnresolvedEntryPointAddressError.constructor` | 1 | `UnresolvedEntryPointAddressError.joinDescriptions` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.constants.ts:99` |
| `UnresolvedEntryPointAddressError.joinDescriptions` | 1 | `UnresolvedEntryPointAddressError.map(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.constants.ts:113` |
| `CallidescopeService.readMaximumDepth` | 1 | `CallidescopeService.reduce(…)` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.service.ts:285` |
| `CallidescopeCommand.describeUnresolvedAddress` | 1 | `AddressService.describeCandidates` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:92` |
| `CallidescopeCommand.map(…)` | 1 | `CallidescopeCommand.describeUnresolvedAddress` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:225` |
| `CallidescopeCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:283` |
| `CallidescopeCommand.parseDirectories` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:297` |
| `CallidescopeCommand.parseEntryPointAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:306` |
| `CallidescopeCommand.parseEntryPointDecorators` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:315` |
| `CallidescopeCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:324` |
| `CallidescopeCommand.parseExcludeCallees` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:333` |
| `CallidescopeCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:348` |
| `CallidescopeCommand.parseIncludeExportedFunctions` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:362` |
| `CallidescopeCommand.parseIncludeOrphans` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:373` |
| `CallidescopeCommand.parseIncludeTests` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:382` |
| `CallidescopeCommand.parseJson` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:391` |
| `CallidescopeCommand.parseMarkdown` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:401` |
| `CallidescopeCommand.parseMaximumBreadth` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:417` |
| `CallidescopeCommand.parseMaximumDepth` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:426` |
| `CallidescopeCommand.parseMermaid` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/callidescope/callidescope.command.ts:435` |
| `AddressLookupService.describeProblem` | 1 | `AddressService.describeCandidates` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:53` |
| `AddressLookupService.listAddresses` | 1 | `AddressService.listAddresses` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:82` |
| `AddressLookupService.resolve` | 1 | `AddressService.resolve` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/address-lookup/address-lookup.service.ts:112` |
| `BreadthCommand.parseAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:194` |
| `BreadthCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:204` |
| `BreadthCommand.parseDirectories` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:218` |
| `BreadthCommand.parseEntryPointAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:227` |
| `BreadthCommand.parseEntryPointDecorators` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:236` |
| `BreadthCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:245` |
| `BreadthCommand.parseExcludeCallees` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:254` |
| `BreadthCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:269` |
| `BreadthCommand.parseIncludeExportedFunctions` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:283` |
| `BreadthCommand.parseIncludeOrphans` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:294` |
| `BreadthCommand.parseIncludeTests` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/breadth/breadth.command.ts:303` |
| `DepthCommand.parseAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:168` |
| `DepthCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:178` |
| `DepthCommand.parseDirectories` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:192` |
| `DepthCommand.parseEntryPointAddresses` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:201` |
| `DepthCommand.parseEntryPointDecorators` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:210` |
| `DepthCommand.parseExclude` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:219` |
| `DepthCommand.parseExcludeCallees` | 1 | `ConfigurationService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:228` |
| `DepthCommand.parseFormat` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:243` |
| `DepthCommand.parseIncludeExportedFunctions` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:257` |
| `DepthCommand.parseIncludeOrphans` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:268` |
| `DepthCommand.parseIncludeTests` | 1 | `ConfigurationService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/depth/depth.command.ts:277` |
| `LimitsService.toProjectRows` | 1 | `LimitsService.toRow` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:88` |
| `LimitsService.toWorkspaceRows` | 1 | `LimitsService.toRow` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:128` |
| `LimitsService.flatMap(…)` | 1 | `LimitsService.toProjectRows` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.service.ts:186` |
| `RenderLimitsService.render` | 1 | `RenderLimitsService.renderTable` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/render-limits.service.ts:75` |
| `LimitsCommand.parseConfig` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-cli/src/modules/limits/limits.command.ts:70` |

</details>
<!-- callidescope:end -->
