# CaelundasApi: NestJS GraphQL API

## Quick Start

**Type**: Node.js HTTP API server (NestJS + Apollo GraphQL)

**Purpose**: <!-- Briefly describe the specific purpose of this GraphQL API -->

**Details**: Serve the astronomical events `caelundas-cli` writes to the Caelundas Postgres to `caelundas-web` over GraphQL, reading them through `CaelundasDatabaseModule` from `@codebase/caelundas-db`. It answers the `health` query and `nightSky`, which draws the animated star-field backdrop; the calendar queries arrive in later pull requests. Runs locally on `CAELUNDAS_API_PORT` (default 6173).

### Event Metrics

`eventMetrics(input: EventMetricsInput!)` measures, in SQL, the events that overlap a `period` and meet a `filter`, as a whole (`total`) and for the tree of groups a `grouping` makes (the same `EventGroupLevelInput` levels the `events` query reads). It lives in `src/modules/events/modules/metrics`, with the input and enum in `modules/inputs`, the result types in `modules/results`, the SQL builder in `modules/query-building` and the tree assembly in `modules/tree`.

- **Statements**: one for the whole set, one per grouping level, and one for the tag names the "No …" groups are called after, run together; each level's statement joins levels 0 to N, so a group measures its own distinct events at any depth.
- **Groups**: an event in two groups of a level counts in both; an event with no key at a level is in the group with a `null` key, labelled `No <name>`, listed last. A level naming a `parent` after a level of the same field splits only the group of that parent tag, as the table does, and the groups of the next level attach to the others directly. `id` is the table's group id (parent id, `/level:key`).
- **Rank and cap**: siblings sort by `rank` (tags by their ancestors' `rank` then name, derived values by key, durations by bucket) with digits as numbers; a group returns at most 500 subgroups.
- **Metrics**: `EVENTS`, `UNIQUE_NAMES`, `UNIQUE_TAGS` (deepest linked tags, within `tagRoot`'s subtree when given), `DAYS_WITH_EVENTS` (local start days), `TOTAL_DURATION_MINUTES`, `COVERED_MINUTES` (the union of the intervals, so overlaps count once), `AVERAGE_`, `MEDIAN_`, `LONGEST_` and `SHORTEST_DURATION_MINUTES`, `INSTANTS`, `SPANS`, `FIRST_START` and `LAST_START` (epoch milliseconds), and `PROGRESSIVE_HOURS` (hours of the events carrying the Temporality / Progressive tag).
- **Percent of time**: `COVERED_PERCENT` and `TOTAL_TIME_PERCENT` (all of a group's events), `PROGRESSIVE_COVERED_PERCENT` and `PROGRESSIVE_TOTAL_PERCENT` (only events carrying Temporality / Progressive) divide minutes by the length of the queried period (`end - start`; the previous period's own length for `previous`). Each event's interval is clipped to the period first, so only the part inside counts. `COVERED_` is the union of the intervals (overlaps once, so 0 to 100); `TOTAL_TIME_` is their sum (overlaps once per event, so it may pass 100 and reads as the average number of concurrent events times 100). Instants add 0, a group with no events reads 0, and a zero-length period reads `null`. `COVERED_MINUTES` is unchanged and does not clip. Notes for the read model in `documentation/metrics-percent-sql.md`.
- **Instants**: the average, median, longest and shortest durations read spans only (end after start); instants count in `INSTANTS` and `EVENTS`, and add 0 to the total and covered minutes. Durations are not clipped to the period. A metric with nothing to read is `null`, and a count or sum is 0.
- **Rollups**: where it can, a statement reads the caelundas-db materialized views (`documentation/metrics-rollups.md` there) in place of the events, with identical results, and falls back to the base-table statement otherwise; the code is in `modules/rollups`. A guard statement runs first and names the zone the rollups answer in: every event shares one timezone, and each period starts and ends at that zone's local midnight, as a rollup is by local start day. Events that start before a period and reach into it are added from `calendar_event_facts`, so the set equals the overlap set. Read from the rollups: the whole set, a calendar field level (`day`, `month`, `quarter`, `year`) and the first level of a tag's children (depth 1, no `parent`, no picks), each for every metric but the percents, with no `filter`; a tag level also reads the events no tag of the root names as its "No …" group. Everything else reads the events, per statement: a filter, a percent metric, a level after the first, a deeper tag level, a `parent` or picked tags, `week`, `weekday`, `hour` and `duration`. Durations are whole seconds in the rollups, so an event with fractional seconds differs from the events by under a second. Timings are in `documentation/metrics-percent-sql.md`.
- **Facts**: what the rollups do not wholly cover (any `filter`, a percent metric, picked tags, any period) reads `calendar_event_facts` in ONE statement (`modules/facts`): each event once, its tag ids as an array, every level's keys as arrays expanded a step a level, each level aggregated from its own step. The statement selects measures (additive figures such as `seconds`, `spans`, `clippedSeconds`), and the service computes each metric from them with the declarative table in `modules/measures` (a metric is a calculation over measures and other metrics). A tag filter reads `e.tag_ids`, through the filter service's `tagsMatching` source. Supported: calendar levels and picked-tag levels; a tag level with a `parent` or no picks falls back to the per-level statements. Every metrics statement runs through `EventsService.selectTuned` (JIT off, 64 MB sort memory). Results equal the events' (`facts.service.integration.test.ts`); durations are whole seconds as in the rollups.
- **Comparing**: `compareToPrevious` also measures the period of equal length right before, in the same statements, and sets each value's `previous`, matched by group id. A group only the previous period had is returned with empty values (`value` 0 or `null`) and its `previous` set, so a client can show it as gone.

### Run Locally

```bash
cp configuration/.env.default configuration/.env  # Fill in required environment variables
nx run caelundas-api:start
```

## Architecture Overview

### Tech Stack

- **Framework**: NestJS (modules, dependency injection, providers)
- **GraphQL server**: Apollo Server via `@nestjs/apollo` (`ApolloDriver`)
- **Schema strategy**: Code-first, emitted to `src/schema.gql` beside the root module (`GRAPHQL_SCHEMA_FILE`), whatever the working directory; the file is gitignored
- **Pagination**: Relay connections via `nestjs-graphql-connection`
- **Dataloaders**: `dataloader` (request-scoped, prevents N+1 queries)
- **Database**: Postgres through `CaelundasDatabaseModule` (`@codebase/caelundas-db`, which wraps the shared `DatabaseModule` from `@codebase/persistence`); no file is opened. Connects as `caelundas_username` to `caelundas_development`.`caelundas` with the `CAELUNDAS_POSTGRES_*` variables, which `environmentSchema` takes from `postgresEnvironmentSchema({ project: "caelundas" })`. Migrations run separately with `nx run caelundas-db:migration:run`
- **Env validation**: `@nestjs/config` + `zod` (`environmentSchema` in `.constants.ts`)
- **CORS**: `CorsModule` (`modules/cors`) provides the options the bootstrap enables, from `CAELUNDAS_API_CORS_ORIGINS` (comma separated). No origin is allowed until you list one, so a browser app on another origin is refused by default; `*` allows every origin and suits only a public API
- **CORS wiring**: `app.enableCors(app.get(CorsService).getOptions(...))` in the bootstrap, with the origins from `CAELUNDAS_API_CORS_ORIGINS` (comma separated, default empty; `.env.default` lists the web app's dev origins). The CORS middleware answers the browser's `OPTIONS` preflight before Apollo sees it, so Apollo's CSRF prevention (which would answer it with 400) never runs
- **Logging**: `@codebase/observability` — a `pino`-backed `LoggerService` (`Scope.TRANSIENT`)
- **Language**: Strict TypeScript

### Execution Flow

```text
src/caelundas-api.ts
  └─ NestFactory.create(CaelundasApiModule)
       └─ GraphQLModule.forRoot(ApolloDriver)
            └─ Feature modules (SampleModule, ...)
                 └─ Resolvers → Services → Loaders
```

### Directory Layout

```text
src/
  caelundas-api.ts            # Bootstrap — do not modify
  caelundas-api.module.ts     # Root NestJS module (imports GraphQLModule, LoggerModule)
  caelundas-api.constants.ts  # Zod environmentSchema for env validation
  modules/
    cors/                             # The CORS options the bootstrap enables
      cors.module.ts
      cors.service.ts
      cors.service.unit.test.ts
    sample/                           # Example GraphQL module — replace with your domain
      sample.module.ts
      sample.resolver.ts
      sample.service.ts
      sample.loader.ts
      sample.entities.ts
      sample.inputs.ts
      sample.args.ts
      sample.factories.ts
      sample.constants.ts
      sample.types.ts
      sample.*.unit.test.ts
    <domain>/                         # Add feature modules here
      <domain>.module.ts
      <domain>.resolver.ts
      <domain>.service.ts
      <domain>.loader.ts
      <domain>.entities.ts
      <domain>.inputs.ts
      <domain>.args.ts
      <domain>.factories.ts
      <domain>.constants.ts
      <domain>.types.ts
      <domain>.<tier>.test.ts
testing/                              # Shared test utilities
```

The layout this API has, with its own modules:

```text
src/
  caelundas-api.ts            # Bootstrap — do not modify
  caelundas-api.module.ts     # Root NestJS module (imports GraphQLModule, CaelundasDatabaseModule, LoggerModule)
  caelundas-api.constants.ts  # Zod environmentSchema for env validation
  cors.service.ts             # The CORS options the bootstrap enables
  modules/
    health/                           # The `health` query every API here answers
      health.module.ts
      health.resolver.ts
      health.service.ts
      health.constants.ts
      health.types.ts
      health.*.unit.test.ts
    night-sky/                        # The `nightSky` query: the builder, its catalog and cache
      data/night-sky-catalog.json     # Trimmed HYG stars and d3-celestial figures, loaded once at startup
      modules/                        # astronomy/ (projection maths), drawing/ (stars, lines, colors, SVG, view), options/
    <domain>/                         # Add feature modules here
      <domain>.module.ts
      <domain>.resolver.ts
      <domain>.service.ts
      <domain>.loader.ts
      <domain>.entities.ts
      <domain>.inputs.ts
      <domain>.args.ts
      <domain>.factories.ts
      <domain>.constants.ts
      <domain>.types.ts
      <domain>.<tier>.test.ts
testing/                              # Shared test utilities
```

## Development

### Adding Domain Modules

Use the generator to scaffold new GraphQL modules, then implement the resolver and service:

```bash
nx g conformetry:nestjs-graphql-module --name=<domain>
```

This creates 13 files in `src/modules/<domain>/`. After generation:

1. **Register in root module** — import the new module in `caelundas-api.module.ts`:

   ```ts
   @Module({
     imports: [
       ConfigModule.forRoot({ ... }),
       GraphQLModule.forRoot<ApolloDriverConfig>({ ... }),
       LoggerModule,
       MyDomainModule,   // ← add here
     ],
   })
   export class CaelundasApiModule {}
   ```

2. **Implement the resolver** — add queries and mutations in `<domain>.resolver.ts`.
3. **Implement the service** — add business logic in `<domain>.service.ts`.
4. **Implement the dataloader** — add batch loading in `<domain>.loader.ts`.
5. **Define entities** — add GraphQL object types in `<domain>.entities.ts`.

### Logging

`LoggerService` and `LoggerModule` come from `@codebase/observability` — this project does not define its own logger. Add `"@codebase/observability": "workspace:*"` to `dependencies`, then import `LoggerModule` once in the root module; it is `@Global()`, so feature modules inject `LoggerService` without importing it.

`LoggerService` is `Scope.TRANSIENT` — each injecting class gets its own instance. Always call `setContext` in the constructor:

```ts
constructor(private readonly logger: LoggerService) {
  super();
  this.logger.setContext(MyService.name);
}
```

Outputs structured JSON in production (`NODE_ENV=production`) and pretty-printed logs in development.

### GraphQL Playground

The GraphQL playground is available at `http://localhost:3000/graphql` in development.
Disabled automatically in production (`NODE_ENV=production`).

The port is `CAELUNDAS_API_PORT`; `.env.default` sets 6173 for local runs.

### Key Commands

Always prefer running tasks through Nx rather than calling the underlying tools directly.

```bash
nx run caelundas-api:start           # Start the GraphQL API server
nx run caelundas-api:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run caelundas-api:typecheck       # tsc --noEmit
nx run caelundas-api:oxfmt           # Formatting
```

### Testing

Follow the codebase's strict three-tier testing strategy. Co-locate test files with the source they test.

```bash
nx run caelundas-api:vitest:unit          # Fast (<100ms) — pure logic, mocked DI
nx run caelundas-api:vitest:integration   # Moderate (1-2s) — real database/API I/O
nx run caelundas-api:vitest:end-to-end    # Slow (30-60s) — full server execution
```

| Tier        | File pattern            | What to test                                       |
| ----------- | ----------------------- | -------------------------------------------------- |
| Unit        | `*.unit.test.ts`        | Resolver methods, service methods with mocked deps |
| Integration | `*.integration.test.ts` | Database queries, external API clients             |
| End-to-end  | `*.end-to-end.test.ts`  | Full GraphQL request/response cycles               |

See the [testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

## Writing GraphQL Modules

### Resolver file

Use section comments to keep resolvers scannable:

```ts
@Resolver(() => MyEntity)
export class MyResolver {
  // 🏗 Dependency Injection
  constructor(
    private readonly myLoader: MyLoader,
    private readonly myService: MyService,
  ) {}

  // 🔎 Queries

  @Query(() => MyConnection)
  async myEntities(@Args() args: FindMyArgs): Promise<MyConnection> {
    // ...
  }

  // 🖋️ Mutations

  @Mutation(() => MyEntity)
  async createMyEntity(@Args("input") input: CreateMyInput): Promise<MyEntity> {
    // ...
  }

  // 🔗 Relations
}
```

### DataLoader pattern

Use DataLoaders for all relation fields to avoid N+1 queries:

```ts
@ResolveField(() => RelatedEntity)
async relatedEntity(
  @Parent() parent: MyEntity,
): Promise<RelatedEntity | null> {
  return this.relatedLoader.byId.load(parent.relatedId);
}
```

### Relay Connections

Use `nestjs-graphql-connection` for all list queries:

```ts
@Query(() => MyConnection)
async myEntities(@Args() args: FindMyArgs): Promise<MyConnection> {
  const { first, after } = args;
  const items = await this.myService.findAll({ first, after });
  return buildConnection(items);
}
```

### Module file

Register the resolver, service, and dataloader in both `providers` and `exports`:

```ts
@Module({
  exports: [MyLoader, MyService],
  imports: [],
  providers: [MyLoader, MyResolver, MyService],
})
export class MyModule {}
```

Add a JSDoc comment on the module class describing what domain it owns.

### Service file

Follow the section-comment layout — keeps large services scannable:

```ts
@Injectable()
export class MyService {
  // 🏗 Dependency Injection
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MyService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods
}
```

Key rules:

- **Call `setContext` in every constructor** — always use `MyClass.name`, never a string literal.
- **Inject `LoggerService` as the last constructor parameter** (after repository/domain deps).
- **Private first** — keep internal helpers in the `🔏 Private Methods` section.
- **`readonly` everything in the constructor** — all injected deps must be `private readonly`.

## Best Practices

- **Never** put business logic in `caelundas-api.ts` — it bootstraps `NestFactory` only.
- **One module per domain** — split large domains into sub-domain modules.
- **Validate at the boundary** — all env vars must be declared in `environmentSchema`; access via `ConfigService`, not `process.env`.
- **Use DataLoaders for relations** — never load related entities inside resolver field methods without batching.
- **Type imports** — use `import { type Foo }` for type-only imports (enforced by ESLint).
- **No `any` types** — use `unknown` or proper typing; strict mode is enabled.

See the [write-typescript skill](../../../.agents/skills/write-typescript/SKILL.md) for strict mode patterns.

## Troubleshooting

- **Resolver not found at runtime** — ensure the resolver class is listed in `providers` of its module and the module is imported by the root module.
- **Dependency injection failure** — verify the service is `@Injectable()`, exported from its module, and that module is imported by the consuming module.
- **GraphQL schema not generating** — ensure `autoSchemaFile` is set to `GRAPHQL_SCHEMA_FILE` in `GraphQLModule.forRoot()` and all types use `@ObjectType()`, `@Field()`, etc.
- **N+1 query problem** — use DataLoaders for all relation fields in resolvers.
- **Env var validation error on startup** — add the missing variable to `environmentSchema` in `.constants.ts` and to `configuration/.env.default`.

See the [triage-integration skill](../../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

## Key Files

- [src/caelundas-api.ts](src/caelundas-api.ts): Application bootstrap
- [src/caelundas-api.module.ts](src/caelundas-api.module.ts): Root NestJS module
- [src/caelundas-api.constants.ts](src/caelundas-api.constants.ts): `environmentSchema` (Zod)
- `@codebase/observability` (`projects/common/observability`): shared pino-backed `LoggerService` and `LoggerModule`
- `src/modules/sample/sample.module.ts`: Example GraphQL module
- [src/modules/health/health.module.ts](src/modules/health/health.module.ts): The `health` query module
- [project.json](project.json): Nx targets (`start`, `test`, `lint`, `typecheck`, `format`)
- [configuration/.env.default](configuration/.env.default): Environment variable template
