<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/common/observability`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 26 |
| Files | 12 |
| Calls traced | 5 |
| Call stacks | 1 |
| Deepest stack | 4 |
| Stacks through recursion | 0 |
| Unfollowable calls | 1 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 4 |
| `maximumBreadth` | 2 |

### Call stacks (depth)

**1. `CallExpression`** — depth 4 · orphan-root

```text
🚀 CallExpression(node: SimpleCallExpression & Rule.NodeParentExtension): void [projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:174]
  └─> checkMessageArgumentConvention(argument: MessageArgumentShape): ConventionalLogMessageViolation | undefined [projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:91]
     ↳ Extracts a message argument's static text, if it has one, and checks it against the logging convention.
    └─> checkConventionalMessage(text: string): ConventionalLogMessageViolation | undefined [projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:61]
       ↳ Checks a static message's text against the logging convention.
      └─> parseLogMessage(message: string): ParsedLogMessage [projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:124]
         ↳ Splits a leading emoji off a message, leaving prose behind.
```

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `checkConventionalMessage` | 2 | `parseLogMessage`, `isConventionalVerb` | `projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:61` |
| `CallExpression` | 2 | `isLoggerObjectText`, `checkMessageArgumentConvention` | `projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:174` |
| `checkMessageArgumentConvention` | 1 | `checkConventionalMessage` | `projects/common/observability/src/lib/conventional-log-message.eslint-rule.ts:91` |
<!-- callidescope:end -->
