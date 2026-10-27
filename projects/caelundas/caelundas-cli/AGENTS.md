# Caelundas: NestJS Command-Line Application

## Quick Start

**Type**: Node.js CLI application (NestJS + `nest-commander`)

**Purpose**: <!-- Briefly describe the specific purpose of this CLI application -->

Generate astronomical event calendars using NASA's JPL Horizons API (Outputs: iCalendar `.ics` and JSON files)

### Run Locally

```bash
cp .env.default .env  # Fill in required environment variables
nx run caelundas-cli:start
```

## Architecture Overview

### Tech Stack

- **Framework**: NestJS (modules, dependency injection, providers)
- **CLI runner**: `nest-commander` (`CommandRunner` + `@Command()` decorator)
- **Env validation**: `@nestjs/config` + `zod` (`environmentSchema` in `.constants.ts`)
- **Logging**: `@codebase/observability` — a `pino`-backed `LoggerService` (`Scope.TRANSIENT`)
- **Database**: Postgres via TypeORM and `@codebase/persistence` (the `calendar_events`, `tags`, `tags_closure`, and `calendar_event_tags` tables)
- **Language**: Strict TypeScript

### Execution Flow

```text
src/caelundas-cli.main.ts
  └─ CommandFactory.run(MainModule)
       └─ domain command modules            ← add under src/modules/
```

**Project Implementation**:

```text
src/caelundas-cli.main.ts
  └─ CommandFactory.run(MainModule)
       └─ CaelundasCommand.run()
            ├─ Input (ENV) Validation      ← InputService.parse()
            ├─ Swiss Ephemeris             ← EphemerisService (via Perfective/Progressive)
            ├─ Perfective Event Detection  ← PerfectiveService.detect()
            ├─ Progressive Event Synthesis ← ProgressiveService.detect()
            ├─ Store Events                ← CalendarEventsService.upsert()
            ├─ Read Back Range + Location  ← CalendarEventsService.findInRange()
            └─ iCal and JSON Output        ← CalendarService.write() / writeJson()
```

### Directory Layout

```text
src/
  caelundas-cli.main.ts  # Bootstrap — do not modify
  caelundas-cli.module.ts  # Root NestJS module (imports ConfigModule, LoggerModule)
  caelundas-cli.constants.ts  # Zod environmentSchema for env validation
  modules/
    <domain>/                       # Add feature modules here
      <domain>.module.ts
      <domain>.command.ts
      <domain>.service.ts
      <domain>.types.ts
      <domain>.constants.ts
      <domain>.<tier>.test.ts
testing/                            # Shared test utilities
```

**Project Domain Modules**:

```text
src/modules/
  input/                               # Zod environmentSchema and config parsing
  calendar/                            # ICS and JSON file output formatting
  database/                            # Postgres connection, entities, migrations
  calendar-events/                     # Upsert and range queries over the calendar_events table
  tags/                                # Resolving raw tag strings to nodes of the tag tree
  ephemeris/                           # Swiss Ephemeris access
  perfective/                          # Exact moment event detection (aspects, phases)
  progressive/                         # Duration event synthesis (retrogrades)
  math/                                # Astronomical math utilities
  <domain>/                            # Other specialized astronomical domain modules
```

**Key Domain Components**:

- **Input Validation** ([input.constants.ts](src/modules/input/input.constants.ts)): Zod schema for environment variables
- **Ephemeris Retrieval** ([ephemeris/](src/modules/ephemeris/)): Swiss Ephemeris, computed locally
- **Event Storage** ([calendar-events/](src/modules/calendar-events/) and [database/](src/modules/database/)): Upserts detected events into Postgres and reads them back by range and location
- **Event Detection** ([perfective/](src/modules/perfective/) and domain modules): Aspects, phases, eclipses, retrogrades
- **Progressive Synthesis** ([progressive/](src/modules/progressive/)): Pairs start/end moments into calendar events
- **Output** ([calendar/](src/modules/calendar/)): iCal and JSON files, rendered from the stored rows

### Event Types

- **Aspects**: Conjunctions (0°), oppositions (180°), squares (90°), trines (120°), sextiles (60°)
- **Phases**: New moon, full moon, first/last quarters
- **Retrogrades**: Apparent backward motion of planets
- **Eclipses**: Solar and lunar
- **Ingresses**: Planets entering zodiac signs
- **Cycles**: Solstices, equinoxes, moonrise/moonset, sunrise/sunset, twilights

## Domain Knowledge

Astronomical concepts, event detection, and storage:

- Swiss Ephemeris computes positions locally from JPL DE431 data files; there are no network calls or rate limits
- Aspects, retrogrades, and phases are detected in two passes: perfective (the exact moment) and progressive (the span around it)
- Detected events are stored in the `calendar_events` table, keyed by summary, start, latitude, and longitude, so a re-run updates rows in place and a second location adds its own
- A range's files are rendered from the rows `findInRange` returns, using overlap semantics so an event spanning a range edge is included

## Development

### Adding Business Logic

1. **Implement the root command** — add logic to `caelundas.command.ts` `run()`, or delegate to injected services.
2. **Add domain command modules** — create `src/modules/<domain>/` with a NestJS module, command, service, types, and constants.
3. **Register in root module** — import the new module in `caelundas-cli.module.ts`.
4. **Validate env vars** — extend `environmentSchema` in `caelundas-cli.constants.ts` with all required environment variables.

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

### Key Commands

Always prefer running tasks through Nx rather than calling the underlying tools directly.

```bash
nx run caelundas-cli:start           # Run the command-line application
nx run caelundas-cli:typecheck-code,lint-code,format-code,deprecate-code,guard-code   # Every static check, in one graph
nx run caelundas-cli:typecheck       # tsc --noEmit
nx run caelundas-cli:oxfmt           # Formatting
```

### Testing

Follow the codebase's strict three-tier testing strategy. Co-locate test files with the source they test.

```bash
nx run caelundas-cli:vitest:unit          # Fast (<100ms) — pure logic, mocked DI
nx run caelundas-cli:vitest:integration   # Moderate (1-2s) — real database/API I/O
nx run caelundas-cli:vitest:end-to-end    # Slow (30-60s) — full CLI execution
```

| Tier | File pattern | What to test |
| ---- | ------------ | ------------ |
| Unit | `*.unit.test.ts` | Pure functions, service methods with mocked deps |
| Integration | `*.integration.test.ts` | Database queries, external API clients |
| End-to-end | `*.end-to-end.test.ts` | Full `CommandFactory.run()` execution |

See the [testing-strategy skill](../../../.agents/skills/testing-strategy/SKILL.md) and [testing-mocks skill](../../../.agents/skills/testing-mocks/SKILL.md) for patterns and mock conventions.

### Environment Variables

Required:

- `START_DATE`, `END_DATE`: YYYY-MM-DD (inclusive range)
- `LATITUDE`, `LONGITUDE`: Decimal degrees
- `TIMEZONE`: IANA timezone (e.g., "America/New_York")

Optional:

- `EVENT_TYPES`: Comma-separated list (defaults to all)
- `OUTPUT_FORMAT`: `ical` or `json` (defaults to `ical`)
- `OUTPUT_DIRECTORY`: Directory path (defaults to `./output`)

Full schema: [src/modules/input/input.constants.ts](src/modules/input/input.constants.ts)

### Database

Postgres, in the `caelundas_development` database and `caelundas` schema, with four tables:

- `calendar_events` (entity `CalendarEvent`): Detected calendar events, extending the shared `UpdatableEntity`. Columns: `summary`, `description`, `start`/`end` (`timestamptz` instants), nullable `color` and `location`, `latitude numeric(8,6)` / `longitude numeric(9,6)`, and `timezone`, the observer's IANA zone, which `InputService` derives from the coordinates. Unique on `(summary, start, latitude, longitude)`
- `tags` (entity `Tag`): A TypeORM closure-table tree with many roots. A `name`, unique among its siblings through two partial unique indexes (`tags_sibling_name`, `tags_root_name`), and a nullable `parent_id`. A full path is derived by walking ancestors; depth is the number of ancestors, never a column
- `tags_closure`: TypeORM's closure table for `Tag`, one `(ancestor_id, descendant_id)` row per pair, each tag with itself included. Saving through a `TreeRepository` keeps it in step, so never insert a `Tag` with a plain `insert`
- `calendar_event_tags` (entity `CalendarEventTag`): The event-tag links, keyed on `(calendar_event_id, tag_id)`, cascading from both sides, with the index `calendar_event_tags_tag_id_calendar_event_id` leading with the tag

`CalendarEvent` is caelundas' only event type: detectors build it, `CalendarEventsService` stores and reads it, and the writers render it, with no mapper between them. Its shape differences from the table are settled in the entity, not at the call sites:

- **Times**: `start` and `end` are `Moment`s, through the column transformer `createMomentTransformer` builds in `database.utilities.ts`, which reads them back in UTC. A transformer, not a `Date` property, because every detector and writer does moment arithmetic, and retyping would move a conversion into each of them.
- **Color and location**: optional as well as nullable (`color?: null | string`), so a detector leaves them out and a stored row reads back `null`; the writers treat the two alike.
- **Coordinates**: `latitude`/`longitude` stay `numeric` strings, which only `CalendarEventsService` reads or writes. The in-memory `geography`, `url`, and `priority` fields are gone: no detector set them, and no column stored them.

A detected event, which has no id, audit columns, coordinates, or timezone yet, is `DetectedCalendarEvent` in `database.types.ts`, an `Omit` of the entity plus its raw `tags: string[]`. `findInRange` returns `StoredCalendarEvent`, the entity plus the names of its linked tags, ordered by name; it is assignable to `DetectedCalendarEvent`, so the writers take it too.

Tags go from raw strings to tree nodes in one place: `classifyEvent` in `tags/tags.utilities.ts` turns an event's raw tags into the root-to-node paths it is classified under, and `TagsService.resolve` inserts any missing node through a `TreeRepository`. The static maps live in `tags/tag-map.constants.ts`: `SHARED_TAG_MAP` for raw tags that mean the same everywhere (bodies, signs, decans), and `CONTEXT_TAG_MAPS` keyed by the raw tag that marks a kind of event (`Simple Aspect`, `Ingress`, `Venusian`), so `Full` is a lunar phase under `Monthly Lunar Cycle` and a synodic stage under `Venusian`. The lookup tables behind the implied tags (element, body class, aspect nature, dignity, synodic stage) live in `tags/tag-dimensions.constants.ts`. Ingress kind, eclipse kind, dignity and temporality need several raw tags or the event's times, so `classifyEvent` derives them. A raw tag no map knows falls back to a root of its own, and `Astronomy` and `Astrology` classify nothing. Each root in `TAG_ROOT` is one dimension; never nest one dimension under another. An event links only to the deepest node of each branch and carries the nodes above it through the closure table. A new detector tag should get a map entry, not a new root.

Connection variables are `CAELUNDAS_POSTGRES_HOST`, `_PORT`, `_USERNAME`, `_PASSWORD`, `_DATABASE`, and `_SCHEMA`; the unprefixed `POSTGRES_*` are never read. Postgres returns `numeric` as strings, so compare coordinates as strings.

```bash
nx run caelundas-cli:migration:run        # Apply pending migrations
nx run caelundas-cli:migration:generate   # Generate the next migration from the entities
```

The `migration` target reads its data source and migrations from `src/modules/database/`, named by its `module` option. Migrations never run on application start. `CalendarEventsService.upsert` runs in one transaction, takes the observer's coordinates and timezone, batches rows under Postgres's 65,535-parameter limit, uses `ON CONFLICT … DO UPDATE`, and replaces each written event's `calendar_event_tags` rows with links to the nodes `classifyEvent` classifies it under. The initial migration was regenerated at this schema rather than migrated, under a new name, so a database built from the old one is reset rather than upgraded: run `nx run caelundas-cli:migration:revert` from a checkout that still has the old migration, or drop and recreate the empty `caelundas` schema, then `migration:run` and rerun ingestion. `TagsService.resolve` locks the `tags` table for the transaction (`TAGS_LOCK_SQL`, a mode that blocks other writers but not readers) before inserting nodes, so concurrent runs never race on the tree's unique indexes.

Inspect: `docker exec -it postgres psql -U caelundas_username -d caelundas_development`

## Kubernetes Deployment

### Architecture

Caelundas runs as a **Kubernetes Job** (not Deployment):

- Single execution, terminates on completion
- Output stored in PersistentVolumeClaim
- No network exposure needed

### Workflow

```bash
# 1. Push the image (built for linux/amd64)
docker push ghcr.io/organizzolini/caelundas:latest

# 2. Deploy Job (base.yaml is a defaults template, so override the image)
helm upgrade --install <release-name> infrastructure/helm/kubernetes-job/ \
  --values infrastructure/helm/kubernetes-job/values/base.yaml \
  --set image.repository=ghcr.io/organizzolini/caelundas --set image.tag=latest

# 3. Monitor completion
kubectl wait --for=condition=complete job/<job-name> --timeout=600s

# 4. Clean up
helm uninstall <release-name>
kubectl delete pvc caelundas-output
```

### Helm Chart

Uses [infrastructure/helm/kubernetes-job](../../infrastructure/helm/kubernetes-job) - reusable chart for batch jobs with PVC storage.

**Values**: [base.yaml](../../infrastructure/helm/kubernetes-job/values/base.yaml) holds chart defaults only (its image is the placeholder `my-application`); there is no caelundas-specific values file, so override the image and `env` at deploy time.

See [kubernetes-deployment skill](../../../.agents/skills/kubernetes-deployment/SKILL.md) for Helm chart details.

### Environment Variables in K8s

The chart references no Secret by default; to inject them, create one and point `env` at it with `valueFrom.secretKeyRef` (see the commented example in `base.yaml`):

```bash
kubectl create secret generic caelundas-env-secret --from-env-file=.env
```

## Docker Workflow

### Build

**Platform targeting**: Always build with `--platform linux/amd64` for K8s deployment (Apple Silicon compatibility).

See [docker-workflows skill](../../../.agents/skills/docker-workflows/SKILL.md) for multi-stage builds and GHCR integration.

### Dockerfile

Single-stage build:

- Base: Node.js 20 Alpine
- Native deps: python3, make, g++ (for native modules)
- Workspace: Full codebase copied (needed for path resolution)
- Entry: `pnpm start` (runs TypeScript directly via tsx)

## Performance

**Execution times** (1-year range, all event types):

- 1-2 minutes of local computation, plus a quick upsert and read back

**Optimization strategies**:

- Temporal margins: Fetch beyond date boundaries to catch edge events
- Lazy evaluation: Minute-resolution only for detected event windows

## Writing Modules

Use the generator to scaffold new domain modules, then implement the service:

```bash
nx g conformetry:nestjs-service-module --name=<domain>
```

This creates five files in `src/modules/<domain>/`:

| File | Purpose |
| ---- | ------- |
| `<domain>.module.ts` | Declares providers, imports, and exports |
| `<domain>.service.ts` | Business logic — the only place you write domain code |
| `<domain>.constants.ts` | Regex, enums, static config — never inline magic values |
| `<domain>.types.ts` | TypeScript types scoped to this module |
| `<domain>.service.unit.test.ts` | Unit tests bootstrapped with `Test.createTestingModule` |

### Module file

Register the service in both `providers` and `exports` so consumers can inject it:

```ts
@Module({
  controllers: [],
  exports: [MyDomainService],
  imports: [TypeOrmModule.forFeature([MyEntity]), LoggerModule],
  providers: [MyDomainService],
})
export class MyDomainModule {}
```

Add a JSDoc comment on the module class describing what domain it owns.

### Service file

Follow the section-comment layout from the template — it keeps large services scannable:

```ts
@Injectable()
export class MyDomainService {
  // 🏗 Dependency Injection
  constructor(
    @InjectRepository(MyEntity)
    private readonly repo: Repository<MyEntity>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(MyDomainService.name);
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
- **Private first** — keep internal helpers in the `🔏 Private Methods` section, expose only what callers need under `🌎 Public Methods`.
- **`readonly` everything in the constructor** — all injected deps must be `private readonly`.
- **One service per module** — if a service grows too large, extract a sub-domain into its own module.
- **Class-only top level** — keep NestJS class files to imports plus the class declaration only. Move helper interfaces/types to `<domain>.types.ts`, constants/init helpers to `<domain>.constants.ts` or class members, and do not re-export aliases or types from `*.service.ts`.

### Constants file

Move all inline values to `.constants.ts` to keep services readable:

```ts
// ♟️ Constants
export const MY_SKIP_REGEX = /(alternative)|(archaic)|(synonym)/i;
export const DEFAULT_PAGE_SIZE = 100;
```

### Types file

Put all module-local TypeScript types and interfaces in `.types.ts`:

```ts
// 🏷️ Types
export interface ParsedEntry {
  word: string;
  partOfSpeech: string;
}
```

Do not re-export types from `index.ts` unless they are part of the public API consumed by other modules.

### Registering in the root module

After generating a module, import it in `caelundas-cli.module.ts`:

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ ... }),
    LoggerModule,
    MyDomainModule,   // ← add here
  ],
  providers: [],
})
export class MainModule {}
```

### Conformetry validation

Conformetry validation measures generated and existing module structures against the templates they came from. It runs for one project, or for every project at once.

```bash
pnpm nx run-many --targets=conformetry-validate
```

## Best Practices

- **Never** put business logic in `caelundas-cli.main.ts` — it bootstraps `CommandFactory` only.
- **One command per class** — split sub-commands into separate `CommandRunner` subclasses.
- **Validate at the boundary** — all env vars must be declared in `environmentSchema`; access via `ConfigService`, not `process.env`.
- **Type imports** — use `import { type Foo }` for type-only imports (enforced by ESLint).
- **No `any` types** — use `unknown` or proper typing; strict mode is enabled.

See the [write-typescript skill](../../../.agents/skills/write-typescript/SKILL.md) for strict mode patterns.

## Troubleshooting

- **Command not found at runtime** — ensure the command class is listed in `providers` of its module and the module is imported by the root module.
- **Dependency injection failure** — verify the service is `@Injectable()`, exported from its module, and that module is imported by the consuming module.
- **Unrecognized CLI flag** — check that `@Option()` decorators in the command class exactly match the flag names passed.
- **Env var validation error on startup** — add the missing variable to environmentSchema in src/caelundas-cli.constants.ts and to .env.default.
- **TypeORM entity not found** — register the entity via `TypeOrmModule.forFeature([MyEntity])` in the module that uses it.

See the [triage-integration skill](../../../.agents/skills/triage-integration/SKILL.md) for lint and git hook failures.

**Project-Specific Gotchas**:

- Docker platform mismatch (exec format error)
- K8s Job not starting (image pull, PVC issues)
- PVC cleanup after job completion

## Key Files

- [src/caelundas-cli.main.ts](src/caelundas-cli.main.ts): Application bootstrap
- [src/modules/caelundas/caelundas.command.ts](src/modules/caelundas/caelundas.command.ts): Root CLI command
- [src/caelundas-cli.module.ts](src/caelundas-cli.module.ts): Root NestJS module
- [src/caelundas-cli.constants.ts](src/caelundas-cli.constants.ts): environmentSchema (Zod)
- `@codebase/observability` (`projects/common/observability`): shared pino-backed `LoggerService` and `LoggerModule`
- [project.json](project.json): Nx targets (`start`, `build`, `vitest`, `typecheck-code`, `lint-code`, `format-code`)
- [.env.default](.env.default): Environment variable template

**Project Files**:

- `caelundas.command.ts` includes pipeline orchestration
- `input.constants.ts` includes Zod validation
- `ephemeris.service.ts` includes NASA API client
- `calendar.service.ts` includes ICS/JSON generation
- `Dockerfile` includes container build config
