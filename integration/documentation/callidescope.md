<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `integration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 397 |
| Files | 143 |
| Calls traced | 418 |
| Call stacks | 30 |
| Deepest stack | 8 |
| Stacks through recursion | 1 |
| Unfollowable calls | 25 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `ConventionalConfigCommand.run`** — depth 8 · decorated-method

```text
🚀 ConventionalConfigCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [integration/src/modules/synchronization/modules/conventional-config/conventional-config.command.ts:54]
   ↳ Runs the conventional-config sync command, delegating to helpers and exiting 1 on drift.
  └─> ConventionalConfigCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/conventional-config/conventional-config.command.ts:73]
     ↳ Synchronizes conventional-commit config and reports success without exiting.
    └─> ConventionalConfigService.runSynchronization(mode: string): boolean [integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:242]
       ↳ Runs the workflow in check or write mode, reporting whether it succeeded.
      └─> ConventionalConfigService.handleCheckMode(context: SyncContext): boolean [integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:128]
         ↳ Validates the configuration files are in sync with `conventional.config.cjs`, returning success rather than exiting so…
        └─> ConventionalConfigValidatorsService.checkAllSkillsSync(config: ConventionalConfig, skillFiles: string[]): boolean [integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:105]
           ↳ Validates that every configured skill file has synchronized type/scope tables.
          └─> ConventionalConfigValidatorsService.checkSkillSync(config: ConventionalConfig, skillFile: string): boolean [integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:243]
             ↳ Validates a skill file's type/scope markdown tables against source config.
            └─> ConventionalConfigValidatorsService.validateMarkerValues(…): boolean [integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:73]
               ↳ Compares skill marker values against source values and logs any mismatch.
              └─> ConventionalConfigValidatorsService.showDifference(source: string[], target: string[], targetName: string): void [integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:53]
                 ↳ Logs the items missing from and extra in the target compared to the source.
```

**2. `ProjectPortsCommand.run`** — depth 7 · decorated-method

```text
🚀 ProjectPortsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:239]
   ↳ Runs the project-ports sync command in check or write mode.
  └─> ProjectPortsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:258]
     ↳ Synchronizes every application's port and reports success without exiting.
    └─> ProjectPortsCommand.findPortProjects(root: string): PortProject[] [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:86]
       ↳ Every `*-api` and `*-web` project, whether directly under `projects` or in a domain folder.
      └─> ProjectPortsCommand.flatMap(…)(this: undefined, entry: Dirent<string>): string[] [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:92]
        └─> ProjectPortsCommand.findProjectDirectories(root: string, directory: string): string[] [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:104]
           ↳ The projects directly under a directory, which are those that hold a `project.json`.
          └─> ProjectPortsCommand.filter(…)(child: string): boolean [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:108]
            └─> ProjectPortsCommand.isProject(root: string, directory: string): boolean [integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:112]
               ↳ Whether a directory is an Nx project.
```

**3. `VscodeExtensionsCommand.run`** — depth 7 · decorated-method

```text
🚀 VscodeExtensionsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:189]
   ↳ Runs the vscode-extensions sync command in check or write mode.
  └─> VscodeExtensionsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:208]
     ↳ Synchronizes both devcontainer extension lists and reports success without exiting.
    └─> VscodeExtensionsCommand.map(…)(…): boolean [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:215]
      └─> VscodeExtensionsCommand.synchronizeDevcontainer(…): boolean [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:141]
         ↳ Brings one devcontainer into line, or reports how it differs, and says whether it was current.
        └─> VscodeExtensionsCommand.reportDrift(…): void [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:111]
           ↳ Reports every list of one devcontainer that differs from the source.
          └─> VscodeExtensionsCommand.reportDifferences(difference: ExtensionListDifference): void [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:97]
             ↳ Logs every entry that differs between the source list and a devcontainer's list.
            └─> VscodeExtensionsCommand.hasSameEntries(left: string[], right: string[]): boolean [integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:64]
               ↳ Whether two lists hold the same entries, in any order.
```

<details>
<summary>27 more call stacks</summary>

**4. `ImportPrTaskCacheCommand.run`** — depth 6 · decorated-method

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

**5. `SetupCodebaseCommand.run`** — depth 6 · decorated-method

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

**6. `CatalogManifestsCommand.run`** — depth 6 · decorated-method

```text
🚀 CatalogManifestsCommand.run(): Promise<void> [integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.command.ts:50]
   ↳ Checks every workspace manifest and exits 0 or 1 on the verdict.
  └─> CatalogManifestsCommand.synchronize(): Promise<boolean> [integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.command.ts:57]
     ↳ Checks every workspace manifest and reports whether all conform. Never writes.
    └─> CatalogManifestsCommand.flatMap(…)(this: undefined, manifestPath: string): string[] [integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.command.ts:63]
      └─> CatalogManifestsService.validateManifestDependencies(manifestPath: string, manifest: PackageManifest): string[] [integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.service.ts:125]
         ↳ Every mis-pinned dependency in one manifest, in every section.
        └─> CatalogManifestsService.isInternalWorkspaceDependency(dependencyName: string): boolean [integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.service.ts:91]
           ↳ Whether this dependency names one of this workspace's own packages.
          └─> CatalogManifestsService.some(…)(scope: string): boolean [integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.service.ts:92]
```

**7. `PackageManifestsCommand.run`** — depth 6 · decorated-method

```text
🚀 PackageManifestsCommand.run(passedParameters: string[]): Promise<void> [integration/src/modules/synchronization/modules/package-manifests/package-manifests.command.ts:52]
   ↳ Runs the package-manifests sync command and exits 1 on drift in check mode.
  └─> PackageManifestsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/package-manifests/package-manifests.command.ts:68]
     ↳ Synchronizes package manifest metadata and reports success without exiting.
    └─> PackageManifestsService.writeAll(workspaceRoot: string): void [integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:205]
       ↳ Writes the derived metadata across all publishable packages.
      └─> PackageManifestsService.writePackageManifest(…): void [integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:218]
         ↳ Writes the derived metadata into an individual package's package.json.
        └─> PackageManifestsService.sortKeys(object: Record<string, unknown>): Record<string, unknown> [integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:83]
           ↳ Sorts an object's keys alphabetically, ignoring case.
          └─> PackageManifestsService.toSorted(…)(leftKey: string, rightKey: string): number [integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:85]
```

**8. `SkillDescriptionsCommand.run`** — depth 6 · decorated-method

```text
🚀 SkillDescriptionsCommand.run(): Promise<void> [integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.command.ts:53]
   ↳ Checks every authored skill and exits 0 or 1 on the verdict.
  └─> SkillDescriptionsCommand.synchronize(): Promise<boolean> [integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.command.ts:60]
     ↳ Checks every authored skill and reports whether all fit. Never writes.
    └─> SkillDescriptionsService.findOverlongDescriptions(workspaceRoot: string, skillPaths: string[]): OverlongSkillDescription[] [integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:95]
       ↳ Every authored skill whose description holds more words than the limit.
      └─> SkillDescriptionsService.map(…)(skillPath: string): { skillPath: string; words: number; } [integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:100]
        └─> SkillDescriptionsService.countWords(text: string): number [integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:90]
           ↳ Counts words the way `wc -w` does: runs of non-whitespace.
          └─> SkillDescriptionsService.filter(…)(word: string): boolean [integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:91]
```

**9. `SkillExclusionsCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 SkillExclusionsCommand.run(passedParameters: string[]): Promise<void> [integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:160]
   ↳ Runs the skill-exclusions sync command in check or write mode.
  └─> SkillExclusionsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:175]
     ↳ Synchronizes the exclusion lists and reports success without exiting.
    └─> SkillExclusionsCommand.findStaleFiles(inputs: SkillExclusionInputs): string[] [integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:64]
       ↳ Every file whose generated block differs from what the lockfile implies.
      └─> SkillExclusionsCommand.filter(…)(file: SkillExclusionFile): boolean [integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:65]
        └─> SkillExclusionsCommand.readExclusionFile(…): { afterMarker: string; beforeMarker: string; generatedContent: string; } [integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:73]
           ↳ Splits one exclusion file around its generated block.
          └─> SkillExclusionsCommand.renderStartMarker(file: SkillExclusionFile): string [integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:134]
             ↳ The comment opening this file's generated block, in its own syntax.
```

**10. `knipBatchExecutor`** — depth 6 · orphan-root

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

**11. `spellCheckBatchExecutor`** — depth 6 · orphan-root

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

**12. `CollectCodometerBaselineCommand.run`** — depth 5 · decorated-method

```text
🚀 CollectCodometerBaselineCommand.run(): Promise<void> [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.command.ts:42]
   ↳ Gathers the reports and prints what it found.
  └─> CollectCodometerBaselineService.collect(root?: string): CollectCodometerBaselineReport [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:169]
     ↳ Restores the earlier baseline, then overlays each report beneath `root`.
    └─> CollectCodometerBaselineService.restorePrevious(root: string): string [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:121]
       ↳ Downloads the newest earlier baseline into the baseline directory.
      └─> CollectCodometerBaselineService.findBaselineReports(baselineRoot: string, directory?: string): string[] (cycle) [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:48]
         ↳ Lists the reports already in the baseline directory, relative to it.
        └─> CollectCodometerBaselineService.flatMap(…)(this: undefined, entry: fs.Dirent<string>): string[] (cycle) [integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:51]
```

**13. `RunAffectedCommand.run`** — depth 5 · decorated-method

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

**14. `AgentInstructionsCommand.run`** — depth 5 · decorated-method

```text
🚀 AgentInstructionsCommand.run(passedParameters: string[]): Promise<void> [integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.command.ts:54]
   ↳ Runs the derivation in check or write mode and exits 0 or 1 on the verdict.
  └─> AgentInstructionsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.command.ts:68]
     ↳ Checks or writes every project's link and reports whether all are in place.
    └─> AgentInstructionsService.findUnlinkedProjects(workspaceRoot: string): string[] [integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.service.ts:60]
       ↳ Every project path whose `AGENTS.md` has no `CLAUDE.md` link beside it.
      └─> AgentInstructionsService.filter(…)(projectPath: string): boolean [integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.service.ts:64]
        └─> AgentInstructionsService.isLinked(linkPath: string): boolean [integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.service.ts:41]
           ↳ Whether the link file is a symlink to the instructions file.
```

**15. `DevcontainerConfigurationCommand.run`** — depth 5 · decorated-method

```text
🚀 DevcontainerConfigurationCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:260]
   ↳ Runs the devcontainer-configuration sync command in check or write mode.
  └─> DevcontainerConfigurationCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:279]
     ↳ Synchronizes the cloud devcontainer config and reports success without exiting.
    └─> DevcontainerConfigurationCommand.applySync(…): DevcontainerConfiguration [integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:62]
       ↳ Merges local devcontainer fields into a copy of the cloud config, preserving cloud-only keys.
      └─> DevcontainerConfigurationCommand.syncFeatures(…): void [integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:178]
         ↳ Merges features from local and cloud configs, keeping Docker features from cloud.
        └─> DevcontainerConfigurationCommand.isDockerFeatureKey(key: string): boolean [integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:125]
           ↳ Returns true if the feature key refers to a Docker-in-Docker or Docker-outside-of-Docker feature.
```

**16. `AdoptTaskDatabaseCommand.run`** — depth 5 · decorated-method

```text
🚀 AdoptTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/task-database/modules/adopt-task-database/adopt-task-database.command.ts:42]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.adopt(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:346]
     ↳ Renames the newest restored database to this machine's id, which Nx opens, and discards the rest.
    └─> TaskDatabaseService.planAdoption(databases: readonly string[]): AdoptionPlan [integration/src/modules/task-database/task-database.service.ts:245]
       ↳ Decides what adopting would do, or why it should do nothing.
      └─> TaskDatabaseService.readMachineId(): string [integration/src/modules/task-database/task-database.service.ts:310]
         ↳ This machine's id, from the first readable, non-empty id file.
        └─> TaskDatabaseService.filter(…)(file: string): boolean [integration/src/modules/task-database/task-database.service.ts:314]
```

**17. `MergeTaskCacheCommand.run`** — depth 5 · decorated-method

```text
🚀 MergeTaskCacheCommand.run(parameters: string[]): Promise<void> [integration/src/modules/task-database/modules/merge-task-cache/merge-task-cache.command.ts:44]
   ↳ Merges the cache the first parameter names, and prints what happened.
  └─> TaskDatabaseService.merge(source: string): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:399]
     ↳ Merges another run's Nx cache into this one, so its finished tasks are hits. A failure skips the merge with a warning.
    └─> TaskDatabaseService.checkSource(source: string): MergeSource [integration/src/modules/task-database/task-database.service.ts:86]
       ↳ Finds the database a source would be merged from, or why it cannot be.
      └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
         ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
        └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**18. `CleanupCodebaseCommand.run`** — depth 4 · decorated-method

```text
🚀 CleanupCodebaseCommand.run(): Promise<void> [integration/src/modules/cleanup-codebase/cleanup-codebase.command.ts:45]
   ↳ Verifies the database, keeps the newest, and prints what they report.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:429]
     ↳ Discards every database that fails `PRAGMA integrity_check`, since a damaged one saved would be inherited by later jobs.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**19. `ReportCodometerChangesCommand.run`** — depth 4 · decorated-method

```text
🚀 ReportCodometerChangesCommand.run(): Promise<void> [integration/src/modules/report-codometer-changes/report-codometer-changes.command.ts:42]
   ↳ Reports the changes, prints what happened, and sets the exit code.
  └─> ReportCodometerChangesService.report(): ReportCodometerChangesOutcome [integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:177]
     ↳ Fetches the baseline and rewrites the pull request body with its changes.
    └─> ReportCodometerChangesService.fetchBaseline(): CodometerBaseline [integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:53]
       ↳ Downloads the newest baseline artifact `main` uploaded, if there is one.
      └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
         ↳ Runs a command to completion and returns both output streams and the exit code.
```

**20. `ReadmeProjectsCommand.run`** — depth 4 · decorated-method

```text
🚀 ReadmeProjectsCommand.run(): Promise<void> [integration/src/modules/synchronization/modules/readme-projects/readme-projects.command.ts:49]
   ↳ Checks every workspace project and exits 0 or 1 on the verdict.
  └─> ReadmeProjectsCommand.synchronize(): Promise<boolean> [integration/src/modules/synchronization/modules/readme-projects/readme-projects.command.ts:56]
     ↳ Checks every workspace project and reports whether all are linked. Never writes.
    └─> ReadmeProjectsService.resolveWorkspaceProjectPaths(workspaceRoot: string): string[] [integration/src/modules/synchronization/modules/readme-projects/readme-projects.service.ts:108]
       ↳ Every workspace project's scope-relative path, e.g. `projects/common/observability`.
      └─> ReadmeProjectsService.findRootProjectPaths(workspaceRoot: string): string[] [integration/src/modules/synchronization/modules/readme-projects/readme-projects.service.ts:71]
         ↳ Every project directly in the workspace root: a non-hidden directory with a `package.json`.
```

**21. `LockfileCommand.run`** — depth 4 · decorated-method

```text
🚀 LockfileCommand.run(): Promise<void> [integration/src/modules/synchronization/modules/lockfile/lockfile.command.ts:55]
   ↳ Checks the lockfile and exits 0 or 1 on pnpm's verdict.
  └─> LockfileCommand.synchronize(): Promise<boolean> [integration/src/modules/synchronization/modules/lockfile/lockfile.command.ts:62]
     ↳ Checks the lockfile and reports whether pnpm accepted it. Never writes.
    └─> LockfileService.checkLockfile(): FrozenInstallResult [integration/src/modules/synchronization/modules/lockfile/lockfile.service.ts:55]
       ↳ Runs `pnpm install --frozen-lockfile --lockfile-only`: the bare name, then the Node's own directory, as a git hook may…
      └─> LockfileService.runFrozenInstall(packageManagerPath: string): FrozenInstallResult [integration/src/modules/synchronization/modules/lockfile/lockfile.service.ts:33]
         ↳ Runs one candidate pnpm, merging both of its streams.
```

**22. `SynchronizationCommand.run`** — depth ≥ 4 · decorated-method

```text
🚀 SynchronizationCommand.run(passedParameters: string[]): Promise<void> [integration/src/modules/synchronization/synchronization.command.ts:86]
   ↳ Runs every synchronization, exiting once if any reported drift.
  └─> SynchronizationService.resolveSynchronizationModeOrExit(options: SynchronizationModeResolutionOptions): SynchronizationMode [integration/src/modules/synchronization/synchronization.service.ts:59]
     ↳ Resolves synchronization mode or exits the process when the mode is invalid.
    └─> SynchronizationService.resolveModeValue(…): SynchronizationModeResolutionResult [integration/src/modules/synchronization/synchronization.service.ts:40]
       ↳ Resolves mode value and indicates whether it is valid without side effects.
      └─> SynchronizationService.isSynchronizationMode(modeValue: string): modeValue is SynchronizationMode [integration/src/modules/synchronization/synchronization.service.ts:54]
         ↳ Returns true when the provided value is a supported synchronization mode.
```

**23. `KeepTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 KeepTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/task-database/modules/keep-task-database/keep-task-database.command.ts:41]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.keep(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:374]
     ↳ Keeps only the newest database, warning when there was more than one. Several means Nx opened a name of its own again.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**24. `VerifyTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 VerifyTaskDatabaseCommand.run(): Promise<void> [integration/src/modules/task-database/modules/verify-task-database/verify-task-database.command.ts:39]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [integration/src/modules/task-database/task-database.service.ts:429]
     ↳ Discards every database that fails `PRAGMA integrity_check`, since a damaged one saved would be inherited by later jobs.
    └─> TaskDatabaseService.list(directory?: string): string[] [integration/src/modules/task-database/task-database.service.ts:205]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [integration/src/modules/task-database/task-database.service.ts:214]
```

**25. `knipExecutor`** — depth 4 · orphan-root

```text
🚀 knipExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/knip/executor.ts:11]
   ↳ Fails one project's task when knip reports an issue in its workspace. Runs when batching is off or a task stands alone.
  └─> runKnip(…): Promise<CapturedProcess> [integration/src/executors/knip/knip.runner.ts:17]
     ↳ Runs knip over the given workspaces and returns what it printed.
    └─> buildKnipArguments(args: BuildKnipArguments): string[] [integration/src/executors/knip/knip.utilities.ts:36]
       ↳ Builds the arguments of one knip run over the given workspaces.
      └─> flatMap(…)(this: undefined, root: string): string[] [integration/src/executors/knip/knip.utilities.ts:44]
```

**26. `spellCheckExecutor`** — depth 4 · orphan-root

```text
🚀 spellCheckExecutor(…): Promise<{ success: boolean; }> [integration/src/executors/spell-check/executor.ts:14]
   ↳ Fails one project's task when cspell finds a misspelling under its root.
  └─> runCspell(…): Promise<CapturedProcess> [integration/src/executors/spell-check/spell-check.runner.ts:17]
     ↳ Runs cspell over the given roots and returns what it printed.
    └─> buildCspellArguments(args: BuildCspellArguments): string[] [integration/src/executors/spell-check/spell-check.utilities.ts:8]
       ↳ Builds the arguments of one cspell run over the given project roots.
      └─> map(…)(root: string): string [integration/src/executors/spell-check/spell-check.utilities.ts:12]
```

**27. `BoundBaseToPushCommand.run`** — depth 3 · decorated-method

```text
🚀 BoundBaseToPushCommand.run(): Promise<void> [integration/src/modules/bound-base-to-push/bound-base-to-push.command.ts:40]
   ↳ Bounds the base, prints what it decided, and sets the exit code.
  └─> BoundBaseToPushService.bound(): BoundBaseReport [integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:51]
     ↳ Decides the push's base, and writes a moved one to `GITHUB_ENV` for the later steps of the job.
    └─> BoundBaseToPushService.read(name: "BEFORE" | "GITHUB_ENV" | "NX_BASE" | "NX_HEAD"): string [integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:41]
       ↳ Reads one variable, an absent one as empty.
```

**28. `SynchronizationMarkersService.extractContent`** — depth 3 · orphan-root

```text
🚀 SynchronizationMarkersService.extractContent(content: string, markerName: string): string | undefined [integration/src/modules/synchronization/synchronization-markers.service.ts:44]
   ↳ Returns the content between the markers, or undefined when absent.
  └─> SynchronizationMarkersService.locateMarkers(…): { endIndex: number; startIndex: number; } | undefined [integration/src/modules/synchronization/synchronization-markers.service.ts:24]
     ↳ Returns the index range the markers enclose, or undefined when absent.
    └─> SynchronizationMarkersService.getStartMarker(markerName: string): string [integration/src/modules/synchronization/synchronization-markers.service.ts:57]
       ↳ Renders the opening marker comment for a marker name.
```

**29. `SynchronizationMarkersService.replaceContent`** — depth 3 · orphan-root

```text
🚀 SynchronizationMarkersService.replaceContent(content: string, markerName: string, replacement: string): string [integration/src/modules/synchronization/synchronization-markers.service.ts:65]
   ↳ Replaces the content between the markers, surrounding it with the blank lines markdown needs for the block to be parsed…
  └─> SynchronizationMarkersService.locateMarkers(…): { endIndex: number; startIndex: number; } | undefined [integration/src/modules/synchronization/synchronization-markers.service.ts:24]
     ↳ Returns the index range the markers enclose, or undefined when absent.
    └─> SynchronizationMarkersService.getStartMarker(markerName: string): string [integration/src/modules/synchronization/synchronization-markers.service.ts:57]
       ↳ Renders the opening marker comment for a marker name.
```

**30. `ProcessRunnerService.captureSequence`** — depth 2 · orphan-root

```text
🚀 ProcessRunnerService.captureSequence(commands: readonly Command[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:98]
   ↳ Runs commands in order, stopping at the first that fails, and returns their output.
  └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [integration/src/modules/process-runner/process-runner.service.ts:42]
     ↳ Runs a command to completion and returns both output streams and the exit code.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConventionalConfigService.handleCheckMode` | 8 | `ConventionalConfigValidatorsService.checkSettingsSync`, `ConventionalConfigValidatorsService.checkAllSkillsSync`, `ConventionalConfigValidatorsService.checkAllTemplatesSync`, `ConventionalConfigService.loadReleaseConfig`, `ConventionalConfigValidatorsService.checkReleaseRulesSync`, `ConventionalConfigIoService.getReleaseRulesTypes`, `ConventionalConfigValidatorsService.checkPresetConfigSync`, `ConventionalConfigIoService.getPresetConfigTypes` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:128` |
| `ConventionalConfigService.handleWriteMode` | 7 | `ConventionalConfigValidatorsService.checkSettingsSync`, `ConventionalConfigService.filter(…)`, `ConventionalConfigService.filter(…)`, `ConventionalConfigIoService.writeSettingsSync`, `ConventionalConfigIoService.writeSkillSync`, `ConventionalConfigIoService.writeIssueTemplateSync`, `ConventionalConfigService.syncReleaseConfigIfNeeded` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:184` |
| `TaskDatabaseService.planMerge` | 6 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `schemaOf`, `schemaMismatchReason` | `integration/src/modules/task-database/task-database.service.ts:272` |

<details>
<summary>169 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TaskDatabaseService.adopt` | 6 | `TaskDatabaseService.list`, `TaskDatabaseService.planAdoption`, `TaskDatabaseService.discardOthers`, `TaskDatabaseService.rename`, `adoptedMessage`, `TaskDatabaseService.countCachedResults` | `integration/src/modules/task-database/task-database.service.ts:346` |
| `ImportPrTaskCacheService.import` | 6 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.locate`, `ImportPrTaskCacheService.download`, `importingMessage`, `TaskDatabaseService.merge`, `couldNotImportMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:170` |
| `ConventionalConfigIoService.writeReleaseConfigSync` | 6 | `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.filter(…)`, `ConventionalConfigIoService.getReleaseRulesTypes`, `ConventionalConfigIoService.getPresetConfigTypes`, `ConventionalConfigIoService.appendToReleaseRules`, `ConventionalConfigIoService.appendToPresetTypes` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:297` |
| `ConventionalConfigService.runSynchronization` | 6 | `ConventionalConfigService.loadConventionalConfig`, `ConventionalConfigService.map(…)`, `ConventionalConfigIoService.parseSettingsScopes`, `ConventionalConfigService.map(…)`, `ConventionalConfigService.handleCheckMode`, `ConventionalConfigService.handleWriteMode` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:242` |
| `PackageManifestsService.checkPackageManifest` | 6 | `PackageManifestsService.readPackageManifest`, `PackageManifestsService.deriveMetadata`, `PackageManifestsService.compareStringField`, `PackageManifestsService.compareBugsField`, `PackageManifestsService.compareRepositoryField`, `PackageManifestsService.filter(…)` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:125` |
| `SynchronizationCommand.reportResults` | 6 | `SynchronizationCommand.filter(…)`, `SynchronizationCommand.map(…)`, `SynchronizationCommand.filter(…)`, `SynchronizationCommand.map(…)`, `SynchronizationCommand.filter(…)`, `SynchronizationCommand.map(…)` | `integration/src/modules/synchronization/synchronization.command.ts:45` |
| `judgeGroup` | 6 | `map(…)`, `runKnip`, `attributeIssues`, `failAll`, `filter(…)`, `explain` | `integration/src/executors/knip/batch-executor.ts:104` |
| `BoundBaseToPushService.bound` | 5 | `BoundBaseToPushService.read`, `noPreviousTipMessage`, `ProcessRunnerService.capture`, `notAncestorMessage`, `boundingMessage` | `integration/src/modules/bound-base-to-push/bound-base-to-push.service.ts:51` |
| `TaskDatabaseService.checkSource` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.integrityOf`, `TaskDatabaseService.query`, `TaskDatabaseService.every(…)` | `integration/src/modules/task-database/task-database.service.ts:86` |
| `TaskDatabaseService.mergeRows` | 5 | `TaskDatabaseService.query`, `TaskDatabaseService.copyMissingOutputs`, `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.insertRows`, `mergedMessage` | `integration/src/modules/task-database/task-database.service.ts:221` |
| `TaskDatabaseService.keep` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.discardOthers`, `duplicateMessage`, `TaskDatabaseService.map(…)` | `integration/src/modules/task-database/task-database.service.ts:374` |
| `TaskDatabaseService.merge` | 5 | `TaskDatabaseService.checkSource`, `notMergingMessage`, `TaskDatabaseService.planMerge`, `TaskDatabaseService.adoptSource`, `TaskDatabaseService.mergeRows` | `integration/src/modules/task-database/task-database.service.ts:399` |
| `CollectCodometerBaselineService.restorePrevious` | 5 | `ProcessRunnerService.capture`, `buildFindBaselineArguments`, `previousBaselineSkippedMessage`, `restoredMessage`, `CollectCodometerBaselineService.findBaselineReports` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:121` |
| `CollectCodometerBaselineService.collect` | 5 | `CollectCodometerBaselineService.restorePrevious`, `CollectCodometerBaselineService.findReports`, `CollectCodometerBaselineService.prune`, `prunedMessage`, `collectedMessage` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:169` |
| `ImportPrTaskCacheService.locate` | 5 | `ImportPrTaskCacheService.findPullRequest`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `artifactQuery`, `noArtifactMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:125` |
| `ConventionalConfigService.syncReleaseConfigIfNeeded` | 5 | `ConventionalConfigService.loadReleaseConfig`, `ConventionalConfigService.filter(…)`, `ConventionalConfigIoService.getReleaseRulesTypes`, `ConventionalConfigIoService.getPresetConfigTypes`, `ConventionalConfigIoService.writeReleaseConfigSync` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:96` |
| `ProjectPortsCommand.synchronizeProject` | 5 | `ProjectPortsCommand.readCurrentPort`, `ProjectPortsCommand.map(…)`, `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.listFiles`, `ProjectPortsCommand.resolveScope` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:159` |
| `judgeGroup` | 5 | `runCspell`, `map(…)`, `chargedRoots`, `map(…)`, `explain` | `integration/src/executors/spell-check/batch-executor.ts:80` |
| `TaskDatabaseService.planAdoption` | 4 | `TaskDatabaseService.readMachineId`, `TaskDatabaseService.newest`, `noSchemaMessage`, `TaskDatabaseService.directory` | `integration/src/modules/task-database/task-database.service.ts:245` |
| `TaskDatabaseService.verify` | 4 | `TaskDatabaseService.list`, `TaskDatabaseService.integrityOf`, `corruptMessage`, `TaskDatabaseService.discard` | `integration/src/modules/task-database/task-database.service.ts:429` |
| `ImportPrTaskCacheService.findPullRequest` | 4 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `untrustedMessage` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:98` |
| `RunAffectedCommand.run` | 4 | `RunAffectedService.plan`, `RunAffectedCommand.report`, `templateFilesHeading`, `RunAffectedService.execute` | `integration/src/modules/run-affected/run-affected.command.ts:53` |
| `SetupCodebaseCommand.run` | 4 | `SetupCodebaseCommand.boundBase`, `ImportPrTaskCacheService.import`, `TaskDatabaseService.verify`, `TaskDatabaseService.adopt` | `integration/src/modules/setup-codebase/setup-codebase.command.ts:86` |
| `ConventionalConfigIoService.writeSkillSync` | 4 | `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.generateMarkdownTable`, `ConventionalConfigIoService.replaceMarkerContent` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:360` |
| `ConventionalConfigValidatorsService.checkSkillSync` | 4 | `ConventionalConfigIoService.extractMarkerContent`, `ConventionalConfigValidatorsService.validateMarkerValues`, `ConventionalConfigIoService.parseMarkdownTableValues`, `ConventionalConfigValidatorsService.getSourceValuesForMarker` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:243` |
| `PackageManifestsService.checkAll` | 4 | `PackageManifestsService.readRootManifest`, `PackageManifestsService.map(…)`, `PackageManifestsService.filter(…)`, `PackageManifestsService.filter(…)` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:100` |
| `ProjectPortsCommand.findPortProjects` | 4 | `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.map(…)`, `ProjectPortsCommand.flatMap(…)` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:86` |
| `SkillDescriptionsService.resolveAuthoredSkillPaths` | 4 | `SkillDescriptionsService.readSkillsLock`, `SkillDescriptionsService.toSorted(…)`, `SkillDescriptionsService.findLocalSkillPaths`, `SkillDescriptionsService.findPublishedSkillPaths` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:140` |
| `VscodeExtensionsCommand.synchronizeDevcontainer` | 4 | `VscodeExtensionsCommand.readDevcontainer`, `VscodeExtensionsCommand.isCurrent`, `VscodeExtensionsCommand.reportDrift`, `VscodeExtensionsCommand.write` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:141` |
| `TaskDatabaseService.adoptSource` | 3 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `nothingToMergeIntoMessage` | `integration/src/modules/task-database/task-database.service.ts:66` |
| `ReportCodometerChangesService.fetchBaseline` | 3 | `ProcessRunnerService.capture`, `buildFindBaselineArguments`, `baselineSkippedMessage` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:53` |
| `ReportCodometerChangesService.rewriteBody` | 3 | `ProcessRunnerService.capture`, `failedMessage`, `ProcessRunnerService.stream` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:104` |
| `ReportCodometerChangesService.report` | 3 | `ReportCodometerChangesService.fetchBaseline`, `ReportCodometerChangesService.rewriteBody`, `baselineFoundMessage` | `integration/src/modules/report-codometer-changes/report-codometer-changes.service.ts:177` |
| `RunAffectedService.plan` | 3 | `RunAffectedService.readInputs`, `RunAffectedService.templatesChanged`, `RunAffectedService.runOf` | `integration/src/modules/run-affected/run-affected.service.ts:159` |
| `ReadmeProjectsCommand.synchronize` | 3 | `ReadmeProjectsService.resolveWorkspaceProjectPaths`, `ReadmeProjectsService.readRootReadme`, `ReadmeProjectsService.findUndocumentedProjectPaths` | `integration/src/modules/synchronization/modules/readme-projects/readme-projects.command.ts:56` |
| `ConventionalConfigIoService.writeIssueTemplateSync` | 3 | `ConventionalConfigIoService.writeIssueTemplateDropdown`, `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:265` |
| `ConventionalConfigValidatorsService.checkIssueTemplateSync` | 3 | `ConventionalConfigValidatorsService.getSourceValuesForMarker`, `ConventionalConfigIoService.parseIssueTemplateDropdown`, `ConventionalConfigValidatorsService.validateMarkerValues` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:135` |
| `DevcontainerConfigurationCommand.applySync` | 3 | `DevcontainerConfigurationCommand.syncVerbatimFields`, `DevcontainerConfigurationCommand.preserveRemoteEnvironment`, `DevcontainerConfigurationCommand.syncFeatures` | `integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:62` |
| `DevcontainerConfigurationCommand.synchronize` | 3 | `DevcontainerConfigurationCommand.applySync`, `DevcontainerConfigurationCommand.check`, `DevcontainerConfigurationCommand.writeWhenDrifted` | `integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:279` |
| `PackageManifestsService.writePackageManifest` | 3 | `PackageManifestsService.readPackageManifest`, `PackageManifestsService.deriveMetadata`, `PackageManifestsService.sortKeys` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:218` |
| `PackageManifestsCommand.synchronize` | 3 | `PackageManifestsService.writeAll`, `PackageManifestsService.checkAll`, `PackageManifestsCommand.map(…)` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.command.ts:68` |
| `ProjectPortsCommand.findProjectDirectories` | 3 | `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.map(…)`, `ProjectPortsCommand.filter(…)` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:104` |
| `ProjectPortsCommand.synchronize` | 3 | `ProjectPortsCommand.findPortProjects`, `ProjectPortsCommand.verifyDistinctPorts`, `ProjectPortsCommand.map(…)` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:258` |
| `SkillDescriptionsService.findLocalSkillPaths` | 3 | `SkillDescriptionsService.filter(…)`, `SkillDescriptionsService.map(…)`, `SkillDescriptionsService.filter(…)` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:44` |
| `SkillDescriptionsCommand.synchronize` | 3 | `SkillDescriptionsService.resolveAuthoredSkillPaths`, `SkillDescriptionsService.findOverlongDescriptions`, `SkillDescriptionsService.measureTotalCharacters` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.command.ts:60` |
| `SkillExclusionsCommand.writeSync` | 3 | `SkillExclusionsCommand.readExclusionFile`, `SkillExclusionsCommand.renderBlock`, `SkillExclusionsCommand.map(…)` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:139` |
| `SkillExclusionsCommand.synchronize` | 3 | `SkillExclusionsCommand.readInputs`, `SkillExclusionsCommand.writeSync`, `SkillExclusionsCommand.findStaleFiles` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:175` |
| `runKnip` | 3 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildKnipArguments` | `integration/src/executors/knip/knip.runner.ts:17` |
| `knipBatchExecutor` | 3 | `runAlone`, `judgeGroup`, `printFailures` | `integration/src/executors/knip/batch-executor.ts:22` |
| `runCspell` | 3 | `ProcessRunnerService.captureAsync`, `ProcessRunnerService.constructor`, `buildCspellArguments` | `integration/src/executors/spell-check/spell-check.runner.ts:17` |
| `TaskDatabaseService.list` | 2 | `TaskDatabaseService.map(…)`, `TaskDatabaseService.filter(…)` | `integration/src/modules/task-database/task-database.service.ts:205` |
| `CleanupCodebaseCommand.run` | 2 | `TaskDatabaseService.verify`, `TaskDatabaseService.keep` | `integration/src/modules/cleanup-codebase/cleanup-codebase.command.ts:45` |
| `CollectCodometerBaselineService.findReports` | 2 | `CollectCodometerBaselineService.toSorted(…)`, `CollectCodometerBaselineService.isProjectReport` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:63` |
| `CollectCodometerBaselineService.prune` | 2 | `CollectCodometerBaselineService.findBaselineReports`, `CollectCodometerBaselineService.isProjectReport` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:99` |
| `ImportPrTaskCacheService.download` | 2 | `ProcessRunnerService.captureToFile`, `ProcessRunnerService.capture` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:66` |
| `RunAffectedService.listChangedFiles` | 2 | `ProcessRunnerService.capture`, `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:46` |
| `RunAffectedService.templatesChanged` | 2 | `RunAffectedService.listChangedFiles`, `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:118` |
| `SynchronizationService.resolveSynchronizationModeOrExit` | 2 | `SynchronizationService.resolveModeValue`, `SynchronizationService.exitInvalidMode` | `integration/src/modules/synchronization/synchronization.service.ts:59` |
| `ReadmeProjectsService.resolveWorkspaceProjectPaths` | 2 | `ReadmeProjectsService.findRootProjectPaths`, `ReadmeProjectsService.findProjectPaths` | `integration/src/modules/synchronization/modules/readme-projects/readme-projects.service.ts:108` |
| `AgentInstructionsService.findUnlinkedProjects` | 2 | `AgentInstructionsService.filter(…)`, `ReadmeProjectsService.resolveWorkspaceProjectPaths` | `integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.service.ts:60` |
| `AgentInstructionsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `AgentInstructionsCommand.synchronize` | `integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.command.ts:54` |
| `AgentInstructionsCommand.synchronize` | 2 | `AgentInstructionsService.findUnlinkedProjects`, `AgentInstructionsService.linkProjects` | `integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.command.ts:68` |
| `CatalogManifestsService.resolveWorkspaceManifestPaths` | 2 | `CatalogManifestsService.findRootManifestPaths`, `CatalogManifestsService.findManifestPaths` | `integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.service.ts:105` |
| `CatalogManifestsCommand.synchronize` | 2 | `CatalogManifestsService.resolveWorkspaceManifestPaths`, `CatalogManifestsCommand.flatMap(…)` | `integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.command.ts:57` |
| `CatalogManifestsCommand.flatMap(…)` | 2 | `CatalogManifestsService.validateManifestDependencies`, `CatalogManifestsService.readManifest` | `integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.command.ts:63` |
| `ConventionalConfigIoService.getReleaseRulesTypes` | 2 | `ConventionalConfigIoService.filter(…)`, `ConventionalConfigIoService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:191` |
| `ConventionalConfigValidatorsService.getSourceValuesForMarker` | 2 | `ConventionalConfigValidatorsService.map(…)`, `ConventionalConfigValidatorsService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:41` |
| `ConventionalConfigCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `ConventionalConfigCommand.synchronize` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.command.ts:54` |
| `DevcontainerConfigurationCommand.check` | 2 | `DevcontainerConfigurationCommand.isCurrent`, `DevcontainerConfigurationCommand.reportDifferences` | `integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:83` |
| `DevcontainerConfigurationCommand.writeWhenDrifted` | 2 | `DevcontainerConfigurationCommand.isCurrent`, `DevcontainerConfigurationCommand.write` | `integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:236` |
| `DevcontainerConfigurationCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `DevcontainerConfigurationCommand.synchronize` | `integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:260` |
| `PackageManifestsService.writeAll` | 2 | `PackageManifestsService.readRootManifest`, `PackageManifestsService.writePackageManifest` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:205` |
| `PackageManifestsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `PackageManifestsCommand.synchronize` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.command.ts:52` |
| `ProjectPortsCommand.describeProject` | 2 | `ProjectPortsCommand.find(…)`, `ProjectPortsService.textToPort` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:63` |
| `ProjectPortsCommand.flatMap(…)` | 2 | `ProjectPortsCommand.isProject`, `ProjectPortsCommand.findProjectDirectories` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:92` |
| `ProjectPortsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `ProjectPortsCommand.synchronize` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:239` |
| `SkillDescriptionsService.findPublishedSkillPaths` | 2 | `SkillDescriptionsService.filter(…)`, `SkillDescriptionsService.map(…)` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:57` |
| `SkillDescriptionsService.findOverlongDescriptions` | 2 | `SkillDescriptionsService.filter(…)`, `SkillDescriptionsService.map(…)` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:95` |
| `SkillDescriptionsService.map(…)` | 2 | `SkillDescriptionsService.countWords`, `SkillDescriptionsService.readDescription` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:100` |
| `SkillExclusionsCommand.findStaleFiles` | 2 | `SkillExclusionsCommand.map(…)`, `SkillExclusionsCommand.filter(…)` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:64` |
| `SkillExclusionsCommand.filter(…)` | 2 | `SkillExclusionsCommand.readExclusionFile`, `SkillExclusionsCommand.renderBlock` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:65` |
| `SkillExclusionsCommand.readExclusionFile` | 2 | `SkillExclusionsCommand.renderStartMarker`, `SkillExclusionsCommand.renderEndMarker` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:73` |
| `SkillExclusionsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `SkillExclusionsCommand.synchronize` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:160` |
| `VscodeExtensionsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `VscodeExtensionsCommand.synchronize` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:189` |
| `SynchronizationMarkersService.locateMarkers` | 2 | `SynchronizationMarkersService.getStartMarker`, `SynchronizationMarkersService.getEndMarker` | `integration/src/modules/synchronization/synchronization-markers.service.ts:24` |
| `SynchronizationCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `SynchronizationCommand.synchronize` | `integration/src/modules/synchronization/synchronization.command.ts:86` |
| `attributeIssues` | 2 | `readIssueFiles`, `ownerOf` | `integration/src/executors/knip/knip.utilities.ts:9` |
| `ownerOf` | 2 | `toSorted(…)`, `filter(…)` | `integration/src/executors/knip/knip.utilities.ts:57` |
| `spellCheckBatchExecutor` | 2 | `judgeGroup`, `printFailures` | `integration/src/executors/spell-check/batch-executor.ts:16` |
| `ProcessRunnerService.captureSequence` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/process-runner/process-runner.service.ts:98` |
| `BoundBaseToPushCommand.run` | 1 | `BoundBaseToPushService.bound` | `integration/src/modules/bound-base-to-push/bound-base-to-push.command.ts:40` |
| `TaskDatabaseService.countCachedResults` | 1 | `TaskDatabaseService.query` | `integration/src/modules/task-database/task-database.service.ts:140` |
| `TaskDatabaseService.discardOthers` | 1 | `TaskDatabaseService.discard` | `integration/src/modules/task-database/task-database.service.ts:163` |
| `TaskDatabaseService.integrityOf` | 1 | `TaskDatabaseService.query` | `integration/src/modules/task-database/task-database.service.ts:193` |
| `TaskDatabaseService.newest` | 1 | `TaskDatabaseService.reduce(…)` | `integration/src/modules/task-database/task-database.service.ts:236` |
| `TaskDatabaseService.readMachineId` | 1 | `TaskDatabaseService.filter(…)` | `integration/src/modules/task-database/task-database.service.ts:310` |
| `CollectCodometerBaselineService.findBaselineReports` | 1 | `CollectCodometerBaselineService.flatMap(…)` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:48` |
| `CollectCodometerBaselineService.flatMap(…)` | 1 | `CollectCodometerBaselineService.findBaselineReports` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.service.ts:51` |
| `CollectCodometerBaselineCommand.run` | 1 | `CollectCodometerBaselineService.collect` | `integration/src/modules/collect-codometer-baseline/collect-codometer-baseline.command.ts:42` |
| `ImportPrTaskCacheService.api` | 1 | `ProcessRunnerService.capture` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:55` |
| `ImportPrTaskCacheCommand.run` | 1 | `ImportPrTaskCacheService.import` | `integration/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:42` |
| `ReportCodometerChangesCommand.run` | 1 | `ReportCodometerChangesService.report` | `integration/src/modules/report-codometer-changes/report-codometer-changes.command.ts:42` |
| `RunAffectedService.readInputs` | 1 | `RunAffectedService.filter(…)` | `integration/src/modules/run-affected/run-affected.service.ts:77` |
| `RunAffectedService.execute` | 1 | `ProcessRunnerService.stream` | `integration/src/modules/run-affected/run-affected.service.ts:142` |
| `SetupCodebaseCommand.boundBase` | 1 | `BoundBaseToPushService.bound` | `integration/src/modules/setup-codebase/setup-codebase.command.ts:57` |
| `SynchronizationService.resolveModeValue` | 1 | `SynchronizationService.isSynchronizationMode` | `integration/src/modules/synchronization/synchronization.service.ts:40` |
| `ReadmeProjectsService.findUndocumentedProjectPaths` | 1 | `ReadmeProjectsService.filter(…)` | `integration/src/modules/synchronization/modules/readme-projects/readme-projects.service.ts:93` |
| `AgentInstructionsService.filter(…)` | 1 | `AgentInstructionsService.isLinked` | `integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.service.ts:64` |
| `AgentInstructionsService.linkProjects` | 1 | `AgentInstructionsService.isOccupied` | `integration/src/modules/synchronization/modules/agent-instructions/agent-instructions.service.ts:76` |
| `ReadmeProjectsCommand.run` | 1 | `ReadmeProjectsCommand.synchronize` | `integration/src/modules/synchronization/modules/readme-projects/readme-projects.command.ts:49` |
| `CatalogManifestsService.isInternalWorkspaceDependency` | 1 | `CatalogManifestsService.some(…)` | `integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.service.ts:91` |
| `CatalogManifestsService.validateManifestDependencies` | 1 | `CatalogManifestsService.isInternalWorkspaceDependency` | `integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.service.ts:125` |
| `CatalogManifestsCommand.run` | 1 | `CatalogManifestsCommand.synchronize` | `integration/src/modules/synchronization/modules/catalog-manifests/catalog-manifests.command.ts:50` |
| `ConventionalConfigIoService.writeIssueTemplateDropdown` | 1 | `ConventionalConfigIoService.generateYamlDropdownOptions` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:62` |
| `ConventionalConfigIoService.appendToPresetTypes` | 1 | `ConventionalConfigIoService.capitalize` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:86` |
| `ConventionalConfigIoService.appendToReleaseRules` | 1 | `ConventionalConfigIoService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:117` |
| `ConventionalConfigIoService.formatScopesForSettings` | 1 | `ConventionalConfigIoService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:148` |
| `ConventionalConfigIoService.generateYamlDropdownOptions` | 1 | `ConventionalConfigIoService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:177` |
| `ConventionalConfigIoService.getPresetConfigTypes` | 1 | `ConventionalConfigIoService.map(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:184` |
| `ConventionalConfigIoService.writeSettingsSync` | 1 | `ConventionalConfigIoService.formatScopesForSettings` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-io.service.ts:334` |
| `ConventionalConfigValidatorsService.validateMarkerValues` | 1 | `ConventionalConfigValidatorsService.showDifference` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:73` |
| `ConventionalConfigValidatorsService.checkAllSkillsSync` | 1 | `ConventionalConfigValidatorsService.checkSkillSync` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:105` |
| `ConventionalConfigValidatorsService.checkAllTemplatesSync` | 1 | `ConventionalConfigValidatorsService.checkIssueTemplateSync` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:119` |
| `ConventionalConfigValidatorsService.checkReleaseRulesSync` | 1 | `ConventionalConfigValidatorsService.filter(…)` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:194` |
| `ConventionalConfigValidatorsService.checkSettingsSync` | 1 | `ConventionalConfigValidatorsService.showDifference` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config-validators.service.ts:219` |
| `ConventionalConfigService.filter(…)` | 1 | `ConventionalConfigValidatorsService.checkSkillSync` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:192` |
| `ConventionalConfigService.filter(…)` | 1 | `ConventionalConfigValidatorsService.checkIssueTemplateSync` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.service.ts:199` |
| `ConventionalConfigCommand.synchronize` | 1 | `ConventionalConfigService.runSynchronization` | `integration/src/modules/synchronization/modules/conventional-config/conventional-config.command.ts:73` |
| `DevcontainerConfigurationCommand.syncFeatures` | 1 | `DevcontainerConfigurationCommand.isDockerFeatureKey` | `integration/src/modules/synchronization/modules/devcontainer-configuration/devcontainer-configuration.command.ts:178` |
| `LockfileService.checkLockfile` | 1 | `LockfileService.runFrozenInstall` | `integration/src/modules/synchronization/modules/lockfile/lockfile.service.ts:55` |
| `LockfileCommand.run` | 1 | `LockfileCommand.synchronize` | `integration/src/modules/synchronization/modules/lockfile/lockfile.command.ts:55` |
| `LockfileCommand.synchronize` | 1 | `LockfileService.checkLockfile` | `integration/src/modules/synchronization/modules/lockfile/lockfile.command.ts:62` |
| `PackageManifestsService.sortKeys` | 1 | `PackageManifestsService.toSorted(…)` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:83` |
| `PackageManifestsService.map(…)` | 1 | `PackageManifestsService.checkPackageManifest` | `integration/src/modules/synchronization/modules/package-manifests/package-manifests.service.ts:102` |
| `ProjectPortsService.replacePort` | 1 | `ProjectPortsService.map(…)` | `integration/src/modules/synchronization/modules/project-ports/project-ports.service.ts:34` |
| `ProjectPortsCommand.map(…)` | 1 | `ProjectPortsCommand.describeProject` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:99` |
| `ProjectPortsCommand.filter(…)` | 1 | `ProjectPortsCommand.isProject` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:108` |
| `ProjectPortsCommand.listFiles` | 1 | `ProjectPortsCommand.flatMap(…)` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:117` |
| `ProjectPortsCommand.flatMap(…)` | 1 | `ProjectPortsCommand.listFiles` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:118` |
| `ProjectPortsCommand.filter(…)` | 1 | `ProjectPortsService.replacePort` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:191` |
| `ProjectPortsCommand.verifyDistinctPorts` | 1 | `ProjectPortsCommand.filter(…)` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:216` |
| `ProjectPortsCommand.map(…)` | 1 | `ProjectPortsCommand.synchronizeProject` | `integration/src/modules/synchronization/modules/project-ports/project-ports.command.ts:266` |
| `SkillDescriptionsService.countWords` | 1 | `SkillDescriptionsService.filter(…)` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:90` |
| `SkillDescriptionsService.measureTotalCharacters` | 1 | `SkillDescriptionsService.reduce(…)` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:108` |
| `SkillDescriptionsService.reduce(…)` | 1 | `SkillDescriptionsService.readDescription` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.service.ts:113` |
| `SkillDescriptionsCommand.run` | 1 | `SkillDescriptionsCommand.synchronize` | `integration/src/modules/synchronization/modules/skill-descriptions/skill-descriptions.command.ts:53` |
| `SkillExclusionsCommand.readInputs` | 1 | `SkillExclusionsCommand.toSorted(…)` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:106` |
| `SkillExclusionsCommand.renderBlock` | 1 | `SkillExclusionsCommand.map(…)` | `integration/src/modules/synchronization/modules/skill-exclusions/skill-exclusions.command.ts:119` |
| `VscodeExtensionsCommand.isCurrent` | 1 | `VscodeExtensionsCommand.hasSameEntries` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:69` |
| `VscodeExtensionsCommand.reportDifferences` | 1 | `VscodeExtensionsCommand.hasSameEntries` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:97` |
| `VscodeExtensionsCommand.reportDrift` | 1 | `VscodeExtensionsCommand.reportDifferences` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:111` |
| `VscodeExtensionsCommand.synchronize` | 1 | `VscodeExtensionsCommand.map(…)` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:208` |
| `VscodeExtensionsCommand.map(…)` | 1 | `VscodeExtensionsCommand.synchronizeDevcontainer` | `integration/src/modules/synchronization/modules/vscode-extensions/vscode-extensions.command.ts:215` |
| `SynchronizationMarkersService.extractContent` | 1 | `SynchronizationMarkersService.locateMarkers` | `integration/src/modules/synchronization/synchronization-markers.service.ts:44` |
| `SynchronizationMarkersService.replaceContent` | 1 | `SynchronizationMarkersService.locateMarkers` | `integration/src/modules/synchronization/synchronization-markers.service.ts:65` |
| `SynchronizationCommand.synchronize` | 1 | `SynchronizationCommand.reportResults` | `integration/src/modules/synchronization/synchronization.command.ts:105` |
| `AdoptTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.adopt` | `integration/src/modules/task-database/modules/adopt-task-database/adopt-task-database.command.ts:42` |
| `KeepTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.keep` | `integration/src/modules/task-database/modules/keep-task-database/keep-task-database.command.ts:41` |
| `MergeTaskCacheCommand.run` | 1 | `TaskDatabaseService.merge` | `integration/src/modules/task-database/modules/merge-task-cache/merge-task-cache.command.ts:44` |
| `VerifyTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.verify` | `integration/src/modules/task-database/modules/verify-task-database/verify-task-database.command.ts:39` |
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
