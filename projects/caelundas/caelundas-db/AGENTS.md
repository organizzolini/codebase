# CaelundasDb: NestJS Database Project

## Database source

- Keep one TypeORM entity per `*.entity.ts` file under `src/`.
- Register entities in `DATABASE_ENTITIES` in
  `src/modules/database/data-source.constants.ts`.
- Keep project migrations under `migrations/`; the runtime never runs or
  synchronizes them.
- Preserve project-specific entities and migrations when updating shared
  configuration.

## Entity relationship diagram

Run `nx run caelundas-db:erd:write` to update
`documentation/entity-relationship-diagram.md`. Run
`nx run caelundas-db:erd:check` to verify it. Do not edit the generated
content between the PostgreSQL entity relationship diagram markers.

## CaelundasDatabase: Postgres Schema Library

## Quick Start

**Type**: NestJS library (`type:package`), published to no registry

**Purpose**: The Postgres schema Caelundas shares: entities, the migration, the metrics
catalog tables, and the refresh service for the metrics facts.
`caelundas-cli` writes through it and `caelundas-api` reads through it.

## Architecture Overview

- **Framework**: NestJS + TypeORM, on `@codebase/persistence`: `DatabaseModule.forRoot`,
  `createDataSource`, `PostgresqlUpdatableEntity`, and the Testcontainers harness behind
  `@codebase/persistence/testing`. This project owns no connection logic.
- **Database**: `caelundas_development`.`caelundas` as `caelundas_username`, read through
  `CAELUNDAS_POSTGRES_*` only. No SQLite, and nothing registered on a connection.
- **Naming**: entities are named by class and never name a table; the shared plural
  snake-case strategy in `persistence` makes `CalendarEvent` the table `calendar_events`.
  Do not write a naming strategy here.

```text
src/
  index.ts                               # Public exports
  modules/database/                      # The database module
    database.module.ts                   # CaelundasDatabaseModule
    database.service.ts                  # isConnected, refreshMetrics
    database.constants.ts                # Project and coordinate scale
    database.utilities.ts                # Value transformers
    data-source.constants.ts             # Entities, migrations, databaseDataSource
    modules/                             # One *.entity.ts per table or view, by domain
      metrics/                           # Facts, filters, groups, dimensions and the tag sets
      metric-catalog/                    # Measures, metrics and their expression trees
migrations/                              # The migrations, each with its .sql pair
```

## Rules

- **Every table's id is a database-assigned `uuidv7`,** except the expression closure table, the
  join table, the star and constellation catalogs and the edge tables, which keep
  natural keys.
- **The tags are a directed acyclic graph.** `Tag` is `@Graph({ edge: "TagEdge", nodes: () => Tag })`,
  so `tag_edges` (`source_node` the parent, `target_node` the child, primary key the pair, cascading) is
  generated, never hand-written. A tag with no incoming edge is a root; a tag may have several parents
  (Venus is under Planet / Personal and under Planet / Benefic, Aries under Sign / Sign, Fire, Cardinal and Positive). `tags.parent_id` and TypeORM's `@Tree` closure
  table are gone. `tag_trees` is a materialized view, `(ancestor_id, descendant_id)` over a recursive
  walk of every path with the tag itself included and each pair once, refreshed first (concurrently) by
  `refreshMetrics`; read ancestors and descendants from it, never from a path. A `tag_edges_guard`
  trigger refuses an edge that closes a cycle, joins a tag to itself or gives a parent two children of
  one name or slug, and a deferred `tags_root_guard` constraint trigger refuses two roots of one name or
  slug. Both are hand edits of the migration, since the entity cannot declare them.
- **`calendar_events` upserts on its natural key** `(name, start, end, latitude,
longitude)`; never insert an event without it. Its columns are `name`, `note`, `start`,
  `end`, `timezone`, `latitude`, `longitude`; `location` and `color` were dropped (no
  producer set them and nothing needs them), and `start`/`end` are absolute instants whose
  zone is `timezone`.
- **`tags.slug` is the machine-readable name,** `name` lowercased, each run of characters
  outside a-z and 0-9 replaced by one `-`, leading and trailing `-` trimmed (`Forming` is
  `forming`, `Cross-Quarter Day` is `cross-quarter-day`), unique among siblings like the
  name, by the two guard triggers (the same name may repeat elsewhere in the tree).
- **`tags.is_filterable`, `is_groupable`, `is_sortable` and `is_selectable` say what the web's menus offer,**
  `boolean not null default true` each, one set per tag whatever number of parents it has. They never say what
  is valid: a saved link or preset that filters, groups, sorts or selects a tag whose flag is false still works.
  `caelundas-cli` declares them (`TAG_MENU_EXCLUSIONS`) and `TagsService` writes them on create and updates them
  on a rerun.
- **Renames to know:** `stars.hip` is `hipparcos_number`; `constellations.zodiac` is
  `is_zodiac`; `constellation_edges` has `constellation_id` (its owner), and `source_node` and
  `target_node`, the `@Graph` decorator's defaults; it is a hand-written edge entity because the
  generated form has no owner column.
- **Instants are `timestamptz`, coordinates `numeric(9,6)`, whole numbers `bigint`.** Each
  has a transformer in `database.utilities.ts`; `squawk` rejects `integer` in a table.
- **`calendar_events` stores its local time.** `start_local_day` and `end_local_day` (`date`) and
  `start_local_hour` (`smallint`) are `GENERATED ALWAYS AS (...) STORED` from `start`/`end` `at time zone
timezone` (Postgres 18 treats `timezone(text, timestamptz)` as immutable), declared on the entity with
  `generatedType: "STORED"`, `asExpression`, `insert: false` and `update: false`, so no insert, upsert or
  update ever writes them (the CLI's upsert names its columns). `start_local_day` is indexed. The weekday is
  `extract(dow from start_local_day)`; duration minutes and temporality are computed inline (see
  [documentation/metrics-facts.md](documentation/metrics-facts.md)). TypeORM keeps each generated column's
  expression in `typeorm_metadata`, which the migration fills with `current_database()` so the rows match
  whatever database it runs in. There are no `tag_nodes` or `calendar_event_tag_nodes` tables: read a tag's
  depth, root, path and rank from `tags`, `tag_edges` and `tag_trees`; a tag with several parents has
  a path for each, and a depth means the shortest.
- **`calendar_event_facts` is one measure at one filter a row,** `(filter_id, measure_id, measurement)`, in the
  unit of the measure, a plain table `refreshMetrics(manager)` brings up to date (upsert the new or changed,
  delete the gone; a refresh that changes nothing writes nothing). Only the measures that merge across days are
  stored (`events`, `perfective-events`, `progressive-events`, `duration`, `first-start`,
  `last-start`; a zero has no row), over every stored event, and never the six that do not
  (`unique-names`, `unique-tags`, `covered-duration`, the longest, shortest and median progressive duration),
  which the API reads from the events. A perfective event lasts no minutes and every other event is
  progressive, so the old `progressive-duration` equalled `duration` and was merged into it. `dimensions` are
  the ways events are sliced (`name`, `day`, `week`, `month`, `quarter`, `year`, `tag`); the time ones are a
  graph in `dimension_edges` (a `@Graph` edge: day to week and month, month to quarter, quarter to year), and
  `tag` is flat, its values the rows of `tags`. `groups` are sets of dimensions (`group_dimensions`), one
  dimension each for now, and stay a table for the dimensions that will not mirror a group. `filters`
  instantiate a group by pinning a `period`, a `tag_id` or an `event_name` (never a copied name): a day
  filter has no parent, and a tag filter sits beneath its day's filter and carries the day's `period` so a
  window is an index range; tag filters are not nested, since a tag may have several parents.
- **`calendar_event_tag_sets` is the materialized view the event path reads,** an event's `tag_ids` and
  `ancestor_tag_ids` as sorted GIN-indexed arrays, refreshed concurrently first. Filtering by a tag matches
  `tag_ids || ancestor_tag_ids`. Everything else an event row needs comes from `calendar_events`. The groups,
  filters, columns, sizes and the catalog are in [documentation/metrics-facts.md](documentation/metrics-facts.md)
  and [documentation/catalog-tables.md](documentation/catalog-tables.md); keep them current when they change.
  A view's `@Index` is created by the migration like a table's.
- **Two plpgsql functions give the planner honest row counts.** `expand_keys(text[])` (`ROWS 2`) expands the
  keys of a level into one row, or one null row for none, and `expand_tags(uuid[])` (`ROWS 6`) expands an
  array of tags. The API's metrics statements call them in place of `unnest` over a computed array, whose
  estimate of ten rows each multiplied level by level into millions and sent the planner to disk sorts, merge
  joins and JIT. They are plpgsql so Postgres does not inline them and lose the estimate; they live in the
  migration beside the view.
- **`measures`, `metrics` and `metric_expressions` are seeded reference data.** `measures` and
  `metrics` are catalogs (`slug`, `name`, `icon`, `note`, `unit`), a metric's `expression_id`
  roots its closure-table expression tree (no owner column, a `metric` node reads another metric
  through `metric_id`), and which facts column or aggregate a measure uses lives in the API's
  registry keyed by `slug`.
- **One migration, `1795725171000`, creates the whole schema,** the functions, the triggers, the tag trees and tag sets views and the seed included. Nothing is
  deployed yet, so a schema change regenerates it: empty the migrations, run
  `nx run caelundas-db:migration:generate` against an empty local Postgres
  (schema-unqualified), then apply the hand edits the README lists. Never edit the
  generated SQL otherwise.

- **`documentation/metric-expressions.md` is generated** between its markers by
  `nx run caelundas-db:metric-expressions` (the `caelundas-cli` `metric-expressions` command, kept
  there because this project's callidescope limits leave no room for it) from the local database
  (`:check` compares); do not edit the block, and rewrite it when a metric or its expression changes.

## Commands

```bash
nx run caelundas-db:typecheck-code,lint-code,format-code,deprecate-code,guard-code
nx run caelundas-db:vitest:unit
nx run caelundas-db:vitest:integration   # Docker: a Testcontainers Postgres runs the real migration
nx run caelundas-db:migration:generate   # Needs the shared Postgres or any with the caelundas role
```

See the [write-tests skill](../../../.agents/skills/write-tests/SKILL.md) and the
[write-typescript skill](../../../.agents/skills/write-typescript/SKILL.md).
