Commands that run in CI:
`publishable-packages-gate` (runs the publishable-packages check only when an
ic-suite package is affected), `bound-base-to-push` (a push's Nx base), the Nx
cache steps `import-pr-task-cache`, `merge-task-cache`, `verify-task-database`,
`adopt-task-database`, and `keep-task-database`, and the
release steps `version-packages`, `tag-codebase`, `tag-packages`,
`publish-packages`, and `link-packages`. See
[AGENTS.md](AGENTS.md).

## Start

```bash
nx run publication:start
```

## Test

```bash
nx run publication:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `publication`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 177 |
| Files | 84 |
| Calls traced | 246 |
| Call stacks | 12 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 13 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `ImportPrTaskCacheCommand.run`** — depth 6 · decorated-method

```text
🚀 ImportPrTaskCacheCommand.run(): Promise<void> [publication/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:43]
   ↳ Imports the cache and prints what happened.
  └─> ImportPrTaskCacheService.import(): TaskDatabaseReport [publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:177]
     ↳ Imports the pull request's cache when this run is a merge group's.
    └─> ImportPrTaskCacheService.locate(): ImportStop | LocatedArtifact [publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:132]
       ↳ Finds the artifact to import, or says why there is none.
      └─> ImportPrTaskCacheService.findPullRequest(): ImportStop | TrustedPullRequest [publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:105]
         ↳ Finds the pull request a merge group tests, when it comes from this repository, or says why there is nothing to import.
        └─> ImportPrTaskCacheService.require(name: "GITHUB_REPOSITORY" | "NX_CACHE_SCOPE"): string [publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:161]
           ↳ Reads one variable the import cannot do without, or fails the import.
          └─> ImportPrTaskCacheService.read(…): string [publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:154]
             ↳ Reads one variable, an absent one as empty.
```

**2. `LinkPackagesCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 LinkPackagesCommand.run(): Promise<void> [publication/src/modules/link-packages/link-packages.command.ts:46]
   ↳ Links the release group, and exits with the outcome.
  └─> LinkPackagesService.run(): Promise<number> [publication/src/modules/link-packages/link-packages.service.ts:252]
     ↳ Records every published release-group version that has no record yet, and lists the ones this run published in a…
    └─> LinkPackagesService.runInParallel(…)(root: string): Promise<ParallelOutcome> [publication/src/modules/link-packages/link-packages.service.ts:284]
      └─> LinkPackagesService.linkPackage(root: string, context: LinkContext): Promise<ParallelOutcome> [publication/src/modules/link-packages/link-packages.service.ts:144]
         ↳ Links the package in the given directory: a version this run published is added to the attestation subjects, a version…
        └─> ReleaseGroupService.specifier(root: string): string [publication/src/modules/release-group/release-group.service.ts:267]
           ↳ Names the package in the given directory as `<name>@<version>`.
          └─> ReleaseGroupService.readManifest(root: string): PackageManifest [publication/src/modules/release-group/release-group.service.ts:196]
             ↳ Reads the name and version of the package in the given directory.
```

**3. `PublishPackagesCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 PublishPackagesCommand.run(): Promise<void> [publication/src/modules/publish-packages/publish-packages.command.ts:47]
   ↳ Publishes and mirrors the release group, and exits with the outcome.
  └─> PublishPackagesService.run(): Promise<number> [publication/src/modules/publish-packages/publish-packages.service.ts:318]
     ↳ Publishes the release group to npm, then mirrors it to GitHub Packages.
    └─> PublishPackagesService.runInParallel(…)(root: string): Promise<ParallelOutcome> [publication/src/modules/publish-packages/publish-packages.service.ts:334]
      └─> PublishPackagesService.mirrorPackage(root: string, context: MirrorContext): Promise<ParallelOutcome> [publication/src/modules/publish-packages/publish-packages.service.ts:62]
         ↳ Mirrors the package in the given directory to GitHub Packages, unless that version is there already.
        └─> PublishPackagesService.packRenamed(root: string, mirror: string, context: MirrorContext): Promise<CapturedProcess> [publication/src/modules/publish-packages/publish-packages.service.ts:116]
           ↳ Packs a package exactly as npm got it, unpacks it, and renames it into the mirror's scope, dropping its…
          └─> ProcessRunnerService.captureAsync(executable: string, args: readonly string[]): Promise<CapturedProcess> [publication/src/modules/process-runner/process-runner.service.ts:65]
             ↳ Runs a command without blocking, so several can run at once, and returns what it printed once it ends.
```

<details>
<summary>9 more call stacks</summary>

**4. `VersionPackagesCommand.run`** — depth 6 · decorated-method

```text
🚀 VersionPackagesCommand.run(): Promise<void> [publication/src/modules/version-packages/version-packages.command.ts:45]
   ↳ Versions the release group, and exits with the outcome.
  └─> VersionPackagesService.run(): Promise<number> [publication/src/modules/version-packages/version-packages.service.ts:117]
     ↳ Points the remote at the release token, pushes any tags an earlier run left missing, and versions the release group.
    └─> TagPackagesService.run(): Promise<number> [publication/src/modules/tag-packages/tag-packages.service.ts:285]
       ↳ Commits any leftover versions, then tags and pushes every newly versioned package.
      └─> TagPackagesService.commitLeftoverVersions(): LeftoverOutcome [publication/src/modules/tag-packages/tag-packages.service.ts:68]
         ↳ Commits and pushes any versions semantic-release left uncommitted.
        └─> TagPackagesService.mustStream(executable: string, args: readonly string[]): void [publication/src/modules/tag-packages/tag-packages.service.ts:127]
           ↳ Streams a command, failing the step when it fails.
          └─> ProcessRunnerService.stream(executable: string, args: readonly string[], input?: string): number [publication/src/modules/process-runner/process-runner.service.ts:141]
             ↳ Runs a command with this process's own output streams, so its output appears as it would from the shell step that used…
```

**5. `AdoptTaskDatabaseCommand.run`** — depth 5 · decorated-method

```text
🚀 AdoptTaskDatabaseCommand.run(): Promise<void> [publication/src/modules/adopt-task-database/adopt-task-database.command.ts:42]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.adopt(): TaskDatabaseReport [publication/src/modules/task-database/task-database.service.ts:359]
     ↳ Renames the newest restored database to this machine's id, and discards the rest.
    └─> TaskDatabaseService.planAdoption(databases: readonly string[]): AdoptionPlan [publication/src/modules/task-database/task-database.service.ts:253]
       ↳ Decides what adopting would do, or why it should do nothing.
      └─> TaskDatabaseService.readMachineId(): string [publication/src/modules/task-database/task-database.service.ts:318]
         ↳ This machine's id, from the first readable, non-empty id file.
        └─> TaskDatabaseService.filter(…)(file: string): boolean [publication/src/modules/task-database/task-database.service.ts:322]
```

**6. `MergeTaskCacheCommand.run`** — depth 5 · decorated-method

```text
🚀 MergeTaskCacheCommand.run(parameters: string[]): Promise<void> [publication/src/modules/merge-task-cache/merge-task-cache.command.ts:45]
   ↳ Merges the cache the first parameter names, and prints what happened.
  └─> TaskDatabaseService.merge(source: string): TaskDatabaseReport [publication/src/modules/task-database/task-database.service.ts:419]
     ↳ Merges another run's Nx cache into this one, so the tasks that run already finished are hits here too.
    └─> TaskDatabaseService.checkSource(source: string): MergeSource [publication/src/modules/task-database/task-database.service.ts:87]
       ↳ Finds the database a source would be merged from, or why it cannot be.
      └─> TaskDatabaseService.list(directory?: string): string[] [publication/src/modules/task-database/task-database.service.ts:209]
         ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
        └─> TaskDatabaseService.map(…)(name: string): string [publication/src/modules/task-database/task-database.service.ts:218]
```

**7. `TagPackagesCommand.run`** — depth 5 · decorated-method

```text
🚀 TagPackagesCommand.run(): Promise<void> [publication/src/modules/tag-packages/tag-packages.command.ts:46]
   ↳ Commits leftover versions, tags, and pushes, and exits with the outcome.
  └─> TagPackagesService.run(): Promise<number> [publication/src/modules/tag-packages/tag-packages.service.ts:285]
     ↳ Commits any leftover versions, then tags and pushes every newly versioned package.
    └─> TagPackagesService.commitLeftoverVersions(): LeftoverOutcome [publication/src/modules/tag-packages/tag-packages.service.ts:68]
       ↳ Commits and pushes any versions semantic-release left uncommitted.
      └─> TagPackagesService.mustStream(executable: string, args: readonly string[]): void [publication/src/modules/tag-packages/tag-packages.service.ts:127]
         ↳ Streams a command, failing the step when it fails.
        └─> ProcessRunnerService.stream(executable: string, args: readonly string[], input?: string): number [publication/src/modules/process-runner/process-runner.service.ts:141]
           ↳ Runs a command with this process's own output streams, so its output appears as it would from the shell step that used…
```

**8. `KeepTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 KeepTaskDatabaseCommand.run(): Promise<void> [publication/src/modules/keep-task-database/keep-task-database.command.ts:41]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.keep(): TaskDatabaseReport [publication/src/modules/task-database/task-database.service.ts:391]
     ↳ Keeps only the newest database, warning when there was more than one. `adopt` renames the restored database to this…
    └─> TaskDatabaseService.list(directory?: string): string[] [publication/src/modules/task-database/task-database.service.ts:209]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [publication/src/modules/task-database/task-database.service.ts:218]
```

**9. `TagCodebaseCommand.run`** — depth 4 · decorated-method

```text
🚀 TagCodebaseCommand.run(): Promise<void> [publication/src/modules/tag-codebase/tag-codebase.command.ts:44]
   ↳ Releases the codebase, and exits with the outcome.
  └─> TagCodebaseService.run(): number [publication/src/modules/tag-codebase/tag-codebase.service.ts:49]
     ↳ Runs semantic-release, or steps aside when `main` has moved.
    └─> MainTipService.head(): string [publication/src/modules/main-tip/main-tip.service.ts:73]
       ↳ Prints the commit checked out.
      └─> requireSuccess(result: CapturedProcess, commandLine: string): string [publication/src/modules/process-runner/process-runner.utilities.ts:21]
         ↳ Returns what a finished process printed, or fails the way `set -e` failed the shell scripts these commands replace: at…
```

**10. `VerifyTaskDatabaseCommand.run`** — depth 4 · decorated-method

```text
🚀 VerifyTaskDatabaseCommand.run(): Promise<void> [publication/src/modules/verify-task-database/verify-task-database.command.ts:39]
   ↳ Runs the step and prints what it reports.
  └─> TaskDatabaseService.verify(): TaskDatabaseReport [publication/src/modules/task-database/task-database.service.ts:454]
     ↳ Discards every database that fails `PRAGMA integrity_check`.
    └─> TaskDatabaseService.list(directory?: string): string[] [publication/src/modules/task-database/task-database.service.ts:209]
       ↳ Lists every task database in a directory, this cache's by default, in name order, and nothing when there is none.
      └─> TaskDatabaseService.map(…)(name: string): string [publication/src/modules/task-database/task-database.service.ts:218]
```

**11. `BoundBaseToPushCommand.run`** — depth 3 · decorated-method

```text
🚀 BoundBaseToPushCommand.run(): Promise<void> [publication/src/modules/bound-base-to-push/bound-base-to-push.command.ts:41]
   ↳ Bounds the base, prints what it decided, and sets the exit code.
  └─> BoundBaseToPushService.bound(): BoundBaseReport [publication/src/modules/bound-base-to-push/bound-base-to-push.service.ts:59]
     ↳ Decides the push's base, and writes a moved one to `GITHUB_ENV` for the later steps of the job.
    └─> BoundBaseToPushService.read(name: "BEFORE" | "GITHUB_ENV" | "NX_BASE" | "NX_HEAD"): string [publication/src/modules/bound-base-to-push/bound-base-to-push.service.ts:49]
       ↳ Reads one variable, an absent one as empty.
```

**12. `PublishablePackagesGateCommand.run`** — depth 3 · decorated-method

```text
🚀 PublishablePackagesGateCommand.run(): Promise<void> [publication/src/modules/publishable-packages-gate/publishable-packages-gate.command.ts:49]
   ↳ Decides whether the check is affected, then runs it whole or skips it.
  └─> PublishablePackagesGateService.decide(): PublishablePackagesGateOutcome [publication/src/modules/publishable-packages-gate/publishable-packages-gate.service.ts:47]
     ↳ Asks Nx which gated projects the change between `NX_BASE` and `NX_HEAD` affects.
    └─> ProcessRunnerService.capture(executable: string, args: readonly string[]): CapturedProcess [publication/src/modules/process-runner/process-runner.service.ts:42]
       ↳ Runs a command to completion and returns what it printed.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `LinkPackagesService.linkPackage` | 8 | `ReleaseGroupService.specifier`, `LinkPackagesService.tarballDigest`, `ReleaseGroupService.isOnNpm`, `rehearsalMessage`, `LinkPackagesService.hasStorageRecord`, `alreadyLinkedMessage`, `LinkPackagesService.createStorageRecord`, `linkingMessage` | `publication/src/modules/link-packages/link-packages.service.ts:144` |
| `LinkPackagesService.run` | 8 | `LinkPackagesService.readInputs`, `LinkPackagesService.map(…)`, `ReleaseGroupService.readGroup`, `LinkPackagesService.filter(…)`, `ReleaseGroupService.npmRegistry`, `ReleaseGroupService.isRehearsal`, `LinkPackagesService.runInParallel(…)`, `ReleaseGroupService.runInParallel` | `publication/src/modules/link-packages/link-packages.service.ts:252` |
| `PublishPackagesService.run` | 8 | `PublishPackagesService.readInputs`, `PublishPackagesService.map(…)`, `ReleaseGroupService.readGroup`, `PublishPackagesService.refuseUnsealedRehearsal`, `PublishPackagesService.publishToNpm`, `PublishPackagesService.prepareMirrors`, `PublishPackagesService.runInParallel(…)`, `ReleaseGroupService.runInParallel` | `publication/src/modules/publish-packages/publish-packages.service.ts:318` |

<details>
<summary>74 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TagPackagesService.commitLeftoverVersions` | 7 | `TagPackagesService.mustStream`, `TagPackagesService.versionedFiles`, `ProcessRunnerService.capture`, `MainTipService.head`, `ProcessRunnerService.stream`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom` | `publication/src/modules/tag-packages/tag-packages.service.ts:68` |
| `TagPackagesService.run` | 7 | `TagPackagesService.commitLeftoverVersions`, `ReleaseGroupService.readGroup`, `TagPackagesService.tagBaselines`, `TagPackagesService.tagNewVersions`, `pushingMessage`, `TagPackagesService.map(…)`, `TagPackagesService.pushWithRetries` | `publication/src/modules/tag-packages/tag-packages.service.ts:285` |
| `TaskDatabaseService.planMerge` | 6 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `schemaOf`, `schemaMismatchReason` | `publication/src/modules/task-database/task-database.service.ts:280` |
| `TaskDatabaseService.adopt` | 6 | `TaskDatabaseService.list`, `TaskDatabaseService.planAdoption`, `TaskDatabaseService.discardOthers`, `TaskDatabaseService.rename`, `adoptedMessage`, `TaskDatabaseService.countCachedResults` | `publication/src/modules/task-database/task-database.service.ts:359` |
| `ImportPrTaskCacheService.import` | 6 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.locate`, `ImportPrTaskCacheService.download`, `importingMessage`, `TaskDatabaseService.merge`, `couldNotImportMessage` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:177` |
| `PublishPackagesService.publishToNpm` | 6 | `ReleaseGroupService.npmRegistry`, `authenticationLine`, `ProcessRunnerService.stream`, `PublishPackagesService.flatMap(…)`, `ReleaseGroupService.isRehearsal`, `PublishPackagesService.map(…)` | `publication/src/modules/publish-packages/publish-packages.service.ts:201` |
| `VersionPackagesService.run` | 6 | `VersionPackagesService.pointRemoteAtToken`, `MainTipService.head`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom`, `TagPackagesService.run`, `VersionPackagesService.releaseWithoutConfiguration` | `publication/src/modules/version-packages/version-packages.service.ts:117` |
| `TaskDatabaseService.checkSource` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.integrityOf`, `TaskDatabaseService.query`, `TaskDatabaseService.every(…)` | `publication/src/modules/task-database/task-database.service.ts:87` |
| `TaskDatabaseService.mergeRows` | 5 | `TaskDatabaseService.query`, `TaskDatabaseService.copyMissingOutputs`, `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.insertRows`, `mergedMessage` | `publication/src/modules/task-database/task-database.service.ts:227` |
| `TaskDatabaseService.keep` | 5 | `TaskDatabaseService.list`, `TaskDatabaseService.newest`, `TaskDatabaseService.discardOthers`, `duplicateMessage`, `TaskDatabaseService.map(…)` | `publication/src/modules/task-database/task-database.service.ts:391` |
| `TaskDatabaseService.merge` | 5 | `TaskDatabaseService.checkSource`, `notMergingMessage`, `TaskDatabaseService.planMerge`, `TaskDatabaseService.adoptSource`, `TaskDatabaseService.mergeRows` | `publication/src/modules/task-database/task-database.service.ts:419` |
| `BoundBaseToPushService.bound` | 5 | `BoundBaseToPushService.read`, `noPreviousTipMessage`, `ProcessRunnerService.capture`, `notAncestorMessage`, `boundingMessage` | `publication/src/modules/bound-base-to-push/bound-base-to-push.service.ts:59` |
| `ImportPrTaskCacheService.locate` | 5 | `ImportPrTaskCacheService.findPullRequest`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `artifactQuery`, `noArtifactMessage` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:132` |
| `PublishPackagesService.mirrorPackage` | 5 | `ReleaseGroupService.readManifest`, `ProcessRunnerService.captureAsync`, `alreadyMirroredMessage`, `PublishPackagesService.packRenamed`, `mirroringMessage` | `publication/src/modules/publish-packages/publish-packages.service.ts:62` |
| `TagPackagesService.tagBaselines` | 5 | `ReleaseGroupService.readManifest`, `requireSuccess`, `ProcessRunnerService.capture`, `TagPackagesService.createTag`, `TagPackagesService.parentOfAddition` | `publication/src/modules/tag-packages/tag-packages.service.ts:213` |
| `TaskDatabaseService.planAdoption` | 4 | `TaskDatabaseService.readMachineId`, `TaskDatabaseService.newest`, `noSchemaMessage`, `TaskDatabaseService.directory` | `publication/src/modules/task-database/task-database.service.ts:253` |
| `TaskDatabaseService.verify` | 4 | `TaskDatabaseService.list`, `TaskDatabaseService.integrityOf`, `corruptMessage`, `TaskDatabaseService.discard` | `publication/src/modules/task-database/task-database.service.ts:454` |
| `ImportPrTaskCacheService.findPullRequest` | 4 | `ImportPrTaskCacheService.read`, `ImportPrTaskCacheService.require`, `ImportPrTaskCacheService.api`, `untrustedMessage` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:105` |
| `PublishPackagesService.refuseUnsealedRehearsal` | 4 | `ReleaseGroupService.isRehearsal`, `ReleaseGroupService.readManifest`, `ReleaseGroupService.npmRegistry`, `unsealedMessage` | `publication/src/modules/publish-packages/publish-packages.service.ts:282` |
| `TagCodebaseService.run` | 4 | `MainTipService.head`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom`, `ProcessRunnerService.stream` | `publication/src/modules/tag-codebase/tag-codebase.service.ts:49` |
| `TagPackagesService.parentOfAddition` | 4 | `TagPackagesService.findLast(…)`, `requireSuccess`, `ProcessRunnerService.capture`, `noBaselineMessage` | `publication/src/modules/tag-packages/tag-packages.service.ts:138` |
| `TagPackagesService.pushWithRetries` | 4 | `TagPackagesService.retryDelay`, `ProcessRunnerService.stream`, `retryingMessage`, `TagPackagesService.anonymous` | `publication/src/modules/tag-packages/tag-packages.service.ts:169` |
| `VersionPackagesService.pointRemoteAtToken` | 4 | `requireVariable`, `requireSuccess`, `ProcessRunnerService.capture`, `authenticatedRemote` | `publication/src/modules/version-packages/version-packages.service.ts:65` |
| `TaskDatabaseService.adoptSource` | 3 | `TaskDatabaseService.cacheDirectory`, `TaskDatabaseService.directory`, `nothingToMergeIntoMessage` | `publication/src/modules/task-database/task-database.service.ts:67` |
| `ReleaseGroupService.membersFrom` | 3 | `requireSuccess`, `ProcessRunnerService.capture`, `ReleaseGroupService.map(…)` | `publication/src/modules/release-group/release-group.service.ts:68` |
| `ReleaseGroupService.map(…)` | 3 | `ReleaseGroupService.acquire`, `ReleaseGroupService.settle`, `ReleaseGroupService.release` | `publication/src/modules/release-group/release-group.service.ts:237` |
| `PublishablePackagesGateCommand.run` | 3 | `PublishablePackagesGateService.decide`, `affectedMessage`, `PublishablePackagesGateService.execute` | `publication/src/modules/publishable-packages-gate/publishable-packages-gate.command.ts:49` |
| `MainTipService.stepAsideFrom` | 3 | `requireVariable`, `ProcessRunnerService.capture`, `superseded` | `publication/src/modules/main-tip/main-tip.service.ts:86` |
| `TagPackagesService.tagNewVersions` | 3 | `ReleaseGroupService.readManifest`, `ProcessRunnerService.capture`, `TagPackagesService.createTag` | `publication/src/modules/tag-packages/tag-packages.service.ts:243` |
| `TaskDatabaseService.list` | 2 | `TaskDatabaseService.map(…)`, `TaskDatabaseService.filter(…)` | `publication/src/modules/task-database/task-database.service.ts:209` |
| `ImportPrTaskCacheService.download` | 2 | `ProcessRunnerService.captureToFile`, `ProcessRunnerService.capture` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:73` |
| `ReleaseGroupService.isOnNpm` | 2 | `ProcessRunnerService.captureAsync`, `ReleaseGroupService.npmRegistry` | `publication/src/modules/release-group/release-group.service.ts:120` |
| `ReleaseGroupService.readGroup` | 2 | `ReleaseGroupService.membersFrom`, `describeError` | `publication/src/modules/release-group/release-group.service.ts:169` |
| `LinkPackagesService.createStorageRecord` | 2 | `LinkPackagesService.parse`, `ProcessRunnerService.captureAsync` | `publication/src/modules/link-packages/link-packages.service.ts:69` |
| `LinkPackagesService.hasStorageRecord` | 2 | `ProcessRunnerService.captureAsync`, `LinkPackagesService.some(…)` | `publication/src/modules/link-packages/link-packages.service.ts:119` |
| `LinkPackagesService.tarballDigest` | 2 | `LinkPackagesService.parse`, `ProcessRunnerService.captureAsync` | `publication/src/modules/link-packages/link-packages.service.ts:205` |
| `LinkPackagesCommand.run` | 2 | `LinkPackagesService.run`, `describeError` | `publication/src/modules/link-packages/link-packages.command.ts:46` |
| `PublishPackagesCommand.run` | 2 | `PublishPackagesService.run`, `describeError` | `publication/src/modules/publish-packages/publish-packages.command.ts:47` |
| `MainTipService.head` | 2 | `requireSuccess`, `ProcessRunnerService.capture` | `publication/src/modules/main-tip/main-tip.service.ts:73` |
| `TagCodebaseCommand.run` | 2 | `TagCodebaseService.run`, `describeError` | `publication/src/modules/tag-codebase/tag-codebase.command.ts:44` |
| `TagPackagesCommand.run` | 2 | `TagPackagesService.run`, `describeError` | `publication/src/modules/tag-packages/tag-packages.command.ts:46` |
| `VersionPackagesCommand.run` | 2 | `VersionPackagesService.run`, `describeError` | `publication/src/modules/version-packages/version-packages.command.ts:45` |
| `TaskDatabaseService.countCachedResults` | 1 | `TaskDatabaseService.query` | `publication/src/modules/task-database/task-database.service.ts:141` |
| `TaskDatabaseService.discardOthers` | 1 | `TaskDatabaseService.discard` | `publication/src/modules/task-database/task-database.service.ts:164` |
| `TaskDatabaseService.integrityOf` | 1 | `TaskDatabaseService.query` | `publication/src/modules/task-database/task-database.service.ts:197` |
| `TaskDatabaseService.newest` | 1 | `TaskDatabaseService.reduce(…)` | `publication/src/modules/task-database/task-database.service.ts:244` |
| `TaskDatabaseService.readMachineId` | 1 | `TaskDatabaseService.filter(…)` | `publication/src/modules/task-database/task-database.service.ts:318` |
| `AdoptTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.adopt` | `publication/src/modules/adopt-task-database/adopt-task-database.command.ts:42` |
| `BoundBaseToPushCommand.run` | 1 | `BoundBaseToPushService.bound` | `publication/src/modules/bound-base-to-push/bound-base-to-push.command.ts:41` |
| `ImportPrTaskCacheService.api` | 1 | `ProcessRunnerService.capture` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:62` |
| `ImportPrTaskCacheService.require` | 1 | `ImportPrTaskCacheService.read` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.service.ts:161` |
| `ImportPrTaskCacheCommand.run` | 1 | `ImportPrTaskCacheService.import` | `publication/src/modules/import-pr-task-cache/import-pr-task-cache.command.ts:43` |
| `KeepTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.keep` | `publication/src/modules/keep-task-database/keep-task-database.command.ts:41` |
| `ReleaseGroupService.settle` | 1 | `describeError` | `publication/src/modules/release-group/release-group.service.ts:49` |
| `ReleaseGroupService.isRehearsal` | 1 | `ReleaseGroupService.npmRegistry` | `publication/src/modules/release-group/release-group.service.ts:138` |
| `ReleaseGroupService.runInParallel` | 1 | `ReleaseGroupService.map(…)` | `publication/src/modules/release-group/release-group.service.ts:211` |
| `ReleaseGroupService.acquire` | 1 | `ReleaseGroupService.anonymous` | `publication/src/modules/release-group/release-group.service.ts:217` |
| `ReleaseGroupService.specifier` | 1 | `ReleaseGroupService.readManifest` | `publication/src/modules/release-group/release-group.service.ts:267` |
| `LinkPackagesService.readInputs` | 1 | `LinkPackagesService.read` | `publication/src/modules/link-packages/link-packages.service.ts:185` |
| `LinkPackagesService.read` | 1 | `requireVariable` | `publication/src/modules/link-packages/link-packages.service.ts:186` |
| `LinkPackagesService.runInParallel(…)` | 1 | `LinkPackagesService.linkPackage` | `publication/src/modules/link-packages/link-packages.service.ts:284` |
| `MergeTaskCacheCommand.run` | 1 | `TaskDatabaseService.merge` | `publication/src/modules/merge-task-cache/merge-task-cache.command.ts:45` |
| `PublishPackagesService.packRenamed` | 1 | `ProcessRunnerService.captureAsync` | `publication/src/modules/publish-packages/publish-packages.service.ts:116` |
| `PublishPackagesService.prepareMirrors` | 1 | `authenticationLine` | `publication/src/modules/publish-packages/publish-packages.service.ts:172` |
| `PublishPackagesService.readInputs` | 1 | `requireVariable` | `publication/src/modules/publish-packages/publish-packages.service.ts:247` |
| `PublishPackagesService.runInParallel(…)` | 1 | `PublishPackagesService.mirrorPackage` | `publication/src/modules/publish-packages/publish-packages.service.ts:334` |
| `PublishablePackagesGateService.decide` | 1 | `ProcessRunnerService.capture` | `publication/src/modules/publishable-packages-gate/publishable-packages-gate.service.ts:47` |
| `PublishablePackagesGateService.execute` | 1 | `ProcessRunnerService.stream` | `publication/src/modules/publishable-packages-gate/publishable-packages-gate.service.ts:92` |
| `MainTipService.hasMovedFrom` | 1 | `ProcessRunnerService.capture` | `publication/src/modules/main-tip/main-tip.service.ts:51` |
| `TagPackagesService.createTag` | 1 | `ProcessRunnerService.stream` | `publication/src/modules/tag-packages/tag-packages.service.ts:110` |
| `TagPackagesService.mustStream` | 1 | `ProcessRunnerService.stream` | `publication/src/modules/tag-packages/tag-packages.service.ts:127` |
| `TagPackagesService.versionedFiles` | 1 | `TagPackagesService.flatMap(…)` | `publication/src/modules/tag-packages/tag-packages.service.ts:270` |
| `VerifyTaskDatabaseCommand.run` | 1 | `TaskDatabaseService.verify` | `publication/src/modules/verify-task-database/verify-task-database.command.ts:39` |
| `VersionPackagesService.releaseWithoutConfiguration` | 1 | `ProcessRunnerService.stream` | `publication/src/modules/version-packages/version-packages.service.ts:90` |

</details>
<!-- callidescope:end -->

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  configuration["configuration"]
  observability["observability"]
  publication["publication"]
  publication --> configuration
  publication --> observability
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class publication subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  AdoptTaskDatabaseModule
  BoundBaseToPushModule
  DiscoveryModule
  ImportPrTaskCacheModule
  KeepTaskDatabaseModule
  LinkPackagesModule
  LoggerModule([LoggerModule])
  MainModule
  MainTipModule
  MergeTaskCacheModule
  ProcessRunnerModule
  PublishablePackagesGateModule
  PublishPackagesModule
  ReleaseGroupModule
  TagCodebaseModule
  TagPackagesModule
  TaskDatabaseModule
  VerifyTaskDatabaseModule
  VersionPackagesModule
  AdoptTaskDatabaseModule --> TaskDatabaseModule
  BoundBaseToPushModule --> ProcessRunnerModule
  ImportPrTaskCacheModule --> ProcessRunnerModule
  ImportPrTaskCacheModule --> TaskDatabaseModule
  KeepTaskDatabaseModule --> TaskDatabaseModule
  LinkPackagesModule --> ProcessRunnerModule
  LinkPackagesModule --> ReleaseGroupModule
  MainModule --> AdoptTaskDatabaseModule
  MainModule --> BoundBaseToPushModule
  MainModule --> DiscoveryModule
  MainModule --> ImportPrTaskCacheModule
  MainModule --> KeepTaskDatabaseModule
  MainModule --> LinkPackagesModule
  MainModule --> MergeTaskCacheModule
  MainModule --> PublishablePackagesGateModule
  MainModule --> PublishPackagesModule
  MainModule --> TagCodebaseModule
  MainModule --> TagPackagesModule
  MainModule --> VerifyTaskDatabaseModule
  MainModule --> VersionPackagesModule
  MainTipModule --> ProcessRunnerModule
  MergeTaskCacheModule --> TaskDatabaseModule
  PublishablePackagesGateModule --> ProcessRunnerModule
  PublishPackagesModule --> ProcessRunnerModule
  PublishPackagesModule --> ReleaseGroupModule
  ReleaseGroupModule --> ProcessRunnerModule
  TagCodebaseModule --> MainTipModule
  TagCodebaseModule --> ProcessRunnerModule
  TagPackagesModule --> MainTipModule
  TagPackagesModule --> ProcessRunnerModule
  TagPackagesModule --> ReleaseGroupModule
  VerifyTaskDatabaseModule --> TaskDatabaseModule
  VersionPackagesModule --> MainTipModule
  VersionPackagesModule --> ProcessRunnerModule
  VersionPackagesModule --> TagPackagesModule
```

_Rounded modules are global: every module can inject them, so their edges are left out._
<!-- codependix:end name="codependix-nestjs-modules" -->

### File Imports

<!-- codependix:start name="codependix-file-imports" -->
```mermaid
graph LR
  file_callidescope_config_ts["callidescope.config.ts"]
  file_codependix_config_ts["codependix.config.ts"]
  file_codometer_config_ts["codometer.config.ts"]
  file_eslint_config_ts["eslint.config.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_command_ts["src/modules/adopt-task-database/adopt-task-database.command.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_command_unit_test_ts["src/modules/adopt-task-database/adopt-task-database.command.unit.test.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_constants_ts["src/modules/adopt-task-database/adopt-task-database.constants.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_module_ts["src/modules/adopt-task-database/adopt-task-database.module.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_module_unit_test_ts["src/modules/adopt-task-database/adopt-task-database.module.unit.test.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_types_ts["src/modules/adopt-task-database/adopt-task-database.types.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_command_ts["src/modules/bound-base-to-push/bound-base-to-push.command.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_command_unit_test_ts["src/modules/bound-base-to-push/bound-base-to-push.command.unit.test.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_constants_ts["src/modules/bound-base-to-push/bound-base-to-push.constants.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_module_ts["src/modules/bound-base-to-push/bound-base-to-push.module.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_module_unit_test_ts["src/modules/bound-base-to-push/bound-base-to-push.module.unit.test.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_service_ts["src/modules/bound-base-to-push/bound-base-to-push.service.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_service_unit_test_ts["src/modules/bound-base-to-push/bound-base-to-push.service.unit.test.ts"]
  file_src_modules_bound_base_to_push_bound_base_to_push_types_ts["src/modules/bound-base-to-push/bound-base-to-push.types.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_ts["src/modules/import-pr-task-cache/import-pr-task-cache.command.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts["src/modules/import-pr-task-cache/import-pr-task-cache.command.unit.test.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_constants_ts["src/modules/import-pr-task-cache/import-pr-task-cache.constants.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts["src/modules/import-pr-task-cache/import-pr-task-cache.module.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_unit_test_ts["src/modules/import-pr-task-cache/import-pr-task-cache.module.unit.test.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts["src/modules/import-pr-task-cache/import-pr-task-cache.service.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_unit_test_ts["src/modules/import-pr-task-cache/import-pr-task-cache.service.unit.test.ts"]
  file_src_modules_import_pr_task_cache_import_pr_task_cache_types_ts["src/modules/import-pr-task-cache/import-pr-task-cache.types.ts"]
  file_src_modules_keep_task_database_keep_task_database_command_ts["src/modules/keep-task-database/keep-task-database.command.ts"]
  file_src_modules_keep_task_database_keep_task_database_command_unit_test_ts["src/modules/keep-task-database/keep-task-database.command.unit.test.ts"]
  file_src_modules_keep_task_database_keep_task_database_constants_ts["src/modules/keep-task-database/keep-task-database.constants.ts"]
  file_src_modules_keep_task_database_keep_task_database_module_ts["src/modules/keep-task-database/keep-task-database.module.ts"]
  file_src_modules_keep_task_database_keep_task_database_module_unit_test_ts["src/modules/keep-task-database/keep-task-database.module.unit.test.ts"]
  file_src_modules_keep_task_database_keep_task_database_types_ts["src/modules/keep-task-database/keep-task-database.types.ts"]
  file_src_modules_link_packages_link_packages_command_ts["src/modules/link-packages/link-packages.command.ts"]
  file_src_modules_link_packages_link_packages_command_unit_test_ts["src/modules/link-packages/link-packages.command.unit.test.ts"]
  file_src_modules_link_packages_link_packages_constants_ts["src/modules/link-packages/link-packages.constants.ts"]
  file_src_modules_link_packages_link_packages_module_ts["src/modules/link-packages/link-packages.module.ts"]
  file_src_modules_link_packages_link_packages_module_unit_test_ts["src/modules/link-packages/link-packages.module.unit.test.ts"]
  file_src_modules_link_packages_link_packages_service_ts["src/modules/link-packages/link-packages.service.ts"]
  file_src_modules_link_packages_link_packages_service_unit_test_ts["src/modules/link-packages/link-packages.service.unit.test.ts"]
  file_src_modules_link_packages_link_packages_types_ts["src/modules/link-packages/link-packages.types.ts"]
  file_src_modules_main_tip_main_tip_constants_ts["src/modules/main-tip/main-tip.constants.ts"]
  file_src_modules_main_tip_main_tip_module_ts["src/modules/main-tip/main-tip.module.ts"]
  file_src_modules_main_tip_main_tip_module_unit_test_ts["src/modules/main-tip/main-tip.module.unit.test.ts"]
  file_src_modules_main_tip_main_tip_service_ts["src/modules/main-tip/main-tip.service.ts"]
  file_src_modules_main_tip_main_tip_service_unit_test_ts["src/modules/main-tip/main-tip.service.unit.test.ts"]
  file_src_modules_main_tip_main_tip_types_ts["src/modules/main-tip/main-tip.types.ts"]
  file_src_modules_merge_task_cache_merge_task_cache_command_ts["src/modules/merge-task-cache/merge-task-cache.command.ts"]
  file_src_modules_merge_task_cache_merge_task_cache_command_unit_test_ts["src/modules/merge-task-cache/merge-task-cache.command.unit.test.ts"]
  file_src_modules_merge_task_cache_merge_task_cache_constants_ts["src/modules/merge-task-cache/merge-task-cache.constants.ts"]
  file_src_modules_merge_task_cache_merge_task_cache_module_ts["src/modules/merge-task-cache/merge-task-cache.module.ts"]
  file_src_modules_merge_task_cache_merge_task_cache_module_unit_test_ts["src/modules/merge-task-cache/merge-task-cache.module.unit.test.ts"]
  file_src_modules_merge_task_cache_merge_task_cache_types_ts["src/modules/merge-task-cache/merge-task-cache.types.ts"]
  file_src_modules_process_runner_process_runner_constants_ts["src/modules/process-runner/process-runner.constants.ts"]
  file_src_modules_process_runner_process_runner_module_ts["src/modules/process-runner/process-runner.module.ts"]
  file_src_modules_process_runner_process_runner_module_unit_test_ts["src/modules/process-runner/process-runner.module.unit.test.ts"]
  file_src_modules_process_runner_process_runner_service_integration_test_ts["src/modules/process-runner/process-runner.service.integration.test.ts"]
  file_src_modules_process_runner_process_runner_service_ts["src/modules/process-runner/process-runner.service.ts"]
  file_src_modules_process_runner_process_runner_service_unit_test_ts["src/modules/process-runner/process-runner.service.unit.test.ts"]
  file_src_modules_process_runner_process_runner_types_ts["src/modules/process-runner/process-runner.types.ts"]
  file_src_modules_process_runner_process_runner_utilities_ts["src/modules/process-runner/process-runner.utilities.ts"]
  file_src_modules_process_runner_process_runner_utilities_unit_test_ts["src/modules/process-runner/process-runner.utilities.unit.test.ts"]
  file_src_modules_publish_packages_publish_packages_command_ts["src/modules/publish-packages/publish-packages.command.ts"]
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts["src/modules/publish-packages/publish-packages.command.unit.test.ts"]
  file_src_modules_publish_packages_publish_packages_constants_ts["src/modules/publish-packages/publish-packages.constants.ts"]
  file_src_modules_publish_packages_publish_packages_module_ts["src/modules/publish-packages/publish-packages.module.ts"]
  file_src_modules_publish_packages_publish_packages_module_unit_test_ts["src/modules/publish-packages/publish-packages.module.unit.test.ts"]
  file_src_modules_publish_packages_publish_packages_service_ts["src/modules/publish-packages/publish-packages.service.ts"]
  file_src_modules_publish_packages_publish_packages_service_unit_test_ts["src/modules/publish-packages/publish-packages.service.unit.test.ts"]
  file_src_modules_publish_packages_publish_packages_types_ts["src/modules/publish-packages/publish-packages.types.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_ts["src/modules/publishable-packages-gate/publishable-packages-gate.command.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_unit_test_ts["src/modules/publishable-packages-gate/publishable-packages-gate.command.unit.test.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_constants_ts["src/modules/publishable-packages-gate/publishable-packages-gate.constants.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts["src/modules/publishable-packages-gate/publishable-packages-gate.module.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_unit_test_ts["src/modules/publishable-packages-gate/publishable-packages-gate.module.unit.test.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts["src/modules/publishable-packages-gate/publishable-packages-gate.service.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_unit_test_ts["src/modules/publishable-packages-gate/publishable-packages-gate.service.unit.test.ts"]
  file_src_modules_publishable_packages_gate_publishable_packages_gate_types_ts["src/modules/publishable-packages-gate/publishable-packages-gate.types.ts"]
  file_src_modules_release_group_release_group_constants_ts["src/modules/release-group/release-group.constants.ts"]
  file_src_modules_release_group_release_group_module_ts["src/modules/release-group/release-group.module.ts"]
  file_src_modules_release_group_release_group_module_unit_test_ts["src/modules/release-group/release-group.module.unit.test.ts"]
  file_src_modules_release_group_release_group_service_ts["src/modules/release-group/release-group.service.ts"]
  file_src_modules_release_group_release_group_service_unit_test_ts["src/modules/release-group/release-group.service.unit.test.ts"]
  file_src_modules_release_group_release_group_types_ts["src/modules/release-group/release-group.types.ts"]
  file_src_modules_tag_codebase_tag_codebase_command_ts["src/modules/tag-codebase/tag-codebase.command.ts"]
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts["src/modules/tag-codebase/tag-codebase.command.unit.test.ts"]
  file_src_modules_tag_codebase_tag_codebase_constants_ts["src/modules/tag-codebase/tag-codebase.constants.ts"]
  file_src_modules_tag_codebase_tag_codebase_module_ts["src/modules/tag-codebase/tag-codebase.module.ts"]
  file_src_modules_tag_codebase_tag_codebase_module_unit_test_ts["src/modules/tag-codebase/tag-codebase.module.unit.test.ts"]
  file_src_modules_tag_codebase_tag_codebase_service_ts["src/modules/tag-codebase/tag-codebase.service.ts"]
  file_src_modules_tag_codebase_tag_codebase_service_unit_test_ts["src/modules/tag-codebase/tag-codebase.service.unit.test.ts"]
  file_src_modules_tag_codebase_tag_codebase_types_ts["src/modules/tag-codebase/tag-codebase.types.ts"]
  file_src_modules_tag_packages_tag_packages_command_ts["src/modules/tag-packages/tag-packages.command.ts"]
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts["src/modules/tag-packages/tag-packages.command.unit.test.ts"]
  file_src_modules_tag_packages_tag_packages_constants_ts["src/modules/tag-packages/tag-packages.constants.ts"]
  file_src_modules_tag_packages_tag_packages_module_ts["src/modules/tag-packages/tag-packages.module.ts"]
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts["src/modules/tag-packages/tag-packages.module.unit.test.ts"]
  file_src_modules_tag_packages_tag_packages_service_ts["src/modules/tag-packages/tag-packages.service.ts"]
  file_src_modules_tag_packages_tag_packages_service_unit_test_ts["src/modules/tag-packages/tag-packages.service.unit.test.ts"]
  file_src_modules_tag_packages_tag_packages_types_ts["src/modules/tag-packages/tag-packages.types.ts"]
  file_src_modules_task_database_task_database_constants_ts["src/modules/task-database/task-database.constants.ts"]
  file_src_modules_task_database_task_database_module_ts["src/modules/task-database/task-database.module.ts"]
  file_src_modules_task_database_task_database_module_unit_test_ts["src/modules/task-database/task-database.module.unit.test.ts"]
  file_src_modules_task_database_task_database_service_ts["src/modules/task-database/task-database.service.ts"]
  file_src_modules_task_database_task_database_service_unit_test_ts["src/modules/task-database/task-database.service.unit.test.ts"]
  file_src_modules_task_database_task_database_types_ts["src/modules/task-database/task-database.types.ts"]
  file_src_modules_task_database_task_database_utilities_ts["src/modules/task-database/task-database.utilities.ts"]
  file_src_modules_task_database_task_database_utilities_unit_test_ts["src/modules/task-database/task-database.utilities.unit.test.ts"]
  file_src_modules_verify_task_database_verify_task_database_command_ts["src/modules/verify-task-database/verify-task-database.command.ts"]
  file_src_modules_verify_task_database_verify_task_database_command_unit_test_ts["src/modules/verify-task-database/verify-task-database.command.unit.test.ts"]
  file_src_modules_verify_task_database_verify_task_database_constants_ts["src/modules/verify-task-database/verify-task-database.constants.ts"]
  file_src_modules_verify_task_database_verify_task_database_module_ts["src/modules/verify-task-database/verify-task-database.module.ts"]
  file_src_modules_verify_task_database_verify_task_database_module_unit_test_ts["src/modules/verify-task-database/verify-task-database.module.unit.test.ts"]
  file_src_modules_verify_task_database_verify_task_database_types_ts["src/modules/verify-task-database/verify-task-database.types.ts"]
  file_src_modules_version_packages_version_packages_command_ts["src/modules/version-packages/version-packages.command.ts"]
  file_src_modules_version_packages_version_packages_command_unit_test_ts["src/modules/version-packages/version-packages.command.unit.test.ts"]
  file_src_modules_version_packages_version_packages_constants_ts["src/modules/version-packages/version-packages.constants.ts"]
  file_src_modules_version_packages_version_packages_module_ts["src/modules/version-packages/version-packages.module.ts"]
  file_src_modules_version_packages_version_packages_module_unit_test_ts["src/modules/version-packages/version-packages.module.unit.test.ts"]
  file_src_modules_version_packages_version_packages_service_ts["src/modules/version-packages/version-packages.service.ts"]
  file_src_modules_version_packages_version_packages_service_unit_test_ts["src/modules/version-packages/version-packages.service.unit.test.ts"]
  file_src_modules_version_packages_version_packages_types_ts["src/modules/version-packages/version-packages.types.ts"]
  file_src_publication_constants_ts["src/publication.constants.ts"]
  file_src_publication_main_end_to_end_test_ts["src/publication.main.end-to-end.test.ts"]
  file_src_publication_main_ts["src/publication.main.ts"]
  file_src_publication_main_unit_test_ts["src/publication.main.unit.test.ts"]
  file_src_publication_module_ts["src/publication.module.ts"]
  file_src_publication_repl_ts["src/publication.repl.ts"]
  file_src_publication_repl_unit_test_ts["src/publication.repl.unit.test.ts"]
  file_src_publication_types_ts["src/publication.types.ts"]
  file_testing_mocks_ts["testing/mocks.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_modules_adopt_task_database_adopt_task_database_command_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_adopt_task_database_adopt_task_database_command_unit_test_ts --> file_src_modules_adopt_task_database_adopt_task_database_command_ts
  file_src_modules_adopt_task_database_adopt_task_database_command_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_adopt_task_database_adopt_task_database_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_adopt_task_database_adopt_task_database_module_ts --> file_src_modules_adopt_task_database_adopt_task_database_command_ts
  file_src_modules_adopt_task_database_adopt_task_database_module_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_adopt_task_database_adopt_task_database_module_unit_test_ts --> file_src_modules_adopt_task_database_adopt_task_database_command_ts
  file_src_modules_adopt_task_database_adopt_task_database_module_unit_test_ts --> file_src_modules_adopt_task_database_adopt_task_database_module_ts
  file_src_modules_adopt_task_database_adopt_task_database_module_unit_test_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_command_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_command_unit_test_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_command_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_command_unit_test_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_command_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_unit_test_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_command_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_unit_test_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_module_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_unit_test_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_service_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_constants_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_service_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_types_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_service_ts --> file_src_publication_types_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_service_unit_test_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_service_ts
  file_src_modules_bound_base_to_push_bound_base_to_push_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_command_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_command_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_unit_test_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_command_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_unit_test_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_unit_test_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_module_unit_test_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_constants_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_types_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts --> file_src_modules_task_database_task_database_types_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts --> file_src_publication_types_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_unit_test_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_import_pr_task_cache_import_pr_task_cache_service_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_keep_task_database_keep_task_database_command_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_keep_task_database_keep_task_database_command_unit_test_ts --> file_src_modules_keep_task_database_keep_task_database_command_ts
  file_src_modules_keep_task_database_keep_task_database_command_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_keep_task_database_keep_task_database_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_keep_task_database_keep_task_database_module_ts --> file_src_modules_keep_task_database_keep_task_database_command_ts
  file_src_modules_keep_task_database_keep_task_database_module_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_keep_task_database_keep_task_database_module_unit_test_ts --> file_src_modules_keep_task_database_keep_task_database_command_ts
  file_src_modules_keep_task_database_keep_task_database_module_unit_test_ts --> file_src_modules_keep_task_database_keep_task_database_module_ts
  file_src_modules_keep_task_database_keep_task_database_module_unit_test_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_link_packages_link_packages_command_ts --> file_src_modules_link_packages_link_packages_service_ts
  file_src_modules_link_packages_link_packages_command_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_link_packages_link_packages_command_unit_test_ts --> file_src_modules_link_packages_link_packages_command_ts
  file_src_modules_link_packages_link_packages_command_unit_test_ts --> file_src_modules_link_packages_link_packages_service_ts
  file_src_modules_link_packages_link_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_link_packages_link_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_link_packages_link_packages_command_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_link_packages_link_packages_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_link_packages_link_packages_module_ts --> file_src_modules_link_packages_link_packages_command_ts
  file_src_modules_link_packages_link_packages_module_ts --> file_src_modules_link_packages_link_packages_service_ts
  file_src_modules_link_packages_link_packages_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_link_packages_link_packages_module_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_link_packages_link_packages_module_unit_test_ts --> file_src_modules_link_packages_link_packages_command_ts
  file_src_modules_link_packages_link_packages_module_unit_test_ts --> file_src_modules_link_packages_link_packages_module_ts
  file_src_modules_link_packages_link_packages_module_unit_test_ts --> file_src_modules_link_packages_link_packages_service_ts
  file_src_modules_link_packages_link_packages_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_link_packages_link_packages_module_unit_test_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_link_packages_link_packages_constants_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_link_packages_link_packages_types_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_release_group_release_group_constants_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_modules_release_group_release_group_types_ts
  file_src_modules_link_packages_link_packages_service_ts --> file_src_publication_types_ts
  file_src_modules_link_packages_link_packages_service_unit_test_ts --> file_src_modules_link_packages_link_packages_service_ts
  file_src_modules_link_packages_link_packages_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_link_packages_link_packages_service_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_main_tip_main_tip_module_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_main_tip_main_tip_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_main_tip_main_tip_module_unit_test_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_main_tip_main_tip_module_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_main_tip_main_tip_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_main_tip_main_tip_service_ts --> file_src_modules_main_tip_main_tip_constants_ts
  file_src_modules_main_tip_main_tip_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_main_tip_main_tip_service_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_main_tip_main_tip_service_ts --> file_src_publication_types_ts
  file_src_modules_main_tip_main_tip_service_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_main_tip_main_tip_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_main_tip_main_tip_service_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_main_tip_main_tip_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_merge_task_cache_merge_task_cache_command_ts --> file_src_modules_merge_task_cache_merge_task_cache_constants_ts
  file_src_modules_merge_task_cache_merge_task_cache_command_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_merge_task_cache_merge_task_cache_command_unit_test_ts --> file_src_modules_merge_task_cache_merge_task_cache_command_ts
  file_src_modules_merge_task_cache_merge_task_cache_command_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_merge_task_cache_merge_task_cache_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_merge_task_cache_merge_task_cache_module_ts --> file_src_modules_merge_task_cache_merge_task_cache_command_ts
  file_src_modules_merge_task_cache_merge_task_cache_module_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_merge_task_cache_merge_task_cache_module_unit_test_ts --> file_src_modules_merge_task_cache_merge_task_cache_command_ts
  file_src_modules_merge_task_cache_merge_task_cache_module_unit_test_ts --> file_src_modules_merge_task_cache_merge_task_cache_module_ts
  file_src_modules_merge_task_cache_merge_task_cache_module_unit_test_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_process_runner_process_runner_module_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_process_runner_process_runner_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_process_runner_process_runner_module_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_process_runner_process_runner_service_integration_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_process_runner_process_runner_service_integration_test_ts --> file_testing_mocks_ts
  file_src_modules_process_runner_process_runner_service_ts --> file_src_modules_process_runner_process_runner_constants_ts
  file_src_modules_process_runner_process_runner_service_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_process_runner_process_runner_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_process_runner_process_runner_utilities_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_process_runner_process_runner_utilities_unit_test_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_publish_packages_publish_packages_command_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_publish_packages_publish_packages_command_ts --> file_src_modules_publish_packages_publish_packages_service_ts
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts --> file_src_modules_publish_packages_publish_packages_command_ts
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts --> file_src_modules_publish_packages_publish_packages_service_ts
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_publish_packages_publish_packages_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_publish_packages_publish_packages_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_publish_packages_publish_packages_module_ts --> file_src_modules_publish_packages_publish_packages_command_ts
  file_src_modules_publish_packages_publish_packages_module_ts --> file_src_modules_publish_packages_publish_packages_service_ts
  file_src_modules_publish_packages_publish_packages_module_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_publish_packages_publish_packages_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_publish_packages_publish_packages_module_unit_test_ts --> file_src_modules_publish_packages_publish_packages_command_ts
  file_src_modules_publish_packages_publish_packages_module_unit_test_ts --> file_src_modules_publish_packages_publish_packages_module_ts
  file_src_modules_publish_packages_publish_packages_module_unit_test_ts --> file_src_modules_publish_packages_publish_packages_service_ts
  file_src_modules_publish_packages_publish_packages_module_unit_test_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_publish_packages_publish_packages_constants_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_publish_packages_publish_packages_types_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_release_group_release_group_constants_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_modules_release_group_release_group_types_ts
  file_src_modules_publish_packages_publish_packages_service_ts --> file_src_publication_types_ts
  file_src_modules_publish_packages_publish_packages_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_publish_packages_publish_packages_service_unit_test_ts --> file_src_modules_publish_packages_publish_packages_service_ts
  file_src_modules_publish_packages_publish_packages_service_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_constants_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_command_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_command_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_command_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_module_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_constants_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_types_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts --> file_src_publication_types_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_publishable_packages_gate_publishable_packages_gate_service_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_service_ts
  file_src_modules_release_group_release_group_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_release_group_release_group_module_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_release_group_release_group_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_release_group_release_group_module_unit_test_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_release_group_release_group_module_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_release_group_release_group_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_release_group_release_group_service_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_release_group_release_group_service_ts --> file_src_modules_release_group_release_group_constants_ts
  file_src_modules_release_group_release_group_service_ts --> file_src_modules_release_group_release_group_types_ts
  file_src_modules_release_group_release_group_service_ts --> file_src_publication_types_ts
  file_src_modules_release_group_release_group_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_release_group_release_group_service_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_release_group_release_group_service_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_release_group_release_group_service_unit_test_ts --> file_src_modules_release_group_release_group_types_ts
  file_src_modules_release_group_release_group_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_tag_codebase_tag_codebase_command_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_tag_codebase_tag_codebase_command_ts --> file_src_modules_tag_codebase_tag_codebase_service_ts
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_command_ts
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_service_ts
  file_src_modules_tag_codebase_tag_codebase_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_tag_codebase_tag_codebase_module_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_tag_codebase_tag_codebase_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_tag_codebase_tag_codebase_module_ts --> file_src_modules_tag_codebase_tag_codebase_command_ts
  file_src_modules_tag_codebase_tag_codebase_module_ts --> file_src_modules_tag_codebase_tag_codebase_service_ts
  file_src_modules_tag_codebase_tag_codebase_module_unit_test_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_tag_codebase_tag_codebase_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_tag_codebase_tag_codebase_module_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_command_ts
  file_src_modules_tag_codebase_tag_codebase_module_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_module_ts
  file_src_modules_tag_codebase_tag_codebase_module_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_service_ts
  file_src_modules_tag_codebase_tag_codebase_service_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_tag_codebase_tag_codebase_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_tag_codebase_tag_codebase_service_ts --> file_src_modules_tag_codebase_tag_codebase_constants_ts
  file_src_modules_tag_codebase_tag_codebase_service_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_tag_codebase_tag_codebase_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_tag_codebase_tag_codebase_service_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_service_ts
  file_src_modules_tag_packages_tag_packages_command_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_tag_packages_tag_packages_command_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_src_modules_tag_packages_tag_packages_command_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_tag_packages_tag_packages_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_tag_packages_tag_packages_module_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_tag_packages_tag_packages_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_tag_packages_tag_packages_module_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_tag_packages_tag_packages_module_ts --> file_src_modules_tag_packages_tag_packages_command_ts
  file_src_modules_tag_packages_tag_packages_module_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts --> file_src_modules_release_group_release_group_module_ts
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts --> file_src_modules_tag_packages_tag_packages_command_ts
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts --> file_src_modules_tag_packages_tag_packages_module_ts
  file_src_modules_tag_packages_tag_packages_module_unit_test_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_release_group_release_group_types_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_tag_packages_tag_packages_constants_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_modules_tag_packages_tag_packages_types_ts
  file_src_modules_tag_packages_tag_packages_service_ts --> file_src_publication_types_ts
  file_src_modules_tag_packages_tag_packages_service_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_tag_packages_tag_packages_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_tag_packages_tag_packages_service_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_tag_packages_tag_packages_service_unit_test_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_task_database_task_database_module_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_task_database_task_database_module_unit_test_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_task_database_task_database_module_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_task_database_task_database_service_ts --> file_src_modules_task_database_task_database_constants_ts
  file_src_modules_task_database_task_database_service_ts --> file_src_modules_task_database_task_database_types_ts
  file_src_modules_task_database_task_database_service_ts --> file_src_modules_task_database_task_database_utilities_ts
  file_src_modules_task_database_task_database_service_ts --> file_src_publication_types_ts
  file_src_modules_task_database_task_database_service_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_task_database_task_database_utilities_ts --> file_src_modules_task_database_task_database_constants_ts
  file_src_modules_task_database_task_database_utilities_unit_test_ts --> file_src_modules_task_database_task_database_utilities_ts
  file_src_modules_verify_task_database_verify_task_database_command_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_verify_task_database_verify_task_database_command_unit_test_ts --> file_src_modules_task_database_task_database_service_ts
  file_src_modules_verify_task_database_verify_task_database_command_unit_test_ts --> file_src_modules_verify_task_database_verify_task_database_command_ts
  file_src_modules_verify_task_database_verify_task_database_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_verify_task_database_verify_task_database_module_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_verify_task_database_verify_task_database_module_ts --> file_src_modules_verify_task_database_verify_task_database_command_ts
  file_src_modules_verify_task_database_verify_task_database_module_unit_test_ts --> file_src_modules_task_database_task_database_module_ts
  file_src_modules_verify_task_database_verify_task_database_module_unit_test_ts --> file_src_modules_verify_task_database_verify_task_database_command_ts
  file_src_modules_verify_task_database_verify_task_database_module_unit_test_ts --> file_src_modules_verify_task_database_verify_task_database_module_ts
  file_src_modules_version_packages_version_packages_command_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_version_packages_version_packages_command_ts --> file_src_modules_version_packages_version_packages_service_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_release_group_release_group_service_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_version_packages_version_packages_command_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_src_modules_version_packages_version_packages_service_ts
  file_src_modules_version_packages_version_packages_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_version_packages_version_packages_module_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_version_packages_version_packages_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_version_packages_version_packages_module_ts --> file_src_modules_tag_packages_tag_packages_module_ts
  file_src_modules_version_packages_version_packages_module_ts --> file_src_modules_version_packages_version_packages_command_ts
  file_src_modules_version_packages_version_packages_module_ts --> file_src_modules_version_packages_version_packages_service_ts
  file_src_modules_version_packages_version_packages_module_unit_test_ts --> file_src_modules_main_tip_main_tip_module_ts
  file_src_modules_version_packages_version_packages_module_unit_test_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_version_packages_version_packages_module_unit_test_ts --> file_src_modules_tag_packages_tag_packages_module_ts
  file_src_modules_version_packages_version_packages_module_unit_test_ts --> file_src_modules_version_packages_version_packages_command_ts
  file_src_modules_version_packages_version_packages_module_unit_test_ts --> file_src_modules_version_packages_version_packages_module_ts
  file_src_modules_version_packages_version_packages_module_unit_test_ts --> file_src_modules_version_packages_version_packages_service_ts
  file_src_modules_version_packages_version_packages_service_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_version_packages_version_packages_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_version_packages_version_packages_service_ts --> file_src_modules_process_runner_process_runner_utilities_ts
  file_src_modules_version_packages_version_packages_service_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_version_packages_version_packages_service_ts --> file_src_modules_version_packages_version_packages_constants_ts
  file_src_modules_version_packages_version_packages_service_ts --> file_src_publication_types_ts
  file_src_modules_version_packages_version_packages_service_unit_test_ts --> file_src_modules_main_tip_main_tip_service_ts
  file_src_modules_version_packages_version_packages_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_version_packages_version_packages_service_unit_test_ts --> file_src_modules_tag_packages_tag_packages_service_ts
  file_src_modules_version_packages_version_packages_service_unit_test_ts --> file_src_modules_version_packages_version_packages_service_ts
  file_src_publication_main_end_to_end_test_ts --> file_src_publication_constants_ts
  file_src_publication_main_ts --> file_src_publication_module_ts
  file_src_publication_main_unit_test_ts --> file_src_modules_link_packages_link_packages_module_ts
  file_src_publication_main_unit_test_ts --> file_src_modules_publish_packages_publish_packages_module_ts
  file_src_publication_main_unit_test_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts
  file_src_publication_main_unit_test_ts --> file_src_modules_tag_codebase_tag_codebase_module_ts
  file_src_publication_main_unit_test_ts --> file_src_modules_tag_packages_tag_packages_module_ts
  file_src_publication_main_unit_test_ts --> file_src_modules_version_packages_version_packages_module_ts
  file_src_publication_module_ts --> file_src_modules_adopt_task_database_adopt_task_database_module_ts
  file_src_publication_module_ts --> file_src_modules_bound_base_to_push_bound_base_to_push_module_ts
  file_src_publication_module_ts --> file_src_modules_import_pr_task_cache_import_pr_task_cache_module_ts
  file_src_publication_module_ts --> file_src_modules_keep_task_database_keep_task_database_module_ts
  file_src_publication_module_ts --> file_src_modules_link_packages_link_packages_module_ts
  file_src_publication_module_ts --> file_src_modules_merge_task_cache_merge_task_cache_module_ts
  file_src_publication_module_ts --> file_src_modules_publish_packages_publish_packages_module_ts
  file_src_publication_module_ts --> file_src_modules_publishable_packages_gate_publishable_packages_gate_module_ts
  file_src_publication_module_ts --> file_src_modules_tag_codebase_tag_codebase_module_ts
  file_src_publication_module_ts --> file_src_modules_tag_packages_tag_packages_module_ts
  file_src_publication_module_ts --> file_src_modules_verify_task_database_verify_task_database_module_ts
  file_src_publication_module_ts --> file_src_modules_version_packages_version_packages_module_ts
  file_src_publication_module_ts --> file_src_publication_constants_ts
  file_src_publication_repl_ts --> file_src_publication_module_ts
  file_src_publication_types_ts --> file_src_publication_constants_ts
  file_testing_mocks_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_testing_mocks_ts --> file_src_modules_process_runner_process_runner_types_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-10175-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-329.64_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-19-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-132-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-132-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-24-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-4-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-53-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-243-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-2-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-46-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-18-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-43-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-536-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-122-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-451-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-207-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-606-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-636-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-168-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-417-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-762-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-3-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-146-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-43-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-8-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-99-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-67-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-23-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-125-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-17-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-12-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-12-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-17-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-17-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-2-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-44-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-1-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-318-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-7-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-16-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-57-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-6-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-28-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-3-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-23-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-10-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-13-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-152-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
