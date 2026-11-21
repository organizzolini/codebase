<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 34 |
| Files | 22 |
| Calls traced | 34 |
| Call stacks | 3 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 4 |

### Call stacks (depth)

**1. `anonymous`** — depth ≥ 6 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/coinagerie/coinagerie-nx/src/index.ts:34]
  └─> PluginService.inferTargets(args: InferTargetsArguments): Map<string, InferredTargets> [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:97]
     ↳ Infers a check target onto each project holding a configuration at the configured path, reading options once per…
    └─> OptionsService.resolvePluginOptions(options: unknown): CoinageriePluginOptions [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:79]
       ↳ Resolves the effective plugin options from an untrusted value, throwing when the registration names no…
      └─> OptionsService.readInputs(options: Record<string, unknown>): PluginInput[] [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:43]
         ↳ Reads inputs from an untrusted record.
        └─> OptionsService.flatMap(…)(this: undefined, entry: unknown): PluginInput[] [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:50]
          └─> OptionsService.isInputObject(value: unknown): value is Exclude<PluginInput, string> [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:30]
             ↳ Narrows an untrusted value to an Nx input object, such as `{ env }`.
```

**2. `checkBatchExecutor`** — depth 6 · orphan-root

```text
🚀 checkBatchExecutor(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/batch-executor.ts:14]
   ↳ Judges every Nx-batched task in one command-line process. Each task still passes or fails, and is cached, alone.
  └─> runBatch(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:60]
     ↳ Judges every task of a batch, one process per group, each task by its own verdict.
    └─> runGroup(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:77]
       ↳ Judges each task of a group from one process. Failure, or a task with no verdict, is never read as a pass.
      └─> parseVerdicts(output: ProcessOutput): CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:150]
         ↳ Reads the verdicts a process printed. A run that printed none is an error, never a pass.
        └─> isVerdictList(value: unknown): value is CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:119]
           ↳ Whether a parsed value is a list of verdicts, as the `batch` command prints them.
          └─> isVerdictRecord(value: unknown): value is CheckVerdictRecord [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:134]
             ↳ Whether a parsed value is one verdict as the `batch` command prints it.
```

**3. `checkExecutor`** — depth 5 · orphan-root

```text
🚀 checkExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.ts:14]
   ↳ Judges one project's glossaries against its code's words.
  └─> runGroup(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:77]
     ↳ Judges each task of a group from one process. Failure, or a task with no verdict, is never read as a pass.
    └─> parseVerdicts(output: ProcessOutput): CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:150]
       ↳ Reads the verdicts a process printed. A run that printed none is an error, never a pass.
      └─> isVerdictList(value: unknown): value is CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:119]
         ↳ Whether a parsed value is a list of verdicts, as the `batch` command prints them.
        └─> isVerdictRecord(value: unknown): value is CheckVerdictRecord [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:134]
           ↳ Whether a parsed value is one verdict as the `batch` command prints it.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `runProcess` | 4 | `buildCommand`, `on(…)`, `on(…)`, `anonymous` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:175` |
| `OptionsService.resolvePluginOptions` | 3 | `OptionsService.readString`, `ConfigurationPathRequiredError.constructor`, `OptionsService.readInputs` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:79` |
| `PluginService.inferTargets` | 3 | `OptionsService.resolvePluginOptions`, `PluginService.isProject`, `PluginService.buildCheckTarget` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:97` |

<details>
<summary>12 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `anonymous` | 3 | `resolvePluginService`, `PluginService.inferTargets`, `flatMap(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/index.ts:34` |
| `runGroup` | 3 | `parseVerdicts`, `runProcess`, `find(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:77` |
| `checkExecutor` | 3 | `runGroup`, `map(…)`, `every(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.ts:14` |
| `OptionsService.readInputs` | 2 | `OptionsService.isUnknownArray`, `OptionsService.flatMap(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:43` |
| `runBatch` | 2 | `groupTasks`, `runGroup` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:60` |
| `checkBatchExecutor` | 2 | `runBatch`, `printFailures` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/batch-executor.ts:14` |
| `OptionsService.flatMap(…)` | 1 | `OptionsService.isInputObject` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:50` |
| `PluginService.isProject` | 1 | `PluginService.isNamedPackage` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:79` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin-context.utilities.ts:15` |
| `buildCommand` | 1 | `quote` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:107` |
| `isVerdictList` | 1 | `isVerdictRecord` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:119` |
| `parseVerdicts` | 1 | `isVerdictList` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:150` |

</details>
<!-- callidescope:end -->
