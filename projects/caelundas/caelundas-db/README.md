# CaelundasDb: NestJS Database Project

## Quick Start

**Type**: Node.js database package (NestJS + TypeORM + PostgreSQL)

**Purpose**: A Node.js package containing the CaelundasDb database schema and migrations.

## Development

### Entities and migrations

Keep entity classes under `src/` with one `*.entity.ts` file per entity. Add
each entity to `DATABASE_ENTITIES` in
`src/modules/database/data-source.constants.ts`; the shared
`createDataSource` helper reads this list for TypeORM's migration commands.
Keep migrations under `migrations/`. They are never run or synchronized on
application startup.

### Entity relationship diagram

The entity relationship diagram is generated from every TypeORM entity file
under `src/`. Do not edit the diagram between its markers by hand.

```bash
nx run caelundas-db:erd:write
nx run caelundas-db:erd:check
```

See [documentation/entity-relationship-diagram.md](documentation/entity-relationship-diagram.md) for the generated diagram.

## Key Files

- [project.json](project.json): Nx targets and project tags
- [src/modules/database/data-source.constants.ts](src/modules/database/data-source.constants.ts): Entity list and CLI data source
- [src/modules/database/database.module.ts](src/modules/database/database.module.ts): NestJS database module
- [src/modules/database/database.service.ts](src/modules/database/database.service.ts): Database service
- [documentation/entity-relationship-diagram.md](documentation/entity-relationship-diagram.md): Generated entity relationship diagram

## 🌌 Caelundas Database

**The calendar's shape.** The Postgres schema for
[caelundas-cli](../caelundas-cli/README.md) and caelundas-api: the TypeORM
entities, the one migration, and the service that rebuilds the read model.

This package is the single definition of what a Caelundas event _is_. The
command line writes through these entities and the API reads through them, so
neither carries its own idea of the schema. It names no SQLite, and registers
nothing on a connection.

## Usage

```ts
import { CaelundasDatabaseModule, CalendarEvent } from "@codebase/caelundas-db";
```

`CaelundasDatabaseModule` connects to `caelundas_development`.`caelundas` as
`caelundas_username` through
[`@codebase/persistence`](../../common/persistence/README.md)'s
`DatabaseModule.forRoot`, with its shared plural snake-case naming strategy.
`databaseDataSource`, in `src/modules/database/data-source.constants.ts`,
is the same configuration as a standalone `DataSource`, built with the shared
`createDataSource`, which is what the migration command line runs against.
Neither synchronizes nor runs migrations on start, so only the data source and
the test harness are given `CAELUNDAS_DATABASE_MIGRATIONS`.

Both read only `CAELUNDAS_POSTGRES_*`, never the root's unprefixed
`POSTGRES_*`, which are the shared container's admin login. The importing
application's `ConfigModule` must be global, and spreads
`postgresEnvironmentSchema({ project: "caelundas" })` into its own schema.

| Variable                      | Default                 |
| ----------------------------- | ----------------------- |
| `CAELUNDAS_POSTGRES_HOST`     | `localhost`             |
| `CAELUNDAS_POSTGRES_PORT`     | `5432`                  |
| `CAELUNDAS_POSTGRES_USERNAME` | `caelundas_username`    |
| `CAELUNDAS_POSTGRES_PASSWORD` | `caelundas_password`    |
| `CAELUNDAS_POSTGRES_DATABASE` | `caelundas_development` |
| `CAELUNDAS_POSTGRES_SCHEMA`   | `caelundas`             |

## The schema

| Entity                     | Table                          | Holds                                                             |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `CalendarEvent`            | `calendar_events`              | One detected event for one observer location                      |
| `Tag`                      | `tags`, `tags_closure`         | The tag tree, a closure table TypeORM keeps in step               |
| `CalendarEventTag`         | `calendar_event_tags`          | An event carrying a tag                                           |
| `Star`                     | `stars`                        | A star of the HYG catalog, keyed by its Hipparcos number          |
| `Constellation`            | `constellations`               | One of the 88 IAU constellations                                  |
| `ConstellationEdge`        | `constellation_edges`          | Generated: a segment of a constellation's figure                  |
| `TagNode`                  | `tag_nodes`                    | Derived: a tag with its depth, root, and path                     |
| `CalendarEventTagNode`     | `calendar_event_tag_nodes`     | Derived: an event and every tag it carries, ancestors too         |
| `CalendarEventDerivedTime` | `calendar_event_derived_times` | Derived view: an event's UTC and local year, day, hour, and so on |

Entities are named by class: the shared naming strategy makes the tables
plural and the columns snake case, so no entity names a table or a schema.

- **Ids are `uuidv7`s the database assigns,** through
  `@codebase/persistence`'s `PostgresqlUpdatableEntity`, for `calendar_events`
  and `tags`. The tag closure, the join table, the star catalog, and the
  derived tables keep their natural keys.
- **`calendar_events` upserts on its natural key,** `(summary, start, end,
  latitude, longitude)`, so a re-run updates the row it wrote and a second
  place adds rows of its own.
- **`start` and `end` are `timestamptz`,** carried as `Moment`s in UTC by
  `createMomentTransformer`. **Latitude and longitude are `numeric(9,6)`,**
  carried as the text the driver returns, so the key compares exactly.
- **Whole numbers are `bigint`,** read back as numbers.

## The read model

The derived times are a plain view, so there is nothing to refresh: Postgres
computes them from the event on every read, and the local day and hour,
`start_local_day` and `start_local_hour`, are `start AT TIME ZONE timezone`.

The two derived tag tables are rebuilt by
`CaelundasDatabaseService.refreshReadModel(manager)`, one insert-select
statement each, inside the caller's transaction: a command line ingest ends
with it, and a reader never sees the tables half rebuilt.

## Migrations

```bash
nx run caelundas-db:migration:generate           # Diff entities → new migration
nx run caelundas-db:migration:run                # Apply pending migrations
nx run caelundas-db:migration:revert             # Roll back the last one
nx run caelundas-db:migration:show               # List applied and pending
```

The `migration` target is the shared one from the root `nx.json` target
defaults, declared here as
`"migration": { "options": { "module": "src/modules/database" } }`.
Each migration has its `-up.sql` and `-down.sql` beside it, linted by
`sqlfluff` and checked by `squawk`. The second replaces `constellation_lines`
with `constellation_edges`, the table `Constellation`'s `@Graph` generates,
carrying its rows over, since `squawk` refuses a table rename. The first
carries two hand edits after `generate`: it creates `typeorm_metadata` for the view's row, and its SQL
files open with the lock and statement timeouts the other projects' carry.

## Drawing the tag tree

```bash
nx run caelundas-db:render-tag-tree
nx run caelundas-db:render-tag-tree --args="--truncate-depth 2 --output-markdown tags.md --overwrite"
```

The `render-tag-tree` target runs the `persistence` `render-tree-data` command
over `tag.entity.ts`. It prints a Mermaid flowchart, or with `--diagram filetree`
Mermaid's beta file tree, which needs Mermaid 11.14 or later. Both
are committed, and the flowchart is the default. `--args` takes the
command's filter, sort, depth, breadth, paging, and output options. The
`--overwrite` flag lets a rerun replace `tags.md`, because an existing output
file is otherwise refused, as `postgresql-export` refuses an existing `--file`.

The target loads no `.env` file, so export the connection variables in your
shell first. For the local container, run this from the workspace root to load
them from `configuration/.env.default`:

```bash
set -a; . projects/caelundas/caelundas-db/configuration/.env.default; set +a
```

`CAELUNDAS_POSTGRES_USERNAME`, `CAELUNDAS_POSTGRES_PASSWORD`, and
`CAELUNDAS_POSTGRES_DATABASE` are required. `CAELUNDAS_POSTGRES_HOST`,
`CAELUNDAS_POSTGRES_PORT`, and `CAELUNDAS_POSTGRES_SCHEMA` default to
`localhost`, `5432`, and `caelundas`.

The shell builds the connection URI from them, so a password containing any
reserved URI character (`@`, `:`, `/`, `%`, `?`, or `#`) or whitespace must be
percent-encoded; an unencoded `#` starts a fragment and truncates the password.
The URI is passed on the command
line as `--source-uri`, as it is for `postgresql-export` and
`postgresql-import`, so other local users can read it, password included, with
`ps`. The command masks it in everything it prints or logs.

## Drawing the constellation lines

```bash
nx run caelundas-db:render-constellation-graph --args="--limit 31"
nx run caelundas-db:render-constellation-graph --args="--filter constellationDesignation=UMa"
```

`Constellation` is a `@Graph({ directed: false, edge: "ConstellationEdge",
nodes: () => Star })`: the decorator generates the `ConstellationEdge` entity,
so no class is written for it, and each of its rows joins two stars by
Hipparcos number. Callers never name it; they save a `Constellation` with its
`edges`, and read `Constellation.edges` with `relations`. A star reaches its
edges through `Star.outgoingEdges` and `Star.incomingEdges`, and their `graph`.
`@GraphLabel()` on `Constellation.name` titles each figure's box, and on
`Star.hip` labels each star's node. The `render-constellation-graph` target
runs the `persistence` `render-graph-data` command over `Constellation`, with
the same connection variables and `--args` as the tag tree above. Each
connected group of stars is a neighborhood, drawn as its own Mermaid subgraph
titled with its constellation's name, and its lines are drawn without the
label. Constellations that share a star are one neighborhood and keep their
labels on the lines. A single constellation is one neighborhood, so it draws
with no subgraph.

Mermaid draws at most 500 edges and all constellation lines exceed it, so
page with `--limit 31`, which draws every 31 neighborhoods as a diagram of its
own, or add `--page 1`, repeating `--page` for several, to draw only those. Or pick one constellation with
`--filter constellationDesignation=UMa`.

## Committed diagrams

[`tag-tree-flowchart-data.md`](documentation/tag-tree-flowchart-data.md),
[`tag-tree-filetree-data.md`](documentation/tag-tree-filetree-data.md) and
[`constellation-graph-data.md`](documentation/constellation-graph-data.md)
hold the diagrams of a local database, named `{entity}-{tree|graph}-data.md`,
with the tag tree's `--diagram` between them. Regenerate them with the
connection variables set:

```bash
nx run caelundas-db:render-tag-tree --args="--diagram flowchart --output-markdown projects/caelundas/caelundas-db/documentation/tag-tree-flowchart-data.md --overwrite"
nx run caelundas-db:render-tag-tree --args="--diagram filetree --output-markdown projects/caelundas/caelundas-db/documentation/tag-tree-filetree-data.md --overwrite"
nx run caelundas-db:render-constellation-graph --args="--limit 31 --output-markdown projects/caelundas/caelundas-db/documentation/constellation-graph-data.md --overwrite"
```

## Test

```bash
nx run caelundas-db:vitest:unit
nx run caelundas-db:vitest:integration   # needs Docker
```

The integration suites start a throwaway Postgres 18, run the real migration,
insert base rows, refresh, and assert the derived tables and the view.

## Conformetry

This project was generated from the [nestjs-database-project](../../../configuration/ic-suite/conformetry-templates/nestjs-database-project) conformetry template.
