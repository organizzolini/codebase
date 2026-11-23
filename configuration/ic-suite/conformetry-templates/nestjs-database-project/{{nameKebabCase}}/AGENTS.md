# {{namePascalCase}}: NestJS Database Project

## Database source

- Keep one TypeORM entity per `*.entity.ts` file under `src/`.
- Register entities in `{{databaseEntitiesConstant}}` in
  `src/modules/{{databaseModuleName}}/data-source.constants.ts`.
- Keep project migrations under `migrations/`; the runtime never runs or
  synchronizes them.
- Preserve project-specific entities and migrations when updating shared
  configuration.

## ERD

Run `nx run {{nameKebabCase}}:erd:write` to update
`documentation/erd.md`. Run `nx run {{nameKebabCase}}:erd:check` to verify it.
Do not edit the generated content between the PostgreSQL ERD markers.
