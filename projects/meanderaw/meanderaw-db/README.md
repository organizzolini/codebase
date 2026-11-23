# MeanderawDb: NestJS Database Project

## Quick Start

**Type**: Node.js database package (NestJS + TypeORM + PostgreSQL)

**Purpose**: A Node.js package containing the MeanderawDb database schema and migrations.

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
nx run meanderaw-db:erd:write
nx run meanderaw-db:erd:check
```

See [documentation/entity-relationship-diagram.md](documentation/entity-relationship-diagram.md) for the generated diagram.

## Key Files

- [project.json](project.json): Nx targets and project tags
- [src/modules/database/data-source.constants.ts](src/modules/database/data-source.constants.ts): Entity list and CLI data source
- [src/modules/database/database.module.ts](src/modules/database/database.module.ts): NestJS database module
- [src/modules/database/database.service.ts](src/modules/database/database.service.ts): Database service
- [documentation/entity-relationship-diagram.md](documentation/entity-relationship-diagram.md): Generated entity relationship diagram

## Conformetry

This project was generated from the [nestjs-database-project](../../../configuration/ic-suite/conformetry-templates/nestjs-database-project) conformetry template.

## 🌌 Meanderaw Database

**The meander's shape.** The Postgres schema for
[meanderaw-cli](../meanderaw-cli/README.md) and the apps that read the meanders: the TypeORM
entities for a meander row, the catalog of characteristics, and the bridge between them,
and the migrations that build their tables.

The tables are built by migration, never by synchronizing. Run
`nx run meanderaw-db:migration:run` before the first draw run, and again whenever a new
migration lands.
