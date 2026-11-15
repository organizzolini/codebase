<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `installation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 240 |
| Files | 83 |
| Calls traced | 474 |
| Call stacks | 10 |
| Deepest stack | 13 |
| Stacks through recursion | 0 |
| Unfollowable calls | 13 |

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
  └─> SetupService.setUp(): Promise<void> [installation/src/modules/setup/setup.service.ts:107]
     ↳ Runs the steps for this operating system, stopping at the first that fails.
    └─> SetupService.setUpMac(): Promise<void> [installation/src/modules/setup/setup.service.ts:90]
       ↳ Sets up a developer's Mac.
      └─> SoftwareService.installSoftware(): Promise<void> [installation/src/modules/software/software.service.ts:69]
         ↳ Installs what this operating system gets, then makes SSH signatures verifiable.
        └─> SoftwareService.installWithHomebrew(): Promise<void> [installation/src/modules/software/software.service.ts:57]
           ↳ Installs what a Mac with Homebrew gets, in order.
          └─> SoftwareDatabaseService.installDatabaseTools(): void [installation/src/modules/software/software-database.service.ts:182]
             ↳ Installs squawk and the PostgreSQL 18 tools.
            └─> SoftwareDatabaseService.installPostgres(): void [installation/src/modules/software/software-database.service.ts:188]
               ↳ Installs PostgreSQL 18 unless its tools are already present.
              └─> SoftwareDatabaseService.installPostgresClient(): void [installation/src/modules/software/software-database.service.ts:105]
                 ↳ Installs PostgreSQL 18 on this machine, however its package manager does.
                └─> SoftwareDatabaseService.installPostgresWithApt(): void [installation/src/modules/software/software-database.service.ts:131]
                   ↳ Installs PostgreSQL 18 from the PostgreSQL apt repository, as root or through `sudo`.
                  └─> SoftwareDatabaseService.addAptRepository(codename: string): void [installation/src/modules/software/software-database.service.ts:51]
                     ↳ Adds the PostgreSQL apt source and its signing key.
                    └─> SoftwareDatabaseService.asRoot(command: string, args: string[]): void [installation/src/modules/software/software-database.service.ts:86]
                       ↳ Runs a command as root: directly when this process is root, else through `sudo`.
                      └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:97]
                         ↳ Runs a command and throws when it does not exit 0.
                        └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
                           ↳ Runs a command to completion.
```

**2. `SoftwareCommand.run`** — depth ≥ 11 · decorated-method

```text
🚀 SoftwareCommand.run(names?: readonly string[]): Promise<void> [installation/src/modules/software/software.command.ts:50]
   ↳ Installs the named software, or all of it when none is named.
  └─> SoftwareService.installSoftware(): Promise<void> [installation/src/modules/software/software.service.ts:69]
     ↳ Installs what this operating system gets, then makes SSH signatures verifiable.
    └─> SoftwareService.installWithHomebrew(): Promise<void> [installation/src/modules/software/software.service.ts:57]
       ↳ Installs what a Mac with Homebrew gets, in order.
      └─> SoftwareDatabaseService.installDatabaseTools(): void [installation/src/modules/software/software-database.service.ts:182]
         ↳ Installs squawk and the PostgreSQL 18 tools.
        └─> SoftwareDatabaseService.installPostgres(): void [installation/src/modules/software/software-database.service.ts:188]
           ↳ Installs PostgreSQL 18 unless its tools are already present.
          └─> SoftwareDatabaseService.installPostgresClient(): void [installation/src/modules/software/software-database.service.ts:105]
             ↳ Installs PostgreSQL 18 on this machine, however its package manager does.
            └─> SoftwareDatabaseService.installPostgresWithApt(): void [installation/src/modules/software/software-database.service.ts:131]
               ↳ Installs PostgreSQL 18 from the PostgreSQL apt repository, as root or through `sudo`.
              └─> SoftwareDatabaseService.addAptRepository(codename: string): void [installation/src/modules/software/software-database.service.ts:51]
                 ↳ Adds the PostgreSQL apt source and its signing key.
                └─> SoftwareDatabaseService.asRoot(command: string, args: string[]): void [installation/src/modules/software/software-database.service.ts:86]
                   ↳ Runs a command as root: directly when this process is root, else through `sudo`.
                  └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:97]
                     ↳ Runs a command and throws when it does not exit 0.
                    └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
                       ↳ Runs a command to completion.
```

**3. `SharedNxCacheCommand.run`** — depth ≥ 10 · decorated-method

```text
🚀 SharedNxCacheCommand.run(_parameters: string[], options?: Partial<ServerOptions>): Promise<void> [installation/src/modules/shared-nx-cache/shared-nx-cache.command.ts:77]
   ↳ Serves until SIGINT or SIGTERM, then closes the server.
  └─> SharedNxCacheServerService.start(options: ServerOptions): Promise<RunningServer> [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:221]
     ↳ Listens on 127.0.0.1, evicts now, and evicts hourly until `close` is called.
    └─> SharedNxCacheServerService.createServer(…)(…): void [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:228]
      └─> SharedNxCacheServerService.handle(exchange: Exchange): Promise<void> [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:106]
         ↳ Routes one request.
        └─> SharedNxCacheServerService.put(exchange: Exchange, hash: string): Promise<void> [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:140]
           ↳ Stores the body of a `PUT`.
          └─> SharedNxCacheServerService.settle(exchange: Exchange, hash: string, outcome: WriteOutcome): Promise<void> [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:179]
             ↳ Copies a stored upload to a writable bucket, then answers for its outcome.
            └─> SharedNxCacheRemoteService.store(hash: string, body: Readable): Promise<void> [installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:124]
               ↳ Uploads `body` under `hash` unless read-only or already there; failures are logged, not thrown.
              └─> SharedNxCacheRemoteService.writable(): boolean [installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:157]
                 ↳ Whether uploads are switched on, and a bucket is there to take them.
                └─> SharedNxCacheRemoteService.enabled(): boolean [installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:92]
                   ↳ Whether a bucket is configured.
                  └─> SharedNxCacheRemoteService.target(hash: string): undefined | { client: AwsClient; url: string; } [installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:65]
                     ↳ A signing client and the url of the object for `hash`, or undefined without a bucket.
```

<details>
<summary>7 more call stacks</summary>

**4. `DependenciesCommand.run`** — depth 6 · decorated-method

```text
🚀 DependenciesCommand.run(): Promise<void> [installation/src/modules/dependencies/dependencies.command.ts:40]
   ↳ Installs the dependencies.
  └─> DependenciesService.installDependencies(): void [installation/src/modules/dependencies/dependencies.service.ts:193]
     ↳ Installs every dependency and initializes Terraform and kubeconfig.
    └─> DependenciesService.writeKubeconfig(workspaceRoot: string): void [installation/src/modules/dependencies/dependencies.service.ts:160]
       ↳ Writes `~/.kube/config` from the cluster Terraform manages, when there is none.
      └─> DependenciesService.importCluster(…): void [installation/src/modules/dependencies/dependencies.service.ts:55]
         ↳ Imports the cluster into Terraform's state when it does not track it yet.
        └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:97]
           ↳ Runs a command and throws when it does not exit 0.
          └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
             ↳ Runs a command to completion.
```

**5. `LocalServicesCommand.run`** — depth 6 · decorated-method

```text
🚀 LocalServicesCommand.run(): Promise<void> [installation/src/modules/local-services/local-services.command.ts:40]
   ↳ Starts the local services.
  └─> LocalServicesService.startLocalServices(): Promise<void> [installation/src/modules/local-services/local-services.service.ts:114]
     ↳ Starts the Docker daemon when needed, then the Postgres container.
    └─> LocalServicesService.ensureDaemon(): Promise<boolean> [installation/src/modules/local-services/local-services.service.ts:47]
       ↳ Makes sure a daemon answers, starting one when this machine can.
      └─> LocalServicesService.startDaemon(): Promise<boolean> [installation/src/modules/local-services/local-services.service.ts:86]
         ↳ Starts a daemon of its own, detached, and waits for it to answer.
        └─> ProcessRunnerService.startDetached(command: string, args: string[]): void [installation/src/modules/process-runner/process-runner.service.ts:121]
           ↳ Starts a command that keeps running after this process, and does not wait for it.
          └─> ProcessRunnerService.on(…)(): void [installation/src/modules/process-runner/process-runner.service.ts:124]
```

**6. `ShellConfigurationCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 ShellConfigurationCommand.run(): Promise<void> [installation/src/modules/shell-configuration/shell-configuration.command.ts:40]
   ↳ Configures the shell.
  └─> ShellConfigurationService.configureShell(): void [installation/src/modules/shell-configuration/shell-configuration.service.ts:165]
     ↳ Configures the startup files of the shell this process was started from.
    └─> ShellConfigurationService.configureStartupFile(file: string): void [installation/src/modules/shell-configuration/shell-configuration.service.ts:99]
       ↳ Configures one startup file.
      └─> ShellConfigurationService.findNvmPrefix(): string [installation/src/modules/shell-configuration/shell-configuration.service.ts:118]
         ↳ Where Homebrew put nvm, which its startup script is sourced from.
        └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:97]
           ↳ Runs a command and throws when it does not exit 0.
          └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
             ↳ Runs a command to completion.
```

**7. `UpdateReuiSkillCommand.run`** — depth 5 · decorated-method

```text
🚀 UpdateReuiSkillCommand.run(): Promise<void> [installation/src/modules/update-reui-skill/update-reui-skill.command.ts:40]
   ↳ Refreshes the skill.
  └─> UpdateReuiSkillService.update(): Promise<void> [installation/src/modules/update-reui-skill/update-reui-skill.service.ts:193]
     ↳ Refreshes the skill, printing the retry command instead of failing.
    └─> UpdateReuiSkillService.refresh(root: string): Promise<void> [installation/src/modules/update-reui-skill/update-reui-skill.service.ts:158]
       ↳ Fetches, compares, and writes only when the pin or the folder differs.
      └─> UpdateReuiSkillService.fetchBundle(skillDirectory: string): Promise<SkillBundle> [installation/src/modules/update-reui-skill/update-reui-skill.service.ts:59]
         ↳ Fetches the bundle and refuses one that is empty, unsafe, or without `SKILL.md`.
        └─> UpdateReuiSkillService.map(…)(…): { content: Buffer<ArrayBuffer>; path: string; } [installation/src/modules/update-reui-skill/update-reui-skill.service.ts:77]
```

**8. `EnvironmentFilesCommand.run`** — depth 4 · decorated-method

```text
🚀 EnvironmentFilesCommand.run(): Promise<void> [installation/src/modules/environment-files/environment-files.command.ts:39]
   ↳ Creates the environment files.
  └─> EnvironmentFilesService.createEnvironmentFiles(): void [installation/src/modules/environment-files/environment-files.service.ts:113]
     ↳ Bootstraps every project's `.env` from its `.env.default`.
    └─> EnvironmentFilesService.findTargets(): EnvironmentFileTarget[] [installation/src/modules/environment-files/environment-files.service.ts:88]
       ↳ Lists every directory Git knows holds a `.env.default`, sorted and unique.
      └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
         ↳ Runs a command to completion.
```

**9. `RemoteCacheCommand.run`** — depth 4 · decorated-method

```text
🚀 RemoteCacheCommand.run(): Promise<void> [installation/src/modules/remote-cache/remote-cache.command.ts:40]
   ↳ Sets up the remote cache key.
  └─> RemoteCacheService.setUpRemoteCache(): void [installation/src/modules/remote-cache/remote-cache.service.ts:145]
     ↳ Creates the read-only key and its file, unless this machine has them or cannot make them.
    └─> RemoteCacheService.createKey(): undefined | { access_key: string; secret_key: string; } [installation/src/modules/remote-cache/remote-cache.service.ts:56]
       ↳ Asks `linode-cli` for a key that can only read the bucket; says why when it cannot.
      └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
         ↳ Runs a command to completion.
```

**10. `SharedNxCacheServerService.close`** — depth ≥ 3 · orphan-root

```text
🚀 SharedNxCacheServerService.close(): Promise<void> [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:248]
  └─> SharedNxCacheServerService.anonymous(resolve: (value: void | PromiseLike<void>) => void): void [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:250]
    └─> SharedNxCacheServerService.close(…)(): void [installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:251]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ReleaseArchivesService.install` | 8 | `ReporterService.print`, `ProcessRunnerService.locate`, `ReleaseArchivesService.resolveArchitecture`, `ReleaseArchivesService.resolveTemplate`, `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.fetch`, `ReleaseArchivesService.place`, `ProcessRunnerService.run` | `installation/src/modules/release-archives/release-archives.service.ts:163` |
| `RemoteCacheService.setUpRemoteCache` | 7 | `RemoteCacheService.environmentFile`, `ReporterService.print`, `alreadyConfiguredMessage`, `ProcessRunnerService.locate`, `RemoteCacheService.createKey`, `RemoteCacheService.writeEnvironmentFile`, `keyCreatedMessage` | `installation/src/modules/remote-cache/remote-cache.service.ts:145` |
| `ShellConfigurationService.configureStartupFile` | 7 | `ReporterService.print`, `ShellConfigurationService.appendBlock`, `ShellConfigurationService.buildNvmBlock`, `ShellConfigurationService.findNvmPrefix`, `ShellConfigurationService.appendCompletions`, `ShellConfigurationService.appendTerraformCompletion`, `ShellConfigurationService.removeProcessesBlock` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:99` |

<details>
<summary>130 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `SoftwareLinuxService.installLinuxTools` | 7 | `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)` | `installation/src/modules/software/software-linux.service.ts:61` |
| `SshSigningService.configureSshSigning` | 6 | `SshSigningService.readGitSetting`, `ReporterService.print`, `SshSigningService.installSshKeygen`, `SshSigningService.readSignerKey`, `SshSigningService.writeAllowedSigners`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:139` |
| `SoftwareDockerService.installDocker` | 6 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareDockerService.isRunning`, `SoftwareDockerService.readVersion`, `SoftwareDockerService.startDaemon` | `installation/src/modules/software/software-docker.service.ts:77` |
| `SoftwareOllamaService.installOllama` | 6 | `SoftwareBrewService.installOrCheck`, `ReporterService.print`, `SoftwareOllamaService.isRunning`, `SoftwareOllamaService.start`, `SoftwareOllamaService.waitUntilReady`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-ollama.service.ts:81` |
| `SoftwareService.installWithHomebrew` | 6 | `SoftwarePythonService.installPython`, `SoftwareOllamaService.installOllama`, `SoftwareDockerService.installDocker`, `SoftwareGpgService.installGpgSigning`, `SoftwareInfraService.installInfrastructureTools`, `SoftwareDatabaseService.installDatabaseTools` | `installation/src/modules/software/software.service.ts:57` |
| `SetupService.setUpMac` | 6 | `ShellConfigurationService.configureShell`, `SoftwareService.installSoftware`, `EnvironmentFilesService.createEnvironmentFiles`, `RemoteCacheService.setUpRemoteCache`, `DependenciesService.installDependencies`, `SetupService.printCompletion` | `installation/src/modules/setup/setup.service.ts:90` |
| `UpdateReuiSkillService.refresh` | 6 | `UpdateReuiSkillService.fetchBundle`, `UpdateReuiSkillService.readLock`, `UpdateReuiSkillService.hashFiles`, `UpdateReuiSkillService.readInstalledFiles`, `ReporterService.print`, `UpdateReuiSkillService.install` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:158` |
| `DependenciesService.writeKubeconfig` | 5 | `ReporterService.print`, `DependenciesService.readEnvironmentFile`, `DependenciesService.importCluster`, `DependenciesService.toClusterId`, `DependenciesService.readKubeconfig` | `installation/src/modules/dependencies/dependencies.service.ts:160` |
| `RemoteCacheService.createKey` | 5 | `ProcessRunnerService.run`, `RemoteCacheService.keyLabel`, `ReporterService.print`, `keyFailedMessage`, `RemoteCacheService.parse` | `installation/src/modules/remote-cache/remote-cache.service.ts:56` |
| `SoftwareDatabaseService.installPostgresClient` | 5 | `ProcessRunnerService.platform`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.locate`, `SoftwareDatabaseService.isRoot`, `SoftwareDatabaseService.installPostgresWithApt` | `installation/src/modules/software/software-database.service.ts:105` |
| `SoftwareDockerService.startDaemon` | 5 | `ReporterService.print`, `ProcessRunnerService.runOrThrow`, `SoftwareDockerService.isRunning`, `ProcessRunnerService.sleep`, `SoftwareDockerService.readVersion` | `installation/src/modules/software/software-docker.service.ts:49` |
| `SoftwareGpgService.installGpgSigning` | 5 | `SoftwareGpgService.installGpg`, `SoftwareGpgService.configureAgent`, `ReporterService.print`, `SoftwareGpgService.findSigningKeyId`, `SoftwareGpgService.configureSigning` | `installation/src/modules/software/software-gpg.service.ts:151` |
| `SoftwareInfraService.buildVersionLines` | 5 | `SoftwareInfraService.read`, `SoftwareInfraService.readMerged`, `SoftwareInfraService.readTerraformVersion`, `SoftwareInfraService.readTrivyVersion`, `SoftwareInfraService.readKubectlVersion` | `installation/src/modules/software/software-infra.service.ts:35` |
| `SoftwarePythonService.installUv` | 5 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwarePythonService.readUvVersion`, `SoftwareBrewService.listOutdated` | `installation/src/modules/software/software-python.service.ts:48` |
| `SoftwareNamedService.validate` | 5 | `SoftwareNamedService.filter(…)`, `unknownNamesMessage`, `ProcessRunnerService.platform`, `SoftwareNamedService.find(…)`, `archiveToolOnMacMessage` | `installation/src/modules/software/software-named.service.ts:89` |
| `SharedNxCacheStorageService.evict` | 5 | `SharedNxCacheStorageService.measure`, `SharedNxCacheStorageService.toSorted(…)`, `SharedNxCacheStorageService.filter(…)`, `SharedNxCacheStorageService.reduce(…)`, `SharedNxCacheStorageService.map(…)` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:129` |
| `SharedNxCacheStorageService.write` | 5 | `SharedNxCacheStorageService.prepare`, `SharedNxCacheStorageService.on(…)`, `SharedNxCacheStorageService.entryPath`, `SharedNxCacheStorageService.explainFailure`, `SharedNxCacheStorageService.discard` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:204` |
| `SharedNxCacheServerService.get` | 5 | `SharedNxCacheStorageService.exists`, `SharedNxCacheServerService.pull`, `SharedNxCacheServerService.reply`, `SharedNxCacheStorageService.touch`, `SharedNxCacheStorageService.read` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:88` |
| `DependenciesService.installDependencies` | 4 | `ReporterService.print`, `ProcessRunnerService.runOrThrow`, `DependenciesService.resetNxCache`, `DependenciesService.writeKubeconfig` | `installation/src/modules/dependencies/dependencies.service.ts:193` |
| `EnvironmentFilesService.createEnvironmentFiles` | 4 | `ReporterService.print`, `EnvironmentFilesService.findTargets`, `EnvironmentFilesService.createEnvironmentFile`, `EnvironmentFilesService.addWorkspaceVariable` | `installation/src/modules/environment-files/environment-files.service.ts:113` |
| `LocalServicesService.ensureDaemon` | 4 | `LocalServicesService.isDaemonRunning`, `ReporterService.print`, `ProcessRunnerService.locate`, `LocalServicesService.startDaemon` | `installation/src/modules/local-services/local-services.service.ts:47` |
| `LocalServicesService.startDaemon` | 4 | `ReporterService.print`, `ProcessRunnerService.startDetached`, `LocalServicesService.isDaemonRunning`, `ProcessRunnerService.sleep` | `installation/src/modules/local-services/local-services.service.ts:86` |
| `ReleaseArchivesService.fetch` | 4 | `ReleaseArchivesService.download`, `ReleaseArchivesService.resolveTemplate`, `ReleaseArchivesService.verify`, `ReleaseArchivesService.unpack` | `installation/src/modules/release-archives/release-archives.service.ts:50` |
| `SoftwareBrewService.installOrCheck` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareBrewService.listOutdated` | `installation/src/modules/software/software-brew.service.ts:38` |
| `SoftwareDatabaseService.installPostgres` | 4 | `ReporterService.print`, `SoftwareDatabaseService.hasPostgres18`, `SoftwareDatabaseService.installPostgresClient`, `SoftwareDatabaseService.readVersion` | `installation/src/modules/software/software-database.service.ts:188` |
| `SoftwareDatabaseService.installSquawk` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareDatabaseService.readVersion` | `installation/src/modules/software/software-database.service.ts:210` |
| `SoftwareGpgService.installGpg` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.run` | `installation/src/modules/software/software-gpg.service.ts:124` |
| `SoftwarePythonService.installPythonThroughUv` | 4 | `ReporterService.print`, `SoftwarePythonService.hasSupportedPython`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-python.service.ts:89` |
| `SoftwareOllamaService.start` | 4 | `ReporterService.print`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.startDetached` | `installation/src/modules/software/software-ollama.service.ts:51` |
| `SoftwareService.installSoftware` | 4 | `ProcessRunnerService.platform`, `SoftwareService.installWithHomebrew`, `SoftwareLinuxService.installLinuxTools`, `SshSigningService.configureSshSigning` | `installation/src/modules/software/software.service.ts:69` |
| `SetupService.setUpLinux` | 4 | `EnvironmentFilesService.createEnvironmentFiles`, `SoftwareService.installSoftware`, `LocalServicesService.startLocalServices`, `ReporterService.print` | `installation/src/modules/setup/setup.service.ts:81` |
| `SharedNxCacheServerService.handle` | 4 | `SharedNxCacheServerService.validate`, `SharedNxCacheServerService.put`, `SharedNxCacheServerService.get`, `SharedNxCacheServerService.reply` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:106` |
| `SharedNxCacheServerService.put` | 4 | `SharedNxCacheServerService.reply`, `SharedNxCacheStorageService.exists`, `SharedNxCacheStorageService.write`, `SharedNxCacheServerService.settle` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:140` |
| `SharedNxCacheServerService.settle` | 4 | `SharedNxCacheRemoteService.writable`, `SharedNxCacheRemoteService.store`, `SharedNxCacheStorageService.read`, `SharedNxCacheServerService.reply` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:179` |
| `DependenciesService.importCluster` | 3 | `ProcessRunnerService.run`, `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:55` |
| `LocalServicesService.startLocalServices` | 3 | `LocalServicesService.ensureDaemon`, `ReporterService.print`, `ProcessRunnerService.run` | `installation/src/modules/local-services/local-services.service.ts:114` |
| `ShellConfigurationService.appendCompletions` | 3 | `ShellConfigurationService.readStartupFile`, `ShellConfigurationService.map(…)`, `ShellConfigurationService.filter(…)` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:58` |
| `ShellConfigurationService.configureShell` | 3 | `ReporterService.print`, `ShellConfigurationService.configureStartupFile`, `ShellConfigurationService.printManualInstructions` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:165` |
| `ReleaseArchivesService.verify` | 3 | `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.resolveTemplate`, `ReleaseArchivesService.findPublishedChecksum` | `installation/src/modules/release-archives/release-archives.service.ts:137` |
| `SshSigningService.installSshKeygen` | 3 | `ProcessRunnerService.locate`, `ReporterService.print`, `ProcessRunnerService.run` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:51` |
| `SoftwareDatabaseService.installPostgresWithApt` | 3 | `SoftwareDatabaseService.addAptRepository`, `SoftwareDatabaseService.asRoot`, `SoftwareDatabaseService.linkPostgresTools` | `installation/src/modules/software/software-database.service.ts:131` |
| `SoftwareGpgService.configureSigning` | 3 | `ReporterService.print`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-gpg.service.ts:69` |
| `SoftwareInfraService.installInfrastructureTools` | 3 | `SoftwareBrewService.installOrCheck`, `ReporterService.print`, `SoftwareInfraService.buildVersionLines` | `installation/src/modules/software/software-infra.service.ts:108` |
| `SoftwareNamedService.installArchiveTool` | 3 | `SoftwareNamedService.find(…)`, `unknownNamesMessage`, `ReleaseArchivesService.install` | `installation/src/modules/software/software-named.service.ts:63` |
| `SoftwareNamedService.install` | 3 | `SoftwareNamedService.validate`, `SoftwareNamedService.installPostgresClient`, `SoftwareNamedService.installArchiveTool` | `installation/src/modules/software/software-named.service.ts:112` |
| `SoftwareOllamaService.waitUntilReady` | 3 | `ReporterService.print`, `SoftwareOllamaService.isRunning`, `ProcessRunnerService.sleep` | `installation/src/modules/software/software-ollama.service.ts:66` |
| `SetupService.setUp` | 3 | `ProcessRunnerService.platform`, `SetupService.setUpMac`, `SetupService.setUpLinux` | `installation/src/modules/setup/setup.service.ts:107` |
| `SharedNxCacheRemoteService.store` | 3 | `SharedNxCacheRemoteService.target`, `SharedNxCacheRemoteService.writable`, `SharedNxCacheRemoteService.send` | `installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:124` |
| `SharedNxCacheStorageService.exists` | 3 | `SharedNxCacheStorageService.catch(…)`, `SharedNxCacheStorageService.then(…)`, `SharedNxCacheStorageService.entryPath` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:177` |
| `SharedNxCacheServerService.start` | 3 | `SharedNxCacheServerService.createServer(…)`, `SharedNxCacheServerService.anonymous`, `SharedNxCacheServerService.evict` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:221` |
| `SharedNxCacheCommand.run` | 3 | `SharedNxCacheServerService.start`, `ReporterService.print`, `SharedNxCacheCommand.anonymous` | `installation/src/modules/shared-nx-cache/shared-nx-cache.command.ts:77` |
| `UpdateReuiSkillService.fetchBundle` | 3 | `UpdateReuiSkillService.map(…)`, `UpdateReuiSkillService.find(…)`, `UpdateReuiSkillService.some(…)` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:59` |
| `DependenciesService.resetNxCache` | 2 | `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:138` |
| `EnvironmentFilesService.findTargets` | 2 | `ProcessRunnerService.run`, `EnvironmentFilesService.map(…)` | `installation/src/modules/environment-files/environment-files.service.ts:88` |
| `ShellConfigurationService.appendTerraformCompletion` | 2 | `ProcessRunnerService.locate`, `ShellConfigurationService.appendBlock` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:75` |
| `ShellConfigurationService.printManualInstructions` | 2 | `ShellConfigurationService.findNvmPrefix`, `ReporterService.print` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:125` |
| `ReleaseArchivesService.place` | 2 | `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.resolveTemplate` | `installation/src/modules/release-archives/release-archives.service.ts:77` |
| `SshSigningService.readSignerKey` | 2 | `ProcessRunnerService.run`, `readSshPublicKey` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:95` |
| `SoftwareDatabaseService.addAptRepository` | 2 | `ProcessRunnerService.runOrThrow`, `SoftwareDatabaseService.asRoot` | `installation/src/modules/software/software-database.service.ts:51` |
| `SoftwareDatabaseService.asRoot` | 2 | `SoftwareDatabaseService.isRoot`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-database.service.ts:86` |
| `SoftwareDatabaseService.hasPostgres18` | 2 | `ProcessRunnerService.locate`, `ProcessRunnerService.run` | `installation/src/modules/software/software-database.service.ts:95` |
| `SoftwareDatabaseService.installDatabaseTools` | 2 | `SoftwareDatabaseService.installSquawk`, `SoftwareDatabaseService.installPostgres` | `installation/src/modules/software/software-database.service.ts:182` |
| `SoftwareGpgService.configureAgent` | 2 | `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-gpg.service.ts:40` |
| `SoftwareGpgService.findSigningKeyId` | 2 | `ProcessRunnerService.run`, `SoftwareGpgService.find(…)` | `installation/src/modules/software/software-gpg.service.ts:107` |
| `SoftwarePythonService.hasSupportedPython` | 2 | `ProcessRunnerService.locate`, `ProcessRunnerService.run` | `installation/src/modules/software/software-python.service.ts:38` |
| `SoftwarePythonService.installPython` | 2 | `SoftwarePythonService.installUv`, `SoftwarePythonService.installPythonThroughUv` | `installation/src/modules/software/software-python.service.ts:80` |
| `SoftwareNamedService.installPostgresClient` | 2 | `SoftwareDatabaseService.installPostgres`, `ProcessRunnerService.run` | `installation/src/modules/software/software-named.service.ts:76` |
| `SoftwareCommand.run` | 2 | `SoftwareNamedService.install`, `SoftwareService.installSoftware` | `installation/src/modules/software/software.command.ts:50` |
| `SetupService.printCompletion` | 2 | `SetupService.find(…)`, `ReporterService.print` | `installation/src/modules/setup/setup.service.ts:57` |
| `SharedNxCacheRemoteService.fetch` | 2 | `SharedNxCacheRemoteService.target`, `SharedNxCacheRemoteService.send` | `installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:97` |
| `SharedNxCacheStorageService.touch` | 2 | `SharedNxCacheStorageService.catch(…)`, `SharedNxCacheStorageService.entryPath` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:190` |
| `SharedNxCacheServerService.authorized` | 2 | `SharedNxCacheServerService.digest`, `SharedNxCacheServerService.expectedToken` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:60` |
| `SharedNxCacheServerService.pull` | 2 | `SharedNxCacheRemoteService.fetch`, `SharedNxCacheStorageService.write` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:122` |
| `SharedNxCacheServerService.validate` | 2 | `SharedNxCacheServerService.reply`, `SharedNxCacheServerService.authorized` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:200` |
| `SharedNxCacheServerService.evict` | 2 | `SharedNxCacheServerService.catch(…)`, `SharedNxCacheStorageService.evict` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:223` |
| `SharedNxCacheServerService.createServer(…)` | 2 | `SharedNxCacheServerService.catch(…)`, `SharedNxCacheServerService.handle` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:228` |
| `UpdateReuiSkillService.hashFiles` | 2 | `UpdateReuiSkillService.toSorted(…)`, `UpdateReuiSkillService.from(…)` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:99` |
| `UpdateReuiSkillService.readInstalledFiles` | 2 | `UpdateReuiSkillService.map(…)`, `UpdateReuiSkillService.filter(…)` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:124` |
| `UpdateReuiSkillService.update` | 2 | `UpdateReuiSkillService.refresh`, `ReporterService.print` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:193` |
| `ProcessRunnerService.runOrThrow` | 1 | `ProcessRunnerService.run` | `installation/src/modules/process-runner/process-runner.service.ts:97` |
| `ProcessRunnerService.sleep` | 1 | `ProcessRunnerService.anonymous` | `installation/src/modules/process-runner/process-runner.service.ts:114` |
| `ProcessRunnerService.startDetached` | 1 | `ProcessRunnerService.on(…)` | `installation/src/modules/process-runner/process-runner.service.ts:121` |
| `DependenciesService.readKubeconfig` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:109` |
| `DependenciesCommand.run` | 1 | `DependenciesService.installDependencies` | `installation/src/modules/dependencies/dependencies.command.ts:40` |
| `EnvironmentFilesService.addWorkspaceVariable` | 1 | `ReporterService.print` | `installation/src/modules/environment-files/environment-files.service.ts:49` |
| `EnvironmentFilesService.createEnvironmentFile` | 1 | `ReporterService.print` | `installation/src/modules/environment-files/environment-files.service.ts:67` |
| `EnvironmentFilesCommand.run` | 1 | `EnvironmentFilesService.createEnvironmentFiles` | `installation/src/modules/environment-files/environment-files.command.ts:39` |
| `LocalServicesService.isDaemonRunning` | 1 | `ProcessRunnerService.run` | `installation/src/modules/local-services/local-services.service.ts:79` |
| `LocalServicesCommand.run` | 1 | `LocalServicesService.startLocalServices` | `installation/src/modules/local-services/local-services.command.ts:40` |
| `RemoteCacheCommand.run` | 1 | `RemoteCacheService.setUpRemoteCache` | `installation/src/modules/remote-cache/remote-cache.command.ts:40` |
| `ShellConfigurationService.appendBlock` | 1 | `ShellConfigurationService.readStartupFile` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:49` |
| `ShellConfigurationService.filter(…)` | 1 | `ProcessRunnerService.locate` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:65` |
| `ShellConfigurationService.findNvmPrefix` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:118` |
| `ShellConfigurationService.removeProcessesBlock` | 1 | `ShellConfigurationService.readStartupFile` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:150` |
| `ShellConfigurationCommand.run` | 1 | `ShellConfigurationService.configureShell` | `installation/src/modules/shell-configuration/shell-configuration.command.ts:40` |
| `ReleaseArchivesService.download` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/release-archives/release-archives.service.ts:45` |
| `ReleaseArchivesService.resolveArchitecture` | 1 | `ProcessRunnerService.platform` | `installation/src/modules/release-archives/release-archives.service.ts:95` |
| `ReleaseArchivesService.unpack` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/release-archives/release-archives.service.ts:122` |
| `readSshPublicKey` | 1 | `readString` | `installation/src/modules/ssh-signing/ssh-signing.utilities.ts:26` |
| `SshSigningService.readGitSetting` | 1 | `ProcessRunnerService.run` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:86` |
| `SshSigningService.writeAllowedSigners` | 1 | `formatAllowedSigner` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:116` |
| `SoftwareBrewService.listOutdated` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-brew.service.ts:59` |
| `SoftwareDatabaseService.linkPostgresTools` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-database.service.ts:156` |
| `SoftwareDatabaseService.readVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-database.service.ts:171` |
| `SoftwareDockerService.isRunning` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-docker.service.ts:35` |
| `SoftwareDockerService.readVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-docker.service.ts:42` |
| `SoftwareInfraService.read` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-infra.service.ts:53` |
| `SoftwareInfraService.readKubectlVersion` | 1 | `SoftwareInfraService.read` | `installation/src/modules/software/software-infra.service.ts:60` |
| `SoftwareInfraService.readMerged` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-infra.service.ts:68` |
| `SoftwareInfraService.readTerraformVersion` | 1 | `SoftwareInfraService.read` | `installation/src/modules/software/software-infra.service.ts:75` |
| `SoftwareInfraService.readTrivyVersion` | 1 | `SoftwareInfraService.readMerged` | `installation/src/modules/software/software-infra.service.ts:97` |
| `SoftwarePythonService.readUvVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-python.service.ts:71` |
| `SoftwareLinuxService.attempt` | 1 | `ReporterService.print` | `installation/src/modules/software/software-linux.service.ts:48` |
| `SoftwareLinuxService.attempt(…)` | 1 | `ReleaseArchivesService.install` | `installation/src/modules/software/software-linux.service.ts:63` |
| `SoftwareLinuxService.attempt(…)` | 1 | `SoftwarePythonService.installPythonThroughUv` | `installation/src/modules/software/software-linux.service.ts:68` |
| `SoftwareLinuxService.attempt(…)` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-linux.service.ts:71` |
| `SoftwareLinuxService.attempt(…)` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-linux.service.ts:78` |
| `SoftwareLinuxService.attempt(…)` | 1 | `SoftwareDatabaseService.installSquawk` | `installation/src/modules/software/software-linux.service.ts:81` |
| `SoftwareLinuxService.attempt(…)` | 1 | `SoftwareDatabaseService.installPostgres` | `installation/src/modules/software/software-linux.service.ts:84` |
| `SoftwareOllamaService.isRunning` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-ollama.service.ts:42` |
| `SetupCommand.run` | 1 | `SetupService.setUp` | `installation/src/modules/setup/setup.command.ts:40` |
| `SharedNxCacheRemoteService.enabled` | 1 | `SharedNxCacheRemoteService.target` | `installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:92` |
| `SharedNxCacheRemoteService.writable` | 1 | `SharedNxCacheRemoteService.enabled` | `installation/src/modules/shared-nx-cache/shared-nx-cache-remote.service.ts:157` |
| `SharedNxCacheStorageService.discard` | 1 | `SharedNxCacheStorageService.anonymous` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:50` |
| `SharedNxCacheStorageService.measure` | 1 | `SharedNxCacheStorageService.catch(…)` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:83` |
| `SharedNxCacheStorageService.read` | 1 | `SharedNxCacheStorageService.entryPath` | `installation/src/modules/shared-nx-cache/shared-nx-cache-storage.service.ts:185` |
| `SharedNxCacheServerService.catch(…)` | 1 | `SharedNxCacheServerService.reply` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:229` |
| `SharedNxCacheServerService.close` | 1 | `SharedNxCacheServerService.anonymous` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:248` |
| `SharedNxCacheServerService.anonymous` | 1 | `SharedNxCacheServerService.close(…)` | `installation/src/modules/shared-nx-cache/shared-nx-cache-server.service.ts:250` |
| `UpdateReuiSkillCommand.run` | 1 | `UpdateReuiSkillService.update` | `installation/src/modules/update-reui-skill/update-reui-skill.command.ts:40` |

</details>
<!-- callidescope:end -->
