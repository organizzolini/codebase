<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 131 |
| Files | 50 |
| Calls traced | 168 |
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
🚀 validateExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/conformetry/conformetry-nx/src/executors/validate/executor.ts:16]
   ↳ Validates one project's instances against their conformetry templates.
  └─> PluginService.runValidation(args: RunValidationArguments): Promise<RunValidationResult> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:449]
     ↳ Validates one project's instances and renders the report.
    └─> ValidationService.validate(args: RunValidationArguments): RunValidationResult [projects/ic-suite/conformetry/conformetry-validation/src/modules/validation/validation.service.ts:194]
       ↳ Validates every instance and returns the differences found.
      └─> ConfigurationService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:257]
         ↳ Resolves every instance to the template, or templates, that explain it.
        └─> InstanceDiscoveryService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:123]
           ↳ Resolves every instance to the template, or templates, that explain it.
          └─> InstanceDiscoveryMatchingService.matchInstances(…): ResolvedInstances [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:118]
             ↳ Resolves every instance to the template — or templates — that explain it.
            └─> InstanceDiscoveryMatchingService.matchTemplates(…): TemplateMatch[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:180]
               ↳ Weighs every template that shares at least one file with the instance, best-first.
              └─> InstanceDiscoveryMatchingService.map(…)(…): { matchedFileCount: number; matchRatio: number; template: TemplateDefinition; placeholderValues: Substitutions; substitutions: Substitutions; } [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-matching.service.ts:186]
                └─> TemplateDiscoveryService.countMatchingFiles(…): number [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:146]
                   ↳ Counts how many of a template's files the instance path already has.
                  └─> TemplateDiscoveryService.filter(…)(templateFilePath: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:155]
                    └─> TemplateDiscoveryService.resolveInstanceFilePath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/template-discovery/template-discovery.service.ts:204]
                       ↳ Maps a template file path to the instance file path it governs.
                      └─> RenderingService.renderPath(…): string [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:142]
                         ↳ Renders a template path with mustache, the same way contents are rendered.
                        └─> RenderingService.assertEverySubstitutionSupplied(…): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:35]
                           ↳ Refuses to render a template asking for a value nobody supplied.
                          └─> RenderingService.collectInterpolatedNames(template: string): string[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:80]
                             ↳ Every placeholder a template interpolates, deduplicated.
                            └─> RenderingService.walk(spans: TemplateSpans): void [projects/ic-suite/conformetry/conformetry-configuration/src/modules/rendering/rendering.service.ts:82]
```

**2. `runConformetryGenerator`** — depth ≥ 14 · exported-function

```text
🚀 runConformetryGenerator(…): Promise<string[]> [projects/ic-suite/conformetry/conformetry-nx/src/index.ts:93]
   ↳ Runs one configured generator against an Nx tree.
  └─> PluginService.runGenerator(args: RunGeneratorArguments): Promise<string[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:404]
     ↳ Runs one configured generator against an Nx tree.
    └─> PluginService.assertPluginInSync(args: { configurationPath: string; workspaceRoot: string; }): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:122]
       ↳ Fails fast when the plugin would run against a stale or broken setup.
      └─> PluginService.assertEmittedPluginCurrent(args: { configurationPath: string; workspaceRoot: string; }): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:88]
         ↳ Fails when the emitted Nx plugin no longer matches the configuration. `generators.json` and its schemas are derived…
        └─> GeneratorService.emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:212]
           ↳ Returns every file the consumer's generator plugin consists of.
          └─> GeneratorService.map(…)(…): { content: string; filePath: string; } [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:238]
            └─> GeneratorService.resolveScopedProjectNames(…): string[] | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:180]
               ↳ The projects a generator's tagged groups admit, or nothing when it has none.
              └─> ScopeService.resolveScopedProjectNames(…): string[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:135]
                 ↳ The projects a generator's groups admit, by name and sorted.
                └─> ScopeService.filter(…)(project: ProjectScope): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:148]
                  └─> ScopeService.some(…)(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:149]
                    └─> ScopeService.matchesProject(args: { group: ConformetryInstanceGroup; project: ProjectScope; }): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:53]
                       ↳ Returns whether a group applies to a project.
                      └─> ScopeService.isProjectGroup(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:39]
                         ↳ Whether a group locates its instances by project tag.
                        └─> ConfigurationService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:226]
                           ↳ Whether a group locates its instances inside the hosts its tags select.
                          └─> InstanceGroupService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-group/instance-group.service.ts:42]
                             ↳ Whether a group locates its instances inside the hosts its tags select.
```

**3. `runBootstrapCli`** — depth ≥ 12 · orphan-root

```text
🚀 runBootstrapCli(workspaceRoot: string): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:71]
   ↳ Bootstraps the plugin, warning rather than failing the install.
  └─> bootstrapPlugin(workspaceRoot: string): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:39]
     ↳ Emits the generator plugin and puts it where Nx will find it.
    └─> GeneratorService.emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:212]
       ↳ Returns every file the consumer's generator plugin consists of.
      └─> GeneratorService.map(…)(…): { content: string; filePath: string; } [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:238]
        └─> GeneratorService.resolveScopedProjectNames(…): string[] | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:180]
           ↳ The projects a generator's tagged groups admit, or nothing when it has none.
          └─> ScopeService.resolveScopedProjectNames(…): string[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:135]
             ↳ The projects a generator's groups admit, by name and sorted.
            └─> ScopeService.filter(…)(project: ProjectScope): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:148]
              └─> ScopeService.some(…)(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:149]
                └─> ScopeService.matchesProject(args: { group: ConformetryInstanceGroup; project: ProjectScope; }): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:53]
                   ↳ Returns whether a group applies to a project.
                  └─> ScopeService.isProjectGroup(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:39]
                     ↳ Whether a group locates its instances by project tag.
                    └─> ConfigurationService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:226]
                       ↳ Whether a group locates its instances inside the hosts its tags select.
                      └─> InstanceGroupService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-group/instance-group.service.ts:42]
                         ↳ Whether a group locates its instances inside the hosts its tags select.
```

<details>
<summary>5 more call stacks</summary>

**4. `anonymous`** — depth ≥ 12 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/conformetry/conformetry-nx/src/index.ts:49]
  └─> PluginService.inferTargets(args: InferTargetsArguments): Promise<Map<string, InferredTargets>> [projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:335]
     ↳ Infers a validation target onto every project that holds at least one instance.
    └─> InstancesService.findProjectInstances(args: FindProjectInstancesArguments): Promise<Instance[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:109]
       ↳ Expands every instance group that applies to a project, keeping only the instances that live inside it.
      └─> InstancesService.flatMap(…)(this: undefined, group: ConformetryInstanceGroup): Instance[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:125]
        └─> InstancesService.discoverGroup(…): Instance[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:46]
           ↳ Expands one group's globs, reusing an earlier expansion of the same ones.
          └─> ConfigurationService.findInstances(args: FindInstancesArguments): Instance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:216]
             ↳ Expands instance globs into the instances that exist.
            └─> InstanceDiscoveryService.findInstances(args: FindInstancesArguments): Instance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery.service.ts:118]
               ↳ Expands instance globs into the instances that exist.
              └─> InstanceDiscoveryLocatingService.findInstances(args: FindInstancesArguments): Instance[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:156]
                 ↳ Expands every pattern and returns one instance per distinct path, name, and scope kind.
                └─> InstanceDiscoveryLocatingService.globEntries(…): Dirent<string>[] [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:66]
                   ↳ Expands one pattern, leaving out every path an exclude glob matches.
                  └─> InstanceDiscoveryLocatingService.filter(…)(entry: fs.Dirent<string>): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:76]
                    └─> InstanceDiscoveryLocatingService.isExcluded(…): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:85]
                       ↳ Whether an exclude glob matches a found path, workspace-relative.
                      └─> InstanceDiscoveryLocatingService.some(…)(pattern: string): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-discovery/instance-discovery-locating.service.ts:95]
```

**5. `syncGenerator`** — depth ≥ 11 · orphan-root

```text
🚀 syncGenerator(tree: Tree, options?: SyncGeneratorOptions): Promise<SyncGeneratorResult> [projects/ic-suite/conformetry/conformetry-nx/src/generators/sync/generator.ts:32]
   ↳ Regenerates the workspace's conformetry generator plugin.
  └─> GeneratorService.emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:212]
     ↳ Returns every file the consumer's generator plugin consists of.
    └─> GeneratorService.map(…)(…): { content: string; filePath: string; } [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:238]
      └─> GeneratorService.resolveScopedProjectNames(…): string[] | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:180]
         ↳ The projects a generator's tagged groups admit, or nothing when it has none.
        └─> ScopeService.resolveScopedProjectNames(…): string[] [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:135]
           ↳ The projects a generator's groups admit, by name and sorted.
          └─> ScopeService.filter(…)(project: ProjectScope): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:148]
            └─> ScopeService.some(…)(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:149]
              └─> ScopeService.matchesProject(args: { group: ConformetryInstanceGroup; project: ProjectScope; }): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:53]
                 ↳ Returns whether a group applies to a project.
                └─> ScopeService.isProjectGroup(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:39]
                   ↳ Whether a group locates its instances by project tag.
                  └─> ConfigurationService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/configuration/configuration.service.ts:226]
                     ↳ Whether a group locates its instances inside the hosts its tags select.
                    └─> InstanceGroupService.isProjectScoped(group: ConformetryInstanceGroup): boolean [projects/ic-suite/conformetry/conformetry-configuration/src/modules/instance-group/instance-group.service.ts:42]
                       ↳ Whether a group locates its instances inside the hosts its tags select.
```

**6. `AdapterService.listDirectory`** — depth 3 · orphan-root

```text
🚀 AdapterService.listDirectory(directoryPath: string): Promise<DirectoryEntry[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:114]
  └─> AdapterService.listDirectory(…): Promise<DirectoryEntry[]> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:42]
     ↳ Lists a directory through the tree when it is inside the workspace, and through the filesystem otherwise.
    └─> AdapterService.resolveTreePath(args: { directoryPath: string; workspaceRoot: string; }): string | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:89]
       ↳ Converts an absolute path to the workspace-relative form a `Tree` uses, or returns `undefined` when the path lies…
```

**7. `AdapterService.readFile`** — depth 3 · orphan-root

```text
🚀 AdapterService.readFile(filePath: string): Promise<string> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:124]
  └─> AdapterService.readFile(…): Promise<string> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:68]
     ↳ Reads a file through the tree when possible, the filesystem otherwise.
    └─> AdapterService.resolveTreePath(args: { directoryPath: string; workspaceRoot: string; }): string | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:89]
       ↳ Converts an absolute path to the workspace-relative form a `Tree` uses, or returns `undefined` when the path lies…
```

**8. `AdapterService.writeFile`** — depth 2 · orphan-root

```text
🚀 AdapterService.writeFile(filePath: string, content: string): Promise<void> [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:131]
  └─> AdapterService.resolveTreePath(args: { directoryPath: string; workspaceRoot: string; }): string | undefined [projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:89]
     ↳ Converts an absolute path to the workspace-relative form a `Tree` uses, or returns `undefined` when the path lies…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `bootstrapPlugin` | 9 | `resolveGeneratorService`, `resolveOptionsService`, `resolveProjectsService`, `GeneratorService.emitPlugin`, `OptionsService.resolveConfigurationPath`, `readNxConfiguration`, `ProjectsService.listWorkspaceProjects`, `writePlugin`, `linkPlugin` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:39` |
| `syncGenerator` | 8 | `resolveGeneratorService`, `resolveOptionsService`, `resolveProjectsService`, `GeneratorService.emitPlugin`, `OptionsService.resolveConfigurationPath`, `readNxConfiguration`, `ProjectsService.listWorkspaceProjects`, `assign(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/generators/sync/generator.ts:32` |
| `PluginService.runGenerator` | 7 | `PluginService.resolveOptions`, `PluginService.assertPluginInSync`, `PluginService.resolveGeneratorDefinition`, `AdapterService.createAdapters`, `OptionsService.resolveGeneratorInputs`, `GenerationService.runGenerator`, `PathsService.resolveGenerationPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:404` |

<details>
<summary>68 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GeneratorService.emitPlugin` | 6 | `ConfigurationService.loadConformetryConfiguration`, `GeneratorService.toSorted(…)`, `GeneratorService.buildGeneratorsManifest`, `GeneratorService.map(…)`, `GeneratorService.map(…)`, `GeneratorService.stringify` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:212` |
| `InstancesService.findProjectInstances` | 6 | `ConfigurationService.loadConformetryConfiguration`, `InstancesService.filter(…)`, `InstancesService.flatMap(…)`, `InstancesService.flatMap(…)`, `InstancesService.flatMap(…)`, `InstancesService.filter(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:109` |
| `PathsService.resolveAllowedDirectories` | 6 | `ConfigurationService.loadConformetryConfiguration`, `PathsService.flatMap(…)`, `PathsService.filter(…)`, `PathsService.find(…)`, `PathsService.some(…)`, `PathsService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:126` |
| `PathsService.resolveGenerationPath` | 6 | `PathsService.resolveAllowedDirectories`, `PathsService.resolveExplicitDirectory`, `PathsService.resolveNewProjectPath`, `InstancesService.findProjectInstances`, `PathsService.requireModulePath`, `PathsService.resolveProjectParentPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:365` |
| `PluginService.runValidation` | 6 | `PluginService.resolveOptions`, `PluginService.assertPluginInSync`, `ValidationService.validate`, `InstancesService.findProjectInstances`, `PluginService.resolveTemplates`, `ReportingService.formatReport` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:449` |
| `PluginService.inferTargets` | 5 | `PluginService.resolveOptions`, `PluginService.resolveTemplateInputs`, `PluginService.filter(…)`, `ProjectsService.readProjectScope`, `InstancesService.findProjectInstances` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:335` |
| `ScopeService.resolveScopedProjectNames` | 4 | `ScopeService.filter(…)`, `ScopeService.toSorted(…)`, `ScopeService.map(…)`, `ScopeService.filter(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:135` |
| `PathsService.resolveNewProjectPath` | 4 | `staticDirectoryPrefix`, `missingDirectoryError`, `PathsService.resolveTypeDirectoryPath`, `PathsService.assertDirectoryAllowed` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:241` |
| `ProjectsService.listWorkspaceProjects` | 4 | `ProjectsService.toSorted(…)`, `ProjectsService.map(…)`, `ProjectsService.listProjectConfigurationFiles`, `ProjectsService.readIgnoredPaths` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:118` |
| `PluginService.resolveGeneratorDefinition` | 4 | `ConfigurationService.resolveConfigurationPath`, `ConfigurationService.loadConformetryConfiguration`, `PluginService.find(…)`, `PluginService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:191` |
| `PluginService.resolveTemplateInputs` | 4 | `ConfigurationService.loadConformetryConfiguration`, `PluginService.map(…)`, `PluginService.map(…)`, `buildTemplateHashCommand` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:286` |
| `anonymous` | 4 | `resolvePluginService`, `PluginService.inferTargets`, `filter(…)`, `map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/index.ts:49` |
| `ScopeService.resolveGroup` | 3 | `ScopeService.matchesProject`, `ScopeService.isProjectGroup`, `ScopeService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:75` |
| `AdapterService.listDirectory` | 3 | `AdapterService.resolveTreePath`, `AdapterService.map(…)`, `AdapterService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:42` |
| `PathsService.resolveScopedDirectory` | 3 | `ConfigurationService.loadConformetryConfiguration`, `PathsService.find(…)`, `ScopeService.resolveScopedDirectory` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:311` |
| `PluginService.resolveOptions` | 3 | `OptionsService.readRegisteredConfigurationPath`, `PluginService.readNxConfiguration`, `OptionsService.resolvePluginOptions` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:245` |
| `ScopeService.matchesProject` | 2 | `ScopeService.isProjectGroup`, `ScopeService.every(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:53` |
| `ScopeService.resolveScopedDirectory` | 2 | `ScopeService.find(…)`, `ScopeService.findIndex(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:109` |
| `GeneratorService.buildSchema` | 2 | `GeneratorService.stringify`, `GeneratorService.buildSchemaProperties` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:122` |
| `GeneratorService.map(…)` | 2 | `GeneratorService.buildSchema`, `GeneratorService.resolveScopedProjectNames` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:238` |
| `OptionsService.readRegisteredConfigurationPath` | 2 | `OptionsService.isUnknownArray`, `OptionsService.readString` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.service.ts:51` |
| `OptionsService.resolveConfigurationPath` | 2 | `ConfigurationService.requireConfigurationPath`, `OptionsService.readRegisteredConfigurationPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.service.ts:98` |
| `OptionsService.resolvePluginOptions` | 2 | `ConfigurationService.requireConfigurationPath`, `OptionsService.readString` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/options/options.service.ts:145` |
| `matchesSegments` | 2 | `some(…)`, `toSegmentExpression` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:30` |
| `PathsService.assertDirectoryAllowed` | 2 | `PathsService.some(…)`, `InputError.constructor` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:59` |
| `PathsService.resolveProjectParentPath` | 2 | `PathsService.resolveScopedDirectory`, `PathsService.resolveModuleParentPath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:281` |
| `ProjectsService.readIgnoredPaths` | 2 | `ProjectsService.filter(…)`, `ProjectsService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:97` |
| `ProjectsService.readProjectScope` | 2 | `ProjectsService.isUnknownArray`, `ProjectsService.filter(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:134` |
| `PluginService.assertEmittedPluginCurrent` | 2 | `GeneratorService.emitPlugin`, `ProjectsService.listWorkspaceProjects` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:88` |
| `PluginService.assertPluginInSync` | 2 | `PluginService.assertTemplatesExist`, `PluginService.assertEmittedPluginCurrent` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:122` |
| `PluginService.resolveTemplates` | 2 | `ConfigurationService.loadConformetryConfiguration`, `PluginService.map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:306` |
| `runConformetryGenerator` | 2 | `resolvePluginService`, `PluginService.runGenerator` | `projects/ic-suite/conformetry/conformetry-nx/src/index.ts:93` |
| `validateExecutor` | 2 | `resolvePluginService`, `PluginService.runValidation` | `projects/ic-suite/conformetry/conformetry-nx/src/executors/validate/executor.ts:16` |
| `ScopeService.isProjectGroup` | 1 | `ConfigurationService.isProjectScoped` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:39` |
| `ScopeService.find(…)` | 1 | `ScopeService.isProjectGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:112` |
| `ScopeService.filter(…)` | 1 | `ScopeService.isProjectGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:139` |
| `ScopeService.filter(…)` | 1 | `ScopeService.some(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:148` |
| `ScopeService.some(…)` | 1 | `ScopeService.matchesProject` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/scope/scope.service.ts:149` |
| `GeneratorService.buildGeneratorsManifest` | 1 | `GeneratorService.stringify` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:86` |
| `GeneratorService.resolveScopedProjectNames` | 1 | `ScopeService.resolveScopedProjectNames` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:180` |
| `GeneratorService.map(…)` | 1 | `GeneratorService.buildGeneratorModule` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/generator.service.ts:229` |
| `AdapterService.readFile` | 1 | `AdapterService.resolveTreePath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:68` |
| `AdapterService.listDirectory` | 1 | `AdapterService.listDirectory` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:114` |
| `AdapterService.readFile` | 1 | `AdapterService.readFile` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:124` |
| `AdapterService.writeFile` | 1 | `AdapterService.resolveTreePath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/adapter/adapter.service.ts:131` |
| `InstancesService.discoverGroup` | 1 | `ConfigurationService.findInstances` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:46` |
| `InstancesService.flatMap(…)` | 1 | `ScopeService.resolveGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:120` |
| `InstancesService.flatMap(…)` | 1 | `InstancesService.discoverGroup` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:125` |
| `InstancesService.filter(…)` | 1 | `InstancesService.isInsideProject` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/instances/instances.service.ts:132` |
| `matchesDirectoryPattern` | 1 | `matchesSegments` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:11` |
| `staticDirectoryPrefix` | 1 | `findIndex(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:22` |
| `some(…)` | 1 | `matchesSegments` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:42` |
| `toSegmentExpression` | 1 | `map(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.utilities.ts:65` |
| `PathsService.some(…)` | 1 | `matchesDirectoryPattern` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:75` |
| `PathsService.requireModulePath` | 1 | `PathsService.resolveModulePath` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:97` |
| `PathsService.filter(…)` | 1 | `ConfigurationService.isProjectScoped` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:143` |
| `PathsService.resolveExplicitDirectory` | 1 | `PathsService.assertDirectoryAllowed` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:159` |
| `PathsService.resolveModuleParentPath` | 1 | `PathsService.toSorted(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:187` |
| `PathsService.resolveModulePath` | 1 | `PathsService.find(…)` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/paths/paths.service.ts:219` |
| `ProjectsService.map(…)` | 1 | `ProjectsService.readProjectScope` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/projects/projects.service.ts:124` |
| `PluginService.assertTemplatesExist` | 1 | `ConfigurationService.loadConformetryConfiguration` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:138` |
| `PluginService.map(…)` | 1 | `ConfigurationService.collectTemplate` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin.service.ts:315` |
| `resolveGeneratorService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:18` |
| `resolveOptionsService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:25` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:32` |
| `resolveProjectsService` | 1 | `resolvePluginContext` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/plugin/plugin-context.utilities.ts:39` |
| `runBootstrapCli` | 1 | `bootstrapPlugin` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:71` |
| `linkPlugin` | 1 | `leadsTo` | `projects/ic-suite/conformetry/conformetry-nx/src/modules/generator/bootstrap.utilities.ts:113` |

</details>
<!-- callidescope:end -->
