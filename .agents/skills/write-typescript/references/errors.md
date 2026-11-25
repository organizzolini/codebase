# Error Handling

## Core Rules

- Validate untrusted input at the boundary with Zod: command-line arguments, environment, API payloads, files read from disk.
- Type caught errors as `unknown`, then narrow.
- Never swallow an error: handle it, log it with context and rethrow, or let it propagate.
- Prefer early returns over deep nesting.

## Validate at Boundaries

Declare the schema once, in the module's `*.constants.ts`, and derive the type from it in `*.types.ts` with `z.infer`. This repository is on Zod 4, so use its top-level string formats (`z.uuid()`, `z.email()`, `z.url()`), not the deprecated `z.string().uuid()` chain.

```ts
import { z } from "zod";

export const SEARCH_INPUT_SCHEMA = z.object({
  id: z.uuid(),
  limit: z.number().int().positive().optional(),
});

const input = SEARCH_INPUT_SCHEMA.parse(raw);
```

Use `parse` where invalid input should stop the program, and `safeParse` where the caller reports the failure itself.

## Catch Clauses Use unknown

```ts
// ❌ WRONG
try {
  await fetchData();
} catch (error: any) {
  console.error(error.message);
}

// ✅ CORRECT
try {
  await fetchData();
} catch (error: unknown) {
  this.logger.error("📥 Failed fetching data", String(error), { url });
  throw error;
}
```

Report through the injected `LoggerService` from `@codebase/observability`, whose `error` takes a message, a trace, and a context object; reach for `console` only in code with no logger, such as a script's entry point. Narrow with `error instanceof Error` before reading `.message` or `.stack`.

## Retry with Backoff

Retry only an operation that can succeed on a second try — a rate-limited or flaky network call — and bound it. Look for an existing helper in the project first: lexico-cli's `backoffMilliseconds` honors a `Retry-After` header. A minimal bounded loop:

```ts
const MAXIMUM_ATTEMPTS = 4;
const BASE_DELAY_MILLISECONDS = 500;

for (let attempt = 1; ; attempt++) {
  try {
    return await fetchData();
  } catch (error: unknown) {
    if (attempt === MAXIMUM_ATTEMPTS) {
      throw error;
    }

    await setTimeout(BASE_DELAY_MILLISECONDS * 2 ** (attempt - 1));
  }
}
```

`setTimeout` here is the promise form from `node:timers/promises`.
