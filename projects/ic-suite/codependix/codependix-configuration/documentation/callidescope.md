<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codependix/codependix-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 69 |
| Files | 23 |
| Calls traced | 64 |
| Call stacks | 1 |
| Deepest stack | 2 |
| Stacks through recursion | 0 |
| Unfollowable calls | 4 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 7 |
| `maximumBreadth` | 5 |

### Call stacks (depth)

**1. `refine(…)`** — depth 2 · orphan-root

```text
🚀 refine(…)(…): boolean [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:104]
  └─> some(…)(value: string[] | undefined): value is string[] [projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:104]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `InputService.promptForSelect` | 4 | `InputService.assertCanPrompt`, `InputService.map(…)`, `promptCancelledError`, `InputService.find(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:92` |
| `FlagResolutionService.readCheckNames` | 4 | `FlagResolutionService.filter(…)`, `FlagResolutionService.map(…)`, `FlagResolutionService.describeAcceptedCheckNames`, `FlagResolutionService.validateCheckNames` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:84` |
| `FlagResolutionService.selectMode` | 3 | `FlagResolutionService.readCheckNames`, `FlagResolutionService.emptyMode`, `FlagResolutionService.promptForMode` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:139` |

<details>
<summary>35 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationService.loadConfiguration` | 3 | `ConfigurationLoaderService.readAuthoredConfiguration`, `OverrideResolutionService.applyOverrides`, `ConfigurationService.resolveConfiguration` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:224` |
| `ConfigurationService.loadProjectConfiguration` | 3 | `ConfigurationLoaderService.findProjectConfigurationFile`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationLoaderService.loadConfigurationModule` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:247` |
| `OverrideResolutionService.resolveOverride` | 2 | `InputError.constructor`, `buildUndeclaredOverrideMessage` | `projects/ic-suite/codependix/codependix-configuration/src/modules/override-resolution/override-resolution.service.ts:48` |
| `ConfigurationLoaderService.parseConfigurationFile` | 2 | `UnknownConfigurationFileTypeError.constructor`, `ConfigurationLoaderService.loadConfigurationModule` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:122` |
| `ConfigurationLoaderService.readAuthoredConfiguration` | 2 | `ConfigurationLoaderService.parseConfigurationFile`, `ConfigurationLoaderService.resolveConfigurationPath` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:145` |
| `ConfigurationLoaderService.resolveConfigurationPath` | 2 | `ConfigurationLoaderService.findWorkspaceRoot`, `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:154` |
| `ConfigurationService.isProjectNamedOnCommandLine` | 2 | `ConfigurationService.matchesAnyName`, `ConfigurationService.some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:70` |
| `ConfigurationService.splitSelectionArgument` | 2 | `ConfigurationService.filter(…)`, `ConfigurationService.map(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:162` |
| `ConfigurationService.isProjectIncluded` | 2 | `ConfigurationService.matchesAnyName`, `ConfigurationService.isProjectNamedOnCommandLine` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:182` |
| `ConfigurationService.resolveConfiguration` | 2 | `ConfigurationService.resolveBoundaries`, `ConfigurationService.resolveSelection` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:327` |
| `ConfigurationService.resolveForProject` | 2 | `ConfigurationService.isProjectIncluded`, `ConfigurationService.resolveGraphOutput` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:356` |
| `refine(…)` | 1 | `some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.constants.ts:104` |
| `missingInputError` | 1 | `InputError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.constants.ts:29` |
| `promptCancelledError` | 1 | `InputError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.constants.ts:41` |
| `InputService.assertCanPrompt` | 1 | `missingInputError` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:38` |
| `InputService.parseCommaDelimitedOption` | 1 | `InputService.map(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:54` |
| `InputService.parsePathOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/input/input.service.ts:87` |
| `OverrideResolutionService.applyOverrides` | 1 | `OverrideResolutionService.resolveOverride` | `projects/ic-suite/codependix/codependix-configuration/src/modules/override-resolution/override-resolution.service.ts:74` |
| `ConfigurationLoaderService.findWorkspaceRoot` | 1 | `ConfigurationLoaderService.some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:82` |
| `ConfigurationLoaderService.loadConfigurationModule` | 1 | `ConfigurationLoaderService.readDefaultExport` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration-loader.service.ts:106` |
| `FlagResolutionService.describeAcceptedCheckNames` | 1 | `FlagResolutionService.map(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:41` |
| `FlagResolutionService.promptForMode` | 1 | `InputService.promptForSelect` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:57` |
| `FlagResolutionService.validateCheckNames` | 1 | `FlagResolutionService.describeAcceptedCheckNames` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/flag-resolution.service.ts:109` |
| `ConfigurationService.matchesAnyGlob` | 1 | `ConfigurationService.some(…)` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:85` |
| `ConfigurationService.matchesAnyName` | 1 | `ConfigurationService.matchesAnyGlob` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:90` |
| `ConfigurationService.resolveSelection` | 1 | `ConfigurationService.splitSelectionArgument` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:151` |
| `ConfigurationService.isProjectSelected` | 1 | `ConfigurationService.isProjectNamedOnCommandLine` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:207` |
| `ConfigurationService.parseCommaDelimitedOption` | 1 | `InputService.parseCommaDelimitedOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:282` |
| `ConfigurationService.parseFlagOption` | 1 | `InputService.parseFlagOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:287` |
| `ConfigurationService.parseOptionalOption` | 1 | `InputService.parseOptionalOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:292` |
| `ConfigurationService.parsePathOption` | 1 | `InputService.parsePathOption` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:297` |
| `ConfigurationService.requireConfigurationPath` | 1 | `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:309` |
| `ConfigurationService.resolveForWorkspace` | 1 | `ConfigurationService.resolveGraphOutput` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:398` |
| `ConfigurationService.selectMode` | 1 | `FlagResolutionService.selectMode` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:411` |
| `ConfigurationService.touchesFiles` | 1 | `FlagResolutionService.touchesFiles` | `projects/ic-suite/codependix/codependix-configuration/src/modules/configuration/configuration.service.ts:418` |

</details>
<!-- callidescope:end -->
