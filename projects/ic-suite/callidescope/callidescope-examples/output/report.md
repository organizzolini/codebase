<!-- callidescope:start -->

# 🔭 Callidescope

| Measure | Value |
| --- | --- |
| Callables | 431 |
| Files | 238 |
| Calls traced | 365 |
| Call stacks | 144 |
| Deepest stack | 9 |
| Stacks through recursion | 1 |
| Unfollowable calls | 30 |

## Projects

| Project | Deepest | Limit | Headroom | Widest |
| --- | --- | --- | --- | --- |
| `projects/ic-suite/callidescope/callidescope-examples` | 8 | 5 | -3 | 2 |
| `projects/common/observability` | 6 | 4 | -2 | 2 |
| `projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf` | 4 | 3 | -1 | 3 |
| `projects/ic-suite/codependix/codependix-configuration` | 7 | 7 | 0 | 4 |
| `projects/ic-suite/codometer/codometer-configuration` | 9 | 9 | 0 | 4 |
| `projects/ic-suite/coinagerie/coinagerie-configuration` | 3 | 3 | 0 | 3 |
| `projects/ic-suite/callidescope/callidescope-configuration` | 7 | 8 | 1 | 7 |
| `projects/ic-suite/codependix/codependix-core` | 0 | 1 | 1 | 0 |
| `projects/ic-suite/codometer/codometer-core` | 0 | 1 | 1 | 0 |
| `projects/ic-suite/coinagerie/coinagerie-core` | 0 | 1 | 1 | 0 |
| `projects/ic-suite/coinagerie/coinagerie-languages` | 4 | 6 | 2 | 3 |
| `projects/ic-suite/callidescope/callidescope-core` | 0 | 17 | 17 | 0 |

## Depth headroom

| Headroom | Projects |
| --- | --- |
| over limit | 3 |
| 0 — at limit | 3 |
| 1 | 1 |
| 2–3 | 1 |
| 4+ | 0 |
| no stacks | 4 |

## Call stacks over the depth limit (11)

**1. `ComputedMemberService.dispatch`** — depth ≥ 8 · orphan-root

```text
🚀 ComputedMemberService.dispatch(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:58]
   ↳ Dispatches a report request to a handler named at runtime.
  └─> ComputedMemberService.read(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:41]
     ↳ Reads the request's format and passes it on.
    └─> ComputedMemberService.normalize(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:31]
       ↳ Normalizes the requested format before anything routes on it.
      └─> ComputedMemberService.route(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:46]
         ↳ Routes the request one layer further down.
        └─> ComputedMemberService.select(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:51]
           ↳ Selects the branch that prepares the format.
          └─> ComputedMemberService.prepare(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:36]
             ↳ Prepares the format string the handler table is keyed by.
            └─> ComputedMemberService.choose(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:26]
               ↳ Chooses a handler by name.
              └─> ComputedMemberService.apply(format: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/computed-member/computed-member.ts:21]
                 ↳ Applies the selected handler, whichever one that turns out to be.
```

**2. `DeepStackService.quote`** — depth 8 · orphan-root

```text
🚀 DeepStackService.quote(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:50]
   ↳ Quotes one order, priced through every stage below.
  └─> DeepStackService.validate(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:43]
     ↳ Rejects a negative amount before anything else reads it.
    └─> DeepStackService.removeDiscount(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:33]
       ↳ Removes the tier discount from the validated amount.
      └─> DeepStackService.resolveTier(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:38]
         ↳ Picks the pricing tier the discounted amount falls into.
        └─> DeepStackService.loadRate(amount: number, tier: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:28]
           ↳ Looks up the tax rate the resolved tier pays.
          └─> DeepStackService.applyTax(amount: number, rate: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:18]
             ↳ Adds tax at the resolved rate.
            └─> DeepStackService.convertCurrency(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/deep-stack/deep-stack.ts:23]
               ↳ Converts to the reporting currency and rounds through the shared tail.
              └─> roundToCents(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/shared-tail/round-to-cents.ts:4]
                 ↳ The tail two deep stacks share, so their mermaid diagrams converge.
```

**3. `ForwardingStackService.handle`** — depth 8 · orphan-root

```text
🚀 ForwardingStackService.handle(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:48]
   ↳ Handles one amount, through six layers that do nothing to it.
  └─> ForwardingStackService.process(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:36]
     ↳ Forwards, unchanged.
    └─> ForwardingStackService.execute(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:16]
       ↳ Forwards, unchanged.
      └─> ForwardingStackService.forward(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:26]
         ↳ Forwards, unchanged.
        └─> ForwardingStackService.perform(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:31]
           ↳ Forwards, unchanged.
          └─> ForwardingStackService.relay(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:41]
             ↳ Forwards, unchanged.
            └─> ForwardingStackService.finish(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/forwarding-stack/forwarding-stack.ts:21]
               ↳ Rounds the amount, which is the only work on this path.
              └─> roundToCents(amount: number): number [projects/ic-suite/callidescope/callidescope-examples/examples/shared-tail/round-to-cents.ts:4]
                 ↳ The tail two deep stacks share, so their mermaid diagrams converge.
```

<details>
<summary>8 more call stacks</summary>

**4. `FrameAnnotationsService.trace`** — depth 7 · orphan-root

```text
🚀 FrameAnnotationsService.trace(value: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:80]
   ↳ Traces one value through every annotation shape below.
  └─> FrameAnnotationsService.render(value: number | string): string | string[] [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:73]
     ↳ Renders one value for display. The overloads differ in return type, so the docs live on the signature.
    └─> FrameAnnotationsService.summarize(rendered: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:21]
       ↳ Collapses a rendered value to something a description can quote.
      └─> FrameAnnotationsService.describe({ count, name }: DescribeArguments): string [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:55]
         ↳ Describes a value from a parameter with no name at all in the syntax.
        └─> FrameAnnotationsService.compose(description: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:27]
           ↳ Joins the parts a description was built from.
          └─> FrameAnnotationsService.collapseThisSignatureBecauseItRunsLong(…): string [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:44]
             ↳ Takes three parameters whose rendered signature runs past eighty characters, so the printed frame collapses it to `(…):…
            └─> FrameAnnotationsService.finish(description: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/frame-annotations/frame-annotations.ts:34]
               ↳ Finishes the chain and returns what the layers above it built, in one long sentence the printed frame shortens and the…
```

**5. `LoggerService.log`** — depth 6 · orphan-root

```text
🚀 LoggerService.log(message: unknown, context?: string, data?: LogData): void [projects/common/observability/src/modules/logger/logger.service.ts:269]
   ↳ Logs at the `info` level, as NestJS and `nest-commander` call it. Application code should call `info` instead.
  └─> LoggerService.info(message: unknown, context?: string, data?: LogData): void [projects/common/observability/src/modules/logger/logger.service.ts:257]
     ↳ Logs an informational message at the `info` level.
    └─> LoggerService.buildBindings(…): Record<string, unknown> [projects/common/observability/src/modules/logger/logger.service.ts:118]
       ↳ Assembles the object pino merges into the line.
      └─> LoggerService.assertConventionalMessage(args: { context: string | undefined; parsed: ParsedLogMessage; }): void [projects/common/observability/src/modules/logger/logger.service.ts:99]
         ↳ Fails a malformed message in development only, since a throw in production would turn logging into an outage.
        └─> LoggerService.getConventionalMessageViolation(parsed: ParsedLogMessage): string | undefined [projects/common/observability/src/modules/logger/logger.service.ts:137]
           ↳ Returns a human-readable explanation when the message format is invalid.
          └─> LoggerService.isConventionalVerb(word: string): boolean [projects/common/observability/src/modules/logger/logger.service.ts:160]
             ↳ Whether a word is a present-progressive or past-tense verb.
```

**6. `ProjectDepthLimitService.judge`** — depth 6 · orphan-root

```text
🚀 ProjectDepthLimitService.judge(project: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/project-depth-limit/project-depth-limit.ts:41]
   ↳ Judges one project, through every stage a resolved limit passes.
  └─> ProjectDepthLimitService.resolveConfiguration(project: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/project-depth-limit/project-depth-limit.ts:34]
     ↳ Names the configuration file the project is judged by.
    └─> ProjectDepthLimitService.readLimit(project: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/project-depth-limit/project-depth-limit.ts:24]
       ↳ Reads the limit whichever configuration file the project settled on.
      └─> ProjectDepthLimitService.applyLimit(project: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/project-depth-limit/project-depth-limit.ts:14]
         ↳ Applies the limit the resolved project turned out to declare.
        └─> ProjectDepthLimitService.reportVerdict(verdict: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/project-depth-limit/project-depth-limit.ts:29]
           ↳ States the verdict, and where the number behind it came from.
          └─> ProjectDepthLimitService.readDeclaringFile(project: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/project-depth-limit/project-depth-limit.ts:19]
             ↳ Reads the file the number the verdict used was written in.
```

**7. `LoggerService.debug`** — depth 5 · orphan-root

```text
🚀 LoggerService.debug(message: unknown, context?: string, data?: LogData): void [projects/common/observability/src/modules/logger/logger.service.ts:225]
   ↳ Logs a debug message at the `debug` level.
  └─> LoggerService.buildBindings(…): Record<string, unknown> [projects/common/observability/src/modules/logger/logger.service.ts:118]
     ↳ Assembles the object pino merges into the line.
    └─> LoggerService.assertConventionalMessage(args: { context: string | undefined; parsed: ParsedLogMessage; }): void [projects/common/observability/src/modules/logger/logger.service.ts:99]
       ↳ Fails a malformed message in development only, since a throw in production would turn logging into an outage.
      └─> LoggerService.getConventionalMessageViolation(parsed: ParsedLogMessage): string | undefined [projects/common/observability/src/modules/logger/logger.service.ts:137]
         ↳ Returns a human-readable explanation when the message format is invalid.
        └─> LoggerService.isConventionalVerb(word: string): boolean [projects/common/observability/src/modules/logger/logger.service.ts:160]
           ↳ Whether a word is a present-progressive or past-tense verb.
```

**8. `LoggerService.error`** — depth 5 · orphan-root

```text
🚀 LoggerService.error(…): void [projects/common/observability/src/modules/logger/logger.service.ts:237]
   ↳ Logs at the `error` level. The second argument is a stack, the third a context string or structured data.
  └─> LoggerService.buildBindings(…): Record<string, unknown> [projects/common/observability/src/modules/logger/logger.service.ts:118]
     ↳ Assembles the object pino merges into the line.
    └─> LoggerService.assertConventionalMessage(args: { context: string | undefined; parsed: ParsedLogMessage; }): void [projects/common/observability/src/modules/logger/logger.service.ts:99]
       ↳ Fails a malformed message in development only, since a throw in production would turn logging into an outage.
      └─> LoggerService.getConventionalMessageViolation(parsed: ParsedLogMessage): string | undefined [projects/common/observability/src/modules/logger/logger.service.ts:137]
         ↳ Returns a human-readable explanation when the message format is invalid.
        └─> LoggerService.isConventionalVerb(word: string): boolean [projects/common/observability/src/modules/logger/logger.service.ts:160]
           ↳ Whether a word is a present-progressive or past-tense verb.
```

**9. `LoggerService.verbose`** — depth 5 · orphan-root

```text
🚀 LoggerService.verbose(message: unknown, context?: string, data?: LogData): void [projects/common/observability/src/modules/logger/logger.service.ts:280]
   ↳ Logs a verbose message at the `trace` level.
  └─> LoggerService.buildBindings(…): Record<string, unknown> [projects/common/observability/src/modules/logger/logger.service.ts:118]
     ↳ Assembles the object pino merges into the line.
    └─> LoggerService.assertConventionalMessage(args: { context: string | undefined; parsed: ParsedLogMessage; }): void [projects/common/observability/src/modules/logger/logger.service.ts:99]
       ↳ Fails a malformed message in development only, since a throw in production would turn logging into an outage.
      └─> LoggerService.getConventionalMessageViolation(parsed: ParsedLogMessage): string | undefined [projects/common/observability/src/modules/logger/logger.service.ts:137]
         ↳ Returns a human-readable explanation when the message format is invalid.
        └─> LoggerService.isConventionalVerb(word: string): boolean [projects/common/observability/src/modules/logger/logger.service.ts:160]
           ↳ Whether a word is a present-progressive or past-tense verb.
```

**10. `LoggerService.warn`** — depth 5 · orphan-root

```text
🚀 LoggerService.warn(message: unknown, context?: string, data?: LogData): void [projects/common/observability/src/modules/logger/logger.service.ts:289]
   ↳ Logs a warning message at the `warn` level.
  └─> LoggerService.buildBindings(…): Record<string, unknown> [projects/common/observability/src/modules/logger/logger.service.ts:118]
     ↳ Assembles the object pino merges into the line.
    └─> LoggerService.assertConventionalMessage(args: { context: string | undefined; parsed: ParsedLogMessage; }): void [projects/common/observability/src/modules/logger/logger.service.ts:99]
       ↳ Fails a malformed message in development only, since a throw in production would turn logging into an outage.
      └─> LoggerService.getConventionalMessageViolation(parsed: ParsedLogMessage): string | undefined [projects/common/observability/src/modules/logger/logger.service.ts:137]
         ↳ Returns a human-readable explanation when the message format is invalid.
        └─> LoggerService.isConventionalVerb(word: string): boolean [projects/common/observability/src/modules/logger/logger.service.ts:160]
           ↳ Whether a word is a present-progressive or past-tense verb.
```

**11. `GatedLeafService.read`** — depth 4 · declared

```text
🚀 GatedLeafService.read(key: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf/gated-leaf.ts:33]
   ↳ The project's declared entry point: three direct callees, four frames deep.
  └─> GatedLeafService.parse(key: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf/gated-leaf.ts:24]
     ↳ First of the three, and the way into the chain.
    └─> GatedLeafService.normalize(key: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf/gated-leaf.ts:19]
       ↳ Second of the three, one hop from the end.
      └─> GatedLeafService.finish(key: string): string [projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf/gated-leaf.ts:14]
         ↳ Ends the chain, which is where the fourth frame is.
```

</details>

## Callables over the breadth limit (1)

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GatedLeafService.read` | 3 | `GatedLeafService.parse`, `GatedLeafService.normalize`, `GatedLeafService.finish` | `projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf/gated-leaf.ts:33` |

<!-- callidescope:end -->
