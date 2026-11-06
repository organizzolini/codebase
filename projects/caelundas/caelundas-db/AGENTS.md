# CaelundasDatabase: Postgres Schema Library

## Quick Start

**Type**: NestJS library (`type:package`), published to no registry

**Purpose**: The Postgres schema Caelundas shares: entities, one migration,
the derived-times view, and the refresh service for the derived tag tables.
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
  modules/caelundas-database/            # The database module, per ADR 0022
    caelundas-database.module.ts         # CaelundasDatabaseModule
    caelundas-database.service.ts        # isConnected, refreshReadModel
    caelundas-database.constants.ts      # Project, coordinate scale, read model SQL
    caelundas-database.utilities.ts      # Value transformers
    data-source.constants.ts             # Entities, migrations, caelundasDataSource
    entities/                            # One *.entity.ts per table or view
    migrations/                          # The one migration and its .sql pair
```

## Rules

- **Every table's id is a database-assigned `uuidv7`,** except the tag closure, the join
  table, the star catalog and the derived tables, which keep natural keys.
- **`calendar_events` upserts on its natural key** `(summary, start, end, latitude,
  longitude)`; never insert an event without it.
- **Instants are `timestamptz`, coordinates `numeric(9,6)`, whole numbers `bigint`.** Each
  has a transformer in `caelundas-database.utilities.ts`; `squawk` rejects `integer`.
- **The derived-times view needs no refresh;** the two derived tag tables are rebuilt by
  `refreshReadModel(manager)` in the caller's transaction. A view's name is not
  pluralized into sense: `calendar_event_derived_times` is already plural.
- **One migration.** Regenerate it with `nx run caelundas-db:migration:generate` against
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
