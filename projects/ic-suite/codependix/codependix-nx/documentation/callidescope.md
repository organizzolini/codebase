<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 95 |
| Files | 28 |
| Calls traced | 125 |
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
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/codependix/codependix-nx/src/index.ts:36]
  └─> resolveToolInputs(args: ResolveToolInputsArguments): InferredInput[] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:54]
     ↳ Cache inputs tying a gate to the command line it runs.
    └─> resolveWorkspaceInputs(…): InferredInput[] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:187]
       ↳ Globs over the sources and manifest of the command line and of every workspace package it reaches, sorted so the cache…
      └─> collectWorkspacePackages(cliDirectory: string): WorkspacePackages [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:88]
         ↳ Collects a workspace package and every workspace package it reaches. One that cannot be resolved is skipped alone.
        └─> readDependencies(directory: string): [string, unknown][] [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:41]
           ↳ Every dependency a package's manifest declares, in either map.
          └─> readManifest(directory: string): Record<string, unknown> [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:153]
             ↳ Reads a package directory's manifest, or an empty one when it is missing or unparsable.
```

**2. `gateBatchExecutor`** — depth ≥ 6 · orphan-root

```text
🚀 gateBatchExecutor(…): Promise<Record<string, GateBatchTaskResult>> [projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:28]
   ↳ Judges every batched gate task from as few command line runs as possible.
  └─> resolveTask(…): ResolvedTask [projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:80]
     ↳ Resolves one task's configuration path, or the failure that earns it.
    └─> GateService.resolveConfigurationPath(args: { configuration?: string | undefined; workspaceRoot: string; }): string [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:158]
       ↳ Resolves the configuration path one gate runs with: the `configuration` option, else the path read back from `nx.json`.
      └─> PluginService.resolvePluginOptions(args: ResolvePluginOptionsArguments): CodependixPluginOptions [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:132]
         ↳ Resolves plugin options from an untrusted value. Every path option is required and never searched for.
        └─> ConfigurationService.requireConfigurationPath(configurationPath: string | undefined, surface: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:261]
           ↳ Returns the main configuration path, refusing a missing or blank one. `surface` names its source in the refusal.
          └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:225]
```

**3. `gateExecutor`** — depth ≥ 6 · orphan-root

```text
🚀 gateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts:12]
   ↳ Fails a project's task when a boundary finding is charged to that project.
  └─> GateService.run(args: RunGateArguments): Promise<boolean> [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:203]
     ↳ Runs one gate. A cached target may judge only its own project, since its inputs cover nothing else.
    └─> GateService.resolveConfigurationPath(args: { configuration?: string | undefined; workspaceRoot: string; }): string [projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:158]
       ↳ Resolves the configuration path one gate runs with: the `configuration` option, else the path read back from `nx.json`.
      └─> PluginService.resolvePluginOptions(args: ResolvePluginOptionsArguments): CodependixPluginOptions [projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:132]
         ↳ Resolves plugin options from an untrusted value. Every path option is required and never searched for.
        └─> ConfigurationService.requireConfigurationPath(configurationPath: string | undefined, surface: string): string [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:261]
           ↳ Returns the main configuration path, refusing a missing or blank one. `surface` names its source in the refusal.
          └─> ConfigurationPathRequiredError.constructor(surface: string): ConfigurationPathRequiredError [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:225]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PluginService.resolvePluginOptions` | 5 | `PluginService.toRecord`, `ConfigurationService.requireConfigurationPath`, `PluginService.readString`, `ConfigurationService.requireProjectConfigurationPath`, `ConfigurationService.requireProjectTsconfigPath` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:132` |
| `GateService.run` | 5 | `GateService.resolveSelection`, `GateService.judgesOwnProject`, `GateService.buildCommandArguments`, `GateService.resolveConfigurationPath`, `GateService.spawnCommandLine` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:203` |
| `BatchService.judgeRun` | 5 | `BatchService.captureCommandLine`, `BatchService.failAll`, `readChargedProjects`, `BatchService.some(…)`, `BatchService.explainFailure` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:188` |

<details>
<summary>41 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `resolveToolInputs` | 5 | `locatePackage`, `warnUnresolved`, `isInsideWorkspace`, `resolveWorkspaceInputs`, `resolveExternalInputs` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:54` |
| `anonymous` | 5 | `resolvePluginService`, `PluginService.inferTargets`, `resolveToolInputs`, `resolveTsconfigInputs`, `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/index.ts:36` |
| `gateBatchExecutor` | 5 | `resolveBatchService`, `resolveGateService`, `resolveTask`, `BatchService.runBatch`, `printFailures` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:28` |
| `PluginService.readRegisteredOptions` | 4 | `PluginService.toRecord`, `PluginService.isUnknownArray`, `PluginService.find(…)`, `PluginService.map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:113` |
| `GateService.resolveConfigurationPath` | 4 | `ConfigurationService.requireConfigurationPath`, `PluginService.resolvePluginOptions`, `PluginService.readRegisteredOptions`, `GateService.readNxConfiguration` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:158` |
| `BatchService.groupOrSettle` | 4 | `GateService.resolveSelection`, `GateService.judgesOwnProject`, `BatchService.runAlone`, `describeError` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:136` |
| `collectWorkspacePackages` | 4 | `map(…)`, `filter(…)`, `readDependencies`, `locatePackage` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:88` |
| `followExtendsChain` | 4 | `readRegistryDependencies`, `readExtends`, `resolveExtendedBase`, `warnSkipped` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:70` |
| `resolveExtendedBase` | 4 | `resolvePathBase`, `resolvePackageBase`, `isInsideWorkspace`, `readInstalledPackageName` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:174` |
| `PluginService.selectProjectRoots` | 3 | `PluginService.filter(…)`, `PluginService.map(…)`, `PluginService.filter(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:58` |
| `PluginService.inferTargets` | 3 | `PluginService.resolvePluginOptions`, `PluginService.map(…)`, `PluginService.selectProjectRoots` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:82` |
| `GateService.readNameList` | 3 | `GateService.filter(…)`, `GateService.map(…)`, `GateService.flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:53` |
| `GateService.anonymous` | 3 | `GateService.on(…)`, `GateService.on(…)`, `GateService.on(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:84` |
| `readChargedProjects` | 3 | `extractReportText`, `isRecord`, `isList` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.utilities.ts:14` |
| `splitProjects` | 3 | `from(…)`, `every(…)`, `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.utilities.ts:58` |
| `BatchService.planShares` | 3 | `splitProjects`, `BatchService.map(…)`, `GateService.buildBatchArguments` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:239` |
| `resolveExternalInputs` | 3 | `filter(…)`, `map(…)`, `readDependencies` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:175` |
| `resolveWorkspaceInputs` | 3 | `collectWorkspacePackages`, `warnUnresolved`, `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:187` |
| `readRegistryDependencies` | 3 | `map(…)`, `filter(…)`, `readDependencies` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:157` |
| `BatchService.runAlone` | 2 | `BatchService.captureCommandLine`, `GateService.buildBatchArguments` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:285` |
| `BatchService.runGroup` | 2 | `BatchService.planShares`, `BatchService.judgeRun` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:313` |
| `BatchService.runBatch` | 2 | `BatchService.groupOrSettle`, `BatchService.runGroup` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:340` |
| `readDependencies` | 2 | `readManifest`, `toRecord` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:41` |
| `resolveTsconfigInputs` | 2 | `followExtendsChain`, `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:29` |
| `resolveTask` | 2 | `GateService.resolveConfigurationPath`, `describeError` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/batch-executor.ts:80` |
| `gateExecutor` | 2 | `resolveGateService`, `GateService.run` | `projects/ic-suite/codependix/codependix-nx/src/executors/gate/executor.ts:12` |
| `PluginService.map(…)` | 1 | `PluginService.toRecord` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin.service.ts:121` |
| `GateService.spawnCommandLine` | 1 | `GateService.anonymous` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:80` |
| `GateService.buildBatchArguments` | 1 | `GateService.buildCommandArguments` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:104` |
| `GateService.resolveSelection` | 1 | `GateService.readNameList` | `projects/ic-suite/codependix/codependix-nx/src/modules/gate/gate.service.ts:180` |
| `BatchService.explainFailure` | 1 | `BatchService.captureCommandLine` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:100` |
| `BatchService.failAll` | 1 | `BatchService.map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/batch/batch.service.ts:123` |
| `resolveBatchService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:17` |
| `resolveGateService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:24` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-context.utilities.ts:31` |
| `locatePackage` | 1 | `readManifest` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:126` |
| `flatMap(…)` | 1 | `map(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-inputs.utilities.ts:202` |
| `readExtends` | 1 | `filter(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:113` |
| `filter(…)` | 1 | `some(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:161` |
| `resolvePackageBase` | 1 | `flatMap(…)` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:212` |
| `warnSkipped` | 1 | `describeSkippedBase` | `projects/ic-suite/codependix/codependix-nx/src/modules/plugin/plugin-tsconfig.utilities.ts:253` |

</details>
<!-- callidescope:end -->
