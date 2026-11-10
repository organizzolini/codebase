<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `publication`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 105 |
| Files | 54 |
| Calls traced | 156 |
| Call stacks | 6 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 7 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `LinkPackagesCommand.run`** — depth ≥ 6 · decorated-method

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

**2. `PublishPackagesCommand.run`** — depth ≥ 6 · decorated-method

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

**3. `VersionPackagesCommand.run`** — depth 6 · decorated-method

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

<details>
<summary>3 more call stacks</summary>

**4. `TagPackagesCommand.run`** — depth 5 · decorated-method

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

**5. `TagCodebaseCommand.run`** — depth 4 · decorated-method

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

**6. `PublishablePackagesGateCommand.run`** — depth 3 · decorated-method

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
<summary>46 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `TagPackagesService.commitLeftoverVersions` | 7 | `TagPackagesService.mustStream`, `TagPackagesService.versionedFiles`, `ProcessRunnerService.capture`, `MainTipService.head`, `ProcessRunnerService.stream`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom` | `publication/src/modules/tag-packages/tag-packages.service.ts:68` |
| `TagPackagesService.run` | 7 | `TagPackagesService.commitLeftoverVersions`, `ReleaseGroupService.readGroup`, `TagPackagesService.tagBaselines`, `TagPackagesService.tagNewVersions`, `pushingMessage`, `TagPackagesService.map(…)`, `TagPackagesService.pushWithRetries` | `publication/src/modules/tag-packages/tag-packages.service.ts:285` |
| `PublishPackagesService.publishToNpm` | 6 | `ReleaseGroupService.npmRegistry`, `authenticationLine`, `ProcessRunnerService.stream`, `PublishPackagesService.flatMap(…)`, `ReleaseGroupService.isRehearsal`, `PublishPackagesService.map(…)` | `publication/src/modules/publish-packages/publish-packages.service.ts:201` |
| `VersionPackagesService.run` | 6 | `VersionPackagesService.pointRemoteAtToken`, `MainTipService.head`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom`, `TagPackagesService.run`, `VersionPackagesService.releaseWithoutConfiguration` | `publication/src/modules/version-packages/version-packages.service.ts:117` |
| `PublishPackagesService.mirrorPackage` | 5 | `ReleaseGroupService.readManifest`, `ProcessRunnerService.captureAsync`, `alreadyMirroredMessage`, `PublishPackagesService.packRenamed`, `mirroringMessage` | `publication/src/modules/publish-packages/publish-packages.service.ts:62` |
| `TagPackagesService.tagBaselines` | 5 | `ReleaseGroupService.readManifest`, `requireSuccess`, `ProcessRunnerService.capture`, `TagPackagesService.createTag`, `TagPackagesService.parentOfAddition` | `publication/src/modules/tag-packages/tag-packages.service.ts:213` |
| `PublishPackagesService.refuseUnsealedRehearsal` | 4 | `ReleaseGroupService.isRehearsal`, `ReleaseGroupService.readManifest`, `ReleaseGroupService.npmRegistry`, `unsealedMessage` | `publication/src/modules/publish-packages/publish-packages.service.ts:282` |
| `TagCodebaseService.run` | 4 | `MainTipService.head`, `MainTipService.hasMovedFrom`, `MainTipService.stepAsideFrom`, `ProcessRunnerService.stream` | `publication/src/modules/tag-codebase/tag-codebase.service.ts:49` |
| `TagPackagesService.parentOfAddition` | 4 | `TagPackagesService.findLast(…)`, `requireSuccess`, `ProcessRunnerService.capture`, `noBaselineMessage` | `publication/src/modules/tag-packages/tag-packages.service.ts:138` |
| `TagPackagesService.pushWithRetries` | 4 | `TagPackagesService.retryDelay`, `ProcessRunnerService.stream`, `retryingMessage`, `TagPackagesService.anonymous` | `publication/src/modules/tag-packages/tag-packages.service.ts:169` |
| `VersionPackagesService.pointRemoteAtToken` | 4 | `requireVariable`, `requireSuccess`, `ProcessRunnerService.capture`, `authenticatedRemote` | `publication/src/modules/version-packages/version-packages.service.ts:65` |
| `ReleaseGroupService.membersFrom` | 3 | `requireSuccess`, `ProcessRunnerService.capture`, `ReleaseGroupService.map(…)` | `publication/src/modules/release-group/release-group.service.ts:68` |
| `ReleaseGroupService.map(…)` | 3 | `ReleaseGroupService.acquire`, `ReleaseGroupService.settle`, `ReleaseGroupService.release` | `publication/src/modules/release-group/release-group.service.ts:237` |
| `PublishablePackagesGateCommand.run` | 3 | `PublishablePackagesGateService.decide`, `affectedMessage`, `PublishablePackagesGateService.execute` | `publication/src/modules/publishable-packages-gate/publishable-packages-gate.command.ts:49` |
| `MainTipService.stepAsideFrom` | 3 | `requireVariable`, `ProcessRunnerService.capture`, `superseded` | `publication/src/modules/main-tip/main-tip.service.ts:86` |
| `TagPackagesService.tagNewVersions` | 3 | `ReleaseGroupService.readManifest`, `ProcessRunnerService.capture`, `TagPackagesService.createTag` | `publication/src/modules/tag-packages/tag-packages.service.ts:243` |
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
| `ReleaseGroupService.settle` | 1 | `describeError` | `publication/src/modules/release-group/release-group.service.ts:49` |
| `ReleaseGroupService.isRehearsal` | 1 | `ReleaseGroupService.npmRegistry` | `publication/src/modules/release-group/release-group.service.ts:138` |
| `ReleaseGroupService.runInParallel` | 1 | `ReleaseGroupService.map(…)` | `publication/src/modules/release-group/release-group.service.ts:211` |
| `ReleaseGroupService.acquire` | 1 | `ReleaseGroupService.anonymous` | `publication/src/modules/release-group/release-group.service.ts:217` |
| `ReleaseGroupService.specifier` | 1 | `ReleaseGroupService.readManifest` | `publication/src/modules/release-group/release-group.service.ts:267` |
| `LinkPackagesService.readInputs` | 1 | `LinkPackagesService.read` | `publication/src/modules/link-packages/link-packages.service.ts:185` |
| `LinkPackagesService.read` | 1 | `requireVariable` | `publication/src/modules/link-packages/link-packages.service.ts:186` |
| `LinkPackagesService.runInParallel(…)` | 1 | `LinkPackagesService.linkPackage` | `publication/src/modules/link-packages/link-packages.service.ts:284` |
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
| `VersionPackagesService.releaseWithoutConfiguration` | 1 | `ProcessRunnerService.stream` | `publication/src/modules/version-packages/version-packages.service.ts:90` |

</details>
<!-- callidescope:end -->
