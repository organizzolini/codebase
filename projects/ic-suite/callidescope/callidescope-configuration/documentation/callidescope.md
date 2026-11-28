<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 119 |
| Files | 28 |
| Calls traced | 116 |
| Call stacks | 6 |
| Deepest stack | 4 |
| Stacks through recursion | 0 |
| Unfollowable calls | 15 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `ConfigurationFileService.loadConfiguration`** — depth ≥ 4 · orphan-root

```text
🚀 ConfigurationFileService.loadConfiguration(args: LoadConfigurationArguments): Promise<ResolvedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:189]
   ↳ Loads and validates a configuration file.
  └─> ConfigurationFileService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:201]
     ↳ Loads a configuration, returning the authored object and the file it came from.
    └─> ConfigurationFileService.resolveConfigurationPath(configurationPath: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:95]
       ↳ Resolves a configuration path against the working directory, and nothing else.
      └─> ConfigurationFileNotFoundError.constructor(filePath: string): ConfigurationFileNotFoundError [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:251]
```

**2. `flatMap(…)`** — depth 3 · orphan-root

```text
🚀 flatMap(…)(…): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:140]
  └─> readPermittedNames(…): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:96]
     ↳ Names a field adds; member fields are dotted, as `write.markdown`.
    └─> map(…)([member]: [string, ProjectFieldPermission]): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:106]
```

**3. `InputService.suggest`** — depth 3 · orphan-root

```text
🚀 InputService.suggest(input: string): Promise<{ title: string; value: string; }[]> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:108]
  └─> InputService.completeSuggestions(args: { input: string; suggestions: readonly string[]; }): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:50]
     ↳ Narrows suggestions to those containing the typed text.
    └─> InputService.filter(…)(suggestion: string): boolean [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:55]
```

<details>
<summary>3 more call stacks</summary>

**4. `ConfigurationService.resolveConfiguration`** — depth 3 · orphan-root

```text
🚀 ConfigurationService.resolveConfiguration(configuration: CallidescopeConfiguration): ResolvedCallidescopeConfiguration [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:147]
   ↳ Fills in every field a configuration file may leave out.
  └─> ConfigurationFileService.resolveConfiguration(configuration: CallidescopeConfiguration): ResolvedCallidescopeConfiguration [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:229]
     ↳ Fills in every field a configuration may leave out. Also used by hosts that assemble a configuration object themselves.
    └─> ConfigurationFileService.resolveEntryPoints(…): ResolvedCallidescopeEntryPoints [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:108]
       ↳ Applies defaults to the entry-point rules. Defaulting the authored object once keeps one branch per option.
```

**5. `callbackSchema`** — depth 2 · orphan-root

```text
🚀 callbackSchema<TCallback>(): z.ZodType<TCallback> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:180]
   ↳ Any function: Zod cannot describe callbacks, and parsing wraps them.
  └─> custom(…)(value: unknown): value is Function [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:181]
```

**6. `ConfigurationService.configurationFileExists`** — depth 2 · orphan-root

```text
🚀 ConfigurationService.configurationFileExists(filePath: string): boolean [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:56]
   ↳ Whether a file exists at exactly this path.
  └─> ConfigurationFileService.configurationFileExists(filePath: string): boolean [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:182]
     ↳ Whether a file exists at exactly this path. Nothing is searched for.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `FlagResolutionService.resolveRunFlags` | 7 | `FlagResolutionService.resolveFormat`, `FlagResolutionService.resolveLimitOverrides`, `FlagResolutionService.resolveList`, `FlagResolutionService.resolveEntryPoints`, `FlagResolutionService.resolveExclude`, `FlagResolutionService.resolveLimits`, `FlagResolutionService.resolveWrite` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:331` |
| `ConfigurationFileService.resolveConfiguration` | 5 | `ConfigurationFileService.resolveEntryPoints`, `ConfigurationFileService.resolveExclude`, `ConfigurationFileService.resolveLimits`, `ConfigurationFileService.resolveJsonOutput`, `ConfigurationFileService.resolveMarkdownDestination` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:229` |
| `ProjectConfigurationService.loadProjectConfigurations` | 5 | `ProjectConfigurationPathMissingError.constructor`, `ProjectConfigurationMissingError.constructor`, `ProjectConfigurationService.loadProjectConfiguration`, `ProjectConfigurationService.assertNoForbiddenFields`, `ProjectConfigurationService.assertComplete` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:276` |

<details>
<summary>57 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InputService.promptForAutocompleteMultiselect` | 4 | `InputService.assertCanPrompt`, `InputService.map(…)`, `promptCancelledError`, `InputService.filter(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:97` |
| `InputService.promptForSelect` | 4 | `InputService.assertCanPrompt`, `InputService.map(…)`, `promptCancelledError`, `InputService.find(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:146` |
| `RunPlanService.readCheckNames` | 4 | `RunPlanService.describeAcceptedCheckNames`, `RunPlanService.filter(…)`, `RunPlanService.map(…)`, `RunPlanService.validateCheckNames` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:49` |
| `ConfigurationFileService.loadConfigurationFile` | 4 | `ConfigurationFileService.resolveConfigurationPath`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationFileService.loadConfigurationModule`, `ConfigurationFileService.resolveConfiguration` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:201` |
| `RunPlanService.selectMode` | 3 | `RunPlanService.readCheckNames`, `RunPlanService.filter(…)`, `RunPlanService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:221` |
| `ProjectConfigurationService.resolveLimits` | 3 | `ProjectConfigurationService.buildWorkspaceLimits`, `ProjectConfigurationService.map(…)`, `ProjectConfigurationService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:327` |
| `readPermittedNames` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:96` |
| `InputService.assertCanPrompt` | 2 | `InputService.isAtTerminal`, `missingInputError` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:40` |
| `InputService.suggest` | 2 | `InputService.map(…)`, `InputService.completeSuggestions` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:108` |
| `InputService.requireConfigurationPath` | 2 | `InputService.parseOptionalOption`, `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:179` |
| `InputService.requireProjectConfigurationPath` | 2 | `InputService.parseOptionalOption`, `ProjectConfigurationPathRequiredError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:195` |
| `InputService.requireProjectTsconfigPath` | 2 | `InputService.parseOptionalOption`, `ProjectTsconfigPathRequiredError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:211` |
| `FlagResolutionService.resolveCount` | 2 | `buildUndeclaredValueMessage`, `buildUnreadableCountMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:50` |
| `FlagResolutionService.resolveEntryPoints` | 2 | `FlagResolutionService.resolveList`, `FlagResolutionService.resolveSwitch` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:114` |
| `FlagResolutionService.resolveFormat` | 2 | `FlagResolutionService.find(…)`, `buildUnknownFormatMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:172` |
| `RunPlanService.prepareLookup` | 2 | `FlagResolutionService.resolveRunFlags`, `flagResolutionError` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:100` |
| `RunPlanService.prepareRun` | 2 | `RunPlanService.selectMode`, `FlagResolutionService.resolveRunFlags` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:149` |
| `ProjectConfigurationService.assertComplete` | 2 | `ProjectConfigurationService.findMissingField`, `ProjectConfigurationIncompleteError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:47` |
| `ProjectConfigurationService.assertNoForbiddenFields` | 2 | `ProjectConfigurationService.findForbiddenField`, `ProjectConfigurationFieldNotPermittedError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:66` |
| `ProjectConfigurationService.findForbiddenField` | 2 | `ProjectConfigurationService.findForbiddenMember`, `ProjectConfigurationService.readForbiddenField` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:130` |
| `ConfigurationService.resolveFormatOption` | 2 | `InputService.isAtTerminal`, `ConfigurationService.promptForSelect` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:157` |
| `flatMap(…)` | 1 | `readPermittedNames` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:140` |
| `callbackSchema` | 1 | `custom(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:180` |
| `missingInputError` | 1 | `InputError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.constants.ts:57` |
| `promptCancelledError` | 1 | `InputError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.constants.ts:63` |
| `InputService.completeSuggestions` | 1 | `InputService.filter(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:50` |
| `InputService.parseCommaDelimitedOption` | 1 | `InputService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:77` |
| `buildUnknownFormatMessage` | 1 | `map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.constants.ts:13` |
| `flagResolutionError` | 1 | `InputError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.constants.ts:47` |
| `FlagResolutionService.resolveDestination` | 1 | `buildUndeclaredDestinationMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:86` |
| `FlagResolutionService.resolveLimitOverrides` | 1 | `FlagResolutionService.resolveCount` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:197` |
| `FlagResolutionService.resolveSwitch` | 1 | `buildUnknownSwitchMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:264` |
| `FlagResolutionService.resolveWrite` | 1 | `FlagResolutionService.resolveDestination` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:293` |
| `RunPlanService.describeAcceptedCheckNames` | 1 | `RunPlanService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:42` |
| `RunPlanService.validateCheckNames` | 1 | `RunPlanService.describeAcceptedCheckNames` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:78` |
| `ConfigurationFileService.loadConfigurationModule` | 1 | `ConfigurationFileService.loadJsonConfiguration` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:58` |
| `ConfigurationFileService.resolveConfigurationPath` | 1 | `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:95` |
| `ConfigurationFileService.loadConfiguration` | 1 | `ConfigurationFileService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:189` |
| `ProjectConfigurationService.buildProjectLimits` | 1 | `ProjectConfigurationService.overrideLimit` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:84` |
| `ProjectConfigurationService.findMissingField` | 1 | `ProjectConfigurationService.find(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:187` |
| `ProjectConfigurationService.loadProjectConfiguration` | 1 | `ProjectConfigurationError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:224` |
| `ProjectConfigurationService.map(…)` | 1 | `ProjectConfigurationService.buildProjectLimits` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:332` |
| `ConfigurationService.configurationFileExists` | 1 | `ConfigurationFileService.configurationFileExists` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:56` |
| `ConfigurationService.loadConfigurationFile` | 1 | `ConfigurationFileService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:64` |
| `ConfigurationService.loadProjectConfigurations` | 1 | `ProjectConfigurationService.loadProjectConfigurations` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:71` |
| `ConfigurationService.parseCommaDelimitedOption` | 1 | `InputService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:81` |
| `ConfigurationService.parseOptionalOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:86` |
| `ConfigurationService.prepareLookup` | 1 | `RunPlanService.prepareLookup` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:91` |
| `ConfigurationService.prepareRun` | 1 | `RunPlanService.prepareRun` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:98` |
| `ConfigurationService.promptForAutocompleteMultiselect` | 1 | `InputService.promptForAutocompleteMultiselect` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:105` |
| `ConfigurationService.promptForSelect` | 1 | `InputService.promptForSelect` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:114` |
| `ConfigurationService.requireConfigurationPath` | 1 | `InputService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:123` |
| `ConfigurationService.requireProjectConfigurationPath` | 1 | `InputService.requireProjectConfigurationPath` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:131` |
| `ConfigurationService.requireProjectTsconfigPath` | 1 | `InputService.requireProjectTsconfigPath` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:139` |
| `ConfigurationService.resolveConfiguration` | 1 | `ConfigurationFileService.resolveConfiguration` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:147` |
| `ConfigurationService.resolveLimits` | 1 | `ProjectConfigurationService.resolveLimits` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:174` |
| `ConfigurationService.touchesFiles` | 1 | `RunPlanService.touchesFiles` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:181` |

</details>
<!-- callidescope:end -->
