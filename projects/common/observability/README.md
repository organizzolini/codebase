# 🪵 Logger

The shared NestJS logging package.

## Purpose

The one `LoggerService` every NestJS project in the codebase injects. Before
this package, seventeen projects each carried an identical copy of the same
`src/modules/logger` directory, so a fix to log formatting had to be applied
seventeen times.

It exports two things:

| Export          | Responsibility                                                             |
| --------------- | -------------------------------------------------------------------------- |
| `LoggerService` | Transient-scoped, `pino`-backed logger implementing Nest's `LoggerService` |
| `LoggerModule`  | `@Global()` module providing and exporting `LoggerService`                 |

## Usage

Import `LoggerModule` once in the root module. It is `@Global()`, so feature
modules inject `LoggerService` without importing anything themselves:

```ts
import { LoggerModule } from "@codebase/observability";

@Module({
  imports: [LoggerModule],
})
export class MainModule {}
```

`LoggerService` is `Scope.TRANSIENT` — each injecting class gets its own
instance. Always call `setContext` in the constructor so every line is tagged
with the originating class:

```ts
import { LoggerService } from "@codebase/observability";

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MyService.name);
  }
}
```

## Output modes

| `NODE_ENV`    | Output                                               |
| ------------- | ---------------------------------------------------- |
| `production`  | Structured JSON on stdout                            |
| anything else | Human-readable, colorized `pino-pretty` single lines |

`LOG_LEVEL` sets the pino level in both modes and defaults to `info`.

Because `pino-pretty` is named as a string transport target rather than
imported, no static analysis can see the reference. It is a real dependency of
this package so it resolves wherever `pino` does.

## File logging helpers

Commands that stream failures to a log file share two helpers rather than
re-deriving timestamps and output paths:

| Method                                       | Returns                                                         |
| -------------------------------------------- | --------------------------------------------------------------- |
| `buildErrorLogEntry(context, error)`         | `{ errorMessage, logLine }` — normalizes `unknown` errors       |
| `createTimestampedOutputLogFilePath(prefix)` | `<cwd>/output/<prefix>-<ISO timestamp>.log`, creating `output/` |

## Development

```bash
nx run logging:vitest
```

## License

MIT — see [LICENSE](../../LICENSE).

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run observability:coinagerie-check:write`.

- **breadth**: The count of direct calls a callable makes, which callidescope gates against this project's maximum breadth limit.
- **convention**: The logging message rule: an emoji naming the subject, then a present-progressive or past-tense verb, checked at runtime and by lint.
- **trace**: The verbose log level below debug, which LoggerService.verbose emits through its pino child logger.
- **verb**: The grammatical word the convention rule requires after the emoji subject, in present-progressive or past tense.

<!-- coinagerie:end -->
