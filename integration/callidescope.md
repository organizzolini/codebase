<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `integration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 200 |
| Files | 105 |
| Calls traced | 227 |
| Call stacks | 16 |
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
🚀 ImportPrTaskCacheCommand.run(): Promise<void> [integration/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:43]
   ↳ Imports the cache and prints what happened.
  └─> ImportPrTaskCacheService.import(): TaskDatabaseReport [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:177]
     ↳ Imports the pull request's cache when this run is a merge group's.
    └─> ImportPrTaskCacheService.locate(): ImportStop | LocatedArtifact [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:132]
       ↳ Finds the artifact to import, or says why there is none.
      └─> ImportPrTaskCacheService.findPullRequest(): ImportStop | TrustedPullRequest [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:105]
         ↳ Finds the pull request a merge group tests, when it comes from this repository, or says why there is nothing to import.
        └─> ImportPrTaskCacheService.api(args: readonly string[]): string [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:62]
           ↳ Runs `gh api` and returns its trimmed output, or fails the import.
          └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
             ↳ Runs a command to completion and returns what it printed.
```

**2. `SetupCodebaseCommand.run`** — depth 6 · decorated-method

```text
🚀 SetupCodebaseCommand.run(): Promise<void> [integration/src/modules/setup-codebase/setup-codebase.command.ts:98]
   ↳ Runs the steps this job asked for, prints what they decided, and sets the exit code.
  └─> ImportPrTaskCacheService.import(): TaskDatabaseReport [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:177]
     ↳ Imports the pull request's cache when this run is a merge group's.
    └─> ImportPrTaskCacheService.locate(): ImportStop | LocatedArtifact [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:132]
       ↳ Finds the artifact to import, or says why there is none.
      └─> ImportPrTaskCacheService.findPullRequest(): ImportStop | TrustedPullRequest [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:105]
         ↳ Finds the pull request a merge group tests, when it comes from this repository, or says why there is nothing to import.
        └─> ImportPrTaskCacheService.api(args: readonly string[]): string [integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:62]
           ↳ Runs `gh api` and returns its trimmed output, or fails the import.
          └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
             ↳ Runs a command to completion and returns what it printed.
```

**3. `UpgradeDependenciesCommand.run`** — depth 6 · decorated-method

```text
🚀 UpgradeDependenciesCommand.run(): Promise<void> [integration/src/modules/upgrade-dependencies/upgrade-dependencies.command.ts:85]
   ↳ Runs every upgrade in turn, then reports what came of them.
  └─> UpgradeDependenciesService.attempt(step: UpgradeStep): Promise<UpgradeOutcome> [integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:165]
     ↳ Runs one upgrade, undoing it if it fails.
    └─> UpgradeDependenciesService.work(step: UpgradeStep): Promise<UpgradeWork> [integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:144]
       ↳ Carries a step out: its commands run in order until one fails, and its task runs in its service, which throws to say…
      └─> UpgradeNodeService.upgrade(): Promise<string> [integration/src/modules/upgrade-node/upgrade-node.service.ts:59]
         ↳ Writes the newest release of the current major, when it is newer than the one in use.
        └─> UpgradeNodeService.fetchReleases(): Promise<string[]> [integration/src/modules/upgrade-node/upgrade-node.service.ts:37]
           ↳ Every release Node.js has published, as `v` and three numbers.
          └─> UpgradeNodeService.map(…)(release: { version: string; }): string [integration/src/modules/upgrade-node/upgrade-node.service.ts:46]
```

<details>
<summary>13 more call stacks</summary>

**4. `knipBatchExecutor`** — depth 6 · orphan-root

```text
🚀 knipBatchExecutor(…): Promise<Record<string, KnipTaskResult>> [integration/src/executors/knip/batch-executor.ts:28]
   ↳ Judges every knip task Nx batched from one run per configuration.
  └─> judgeGroup(…): Promise<Record<string, KnipTaskResult>> [integration/src/executors/knip/batch-executor.ts:119]
     ↳ Judges one configuration's tasks from a single knip run over all of their workspaces.
    └─> explain(…): Promise<KnipTaskResult> [integration/src/executors/knip/batch-executor.ts:77]
       ↳ Gets a failed task's own report by running its workspace alone.
      └─> runKnip(…): Promise<CapturedProcess> [integration/src/executors/knip/knip.runner.ts:19]
         ↳ Runs knip over the given workspaces and returns what it printed.
        └─> buildKnipArguments(args: BuildKnipArguments): string[] [integration/src/executors/knip/knip.utilities.ts:40]
           ↳ Builds the arguments of one knip run over the given workspaces.
          └─> flatMap(…)(this: undefined, root: string): string[] [integration/src/executors/knip/knip.utilities.ts:48]
```

**5. `spellCheckBatchExecutor`** — depth 6 · orphan-root

```text
🚀 spellCheckBatchExecutor(…): Promise<Record<string, SpellCheckTaskResult>> [integration/src/executors/spell-check/batch-executor.ts:20]
   ↳ Judges every spell-check task Nx batched from one run per configuration.
  └─> judgeGroup(…): Promise<Record<string, SpellCheckTaskResult>> [integration/src/executors/spell-check/batch-executor.ts:94]
     ↳ Judges one configuration's tasks from a single cspell run over all of their roots.
    └─> explain(…): Promise<SpellCheckTaskResult> [integration/src/executors/spell-check/batch-executor.ts:64]
       ↳ Gets a failed task's own report by running its project alone.
      └─> runCspell(…): Promise<CapturedProcess> [integration/src/executors/spell-check/spell-check.runner.ts:19]
         ↳ Runs cspell over the given project roots and returns what it printed.
        └─> buildCspellArguments(args: BuildCspellArguments): string[] [integration/src/executors/spell-check/spell-check.utilities.ts:8]
           ↳ Builds the arguments of one cspell run over the given project roots.
          └─> map(…)(root: string): string [integration/src/executors/spell-check/spell-check.utilities.ts:12]
```

**6. `AdoptTaskDatabaseCommand.run`** — depth 5 · decorated-method

```text
🚀 AdoptTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/adopt-task-database/adopt-task-database.command.ts:42]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.adopt(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:359]
     ↳ Renames the newest restored database to this machine's id, and discards the rest.
    └─> TaskDatabaseService.planAdoption(databases: readonly string[]): AdoptionPlan [integration/src/modules/task-database/task-database.service.ts:253]
       ↳ Decides what adopting would do, or why it should do nothing.
      └─> TaskDatabaseService.readMachineId(): string [integration/src/modules/task-database/task-database.service.ts:318]
         ↳ This machine's id, from the first readable, non-empty id file.
        └─> TaskDatabaseService.filter(…)(file: string): boolean [integration/src/modules/task-database/task-database.service.ts:322]
```

**7. `MergeTaskCacheCommand.run`** — depth 5 · decorated-method

```text
🚀 MergeTaskCacheCommand.run(parameters: string[]): Promise<void> [integration/src/modules/merge-task-cache/merge-task-cache.command.ts:45]
   ↳ Merges the cache the first parameter names, and prints what happened.
  └─> TaskDatabaseService.merge(source: string): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:419]
     ↳ Merges another run's Nx cache into this one, so the tasks that run already finished are hits here too.
    └─> TaskDatabaseService.checkSource(source: string): MergeSource [integration/src/modules/task-database/task-database.service.ts:87]
       ↳ Finds the database a source would be merged from, or why it cannot be.
      └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:209]
         ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
        └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:218]
```

**8. `RunAffectedCommand.run`** — depth 5 · decorated-method

```text
🚀 RunAffectedCommand.run(): Promise<void> [integration/src/modules/run-affected/run-affected.command.ts:57]
   ↳ Plans the affected runs, reports what a template added, and makes them.
  └─> RunAffectedService.plan(): RunAffectedOutcome [integration/src/modules/run-affected/run-affected.service.ts:164]
     ↳ Works out the `nx affected` runs this environment asks for.
    └─> RunAffectedService.templatesChanged(inputs: RunAffectedInputs): RunAffectedFailure | string[] [integration/src/modules/run-affected/run-affected.service.ts:120]
       ↳ Picks out the changed templates, when the target asks for them.
      └─> RunAffectedService.listChangedFiles(base: string, head: string): RunAffectedFailure | string[] [integration/src/modules/run-affected/run-affected.service.ts:48]
         ↳ Lists the files changed between two revisions, or why that failed.
        └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
           ↳ Runs a command to completion and returns what it printed.
```

**9. `CleanupCodebaseCommand.run`** — depth 4 · decorated-method

```text
🚀 CleanupCodebaseCommand.run(): Promise<void> [integration/src/modules/cleanup-codebase/cleanup-codebase.command.ts:49]
   ↳ Verifies the database, keeps the newest, and prints what they report.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:454]
     ↳ Discards every database that fails `PRAGMA integrity_check`.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:209]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:218]
```

**10. `CollectCodometerBaselineCommand.run`** — depth 4 · decorated-method

```text
🚀 CollectCodometerBaselineCommand.run(): Promise<void> [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.command.ts:42]
   ↳ Gathers the reports and prints what it found.
  └─> CollectCodometerBaselineService.collect(root?: string): CollectCodometerBaselineReport [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:67]
     ↳ Copies each report found beneath a root into the baseline directory.
    └─> CollectCodometerBaselineService.findReports(root: string, directory?: string): string[] [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:34]
       ↳ Lists the reports beneath a directory, relative to the root, in name order.
      └─> CollectCodometerBaselineService.toSorted(…)(left: fs.Dirent<string>, right: fs.Dirent<string>): number [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:40]
```

**11. `KeepTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 KeepTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/keep-task-database/keep-task-database.command.ts:41]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.keep(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:391]
     ↳ Keeps only the newest database, warning when there was more than one. `adopt` renames the restored database to this…
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:209]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:218]
```

**12. `ReportCodometerChangesCommand.run`** — depth 4 · decorated-method

```text
🚀 ReportCodometerChangesCommand.run(): Promise<void> [integration/src/modules/report-codometer-changes/report-codometer-changes.command.ts:43]
   ↳ Reports the changes, prints what happened, and sets the exit code.
  └─> ReportCodometerChangesService.report(): ReportCodometerChangesOutcome [integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:184]
     ↳ Fetches the baseline, rewrites the pull request body with the changes against it, and saves the body.
    └─> ReportCodometerChangesService.fetchBaseline(): CodometerBaseline [integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:52]
       ↳ Downloads the baseline of the latest green `main` run, if there is one.
      └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
         ↳ Runs a command to completion and returns what it printed.
```

**13. `VerifyTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 VerifyTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/verify-task-database/verify-task-database.command.ts:39]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:454]
     ↳ Discards every database that fails `PRAGMA integrity_check`.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:209]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:218]
```

**14. `knipExecutor`** — depth 4 · orphan-root

```text
🚀 knipExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/knip/executor.ts:16]
   ↳ Fails one project's task when knip reports an issue in that project's workspace.
  └─> runKnip(…): Promise<CapturedProcess> [integration/src/executors/knip/knip.runner.ts:19]
     ↳ Runs knip over the given workspaces and returns what it printed.
    └─> buildKnipArguments(args: BuildKnipArguments): string[] [integration/src/executors/knip/knip.utilities.ts:40]
       ↳ Builds the arguments of one knip run over the given workspaces.
      └─> flatMap(…)(this: undefined, root: string): string[] [integration/src/executors/knip/knip.utilities.ts:48]
```

**15. `spellCheckExecutor`** — depth 4 · orphan-root

```text
🚀 spellCheckExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/spell-check/executor.ts:18]
   ↳ Fails one project's task when cspell finds a misspelling under its root.
  └─> runCspell(…): Promise<CapturedProcess> [integration/src/executors/spell-check/spell-check.runner.ts:19]
     ↳ Runs cspell over the given project roots and returns what it printed.
    └─> buildCspellArguments(args: BuildCspellArguments): string[] [integration/src/executors/spell-check/spell-check.utilities.ts:8]
       ↳ Builds the arguments of one cspell run over the given project roots.
      └─> map(…)(root: string): string [integration/src/executors/spell-check/spell-check.utilities.ts:12]
```

**16. `BoundBaseToPushCommand.run`** — depth 3 · decorated-method

```text
🚀 BoundBaseToPushCommand.run(): Promise<void> [integration/src/modules/bound-base-to-push/bound-base-to-push.command.ts:41]
   ↳ Bounds the base, prints what it decided, and sets the exit code.
  └─> BoundBaseToPushService.bound(): BoundBaseReport [integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:59]
     ↳ Decides the push's base, and writes a moved one to `GITHUB_ENV` for the later steps of the job.
    └─> BoundBaseToPushService.read(name: "BEFORE" | "GITHUB_ENV" | "NX_BASE" | "NX_HEAD"): string [integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:49]
       ↳ Reads one variable, an absent one as empty.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `renderPullRequestBody` | 8 | `flatMap(…)`, `filter(…)`, `map(…)`, `map(…)`, `filter(…)`, `map(…)`, `map(…)`, `flatMap(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:17` |
| `UpgradeDependenciesService.attempt` | 7 | `UpgradeDependenciesService.snapshot`, `UpgradeDependenciesService.work`, `UpgradeDependenciesService.git`, `warningsOf`, `UpgradeDependenciesService.undo`, `unrestoredMessage`, `UpgradeDependenciesService.tail` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:165` |
| `TaskDatabaseService.planMerge` | 6 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `schemaOf`, `schemaMismatchReason` | `integration/src/modules/task-database/task-database.service.ts:280` |

<details>
<summary>81 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TaskDatabaseService.adopt` | 6 | `TaskDatabaseService.list`, `TaskDatabaseService.planAdoption`, `TaskDatabaseService.discardOthers`, `TaskDatabaseService.rename`, `adoptedMessage`, `TaskDatabaseService.countCachedResults` | `integration/src/modules/task-database/task-database.service.ts:359` |
| `ImportPrTaskCacheService.import` | 6 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.locate`, `ImportPrTaskCacheService.download`, `importingMessage`, `TaskDatabaseService.merge`, `couldNotImportMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:177` |
| `judgeGroup` | 6 | `map(…)`, `runKnip`, `attributeIssues`, `failAll`, `filter(…)`, `explain` | `integration/src/executors/knip/batch-executor.ts:119` |
| `TaskDatabaseService.checkSource` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.integrityOf`, `TaskDatabaseService.query`, `TaskDatabaseService.every(…)` | `integration/src/modules/task-database/task-database.service.ts:87` |
| `TaskDatabaseService.mergeRows` | 5 | `TaskDatabaseService.query`, `TaskDatabaseService.copyMissingOutputs`, `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.insertRows`, `mergedMessage` | `integration/src/modules/task-database/task-database.service.ts:227` |
| `TaskDatabaseService.keep` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.discardOthers`, `duplicateMessage`, `TaskDatabaseService.map(…)` | `integration/src/modules/task-database/task-database.service.ts:391` |
| `TaskDatabaseService.merge` | 5 | `TaskDatabaseService.checkSource`, `notMergingMessage`, `TaskDatabaseService.planMerge`, `TaskDatabaseService.adoptSource`, `TaskDatabaseService.mergeRows` | `integration/src/modules/task-database/task-database.service.ts:419` |
| `BoundBaseToPushService.bound` | 5 | `BoundBaseToPushService.read`, `noPreviousTipMessage`, `ProcessRunnerService.capture`, `notAncestorMessage`, `boundingMessage` | `integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:59` |
| `ImportPrTaskCacheService.locate` | 5 | `ImportPrTaskCacheService.findPullRequest`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `artifactQuery`, `noArtifactMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:132` |
| `UpgradePythonService.upgrade` | 5 | `UpgradePythonService.newest`, `currentVersion`, `withRequiredVersion`, `withToolVersions`, `ProcessRunnerService.captureSequence` | `integration/src/modules/upgrade-python/upgrade-python.service.ts:77` |
| `judgeGroup` | 5 | `runCspell`, `map(…)`, `chargedRoots`, `map(…)`, `explain` | `integration/src/executors/spell-check/batch-executor.ts:94` |
| `TaskDatabaseService.planAdoption` | 4 | `TaskDatabaseService.readMachineId`, `TaskDatabaseService.newest`, `noSchemaMessage`, `TaskDatabaseService.directory` | `integration/src/modules/task-database/task-database.service.ts:253` |
| `TaskDatabaseService.verify` | 4 | `TaskDatabaseService.list`, `TaskDatabaseService.integrityOf`, `corruptMessage`, `TaskDatabaseService.discard` | `integration/src/modules/task-database/task-database.service.ts:454` |
| `ImportPrTaskCacheService.findPullRequest` | 4 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `untrustedMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:105` |
| `RunAffectedCommand.run` | 4 | `RunAffectedService.plan`, `RunAffectedCommand.report`, `templateFilesHeading`, `RunAffectedService.execute` | `integration/src/modules/run-affected/run-affected.command.ts:57` |
| `SetupCodebaseCommand.run` | 4 | `SetupCodebaseCommand.boundBase`, `ImportPrTaskCacheService.import`, `TaskDatabaseService.verify`, `TaskDatabaseService.adopt` | `integration/src/modules/setup-codebase/setup-codebase.command.ts:98` |
| `UpgradeNodeService.upgrade` | 4 | `UpgradeNodeService.fetchReleases`, `UpgradeNodeService.toSorted(…)`, `UpgradeNodeService.filter(…)`, `PackageManifestService.replace` | `integration/src/modules/upgrade-node/upgrade-node.service.ts:59` |
| `UpgradeDependenciesService.work` | 4 | `ProcessRunnerService.captureSequence`, `UpgradeNodeService.upgrade`, `UpgradePnpmService.upgrade`, `UpgradePythonService.upgrade` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:144` |
| `UpgradeDependenciesCommand.run` | 4 | `UpgradeDependenciesService.attempt`, `UpgradeDependenciesCommand.conclude`, `UpgradeDependenciesService.finish`, `UpgradeDependenciesCommand.some(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.command.ts:85` |
| `TaskDatabaseService.adoptSource` | 3 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `nothingToMergeIntoMessage` | `integration/src/modules/task-database/task-database.service.ts:67` |
| `ReportCodometerChangesService.rewriteBody` | 3 | `ProcessRunnerService.capture`, `failedMessage`, `ProcessRunnerService.stream` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:109` |
| `ReportCodometerChangesService.report` | 3 | `ReportCodometerChangesService.fetchBaseline`, `ReportCodometerChangesService.rewriteBody`, `baselineFoundMessage` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:184` |
| `RunAffectedService.plan` | 3 | `RunAffectedService.readInputs`, `RunAffectedService.templatesChanged`, `RunAffectedService.runOf` | `integration/src/modules/run-affected/run-affected.service.ts:164` |
| `UpgradeDependenciesService.undo` | 3 | `ProcessRunnerService.capture`, `ProcessRunnerService.captureSequence`, `UpgradeDependenciesService.tail` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:114` |
| `runKnip` | 3 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildKnipArguments` | `integration/src/executors/knip/knip.runner.ts:19` |
| `knipBatchExecutor` | 3 | `runAlone`, `judgeGroup`, `printFailures` | `integration/src/executors/knip/batch-executor.ts:28` |
| `runCspell` | 3 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildCspellArguments` | `integration/src/executors/spell-check/spell-check.runner.ts:19` |
| `TaskDatabaseService.list` | 2 | `TaskDatabaseService.map(…)`, `TaskDatabaseService.filter(…)` | `integration/src/modules/task-database/task-database.service.ts:209` |
| `CleanupCodebaseCommand.run` | 2 | `TaskDatabaseService.verify`, `TaskDatabaseService.keep` | `integration/src/modules/cleanup-codebase/cleanup-codebase.command.ts:49` |
| `CollectCodometerBaselineService.collect` | 2 | `CollectCodometerBaselineService.findReports`, `collectedMessage` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:67` |
| `ImportPrTaskCacheService.download` | 2 | `ProcessRunnerService.captureToFile`, `ProcessRunnerService.capture` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:73` |
| `ReportCodometerChangesService.fetchBaseline` | 2 | `ProcessRunnerService.capture`, `baselineSkippedMessage` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:52` |
| `RunAffectedService.listChangedFiles` | 2 | `ProcessRunnerService.capture`, `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:48` |
| `RunAffectedService.templatesChanged` | 2 | `RunAffectedService.listChangedFiles`, `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:120` |
| `UpgradePnpmService.upgrade` | 2 | `ProcessRunnerService.capture`, `PackageManifestService.replace` | `integration/src/modules/upgrade-pnpm/upgrade-pnpm.service.ts:38` |
| `warningsOf` | 2 | `filter(…)`, `map(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:86` |
| `skippedBullet` | 2 | `code`, `reasonOf` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:129` |
| `UpgradeDependenciesService.finish` | 2 | `UpgradeDependenciesService.git`, `renderPullRequestBody` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:219` |
| `attributeIssues` | 2 | `readIssueFiles`, `ownerOf` | `integration/src/executors/knip/knip.utilities.ts:13` |
| `ownerOf` | 2 | `toSorted(…)`, `filter(…)` | `integration/src/executors/knip/knip.utilities.ts:63` |
| `spellCheckBatchExecutor` | 2 | `judgeGroup`, `printFailures` | `integration/src/executors/spell-check/batch-executor.ts:20` |
| `TaskDatabaseService.countCachedResults` | 1 | `TaskDatabaseService.query` | `integration/src/modules/task-database/task-database.service.ts:141` |
| `TaskDatabaseService.discardOthers` | 1 | `TaskDatabaseService.discard` | `integration/src/modules/task-database/task-database.service.ts:164` |
| `TaskDatabaseService.integrityOf` | 1 | `TaskDatabaseService.query` | `integration/src/modules/task-database/task-database.service.ts:197` |
| `TaskDatabaseService.newest` | 1 | `TaskDatabaseService.reduce(…)` | `integration/src/modules/task-database/task-database.service.ts:244` |
| `TaskDatabaseService.readMachineId` | 1 | `TaskDatabaseService.filter(…)` | `integration/src/modules/task-database/task-database.service.ts:318` |
| `AdoptTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.adopt` | `integration/src/modules/adopt-task-database/adopt-task-database.command.ts:42` |
| `ProcessRunnerService.captureSequence` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/process-runner/process-runner.service.ts:105` |
| `BoundBaseToPushCommand.run` | 1 | `BoundBaseToPushService.bound` | `integration/src/modules/bound-base-to-push/bound-base-to-push.command.ts:41` |
| `CollectCodometerBaselineService.findReports` | 1 | `CollectCodometerBaselineService.toSorted(…)` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:34` |
| `CollectCodometerBaselineCommand.run` | 1 | `CollectCodometerBaselineService.collect` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.command.ts:42` |
| `ImportPrTaskCacheService.api` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:62` |
| `ImportPrTaskCacheCommand.run` | 1 | `ImportPrTaskCacheService.import` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:43` |
| `KeepTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.keep` | `integration/src/modules/keep-task-database/keep-task-database.command.ts:41` |
| `MergeTaskCacheCommand.run` | 1 | `TaskDatabaseService.merge` | `integration/src/modules/merge-task-cache/merge-task-cache.command.ts:45` |
| `ReportCodometerChangesCommand.run` | 1 | `ReportCodometerChangesService.report` | `integration/src/modules/report-codometer-changes/report-codometer-changes.command.ts:43` |
| `RunAffectedService.readInputs` | 1 | `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:79` |
| `RunAffectedService.execute` | 1 | `ProcessRunnerService.stream` | `integration/src/modules/run-affected/run-affected.service.ts:147` |
| `SetupCodebaseCommand.boundBase` | 1 | `BoundBaseToPushService.bound` | `integration/src/modules/setup-codebase/setup-codebase.command.ts:69` |
| `PackageManifestService.replace` | 1 | `PackageManifestService.current` | `integration/src/modules/package-manifest/package-manifest.service.ts:49` |
| `UpgradeNodeService.fetchReleases` | 1 | `UpgradeNodeService.map(…)` | `integration/src/modules/upgrade-node/upgrade-node.service.ts:37` |
| `withRequiredVersion` | 1 | `nextVersion` | `integration/src/modules/upgrade-python/upgrade-python.utilities.ts:26` |
| `UpgradePythonService.newest` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/upgrade-python/upgrade-python.service.ts:45` |
| `map(…)` | 1 | `skippedBullet` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:38` |
| `map(…)` | 1 | `detailBullet` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:41` |
| `map(…)` | 1 | `quoteSkipped` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:65` |
| `flatMap(…)` | 1 | `map(…)` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:74` |
| `map(…)` | 1 | `code` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:76` |
| `UpgradeDependenciesService.git` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:79` |
| `UpgradeDependenciesService.snapshot` | 1 | `UpgradeDependenciesService.git` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.service.ts:84` |
| `UpgradeDependenciesCommand.conclude` | 1 | `skippedAnnotation` | `integration/src/modules/upgrade-dependencies/upgrade-dependencies.command.ts:57` |
| `VerifyTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.verify` | `integration/src/modules/verify-task-database/verify-task-database.command.ts:39` |
| `buildKnipArguments` | 1 | `flatMap(…)` | `integration/src/executors/knip/knip.utilities.ts:40` |
| `readIssueFiles` | 1 | `isRecord` | `integration/src/executors/knip/knip.utilities.ts:75` |
| `explain` | 1 | `runKnip` | `integration/src/executors/knip/batch-executor.ts:77` |
| `failAll` | 1 | `map(…)` | `integration/src/executors/knip/batch-executor.ts:101` |
| `runAlone` | 1 | `runKnip` | `integration/src/executors/knip/batch-executor.ts:182` |
| `knipExecutor` | 1 | `runKnip` | `integration/src/executors/knip/executor.ts:16` |
| `buildCspellArguments` | 1 | `map(…)` | `integration/src/executors/spell-check/spell-check.utilities.ts:8` |
| `explain` | 1 | `runCspell` | `integration/src/executors/spell-check/batch-executor.ts:64` |
| `spellCheckExecutor` | 1 | `runCspell` | `integration/src/executors/spell-check/executor.ts:18` |

</details>
<!-- callidescope:end -->
