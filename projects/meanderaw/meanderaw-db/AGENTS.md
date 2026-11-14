# MeanderawDatabase: Postgres Schema Library

## Quick Start

**Type**: NestJS library (`type:package`), published to no registry

**Purpose**: The Postgres schema meanderaw shares: the `Meander` entity, its
migrations, and the service that persists and reads meander rows.
`meanderaw-cli` writes through it, and the apps that read the meanders will too.

## Architecture Overview

- **Framework**: NestJS + TypeORM, on `@codebase/persistence`: `DatabaseModule.forRoot`,
  `createDataSource`, `PostgresqlUpdatableEntity`, and the Testcontainers harness behind
  `@codebase/persistence/testing`. This project owns no connection logic.
- **Database**: `meanderaw_development`.`meanderaw` as `meanderaw_username`, read through
  `MEANDERAW_POSTGRES_*` only.
- **Naming**: entities are named by class; the shared snake-case strategy in `persistence`
  makes `Meander` the table `meanders`. Do not write a naming strategy here.

```text
src/
  index.ts                               # Public exports
  modules/meanderaw-database/            # The database module, per ADR 0022
    meanderaw-database.module.ts         # MeanderawDatabaseModule
    meanderaw-database.service.ts        # Save, read, and count meander rows
    meanderaw-database.constants.ts      # Project, insert chunk size, bigint transformer
    meanderaw-database.types.ts          # Record, shape, and count types
    data-source.constants.ts             # Entities, migrations, meanderawDataSource
    entities/                            # One *.entity.ts per table
    migrations/                          # Migrations and their .sql pairs
testing/
  meanders.ts                            # meanderRecord fixture for the tests
```

## Rules

- **Migrations build the schema, never synchronization.** Change `Meander`, then run
  `nx run meanderaw-db:migration:generate` and `nx run meanderaw-db:migration:run`.
- **Migration timestamps never change.** A migration that has run is history.
- **The package has no dependency on `meanderaw-cli`.** Evaluator types stay in the CLI;
  the characteristics column is typed loosely here until #2277 replaces it.

## Commands

```bash
nx run meanderaw-db:migration:run        # Build or update the meanders table
nx run meanderaw-db:migration:generate   # Write the next migration after an entity change
nx run meanderaw-db:vitest:integration   # Integration tests against a Postgres container
```
