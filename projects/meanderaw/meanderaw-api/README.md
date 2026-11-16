## Start

The API reads the Meanderaw Postgres through `MeanderawDatabaseModule` from `meanderaw-db`, so the database must be running and migrated first (`nx run meanderaw-db:migration:run`). Copy `.env.default` to `.env`; the `MEANDERAW_POSTGRES_*` values there match the shared Compose Postgres.

```bash
nx run meanderaw-api:start
```

The web app calls the API from another origin, so the API answers cross-origin requests, including the `OPTIONS` preflight of a GraphQL POST. `MEANDERAW_API_CORS_ORIGINS` lists the allowed origins, comma separated; `.env.default` allows the web app's dev server on port 2161, and leaving it unset allows every origin (`*`).

## Test

```bash
nx run meanderaw-api:vitest
```

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../configuration/conformetry-templates/nestjs-graphql-application) conformetry template.
