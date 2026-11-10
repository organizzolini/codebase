<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/conformetry/conformetry-generation`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 13 |
| Files | 12 |
| Calls traced | 10 |
| Call stacks | 1 |
| Deepest stack | 2 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 8 |
| `maximumBreadth` | 4 |

### Call stacks (depth)

**1. `GenerationService.listDirectory`** — depth 2 · orphan-root

```text
🚀 GenerationService.listDirectory(directoryPath: string): Promise<DirectoryEntry[]> [projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:40]
  └─> GenerationService.map(…)(entry: Dirent<string>): { isDirectory: boolean; name: string; } [projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:43]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GenerationService.runGenerator` | 4 | `GenerationService.resolveAdapters`, `GenerationService.normalizeInputs`, `GenerationService.buildSubstitutions`, `GenerationService.renderDirectory` | `projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:193` |
| `GenerationService.renderDirectory` | 2 | `ConfigurationService.renderPath`, `GenerationService.renderFile` | `projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:106` |
| `GenerationService.listDirectory` | 1 | `GenerationService.map(…)` | `projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:40` |

<details>
<summary>2 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GenerationService.buildSubstitutions` | 1 | `ConfigurationService.buildNameSubstitutions` | `projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:76` |
| `GenerationService.renderFile` | 1 | `ConfigurationService.renderContent` | `projects/ic-suite/conformetry/conformetry-generation/src/modules/generation/generation.service.ts:155` |

</details>
<!-- callidescope:end -->
