<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `integration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 213 |
| Files | 111 |
| Calls traced | 245 |
| Call stacks | 18 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 12 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `ImportPrTaskCacheCommand.run`** — depth 6 · decorated-method

```text
🚀 ImportPrTaskCacheCommand.run(): Promise<void> [integration/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:42]
   ↳ Imports the cache and prints what happened.
  └─> ImportPrTaskCacheService.import(): TaskDatabaseReport [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:170]
     ↳ Imports the pull request's cache when this run is a merge group's. Never throws; a failure is only a warning.
    └─> ImportPrTaskCacheService.locate(): ImportStop | LocatedArtifact [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:125]
       ↳ Finds the artifact to import, or says why there is none.
      └─> ImportPrTaskCacheService.findPullRequest(): ImportStop | TrustedPullRequest [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:98]
         ↳ Finds the pull request a merge group tests, when it comes from this repository, or says why there is nothing to import.
        └─> ImportPrTaskCacheService.api(args: readonly string[]): string [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:55]
           ↳ Runs `gh api` and returns its trimmed output, or fails the import.
          └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
             ↳ Runs a command to completion and returns both output streams and the exit code.
```

**2. `SetupCodebaseCommand.run`** — depth 6 · decorated-method

```text
🚀 SetupCodebaseCommand.run(): Promise<void> [integration/src/modules/setup-codebase/setup-codebase.command.ts:86]
   ↳ Runs the steps this job asked for, prints what they decided, and sets the exit code.
  └─> ImportPrTaskCacheService.import(): TaskDatabaseReport [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:170]
     ↳ Imports the pull request's cache when this run is a merge group's. Never throws; a failure is only a warning.
    └─> ImportPrTaskCacheService.locate(): ImportStop | LocatedArtifact [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:125]
       ↳ Finds the artifact to import, or says why there is none.
      └─> ImportPrTaskCacheService.findPullRequest(): ImportStop | TrustedPullRequest [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:98]
         ↳ Finds the pull request a merge group tests, when it comes from this repository, or says why there is nothing to import.
        └─> ImportPrTaskCacheService.api(args: readonly string[]): string [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:55]
           ↳ Runs `gh api` and returns its trimmed output, or fails the import.
          └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
             ↳ Runs a command to completion and returns both output streams and the exit code.
```

**3. `UpgradeDependenciesCommand.run`** — depth 6 · decorated-method

```text
🚀 UpgradeDependenciesCommand.run(): Promise<void> [integration/src/modules/upgrade-dependencies/upgrade-dependencies.command.ts:79]
   ↳ Runs every upgrade in turn, then reports what came of them.
  └─> UpgradeDependenciesService.attempt(step: UpgradeStep): Promise<UpgradeOutcome> [integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:159]
     ↳ Runs one upgrade, undoing it if it fails.
    └─> UpgradeDependenciesService.work(step: UpgradeStep): Promise<UpgradeWork> [integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:138]
       ↳ Carries a step out: its commands in order, or its task, which throws on failure.
      └─> UpgradeNodeService.upgrade(): Promise<string> [integration/src/modules/upgrade-node/upgrade-node.service.ts:55]
         ↳ Writes the newest release of the current major, if newer.
        └─> UpgradeNodeService.fetchReleases(): Promise<string[]> [integration/src/modules/upgrade-node/upgrade-node.service.ts:37]
           ↳ Every release Node.js has published, as `v` and three numbers.
          └─> UpgradeNodeService.map(…)(release: { version: string; }): string [integration/src/modules/upgrade-node/upgrade-node.service.ts:46]
```

<details>
<summary>15 more call stacks</summary>

**4. `codometerBatchExecutor`** — depth 6 · orphan-root

```text
🚀 codometerBatchExecutor(…): Promise<Record<string, CodometerTaskResult>> [integration/src/executors/codometer/batch-executor.ts:19]
   ↳ Judges every codometer task Nx batched from one run per measurement.
  └─> judgeGroup(…): Promise<Record<string, CodometerTaskResult>> [integration/src/executors/codometer/batch-executor.ts:81]
     ↳ Judges tasks sharing one measurement from a single run; on failure, judges each alone, a few at a time.
    └─> map(…)(task: BatchedTask): Promise<CodometerTaskResult> [integration/src/executors/codometer/batch-executor.ts:104]
      └─> judgeAlone(…): Promise<CodometerTaskResult> [integration/src/executors/codometer/batch-executor.ts:60]
         ↳ Judges one task by running its project alone, as before batching.
        └─> runCodometerCli(args: RunCodometerArguments): Promise<CapturedProcess> [integration/src/executors/codometer/codometer.runner.ts:42]
           ↳ Runs the command line from one project's own root and returns what it printed.
          └─> ProcessRunnerService.captureAsync(…): Promise<CapturedProcess> [integration/src/modules/process-runner/process-runner.service.ts:60]
             ↳ Runs a command without blocking and returns what it printed. Standard input is closed at once.
```

**5. `knipBatchExecutor`** — depth 6 · orphan-root

```text
🚀 knipBatchExecutor(…): Promise<Record<string, KnipTaskResult>> [integration/src/executors/knip/batch-executor.ts:22]
   ↳ Judges the knip tasks Nx batched, with one knip run per configuration.
  └─> judgeGroup(…): Promise<Record<string, KnipTaskResult>> [integration/src/executors/knip/batch-executor.ts:104]
     ↳ Judges one configuration's tasks from one knip run.
    └─> explain(…): Promise<KnipTaskResult> [integration/src/executors/knip/batch-executor.ts:67]
       ↳ Reruns a failed workspace alone for knip's own printed report.
      └─> runKnip(…): Promise<CapturedProcess> [integration/src/executors/knip/knip.runner.ts:17]
         ↳ Runs knip over the given workspaces and returns what it printed.
        └─> buildKnipArguments(args: BuildKnipArguments): string[] [integration/src/executors/knip/knip.utilities.ts:36]
           ↳ Builds the arguments of one knip run over the given workspaces.
          └─> flatMap(…)(this: undefined, root: string): string[] [integration/src/executors/knip/knip.utilities.ts:44]
```

**6. `spellCheckBatchExecutor`** — depth 6 · orphan-root

```text
🚀 spellCheckBatchExecutor(…): Promise<Record<string, SpellCheckTaskResult>> [integration/src/executors/spell-check/batch-executor.ts:16]
   ↳ Judges the spell-check tasks Nx batched, with one cspell run per configuration.
  └─> judgeGroup(…): Promise<Record<string, SpellCheckTaskResult>> [integration/src/executors/spell-check/batch-executor.ts:80]
     ↳ Judges one configuration's tasks from one cspell run.
    └─> explain(…): Promise<SpellCheckTaskResult> [integration/src/executors/spell-check/batch-executor.ts:55]
       ↳ Reruns a failed project alone for cspell's own printed report.
      └─> runCspell(…): Promise<CapturedProcess> [integration/src/executors/spell-check/spell-check.runner.ts:17]
         ↳ Runs cspell over the given roots and returns what it printed.
        └─> buildCspellArguments(args: BuildCspellArguments): string[] [integration/src/executors/spell-check/spell-check.utilities.ts:8]
           ↳ Builds the arguments of one cspell run over the given project roots.
          └─> map(…)(root: string): string [integration/src/executors/spell-check/spell-check.utilities.ts:12]
```

**7. `AdoptTaskDatabaseCommand.run`** — depth 5 · decorated-method

```text
🚀 AdoptTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/adopt-task-database/adopt-task-database.command.ts:42]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.adopt(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:346]
     ↳ Renames the newest restored database to this machine's id, which Nx opens, and discards the rest.
    └─> TaskDatabaseService.planAdoption(databases: readonly string[]): AdoptionPlan [integration/src/modules/task-database/task-database.service.ts:245]
       ↳ Decides what adopting would do, or why it should do nothing.
      └─> TaskDatabaseService.readMachineId(): string [integration/src/modules/task-database/task-database.service.ts:310]
         ↳ This machine's id, from the first readable, non-empty id file.
        └─> TaskDatabaseService.filter(…)(file: string): boolean [integration/src/modules/task-database/task-database.service.ts:314]
```

**8. `MergeTaskCacheCommand.run`** — depth 5 · decorated-method

```text
🚀 MergeTaskCacheCommand.run(parameters: string[]): Promise<void> [integration/src/modules/merge-task-cache/merge-task-cache.command.ts:44]
   ↳ Merges the cache the first parameter names, and prints what happened.
  └─> TaskDatabaseService.merge(source: string): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:399]
     ↳ Merges another run's Nx cache into this one, so its finished tasks are hits. A failure skips the merge with a warning.
    └─> TaskDatabaseService.checkSource(source: string): MergeSource [integration/src/modules/task-database/task-database.service.ts:86]
       ↳ Finds the database a source would be merged from, or why it cannot be.
      └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
         ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
        └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**9. `RunAffectedCommand.run`** — depth 5 · decorated-method

```text
🚀 RunAffectedCommand.run(): Promise<void> [integration/src/modules/run-affected/run-affected.command.ts:53]
   ↳ Plans the affected runs, reports what a template added, and makes them.
  └─> RunAffectedService.plan(): RunAffectedOutcome [integration/src/modules/run-affected/run-affected.service.ts:159]
     ↳ Works out the `nx affected` runs this environment asks for.
    └─> RunAffectedService.templatesChanged(inputs: RunAffectedInputs): RunAffectedFailure | string[] [integration/src/modules/run-affected/run-affected.service.ts:118]
       ↳ Picks out the changed templates, when the target asks for them.
      └─> RunAffectedService.listChangedFiles(base: string, head: string): RunAffectedFailure | string[] [integration/src/modules/run-affected/run-affected.service.ts:46]
         ↳ Lists the files changed between two revisions, or why that failed.
        └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
           ↳ Runs a command to completion and returns both output streams and the exit code.
```

**10. `CleanupCodebaseCommand.run`** — depth 4 · decorated-method

```text
🚀 CleanupCodebaseCommand.run(): Promise<void> [integration/src/modules/cleanup-codebase/cleanup-codebase.command.ts:45]
   ↳ Verifies the database, keeps the newest, and prints what they report.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:429]
     ↳ Discards every database that fails `PRAGMA integrity_check`, since a damaged one saved would be inherited by later jobs.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**11. `CollectCodometerBaselineCommand.run`** — depth 4 · decorated-method

```text
🚀 CollectCodometerBaselineCommand.run(): Promise<void> [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.command.ts:42]
   ↳ Gathers the reports and prints what it found.
  └─> CollectCodometerBaselineService.collect(root?: string): CollectCodometerBaselineReport [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:66]
     ↳ Copies each report beneath `root` into the baseline.
    └─> CollectCodometerBaselineService.findReports(root: string, directory?: string): string[] [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:34]
       ↳ Lists the reports beneath a directory, relative to the root, in name order.
      └─> CollectCodometerBaselineService.toSorted(…)(left: fs.Dirent<string>, right: fs.Dirent<string>): number [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:40]
```

**12. `KeepTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 KeepTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/keep-task-database/keep-task-database.command.ts:41]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.keep(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:374]
     ↳ Keeps only the newest database, warning when there was more than one. Several means Nx opened a name of its own again.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**13. `ReportCodometerChangesCommand.run`** — depth 4 · decorated-method

```text
🚀 ReportCodometerChangesCommand.run(): Promise<void> [integration/src/modules/report-codometer-changes/report-codometer-changes.command.ts:42]
   ↳ Reports the changes, prints what happened, and sets the exit code.
  └─> ReportCodometerChangesService.report(): ReportCodometerChangesOutcome [integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:181]
     ↳ Fetches the baseline and rewrites the pull request body with its changes.
    └─> ReportCodometerChangesService.fetchBaseline(): CodometerBaseline [integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:51]
       ↳ Downloads the baseline of the latest green `main` run, if there is one.
      └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
         ↳ Runs a command to completion and returns both output streams and the exit code.
```

**14. `VerifyTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 VerifyTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/verify-task-database/verify-task-database.command.ts:39]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:429]
     ↳ Discards every database that fails `PRAGMA integrity_check`, since a damaged one saved would be inherited by later jobs.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**15. `knipExecutor`** — depth 4 · orphan-root

```text
🚀 knipExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/knip/executor.ts:11]
   ↳ Fails one project's task when knip reports an issue in its workspace. Runs when batching is off or a task stands alone.
  └─> runKnip(…): Promise<CapturedProcess> [integration/src/executors/knip/knip.runner.ts:17]
     ↳ Runs knip over the given workspaces and returns what it printed.
    └─> buildKnipArguments(args: BuildKnipArguments): string[] [integration/src/executors/knip/knip.utilities.ts:36]
       ↳ Builds the arguments of one knip run over the given workspaces.
      └─> flatMap(…)(this: undefined, root: string): string[] [integration/src/executors/knip/knip.utilities.ts:44]
```

**16. `spellCheckExecutor`** — depth 4 · orphan-root

```text
🚀 spellCheckExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/spell-check/executor.ts:14]
   ↳ Fails one project's task when cspell finds a misspelling under its root.
  └─> runCspell(…): Promise<CapturedProcess> [integration/src/executors/spell-check/spell-check.runner.ts:17]
     ↳ Runs cspell over the given roots and returns what it printed.
    └─> buildCspellArguments(args: BuildCspellArguments): string[] [integration/src/executors/spell-check/spell-check.utilities.ts:8]
       ↳ Builds the arguments of one cspell run over the given project roots.
      └─> map(…)(root: string): string [integration/src/executors/spell-check/spell-check.utilities.ts:12]
```

**17. `BoundBaseToPushCommand.run`** — depth 3 · decorated-method

```text
🚀 BoundBaseToPushCommand.run(): Promise<void> [integration/src/modules/bound-base-to-push/bound-base-to-push.command.ts:40]
   ↳ Bounds the base, prints what it decided, and sets the exit code.
  └─> BoundBaseToPushService.bound(): BoundBaseReport [integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:51]
     ↳ Decides the push's base, and writes a moved one to `GITHUB_ENV` for the later steps of the job.
    └─> BoundBaseToPushService.read(name: "BEFORE" | "GITHUB_ENV" | "NX_BASE" | "NX_HEAD"): string [integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:41]
       ↳ Reads one variable, an absent one as empty.
```

**18. `codometerExecutor`** — depth 3 · orphan-root

```text
🚀 codometerExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/codometer/executor.ts:13]
   ↳ Measures one project from its root and fails the task when codometer says the run failed. Runs when batching is off.
  └─> runCodometerCli(args: RunCodometerArguments): Promise<CapturedProcess> [integration/src/executors/codometer/codometer.runner.ts:42]
     ↳ Runs the command line from one project's own root and returns what it printed.
    └─> ProcessRunnerService.captureAsync(…): Promise<CapturedProcess> [integration/src/modules/process-runner/process-runner.service.ts:60]
       ↳ Runs a command without blocking and returns what it printed. Standard input is closed at once.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `renderPullRequestBody` | 8 | `flatMap(…)`, `filter(…)`, `map(…)`, `map(…)`, `filter(…)`, `map(…)`, `map(…)`, `flatMap(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:14` |
| `UpgradeDependenciesService.attempt` | 7 | `UpgradeDependenciesService.snapshot`, `UpgradeDependenciesService.work`, `UpgradeDependenciesService.git`, `warningsOf`, `UpgradeDependenciesService.undo`, `unrestoredMessage`, `UpgradeDependenciesService.tail` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:159` |
| `TaskDatabaseService.planMerge` | 6 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `schemaOf`, `schemaMismatchReason` | `integration/src/modules/task-database/task-database.service.ts:272` |

<details>
<summary>88 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TaskDatabaseService.adopt` | 6 | `TaskDatabaseService.list`, `TaskDatabaseService.planAdoption`, `TaskDatabaseService.discardOthers`, `TaskDatabaseService.rename`, `adoptedMessage`, `TaskDatabaseService.countCachedResults` | `integration/src/modules/task-database/task-database.service.ts:346` |
| `ImportPrTaskCacheService.import` | 6 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.locate`, `ImportPrTaskCacheService.download`, `importingMessage`, `TaskDatabaseService.merge`, `couldNotImportMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:170` |
| `judgeGroup` | 6 | `map(…)`, `runKnip`, `attributeIssues`, `failAll`, `filter(…)`, `explain` | `integration/src/executors/knip/batch-executor.ts:104` |
| `TaskDatabaseService.checkSource` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.integrityOf`, `TaskDatabaseService.query`, `TaskDatabaseService.every(…)` | `integration/src/modules/task-database/task-database.service.ts:86` |
| `TaskDatabaseService.mergeRows` | 5 | `TaskDatabaseService.query`, `TaskDatabaseService.copyMissingOutputs`, `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.insertRows`, `mergedMessage` | `integration/src/modules/task-database/task-database.service.ts:221` |
| `TaskDatabaseService.keep` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.discardOthers`, `duplicateMessage`, `TaskDatabaseService.map(…)` | `integration/src/modules/task-database/task-database.service.ts:374` |
| `TaskDatabaseService.merge` | 5 | `TaskDatabaseService.checkSource`, `notMergingMessage`, `TaskDatabaseService.planMerge`, `TaskDatabaseService.adoptSource`, `TaskDatabaseService.mergeRows` | `integration/src/modules/task-database/task-database.service.ts:399` |
| `BoundBaseToPushService.bound` | 5 | `BoundBaseToPushService.read`, `noPreviousTipMessage`, `ProcessRunnerService.capture`, `notAncestorMessage`, `boundingMessage` | `integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:51` |
| `ImportPrTaskCacheService.locate` | 5 | `ImportPrTaskCacheService.findPullRequest`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `artifactQuery`, `noArtifactMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:125` |
| `UpgradePythonService.upgrade` | 5 | `UpgradePythonService.newest`, `currentVersion`, `withRequiredVersion`, `withToolVersions`, `ProcessRunnerService.captureSequence` | `integration/src/modules/upgrade-python/upgrade-python.service.ts:74` |
| `runCodometerBatch` | 5 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildCliArguments`, `map(…)`, `buildCaptureLocation` | `integration/src/executors/codometer/codometer.runner.ts:19` |
| `judgeGroup` | 5 | `runCspell`, `map(…)`, `chargedRoots`, `map(…)`, `explain` | `integration/src/executors/spell-check/batch-executor.ts:80` |
| `TaskDatabaseService.planAdoption` | 4 | `TaskDatabaseService.readMachineId`, `TaskDatabaseService.newest`, `noSchemaMessage`, `TaskDatabaseService.directory` | `integration/src/modules/task-database/task-database.service.ts:245` |
| `TaskDatabaseService.verify` | 4 | `TaskDatabaseService.list`, `TaskDatabaseService.integrityOf`, `corruptMessage`, `TaskDatabaseService.discard` | `integration/src/modules/task-database/task-database.service.ts:429` |
| `ImportPrTaskCacheService.findPullRequest` | 4 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `untrustedMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:98` |
| `RunAffectedCommand.run` | 4 | `RunAffectedService.plan`, `RunAffectedCommand.report`, `templateFilesHeading`, `RunAffectedService.execute` | `integration/src/modules/run-affected/run-affected.command.ts:53` |
| `SetupCodebaseCommand.run` | 4 | `SetupCodebaseCommand.boundBase`, `ImportPrTaskCacheService.import`, `TaskDatabaseService.verify`, `TaskDatabaseService.adopt` | `integration/src/modules/setup-codebase/setup-codebase.command.ts:86` |
| `UpgradeNodeService.upgrade` | 4 | `UpgradeNodeService.fetchReleases`, `UpgradeNodeService.toSorted(…)`, `UpgradeNodeService.filter(…)`, `PackageManifestService.replace` | `integration/src/modules/upgrade-node/upgrade-node.service.ts:55` |
| `UpgradeDependenciesService.work` | 4 | `ProcessRunnerService.captureSequence`, `UpgradeNodeService.upgrade`, `UpgradePnpmService.upgrade`, `UpgradePythonService.upgrade` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:138` |
| `UpgradeDependenciesCommand.run` | 4 | `UpgradeDependenciesService.attempt`, `UpgradeDependenciesCommand.conclude`, `UpgradeDependenciesService.finish`, `UpgradeDependenciesCommand.some(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.command.ts:79` |
| `runCodometerCli` | 4 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildCliArguments`, `buildCaptureLocation` | `integration/src/executors/codometer/codometer.runner.ts:42` |
| `TaskDatabaseService.adoptSource` | 3 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `nothingToMergeIntoMessage` | `integration/src/modules/task-database/task-database.service.ts:66` |
| `ReportCodometerChangesService.rewriteBody` | 3 | `ProcessRunnerService.capture`, `failedMessage`, `ProcessRunnerService.stream` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:108` |
| `ReportCodometerChangesService.report` | 3 | `ReportCodometerChangesService.fetchBaseline`, `ReportCodometerChangesService.rewriteBody`, `baselineFoundMessage` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:181` |
| `RunAffectedService.plan` | 3 | `RunAffectedService.readInputs`, `RunAffectedService.templatesChanged`, `RunAffectedService.runOf` | `integration/src/modules/run-affected/run-affected.service.ts:159` |
| `UpgradeDependenciesService.undo` | 3 | `ProcessRunnerService.capture`, `ProcessRunnerService.captureSequence`, `UpgradeDependenciesService.tail` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:111` |
| `codometerBatchExecutor` | 3 | `describeOptions`, `judgeGroup`, `printFailures` | `integration/src/executors/codometer/batch-executor.ts:19` |
| `judgeGroup` | 3 | `runCodometerBatch`, `map(…)`, `map(…)` | `integration/src/executors/codometer/batch-executor.ts:81` |
| `runKnip` | 3 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildKnipArguments` | `integration/src/executors/knip/knip.runner.ts:17` |
| `knipBatchExecutor` | 3 | `runAlone`, `judgeGroup`, `printFailures` | `integration/src/executors/knip/batch-executor.ts:22` |
| `runCspell` | 3 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildCspellArguments` | `integration/src/executors/spell-check/spell-check.runner.ts:17` |
| `TaskDatabaseService.list` | 2 | `TaskDatabaseService.map(…)`, `TaskDatabaseService.filter(…)` | `integration/src/modules/task-database/task-database.service.ts:205` |
| `CleanupCodebaseCommand.run` | 2 | `TaskDatabaseService.verify`, `TaskDatabaseService.keep` | `integration/src/modules/cleanup-codebase/cleanup-codebase.command.ts:45` |
| `CollectCodometerBaselineService.collect` | 2 | `CollectCodometerBaselineService.findReports`, `collectedMessage` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:66` |
| `ImportPrTaskCacheService.download` | 2 | `ProcessRunnerService.captureToFile`, `ProcessRunnerService.capture` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:66` |
| `ReportCodometerChangesService.fetchBaseline` | 2 | `ProcessRunnerService.capture`, `baselineSkippedMessage` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:51` |
| `RunAffectedService.listChangedFiles` | 2 | `ProcessRunnerService.capture`, `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:46` |
| `RunAffectedService.templatesChanged` | 2 | `RunAffectedService.listChangedFiles`, `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:118` |
| `UpgradePnpmService.upgrade` | 2 | `ProcessRunnerService.capture`, `PackageManifestService.replace` | `integration/src/modules/upgrade-pnpm/upgrade-pnpm.service.ts:35` |
| `warningsOf` | 2 | `filter(…)`, `map(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:83` |
| `skippedBullet` | 2 | `code`, `reasonOf` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:126` |
| `UpgradeDependenciesService.finish` | 2 | `UpgradeDependenciesService.git`, `renderPullRequestBody` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:211` |
| `attributeIssues` | 2 | `readIssueFiles`, `ownerOf` | `integration/src/executors/knip/knip.utilities.ts:9` |
| `ownerOf` | 2 | `toSorted(…)`, `filter(…)` | `integration/src/executors/knip/knip.utilities.ts:57` |
| `spellCheckBatchExecutor` | 2 | `judgeGroup`, `printFailures` | `integration/src/executors/spell-check/batch-executor.ts:16` |
| `TaskDatabaseService.countCachedResults` | 1 | `TaskDatabaseService.query` | `integration/src/modules/task-database/task-database.service.ts:140` |
| `TaskDatabaseService.discardOthers` | 1 | `TaskDatabaseService.discard` | `integration/src/modules/task-database/task-database.service.ts:163` |
| `TaskDatabaseService.integrityOf` | 1 | `TaskDatabaseService.query` | `integration/src/modules/task-database/task-database.service.ts:193` |
| `TaskDatabaseService.newest` | 1 | `TaskDatabaseService.reduce(…)` | `integration/src/modules/task-database/task-database.service.ts:236` |
| `TaskDatabaseService.readMachineId` | 1 | `TaskDatabaseService.filter(…)` | `integration/src/modules/task-database/task-database.service.ts:310` |
| `AdoptTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.adopt` | `integration/src/modules/adopt-task-database/adopt-task-database.command.ts:42` |
| `ProcessRunnerService.captureSequence` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/process-runner/process-runner.service.ts:98` |
| `BoundBaseToPushCommand.run` | 1 | `BoundBaseToPushService.bound` | `integration/src/modules/bound-base-to-push/bound-base-to-push.command.ts:40` |
| `CollectCodometerBaselineService.findReports` | 1 | `CollectCodometerBaselineService.toSorted(…)` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:34` |
| `CollectCodometerBaselineCommand.run` | 1 | `CollectCodometerBaselineService.collect` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.command.ts:42` |
| `ImportPrTaskCacheService.api` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:55` |
| `ImportPrTaskCacheCommand.run` | 1 | `ImportPrTaskCacheService.import` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:42` |
| `KeepTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.keep` | `integration/src/modules/keep-task-database/keep-task-database.command.ts:41` |
| `MergeTaskCacheCommand.run` | 1 | `TaskDatabaseService.merge` | `integration/src/modules/merge-task-cache/merge-task-cache.command.ts:44` |
| `ReportCodometerChangesCommand.run` | 1 | `ReportCodometerChangesService.report` | `integration/src/modules/report-codometer-changes/report-codometer-changes.command.ts:42` |
| `RunAffectedService.readInputs` | 1 | `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:77` |
| `RunAffectedService.execute` | 1 | `ProcessRunnerService.stream` | `integration/src/modules/run-affected/run-affected.service.ts:142` |
| `SetupCodebaseCommand.boundBase` | 1 | `BoundBaseToPushService.bound` | `integration/src/modules/setup-codebase/setup-codebase.command.ts:57` |
| `PackageManifestService.replace` | 1 | `PackageManifestService.current` | `integration/src/modules/package-manifest/package-manifest.service.ts:44` |
| `UpgradeNodeService.fetchReleases` | 1 | `UpgradeNodeService.map(…)` | `integration/src/modules/upgrade-node/upgrade-node.service.ts:37` |
| `withRequiredVersion` | 1 | `nextVersion` | `integration/src/modules/upgrade-python/upgrade-python.utilities.ts:26` |
| `UpgradePythonService.newest` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/upgrade-python/upgrade-python.service.ts:45` |
| `map(…)` | 1 | `skippedBullet` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:35` |
| `map(…)` | 1 | `detailBullet` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:38` |
| `map(…)` | 1 | `quoteSkipped` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:62` |
| `flatMap(…)` | 1 | `map(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:71` |
| `map(…)` | 1 | `code` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:73` |
| `UpgradeDependenciesService.git` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:77` |
| `UpgradeDependenciesService.snapshot` | 1 | `UpgradeDependenciesService.git` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:82` |
| `UpgradeDependenciesCommand.conclude` | 1 | `skippedAnnotation` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.command.ts:51` |
| `VerifyTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.verify` | `integration/src/modules/verify-task-database/verify-task-database.command.ts:39` |
| `judgeAlone` | 1 | `runCodometerCli` | `integration/src/executors/codometer/batch-executor.ts:60` |
| `map(…)` | 1 | `judgeAlone` | `integration/src/executors/codometer/batch-executor.ts:104` |
| `codometerExecutor` | 1 | `runCodometerCli` | `integration/src/executors/codometer/executor.ts:13` |
| `buildKnipArguments` | 1 | `flatMap(…)` | `integration/src/executors/knip/knip.utilities.ts:36` |
| `readIssueFiles` | 1 | `isRecord` | `integration/src/executors/knip/knip.utilities.ts:67` |
| `explain` | 1 | `runKnip` | `integration/src/executors/knip/batch-executor.ts:67` |
| `failAll` | 1 | `map(…)` | `integration/src/executors/knip/batch-executor.ts:91` |
| `runAlone` | 1 | `runKnip` | `integration/src/executors/knip/batch-executor.ts:162` |
| `knipExecutor` | 1 | `runKnip` | `integration/src/executors/knip/executor.ts:11` |
| `buildCspellArguments` | 1 | `map(…)` | `integration/src/executors/spell-check/spell-check.utilities.ts:8` |
| `explain` | 1 | `runCspell` | `integration/src/executors/spell-check/batch-executor.ts:55` |
| `spellCheckExecutor` | 1 | `runCspell` | `integration/src/executors/spell-check/executor.ts:14` |

</details>
<!-- callidescope:end -->
