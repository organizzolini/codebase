<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `validation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 48 |
| Files | 37 |
| Calls traced | 33 |
| Call stacks | 5 |
| Deepest stack | 5 |
| Stacks through recursion | 0 |
| Unfollowable calls | 5 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `CatalogManifestsCommand.run`** — depth 5 · decorated-method

```text
🚀 CatalogManifestsCommand.run(): Promise<void> [validation/src/modules/catalog-manifests/catalog-manifests.command.ts:43]
   ↳ Checks every workspace manifest and exits 0 or 1 on the verdict.
  └─> CatalogManifestsCommand.flatMap(…)(this: undefined, manifestPath: string): string[] [validation/src/modules/catalog-manifests/catalog-manifests.command.ts:49]
    └─> CatalogManifestsService.validateManifestDependencies(manifestPath: string, manifest: PackageManifest): string[] [validation/src/modules/catalog-manifests/catalog-manifests.service.ts:125]
       ↳ Every mis-pinned dependency in one manifest, in every section.
      └─> CatalogManifestsService.isInternalWorkspaceDependency(dependencyName: string): boolean [validation/src/modules/catalog-manifests/catalog-manifests.service.ts:91]
         ↳ Whether this dependency names one of this workspace's own packages.
        └─> CatalogManifestsService.some(…)(scope: string): boolean [validation/src/modules/catalog-manifests/catalog-manifests.service.ts:92]
```

**2. `SessionWorktreeNameCommand.run`** — depth 5 · decorated-method

```text
🚀 SessionWorktreeNameCommand.run(): Promise<void> [validation/src/modules/session-worktree-name/session-worktree-name.command.ts:45]
   ↳ Prints the worktree report and sets exit code 1 when the name breaks the convention, without forcing an early exit.
  └─> SessionWorktreeNameService.findViolations(): string[] [validation/src/modules/session-worktree-name/session-worktree-name.service.ts:91]
     ↳ Lists how the current worktree breaks the convention: a non-kebab-case name, or, inside the main checkout, not being…
    └─> SessionWorktreeNameService.findLinkedWorktree(): LinkedWorktree | undefined [validation/src/modules/session-worktree-name/session-worktree-name.service.ts:41]
       ↳ Returns the linked worktree the current directory roots, or undefined.
      └─> SessionWorktreeNameService.readGit(args: readonly string[]): string [validation/src/modules/session-worktree-name/session-worktree-name.service.ts:79]
         ↳ What `git` printed, trimmed, or an empty string when it failed.
        └─> SessionWorktreeNameGitService.run(args: readonly string[]): GitResult [validation/src/modules/session-worktree-name/session-worktree-name-git.service.ts:31]
           ↳ Runs `git` with these arguments in the current directory, returning whether it started, its status, and its output.
```

**3. `SessionBranchNameCommand.run`** — depth 4 · decorated-method

```text
🚀 SessionBranchNameCommand.run(): Promise<void> [validation/src/modules/session-branch-name/session-branch-name.command.ts:46]
   ↳ Prints the branch report and sets exit code 1 when the branch breaks the convention, without forcing an early exit.
  └─> SessionBranchNameService.judgeCurrentBranch(): SessionBranchNameResult [validation/src/modules/session-branch-name/session-branch-name.service.ts:50]
     ↳ Whether the checked-out branch follows the convention, if there is one.
    └─> SessionBranchNameService.readCurrentBranch(): string [validation/src/modules/session-branch-name/session-branch-name.service.ts:41]
       ↳ The checked-out branch, or an empty string when there is none to ask about.
      └─> SessionBranchNameGitService.run(args: readonly string[]): GitResult [validation/src/modules/session-branch-name/session-branch-name-git.service.ts:31]
         ↳ Runs `git` with these arguments in the current directory, returning whether it started, its status, and its output.
```

<details>
<summary>2 more call stacks</summary>

**4. `LockfileCommand.run`** — depth 3 · decorated-method

```text
🚀 LockfileCommand.run(): Promise<void> [validation/src/modules/lockfile/lockfile.command.ts:46]
   ↳ Checks the lockfile and exits 0 or 1 on pnpm's verdict.
  └─> LockfileService.checkLockfile(): FrozenInstallResult [validation/src/modules/lockfile/lockfile.service.ts:55]
     ↳ Runs `pnpm install --frozen-lockfile --lockfile-only`: the bare name, then the Node's own directory, as a git hook may…
    └─> LockfileService.runFrozenInstall(packageManagerPath: string): FrozenInstallResult [validation/src/modules/lockfile/lockfile.service.ts:33]
       ↳ Runs one candidate pnpm, merging both of its streams.
```

**5. `ReadmeProjectsCommand.run`** — depth 3 · decorated-method

```text
🚀 ReadmeProjectsCommand.run(): Promise<void> [validation/src/modules/readme-projects/readme-projects.command.ts:39]
   ↳ Checks every workspace project and exits 0 or 1 on the verdict.
  └─> ReadmeProjectsService.resolveWorkspaceProjectPaths(workspaceRoot: string): string[] [validation/src/modules/readme-projects/readme-projects.service.ts:108]
     ↳ Every workspace project's scope-relative path, e.g. `projects/common/observability`.
    └─> ReadmeProjectsService.findRootProjectPaths(workspaceRoot: string): string[] [validation/src/modules/readme-projects/readme-projects.service.ts:71]
       ↳ Every project directly in the workspace root: a non-hidden directory with a `package.json`.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `SessionWorktreeNameService.findViolations` | 4 | `SessionWorktreeNameService.findLinkedWorktree`, `describeInvalidName`, `SessionWorktreeNameService.isIgnored`, `describeUnignoredWorktree` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:91` |
| `ReadmeProjectsCommand.run` | 3 | `ReadmeProjectsService.resolveWorkspaceProjectPaths`, `ReadmeProjectsService.readRootReadme`, `ReadmeProjectsService.findUndocumentedProjectPaths` | `validation/src/modules/readme-projects/readme-projects.command.ts:39` |
| `CatalogManifestsService.resolveWorkspaceManifestPaths` | 2 | `CatalogManifestsService.findRootManifestPaths`, `CatalogManifestsService.findManifestPaths` | `validation/src/modules/catalog-manifests/catalog-manifests.service.ts:105` |

<details>
<summary>15 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CatalogManifestsCommand.run` | 2 | `CatalogManifestsService.resolveWorkspaceManifestPaths`, `CatalogManifestsCommand.flatMap(…)` | `validation/src/modules/catalog-manifests/catalog-manifests.command.ts:43` |
| `CatalogManifestsCommand.flatMap(…)` | 2 | `CatalogManifestsService.validateManifestDependencies`, `CatalogManifestsService.readManifest` | `validation/src/modules/catalog-manifests/catalog-manifests.command.ts:49` |
| `ReadmeProjectsService.resolveWorkspaceProjectPaths` | 2 | `ReadmeProjectsService.findRootProjectPaths`, `ReadmeProjectsService.findProjectPaths` | `validation/src/modules/readme-projects/readme-projects.service.ts:108` |
| `SessionBranchNameService.judgeCurrentBranch` | 2 | `SessionBranchNameService.readCurrentBranch`, `SessionBranchNameService.readBranchNameRules` | `validation/src/modules/session-branch-name/session-branch-name.service.ts:50` |
| `CatalogManifestsService.isInternalWorkspaceDependency` | 1 | `CatalogManifestsService.some(…)` | `validation/src/modules/catalog-manifests/catalog-manifests.service.ts:91` |
| `CatalogManifestsService.validateManifestDependencies` | 1 | `CatalogManifestsService.isInternalWorkspaceDependency` | `validation/src/modules/catalog-manifests/catalog-manifests.service.ts:125` |
| `LockfileService.checkLockfile` | 1 | `LockfileService.runFrozenInstall` | `validation/src/modules/lockfile/lockfile.service.ts:55` |
| `LockfileCommand.run` | 1 | `LockfileService.checkLockfile` | `validation/src/modules/lockfile/lockfile.command.ts:46` |
| `ReadmeProjectsService.findUndocumentedProjectPaths` | 1 | `ReadmeProjectsService.filter(…)` | `validation/src/modules/readme-projects/readme-projects.service.ts:93` |
| `SessionBranchNameService.readCurrentBranch` | 1 | `SessionBranchNameGitService.run` | `validation/src/modules/session-branch-name/session-branch-name.service.ts:41` |
| `SessionBranchNameCommand.run` | 1 | `SessionBranchNameService.judgeCurrentBranch` | `validation/src/modules/session-branch-name/session-branch-name.command.ts:46` |
| `SessionWorktreeNameService.findLinkedWorktree` | 1 | `SessionWorktreeNameService.readGit` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:41` |
| `SessionWorktreeNameService.isIgnored` | 1 | `SessionWorktreeNameGitService.run` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:66` |
| `SessionWorktreeNameService.readGit` | 1 | `SessionWorktreeNameGitService.run` | `validation/src/modules/session-worktree-name/session-worktree-name.service.ts:79` |
| `SessionWorktreeNameCommand.run` | 1 | `SessionWorktreeNameService.findViolations` | `validation/src/modules/session-worktree-name/session-worktree-name.command.ts:45` |

</details>
<!-- callidescope:end -->
