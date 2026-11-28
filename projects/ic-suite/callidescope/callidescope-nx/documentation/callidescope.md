<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 86 |
| Files | 44 |
| Calls traced | 130 |
| Call stacks | 7 |
| Deepest stack | 17 |
| Stacks through recursion | 0 |
| Unfollowable calls | 3 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `breadthExecutor`** — depth ≥ 17 · orphan-root

```text
🚀 breadthExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/breadth/executor.ts:11]
   ↳ Prints each named callable's direct callers and callees, resolved within the target's Nx scope.
  └─> runAddressExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.utilities.ts:17]
     ↳ Runs the address lookup for the `depth` or `breadth` executor, which differ only in one call.
    └─> AddressService.runDepth(args: LookupArguments): Promise<LookupResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:142]
       ↳ Prints every call stack above and below each callable.
      └─> AddressService.locate(…): Promise<string | { identified: { address: string; id: string; }[]; workspace: LocatedWorkspace; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:64]
         ↳ Traces the selection, then matches every address against it. All or nothing, like the command line.
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

**2. `depthExecutor`** — depth ≥ 17 · orphan-root

```text
🚀 depthExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/depth/executor.ts:11]
   ↳ Prints every call stack above and below each named callable, resolved within the target's Nx scope.
  └─> runAddressExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.utilities.ts:17]
     ↳ Runs the address lookup for the `depth` or `breadth` executor, which differ only in one call.
    └─> AddressService.runDepth(args: LookupArguments): Promise<LookupResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:142]
       ↳ Prints every call stack above and below each callable.
      └─> AddressService.locate(…): Promise<string | { identified: { address: string; id: string; }[]; workspace: LocatedWorkspace; }> [projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:64]
         ↳ Traces the selection, then matches every address against it. All or nothing, like the command line.
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

**3. `gateBatchExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 gateBatchExecutor(…): Promise<Record<string, GateBatchTaskResult>> [projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:27]
   ↳ Gates every task Nx batched from one shared trace, judging each task by its own project's findings.
  └─> PluginService.runGateBatch(args: RunGateBatchArguments): Promise<Record<string, RunTraceResult>> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:377]
     ↳ Gates every task of a batch from one trace of their combined scope, judging each task by the projects it owns.
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

<details>
<summary>4 more call stacks</summary>

**4. `gateExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 gateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/executor.ts:16]
   ↳ Fails one project's task when its call stacks break their limits. Prints only the deciding stacks.
  └─> PluginService.runGate(args: RunGateArguments): Promise<RunTraceResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:357]
     ↳ Traces the resolved directories and judges the findings against each in-scope project's declared limits.
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

**5. `traceExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 traceExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/callidescope/callidescope-nx/src/executors/trace/executor.ts:15]
   ↳ Traces one selection of Nx projects, defaulting to the target's own project when none are named.
  └─> PluginService.runTrace(args: RunTraceArguments): Promise<RunTraceResult> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:408]
     ↳ Traces the resolved directories and renders the report, judged by the gate's predicate.
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

**6. `anonymous`** — depth ≥ 8 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/callidescope/callidescope-nx/src/index.ts:53]
  └─> PluginService.inferTargets(args: InferTargetsArguments): Promise<Map<string, InferredTargets>> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:272]
     ↳ Infers this plugin's targets onto every project holding a tsconfig at `projectTsconfigPath`, skipping the workspace…
    └─> PluginService.buildExclusionFilter(…): Promise<FileFilter> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:76]
       ↳ Builds the predicate for projects the workspace configuration excludes from every trace.
      └─> PluginService.loadWorkspaceConfiguration(…): Promise<ResolvedCallidescopeConfiguration | undefined> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:208]
         ↳ Loads the workspace configuration, or `undefined` when it cannot be read.
        └─> ConfigurationService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:64]
           ↳ Loads a configuration, and says what the file itself declared and which file answered.
          └─> ConfigurationFileService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:201]
             ↳ Loads a configuration, returning the authored object and the file it came from.
            └─> ConfigurationFileService.resolveConfigurationPath(configurationPath: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:95]
               ↳ Resolves a configuration path against the working directory, and nothing else.
              └─> ConfigurationFileNotFoundError.constructor(filePath: string): ConfigurationFileNotFoundError [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:251]
```

**7. `resolveProjectsService`** — depth 2 · orphan-root

```text
🚀 resolveProjectsService(): Promise<ProjectsService> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:39]
   ↳ Resolves the service that reads the workspace's Nx project graph.
  └─> resolvePluginContext(): Promise<INestApplicationContext> [projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:49]
     ↳ Builds or returns this process's NestJS context, caching the pending promise on `globalThis` so concurrent callers…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `runAddressExecutor` | 7 | `filter(…)`, `resolveExecutorScope`, `resolveOptionsService`, `resolveAddressService`, `OptionsService.readLookupOptions`, `AddressService.runDepth`, `AddressService.runBreadth` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.utilities.ts:17` |
| `ProjectsService.resolveProjectNames` | 6 | `ProjectsService.readProjects`, `ProjectsService.map(…)`, `ProjectsService.resolveTaggedNames`, `ProjectsService.map(…)`, `ProjectsService.readTags`, `ProjectsService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:147` |
| `traceExecutor` | 6 | `resolveExecutorScope`, `resolveOptionsService`, `resolvePluginService`, `PluginService.runTrace`, `OptionsService.readConfiguration`, `OptionsService.readFormat` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/trace/executor.ts:15` |

<details>
<summary>42 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `OptionsService.readStringList` | 5 | `OptionsService.isUnknownArray`, `OptionsService.filter(…)`, `OptionsService.map(…)`, `OptionsService.flatMap(…)`, `OptionsService.filter(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:97` |
| `PluginService.inferTargets` | 5 | `OptionsService.resolvePluginOptions`, `PluginService.buildExclusionFilter`, `PluginService.holdsProgram`, `PluginService.buildInferredTargets`, `PluginService.isExcludedProject` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:272` |
| `PluginService.runTrace` | 5 | `RunConfigurationService.load`, `CallidescopeService.trace`, `VerdictService.judge`, `MarkdownReportService.renderRun`, `VerdictService.explain` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:408` |
| `resolveExecutorScope` | 5 | `resolveOptionsService`, `OptionsService.readStringList`, `resolvePluginService`, `PluginService.resolveTraceScope`, `PluginService.describeRefusedScope` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.utilities.ts:15` |
| `gateExecutor` | 5 | `resolveExecutorScope`, `resolveOptionsService`, `resolvePluginService`, `PluginService.runGate`, `OptionsService.readConfiguration` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/executor.ts:16` |
| `OptionsService.resolvePluginOptions` | 4 | `ConfigurationService.requireConfigurationPath`, `OptionsService.readString`, `ConfigurationService.requireProjectConfigurationPath`, `ConfigurationService.requireProjectTsconfigPath` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:113` |
| `PluginService.buildExclusionFilter` | 4 | `PluginService.loadWorkspaceConfiguration`, `ProjectConfigurationPathMismatchError.constructor`, `ProjectTsconfigPathMismatchError.constructor`, `FileFilterService.buildFileFilter` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:76` |
| `PluginService.resolveTraceScope` | 4 | `ProjectsService.readProjectGraph`, `ProjectsService.resolveProjectNames`, `ProjectsService.resolveDependencyClosure`, `ProjectsService.resolveDirectories` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:320` |
| `PluginService.runGateBatch` | 4 | `RunConfigurationService.load`, `CallidescopeService.trace`, `PluginService.flatMap(…)`, `PluginService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:377` |
| `anonymous` | 4 | `resolvePluginService`, `PluginService.inferTargets`, `filter(…)`, `map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/index.ts:53` |
| `gateBatchExecutor` | 4 | `map(…)`, `resolvePluginService`, `PluginService.runGateBatch`, `printFailures` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:27` |
| `AddressService.runBreadth` | 3 | `AddressService.locate`, `BreadthService.describeDirectCalls`, `AddressReportService.renderBreadthReports` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:98` |
| `AddressService.runDepth` | 3 | `AddressService.locate`, `AddressReportService.renderDepthReports`, `AddressService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:142` |
| `ProjectsService.toDirectories` | 3 | `ProjectsService.map(…)`, `ProjectsService.readProjects`, `ProjectsService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:185` |
| `PluginService.renderGateVerdict` | 3 | `VerdictService.judge`, `VerdictService.explain`, `MarkdownReportService.renderFindings` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:227` |
| `PluginService.runGate` | 3 | `RunConfigurationService.load`, `CallidescopeService.trace`, `PluginService.renderGateVerdict` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:357` |
| `resolveTask` | 3 | `resolveOptionsService`, `resolveExecutorScope`, `OptionsService.readConfiguration` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:88` |
| `AddressService.identify` | 2 | `AddressLookupService.resolve`, `AddressLookupService.describeProblem` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:40` |
| `AddressService.locate` | 2 | `AddressLookupService.locate`, `AddressService.identify` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:64` |
| `AddressService.map(…)` | 2 | `AddressDepthService.buildDownwardStacks`, `AddressDepthService.buildUpwardStacks` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/address/address.service.ts:155` |
| `OptionsService.readLookupOptions` | 2 | `OptionsService.readConfiguration`, `OptionsService.readFormat` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:80` |
| `ProjectsService.readTags` | 2 | `ProjectsService.toSorted(…)`, `ProjectsService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:29` |
| `ProjectsService.resolveTaggedNames` | 2 | `ProjectsService.filter(…)`, `ProjectsService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:39` |
| `ProjectsService.readProjects` | 2 | `ProjectsService.toSorted(…)`, `ProjectsService.map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:73` |
| `ProjectsService.resolveDependencyClosure` | 2 | `ProjectsService.filter(…)`, `ProjectsService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:87` |
| `ProjectsService.resolveDirectories` | 2 | `ProjectsService.resolveProjectNames`, `ProjectsService.toDirectories` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/projects/projects.service.ts:127` |
| `VerdictService.judge` | 2 | `ProjectReportsService.findOwnedFindings`, `ProjectReportsService.findUnreadProjects` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/verdict/verdict.service.ts:48` |
| `OptionsService.readConfiguration` | 1 | `ConfigurationService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:59` |
| `OptionsService.readFormat` | 1 | `OptionsService.find(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/options/options.service.ts:70` |
| `RunConfigurationService.load` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/run-configuration/run-configuration.service.ts:35` |
| `reportUnreadProjects` | 1 | `map(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.constants.ts:42` |
| `VerdictService.explain` | 1 | `reportUnreadProjects` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/verdict/verdict.service.ts:36` |
| `PluginService.loadWorkspaceConfiguration` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:208` |
| `PluginService.describeRefusedScope` | 1 | `PluginService.filter(…)` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:255` |
| `PluginService.map(…)` | 1 | `PluginService.renderGateVerdict` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin.service.ts:394` |
| `resolveAddressService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:18` |
| `resolveOptionsService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:25` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:32` |
| `resolveProjectsService` | 1 | `resolvePluginContext` | `projects/ic-suite/callidescope/callidescope-nx/src/modules/plugin/plugin-context.utilities.ts:39` |
| `breadthExecutor` | 1 | `runAddressExecutor` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/breadth/executor.ts:11` |
| `depthExecutor` | 1 | `runAddressExecutor` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/depth/executor.ts:11` |
| `map(…)` | 1 | `resolveTask` | `projects/ic-suite/callidescope/callidescope-nx/src/executors/gate/batch-executor.ts:31` |

</details>
<!-- callidescope:end -->
