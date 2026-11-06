## Start

The API reads the Caelundas Postgres through `CaelundasDatabaseModule` from `caelundas-db`, so the database must be running and migrated first (`nx run caelundas-db:migration:run`). Copy `.env.default` to `.env`; the `CAELUNDAS_POSTGRES_*` values there match the shared Compose Postgres.

```bash
nx run caelundas-api:start
```

## Test

```bash
nx run caelundas-api:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../../configuration/conformetry-templates/nestjs-graphql-application) conformetry template.

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-api:coinagerie-check:write`.

- **negative**:

<!-- coinagerie:end -->
