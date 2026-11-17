<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 14 |
| Files | 12 |
| Calls traced | 20 |
| Call stacks | 1 |
| Deepest stack | 2 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 3 |
| `maximumBreadth` | 3 |

### Call stacks (depth)

**1. `ConfigurationService.anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 ConfigurationService.anonymous(word: string): string [projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:67]
  └─> InvalidConfigurationError.constructor(filePath: string, reason: string): InvalidConfigurationError [projects/ic-suite/coinagerie/coinagerie-core/src/modules/coinagerie-core/coinagerie-core.constants.ts:32]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationService.locate` | 3 | `ConfigurationFileNotFoundError.constructor`, `ConfigurationService.find(…)`, `ConfigurationService.map(…)` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:99` |
| `ConfigurationService.read` | 3 | `InvalidConfigurationError.constructor`, `ConfigurationService.describe`, `ConfigurationService.resolveWords` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:169` |
| `ConfigurationService.resolve` | 3 | `InvalidConfigurationError.constructor`, `ConfigurationService.override`, `ConfigurationService.guardFold` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:205` |

<details>
<summary>2 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationService.loadConfiguration` | 3 | `ConfigurationService.locate`, `ConfigurationService.resolve`, `ConfigurationService.read` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:320` |
| `ConfigurationService.anonymous` | 2 | `InvalidConfigurationError.constructor`, `ConfigurationService.describe` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:67` |

</details>
<!-- callidescope:end -->
