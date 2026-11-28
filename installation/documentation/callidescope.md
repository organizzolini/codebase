<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `installation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 351 |
| Files | 129 |
| Calls traced | 592 |
| Call stacks | 18 |
| Deepest stack | 13 |
| Stacks through recursion | 0 |
| Unfollowable calls | 18 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | none |

### Call stacks (depth)

**1. `SetupCommand.run`** — depth ≥ 13 · decorated-method

```text
🚀 SetupCommand.run(): Promise<void> [installation/src/modules/setup/setup.command.ts:40]
   ↳ Sets up the machine.
  └─> SetupService.setUp(): Promise<void> [installation/src/modules/setup/setup.service.ts:99]
     ↳ Runs the steps for this operating system, stopping at the first that fails.
    └─> SetupService.setUpMac(): Promise<void> [installation/src/modules/setup/setup.service.ts:82]
       ↳ Sets up a developer's Mac.
      └─> SoftwareService.installSoftware(): Promise<void> [installation/src/modules/software/software.service.ts:61]
         ↳ Installs what this operating system gets, then makes SSH signatures verifiable.
        └─> SoftwareService.installWithHomebrew(): Promise<void> [installation/src/modules/software/software.service.ts:49]
           ↳ Installs what a Mac with Homebrew gets, in order.
          └─> SoftwareDatabaseService.installDatabaseTools(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:180]
             ↳ Installs squawk and the PostgreSQL 18 tools.
            └─> SoftwareDatabaseService.installPostgres(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:186]
               ↳ Installs PostgreSQL 18 unless its tools are already present.
              └─> SoftwareDatabaseService.installPostgresClient(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:104]
                 ↳ Installs PostgreSQL 18 on this machine, however its package manager does.
                └─> SoftwareDatabaseService.installPostgresWithApt(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:130]
                   ↳ Installs PostgreSQL 18 from the PostgreSQL apt repository, as root or through `sudo`.
                  └─> SoftwareDatabaseService.addAptRepository(codename: string): void [installation/src/modules/software/modules/tooling/software-database.service.ts:50]
                     ↳ Adds the PostgreSQL apt source and its signing key.
                    └─> SoftwareDatabaseService.asRoot(command: string, args: string[]): void [installation/src/modules/software/modules/tooling/software-database.service.ts:85]
                       ↳ Runs a command as root: directly when this process is root, else through `sudo`.
                      └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:134]
                         ↳ Runs a command and throws unless it exits 0, as `set -e` would. The error names the command.
                        └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:107]
                           ↳ Runs a command.
```

**2. `SoftwareCommand.run`** — depth ≥ 11 · decorated-method

```text
🚀 SoftwareCommand.run(names?: readonly string[]): Promise<void> [installation/src/modules/software/software.command.ts:43]
   ↳ Installs the named software, or all of it when none is named.
  └─> SoftwareService.installSoftware(): Promise<void> [installation/src/modules/software/software.service.ts:61]
     ↳ Installs what this operating system gets, then makes SSH signatures verifiable.
    └─> SoftwareService.installWithHomebrew(): Promise<void> [installation/src/modules/software/software.service.ts:49]
       ↳ Installs what a Mac with Homebrew gets, in order.
      └─> SoftwareDatabaseService.installDatabaseTools(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:180]
         ↳ Installs squawk and the PostgreSQL 18 tools.
        └─> SoftwareDatabaseService.installPostgres(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:186]
           ↳ Installs PostgreSQL 18 unless its tools are already present.
          └─> SoftwareDatabaseService.installPostgresClient(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:104]
             ↳ Installs PostgreSQL 18 on this machine, however its package manager does.
            └─> SoftwareDatabaseService.installPostgresWithApt(): void [installation/src/modules/software/modules/tooling/software-database.service.ts:130]
               ↳ Installs PostgreSQL 18 from the PostgreSQL apt repository, as root or through `sudo`.
              └─> SoftwareDatabaseService.addAptRepository(codename: string): void [installation/src/modules/software/modules/tooling/software-database.service.ts:50]
                 ↳ Adds the PostgreSQL apt source and its signing key.
                └─> SoftwareDatabaseService.asRoot(command: string, args: string[]): void [installation/src/modules/software/modules/tooling/software-database.service.ts:85]
                   ↳ Runs a command as root: directly when this process is root, else through `sudo`.
                  └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:134]
                     ↳ Runs a command and throws unless it exits 0, as `set -e` would. The error names the command.
                    └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:107]
                       ↳ Runs a command.
```

**3. `SharedNxCacheCommand.run`** — depth ≥ 10 · decorated-method

```text
🚀 SharedNxCacheCommand.run(_parameters: string[], options?: Partial<ServerOptions>): Promise<void> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache.command.ts:76]
   ↳ Serves until SIGINT or SIGTERM, then closes the server.
  └─> SharedNxCacheServerService.start(options: ServerOptions): Promise<RunningServer> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:215]
     ↳ Listens on 127.0.0.1, evicts now, and evicts hourly until `close` is called.
    └─> SharedNxCacheServerService.createServer(…)(…): void [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:222]
      └─> SharedNxCacheServerService.handle(exchange: Exchange): Promise<void> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:100]
         ↳ Routes one request.
        └─> SharedNxCacheServerService.put(exchange: Exchange, hash: string): Promise<void> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:134]
           ↳ Stores the body of a `PUT`.
          └─> SharedNxCacheServerService.settle(exchange: Exchange, hash: string, outcome: WriteOutcome): Promise<void> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:173]
             ↳ Copies a stored upload to a writable bucket, then answers for its outcome.
            └─> SharedNxCacheRemoteService.store(hash: string, body: Readable): Promise<void> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:120]
               ↳ Uploads `body` under `hash` unless read-only or already there; failures are logged, not thrown.
              └─> SharedNxCacheRemoteService.writable(): boolean [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:153]
                 ↳ Whether uploads are switched on, and a bucket is there to take them.
                └─> SharedNxCacheRemoteService.enabled(): boolean [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:88]
                   ↳ Whether a bucket is configured.
                  └─> SharedNxCacheRemoteService.target(hash: string): undefined | { client: AwsClient; url: string; } [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:61]
                     ↳ A signing client and the url of the object for `hash`, or undefined without a bucket.
```

<details>
<summary>15 more call stacks</summary>

**4. `InstalledSkillsCommand.run`** — depth 9 · decorated-method

```text
🚀 InstalledSkillsCommand.run(passedParameters: string[]): Promise<void> [installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:166]
   ↳ Runs the installed-skills command in check or write mode.
  └─> InstalledSkillsCommand.synchronize(mode: "check" | "write"): Promise<boolean> [installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:184]
     ↳ Checks or restores the installed skills, reporting success.
    └─> InstalledSkillsCommand.write(): boolean [installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:126]
       ↳ Restores the missing locked skills, never reporting failure.
      └─> InstalledSkillsService.restoreSkills(): void [installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:188]
         ↳ Restores every locked skill, then undoes the restore's rewrites to tracked files. Never fails: an outage only warns.
        └─> InstalledSkillsService.findCleanSkillFolders(lockfilePath: string): string[] [installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:48]
           ↳ The locked skill folders with no uncommitted changes right now.
          └─> InstalledSkillsService.filter(…)(folder: string): boolean [installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:52]
            └─> InstalledSkillsService.hasChanges(target: string): boolean [installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:64]
               ↳ Whether `git` reports uncommitted changes under one path.
              └─> InstalledSkillsService.git(...args: string[]): ProcessResult [installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:59]
                 ↳ Runs one `git` query or command, without printing anything.
                └─> InstalledSkillsProcessService.run(command: ProcessCommand): ProcessResult [installation/src/modules/dependencies/modules/installed-skills/installed-skills-process.service.ts:31]
                   ↳ Runs one process to completion in the current directory, returning whether it started and its exit status.
```

**5. `DependenciesCommand.run`** — depth 6 · decorated-method

```text
🚀 DependenciesCommand.run(): Promise<void> [installation/src/modules/dependencies/dependencies.command.ts:40]
   ↳ Installs the dependencies.
  └─> DependenciesService.installDependencies(): void [installation/src/modules/dependencies/dependencies.service.ts:189]
     ↳ Installs every dependency and initializes Terraform and kubeconfig.
    └─> DependenciesService.writeKubeconfig(workspaceRoot: string): void [installation/src/modules/dependencies/dependencies.service.ts:156]
       ↳ Writes `~/.kube/config` from the cluster Terraform manages, when there is none.
      └─> DependenciesService.importCluster(…): void [installation/src/modules/dependencies/dependencies.service.ts:55]
         ↳ Imports the cluster into Terraform's state when it does not track it yet.
        └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:134]
           ↳ Runs a command and throws unless it exits 0, as `set -e` would. The error names the command.
          └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:107]
             ↳ Runs a command.
```

**6. `UpgradeDependenciesCommand.run`** — depth 6 · decorated-method

```text
🚀 UpgradeDependenciesCommand.run(): Promise<void> [installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.command.ts:79]
   ↳ Runs every upgrade in turn, then reports what came of them.
  └─> UpgradeDependenciesService.attempt(step: UpgradeStep): Promise<UpgradeOutcome> [installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:169]
     ↳ Runs one upgrade, undoing it if it fails.
    └─> UpgradeDependenciesService.work(step: UpgradeStep): Promise<UpgradeWork> [installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:148]
       ↳ Carries a step out: its commands in order, or its task, which throws on failure.
      └─> UpgradeNodeService.upgrade(): Promise<string> [installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-node/upgrade-node.service.ts:55]
         ↳ Writes the newest release of the current major, if newer.
        └─> UpgradeNodeService.fetchReleases(): Promise<string[]> [installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-node/upgrade-node.service.ts:37]
           ↳ Every release Node.js has published, as `v` and three numbers.
          └─> UpgradeNodeService.map(…)(release: { version: string; }): string [installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-node/upgrade-node.service.ts:46]
```

**7. `LocalServicesCommand.run`** — depth 6 · decorated-method

```text
🚀 LocalServicesCommand.run(): Promise<void> [installation/src/modules/local-services/local-services.command.ts:40]
   ↳ Starts the local services.
  └─> LocalServicesService.startLocalServices(): Promise<void> [installation/src/modules/local-services/local-services.service.ts:110]
     ↳ Starts the Docker daemon when needed, then the Postgres container.
    └─> LocalServicesService.ensureDaemon(): Promise<boolean> [installation/src/modules/local-services/local-services.service.ts:43]
       ↳ Makes sure a daemon answers, starting one when this machine can.
      └─> LocalServicesService.startDaemon(): Promise<boolean> [installation/src/modules/local-services/local-services.service.ts:82]
         ↳ Starts a daemon of its own, detached, and waits for it to answer.
        └─> ProcessRunnerService.startDetached(command: string, args: string[]): void [installation/src/modules/process-runner/process-runner.service.ts:158]
           ↳ Starts a command that keeps running after this process, and does not wait for it.
          └─> ProcessRunnerService.on(…)(): void [installation/src/modules/process-runner/process-runner.service.ts:161]
```

**8. `ShellConfigurationCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 ShellConfigurationCommand.run(): Promise<void> [installation/src/modules/shell-configuration/shell-configuration.command.ts:40]
   ↳ Configures the shell.
  └─> ShellConfigurationService.configureShell(): void [installation/src/modules/shell-configuration/shell-configuration.service.ts:164]
     ↳ Configures the startup files of the shell this process was started from.
    └─> ShellConfigurationService.configureStartupFile(file: string): void [installation/src/modules/shell-configuration/shell-configuration.service.ts:99]
       ↳ Configures one startup file.
      └─> ShellConfigurationService.findNvmPrefix(): string [installation/src/modules/shell-configuration/shell-configuration.service.ts:118]
         ↳ Where Homebrew put nvm, which its startup script is sourced from.
        └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:134]
           ↳ Runs a command and throws unless it exits 0, as `set -e` would. The error names the command.
          └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:107]
             ↳ Runs a command.
```

**9. `UpdateReuiSkillCommand.run`** — depth 5 · decorated-method

```text
🚀 UpdateReuiSkillCommand.run(): Promise<void> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.command.ts:40]
   ↳ Refreshes the skill.
  └─> UpdateReuiSkillService.update(): Promise<void> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:187]
     ↳ Refreshes the skill, printing the retry command instead of failing.
    └─> UpdateReuiSkillService.refresh(root: string): Promise<void> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:152]
       ↳ Fetches, compares, and writes only when the pin or the folder differs.
      └─> UpdateReuiSkillService.fetchBundle(skillDirectory: string): Promise<SkillBundle> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:53]
         ↳ Fetches the bundle and refuses one that is empty, unsafe, or without `SKILL.md`.
        └─> UpdateReuiSkillService.map(…)(…): { content: Buffer<ArrayBuffer>; path: string; } [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:71]
```

**10. `SessionWorktreeNameCommand.run`** — depth 5 · decorated-method

```text
🚀 SessionWorktreeNameCommand.run(): Promise<void> [installation/src/modules/session-worktree-name/session-worktree-name.command.ts:45]
   ↳ Prints the worktree report and sets exit code 1 when the name breaks the convention, without forcing an early exit.
  └─> SessionWorktreeNameService.findViolations(): string[] [installation/src/modules/session-worktree-name/session-worktree-name.service.ts:91]
     ↳ Lists how the current worktree breaks the convention: a non-kebab-case name, or, inside the main checkout, not being…
    └─> SessionWorktreeNameService.findLinkedWorktree(): LinkedWorktree | undefined [installation/src/modules/session-worktree-name/session-worktree-name.service.ts:41]
       ↳ Returns the linked worktree the current directory roots, or undefined.
      └─> SessionWorktreeNameService.readGit(args: readonly string[]): string [installation/src/modules/session-worktree-name/session-worktree-name.service.ts:79]
         ↳ What `git` printed, trimmed, or an empty string when it failed.
        └─> SessionWorktreeNameGitService.run(args: readonly string[]): GitResult [installation/src/modules/session-worktree-name/session-worktree-name-git.service.ts:31]
           ↳ Runs `git` with these arguments in the current directory, returning whether it started, its status, and its output.
```

**11. `UpgradeDependenciesService.upgrade`** — depth 5 · orphan-root

```text
🚀 UpgradeDependenciesService.upgrade(): Promise<string> [installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:68]
  └─> UpdateReuiSkillService.update(): Promise<void> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:187]
     ↳ Refreshes the skill, printing the retry command instead of failing.
    └─> UpdateReuiSkillService.refresh(root: string): Promise<void> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:152]
       ↳ Fetches, compares, and writes only when the pin or the folder differs.
      └─> UpdateReuiSkillService.fetchBundle(skillDirectory: string): Promise<SkillBundle> [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:53]
         ↳ Fetches the bundle and refuses one that is empty, unsafe, or without `SKILL.md`.
        └─> UpdateReuiSkillService.map(…)(…): { content: Buffer<ArrayBuffer>; path: string; } [installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:71]
```

**12. `EnvironmentFilesCommand.run`** — depth 4 · decorated-method

```text
🚀 EnvironmentFilesCommand.run(): Promise<void> [installation/src/modules/environment-files/environment-files.command.ts:39]
   ↳ Creates the environment files.
  └─> EnvironmentFilesService.createEnvironmentFiles(): void [installation/src/modules/environment-files/environment-files.service.ts:113]
     ↳ Bootstraps every project's `.env` from its `.env.default`.
    └─> EnvironmentFilesService.findTargets(): EnvironmentFileTarget[] [installation/src/modules/environment-files/environment-files.service.ts:88]
       ↳ Lists every directory Git knows holds a `.env.default`, sorted and unique.
      └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:107]
         ↳ Runs a command.
```

**13. `SessionBranchNameCommand.run`** — depth 4 · decorated-method

```text
🚀 SessionBranchNameCommand.run(): Promise<void> [installation/src/modules/session-branch-name/session-branch-name.command.ts:46]
   ↳ Prints the branch report and sets exit code 1 when the branch breaks the convention, without forcing an early exit.
  └─> SessionBranchNameService.judgeCurrentBranch(): SessionBranchNameResult [installation/src/modules/session-branch-name/session-branch-name.service.ts:50]
     ↳ Whether the checked-out branch follows the convention, if there is one.
    └─> SessionBranchNameService.readCurrentBranch(): string [installation/src/modules/session-branch-name/session-branch-name.service.ts:41]
       ↳ The checked-out branch, or an empty string when there is none to ask about.
      └─> SessionBranchNameGitService.run(args: readonly string[]): GitResult [installation/src/modules/session-branch-name/session-branch-name-git.service.ts:31]
         ↳ Runs `git` with these arguments in the current directory, returning whether it started, its status, and its output.
```

**14. `RemoteCacheCommand.run`** — depth 4 · decorated-method

```text
🚀 RemoteCacheCommand.run(): Promise<void> [installation/src/modules/setup/modules/remote-cache/remote-cache.command.ts:40]
   ↳ Sets up the remote cache key.
  └─> RemoteCacheService.setUpRemoteCache(): void [installation/src/modules/setup/modules/remote-cache/remote-cache.service.ts:142]
     ↳ Creates the read-only key and its file, unless this machine has them or cannot make them.
    └─> RemoteCacheService.createKey(): undefined | { access_key: string; secret_key: string; } [installation/src/modules/setup/modules/remote-cache/remote-cache.service.ts:53]
       ↳ Asks `linode-cli` for a key that can only read the bucket; says why when it cannot.
      └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:107]
         ↳ Runs a command.
```

**15. `run`** — depth 4 · orphan-root

```text
🚀 run(command: ProcessCommand): ProcessResult [installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:65]
  └─> answerGit(args: readonly string[]): ProcessResult [installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:56]
    └─> isDirty(args: readonly string[]): boolean [installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:42]
      └─> isLockfileDirty(): boolean [installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:38]
```

**16. `VscodeSettingsCommand.run`** — depth 3 · decorated-method

```text
🚀 VscodeSettingsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [installation/src/modules/shell-configuration/modules/vscode-settings/vscode-settings.command.ts:87]
   ↳ Runs the vscode-settings sync command in check or write mode.
  └─> VscodeSettingsCommand.synchronize(mode: "check" | "write"): Promise<boolean> [installation/src/modules/shell-configuration/modules/vscode-settings/vscode-settings.command.ts:109]
     ↳ Synchronizes the Machine settings and reports success without exiting.
    └─> VscodeSettingsCommand.readMachineSettings(): VscodeSettings [installation/src/modules/shell-configuration/modules/vscode-settings/vscode-settings.command.ts:66]
       ↳ Reads the Machine settings, which do not exist until something writes them.
```

**17. `SharedNxCacheServerService.close`** — depth ≥ 3 · orphan-root

```text
🚀 SharedNxCacheServerService.close(): Promise<void> [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:242]
  └─> SharedNxCacheServerService.anonymous(resolve: (value: void | PromiseLike<void>) => void): void [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:244]
    └─> SharedNxCacheServerService.close(…)(): void [installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:245]
```

**18. `lockSkills`** — depth 2 · orphan-root

```text
🚀 lockSkills(workspace: string, skillNames: string[]): void [installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:86]
   ↳ Writes a lockfile declaring exactly these skills.
  └─> map(…)(name: string): [string, { source: string; }] [installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:91]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `renderPullRequestBody` | 8 | `flatMap(…)`, `filter(…)`, `map(…)`, `map(…)`, `filter(…)`, `map(…)`, `map(…)`, `flatMap(…)` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:14` |
| `ReleaseArchivesService.install` | 8 | `ReporterService.print`, `ProcessRunnerService.locate`, `ReleaseArchivesService.resolveArchitecture`, `ReleaseArchivesService.resolveTemplate`, `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.fetch`, `ReleaseArchivesService.place`, `ProcessRunnerService.run` | `installation/src/modules/release-archives/release-archives.service.ts:159` |
| `UpgradeDependenciesService.attempt` | 7 | `UpgradeDependenciesService.snapshot`, `UpgradeDependenciesService.work`, `UpgradeDependenciesService.git`, `warningsOf`, `UpgradeDependenciesService.undo`, `unrestoredMessage`, `UpgradeDependenciesService.tail` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:169` |

<details>
<summary>183 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `RemoteCacheService.setUpRemoteCache` | 7 | `RemoteCacheService.environmentFile`, `ReporterService.print`, `alreadyConfiguredMessage`, `ProcessRunnerService.locate`, `RemoteCacheService.createKey`, `RemoteCacheService.writeEnvironmentFile`, `keyCreatedMessage` | `installation/src/modules/setup/modules/remote-cache/remote-cache.service.ts:142` |
| `ShellConfigurationService.configureStartupFile` | 7 | `ReporterService.print`, `ShellConfigurationService.appendBlock`, `ShellConfigurationService.buildNvmBlock`, `ShellConfigurationService.findNvmPrefix`, `ShellConfigurationService.appendCompletions`, `ShellConfigurationService.appendTerraformCompletion`, `ShellConfigurationService.removeProcessesBlock` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:99` |
| `SoftwareLinuxService.installLinuxTools` | 7 | `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)` | `installation/src/modules/software/modules/platform/software-linux.service.ts:54` |
| `InstalledSkillsService.restoreSkills` | 6 | `InstalledSkillsService.git`, `InstalledSkillsService.hasChanges`, `InstalledSkillsService.findCleanSkillFolders`, `InstalledSkillsService.runRestore`, `InstalledSkillsService.revertTrackedChanges`, `InstalledSkillsService.verifyRestoration` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:188` |
| `UpdateReuiSkillService.refresh` | 6 | `UpdateReuiSkillService.fetchBundle`, `UpdateReuiSkillService.readLock`, `UpdateReuiSkillService.hashFiles`, `UpdateReuiSkillService.readInstalledFiles`, `ReporterService.print`, `UpdateReuiSkillService.install` | `installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:152` |
| `SshSigningService.configureSshSigning` | 6 | `SshSigningService.readGitSetting`, `ReporterService.print`, `SshSigningService.installSshKeygen`, `SshSigningService.readSignerKey`, `SshSigningService.writeAllowedSigners`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:134` |
| `SoftwareDockerService.installDocker` | 6 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareDockerService.isRunning`, `SoftwareDockerService.readVersion`, `SoftwareDockerService.startDaemon` | `installation/src/modules/software/modules/runtimes/software-docker.service.ts:76` |
| `SoftwareOllamaService.installOllama` | 6 | `SoftwareBrewService.installOrCheck`, `ReporterService.print`, `SoftwareOllamaService.isRunning`, `SoftwareOllamaService.start`, `SoftwareOllamaService.waitUntilReady`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/runtimes/software-ollama.service.ts:80` |
| `SoftwareService.installWithHomebrew` | 6 | `SoftwarePythonService.installPython`, `SoftwareOllamaService.installOllama`, `SoftwareDockerService.installDocker`, `SoftwareGpgService.installGpgSigning`, `SoftwareInfraService.installInfrastructureTools`, `SoftwareDatabaseService.installDatabaseTools` | `installation/src/modules/software/software.service.ts:49` |
| `SetupService.setUpMac` | 6 | `ShellConfigurationService.configureShell`, `SoftwareService.installSoftware`, `EnvironmentFilesService.createEnvironmentFiles`, `RemoteCacheService.setUpRemoteCache`, `DependenciesService.installDependencies`, `SetupService.printCompletion` | `installation/src/modules/setup/setup.service.ts:82` |
| `DependenciesService.writeKubeconfig` | 5 | `ReporterService.print`, `DependenciesService.readEnvironmentFile`, `DependenciesService.importCluster`, `DependenciesService.toClusterId`, `DependenciesService.readKubeconfig` | `installation/src/modules/dependencies/dependencies.service.ts:156` |
| `UpgradePythonService.upgrade` | 5 | `UpgradePythonService.newest`, `currentVersion`, `withRequiredVersion`, `withToolVersions`, `ProcessRunnerService.captureSequence` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-python/upgrade-python.service.ts:74` |
| `RemoteCacheService.createKey` | 5 | `ProcessRunnerService.run`, `RemoteCacheService.keyLabel`, `ReporterService.print`, `keyFailedMessage`, `RemoteCacheService.parse` | `installation/src/modules/setup/modules/remote-cache/remote-cache.service.ts:53` |
| `SharedNxCacheStorageService.evict` | 5 | `SharedNxCacheStorageService.measure`, `SharedNxCacheStorageService.toSorted(…)`, `SharedNxCacheStorageService.filter(…)`, `SharedNxCacheStorageService.reduce(…)`, `SharedNxCacheStorageService.map(…)` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:121` |
| `SharedNxCacheStorageService.write` | 5 | `SharedNxCacheStorageService.prepare`, `SharedNxCacheStorageService.on(…)`, `SharedNxCacheStorageService.entryPath`, `SharedNxCacheStorageService.explainFailure`, `SharedNxCacheStorageService.discard` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:194` |
| `SharedNxCacheServerService.get` | 5 | `SharedNxCacheStorageService.exists`, `SharedNxCacheServerService.pull`, `SharedNxCacheServerService.reply`, `SharedNxCacheStorageService.touch`, `SharedNxCacheStorageService.read` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:82` |
| `SoftwarePythonService.installUv` | 5 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwarePythonService.readUvVersion`, `SoftwareBrewService.listOutdated` | `installation/src/modules/software/modules/runtimes/software-python.service.ts:47` |
| `SoftwareDatabaseService.installPostgresClient` | 5 | `ProcessRunnerService.platform`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.locate`, `SoftwareDatabaseService.isRoot`, `SoftwareDatabaseService.installPostgresWithApt` | `installation/src/modules/software/modules/tooling/software-database.service.ts:104` |
| `SoftwareDockerService.startDaemon` | 5 | `ReporterService.print`, `ProcessRunnerService.runOrThrow`, `SoftwareDockerService.isRunning`, `ProcessRunnerService.sleep`, `SoftwareDockerService.readVersion` | `installation/src/modules/software/modules/runtimes/software-docker.service.ts:48` |
| `SoftwareGpgService.installGpgSigning` | 5 | `SoftwareGpgService.installGpg`, `SoftwareGpgService.configureAgent`, `ReporterService.print`, `SoftwareGpgService.findSigningKeyId`, `SoftwareGpgService.configureSigning` | `installation/src/modules/software/modules/tooling/software-gpg.service.ts:150` |
| `SoftwareInfraService.buildVersionLines` | 5 | `SoftwareInfraService.read`, `SoftwareInfraService.readMerged`, `SoftwareInfraService.readTerraformVersion`, `SoftwareInfraService.readTrivyVersion`, `SoftwareInfraService.readKubectlVersion` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:34` |
| `SoftwareNamedService.validate` | 5 | `SoftwareNamedService.filter(…)`, `unknownNamesMessage`, `ProcessRunnerService.platform`, `SoftwareNamedService.find(…)`, `archiveToolOnMacMessage` | `installation/src/modules/software/modules/tooling/software-named.service.ts:80` |
| `DependenciesService.installDependencies` | 4 | `ReporterService.print`, `ProcessRunnerService.runOrThrow`, `DependenciesService.resetNxCache`, `DependenciesService.writeKubeconfig` | `installation/src/modules/dependencies/dependencies.service.ts:189` |
| `InstalledSkillsCommand.write` | 4 | `InstalledSkillsCommand.isSet`, `InstalledSkillsService.findMissingSkills`, `InstalledSkillsCommand.announceRestoration`, `InstalledSkillsService.restoreSkills` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:126` |
| `UpgradeNodeService.upgrade` | 4 | `UpgradeNodeService.fetchReleases`, `UpgradeNodeService.toSorted(…)`, `UpgradeNodeService.filter(…)`, `PackageManifestService.replace` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-node/upgrade-node.service.ts:55` |
| `UpgradeDependenciesService.work` | 4 | `ProcessRunnerService.captureSequence`, `UpgradeNodeService.upgrade`, `UpgradePnpmService.upgrade`, `UpgradePythonService.upgrade` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:148` |
| `UpgradeDependenciesCommand.run` | 4 | `UpgradeDependenciesService.attempt`, `UpgradeDependenciesCommand.conclude`, `UpgradeDependenciesService.finish`, `UpgradeDependenciesCommand.some(…)` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.command.ts:79` |
| `EnvironmentFilesService.createEnvironmentFiles` | 4 | `ReporterService.print`, `EnvironmentFilesService.findTargets`, `EnvironmentFilesService.createEnvironmentFile`, `EnvironmentFilesService.addWorkspaceVariable` | `installation/src/modules/environment-files/environment-files.service.ts:113` |
| `LocalServicesService.ensureDaemon` | 4 | `LocalServicesService.isDaemonRunning`, `ReporterService.print`, `ProcessRunnerService.locate`, `LocalServicesService.startDaemon` | `installation/src/modules/local-services/local-services.service.ts:43` |
| `LocalServicesService.startDaemon` | 4 | `ReporterService.print`, `ProcessRunnerService.startDetached`, `LocalServicesService.isDaemonRunning`, `ProcessRunnerService.sleep` | `installation/src/modules/local-services/local-services.service.ts:82` |
| `SessionWorktreeNameService.findViolations` | 4 | `SessionWorktreeNameService.findLinkedWorktree`, `describeInvalidName`, `SessionWorktreeNameService.isIgnored`, `describeUnignoredWorktree` | `installation/src/modules/session-worktree-name/session-worktree-name.service.ts:91` |
| `SharedNxCacheServerService.handle` | 4 | `SharedNxCacheServerService.validate`, `SharedNxCacheServerService.put`, `SharedNxCacheServerService.get`, `SharedNxCacheServerService.reply` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:100` |
| `SharedNxCacheServerService.put` | 4 | `SharedNxCacheServerService.reply`, `SharedNxCacheStorageService.exists`, `SharedNxCacheStorageService.write`, `SharedNxCacheServerService.settle` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:134` |
| `SharedNxCacheServerService.settle` | 4 | `SharedNxCacheRemoteService.writable`, `SharedNxCacheRemoteService.store`, `SharedNxCacheStorageService.read`, `SharedNxCacheServerService.reply` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:173` |
| `ReleaseArchivesService.fetch` | 4 | `ReleaseArchivesService.download`, `ReleaseArchivesService.resolveTemplate`, `ReleaseArchivesService.verify`, `ReleaseArchivesService.unpack` | `installation/src/modules/release-archives/release-archives.service.ts:46` |
| `SoftwareBrewService.installOrCheck` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareBrewService.listOutdated` | `installation/src/modules/software/modules/platform/software-brew.service.ts:35` |
| `SoftwarePythonService.installPythonThroughUv` | 4 | `ReporterService.print`, `SoftwarePythonService.hasSupportedPython`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/runtimes/software-python.service.ts:88` |
| `SoftwareDatabaseService.installPostgres` | 4 | `ReporterService.print`, `SoftwareDatabaseService.hasPostgres18`, `SoftwareDatabaseService.installPostgresClient`, `SoftwareDatabaseService.readVersion` | `installation/src/modules/software/modules/tooling/software-database.service.ts:186` |
| `SoftwareDatabaseService.installSquawk` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareDatabaseService.readVersion` | `installation/src/modules/software/modules/tooling/software-database.service.ts:208` |
| `SoftwareOllamaService.start` | 4 | `ReporterService.print`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.startDetached` | `installation/src/modules/software/modules/runtimes/software-ollama.service.ts:50` |
| `SoftwareGpgService.installGpg` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.run` | `installation/src/modules/software/modules/tooling/software-gpg.service.ts:123` |
| `SoftwareService.installSoftware` | 4 | `ProcessRunnerService.platform`, `SoftwareService.installWithHomebrew`, `SoftwareLinuxService.installLinuxTools`, `SshSigningService.configureSshSigning` | `installation/src/modules/software/software.service.ts:61` |
| `SetupService.setUpLinux` | 4 | `EnvironmentFilesService.createEnvironmentFiles`, `SoftwareService.installSoftware`, `LocalServicesService.startLocalServices`, `ReporterService.print` | `installation/src/modules/setup/setup.service.ts:73` |
| `DependenciesService.importCluster` | 3 | `ProcessRunnerService.run`, `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:55` |
| `InstalledSkillsService.findCleanSkillFolders` | 3 | `InstalledSkillsService.filter(…)`, `InstalledSkillsService.map(…)`, `InstalledSkillsService.readLockedSkillNames` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:48` |
| `InstalledSkillsCommand.check` | 3 | `InstalledSkillsService.findMissingSkills`, `InstalledSkillsCommand.print`, `InstalledSkillsCommand.isCloudAgent` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:67` |
| `UpdateReuiSkillService.fetchBundle` | 3 | `UpdateReuiSkillService.map(…)`, `UpdateReuiSkillService.find(…)`, `UpdateReuiSkillService.some(…)` | `installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:53` |
| `UpgradeDependenciesService.undo` | 3 | `ProcessRunnerService.capture`, `ProcessRunnerService.captureSequence`, `UpgradeDependenciesService.tail` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:121` |
| `LocalServicesService.startLocalServices` | 3 | `LocalServicesService.ensureDaemon`, `ReporterService.print`, `ProcessRunnerService.run` | `installation/src/modules/local-services/local-services.service.ts:110` |
| `SharedNxCacheRemoteService.store` | 3 | `SharedNxCacheRemoteService.target`, `SharedNxCacheRemoteService.writable`, `SharedNxCacheRemoteService.send` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:120` |
| `SharedNxCacheStorageService.exists` | 3 | `SharedNxCacheStorageService.catch(…)`, `SharedNxCacheStorageService.then(…)`, `SharedNxCacheStorageService.entryPath` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:169` |
| `SharedNxCacheServerService.start` | 3 | `SharedNxCacheServerService.createServer(…)`, `SharedNxCacheServerService.anonymous`, `SharedNxCacheServerService.evict` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:215` |
| `SharedNxCacheCommand.run` | 3 | `SharedNxCacheServerService.start`, `ReporterService.print`, `SharedNxCacheCommand.anonymous` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache.command.ts:76` |
| `ShellConfigurationService.appendCompletions` | 3 | `ShellConfigurationService.readStartupFile`, `ShellConfigurationService.map(…)`, `ShellConfigurationService.filter(…)` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:58` |
| `ShellConfigurationService.configureShell` | 3 | `ReporterService.print`, `ShellConfigurationService.configureStartupFile`, `ShellConfigurationService.printManualInstructions` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:164` |
| `ReleaseArchivesService.verify` | 3 | `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.resolveTemplate`, `ReleaseArchivesService.findPublishedChecksum` | `installation/src/modules/release-archives/release-archives.service.ts:133` |
| `SshSigningService.installSshKeygen` | 3 | `ProcessRunnerService.locate`, `ReporterService.print`, `ProcessRunnerService.run` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:46` |
| `SoftwareDatabaseService.installPostgresWithApt` | 3 | `SoftwareDatabaseService.addAptRepository`, `SoftwareDatabaseService.asRoot`, `SoftwareDatabaseService.linkPostgresTools` | `installation/src/modules/software/modules/tooling/software-database.service.ts:130` |
| `SoftwareOllamaService.waitUntilReady` | 3 | `ReporterService.print`, `SoftwareOllamaService.isRunning`, `ProcessRunnerService.sleep` | `installation/src/modules/software/modules/runtimes/software-ollama.service.ts:65` |
| `SoftwareGpgService.configureSigning` | 3 | `ReporterService.print`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/tooling/software-gpg.service.ts:68` |
| `SoftwareInfraService.installInfrastructureTools` | 3 | `SoftwareBrewService.installOrCheck`, `ReporterService.print`, `SoftwareInfraService.buildVersionLines` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:107` |
| `SoftwareNamedService.installArchiveTool` | 3 | `SoftwareNamedService.find(…)`, `unknownNamesMessage`, `ReleaseArchivesService.install` | `installation/src/modules/software/modules/tooling/software-named.service.ts:54` |
| `SoftwareNamedService.install` | 3 | `SoftwareNamedService.validate`, `SoftwareNamedService.installPostgresClient`, `SoftwareNamedService.installArchiveTool` | `installation/src/modules/software/modules/tooling/software-named.service.ts:100` |
| `SetupService.setUp` | 3 | `ProcessRunnerService.platform`, `SetupService.setUpMac`, `SetupService.setUpLinux` | `installation/src/modules/setup/setup.service.ts:99` |
| `VscodeSettingsCommand.synchronize` | 3 | `VscodeSettingsCommand.readMachineSettings`, `VscodeSettingsCommand.findDrift`, `VscodeSettingsCommand.write` | `installation/src/modules/shell-configuration/modules/vscode-settings/vscode-settings.command.ts:109` |
| `DependenciesService.resetNxCache` | 2 | `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:134` |
| `InstalledSkillsService.revertTrackedChanges` | 2 | `InstalledSkillsService.hasChanges`, `InstalledSkillsService.git` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:85` |
| `InstalledSkillsService.findMissingSkills` | 2 | `InstalledSkillsService.filter(…)`, `InstalledSkillsService.readLockedSkillNames` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:159` |
| `InstalledSkillsCommand.synchronize` | 2 | `InstalledSkillsCommand.write`, `InstalledSkillsCommand.check` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:184` |
| `UpdateReuiSkillService.hashFiles` | 2 | `UpdateReuiSkillService.toSorted(…)`, `UpdateReuiSkillService.from(…)` | `installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:93` |
| `UpdateReuiSkillService.readInstalledFiles` | 2 | `UpdateReuiSkillService.map(…)`, `UpdateReuiSkillService.filter(…)` | `installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:118` |
| `UpdateReuiSkillService.update` | 2 | `UpdateReuiSkillService.refresh`, `ReporterService.print` | `installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.service.ts:187` |
| `UpgradePnpmService.upgrade` | 2 | `ProcessRunnerService.capture`, `PackageManifestService.replace` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-pnpm/upgrade-pnpm.service.ts:35` |
| `warningsOf` | 2 | `filter(…)`, `map(…)` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:83` |
| `skippedBullet` | 2 | `code`, `reasonOf` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:126` |
| `UpgradeDependenciesService.finish` | 2 | `UpgradeDependenciesService.git`, `renderPullRequestBody` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:221` |
| `EnvironmentFilesService.findTargets` | 2 | `ProcessRunnerService.run`, `EnvironmentFilesService.map(…)` | `installation/src/modules/environment-files/environment-files.service.ts:88` |
| `SessionBranchNameService.judgeCurrentBranch` | 2 | `SessionBranchNameService.readCurrentBranch`, `SessionBranchNameService.readBranchNameRules` | `installation/src/modules/session-branch-name/session-branch-name.service.ts:50` |
| `SharedNxCacheRemoteService.fetch` | 2 | `SharedNxCacheRemoteService.target`, `SharedNxCacheRemoteService.send` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:93` |
| `SharedNxCacheStorageService.touch` | 2 | `SharedNxCacheStorageService.catch(…)`, `SharedNxCacheStorageService.entryPath` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:182` |
| `SharedNxCacheServerService.authorized` | 2 | `SharedNxCacheServerService.digest`, `SharedNxCacheServerService.expectedToken` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:54` |
| `SharedNxCacheServerService.pull` | 2 | `SharedNxCacheRemoteService.fetch`, `SharedNxCacheStorageService.write` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:116` |
| `SharedNxCacheServerService.validate` | 2 | `SharedNxCacheServerService.reply`, `SharedNxCacheServerService.authorized` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:194` |
| `SharedNxCacheServerService.evict` | 2 | `SharedNxCacheServerService.catch(…)`, `SharedNxCacheStorageService.evict` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:217` |
| `SharedNxCacheServerService.createServer(…)` | 2 | `SharedNxCacheServerService.catch(…)`, `SharedNxCacheServerService.handle` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:222` |
| `ShellConfigurationService.appendTerraformCompletion` | 2 | `ProcessRunnerService.locate`, `ShellConfigurationService.appendBlock` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:75` |
| `ShellConfigurationService.printManualInstructions` | 2 | `ShellConfigurationService.findNvmPrefix`, `ReporterService.print` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:125` |
| `ReleaseArchivesService.place` | 2 | `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.resolveTemplate` | `installation/src/modules/release-archives/release-archives.service.ts:73` |
| `SshSigningService.readSignerKey` | 2 | `ProcessRunnerService.run`, `readSshPublicKey` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:90` |
| `SoftwarePythonService.hasSupportedPython` | 2 | `ProcessRunnerService.locate`, `ProcessRunnerService.run` | `installation/src/modules/software/modules/runtimes/software-python.service.ts:37` |
| `SoftwarePythonService.installPython` | 2 | `SoftwarePythonService.installUv`, `SoftwarePythonService.installPythonThroughUv` | `installation/src/modules/software/modules/runtimes/software-python.service.ts:79` |
| `SoftwareDatabaseService.addAptRepository` | 2 | `ProcessRunnerService.runOrThrow`, `SoftwareDatabaseService.asRoot` | `installation/src/modules/software/modules/tooling/software-database.service.ts:50` |
| `SoftwareDatabaseService.asRoot` | 2 | `SoftwareDatabaseService.isRoot`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/tooling/software-database.service.ts:85` |
| `SoftwareDatabaseService.hasPostgres18` | 2 | `ProcessRunnerService.locate`, `ProcessRunnerService.run` | `installation/src/modules/software/modules/tooling/software-database.service.ts:94` |
| `SoftwareDatabaseService.installDatabaseTools` | 2 | `SoftwareDatabaseService.installSquawk`, `SoftwareDatabaseService.installPostgres` | `installation/src/modules/software/modules/tooling/software-database.service.ts:180` |
| `SoftwareGpgService.configureAgent` | 2 | `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/tooling/software-gpg.service.ts:39` |
| `SoftwareGpgService.findSigningKeyId` | 2 | `ProcessRunnerService.run`, `SoftwareGpgService.find(…)` | `installation/src/modules/software/modules/tooling/software-gpg.service.ts:106` |
| `SoftwareNamedService.installPostgresClient` | 2 | `SoftwareDatabaseService.installPostgres`, `ProcessRunnerService.run` | `installation/src/modules/software/modules/tooling/software-named.service.ts:67` |
| `SoftwareCommand.run` | 2 | `SoftwareNamedService.install`, `SoftwareService.installSoftware` | `installation/src/modules/software/software.command.ts:43` |
| `SetupService.printCompletion` | 2 | `SetupService.find(…)`, `ReporterService.print` | `installation/src/modules/setup/setup.service.ts:49` |
| `run` | 2 | `answerGit`, `restore` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:65` |
| `ProcessRunnerService.captureSequence` | 1 | `ProcessRunnerService.capture` | `installation/src/modules/process-runner/process-runner.service.ts:61` |
| `ProcessRunnerService.runOrThrow` | 1 | `ProcessRunnerService.run` | `installation/src/modules/process-runner/process-runner.service.ts:134` |
| `ProcessRunnerService.sleep` | 1 | `ProcessRunnerService.anonymous` | `installation/src/modules/process-runner/process-runner.service.ts:151` |
| `ProcessRunnerService.startDetached` | 1 | `ProcessRunnerService.on(…)` | `installation/src/modules/process-runner/process-runner.service.ts:158` |
| `DependenciesService.readKubeconfig` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:108` |
| `DependenciesCommand.run` | 1 | `DependenciesService.installDependencies` | `installation/src/modules/dependencies/dependencies.command.ts:40` |
| `InstalledSkillsService.filter(…)` | 1 | `InstalledSkillsService.hasChanges` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:52` |
| `InstalledSkillsService.git` | 1 | `InstalledSkillsProcessService.run` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:59` |
| `InstalledSkillsService.hasChanges` | 1 | `InstalledSkillsService.git` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:64` |
| `InstalledSkillsService.runRestore` | 1 | `InstalledSkillsProcessService.run` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:110` |
| `InstalledSkillsService.verifyRestoration` | 1 | `InstalledSkillsService.findMissingSkills` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.service.ts:127` |
| `InstalledSkillsCommand.run` | 1 | `InstalledSkillsCommand.synchronize` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills.command.ts:166` |
| `UpdateReuiSkillCommand.run` | 1 | `UpdateReuiSkillService.update` | `installation/src/modules/dependencies/modules/installed-skills/modules/update-reui-skill/update-reui-skill.command.ts:40` |
| `PackageManifestService.replace` | 1 | `PackageManifestService.current` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/package-manifest/package-manifest.service.ts:44` |
| `UpgradeNodeService.fetchReleases` | 1 | `UpgradeNodeService.map(…)` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-node/upgrade-node.service.ts:37` |
| `withRequiredVersion` | 1 | `nextVersion` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-python/upgrade-python.utilities.ts:26` |
| `UpgradePythonService.newest` | 1 | `ProcessRunnerService.capture` | `installation/src/modules/dependencies/modules/upgrade-dependencies/modules/upgrade-python/upgrade-python.service.ts:45` |
| `map(…)` | 1 | `skippedBullet` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:35` |
| `map(…)` | 1 | `detailBullet` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:38` |
| `map(…)` | 1 | `quoteSkipped` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:62` |
| `flatMap(…)` | 1 | `map(…)` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:71` |
| `map(…)` | 1 | `code` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.utilities.ts:73` |
| `UpgradeDependenciesService.upgrade` | 1 | `UpdateReuiSkillService.update` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:68` |
| `UpgradeDependenciesService.git` | 1 | `ProcessRunnerService.capture` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:87` |
| `UpgradeDependenciesService.snapshot` | 1 | `UpgradeDependenciesService.git` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.service.ts:92` |
| `UpgradeDependenciesCommand.conclude` | 1 | `skippedAnnotation` | `installation/src/modules/dependencies/modules/upgrade-dependencies/upgrade-dependencies.command.ts:51` |
| `EnvironmentFilesService.addWorkspaceVariable` | 1 | `ReporterService.print` | `installation/src/modules/environment-files/environment-files.service.ts:49` |
| `EnvironmentFilesService.createEnvironmentFile` | 1 | `ReporterService.print` | `installation/src/modules/environment-files/environment-files.service.ts:67` |
| `EnvironmentFilesCommand.run` | 1 | `EnvironmentFilesService.createEnvironmentFiles` | `installation/src/modules/environment-files/environment-files.command.ts:39` |
| `LocalServicesService.isDaemonRunning` | 1 | `ProcessRunnerService.run` | `installation/src/modules/local-services/local-services.service.ts:75` |
| `LocalServicesCommand.run` | 1 | `LocalServicesService.startLocalServices` | `installation/src/modules/local-services/local-services.command.ts:40` |
| `SessionBranchNameService.readCurrentBranch` | 1 | `SessionBranchNameGitService.run` | `installation/src/modules/session-branch-name/session-branch-name.service.ts:41` |
| `SessionBranchNameCommand.run` | 1 | `SessionBranchNameService.judgeCurrentBranch` | `installation/src/modules/session-branch-name/session-branch-name.command.ts:46` |
| `SessionWorktreeNameService.findLinkedWorktree` | 1 | `SessionWorktreeNameService.readGit` | `installation/src/modules/session-worktree-name/session-worktree-name.service.ts:41` |
| `SessionWorktreeNameService.isIgnored` | 1 | `SessionWorktreeNameGitService.run` | `installation/src/modules/session-worktree-name/session-worktree-name.service.ts:66` |
| `SessionWorktreeNameService.readGit` | 1 | `SessionWorktreeNameGitService.run` | `installation/src/modules/session-worktree-name/session-worktree-name.service.ts:79` |
| `SessionWorktreeNameCommand.run` | 1 | `SessionWorktreeNameService.findViolations` | `installation/src/modules/session-worktree-name/session-worktree-name.command.ts:45` |
| `RemoteCacheCommand.run` | 1 | `RemoteCacheService.setUpRemoteCache` | `installation/src/modules/setup/modules/remote-cache/remote-cache.command.ts:40` |
| `SharedNxCacheRemoteService.enabled` | 1 | `SharedNxCacheRemoteService.target` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:88` |
| `SharedNxCacheRemoteService.writable` | 1 | `SharedNxCacheRemoteService.enabled` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:153` |
| `SharedNxCacheStorageService.discard` | 1 | `SharedNxCacheStorageService.anonymous` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:45` |
| `SharedNxCacheStorageService.measure` | 1 | `SharedNxCacheStorageService.catch(…)` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:75` |
| `SharedNxCacheStorageService.read` | 1 | `SharedNxCacheStorageService.entryPath` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:177` |
| `SharedNxCacheServerService.catch(…)` | 1 | `SharedNxCacheServerService.reply` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:223` |
| `SharedNxCacheServerService.close` | 1 | `SharedNxCacheServerService.anonymous` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:242` |
| `SharedNxCacheServerService.anonymous` | 1 | `SharedNxCacheServerService.close(…)` | `installation/src/modules/setup/modules/shared-nx-cache/shared-nx-cache-server.service.ts:244` |
| `ShellConfigurationService.appendBlock` | 1 | `ShellConfigurationService.readStartupFile` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:49` |
| `ShellConfigurationService.filter(…)` | 1 | `ProcessRunnerService.locate` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:65` |
| `ShellConfigurationService.findNvmPrefix` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:118` |
| `ShellConfigurationService.removeProcessesBlock` | 1 | `ShellConfigurationService.readStartupFile` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:149` |
| `ShellConfigurationCommand.run` | 1 | `ShellConfigurationService.configureShell` | `installation/src/modules/shell-configuration/shell-configuration.command.ts:40` |
| `ReleaseArchivesService.download` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/release-archives/release-archives.service.ts:41` |
| `ReleaseArchivesService.resolveArchitecture` | 1 | `ProcessRunnerService.platform` | `installation/src/modules/release-archives/release-archives.service.ts:91` |
| `ReleaseArchivesService.unpack` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/release-archives/release-archives.service.ts:118` |
| `readSshPublicKey` | 1 | `readString` | `installation/src/modules/ssh-signing/ssh-signing.utilities.ts:21` |
| `SshSigningService.readGitSetting` | 1 | `ProcessRunnerService.run` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:81` |
| `SshSigningService.writeAllowedSigners` | 1 | `formatAllowedSigner` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:111` |
| `SoftwareBrewService.listOutdated` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/platform/software-brew.service.ts:56` |
| `SoftwarePythonService.readUvVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/runtimes/software-python.service.ts:70` |
| `SoftwareDatabaseService.linkPostgresTools` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/tooling/software-database.service.ts:154` |
| `SoftwareDatabaseService.readVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/tooling/software-database.service.ts:169` |
| `SoftwareLinuxService.attempt` | 1 | `ReporterService.print` | `installation/src/modules/software/modules/platform/software-linux.service.ts:41` |
| `SoftwareLinuxService.attempt(…)` | 1 | `ReleaseArchivesService.install` | `installation/src/modules/software/modules/platform/software-linux.service.ts:56` |
| `SoftwareLinuxService.attempt(…)` | 1 | `SoftwarePythonService.installPythonThroughUv` | `installation/src/modules/software/modules/platform/software-linux.service.ts:61` |
| `SoftwareLinuxService.attempt(…)` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/platform/software-linux.service.ts:64` |
| `SoftwareLinuxService.attempt(…)` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/modules/platform/software-linux.service.ts:71` |
| `SoftwareLinuxService.attempt(…)` | 1 | `SoftwareDatabaseService.installSquawk` | `installation/src/modules/software/modules/platform/software-linux.service.ts:74` |
| `SoftwareLinuxService.attempt(…)` | 1 | `SoftwareDatabaseService.installPostgres` | `installation/src/modules/software/modules/platform/software-linux.service.ts:77` |
| `SoftwareDockerService.isRunning` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/runtimes/software-docker.service.ts:34` |
| `SoftwareDockerService.readVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/runtimes/software-docker.service.ts:41` |
| `SoftwareOllamaService.isRunning` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/runtimes/software-ollama.service.ts:41` |
| `SoftwareInfraService.read` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:52` |
| `SoftwareInfraService.readKubectlVersion` | 1 | `SoftwareInfraService.read` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:59` |
| `SoftwareInfraService.readMerged` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:67` |
| `SoftwareInfraService.readTerraformVersion` | 1 | `SoftwareInfraService.read` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:74` |
| `SoftwareInfraService.readTrivyVersion` | 1 | `SoftwareInfraService.readMerged` | `installation/src/modules/software/modules/tooling/software-infra.service.ts:96` |
| `SetupCommand.run` | 1 | `SetupService.setUp` | `installation/src/modules/setup/setup.command.ts:40` |
| `VscodeSettingsCommand.run` | 1 | `VscodeSettingsCommand.synchronize` | `installation/src/modules/shell-configuration/modules/vscode-settings/vscode-settings.command.ts:87` |
| `restore` | 1 | `installSkill` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:21` |
| `isDirty` | 1 | `isLockfileDirty` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:42` |
| `answerGit` | 1 | `isDirty` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:56` |
| `lockSkills` | 1 | `map(…)` | `installation/src/modules/dependencies/modules/installed-skills/installed-skills-fixtures.utilities.ts:86` |

</details>
<!-- callidescope:end -->
