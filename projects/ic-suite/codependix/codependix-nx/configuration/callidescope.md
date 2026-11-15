<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 95 |
| Files | 28 |
| Calls traced | 121 |
| Call stacks | 3 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 5 |

### Call stacks (depth)

**1. `anonymous`** — depth ≥ 6 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/codependix/codependix-nx/src/index.ts:45]
  └─> resolveToolInputs(args: ResolveToolInputsArguments): InferredInput[] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:65]
     ↳ The cache inputs that tie a gate to the codependix command line it runs.
    └─> resolveWorkspaceInputs(…): InferredInput[] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:209]
       ↳ Globs over the sources and manifest of the command line and of every workspace package it reaches, sorted so the cache…
      └─> collectWorkspacePackages(cliDirectory: string): WorkspacePackages [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:103]
         ↳ Collects a workspace package and every workspace package it reaches, development dependencies included: a package this…
        └─> readDependencies(directory: string): [string, unknown][] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:41]
           ↳ Every dependency a package's manifest declares, in either map.
          └─> readManifest(directory: string): Record<string, unknown> [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:173]
             ↳ Reads a package directory's manifest, or an empty one when there is none or it cannot be parsed — which leaves that…
```

**2. `gateBatchExecutor`** — depth ≥ 6 · orphan-root

```text
🚀 gateBatchExecutor(…): Promise<Record<string, GateBatchTaskResult>> [projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:33]
   ↳ Judges every gate task Nx batched for this executor from as few command line runs as it can.
  └─> resolveTask(…): ResolvedTask [projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:93]
     ↳ Resolves one task's configuration path, or the failure that earns it.
    └─> GateService.resolveConfigurationPath(args: { configuration?: string | undefined; workspaceRoot: string; }): string [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:186]
       ↳ Resolves the configuration path one gate runs with.
      └─> PluginService.resolvePluginOptions(args: ResolvePluginOptionsArguments): CodependixPluginOptions [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:156]
         ↳ Resolves the effective plugin options from an untrusted value. `configurationPath` is required and never searched for:…
        └─> ConfigurationService.requireConfigurationPath(configurationPath: string | undefined, surface: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:309]
           ↳ Returns the main configuration path, refusing one that is missing.
          └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:304]
```

**3. `gateExecutor`** — depth ≥ 6 · orphan-root

```text
🚀 gateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts:21]
   ↳ Fails one project's task when a codependix boundary finding is charged to it.
  └─> GateService.run(args: RunGateArguments): Promise<boolean> [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:240]
     ↳ Runs one gate, and settles on whether it passed.
    └─> GateService.resolveConfigurationPath(args: { configuration?: string | undefined; workspaceRoot: string; }): string [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:186]
       ↳ Resolves the configuration path one gate runs with.
      └─> PluginService.resolvePluginOptions(args: ResolvePluginOptionsArguments): CodependixPluginOptions [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:156]
         ↳ Resolves the effective plugin options from an untrusted value. `configurationPath` is required and never searched for:…
        └─> ConfigurationService.requireConfigurationPath(configurationPath: string | undefined, surface: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:309]
           ↳ Returns the main configuration path, refusing one that is missing.
          └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:304]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GateService.run` | 5 | `GateService.resolveSelection`, `GateService.judgesOwnProject`, `GateService.buildCommandArguments`, `GateService.resolveConfigurationPath`, `GateService.spawnCommandLine` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:240` |
| `BatchService.judgeRun` | 5 | `BatchService.captureCommandLine`, `BatchService.failAll`, `readChargedProjects`, `BatchService.some(…)`, `BatchService.explainFailure` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:224` |
| `resolveToolInputs` | 5 | `locatePackage`, `warnUnresolved`, `isInsideWorkspace`, `resolveWorkspaceInputs`, `resolveExternalInputs` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:65` |

<details>
<summary>41 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `anonymous` | 5 | `resolvePluginService`, `PluginService.inferTargets`, `resolveToolInputs`, `resolveTsconfigInputs`, `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/index.ts:45` |
| `gateBatchExecutor` | 5 | `resolveBatchService`, `resolveGateService`, `resolveTask`, `BatchService.runBatch`, `printFailures` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:33` |
| `PluginService.readRegisteredOptions` | 4 | `PluginService.toRecord`, `PluginService.isUnknownArray`, `PluginService.find(…)`, `PluginService.map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:134` |
| `GateService.resolveConfigurationPath` | 4 | `ConfigurationService.requireConfigurationPath`, `PluginService.resolvePluginOptions`, `PluginService.readRegisteredOptions`, `GateService.readNxConfiguration` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:186` |
| `BatchService.groupOrSettle` | 4 | `GateService.resolveSelection`, `GateService.judgesOwnProject`, `BatchService.runAlone`, `describeError` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:164` |
| `collectWorkspacePackages` | 4 | `map(…)`, `filter(…)`, `readDependencies`, `locatePackage` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:103` |
| `followExtendsChain` | 4 | `readRegistryDependencies`, `readExtends`, `resolveExtendedBase`, `warnSkipped` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:89` |
| `resolveExtendedBase` | 4 | `resolvePathBase`, `resolvePackageBase`, `isInsideWorkspace`, `readInstalledPackageName` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:204` |
| `PluginService.selectProjectRoots` | 3 | `PluginService.filter(…)`, `PluginService.map(…)`, `PluginService.filter(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:65` |
| `PluginService.inferTargets` | 3 | `PluginService.resolvePluginOptions`, `PluginService.map(…)`, `PluginService.selectProjectRoots` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:99` |
| `PluginService.resolvePluginOptions` | 3 | `PluginService.toRecord`, `ConfigurationService.requireConfigurationPath`, `PluginService.readString` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:156` |
| `GateService.readNameList` | 3 | `GateService.filter(…)`, `GateService.map(…)`, `GateService.flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:60` |
| `GateService.anonymous` | 3 | `GateService.on(…)`, `GateService.on(…)`, `GateService.on(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:98` |
| `readChargedProjects` | 3 | `extractReportText`, `isRecord`, `isList` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.utilities.ts:26` |
| `splitProjects` | 3 | `from(…)`, `every(…)`, `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.utilities.ts:78` |
| `BatchService.planShares` | 3 | `splitProjects`, `BatchService.map(…)`, `GateService.buildBatchArguments` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:279` |
| `resolveExternalInputs` | 3 | `filter(…)`, `map(…)`, `readDependencies` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:197` |
| `resolveWorkspaceInputs` | 3 | `collectWorkspacePackages`, `warnUnresolved`, `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:209` |
| `readRegistryDependencies` | 3 | `map(…)`, `filter(…)`, `readDependencies` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:180` |
| `BatchService.runAlone` | 2 | `BatchService.captureCommandLine`, `GateService.buildBatchArguments` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:325` |
| `BatchService.runGroup` | 2 | `BatchService.planShares`, `BatchService.judgeRun` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:358` |
| `BatchService.runBatch` | 2 | `BatchService.groupOrSettle`, `BatchService.runGroup` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:390` |
| `readDependencies` | 2 | `readManifest`, `toRecord` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:41` |
| `resolveTsconfigInputs` | 2 | `followExtendsChain`, `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:42` |
| `resolveTask` | 2 | `GateService.resolveConfigurationPath`, `describeError` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:93` |
| `gateExecutor` | 2 | `resolveGateService`, `GateService.run` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts:21` |
| `PluginService.map(…)` | 1 | `PluginService.toRecord` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:142` |
| `GateService.spawnCommandLine` | 1 | `GateService.anonymous` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:94` |
| `GateService.buildBatchArguments` | 1 | `GateService.buildCommandArguments` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:124` |
| `GateService.resolveSelection` | 1 | `GateService.readNameList` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:212` |
| `BatchService.explainFailure` | 1 | `BatchService.captureCommandLine` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:122` |
| `BatchService.failAll` | 1 | `BatchService.map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:145` |
| `resolveBatchService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:17` |
| `resolveGateService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:24` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:31` |
| `locatePackage` | 1 | `readManifest` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:145` |
| `flatMap(…)` | 1 | `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:224` |
| `readExtends` | 1 | `filter(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:133` |
| `filter(…)` | 1 | `some(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:184` |
| `resolvePackageBase` | 1 | `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:247` |
| `warnSkipped` | 1 | `describeSkippedBase` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:291` |

</details>
<!-- callidescope:end -->
