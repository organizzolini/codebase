# MeanderawDb: NestJS Database Project

## Quick Start

**Type**: Node.js database package (NestJS + TypeORM + PostgreSQL)

**Purpose**: <!-- Briefly describe the database package and its entities -->

## Development

### Entities and migrations

Keep entity classes under `src/` with one `*.entity.ts` file per entity. Add
each entity to `MEANDERAW_DATABASE_ENTITIES` in
`src/modules/meanderaw-database/data-source.constants.ts`; the shared
`createDataSource` helper reads this list for TypeORM's migration commands.
Keep migrations under `migrations/`. They are never run or synchronized on
application startup.

### Entity relationship diagram

The ERD is generated from every TypeORM entity file under `src/`. Do not edit
the diagram between its markers by hand.

```bash
nx run meanderaw-db:erd:write
nx run meanderaw-db:erd:check
```

See [documentation/erd.md](documentation/erd.md) for the generated diagram.

## Template lineage

This standalone template keeps the common scaffold files from
[`nestjs-service-project`](../nestjs-service-project) in step. It intentionally
differs in this README and `AGENTS.md`, the `package.json` database dependencies,
and the `project.json` TypeORM tags and ERD target. It adds the data source,
database module and service, and ERD marker document; it does not replace
project-specific entities or migrations.

## Key Files

- [project.json](project.json): Nx targets and project tags
- [src/modules/meanderaw-database/data-source.constants.ts](src/modules/meanderaw-database/data-source.constants.ts): Entity list and CLI data source
- [src/modules/meanderaw-database/meanderaw-database.module.ts](src/modules/meanderaw-database/meanderaw-database.module.ts): NestJS database module
- [src/modules/meanderaw-database/meanderaw-database.service.ts](src/modules/meanderaw-database/meanderaw-database.service.ts): Database service
- [documentation/erd.md](documentation/erd.md): Generated ERD

## 🌌 Meanderaw Database

**The meander's shape.** The Postgres schema for
[meanderaw-cli](../meanderaw-cli/README.md) and the apps that read the meanders: the TypeORM
entities for a meander row, the catalog of characteristics, and the bridge between them,
and the migrations that build their tables.

The tables are built by migration, never by synchronizing. Run
`nx run meanderaw-db:migration:run` before the first draw run, and again whenever a new
migration lands.
