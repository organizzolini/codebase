## Start

The API reads the Caelundas Postgres through `CaelundasDatabaseModule` from `caelundas-db`, so the database must be running and migrated first (`nx run caelundas-db:migration:run`). Copy `.env.default` to `.env`; the `CAELUNDAS_POSTGRES_*` values there match the shared Compose Postgres.

```bash
nx run caelundas-api:start
```

The web app calls the API from another origin, so the API answers cross-origin requests, including the `OPTIONS` preflight of a GraphQL POST. `CAELUNDAS_API_CORS_ORIGINS` lists the allowed origins, comma separated; `.env.default` allows the web app's dev server on port 8967, and leaving it unset allows no origin.

## Test

```bash
nx run caelundas-api:vitest
```

## Image

```bash
IMAGE_TAG=local nx run caelundas-api:docker-build
```

The image is `ghcr.io/organizzolini/caelundas-api:<IMAGE_TAG>` for `linux/amd64`, built from the workspace root with `configuration/Dockerfile`. It runs as UID 10001, serves GraphQL on port 3000, and serves Lightship on port 9000, which answers only inside Kubernetes (`KUBERNETES_SERVICE_HOST` set). It runs no migrations, so migrate the database first. Set `CAELUNDAS_API_IMAGE_CA_BUNDLE` to a PEM file to trust a TLS-inspecting proxy during the build.

Size: 1.81 GB (1,811,054,805 bytes) on `node:26.13.1-trixie-slim`, mostly the development dependencies the runtime transpiler and workspace packages need.

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../../configuration/ic-suite/conformetry-templates/nestjs-graphql-application) conformetry template.
