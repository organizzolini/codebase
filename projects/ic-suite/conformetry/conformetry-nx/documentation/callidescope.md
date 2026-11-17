<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 131 |
| Files | 50 |
| Calls traced | 167 |
| Call stacks | 8 |
| Deepest stack | 15 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 15 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `validateExecutor`** — depth ≥ 15 · orphan-root

```text
🚀 validateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/conformetry/conformetry-nx/src/executors/validate/executor.ts:13]
   ↳ Validates one project's instances against their conformetry templates.
  └─> PluginService.runValidation(args: RunValidationArguments): Promise<RunValidationResult> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:422]
     ↳ Validates one project's instances and renders the report.
    └─> ValidationService.validate(args: RunValidationArguments): RunValidationResult [projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:177]
       ↳ Validates every instance and returns the differences found.
      └─> ConfigurationService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:212]
         ↳ Resolves every instance to the template, or templates, that explain it.
        └─> InstanceDiscoveryService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:119]
           ↳ Resolves every instance to the template, or templates, that explain it.
          └─> InstanceDiscoveryMatchingService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:102]
             ↳ Resolves every instance to the template, or templates, that explain it.
            └─> InstanceDiscoveryMatchingService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:160]
               ↳ Weighs every template sharing a file with the instance, best-first.
              └─> InstanceDiscoveryMatchingService.map(…)(…): { matchedFileCount: number; matchRatio: number; template: TemplateDefinition; placeholderValues: Substitutions; substitutions: Substitutions; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:166]
                └─> TemplateDiscoveryService.countMatchingFiles(…): number [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:133]
                   ↳ Counts how many of a template's files the instance path already has.
                  └─> TemplateDiscoveryService.filter(…)(templateFilePath: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:142]
                    └─> TemplateDiscoveryService.resolveInstanceFilePath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:189]
                       ↳ Maps a template file path to the instance file path it governs.
                      └─> RenderingService.renderPath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:125]
                         ↳ Renders a template path with mustache.
                        └─> RenderingService.assertEverySubstitutionSupplied(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:32]
                           ↳ Refuses to render a template asking for a value nobody supplied.
                          └─> RenderingService.collectInterpolatedNames(template: string): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:72]
                             ↳ Every placeholder a template interpolates, deduplicated.
                            └─> RenderingService.walk(spans: TemplateSpans): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:74]
```

**2. `runConformetryGenerator`** — depth ≥ 14 · exported-function

```text
🚀 runConformetryGenerator(…): Promise<string[]> [projects/ic-suite/conformetry/conformetry-nx/src/index.ts:83]
   ↳ Runs one configured generator against an Nx tree.
  └─> PluginService.runGenerator(args: RunGeneratorArguments): Promise<string[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:373]
     ↳ Runs one configured generator against an Nx tree. Writes go to the tree, not disk, so `--dry-run` is honest.
    └─> PluginService.assertPluginInSync(args: { configurationPath: string; workspaceRoot: string; }): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:118]
       ↳ Fails fast when the plugin would run against a stale or broken setup.
      └─> PluginService.assertEmittedPluginCurrent(args: { configurationPath: string; workspaceRoot: string; }): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:84]
         ↳ Fails when the emitted Nx plugin no longer matches the configuration.
        └─> GeneratorService.emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:193]
           ↳ Returns every file the consumer's generator plugin consists of.
          └─> GeneratorService.map(…)(…): { content: string; filePath: string; } [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:219]
            └─> GeneratorService.resolveScopedProjectNames(…): string[] | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:163]
               ↳ The projects a generator's tagged groups admit, or nothing when it has none.
              └─> ScopeService.resolveScopedProjectNames(…): string[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:114]
                 ↳ The projects a generator's tagged groups admit, by name and sorted.
                └─> ScopeService.filter(…)(project: ProjectScope): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:127]
                  └─> ScopeService.some(…)(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:128]
                    └─> ScopeService.matchesProject(args: { group: ConformetryInstanceGroup; project: ProjectScope; }): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:40]
                       ↳ Returns whether a group applies to a project.
                      └─> ScopeService.isProjectGroup(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:29]
                         ↳ Whether a group locates its instances by project tag.
                        └─> ConfigurationService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:183]
                           ↳ Whether a group locates its instances inside the hosts its tags select.
                          └─> InstanceGroupService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-group/instance-group.service.ts:29]
                             ↳ Whether a group locates its instances inside the hosts its tags select.
```

**3. `runBootstrapCli`** — depth ≥ 12 · orphan-root

```text
🚀 runBootstrapCli(workspaceRoot: string): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:65]
   ↳ Bootstraps the plugin, warning rather than failing the install.
  └─> bootstrapPlugin(workspaceRoot: string): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:34]
     ↳ Emits the generator plugin and links it for Nx.
    └─> GeneratorService.emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:193]
       ↳ Returns every file the consumer's generator plugin consists of.
      └─> GeneratorService.map(…)(…): { content: string; filePath: string; } [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:219]
        └─> GeneratorService.resolveScopedProjectNames(…): string[] | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:163]
           ↳ The projects a generator's tagged groups admit, or nothing when it has none.
          └─> ScopeService.resolveScopedProjectNames(…): string[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:114]
             ↳ The projects a generator's tagged groups admit, by name and sorted.
            └─> ScopeService.filter(…)(project: ProjectScope): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:127]
              └─> ScopeService.some(…)(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:128]
                └─> ScopeService.matchesProject(args: { group: ConformetryInstanceGroup; project: ProjectScope; }): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:40]
                   ↳ Returns whether a group applies to a project.
                  └─> ScopeService.isProjectGroup(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:29]
                     ↳ Whether a group locates its instances by project tag.
                    └─> ConfigurationService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:183]
                       ↳ Whether a group locates its instances inside the hosts its tags select.
                      └─> InstanceGroupService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-group/instance-group.service.ts:29]
                         ↳ Whether a group locates its instances inside the hosts its tags select.
```

<details>
<summary>5 more call stacks</summary>

**4. `anonymous`** — depth ≥ 12 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/conformetry/conformetry-nx/src/index.ts:43]
  └─> PluginService.inferTargets(args: InferTargetsArguments): Promise<Map<string, InferredTargets>> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:303]
     ↳ Infers a validation target onto each project with instances. Empty targets still cost a task in every `run-many`.
    └─> InstancesService.findProjectInstances(args: FindProjectInstancesArguments): Promise<Instance[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:96]
       ↳ Expands the instance groups that apply to a project.
      └─> InstancesService.flatMap(…)(this: undefined, group: ConformetryInstanceGroup): Instance[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:112]
        └─> InstancesService.discoverGroup(…): Instance[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:39]
           ↳ Expands one group's globs, reusing an earlier expansion of the same request.
          └─> ConfigurationService.findInstances(args: FindInstancesArguments): Instance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:173]
             ↳ Expands instance globs into the instances that exist.
            └─> InstanceDiscoveryService.findInstances(args: FindInstancesArguments): Instance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:114]
               ↳ Expands instance globs into the instances that exist.
              └─> InstanceDiscoveryLocatingService.findInstances(args: FindInstancesArguments): Instance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:135]
                 ↳ Expands every pattern into one instance per distinct path, name, and scope kind.
                └─> InstanceDiscoveryLocatingService.globEntries(…): Dirent<string>[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:57]
                   ↳ Expands one pattern, leaving out every path an exclude glob matches.
                  └─> InstanceDiscoveryLocatingService.filter(…)(entry: fs.Dirent<string>): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:67]
                    └─> InstanceDiscoveryLocatingService.isExcluded(…): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:76]
                       ↳ Whether an exclude glob matches a found path, workspace-relative.
                      └─> InstanceDiscoveryLocatingService.some(…)(pattern: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:86]
```

**5. `syncGenerator`** — depth ≥ 11 · orphan-root

```text
🚀 syncGenerator(tree: Tree, options?: SyncGeneratorOptions): Promise<SyncGeneratorResult> [projects/ic-suite/conformetry/conformetry-nx/src/generators/sync/generator.ts:31]
   ↳ Regenerates the workspace's conformetry generator plugin.
  └─> GeneratorService.emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:193]
     ↳ Returns every file the consumer's generator plugin consists of.
    └─> GeneratorService.map(…)(…): { content: string; filePath: string; } [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:219]
      └─> GeneratorService.resolveScopedProjectNames(…): string[] | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:163]
         ↳ The projects a generator's tagged groups admit, or nothing when it has none.
        └─> ScopeService.resolveScopedProjectNames(…): string[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:114]
           ↳ The projects a generator's tagged groups admit, by name and sorted.
          └─> ScopeService.filter(…)(project: ProjectScope): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:127]
            └─> ScopeService.some(…)(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:128]
              └─> ScopeService.matchesProject(args: { group: ConformetryInstanceGroup; project: ProjectScope; }): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:40]
                 ↳ Returns whether a group applies to a project.
                └─> ScopeService.isProjectGroup(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:29]
                   ↳ Whether a group locates its instances by project tag.
                  └─> ConfigurationService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:183]
                     ↳ Whether a group locates its instances inside the hosts its tags select.
                    └─> InstanceGroupService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-group/instance-group.service.ts:29]
                       ↳ Whether a group locates its instances inside the hosts its tags select.
```

**6. `AdapterService.listDirectory`** — depth 3 · orphan-root

```text
🚀 AdapterService.listDirectory(directoryPath: string): Promise<DirectoryEntry[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:105]
  └─> AdapterService.listDirectory(…): Promise<DirectoryEntry[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:35]
     ↳ Lists a directory through the tree inside the workspace. Lets a generator see edits made earlier in the same run.
    └─> AdapterService.resolveTreePath(args: { directoryPath: string; workspaceRoot: string; }): string | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:82]
       ↳ Converts an absolute path to the workspace-relative form a `Tree` uses, or returns `undefined` when the path lies…
```

**7. `AdapterService.readFile`** — depth 3 · orphan-root

```text
🚀 AdapterService.readFile(filePath: string): Promise<string> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:115]
  └─> AdapterService.readFile(…): Promise<string> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:61]
     ↳ Reads a file through the tree when possible, the filesystem otherwise.
    └─> AdapterService.resolveTreePath(args: { directoryPath: string; workspaceRoot: string; }): string | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:82]
       ↳ Converts an absolute path to the workspace-relative form a `Tree` uses, or returns `undefined` when the path lies…
```

**8. `AdapterService.writeFile`** — depth 2 · orphan-root

```text
🚀 AdapterService.writeFile(filePath: string, content: string): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:122]
  └─> AdapterService.resolveTreePath(args: { directoryPath: string; workspaceRoot: string; }): string | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:82]
     ↳ Converts an absolute path to the workspace-relative form a `Tree` uses, or returns `undefined` when the path lies…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `bootstrapPlugin` | 9 | `resolveGeneratorService`, `resolveOptionsService`, `resolveProjectsService`, `GeneratorService.emitPlugin`, `OptionsService.resolveConfigurationPath`, `readNxConfiguration`, `ProjectsService.listWorkspaceProjects`, `writePlugin`, `linkPlugin` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:34` |
| `syncGenerator` | 8 | `resolveGeneratorService`, `resolveOptionsService`, `resolveProjectsService`, `GeneratorService.emitPlugin`, `OptionsService.resolveConfigurationPath`, `readNxConfiguration`, `ProjectsService.listWorkspaceProjects`, `assign(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/generators/sync/generator.ts:31` |
| `PluginService.runGenerator` | 7 | `PluginService.resolveOptions`, `PluginService.assertPluginInSync`, `PluginService.resolveGeneratorDefinition`, `AdapterService.createAdapters`, `OptionsService.resolveGeneratorInputs`, `GenerationService.runGenerator`, `PathsService.resolveGenerationPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:373` |

<details>
<summary>68 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GeneratorService.emitPlugin` | 6 | `ConfigurationService.loadConformetryConfiguration`, `GeneratorService.toSorted(…)`, `GeneratorService.buildGeneratorsManifest`, `GeneratorService.map(…)`, `GeneratorService.map(…)`, `GeneratorService.stringify` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:193` |
| `InstancesService.findProjectInstances` | 6 | `ConfigurationService.loadConformetryConfiguration`, `InstancesService.filter(…)`, `InstancesService.flatMap(…)`, `InstancesService.flatMap(…)`, `InstancesService.flatMap(…)`, `InstancesService.filter(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:96` |
| `PathsService.resolveAllowedDirectories` | 6 | `ConfigurationService.loadConformetryConfiguration`, `PathsService.flatMap(…)`, `PathsService.filter(…)`, `PathsService.find(…)`, `PathsService.some(…)`, `PathsService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:114` |
| `PathsService.resolveGenerationPath` | 6 | `PathsService.resolveAllowedDirectories`, `PathsService.resolveExplicitDirectory`, `PathsService.resolveNewProjectPath`, `InstancesService.findProjectInstances`, `PathsService.requireModulePath`, `PathsService.resolveProjectParentPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:334` |
| `PluginService.runValidation` | 6 | `PluginService.resolveOptions`, `PluginService.assertPluginInSync`, `ValidationService.validate`, `InstancesService.findProjectInstances`, `PluginService.resolveTemplates`, `ReportingService.formatReport` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:422` |
| `PluginService.inferTargets` | 5 | `PluginService.resolveOptions`, `PluginService.resolveTemplateInputs`, `PluginService.filter(…)`, `ProjectsService.readProjectScope`, `InstancesService.findProjectInstances` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:303` |
| `ScopeService.resolveScopedProjectNames` | 4 | `ScopeService.filter(…)`, `ScopeService.toSorted(…)`, `ScopeService.map(…)`, `ScopeService.filter(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:114` |
| `PathsService.resolveNewProjectPath` | 4 | `staticDirectoryPrefix`, `missingDirectoryError`, `PathsService.resolveTypeDirectoryPath`, `PathsService.assertDirectoryAllowed` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:218` |
| `ProjectsService.listWorkspaceProjects` | 4 | `ProjectsService.toSorted(…)`, `ProjectsService.map(…)`, `ProjectsService.listProjectConfigurationFiles`, `ProjectsService.readIgnoredPaths` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:108` |
| `PluginService.resolveTemplateInputs` | 4 | `ConfigurationService.loadConformetryConfiguration`, `PluginService.map(…)`, `PluginService.map(…)`, `buildTemplateHashCommand` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:258` |
| `anonymous` | 4 | `resolvePluginService`, `PluginService.inferTargets`, `filter(…)`, `map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/index.ts:43` |
| `ScopeService.resolveGroup` | 3 | `ScopeService.matchesProject`, `ScopeService.isProjectGroup`, `ScopeService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:58` |
| `AdapterService.listDirectory` | 3 | `AdapterService.resolveTreePath`, `AdapterService.map(…)`, `AdapterService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:35` |
| `PathsService.resolveScopedDirectory` | 3 | `ConfigurationService.loadConformetryConfiguration`, `PathsService.find(…)`, `ScopeService.resolveScopedDirectory` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:286` |
| `PluginService.resolveGeneratorDefinition` | 3 | `ConfigurationService.loadConformetryConfiguration`, `PluginService.find(…)`, `PluginService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:182` |
| `PluginService.resolveOptions` | 3 | `OptionsService.readRegisteredConfigurationPath`, `PluginService.readNxConfiguration`, `OptionsService.resolvePluginOptions` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:227` |
| `ScopeService.matchesProject` | 2 | `ScopeService.isProjectGroup`, `ScopeService.every(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:40` |
| `ScopeService.resolveScopedDirectory` | 2 | `ScopeService.find(…)`, `ScopeService.findIndex(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:91` |
| `GeneratorService.buildSchema` | 2 | `GeneratorService.stringify`, `GeneratorService.buildSchemaProperties` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:110` |
| `GeneratorService.map(…)` | 2 | `GeneratorService.buildSchema`, `GeneratorService.resolveScopedProjectNames` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:219` |
| `OptionsService.readRegisteredConfigurationPath` | 2 | `OptionsService.isUnknownArray`, `OptionsService.readString` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.service.ts:48` |
| `OptionsService.resolveConfigurationPath` | 2 | `ConfigurationService.requireConfigurationPath`, `OptionsService.readRegisteredConfigurationPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.service.ts:87` |
| `OptionsService.resolvePluginOptions` | 2 | `ConfigurationService.requireConfigurationPath`, `OptionsService.readString` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.service.ts:129` |
| `matchesSegments` | 2 | `some(…)`, `toSegmentExpression` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:27` |
| `PathsService.assertDirectoryAllowed` | 2 | `PathsService.some(…)`, `InputError.constructor` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:54` |
| `PathsService.resolveProjectParentPath` | 2 | `PathsService.resolveScopedDirectory`, `PathsService.resolveModuleParentPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:258` |
| `ProjectsService.readIgnoredPaths` | 2 | `ProjectsService.filter(…)`, `ProjectsService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:88` |
| `ProjectsService.readProjectScope` | 2 | `ProjectsService.isUnknownArray`, `ProjectsService.filter(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:124` |
| `PluginService.assertEmittedPluginCurrent` | 2 | `GeneratorService.emitPlugin`, `ProjectsService.listWorkspaceProjects` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:84` |
| `PluginService.assertPluginInSync` | 2 | `PluginService.assertTemplatesExist`, `PluginService.assertEmittedPluginCurrent` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:118` |
| `PluginService.resolveTemplates` | 2 | `ConfigurationService.loadConformetryConfiguration`, `PluginService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:278` |
| `runConformetryGenerator` | 2 | `resolvePluginService`, `PluginService.runGenerator` | `projects/ic-suite/conformetry/conformetry-nx/src/index.ts:83` |
| `validateExecutor` | 2 | `resolvePluginService`, `PluginService.runValidation` | `projects/ic-suite/conformetry/conformetry-nx/src/executors/validate/executor.ts:13` |
| `ScopeService.isProjectGroup` | 1 | `ConfigurationService.isProjectScoped` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:29` |
| `ScopeService.find(…)` | 1 | `ScopeService.isProjectGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:94` |
| `ScopeService.filter(…)` | 1 | `ScopeService.isProjectGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:118` |
| `ScopeService.filter(…)` | 1 | `ScopeService.some(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:127` |
| `ScopeService.some(…)` | 1 | `ScopeService.matchesProject` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:128` |
| `GeneratorService.buildGeneratorsManifest` | 1 | `GeneratorService.stringify` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:76` |
| `GeneratorService.resolveScopedProjectNames` | 1 | `ScopeService.resolveScopedProjectNames` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:163` |
| `GeneratorService.map(…)` | 1 | `GeneratorService.buildGeneratorModule` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:210` |
| `AdapterService.readFile` | 1 | `AdapterService.resolveTreePath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:61` |
| `AdapterService.listDirectory` | 1 | `AdapterService.listDirectory` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:105` |
| `AdapterService.readFile` | 1 | `AdapterService.readFile` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:115` |
| `AdapterService.writeFile` | 1 | `AdapterService.resolveTreePath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:122` |
| `InstancesService.discoverGroup` | 1 | `ConfigurationService.findInstances` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:39` |
| `InstancesService.flatMap(…)` | 1 | `ScopeService.resolveGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:107` |
| `InstancesService.flatMap(…)` | 1 | `InstancesService.discoverGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:112` |
| `InstancesService.filter(…)` | 1 | `InstancesService.isInsideProject` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:119` |
| `matchesDirectoryPattern` | 1 | `matchesSegments` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:8` |
| `staticDirectoryPrefix` | 1 | `findIndex(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:19` |
| `some(…)` | 1 | `matchesSegments` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:39` |
| `toSegmentExpression` | 1 | `map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:62` |
| `PathsService.some(…)` | 1 | `matchesDirectoryPattern` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:70` |
| `PathsService.requireModulePath` | 1 | `PathsService.resolveModulePath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:90` |
| `PathsService.filter(…)` | 1 | `ConfigurationService.isProjectScoped` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:131` |
| `PathsService.resolveExplicitDirectory` | 1 | `PathsService.assertDirectoryAllowed` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:147` |
| `PathsService.resolveModuleParentPath` | 1 | `PathsService.toSorted(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:170` |
| `PathsService.resolveModulePath` | 1 | `PathsService.find(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:200` |
| `ProjectsService.map(…)` | 1 | `ProjectsService.readProjectScope` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:114` |
| `PluginService.assertTemplatesExist` | 1 | `ConfigurationService.loadConformetryConfiguration` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:131` |
| `PluginService.map(…)` | 1 | `ConfigurationService.collectTemplate` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:287` |
| `resolveGeneratorService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:18` |
| `resolveOptionsService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:25` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:32` |
| `resolveProjectsService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:39` |
| `runBootstrapCli` | 1 | `bootstrapPlugin` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:65` |
| `linkPlugin` | 1 | `leadsTo` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:100` |

</details>
<!-- callidescope:end -->
