# meanderaw-api

**Purpose**: Serve the meanders `meanderaw-cli` writes to the Meanderaw Postgres over GraphQL, reading them through `MeanderawDatabaseModule` from `@codebase/meanderaw-db` and drawing them through `@codebase/meanderaw-core`. Runs locally on `MEANDERAW_API_PORT` (default 8367).

```bash
cp .env.default .env  # Fill in required environment variables
nx run meanderaw-api:start
```

The database must be running and migrated first (`nx run meanderaw-db:migration:run`).

- **Database**: Postgres through `MeanderawDatabaseModule` (`@codebase/meanderaw-db`); services read it through TypeORM repositories

```text
src/meanderaw-api.ts
  └─ NestFactory.create(MeanderawApiModule)
       ├─ GraphQLModule.forRoot(ApolloDriver)
       ├─ MeanderawDatabaseModule
       ├─ CharacteristicsModule → CharacteristicsResolver → CharacteristicsService
       ├─ MeandersModule → MeandersResolver → MeandersService
       └─ MeanderGroupsModule → MeanderGroupsResolver → MeanderGroupsService
```

```text
src/
  meanderaw-api.ts            # Bootstrap — do not modify
  meanderaw-api.module.ts     # Root module
  meanderaw-api.constants.ts  # environmentSchema, GRAPHQL_SCHEMA_FILE
  cors.service.ts             # The CORS options the bootstrap enables
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

Scaffold with the `nestjs-service-module` template, then add the resolver and entities, and register the module in `meanderaw-api.module.ts`. Keep one class per file: GraphQL entities, inputs and enums each go in a `*.entities.ts` file; constants files hold only `const` declarations, including Zod schemas.

## Sorting and Paging

- A sort names a shape field or a characteristic key, up to 8 in all (`MAXIMUM_SORTS`): the web gallery asks for up to four group levels, then four sorts of its own. A missing characteristic value sorts as 0 or false (a left join on the bridge's primary key), and ties break by id ascending.
- A cursor carries the sort field, direction, last value and id. A cursor used with a different sort is refused with a 400, never answered with a wrong page.
- `totalCount` is the sum of `shape_counts`, or an exact count of `meanders` while no aggregate has run.

- [src/meanderaw-api.module.ts](src/meanderaw-api.module.ts): Root module
- [src/modules/meanders/meanders.service.ts](src/modules/meanders/meanders.service.ts): Keyset paging and drawing
- [testing/meanderaw-application.ts](testing/meanderaw-application.ts): End-to-end harness
