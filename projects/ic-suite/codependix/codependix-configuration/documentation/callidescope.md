<!-- callidescope:start -->

## 🔬 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 71 |
| Files | 23 |
| Calls traced | 63 |
| Call stacks | 1 |
| Deepest stack | 2 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 7 |
| `maximumBreadth` | 5 |

### Call stacks (depth)

**1. `refine(…)`** — depth 2 · orphan-root

```text
🚀 refine(…)(…): boolean [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:65]
  └─> some(…)(value: string[] | undefined): value is string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:65]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InputService.promptForSelect` | 4 | `InputService.assertCanPrompt`, `InputService.map(…)`, `promptCancelledError`, `InputService.find(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:75` |
| `FlagResolutionService.readCheckNames` | 4 | `FlagResolutionService.filter(…)`, `FlagResolutionService.map(…)`, `FlagResolutionService.describeAcceptedCheckNames`, `FlagResolutionService.validateCheckNames` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:70` |
| `FlagResolutionService.selectMode` | 3 | `FlagResolutionService.readCheckNames`, `FlagResolutionService.emptyMode`, `FlagResolutionService.promptForMode` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:118` |

<details>
<summary>36 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationService.loadConfiguration` | 3 | `ConfigurationLoaderService.readAuthoredConfiguration`, `OverrideResolutionService.applyOverrides`, `ConfigurationService.resolveConfiguration` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:191` |
| `ConfigurationService.loadProjectConfiguration` | 3 | `ConfigurationLoaderService.resolveProjectConfigurationFile`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationLoaderService.loadConfigurationModule` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:207` |
| `OverrideResolutionService.resolveOverride` | 2 | `InputError.constructor`, `buildUndeclaredOverrideMessage` | `projects/ic-suite/codependix/codependix-configuration/src/modules/override-resolution/override-resolution.service.ts:31` |
| `ConfigurationLoaderService.parseConfigurationFile` | 2 | `UnknownConfigurationFileTypeError.constructor`, `ConfigurationLoaderService.loadConfigurationModule` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:69` |
| `ConfigurationLoaderService.readAuthoredConfiguration` | 2 | `ConfigurationLoaderService.parseConfigurationFile`, `ConfigurationLoaderService.resolveConfigurationPath` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:89` |
| `ConfigurationService.isProjectNamedOnCommandLine` | 2 | `ConfigurationService.matchesAnyName`, `ConfigurationService.some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:66` |
| `ConfigurationService.splitSelectionArgument` | 2 | `ConfigurationService.filter(…)`, `ConfigurationService.map(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:149` |
| `ConfigurationService.isProjectIncluded` | 2 | `ConfigurationService.matchesAnyName`, `ConfigurationService.isProjectNamedOnCommandLine` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:160` |
| `ConfigurationService.resolveConfiguration` | 2 | `ConfigurationService.resolveBoundaries`, `ConfigurationService.resolveSelection` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:309` |
| `ConfigurationService.resolveForProject` | 2 | `ConfigurationService.isProjectIncluded`, `ConfigurationService.resolveGraphOutput` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:330` |
| `refine(…)` | 1 | `some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:65` |
| `missingInputError` | 1 | `InputError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.constants.ts:16` |
| `promptCancelledError` | 1 | `InputError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.constants.ts:22` |
| `InputService.assertCanPrompt` | 1 | `missingInputError` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:33` |
| `InputService.parseCommaDelimitedOption` | 1 | `InputService.map(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:44` |
| `InputService.parsePathOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:70` |
| `OverrideResolutionService.applyOverrides` | 1 | `OverrideResolutionService.resolveOverride` | `projects/ic-suite/codependix/codependix-configuration/src/modules/override-resolution/override-resolution.service.ts:57` |
| `ConfigurationLoaderService.loadConfigurationModule` | 1 | `ConfigurationLoaderService.readDefaultExport` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:53` |
| `ConfigurationLoaderService.resolveConfigurationPath` | 1 | `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:98` |
| `FlagResolutionService.describeAcceptedCheckNames` | 1 | `FlagResolutionService.map(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:35` |
| `FlagResolutionService.promptForMode` | 1 | `InputService.promptForSelect` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:48` |
| `FlagResolutionService.validateCheckNames` | 1 | `FlagResolutionService.describeAcceptedCheckNames` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:95` |
| `ConfigurationService.matchesAnyGlob` | 1 | `ConfigurationService.some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:81` |
| `ConfigurationService.matchesAnyName` | 1 | `ConfigurationService.matchesAnyGlob` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:86` |
| `ConfigurationService.resolveSelection` | 1 | `ConfigurationService.splitSelectionArgument` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:138` |
| `ConfigurationService.isProjectSelected` | 1 | `ConfigurationService.isProjectNamedOnCommandLine` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:178` |
| `ConfigurationService.parseCommaDelimitedOption` | 1 | `InputService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:239` |
| `ConfigurationService.parseFlagOption` | 1 | `InputService.parseFlagOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:244` |
| `ConfigurationService.parseOptionalOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:249` |
| `ConfigurationService.parsePathOption` | 1 | `InputService.parsePathOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:254` |
| `ConfigurationService.requireConfigurationPath` | 1 | `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:261` |
| `ConfigurationService.requireProjectConfigurationPath` | 1 | `ProjectConfigurationPathRequiredError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:275` |
| `ConfigurationService.requireProjectTsconfigPath` | 1 | `ProjectTsconfigPathRequiredError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292` |
| `ConfigurationService.resolveForWorkspace` | 1 | `ConfigurationService.resolveGraphOutput` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:363` |
| `ConfigurationService.selectMode` | 1 | `FlagResolutionService.selectMode` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:376` |
| `ConfigurationService.touchesFiles` | 1 | `FlagResolutionService.touchesFiles` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:383` |

</details>
<!-- callidescope:end -->
