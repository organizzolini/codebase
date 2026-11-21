<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `synchronization`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 306 |
| Files | 69 |
| Calls traced | 304 |
| Call stacks | 18 |
| Deepest stack | 10 |
| Stacks through recursion | 0 |
| Unfollowable calls | 15 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 10 |
| `maximumBreadth` | 11 |

### Call stacks (depth)

**1. `TypeormMigrationSqlCommand.run`** — depth 10 · decorated-method

```text
🚀 TypeormMigrationSqlCommand.run(…): Promise<void> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql.command.ts:104]
   ↳ Runs the typeorm-migration-sql sync command in check or write mode.
  └─> TypeormMigrationSqlCommand.synchronize(…): Promise<boolean> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql.command.ts:123]
     ↳ Synchronizes extracted migration SQL and reports success without exiting.
    └─> TypeormMigrationSqlExtractorService.synchronize(…): Promise<boolean> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:417]
       ↳ Synchronizes extracted SQL in check or write mode.
      └─> TypeormMigrationSqlExtractorService.targets(…): Promise<TypeormMigrationProjectTarget[]> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:472]
         ↳ Every configured migration target in the workspace or one explicit target.
        └─> TypeormMigrationSqlExtractorService.projectJsonPaths(): Promise<string[]> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:171]
           ↳ Every project.json one or two levels under the workspace projects/ directory.
          └─> TypeormMigrationSqlExtractorService.map(…)(entry: Dirent<string>): Promise<string[]> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:176]
            └─> TypeormMigrationSqlExtractorService.projectJsonPathsForDirectory(directoryPath: string): Promise<string[]> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:184]
               ↳ project.json paths found in one top-level projects/<name> directory.
              └─> TypeormMigrationSqlExtractorService.map(…)(entry: Dirent<string>): Promise<string | undefined> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:196]
                └─> TypeormMigrationSqlExtractorService.projectJsonPath(directoryPath: string): Promise<string | undefined> [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:159]
                   ↳ project.json path in one directory, or undefined when absent.
                  └─> TypeormMigrationSqlExtractorService.some(…)(entry: Dirent<string>): boolean [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:164]
```

**2. `ConventionalConfigCommand.run`** — depth 9 · decorated-method

```text
🚀 ConventionalConfigCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/conventional-config/conventional-config.command.ts:51]
   ↳ Runs the conventional-config sync command, delegating to helpers and exiting 1 on drift.
  └─> ConventionalConfigCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/conventional-config/conventional-config.command.ts:70]
     ↳ Synchronizes conventional-commit config and reports success without exiting.
    └─> ConventionalConfigService.runSynchronization(mode: string): boolean [synchronization/src/modules/conventional-config/conventional-config.service.ts:239]
       ↳ Runs the workflow in check or write mode, reporting whether it succeeded.
      └─> ConventionalConfigService.handleCheckMode(context: SyncContext): boolean [synchronization/src/modules/conventional-config/conventional-config.service.ts:125]
         ↳ Validates the configuration files are in sync with `conventional.config.cjs`, returning success rather than exiting so…
        └─> ConventionalConfigValidatorsService.checkAllSkillsSync(config: ConventionalConfig, skillFiles: string[]): boolean [synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:155]
           ↳ Validates that every configured skill file has synchronized type/scope tables.
          └─> ConventionalConfigValidatorsService.checkSkillSync(config: ConventionalConfig, skillFile: string): boolean [synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:293]
             ↳ Validates a skill file's type/scope markdown tables against source config.
            └─> ConventionalConfigValidatorsService.checkMarkerSync(…): boolean [synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:41]
               ↳ Checks that a named marker block in a skill file matches the source config values.
              └─> ConventionalConfigValidatorsService.readMarkerValues(…): { skillValues: string[]; } | undefined [synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:76]
                 ↳ Extracts and returns parsed table values from a named marker block, or undefined if missing.
                └─> ConventionalConfigIoService.extractMarkerContent(content: string, markerName: string): string | undefined [synchronization/src/modules/conventional-config/conventional-config-io.service.ts:127]
                   ↳ Extracts text content between named HTML comment markers.
```

**3. `InstalledSkillsCommand.run`** — depth 9 · decorated-method

```text
🚀 InstalledSkillsCommand.run(passedParameters: string[]): Promise<void> [synchronization/src/modules/installed-skills/installed-skills.command.ts:179]
   ↳ Runs the installed-skills command in check or write mode.
  └─> InstalledSkillsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/installed-skills/installed-skills.command.ts:194]
     ↳ Checks or restores the installed skills, reporting success.
    └─> InstalledSkillsCommand.write(): boolean [synchronization/src/modules/installed-skills/installed-skills.command.ts:139]
       ↳ Restores the missing locked skills, never reporting failure.
      └─> InstalledSkillsService.restoreSkills(): void [synchronization/src/modules/installed-skills/installed-skills.service.ts:188]
         ↳ Restores every locked skill, then undoes the restore's rewrites to tracked files. Never fails: an outage only warns.
        └─> InstalledSkillsService.findCleanSkillFolders(lockfilePath: string): string[] [synchronization/src/modules/installed-skills/installed-skills.service.ts:48]
           ↳ The locked skill folders with no uncommitted changes right now.
          └─> InstalledSkillsService.filter(…)(folder: string): boolean [synchronization/src/modules/installed-skills/installed-skills.service.ts:52]
            └─> InstalledSkillsService.hasChanges(target: string): boolean [synchronization/src/modules/installed-skills/installed-skills.service.ts:64]
               ↳ Whether `git` reports uncommitted changes under one path.
              └─> InstalledSkillsService.git(...args: string[]): ProcessResult [synchronization/src/modules/installed-skills/installed-skills.service.ts:59]
                 ↳ Runs one `git` query or command, without printing anything.
                └─> InstalledSkillsProcessService.run(command: ProcessCommand): ProcessResult [synchronization/src/modules/installed-skills/installed-skills-process.service.ts:31]
                   ↳ Runs one process to completion in the current directory, returning whether it started and its exit status.
```

<details>
<summary>15 more call stacks</summary>

**4. `ProjectPortsCommand.run`** — depth 8 · decorated-method

```text
🚀 ProjectPortsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/project-ports/project-ports.command.ts:248]
   ↳ Runs the project-ports sync command in check or write mode.
  └─> ProjectPortsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/project-ports/project-ports.command.ts:267]
     ↳ Synchronizes every application's port and reports success without exiting.
    └─> ProjectPortsCommand.map(…)(project: PortProject): boolean [synchronization/src/modules/project-ports/project-ports.command.ts:275]
      └─> ProjectPortsCommand.synchronizeProject(mode: SynchronizationMode, root: string, project: PortProject): boolean [synchronization/src/modules/project-ports/project-ports.command.ts:180]
         ↳ Brings one project's port into line, or reports how it differs, and says whether it was current.
        └─> ProjectPortsCommand.rewritePort(root: string, project: PortProject, currentPort: number): string[] [synchronization/src/modules/project-ports/project-ports.command.ts:157]
           ↳ Rewrites a project's old port across its scope and returns the files that changed.
          └─> ProjectPortsCommand.filter(…)(file: string): boolean [synchronization/src/modules/project-ports/project-ports.command.ts:163]
            └─> ProjectPortsService.replacePort(content: string, from: number, to: number): string [synchronization/src/modules/project-ports/project-ports.service.ts:34]
               ↳ Rewrites a port on each port line, matching only the whole number so `5003` never matches `15003`.
              └─> ProjectPortsService.map(…)(line: string): string [synchronization/src/modules/project-ports/project-ports.service.ts:39]
```

**5. `ConformetryGeneratorsCommand.run`** — depth ≥ 7 · decorated-method

```text
🚀 ConformetryGeneratorsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:184]
   ↳ Runs the conformetry-generators sync command in check or write mode.
  └─> ConformetryGeneratorsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:202]
     ↳ Synchronizes the generators table and reports success without exiting.
    └─> ConformetryGeneratorsCommand.readGenerators(): Promise<ConformetryGeneratorMetadata[]> [synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:107]
       ↳ Reads configuration/ic-suite/conformetry.config.ts and returns the list of generator metadata.
      └─> ConfigurationService.loadConformetryConfiguration(configurationPath: string): Promise<ConformetryConfiguration> [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:192]
         ↳ Loads, validates, and normalizes a conformetry configuration file.
        └─> ConfigurationService.map(…)(…): ConformetryGeneratorDefinition [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:208]
          └─> ConfigurationService.applyGeneratorDefaults(definition: ParsedGeneratorEntry): ConformetryGeneratorDefinition [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:73]
             ↳ Fills in the optional halves of one parsed generator entry. A generator with no inputs or instances is legal.
            └─> ConfigurationService.applyHookDefaults(hooks: NonNullable<ParsedGeneratorEntry["hooks"]>): GeneratorHooks [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:100]
               ↳ Drops the hooks a generator left unset, rather than carrying them as explicit `undefined`, so what a host forwards is…
```

**6. `VscodeExtensionsCommand.run`** — depth 7 · decorated-method

```text
🚀 VscodeExtensionsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:187]
   ↳ Runs the vscode-extensions sync command in check or write mode.
  └─> VscodeExtensionsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:206]
     ↳ Synchronizes both devcontainer extension lists and reports success without exiting.
    └─> VscodeExtensionsCommand.map(…)(…): boolean [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:213]
      └─> VscodeExtensionsCommand.synchronizeDevcontainer(…): boolean [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:139]
         ↳ Brings one devcontainer into line, or reports how it differs, and says whether it was current.
        └─> VscodeExtensionsCommand.reportDrift(…): void [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:109]
           ↳ Reports every list of one devcontainer that differs from the source.
          └─> VscodeExtensionsCommand.reportDifferences(difference: ExtensionListDifference): void [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:95]
             ↳ Logs every entry that differs between the source list and a devcontainer's list.
            └─> VscodeExtensionsCommand.hasSameEntries(left: string[], right: string[]): boolean [synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:62]
               ↳ Whether two lists hold the same entries, in any order.
```

**7. `PackageManifestsCommand.run`** — depth 6 · decorated-method

```text
🚀 PackageManifestsCommand.run(passedParameters: string[]): Promise<void> [synchronization/src/modules/package-manifests/package-manifests.command.ts:50]
   ↳ Runs the package-manifests sync command and exits 1 on drift in check mode.
  └─> PackageManifestsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/package-manifests/package-manifests.command.ts:66]
     ↳ Synchronizes package manifest metadata and reports success without exiting.
    └─> PackageManifestsService.writeAll(workspaceRoot: string): void [synchronization/src/modules/package-manifests/package-manifests.service.ts:205]
       ↳ Writes the derived metadata across all publishable packages.
      └─> PackageManifestsService.writePackageManifest(…): void [synchronization/src/modules/package-manifests/package-manifests.service.ts:218]
         ↳ Writes the derived metadata into an individual package's package.json.
        └─> PackageManifestsService.sortKeys(object: Record<string, unknown>): Record<string, unknown> [synchronization/src/modules/package-manifests/package-manifests.service.ts:83]
           ↳ Sorts an object's keys alphabetically, ignoring case.
          └─> PackageManifestsService.toSorted(…)(leftKey: string, rightKey: string): number [synchronization/src/modules/package-manifests/package-manifests.service.ts:85]
```

**8. `PullRequestTemplateCommand.run`** — depth 6 · decorated-method

```text
🚀 PullRequestTemplateCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/pull-request-template/pull-request-template.command.ts:202]
   ↳ Runs the pull-request-template sync command in check or write mode.
  └─> PullRequestTemplateCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/pull-request-template/pull-request-template.command.ts:221]
     ↳ Synchronizes the PR template and reports success without exiting.
    └─> PullRequestTemplateCommand.handleWriteMode(templateContent: string, targetFiles: string[]): void [synchronization/src/modules/pull-request-template/pull-request-template.command.ts:129]
       ↳ Writes the current PR template into any target files that are out of sync.
      └─> PullRequestTemplateCommand.filter(…)(targetFile: string): boolean [synchronization/src/modules/pull-request-template/pull-request-template.command.ts:134]
        └─> PullRequestTemplateCommand.checkTargetSync(templateContent: string, targetFile: string): boolean [synchronization/src/modules/pull-request-template/pull-request-template.command.ts:55]
           ↳ Checks whether the target file's marker block matches the current PR template.
          └─> PullRequestTemplateCommand.extractMarkerContent(content: string, markerName: string): string | undefined [synchronization/src/modules/pull-request-template/pull-request-template.command.ts:90]
             ↳ Extracts the content between start and end marker comments from a file.
```

**9. `SkillExclusionsCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 SkillExclusionsCommand.run(passedParameters: string[]): Promise<void> [synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:173]
   ↳ Runs the skill-exclusions sync command in check or write mode.
  └─> SkillExclusionsCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:188]
     ↳ Synchronizes the exclusion lists and reports success without exiting.
    └─> SkillExclusionsCommand.findStaleFiles(inputs: SkillExclusionInputs): string[] [synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:63]
       ↳ Every file whose generated block differs from what the lockfile implies.
      └─> SkillExclusionsCommand.filter(…)(file: SkillExclusionFile): boolean [synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:64]
        └─> SkillExclusionsCommand.readExclusionFile(…): { afterMarker: string; beforeMarker: string; generatedContent: string; } [synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:72]
           ↳ Splits one exclusion file around its generated block.
          └─> SkillExclusionsCommand.renderStartMarker(file: SkillExclusionFile): string [synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:146]
             ↳ The comment opening this file's generated block, in its own syntax.
```

**10. `DevcontainerConfigurationCommand.run`** — depth 5 · decorated-method

```text
🚀 DevcontainerConfigurationCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:257]
   ↳ Runs the devcontainer-configuration sync command in check or write mode.
  └─> DevcontainerConfigurationCommand.synchronize(mode: SynchronizationMode): Promise<boolean> [synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:276]
     ↳ Synchronizes the cloud devcontainer config and reports success without exiting.
    └─> DevcontainerConfigurationCommand.applySync(…): DevcontainerConfiguration [synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:59]
       ↳ Merges local devcontainer fields into a copy of the cloud config, preserving cloud-only keys.
      └─> DevcontainerConfigurationCommand.syncFeatures(…): void [synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:175]
         ↳ Merges features from local and cloud configs, keeping Docker features from cloud.
        └─> DevcontainerConfigurationCommand.isDockerFeatureKey(key: string): boolean [synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:122]
           ↳ Returns true if the feature key refers to a Docker-in-Docker or Docker-outside-of-Docker feature.
```

**11. `VscodeSettingsCommand.run`** — depth 4 · decorated-method

```text
🚀 VscodeSettingsCommand.run(passedParameters: string[], _options?: Record<string, unknown>): Promise<void> [synchronization/src/modules/vscode-settings/vscode-settings.command.ts:101]
   ↳ Runs the vscode-settings sync command in check or write mode.
  └─> SynchronizationService.resolveSynchronizationModeOrExit(options: SynchronizationModeResolutionOptions): SynchronizationMode [synchronization/src/modules/synchronization/synchronization.service.ts:59]
     ↳ Resolves synchronization mode or exits the process when the mode is invalid.
    └─> SynchronizationService.resolveModeValue(…): SynchronizationModeResolutionResult [synchronization/src/modules/synchronization/synchronization.service.ts:40]
       ↳ Resolves mode value and indicates whether it is valid without side effects.
      └─> SynchronizationService.isSynchronizationMode(modeValue: string): modeValue is SynchronizationMode [synchronization/src/modules/synchronization/synchronization.service.ts:54]
         ↳ Returns true when the provided value is a supported synchronization mode.
```

**12. `SynchronizationCommand.run`** — depth ≥ 4 · decorated-method

```text
🚀 SynchronizationCommand.run(passedParameters: string[]): Promise<void> [synchronization/src/modules/synchronization/synchronization.command.ts:112]
   ↳ Runs every synchronization, exiting once if any reported drift.
  └─> SynchronizationService.resolveSynchronizationModeOrExit(options: SynchronizationModeResolutionOptions): SynchronizationMode [synchronization/src/modules/synchronization/synchronization.service.ts:59]
     ↳ Resolves synchronization mode or exits the process when the mode is invalid.
    └─> SynchronizationService.resolveModeValue(…): SynchronizationModeResolutionResult [synchronization/src/modules/synchronization/synchronization.service.ts:40]
       ↳ Resolves mode value and indicates whether it is valid without side effects.
      └─> SynchronizationService.isSynchronizationMode(modeValue: string): modeValue is SynchronizationMode [synchronization/src/modules/synchronization/synchronization.service.ts:54]
         ↳ Returns true when the provided value is a supported synchronization mode.
```

**13. `run`** — depth 4 · orphan-root

```text
🚀 run(command: ProcessCommand): ProcessResult [synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:65]
  └─> answerGit(args: readonly string[]): ProcessResult [synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:56]
    └─> isDirty(args: readonly string[]): boolean [synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:42]
      └─> isLockfileDirty(): boolean [synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:38]
```

**14. `TypeormMigrationSqlExtractorService.visit`** — depth 3 · orphan-root

```text
🚀 TypeormMigrationSqlExtractorService.visit(node: ts.Node): void [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:310]
  └─> TypeormMigrationSqlExtractorService.sqlFromQueryCall(…): string | undefined [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:237]
     ↳ One migration SQL statement text extracted from a query call node.
    └─> TypeormMigrationSqlExtractorService.sqlLiteral(…): string | undefined [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:260]
       ↳ SQL text from a query argument literal.
```

**15. `TypeormMigrationSqlExtractorService.visit`** — depth 3 · orphan-root

```text
🚀 TypeormMigrationSqlExtractorService.visit(node: ts.Node): void [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:332]
  └─> TypeormMigrationSqlExtractorService.statementsFromClass(…): MigrationSqlStatements | undefined [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:279]
     ↳ SQL statements extracted from a migration class declaration node.
    └─> TypeormMigrationSqlExtractorService.statementsFromMethod(…): string[] [synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:304]
       ↳ SQL statements extracted from one migration method body.
```

**16. `SynchronizationMarkersService.extractContent`** — depth 3 · orphan-root

```text
🚀 SynchronizationMarkersService.extractContent(content: string, markerName: string): string | undefined [synchronization/src/modules/synchronization/synchronization-markers.service.ts:44]
   ↳ Returns the content between the markers, or undefined when absent.
  └─> SynchronizationMarkersService.locateMarkers(…): { endIndex: number; startIndex: number; } | undefined [synchronization/src/modules/synchronization/synchronization-markers.service.ts:24]
     ↳ Returns the index range the markers enclose, or undefined when absent.
    └─> SynchronizationMarkersService.getStartMarker(markerName: string): string [synchronization/src/modules/synchronization/synchronization-markers.service.ts:57]
       ↳ Renders the opening marker comment for a marker name.
```

**17. `SynchronizationMarkersService.replaceContent`** — depth 3 · orphan-root

```text
🚀 SynchronizationMarkersService.replaceContent(content: string, markerName: string, replacement: string): string [synchronization/src/modules/synchronization/synchronization-markers.service.ts:65]
   ↳ Replaces the content between the markers, surrounding it with the blank lines markdown needs for the block to be parsed…
  └─> SynchronizationMarkersService.locateMarkers(…): { endIndex: number; startIndex: number; } | undefined [synchronization/src/modules/synchronization/synchronization-markers.service.ts:24]
     ↳ Returns the index range the markers enclose, or undefined when absent.
    └─> SynchronizationMarkersService.getStartMarker(markerName: string): string [synchronization/src/modules/synchronization/synchronization-markers.service.ts:57]
       ↳ Renders the opening marker comment for a marker name.
```

**18. `lockSkills`** — depth 2 · orphan-root

```text
🚀 lockSkills(workspace: string, skillNames: string[]): void [synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:86]
   ↳ Writes a lockfile declaring exactly these skills.
  └─> map(…)(name: string): [string, { source: string; }] [synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:91]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConventionalConfigService.handleCheckMode` | 8 | `ConventionalConfigValidatorsService.checkSettingsSync`, `ConventionalConfigValidatorsService.checkAllSkillsSync`, `ConventionalConfigValidatorsService.checkAllTemplatesSync`, `ConventionalConfigService.loadReleaseConfig`, `ConventionalConfigValidatorsService.checkReleaseRulesSync`, `ConventionalConfigIoService.getReleaseRulesTypes`, `ConventionalConfigValidatorsService.checkPresetConfigSync`, `ConventionalConfigIoService.getPresetConfigTypes` | `synchronization/src/modules/conventional-config/conventional-config.service.ts:125` |
| `ConventionalConfigService.handleWriteMode` | 7 | `ConventionalConfigValidatorsService.checkSettingsSync`, `ConventionalConfigService.filter(…)`, `ConventionalConfigService.filter(…)`, `ConventionalConfigIoService.writeSettingsSync`, `ConventionalConfigIoService.writeSkillSync`, `ConventionalConfigIoService.writeIssueTemplateSync`, `ConventionalConfigService.syncReleaseConfigIfNeeded` | `synchronization/src/modules/conventional-config/conventional-config.service.ts:181` |
| `ConventionalConfigIoService.writeReleaseConfigSync` | 6 | `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.filter(…)`, `ConventionalConfigIoService.getReleaseRulesTypes`, `ConventionalConfigIoService.getPresetConfigTypes`, `ConventionalConfigIoService.appendToReleaseRules`, `ConventionalConfigIoService.appendToPresetTypes` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:290` |

<details>
<summary>133 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConventionalConfigService.runSynchronization` | 6 | `ConventionalConfigService.loadConventionalConfig`, `ConventionalConfigService.map(…)`, `ConventionalConfigIoService.parseSettingsScopes`, `ConventionalConfigService.map(…)`, `ConventionalConfigService.handleCheckMode`, `ConventionalConfigService.handleWriteMode` | `synchronization/src/modules/conventional-config/conventional-config.service.ts:239` |
| `InstalledSkillsService.restoreSkills` | 6 | `InstalledSkillsService.git`, `InstalledSkillsService.hasChanges`, `InstalledSkillsService.findCleanSkillFolders`, `InstalledSkillsService.runRestore`, `InstalledSkillsService.revertTrackedChanges`, `InstalledSkillsService.verifyRestoration` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:188` |
| `PackageManifestsService.checkPackageManifest` | 6 | `PackageManifestsService.readPackageManifest`, `PackageManifestsService.deriveMetadata`, `PackageManifestsService.compareStringField`, `PackageManifestsService.compareBugsField`, `PackageManifestsService.compareRepositoryField`, `PackageManifestsService.filter(…)` | `synchronization/src/modules/package-manifests/package-manifests.service.ts:125` |
| `ConventionalConfigService.syncReleaseConfigIfNeeded` | 5 | `ConventionalConfigService.loadReleaseConfig`, `ConventionalConfigService.filter(…)`, `ConventionalConfigIoService.getReleaseRulesTypes`, `ConventionalConfigIoService.getPresetConfigTypes`, `ConventionalConfigIoService.writeReleaseConfigSync` | `synchronization/src/modules/conventional-config/conventional-config.service.ts:93` |
| `TypeormMigrationSqlExtractorService.synchronize` | 5 | `TypeormMigrationSqlExtractorService.targets`, `TypeormMigrationSqlExtractorService.migrationFiles`, `TypeormMigrationSqlExtractorService.migrationOption`, `TypeormMigrationSqlExtractorService.synchronizeMigration`, `TypeormMigrationSqlExtractorService.migrationSqlPaths` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:417` |
| `TypeormMigrationSqlExtractorService.targets` | 5 | `TypeormMigrationSqlExtractorService.explicitTarget`, `TypeormMigrationSqlExtractorService.projectJsonPaths`, `TypeormMigrationSqlExtractorService.map(…)`, `TypeormMigrationSqlExtractorService.filter(…)`, `TypeormMigrationSqlExtractorService.map(…)` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:472` |
| `SynchronizationCommand.reportResults` | 5 | `SynchronizationCommand.filter(…)`, `SynchronizationCommand.map(…)`, `SynchronizationCommand.filter(…)`, `SynchronizationCommand.map(…)`, `SynchronizationCommand.filter(…)` | `synchronization/src/modules/synchronization/synchronization.command.ts:81` |
| `ConventionalConfigIoService.writeSkillSync` | 4 | `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.generateMarkdownTable`, `ConventionalConfigIoService.replaceMarkerContent` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:353` |
| `InstalledSkillsCommand.write` | 4 | `InstalledSkillsCommand.isSet`, `InstalledSkillsService.findMissingSkills`, `InstalledSkillsCommand.announceRestoration`, `InstalledSkillsService.restoreSkills` | `synchronization/src/modules/installed-skills/installed-skills.command.ts:139` |
| `PackageManifestsService.checkAll` | 4 | `PackageManifestsService.readRootManifest`, `PackageManifestsService.map(…)`, `PackageManifestsService.filter(…)`, `PackageManifestsService.filter(…)` | `synchronization/src/modules/package-manifests/package-manifests.service.ts:100` |
| `ProjectPortsCommand.findPortProjects` | 4 | `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.map(…)`, `ProjectPortsCommand.flatMap(…)` | `synchronization/src/modules/project-ports/project-ports.command.ts:84` |
| `PullRequestTemplateCommand.synchronize` | 4 | `PullRequestTemplateCommand.map(…)`, `PullRequestTemplateCommand.loadTemplate`, `PullRequestTemplateCommand.handleCheckMode`, `PullRequestTemplateCommand.handleWriteMode` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:221` |
| `TypeormMigrationSqlExtractorService.migrationFiles` | 4 | `TypeormMigrationSqlExtractorService.singleMigrationFile`, `TypeormMigrationSqlExtractorService.sortedMigrationEntries`, `TypeormMigrationSqlExtractorService.map(…)`, `TypeormMigrationSqlExtractorService.latestMigrationEntry` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:89` |
| `TypeormMigrationSqlExtractorService.projectJsonPathsForDirectory` | 4 | `TypeormMigrationSqlExtractorService.some(…)`, `TypeormMigrationSqlExtractorService.map(…)`, `TypeormMigrationSqlExtractorService.filter(…)`, `TypeormMigrationSqlExtractorService.filter(…)` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:184` |
| `TypeormMigrationSqlExtractorService.synchronizeMigration` | 4 | `TypeormMigrationSqlExtractorService.statementsFromMigrationFile`, `TypeormMigrationSqlExtractorService.renderSql`, `TypeormMigrationSqlExtractorService.writeExtractedSql`, `TypeormMigrationSqlExtractorService.checkExtractedSql` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:349` |
| `VscodeExtensionsCommand.synchronizeDevcontainer` | 4 | `VscodeExtensionsCommand.readDevcontainer`, `VscodeExtensionsCommand.isCurrent`, `VscodeExtensionsCommand.reportDrift`, `VscodeExtensionsCommand.write` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:139` |
| `ConformetryGeneratorsCommand.synchronize` | 3 | `ConformetryGeneratorsCommand.readGenerators`, `ConformetryGeneratorsCommand.checkSync`, `ConformetryGeneratorsCommand.writeSync` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:202` |
| `ConventionalConfigIoService.writeIssueTemplateSync` | 3 | `ConventionalConfigIoService.writeIssueTemplateDropdown`, `ConventionalConfigIoService.map(…)`, `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:258` |
| `ConventionalConfigValidatorsService.checkMarkerSync` | 3 | `ConventionalConfigValidatorsService.readMarkerValues`, `ConventionalConfigValidatorsService.getSourceValuesForMarker`, `ConventionalConfigValidatorsService.validateMarkerValues` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:41` |
| `ConventionalConfigValidatorsService.checkIssueTemplateSync` | 3 | `ConventionalConfigValidatorsService.getSourceValuesForMarker`, `ConventionalConfigIoService.parseIssueTemplateDropdown`, `ConventionalConfigValidatorsService.validateMarkerValues` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:185` |
| `DevcontainerConfigurationCommand.applySync` | 3 | `DevcontainerConfigurationCommand.syncVerbatimFields`, `DevcontainerConfigurationCommand.preserveRemoteEnvironment`, `DevcontainerConfigurationCommand.syncFeatures` | `synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:59` |
| `DevcontainerConfigurationCommand.synchronize` | 3 | `DevcontainerConfigurationCommand.applySync`, `DevcontainerConfigurationCommand.check`, `DevcontainerConfigurationCommand.writeWhenDrifted` | `synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:276` |
| `InstalledSkillsService.findCleanSkillFolders` | 3 | `InstalledSkillsService.filter(…)`, `InstalledSkillsService.map(…)`, `InstalledSkillsService.readLockedSkillNames` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:48` |
| `InstalledSkillsCommand.check` | 3 | `InstalledSkillsService.findMissingSkills`, `InstalledSkillsCommand.print`, `InstalledSkillsCommand.isCloudAgent` | `synchronization/src/modules/installed-skills/installed-skills.command.ts:80` |
| `PackageManifestsService.writePackageManifest` | 3 | `PackageManifestsService.readPackageManifest`, `PackageManifestsService.deriveMetadata`, `PackageManifestsService.sortKeys` | `synchronization/src/modules/package-manifests/package-manifests.service.ts:218` |
| `PackageManifestsCommand.synchronize` | 3 | `PackageManifestsService.writeAll`, `PackageManifestsService.checkAll`, `PackageManifestsCommand.map(…)` | `synchronization/src/modules/package-manifests/package-manifests.command.ts:66` |
| `ProjectPortsCommand.findProjectDirectories` | 3 | `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.map(…)`, `ProjectPortsCommand.filter(…)` | `synchronization/src/modules/project-ports/project-ports.command.ts:102` |
| `ProjectPortsCommand.rewritePort` | 3 | `ProjectPortsCommand.filter(…)`, `ProjectPortsCommand.listFiles`, `ProjectPortsCommand.resolveScope` | `synchronization/src/modules/project-ports/project-ports.command.ts:157` |
| `ProjectPortsCommand.synchronizeProject` | 3 | `ProjectPortsCommand.readCurrentPort`, `ProjectPortsCommand.map(…)`, `ProjectPortsCommand.rewritePort` | `synchronization/src/modules/project-ports/project-ports.command.ts:180` |
| `ProjectPortsCommand.synchronize` | 3 | `ProjectPortsCommand.findPortProjects`, `ProjectPortsCommand.verifyDistinctPorts`, `ProjectPortsCommand.map(…)` | `synchronization/src/modules/project-ports/project-ports.command.ts:267` |
| `SkillExclusionsCommand.writeSync` | 3 | `SkillExclusionsCommand.readExclusionFile`, `SkillExclusionsCommand.renderBlock`, `SkillExclusionsCommand.map(…)` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:151` |
| `SkillExclusionsCommand.synchronize` | 3 | `SkillExclusionsCommand.readInputs`, `SkillExclusionsCommand.writeSync`, `SkillExclusionsCommand.findStaleFiles` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:188` |
| `VscodeSettingsCommand.synchronize` | 3 | `VscodeSettingsCommand.readMachineSettings`, `VscodeSettingsCommand.findDrift`, `VscodeSettingsCommand.write` | `synchronization/src/modules/vscode-settings/vscode-settings.command.ts:120` |
| `SynchronizationCommand.synchronize` | 3 | `SynchronizationCommand.getCommands`, `SynchronizationCommand.reportResults`, `SynchronizationCommand.every(…)` | `synchronization/src/modules/synchronization/synchronization.command.ts:131` |
| `SynchronizationService.resolveSynchronizationModeOrExit` | 2 | `SynchronizationService.resolveModeValue`, `SynchronizationService.exitInvalidMode` | `synchronization/src/modules/synchronization/synchronization.service.ts:59` |
| `ConformetryGeneratorsCommand.checkSync` | 2 | `ConformetryGeneratorsCommand.generateGeneratorsTable`, `ConformetryGeneratorsCommand.filter(…)` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:60` |
| `ConformetryGeneratorsCommand.readGenerators` | 2 | `ConfigurationService.loadConformetryConfiguration`, `ConformetryGeneratorsCommand.map(…)` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:107` |
| `ConformetryGeneratorsCommand.writeSync` | 2 | `ConformetryGeneratorsCommand.generateGeneratorsTable`, `ConformetryGeneratorsCommand.readMarkedFile` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:162` |
| `ConformetryGeneratorsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `ConformetryGeneratorsCommand.synchronize` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:184` |
| `ConventionalConfigIoService.map(…)` | 2 | `ConventionalConfigIoService.find(…)`, `ConventionalConfigIoService.capitalize` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:93` |
| `ConventionalConfigIoService.getReleaseRulesTypes` | 2 | `ConventionalConfigIoService.filter(…)`, `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:184` |
| `ConventionalConfigValidatorsService.getSourceValuesForMarker` | 2 | `ConventionalConfigValidatorsService.map(…)`, `ConventionalConfigValidatorsService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:64` |
| `ConventionalConfigValidatorsService.readMarkerValues` | 2 | `ConventionalConfigIoService.extractMarkerContent`, `ConventionalConfigIoService.parseMarkdownTableValues` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:76` |
| `ConventionalConfigCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `ConventionalConfigCommand.synchronize` | `synchronization/src/modules/conventional-config/conventional-config.command.ts:51` |
| `DevcontainerConfigurationCommand.check` | 2 | `DevcontainerConfigurationCommand.isCurrent`, `DevcontainerConfigurationCommand.reportDifferences` | `synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:80` |
| `DevcontainerConfigurationCommand.writeWhenDrifted` | 2 | `DevcontainerConfigurationCommand.isCurrent`, `DevcontainerConfigurationCommand.write` | `synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:233` |
| `DevcontainerConfigurationCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `DevcontainerConfigurationCommand.synchronize` | `synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:257` |
| `InstalledSkillsService.revertTrackedChanges` | 2 | `InstalledSkillsService.hasChanges`, `InstalledSkillsService.git` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:85` |
| `InstalledSkillsService.findMissingSkills` | 2 | `InstalledSkillsService.filter(…)`, `InstalledSkillsService.readLockedSkillNames` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:159` |
| `InstalledSkillsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `InstalledSkillsCommand.synchronize` | `synchronization/src/modules/installed-skills/installed-skills.command.ts:179` |
| `InstalledSkillsCommand.synchronize` | 2 | `InstalledSkillsCommand.write`, `InstalledSkillsCommand.check` | `synchronization/src/modules/installed-skills/installed-skills.command.ts:194` |
| `PackageManifestsService.writeAll` | 2 | `PackageManifestsService.readRootManifest`, `PackageManifestsService.writePackageManifest` | `synchronization/src/modules/package-manifests/package-manifests.service.ts:205` |
| `PackageManifestsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `PackageManifestsCommand.synchronize` | `synchronization/src/modules/package-manifests/package-manifests.command.ts:50` |
| `ProjectPortsCommand.describeProject` | 2 | `ProjectPortsCommand.find(…)`, `ProjectPortsService.textToPort` | `synchronization/src/modules/project-ports/project-ports.command.ts:61` |
| `ProjectPortsCommand.flatMap(…)` | 2 | `ProjectPortsCommand.isProject`, `ProjectPortsCommand.findProjectDirectories` | `synchronization/src/modules/project-ports/project-ports.command.ts:90` |
| `ProjectPortsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `ProjectPortsCommand.synchronize` | `synchronization/src/modules/project-ports/project-ports.command.ts:248` |
| `PullRequestTemplateCommand.checkTargetSync` | 2 | `PullRequestTemplateCommand.extractMarkerContent`, `PullRequestTemplateCommand.wrapInCodeBlock` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:55` |
| `PullRequestTemplateCommand.handleWriteMode` | 2 | `PullRequestTemplateCommand.filter(…)`, `PullRequestTemplateCommand.writeTargetSync` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:129` |
| `PullRequestTemplateCommand.writeTargetSync` | 2 | `PullRequestTemplateCommand.wrapInCodeBlock`, `PullRequestTemplateCommand.replaceMarkerContent` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:176` |
| `PullRequestTemplateCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `PullRequestTemplateCommand.synchronize` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:202` |
| `SkillExclusionsCommand.findStaleFiles` | 2 | `SkillExclusionsCommand.map(…)`, `SkillExclusionsCommand.filter(…)` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:63` |
| `SkillExclusionsCommand.filter(…)` | 2 | `SkillExclusionsCommand.readExclusionFile`, `SkillExclusionsCommand.renderBlock` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:64` |
| `SkillExclusionsCommand.readExclusionFile` | 2 | `SkillExclusionsCommand.renderStartMarker`, `SkillExclusionsCommand.renderEndMarker` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:72` |
| `SkillExclusionsCommand.readInputs` | 2 | `SkillExclusionsCommand.toSorted(…)`, `SkillExclusionsCommand.flatMap(…)` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:105` |
| `SkillExclusionsCommand.renderBlock` | 2 | `SkillExclusionsCommand.map(…)`, `SkillExclusionsCommand.map(…)` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:126` |
| `SkillExclusionsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `SkillExclusionsCommand.synchronize` | `synchronization/src/modules/skill-exclusions/skill-exclusions.command.ts:173` |
| `TypeormMigrationSqlExtractorService.projectJsonPaths` | 2 | `TypeormMigrationSqlExtractorService.filter(…)`, `TypeormMigrationSqlExtractorService.map(…)` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:171` |
| `TypeormMigrationSqlCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `TypeormMigrationSqlCommand.synchronize` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql.command.ts:104` |
| `VscodeExtensionsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `VscodeExtensionsCommand.synchronize` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:187` |
| `VscodeSettingsCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `VscodeSettingsCommand.synchronize` | `synchronization/src/modules/vscode-settings/vscode-settings.command.ts:101` |
| `SynchronizationCommand.run` | 2 | `SynchronizationService.resolveSynchronizationModeOrExit`, `SynchronizationCommand.synchronize` | `synchronization/src/modules/synchronization/synchronization.command.ts:112` |
| `run` | 2 | `answerGit`, `restore` | `synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:65` |
| `SynchronizationMarkersService.locateMarkers` | 2 | `SynchronizationMarkersService.getStartMarker`, `SynchronizationMarkersService.getEndMarker` | `synchronization/src/modules/synchronization/synchronization-markers.service.ts:24` |
| `SynchronizationService.resolveModeValue` | 1 | `SynchronizationService.isSynchronizationMode` | `synchronization/src/modules/synchronization/synchronization.service.ts:40` |
| `ConformetryGeneratorsCommand.filter(…)` | 1 | `ConformetryGeneratorsCommand.readMarkedFile` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:62` |
| `ConformetryGeneratorsCommand.generateGeneratorsTable` | 1 | `ConformetryGeneratorsCommand.map(…)` | `synchronization/src/modules/conformetry-generators/conformetry-generators.command.ts:94` |
| `ConventionalConfigIoService.writeIssueTemplateDropdown` | 1 | `ConventionalConfigIoService.generateYamlDropdownOptions` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:62` |
| `ConventionalConfigIoService.appendToPresetTypes` | 1 | `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:86` |
| `ConventionalConfigIoService.appendToReleaseRules` | 1 | `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:110` |
| `ConventionalConfigIoService.formatScopesForSettings` | 1 | `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:141` |
| `ConventionalConfigIoService.generateYamlDropdownOptions` | 1 | `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:170` |
| `ConventionalConfigIoService.getPresetConfigTypes` | 1 | `ConventionalConfigIoService.map(…)` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:177` |
| `ConventionalConfigIoService.writeSettingsSync` | 1 | `ConventionalConfigIoService.formatScopesForSettings` | `synchronization/src/modules/conventional-config/conventional-config-io.service.ts:327` |
| `ConventionalConfigValidatorsService.validateMarkerValues` | 1 | `ConventionalConfigValidatorsService.showDifference` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:123` |
| `ConventionalConfigValidatorsService.checkAllSkillsSync` | 1 | `ConventionalConfigValidatorsService.checkSkillSync` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:155` |
| `ConventionalConfigValidatorsService.checkAllTemplatesSync` | 1 | `ConventionalConfigValidatorsService.checkIssueTemplateSync` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:169` |
| `ConventionalConfigValidatorsService.checkReleaseRulesSync` | 1 | `ConventionalConfigValidatorsService.filter(…)` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:244` |
| `ConventionalConfigValidatorsService.checkSettingsSync` | 1 | `ConventionalConfigValidatorsService.showDifference` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:269` |
| `ConventionalConfigValidatorsService.checkSkillSync` | 1 | `ConventionalConfigValidatorsService.checkMarkerSync` | `synchronization/src/modules/conventional-config/conventional-config-validators.service.ts:293` |
| `ConventionalConfigService.filter(…)` | 1 | `ConventionalConfigValidatorsService.checkSkillSync` | `synchronization/src/modules/conventional-config/conventional-config.service.ts:189` |
| `ConventionalConfigService.filter(…)` | 1 | `ConventionalConfigValidatorsService.checkIssueTemplateSync` | `synchronization/src/modules/conventional-config/conventional-config.service.ts:196` |
| `ConventionalConfigCommand.synchronize` | 1 | `ConventionalConfigService.runSynchronization` | `synchronization/src/modules/conventional-config/conventional-config.command.ts:70` |
| `DevcontainerConfigurationCommand.syncFeatures` | 1 | `DevcontainerConfigurationCommand.isDockerFeatureKey` | `synchronization/src/modules/devcontainer-configuration/devcontainer-configuration.command.ts:175` |
| `InstalledSkillsService.filter(…)` | 1 | `InstalledSkillsService.hasChanges` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:52` |
| `InstalledSkillsService.git` | 1 | `InstalledSkillsProcessService.run` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:59` |
| `InstalledSkillsService.hasChanges` | 1 | `InstalledSkillsService.git` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:64` |
| `InstalledSkillsService.runRestore` | 1 | `InstalledSkillsProcessService.run` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:110` |
| `InstalledSkillsService.verifyRestoration` | 1 | `InstalledSkillsService.findMissingSkills` | `synchronization/src/modules/installed-skills/installed-skills.service.ts:127` |
| `PackageManifestsService.sortKeys` | 1 | `PackageManifestsService.toSorted(…)` | `synchronization/src/modules/package-manifests/package-manifests.service.ts:83` |
| `PackageManifestsService.map(…)` | 1 | `PackageManifestsService.checkPackageManifest` | `synchronization/src/modules/package-manifests/package-manifests.service.ts:102` |
| `ProjectPortsService.replacePort` | 1 | `ProjectPortsService.map(…)` | `synchronization/src/modules/project-ports/project-ports.service.ts:34` |
| `ProjectPortsCommand.map(…)` | 1 | `ProjectPortsCommand.describeProject` | `synchronization/src/modules/project-ports/project-ports.command.ts:97` |
| `ProjectPortsCommand.filter(…)` | 1 | `ProjectPortsCommand.isProject` | `synchronization/src/modules/project-ports/project-ports.command.ts:106` |
| `ProjectPortsCommand.listFiles` | 1 | `ProjectPortsCommand.flatMap(…)` | `synchronization/src/modules/project-ports/project-ports.command.ts:115` |
| `ProjectPortsCommand.flatMap(…)` | 1 | `ProjectPortsCommand.listFiles` | `synchronization/src/modules/project-ports/project-ports.command.ts:116` |
| `ProjectPortsCommand.filter(…)` | 1 | `ProjectPortsService.replacePort` | `synchronization/src/modules/project-ports/project-ports.command.ts:163` |
| `ProjectPortsCommand.verifyDistinctPorts` | 1 | `ProjectPortsCommand.filter(…)` | `synchronization/src/modules/project-ports/project-ports.command.ts:225` |
| `ProjectPortsCommand.map(…)` | 1 | `ProjectPortsCommand.synchronizeProject` | `synchronization/src/modules/project-ports/project-ports.command.ts:275` |
| `PullRequestTemplateCommand.handleCheckMode` | 1 | `PullRequestTemplateCommand.checkTargetSync` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:106` |
| `PullRequestTemplateCommand.filter(…)` | 1 | `PullRequestTemplateCommand.checkTargetSync` | `synchronization/src/modules/pull-request-template/pull-request-template.command.ts:134` |
| `TypeormMigrationSqlExtractorService.checkExtractedSql` | 1 | `TypeormMigrationSqlExtractorService.maybeFile` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:33` |
| `TypeormMigrationSqlExtractorService.maybeFile` | 1 | `TypeormMigrationSqlExtractorService.catch(…)` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:84` |
| `TypeormMigrationSqlExtractorService.projectJsonPath` | 1 | `TypeormMigrationSqlExtractorService.some(…)` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:159` |
| `TypeormMigrationSqlExtractorService.map(…)` | 1 | `TypeormMigrationSqlExtractorService.projectJsonPathsForDirectory` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:176` |
| `TypeormMigrationSqlExtractorService.map(…)` | 1 | `TypeormMigrationSqlExtractorService.projectJsonPath` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:196` |
| `TypeormMigrationSqlExtractorService.sortedMigrationEntries` | 1 | `TypeormMigrationSqlExtractorService.filter(…)` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:225` |
| `TypeormMigrationSqlExtractorService.sqlFromQueryCall` | 1 | `TypeormMigrationSqlExtractorService.sqlLiteral` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:237` |
| `TypeormMigrationSqlExtractorService.statementsFromClass` | 1 | `TypeormMigrationSqlExtractorService.statementsFromMethod` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:279` |
| `TypeormMigrationSqlExtractorService.visit` | 1 | `TypeormMigrationSqlExtractorService.sqlFromQueryCall` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:310` |
| `TypeormMigrationSqlExtractorService.visit` | 1 | `TypeormMigrationSqlExtractorService.statementsFromClass` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:332` |
| `TypeormMigrationSqlExtractorService.map(…)` | 1 | `TypeormMigrationSqlExtractorService.parsedProjectTarget` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql-extractor.service.ts:480` |
| `TypeormMigrationSqlCommand.synchronize` | 1 | `TypeormMigrationSqlExtractorService.synchronize` | `synchronization/src/modules/typeorm-migration-sql/typeorm-migration-sql.command.ts:123` |
| `VscodeExtensionsCommand.isCurrent` | 1 | `VscodeExtensionsCommand.hasSameEntries` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:67` |
| `VscodeExtensionsCommand.reportDifferences` | 1 | `VscodeExtensionsCommand.hasSameEntries` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:95` |
| `VscodeExtensionsCommand.reportDrift` | 1 | `VscodeExtensionsCommand.reportDifferences` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:109` |
| `VscodeExtensionsCommand.synchronize` | 1 | `VscodeExtensionsCommand.map(…)` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:206` |
| `VscodeExtensionsCommand.map(…)` | 1 | `VscodeExtensionsCommand.synchronizeDevcontainer` | `synchronization/src/modules/vscode-extensions/vscode-extensions.command.ts:213` |
| `restore` | 1 | `installSkill` | `synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:21` |
| `isDirty` | 1 | `isLockfileDirty` | `synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:42` |
| `answerGit` | 1 | `isDirty` | `synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:56` |
| `lockSkills` | 1 | `map(…)` | `synchronization/src/modules/installed-skills/installed-skills-fixtures.utilities.ts:86` |
| `SynchronizationMarkersService.extractContent` | 1 | `SynchronizationMarkersService.locateMarkers` | `synchronization/src/modules/synchronization/synchronization-markers.service.ts:44` |
| `SynchronizationMarkersService.replaceContent` | 1 | `SynchronizationMarkersService.locateMarkers` | `synchronization/src/modules/synchronization/synchronization-markers.service.ts:65` |

</details>
<!-- callidescope:end -->
