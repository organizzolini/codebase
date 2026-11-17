<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-nx`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 35 |
| Files | 22 |
| Calls traced | 32 |
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

**1. `anonymous`** — depth 6 · orphan-root

```text
🚀 anonymous(…): Promise<CreateNodesResultArray> [projects/ic-suite/coinagerie/coinagerie-nx/src/index.ts:40]
  └─> PluginService.inferTargets(args: InferTargetsArguments): Map<string, InferredTargets> [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:112]
     ↳ Infers a check target onto every project that holds a configuration.
    └─> OptionsService.resolvePluginOptions(options: unknown): CoinageriePluginOptions [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:82]
       ↳ Resolves the effective plugin options from an untrusted value.
      └─> OptionsService.readInputs(options: Record<string, unknown>): PluginInput[] [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:49]
         ↳ Reads the declared inputs from an untrusted record.
        └─> OptionsService.flatMap(…)(this: undefined, entry: unknown): PluginInput[] [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:56]
          └─> OptionsService.isInputObject(value: unknown): value is Exclude<PluginInput, string> [projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:31]
             ↳ Narrows an untrusted value to an Nx input object, such as `{ env }`.
```

**2. `checkBatchExecutor`** — depth 6 · orphan-root

```text
🚀 checkBatchExecutor(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/batch-executor.ts:19]
   ↳ Judges every task Nx batched for this executor from one command-line process.
  └─> runBatch(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:58]
     ↳ Judges every task of a batch, one process per group, each task by its own verdict.
    └─> runGroup(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:78]
       ↳ Judges every task of a group from one process, giving each its own verdict.
      └─> parseVerdicts(output: ProcessOutput): CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:154]
         ↳ Reads the verdicts a process printed.
        └─> isVerdictList(value: unknown): value is CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:120]
           ↳ Whether a parsed value is a list of verdicts, as the `batch` command prints them.
          └─> isVerdictRecord(value: unknown): value is CheckVerdictRecord [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:135]
             ↳ Whether a parsed value is one verdict as the `batch` command prints it.
```

**3. `checkExecutor`** — depth 5 · orphan-root

```text
🚀 checkExecutor(…): Promise<{ success: boolean; }> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.ts:18]
   ↳ Judges one project's glossaries against the words its code uses.
  └─> runGroup(…): Promise<Record<string, CheckBatchTaskResult>> [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:78]
     ↳ Judges every task of a group from one process, giving each its own verdict.
    └─> parseVerdicts(output: ProcessOutput): CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:154]
       ↳ Reads the verdicts a process printed.
      └─> isVerdictList(value: unknown): value is CheckVerdictRecord[] [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:120]
         ↳ Whether a parsed value is a list of verdicts, as the `batch` command prints them.
        └─> isVerdictRecord(value: unknown): value is CheckVerdictRecord [projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:135]
           ↳ Whether a parsed value is one verdict as the `batch` command prints it.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `runProcess` | 4 | `buildCommand`, `on(…)`, `on(…)`, `anonymous` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:182` |
| `PluginService.inferTargets` | 3 | `OptionsService.resolvePluginOptions`, `PluginService.isProject`, `PluginService.buildCheckTarget` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:112` |
| `anonymous` | 3 | `resolvePluginService`, `PluginService.inferTargets`, `flatMap(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/index.ts:40` |

<details>
<summary>13 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `runGroup` | 3 | `parseVerdicts`, `runProcess`, `find(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:78` |
| `checkExecutor` | 3 | `runGroup`, `map(…)`, `every(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.ts:18` |
| `OptionsService.readInputs` | 2 | `OptionsService.isUnknownArray`, `OptionsService.flatMap(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:49` |
| `OptionsService.resolvePluginOptions` | 2 | `OptionsService.readString`, `OptionsService.readInputs` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:82` |
| `runBatch` | 2 | `groupTasks`, `runGroup` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:58` |
| `checkBatchExecutor` | 2 | `runBatch`, `printFailures` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/batch-executor.ts:19` |
| `OptionsService.flatMap(…)` | 1 | `OptionsService.isInputObject` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/options/options.service.ts:56` |
| `PluginService.buildCheckTarget` | 1 | `PluginService.map(…)` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:49` |
| `PluginService.isProject` | 1 | `PluginService.isNamedPackage` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin.service.ts:90` |
| `resolvePluginService` | 1 | `resolvePluginContext` | `projects/ic-suite/coinagerie/coinagerie-nx/src/modules/plugin/plugin-context.utilities.ts:15` |
| `buildCommand` | 1 | `quote` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:108` |
| `isVerdictList` | 1 | `isVerdictRecord` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:120` |
| `parseVerdicts` | 1 | `isVerdictList` | `projects/ic-suite/coinagerie/coinagerie-nx/src/executors/check/executor.utilities.ts:154` |

</details>
<!-- callidescope:end -->
