<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `validation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 96 |
| Files | 47 |
| Calls traced | 89 |
| Call stacks | 6 |
| Deepest stack | 8 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `PublishablePackagesCommand.run`** — depth 8 · decorated-method

```text
🚀 PublishablePackagesCommand.run(): Promise<void> [validation/src/modules/publishable-packages/publishable-packages.command.ts:46]
   ↳ Executes the publishable package tarball verification and exits 0 on success, 1 on failure.
  └─> PublishablePackagesService.verifyPublishablePackages(workspaceRoot: string): PublishablePackagesVerificationResult [validation/src/modules/publishable-packages/publishable-packages.service.ts:178]
     ↳ Installs every packed publishable package into a consumer outside the workspace and exercises it: each package's import…
    └─> PublishablePackagesChecksService.verifyConsumer(…): string[] [validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:238]
       ↳ Runs every check against an installed consumer.
      └─> PublishablePackagesChecksService.verifyBinaries(…): string[] [validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:62]
         ↳ Runs each command line's `--help`, which loads its whole command tree.
        └─> PublishablePackagesChecksService.flatMap(…)(this: undefined, binary: string): string[] [validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:70]
          └─> PublishablePackagesChecksService.runBinary(…): ConsumerCommandResult [validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:49]
             ↳ Runs one of the consumer's installed executables.
            └─> PublishablePackagesProcessService.run(context: ConsumerContext, command: ConsumerCommand): ConsumerCommandResult [validation/src/modules/publishable-packages/publishable-packages-process.service.ts:85]
               ↳ Runs one command in the consumer's directory and returns what it printed.
              └─> PublishablePackagesProcessService.createEnvironment(context: ConsumerContext): NodeJS.ProcessEnv [validation/src/modules/publishable-packages/publishable-packages-process.service.ts:47]
                 ↳ Builds the environment a consumer command runs under.
```

**2. `CatalogManifestsCommand.run`** — depth 5 · decorated-method

```text
🚀 CatalogManifestsCommand.run(): Promise<void> [validation/src/modules/catalog-manifests/catalog-manifests.command.ts:44]
   ↳ Checks every workspace manifest and exits 0 or 1 on the verdict.
  └─> CatalogManifestsCommand.flatMap(…)(this: undefined, manifestPath: string): string[] [validation/src/modules/catalog-manifests/catalog-manifests.command.ts:50]
    └─> CatalogManifestsService.validateManifestDependencies(manifestPath: string, manifest: PackageManifest): string[] [validation/src/modules/catalog-manifests/catalog-manifests.service.ts:130]
       ↳ Every mis-pinned dependency in one manifest, in every section.
      └─> CatalogManifestsService.isInternalWorkspaceDependency(dependencyName: string): boolean [validation/src/modules/catalog-manifests/catalog-manifests.service.ts:96]
         ↳ Whether this dependency names one of this workspace's own packages.
        └─> CatalogManifestsService.some(…)(scope: string): boolean [validation/src/modules/catalog-manifests/catalog-manifests.service.ts:97]
```

**3. `SessionWorktreeNameCommand.run`** — depth 5 · decorated-method

```text
🚀 SessionWorktreeNameCommand.run(): Promise<void> [validation/src/modules/session-worktree-name/session-worktree-name.command.ts:51]
   ↳ Judges the worktree, printing the report and setting exit code 1 when it breaks the convention.
  └─> SessionWorktreeNameService.findViolations(): string[] [validation/src/modules/session-worktree-name/session-worktree-name.service.ts:95]
     ↳ Every way the current worktree breaks the convention: a directory name that is not lowercase kebab-case, then, for one…
    └─> SessionWorktreeNameService.findLinkedWorktree(): LinkedWorktree | undefined [validation/src/modules/session-worktree-name/session-worktree-name.service.ts:44]
       ↳ The linked worktree the current directory is the root of, or undefined when it is not one.
      └─> SessionWorktreeNameService.readGit(args: readonly string[]): string [validation/src/modules/session-worktree-name/session-worktree-name.service.ts:82]
         ↳ What `git` printed, trimmed, or an empty string when it failed.
        └─> SessionWorktreeNameGitService.run(args: readonly string[]): GitResult [validation/src/modules/session-worktree-name/session-worktree-name-git.service.ts:33]
           ↳ Runs `git` with these arguments in the current working directory.
```

<details>
<summary>3 more call stacks</summary>

**4. `SessionBranchNameCommand.run`** — depth 4 · decorated-method

```text
🚀 SessionBranchNameCommand.run(): Promise<void> [validation/src/modules/session-branch-name/session-branch-name.command.ts:50]
   ↳ Judges the branch, printing the report and setting exit code 1 when it breaks the convention.
  └─> SessionBranchNameService.judgeCurrentBranch(): SessionBranchNameResult [validation/src/modules/session-branch-name/session-branch-name.service.ts:50]
     ↳ Whether the checked-out branch follows the convention, if there is one.
    └─> SessionBranchNameService.readCurrentBranch(): string [validation/src/modules/session-branch-name/session-branch-name.service.ts:41]
       ↳ The checked-out branch, or an empty string when there is none to ask about.
      └─> SessionBranchNameGitService.run(args: readonly string[]): GitResult [validation/src/modules/session-branch-name/session-branch-name-git.service.ts:33]
         ↳ Runs `git` with these arguments in the current working directory.
```

**5. `LockfileCommand.run`** — depth 3 · decorated-method

```text
🚀 LockfileCommand.run(): Promise<void> [validation/src/modules/lockfile/lockfile.command.ts:50]
   ↳ Checks the lockfile and exits 0 or 1 on pnpm's verdict.
  └─> LockfileService.checkLockfile(): FrozenInstallResult [validation/src/modules/lockfile/lockfile.service.ts:60]
     ↳ Runs `pnpm install --frozen-lockfile --lockfile-only`, wherever pnpm is.
    └─> LockfileService.runFrozenInstall(packageManagerPath: string): FrozenInstallResult [validation/src/modules/lockfile/lockfile.service.ts:33]
       ↳ Runs one candidate pnpm, merging both of its streams.
```

**6. `ReadmeProjectsCommand.run`** — depth 3 · decorated-method

```text
🚀 ReadmeProjectsCommand.run(): Promise<void> [validation/src/modules/readme-projects/readme-projects.command.ts:43]
   ↳ Checks every workspace project and exits 0 or 1 on the verdict.
  └─> ReadmeProjectsService.resolveWorkspaceProjectPaths(workspaceRoot: string): string[] [validation/src/modules/readme-projects/readme-projects.service.ts:115]
     ↳ Every workspace project's scope-relative path, e.g. `projects/common/observability`.
    └─> ReadmeProjectsService.findRootProjectPaths(workspaceRoot: string): string[] [validation/src/modules/readme-projects/readme-projects.service.ts:78]
       ↳ Every project that sits directly in the workspace root, such as `validation`: a non-hidden directory with its own…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `PublishablePackagesService.verifyPublishablePackages` | 8 | `PublishablePackagesService.resolvePublishablePackages`, `PublishablePackagesService.filter(…)`, `PublishablePackagesService.findMissingTarballs`, `formatMissingTarballsMessage`, `PublishablePackagesConsumerService.createConsumer`, `PublishablePackagesConsumerService.installConsumer`, `PublishablePackagesChecksService.verifyConsumer`, `PublishablePackagesConsumerService.removeConsumer` | `validation/src/modules/publishable-packages/publishable-packages.service.ts:178` |
| `PublishablePackagesChecksService.verifyConsumer` | 5 | `PublishablePackagesChecksService.verifyTypecheck`, `PublishablePackagesChecksService.verifyBinaries`, `PublishablePackagesChecksService.verifyProjectGraph`, `PublishablePackagesChecksService.verifyGenerator`, `PublishablePackagesChecksService.verifyPluginTarget` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:238` |
| `PublishablePackagesConsumerService.createConsumer` | 4 | `PublishablePackagesConsumerService.createTypecheckFiles`, `PublishablePackagesConsumerService.createManifest`, `PublishablePackagesConsumerService.createWorkspaceConfiguration`, `PublishablePackagesConsumerService.writeFiles` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:187` |

<details>
<summary>37 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `SessionWorktreeNameService.findViolations` | 4 | `SessionWorktreeNameService.findLinkedWorktree`, `describeInvalidName`, `SessionWorktreeNameService.isIgnored`, `describeUnignoredWorktree` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:95` |
| `PublishablePackagesChecksService.verifyProjectGraph` | 3 | `PublishablePackagesChecksService.runBinary`, `PublishablePackagesChecksService.every(…)`, `formatCommandFailure` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:179` |
| `PublishablePackagesConsumerService.createManifest` | 3 | `PublishablePackagesConsumerService.resolveTarballs`, `PublishablePackagesConsumerService.map(…)`, `PublishablePackagesConsumerService.readManifest` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:61` |
| `PublishablePackagesConsumerService.createWorkspaceConfiguration` | 3 | `PublishablePackagesConsumerService.map(…)`, `PublishablePackagesConsumerService.map(…)`, `PublishablePackagesConsumerService.resolveTarballs` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:105` |
| `ReadmeProjectsCommand.run` | 3 | `ReadmeProjectsService.resolveWorkspaceProjectPaths`, `ReadmeProjectsService.readRootReadme`, `ReadmeProjectsService.findUndocumentedProjectPaths` | `validation/src/modules/readme-projects/readme-projects.command.ts:43` |
| `CatalogManifestsService.resolveWorkspaceManifestPaths` | 2 | `CatalogManifestsService.findRootManifestPaths`, `CatalogManifestsService.findManifestPaths` | `validation/src/modules/catalog-manifests/catalog-manifests.service.ts:110` |
| `CatalogManifestsCommand.run` | 2 | `CatalogManifestsService.resolveWorkspaceManifestPaths`, `CatalogManifestsCommand.flatMap(…)` | `validation/src/modules/catalog-manifests/catalog-manifests.command.ts:44` |
| `CatalogManifestsCommand.flatMap(…)` | 2 | `CatalogManifestsService.validateManifestDependencies`, `CatalogManifestsService.readManifest` | `validation/src/modules/catalog-manifests/catalog-manifests.command.ts:50` |
| `PublishablePackagesProcessService.run` | 2 | `PublishablePackagesProcessService.createEnvironment`, `PublishablePackagesProcessService.filter(…)` | `validation/src/modules/publishable-packages/publishable-packages-process.service.ts:85` |
| `PublishablePackagesChecksService.verifyBinaries` | 2 | `PublishablePackagesChecksService.flatMap(…)`, `PublishablePackagesChecksService.flatMap(…)` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:62` |
| `PublishablePackagesChecksService.flatMap(…)` | 2 | `PublishablePackagesChecksService.runBinary`, `formatCommandFailure` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:70` |
| `PublishablePackagesChecksService.verifyGenerator` | 2 | `PublishablePackagesChecksService.runBinary`, `formatCommandFailure` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:86` |
| `PublishablePackagesChecksService.verifyPluginTarget` | 2 | `PublishablePackagesChecksService.runBinary`, `formatCommandFailure` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:138` |
| `PublishablePackagesChecksService.verifyTypecheck` | 2 | `PublishablePackagesProcessService.run`, `formatCommandFailure` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:205` |
| `PublishablePackagesConsumerService.installConsumer` | 2 | `PublishablePackagesProcessService.run`, `formatCommandFailure` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:219` |
| `PublishablePackagesService.findMissingTarballs` | 2 | `PublishablePackagesService.filter(…)`, `PublishablePackagesService.map(…)` | `validation/src/modules/publishable-packages/publishable-packages.service.ts:46` |
| `PublishablePackagesService.resolvePublishablePackages` | 2 | `PublishablePackagesService.resolveFamilyPackages`, `PublishablePackagesService.toSorted(…)` | `validation/src/modules/publishable-packages/publishable-packages.service.ts:138` |
| `PublishablePackagesCommand.run` | 2 | `PublishablePackagesService.verifyPublishablePackages`, `formatPublishablePackagesSuccessMessage` | `validation/src/modules/publishable-packages/publishable-packages.command.ts:46` |
| `ReadmeProjectsService.resolveWorkspaceProjectPaths` | 2 | `ReadmeProjectsService.findRootProjectPaths`, `ReadmeProjectsService.findProjectPaths` | `validation/src/modules/readme-projects/readme-projects.service.ts:115` |
| `SessionBranchNameService.judgeCurrentBranch` | 2 | `SessionBranchNameService.readCurrentBranch`, `SessionBranchNameService.readBranchNameRules` | `validation/src/modules/session-branch-name/session-branch-name.service.ts:50` |
| `CatalogManifestsService.isInternalWorkspaceDependency` | 1 | `CatalogManifestsService.some(…)` | `validation/src/modules/catalog-manifests/catalog-manifests.service.ts:96` |
| `CatalogManifestsService.validateManifestDependencies` | 1 | `CatalogManifestsService.isInternalWorkspaceDependency` | `validation/src/modules/catalog-manifests/catalog-manifests.service.ts:130` |
| `LockfileService.checkLockfile` | 1 | `LockfileService.runFrozenInstall` | `validation/src/modules/lockfile/lockfile.service.ts:60` |
| `LockfileCommand.run` | 1 | `LockfileService.checkLockfile` | `validation/src/modules/lockfile/lockfile.command.ts:50` |
| `PublishablePackagesChecksService.runBinary` | 1 | `PublishablePackagesProcessService.run` | `validation/src/modules/publishable-packages/publishable-packages-checks.service.ts:49` |
| `PublishablePackagesConsumerService.map(…)` | 1 | `PublishablePackagesConsumerService.readToolVersion` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:63` |
| `PublishablePackagesConsumerService.createTypecheckFiles` | 1 | `PublishablePackagesConsumerService.map(…)` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:83` |
| `PublishablePackagesConsumerService.readToolVersion` | 1 | `PublishablePackagesConsumerService.readManifest` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:140` |
| `PublishablePackagesConsumerService.resolveTarballs` | 1 | `PublishablePackagesConsumerService.map(…)` | `validation/src/modules/publishable-packages/publishable-packages-consumer.service.ts:156` |
| `PublishablePackagesService.resolveFamilyPackages` | 1 | `PublishablePackagesService.parsePackageCandidate` | `validation/src/modules/publishable-packages/publishable-packages.service.ts:112` |
| `ReadmeProjectsService.findUndocumentedProjectPaths` | 1 | `ReadmeProjectsService.filter(…)` | `validation/src/modules/readme-projects/readme-projects.service.ts:100` |
| `SessionBranchNameService.readCurrentBranch` | 1 | `SessionBranchNameGitService.run` | `validation/src/modules/session-branch-name/session-branch-name.service.ts:41` |
| `SessionBranchNameCommand.run` | 1 | `SessionBranchNameService.judgeCurrentBranch` | `validation/src/modules/session-branch-name/session-branch-name.command.ts:50` |
| `SessionWorktreeNameService.findLinkedWorktree` | 1 | `SessionWorktreeNameService.readGit` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:44` |
| `SessionWorktreeNameService.isIgnored` | 1 | `SessionWorktreeNameGitService.run` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:69` |
| `SessionWorktreeNameService.readGit` | 1 | `SessionWorktreeNameGitService.run` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:82` |
| `SessionWorktreeNameCommand.run` | 1 | `SessionWorktreeNameService.findViolations` | `validation/src/modules/session-worktree-name/session-worktree-name.command.ts:51` |

</details>
<!-- callidescope:end -->
