<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/callidescope/callidescope-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 114 |
| Files | 28 |
| Calls traced | 112 |
| Call stacks | 6 |
| Deepest stack | 5 |
| Stacks through recursion | 0 |
| Unfollowable calls | 12 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `ConfigurationFileService.loadConfiguration`** — depth ≥ 5 · orphan-root

```text
🚀 ConfigurationFileService.loadConfiguration(args: LoadConfigurationArguments): Promise<ResolvedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:270]
   ↳ Loads and validates a callidescope configuration file.
  └─> ConfigurationFileService.loadConfigurationFile(args: LoadConfigurationArguments): Promise<LoadedCallidescopeConfiguration> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:290]
     ↳ Loads a configuration, and says what the file itself declared and which file answered.
    └─> ConfigurationFileService.resolveConfigurationPath(configurationPath: string): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:130]
       ↳ Resolves a configuration path against the cwd, then the repository root.
      └─> ConfigurationFileService.findRepositoryRoot(): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:69]
         ↳ Walks upward from the process cwd looking for the repository root.
        └─> ConfigurationFileService.some(…)(marker: ".git" | "pnpm-workspace.yaml"): boolean [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:74]
```

**2. `flatMap(…)`** — depth 3 · orphan-root

```text
🚀 flatMap(…)(…): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:227]
  └─> readPermittedNames(…): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:146]
     ↳ Reads the names one classified field contributes to the permitted set.
    └─> map(…)([member]: [string, ProjectFieldPermission]): string [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:156]
```

**3. `InputService.suggest`** — depth 3 · orphan-root

```text
🚀 InputService.suggest(input: string): Promise<{ title: string; value: string; }[]> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:141]
  └─> InputService.completeSuggestions(args: { input: string; suggestions: readonly string[]; }): string[] [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:59]
     ↳ Narrows a suggestion list to what has been typed so far.
    └─> InputService.filter(…)(suggestion: string): boolean [projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:64]
```

<details>
<summary>3 more call stacks</summary>

**4. `ConfigurationService.resolveConfiguration`** — depth 3 · orphan-root

```text
🚀 ConfigurationService.resolveConfiguration(configuration: CallidescopeConfiguration): ResolvedCallidescopeConfiguration [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:147]
   ↳ Fills in every field a configuration file may leave out.
  └─> ConfigurationFileService.resolveConfiguration(configuration: CallidescopeConfiguration): ResolvedCallidescopeConfiguration [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:322]
     ↳ Fills in every field a configuration file may leave out.
    └─> ConfigurationFileService.resolveEntryPoints(…): ResolvedCallidescopeEntryPoints [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:162]
       ↳ Applies defaults to the entry-point rules.
```

**5. `callbackSchema`** — depth 2 · orphan-root

```text
🚀 callbackSchema<TCallback>(): z.ZodType<TCallback> [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:296]
   ↳ Accepts a function-valued option without inspecting its signature.
  └─> custom(…)(value: unknown): value is Function [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:297]
```

**6. `ConfigurationService.findConfigurationFileAt`** — depth 2 · orphan-root

```text
🚀 ConfigurationService.findConfigurationFileAt(directory: string): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:72]
   ↳ Finds a configuration file sitting directly at one directory.
  └─> ConfigurationFileService.findConfigurationFileAt(directory: string): string | undefined [projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:250]
     ↳ Finds a configuration file sitting directly at one directory.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `FlagResolutionService.resolveRunFlags` | 7 | `FlagResolutionService.resolveFormat`, `FlagResolutionService.resolveLimitOverrides`, `FlagResolutionService.resolveList`, `FlagResolutionService.resolveEntryPoints`, `FlagResolutionService.resolveExclude`, `FlagResolutionService.resolveLimits`, `FlagResolutionService.resolveWrite` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:426` |
| `ConfigurationFileService.resolveConfiguration` | 5 | `ConfigurationFileService.resolveEntryPoints`, `ConfigurationFileService.resolveExclude`, `ConfigurationFileService.resolveLimits`, `ConfigurationFileService.resolveJsonOutput`, `ConfigurationFileService.resolveMarkdownDestination` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:322` |
| `InputService.promptForAutocompleteMultiselect` | 4 | `InputService.assertCanPrompt`, `InputService.map(…)`, `promptCancelledError`, `InputService.filter(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:130` |

<details>
<summary>54 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InputService.promptForSelect` | 4 | `InputService.assertCanPrompt`, `InputService.map(…)`, `promptCancelledError`, `InputService.find(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:179` |
| `RunPlanService.readCheckNames` | 4 | `RunPlanService.describeAcceptedCheckNames`, `RunPlanService.filter(…)`, `RunPlanService.map(…)`, `RunPlanService.validateCheckNames` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:68` |
| `ConfigurationFileService.loadConfigurationFile` | 4 | `ConfigurationFileService.resolveConfigurationPath`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationFileService.loadConfigurationModule`, `ConfigurationFileService.resolveConfiguration` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:290` |
| `ProjectConfigurationService.loadProjectConfigurations` | 4 | `ProjectConfigurationMissingError.constructor`, `ProjectConfigurationService.loadProjectConfiguration`, `ProjectConfigurationService.assertNoForbiddenFields`, `ProjectConfigurationService.assertComplete` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:362` |
| `RunPlanService.selectMode` | 3 | `RunPlanService.readCheckNames`, `RunPlanService.filter(…)`, `RunPlanService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:269` |
| `ProjectConfigurationService.resolveLimits` | 3 | `ProjectConfigurationService.buildWorkspaceLimits`, `ProjectConfigurationService.map(…)`, `ProjectConfigurationService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:417` |
| `readPermittedNames` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:146` |
| `InputService.assertCanPrompt` | 2 | `InputService.isAtTerminal`, `missingInputError` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:42` |
| `InputService.suggest` | 2 | `InputService.map(…)`, `InputService.completeSuggestions` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:141` |
| `InputService.requireConfigurationPath` | 2 | `InputService.parseOptionalOption`, `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:217` |
| `FlagResolutionService.resolveCount` | 2 | `buildUndeclaredValueMessage`, `buildUnreadableCountMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:93` |
| `FlagResolutionService.resolveEntryPoints` | 2 | `FlagResolutionService.resolveList`, `FlagResolutionService.resolveSwitch` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:168` |
| `FlagResolutionService.resolveFormat` | 2 | `FlagResolutionService.find(…)`, `buildUnknownFormatMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:240` |
| `RunPlanService.prepareLookup` | 2 | `FlagResolutionService.resolveRunFlags`, `flagResolutionError` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:133` |
| `RunPlanService.prepareRun` | 2 | `RunPlanService.selectMode`, `FlagResolutionService.resolveRunFlags` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:193` |
| `ConfigurationFileService.resolveConfigurationPath` | 2 | `ConfigurationFileService.findRepositoryRoot`, `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:130` |
| `ProjectConfigurationService.assertComplete` | 2 | `ProjectConfigurationService.findMissingField`, `ProjectConfigurationIncompleteError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:55` |
| `ProjectConfigurationService.assertNoForbiddenFields` | 2 | `ProjectConfigurationService.findForbiddenField`, `ProjectConfigurationFieldNotPermittedError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:74` |
| `ProjectConfigurationService.findForbiddenField` | 2 | `ProjectConfigurationService.findForbiddenMember`, `ProjectConfigurationService.readForbiddenField` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:163` |
| `ConfigurationService.resolveFormatOption` | 2 | `InputService.isAtTerminal`, `ConfigurationService.promptForSelect` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:166` |
| `flatMap(…)` | 1 | `readPermittedNames` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:227` |
| `callbackSchema` | 1 | `custom(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.constants.ts:296` |
| `missingInputError` | 1 | `InputError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.constants.ts:44` |
| `promptCancelledError` | 1 | `InputError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.constants.ts:56` |
| `InputService.completeSuggestions` | 1 | `InputService.filter(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:59` |
| `InputService.parseCommaDelimitedOption` | 1 | `InputService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/input/input.service.ts:102` |
| `buildUnknownFormatMessage` | 1 | `map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.constants.ts:19` |
| `flagResolutionError` | 1 | `InputError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.constants.ts:87` |
| `FlagResolutionService.resolveDestination` | 1 | `buildUndeclaredDestinationMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:137` |
| `FlagResolutionService.resolveLimitOverrides` | 1 | `FlagResolutionService.resolveCount` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:271` |
| `FlagResolutionService.resolveSwitch` | 1 | `buildUnknownSwitchMessage` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:354` |
| `FlagResolutionService.resolveWrite` | 1 | `FlagResolutionService.resolveDestination` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/flag-resolution/flag-resolution.service.ts:383` |
| `RunPlanService.describeAcceptedCheckNames` | 1 | `RunPlanService.map(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:56` |
| `RunPlanService.validateCheckNames` | 1 | `RunPlanService.describeAcceptedCheckNames` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/run-plan/run-plan.service.ts:100` |
| `ConfigurationFileService.findRepositoryRoot` | 1 | `ConfigurationFileService.some(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:69` |
| `ConfigurationFileService.loadConfigurationModule` | 1 | `ConfigurationFileService.loadJsonConfiguration` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:93` |
| `ConfigurationFileService.loadConfiguration` | 1 | `ConfigurationFileService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration-file.service.ts:270` |
| `ProjectConfigurationService.buildProjectLimits` | 1 | `ProjectConfigurationService.overrideLimit` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:97` |
| `ProjectConfigurationService.findMissingField` | 1 | `ProjectConfigurationService.find(…)` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:239` |
| `ProjectConfigurationService.loadProjectConfiguration` | 1 | `ProjectConfigurationError.constructor` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:281` |
| `ProjectConfigurationService.map(…)` | 1 | `ProjectConfigurationService.buildProjectLimits` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/project-configuration.service.ts:422` |
| `ConfigurationService.findConfigurationFileAt` | 1 | `ConfigurationFileService.findConfigurationFileAt` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:72` |
| `ConfigurationService.loadConfigurationFile` | 1 | `ConfigurationFileService.loadConfigurationFile` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:80` |
| `ConfigurationService.loadProjectConfigurations` | 1 | `ProjectConfigurationService.loadProjectConfigurations` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:87` |
| `ConfigurationService.parseCommaDelimitedOption` | 1 | `InputService.parseCommaDelimitedOption` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:97` |
| `ConfigurationService.parseOptionalOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:102` |
| `ConfigurationService.prepareLookup` | 1 | `RunPlanService.prepareLookup` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:107` |
| `ConfigurationService.prepareRun` | 1 | `RunPlanService.prepareRun` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:114` |
| `ConfigurationService.promptForAutocompleteMultiselect` | 1 | `InputService.promptForAutocompleteMultiselect` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:121` |
| `ConfigurationService.promptForSelect` | 1 | `InputService.promptForSelect` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:130` |
| `ConfigurationService.requireConfigurationPath` | 1 | `InputService.requireConfigurationPath` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:139` |
| `ConfigurationService.resolveConfiguration` | 1 | `ConfigurationFileService.resolveConfiguration` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:147` |
| `ConfigurationService.resolveLimits` | 1 | `ProjectConfigurationService.resolveLimits` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:183` |
| `ConfigurationService.touchesFiles` | 1 | `RunPlanService.touchesFiles` | `projects/ic-suite/callidescope/callidescope-configuration/src/modules/configuration/configuration.service.ts:190` |

</details>
<!-- callidescope:end -->
