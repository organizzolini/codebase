# 🐘 Persistence

The shared package every database-backed project connects through, to Postgres, and a command line that moves tables between Postgres databases.

## Purpose

Lexico, meanderaw, and caelundas each keep their tables in Postgres. This
package holds the one way they connect, so the environment variables, the
connection options, and the naming of each Postgres project's database,
schema, and role are written once:

| Context        | Database                | Schema      | Role                                        |
| -------------- | ----------------------- | ----------- | ------------------------------------------- |
| Local Docker   | `<project>_development` | `<project>` | `<project>_username` / `<project>_password` |
| Testcontainers | `<project>_testing`     | `<project>` | the same                                    |

The schema carries no environment, so a migration generated locally applies
anywhere unchanged.

Key exports and responsibilities:

- `postgresEnvironmentSchema`: The zod fragment for a project's six
  `<PROJECT>_POSTGRES_*` variables, with defaults
- `postgresConnection`: The connection those variables describe, read from any
  environment record
- `postgresDataSourceOptions`: TypeORM options: snake case, schema as search
  path, `synchronize` and `migrationsRun` off
- `PostgresqlModule.forRoot`: The NestJS module wiring TypeORM from those
  variables through `ConfigService`
- `createDataSource`: The `DataSource` a project's TypeORM command-line entry
  exports, from the same options
- `PostgresqlIdentifiableEntity` …: Base entities: a `uuidv7()` id, then created,
  updated, and soft-deleted columns
- `startPostgresContainer`: From `@codebase/persistence/testing`: a migrated
  Postgres 18 container laid out like local Docker
- `startDatabaseTestingModule`: From `@codebase/persistence/testing`: a Nest
  testing module connected to such a container

## Usage

Spread the fragment into the application's environment schema. Every
variable is prefixed with the project's name, so the root's unprefixed
`POSTGRES_*` — the shared container's admin login — never reach it:

```ts
import { postgresEnvironmentSchema } from "@codebase/persistence";

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
folder is `<Project>PostgresqlModule` and imports `PostgresqlModule` with no
alias. It connects through `PostgresqlModule.forRoot`, beside a global
`ConfigModule` that validates the same schema:

```ts
@Module({
  exports: [PostgresqlModule],
  imports: [
    PostgresqlModule.forRoot({
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
  migrations: ["src/modules/database/migrations/*.ts"],
  project: "meanderaw",
});
```

Neither ever synchronizes or runs migrations on start: the schema changes
only through migrations, run on their own. Every table is named in
plural snake case (`CalendarEvent` is `calendar_events`), and a many-to-many join
table from both plural names sorted alphabetically (`lexemes_words`).

### Base entities

Each table's entity extends the narrowest base it needs, so a table without
soft deletion carries no `deletedAt`:

| Base                           | Adds                                                                |
| ------------------------------ | ------------------------------------------------------------------- |
| `PostgresqlIdentifiableEntity` | `id`, a `uuid` the database assigns with Postgres 18's `uuidv7()`   |
| `PostgresqlCreatableEntity`    | `createdAt` (`timestamptz`) and a nullable `createdBy` (`uuid`)     |
| `PostgresqlUpdatableEntity`    | `updatedAt` (`timestamptz`) and a nullable `updatedBy` (`uuid`)     |
| `PostgresqlDeletableEntity`    | `deletedAt` (`timestamptz`, soft delete) and a nullable `deletedBy` |

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
  "options": { "module": "src/modules/database" }
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
SQL extraction now runs through the `synchronization` command:
`extract-typeorm-migration-sql`.

The extracted SQL is linted only once the project opts in to it as well: a
`framework:typeorm` tag, and three more empty entries beside `migration`:

```jsonc
// project.json
"tags": ["framework:typeorm"],
"targets": {
  "migration": { "options": { "module": "src/modules/database" } },
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

`@codebase/persistence/testing` starts a throwaway `postgres:18-alpine`, falling
back to Google's mirror of Docker Hub, laid out the way the local container
is: a `<project>_username` role owning a `<project>_testing` database with a
`<project>` schema in it. It then builds the schema by running the project's
real migrations, so every integration suite exercises them too.

A suite that boots Nest modules against the database uses
`startDatabaseTestingModule`. It starts that container, then compiles a
testing module with a global `ConfigModule` and `PostgresqlModule.forRoot`
connected to it, the container's `<PROJECT>_POSTGRES_*` set on `process.env`
over any already there:

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
const command = postgresql.module.get(DrawCommand);
// … database.dataSource, database.container

await database.close();
```

Options:

- `project`: Names the role, the `_testing` database, the schema, and the
  variables
- `entities`: Registered with `TypeOrmModule.forFeature`, and connected when no
  `database` is given
- `migrations`: Run by the container before the module boots
- `imports`: The modules under test
- `providers`: The providers under test
- `database`: The project's own `<Project>PostgresqlModule`, imported in place
  of the helper's `forRoot`
- `validate`: The application's environment validation, usually
  `environmentSchema.parse`
- `images`: Overrides the images tried, in order

When the modules under test import the project's own database module, pass
it as `database` too, or the testing module connects twice.
`close` closes the module, stops the container, and restores the whole of
`process.env`, removing any default `validate` filled in.

`startPostgresContainer` alone suits a suite that needs no Nest module:

```ts
import { startPostgresContainer } from "@codebase/persistence/testing";

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
with the working directory at `projects/common/persistence`, so a relative `--file`
resolves from there, and `*.dump` is gitignored there:

```bash
pnpm exec nx run persistence:start:postgresql-export --args="--source-uri postgresql://user:password@localhost:5432/source --schema fixture --table widgets --data --ddl --file sample.dump"
pnpm exec nx run persistence:start:postgresql-import --args="--target-uri postgresql://user:password@localhost:5432/target --schema fixture --table widgets --data --ddl --file sample.dump"
```

### Options

| Option               | Command           | Does                                                                              |
| -------------------- | ----------------- | --------------------------------------------------------------------------------- |
| `--source-uri <uri>` | postgresql-export | Required. The database to dump                                                    |
| `--target-uri <uri>` | postgresql-import | Required. The database to restore into                                            |
| `--table <name>`     | both              | Required, repeatable. A table to move                                             |
| `--schema <name>`    | both              | The schema unqualified `--table` names resolve in, like `pg_dump --schema`        |
| `--data`, `--ddl`    | both              | Rows, table definitions (DDL), or both; at least one is required                  |
| `--file <path>`      | both              | Required. The dump to write or read                                               |
| `--overwrite`        | postgresql-export | Replace `--file` when it exists                                                   |
| `--clean`            | postgresql-import | Clear the selected tables before restoring, with no confirmation                  |
| `--dry-run`          | both              | Validate and print the plan without connecting to a database or changing anything |

Qualified names (`schema.table`) are used as written. There is no default
schema: without `--schema`, an unqualified `--table` fails before anything
runs, naming it. Naming one table twice moves it once.

### Export

`postgresql-export` writes a custom-format dump. It passes
`--strict-names` to `pg_dump`, so a table that does not exist fails the run
with a message naming it and the source, never a smaller dump. An existing
`--file` is refused unless `--overwrite` is given.

`pg_dump` writes to a `.partial` file beside `--file`, which replaces it only
once the dump succeeds. A failed `--overwrite` therefore keeps the old dump,
and the partial file is removed. `--dry-run` still checks that `pg_dump` is
installed, then prints the source database, what each table would export, and
whether `--file` would be created or overwritten.

### Import

`postgresql-import` restores the selected tables in one transaction that stops at the
first error, so by default it deletes nothing and a conflict leaves the target
as it was. Before any connection opens it lists the dump and fails when it
lacks the rows or definitions `--data` and `--ddl` ask for. Owners and
grants are not restored; the target's own role owns what it creates.
`--ddl` without `--clean` fails when a selected table already exists on the
target.
`--dry-run` stops there, printing what the dump holds of each table and what
`--clean` would drop or truncate.

`--clean` empties the selected tables first and never asks for confirmation,
in a terminal or out of one. Run `postgresql-import --dry-run` with the same options
before `postgresql-import --clean` to see the tables, database, and host it would clear:

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
`pg_restore` for import, and check their version before any database work. A
missing tool or another major version fails with the setup script to run:
`scripts/local/software/persistence.sh` installs them with Homebrew, and the
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
nx run persistence:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run persistence:coinagerie-check:write`.

- **breadth**: The number of direct calls a callable makes, measured by callidescope and reported in this project's Breadth table.
- **convention**: The naming and log-message rules that the package's entities, commands, and tests follow, checked by tests and the lint rules.
- **creatable**: The entity base layer that adds create-time columns, sitting second in the identifiable, creatable, updatable, deletable chain.
- **db**: A stray fragment for database; this package's code and docs use the full word, so the headword carries no local role.
- **deletable**: The entity base layer that adds soft-delete support, last in the identifiable, creatable, updatable, deletable chain.
- **explain**: Builds the human-readable reason a command refused to run, as ExportCommand.explain does for missing dump tables.
- **identifiable**: The entity base layer that adds a primary id, first in the identifiable, creatable, updatable, deletable chain.
- **latitude**: An example geographic column that must survive a round trip exactly, so the package stores it as text rather than a float.
- **longitude**: An example geographic column that must survive a round trip exactly, so the package stores it as text rather than a float.
- **refusal**: A deliberate, explained refusal to run, such as truncate refusing a table that another table still references.
- **role**: The Postgres role, the database user identity that connections and grants run as, as in the README context table.
- **trace**: The callidescope call-stack trace that measures depth, with config notes on which callees the trace does not follow.
- **unqualified**: A table name without a schema prefix, which resolves in the --schema option's search path rather than a fixed schema.
- **updatable**: The entity base layer that adds update tracking columns, third in the identifiable, creatable, updatable, deletable chain.
- **verb**: The verb in a log message that the export log convention test expects after the subject emoji, such as exists.

<!-- coinagerie:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-10267-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-388.61_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-12-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-88-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-88-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-30-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-7-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-46-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-278-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-1-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-35-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-21-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-36-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-630-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-62-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-422-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-270-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-578-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-411-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-147-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-362-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-832-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-184-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-42-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-13-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-122-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-99-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-1-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-9-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-38-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-164-dc2626?style=flat-square)
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
![Unit Tests](https://img.shields.io/badge/Unit_Tests-20-ca8a04?style=flat-square)
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

![Markdown Files](https://img.shields.io/badge/Markdown_Files-3-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-605-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-5-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-10-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-28-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-2-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-12-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-4-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-64-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-5-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-11-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-269-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
