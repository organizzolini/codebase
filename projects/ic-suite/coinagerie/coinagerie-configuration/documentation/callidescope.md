<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 14 |
| Files | 12 |
| Calls traced | 17 |
| Call stacks | 1 |
| Deepest stack | 2 |
| Stacks through recursion | 0 |
| Unfollowable calls | 3 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 3 |
| `maximumBreadth` | 3 |

### Call stacks (depth)

**1. `ConfigurationService.anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 ConfigurationService.anonymous(word: string): string [projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:62]
  └─> InvalidConfigurationError.constructor(filePath: string, reason: string): InvalidConfigurationError [projects/ic-suite/coinagerie/coinagerie-core/src/modules/coinagerie-core/coinagerie-core.constants.ts:32]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationService.read` | 3 | `InvalidConfigurationError.constructor`, `ConfigurationService.describe`, `ConfigurationService.resolveWords` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:145` |
| `ConfigurationService.resolve` | 3 | `InvalidConfigurationError.constructor`, `ConfigurationService.override`, `ConfigurationService.guardFold` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:181` |
| `ConfigurationService.loadConfiguration` | 3 | `ConfigurationService.locate`, `ConfigurationService.resolve`, `ConfigurationService.read` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:294` |

<details>
<summary>2 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ConfigurationService.anonymous` | 2 | `InvalidConfigurationError.constructor`, `ConfigurationService.describe` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:62` |
| `ConfigurationService.locate` | 1 | `ConfigurationFileNotFoundError.constructor` | `projects/ic-suite/coinagerie/coinagerie-configuration/src/modules/configuration/configuration.service.ts:88` |

</details>
<!-- callidescope:end -->
