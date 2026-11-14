## Start

The API reads the Meanderaw Postgres through `MeanderawDatabaseModule` from `meanderaw-db`, so the database must be running and migrated first (`nx run meanderaw-db:migration:run`). Copy `.env.default` to `.env`; the `MEANDERAW_POSTGRES_*` values there match the shared Compose Postgres.

```bash
nx run meanderaw-api:start
```

## Test

```bash
nx run meanderaw-api:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../configuration/conformetry-templates/nestjs-graphql-application) conformetry template.
