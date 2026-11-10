<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 83 |
| Files | 44 |
| Calls traced | 123 |
| Call stacks | 7 |
| Deepest stack | 17 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `breadthExecutor`** — depth ≥ 17 · orphan-root

```text
🚀 breadthExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/breadth/executor.ts:15]
   ↳ Prints each named callable's direct callers and callees side by side — the two questions a rename or a refactor needs…
  └─> runAddressExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.utilities.ts:19]
     ↳ Runs the address lookups on behalf of the `depth` or `breadth` executor.
    └─> AddressService.runDepth(args: LookupArguments): Promise<LookupResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:152]
       ↳ Prints every call stack above and below each callable.
      └─> AddressService.locate(…): Promise<string | { identified: { address: string; id: string; }[]; workspace: LocatedWorkspace; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:74]
         ↳ Traces the selection, then matches every address against it.
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

**2. `depthExecutor`** — depth ≥ 17 · orphan-root

```text
🚀 depthExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/depth/executor.ts:15]
   ↳ Prints every call stack above and below each named callable — every caller chain up to a root, every callee chain down…
  └─> runAddressExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.utilities.ts:19]
     ↳ Runs the address lookups on behalf of the `depth` or `breadth` executor.
    └─> AddressService.runDepth(args: LookupArguments): Promise<LookupResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:152]
       ↳ Prints every call stack above and below each callable.
      └─> AddressService.locate(…): Promise<string | { identified: { address: string; id: string; }[]; workspace: LocatedWorkspace; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:74]
         ↳ Traces the selection, then matches every address against it.
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

**3. `gateBatchExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 gateBatchExecutor(…): Promise<Record<string, GateBatchTaskResult>> [projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:33]
   ↳ Gates every task Nx batched for this executor from one trace.
  └─> PluginService.runGateBatch(args: RunGateBatchArguments): Promise<Record<string, RunTraceResult>> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:394]
     ↳ Gates every task of a batch from one trace of their combined scope.
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

<details>
<summary>4 more call stacks</summary>

**4. `gateExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 gateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/executor.ts:31]
   ↳ Fails one project's task when its call stacks broke the limits it is held to.
  └─> PluginService.runGate(args: RunGateArguments): Promise<RunTraceResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:368]
     ↳ Traces the resolved directories and judges what it found against the limits every project in scope declared.
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

**5. `traceExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 traceExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/trace/executor.ts:25]
   ↳ Traces one selection of Nx projects with callidescope.
  └─> PluginService.runTrace(args: RunTraceArguments): Promise<RunTraceResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:438]
     ↳ Traces the resolved directories and renders the report.
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

**6. `anonymous`** — depth ≥ 8 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/callidescope/callidescope-nx/src/index.ts:59]
  └─> PluginService.inferTargets(args: InferTargetsArguments): Promise<Map<string, InferredTargets>> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:274]
     ↳ Infers this plugin's targets onto every project holding a `tsconfig.json`.
    └─> PluginService.buildExclusionFilter(…): Promise<FileFilter> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:87]
       ↳ Builds the predicate deciding which projects the workspace configuration keeps out of every trace.
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

**7. `resolveProjectsService`** — depth 2 · orphan-root

```text
🚀 resolveProjectsService(): Promise<ProjectsService> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:39]
   ↳ Resolves the service that reads the workspace's Nx project graph.
  └─> resolvePluginContext(): Promise<INestApplicationContext> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:59]
     ↳ Builds, or returns, this process's application context.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `runAddressExecutor` | 7 | `filter(…)`, `resolveExecutorScope`, `resolveOptionsService`, `resolveAddressService`, `OptionsService.readLookupOptions`, `AddressService.runDepth`, `AddressService.runBreadth` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.utilities.ts:19` |
| `ProjectsService.resolveProjectNames` | 6 | `ProjectsService.readProjects`, `ProjectsService.map(…)`, `ProjectsService.resolveTaggedNames`, `ProjectsService.map(…)`, `ProjectsService.readTags`, `ProjectsService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:195` |
| `traceExecutor` | 6 | `resolveExecutorScope`, `resolveOptionsService`, `resolvePluginService`, `PluginService.runTrace`, `OptionsService.readConfiguration`, `OptionsService.readFormat` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/trace/executor.ts:25` |

<details>
<summary>41 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `OptionsService.readStringList` | 5 | `OptionsService.isUnknownArray`, `OptionsService.filter(…)`, `OptionsService.map(…)`, `OptionsService.flatMap(…)`, `OptionsService.filter(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:109` |
| `PluginService.inferTargets` | 5 | `OptionsService.resolvePluginOptions`, `PluginService.buildExclusionFilter`, `PluginService.holdsProgram`, `PluginService.buildInferredTargets`, `PluginService.isExcludedProject` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:274` |
| `PluginService.runTrace` | 5 | `RunConfigurationService.load`, `CallidescopeService.trace`, `VerdictService.judge`, `MarkdownReportService.renderRun`, `VerdictService.explain` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:438` |
| `resolveExecutorScope` | 5 | `resolveOptionsService`, `OptionsService.readStringList`, `resolvePluginService`, `PluginService.resolveTraceScope`, `PluginService.describeRefusedScope` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.utilities.ts:24` |
| `gateExecutor` | 5 | `resolveExecutorScope`, `resolveOptionsService`, `resolvePluginService`, `PluginService.runGate`, `OptionsService.readConfiguration` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/executor.ts:31` |
| `PluginService.resolveTraceScope` | 4 | `ProjectsService.readProjectGraph`, `ProjectsService.resolveProjectNames`, `ProjectsService.resolveDependencyClosure`, `ProjectsService.resolveDirectories` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:324` |
| `PluginService.runGateBatch` | 4 | `RunConfigurationService.load`, `CallidescopeService.trace`, `PluginService.flatMap(…)`, `PluginService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:394` |
| `anonymous` | 4 | `resolvePluginService`, `PluginService.inferTargets`, `filter(…)`, `map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/index.ts:59` |
| `gateBatchExecutor` | 4 | `map(…)`, `resolvePluginService`, `PluginService.runGateBatch`, `printFailures` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:33` |
| `AddressService.runBreadth` | 3 | `AddressService.locate`, `BreadthService.describeDirectCalls`, `AddressReportService.renderBreadthReports` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:108` |
| `AddressService.runDepth` | 3 | `AddressService.locate`, `AddressReportService.renderDepthReports`, `AddressService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:152` |
| `ProjectsService.toDirectories` | 3 | `ProjectsService.map(…)`, `ProjectsService.readProjects`, `ProjectsService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:233` |
| `PluginService.renderGateVerdict` | 3 | `VerdictService.judge`, `VerdictService.explain`, `MarkdownReportService.renderFindings` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:214` |
| `PluginService.runGate` | 3 | `RunConfigurationService.load`, `CallidescopeService.trace`, `PluginService.renderGateVerdict` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:368` |
| `resolveTask` | 3 | `resolveOptionsService`, `resolveExecutorScope`, `OptionsService.readConfiguration` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:104` |
| `AddressService.identify` | 2 | `AddressLookupService.resolve`, `AddressLookupService.describeProblem` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:47` |
| `AddressService.locate` | 2 | `AddressLookupService.locate`, `AddressService.identify` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:74` |
| `AddressService.map(…)` | 2 | `AddressDepthService.buildDownwardStacks`, `AddressDepthService.buildUpwardStacks` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:165` |
| `OptionsService.readLookupOptions` | 2 | `OptionsService.readConfiguration`, `OptionsService.readFormat` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:87` |
| `OptionsService.resolvePluginOptions` | 2 | `ConfigurationService.requireConfigurationPath`, `OptionsService.readString` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:128` |
| `ProjectsService.readTags` | 2 | `ProjectsService.toSorted(…)`, `ProjectsService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:37` |
| `ProjectsService.resolveTaggedNames` | 2 | `ProjectsService.filter(…)`, `ProjectsService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:53` |
| `ProjectsService.readProjects` | 2 | `ProjectsService.toSorted(…)`, `ProjectsService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:92` |
| `ProjectsService.resolveDependencyClosure` | 2 | `ProjectsService.filter(…)`, `ProjectsService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:122` |
| `ProjectsService.resolveDirectories` | 2 | `ProjectsService.resolveProjectNames`, `ProjectsService.toDirectories` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:171` |
| `VerdictService.judge` | 2 | `ProjectReportsService.findOwnedFindings`, `ProjectReportsService.findUnreadProjects` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/verdict/verdict.service.ts:90` |
| `PluginService.buildExclusionFilter` | 2 | `ConfigurationService.loadConfigurationFile`, `FileFilterService.buildFileFilter` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:87` |
| `OptionsService.readConfiguration` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:63` |
| `OptionsService.readFormat` | 1 | `OptionsService.find(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:77` |
| `RunConfigurationService.load` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/run-configuration/run-configuration.service.ts:39` |
| `reportUnreadProjects` | 1 | `map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.constants.ts:72` |
| `VerdictService.explain` | 1 | `reportUnreadProjects` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/verdict/verdict.service.ts:43` |
| `PluginService.describeRefusedScope` | 1 | `PluginService.filter(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:246` |
| `PluginService.map(…)` | 1 | `PluginService.renderGateVerdict` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:411` |
| `resolveAddressService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:18` |
| `resolveOptionsService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:25` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:32` |
| `resolveProjectsService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:39` |
| `breadthExecutor` | 1 | `runAddressExecutor` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/breadth/executor.ts:15` |
| `depthExecutor` | 1 | `runAddressExecutor` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/depth/executor.ts:15` |
| `map(…)` | 1 | `resolveTask` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:37` |

</details>
<!-- callidescope:end -->
