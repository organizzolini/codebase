<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `configuration`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 49 |
| Files | 18 |
| Calls traced | 21 |
| Call stacks | 7 |
| Deepest stack | 5 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | none |

### Call stacks (depth)

**1. `anonymous`** — depth 5 · orphan-root

```text
🚀 anonymous(files: string[]): string[] [configuration/repository/lint-staged.config.ts:150]
  └─> getStagedChangeFlags(files: string[]): string [configuration/repository/lint-staged.config.ts:92]
     ↳ Hands `nx affected` the staged changes: template flags when a template is staged, otherwise two revisions.
    └─> getStagedTemplateFlags(files: string[]): string | undefined [configuration/repository/lint-staged.config.ts:76]
       ↳ Flags every conformetry instance when a template is staged, else `undefined`. `.nxignore` hides templates from Nx, so…
      └─> getStagedFilesFlags(files: string[]): string [configuration/repository/lint-staged.config.ts:33]
         ↳ Renders staged paths as one `--files=` flag each.
        └─> map(…)(file: string): string [configuration/repository/lint-staged.config.ts:35]
```

**2. `words`** — depth 3 · orphan-root

```text
🚀 words(): (string | RegExp)[] [configuration/ic-suite/coinagerie.config.ts:3201]
  └─> readRootGlossaryWords(): string[] [configuration/ic-suite/coinagerie.config.ts:34]
     ↳ Every word on a bullet of the root glossary.
    └─> flatMap(…)(this: undefined, line: string): string | never[] [configuration/ic-suite/coinagerie.config.ts:38]
```

**3. `findProjectRoots`** — depth 3 · orphan-root

```text
🚀 findProjectRoots(tags: readonly string[]): string[] [configuration/eslint.config.ts:60]
   ↳ The absolute root of every project whose `project.json` carries all of `tags`.
  └─> filter(…)(file: string): boolean [configuration/eslint.config.ts:66]
    └─> every(…)(tag: string): boolean [configuration/eslint.config.ts:71]
```

<details>
<summary>4 more call stacks</summary>

**4. `selectAllLabels`** — depth 2 · orphan-root

```text
🚀 selectAllLabels(statistics: readonly CodometerCustomStatistic[]): string[] [configuration/ic-suite/codometer.config.ts:109]
   ↳ Every custom statistic's own label, in declaration order.
  └─> map(…)(statistic: CodometerCustomStatistic): string [configuration/ic-suite/codometer.config.ts:112]
```

**5. `bodyCoAuthoredOnly`** — depth 2 · orphan-root

```text
🚀 bodyCoAuthoredOnly(parsed: Commit): RuleOutcome [configuration/repository/commitlint.config.ts:30]
   ↳ Non-empty body lines must all be trailers, matched case-insensitively.
  └─> filter(…)(line: string): boolean [configuration/repository/commitlint.config.ts:35]
```

**6. `footerCoAuthoredOnly`** — depth 2 · orphan-root

```text
🚀 footerCoAuthoredOnly(parsed: Commit): RuleOutcome [configuration/repository/commitlint.config.ts:48]
   ↳ Non-empty footer lines must all be trailers, matched case-insensitively.
  └─> filter(…)(line: string): boolean [configuration/repository/commitlint.config.ts:51]
```

**7. `external`** — depth ≥ 2 · orphan-root

```text
🚀 external(id: string): boolean [configuration/typescript/vite.library.config.ts:77]
  └─> some(…)(pattern: RegExp | string): boolean [configuration/typescript/vite.library.config.ts:82]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `words` | 2 | `readRootGlossaryWords`, `flatMap(…)` | `configuration/ic-suite/coinagerie.config.ts:3201` |
| `findProjectRoots` | 2 | `map(…)`, `filter(…)` | `configuration/eslint.config.ts:60` |
| `bodyCoAuthoredOnly` | 2 | `filter(…)`, `every(…)` | `configuration/repository/commitlint.config.ts:30` |

<details>
<summary>10 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `footerCoAuthoredOnly` | 2 | `filter(…)`, `every(…)` | `configuration/repository/commitlint.config.ts:48` |
| `getStagedRevisionFlags` | 2 | `runGit`, `getStagedFilesFlags` | `configuration/repository/lint-staged.config.ts:43` |
| `getStagedTemplateFlags` | 2 | `some(…)`, `getStagedFilesFlags` | `configuration/repository/lint-staged.config.ts:76` |
| `getStagedChangeFlags` | 2 | `getStagedTemplateFlags`, `getStagedRevisionFlags` | `configuration/repository/lint-staged.config.ts:92` |
| `readRootGlossaryWords` | 1 | `flatMap(…)` | `configuration/ic-suite/coinagerie.config.ts:34` |
| `filter(…)` | 1 | `every(…)` | `configuration/eslint.config.ts:66` |
| `selectAllLabels` | 1 | `map(…)` | `configuration/ic-suite/codometer.config.ts:109` |
| `getStagedFilesFlags` | 1 | `map(…)` | `configuration/repository/lint-staged.config.ts:33` |
| `anonymous` | 1 | `getStagedChangeFlags` | `configuration/repository/lint-staged.config.ts:150` |
| `external` | 1 | `some(…)` | `configuration/typescript/vite.library.config.ts:77` |

</details>
<!-- callidescope:end -->
