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
- [documentation/metrics-facts.md](documentation/metrics-facts.md): The metrics facts, filters and groups, and the SQL for each metric

## 🔭 Caelundas Database

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

| Entity                | Table                                              | Holds                                                                                          |
| --------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `CalendarEvent`       | `calendar_events`                                  | One detected event for one observer location                                                   |
| `Tag`                 | `tags`, `tag_edges`, `tag_trees`                   | The tag graph: a tag may have several parents; the generated `@Graph` edges and a tree view    |
| `CalendarEventTag`    | `calendar_event_tags`                              | An event carrying a tag                                                                        |
| `Star`                | `stars`                                            | A star of the HYG catalog, keyed by its Hipparcos number (`hipparcos_number`)                  |
| `Constellation`       | `constellations`                                   | One of the 88 IAU constellations                                                               |
| `ConstellationEdge`   | `constellation_edges`                              | A segment of a constellation's figure (`constellation_id`, `source_node`, `target_node`)       |
| `Measure`             | `measures`                                         | Seeded catalog: a thing measured about a group of events                                       |
| `Metric`              | `metrics`                                          | Seeded catalog: a number shown, and the root of its expression tree                            |
| `MetricExpression`    | `metric_expressions`, `metric_expressions_closure` | Seeded closure-table tree: how a metric is composed                                            |
| `CalendarEventFact`   | `calendar_event_facts`                             | One measure at one filter a row: `filter_id`, `measure_id`, `measurement`                      |
| `Dimension`           | `dimensions`                                       | Seeded catalog: a way events are sliced (name, day, week, month, quarter, year, tag)           |
| `DimensionEdge`       | `dimension_edges`                                  | Seeded `@Graph` edges: a time dimension and the coarser one it rolls up into                   |
| `Group`               | `groups`                                           | Seeded catalog: a set of dimensions (day, tag, day and tag, ...)                               |
| `GroupDimension`      | `group_dimensions`                                 | The dimensions of a group                                                                      |
| `Filter`              | `filters`                                          | A group instantiated: a day, or a tag on a day, each pinning its values                        |
| `CalendarEventTagSet` | `calendar_event_tag_sets`                          | Materialized view: an event's tags as two sorted arrays                                        |

Entities are named by class: the shared naming strategy makes the tables
plural and the columns snake case, so no entity names a table or a schema.

- **Ids are `uuidv7`s the database assigns,** through
  `@codebase/persistence`'s `PostgresqlUpdatableEntity`, for `calendar_events`,
  `tags` and the catalog tables. The expression closure table, the join table, the
  star and constellation catalogs, and the edge tables keep their natural
  keys.
- **`calendar_events` upserts on its natural key,** `(name, start, end,
latitude, longitude)`, so a re-run updates the row it wrote and a second
  place adds rows of its own. It also holds a `note` and the `timezone`.
- **`tags.slug` is the machine-readable name:** `name` lowercased, each run of
  characters outside a-z and 0-9 replaced by one `-`, leading and trailing `-`
  trimmed. It is unique among siblings, by two partial unique indexes beside the
  name's two.
- **`start` and `end` are `timestamptz`,** carried as `Moment`s in UTC by
  `createMomentTransformer`. **Latitude and longitude are `numeric(9,6)`,**
  carried as the text the driver returns, so the key compares exactly.
- **Whole numbers are `bigint`,** read back as numbers.

### Schema decisions

- **`location` and `color` are not columns.** Every one of the 50,113 development events had
  both null: no detector sets them, the CLI only copied `event.location ?? null` and
  `event.color ?? null` through, the web falls back on its tag and type colors when an event
  has none, and a location is already its `latitude` and `longitude`. The iCalendar writer
  emitted `LOCATION` and `COLOR` only when set.
- **The local time is stored.** `start` and `end` stay absolute `timestamptz`, and the zone is
  `timezone`. `start_local_day`, `end_local_day` (`date`) and `start_local_hour` (`smallint`) are
  generated columns, `(start at time zone timezone)::date` and `extract(hour from ...)`, which
  Postgres 18 accepts because `timezone(text, timestamptz)` is immutable (only a `::text` cast is
  refused); the entity marks them `insert: false, update: false`, so nothing writes them. The
  duration minutes, temporality and weekday are computed inline; the expressions are in
  [documentation/metrics-facts.md](documentation/metrics-facts.md).

## The read model

There are no derived tag tables: a tag's parents are the rows of `tag_edges`, its
ancestors and descendants the materialized view `tag_trees` (every path of the
graph walked once, refreshed first by `refreshMetrics`), and an event's tags are
`calendar_event_tags`. A tag with several parents has a depth, a path and a place
among its siblings for each: the API walks every path from the roots, takes the
shortest as a tag's depth where one is needed, and lists the tag under each parent
with one id.

### The metrics facts

Charts, Totals, the Table and the Timeline read two things. `calendar_event_facts`
holds **one measure at one filter a row** (a `filter_id`, a `measure_id` and a
`measurement` in the measure's unit) for the measures that merge across days, over every
stored event. A
`filters` row is a `groups` row (a set of `dimensions`) instantiated: it pins a
`period`, a `tag_id` or an `event_name`, so a local day, or a tag on a day, the
tag's filters all beneath the day's. The materialized
view `calendar_event_tag_sets` holds each event's tags as `tag_ids` (given directly)
and `ancestor_tag_ids`, so a tag filter matches `tag_ids || ancestor_tag_ids`.
`CaelundasDatabaseService.refreshMetrics(manager)` refreshes the view concurrently
and brings the filters and facts up to date, in the caller's transaction when it
has one: a command line ingest ends with it, and
`nx run caelundas-cli:start:refresh-metrics` does so from a shell. The design, the
sizes, the inline local-time expressions, the measures, metrics and expression trees
are in [documentation/metrics-facts.md](documentation/metrics-facts.md), and the
rows of the catalog tables in [documentation/catalog-tables.md](documentation/catalog-tables.md).

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
The one migration, `1795725171000`, creates the whole schema and has its `-up.sql` and
`-down.sql` beside it, linted by `sqlfluff` and checked by `squawk`. Nothing is deployed
yet, so a schema change regenerates it rather than adding another. It carries hand edits
after `generate`: it creates `typeorm_metadata` for the generated columns' and the view's rows (the
generated columns' use `current_database()`), and its files open with the lock and statement timeouts
the other projects' carry. The seed (the measures, the metrics, their expression trees with the
closure rows, then each metric's `expression_id`) and the two functions `expand_keys` and `expand_tags`
and the seed of the dimensions, their edges, the `groups` and the table comment are further additions, placed before the view. The `tag_edges_guard` and `tags_root_guard` triggers (no cycle, no repeated name or slug among siblings or roots) are hand edits too, placed before the closure view.

## Drawing the tag tree

```bash
nx run caelundas-db:render-tag-tree
nx run caelundas-db:render-tag-tree --args="--truncate-depth 2 --output-markdown tags.md --overwrite"
```

The `render-tag-tree` target runs the `persistence` `render-tree-data` command
over `tag.entity.ts`, a `@Graph` entity whose generated `tag_edges` join its own
rows, so a tag with two parents is drawn under each (one node and two edges in the
flowchart, a listing under each parent in the file tree). `render-tag-graph` runs
`render-graph-data` over the same entity and draws the edges alone, arrow from parent
to child. It prints a Mermaid flowchart, or with `--diagram filetree`
Mermaid's beta file tree, which needs Mermaid 11.14 or later. Both
are committed, and the flowchart is the default. `--args` takes the
command's filter, sort, depth, breadth, paging, and output options. A tag's
`icon` and `note` are drawn with its name, and siblings come in their `rank`. The
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
nx run caelundas-db:render-constellation-graph --args="--filter constellationId=UMa"
```

`ConstellationEdge` is a hand-written `@Graph({ directed: false })` edge: each row
joins two stars by Hipparcos number (`source_node`, `target_node`, from
`@GraphSource()` and `@GraphTarget()`) and belongs to a constellation through its
own `constellation_id`, marked `@GraphLabel()`. The generated edge form has no owner
column, since not every graph has subgraphs, so the constellation's figure uses
this form. Callers save a `Constellation` with its `edges`, and read
`Constellation.edges` with `relations`. A star reaches its edges through
`Star.outgoingEdges` and `Star.incomingEdges`. `@GraphLabel()` on
`Constellation.name` titles each figure's box through the relation of
`constellation_id`, and on `Star.hipparcosNumber` labels each star's node through
the relation of `source_node`. The `render-constellation-graph` target
runs the `persistence` `render-graph-data` command over `ConstellationEdge`, with
the same connection variables and `--args` as the tag tree above. Each
connected group of stars is a neighborhood, drawn as its own Mermaid subgraph
titled with its constellation's name, and its lines are drawn without the
label. Constellations that share a star are one neighborhood and keep their
labels on the lines. A single constellation is one neighborhood, so it draws
with no subgraph.

Mermaid draws at most 500 edges and all constellation lines exceed it, so
page with `--limit 31`, which draws every 31 neighborhoods as a diagram of its
own, or add `--page 1`, repeating `--page` for several, to draw only those. Or pick one constellation with
`--filter constellationId=UMa`.

## Committed diagrams

[`tag-tree-flowchart-data.md`](documentation/tag-tree-flowchart-data.md),
[`tag-tree-filetree-data.md`](documentation/tag-tree-filetree-data.md),
[`tag-graph-data.md`](documentation/tag-graph-data.md) and
[`constellation-graph-data.md`](documentation/constellation-graph-data.md)
hold the diagrams of a local database, named `{entity}-{tree|graph}-data.md`,
with the tag tree's `--diagram` between them. Each opens with an index of links and
holds one small diagram per root group (a tag shared by several parents is drawn
once, in orange, with all its parent edges), so none is one tall stack; the file tree
is a plain text tree, a tag under several parents listed once and marked `(also under …)`. Regenerate them with the
connection variables set (`render-tag-graph --args="--output-markdown
projects/caelundas/caelundas-db/documentation/tag-graph-data.md --overwrite"` draws the edges):

```bash
nx run caelundas-db:render-tag-tree --args="--diagram flowchart --output-markdown projects/caelundas/caelundas-db/documentation/tag-tree-flowchart-data.md --overwrite"
nx run caelundas-db:render-tag-tree --args="--diagram filetree --output-markdown projects/caelundas/caelundas-db/documentation/tag-tree-filetree-data.md --overwrite"
nx run caelundas-db:render-constellation-graph --args="--output-markdown projects/caelundas/caelundas-db/documentation/constellation-graph-data.md --overwrite"
```

## Drawing the metric expressions

```bash
nx run caelundas-db:metric-expressions         # rewrite the block from the local database
nx run caelundas-db:metric-expressions:check   # fail when the file differs
```

The `metric-expressions` target runs the `caelundas-cli` `metric-expressions`
command, which reads `metrics` and `metric_expressions` through
`CAELUNDAS_POSTGRES_*` (export them as for the diagrams above) and rewrites the
marker block of
[`metric-expressions.md`](documentation/metric-expressions.md): a table of every
metric's slug, name, unit and expression in infix form, then one Mermaid
flowchart per unit, each metric a small subgraph in rows. Operators are hexagons, measures rectangles named with
their slug, and metrics read by another metric stadiums; each
edge to an operand carries its position. The prose around the markers is yours.
The `check` configuration compares without writing, and like the rest of the
render targets it needs the local database, so it is not a CI gate.

## Test

```bash
nx run caelundas-db:vitest:unit
nx run caelundas-db:vitest:integration   # needs Docker
```

The integration suites start a throwaway Postgres 18, run the real migrations,
insert base rows, refresh, and assert the view's grains, hash, tag columns and
event names, the seeded catalog and trees, and that every metrics rollup answers
each metric as the raw events do.

## Conformetry

This project was generated from the [nestjs-database-project](../../../configuration/ic-suite/conformetry-templates/nestjs-database-project) conformetry template.
