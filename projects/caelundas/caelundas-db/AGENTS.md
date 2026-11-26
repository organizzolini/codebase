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

**Purpose**: The Postgres schema Caelundas shares: entities, the migrations,
the derived-times view, and the refresh service for the metrics view.
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
    database.constants.ts                # Project, coordinate scale, metrics view refresh
    database.utilities.ts                # Value transformers
    data-source.constants.ts             # Entities, migrations, databaseDataSource
    modules/                             # One *.entity.ts per table or view, by domain
      metrics/                           # The one materialized view the metrics read
migrations/                              # The migrations, each with its .sql pair
```

## Rules

- **Every table's id is a database-assigned `uuidv7`,** except the tag closure, the join
  table, the star catalog and the derived tables, which keep natural keys.
- **`calendar_events` upserts on its natural key** `(summary, start, end, latitude,
  longitude)`; never insert an event without it.
- **Instants are `timestamptz`, coordinates `numeric(9,6)`, whole numbers `bigint`.** Each
  has a transformer in `database.utilities.ts`; `squawk` rejects `integer`.
- **The derived-times view needs no refresh;** the one metrics materialized view is refreshed
  concurrently by `refreshMetrics(manager)`, in the caller's transaction when it has one. A
  view's name is not pluralized into sense: `calendar_event_derived_times` is already plural.
  There are no `tag_nodes` or `calendar_event_tag_nodes` tables: read a tag's depth, root, path
  and rank from `tags` and `tags_closure`, and an event's tags from `calendar_event_tags`.
- **`calendar_event_facts` is the one table Charts and Totals read,** a
  `@ViewEntity({ materialized: true })` built with `GROUPING SETS`. Its `filter` column names the
  grain of each row (`event`, `day`, `day-tag`, `day-tag-name`), every query must pin it
  (`filter = 'day-tag'`), and every index leads with it. `is_phase_boundary` is in every grain's
  key. The unique key a concurrent refresh needs is the not-null `row_key` (a hash of the grain's
  keys): a unique index over nullable key columns, even `NULLS NOT DISTINCT`, makes the refresh
  delete and reinsert every row. The grains, columns, indexes and the SQL for every metric are in
  [documentation/metrics-facts.md](documentation/metrics-facts.md); keep it current when the
  view changes. A view's `@Index` is created by the migration like a table's, and TypeORM compares
  only an index's name, so the `where` of a partial index lives in the migration too.
- **Migration `1795568633626` creates the view,** and `1795631900000` drops the two derived tag
  tables the baseline created (its `down` recreates them empty).
- **The first migration is the baseline,** and the second replaces
  `constellation_lines` with the generated `constellation_edges`. Regenerate the first with `nx run caelundas-db:migration:generate` against
  an empty local Postgres (schema-unqualified), then apply the two hand edits the README
  lists. Never edit the generated SQL otherwise.

## Commands

```bash
nx run caelundas-db:typecheck-code,lint-code,format-code,deprecate-code,guard-code
nx run caelundas-db:vitest:unit
nx run caelundas-db:vitest:integration   # Docker: a Testcontainers Postgres runs the real migration
nx run caelundas-db:migration:generate   # Needs the shared Postgres or any with the caelundas role
```

See the [testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md) and the
[write-typescript skill](../../../.agents/skills/write-typescript/SKILL.md).
