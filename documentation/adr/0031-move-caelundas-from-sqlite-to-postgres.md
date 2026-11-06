# 0031: Move Caelundas from SQLite to Postgres

Completes the Caelundas row of [ADR 0022](0022-give-every-database-project-its-own-database-schema-and-role.md), which named the domain before it had a database. Postgres over a file, the `uuidv7()` ids, and the Testcontainers suites stand as [ADR 0020](0020-store-meanders-in-postgres.md) decided them for Meanderaw.

## Context

Caelundas kept the events it detects in a better-sqlite3 file. The command line wrote it, the web application bundled a copy of it through `@sqlite.org/sqlite-wasm`, and the local day and hour of an event came from two functions registered on each connection, since SQLite knows no time zones. The derived tag tables were rebuilt by a SQL file that only SQLite's dialect could run.

An API now serves the data, so the web application no longer carries a database, and every consumer of the schema runs on the server beside the rest of the workspace's Postgres projects. Keeping a second storage engine meant a second naming scheme, a second test harness, and a second way to write a migration, for rows that no longer travel to a browser.

## Decision

Caelundas stores its data in Postgres, the way [ADR 0022](0022-give-every-database-project-its-own-database-schema-and-role.md) prescribes: the `caelundas_development` database, the `caelundas` schema, and the `caelundas_username` role, read through `CAELUNDAS_POSTGRES_*` only. `caelundas-db`, renamed from `caelundas-entities`, owns the schema. Its database module sits at `src/modules/caelundas-database/` and holds nothing beyond the entities, one migration, and the read model's refresh service; the connection, the command-line data source, the base entities, and the test harness are `@codebase/persistence`'s.

- **Every table's id is a `uuidv7()` the database assigns.** `calendar_events` keeps its natural key, the summary, start, end, latitude, and longitude, as a unique constraint, so a re-run upserts on it rather than minting a duplicate. The tag closure and the star catalog keep their own natural keys, since nothing else identifies a row of either.
- **Instants are `timestamptz` and coordinates are `numeric(9,6)`,** where SQLite held ISO text for both. A transformer carries the instants as the `Moment`s the detectors work in, and the coordinates as the text the driver returns, so the natural key compares exactly.
- **Whole numbers are `bigint`,** because the workspace's migration checks reject `integer`, and a transformer reads them back as numbers.
- **The read model is a view and two tables.** The derived times are a plain `ViewEntity`, named `calendar_event_derived_times`, with the local day and hour computed as `start AT TIME ZONE timezone`, so nothing is registered on a connection. The derived tag tables stay ordinary entities with their own indexes, rebuilt on every ingest by one set-based `INSERT ... SELECT` pair inside the caller's transaction. A materialized view is not used: the tables are rebuilt on every ingest and need row-level indexes, and views made grouped reads far slower.
- **One migration, regenerated against Postgres** and schema-unqualified. It carries two hand edits [ADR 0022](0022-give-every-database-project-its-own-database-schema-and-role.md) did not foresee for a view: it creates `typeorm_metadata`, which TypeORM never does, and it ships the `set lock_timeout` and `set statement_timeout` header the other projects' SQL files carry. No SQLite data is carried over, since none is in production.

**The naming strategy is shared rather than Caelundas's own.** Caelundas entities are named by class, and `@codebase/persistence` now makes the snake-case, plural-table strategy that lexico used the default of every Postgres project, so `CalendarEvent` is `calendar_events` and a join table is named from both plural table names, sorted. Three projects choosing three table-naming rules is the drift [ADR 0022](0022-give-every-database-project-its-own-database-schema-and-role.md) set out to end. The strategy pluralizes an explicit name too, which is why the view is `calendar_event_derived_times`: a singular `calendar_events_derived` would have been pluralized into a name no one would write.

## Consequences

- The star catalog's tables are plural now, `stars`, `constellations`, and `constellation_lines`, and the derived-times view has a new name. Every reader of the old SQLite file, the command line, the API, and the web application, moves to the new names in its own change.
- `nx run caelundas-db:migration:run` builds the schema in the local Compose Postgres, and the suites build it in a throwaway container with the same migration, so a migration that does not run fails a test.
- The `sqlite` module of `@codebase/persistence` has no consumer once the command line and the web application have moved, and a later change deletes it.
