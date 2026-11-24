# 🐘 Persistence

The shared package every database-backed project connects through, to Postgres, a command line that moves tables between Postgres databases, and one that draws their trees and graphs as Mermaid flowcharts.

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
  migrations: ["migrations/*.ts"],
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
| `migrations/`                       | Each generated migration, and its extracted `.sql`         |

| Command                                         | Does                                                            |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `nx run <project>:migration:generate`           | Generates a migration from the entities, extracts it, and lints |
| `nx run <project>:migration:run`                | Applies every pending migration                                 |
| `nx run <project>:migration:revert`             | Reverts the latest migration                                    |
| `nx run <project>:migration:show`               | Lists applied and pending migrations                            |
| `nx run <project>:migration:extract-sql-latest` | Extracts the latest migration's SQL for sqlfluff and squawk     |
| `nx run <project>:migration:extract-sql-all`    | Extracts every migration's SQL                                  |

Migrations never run on application start; running them is its own step.
The extraction runs through this project's `typeorm-migration-sql` command, which
the two `extract-sql-*` targets run in `write` mode. Run it alone with
`nx run persistence:typeorm-migration-sql`: `check` by default reports drift, comparing
normalized SQL because the committed files are lint-fixed and formatted, and
`write` rewrites each migration's sibling `-up.sql` and `-down.sql` files. The
`extract-typeorm-migration-sql` alias still works.

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

## Generating an entity relationship diagram

`postgresql-erd` reads TypeORM entity files and writes the model as JSON,
Mermaid ER diagram Markdown, or both. Each `--entities` glob is repeatable.
Relative globs and output paths resolve from the persistence project directory:

```bash
pnpm exec nx run persistence:start:postgresql-erd --args="--entities 'src/**/*.entity.ts' --output-json erd.json --output-markdown README.md"
```

`--output-json` and `--output-markdown` are optional individually, but at least
one is required. Markdown output replaces the existing ERD marker block or
appends one after the document's prose. `--check` writes nothing and exits
non-zero, naming every stale or missing output:

```bash
pnpm exec nx run persistence:start:postgresql-erd --args="--entities 'src/**/*.entity.ts' --output-markdown README.md --check"
```

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

### Moving-data options

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

## Drawing diagrams

Three commands read a database table and draw it as a Mermaid flowchart. They
print the diagram on stdout, or write it to files, and they share their
options. Each reads one kind of entity, marked by a decorator:

| Command                              | Reads                                        | Draws                                             | Direction |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------- | --------- |
| `render-tree-data`                   | a `@Tree` entity's rows                      | the tree, from its roots down                     | `LR`      |
| `render-directed-acyclic-graph-data` | a `@DirectedAcyclicGraph` entity's edge rows | arrows from source to target                      | `TB`      |
| `render-graph-data`                  | a `@Graph` entity's edge rows                | arrows when directed, plain links when undirected | `LR`      |

```bash
pnpm exec nx run persistence:start --args="render-tree-data --source-uri postgresql://user:password@localhost:5432/source --schema tags --entities '../<project>/src/**/tag.entity.ts'"
pnpm exec nx run persistence:start --args="render-directed-acyclic-graph-data --source-uri postgresql://user:password@localhost:5432/source --schema tasks --entities '../<project>/src/**/task-link.entity.ts'"
pnpm exec nx run persistence:start --args="render-graph-data --source-uri postgresql://user:password@localhost:5432/source --schema routes --entities '../<project>/src/**/route-link.entity.ts'"
```

For a real `@Graph`, `nx run caelundas-db:render-constellation-graph` draws the
constellations' lines, and `nx run caelundas-db:render-tag-tree` draws a `@Tree`.

`start` runs with the working directory at `projects/common/persistence`, so
relative `--entities` globs and output paths resolve from there.

### Options

Every option is shared by the three commands unless the table says otherwise;
`--diagram` is `render-tree-data` only.

| Option                     | Does                                                                                                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--source-uri <uri>`       | Required. The database to read from, as `postgresql://user:password@host:port/database`. Passed in argv, so visible to `ps`; masked in every line it prints or logs                                   |
| `--schema <name>`          | Required. The schema the entity tables live in                                                                                                                                                        |
| `--entities <glob>`        | Required, repeatable. The entity files to import, through the repository's swc loader. Each glob must match at least one file                                                                         |
| `--table <name>`           | The table to draw when the globs match several entities of the command's kind; unqualified, or `schema.table` with the schema equal to `--schema`                                                     |
| `--filter <expression>`    | Keeps rows matching `column<op>value`, e.g. `name~=Inbox`; repeatable, and every filter must match. Operators: `=`, `!=`, `~=` (contains, case-sensitive), `<` and `>` (numeric or date columns only) |
| `--sort <expression>`      | Sorts by `column[:asc\|desc]`; repeatable, applied in order. Applied before the caps cut the diagram                                                                                                  |
| `--limit <n>`              | Roots per page, a positive integer; without `--page` every page is its own diagram                                                                                                                    |
| `--page <n>`               | A page of `--limit` roots to draw, from 1; repeat for several, each its own diagram. Needs `--limit`                                                                                                  |
| `--truncate-depth <n>`     | The deepest level drawn, a positive integer. Roots are level 1; the children below a cut level become one `… K more` node                                                                             |
| `--truncate-breadth <n>`   | The most children drawn under one node, a positive integer, in sort order. The rest become one `… K more` node. Roots are never capped                                                                |
| `--output-markdown <path>` | Writes the diagram as a fenced Mermaid block, creating its folders, with the warnings after the fence. The diagram is not printed                                                                     |
| `--output-json <path>`     | Writes the drawn graph as pretty JSON, creating its folders. The diagram is not printed                                                                                                               |
| `--overwrite`              | Replaces an existing `--output-markdown` or `--output-json` file. Without it an existing file is refused and left unchanged                                                                           |
| `--dry-run`                | Checks the options and output paths and lists the entity files it would read. It connects to no database and imports no entity file                                                                   |

`--diagram <flowchart|filetree>` is `render-tree-data` only. `flowchart` (the
default) draws the tree as a flowchart; `filetree` draws Mermaid's beta
`treeView-beta` file tree. See [Drawing trees](#drawing-trees).

`--icon-field <name>`, `--note-field <name>` and `--order-field <name>` are
`render-tree-data` only, and name the entity properties a tree reads from,
`icon`, `note` and `order` unless given. A row's `note` and `icon` (a lucide
icon slug) are drawn beneath its name in a flowchart, and in a file tree as
the icon in brackets and then the note after a dash, both following the name. With no `--sort`, siblings come in `order`
ascending and then by `name`. A property the entity lacks is left out, so a tree
with none of them draws as before.

Filters and sorts name columns of the entity, and fail before any connection
opens when a name is unknown. A `<` or `>` on a text column, or a value that is
not a number or a date for its column, fails once the connection is open, since
only then are the column types known. Output paths are checked before the
connection opens: a directory, an existing file without `--overwrite`, a folder
that cannot take a new file, or one path given to both output flags is refused.
A `--table` qualified with a schema other than `--schema` is refused.

### Output and the streams

- On a successful run with no output file and no `--dry-run`, the diagram is the
  only thing on stdout, followed by a newline. Pipe stdout into a file only after
  checking the exit status.
- Warnings go to stderr, one line each, prefixed `⚠️`, whichever output is
  chosen. With `--output-markdown` they are also quoted after the fence.
- With an output file, stdout carries one `📝 Wrote <path>` log line per file.
- Log lines go to stdout, the same stream as the diagram: the dry-run plan, the
  `📝 Wrote` lines, and a failed run's error. A failed run exits with status 1.

### Declaring the entities

#### Trees

A tree is a TypeORM `@Tree` entity with one primary key column. Its node id is
the primary key as text, and its label is the `name` column as text, or the
primary key when the entity has no `name`. Its parents are read through the
storage the `@Tree` names:

| Storage             | Parent of a row is read from                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `closure-table`     | The `@TreeParent` join column. Requires `@TreeParent`                                                                      |
| `adjacency-list`    | The `@TreeParent` join column. Requires `@TreeParent`                                                                      |
| `materialized-path` | The segment before the last of the materialized path column, so `a.b.c` has parent `b`. Requires the path column           |
| `nested-set`        | The nearest row whose left bound is below the row's and whose right bound is above it. Requires the left and right columns |

The closure table itself is not read: a closure-table tree's parent comes
from its `@TreeParent` column, as an adjacency list's does.

#### Edges: `@DirectedAcyclicGraph` and `@Graph`

A graph has one row per edge, and the decorators take two forms. The first,
below, marks an edge entity you write by hand. The second, under
[generated edges](#generated-edges), marks the graph entity and generates the
edge entity, the way TypeORM's `@Tree("closure-table")` generates its closure
table. In the first form, mark the class and its columns:

- `@DirectedAcyclicGraph()` marks a directed acyclic graph, whose edges run from source to target.
- `@Graph()` marks a graph, directed unless `@Graph({ directed: false })`.
- `@GraphSource()` and `@GraphTarget()` each mark exactly one column, the two
  endpoints. Both are required.
- `@GraphLabel()` and `@GraphWeight()` each optionally mark one column. A label
  is drawn as text on its edge; a weight is drawn after the label.

The decorators are exported from `@codebase/persistence`:

```ts
import { Column, Entity, PrimaryColumn } from "typeorm";

import {
  DirectedAcyclicGraph,
  GraphLabel,
  GraphSource,
  GraphTarget,
  GraphWeight,
} from "@codebase/persistence";

/** Each row says its source task blocks its target task. */
@DirectedAcyclicGraph()
@Entity({ name: "task_links" })
export class TaskLink {
  @PrimaryColumn({ type: "integer" })
  id!: number;

  @Column({ type: "text" })
  @GraphSource()
  source!: string;

  @Column({ type: "text" })
  @GraphTarget()
  target!: string;

  @Column({ nullable: true, type: "text" })
  @GraphLabel()
  label!: null | string;

  @Column({ nullable: true, type: "double precision" })
  @GraphWeight()
  weight!: null | number;
}
```

A class with neither `@DirectedAcyclicGraph()` nor `@Graph()`, or with both, is refused, as is
one with a missing or repeated endpoint or optional column. A subclass that
redeclares a base class's endpoint under the same name counts once; under a
new name it leaves two endpoints for one role, and is refused. The error names
the class and the decorator.

An endpoint is read as text, so node ids are the endpoint values as text. A
declared column that is not a column of the entity fails once the connection
is open.

#### Generated edges

Declare the graph once, on the graph entity, and name the edge entity it
generates and the entity whose rows it joins. Nobody writes the edge class:

```ts
@Entity()
@Graph({ directed: false, edge: "ConstellationEdge", nodes: () => Star })
export class Constellation {
  @PrimaryColumn("text")
  designation!: string;

  @GraphLabel() // titles the constellation's box in the diagram
  @Column("text")
  name!: string;

  @GraphEdges("ConstellationEdge")
  edges?: Relation<GraphEdgeRow<Constellation, Star>>[];
}

@Entity()
export class Star {
  @GraphLabel() // labels the star's node
  @PrimaryColumn({ transformer: createBigintTransformer(), type: "bigint" })
  hip!: number;

  @GraphOutgoingEdges("ConstellationEdge")
  outgoingEdges?: Relation<GraphEdgeRow<Constellation, Star>>[];

  @GraphIncomingEdges("ConstellationEdge")
  incomingEdges?: Relation<GraphEdgeRow<Constellation, Star>>[];
}
```

- **Options:** `edge` names the generated entity, and so its table, by the
  data source's naming strategy (`ConstellationEdge` is `constellation_edges`);
  `nodes` returns the node entity, read when the decorator runs, so import it
  before the graph and keep the two out of an import cycle; `directed` is true
  unless false; `table` names the table instead of `edge`. `@DirectedAcyclicGraph`
  takes `edge`, `nodes`, and `table`.
- **The generated entity** has a composite key of the graph's key and both
  ends, each column of the type of the key it copies, so a `bigint` key with a
  transformer stays one. Its properties are `<graph><Key>`, `from<NodeKey>`,
  and `to<NodeKey>`, such as `constellationDesignation`, `fromHip`, and `toHip`,
  which `--filter` and `--sort` name. The columns are `constellation_designation`,
  `from_hip`, and `to_hip`. It indexes each end as `<table>_from_<key>` and
  `<table>_to_<key>`, and it has a many-to-one relation to the graph (`graph`)
  and to each node (`source`, `target`), each deleting with its row.
- **Reaching it:** a data source must list the generated class beside the graph
  and node entities. `withGeneratedEdges(entities)` adds the edge, node, and
  graph entities of each graph in the list once, and the drawing commands and
  `createGraphDataSource` use it. The edge has no class to import, so callers
  address it by name: `manager.getRepository("ConstellationEdge")`.
- **Reverse relations:** `@GraphEdges(edge)` on the graph entity lists the
  edges of each graph row. On a node entity, `@GraphOutgoingEdges(edge)` lists
  the edges that start at it and `@GraphIncomingEdges(edge)` those that end at
  it, so a node of an undirected graph needs both to find all its edges. Each is
  a one-to-many whose inverse side is the edge's `graph`, `source`, or `target`
  relation, so a node reaches its graphs through `edge.graph`, and a graph its
  nodes through `edge.source` and `edge.target`. Type the properties with
  `Relation<GraphEdgeRow<Graph, Node>>[]`.
- **Labels:** `@GraphLabel()` on a node entity labels each drawn node with that
  column. Only the drawn nodes are read, in batches of 500 ids, so a large node
  table is never read whole; a node with no row or no label keeps its id.
  `@GraphLabel()` on the graph entity titles each neighborhood with the graph
  row's label in place of the graph's key.
- **Refused at decoration, naming the class:** a graph or node entity without
  exactly one primary column, `edge` without `nodes` or the reverse, an edge
  name or table that an entity already has, two generating declarations on one
  class, and a graph that also marks `@GraphSource` or `@GraphTarget` properties.
  Use one form per graph.

The commands pick the graph entity: `--table constellations` picks it among
several, and without `--table` the only one is chosen. `--filter` and `--sort`
name the edge's columns, as in the first form.

### Drawing trees

`render-tree-data` reads the whole tree, then applies, in order: `--filter`,
`--sort`, `--limit` and `--page`, then `--truncate-depth` and `--truncate-breadth`.

- **Roots** are the rows whose parent is null or is not in the table. A row
  whose parent is missing is drawn as a root and warned about, naming the
  parent.
- **`--filter`** keeps each matching row together with its ancestors and its
  whole subtree, so a match shows where it sits.
- **`--sort`** orders siblings and roots. Without it, rows follow the entity's
  `order` property then its `name` when it has them (`--order-field` names
  another), else the primary key, which is a `uuidv7` in the caelundas tables and
  so roughly creation order.
- **`--limit` and `--page`** page the roots, each with its descendants. Each
  page is the next roots of the filtered, sorted forest.
- **Caps** hide children beyond `--truncate-depth` or `--truncate-breadth`. Each capped
  parent warns with its id and the count hidden.
- Several `@Tree` entities without `--table` fail, naming each table, before
  any connection opens.
- **`--diagram filetree`** draws the same tree as Mermaid's `treeView-beta`
  diagram instead of a flowchart: roots at the top level, children nested by
  indentation, quoted labels, and a trailing `/` on each node with children. A
  truncation node shows as its `… K more` label. Filters, sorts, caps, paging
  (with the same `## Page` headings), and the output flags work unchanged; edge
  labels, weights, and styled roots are not drawn. Mermaid's quoted labels
  have no escapes, so a label holding `"` is wrapped in single quotes with its
  own `'` turned into `’`.
- **`treeView-beta` is a beta diagram.** It needs Mermaid 11.14 or later, its
  syntax may still change, and Obsidian may not render it yet. Only Mermaid's
  50,000-character text limit warns for a filetree; the 500-edge limit is a
  flowchart setting.

### Drawing directed acyclic graphs and graphs

`render-directed-acyclic-graph-data` and `render-graph-data` read the edge rows, one per edge from
the source column to the target column, and apply the same options to them.
The edge columns are read as text, and a row with a NULL endpoint is not drawn:
it is counted in one warning per command run.

- **Nodes** are the distinct endpoint values, labelled by the value, in the
  order the sorted edges first name them.
- **`--filter`** keeps edge rows. A node is drawn only if a kept edge touches it.
- **`--sort`** orders edges. Edges then sort by source, target, and primary key,
  so equal data always draws the same diagram. Edge order sets the order of
  roots and of siblings.
- **Roots** in a `@DirectedAcyclicGraph` are the nodes no other kept edge targets; a self-loop
  does not count. A `@Graph` then starts each node still unreached, smallest
  first, so every component is reached. An undirected graph starts each
  connected component at its smallest node.
- **`--limit` and `--page`** page the roots in node order, each with every node
  reachable from it. A `@DirectedAcyclicGraph` component with no root, such as a cycle, is drawn
  only without `--limit`.
- **Cycles** in a `@DirectedAcyclicGraph` warn once per cyclic component, naming its nodes in
  sorted order, and are drawn as they are. A self-loop warns as well. A `@Graph`
  may contain cycles, which draw with no warning.
- **Undirected graphs** draw plain links, `---`. A link read from both ends is
  one link: the first row in sort order is kept, with its label and weight, and
  the other is dropped.
- **Caps** count a node's level as its shortest distance from a root, so a node
  reached by several paths is drawn once.
- `render-directed-acyclic-graph-data` refuses a `@Graph` entity, and `render-graph-data` refuses a
  `@DirectedAcyclicGraph` one, each pointing to the other command.

### Mermaid limits and truncation

Mermaid draws at most 500 edges and 50,000 characters. The renderer warns when a
diagram reaches 90% of either limit, and again when it passes one:

| Count      | Warns "nearing" at | Warns "over" above |
| ---------- | ------------------ | ------------------ |
| Edges      | 450                | 500                |
| Characters | 45,000             | 50,000             |

The diagram is still drawn in full, and the warnings name the count and the
limit. The edge count includes the truncation edges, and the character count is
the length of the Mermaid text.

A capped parent gets one truncation node, labelled `… K more` with a dashed grey
box, under the parent with id `<parent>/more`. Each one warns with the parent's
id, the number hidden, and the cap that hid them. Roots are drawn with a heavy
blue border. Node ids in the diagram are short positional ids, and labels are
escaped so a quote, pipe, angle bracket, hash, or backtick in a value cannot break the diagram.

### Neighborhoods

When a diagram holds two or more neighborhoods, each is wrapped in a Mermaid
`subgraph` (`nb0`, `nb1`, and so on, in order of its first node). A
neighborhood is one weakly connected group of nodes: for tree data each
separate tree of the forest, and for graph data each connected group, with
edges read as undirected. A truncation node belongs to its parent's
neighborhood, and a node with no edges is a neighborhood of its own. A diagram
with a single neighborhood has no `subgraph`, and the JSON output never has
them.

The title is the label every edge of the neighborhood shares; those edges are
then drawn without it, since the title says it already, which keeps a
constellation's lines uncluttered. A truncation node's edge has no label and is
not counted. Otherwise the title is the label of the
neighborhood's first root, or of its first node. Weights stay on their edges.
A generated edge's label is its graph's key, shown as the graph's `@GraphLabel`
when it has one, so the box reads "Ursa Major" and not "UMa".

### Known limits

- **Nested-set parents** are found with a correlated subquery per row, so the
  cost grows with the square of the row count. Expect it to be slow beyond about
  10,000 rows; this was not measured.
- **The whole tree is read** before roots are paged. `--limit` reduces the
  drawing, never the rows read. The rows are read level by level from the roots
  in batches of 500, and then any row no level reached is read by id.
- **A cycle in a tree** raises no warning. Under `--limit` its rows have no
  root and are left out; without `--limit` they are drawn as they are.
- **A weight that is not finite**, such as NaN or Infinity, is read as NULL and
  drawn without a weight, with no warning.
- **`<` and `>`** value and column-kind checks run after the connection opens.
  Unknown column names, and `=`, `!=`, and `~=` on any column, are checked before.
- **The `--source-uri`** is in argv, visible to `ps`, as it is for
  `postgresql-export` and `postgresql-import`.
- **Log lines share stdout** with the diagram, as described under output and
  the streams above.

### Example: the Caelundas tag tree

The `render-tag-tree` target in `caelundas-db` runs `render-tree-data` over the
`tags` table of `tag.entity.ts`, a closure-table tree, with the connection built
from `CAELUNDAS_POSTGRES_*` in the shell:

```bash
nx run caelundas-db:render-tag-tree --args="--truncate-depth 2 --limit 3"
```

The target and its connection variables are described in the
[caelundas-db README](../../caelundas/caelundas-db/README.md#drawing-the-tag-tree).
The output below is a real run against the local container, with the target's
`--truncate-depth 2 --limit 3`:

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5
    n0["Aspect Harmonic"]
    n1["Harmonic 4"]
    n2["Aspect Nature"]
    n3["Hard"]
    n4["Body Class"]
    n5["Asteroid"]
    n6["Luminary"]
    n7["Outer"]
    n8["Personal"]
    n9["Harmonic 3"]
    n10["Soft"]
    n11["Point"]
    n12["Harmonic 6"]
    n13["Harmonic 12"]
    n14["Neutral"]
    n15["Node"]
    n16["Harmonic 1"]
    n17["Harmonic 2"]
    n18["Harmonic 10"]
    n19["Social"]
    n20["Harmonic 9"]
    n21["Harmonic 5"]
    n22["Harmonic 8"]
    n23["Harmonic 7"]
    n24["Harmonic 11"]
    n0 --> n1
    n2 --> n3
    n4 --> n5
    n4 --> n6
    n4 --> n7
    n4 --> n8
    n0 --> n9
    n2 --> n10
    n4 --> n11
    n0 --> n12
    n0 --> n13
    n2 --> n14
    n4 --> n15
    n0 --> n16
    n0 --> n17
    n0 --> n18
    n4 --> n19
    n0 --> n20
    n0 --> n21
    n0 --> n22
    n0 --> n23
    n0 --> n24
    class n0 root
    class n2 root
    class n4 root
```

The three roots are the first three in primary-key order, and `--truncate-depth 2`
draws their children without going deeper. A run with `--truncate-depth 2
--truncate-breadth 2` and no `--limit` cuts each parent to two children, adds
`… K more` nodes, and writes one warning per cut to stderr; that run was made
too, and its warnings were read from stderr.

The directed acyclic graph and graph commands are shown with the illustrative entity above rather
than a live run, since no local table holds edge rows.

## Test

```bash
nx run persistence:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-service-project](../../configuration/conformetry-templates/nestjs-service-project) conformetry template.
