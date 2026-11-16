# MeanderawApi: NestJS GraphQL API

## Quick Start

**Type**: Node.js HTTP API server (NestJS + Apollo GraphQL)

**Purpose**: Serve the meanders `meanderaw-cli` writes to the Meanderaw Postgres over GraphQL, reading them through `MeanderawDatabaseModule` from `@codebase/meanderaw-db` and drawing them through `@codebase/meanderaw-core`. Runs locally on `MEANDERAW_API_PORT` (default 8367).

### Run Locally

```bash
cp .env.default .env  # Fill in required environment variables
nx run meanderaw-api:start
```

The database must be running and migrated first (`nx run meanderaw-db:migration:run`).

## Architecture Overview

### Tech Stack

- **Framework**: NestJS (modules, dependency injection, providers)
- **GraphQL server**: Apollo Server via `@nestjs/apollo` (`ApolloDriver`)
- **Schema strategy**: Code-first, emitted to `src/schema.gql` beside the root module (`GRAPHQL_SCHEMA_FILE`); the file is gitignored
- **Pagination**: Relay-shaped connections built by the `Paginated` mixin and `createConnection` in `meanderaw-api.utilities.ts`, paged by keyset cursor (never `OFFSET`)
- **Database**: Postgres through `MeanderawDatabaseModule` (`@codebase/meanderaw-db`); services read it through TypeORM repositories
- **Drawing**: `@codebase/meanderaw-core`'s `CodeService` and `DrawingService`, called by the `Meander.svg` field resolver
- **Validation**: Zod, at the boundary — `environmentSchema` for the environment, `meandersArgumentsSchema` and `cursorSchema` for a query
- **Logging**: `@codebase/observability`'s `LoggerService`
- **Language**: Strict TypeScript

### Execution Flow

```text
src/meanderaw-api.ts
  └─ NestFactory.create(MeanderawApiModule)
       ├─ GraphQLModule.forRoot(ApolloDriver)
       ├─ MeanderawDatabaseModule
       ├─ CharacteristicsModule → CharacteristicsResolver → CharacteristicsService
       ├─ MeandersModule → MeandersResolver → MeandersService
       └─ MeanderGroupsModule → MeanderGroupsResolver → MeanderGroupsService
```

### Directory Layout

```text
src/
  meanderaw-api.ts            # Bootstrap — do not modify
  meanderaw-api.module.ts     # Root module
  meanderaw-api.constants.ts  # environmentSchema, GRAPHQL_SCHEMA_FILE
  meanderaw-api.entities.ts   # PageInfo
  meanderaw-api.types.ts      # Connection and Edge types
  meanderaw-api.utilities.ts  # Paginated mixin, createConnection, cursor encoding
  modules/
    characteristics/          # `characteristics`: the catalog with per-value counts
    meanders/                 # `meanders` and `Meander.svg`
      meanders.service.ts     #   keyset paging, sorting, total, drawing
      meander-sort.entities.ts, sort-direction.entities.ts, meanders.entities.ts, meander-connection.entities.ts
      meanders.constants.ts   #   limits and the Zod schemas
testing/
  meanderaw-application.ts    # Serves modules over HTTP from a migrated, seeded Postgres
  fixtures.ts                 # catalogEntry, meanderRow
  golden-svg.ts               # The SVG the CLI draws for two Codes, one with dots
```

## Development

### Adding Domain Modules

Scaffold with the `nestjs-service-module` template, then add the resolver and entities, and register the module in `meanderaw-api.module.ts`. Keep one class per file: GraphQL entities, inputs and enums each go in a `*.entities.ts` file; constants files hold only `const` declarations, including Zod schemas.

### Sorting and Paging

- A sort names a shape field or a characteristic key. A missing characteristic value sorts as 0 or false (a left join on the bridge's primary key), and ties break by id ascending.
- A cursor carries the sort field, direction, last value and id. A cursor used with a different sort is refused with a 400, never answered with a wrong page.
- `totalCount` is the sum of `shape_counts`, or an exact count of `meanders` while no aggregate has run.

### Key Commands

Always prefer running tasks through Nx rather than calling the underlying tools directly.

```bash
nx run meanderaw-api:start           # Start the GraphQL API server
nx run meanderaw-api:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run meanderaw-api:codometer       # Size and comment-budget limits
```

### Testing

```bash
nx run meanderaw-api:vitest:unit          # Pure logic, mocked DI
nx run meanderaw-api:vitest:end-to-end    # Full GraphQL requests against a migrated Postgres container
```

| Tier       | File pattern           | What to test                                                  |
| ---------- | ---------------------- | ------------------------------------------------------------- |
| Unit       | `*.unit.test.ts`       | Resolver and service methods with mocked deps                 |
| End-to-end | `*.end-to-end.test.ts` | GraphQL request/response cycles against a seeded database     |

See the [testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

## Key Files

- [src/meanderaw-api.module.ts](src/meanderaw-api.module.ts): Root module
- [src/modules/meanders/meanders.service.ts](src/modules/meanders/meanders.service.ts): Keyset paging and drawing
- [testing/meanderaw-application.ts](testing/meanderaw-application.ts): End-to-end harness
