# LexicoDb: NestJS Database Project

## Database source

- Keep one TypeORM entity per `*.entity.ts` file under `src/`.
- Register entities in `LEXICO_DATABASE_ENTITIES` in
  `src/modules/database/data-source.constants.ts`.
- Keep project migrations under `migrations/`; the runtime never runs or
  synchronizes them.
- Preserve project-specific entities and migrations when updating shared
  configuration.

## ERD

Run `nx run lexico-db:erd:write` to update
`documentation/erd.md`. Run `nx run lexico-db:erd:check` to verify it.
Do not edit the generated content between the PostgreSQL ERD markers.
