<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 75 |
| Files | 20 |
| Calls traced | 65 |
| Call stacks | 6 |
| Deepest stack | 3 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 9 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `superRefine(…)`** — depth 3 · orphan-root

```text
🚀 superRefine(…)(…): void [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:207]
  └─> find(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:209]
    └─> findIndex(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:210]
```

**2. `callbackSchema`** — depth 2 · orphan-root

```text
🚀 callbackSchema<CallbackType>(): z.ZodType<CallbackType> [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:29]
   ↳ Accepts a configured callback, checked only for being a function.
  └─> custom(…)(value: unknown): value is Function [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:30]
```

**3. `superRefine(…)`** — depth 2 · orphan-root

```text
🚀 superRefine(…)(…): void [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:114]
  └─> some(…)(pattern: string): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:116]
```

<details>
<summary>3 more call stacks</summary>

**4. `refine(…)`** — depth 2 · orphan-root

```text
🚀 refine(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:164]
  └─> map(…)(…): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:165]
```

**5. `refine(…)`** — depth 2 · orphan-root

```text
🚀 refine(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:180]
  └─> map(…)(…): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:181]
```

**6. `superRefine(…)`** — depth 2 · orphan-root

```text
🚀 superRefine(…)(…): void [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:225]
  └─> map(…)(…): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:227]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationFlagsService.readCheckNames` | 4 | `ConfigurationFlagsService.describeAcceptedCheckNames`, `ConfigurationFlagsService.filter(…)`, `ConfigurationFlagsService.map(…)`, `ConfigurationFlagsService.validateCheckNames` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:44` |
| `ConfigurationResolverService.resolveConfiguration` | 4 | `ConfigurationResolverService.resolveCustomStatistics`, `ConfigurationResolverService.resolveInputs`, `ConfigurationResolverService.resolveLimits`, `ConfigurationResolverService.resolveOutputs` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:296` |
| `ConfigurationLoaderService.load` | 3 | `ConfigurationLoaderService.resolveConfigurationPath`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationLoaderService.loadConfigurationModule` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/loader/configuration-loader.service.ts:96` |

<details>
<summary>42 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationResolverService.resolveInput` | 3 | `ConfigurationResolverService.map(…)`, `ConfigurationResolverService.filter(…)`, `ConfigurationResolverService.filter(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:161` |
| `ConfigurationService.loadConfigurationFile` | 3 | `ConfigurationLoaderService.load`, `ConfigurationService.resolveConfiguration`, `ConfigurationService.parseConfiguration` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:55` |
| `ConfigurationFlagsService.resolveFormat` | 2 | `ConfigurationFlagsService.find(…)`, `ConfigurationFlagsService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:130` |
| `ConfigurationLoaderService.loadConfigurationModule` | 2 | `ConfigurationLoaderService.loadJsonConfiguration`, `ConfigurationLoaderService.readDefaultExport` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/loader/configuration-loader.service.ts:38` |
| `ConfigurationResolverService.parseLimitValue` | 2 | `ConfigurationResolverService.parseLimitValueText`, `InvalidLimitValueError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:82` |
| `ConfigurationResolverService.resolveInputs` | 2 | `ConfigurationResolverService.some(…)`, `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:184` |
| `ConfigurationResolverService.map(…)` | 2 | `ConfigurationResolverService.resolveJsonOutput`, `ConfigurationResolverService.resolveMarkdownOutput` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:248` |
| `ConfigurationResolverService.selectCustomStatistics` | 2 | `ConfigurationResolverService.map(…)`, `ConfigurationResolverService.flatMap(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:271` |
| `callbackSchema` | 1 | `custom(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:29` |
| `superRefine(…)` | 1 | `some(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:114` |
| `refine(…)` | 1 | `map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:164` |
| `refine(…)` | 1 | `map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:180` |
| `superRefine(…)` | 1 | `find(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:207` |
| `find(…)` | 1 | `findIndex(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:209` |
| `superRefine(…)` | 1 | `map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:225` |
| `ConfigurationFlagsService.describeAcceptedCheckNames` | 1 | `ConfigurationFlagsService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:37` |
| `ConfigurationFlagsService.validateCheckNames` | 1 | `ConfigurationFlagsService.describeAcceptedCheckNames` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:73` |
| `ConfigurationFlagsService.parseDefaultedOption` | 1 | `ConfigurationFlagsService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:95` |
| `ConfigurationFlagsService.parseDirectoryOption` | 1 | `ConfigurationFlagsService.parseDefaultedOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:102` |
| `ConfigurationFlagsService.requireConfigurationPath` | 1 | `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:116` |
| `ConfigurationFlagsService.selectMode` | 1 | `ConfigurationFlagsService.readCheckNames` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/flags/configuration-flags.service.ts:153` |
| `ConfigurationLoaderService.resolveConfigurationPath` | 1 | `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/loader/configuration-loader.service.ts:81` |
| `ConfigurationResolverService.parseConfigurationInternal` | 1 | `InvalidConfigurationError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:67` |
| `ConfigurationResolverService.parseLimitValueText` | 1 | `InvalidLimitValueError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:97` |
| `ConfigurationResolverService.resolveCustomStatistics` | 1 | `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:120` |
| `ConfigurationResolverService.map(…)` | 1 | `ConfigurationResolverService.resolveTreeSelector` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:125` |
| `ConfigurationResolverService.map(…)` | 1 | `ConfigurationResolverService.resolveInput` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:195` |
| `ConfigurationResolverService.resolveJsonOutput` | 1 | `ConfigurationResolverService.selectCustomStatistics` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:199` |
| `ConfigurationResolverService.resolveLimits` | 1 | `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:214` |
| `ConfigurationResolverService.map(…)` | 1 | `ConfigurationResolverService.parseLimitValue` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:217` |
| `ConfigurationResolverService.resolveMarkdownOutput` | 1 | `ConfigurationResolverService.selectCustomStatistics` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:226` |
| `ConfigurationResolverService.resolveOutputs` | 1 | `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:244` |
| `ConfigurationResolverService.parseConfiguration` | 1 | `ConfigurationResolverService.parseConfigurationInternal` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/modules/resolver/configuration-resolver.service.ts:289` |
| `ConfigurationService.loadConfiguration` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:44` |
| `ConfigurationService.parseConfiguration` | 1 | `ConfigurationResolverService.parseConfiguration` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:69` |
| `ConfigurationService.parseDefaultedOption` | 1 | `ConfigurationFlagsService.parseDefaultedOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:74` |
| `ConfigurationService.parseDirectoryOption` | 1 | `ConfigurationFlagsService.parseDirectoryOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:79` |
| `ConfigurationService.parseOptionalOption` | 1 | `ConfigurationFlagsService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:84` |
| `ConfigurationService.requireConfigurationPath` | 1 | `ConfigurationFlagsService.requireConfigurationPath` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:89` |
| `ConfigurationService.resolveConfiguration` | 1 | `ConfigurationResolverService.resolveConfiguration` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:100` |
| `ConfigurationService.resolveFormat` | 1 | `ConfigurationFlagsService.resolveFormat` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:109` |
| `ConfigurationService.selectMode` | 1 | `ConfigurationFlagsService.selectMode` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:122` |

</details>
<!-- callidescope:end -->
