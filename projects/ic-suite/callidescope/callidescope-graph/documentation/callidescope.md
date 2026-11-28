<!-- callidescope:start -->

## 🔬 Callidescope

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
🚀 ProgramService.resolveProjectFiles(project: WorkspaceProject): readonly string[] [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:202]
  └─> ProgramService.buildProgram(args: { project: WorkspaceProject; workspaceRoot: string; }): ProjectProgram [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:102]
     ↳ Builds one project's program, checker, and owned-file set.
    └─> CompilerHostService.createHost(args: { options: ts.CompilerOptions; workspaceRoot: string; }): ts.CompilerHost [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:99]
       ↳ Creates a compiler host that reuses parsed source files. `setParentNodes` is on because the package reads…
      └─> CompilerHostService.resolveModuleCache(options: ts.CompilerOptions, workspaceRoot: string): ts.ModuleResolutionCache [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:63]
         ↳ Returns the module resolution cache for one working directory.
        └─> CompilerHostService.createModuleResolutionCache(…)(fileName: string): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:75]
```

**2. `CallablesService.visit`** — depth 5 · orphan-root

```text
🚀 CallablesService.visit(node: ts.Node): void [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:49]
  └─> CallablesService.describe(args: DescribeCallableArguments): DiscoveredCallable [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:117]
     ↳ Turns one declaration into a fully described node.
    └─> CallableIdentityService.readDisplayName(declaration: CallableDeclaration): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:119]
       ↳ Builds the qualified name a report prints for a callable.
      └─> CallableIdentityService.readMemberName(declaration: CallableDeclaration): string [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:181]
         ↳ Reads the member name, falling back to the shape it was written in.
        └─> CallableIdentityService.readBindingName(node: ts.Node): string | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:47]
           ↳ Reads the name a property, variable, or parameter declaration binds.
```

**3. `FileFilterService.isExcluded`** — depth ≥ 4 · orphan-root

```text
🚀 FileFilterService.isExcluded(workspaceRelativePath: string): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:152]
  └─> FileFilterService.isExcludedByOwningProject(…): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:46]
     ↳ True when the project owning a file excludes it with its own glob, matched relative to that project's root.
    └─> WorkspaceService.resolveOwningProject(…): WorkspaceProject | undefined [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:225]
       ↳ Names the traced project whose root most narrowly contains a file, or `undefined` when none does.
      └─> WorkspaceService.isContainedByRoot(args: { root: string; workspaceRelativePath: string; }): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:105]
         ↳ True when a project's root is a path-segment prefix of a file's path; the empty root contains every file.
```

<details>
<summary>1 more call stacks</summary>

**4. `FileFilterService.isExcluded`** — depth 2 · orphan-root

```text
🚀 FileFilterService.isExcluded(workspaceRelativePath: string): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:134]
  └─> FileFilterService.some(…)(glob: string): boolean [projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:136]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CallablesService.describe` | 8 | `CallableIdentityService.readDisplayName`, `CallableIdentityService.readEnclosingTypeName`, `CallableIdentityService.buildId`, `CallableIdentityService.isExported`, `CallableIdentityService.readKind`, `CallableIdentityService.readLocation`, `CallableIdentityService.readMemberName`, `CallableIdentityService.countStatements` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:117` |
| `EdgesService.buildSiteEdges` | 7 | `EdgesService.collectCallbackEdges`, `EdgesService.resolveSite`, `EdgesService.filter(…)`, `EdgesService.filter(…)`, `EdgesService.map(…)`, `EdgesService.filter(…)`, `EdgesService.readLocation` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:58` |
| `SymbolResolutionService.resolveSymbol` | 6 | `SymbolResolutionService.unwrapAlias`, `SymbolResolutionService.every(…)`, `SymbolResolutionService.readBodied`, `SymbolResolutionService.readResolution`, `SymbolResolutionService.find(…)`, `SymbolResolutionService.resolveThroughHierarchy` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:154` |

<details>
<summary>96 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `WorkspaceService.discoverProjects` | 5 | `WorkspaceService.map(…)`, `WorkspaceService.findAllProjectDirectories`, `WorkspaceService.isExcludedProject`, `ProgramConfigurationError.constructor`, `WorkspaceService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:152` |
| `ProgramService.assignOwnership` | 5 | `ProgramService.toRealPath`, `ProgramService.map(…)`, `WorkspaceService.toWorkspaceRelative`, `WorkspaceService.resolveOwningProject`, `ProgramService.find(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:51` |
| `EntriesService.resolve` | 5 | `EntriesService.toRules`, `EntriesService.map(…)`, `EntriesService.classifyEveryCallable`, `EntriesService.rootDeclaredAddresses`, `EntriesService.promoteOrphans` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:280` |
| `GraphAssemblyService.assemble` | 5 | `GraphService.assemble`, `EdgesService.build`, `ComponentsService.condense`, `BreadthService.measure`, `GraphDepthService.measure` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph-assembly.service.ts:43` |
| `AddressService.resolve` | 4 | `AddressService.parseAddress`, `AddressService.describeInvalidAddress`, `AddressService.findMatches`, `AddressService.toCandidates` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:208` |
| `ClassesService.resolveImplementations` | 4 | `ClassesService.collectDerived`, `ClassesService.filter(…)`, `ClassesService.filterAssignable`, `ClassesService.flatMap(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:190` |
| `DocumentationService.read` | 4 | `DocumentationService.readSymbol`, `DocumentationService.readSummary`, `DocumentationService.filter(…)`, `DocumentationService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/documentation/documentation.service.ts:65` |
| `AddressService.describeCandidates` | 3 | `AddressService.countCandidatesByLine`, `AddressService.some(…)`, `AddressService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:159` |
| `AddressService.listAddresses` | 3 | `AddressService.toAddress`, `AddressService.map(…)`, `AddressService.toSorted(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:185` |
| `ProgramService.buildProgram` | 3 | `ProgramService.parseConfiguration`, `CompilerHostService.createHost`, `ProgramService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:102` |
| `ProgramService.parseConfiguration` | 3 | `ProgramService.readJsonConfigFile(…)`, `ProgramConfigurationError.constructor`, `ProgramService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:131` |
| `ProgramService.buildPrograms` | 3 | `WorkspaceService.walkImportedProjectClosure`, `ProgramService.toSorted(…)`, `ProgramService.assignOwnership` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:194` |
| `CallablesService.collectFromProgram` | 3 | `CallablesService.readOwnedPath`, `WorkspaceService.isTestFile`, `CallablesService.collectFromFile` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:72` |
| `ClassesService.indexProgram` | 3 | `ExternalService.isExternal`, `ClassesService.indexMembers`, `ClassesService.indexHeritage` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:168` |
| `EdgesService.collectCallbackEdges` | 3 | `EdgesService.map(…)`, `EdgesService.filter(…)`, `EdgesService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:126` |
| `EntriesService.classify` | 3 | `EntriesService.hasConfiguredDecorator`, `EntriesService.isCommandRunnerMethod`, `EntriesService.isBootstrapFunction` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:58` |
| `ComponentsService.condense` | 3 | `ComponentsService.openNode`, `ComponentsService.step`, `ComponentsService.buildSuccessors` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/components.service.ts:169` |
| `AddressService.parseAddress` | 2 | `AddressService.parseSymbolPath`, `AddressService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:83` |
| `CallableIdentityService.readDisplayName` | 2 | `CallableIdentityService.readMemberName`, `CallableIdentityService.readEnclosingTypeName` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:119` |
| `CallableIdentityService.readMemberName` | 2 | `CallableIdentityService.readBindingName`, `CallableIdentityService.describeCallbackArgument` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:181` |
| `WorkspaceService.findProjectDirectories` | 2 | `WorkspaceService.toWorkspaceRelative`, `WorkspaceService.isExcludedFromScan` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:64` |
| `WorkspaceService.walkImportedProjectClosure` | 2 | `WorkspaceService.resolveOwningProject`, `WorkspaceService.isClosureDestination` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:264` |
| `FileFilterService.isExcludedByOwningProject` | 2 | `WorkspaceService.resolveOwningProject`, `FileFilterService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:46` |
| `CompilerHostService.createHost` | 2 | `CompilerHostService.resolveModuleCache`, `CompilerHostService.memoize` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:99` |
| `ProgramService.readPulledInPaths` | 2 | `ProgramService.toRealPath`, `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:163` |
| `ProgramService.resolveProjectFiles` | 2 | `ProgramService.buildProgram`, `ProgramService.readPulledInPaths` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:202` |
| `CallablesService.visit` | 2 | `CallablesService.isCallableDeclaration`, `CallablesService.describe` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:49` |
| `CallablesService.readOwnedPath` | 2 | `ProgramService.toRealPath`, `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:159` |
| `ClassesService.readMemberDeclarations` | 2 | `ClassesService.filter(…)`, `ClassesService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:138` |
| `CallSitesService.visit` | 2 | `CallSitesService.isNestedBody`, `CallSitesService.readFunctionArguments` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/call-sites.service.ts:61` |
| `SymbolResolutionService.resolveThroughHierarchy` | 2 | `SymbolResolutionService.readOwner`, `ClassesService.resolveImplementations` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:203` |
| `SymbolResolutionService.resolve` | 2 | `SymbolResolutionService.readCalleeName`, `SymbolResolutionService.resolveSymbol` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:253` |
| `EdgesService.readLocation` | 2 | `WorkspaceService.toWorkspaceRelative`, `ProgramService.toRealPath` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:171` |
| `EdgesService.resolveCallableId` | 2 | `WorkspaceService.toWorkspaceRelative`, `ProgramService.toRealPath` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:194` |
| `EdgesService.resolveSite` | 2 | `SymbolResolutionService.resolveConstructor`, `SymbolResolutionService.resolve` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:218` |
| `EdgesService.build` | 2 | `CallSitesService.collect`, `EdgesService.buildSiteEdges` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:243` |
| `EntriesService.classifyEveryCallable` | 2 | `EntriesService.classify`, `EntriesService.readRules` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:93` |
| `EntriesService.hasConfiguredDecorator` | 2 | `EntriesService.some(…)`, `EntriesService.readDecoratorNames` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:108` |
| `EntriesService.rootDeclaredAddresses` | 2 | `EntriesService.listDeclaringConfigurations`, `EntriesService.rootDeclaredAddress` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:239` |
| `GraphService.assemble` | 2 | `GraphService.append`, `GraphService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/graph.service.ts:44` |
| `GraphDepthService.measure` | 2 | `GraphDepthService.combine`, `GraphDepthService.hasUnresolved` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/graph-depth.service.ts:95` |
| `ComponentsService.finishFrame` | 2 | `ComponentsService.closeNode`, `ComponentsService.liftLowLink` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/components.service.ts:58` |
| `ComponentsService.step` | 2 | `ComponentsService.finishFrame`, `ComponentsService.visitSuccessor` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/components.service.ts:102` |
| `ComponentsService.visitSuccessor` | 2 | `ComponentsService.openNode`, `ComponentsService.liftLowLink` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/components.service.ts:125` |
| `PathsService.buildDeepestPath` | 2 | `PathsService.orderMembers`, `PathsService.buildFrame` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/paths.service.ts:54` |
| `PathsService.buildFrame` | 2 | `DocumentationService.read`, `SignaturesService.read` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/paths.service.ts:95` |
| `AddressDepthService.toStack` | 2 | `PathsService.buildFrame`, `AddressDepthService.isLowerBound` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:100` |
| `AddressDepthService.buildDownwardStacks` | 2 | `AddressDepthService.traverse`, `AddressDepthService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:163` |
| `AddressDepthService.buildUpwardStacks` | 2 | `AddressDepthService.traverse`, `AddressDepthService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:186` |
| `AddressService.toCandidates` | 1 | `AddressService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:131` |
| `AddressService.map(…)` | 1 | `AddressService.toAddress` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/address.service.ts:196` |
| `CallableIdentityService.isExported` | 1 | `CallableIdentityService.findAncestor(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:99` |
| `CallableIdentityService.readEnclosingTypeName` | 1 | `CallableIdentityService.findAncestor(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:127` |
| `CallableIdentityService.readKind` | 1 | `CallableIdentityService.readBoundKind` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callable-identity.service.ts:140` |
| `WorkspaceService.findAllProjectDirectories` | 1 | `WorkspaceService.findProjectDirectories` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:43` |
| `WorkspaceService.isExcludedProject` | 1 | `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:131` |
| `WorkspaceService.map(…)` | 1 | `WorkspaceService.toWorkspaceRelative` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:155` |
| `WorkspaceService.resolveOwningProject` | 1 | `WorkspaceService.isContainedByRoot` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/workspace.service.ts:225` |
| `FileFilterService.buildFileFilter` | 1 | `FileFilterService.listIgnoredFiles` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:110` |
| `FileFilterService.isExcluded` | 1 | `FileFilterService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:134` |
| `FileFilterService.isExcluded` | 1 | `FileFilterService.isExcludedByOwningProject` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/workspace/file-filter.service.ts:152` |
| `CompilerHostService.resolveModuleCache` | 1 | `CompilerHostService.createModuleResolutionCache(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/compiler-host.service.ts:63` |
| `ProgramService.map(…)` | 1 | `ProgramService.toRealPath` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/program/program.service.ts:120` |
| `CallablesService.collect` | 1 | `CallablesService.collectFromProgram` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/callables/callables.service.ts:183` |
| `ExternalService.isExternal` | 1 | `ExternalService.computeVerdict` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/external.service.ts:59` |
| `ClassesService.filterAssignable` | 1 | `ClassesService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:76` |
| `ClassesService.build` | 1 | `ClassesService.indexProgram` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:161` |
| `ClassesService.flatMap(…)` | 1 | `ClassesService.readMemberDeclarations` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/classes/classes.service.ts:218` |
| `CallSitesService.readFunctionArguments` | 1 | `CallSitesService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/call-sites.service.ts:41` |
| `CallSitesService.collect` | 1 | `CallSitesService.visit` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/call-sites.service.ts:53` |
| `SymbolResolutionService.readBodied` | 1 | `SymbolResolutionService.filter(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:83` |
| `SymbolResolutionService.filter(…)` | 1 | `SymbolResolutionService.isBodyCarrying` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:86` |
| `SymbolResolutionService.every(…)` | 1 | `ExternalService.isExternal` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:169` |
| `SymbolResolutionService.find(…)` | 1 | `SymbolResolutionService.isAbstractMember` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/symbol-resolution.service.ts:189` |
| `EdgesService.filter(…)` | 1 | `ExternalService.isExternal` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:76` |
| `EdgesService.map(…)` | 1 | `EdgesService.resolveCallableId` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:79` |
| `EdgesService.filter(…)` | 1 | `EdgesService.isExcludedCallee` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:88` |
| `EdgesService.map(…)` | 1 | `EdgesService.resolveCallableId` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:133` |
| `EdgesService.map(…)` | 1 | `EdgesService.readLocation` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:141` |
| `EdgesService.isExcludedCallee` | 1 | `EdgesService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/edges/edges.service.ts:157` |
| `EntriesService.isCommandRunnerMethod` | 1 | `EntriesService.hasConfiguredDecorator` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:126` |
| `EntriesService.promoteOrphans` | 1 | `EntriesService.readRules` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:157` |
| `EntriesService.readDecoratorNames` | 1 | `EntriesService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:178` |
| `EntriesService.rootDeclaredAddress` | 1 | `AddressService.resolve` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:210` |
| `EntriesService.map(…)` | 1 | `EntriesService.toRules` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/entries/entries.service.ts:288` |
| `BreadthService.describeDirectCalls` | 1 | `BreadthService.toReferences` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/breadth.service.ts:57` |
| `GraphDepthService.combine` | 1 | `GraphDepthService.foldSuccessors` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/graph-depth.service.ts:30` |
| `GraphDepthService.hasUnresolved` | 1 | `GraphDepthService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/graph-depth.service.ts:83` |
| `ComponentsService.buildSuccessors` | 1 | `ComponentsService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/traversal/components.service.ts:146` |
| `SignaturesService.read` | 1 | `SignaturesService.map(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/signatures/signatures.service.ts:60` |
| `SignaturesService.map(…)` | 1 | `SignaturesService.readParameter` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/signatures/signatures.service.ts:70` |
| `AddressDepthService.isLowerBound` | 1 | `AddressDepthService.some(…)` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:66` |
| `AddressDepthService.step` | 1 | `AddressDepthService.follow` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:74` |
| `AddressDepthService.traverse` | 1 | `AddressDepthService.step` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:134` |
| `AddressDepthService.map(…)` | 1 | `AddressDepthService.toStack` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:173` |
| `AddressDepthService.map(…)` | 1 | `AddressDepthService.toStack` | `projects/ic-suite/callidescope/callidescope-graph/src/modules/graph/modules/measurement/address-depth.service.ts:196` |

</details>
<!-- callidescope:end -->
