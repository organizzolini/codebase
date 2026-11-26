# caelundas-cli

Generate astronomical event calendars with Swiss Ephemeris (Output: rows in the Postgres `calendar_events` table)

- **Database**: Postgres via TypeORM and `caelundas-db`'s `CaelundasDatabaseModule`, which wraps `@codebase/persistence`'s `DatabaseModule` (the `calendar_events`, `tags`, `tags_closure`, and `calendar_event_tags` tables, and the night sky's)

```text
src/caelundas-cli.main.ts
  └─ CommandFactory.run(MainModule)
       └─ CaelundasCommand.run()
            ├─ Input (ENV) Validation      ← InputService.parse()
            ├─ Swiss Ephemeris             ← EphemerisService (via Perfective/Progressive)
            ├─ Perfective Event Detection  ← PerfectiveService.detect()
            ├─ Progressive Event Synthesis ← ProgressiveService.detect()
            └─ Store Events                ← CalendarEventsService.upsert()
```

**Project Domain Modules**:

```text
src/modules/
  input/                               # Zod environmentSchema and config parsing
  calendar/                            # Instant-event builder shared by the detectors
  night-sky/                           # The night-sky command: HYG stars and d3-celestial figures
  calendar-events/                     # Upsert and range queries over the calendar_events table
  tags/                                # Resolving raw tag strings to nodes of the tag tree
  ephemeris/                           # Swiss Ephemeris access; child modules: datetime/, math/, ephemeris-download/
  perfective/                          # Exact moment event detection; child modules: one per event family (eclipses/, phases/, ...)
  progressive/                         # Duration event synthesis (retrogrades)
  aspects/                             # Aspect detection; child modules: major-/minor-/triple-/.../specialty-aspects/, stellium/
```

**Key Domain Components**:

- **Input Validation** ([input.constants.ts](src/modules/input/input.constants.ts)): Zod schema for environment variables
- **Ephemeris Retrieval** ([ephemeris/](src/modules/ephemeris/)): Swiss Ephemeris, computed locally
- **Event Storage** ([calendar-events/](src/modules/calendar-events/)): Upserts detected events into Postgres and reads them back by range and location
- **Event Detection** ([perfective/](src/modules/perfective/) and domain modules): Aspects, phases, eclipses, retrogrades
- **Progressive Synthesis** ([progressive/](src/modules/progressive/)): Pairs start/end moments into calendar events

## Event Types

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
- The CLI's only output is the database: it writes no `.ics` or JSON files, and needs no writable directory

1. **Implement the root command** — add logic to `caelundas.command.ts` `run()`, or delegate to injected services.
2. **Add domain command modules** — create `src/modules/<domain>/` with a NestJS module, command, service, types, and constants.
3. **Register in root module** — import the new module in `caelundas-cli.module.ts`.
4. **Validate env vars** — extend `environmentSchema` in `caelundas-cli.constants.ts` with all required environment variables.

### Environment Variables

Required:

- `START_DATE`, `END_DATE`: YYYY-MM-DD (inclusive range)
- `LATITUDE`, `LONGITUDE`: Decimal degrees
- `TIMEZONE`: IANA timezone (e.g., "America/New_York")

Optional:

- `EVENT_TYPES`: Comma-separated list (defaults to all)

Full schema: [src/modules/input/input.constants.ts](src/modules/input/input.constants.ts)

### Database

Postgres: the `caelundas` schema of `caelundas_development`, as `caelundas_username`, read through `CAELUNDAS_POSTGRES_*` only (`postgresEnvironmentSchema` from `@codebase/persistence`, in `caelundas-cli.constants.ts`; `.env.default` lists the local values). The unprefixed `POSTGRES_*` admin login is never read. Entities, the one migration, the read model and `CaelundasDatabaseModule` belong to the `caelundas-db` library, which this project imports and has none of its own. The module never migrates on start: run `nx run caelundas-db:migration:run` first. Tables are named by the shared plural snake-case strategy, and the base tables are:

- `calendar_events` (entity `CalendarEvent`): Detected calendar events, extending `PostgresqlUpdatableEntity`. Columns: `summary`, `description`, `start`/`end` (`timestamptz`), nullable `color` and `location`, `latitude` / `longitude` (`numeric(9, 6)`, strings from the driver), and `timezone`, the observer's IANA zone, which `InputService` derives from the coordinates. Unique on `(summary, start, end, latitude, longitude)`. Ids are `uuidv7()` values the database assigns; never derive one in the CLI
- `tags` (entity `Tag`): A TypeORM closure-table tree with many roots. A `name`, unique among its siblings through two partial unique indexes (`tags_sibling_name`, `tags_root_name`), and a nullable `parent_id` (uuid). A full path is derived by walking ancestors; depth is the number of ancestors, never a column
- `tags_closure`: TypeORM's closure table for `Tag`, one `(ancestor_id, descendant_id)` row per pair, each tag with itself included. Saving through a `TreeRepository` keeps it in step, so never insert a `Tag` with a plain `insert`
- `calendar_event_tags` (entity `CalendarEventTag`): The event-tag links, keyed on `(calendar_event_id, tag_id)`, both uuids, cascading from both sides, with the index `calendar_event_tags_tag_id_calendar_event_id` leading with the tag
- `stars`, `constellations`, `constellation_edges`: the night sky, keyed by Hipparcos number, IAU designation, and the constellation with its two stars

`CalendarEvent` is caelundas' only event type: detectors build it, `CalendarEventsService` stores and reads it, and the writers render it, with no mapper between them. Its shape differences from the table are settled in the entity, not at the call sites:

- **Times**: `start` and `end` are `Moment`s, through the column transformer `createMomentTransformer` builds in `caelundas-db`, which writes the instant and reads it back in UTC. A transformer, not a `Date` property, because every detector and writer does moment arithmetic, and retyping would move a conversion into each of them.
- **Color and location**: optional as well as nullable (`color?: null | string`), so a detector leaves them out and a stored row reads back `null`; the writers treat the two alike.
- **Coordinates**: `latitude`/`longitude` stay strings, which only `CalendarEventsService` reads or writes. The in-memory `geography`, `url`, and `priority` fields are gone: no detector set them, and no column stored them.

A detected event, which has no id, audit columns, coordinates, or timezone yet, is `DetectedCalendarEvent` in `calendar-events.types.ts`, an `Omit` of the entity plus its raw `tags: string[]`. `findInRange` returns `StoredCalendarEvent`, the entity plus the names of its linked tags, ordered by name; it is assignable to `DetectedCalendarEvent`, so the writers take it too.

Tags go from raw strings to tree nodes in one place: `classifyEvent` in `tags/tags.utilities.ts` turns an event's raw tags into the root-to-node paths it is classified under, and `TagsService.resolve` inserts any missing node through a `TreeRepository`. The static maps live in `tags/tag-map.constants.ts`: `SHARED_TAG_MAP` for raw tags that mean the same everywhere (bodies, signs, decans), and `CONTEXT_TAG_MAPS` keyed by the raw tag that marks a kind of event (`Simple Aspect`, `Ingress`, `Venusian`), so `Full` is a lunar phase under `Monthly Lunar Cycle` and a synodic stage under `Venusian`. The lookup tables behind the implied tags (element, body class, aspect nature, dignity, synodic stage) live in `tags/tag-dimensions.constants.ts`. Ingress kind, eclipse kind, dignity and temporality need several raw tags or the event's times, so `classifyEvent` derives them. A raw tag no map knows falls back to a root of its own, and `Astronomy` and `Astrology` classify nothing. Each root in `TAG_ROOT` is one dimension; never nest one dimension under another. An event links only to the deepest node of each branch and carries the nodes above it through the closure table. A new detector tag should get a map entry, not a new root.

Run the migration with `nx run caelundas-db:migration:run` (`migration:generate` makes the next one). `CalendarEventsService.upsert` runs in one transaction and takes the observer's coordinates and timezone. It writes rows in batches sized by their columns under Postgres's 65,535-parameter limit (`POSTGRES_MAXIMUM_PARAMETERS`, in `caelundas-cli.constants.ts`), uses `INSERT … ON CONFLICT (summary, start, end, latitude, longitude) DO UPDATE … RETURNING`, so a re-run updates a row instead of duplicating it and the returned ids need no second read, and replaces each written event's `calendar_event_tags` rows with links to the nodes `classifyEvent` classifies it under. The database assigns `id`, `created_at` and `updated_at`. `TagsService.resolve` takes no lock: two runs inserting the same missing tag at once make the second fail on the unique name, and running it again succeeds.

Inspect: `psql` with the `CAELUNDAS_POSTGRES_*` values, then `set search_path to caelundas`.

**Night sky tables**: the migration creates `stars` (keyed by Hipparcos number), `constellations` (keyed by IAU designation, with a `zodiac` flag) and `constellation_edges` (a figure's segment between two stars, generated by `@Graph` on `Constellation`, cascading on delete). The `night-sky` command (`nx run caelundas-cli:start:night-sky --stars <hyg.csv> --constellations <constellations.json> --lines <constellations.lines.json>`) rewrites all three in one transaction: the stars are bulk inserted, batched by columns under the parameter limit, and each constellation is saved with its `edges`, so the command never names the edge entity. Keep the attribution with the data: HYG v4.1 is CC BY-SA 4.0 (David Nash and the HYG contributors), so the stored catalog is a derived work under it; d3-celestial is BSD-3-Clause (Olaf Frohn) and its figures follow the IAU's charts rather than any GPL-licensed sky culture. `CAELUNDAS_DATABASE_MIGRATIONS`, from `caelundas-db`, lists the migration the tests' Testcontainers Postgres runs.

**Read model**: the migration also creates `tag_nodes`, `calendar_event_tag_nodes` (each tag's depth, root and path, and one row per event and tag with ancestors, `is_direct` marking the tags given) and the view `calendar_event_derived_times`. The two tag tables are stored, not views, because a tag's depth, root and path take a correlated subquery that every grouping would repeat. `CalendarEventsService.upsert` ends each transaction with `CaelundasDatabaseService.refreshReadModel` from `caelundas-db`, inside the transaction that wrote the events and any new tags, so a run leaves the read model current and a failed refresh stores nothing. The view needs no refresh.

**Tests**: integration and end-to-end suites start a Testcontainers Postgres through `startCaelundasDatabase` in `testing/support/database.ts`, which runs the real migration and connects through `CaelundasDatabaseModule` from `CAELUNDAS_POSTGRES_*`. Docker must be running.

## Kubernetes Deployment

Ingestion runs as a **Kubernetes Job**, one range per run, writing events to Postgres and nothing else (no volume is mounted). The
`.github/workflows/caelundas-cli.yml` workflow takes the dotenv text as its one input and mounts it as `configuration/.env`, the file this CLI's
`ConfigModule` reads; the schema validates it. The Job's values are
[values/caelundas-cli.yaml](../../../infrastructure/helm/kubernetes-job/values/caelundas-cli.yaml). Run
`gh workflow run caelundas-cli.yml -f environment="$(cat my.env)"` for several lines, and split a long range into several runs.
The ConfigMap is not for secrets: the database password is a Secret reference.
See
[infrastructure/AGENTS.md](../../../infrastructure/AGENTS.md) for the cluster.

## Docker Workflow

```bash
IMAGE_TAG=local nx run caelundas-cli:docker:build   # linux/amd64, from the workspace root
IMAGE_TAG=1.2.3 nx run caelundas-cli:docker:push    # one buildx build --push
```

[infrastructure/docker/application/Dockerfile](../../../infrastructure/docker/application/Dockerfile)
builds `ghcr.io/organizzolini/caelundas-cli`, shared with the other applications and
configured by [infrastructure/image.env](infrastructure/image.env). The image is
the ingestion Job (the same command as `nx run caelundas-cli:start`, started by the image's `start` script). It runs as UID
10001, bakes the Swiss Ephemeris files in at build time, and compiles `sweph`
natively. It runs plain JavaScript that `nx run caelundas-cli:bundle`
([configuration/rolldown.config.ts](configuration/rolldown.config.ts)) writes: one
file per module at its source path, so the migrations stay files the database
module's glob finds. A package loaded by name rather than by import goes in that
file's `runtimeDependencies`. Keep `--platform linux/amd64`.

## Performance

**Execution times** (1-year range, all event types):

- About 45 minutes on one CPU in the container image, peaking near 0.8 GiB (see the README's Image section), plus a quick upsert and read back

**Optimization strategies**:

- Temporal margins: Fetch beyond date boundaries to catch edge events
- Lazy evaluation: Minute-resolution only for detected event windows

**Project-Specific Gotchas**:

- Docker platform mismatch (exec format error)
- K8s Job not starting (image pull, PVC issues)
- PVC cleanup after job completion

**Project Files**:

- `caelundas.command.ts` includes pipeline orchestration
- `input.constants.ts` includes Zod validation
- `ephemeris.service.ts` includes NASA API client
- `calendar.service.ts` builds instant events
- `infrastructure/image.env` configures the shared Dockerfile's container build
