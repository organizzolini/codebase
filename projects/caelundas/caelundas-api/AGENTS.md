# caelundas-api

Serves the astronomical events `caelundas-cli` writes to the Caelundas Postgres to `caelundas-web` over GraphQL, reading them through `CaelundasDatabaseModule` from `@codebase/caelundas-db`. It answers the `health` query, the calendar's events, tag facets, and dataset span, and `nightSky`, which draws the animated star-field backdrop. Runs locally on `CAELUNDAS_API_PORT`; `.env.default` sets 6173.

## Stack

- **GraphQL server**: Apollo Server via `@nestjs/apollo` (`ApolloDriver`).
- **Schema**: code-first, emitted to `src/schema.gql` beside the root module (`GRAPHQL_SCHEMA_FILE`), whatever the working directory; the file is gitignored.
- **Database**: Postgres through `CaelundasDatabaseModule` (`@codebase/caelundas-db`, which wraps the shared `DatabaseModule` from `@codebase/persistence`); no file is opened. Connects as `caelundas_username` to `caelundas_development`.`caelundas` with the `CAELUNDAS_POSTGRES_*` variables, which `environmentSchema` takes from `postgresEnvironmentSchema({ project: "caelundas" })`. Migrations run separately with `nx run caelundas-db:migration:run`.
- **CORS**: `CorsModule` (`modules/cors`) provides the options the bootstrap enables, from `CAELUNDAS_API_CORS_ORIGINS` (comma separated, default empty; `.env.default` lists the web app's dev origins). No origin is allowed until you list one, so a browser app on another origin is refused by default; `*` allows every origin and suits only a public API. The bootstrap calls `app.enableCors(app.get(CorsService).getOptions(...))`: the CORS middleware answers the browser's `OPTIONS` preflight before Apollo sees it, so Apollo's CSRF prevention, which would answer it with 400, never runs.

## Modules

- `cors/` — works out the CORS options the browser's preflight is answered with (`CorsService`).
- `events/` — reads the calendar's events, tag facets, and dataset span (`EventsService`).
- `health/` — the health check query every API here answers (`HealthService`).
- `night-sky/` — serves the night sky (`NightSkyService`). It holds the stars and constellation figures in memory, read once at startup from the rows `caelundas-cli night-sky` ingests into Postgres, so no request pays to query them. Its inner modules build the picture: `astronomy/` (ecliptic, projection, and sidereal time), `drawing/` (stars, lines, colors, SVG, and view), and `options/` (the input and measurements a request carries).

## Infrastructure

`infrastructure/terraform/namespace` is the Terraform module that creates the `caelundas` namespace every Caelundas workload (api, web, cli, and the database Secret) runs in, since the Argo CD applications do not set `CreateNamespace`. The `organizzolini` root in the `infrastructure` project instantiates it.
