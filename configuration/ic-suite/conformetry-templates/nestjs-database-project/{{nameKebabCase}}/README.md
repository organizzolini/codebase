# {{namePascalCase}}: NestJS Database Project

## Quick Start

**Type**: Node.js database package (NestJS + TypeORM + PostgreSQL)

**Purpose**: <!-- Briefly describe the database package and its entities -->

## Development

### Entities and migrations

Keep entity classes under `src/` with one `*.entity.ts` file per entity. Add
each entity to `{{databaseEntitiesConstant}}` in
`src/modules/{{databaseModuleName}}/data-source.constants.ts`; the shared
`createDataSource` helper reads this list for TypeORM's migration commands.
Keep migrations under `migrations/`. They are never run or synchronized on
application startup.

### Entity relationship diagram

The ERD is generated from every TypeORM entity file under `src/`. Do not edit
the diagram between its markers by hand.

```bash
nx run {{nameKebabCase}}:erd:write
nx run {{nameKebabCase}}:erd:check
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
- [src/modules/{{databaseModuleName}}/data-source.constants.ts](src/modules/{{databaseModuleName}}/data-source.constants.ts): Entity list and CLI data source
- [src/modules/{{databaseModuleName}}/{{databaseModuleName}}.module.ts](src/modules/{{databaseModuleName}}/{{databaseModuleName}}.module.ts): NestJS database module
- [src/modules/{{databaseModuleName}}/{{databaseModuleName}}.service.ts](src/modules/{{databaseModuleName}}/{{databaseModuleName}}.service.ts): Database service
- [documentation/erd.md](documentation/erd.md): Generated ERD
