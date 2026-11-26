# CaelundasDb: NestJS Database Project

## Database source

- Keep one TypeORM entity per `*.entity.ts` file under `src/`.
- Register entities in `DATABASE_ENTITIES` in
  `src/modules/database/data-source.constants.ts`.
- Keep project migrations under `migrations/`; the runtime never runs or
  synchronizes them.
- **Exception:** `DatabaseModule` applies the pending migrations at start, under
  an advisory lock, reading the `CAELUNDAS_DATABASE_MIGRATIONS` glob, so every
  migration must stay a file an image can build.
  Migrations must stay expand-only, since old pods run while the first new
  pod migrates. The squash re-timestamped the schema, so reset a local database
  that applied the earlier three with `nx run infrastructure:postgres:recreate`.
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
  modules/database/                      # The database module
    database.module.ts                   # CaelundasDatabaseModule
    database.service.ts                  # isConnected, refreshReadModel
    database.constants.ts                # Project, coordinate scale, read model SQL
    database.utilities.ts                # Value transformers
    data-source.constants.ts             # Entities, migrations, databaseDataSource
    modules/                             # One *.entity.ts per table or view, by domain
migrations/                              # The migrations, each with its .sql pair
```

## Rules

- **Every table's id is a database-assigned `uuidv7`,** except the tag closure, the join
  table, the star catalog and the derived tables, which keep natural keys.
- **`calendar_events` upserts on its natural key** `(summary, start, end, latitude,
  longitude)`; never insert an event without it.
- **Instants are `timestamptz`, coordinates `numeric(9,6)`, whole numbers `bigint`.** Each
  has a transformer in `database.utilities.ts`; `squawk` rejects `integer`.
- **The derived-times view needs no refresh;** the two derived tag tables are rebuilt by
  `refreshReadModel(manager)` in the caller's transaction. A view's name is not
  pluralized into sense: `calendar_event_derived_times` is already plural.
- **One migration is the whole schema.** It creates the tables, the derived
  tables and the view, and sets the role's default `search_path`, which
  PgBouncer drops from the startup parameters. Nothing was in production when
  the earlier three were squashed into it, and `pg_dump --schema-only` of the
  old chain and of the new migration were identical. Add the next one with
  `nx run caelundas-db:migration:generate`; never edit the generated SQL
  otherwise.

## Commands

```bash
nx run caelundas-db:typecheck-code,lint-code,format-code,deprecate-code,guard-code
nx run caelundas-db:vitest:unit
nx run caelundas-db:vitest:integration   # Docker: a Testcontainers Postgres runs the real migration
nx run caelundas-db:migration:generate   # Needs the shared Postgres or any with the caelundas role
```

See the [write-tests skill](../../../.agents/skills/write-tests/SKILL.md) and the
[write-typescript skill](../../../.agents/skills/write-typescript/SKILL.md).
