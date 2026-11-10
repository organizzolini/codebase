<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/codometer/codometer-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 75 |
| Files | 20 |
| Calls traced | 67 |
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
🚀 superRefine(…)(…): void [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:209]
  └─> find(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:211]
    └─> findIndex(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:212]
```

**2. `callbackSchema`** — depth 2 · orphan-root

```text
🚀 callbackSchema<CallbackType>(): z.ZodType<CallbackType> [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:36]
   ↳ Accepts a configured callback.
  └─> custom(…)(value: unknown): value is Function [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:37]
```

**3. `superRefine(…)`** — depth 2 · orphan-root

```text
🚀 superRefine(…)(…): void [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:107]
  └─> some(…)(pattern: string): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:109]
```

<details>
<summary>3 more call stacks</summary>

**4. `refine(…)`** — depth 2 · orphan-root

```text
🚀 refine(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:166]
  └─> map(…)(…): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:167]
```

**5. `refine(…)`** — depth 2 · orphan-root

```text
🚀 refine(…)(…): boolean [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:182]
  └─> map(…)(…): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:183]
```

**6. `superRefine(…)`** — depth 2 · orphan-root

```text
🚀 superRefine(…)(…): void [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:227]
  └─> map(…)(…): string [projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:229]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationFlagsService.readCheckNames` | 4 | `ConfigurationFlagsService.describeAcceptedCheckNames`, `ConfigurationFlagsService.filter(…)`, `ConfigurationFlagsService.map(…)`, `ConfigurationFlagsService.validateCheckNames` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:58` |
| `ConfigurationResolverService.resolveConfiguration` | 4 | `ConfigurationResolverService.resolveCustomStatistics`, `ConfigurationResolverService.resolveInputs`, `ConfigurationResolverService.resolveLimits`, `ConfigurationResolverService.resolveOutputs` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:336` |
| `ConfigurationLoaderService.load` | 3 | `ConfigurationLoaderService.resolveConfigurationPath`, `UnknownConfigurationFileTypeError.constructor`, `ConfigurationLoaderService.loadConfigurationModule` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-loader.service.ts:162` |

<details>
<summary>42 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationResolverService.resolveInput` | 3 | `ConfigurationResolverService.map(…)`, `ConfigurationResolverService.filter(…)`, `ConfigurationResolverService.filter(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:196` |
| `ConfigurationService.loadConfigurationFile` | 3 | `ConfigurationLoaderService.load`, `ConfigurationService.resolveConfiguration`, `ConfigurationService.parseConfiguration` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:78` |
| `ConfigurationFlagsService.resolveFormat` | 2 | `ConfigurationFlagsService.find(…)`, `ConfigurationFlagsService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:173` |
| `ConfigurationLoaderService.loadConfigurationModule` | 2 | `ConfigurationLoaderService.loadJsonConfiguration`, `ConfigurationLoaderService.readDefaultExport` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-loader.service.ts:75` |
| `ConfigurationLoaderService.resolveConfigurationPath` | 2 | `ConfigurationLoaderService.findRepositoryRoot`, `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-loader.service.ts:126` |
| `ConfigurationResolverService.parseLimitValue` | 2 | `ConfigurationResolverService.parseLimitValueText`, `InvalidLimitValueError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:94` |
| `ConfigurationResolverService.resolveInputs` | 2 | `ConfigurationResolverService.some(…)`, `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:224` |
| `ConfigurationResolverService.map(…)` | 2 | `ConfigurationResolverService.resolveJsonOutput`, `ConfigurationResolverService.resolveMarkdownOutput` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:292` |
| `ConfigurationResolverService.selectCustomStatistics` | 2 | `ConfigurationResolverService.map(…)`, `ConfigurationResolverService.flatMap(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:308` |
| `callbackSchema` | 1 | `custom(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:36` |
| `superRefine(…)` | 1 | `some(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:107` |
| `refine(…)` | 1 | `map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:166` |
| `refine(…)` | 1 | `map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:182` |
| `superRefine(…)` | 1 | `find(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:209` |
| `find(…)` | 1 | `findIndex(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:211` |
| `superRefine(…)` | 1 | `map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-schema.constants.ts:227` |
| `ConfigurationFlagsService.describeAcceptedCheckNames` | 1 | `ConfigurationFlagsService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:47` |
| `ConfigurationFlagsService.validateCheckNames` | 1 | `ConfigurationFlagsService.describeAcceptedCheckNames` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:90` |
| `ConfigurationFlagsService.parseDefaultedOption` | 1 | `ConfigurationFlagsService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:116` |
| `ConfigurationFlagsService.parseDirectoryOption` | 1 | `ConfigurationFlagsService.parseDefaultedOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:127` |
| `ConfigurationFlagsService.requireConfigurationPath` | 1 | `ConfigurationPathRequiredError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:154` |
| `ConfigurationFlagsService.selectMode` | 1 | `ConfigurationFlagsService.readCheckNames` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-flags.service.ts:203` |
| `ConfigurationLoaderService.findRepositoryRoot` | 1 | `ConfigurationLoaderService.some(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-loader.service.ts:51` |
| `ConfigurationResolverService.parseConfigurationInternal` | 1 | `InvalidConfigurationError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:75` |
| `ConfigurationResolverService.parseLimitValueText` | 1 | `InvalidLimitValueError.constructor` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:114` |
| `ConfigurationResolverService.resolveCustomStatistics` | 1 | `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:150` |
| `ConfigurationResolverService.map(…)` | 1 | `ConfigurationResolverService.resolveInput` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:235` |
| `ConfigurationResolverService.resolveJsonOutput` | 1 | `ConfigurationResolverService.selectCustomStatistics` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:239` |
| `ConfigurationResolverService.resolveLimits` | 1 | `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:258` |
| `ConfigurationResolverService.map(…)` | 1 | `ConfigurationResolverService.parseLimitValue` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:261` |
| `ConfigurationResolverService.resolveMarkdownOutput` | 1 | `ConfigurationResolverService.selectCustomStatistics` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:270` |
| `ConfigurationResolverService.resolveOutputs` | 1 | `ConfigurationResolverService.map(…)` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:288` |
| `ConfigurationResolverService.parseConfiguration` | 1 | `ConfigurationResolverService.parseConfigurationInternal` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration-resolver.service.ts:326` |
| `ConfigurationService.loadConfiguration` | 1 | `ConfigurationService.loadConfigurationFile` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:63` |
| `ConfigurationService.parseConfiguration` | 1 | `ConfigurationResolverService.parseConfiguration` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:92` |
| `ConfigurationService.parseDefaultedOption` | 1 | `ConfigurationFlagsService.parseDefaultedOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:97` |
| `ConfigurationService.parseDirectoryOption` | 1 | `ConfigurationFlagsService.parseDirectoryOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:102` |
| `ConfigurationService.parseOptionalOption` | 1 | `ConfigurationFlagsService.parseOptionalOption` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:107` |
| `ConfigurationService.requireConfigurationPath` | 1 | `ConfigurationFlagsService.requireConfigurationPath` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:112` |
| `ConfigurationService.resolveConfiguration` | 1 | `ConfigurationResolverService.resolveConfiguration` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:123` |
| `ConfigurationService.resolveFormat` | 1 | `ConfigurationFlagsService.resolveFormat` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:132` |
| `ConfigurationService.selectMode` | 1 | `ConfigurationFlagsService.selectMode` | `projects/ic-suite/codometer/codometer-configuration/src/modules/configuration/configuration.service.ts:145` |

</details>
<!-- callidescope:end -->
