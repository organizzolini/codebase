## Start

The API reads the Caelundas Postgres through `CaelundasDatabaseModule` from `caelundas-db`, so the database must be running. The API applies the pending migrations when it starts, before it signals ready; `nx run caelundas-db:migration:run` does the same by hand. Copy `.env.default` to `.env`; the `CAELUNDAS_POSTGRES_*` values there match the shared Compose Postgres.

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
IMAGE_TAG=local nx run caelundas-api:docker:build   # loads the image into the local Docker
IMAGE_TAG=1.2.3 nx run caelundas-api:docker:push    # one buildx build --push
```

The image is `ghcr.io/organizzolini/caelundas-api:<IMAGE_TAG>` for `linux/amd64`, built from the workspace root with the shared [application/Dockerfile](../../../infrastructure/docker/application/Dockerfile), which [infrastructure/image.env](infrastructure/image.env) configures. It runs as UID 10001 under `tini`, serves GraphQL on port 6173, the API's development port from `configuration/.env.default`, and serves Lightship on port 9000, which answers only inside Kubernetes (`KUBERNETES_SERVICE_HOST` set). It declares no `HEALTHCHECK`: Kubernetes ignores it and probes Lightship. The API applies the pending migrations when it starts, before it signals ready, under a Postgres advisory lock. Replicas starting together therefore migrate one at a time, and a restart applies nothing. Set `IMAGE_CA_BUNDLE` to a PEM file to trust a TLS-inspecting proxy during the build. The target is never cached: a Docker build has no file outputs Nx could restore, and a push is a side effect.

Size: 563 MB (563,369,516 bytes) on `node:26.13.1-trixie-slim`, down from 1.81 GB (1,811,054,805 bytes). The build stage bundles the API and its workspace packages with rolldown (`nx run caelundas-api:bundle`, to `dist/<project>` at the workspace root), one file per module at its source path so the migrations stay files, and the image ships only that output, `tini`, and a `node_modules` of the production packages it imports: no transpiler, TypeScript, or test tooling.

## 👔 Conformetry

This project was generated from the [nestjs-graphql-application](../../../configuration/ic-suite/conformetry-templates/nestjs-graphql-application) conformetry template.
