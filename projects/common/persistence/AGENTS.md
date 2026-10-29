# Persistence: Shared Postgres and SQLite Package

## Quick Start

**Type**: NestJS library package (`@codebase/persistence`) and nest-commander
command line (`postgresql-export` and `postgresql-import`)

**Purpose**: Two jobs. The library is the one way a database-backed project
connects to Postgres: the `<PROJECT>_POSTGRES_*` environment fragment, the
TypeORM options factory, the NestJS module and command-line data source built
from it, and the naming convention behind them. `SqliteModule` does the same
for a SQLite file through better-sqlite3, from one `<PROJECT>_SQLITE_DATABASE`
variable, with its own base entities. The command line moves
selected tables between databases through `pg_dump` and `pg_restore`, each
database named by a URI. See the [README](README.md) for the exports, the
naming table, and every command-line option.

This package may import one workspace package, `@codebase/observability`, for its
command line's logger, and never any other, or every database-backed project
inherits that edge. Logging has no workspace dependencies, so the edge makes
no cycle, and lexico-cli, lexico-api, meanderaw-cli, and caelundas-cli
already depend on it; lexico-entities gains it only transitively.

## Architecture Overview

### Tech Stack

- **ORM**: TypeORM against Postgres 18, with `typeorm-naming-strategies`' snake case
- **Env validation**: `zod`, as a fragment each application spreads into its own schema
- **Language**: Strict TypeScript

### Directory Layout

```text
src/
  index.ts                          # Public API, the library only
  persistence.main.ts               # The command line's entry point
  persistence.module.ts             # MainModule: the command line's root, not PostgresqlModule
  persistence.repl.ts               # NestJS REPL over MainModule
  modules/
    postgresql/
      postgresql.constants.ts         # Variable suffixes and connection defaults
      postgresql.module.ts            # PostgresqlModule.forRoot over TypeOrmModule.forRootAsync
      postgresql.service.ts           # The TypeORM options factory forRoot hands TypeORM
      postgresql.types.ts
      postgresql.utilities.ts         # postgresEnvironmentSchema, postgresDataSourceOptions, createDataSource, variable names
      entities/                     # identifiable → creatable → updatable → deletable
      postgresql-container.*.ts       # startPostgresContainer, the testing entry's harness
    postgresql-export/              # The postgresql-export command: options, plan, dry run, atomic write
    postgresql-import/              # The postgresql-import command: options, plan, --clean (no prompt), dry run
    postgresql-utilities/           # pg_dump, pg_restore, and truncate behind one service
    sqlite/                         # SqliteModule.forRoot, the options factory, createSqliteDataSource, SQLite base entities
testing/
  index.ts                          # The @codebase/persistence/testing entry
  persistence-testing.*.ts          # startDatabaseTestingModule, the entry's Nest helper
  command-line-runner.ts            # runCliCommandLine: argv through the real nest-commander runner
  fixture-persistence.ts            # A migrated container for the command line's integration tests
  fixtures/                         # Entities, modules, and the widgets and parts migrations
  setup.ts, mocks.ts                # Vitest setup and mocks
```

## Development

### Rules this package holds

- **Never read an unprefixed `POSTGRES_*` variable.** They are the shared
  container's admin login, loaded by Nx into every task.
- **Never let `synchronize` be configured on.** The schema changes only
  through reviewed migrations. Postgres runs them as their own step;
  `SqliteModule.forRoot` alone runs the migrations it is given on start, since
  a file has one writer.
- **Never share a Postgres entity with SQLite.** `uuid` and `timestamptz`
  are refused by TypeORM's SQLite driver; use the `Sqlite*Entity` bases, whose
  ids TypeORM generates in the application and whose timestamps are
  `datetime`. Never read an unprefixed `SQLITE_DATABASE` either.
- **Never name a schema in code.** It comes from `<PROJECT>_POSTGRES_SCHEMA`.
- **Never run migrations from `PostgresqlModule.forRoot`.** It takes none;
  `createDataSource` and `startPostgresContainer` do.
- **Keep the testing entry under `testing/`.** It imports `@nestjs/testing`,
  and dependency-cruiser's `no-test-imports-in-app` allows test tooling only
  from a `testing/` path, in this package and in every consumer that cruises
  into it.
- **Never name a real project in this package's tests.** Use `fixture`, and
  `sample` where a second is needed.
- **Keep the command line connectionless.** `MainModule` holds no
  `PostgresqlModule`, TypeORM, or `ConfigModule`, so it needs no
  `<PROJECT>_POSTGRES_*` variable and opens no connection at startup. Never
  export `MainModule` from `src/index.ts` or `testing/index.ts`.
- **Pass credentials to client tools only through `PG*` environment
  variables,** never argv, and mask every URI and password that reaches a log
  line or an error.
- **Never import GraphQL into the base entities.** Meanderaw and caelundas
  must not depend on it; lexico layers its `@Field` decorators on top.

### Key Commands

```bash
nx run persistence:typecheck-code,lint-code,format-code,deprecate-code,guard-code
nx run persistence:vitest:unit
nx run persistence:type-coverage
nx run persistence:start:postgresql-export --args="--source-uri <uri> --table <schema.table> --data --file <path>"
nx run persistence:start:postgresql-import --args="--target-uri <uri> --table <schema.table> --data --file <path>"
```

`postgresql-import --clean` never prompts and has no `--yes`; the preview is
`postgresql-import --dry-run`, which names what `--clean` would drop or truncate. Run it
first.

The `start` configurations run the command line with the working directory at
`projects/common/persistence`. Both commands need the PostgreSQL 18 client tools; see
the README's [Moving data between databases](README.md#moving-data-between-databases).

See the [write-typescript skill](../../.agents/skills/write-typescript/SKILL.md)
and the [testing-strategy skill](../../.agents/skills/testing-strategy/SKILL.md).
