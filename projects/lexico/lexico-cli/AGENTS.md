# LexicoIngestion: NestJS Command-Line Application

## Quick Start

**Type**: Node.js CLI application (NestJS + `nest-commander`)

**Purpose**: <!-- Briefly describe the specific purpose of this CLI application -->

Ingest Wiktionary Latin dictionary data into PostgreSQL, parsing HTML pages into structured `Lexeme`, `Translation`, `Form`, and `Word` records.

### Run Locally

```bash
cp .env.default .env  # Fill in required environment variables
nx run lexico-cli:start
```

## Architecture Overview

### Tech Stack

- **Framework**: NestJS (modules, dependency injection, providers)
- **CLI runner**: `nest-commander` (`CommandRunner` + `@Command()` decorator)
- **Database**: PostgreSQL via TypeORM (`@codebase/lexico-entities`)
- **Env validation**: `@nestjs/config` + `zod` (`environmentSchema` in `.constants.ts`)
- **Logging**: `@codebase/logging` — a `pino`-backed `LoggerService` (`Scope.TRANSIENT`)
- **Language**: Strict TypeScript

### Execution Flow

```text
src/lexico-cli.main.ts
  └─ CommandFactory.run(MainModule)
       └─ domain command modules            ← add under src/modules/
```

**Project Implementation**:

```text
src/lexico-cli.main.ts
  └─ CommandFactory.run(LexicoIngestionModule)
       └─ LexicoIngestionCommand.run()
            ├─ Step 1: ClearService.clearDictionary()
            ├─ Step 2: WiktionaryService.ingestWiktionary()
            ├─ Step 3: DictionaryService.ingestAll()
            └─ Step 4: ManualService.ingestManual()
```

Sub-commands: `wiktionary`, `dictionary`, `words`, `clear`, `export`, `import`

### Directory Layout

```text
src/
  lexico-cli.main.ts  # Bootstrap — do not modify
  lexico-cli.module.ts  # Root NestJS module (imports ConfigModule, LoggerModule)
  lexico-cli.constants.ts  # Zod environmentSchema for env validation
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

**Project Modules**:

```text
src/modules/
  clear/                                   # Truncates all dictionary tables
  dictionary/                              # Orchestrates full Wiktionary → Lexeme pipeline
  etymology/                               # Parses etymology sections
  export/                                  # Dumps selected tables to a custom-format file
  forms/                                   # Parses inflection tables
  import/                                  # Restores selected tables from such a file
  lexemes/                                 # Creates and saves Lexeme entities
  manual/                                  # Ingests manually curated entries
  part-of-speech/                          # Detects POS from Wiktionary HTML
  postgres-client/                         # Runs pg_dump, pg_restore, and the --clean truncate
  principal-parts/                         # Parses principal parts
  pronunciation/                           # Parses pronunciation data
  translations/                            # Parses and saves Translation entities
  wiktionary/                              # Downloads and stores raw Wiktionary pages
  words/                                   # Creates and saves Word entities
```

### Environment Variables

All validated via `environmentSchema` in `lexico-cli.constants.ts`, which spreads
`postgresEnvironmentSchema({ project: "lexico" })` from `@codebase/database`.
The root's unprefixed `POSTGRES_*` are the shared container's admin login and
are never read:

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `LEXICO_POSTGRES_HOST` | `localhost` | PostgreSQL host |
| `LEXICO_POSTGRES_PORT` | `5432` | PostgreSQL port |
| `LEXICO_POSTGRES_USERNAME` | `lexico_username` | PostgreSQL role |
| `LEXICO_POSTGRES_PASSWORD` | `lexico_password` | PostgreSQL password |
| `LEXICO_POSTGRES_DATABASE` | `lexico_development` | PostgreSQL database name |
| `LEXICO_POSTGRES_SCHEMA` | `lexico` | PostgreSQL schema holding lexico's tables |

## Development

### Adding Business Logic

1. **Implement the root command** — add logic to `lexico-ingestion.command.ts` `run()`, or delegate to injected services.
2. **Extend the pipeline** — add new steps to `LexicoIngestionCommand.run()`, or add sub-commands.
3. **Add domain command modules** — create `src/modules/<domain>/` with a NestJS module, command, service, types, and constants.
4. **Register in root module** — import the new module in `lexico-cli.module.ts`.
5. **Validate env vars** — extend `environmentSchema` in `lexico-cli.constants.ts` with all required environment variables.

### Logging

`LoggerService` and `LoggerModule` come from `@codebase/logging` — this project does not define its own logger. Add `"@codebase/logging": "workspace:*"` to `dependencies`, then import `LoggerModule` once in the root module; it is `@Global()`, so feature modules inject `LoggerService` without importing it.

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
nx run lexico-cli:start           # Run the command-line application
nx run lexico-cli:start:export --args="--help"   # Any command: start:<command> --args="..."
nx run lexico-cli:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run lexico-cli:typecheck       # tsc --noEmit
nx run lexico-cli:oxfmt           # Formatting
```

### Testing

Follow the codebase's strict three-tier testing strategy. Co-locate test files with the source they test.

```bash
nx run lexico-cli:vitest:unit          # Fast (<100ms) — pure logic, mocked DI
nx run lexico-cli:vitest:integration   # Moderate (1-2s) — real database/API I/O
nx run lexico-cli:vitest:end-to-end    # Slow (30-60s) — full CLI execution
```

| Tier | File pattern | What to test |
| ---- | ------------ | ------------ |
| Unit | `*.unit.test.ts` | Pure functions, service methods with mocked deps |
| Integration | `*.integration.test.ts` | Database queries, external API clients |
| End-to-end | `*.end-to-end.test.ts` | Full `CommandFactory.run()` execution |

Project-specific integration tests also cover Wiktionary HTML parsing.

See the [testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

## Moving Data Between Databases

Use `export` and `import` to copy Lexico tables between two databases; they are the supported way to move Lexico data. The workspace root's `postgres-data` targets and the `seed-postgres` skill still exist on this branch and are being retired in a follow-up, so do not reach for them. Each names its database by URI, so neither boots the CLI's own database connection (`STANDALONE_COMMANDS` in `src/main.constants.ts`).

The `start` configurations run from `projects/lexico/lexico-cli`, so a relative `--file` such as `lexico.dump` lands there (`*.dump` is gitignored).

```bash
nx run lexico-cli:start:export --args="--source-uri postgresql://user:password@localhost:5432/lexico_development --table words --data --schema --file lexico.dump"
nx run lexico-cli:start:import --args="--target-uri postgresql://user:password@localhost:5432/lexico_staging --table words --data --schema --file lexico.dump"
```

| Option | Command | Rule |
| ------ | ------- | ---- |
| `--source-uri` / `--target-uri` | `export` / `import` | Required |
| `--table` | both | Required, repeatable; unqualified names resolve in `LEXICO_POSTGRES_SCHEMA` (default `lexico`) |
| `--data`, `--schema` | both | At least one; both together is allowed |
| `--file` | both | Required |
| `--overwrite` | `export` | Replace an existing file, otherwise refused |
| `--clean` | `import` | Delete before restoring; confirmed first |
| `--yes` | `import` | Skip the confirmation |
| `--dry-run` | `import` | Check everything, print the plan, connect to nothing |

- **Format**: always PostgreSQL custom format; there is no format option.
- **Default import**: deletes nothing and runs as one transaction. A conflict aborts it, and so does a selected table that already exists in a `--schema` import.
- **`--clean --schema`**: drops and recreates the selected tables (`pg_restore --clean --if-exists`).
- **`--clean --data`**: truncates exactly the selected tables, never cascading. When an unselected table references one, it refuses and lists the `--table` options to add.
- **Sequences**: a data-only dump's sequence values belong to no table, so they are restored only when `--table` selects every table in the dump; importing a subset leaves the target's sequences as they were.
- **Confirmation**: names the target's host and database. A run whose standard input is not a terminal fails with the target unchanged unless `--yes` is passed; a TTY-less prompt must never exit 0 doing nothing.
- **Dry run**: `--dry-run` runs every check a real import runs (options, `pg_restore` version, file, table of contents), then prints the target's host and database, the file, what the dump holds of each table, and what `--clean` would truncate or drop, and exits 0. It never connects, prompts, or deletes, so it needs no `--yes` and no terminal; a selection the dump lacks still fails. Use it to check an import before running it, e.g. `nx run lexico-cli:start:import --args="... --file lexico.dump --dry-run"`.
- **Truncate caveat**: `--clean --data` is not atomic. The truncate commits before the restore, so a failed restore can leave the selected tables empty. Tell the user to re-run from the same file; do not try to engineer around it.
- **Client tools**: `pg_dump` and `pg_restore` must be PostgreSQL 18, checked before anything runs. `scripts/local/software/database.sh` and the devcontainer install them.
- **Missing table**: a `--table` that matches nothing in the source fails `export` naming it (`--strict-names` is always on). `export` dumps to a temporary `<file>.<id>.partial` beside `--file` and renames it into place only on success, so a failed run leaves `--file` untouched (absent, or its old bytes) and no temporary file behind.
- **Credentials**: passed as `PG*` environment variables, never argv, and masked in every log line and surfaced error. Inherited `PG*` variables are stripped and URI query parameters are refused, so TLS options are not currently passed through. `pg_dump` and `pg_restore` still negotiate TLS when the server offers it (libpq's default SSL mode is `prefer`), but the `--clean --data` truncate connects through the `pg` driver with no TLS option, so it fails against a server that requires TLS, before anything is truncated.

Do not run `import --clean` against a database the user did not name. Prefer a throwaway target when testing.

## Writing Modules

Use the generator to scaffold new domain modules, then implement the service:

```bash
nx g conformetry:nestjs-service-module --name=<domain>
```

This creates five files in `src/modules/<domain>/`:

| File | Purpose |
| ---- | ------- |
| `<domain>.module.ts` | Declares providers, imports, and exports |
| `<domain>.service.ts` | Business logic — the only place you write domain code |
| `<domain>.constants.ts` | Regex, enums, static config — never inline magic values |
| `<domain>.types.ts` | TypeScript types scoped to this module |
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
- **Class-only top level** — keep NestJS class files to imports plus the class declaration only. Move helper interfaces/types to `<domain>.types.ts`, constants/init helpers to `<domain>.constants.ts` or class members, and do not re-export aliases or types from `*.service.ts`.

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

After generating a module, import it in `lexico-cli.module.ts`:

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

- **Never** put business logic in `lexico-cli.main.ts` — it bootstraps `CommandFactory` only.
- **One command per class** — split sub-commands into separate `CommandRunner` subclasses.
- **Validate at the boundary** — all env vars must be declared in `environmentSchema`; access via `ConfigService`, not `process.env`.
- **Type imports** — use `import { type Foo }` for type-only imports (enforced by ESLint).
- **No `any` types** — use `unknown` or proper typing; strict mode is enabled.

See the [write-typescript skill](../../../.agents/skills/write-typescript/SKILL.md) for strict mode patterns.

## Troubleshooting

- **Command not found at runtime** — ensure the command class is listed in `providers` of its module and the module is imported by the root module.
- **Dependency injection failure** — verify the service is `@Injectable()`, exported from its module, and that module is imported by the consuming module.
- **Unrecognized CLI flag** — check that `@Option()` decorators in the command class exactly match the flag names passed.
- **Env var validation error on startup** — add the missing variable to environmentSchema in src/lexico-cli.constants.ts and to .env.default.
- **TypeORM entity not found** — register the entity via `TypeOrmModule.forFeature([MyEntity])` in the module that uses it.

See the [triage-integration skill](../../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

## Key Files

- [src/lexico-cli.main.ts](src/lexico-cli.main.ts): Application bootstrap
- [src/modules/lexico-ingestion/lexico-ingestion.command.ts](src/modules/lexico-ingestion/lexico-ingestion.command.ts): Root CLI command
- [src/lexico-cli.module.ts](src/lexico-cli.module.ts): Root NestJS module
- [src/lexico-cli.constants.ts](src/lexico-cli.constants.ts): environmentSchema (Zod)
- `@codebase/logging` (`projects/logging`): shared pino-backed `LoggerService` and `LoggerModule`
- [project.json](project.json): Nx targets (`develop`, `build`, `test`, `lint`, `typecheck`, `format`)
- [.env.default](.env.default): Environment variable template

**Project Files**:

- `lexico-ingestion.command.ts` includes pipeline orchestration
- `lexico-ingestion.constants.ts` includes `LEXICO_INGESTION_BY_ID`
