# 🐘 Database

The shared Postgres package every database-backed project connects through, and a command line that moves tables between databases.

## Purpose

Lexico, meanderaw, and caelundas each keep their tables in Postgres. This
package holds the one way they do it, so the environment variables, the
connection options, and the naming of each project's database, schema, and
role are written once:

| Context        | Database                | Schema      | Role                                        |
| -------------- | ----------------------- | ----------- | ------------------------------------------- |
| Local Docker   | `<project>_development` | `<project>` | `<project>_username` / `<project>_password` |
| Testcontainers | `<project>_testing`     | `<project>` | the same                                    |

The schema carries no environment, so a migration generated locally applies
anywhere unchanged.

| Export                       | Responsibility                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| `postgresEnvironmentSchema`  | The zod fragment for a project's six `<PROJECT>_POSTGRES_*` variables, with defaults           |
| `postgresConnection`         | The connection those variables describe, read from any environment record                      |
| `postgresDataSourceOptions`  | TypeORM options: snake case, schema as search path, `synchronize` and `migrationsRun` off      |
| `DatabaseModule.forRoot`     | The NestJS module wiring TypeORM from those variables through `ConfigService`                  |
| `createDataSource`           | The `DataSource` a project's TypeORM command-line entry exports, from the same options         |
| `IdentifiableEntity` …       | Base entities: a `uuidv7()` id, then created, updated, and soft-deleted columns                |
| `startPostgresContainer`     | From `@codebase/database/testing`: a migrated Postgres 18 container laid out like local Docker |
| `startDatabaseTestingModule` | From `@codebase/database/testing`: a Nest testing module connected to such a container         |

## Usage

Spread the fragment into the application's environment schema. Every
variable is prefixed with the project's name, so the root's unprefixed
`POSTGRES_*` — the shared container's admin login — never reach it:

```ts
import { postgresEnvironmentSchema } from "@codebase/database";

export const environmentSchema = z.object({
  ...postgresEnvironmentSchema({ project: "lexico" }),
});
```

| Variable                   | Default              |
| -------------------------- | -------------------- |
| `LEXICO_POSTGRES_HOST`     | `localhost`          |
| `LEXICO_POSTGRES_PORT`     | `5432`               |
| `LEXICO_POSTGRES_USERNAME` | `lexico_username`    |
| `LEXICO_POSTGRES_PASSWORD` | `lexico_password`    |
| `LEXICO_POSTGRES_DATABASE` | `lexico_development` |
| `LEXICO_POSTGRES_SCHEMA`   | `lexico`             |

The root `.env`'s unprefixed `POSTGRES_DB`, `POSTGRES_USER`, and
`POSTGRES_PASSWORD` keep the official Postgres image's own names, which the
shared container and its healthcheck read.

Each project keeps its own database module at
`src/modules/<project>-database/`, so the class conformetry derives from the
folder is `<Project>DatabaseModule` and imports `DatabaseModule` with no
alias. It connects through `DatabaseModule.forRoot`, beside a global
`ConfigModule` that validates the same schema:

```ts
@Module({
  exports: [DatabaseModule],
  imports: [
    DatabaseModule.forRoot({
      entities: [Meander],
      project: "meanderaw",
    }),
  ],
})
export class MeanderawDatabaseModule {}
```

`forRoot` takes no migrations: the runtime never runs them. Beside the
module, at `src/modules/<project>-database/data-source.constants.ts`, export
the command-line data source from the same options, with the migrations. A
constants file allows no default export, so name it after the project; the
TypeORM command line finds the file's one `DataSource` export by itself:

```ts
export const meanderawDataSource = createDataSource({
  entities: [Meander],
  migrations: ["src/modules/meanderaw-database/migrations/*.ts"],
  project: "meanderaw",
});
```

Neither ever synchronizes or runs migrations on start: the schema changes
only through migrations, run on their own. Pass `namingStrategy` to replace
snake case, as lexico does with its pluralizing strategy.

### Base entities

Each table's entity extends the narrowest base it needs, so a table without
soft deletion carries no `deletedAt`:

| Base                 | Adds                                                                |
| -------------------- | ------------------------------------------------------------------- |
| `IdentifiableEntity` | `id`, a `uuid` the database assigns with Postgres 18's `uuidv7()`   |
| `CreatableEntity`    | `createdAt` (`timestamptz`) and a nullable `createdBy` (`uuid`)     |
| `UpdatableEntity`    | `updatedAt` (`timestamptz`) and a nullable `updatedBy` (`uuid`)     |
| `DeletableEntity`    | `deletedAt` (`timestamptz`, soft delete) and a nullable `deletedBy` |

They are plain TypeORM, with no GraphQL; a project that exposes them over
GraphQL adds its `@Field` decorators in a thin layer of its own. Nothing
fills the `*By` columns but the application, so a command-line writer with
no user identity leaves them empty. No entity names a schema: it comes from
`<PROJECT>_POSTGRES_SCHEMA`.

### Migrations

The `migration` target is defined once, in the root `nx.json` target
defaults. A database project opts in with one option, `module`, naming its
own database module's folder, which every configuration reads its two
conventional paths from:

```jsonc
// project.json
"migration": {
  "options": { "module": "src/modules/meanderaw-database" }
}
```

| Path                                | Holds                                                      |
| ----------------------------------- | ---------------------------------------------------------- |
| `<module>/data-source.constants.ts` | The `createDataSource(...)` the TypeORM command line reads |
| `<module>/migrations/`              | Each generated migration, and its extracted `.sql`         |

| Command                                         | Does                                                            |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `nx run <project>:migration:generate`           | Generates a migration from the entities, extracts it, and lints |
| `nx run <project>:migration:run`                | Applies every pending migration                                 |
| `nx run <project>:migration:revert`             | Reverts the latest migration                                    |
| `nx run <project>:migration:show`               | Lists applied and pending migrations                            |
| `nx run <project>:migration:extract-sql-latest` | Extracts the latest migration's SQL for sqlfluff and squawk     |
| `nx run <project>:migration:extract-sql-all`    | Extracts every migration's SQL                                  |

Migrations never run on application start; running them is its own step.
The extraction script is `scripts/extract-migration-sql.ts`.

The extracted SQL is linted only once the project opts in to it as well: a
`framework:typeorm` tag, and three more empty entries beside `migration`:

```jsonc
// project.json
"tags": ["framework:typeorm"],
"targets": {
  "migration": { "options": { "module": "src/modules/meanderaw-database" } },
  "sqlfluff-format": {},
  "sqlfluff-lint": {},
  "squawk": {}
}
```

`migration:generate` ends by running `lint-code:write`, which fails on the
empty JSDoc blocks TypeORM writes into a new migration. Describe the class
and its `up` and `down` methods, then run `lint-code:write` again.

Every pooled connection pins its session's `search_path` to the project's
schema alone, with no `public` after it. Unqualified SQL lands in the
project's schema, or fails if that schema is missing, and TypeORM's
`current_schema()` fallback names it too, so a generated column's
`typeorm_metadata` row is planned under the project's schema with no edit.
Two hand edits remain after `migration:generate` writes a project's first
generated column or view:

- Create the metadata table before the first `INSERT` into it, with
  `CREATE TABLE IF NOT EXISTS "<project>"."typeorm_metadata" (...)`, and drop
  it in `down`. TypeORM creates it only when it synchronizes, which never
  happens here.
- Replace the generating database's name, a literal
  `<project>_development` among the parameters of the `INSERT` and the
  `DELETE`, with `current_database()` in their SQL. TypeORM matches the row
  by database when it reads the expression back, so a `_testing` or
  production database would otherwise see the column as changed.

### Integration tests

`@codebase/database/testing` starts a throwaway `postgres:18-alpine`, falling
back to Google's mirror of Docker Hub, laid out the way the local container
is: a `<project>_username` role owning a `<project>_testing` database with a
`<project>` schema in it. It then builds the schema by running the project's
real migrations, so every integration suite exercises them too.

A suite that boots Nest modules against the database uses
`startDatabaseTestingModule`. It starts that container, then compiles a
testing module with a global `ConfigModule` and `DatabaseModule.forRoot`
connected to it, the container's `<PROJECT>_POSTGRES_*` set on `process.env`
over any already there:

```ts
import { startDatabaseTestingModule } from "@codebase/database/testing";

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

| Option           | Does                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| `project`        | Names the role, the `_testing` database, the schema, and the variables                   |
| `entities`       | Registered with `TypeOrmModule.forFeature`, and connected when no `database` is given    |
| `migrations`     | Run by the container before the module boots                                             |
| `imports`        | The modules under test                                                                   |
| `providers`      | The providers under test                                                                 |
| `database`       | The project's own `<Project>DatabaseModule`, imported in place of the helper's `forRoot` |
| `namingStrategy` | Replaces snake case on the helper's own `forRoot`                                        |
| `validate`       | The application's environment validation, usually `environmentSchema.parse`              |
| `images`         | Overrides the images tried, in order                                                     |

When the modules under test import the project's own database module, pass
it as `database` too, or the testing module connects twice; `database` and
`namingStrategy` cannot be combined, since the project's module sets its own.
`close` closes the module, stops the container, and restores the whole of
`process.env`, removing any default `validate` filled in.

`startPostgresContainer` alone suits a suite that needs no Nest module:

```ts
import { startPostgresContainer } from "@codebase/database/testing";

const container = await startPostgresContainer({
  migrations: [InitialMigration1767225600000],
  project: "meanderaw",
});

// … build a DataSource from postgresDataSourceOptions(container.connection, …)

await container.stop();
```

`connection` is the project's own role, never the container's admin login,
and `environment` is the same connection as `<PROJECT>_POSTGRES_*` variables.
Testcontainers and `@nestjs/testing` are dependencies of this entry, so a
consuming suite imports its types from here rather than redeclaring them.
The entry lives under `testing/` rather than `src/`: dependency-cruiser's
`no-test-imports-in-app` lets only a `testing/` path import test tooling, so
import it only from tests and `testing/` harnesses.
Docker must be running.

A project name must be lowercase letters, digits, and underscores, starting
with a letter, so it can prefix a variable and name a database unquoted.

## Moving data between databases

The package is also a command line, `database`, that copies selected tables
between two Postgres databases through `pg_dump` and `pg_restore`. Each
command names its database by URI, so it needs no `<PROJECT>_POSTGRES_*`
variable and opens no connection at startup. Run it through Nx; `start` runs
with the working directory at `projects/database`, so a relative `--file`
resolves from there, and `*.dump` is gitignored there:

```bash
pnpm exec nx run database:start:export --args="--source-uri postgresql://user:password@localhost:5432/source --schema fixture --table widgets --data --ddl --file sample.dump"
pnpm exec nx run database:start:import --args="--target-uri postgresql://user:password@localhost:5432/target --schema fixture --table widgets --data --ddl --file sample.dump"
```

### Options

| Option               | Command | Does                                                                              |
| -------------------- | ------- | --------------------------------------------------------------------------------- |
| `--source-uri <uri>` | export  | Required. The database to dump                                                    |
| `--target-uri <uri>` | import  | Required. The database to restore into                                            |
| `--table <name>`     | both    | Required, repeatable. A table to move                                             |
| `--schema <name>`    | both    | The schema unqualified `--table` names resolve in, like `pg_dump --schema`        |
| `--data`, `--ddl`    | both    | Rows, table definitions (DDL), or both; at least one is required                  |
| `--file <path>`      | both    | Required. The dump to write or read                                               |
| `--sqlite`           | export  | Write a SQLite file instead of a dump; `import` rejects it                        |
| `--overwrite`        | export  | Replace `--file` when it exists                                                   |
| `--clean`            | import  | Clear the selected tables before restoring, with no confirmation                  |
| `--dry-run`          | both    | Validate and print the plan without connecting to a database or changing anything |

Qualified names (`schema.table`) are used as written. There is no default
schema: without `--schema`, an unqualified `--table` fails before anything
runs, naming it. Naming one table twice moves it once.

### Export

`export` writes a custom-format dump, or with `--sqlite` a SQLite file (see
[Export to SQLite](#export-to-sqlite)). It passes
`--strict-names` to `pg_dump`, so a table that does not exist fails the run
with a message naming it and the source, never a smaller dump. An existing
`--file` is refused unless `--overwrite` is given.

`pg_dump` writes to a `.partial` file beside `--file`, which replaces it only
once the dump succeeds. A failed `--overwrite` therefore keeps the old dump,
and the partial file is removed. `--dry-run` still checks that `pg_dump` is
installed, then prints the source database, what each table would export, and
whether `--file` would be created or overwritten.

### Export to SQLite

`export --sqlite` writes the selected tables to a SQLite file through a
separate service, `SqliteExportService`, that reads rows through the `pg`
driver and writes them with `node:sqlite`. It never starts `pg_dump`, needs
none of the PostgreSQL client tools, and adds no native SQLite dependency, so
it runs anywhere Node 24 runs. `--source-uri`, `--table`, `--schema`,
`--file`, `--overwrite`, and `--dry-run` mean what they mean for the default
export, and the overwrite guard and the missing-table error behave as they do
there; only `--dry-run` differs, in checking no client tool. The service
names no table of its own, so any table in any schema can be exported:

```bash
pnpm exec nx run database:start:export --args="--sqlite --source-uri postgresql://user:password@localhost:5432/source --schema caelundas --table calendar_events --data --ddl --file events.sqlite"
```

`--ddl` writes each table's definition: its columns, `NOT NULL` where the
source forbids null, and its primary key, which Postgres shows only for a
table the role owns or can write to, so a read-only role gets none. `--data`
writes its rows. A SQLite
file cannot hold rows without their table, so `--data` alone still creates the
tables, with the same definition. Indexes, foreign keys, defaults, and
comments are not carried over; create what a reader needs afterwards. Each
table takes its name without its schema, and two tables that would share a
name fail the export. Every table is read from one snapshot, as `pg_dump`
reads, through a cursor a thousand rows at a time, and written in one SQLite
transaction, to a `.partial` file that replaces
`--file` only once the export succeeds.

Postgres column types become SQLite types a browser can query:

| Postgres                                         | SQLite    | Stored as                           |
| ------------------------------------------------ | --------- | ----------------------------------- |
| `timestamptz`                                    | `TEXT`    | ISO 8601 in UTC, to the millisecond |
| `date`                                           | `TEXT`    | `YYYY-MM-DD`                        |
| `numeric`, `real`, `double precision`            | `REAL`    | A real number                       |
| `smallint`, `integer`, `bigint`                  | `INTEGER` | The number, exactly                 |
| `boolean`                                        | `INTEGER` | 0 or 1                              |
| `text`, `character`, `character varying`, `uuid` | `TEXT`    | The text                            |
| any array such as `text[]`, `json`, `jsonb`      | `TEXT`    | JSON text                           |

A null stays null. A column of any other type fails the export before it
writes anything, naming the column, its Postgres type, and the table, so
nothing is silently dropped.

`import` rejects `--sqlite` with a message that names the option, before any
process starts or connection opens: nothing imports a SQLite file into
Postgres, and the file extension is never checked.

### Import

`import` restores the selected tables in one transaction that stops at the
first error, so by default it deletes nothing and a conflict leaves the target
as it was. Before any connection opens it lists the dump and fails when it
lacks the rows or definitions `--data` and `--ddl` ask for. Owners and
grants are not restored; the target's own role owns what it creates.
`--ddl` without `--clean` fails when a selected table already exists on the
target.
`--dry-run` stops there, printing what the dump holds of each table and what
`--clean` would drop or truncate.

`--clean` empties the selected tables first and never asks for confirmation,
in a terminal or out of one. Run `import --dry-run` with the same options
before `import --clean` to see the tables, database, and host it would clear:

- With `--ddl`, `pg_restore --clean --if-exists` drops and recreates them.
- With `--data` alone, a `TRUNCATE` on exactly the selected tables empties
  them, without `CASCADE`. When a table outside the selection references one,
  the import refuses and lists the `--table` options to add.

The truncate commits on its own before the restore, so the pair is not atomic:
a restore that fails afterwards leaves the tables empty, and the error says so.
Re-run the import from the same file.
A data-only import of some tables does not restore the values of the
sequences behind them.

### Requirements

Both commands need the PostgreSQL 18 client tools, `pg_dump` for export and
`pg_restore` for import, and check their version before any database work.
The exception is `export --sqlite`, which needs none. A
missing tool or another major version fails with the setup script to run:
`scripts/local/software/database.sh` installs them with Homebrew, and the
devcontainer installs them too.

### Credentials

A URI's password reaches the client tools only through their `PG*`
environment variables, never their arguments, and is masked in every log line
and error. The tools run with every inherited `PG*` variable removed, and a
URI carrying query parameters is refused, so nothing can set a TLS mode or any
other connection option. The truncate for `--clean --data` connects through
the `pg` driver with no `ssl` option at all. A server that requires TLS is
therefore not reachable through these commands today.

## Test

```bash
nx run database:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../projects/configuration/conformetry-templates/nestjs-service-project) conformetry template.

## 🕸️ Codependix

Dependency graphs exported by [codependix](https://github.com/Organizzolini/codebase/tree/main/projects/ic-suite/codependix/codependix-cli), regenerated by `nx run configuration:codependix:write`.

### Nx Neighborhood

<!-- codependix:start name="codependix-nx-projects" -->
```mermaid
graph LR
  caelundas_cli["caelundas-cli"]
  database["database"]
  lexico_api["lexico-api"]
  lexico_cli["lexico-cli"]
  lexico_entities["lexico-entities"]
  logging["logging"]
  meanderaw_cli["meanderaw-cli"]
  caelundas_cli --> database
  database --> logging
  lexico_api --> database
  lexico_cli --> database
  lexico_entities --> database
  meanderaw_cli --> database
  classDef subject fill:#7c3aed,color:#fff,stroke:#4c1d95,stroke-width:2px
  class database subject
```
<!-- codependix:end name="codependix-nx-projects" -->

### NestJS Module Graph

<!-- codependix:start name="codependix-nestjs-modules" -->
```mermaid
flowchart LR
  DatabaseModule
  DiscoveryModule
  ExportModule
  ImportModule
  LoggerModule([LoggerModule])
  MainModule
  PostgresClientModule
  ExportModule --> PostgresClientModule
  ImportModule --> PostgresClientModule
  MainModule --> DiscoveryModule
  MainModule --> ExportModule
  MainModule --> ImportModule
```

_Rounded modules are global: every module can inject them, so their edges are left out._
<!-- codependix:end name="codependix-nestjs-modules" -->

### File Imports

<!-- codependix:start name="codependix-file-imports" -->
```mermaid
graph LR
  file_callidescope_config_ts["callidescope.config.ts"]
  file_codependix_config_ts["codependix.config.ts"]
  file_codometer_config_ts["codometer.config.ts"]
  file_eslint_config_ts["eslint.config.ts"]
  file_scripts_extract_migration_sql_ts["scripts/extract-migration-sql.ts"]
  file_src_database_main_end_to_end_test_ts["src/database.main.end-to-end.test.ts"]
  file_src_database_main_ts["src/database.main.ts"]
  file_src_database_main_unit_test_ts["src/database.main.unit.test.ts"]
  file_src_database_module_ts["src/database.module.ts"]
  file_src_database_module_unit_test_ts["src/database.module.unit.test.ts"]
  file_src_database_repl_ts["src/database.repl.ts"]
  file_src_database_repl_unit_test_ts["src/database.repl.unit.test.ts"]
  file_src_index_ts["src/index.ts"]
  file_src_modules_database_database_testing_utilities_integration_test_ts["src/modules/database/database-testing.utilities.integration.test.ts"]
  file_src_modules_database_database_constants_ts["src/modules/database/database.constants.ts"]
  file_src_modules_database_database_module_integration_test_ts["src/modules/database/database.module.integration.test.ts"]
  file_src_modules_database_database_module_ts["src/modules/database/database.module.ts"]
  file_src_modules_database_database_service_ts["src/modules/database/database.service.ts"]
  file_src_modules_database_database_service_unit_test_ts["src/modules/database/database.service.unit.test.ts"]
  file_src_modules_database_database_types_ts["src/modules/database/database.types.ts"]
  file_src_modules_database_database_utilities_ts["src/modules/database/database.utilities.ts"]
  file_src_modules_database_database_utilities_unit_test_ts["src/modules/database/database.utilities.unit.test.ts"]
  file_src_modules_database_entities_creatable_entity_ts["src/modules/database/entities/creatable.entity.ts"]
  file_src_modules_database_entities_deletable_entity_ts["src/modules/database/entities/deletable.entity.ts"]
  file_src_modules_database_entities_identifiable_entity_ts["src/modules/database/entities/identifiable.entity.ts"]
  file_src_modules_database_entities_updatable_entity_ts["src/modules/database/entities/updatable.entity.ts"]
  file_src_modules_database_postgres_container_constants_ts["src/modules/database/postgres-container.constants.ts"]
  file_src_modules_database_postgres_container_types_ts["src/modules/database/postgres-container.types.ts"]
  file_src_modules_database_postgres_container_utilities_integration_test_ts["src/modules/database/postgres-container.utilities.integration.test.ts"]
  file_src_modules_database_postgres_container_utilities_ts["src/modules/database/postgres-container.utilities.ts"]
  file_src_modules_export_export_arguments_command_integration_test_ts["src/modules/export/export-arguments.command.integration.test.ts"]
  file_src_modules_export_export_dry_run_command_integration_test_ts["src/modules/export/export-dry-run.command.integration.test.ts"]
  file_src_modules_export_export_dry_run_command_unit_test_ts["src/modules/export/export-dry-run.command.unit.test.ts"]
  file_src_modules_export_export_log_convention_command_unit_test_ts["src/modules/export/export-log-convention.command.unit.test.ts"]
  file_src_modules_export_export_missing_table_command_integration_test_ts["src/modules/export/export-missing-table.command.integration.test.ts"]
  file_src_modules_export_export_missing_table_command_unit_test_ts["src/modules/export/export-missing-table.command.unit.test.ts"]
  file_src_modules_export_export_preflight_command_integration_test_ts["src/modules/export/export-preflight.command.integration.test.ts"]
  file_src_modules_export_export_schema_command_unit_test_ts["src/modules/export/export-schema.command.unit.test.ts"]
  file_src_modules_export_export_command_integration_test_ts["src/modules/export/export.command.integration.test.ts"]
  file_src_modules_export_export_command_ts["src/modules/export/export.command.ts"]
  file_src_modules_export_export_command_unit_test_ts["src/modules/export/export.command.unit.test.ts"]
  file_src_modules_export_export_constants_ts["src/modules/export/export.constants.ts"]
  file_src_modules_export_export_module_ts["src/modules/export/export.module.ts"]
  file_src_modules_export_export_types_ts["src/modules/export/export.types.ts"]
  file_src_modules_import_import_clean_data_command_integration_test_ts["src/modules/import/import-clean-data.command.integration.test.ts"]
  file_src_modules_import_import_clean_data_command_unit_test_ts["src/modules/import/import-clean-data.command.unit.test.ts"]
  file_src_modules_import_import_clean_command_integration_test_ts["src/modules/import/import-clean.command.integration.test.ts"]
  file_src_modules_import_import_clean_command_unit_test_ts["src/modules/import/import-clean.command.unit.test.ts"]
  file_src_modules_import_import_dry_run_command_integration_test_ts["src/modules/import/import-dry-run.command.integration.test.ts"]
  file_src_modules_import_import_dry_run_command_unit_test_ts["src/modules/import/import-dry-run.command.unit.test.ts"]
  file_src_modules_import_import_preflight_command_integration_test_ts["src/modules/import/import-preflight.command.integration.test.ts"]
  file_src_modules_import_import_schema_command_integration_test_ts["src/modules/import/import-schema.command.integration.test.ts"]
  file_src_modules_import_import_schema_command_unit_test_ts["src/modules/import/import-schema.command.unit.test.ts"]
  file_src_modules_import_import_command_integration_test_ts["src/modules/import/import.command.integration.test.ts"]
  file_src_modules_import_import_command_ts["src/modules/import/import.command.ts"]
  file_src_modules_import_import_command_unit_test_ts["src/modules/import/import.command.unit.test.ts"]
  file_src_modules_import_import_constants_ts["src/modules/import/import.constants.ts"]
  file_src_modules_import_import_module_ts["src/modules/import/import.module.ts"]
  file_src_modules_import_import_types_ts["src/modules/import/import.types.ts"]
  file_src_modules_postgres_client_postgres_client_constants_ts["src/modules/postgres-client/postgres-client.constants.ts"]
  file_src_modules_postgres_client_postgres_client_module_ts["src/modules/postgres-client/postgres-client.module.ts"]
  file_src_modules_postgres_client_postgres_client_service_ts["src/modules/postgres-client/postgres-client.service.ts"]
  file_src_modules_postgres_client_postgres_client_service_unit_test_ts["src/modules/postgres-client/postgres-client.service.unit.test.ts"]
  file_src_modules_postgres_client_postgres_client_types_ts["src/modules/postgres-client/postgres-client.types.ts"]
  file_src_modules_postgres_client_postgres_client_utilities_ts["src/modules/postgres-client/postgres-client.utilities.ts"]
  file_src_modules_postgres_client_postgres_client_utilities_unit_test_ts["src/modules/postgres-client/postgres-client.utilities.unit.test.ts"]
  file_src_modules_postgres_client_postgres_dump_utilities_ts["src/modules/postgres-client/postgres-dump.utilities.ts"]
  file_src_modules_postgres_client_postgres_dump_utilities_unit_test_ts["src/modules/postgres-client/postgres-dump.utilities.unit.test.ts"]
  file_src_modules_postgres_client_postgres_truncate_utilities_ts["src/modules/postgres-client/postgres-truncate.utilities.ts"]
  file_src_modules_postgres_client_postgres_truncate_utilities_unit_test_ts["src/modules/postgres-client/postgres-truncate.utilities.unit.test.ts"]
  file_testing_command_line_runner_ts["testing/command-line-runner.ts"]
  file_testing_database_testing_types_ts["testing/database-testing.types.ts"]
  file_testing_database_testing_utilities_ts["testing/database-testing.utilities.ts"]
  file_testing_fixture_database_ts["testing/fixture-database.ts"]
  file_testing_fixtures_fixture_database_module_ts["testing/fixtures/fixture-database.module.ts"]
  file_testing_fixtures_gadget_entity_ts["testing/fixtures/gadget.entity.ts"]
  file_testing_fixtures_migrations_1767225600000_create_widgets_ts["testing/fixtures/migrations/1767225600000-create-widgets.ts"]
  file_testing_fixtures_migrations_1767225600001_create_parts_ts["testing/fixtures/migrations/1767225600001-create-parts.ts"]
  file_testing_fixtures_sample_greeting_constants_ts["testing/fixtures/sample-greeting.constants.ts"]
  file_testing_fixtures_sample_greeting_module_ts["testing/fixtures/sample-greeting.module.ts"]
  file_testing_fixtures_sample_widgets_module_ts["testing/fixtures/sample-widgets.module.ts"]
  file_testing_fixtures_sample_widgets_service_ts["testing/fixtures/sample-widgets.service.ts"]
  file_testing_fixtures_widget_entity_ts["testing/fixtures/widget.entity.ts"]
  file_testing_index_ts["testing/index.ts"]
  file_testing_mocks_ts["testing/mocks.ts"]
  file_testing_setup_ts["testing/setup.ts"]
  file_vitest_config_ts["vitest.config.ts"]
  file_src_database_main_ts --> file_src_database_module_ts
  file_src_database_module_ts --> file_src_modules_export_export_module_ts
  file_src_database_module_ts --> file_src_modules_import_import_module_ts
  file_src_database_module_unit_test_ts --> file_src_database_module_ts
  file_src_database_module_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_database_repl_ts --> file_src_database_module_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_src_modules_database_database_utilities_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_database_testing_types_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_database_testing_utilities_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_fixture_database_module_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_migrations_1767225600000_create_widgets_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_sample_greeting_constants_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_sample_greeting_module_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_sample_widgets_module_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_sample_widgets_service_ts
  file_src_modules_database_database_testing_utilities_integration_test_ts --> file_testing_fixtures_widget_entity_ts
  file_src_modules_database_database_module_integration_test_ts --> file_src_modules_database_database_module_ts
  file_src_modules_database_database_module_integration_test_ts --> file_src_modules_database_database_utilities_ts
  file_src_modules_database_database_module_integration_test_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_database_database_module_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_database_database_module_integration_test_ts --> file_testing_fixtures_gadget_entity_ts
  file_src_modules_database_database_module_integration_test_ts --> file_testing_fixtures_migrations_1767225600000_create_widgets_ts
  file_src_modules_database_database_module_integration_test_ts --> file_testing_fixtures_widget_entity_ts
  file_src_modules_database_database_module_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_module_ts --> file_src_modules_database_database_service_ts
  file_src_modules_database_database_module_ts --> file_src_modules_database_database_types_ts
  file_src_modules_database_database_service_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_service_ts --> file_src_modules_database_database_types_ts
  file_src_modules_database_database_service_ts --> file_src_modules_database_database_utilities_ts
  file_src_modules_database_database_service_unit_test_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_service_unit_test_ts --> file_src_modules_database_database_service_ts
  file_src_modules_database_database_types_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_utilities_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_database_database_utilities_ts --> file_src_modules_database_database_types_ts
  file_src_modules_database_database_utilities_unit_test_ts --> file_src_modules_database_database_types_ts
  file_src_modules_database_database_utilities_unit_test_ts --> file_src_modules_database_database_utilities_ts
  file_src_modules_database_entities_creatable_entity_ts --> file_src_modules_database_entities_identifiable_entity_ts
  file_src_modules_database_entities_deletable_entity_ts --> file_src_modules_database_entities_updatable_entity_ts
  file_src_modules_database_entities_updatable_entity_ts --> file_src_modules_database_entities_creatable_entity_ts
  file_src_modules_database_postgres_container_types_ts --> file_src_modules_database_database_types_ts
  file_src_modules_database_postgres_container_utilities_integration_test_ts --> file_src_modules_database_postgres_container_constants_ts
  file_src_modules_database_postgres_container_utilities_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_database_postgres_container_utilities_integration_test_ts --> file_testing_fixtures_migrations_1767225600000_create_widgets_ts
  file_src_modules_database_postgres_container_utilities_ts --> file_src_modules_database_database_types_ts
  file_src_modules_database_postgres_container_utilities_ts --> file_src_modules_database_database_utilities_ts
  file_src_modules_database_postgres_container_utilities_ts --> file_src_modules_database_postgres_container_constants_ts
  file_src_modules_database_postgres_container_utilities_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_export_export_arguments_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_arguments_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_export_export_dry_run_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_dry_run_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_export_export_dry_run_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_dry_run_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_export_export_log_convention_command_unit_test_ts --> file_src_modules_export_export_constants_ts
  file_src_modules_export_export_log_convention_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_log_convention_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_export_export_missing_table_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_missing_table_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_export_export_missing_table_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_missing_table_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_export_export_preflight_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_preflight_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_export_export_schema_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_schema_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_export_export_command_integration_test_ts --> file_src_modules_database_database_types_ts
  file_src_modules_export_export_command_integration_test_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_export_export_command_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_export_export_command_integration_test_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_export_export_command_integration_test_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_export_export_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_export_export_command_ts --> file_src_modules_export_export_constants_ts
  file_src_modules_export_export_command_ts --> file_src_modules_export_export_types_ts
  file_src_modules_export_export_command_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_export_export_command_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_export_export_command_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_export_export_command_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_export_export_command_ts --> file_src_modules_postgres_client_postgres_dump_utilities_ts
  file_src_modules_export_export_command_unit_test_ts --> file_src_modules_export_export_command_ts
  file_src_modules_export_export_command_unit_test_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_export_export_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_export_export_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_export_export_constants_ts --> file_src_modules_export_export_types_ts
  file_src_modules_export_export_constants_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_export_export_module_ts --> file_src_modules_export_export_command_ts
  file_src_modules_export_export_module_ts --> file_src_modules_postgres_client_postgres_client_module_ts
  file_src_modules_export_export_types_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_import_import_clean_data_command_integration_test_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_import_import_clean_data_command_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_import_import_clean_data_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_clean_data_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_import_import_clean_data_command_unit_test_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_import_import_clean_data_command_unit_test_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_import_import_clean_data_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_clean_data_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_import_import_clean_command_integration_test_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_import_import_clean_command_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_import_import_clean_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_clean_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_import_import_clean_command_integration_test_ts --> file_testing_mocks_ts
  file_src_modules_import_import_clean_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_clean_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_import_import_dry_run_command_integration_test_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_import_import_dry_run_command_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_import_import_dry_run_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_dry_run_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_import_import_dry_run_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_dry_run_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_import_import_preflight_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_preflight_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_import_import_schema_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_schema_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_import_import_schema_command_unit_test_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_import_import_schema_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_schema_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_import_import_command_integration_test_ts --> file_src_modules_database_postgres_container_types_ts
  file_src_modules_import_import_command_integration_test_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_src_modules_import_import_command_integration_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_command_integration_test_ts --> file_testing_fixture_database_ts
  file_src_modules_import_import_command_ts --> file_src_modules_import_import_constants_ts
  file_src_modules_import_import_command_ts --> file_src_modules_import_import_types_ts
  file_src_modules_import_import_command_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_import_import_command_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_import_import_command_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_import_import_command_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_import_import_command_ts --> file_src_modules_postgres_client_postgres_dump_utilities_ts
  file_src_modules_import_import_command_unit_test_ts --> file_src_modules_import_import_command_ts
  file_src_modules_import_import_command_unit_test_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_import_import_command_unit_test_ts --> file_testing_command_line_runner_ts
  file_src_modules_import_import_command_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_import_import_constants_ts --> file_src_modules_import_import_types_ts
  file_src_modules_import_import_constants_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_import_import_constants_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_import_import_module_ts --> file_src_modules_import_import_command_ts
  file_src_modules_import_import_module_ts --> file_src_modules_postgres_client_postgres_client_module_ts
  file_src_modules_import_import_types_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_client_constants_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_client_module_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_postgres_client_postgres_client_service_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_client_service_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_client_service_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_postgres_client_postgres_client_service_ts --> file_src_modules_postgres_client_postgres_dump_utilities_ts
  file_src_modules_postgres_client_postgres_client_service_ts --> file_src_modules_postgres_client_postgres_truncate_utilities_ts
  file_src_modules_postgres_client_postgres_client_service_unit_test_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_client_service_unit_test_ts --> file_src_modules_postgres_client_postgres_client_service_ts
  file_src_modules_postgres_client_postgres_client_service_unit_test_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_client_service_unit_test_ts --> file_testing_mocks_ts
  file_src_modules_postgres_client_postgres_client_utilities_ts --> file_src_modules_database_database_constants_ts
  file_src_modules_postgres_client_postgres_client_utilities_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_client_utilities_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_client_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_client_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_client_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_client_utilities_ts
  file_src_modules_postgres_client_postgres_dump_utilities_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_dump_utilities_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_dump_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_dump_utilities_ts
  file_src_modules_postgres_client_postgres_truncate_utilities_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_truncate_utilities_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_truncate_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_client_constants_ts
  file_src_modules_postgres_client_postgres_truncate_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_client_types_ts
  file_src_modules_postgres_client_postgres_truncate_utilities_unit_test_ts --> file_src_modules_postgres_client_postgres_truncate_utilities_ts
  file_testing_command_line_runner_ts --> file_src_database_module_ts
  file_testing_database_testing_types_ts --> file_src_modules_database_database_types_ts
  file_testing_database_testing_types_ts --> file_src_modules_database_postgres_container_types_ts
  file_testing_database_testing_utilities_ts --> file_src_modules_database_database_module_ts
  file_testing_database_testing_utilities_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_testing_database_testing_utilities_ts --> file_testing_database_testing_types_ts
  file_testing_fixture_database_ts --> file_src_modules_database_database_types_ts
  file_testing_fixture_database_ts --> file_src_modules_database_postgres_container_utilities_ts
  file_testing_fixture_database_ts --> file_testing_fixtures_migrations_1767225600000_create_widgets_ts
  file_testing_fixture_database_ts --> file_testing_fixtures_migrations_1767225600001_create_parts_ts
  file_testing_fixtures_fixture_database_module_ts --> file_src_modules_database_database_module_ts
  file_testing_fixtures_fixture_database_module_ts --> file_testing_fixtures_widget_entity_ts
  file_testing_fixtures_gadget_entity_ts --> file_src_modules_database_entities_identifiable_entity_ts
  file_testing_fixtures_sample_greeting_module_ts --> file_testing_fixtures_sample_greeting_constants_ts
  file_testing_fixtures_sample_widgets_module_ts --> file_testing_fixtures_fixture_database_module_ts
  file_testing_fixtures_sample_widgets_module_ts --> file_testing_fixtures_sample_widgets_service_ts
  file_testing_fixtures_sample_widgets_module_ts --> file_testing_fixtures_widget_entity_ts
  file_testing_fixtures_sample_widgets_service_ts --> file_testing_fixtures_widget_entity_ts
  file_testing_fixtures_widget_entity_ts --> file_src_modules_database_entities_deletable_entity_ts
```
<!-- codependix:end name="codependix-file-imports" -->

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/database`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 144 |
| Files | 37 |
| Calls traced | 150 |
| Call stacks | 9 |
| Deepest stack | 7 |
| Stacks through recursion | 0 |
| Unfollowable calls | 19 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 7 |
| `maximumBreadth` | 7 |

### Call stacks (depth)

**1. `ImportCommand.run`** — depth ≥ 7 · decorated-method

```text
🚀 ImportCommand.run(_passedParameters: string[], options: ImportCommandOptions): Promise<void> [projects/database/src/modules/import/import.command.ts:343]
   ↳ Validates the options, checks pg_restore and the dump's contents, applies any `--clean`, then restores the selected…
  └─> ImportCommand.check(…): Promise<{ readonly contents: readonly PostgresDumpEntry[]; readonly plan: ImportPlan; }> [projects/database/src/modules/import/import.command.ts:79]
     ↳ Every check a real import and a `--dry-run` share, none of which connects to the target: the options, the pg_restore…
    └─> PostgresClientService.list(file: string): Promise<PostgresDumpEntry[]> [projects/database/src/modules/postgres-client/postgres-client.service.ts:181]
       ↳ Reads the table of contents of the dump at `file` with `pg_restore --list`, which connects to no database, so an…
      └─> PostgresClientService.run(…): Promise<PostgresClientOutput> [projects/database/src/modules/postgres-client/postgres-client.service.ts:64]
         ↳ Runs `tool` with `args`, connected to `connection` through its environment, or to nothing when there is none, and…
        └─> PostgresClientService.anonymous(…): void [projects/database/src/modules/postgres-client/postgres-client.service.ts:69]
          └─> PostgresClientService.execFile(…)(error: ExecException | null, stdout: string, stderr: string): void [projects/database/src/modules/postgres-client/postgres-client.service.ts:77]
            └─> PostgresClientError.constructor({ code, detail, tool }: PostgresClientFailure): PostgresClientError [projects/database/src/modules/postgres-client/postgres-client.constants.ts:47]
```

**2. `ExportCommand.run`** — depth ≥ 6 · decorated-method

```text
🚀 ExportCommand.run(_passedParameters: string[], options: ExportCommandOptions): Promise<void> [projects/database/src/modules/export/export.command.ts:230]
   ↳ Validates the options, then dumps the selected tables to the file.
  └─> PostgresClientService.dump({ connection, content, file, tables, }: PostgresDumpOptions): Promise<void> [projects/database/src/modules/postgres-client/postgres-client.service.ts:105]
     ↳ Dumps exactly `tables` from `connection` to a custom-format `file`. `--strict-names` makes a table that does not exist…
    └─> PostgresClientService.run(…): Promise<PostgresClientOutput> [projects/database/src/modules/postgres-client/postgres-client.service.ts:64]
       ↳ Runs `tool` with `args`, connected to `connection` through its environment, or to nothing when there is none, and…
      └─> PostgresClientService.anonymous(…): void [projects/database/src/modules/postgres-client/postgres-client.service.ts:69]
        └─> PostgresClientService.execFile(…)(error: ExecException | null, stdout: string, stderr: string): void [projects/database/src/modules/postgres-client/postgres-client.service.ts:77]
          └─> PostgresClientError.constructor({ code, detail, tool }: PostgresClientFailure): PostgresClientError [projects/database/src/modules/postgres-client/postgres-client.constants.ts:47]
```

**3. `postgresEnvironmentSchema`** — depth 4 · orphan-root

```text
🚀 postgresEnvironmentSchema(…): PostgresEnvironmentShape<Project> [projects/database/src/modules/database/database.utilities.ts:200]
   ↳ The zod fragment for a project's `<PROJECT>_POSTGRES_*` variables, which each application spreads into its own…
  └─> assertPostgresEnvironmentKeys(…): void [projects/database/src/modules/database/database.utilities.ts:35]
     ↳ Holds `shape` to having a key for every one of `project`'s `<PROJECT>_POSTGRES_*` variables, which is what types {@link…
    └─> postgresEnvironmentKeys(project: string): string[] [projects/database/src/modules/database/database.utilities.ts:176]
       ↳ The `<PROJECT>_POSTGRES_*` variable names a project reads.
      └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/database/src/modules/database/database.utilities.ts:162]
         ↳ The variable a project reads `field` from, for example `LEXICO_POSTGRES_DATABASE` for lexico's `database`.
```

<details>
<summary>6 more call stacks</summary>

**4. `DatabaseService.createTypeOrmOptions`** — depth 4 · orphan-root

```text
🚀 DatabaseService.createTypeOrmOptions(): PostgresDataSourceOptions [projects/database/src/modules/database/database.service.ts:76]
   ↳ TypeORM's options for the project's connection, with no migrations: the runtime never runs them.
  └─> DatabaseService.connection(): PostgresConnection [projects/database/src/modules/database/database.service.ts:61]
     ↳ Where the project's database is, read from its prefixed variables and defaulted from its name.
    └─> postgresConnection({ environment, project, }: PostgresConnectionSource): PostgresConnection [projects/database/src/modules/database/database.utilities.ts:86]
       ↳ The connection a project's prefixed variables describe, defaulted the way `postgresEnvironmentSchema` defaults them.
      └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/database/src/modules/database/database.utilities.ts:162]
         ↳ The variable a project reads `field` from, for example `LEXICO_POSTGRES_DATABASE` for lexico's `database`.
```

**5. `main`** — depth 3 · orphan-root

```text
🚀 main(): Promise<void> [projects/database/scripts/extract-migration-sql.ts:172]
   ↳ Main.
  └─> parseMode(): Mode [projects/database/scripts/extract-migration-sql.ts:211]
     ↳ Parse mode.
    └─> find(…)(argument: string): boolean [projects/database/scripts/extract-migration-sql.ts:212]
```

**6. `createDataSource`** — depth 3 · orphan-root

```text
🚀 createDataSource(…): DataSource [projects/database/src/modules/database/database.utilities.ts:69]
   ↳ The `DataSource` a project's TypeORM command-line entry exports, built from the same options as…
  └─> postgresDataSourceOptions(…): PostgresDataSourceOptions [projects/database/src/modules/database/database.utilities.ts:116]
     ↳ The TypeORM options for `connection`, shared by every runtime module and command-line data source so a generated…
    └─> postgresSearchPathOption(schema: string): string [projects/database/src/modules/database/database.utilities.ts:230]
       ↳ The startup parameter pg sends as `options` on each pooled connection, setting the session's `search_path` to `schema`…
```

**7. `startPostgresContainer`** — depth 3 · orphan-root

```text
🚀 startPostgresContainer(…): Promise<StartedPostgresContainer> [projects/database/src/modules/database/postgres-container.utilities.ts:33]
   ↳ Starts a throwaway Postgres 18 laid out the way the local Docker one is — a `<project>_username` role owning a…
  └─> postgresConnection({ environment, project, }: PostgresConnectionSource): PostgresConnection [projects/database/src/modules/database/database.utilities.ts:86]
     ↳ The connection a project's prefixed variables describe, defaulted the way `postgresEnvironmentSchema` defaults them.
    └─> postgresEnvironmentKey(project: string, field: PostgresConnectionField): string [projects/database/src/modules/database/database.utilities.ts:162]
       ↳ The variable a project reads `field` from, for example `LEXICO_POSTGRES_DATABASE` for lexico's `database`.
```

**8. `visit`** — depth 2 · orphan-root

```text
🚀 visit(node: ts.Node): void [projects/database/scripts/extract-migration-sql.ts:71]
   ↳ Visit.
  └─> extractSqlFromLiteral(argument: ts.Expression, sourceFile: ts.SourceFile): string | undefined [projects/database/scripts/extract-migration-sql.ts:42]
     ↳ Extract sql from literal.
```

**9. `visit`** — depth 2 · orphan-root

```text
🚀 visit(node: ts.Node): void [projects/database/scripts/extract-migration-sql.ts:118]
   ↳ Visit.
  └─> extractSqlFromMethod(method: ts.MethodDeclaration, sourceFile: ts.SourceFile): string[] [projects/database/scripts/extract-migration-sql.ts:62]
     ↳ Extract sql from method.
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ExportCommand.plan` | 7 | `ExportCommand.requireOption`, `ExportCommand.selectContent`, `parsePostgresUri`, `ExportOptionsError.constructor`, `existingFileMessage`, `maskPostgresCredentials`, `qualifyTableNames` | `projects/database/src/modules/export/export.command.ts:91` |
| `ImportCommand.plan` | 7 | `ImportCommand.requireOption`, `ImportCommand.selectContent`, `parsePostgresUri`, `ImportOptionsError.constructor`, `missingFileMessage`, `qualifyTableNames`, `maskPostgresCredentials` | `projects/database/src/modules/import/import.command.ts:142` |
| `ExportCommand.run` | 6 | `ExportCommand.plan`, `PostgresClientService.ensureTool`, `ExportCommand.logDryRun`, `describePostgresContent`, `PostgresClientService.dump`, `ExportCommand.explain` | `projects/database/src/modules/export/export.command.ts:230` |

<details>
<summary>57 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `ImportCommand.run` | 5 | `ImportCommand.check`, `ImportCommand.logDryRun`, `describePostgresContent`, `ImportCommand.truncate`, `ImportCommand.restore` | `projects/database/src/modules/import/import.command.ts:343` |
| `main` | 4 | `parseMode`, `parseDirectory`, `findMigrationFiles`, `processMigrationFile` | `projects/database/scripts/extract-migration-sql.ts:172` |
| `selectPostgresDumpEntries` | 4 | `map(…)`, `every(…)`, `filter(…)`, `every(…)` | `projects/database/src/modules/postgres-client/postgres-dump.utilities.ts:85` |
| `truncatePostgresTables` | 4 | `map(…)`, `postgresErrorCode`, `map(…)`, `PostgresReferencedTablesError.constructor` | `projects/database/src/modules/postgres-client/postgres-truncate.utilities.ts:31` |
| `PostgresClientService.restore` | 4 | `PostgresClientService.map(…)`, `selectPostgresDumpEntries`, `PostgresClientService.run`, `postgresContentFlags` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:200` |
| `PostgresClientService.truncate` | 4 | `PostgresClientService.truncatePostgresTables(…)`, `truncatePostgresTables`, `PostgresTruncateError.constructor`, `maskPostgresCredentials` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:251` |
| `ImportCommand.check` | 4 | `ImportCommand.plan`, `PostgresClientService.ensureTool`, `PostgresClientService.list`, `ImportCommand.ensureContents` | `projects/database/src/modules/import/import.command.ts:79` |
| `ImportCommand.restore` | 4 | `PostgresClientService.restore`, `ImportRestoreError.constructor`, `truncatedMessage`, `rolledBackMessage` | `projects/database/src/modules/import/import.command.ts:194` |
| `ImportCommand.truncate` | 4 | `PostgresClientService.truncate`, `ImportCleanError.constructor`, `referencedTablesMessage`, `notTruncatedMessage` | `projects/database/src/modules/import/import.command.ts:232` |
| `DatabaseService.connection` | 4 | `DatabaseService.databaseOptions`, `postgresConnection`, `DatabaseService.map(…)`, `postgresEnvironmentKeys` | `projects/database/src/modules/database/database.service.ts:61` |
| `startPostgresContainer` | 4 | `postgresConnection`, `startFirstAvailableImage`, `postgresDataSourceOptions`, `postgresEnvironment` | `projects/database/src/modules/database/postgres-container.utilities.ts:33` |
| `qualifyTableNames` | 3 | `filter(…)`, `PostgresTableNameError.constructor`, `map(…)` | `projects/database/src/modules/postgres-client/postgres-client.utilities.ts:136` |
| `PostgresClientService.dump` | 3 | `PostgresClientService.run`, `postgresContentFlags`, `PostgresClientService.map(…)` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:105` |
| `PostgresClientService.ensureTool` | 3 | `PostgresClientService.anonymous`, `PostgresClientToolError.constructor`, `parsePostgresMajorVersion` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:134` |
| `ExportCommand.explain` | 3 | `missingDumpTables`, `ExportTableError.constructor`, `missingTablesMessage` | `projects/database/src/modules/export/export.command.ts:64` |
| `ImportCommand.ensureContents` | 3 | `ImportCommand.missing`, `ImportContentsError.constructor`, `missingContentsMessage` | `projects/database/src/modules/import/import.command.ts:96` |
| `ImportCommand.logDryRun` | 3 | `dumpedTables`, `ImportCommand.map(…)`, `dryRunMessages` | `projects/database/src/modules/import/import.command.ts:118` |
| `postgresEnvironmentSchema` | 3 | `postgresSettingsSchema`, `postgresEnvironmentKey`, `assertPostgresEnvironmentKeys` | `projects/database/src/modules/database/database.utilities.ts:200` |
| `DatabaseService.createTypeOrmOptions` | 3 | `postgresDataSourceOptions`, `DatabaseService.connection`, `DatabaseService.databaseOptions` | `projects/database/src/modules/database/database.service.ts:76` |
| `findMigrationFiles` | 2 | `filter(…)`, `map(…)` | `projects/database/scripts/extract-migration-sql.ts:147` |
| `parsePostgresUri` | 2 | `PostgresUriError.constructor`, `postgresUriProblem` | `projects/database/src/modules/postgres-client/postgres-client.utilities.ts:63` |
| `parsePostgresDumpContents` | 2 | `describeEntry`, `dependencyIds` | `projects/database/src/modules/postgres-client/postgres-dump.utilities.ts:46` |
| `PostgresClientService.anonymous` | 2 | `PostgresClientService.execFile(…)`, `postgresProcessEnvironment` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:69` |
| `PostgresClientService.execFile(…)` | 2 | `PostgresClientError.constructor`, `maskPostgresCredentials` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:77` |
| `PostgresClientService.list` | 2 | `PostgresClientService.run`, `parsePostgresDumpContents` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:181` |
| `dryRunMessages` | 2 | `describePostgresContent`, `map(…)` | `projects/database/src/modules/export/export.constants.ts:66` |
| `dryRunMessages` | 2 | `describePostgresContent`, `map(…)` | `projects/database/src/modules/import/import.constants.ts:122` |
| `ImportCommand.missing` | 2 | `dumpedTables`, `ImportCommand.filter(…)` | `projects/database/src/modules/import/import.command.ts:100` |
| `createDataSource` | 2 | `postgresDataSourceOptions`, `postgresConnection` | `projects/database/src/modules/database/database.utilities.ts:69` |
| `postgresConnection` | 2 | `postgresEnvironmentKey`, `postgresSettingsSchema` | `projects/database/src/modules/database/database.utilities.ts:86` |
| `visit` | 1 | `extractSqlFromLiteral` | `projects/database/scripts/extract-migration-sql.ts:71` |
| `visit` | 1 | `extractSqlFromMethod` | `projects/database/scripts/extract-migration-sql.ts:118` |
| `parseDirectory` | 1 | `find(…)` | `projects/database/scripts/extract-migration-sql.ts:197` |
| `parseMode` | 1 | `find(…)` | `projects/database/scripts/extract-migration-sql.ts:211` |
| `processMigrationFile` | 1 | `extractSqlFromMigration` | `projects/database/scripts/extract-migration-sql.ts:221` |
| `postgresProcessEnvironment` | 1 | `filter(…)` | `projects/database/src/modules/postgres-client/postgres-client.utilities.ts:106` |
| `dumpedTables` | 1 | `flatMap(…)` | `projects/database/src/modules/postgres-client/postgres-dump.utilities.ts:21` |
| `missingDumpTables` | 1 | `map(…)` | `projects/database/src/modules/postgres-client/postgres-dump.utilities.ts:36` |
| `dependencyIds` | 1 | `filter(…)` | `projects/database/src/modules/postgres-client/postgres-dump.utilities.ts:112` |
| `describeEntry` | 1 | `tableEntry` | `projects/database/src/modules/postgres-client/postgres-dump.utilities.ts:120` |
| `quotePostgresTable` | 1 | `map(…)` | `projects/database/src/modules/postgres-client/postgres-truncate.utilities.ts:16` |
| `map(…)` | 1 | `quotePostgresTable` | `projects/database/src/modules/postgres-client/postgres-truncate.utilities.ts:35` |
| `PostgresClientService.run` | 1 | `PostgresClientService.anonymous` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:64` |
| `PostgresClientService.anonymous` | 1 | `PostgresClientService.execFile(…)` | `projects/database/src/modules/postgres-client/postgres-client.service.ts:139` |
| `map(…)` | 1 | `describePostgresContent` | `projects/database/src/modules/export/export.constants.ts:77` |
| `ExportCommand.logDryRun` | 1 | `dryRunMessages` | `projects/database/src/modules/export/export.command.ts:76` |
| `ExportCommand.requireOption` | 1 | `ExportOptionsError.constructor` | `projects/database/src/modules/export/export.command.ts:125` |
| `ExportCommand.selectContent` | 1 | `ExportOptionsError.constructor` | `projects/database/src/modules/export/export.command.ts:138` |
| `referencedTablesMessage` | 1 | `map(…)` | `projects/database/src/modules/import/import.constants.ts:93` |
| `map(…)` | 1 | `describePostgresContent` | `projects/database/src/modules/import/import.constants.ts:134` |
| `ImportCommand.requireOption` | 1 | `ImportOptionsError.constructor` | `projects/database/src/modules/import/import.command.ts:178` |
| `ImportCommand.selectContent` | 1 | `ImportOptionsError.constructor` | `projects/database/src/modules/import/import.command.ts:216` |
| `assertPostgresEnvironmentKeys` | 1 | `postgresEnvironmentKeys` | `projects/database/src/modules/database/database.utilities.ts:35` |
| `postgresDataSourceOptions` | 1 | `postgresSearchPathOption` | `projects/database/src/modules/database/database.utilities.ts:116` |
| `postgresEnvironment` | 1 | `postgresEnvironmentKey` | `projects/database/src/modules/database/database.utilities.ts:142` |
| `postgresEnvironmentKeys` | 1 | `postgresEnvironmentKey` | `projects/database/src/modules/database/database.utilities.ts:176` |
| `startFirstAvailableImage` | 1 | `postgresInitializationSql` | `projects/database/src/modules/database/postgres-container.utilities.ts:104` |

</details>
<!-- callidescope:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-10414-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-336.15_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-11-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-87-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-87-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-29-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-7-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-46-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-283-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-1-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-34-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-20-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-35-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-635-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-60-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-422-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-273-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-603-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-413-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-144-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-367-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-862-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-0-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-4-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-187-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-42-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-14-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-121-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-99-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-9-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-40-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-165-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-7-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-0-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-0-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-0-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-8-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-3-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-2-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-6-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-6-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-6-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-6-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-19-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-14-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-1-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-108-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-3-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-4-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-18-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-2-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-12-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-0-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-0-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-4-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-2-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-37-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
