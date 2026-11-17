<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-cli`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 41 |
| Files | 25 |
| Calls traced | 40 |
| Call stacks | 2 |
| Deepest stack | 13 |
| Stacks through recursion | 0 |
| Unfollowable calls | 2 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 13 |
| `maximumBreadth` | 5 |

### Call stacks (depth)

**1. `BatchCommand.run`** — depth ≥ 13 · decorated-method

```text
🚀 BatchCommand.run(directories: string[], options?: BatchCommandOptions): Promise<void> [projects/ic-suite/coinagerie/coinagerie-cli/src/modules/batch/batch.command.ts:68]
   ↳ Judges or rewrites each named project, then prints every verdict.
  └─> CheckService.run(args: RunCheckArguments): Promise<CheckVerdict> [projects/ic-suite/coinagerie/coinagerie-cli/src/modules/check/check.service.ts:68]
     ↳ Runs one project's check or write, failing with the reason on any fault.
    └─> CheckService.deliver(…): CheckVerdict [projects/ic-suite/coinagerie/coinagerie-cli/src/modules/check/check.service.ts:38]
       ↳ Checks or writes every destination against the collected words.
      └─> DeliveryService.write(args: DeliverArguments): DeliveryResult[] [projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:106]
         ↳ Rewrites every destination to exactly the vocabulary, keeping definitions still in use.
        └─> DeliveryService.readAll(destinations: ResolvedCoinagerieOutput[]): ReadDestination[] [projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:78]
           ↳ Reads and parses every destination, throwing before anything is written.
          └─> DeliveryService.map(…)(…): { content: string | undefined; destination: ResolvedCoinagerieOutput; glossary: Glossary; } [projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:79]
            └─> MarkdownService.read(content: string | undefined, filePath: string): Glossary | undefined [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:226]
               ↳ Reads a destination's glossary; a missing file holds none.
              └─> MarkdownService.parse(content: string, filePath: string): Glossary | undefined [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:201]
                 ↳ The glossary in a file's block, or `undefined` without anchors.
                └─> MarkdownService.forEach(…)(text: string, index: number): void [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:217]
                  └─> MarkdownService.readLine(state: BlockParserState, text: string, line: number): void [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:166]
                     ↳ Reads one line of the block, or refuses it.
                    └─> MarkdownService.readBullet(…): void [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:103]
                       ↳ Reads one bullet, starting a new word.
                      └─> MarkdownService.fail(state: Pick<BlockParserState, "filePath">, line: number, reason: string): never [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:46]
                         ↳ Fails a parse, naming the file and the one-indexed line.
                        └─> MalformedGlossaryError.constructor(location: MalformedGlossaryLocation): MalformedGlossaryError [projects/ic-suite/coinagerie/coinagerie-core/src/modules/coinagerie-core/coinagerie-core.constants.ts:47]
```

**2. `CollectCommand.run`** — depth ≥ 13 · decorated-method

```text
🚀 CollectCommand.run(_passedParameters: string[], options?: CollectCommandOptions): Promise<void> [projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:337]
   ↳ Collects the vocabulary and prints, checks, or writes it.
  └─> CollectCommand.deliver(…): void [projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:108]
     ↳ Checks or writes, refusing a glossary that cannot be parsed.
    └─> CollectCommand.check(configuration: ResolvedCoinagerieConfiguration, words: string[]): void [projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:65]
       ↳ Checks every destination, failing the run when any disagrees.
      └─> DeliveryService.check(args: DeliverArguments): GlossaryDifference[] [projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:97]
         ↳ How each destination differs from the vocabulary, writing nothing.
        └─> DeliveryService.readAll(destinations: ResolvedCoinagerieOutput[]): ReadDestination[] [projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:78]
           ↳ Reads and parses every destination, throwing before anything is written.
          └─> DeliveryService.map(…)(…): { content: string | undefined; destination: ResolvedCoinagerieOutput; glossary: Glossary; } [projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:79]
            └─> MarkdownService.read(content: string | undefined, filePath: string): Glossary | undefined [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:226]
               ↳ Reads a destination's glossary; a missing file holds none.
              └─> MarkdownService.parse(content: string, filePath: string): Glossary | undefined [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:201]
                 ↳ The glossary in a file's block, or `undefined` without anchors.
                └─> MarkdownService.forEach(…)(text: string, index: number): void [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:217]
                  └─> MarkdownService.readLine(state: BlockParserState, text: string, line: number): void [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:166]
                     ↳ Reads one line of the block, or refuses it.
                    └─> MarkdownService.readBullet(…): void [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:103]
                       ↳ Reads one bullet, starting a new word.
                      └─> MarkdownService.fail(state: Pick<BlockParserState, "filePath">, line: number, reason: string): never [projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:46]
                         ↳ Fails a parse, naming the file and the one-indexed line.
                        └─> MalformedGlossaryError.constructor(location: MalformedGlossaryLocation): MalformedGlossaryError [projects/ic-suite/coinagerie/coinagerie-core/src/modules/coinagerie-core/coinagerie-core.constants.ts:47]
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CollectCommand.run` | 5 | `CollectCommand.selectMode`, `CollectCommand.loadConfiguration`, `CollectCommand.collectWords`, `CollectCommand.print`, `CollectCommand.deliver` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:337` |
| `CheckService.deliver` | 4 | `reportWritten`, `DeliveryService.write`, `judgeDifferences`, `DeliveryService.check` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/check/check.service.ts:38` |
| `CollectCommand.loadConfiguration` | 4 | `CollectCommand.fail`, `ConfigurationPathRequiredError.constructor`, `ConfigurationService.loadConfiguration`, `CollectCommand.overridesFrom` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:144` |

<details>
<summary>10 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CheckService.run` | 3 | `ConfigurationService.loadConfiguration`, `VocabularyService.collect`, `CheckService.deliver` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/check/check.service.ts:68` |
| `BatchCommand.run` | 3 | `ConfigurationPathRequiredError.constructor`, `CheckService.run`, `BatchCommand.every(…)` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/batch/batch.command.ts:68` |
| `CollectCommand.check` | 3 | `CollectCommand.filter(…)`, `DeliveryService.check`, `CollectCommand.fail` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:65` |
| `CollectCommand.deliver` | 3 | `CollectCommand.fail`, `CollectCommand.check`, `CollectCommand.write` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:108` |
| `CollectCommand.print` | 3 | `ComparisonService.reconcile`, `JsonService.render`, `MarkdownService.render` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:183` |
| `judgeDifferences` | 2 | `filter(…)`, `map(…)` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/check/check.utilities.ts:13` |
| `reportWritten` | 2 | `map(…)`, `filter(…)` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/check/check.utilities.ts:33` |
| `CollectCommand.collectWords` | 2 | `VocabularyService.collect`, `CollectCommand.fail` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:92` |
| `CollectCommand.selectMode` | 2 | `CollectCommand.rejectionOf`, `CollectCommand.fail` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:210` |
| `CollectCommand.write` | 2 | `DeliveryService.write`, `CollectCommand.filter(…)` | `projects/ic-suite/coinagerie/coinagerie-cli/src/modules/collect/collect.command.ts:226` |

</details>
<!-- callidescope:end -->
