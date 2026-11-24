# {{namePascalCase}}: NestJS Database Project

## Quick Start

**Type**: Node.js database package (NestJS + TypeORM + PostgreSQL)

**Purpose**: A Node.js package containing the {{namePascalCase}} database schema and migrations.

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
nx run {{nameKebabCase}}:erd:write
nx run {{nameKebabCase}}:erd:check
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
