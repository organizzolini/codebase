# CaelundasApi: NestJS GraphQL API

## Quick Start

**Type**: Node.js HTTP API server (NestJS + Apollo GraphQL)

**Purpose**: <!-- Briefly describe the specific purpose of this GraphQL API -->

**Details**: Serve the astronomical events `caelundas-cli` writes to the Caelundas Postgres to `caelundas-web` over GraphQL, reading them through `CaelundasDatabaseModule` from `@codebase/caelundas-db`. It answers the `health` query and `nightSky`, which draws the animated star-field backdrop; the calendar queries arrive in later pull requests. Runs locally on `CAELUNDAS_API_PORT` (default 6173).

### Event Metrics

`eventMetrics(input: EventMetricsInput!)` measures, in SQL, the events that overlap a `period` and meet a `filter`, as a whole (`total`) and for the tree of groups a `grouping` makes (the same `EventGroupLevelInput` levels the `events` query reads). It lives in `src/modules/events/modules/metrics`: `modules/catalog` (the catalog tables), `modules/measures` (the code registry and the SQL of each aggregate), `modules/facts` (the one statement over the `event` grain), `modules/rollups` (the day grains), `modules/query-building` (the per-level statements on the base tables), `modules/inputs`, `modules/results` and `modules/tree`.

- **The catalog is data, the computation is code.** `measures`, `metrics` and `metric_expressions` (a closure-table tree, loaded with `getTreeRepository(MetricExpression).findTrees()`) are seeded by the caelundas-db migration. A measure row is only `slug`, `name`, `icon`, `note` and `unit`; a metric row is the same plus `expression_id`, the root node of the tree that composes it (a node is a measure, another metric through `metric_id`, or an operator over its children in `position` order; there are no number nodes, the percent is the operator `percent`, `100 * a / nullif(b, 0)`). `EventMetricsCatalogService` loads them once, builds each tree, and fails the load on a measure with no registry entry or another unit, a registry column the real `calendar_event_facts` lacks (checked against `pg_attribute`), a malformed tree, an unknown operator or a metric that reads itself. `eventMetrics` takes metric **slugs**; an unknown one is a bad request that lists the known ones. `eventMetricCatalog` answers `measures { slug name icon note unit }` and `metrics { slug name icon note unit additive measures }` in the picker's order.
- **The measure registry** (`MEASURE_REGISTRY` in `modules/measures/event-metrics-measures.constants.ts`, keyed by measure slug) says how each of the 19 measures is computed: its `aggregate` kind, the facts `column` it reads, an optional `condition` column (`is_progressive`, computed on an event row from its tags), a percentile `argument`, the `grains` that carry it (`event`, and `day` for a measure the facts hold) and its `unit`. Aggregate kinds: `sum`, `count-distinct` (days with events), `distinct-names` (`name` of the events), `distinct-tags` (distinct **direct** tags, counted apart per group), `minimum`, `maximum` (first and last start), `union` (covered time), `span-max`, `span-min`, `span-percentile` (the longest, shortest and median span), `period` (the period's length), `clipped-sum` and `clipped-union` (each event's `start` and `end` clipped to the period; the percent inputs). Eight measures merge across days and read the facts as well; the six that do not and the five that clip (`period-length`, `clipped-duration`, `covered-clipped-duration`, `progressive-clipped-duration`, `progressive-covered-clipped-duration`) read the events only.
- **Derived in code, not stored.** `additive` is true when a metric's expression is one measure that sums, directly or through a metric it reads (events, perfective and progressive events, duration). `zeroIfEmpty` is whatever the expression reads over no events: each aggregate kind has an empty value (a count, sum or union reads 0, a least, greatest or progressive extreme reads none, the period reads a positive number) which `deriveEmptyValue` works through the expression's operators as Postgres does (`x / 0` is none, a none operand makes none), so an average is none and a percent is 0. The picker order is `METRIC_ORDER` (a metric the list lacks follows it by slug).
- **Slugs and units.** Metrics: `events`, `unique-names`, `unique-tags` (distinct direct tags, within `tagRoot`'s subtree when given), `days-with-events`, `perfective-events`, `progressive-events`, `duration`, `covered-duration` (the union of the intervals, so overlaps count once), `average-duration`, `median-duration`, `longest-duration`, `shortest-duration`, `covered-percent`, `total-time-percent`, `progressive-covered-percent`, `progressive-total-percent`, `first-start` and `last-start`. Durations are whole minutes (the facts hold minutes, so a duration needs no conversion), a start is epoch milliseconds and a percent runs from 0 to 100. The average, median, longest and shortest read progressive events only (end after start); perfective events count in `perfective-events` and `events` and add 0 to the sums; `instants`, `spans`, `total-duration` and `progressive-duration` (merged into `duration`, since a perfective event lasts none) still resolve, through `METRIC_ALIASES`; a metric with nothing to read is `null`, and a count or sum is 0.
- **Percent of time**: the four percents divide the minutes of each event's interval clipped to the queried period (the previous period's own length for `previous`) by the period's length; covered is the union of the intervals (0 to 100), total is their sum (it may pass 100); progressive ones only count events carrying Temporality / Progressive; a zero-length period reads `null`. Notes in `documentation/metrics-percent-sql.md`.
- **Statements**: one for the whole set, one per grouping level, and one for the tag names the "No …" groups are called after, run together, or ONE statement over the facts' `event` grain (`modules/facts`: each event once, each level's keys expanded a step a level) when every level is a calendar field or picked tags. A group measures its own distinct events at any depth; an event in two groups of a level counts in both; an event with no key at a level is in the group with a `null` key, labelled `No <name>`, listed last. A level naming a `parent` after a level of the same field splits only the group of that parent tag. Siblings sort by `rank` with digits as numbers and a group returns at most 500 subgroups. No statement is tuned (no `set local`, no JIT or memory settings): the planner is given honest row counts instead. Each level's keys expand through `expand_keys(text[])` and the distinct tags through `expand_tags(uuid[])`, plpgsql set-returning functions of the schema that declare `ROWS 2` and `ROWS 6` (`unnest` of a computed array is assumed ten rows, which multiplied by the levels reached 2.5 million estimated rows against 52 thousand real, so Postgres chose disk sorts, merge joins and JIT), and each level's aggregate and distinct-tag statements are joined on one hashable `gk` text (the period and key path), because a join on the period with the keys as a filter turned into a merge join on the period alone when the estimates ran low.
- **Facts and event rows** (caelundas-db `documentation/metrics-facts.md`): `calendar_event_facts` holds one measure at one filter a row, for the default scope and the measures that merge across days only; the event path reads each event from `calendar_events` and its tags from `calendar_event_tag_sets` (`FACTS_EVENT_SOURCE_SQL`, a subquery Postgres folds in). An event row has `name`, `start`, `end`, local `day` and `hour`, `duration_minutes`, `tag_ids` (the tags put directly on the event) and `ancestor_tag_ids` (their proper ancestors); every measure column (`events`, `instants`, `spans`, `progressive_minutes`, `first_start`, `last_start`, `covered_range`, `span_duration_minutes`, `is_progressive`) is computed from those (`FACTS_EVENT_COLUMN_SQL`). Overlap with a period is `start < period_end and "end" >= period_start` on the btree `(start, end)`. So a tag filter or tag grouping reads `tag_ids || ancestor_tag_ids` (`FACTS_TAGS_MATCHING_SQL`) while `unique-tags` counts the direct `tag_ids`. `RAW_EVENT_COLUMN_SQL` computes the same columns from the base tables for the per-level fallback statements, and the integration tests assert both paths return identical results.
- **Scope**: the Forming and Dissolving phase boundary instants are left out of the facts and at query time by `DEFAULT_EVENT_SCOPE` (`includePhaseBoundaries: false`). `PHASE_BOUNDARY_TAG_PATHS` is the one list; `PHASE_BOUNDARY_TAG_IDS_SQL` resolves it to tag ids (and their descendants) through `tag_info` and `tags_closure`, and `compileEventScope` (raw events and the events list) and `compileFactsScope` (`not (f.tag_ids && <ids>)` on an event row) apply it. The GraphQL resolvers pass the default; a caller that wants the boundaries sets the flag.
- **Routing**: the facts (`modules/rollups`) answer a request only when its scope is the default one (the facts leave the phase boundaries out), it has no `filter`, and every measure it reads merges across days (the registry's `grains` carry `day`: `events`, `perfective-events`, `progressive-events`, `duration`, `first-start`, `last-start`, `days-with-events`); the six that do not (`unique-names`, `unique-tags`, `covered-duration`, `longest-progressive-duration`, `shortest-progressive-duration`, `median-progressive-duration`) and the five percent inputs send the whole request to the events. When the facts apply, a guard statement names the zone they answer in (every event shares one timezone and each period starts and ends at that zone's local midnight), events that start before a period and reach into it are added from the events, and the whole set, a calendar field level (`day`, `month`, `quarter`, `year`) and the first level of a tag's children read them: the day (or day-and-tag) filters whose `period` is in the window are pivoted back to columns, one conditional aggregate a measure. A level they cannot answer falls back to the facts-less event statement. Durations are whole minutes, which is exact for events recorded at minute resolution; instants are epoch milliseconds in the facts.
- **Local time without a view**: the events list, facets, calendar-field filters, grouping keys and raw metric statements read `EVENTS_LOCAL_SQL` (`event-filter-sql.constants.ts`), `calendar_events` with its stored generated columns `start_local_day`, `end_local_day` and `start_local_hour` (cast to text and integer for the readers) and `duration_minutes` and `temporality` computed inline; the weekday is `extract(dow from start_local_day)`. Tags at query time: a statement that needs a tag's depth, root, path or rank starts with the `tag_levels` and `tag_info` CTEs (`TAG_INFO_SQL`).
- **Comparing**: `compareToPrevious` also measures the period of equal length right before, in the same statements, and sets each value's `previous`, matched by group id. A group only the previous period had is returned with empty values (`value` 0 or `null`) and its `previous` set, so a client can show it as gone.
- **Event and tag fields**: a `CalendarEvent` has `name` and `note` (the database's `name` and `note` columns), no `color` or `location`; tags, facets and facet values carry a `slug`.

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
