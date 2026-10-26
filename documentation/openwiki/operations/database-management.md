---
type: operations-guide
title: Database Management
description: Documents Postgres database operations including migrations, schema/project/role conventions, moving data between databases (export/import), and Testcontainers for integration testing.
tags: [database, postgres, migrations, testcontainers, export-import, operations]
sources:
  - id: openwiki-source-fde0a41d410be4adddc7d9c3
    resource: repo://documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md
  - id: openwiki-source-e84c9845fa1929e0b3fde349
    resource: repo://infrastructure/README.md
  - id: openwiki-source-bb47f0ae03a5325f0d8fdea7
    resource: repo://projects/common/persistence/README.md
  - id: openwiki-source-a688f65f433758aea382c292
    resource: repo://projects/common/persistence/src/modules/postgresql/postgresql-container.utilities.ts
  - id: openwiki-source-79618aae32d9845bfacb091d
    resource: repo://projects/common/persistence/src/modules/postgresql/postgresql.utilities.ts
  - id: openwiki-source-4808dd4ba16cde901f5bc82f
    resource: repo://projects/common/persistence/testing/persistence-testing.utilities.ts
verified:
  - by: openwiki/0.7.0
    at: 2026-10-26T01:23:39.729Z
generated: { by: "openwiki/0.7.0", at: "2026-10-26T01:23:39.729Z" }
---

# Database Management

This page documents how the workspace manages Postgres databases for every database-backed project (lexico, meanderaw, caelundas). It covers the naming conventions, the migration workflow, exporting/importing data between databases, and the Testcontainers harness used by integration tests.

All database projects share a single package, `@codebase/persistence`, which centralizes environment variable schemas, TypeORM options, the NestJS `PostgresqlModule`, the command-line `DataSource`, base entities, the migration Nx target, and the Testcontainers helpers.

---

## Naming Conventions (ADR 0022)

Every project owns its own database, schema, and role. The database name carries the environment; the schema name never does. This allows a migration generated locally to apply unchanged in any environment because TypeORM writes the schema name into generated SQL.

| Context | Database | Schema | Role |
| --- | --- | --- | --- |
| Local Docker | `<project>_development` | `<project>` | `<project>_username` / `<project>_password` |
| Testcontainers | `<project>_testing` | `<project>` | same as local |
| Kubernetes (staging/production) | `<project>_staging` / `<project>_production` | `<project>` | provisioned by deployment |

**Variable isolation:** Each project reads only its own `<PROJECT>_POSTGRES_*` variables (`_HOST`, `_PORT`, `_USERNAME`, `_PASSWORD`, `_DATABASE`, `_SCHEMA`). The root `.env` holds unprefixed `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` for the shared container's admin login; applications never read those.

**Project name rules:** Lowercase letters, digits, and underscores, starting with a letter, so the name can prefix a variable and name a database unquoted.

**Reference:** [ADR 0022: Give Every Database Project Its Own Database, Schema, and Role](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md)

---

## Migration Workflow

Migrations are the **only** way the schema changes. The runtime never runs them: `synchronize` and `migrationsRun` are hard-coded to `false` in the shared `postgresDataSourceOptions` factory. Running migrations is a separate step, executed via Nx commands.

### Project Setup

Each project keeps its own database module at `src/modules/<project>-database/`:

- `data-source.constants.ts` — exports a `DataSource` created by `createDataSource({ entities, migrations, project })`; this is what the TypeORM CLI reads.
- `migrations/` — generated migration files and their extracted `.sql` counterparts.

The project opts in to the shared `migration` target by declaring one option:

```jsonc
// project.json
"migration": {
  "options": { "module": "src/modules/<project>-database" }
}
```

The target reads two conventional paths from that option:

| Path | Holds |
| --- | --- |
| `<module>/data-source.constants.ts` | The `createDataSource(...)` the TypeORM command line reads |
| `<module>/migrations/` | Each generated migration and its extracted `.sql` |

### Commands

Run from the workspace root or the project directory:

| Command | Purpose |
| --- | --- |
| `nx run <project>:migration:run` | Applies every pending migration |
| `nx run <project>:migration:generate` | Generates a migration from the entities, extracts it, and lints |
| `nx run <project>:migration:revert` | Reverts the latest migration |
| `nx run <project>:migration:show` | Lists applied and pending migrations |
| `nx run <project>:migration:extract-sql-latest` | Extracts the latest migration's SQL for `sqlfluff` and `squawk` |
| `nx run <project>:migration:extract-sql-all` | Extracts every migration's SQL |

**Generate workflow:** After editing an entity, run `migration:generate`. It runs `lint-code:write` at the end, which will fail on the empty JSDoc blocks TypeORM writes. Describe the class and its `up`/`down` methods, then run `lint-code:write` again.

**First migration hand edits:** When a project's first generated column or view appears, two hand edits remain:

1. Create the metadata table before the first `INSERT` into it: `CREATE TABLE IF NOT EXISTS "<project>"."typeorm_metadata" (...)` (and drop it in `down`). TypeORM creates it only when it synchronizes, which never happens here.
2. Replace the generating database's literal name (`<project>_development`) in the `INSERT`/`DELETE` parameters with `current_database()`. TypeORM matches the row by database when reading back, so a `_testing` or production database would otherwise see the column as changed.

**Search path pinning:** Every pooled connection pins its session's `search_path` to the project's schema alone (no `public`). Unqualified SQL lands in the project's schema or fails if the schema is missing. TypeORM's `current_schema()` fallback also names the project's schema.

<!-- openwiki: broken internal link [../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md#migrations-everywhere] heading anchor "migrations-everywhere" does not exist in "../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md". Fix the href or restore the target, then delete this comment. -->
**Reference:** [ADR 0022, Migrations section](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md#migrations-everywhere)

---

## Export/Import: Moving Data Between Databases

The `@codebase/persistence` package is also a command-line tool, `database`, that copies selected tables between two Postgres databases through `pg_dump` and `pg_restore`. Each command names its database by URI, so it needs no `<PROJECT>_POSTGRES_*` variables and opens no connection at startup.

Run through Nx; the working directory is `projects/common/persistence`, so a relative `--file` resolves from there (`*.dump` is gitignored there).

### Export

```bash
nx run persistence:start:export --args="--source-uri postgresql://user:password@localhost:5432/source --schema fixture --table widgets --data --ddl --file sample.dump"
```

### Import

```bash
nx run persistence:start:import --args="--target-uri postgresql://user:password@localhost:5432/target --schema fixture --table widgets --data --ddl --file sample.dump"
```

### Options

| Option | Command | Purpose |
| --- | --- | --- |
| `--source-uri <uri>` | export | Required. The database to dump |
| `--target-uri <uri>` | import | Required. The database to restore into |
| `--table <name>` | both | Required, repeatable. A table to move |
| `--schema <name>` | both | The schema unqualified `--table` names resolve in (like `pg_dump --schema`) |
| `--data`, `--ddl` | both | Rows, table definitions (DDL), or both; at least one required |
| `--file <path>` | both | Required. The dump to write or read |
| `--overwrite` | export | Replace `--file` when it exists |
| `--clean` | import | Clear the selected tables before restoring, no confirmation |
| `--dry-run` | both | Validate and print the plan without connecting or changing anything |

**Qualified names:** `schema.table` are used as written. There is no default schema: without `--schema`, an unqualified `--table` fails before anything runs. Naming one table twice moves it once.

### Export Behavior

- Writes a custom-format dump (the only format produced).
- Passes `--strict-names` to `pg_dump`, so a missing table fails the run with a message naming it and the source.
- An existing `--file` is refused unless `--overwrite` is given.
- `pg_dump` writes to a `.partial` file beside `--file`, which replaces it only once the dump succeeds. A failed `--overwrite` keeps the old dump.
- `--dry-run` still checks that `pg_dump` is installed, then prints the source database, what each table would export, and whether `--file` would be created or overwritten.

### Import Behavior

- Restores selected tables in one transaction that stops at the first error. By default it deletes nothing; a conflict leaves the target as it was.
- Before any connection opens, it lists the dump and fails when it lacks the rows or definitions `--data` and `--ddl` ask for.
- Owners and grants are **not** restored; the target's own role owns what it creates.
- `--ddl` without `--clean` fails when a selected table already exists on the target.
- `--dry-run` prints what the dump holds of each table and what `--clean` would drop or truncate.

#### `--clean` Details

- Empties the selected tables first and never asks for confirmation.
- With `--ddl`: `pg_restore --clean --if-exists` drops and recreates them.
- With `--data` alone: a `TRUNCATE` on exactly the selected tables empties them, without `CASCADE`. When a table outside the selection references one, the import refuses and lists the `--table` options to add.
- The truncate commits on its own before the restore, so the pair is **not atomic**: a restore that fails afterwards leaves the tables empty. Re-run the import from the same file.
- A data-only import of some tables does not restore the values of the sequences behind them.

### Requirements

Both commands need the PostgreSQL 18 client tools (`pg_dump` for export, `pg_restore` for import) and check their version before any database work. A missing tool or another major version fails with the setup script to run: `scripts/local/software/persistence.sh` installs them with Homebrew; the devcontainer installs them too.

### Credentials

A URI's password reaches the client tools only through their `PG*` environment variables, never their arguments, and is masked in every log line and error. The tools run with every inherited `PG*` variable removed. A URI carrying query parameters is refused, so nothing can set a TLS mode or any other connection option. The truncate for `--clean --data` connects through the `pg` driver with no `ssl` option at all; a server that requires TLS is therefore not reachable through these commands today.

---

## Testcontainers for Integration Testing

`@codebase/persistence/testing` provides two exports for integration suites:

### `startPostgresContainer`

Starts a throwaway `postgres:18-alpine` container (falling back to Google's mirror of Docker Hub), laid out like the local Docker container: a `<project>_username` role owning a `<project>_testing` database with a `<project>` schema inside it. It then builds the schema by running the project's **real migrations**, so every integration suite exercises them.

```ts
import { startPostgresContainer } from "@codebase/persistence/testing";

const container = await startPostgresContainer({
  migrations: [InitialMigration1767225600000],
  project: "meanderaw",
});

// … build a DataSource from postgresDataSourceOptions(container.connection, …)

await container.stop();
```

**Returns:** `StartedPostgresContainer` with:
- `connection` — the project's role connection (never the container's admin login)
- `environment` — the same connection as `<PROJECT>_POSTGRES_*` variables for a `PostgresqlModule` to read
- `stop()` — stops the container

### `startDatabaseTestingModule`

Starts the container, then compiles a Nest testing module with a global `ConfigModule` and `PostgresqlModule.forRoot` connected to it. The container's `<PROJECT>_POSTGRES_*` variables are set on `process.env` for the module's lifetime, over any already there. `close()` closes the module, stops the container, and restores the whole of `process.env`, removing any default `validate` filled in.

```ts
import { startDatabaseTestingModule } from "@codebase/persistence/testing";

const database = await startDatabaseTestingModule({
  entities: [Meander],
  imports: [DrawingModule],
  migrations: [InitialMigration1767225600000],
  project: "meanderaw",
  providers: [DrawCommand],
  validate: (config) => environmentSchema.parse(config),
});

const meanders = database.repository(Meander);
const command = database.module.get(DrawCommand);
// … database.dataSource, database.container

await database.close();
```

#### Options

| Option | Purpose |
| --- | --- |
| `project` | Names the role, the `_testing` database, the schema, and the variables |
| `entities` | Registered with `TypeOrmModule.forFeature`, and connected when no `database` is given |
| `migrations` | Run by the container before the module boots |
| `imports` | The modules under test |
| `providers` | The providers under test |
| `database` | The project's own `<Project>PostgresqlModule`, imported in place of the helper's `forRoot` |
| `namingStrategy` | Replaces snake case on the helper's own `forRoot` |
| `validate` | The application's environment validation, usually `environmentSchema.parse` |
| `images` | Overrides the images tried, in order |

When the modules under test import the project's own database module, pass it as `database` too, or the testing module connects twice. `database` and `namingStrategy` cannot be combined, since the project's module sets its own.

**Dependency note:** Testcontainers and `@nestjs/testing` are dependencies of this entry. `dependency-cruiser`'s `no-test-imports-in-app` rule lets only a `testing/` path import test tooling, so import it only from tests and `testing/` harnesses. Docker must be running.

<!-- openwiki: broken internal link [../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md#integration-tests-need-docker-as-they-already-did-and-every-suite-now-also-exercises-the-projects-migrations] heading anchor "integration-tests-need-docker-as-they-already-did-and-every-suite-now-also-exercises-the-projects-migrations" does not exist in "../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md". Fix the href or restore the target, then delete this comment. -->
**Reference:** [ADR 0022, Integration tests section](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md#integration-tests-need-docker-as-they-already-did-and-every-suite-now-also-exercises-the-projects-migrations)

---

## Runtime Never Runs Migrations

The shared `postgresDataSourceOptions` factory **hard-codes** `synchronize: false` and `migrationsRun: false`. These cannot be passed in or overridden.

- **`synchronize: false`** — The schema changes only through reviewed migrations, run by `nx run <project>:migration:run` rather than on start, where several processes starting together would race on the same DDL.
- **`migrationsRun: false`** — `PostgresqlModule.forRoot` takes no migrations at all. Migrations run as their own step (Nx command now, Kubernetes Job later) because several pods starting together would otherwise race on the same DDL.

This is enforced by unit tests in `postgresql.utilities.unit.test.ts` and documented in the AGENTS.md guardrails.

<!-- openwiki: broken internal link [../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md#no-migrations-on-application-start] heading anchor "no-migrations-on-application-start" does not exist in "../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md". Fix the href or restore the target, then delete this comment. -->
**Reference:** [ADR 0022, No migrations on application start](../../documentation/adr/0022-give-every-database-project-its-own-database-schema-and-role.md#no-migrations-on-application-start)

---

## Local Database Provisioning

The Compose `postgres` service creates every project's role, database, and schema from its `POSTGRES_PROJECTS` list, but **only when the volume is empty**.

The `POSTGRES_PROJECTS` list is defined in `infrastructure/docker/docker-compose.yml`:

```yaml
environment:
  # Every database-backed project: adding one is adding its name here.
  POSTGRES_PROJECTS: caelundas lexico meanderaw
```

An inline config script (`databases.sh`) runs on first start and loops over `POSTGRES_PROJECTS` to create each role, its `_development` database, and its schema.

### Adding a Project to an Existing Volume

To add a project to a volume that already holds data:

```bash
nx run infrastructure:postgres:up
docker exec -e POSTGRES_PROJECTS=<project> postgres sh /docker-entrypoint-initdb.d/databases.sh
```

The script stops at the first object that already exists, so name **only the projects the volume lacks**. Never use `infrastructure:postgres:recreate` for this: it deletes the volume and every row in it.

**Exception for meanderaw:** Its database already exists from ADR 0020's init, so it takes the script's statements through `psql` with an `ALTER DATABASE` in place of the `CREATE DATABASE`:

```bash
docker exec -i postgres psql -U postgres -d postgres <<'SQL'
CREATE ROLE meanderaw_username LOGIN PASSWORD 'meanderaw_password';
ALTER DATABASE meanderaw_development OWNER TO meanderaw_username;
\connect meanderaw_development
CREATE SCHEMA meanderaw AUTHORIZATION meanderaw_username;
SQL
```

Confirm with `\l` (databases), `\dn` (schemas), and `\du` (roles) in `psql`.

---

## Related Pages

- [Common Packages](../architecture/common-packages.md) — `@codebase/persistence` package overview
- [Local Development](../operations/local-development.md) — Running the local Postgres container
- [Integration Testing](../testing/integration.md) — Testcontainers usage patterns
