# Integration: NestJS Command-Line Application

## Quick Start

**Type**: Node.js CLI application (NestJS + `nest-commander`)

**Purpose**: Continuous Integration plumbing: the steps that run around a CI job, as tested commands. Today that is the affected run, the Nx task-cache database (verify, adopt, keep), and the weekly dependency upgrades; the base bounding and the pull-request cache import are planned here too. "Integration" in this project means Continuous Integration, never the `vitest:integration` test kind. Commands only compute and print and set an exit code; services hold the logic behind injected file-system and process wrappers.

### Run Locally

```bash
cp .env.default .env  # Fill in required environment variables
nx run integration:start
```

## Architecture Overview

### Tech Stack

- **Framework**: NestJS (modules, dependency injection, providers)
- **CLI runner**: `nest-commander` (`CommandRunner` + `@Command()` decorator)
- **Env validation**: `@nestjs/config` + `zod` (`environmentSchema` in `.constants.ts`)
- **Logging**: `@codebase/observability` — a `pino`-backed `LoggerService` (`Scope.TRANSIENT`)
- **Language**: Strict TypeScript

### Execution Flow

```text
src/integration.main.ts
  └─ CommandFactory.run(MainModule)
       └─ domain command modules            ← add under src/modules/
```

### Directory Layout

```text
src/
  integration.main.ts  # Bootstrap — do not modify
  integration.module.ts  # Root NestJS module (imports ConfigModule, LoggerModule)
  integration.constants.ts  # Zod environmentSchema for env validation
  modules/
    <domain>/                       # Add feature modules here
      <domain>.module.ts
      <domain>.command.ts
      <domain>.service.ts
      <domain>.types.ts
      <domain>.constants.ts
      <domain>.<tier>.test.ts
testing/                            # Shared test utilities
```

### Commands

Commands read their inputs from the environment, as the workflows and composite
actions set them, print what they decide, and set the exit code. Anything that
runs a child process goes through `ProcessRunnerService`, so a test replaces
one class.

| Command | Module | Called from |
| ------- | ------ | ----------- |
| `run-affected` | `src/modules/run-affected` | the `run-affected` composite action |
| `verify-task-database` | `src/modules/verify-task-database` | the `cleanup-codebase` composite action |
| `adopt-task-database` | `src/modules/adopt-task-database` | nothing yet: `setup-codebase` runs it before install, as `scripts/nx/adopt-task-database.sh` |
| `keep-task-database` | `src/modules/keep-task-database` | the `cleanup-codebase` composite action |
| `upgrade-dependencies` | `src/modules/upgrade-dependencies` | the `upgrade-dependencies` workflow |

`src/modules/process-runner` holds the wrapper over `node:child_process`
(`capture` returns the output, `captureAsync` does so without blocking, and
`stream` inherits it). The `publication` project keeps its own copy for the
release commands and the publishable-packages gate; the two are not shared
through a library yet. `src/modules/task-database` holds the service the three
task-database commands share; it reads `NX_WORKSPACE_DATA_DIRECTORY` and
`MACHINE_ID_FILES`, and opens the databases with the built-in `node:sqlite`, so
no `sqlite3` binary is needed.

`upgrade-dependencies` runs the steps listed in its constants one at a time, each
as a `bash -e -o pipefail` script. Before each it records the whole working tree
as a git tree, untracked files included, and a step that fails is undone by
restoring that tree, which is what the previous step left, so a later failure
never undoes an earlier success. A skipped step is listed in the pull request
body the command writes to `RUNNER_TEMP`. Only a step that cannot be undone
stops the run. To add an upgrade, add a step to `UPGRADE_STEPS`; a step that
needs the environment rebuilt after it is undone gives a `recover` script.

Run one locally with `nx run integration:start:<command>`, setting the
variables it reads (`TARGET`, `NX_BASE`, `NX_HEAD`, and so on).

Steps that run before `pnpm install` cannot live here, because a command needs
the installed dependencies. `scripts/nx/bound-base-to-push.sh` is one.

## Development

### Adding Business Logic

1. **Add domain command modules** — create `src/modules/<domain>/` with a NestJS module, command, service, types, and constants.
2. **Register in root module** — import the new module in `integration.module.ts`.
3. **Validate env vars** — extend `environmentSchema` in `integration.constants.ts` with all required environment variables.

### Logging

`LoggerService` and `LoggerModule` come from `@codebase/observability` — this project does not define its own logger. Add `"@codebase/observability": "workspace:*"` to `dependencies`, then import `LoggerModule` once in the root module; it is `@Global()`, so feature modules inject `LoggerService` without importing it.

`LoggerService` is `Scope.TRANSIENT` — each injecting class gets its own instance. Always call `setContext` in the constructor:

```ts
constructor(private readonly logger: LoggerService) {
  super();
  this.logger.setContext(MyService.name);
}
```

Outputs structured JSON in production (`NODE_ENV=production`) and pretty-printed logs in development.

### Key Commands

Always prefer running tasks through Nx rather than calling the underlying tools directly.

```bash
nx run integration:start           # Run the command-line application
nx run integration:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run integration:typecheck       # tsc --noEmit
nx run integration:oxfmt           # Formatting
```

### Testing

Follow the codebase's strict three-tier testing strategy. Co-locate test files with the source they test.

```bash
nx run integration:vitest:unit          # Fast (<100ms) — pure logic, mocked DI
nx run integration:vitest:integration   # Moderate (1-2s) — real database/API I/O
nx run integration:vitest:end-to-end    # Slow (30-60s) — full CLI execution
```

| Tier        | File pattern            | What to test                                     |
| ----------- | ----------------------- | ------------------------------------------------ |
| Unit        | `*.unit.test.ts`        | Pure functions, service methods with mocked deps |
| Integration | `*.integration.test.ts` | Database queries, external API clients           |
| End-to-end  | `*.end-to-end.test.ts`  | Full `CommandFactory.run()` execution            |

See the [testing-strategy skill](../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

## Writing Modules

Use the generator to scaffold new domain modules, then implement the service:

```bash
nx g conformetry:nestjs-service-module --name=<domain>
```

This creates five files in `src/modules/<domain>/`:

| File                            | Purpose                                                 |
| ------------------------------- | ------------------------------------------------------- |
| `<domain>.module.ts`            | Declares providers, imports, and exports                |
| `<domain>.service.ts`           | Business logic — the only place you write domain code   |
| `<domain>.constants.ts`         | Regex, enums, static config — never inline magic values |
| `<domain>.types.ts`             | TypeScript types scoped to this module                  |
| `<domain>.service.unit.test.ts` | Unit tests bootstrapped with `Test.createTestingModule` |

### Module file

Register the service in both `providers` and `exports` so consumers can inject it:

```ts
@Module({
  controllers: [],
  exports: [MyDomainService],
  imports: [TypeOrmModule.forFeature([MyEntity]), LoggerModule],
  providers: [MyDomainService],
})
export class MyDomainModule {}
```

Add a JSDoc comment on the module class describing what domain it owns.

### Service file

Follow the section-comment layout from the template — it keeps large services scannable:

```ts
@Injectable()
export class MyDomainService {
  // 🏗 Dependency Injection
  constructor(
    @InjectRepository(MyEntity)
    private readonly repo: Repository<MyEntity>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MyDomainService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods
}
```

Key rules:

- **Call `setContext` in every constructor** — always use `MyClass.name`, never a string literal.
- **Inject `LoggerService` as the last constructor parameter** (after repository/domain deps).
- **Private first** — keep internal helpers in the `🔏 Private Methods` section, expose only what callers need under `🌎 Public Methods`.
- **`readonly` everything in the constructor** — all injected deps must be `private readonly`.
- **One service per module** — if a service grows too large, extract a sub-domain into its own module.

### Constants file

Move all inline values to `.constants.ts` to keep services readable:

```ts
// ♟️ Constants
export const MY_SKIP_REGEX = /(alternative)|(archaic)|(synonym)/i;
export const DEFAULT_PAGE_SIZE = 100;
```

### Types file

Put all module-local TypeScript types and interfaces in `.types.ts`:

```ts
// 🏷️ Types
export interface ParsedEntry {
  word: string;
  partOfSpeech: string;
}
```

Do not re-export types from `index.ts` unless they are part of the public API consumed by other modules.

### Registering in the root module

After generating a module, import it in `integration.module.ts`:

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ ... }),
    LoggerModule,
    MyDomainModule,   // ← add here
  ],
  providers: [],
})
export class MainModule {}
```

### Conformetry validation

Conformetry validation measures generated and existing module structures against the templates they came from. It runs for one project, or for every project at once.

```bash
pnpm nx run-many --targets=conformetry-validate
```

## Best Practices

- **Never** put business logic in `integration.main.ts` — it bootstraps `CommandFactory` only.
- **One command per class** — split sub-commands into separate `CommandRunner` subclasses.
- **Validate at the boundary** — all env vars must be declared in `environmentSchema`; access via `ConfigService`, not `process.env`.
- **Type imports** — use `import { type Foo }` for type-only imports (enforced by ESLint).
- **No `any` types** — use `unknown` or proper typing; strict mode is enabled.

See the [write-typescript skill](../../.agents/skills/write-typescript/SKILL.md) for strict mode patterns.

## Troubleshooting

- **Command not found at runtime** — ensure the command class is listed in `providers` of its module and the module is imported by the root module.
- **Dependency injection failure** — verify the service is `@Injectable()`, exported from its module, and that module is imported by the consuming module.
- **Unrecognized CLI flag** — check that `@Option()` decorators in the command class exactly match the flag names passed.
- **Env var validation error on startup** — add the missing variable to `environmentSchema` in `src/integration.constants.ts` and to `.env.default`.

See the [triage-integration skill](../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

## Key Files

- [src/integration.main.ts](src/integration.main.ts): Application bootstrap
- [src/integration.module.ts](src/integration.module.ts): Root NestJS module
- [src/integration.constants.ts](src/integration.constants.ts): `environmentSchema` (Zod)
- `@codebase/observability` (`projects/common/observability`): shared pino-backed `LoggerService` and `LoggerModule`
- [project.json](project.json): Nx targets (`start`, `build`, `vitest`, `typecheck-code`, `lint-code`, `format-code`)
- [.env.default](.env.default): Environment variable template
