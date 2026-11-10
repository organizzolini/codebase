<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-graph`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 209 |
| Files | 64 |
| Calls traced | 201 |
| Call stacks | 4 |
| Deepest stack | 5 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 11 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `ProgramService.resolveProjectFiles`** — depth ≥ 5 · orphan-root

```text
🚀 ProgramService.resolveProjectFiles(project: WorkspaceProject): readonly string[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:262]
  └─> ProgramService.buildProgram(args: { project: WorkspaceProject; workspaceRoot: string; }): ProjectProgram [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:115]
     ↳ Builds one project's program, checker, and owned-file set.
    └─> CompilerHostService.createHost(args: { options: ts.CompilerOptions; workspaceRoot: string; }): ts.CompilerHost [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:119]
       ↳ Creates a compiler host that reuses already-parsed source files. `setParentNodes` is on because the rest of the package…
      └─> CompilerHostService.resolveModuleCache(options: ts.CompilerOptions, workspaceRoot: string): ts.ModuleResolutionCache [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:79]
         ↳ Returns the module resolution cache for one working directory.
        └─> CompilerHostService.createModuleResolutionCache(…)(fileName: string): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:91]
```

**2. `CallablesService.visit`** — depth 5 · orphan-root

```text
🚀 CallablesService.visit(node: ts.Node): void [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:49]
  └─> CallablesService.describe(args: DescribeCallableArguments): DiscoveredCallable [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:122]
     ↳ Turns one declaration into a fully described node.
    └─> CallableIdentityService.readDisplayName(declaration: CallableDeclaration): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:131]
       ↳ Builds the qualified name a report prints for a callable.
      └─> CallableIdentityService.readMemberName(declaration: CallableDeclaration): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:193]
         ↳ Reads the member name, falling back to the shape it was written in.
        └─> CallableIdentityService.readBindingName(node: ts.Node): string | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:50]
           ↳ Reads the name a property, variable, or parameter declaration binds.
```

**3. `FileFilterService.isExcluded`** — depth ≥ 4 · orphan-root

```text
🚀 FileFilterService.isExcluded(workspaceRelativePath: string): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:206]
  └─> FileFilterService.isExcludedByOwningProject(…): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:60]
     ↳ True when the project owning a file excludes it with a glob of its own.
    └─> WorkspaceService.resolveOwningProject(…): WorkspaceProject | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:271]
       ↳ Names the traced project whose root most narrowly contains a file. "Contains" means the deepest of `args.projects`…
      └─> WorkspaceService.isContainedByRoot(args: { root: string; workspaceRelativePath: string; }): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:115]
         ↳ True when a project's root is a path-segment prefix of a file's path.
```

<details>
<summary>1 more call stacks</summary>

**4. `FileFilterService.isExcluded`** — depth 2 · orphan-root

```text
🚀 FileFilterService.isExcluded(workspaceRelativePath: string): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:161]
  └─> FileFilterService.some(…)(glob: string): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:163]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CallablesService.describe` | 8 | `CallableIdentityService.readDisplayName`, `CallableIdentityService.readEnclosingTypeName`, `CallableIdentityService.buildId`, `CallableIdentityService.isExported`, `CallableIdentityService.readKind`, `CallableIdentityService.readLocation`, `CallableIdentityService.readMemberName`, `CallableIdentityService.countStatements` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:122` |
| `EdgesService.buildSiteEdges` | 7 | `EdgesService.collectCallbackEdges`, `EdgesService.resolveSite`, `EdgesService.filter(…)`, `EdgesService.filter(…)`, `EdgesService.map(…)`, `EdgesService.filter(…)`, `EdgesService.readLocation` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:59` |
| `SymbolResolutionService.resolveSymbol` | 6 | `SymbolResolutionService.unwrapAlias`, `SymbolResolutionService.every(…)`, `SymbolResolutionService.readBodied`, `SymbolResolutionService.readResolution`, `SymbolResolutionService.find(…)`, `SymbolResolutionService.resolveThroughHierarchy` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:165` |

<details>
<summary>96 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `WorkspaceService.discoverProjects` | 5 | `WorkspaceService.map(…)`, `WorkspaceService.findAllProjectDirectories`, `WorkspaceService.isExcludedProject`, `ProgramConfigurationError.constructor`, `WorkspaceService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:186` |
| `ProgramService.assignOwnership` | 5 | `ProgramService.toRealPath`, `ProgramService.map(…)`, `WorkspaceService.toWorkspaceRelative`, `WorkspaceService.resolveOwningProject`, `ProgramService.find(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:64` |
| `EntriesService.resolve` | 5 | `EntriesService.toRules`, `EntriesService.map(…)`, `EntriesService.classifyEveryCallable`, `EntriesService.rootDeclaredAddresses`, `EntriesService.promoteOrphans` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:312` |
| `GraphAssemblyService.assemble` | 5 | `GraphService.assemble`, `EdgesService.build`, `ComponentsService.condense`, `BreadthService.measure`, `GraphDepthService.measure` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43` |
| `AddressService.resolve` | 4 | `AddressService.parseAddress`, `AddressService.describeInvalidAddress`, `AddressService.findMatches`, `AddressService.toCandidates` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:235` |
| `ClassesService.resolveImplementations` | 4 | `ClassesService.collectDerived`, `ClassesService.filter(…)`, `ClassesService.filterAssignable`, `ClassesService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:204` |
| `DocumentationService.read` | 4 | `DocumentationService.readSymbol`, `DocumentationService.readSummary`, `DocumentationService.filter(…)`, `DocumentationService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/documentation/documentation.service.ts:78` |
| `AddressService.describeCandidates` | 3 | `AddressService.countCandidatesByLine`, `AddressService.some(…)`, `AddressService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:181` |
| `AddressService.listAddresses` | 3 | `AddressService.toAddress`, `AddressService.map(…)`, `AddressService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:212` |
| `ProgramService.buildProgram` | 3 | `ProgramService.parseConfiguration`, `CompilerHostService.createHost`, `ProgramService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:115` |
| `ProgramService.parseConfiguration` | 3 | `ProgramService.readJsonConfigFile(…)`, `ProgramConfigurationError.constructor`, `ProgramService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:147` |
| `ProgramService.buildPrograms` | 3 | `WorkspaceService.walkImportedProjectClosure`, `ProgramService.toSorted(…)`, `ProgramService.assignOwnership` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:254` |
| `CallablesService.collectFromProgram` | 3 | `CallablesService.readOwnedPath`, `WorkspaceService.isTestFile`, `CallablesService.collectFromFile` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:77` |
| `ClassesService.indexProgram` | 3 | `ExternalService.isExternal`, `ClassesService.indexMembers`, `ClassesService.indexHeritage` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:178` |
| `EdgesService.collectCallbackEdges` | 3 | `EdgesService.map(…)`, `EdgesService.filter(…)`, `EdgesService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:127` |
| `EntriesService.classify` | 3 | `EntriesService.hasConfiguredDecorator`, `EntriesService.isCommandRunnerMethod`, `EntriesService.isBootstrapFunction` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:67` |
| `ComponentsService.condense` | 3 | `ComponentsService.openNode`, `ComponentsService.step`, `ComponentsService.buildSuccessors` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/components.service.ts:183` |
| `AddressService.parseAddress` | 2 | `AddressService.parseSymbolPath`, `AddressService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:89` |
| `CallableIdentityService.readDisplayName` | 2 | `CallableIdentityService.readMemberName`, `CallableIdentityService.readEnclosingTypeName` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:131` |
| `CallableIdentityService.readMemberName` | 2 | `CallableIdentityService.readBindingName`, `CallableIdentityService.describeCallbackArgument` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:193` |
| `WorkspaceService.findProjectDirectories` | 2 | `WorkspaceService.toWorkspaceRelative`, `WorkspaceService.isExcludedFromScan` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:66` |
| `WorkspaceService.walkImportedProjectClosure` | 2 | `WorkspaceService.resolveOwningProject`, `WorkspaceService.isClosureDestination` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:342` |
| `FileFilterService.isExcludedByOwningProject` | 2 | `WorkspaceService.resolveOwningProject`, `FileFilterService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:60` |
| `CompilerHostService.createHost` | 2 | `CompilerHostService.resolveModuleCache`, `CompilerHostService.memoize` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:119` |
| `ProgramService.readPulledInPaths` | 2 | `ProgramService.toRealPath`, `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:195` |
| `ProgramService.resolveProjectFiles` | 2 | `ProgramService.buildProgram`, `ProgramService.readPulledInPaths` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:262` |
| `CallablesService.visit` | 2 | `CallablesService.isCallableDeclaration`, `CallablesService.describe` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:49` |
| `CallablesService.readOwnedPath` | 2 | `ProgramService.toRealPath`, `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:164` |
| `ClassesService.readMemberDeclarations` | 2 | `ClassesService.filter(…)`, `ClassesService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:148` |
| `CallSitesService.visit` | 2 | `CallSitesService.isNestedBody`, `CallSitesService.readFunctionArguments` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/call-sites.service.ts:62` |
| `SymbolResolutionService.resolveThroughHierarchy` | 2 | `SymbolResolutionService.readOwner`, `ClassesService.resolveImplementations` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:217` |
| `SymbolResolutionService.resolve` | 2 | `SymbolResolutionService.readCalleeName`, `SymbolResolutionService.resolveSymbol` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:267` |
| `EdgesService.readLocation` | 2 | `WorkspaceService.toWorkspaceRelative`, `ProgramService.toRealPath` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:176` |
| `EdgesService.resolveCallableId` | 2 | `WorkspaceService.toWorkspaceRelative`, `ProgramService.toRealPath` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:202` |
| `EdgesService.resolveSite` | 2 | `SymbolResolutionService.resolveConstructor`, `SymbolResolutionService.resolve` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:226` |
| `EdgesService.build` | 2 | `CallSitesService.collect`, `EdgesService.buildSiteEdges` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:251` |
| `EntriesService.classifyEveryCallable` | 2 | `EntriesService.classify`, `EntriesService.readRules` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:102` |
| `EntriesService.hasConfiguredDecorator` | 2 | `EntriesService.some(…)`, `EntriesService.readDecoratorNames` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:117` |
| `EntriesService.rootDeclaredAddresses` | 2 | `EntriesService.listDeclaringConfigurations`, `EntriesService.rootDeclaredAddress` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:262` |
| `PathsService.buildDeepestPath` | 2 | `PathsService.orderMembers`, `PathsService.buildFrame` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/paths.service.ts:59` |
| `PathsService.buildFrame` | 2 | `DocumentationService.read`, `SignaturesService.read` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/paths.service.ts:103` |
| `AddressDepthService.toStack` | 2 | `PathsService.buildFrame`, `AddressDepthService.isLowerBound` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:105` |
| `AddressDepthService.buildDownwardStacks` | 2 | `AddressDepthService.traverse`, `AddressDepthService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:172` |
| `AddressDepthService.buildUpwardStacks` | 2 | `AddressDepthService.traverse`, `AddressDepthService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:195` |
| `ComponentsService.finishFrame` | 2 | `ComponentsService.closeNode`, `ComponentsService.liftLowLink` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/components.service.ts:72` |
| `ComponentsService.step` | 2 | `ComponentsService.finishFrame`, `ComponentsService.visitSuccessor` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/components.service.ts:116` |
| `ComponentsService.visitSuccessor` | 2 | `ComponentsService.openNode`, `ComponentsService.liftLowLink` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/components.service.ts:139` |
| `GraphDepthService.measure` | 2 | `GraphDepthService.combine`, `GraphDepthService.hasUnresolved` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-depth.service.ts:95` |
| `GraphService.assemble` | 2 | `GraphService.append`, `GraphService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph.service.ts:44` |
| `AddressService.toCandidates` | 1 | `AddressService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:137` |
| `AddressService.map(…)` | 1 | `AddressService.toAddress` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:223` |
| `CallableIdentityService.isExported` | 1 | `CallableIdentityService.findAncestor(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:111` |
| `CallableIdentityService.readEnclosingTypeName` | 1 | `CallableIdentityService.findAncestor(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:139` |
| `CallableIdentityService.readKind` | 1 | `CallableIdentityService.readBoundKind` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:152` |
| `WorkspaceService.findAllProjectDirectories` | 1 | `WorkspaceService.findProjectDirectories` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:44` |
| `WorkspaceService.isExcludedProject` | 1 | `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:145` |
| `WorkspaceService.map(…)` | 1 | `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:189` |
| `WorkspaceService.resolveOwningProject` | 1 | `WorkspaceService.isContainedByRoot` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:271` |
| `FileFilterService.buildFileFilter` | 1 | `FileFilterService.listIgnoredFiles` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:137` |
| `FileFilterService.isExcluded` | 1 | `FileFilterService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:161` |
| `FileFilterService.isExcluded` | 1 | `FileFilterService.isExcludedByOwningProject` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:206` |
| `CompilerHostService.resolveModuleCache` | 1 | `CompilerHostService.createModuleResolutionCache(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:79` |
| `ProgramService.map(…)` | 1 | `ProgramService.toRealPath` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:133` |
| `CallablesService.collect` | 1 | `CallablesService.collectFromProgram` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:191` |
| `ExternalService.isExternal` | 1 | `ExternalService.computeVerdict` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/external.service.ts:64` |
| `ClassesService.filterAssignable` | 1 | `ClassesService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:86` |
| `ClassesService.build` | 1 | `ClassesService.indexProgram` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:171` |
| `ClassesService.flatMap(…)` | 1 | `ClassesService.readMemberDeclarations` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:232` |
| `CallSitesService.readFunctionArguments` | 1 | `CallSitesService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/call-sites.service.ts:42` |
| `CallSitesService.collect` | 1 | `CallSitesService.visit` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/call-sites.service.ts:54` |
| `SymbolResolutionService.readBodied` | 1 | `SymbolResolutionService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:88` |
| `SymbolResolutionService.filter(…)` | 1 | `SymbolResolutionService.isBodyCarrying` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:91` |
| `SymbolResolutionService.every(…)` | 1 | `ExternalService.isExternal` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:183` |
| `SymbolResolutionService.find(…)` | 1 | `SymbolResolutionService.isAbstractMember` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:203` |
| `EdgesService.filter(…)` | 1 | `ExternalService.isExternal` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:77` |
| `EdgesService.map(…)` | 1 | `EdgesService.resolveCallableId` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:80` |
| `EdgesService.filter(…)` | 1 | `EdgesService.isExcludedCallee` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:89` |
| `EdgesService.map(…)` | 1 | `EdgesService.resolveCallableId` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:134` |
| `EdgesService.map(…)` | 1 | `EdgesService.readLocation` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:142` |
| `EdgesService.isExcludedCallee` | 1 | `EdgesService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:162` |
| `EntriesService.isCommandRunnerMethod` | 1 | `EntriesService.hasConfiguredDecorator` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:135` |
| `EntriesService.promoteOrphans` | 1 | `EntriesService.readRules` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:171` |
| `EntriesService.readDecoratorNames` | 1 | `EntriesService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:192` |
| `EntriesService.rootDeclaredAddress` | 1 | `AddressService.resolve` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:233` |
| `EntriesService.map(…)` | 1 | `EntriesService.toRules` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:320` |
| `SignaturesService.read` | 1 | `SignaturesService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/signatures/signatures.service.ts:62` |
| `SignaturesService.map(…)` | 1 | `SignaturesService.readParameter` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/signatures/signatures.service.ts:72` |
| `AddressDepthService.isLowerBound` | 1 | `AddressDepthService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:71` |
| `AddressDepthService.step` | 1 | `AddressDepthService.follow` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:79` |
| `AddressDepthService.traverse` | 1 | `AddressDepthService.step` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:143` |
| `AddressDepthService.map(…)` | 1 | `AddressDepthService.toStack` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:182` |
| `AddressDepthService.map(…)` | 1 | `AddressDepthService.toStack` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/address-depth.service.ts:205` |
| `BreadthService.describeDirectCalls` | 1 | `BreadthService.toReferences` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/breadth.service.ts:59` |
| `ComponentsService.buildSuccessors` | 1 | `ComponentsService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/components.service.ts:160` |
| `GraphDepthService.combine` | 1 | `GraphDepthService.foldSuccessors` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-depth.service.ts:30` |
| `GraphDepthService.hasUnresolved` | 1 | `GraphDepthService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-depth.service.ts:83` |

</details>
<!-- callidescope:end -->
