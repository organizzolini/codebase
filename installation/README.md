## Start

```bash
nx run installation:start
```

## Test

```bash
nx run installation:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-command-project](../../configuration/conformetry-templates/nestjs-command-project) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `installation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 175 |
| Files | 70 |
| Calls traced | 388 |
| Call stacks | 7 |
| Deepest stack | 13 |
| Stacks through recursion | 0 |
| Unfollowable calls | 9 |

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
  └─> SetupService.setUp(): Promise<void> [installation/src/modules/setup/setup.service.ts:103]
     ↳ Runs the steps for this operating system, stopping at the first that fails.
    └─> SetupService.setUpMac(): Promise<void> [installation/src/modules/setup/setup.service.ts:87]
       ↳ Sets up a developer's Mac.
      └─> SoftwareService.installSoftware(): Promise<void> [installation/src/modules/software/software.service.ts:69]
         ↳ Installs what this operating system gets, then makes SSH signatures verifiable.
        └─> SoftwareService.installWithHomebrew(): Promise<void> [installation/src/modules/software/software.service.ts:57]
           ↳ Installs what a Mac with Homebrew gets, in order.
          └─> SoftwareDatabaseService.installDatabaseTools(): void [installation/src/modules/software/software-database.service.ts:171]
             ↳ Installs squawk and the PostgreSQL 18 tools.
            └─> SoftwareDatabaseService.installPostgres(): void [installation/src/modules/software/software-database.service.ts:177]
               ↳ Installs PostgreSQL 18 unless its tools are already present.
              └─> SoftwareDatabaseService.installPostgresClient(): void [installation/src/modules/software/software-database.service.ts:94]
                 ↳ Installs PostgreSQL 18 on this machine, however its package manager does.
                └─> SoftwareDatabaseService.installPostgresWithApt(): void [installation/src/modules/software/software-database.service.ts:120]
                   ↳ Installs PostgreSQL 18 from the PostgreSQL apt repository, as root or through `sudo`.
                  └─> SoftwareDatabaseService.addAptRepository(codename: string): void [installation/src/modules/software/software-database.service.ts:51]
                     ↳ Adds the PostgreSQL apt source and its signing key.
                    └─> SoftwareDatabaseService.asRoot(command: string, args: string[]): void [installation/src/modules/software/software-database.service.ts:75]
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
      └─> SoftwareDatabaseService.installDatabaseTools(): void [installation/src/modules/software/software-database.service.ts:171]
         ↳ Installs squawk and the PostgreSQL 18 tools.
        └─> SoftwareDatabaseService.installPostgres(): void [installation/src/modules/software/software-database.service.ts:177]
           ↳ Installs PostgreSQL 18 unless its tools are already present.
          └─> SoftwareDatabaseService.installPostgresClient(): void [installation/src/modules/software/software-database.service.ts:94]
             ↳ Installs PostgreSQL 18 on this machine, however its package manager does.
            └─> SoftwareDatabaseService.installPostgresWithApt(): void [installation/src/modules/software/software-database.service.ts:120]
               ↳ Installs PostgreSQL 18 from the PostgreSQL apt repository, as root or through `sudo`.
              └─> SoftwareDatabaseService.addAptRepository(codename: string): void [installation/src/modules/software/software-database.service.ts:51]
                 ↳ Adds the PostgreSQL apt source and its signing key.
                └─> SoftwareDatabaseService.asRoot(command: string, args: string[]): void [installation/src/modules/software/software-database.service.ts:75]
                   ↳ Runs a command as root: directly when this process is root, else through `sudo`.
                  └─> ProcessRunnerService.runOrThrow(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:97]
                     ↳ Runs a command and throws when it does not exit 0.
                    └─> ProcessRunnerService.run(command: string, args: string[], options?: ProcessOptions): ProcessResult [installation/src/modules/process-runner/process-runner.service.ts:68]
                       ↳ Runs a command to completion.
```

**3. `DependenciesCommand.run`** — depth 6 · decorated-method

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

<details>
<summary>4 more call stacks</summary>

**4. `LocalServicesCommand.run`** — depth 6 · decorated-method

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

**5. `ShellConfigurationCommand.run`** — depth ≥ 6 · decorated-method

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

**6. `UpdateReuiSkillCommand.run`** — depth 5 · decorated-method

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

**7. `EnvironmentFilesCommand.run`** — depth 4 · decorated-method

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

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ReleaseArchivesService.install` | 8 | `ReporterService.print`, `ProcessRunnerService.locate`, `ReleaseArchivesService.resolveArchitecture`, `ReleaseArchivesService.resolveTemplate`, `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.fetch`, `ReleaseArchivesService.place`, `ProcessRunnerService.run` | `installation/src/modules/release-archives/release-archives.service.ts:163` |
| `ShellConfigurationService.configureStartupFile` | 7 | `ReporterService.print`, `ShellConfigurationService.appendBlock`, `ShellConfigurationService.buildNvmBlock`, `ShellConfigurationService.findNvmPrefix`, `ShellConfigurationService.appendCompletions`, `ShellConfigurationService.appendTerraformCompletion`, `ShellConfigurationService.removeProcessesBlock` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:99` |
| `SoftwareLinuxService.installLinuxTools` | 7 | `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)`, `SoftwareLinuxService.attempt(…)` | `installation/src/modules/software/software-linux.service.ts:61` |

<details>
<summary>102 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `SshSigningService.configureSshSigning` | 6 | `SshSigningService.readGitSetting`, `ReporterService.print`, `SshSigningService.installSshKeygen`, `SshSigningService.readSignerKey`, `SshSigningService.writeAllowedSigners`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:139` |
| `SoftwareDockerService.installDocker` | 6 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareDockerService.isRunning`, `SoftwareDockerService.readVersion`, `SoftwareDockerService.startDaemon` | `installation/src/modules/software/software-docker.service.ts:77` |
| `SoftwareOllamaService.installOllama` | 6 | `SoftwareBrewService.installOrCheck`, `ReporterService.print`, `SoftwareOllamaService.isRunning`, `SoftwareOllamaService.start`, `SoftwareOllamaService.waitUntilReady`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-ollama.service.ts:81` |
| `SoftwareService.installWithHomebrew` | 6 | `SoftwarePythonService.installPython`, `SoftwareOllamaService.installOllama`, `SoftwareDockerService.installDocker`, `SoftwareGpgService.installGpgSigning`, `SoftwareInfraService.installInfrastructureTools`, `SoftwareDatabaseService.installDatabaseTools` | `installation/src/modules/software/software.service.ts:57` |
| `UpdateReuiSkillService.refresh` | 6 | `UpdateReuiSkillService.fetchBundle`, `UpdateReuiSkillService.readLock`, `UpdateReuiSkillService.hashFiles`, `UpdateReuiSkillService.readInstalledFiles`, `ReporterService.print`, `UpdateReuiSkillService.install` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:158` |
| `DependenciesService.writeKubeconfig` | 5 | `ReporterService.print`, `DependenciesService.readEnvironmentFile`, `DependenciesService.importCluster`, `DependenciesService.toClusterId`, `DependenciesService.readKubeconfig` | `installation/src/modules/dependencies/dependencies.service.ts:160` |
| `SoftwareDatabaseService.installPostgresClient` | 5 | `ProcessRunnerService.platform`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.locate`, `SoftwareDatabaseService.isRoot`, `SoftwareDatabaseService.installPostgresWithApt` | `installation/src/modules/software/software-database.service.ts:94` |
| `SoftwareDockerService.startDaemon` | 5 | `ReporterService.print`, `ProcessRunnerService.runOrThrow`, `SoftwareDockerService.isRunning`, `ProcessRunnerService.sleep`, `SoftwareDockerService.readVersion` | `installation/src/modules/software/software-docker.service.ts:49` |
| `SoftwareGpgService.installGpgSigning` | 5 | `SoftwareGpgService.installGpg`, `SoftwareGpgService.configureAgent`, `ReporterService.print`, `SoftwareGpgService.findSigningKeyId`, `SoftwareGpgService.configureSigning` | `installation/src/modules/software/software-gpg.service.ts:151` |
| `SoftwareInfraService.buildVersionLines` | 5 | `SoftwareInfraService.read`, `SoftwareInfraService.readMerged`, `SoftwareInfraService.readTerraformVersion`, `SoftwareInfraService.readTrivyVersion`, `SoftwareInfraService.readKubectlVersion` | `installation/src/modules/software/software-infra.service.ts:35` |
| `SoftwarePythonService.installUv` | 5 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwarePythonService.readUvVersion`, `SoftwareBrewService.listOutdated` | `installation/src/modules/software/software-python.service.ts:48` |
| `SoftwareNamedService.validate` | 5 | `SoftwareNamedService.filter(…)`, `unknownNamesMessage`, `ProcessRunnerService.platform`, `SoftwareNamedService.find(…)`, `archiveToolOnMacMessage` | `installation/src/modules/software/software-named.service.ts:89` |
| `SetupService.setUpMac` | 5 | `ShellConfigurationService.configureShell`, `SoftwareService.installSoftware`, `EnvironmentFilesService.createEnvironmentFiles`, `DependenciesService.installDependencies`, `SetupService.printCompletion` | `installation/src/modules/setup/setup.service.ts:87` |
| `DependenciesService.installDependencies` | 4 | `ReporterService.print`, `ProcessRunnerService.runOrThrow`, `DependenciesService.resetNxCache`, `DependenciesService.writeKubeconfig` | `installation/src/modules/dependencies/dependencies.service.ts:193` |
| `EnvironmentFilesService.createEnvironmentFiles` | 4 | `ReporterService.print`, `EnvironmentFilesService.findTargets`, `EnvironmentFilesService.createEnvironmentFile`, `EnvironmentFilesService.addWorkspaceVariable` | `installation/src/modules/environment-files/environment-files.service.ts:113` |
| `LocalServicesService.ensureDaemon` | 4 | `LocalServicesService.isDaemonRunning`, `ReporterService.print`, `ProcessRunnerService.locate`, `LocalServicesService.startDaemon` | `installation/src/modules/local-services/local-services.service.ts:47` |
| `LocalServicesService.startDaemon` | 4 | `ReporterService.print`, `ProcessRunnerService.startDetached`, `LocalServicesService.isDaemonRunning`, `ProcessRunnerService.sleep` | `installation/src/modules/local-services/local-services.service.ts:86` |
| `ReleaseArchivesService.fetch` | 4 | `ReleaseArchivesService.download`, `ReleaseArchivesService.resolveTemplate`, `ReleaseArchivesService.verify`, `ReleaseArchivesService.unpack` | `installation/src/modules/release-archives/release-archives.service.ts:50` |
| `SoftwareBrewService.installOrCheck` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareBrewService.listOutdated` | `installation/src/modules/software/software-brew.service.ts:38` |
| `SoftwareDatabaseService.installPostgres` | 4 | `ReporterService.print`, `SoftwareDatabaseService.hasPostgres18`, `SoftwareDatabaseService.installPostgresClient`, `SoftwareDatabaseService.readVersion` | `installation/src/modules/software/software-database.service.ts:177` |
| `SoftwareDatabaseService.installSquawk` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `SoftwareDatabaseService.readVersion` | `installation/src/modules/software/software-database.service.ts:199` |
| `SoftwareGpgService.installGpg` | 4 | `ReporterService.print`, `ProcessRunnerService.locate`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.run` | `installation/src/modules/software/software-gpg.service.ts:124` |
| `SoftwarePythonService.installPythonThroughUv` | 4 | `ReporterService.print`, `SoftwarePythonService.hasSupportedPython`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-python.service.ts:89` |
| `SoftwareOllamaService.start` | 4 | `ReporterService.print`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow`, `ProcessRunnerService.startDetached` | `installation/src/modules/software/software-ollama.service.ts:51` |
| `SoftwareService.installSoftware` | 4 | `ProcessRunnerService.platform`, `SoftwareService.installWithHomebrew`, `SoftwareLinuxService.installLinuxTools`, `SshSigningService.configureSshSigning` | `installation/src/modules/software/software.service.ts:69` |
| `SetupService.setUpLinux` | 4 | `EnvironmentFilesService.createEnvironmentFiles`, `SoftwareService.installSoftware`, `LocalServicesService.startLocalServices`, `ReporterService.print` | `installation/src/modules/setup/setup.service.ts:78` |
| `DependenciesService.importCluster` | 3 | `ProcessRunnerService.run`, `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:55` |
| `LocalServicesService.startLocalServices` | 3 | `LocalServicesService.ensureDaemon`, `ReporterService.print`, `ProcessRunnerService.run` | `installation/src/modules/local-services/local-services.service.ts:114` |
| `ShellConfigurationService.appendCompletions` | 3 | `ShellConfigurationService.readStartupFile`, `ShellConfigurationService.map(…)`, `ShellConfigurationService.filter(…)` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:58` |
| `ShellConfigurationService.configureShell` | 3 | `ReporterService.print`, `ShellConfigurationService.configureStartupFile`, `ShellConfigurationService.printManualInstructions` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:165` |
| `ReleaseArchivesService.verify` | 3 | `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.resolveTemplate`, `ReleaseArchivesService.findPublishedChecksum` | `installation/src/modules/release-archives/release-archives.service.ts:137` |
| `SshSigningService.installSshKeygen` | 3 | `ProcessRunnerService.locate`, `ReporterService.print`, `ProcessRunnerService.run` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:51` |
| `SoftwareDatabaseService.installPostgresWithApt` | 3 | `SoftwareDatabaseService.addAptRepository`, `SoftwareDatabaseService.asRoot`, `SoftwareDatabaseService.linkPostgresTools` | `installation/src/modules/software/software-database.service.ts:120` |
| `SoftwareGpgService.configureSigning` | 3 | `ReporterService.print`, `ProcessRunnerService.run`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-gpg.service.ts:69` |
| `SoftwareInfraService.installInfrastructureTools` | 3 | `SoftwareBrewService.installOrCheck`, `ReporterService.print`, `SoftwareInfraService.buildVersionLines` | `installation/src/modules/software/software-infra.service.ts:108` |
| `SoftwareNamedService.installArchiveTool` | 3 | `SoftwareNamedService.find(…)`, `unknownNamesMessage`, `ReleaseArchivesService.install` | `installation/src/modules/software/software-named.service.ts:63` |
| `SoftwareNamedService.install` | 3 | `SoftwareNamedService.validate`, `SoftwareNamedService.installPostgresClient`, `SoftwareNamedService.installArchiveTool` | `installation/src/modules/software/software-named.service.ts:112` |
| `SoftwareOllamaService.waitUntilReady` | 3 | `ReporterService.print`, `SoftwareOllamaService.isRunning`, `ProcessRunnerService.sleep` | `installation/src/modules/software/software-ollama.service.ts:66` |
| `SetupService.setUp` | 3 | `ProcessRunnerService.platform`, `SetupService.setUpMac`, `SetupService.setUpLinux` | `installation/src/modules/setup/setup.service.ts:103` |
| `UpdateReuiSkillService.fetchBundle` | 3 | `UpdateReuiSkillService.map(…)`, `UpdateReuiSkillService.find(…)`, `UpdateReuiSkillService.some(…)` | `installation/src/modules/update-reui-skill/update-reui-skill.service.ts:59` |
| `DependenciesService.resetNxCache` | 2 | `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/dependencies/dependencies.service.ts:138` |
| `EnvironmentFilesService.findTargets` | 2 | `ProcessRunnerService.run`, `EnvironmentFilesService.map(…)` | `installation/src/modules/environment-files/environment-files.service.ts:88` |
| `ShellConfigurationService.appendTerraformCompletion` | 2 | `ProcessRunnerService.locate`, `ShellConfigurationService.appendBlock` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:75` |
| `ShellConfigurationService.printManualInstructions` | 2 | `ShellConfigurationService.findNvmPrefix`, `ReporterService.print` | `installation/src/modules/shell-configuration/shell-configuration.service.ts:125` |
| `ReleaseArchivesService.place` | 2 | `ProcessRunnerService.runOrThrow`, `ReleaseArchivesService.resolveTemplate` | `installation/src/modules/release-archives/release-archives.service.ts:77` |
| `SshSigningService.readSignerKey` | 2 | `ProcessRunnerService.run`, `readSshPublicKey` | `installation/src/modules/ssh-signing/ssh-signing.service.ts:95` |
| `SoftwareDatabaseService.addAptRepository` | 2 | `ProcessRunnerService.runOrThrow`, `SoftwareDatabaseService.asRoot` | `installation/src/modules/software/software-database.service.ts:51` |
| `SoftwareDatabaseService.asRoot` | 2 | `SoftwareDatabaseService.isRoot`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-database.service.ts:75` |
| `SoftwareDatabaseService.hasPostgres18` | 2 | `ProcessRunnerService.locate`, `ProcessRunnerService.run` | `installation/src/modules/software/software-database.service.ts:84` |
| `SoftwareDatabaseService.installDatabaseTools` | 2 | `SoftwareDatabaseService.installSquawk`, `SoftwareDatabaseService.installPostgres` | `installation/src/modules/software/software-database.service.ts:171` |
| `SoftwareGpgService.configureAgent` | 2 | `ReporterService.print`, `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-gpg.service.ts:40` |
| `SoftwareGpgService.findSigningKeyId` | 2 | `ProcessRunnerService.run`, `SoftwareGpgService.find(…)` | `installation/src/modules/software/software-gpg.service.ts:107` |
| `SoftwarePythonService.hasSupportedPython` | 2 | `ProcessRunnerService.locate`, `ProcessRunnerService.run` | `installation/src/modules/software/software-python.service.ts:38` |
| `SoftwarePythonService.installPython` | 2 | `SoftwarePythonService.installUv`, `SoftwarePythonService.installPythonThroughUv` | `installation/src/modules/software/software-python.service.ts:80` |
| `SoftwareNamedService.installPostgresClient` | 2 | `SoftwareDatabaseService.installPostgres`, `ProcessRunnerService.run` | `installation/src/modules/software/software-named.service.ts:76` |
| `SoftwareCommand.run` | 2 | `SoftwareNamedService.install`, `SoftwareService.installSoftware` | `installation/src/modules/software/software.command.ts:50` |
| `SetupService.printCompletion` | 2 | `SetupService.find(…)`, `ReporterService.print` | `installation/src/modules/setup/setup.service.ts:54` |
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
| `SoftwareDatabaseService.linkPostgresTools` | 1 | `ProcessRunnerService.runOrThrow` | `installation/src/modules/software/software-database.service.ts:145` |
| `SoftwareDatabaseService.readVersion` | 1 | `ProcessRunnerService.run` | `installation/src/modules/software/software-database.service.ts:160` |
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
| `UpdateReuiSkillCommand.run` | 1 | `UpdateReuiSkillService.update` | `installation/src/modules/update-reui-skill/update-reui-skill.command.ts:40` |

</details>
<!-- callidescope:end -->

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  configuration["configuration"]
  installation["installation"]
  observability["observability"]
  installation --> configuration
  installation --> observability
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class installation subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  DependenciesModule
  DiscoveryModule
  EnvironmentFilesModule
  LocalServicesModule
  LoggerModule([LoggerModule])
  MainModule
  ProcessRunnerModule
  ReleaseArchivesModule
  ReporterModule
  SetupModule
  ShellConfigurationModule
  SoftwareModule
  SshSigningModule
  UpdateReuiSkillModule
  DependenciesModule --> ProcessRunnerModule
  DependenciesModule --> ReporterModule
  EnvironmentFilesModule --> ProcessRunnerModule
  EnvironmentFilesModule --> ReporterModule
  LocalServicesModule --> ProcessRunnerModule
  LocalServicesModule --> ReporterModule
  MainModule --> DependenciesModule
  MainModule --> DiscoveryModule
  MainModule --> EnvironmentFilesModule
  MainModule --> LocalServicesModule
  MainModule --> ReporterModule
  MainModule --> SetupModule
  MainModule --> ShellConfigurationModule
  MainModule --> SoftwareModule
  MainModule --> UpdateReuiSkillModule
  ReleaseArchivesModule --> ProcessRunnerModule
  ReleaseArchivesModule --> ReporterModule
  SetupModule --> DependenciesModule
  SetupModule --> EnvironmentFilesModule
  SetupModule --> LocalServicesModule
  SetupModule --> ProcessRunnerModule
  SetupModule --> ReporterModule
  SetupModule --> ShellConfigurationModule
  SetupModule --> SoftwareModule
  ShellConfigurationModule --> ProcessRunnerModule
  ShellConfigurationModule --> ReporterModule
  SoftwareModule --> ProcessRunnerModule
  SoftwareModule --> ReleaseArchivesModule
  SoftwareModule --> ReporterModule
  SoftwareModule --> SshSigningModule
  SshSigningModule --> ProcessRunnerModule
  SshSigningModule --> ReporterModule
  UpdateReuiSkillModule --> ReporterModule
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
  file_src_installation_constants_ts["src/installation.constants.ts"]
  file_src_installation_main_end_to_end_test_ts["src/installation.main.end-to-end.test.ts"]
  file_src_installation_main_ts["src/installation.main.ts"]
  file_src_installation_main_unit_test_ts["src/installation.main.unit.test.ts"]
  file_src_installation_module_ts["src/installation.module.ts"]
  file_src_installation_repl_ts["src/installation.repl.ts"]
  file_src_installation_repl_unit_test_ts["src/installation.repl.unit.test.ts"]
  file_src_modules_dependencies_dependencies_command_ts["src/modules/dependencies/dependencies.command.ts"]
  file_src_modules_dependencies_dependencies_command_unit_test_ts["src/modules/dependencies/dependencies.command.unit.test.ts"]
  file_src_modules_dependencies_dependencies_constants_ts["src/modules/dependencies/dependencies.constants.ts"]
  file_src_modules_dependencies_dependencies_module_ts["src/modules/dependencies/dependencies.module.ts"]
  file_src_modules_dependencies_dependencies_service_ts["src/modules/dependencies/dependencies.service.ts"]
  file_src_modules_dependencies_dependencies_service_unit_test_ts["src/modules/dependencies/dependencies.service.unit.test.ts"]
  file_src_modules_dependencies_dependencies_types_ts["src/modules/dependencies/dependencies.types.ts"]
  file_src_modules_environment_files_environment_files_command_ts["src/modules/environment-files/environment-files.command.ts"]
  file_src_modules_environment_files_environment_files_command_unit_test_ts["src/modules/environment-files/environment-files.command.unit.test.ts"]
  file_src_modules_environment_files_environment_files_constants_ts["src/modules/environment-files/environment-files.constants.ts"]
  file_src_modules_environment_files_environment_files_module_ts["src/modules/environment-files/environment-files.module.ts"]
  file_src_modules_environment_files_environment_files_service_ts["src/modules/environment-files/environment-files.service.ts"]
  file_src_modules_environment_files_environment_files_service_unit_test_ts["src/modules/environment-files/environment-files.service.unit.test.ts"]
  file_src_modules_environment_files_environment_files_types_ts["src/modules/environment-files/environment-files.types.ts"]
  file_src_modules_local_services_local_services_command_ts["src/modules/local-services/local-services.command.ts"]
  file_src_modules_local_services_local_services_command_unit_test_ts["src/modules/local-services/local-services.command.unit.test.ts"]
  file_src_modules_local_services_local_services_constants_ts["src/modules/local-services/local-services.constants.ts"]
  file_src_modules_local_services_local_services_module_ts["src/modules/local-services/local-services.module.ts"]
  file_src_modules_local_services_local_services_service_ts["src/modules/local-services/local-services.service.ts"]
  file_src_modules_local_services_local_services_service_unit_test_ts["src/modules/local-services/local-services.service.unit.test.ts"]
  file_src_modules_local_services_local_services_types_ts["src/modules/local-services/local-services.types.ts"]
  file_src_modules_process_runner_process_runner_constants_ts["src/modules/process-runner/process-runner.constants.ts"]
  file_src_modules_process_runner_process_runner_module_ts["src/modules/process-runner/process-runner.module.ts"]
  file_src_modules_process_runner_process_runner_service_ts["src/modules/process-runner/process-runner.service.ts"]
  file_src_modules_process_runner_process_runner_service_unit_test_ts["src/modules/process-runner/process-runner.service.unit.test.ts"]
  file_src_modules_process_runner_process_runner_types_ts["src/modules/process-runner/process-runner.types.ts"]
  file_src_modules_release_archives_release_archives_constants_integration_test_ts["src/modules/release-archives/release-archives.constants.integration.test.ts"]
  file_src_modules_release_archives_release_archives_constants_ts["src/modules/release-archives/release-archives.constants.ts"]
  file_src_modules_release_archives_release_archives_module_ts["src/modules/release-archives/release-archives.module.ts"]
  file_src_modules_release_archives_release_archives_service_ts["src/modules/release-archives/release-archives.service.ts"]
  file_src_modules_release_archives_release_archives_service_unit_test_ts["src/modules/release-archives/release-archives.service.unit.test.ts"]
  file_src_modules_release_archives_release_archives_types_ts["src/modules/release-archives/release-archives.types.ts"]
  file_src_modules_reporter_reporter_constants_ts["src/modules/reporter/reporter.constants.ts"]
  file_src_modules_reporter_reporter_module_ts["src/modules/reporter/reporter.module.ts"]
  file_src_modules_reporter_reporter_service_ts["src/modules/reporter/reporter.service.ts"]
  file_src_modules_reporter_reporter_service_unit_test_ts["src/modules/reporter/reporter.service.unit.test.ts"]
  file_src_modules_reporter_reporter_types_ts["src/modules/reporter/reporter.types.ts"]
  file_src_modules_setup_setup_command_ts["src/modules/setup/setup.command.ts"]
  file_src_modules_setup_setup_command_unit_test_ts["src/modules/setup/setup.command.unit.test.ts"]
  file_src_modules_setup_setup_constants_ts["src/modules/setup/setup.constants.ts"]
  file_src_modules_setup_setup_module_ts["src/modules/setup/setup.module.ts"]
  file_src_modules_setup_setup_service_ts["src/modules/setup/setup.service.ts"]
  file_src_modules_setup_setup_service_unit_test_ts["src/modules/setup/setup.service.unit.test.ts"]
  file_src_modules_setup_setup_types_ts["src/modules/setup/setup.types.ts"]
  file_src_modules_shell_configuration_shell_configuration_command_ts["src/modules/shell-configuration/shell-configuration.command.ts"]
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts["src/modules/shell-configuration/shell-configuration.command.unit.test.ts"]
  file_src_modules_shell_configuration_shell_configuration_constants_ts["src/modules/shell-configuration/shell-configuration.constants.ts"]
  file_src_modules_shell_configuration_shell_configuration_module_ts["src/modules/shell-configuration/shell-configuration.module.ts"]
  file_src_modules_shell_configuration_shell_configuration_service_ts["src/modules/shell-configuration/shell-configuration.service.ts"]
  file_src_modules_shell_configuration_shell_configuration_service_unit_test_ts["src/modules/shell-configuration/shell-configuration.service.unit.test.ts"]
  file_src_modules_shell_configuration_shell_configuration_types_ts["src/modules/shell-configuration/shell-configuration.types.ts"]
  file_src_modules_software_software_brew_service_ts["src/modules/software/software-brew.service.ts"]
  file_src_modules_software_software_brew_service_unit_test_ts["src/modules/software/software-brew.service.unit.test.ts"]
  file_src_modules_software_software_database_service_ts["src/modules/software/software-database.service.ts"]
  file_src_modules_software_software_database_service_unit_test_ts["src/modules/software/software-database.service.unit.test.ts"]
  file_src_modules_software_software_docker_service_ts["src/modules/software/software-docker.service.ts"]
  file_src_modules_software_software_docker_service_unit_test_ts["src/modules/software/software-docker.service.unit.test.ts"]
  file_src_modules_software_software_gpg_service_ts["src/modules/software/software-gpg.service.ts"]
  file_src_modules_software_software_gpg_service_unit_test_ts["src/modules/software/software-gpg.service.unit.test.ts"]
  file_src_modules_software_software_infra_service_ts["src/modules/software/software-infra.service.ts"]
  file_src_modules_software_software_infra_service_unit_test_ts["src/modules/software/software-infra.service.unit.test.ts"]
  file_src_modules_software_software_linux_service_ts["src/modules/software/software-linux.service.ts"]
  file_src_modules_software_software_linux_service_unit_test_ts["src/modules/software/software-linux.service.unit.test.ts"]
  file_src_modules_software_software_named_service_ts["src/modules/software/software-named.service.ts"]
  file_src_modules_software_software_named_service_unit_test_ts["src/modules/software/software-named.service.unit.test.ts"]
  file_src_modules_software_software_ollama_service_ts["src/modules/software/software-ollama.service.ts"]
  file_src_modules_software_software_ollama_service_unit_test_ts["src/modules/software/software-ollama.service.unit.test.ts"]
  file_src_modules_software_software_python_service_ts["src/modules/software/software-python.service.ts"]
  file_src_modules_software_software_python_service_unit_test_ts["src/modules/software/software-python.service.unit.test.ts"]
  file_src_modules_software_software_command_ts["src/modules/software/software.command.ts"]
  file_src_modules_software_software_command_unit_test_ts["src/modules/software/software.command.unit.test.ts"]
  file_src_modules_software_software_constants_ts["src/modules/software/software.constants.ts"]
  file_src_modules_software_software_module_ts["src/modules/software/software.module.ts"]
  file_src_modules_software_software_service_ts["src/modules/software/software.service.ts"]
  file_src_modules_software_software_service_unit_test_ts["src/modules/software/software.service.unit.test.ts"]
  file_src_modules_software_software_types_ts["src/modules/software/software.types.ts"]
  file_src_modules_ssh_signing_ssh_signing_constants_ts["src/modules/ssh-signing/ssh-signing.constants.ts"]
  file_src_modules_ssh_signing_ssh_signing_module_ts["src/modules/ssh-signing/ssh-signing.module.ts"]
  file_src_modules_ssh_signing_ssh_signing_service_ts["src/modules/ssh-signing/ssh-signing.service.ts"]
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts["src/modules/ssh-signing/ssh-signing.service.unit.test.ts"]
  file_src_modules_ssh_signing_ssh_signing_types_ts["src/modules/ssh-signing/ssh-signing.types.ts"]
  file_src_modules_ssh_signing_ssh_signing_utilities_ts["src/modules/ssh-signing/ssh-signing.utilities.ts"]
  file_src_modules_ssh_signing_ssh_signing_utilities_unit_test_ts["src/modules/ssh-signing/ssh-signing.utilities.unit.test.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_command_ts["src/modules/update-reui-skill/update-reui-skill.command.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts["src/modules/update-reui-skill/update-reui-skill.command.unit.test.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_constants_ts["src/modules/update-reui-skill/update-reui-skill.constants.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_module_ts["src/modules/update-reui-skill/update-reui-skill.module.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_service_ts["src/modules/update-reui-skill/update-reui-skill.service.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_service_unit_test_ts["src/modules/update-reui-skill/update-reui-skill.service.unit.test.ts"]
  file_src_modules_update_reui_skill_update_reui_skill_types_ts["src/modules/update-reui-skill/update-reui-skill.types.ts"]
  file_testing_environment_ts["testing/environment.ts"]
  file_testing_fake_process_runner_ts["testing/fake-process-runner.ts"]
  file_testing_mocks_ts["testing/mocks.ts"]
  file_testing_report_ts["testing/report.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_testing_ssh_signature_ts["testing/ssh-signature.ts"]
  file_testing_temporary_workspace_ts["testing/temporary-workspace.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_installation_main_end_to_end_test_ts --> file_src_installation_constants_ts
  file_src_installation_main_ts --> file_src_installation_module_ts
  file_src_installation_module_ts --> file_src_installation_constants_ts
  file_src_installation_module_ts --> file_src_modules_dependencies_dependencies_module_ts
  file_src_installation_module_ts --> file_src_modules_environment_files_environment_files_module_ts
  file_src_installation_module_ts --> file_src_modules_local_services_local_services_module_ts
  file_src_installation_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_installation_module_ts --> file_src_modules_setup_setup_module_ts
  file_src_installation_module_ts --> file_src_modules_shell_configuration_shell_configuration_module_ts
  file_src_installation_module_ts --> file_src_modules_software_software_module_ts
  file_src_installation_module_ts --> file_src_modules_update_reui_skill_update_reui_skill_module_ts
  file_src_installation_repl_ts --> file_src_installation_module_ts
  file_src_modules_dependencies_dependencies_command_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_src_modules_dependencies_dependencies_command_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_testing_environment_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_testing_report_ts
  file_src_modules_dependencies_dependencies_command_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_dependencies_dependencies_module_ts --> file_src_modules_dependencies_dependencies_command_ts
  file_src_modules_dependencies_dependencies_module_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_dependencies_dependencies_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_dependencies_dependencies_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_dependencies_dependencies_service_ts --> file_src_modules_dependencies_dependencies_constants_ts
  file_src_modules_dependencies_dependencies_service_ts --> file_src_modules_dependencies_dependencies_types_ts
  file_src_modules_dependencies_dependencies_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_dependencies_dependencies_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_dependencies_dependencies_service_unit_test_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_dependencies_dependencies_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_dependencies_dependencies_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_environment_files_environment_files_command_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_src_modules_environment_files_environment_files_command_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_testing_environment_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_testing_report_ts
  file_src_modules_environment_files_environment_files_command_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_environment_files_environment_files_module_ts --> file_src_modules_environment_files_environment_files_command_ts
  file_src_modules_environment_files_environment_files_module_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_environment_files_environment_files_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_environment_files_environment_files_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_environment_files_environment_files_service_ts --> file_src_modules_environment_files_environment_files_constants_ts
  file_src_modules_environment_files_environment_files_service_ts --> file_src_modules_environment_files_environment_files_types_ts
  file_src_modules_environment_files_environment_files_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_environment_files_environment_files_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_environment_files_environment_files_service_unit_test_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_environment_files_environment_files_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_environment_files_environment_files_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_local_services_local_services_command_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_local_services_local_services_command_unit_test_ts --> file_src_modules_local_services_local_services_command_ts
  file_src_modules_local_services_local_services_command_unit_test_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_local_services_local_services_module_ts --> file_src_modules_local_services_local_services_command_ts
  file_src_modules_local_services_local_services_module_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_local_services_local_services_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_local_services_local_services_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_local_services_local_services_service_ts --> file_src_modules_local_services_local_services_constants_ts
  file_src_modules_local_services_local_services_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_local_services_local_services_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_testing_environment_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_testing_report_ts
  file_src_modules_local_services_local_services_service_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_process_runner_process_runner_module_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_process_runner_process_runner_service_ts --> file_src_modules_process_runner_process_runner_constants_ts
  file_src_modules_process_runner_process_runner_service_ts --> file_src_modules_process_runner_process_runner_types_ts
  file_src_modules_process_runner_process_runner_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_process_runner_process_runner_service_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_release_archives_release_archives_constants_integration_test_ts --> file_src_modules_release_archives_release_archives_constants_ts
  file_src_modules_release_archives_release_archives_constants_ts --> file_src_modules_release_archives_release_archives_types_ts
  file_src_modules_release_archives_release_archives_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_release_archives_release_archives_module_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_release_archives_release_archives_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_release_archives_release_archives_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_release_archives_release_archives_service_ts --> file_src_modules_release_archives_release_archives_types_ts
  file_src_modules_release_archives_release_archives_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_release_archives_release_archives_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_release_archives_release_archives_service_unit_test_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_release_archives_release_archives_service_unit_test_ts --> file_src_modules_release_archives_release_archives_types_ts
  file_src_modules_release_archives_release_archives_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_release_archives_release_archives_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_reporter_reporter_module_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_reporter_reporter_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_setup_setup_command_ts --> file_src_modules_setup_setup_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_setup_setup_command_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_setup_setup_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_docker_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_gpg_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_infra_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_linux_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_ollama_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_software_software_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_src_modules_ssh_signing_ssh_signing_service_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_testing_environment_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_testing_report_ts
  file_src_modules_setup_setup_command_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_dependencies_dependencies_module_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_environment_files_environment_files_module_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_local_services_local_services_module_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_setup_setup_command_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_setup_setup_service_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_shell_configuration_shell_configuration_module_ts
  file_src_modules_setup_setup_module_ts --> file_src_modules_software_software_module_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_setup_setup_constants_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_setup_setup_service_ts --> file_src_modules_software_software_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_dependencies_dependencies_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_environment_files_environment_files_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_local_services_local_services_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_setup_setup_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_src_modules_software_software_service_ts
  file_src_modules_setup_setup_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_shell_configuration_shell_configuration_command_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_src_modules_shell_configuration_shell_configuration_command_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_testing_environment_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_testing_report_ts
  file_src_modules_shell_configuration_shell_configuration_command_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_shell_configuration_shell_configuration_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_shell_configuration_shell_configuration_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_shell_configuration_shell_configuration_module_ts --> file_src_modules_shell_configuration_shell_configuration_command_ts
  file_src_modules_shell_configuration_shell_configuration_module_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_shell_configuration_shell_configuration_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_shell_configuration_shell_configuration_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_shell_configuration_shell_configuration_service_ts --> file_src_modules_shell_configuration_shell_configuration_constants_ts
  file_src_modules_shell_configuration_shell_configuration_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_shell_configuration_shell_configuration_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_shell_configuration_shell_configuration_service_unit_test_ts --> file_src_modules_shell_configuration_shell_configuration_service_ts
  file_src_modules_software_software_brew_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_brew_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_brew_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_brew_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_brew_service_unit_test_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_database_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_database_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_database_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_database_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_database_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_database_service_unit_test_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_database_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_software_software_docker_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_docker_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_docker_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_docker_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_docker_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_docker_service_unit_test_ts --> file_src_modules_software_software_docker_service_ts
  file_src_modules_software_software_gpg_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_gpg_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_gpg_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_gpg_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_gpg_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_gpg_service_unit_test_ts --> file_src_modules_software_software_gpg_service_ts
  file_src_modules_software_software_infra_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_infra_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_infra_service_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_infra_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_infra_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_infra_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_infra_service_unit_test_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_infra_service_unit_test_ts --> file_src_modules_software_software_infra_service_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_dependencies_dependencies_constants_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_release_archives_release_archives_constants_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_linux_service_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_release_archives_release_archives_constants_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_software_software_linux_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_linux_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_software_software_named_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_named_service_ts --> file_src_modules_release_archives_release_archives_constants_ts
  file_src_modules_software_software_named_service_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_software_software_named_service_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_named_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_named_service_ts --> file_src_modules_software_software_types_ts
  file_src_modules_software_software_named_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_named_service_unit_test_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_software_software_named_service_unit_test_ts --> file_src_modules_release_archives_release_archives_types_ts
  file_src_modules_software_software_named_service_unit_test_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_named_service_unit_test_ts --> file_src_modules_software_software_named_service_ts
  file_src_modules_software_software_named_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_software_software_ollama_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_ollama_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_ollama_service_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_ollama_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_ollama_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_ollama_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_ollama_service_unit_test_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_ollama_service_unit_test_ts --> file_src_modules_software_software_ollama_service_ts
  file_src_modules_software_software_python_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_python_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_python_service_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_python_service_ts --> file_src_modules_software_software_constants_ts
  file_src_modules_software_software_python_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_python_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_python_service_unit_test_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_python_service_unit_test_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_command_ts --> file_src_modules_software_software_named_service_ts
  file_src_modules_software_software_command_ts --> file_src_modules_software_software_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_release_archives_release_archives_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_docker_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_gpg_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_infra_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_linux_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_named_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_ollama_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_command_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_software_software_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_src_modules_ssh_signing_ssh_signing_service_ts
  file_src_modules_software_software_command_unit_test_ts --> file_testing_environment_ts
  file_src_modules_software_software_command_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_software_software_command_unit_test_ts --> file_testing_report_ts
  file_src_modules_software_software_command_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_software_software_constants_ts --> file_src_modules_release_archives_release_archives_constants_ts
  file_src_modules_software_software_constants_ts --> file_src_modules_software_software_types_ts
  file_src_modules_software_software_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_software_software_module_ts --> file_src_modules_release_archives_release_archives_module_ts
  file_src_modules_software_software_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_brew_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_docker_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_gpg_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_infra_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_linux_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_named_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_ollama_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_command_ts
  file_src_modules_software_software_module_ts --> file_src_modules_software_software_service_ts
  file_src_modules_software_software_module_ts --> file_src_modules_ssh_signing_ssh_signing_module_ts
  file_src_modules_software_software_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_docker_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_gpg_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_infra_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_linux_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_ollama_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_service_ts --> file_src_modules_ssh_signing_ssh_signing_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_database_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_docker_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_gpg_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_infra_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_linux_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_ollama_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_python_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_software_software_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_src_modules_ssh_signing_ssh_signing_service_ts
  file_src_modules_software_software_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_software_software_types_ts --> file_src_installation_constants_ts
  file_src_modules_ssh_signing_ssh_signing_module_ts --> file_src_modules_process_runner_process_runner_module_ts
  file_src_modules_ssh_signing_ssh_signing_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_ssh_signing_ssh_signing_module_ts --> file_src_modules_ssh_signing_ssh_signing_service_ts
  file_src_modules_ssh_signing_ssh_signing_service_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_ssh_signing_ssh_signing_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_ssh_signing_ssh_signing_service_ts --> file_src_modules_ssh_signing_ssh_signing_constants_ts
  file_src_modules_ssh_signing_ssh_signing_service_ts --> file_src_modules_ssh_signing_ssh_signing_utilities_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_src_modules_ssh_signing_ssh_signing_service_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_testing_environment_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_testing_fake_process_runner_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_testing_report_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_testing_ssh_signature_ts
  file_src_modules_ssh_signing_ssh_signing_service_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_ssh_signing_ssh_signing_utilities_ts --> file_src_modules_ssh_signing_ssh_signing_constants_ts
  file_src_modules_ssh_signing_ssh_signing_utilities_unit_test_ts --> file_src_modules_ssh_signing_ssh_signing_utilities_ts
  file_src_modules_ssh_signing_ssh_signing_utilities_unit_test_ts --> file_testing_ssh_signature_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_ts --> file_src_modules_update_reui_skill_update_reui_skill_service_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_src_modules_update_reui_skill_update_reui_skill_command_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_src_modules_update_reui_skill_update_reui_skill_constants_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_src_modules_update_reui_skill_update_reui_skill_service_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_testing_environment_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_testing_report_ts
  file_src_modules_update_reui_skill_update_reui_skill_command_unit_test_ts --> file_testing_temporary_workspace_ts
  file_src_modules_update_reui_skill_update_reui_skill_module_ts --> file_src_modules_reporter_reporter_module_ts
  file_src_modules_update_reui_skill_update_reui_skill_module_ts --> file_src_modules_update_reui_skill_update_reui_skill_command_ts
  file_src_modules_update_reui_skill_update_reui_skill_module_ts --> file_src_modules_update_reui_skill_update_reui_skill_service_ts
  file_src_modules_update_reui_skill_update_reui_skill_service_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_update_reui_skill_update_reui_skill_service_ts --> file_src_modules_update_reui_skill_update_reui_skill_constants_ts
  file_src_modules_update_reui_skill_update_reui_skill_service_ts --> file_src_modules_update_reui_skill_update_reui_skill_types_ts
  file_src_modules_update_reui_skill_update_reui_skill_service_unit_test_ts --> file_src_modules_reporter_reporter_service_ts
  file_src_modules_update_reui_skill_update_reui_skill_service_unit_test_ts --> file_src_modules_update_reui_skill_update_reui_skill_service_ts
  file_testing_environment_ts --> file_testing_temporary_workspace_ts
  file_testing_fake_process_runner_ts --> file_src_modules_process_runner_process_runner_service_ts
  file_testing_fake_process_runner_ts --> file_src_modules_process_runner_process_runner_types_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-9032-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-298.26_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-14-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-109-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-109-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-17-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-46-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-252-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-32-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-15-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-40-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-394-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-134-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-326-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-202-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-499-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-642-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-139-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-429-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-689-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-127-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-36-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-8-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-86-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-61-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-23-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-112-dc2626?style=flat-square)
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

![Module Files](https://img.shields.io/badge/Module_Files-12-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-20-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-7-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-12-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-11-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-1-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-30-ca8a04?style=flat-square)
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
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-277-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-8-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-14-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-56-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-6-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-28-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-3-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-18-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-10-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-13-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-141-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
