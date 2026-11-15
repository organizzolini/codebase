<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `deployment`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 99 |
| Files | 49 |
| Calls traced | 151 |
| Call stacks | 5 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `LinkPackagesCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 LinkPackagesCommand.run(): Promise<void> [deployment/src/modules/link-packages/link-packages.command.ts:46]
   ↳ Links the release group, and exits with the outcome.
  └─> LinkPackagesService.run(): Promise<number> [deployment/src/modules/link-packages/link-packages.service.ts:252]
     ↳ Records every published release-group version that has no record yet, and lists the ones this run published in a…
    └─> LinkPackagesService.runInParallel(…)(root: string): Promise<ParallelOutcome> [deployment/src/modules/link-packages/link-packages.service.ts:284]
      └─> LinkPackagesService.linkPackage(root: string, context: LinkContext): Promise<ParallelOutcome> [deployment/src/modules/link-packages/link-packages.service.ts:144]
         ↳ Links the package in the given directory: a version this run published is added to the attestation subjects, a version…
        └─> ReleaseGroupService.specifier(root: string): string [deployment/src/modules/release-group/release-group.service.ts:267]
           ↳ Names the package in the given directory as `<name>@<version>`.
          └─> ReleaseGroupService.readManifest(root: string): PackageManifest [deployment/src/modules/release-group/release-group.service.ts:196]
             ↳ Reads the name and version of the package in the given directory.
```

**2. `PublishPackagesCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 PublishPackagesCommand.run(): Promise<void> [deployment/src/modules/publish-packages/publish-packages.command.ts:47]
   ↳ Publishes and mirrors the release group, and exits with the outcome.
  └─> PublishPackagesService.run(): Promise<number> [deployment/src/modules/publish-packages/publish-packages.service.ts:318]
     ↳ Publishes the release group to npm, then mirrors it to GitHub Packages.
    └─> PublishPackagesService.runInParallel(…)(root: string): Promise<ParallelOutcome> [deployment/src/modules/publish-packages/publish-packages.service.ts:334]
      └─> PublishPackagesService.mirrorPackage(root: string, context: MirrorContext): Promise<ParallelOutcome> [deployment/src/modules/publish-packages/publish-packages.service.ts:62]
         ↳ Mirrors the package in the given directory to GitHub Packages, unless that version is there already.
        └─> PublishPackagesService.packRenamed(root: string, mirror: string, context: MirrorContext): Promise<CapturedProcess> [deployment/src/modules/publish-packages/publish-packages.service.ts:116]
           ↳ Packs a package exactly as npm got it, unpacks it, and renames it into the mirror's scope, dropping its…
          └─> ProcessRunnerService.captureAsync(executable: string, args: readonly string[]): Promise<CapturedProcess> [deployment/src/modules/process-runner/process-runner.service.ts:65]
             ↳ Runs a command without blocking, so several can run at once, and returns what it printed once it ends.
```

**3. `VersionPackagesCommand.run`** — depth 6 · decorated-method

```text
🚀 VersionPackagesCommand.run(): Promise<void> [deployment/src/modules/version-packages/version-packages.command.ts:45]
   ↳ Versions the release group, and exits with the outcome.
  └─> VersionPackagesService.run(): Promise<number> [deployment/src/modules/version-packages/version-packages.service.ts:117]
     ↳ Points the remote at the release token, pushes any tags an earlier run left missing, and versions the release group.
    └─> TagPackagesService.run(): Promise<number> [deployment/src/modules/tag-packages/tag-packages.service.ts:285]
       ↳ Commits any leftover versions, then tags and pushes every newly versioned package.
      └─> TagPackagesService.commitLeftoverVersions(): LeftoverOutcome [deployment/src/modules/tag-packages/tag-packages.service.ts:68]
         ↳ Commits and pushes any versions semantic-release left uncommitted.
        └─> TagPackagesService.mustStream(executable: string, args: readonly string[]): void [deployment/src/modules/tag-packages/tag-packages.service.ts:127]
           ↳ Streams a command, failing the step when it fails.
          └─> ProcessRunnerService.stream(executable: string, args: readonly string[], input?: string): number [deployment/src/modules/process-runner/process-runner.service.ts:141]
             ↳ Runs a command with this process's own output streams, so its output appears as it would from the shell step that used…
```

<details>
<summary>2 more call stacks</summary>

**4. `TagPackagesCommand.run`** — depth 5 · decorated-method

```text
🚀 TagPackagesCommand.run(): Promise<void> [deployment/src/modules/tag-packages/tag-packages.command.ts:46]
   ↳ Commits leftover versions, tags, and pushes, and exits with the outcome.
  └─> TagPackagesService.run(): Promise<number> [deployment/src/modules/tag-packages/tag-packages.service.ts:285]
     ↳ Commits any leftover versions, then tags and pushes every newly versioned package.
    └─> TagPackagesService.commitLeftoverVersions(): LeftoverOutcome [deployment/src/modules/tag-packages/tag-packages.service.ts:68]
       ↳ Commits and pushes any versions semantic-release left uncommitted.
      └─> TagPackagesService.mustStream(executable: string, args: readonly string[]): void [deployment/src/modules/tag-packages/tag-packages.service.ts:127]
         ↳ Streams a command, failing the step when it fails.
        └─> ProcessRunnerService.stream(executable: string, args: readonly string[], input?: string): number [deployment/src/modules/process-runner/process-runner.service.ts:141]
           ↳ Runs a command with this process's own output streams, so its output appears as it would from the shell step that used…
```

**5. `TagCodebaseCommand.run`** — depth 4 · decorated-method

```text
🚀 TagCodebaseCommand.run(): Promise<void> [deployment/src/modules/tag-codebase/tag-codebase.command.ts:44]
   ↳ Releases the codebase, and exits with the outcome.
  └─> TagCodebaseService.run(): number [deployment/src/modules/tag-codebase/tag-codebase.service.ts:49]
     ↳ Runs semantic-release, or steps aside when `main` has moved.
    └─> MainTipService.head(): string [deployment/src/modules/main-tip/main-tip.service.ts:73]
       ↳ Prints the commit checked out.
      └─> requireSuccess(result: CapturedProcess, commandLine: string): string [deployment/src/modules/process-runner/process-runner.utilities.ts:21]
         ↳ Returns what a finished process printed, or fails the way `set -e` failed the shell scripts these commands replace: at…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `LinkPackagesService.linkPackage` | 8 | `ReleaseGroupService.specifier`, `LinkPackagesService.tarballDigest`, `ReleaseGroupService.isOnNpm`, `rehearsalMessage`, `LinkPackagesService.hasStorageRecord`, `alreadyLinkedMessage`, `LinkPackagesService.createStorageRecord`, `linkingMessage` | `deployment/src/modules/link-packages/link-packages.service.ts:144` |
| `LinkPackagesService.run` | 8 | `LinkPackagesService.readInputs`, `LinkPackagesService.map(…)`, `ReleaseGroupService.readGroup`, `LinkPackagesService.filter(…)`, `ReleaseGroupService.npmRegistry`, `ReleaseGroupService.isRehearsal`, `LinkPackagesService.runInParallel(…)`, `ReleaseGroupService.runInParallel` | `deployment/src/modules/link-packages/link-packages.service.ts:252` |
| `PublishPackagesService.run` | 8 | `PublishPackagesService.readInputs`, `PublishPackagesService.map(…)`, `ReleaseGroupService.readGroup`, `PublishPackagesService.refuseUnsealedRehearsal`, `PublishPackagesService.publishToNpm`, `PublishPackagesService.prepareMirrors`, `PublishPackagesService.runInParallel(…)`, `ReleaseGroupService.runInParallel` | `deployment/src/modules/publish-packages/publish-packages.service.ts:318` |

<details>
<summary>43 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TagPackagesService.commitLeftoverVersions` | 7 | `TagPackagesService.mustStream`, `TagPackagesService.versionedFiles`, `ProcessRunnerService.capture`, `MainTipService.head`, `ProcessRunnerService.stream`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom` | `deployment/src/modules/tag-packages/tag-packages.service.ts:68` |
| `TagPackagesService.run` | 7 | `TagPackagesService.commitLeftoverVersions`, `ReleaseGroupService.readGroup`, `TagPackagesService.tagBaselines`, `TagPackagesService.tagNewVersions`, `pushingMessage`, `TagPackagesService.map(…)`, `TagPackagesService.pushWithRetries` | `deployment/src/modules/tag-packages/tag-packages.service.ts:285` |
| `PublishPackagesService.publishToNpm` | 6 | `ReleaseGroupService.npmRegistry`, `authenticationLine`, `ProcessRunnerService.stream`, `PublishPackagesService.flatMap(…)`, `ReleaseGroupService.isRehearsal`, `PublishPackagesService.map(…)` | `deployment/src/modules/publish-packages/publish-packages.service.ts:201` |
| `VersionPackagesService.run` | 6 | `VersionPackagesService.pointRemoteAtToken`, `MainTipService.head`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom`, `TagPackagesService.run`, `VersionPackagesService.releaseWithoutConfiguration` | `deployment/src/modules/version-packages/version-packages.service.ts:117` |
| `PublishPackagesService.mirrorPackage` | 5 | `ReleaseGroupService.readManifest`, `ProcessRunnerService.captureAsync`, `alreadyMirroredMessage`, `PublishPackagesService.packRenamed`, `mirroringMessage` | `deployment/src/modules/publish-packages/publish-packages.service.ts:62` |
| `TagPackagesService.tagBaselines` | 5 | `ReleaseGroupService.readManifest`, `requireSuccess`, `ProcessRunnerService.capture`, `TagPackagesService.createTag`, `TagPackagesService.parentOfAddition` | `deployment/src/modules/tag-packages/tag-packages.service.ts:213` |
| `PublishPackagesService.refuseUnsealedRehearsal` | 4 | `ReleaseGroupService.isRehearsal`, `ReleaseGroupService.readManifest`, `ReleaseGroupService.npmRegistry`, `unsealedMessage` | `deployment/src/modules/publish-packages/publish-packages.service.ts:282` |
| `TagCodebaseService.run` | 4 | `MainTipService.head`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom`, `ProcessRunnerService.stream` | `deployment/src/modules/tag-codebase/tag-codebase.service.ts:49` |
| `TagPackagesService.parentOfAddition` | 4 | `TagPackagesService.findLast(…)`, `requireSuccess`, `ProcessRunnerService.capture`, `noBaselineMessage` | `deployment/src/modules/tag-packages/tag-packages.service.ts:138` |
| `TagPackagesService.pushWithRetries` | 4 | `TagPackagesService.retryDelay`, `ProcessRunnerService.stream`, `retryingMessage`, `TagPackagesService.anonymous` | `deployment/src/modules/tag-packages/tag-packages.service.ts:169` |
| `VersionPackagesService.pointRemoteAtToken` | 4 | `requireVariable`, `requireSuccess`, `ProcessRunnerService.capture`, `authenticatedRemote` | `deployment/src/modules/version-packages/version-packages.service.ts:65` |
| `ReleaseGroupService.membersFrom` | 3 | `requireSuccess`, `ProcessRunnerService.capture`, `ReleaseGroupService.map(…)` | `deployment/src/modules/release-group/release-group.service.ts:68` |
| `ReleaseGroupService.map(…)` | 3 | `ReleaseGroupService.acquire`, `ReleaseGroupService.settle`, `ReleaseGroupService.release` | `deployment/src/modules/release-group/release-group.service.ts:237` |
| `MainTipService.stepAsideFrom` | 3 | `requireVariable`, `ProcessRunnerService.capture`, `superseded` | `deployment/src/modules/main-tip/main-tip.service.ts:86` |
| `TagPackagesService.tagNewVersions` | 3 | `ReleaseGroupService.readManifest`, `ProcessRunnerService.capture`, `TagPackagesService.createTag` | `deployment/src/modules/tag-packages/tag-packages.service.ts:243` |
| `ReleaseGroupService.isOnNpm` | 2 | `ProcessRunnerService.captureAsync`, `ReleaseGroupService.npmRegistry` | `deployment/src/modules/release-group/release-group.service.ts:120` |
| `ReleaseGroupService.readGroup` | 2 | `ReleaseGroupService.membersFrom`, `describeError` | `deployment/src/modules/release-group/release-group.service.ts:169` |
| `LinkPackagesService.createStorageRecord` | 2 | `LinkPackagesService.parse`, `ProcessRunnerService.captureAsync` | `deployment/src/modules/link-packages/link-packages.service.ts:69` |
| `LinkPackagesService.hasStorageRecord` | 2 | `ProcessRunnerService.captureAsync`, `LinkPackagesService.some(…)` | `deployment/src/modules/link-packages/link-packages.service.ts:119` |
| `LinkPackagesService.tarballDigest` | 2 | `LinkPackagesService.parse`, `ProcessRunnerService.captureAsync` | `deployment/src/modules/link-packages/link-packages.service.ts:205` |
| `LinkPackagesCommand.run` | 2 | `LinkPackagesService.run`, `describeError` | `deployment/src/modules/link-packages/link-packages.command.ts:46` |
| `PublishPackagesCommand.run` | 2 | `PublishPackagesService.run`, `describeError` | `deployment/src/modules/publish-packages/publish-packages.command.ts:47` |
| `MainTipService.head` | 2 | `requireSuccess`, `ProcessRunnerService.capture` | `deployment/src/modules/main-tip/main-tip.service.ts:73` |
| `TagCodebaseCommand.run` | 2 | `TagCodebaseService.run`, `describeError` | `deployment/src/modules/tag-codebase/tag-codebase.command.ts:44` |
| `TagPackagesCommand.run` | 2 | `TagPackagesService.run`, `describeError` | `deployment/src/modules/tag-packages/tag-packages.command.ts:46` |
| `VersionPackagesCommand.run` | 2 | `VersionPackagesService.run`, `describeError` | `deployment/src/modules/version-packages/version-packages.command.ts:45` |
| `ReleaseGroupService.settle` | 1 | `describeError` | `deployment/src/modules/release-group/release-group.service.ts:49` |
| `ReleaseGroupService.isRehearsal` | 1 | `ReleaseGroupService.npmRegistry` | `deployment/src/modules/release-group/release-group.service.ts:138` |
| `ReleaseGroupService.runInParallel` | 1 | `ReleaseGroupService.map(…)` | `deployment/src/modules/release-group/release-group.service.ts:211` |
| `ReleaseGroupService.acquire` | 1 | `ReleaseGroupService.anonymous` | `deployment/src/modules/release-group/release-group.service.ts:217` |
| `ReleaseGroupService.specifier` | 1 | `ReleaseGroupService.readManifest` | `deployment/src/modules/release-group/release-group.service.ts:267` |
| `LinkPackagesService.readInputs` | 1 | `LinkPackagesService.read` | `deployment/src/modules/link-packages/link-packages.service.ts:185` |
| `LinkPackagesService.read` | 1 | `requireVariable` | `deployment/src/modules/link-packages/link-packages.service.ts:186` |
| `LinkPackagesService.runInParallel(…)` | 1 | `LinkPackagesService.linkPackage` | `deployment/src/modules/link-packages/link-packages.service.ts:284` |
| `PublishPackagesService.packRenamed` | 1 | `ProcessRunnerService.captureAsync` | `deployment/src/modules/publish-packages/publish-packages.service.ts:116` |
| `PublishPackagesService.prepareMirrors` | 1 | `authenticationLine` | `deployment/src/modules/publish-packages/publish-packages.service.ts:172` |
| `PublishPackagesService.readInputs` | 1 | `requireVariable` | `deployment/src/modules/publish-packages/publish-packages.service.ts:247` |
| `PublishPackagesService.runInParallel(…)` | 1 | `PublishPackagesService.mirrorPackage` | `deployment/src/modules/publish-packages/publish-packages.service.ts:334` |
| `MainTipService.hasMovedFrom` | 1 | `ProcessRunnerService.capture` | `deployment/src/modules/main-tip/main-tip.service.ts:51` |
| `TagPackagesService.createTag` | 1 | `ProcessRunnerService.stream` | `deployment/src/modules/tag-packages/tag-packages.service.ts:110` |
| `TagPackagesService.mustStream` | 1 | `ProcessRunnerService.stream` | `deployment/src/modules/tag-packages/tag-packages.service.ts:127` |
| `TagPackagesService.versionedFiles` | 1 | `TagPackagesService.flatMap(…)` | `deployment/src/modules/tag-packages/tag-packages.service.ts:270` |
| `VersionPackagesService.releaseWithoutConfiguration` | 1 | `ProcessRunnerService.stream` | `deployment/src/modules/version-packages/version-packages.service.ts:90` |

</details>
<!-- callidescope:end -->
