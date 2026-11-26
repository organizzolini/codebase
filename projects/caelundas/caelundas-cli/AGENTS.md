# caelundas-cli

Generate astronomical event calendars using NASA's JPL Horizons API (Output: rows in Postgres)

- **Database**: Postgres via TypeORM and `caelundas-db`'s `CaelundasDatabaseModule`, which wraps `@codebase/persistence`'s `DatabaseModule` (the `calendar_events`, `tags`, `tag_trees`, and `calendar_event_tags` tables, and the night sky's)

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
  calendar/                            # Building the instant events detectors report
  night-sky/                           # The night-sky command: HYG stars and d3-celestial figures
  refresh-metrics/                     # The refresh-metrics command: refreshes the metrics materialized view
    modules/metric-expressions/        # The metric-expressions command: draws each metric's expression tree as Mermaid in a Markdown file
  calendar-events/                     # Upsert over the calendar_events table
  tags/                                # Resolving raw tag strings to nodes of the tag tree
  ephemeris/                           # Swiss Ephemeris access; child modules: datetime/, math/, ephemeris-download/, boundary-search/ (walks to the minute a state starts or stops holding)
  perfective/                          # Exact moment event detection; child modules: one per event family (eclipses/, phases/, ...)
  progressive/                         # Duration event synthesis: pairs boundaries into spans, and completes the spans a window cuts off
  aspects/                             # Aspect detection; child modules: major-/minor-/triple-/.../specialty-aspects/, stellium/
```

**Key Domain Components**:

- **Input Validation** ([input.constants.ts](src/modules/input/input.constants.ts)): Zod schema for environment variables
- **Ephemeris Retrieval** ([ephemeris/](src/modules/ephemeris/)): Swiss Ephemeris, computed locally
- **Event Storage** ([calendar-events/](src/modules/calendar-events/)): Upserts detected events into Postgres
- **Event Detection** ([perfective/](src/modules/perfective/) and domain modules): Aspects, phases, eclipses, retrogrades
- **Progressive Synthesis** ([progressive/](src/modules/progressive/)): Pairs start/end moments into calendar events, and with the sweep's window completes the spans it cuts off (see [boundary-search/](src/modules/ephemeris/modules/boundary-search/))
- **Instant events** ([calendar/](src/modules/calendar/)): `CalendarService.buildInstantEvent`, which the daily-cycle and lunar detectors use

## Event Types

- **Aspects**: Conjunctions (0°), oppositions (180°), squares (90°), trines (120°), sextiles (60°)
- **Phases**: New moon, full moon, first/last quarters
- **Retrogrades**: Apparent backward motion of planets
- **Eclipses**: Solar and lunar
- **Ingresses**: Planets entering zodiac signs, and the stay in each sign, decan, and half of a sign (`SignTransitsService` finds the true entry and exit of the stays a window cuts off, so every body always has a sign; `IngressStaysService` builds the decan and half stays)
- **Progressive coverage**: README's "Which events have a span" table lists every span, its boundaries, and whether the run completes it at the window edges. A span is completed by finding the boundary the window cut off with `BoundarySearchService` (aspects: `AspectEdgesService`, and compound aspects by replaying those boundaries in `AspectsService`; retrograde and direct periods: `RetrogradesService`; stays: `SignTransitsService`). Every other family has a `*-edges.service.ts` beside its detector that implements `EdgeEventsFinder` (a cheap state test per probe, plus the family's own detector at the change, through `BoundarySearchService.findEdgeEvents`): `MonthlyLunarCycleEdgesService` (phases and apsides), `AnnualSolarCycleEdgesService` (points of the year, seasons, solar apsides), `TwilightsEdgesService`, `DailyCyclesEdgesService` (moonrise and moonset), `PhasesEdgesService` (Mercury and Venus rise, set, greatest elongation), and `EclipsesEdgesService`. `ProgressiveService` collects them through `EDGE_EVENTS_FINDERS_TOKEN` and hands each family's pairing the sweep's events plus the edge events, so a new family registers its finder in `ProgressiveModule`. A new span family wants a row in that table, a tag-map entry with note, icon, and rank, and an edge rule or a stated reason it has none
- **Cycles**: Solstices, equinoxes, moonrise/moonset (and the Moon Up span), sunrise/sunset, twilights, the pre- and post- intervals between the sixteen points of the Sun's year, and the Moon's advancing and retreating between apsides

## Domain Knowledge

Astronomical concepts, event detection, and storage:

- Swiss Ephemeris computes positions locally from JPL DE431 data files; there are no network calls or rate limits
- Aspects, retrogrades, and phases are detected in two passes: perfective (the exact moment) and progressive (the span around it)
- Detected events are stored in the `calendar_events` table, keyed by name, start, latitude, and longitude, so a re-run updates rows in place and a second location adds its own

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

- `calendar_events` (entity `CalendarEvent`): Detected calendar events, extending `PostgresqlUpdatableEntity`. Columns: `name`, `note`, `start`/`end` (`timestamptz`), `latitude` / `longitude` (`numeric(9, 6)`, strings from the driver), and `timezone`, the observer's IANA zone, which `InputService` derives from the coordinates. Unique on `(name, start, end, latitude, longitude)`. Ids are `uuidv7()` values the database assigns; never derive one in the CLI
- `tags` (entity `Tag`): A directed acyclic graph with many roots: a `name`, a `slug` (the name lowercased, runs of non-alphanumerics as one `-`, from `tagSlug` in `tags/tags.utilities.ts`; `TagsService` throws when two siblings would slug alike), an optional `note` and `icon` (a lucide slug) and a `rank` among its siblings, which a tag under several parents keeps once. A tag has no parent column: its parents are rows of `tag_edges`, and the database refuses a cycle and two siblings, or two roots, of one name or slug. A full path is derived by walking the edges; a tag with several parents has a path for each, and its depth is never a column
- `tag_edges` (the generated `TagEdge`, from `@Graph` on `Tag`): `source_node` the parent and `target_node` the child, cascading. Save a `Tag` with its repository, then insert its edges through `manager.getRepository("TagEdge")`, as `TagsService` does
- `tag_trees`: a materialized view of every `(ancestor_id, descendant_id)` pair over all paths, each tag with itself included. Nothing writes it: `refreshMetrics` refreshes it first, so read it only after a refresh in the same transaction
- `calendar_event_tags` (entity `CalendarEventTag`): The event-tag links, keyed on `(calendar_event_id, tag_id)`, both uuids, cascading from both sides, with the index `calendar_event_tags_tag_id_calendar_event_id` leading with the tag
- `stars`, `constellations`, `constellation_edges`: the night sky, keyed by Hipparcos number, IAU designation, and the constellation with its two stars

Detectors build `DetectedCalendarEvent` (`summary`, `description`, `start`, `end`, `tags`), and `CalendarEventsService` maps it to the table's `name` and `note` on the way in. The entity's shape differences from the table are settled in the entity, not at the call sites:

- **Times**: `start` and `end` are `Moment`s, through the column transformer `createMomentTransformer` builds in `caelundas-db`, which writes the instant and reads it back in UTC. A transformer, not a `Date` property, because every detector does moment arithmetic, and retyping would move a conversion into each of them.
- **Coordinates**: `latitude`/`longitude` stay strings, which only `CalendarEventsService` writes. The in-memory `geography`, `url`, `priority`, `color` and `location` fields are gone: no detector set them, and no column stores them.

A detected event, which has no id, audit columns, coordinates, or timezone yet, is `DetectedCalendarEvent` in `calendar-events.types.ts`, with its raw `tags: string[]`.

Tags go from raw strings to tree nodes in one place: `classifyEvent` in `tags/tags.utilities.ts` turns an event's raw tags into the root-to-node paths it is classified under, and `TagsService.resolve` inserts any missing node and edge. The static maps live in `tags/tag-map.constants.ts`: `SHARED_TAG_MAP` for raw tags that mean the same everywhere (bodies, signs, decans), and `CONTEXT_TAG_MAPS` keyed by the raw tag that marks a kind of event (`Simple Aspect`, `Ingress`, `Venusian`), so `Full` is a lunar phase under `Monthly Lunar Cycle` and a synodic stage under `Venusian`. The lookup tables behind the implied tags (element, body class, aspect nature, dignity, synodic stage) live in `tags/tag-dimensions.constants.ts`. Ingress kind, eclipse kind, dignity and temporality need several raw tags or the event's times, so `classifyEvent` derives them. An ingress that spans time is a Sign, Decan or Peak Transit, whose raw tags add `Decan` or `Peak` and a name (`Second Decan`, `Before Peak`), and a span of a retrograde or direct period carries `Retrogrades` or `Directs`, which map under `Planetary / Direction`. A raw tag no map knows falls back to a root of its own, and `Astronomy` and `Astrology` classify nothing. The roots in `TAG_ROOT` follow this project's module families and stay near ten, since the web's filter, group and sort menus open on them; a tag may have several parents, declared in `TAG_EXTRA_PARENTS` (`tags/modules/tag-metadata/tag-metadata.constants.ts`, keyed by the tag's own path and listing the other parents' paths), and `TagsService.resolve` then gives the one node an edge from each, creating a missing parent from its own path, so Venus, Mars, Jupiter and Saturn sit under Planet and under Benefic or Malefic. An event carries the node once and is under every parent through the closure, so an existing event picks up a new parent without being ingested again. A node's `rank` is its place among its own path's siblings. A node's four menu flags (`is_filterable`, `is_groupable`, `is_sortable`, `is_selectable`, all on unless the path is named) come from `TAG_MENU_EXCLUSIONS` in `tags/modules/tag-metadata/tag-metadata-flags.constants.ts`, keyed by its path like `TAG_METADATA`; `TagsService.resolve` writes them when it creates the node and updates a stored node whose flags differ, so a rerun brings them current (a tag under several parents takes those of its own path, never of an extra parent's). Filter leaves out the roots and the headers over a dimension no preset or View filters by (Element, Modality, Dignity, Harmonic and so on; their values stay, and a header a preset names, such as Ingress or Direction, stays filterable), Group a header over a single tag, and Sort and Select Benefic and Malefic. A node's `note` and `icon` come from `TAG_METADATA` in `tags/tag-metadata.constants.ts`, keyed by its path, and are written when `TagsService` first creates the node, with its `rank` from `TAG_CHILD_RANKS` in `tags/modules/tag-metadata/tag-metadata-rank.constants.ts`. An event links only to the deepest node of each branch and carries the nodes above it through the closure table. A new detector tag should get a map entry, not a new root.

Run the migration with `nx run caelundas-db:migration:run` (`migration:generate` makes the next one). `CalendarEventsService.upsert` runs in one transaction and takes the observer's coordinates and timezone. It writes rows in batches sized by their columns under Postgres's 65,535-parameter limit (`POSTGRES_MAXIMUM_PARAMETERS`, in `caelundas-cli.constants.ts`), uses `INSERT … ON CONFLICT (name, start, end, latitude, longitude) DO UPDATE … RETURNING`, so a re-run updates a row instead of duplicating it and the returned ids need no second read, and replaces each written event's `calendar_event_tags` rows with links to the nodes `classifyEvent` classifies it under. The database assigns `id`, `created_at` and `updated_at`. `TagsService.resolve` takes no lock: two runs inserting the same missing tag at once make the second fail on the unique name, and running it again succeeds.

**Metrics facts**: `CalendarEventsService.upsert` ends in `refreshMetrics`, which refreshes the `calendar_event_tag_sets` materialized view of `caelundas-db` concurrently, then rebuilds its `filters` and `calendar_event_facts` tables (in the same transaction). `nx run caelundas-cli:start:refresh-metrics` refreshes it from a shell, through `CaelundasDatabaseService.refreshMetrics`.

Inspect: `psql` with the `CAELUNDAS_POSTGRES_*` values, then `set search_path to caelundas`.

**Night sky tables**: the migration creates `stars` (keyed by `hipparcos_number`), `constellations` (keyed by IAU designation, with an `is_zodiac` flag) and `constellation_edges` (a figure's segment between two stars, `source_node` and `target_node` by Hipparcos number, generated by `@Graph` on `Constellation`, cascading on delete). The `night-sky` command (`nx run caelundas-cli:start:night-sky --stars <hyg.csv> --constellations <constellations.json> --lines <constellations.lines.json>`) rewrites all three in one transaction: the stars are bulk inserted, batched by columns under the parameter limit, and each constellation is saved with its `edges`, so the command never names the edge entity. Keep the attribution with the data: HYG v4.1 is CC BY-SA 4.0 (David Nash and the HYG contributors), so the stored catalog is a derived work under it; d3-celestial is BSD-3-Clause (Olaf Frohn) and its figures follow the IAU's charts rather than any GPL-licensed sky culture. `CAELUNDAS_DATABASE_MIGRATIONS`, from `caelundas-db`, lists the migration the tests' Testcontainers Postgres runs.

**Read model**: a tag's depth, root and path are read from `tags` and `tag_trees` (there are no derived tag tables). `CalendarEventsService.upsert` ends each transaction with `CaelundasDatabaseService.refreshMetrics` from `caelundas-db`, inside the transaction that wrote the events and any new tags, so a run leaves the facts current and a failed refresh stores nothing.

**Tests**: integration and end-to-end suites start a Testcontainers Postgres through `startCaelundasDatabase` in `testing/support/database.ts`, which runs the real migration and connects through `CaelundasDatabaseModule` from `CAELUNDAS_POSTGRES_*`. Docker must be running.

## Kubernetes Deployment

### Architecture

Caelundas runs as a **Kubernetes Job** (not Deployment):

- Single execution, terminates on completion
- Writes to Postgres only, no volume
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
```

### Helm Chart

Uses [infrastructure/helm/kubernetes-job](../../../infrastructure/helm/kubernetes-job) - reusable chart for batch jobs with PVC storage.

**Values**: [base.yaml](../../../infrastructure/helm/kubernetes-job/values/base.yaml) holds chart defaults only (its image is the placeholder `my-application`); there is no caelundas-specific values file, so override the image and `env` at deploy time.

See [infrastructure/AGENTS.md](../../../infrastructure/AGENTS.md) for the chart and the deployment pipeline.

### Environment Variables in K8s

The chart references no Secret by default; to inject them, create one and point `env` at it with `valueFrom.secretKeyRef` (see the commented example in `base.yaml`):

```bash
kubectl create secret generic caelundas-env-secret --from-env-file=.env
```

## Docker Workflow

### Build

**Platform targeting**: Always build with `--platform linux/amd64` for K8s deployment (Apple Silicon compatibility).

See [infrastructure/AGENTS.md](../../../infrastructure/AGENTS.md) for troubleshooting a Job that will not start.

### Dockerfile

Single-stage build:

- Base: Node.js 20 Alpine
- Native deps: python3, make, g++ (for native modules)
- Workspace: Full codebase copied (needed for path resolution)
- Entry: `pnpm start` (runs TypeScript directly via tsx)

## Performance

**Execution times** (1-year range, all event types):

- 1-2 minutes of local computation, plus a quick upsert

**Optimization strategies**:

- Temporal margins: Fetch beyond date boundaries to catch edge events
- Lazy evaluation: Minute-resolution only for detected event windows

**Project-Specific Gotchas**:

- Docker platform mismatch (exec format error)
- K8s Job not starting (image pull)

**Project Files**:

- `caelundas.command.ts` includes pipeline orchestration
- `input.constants.ts` includes Zod validation
- `ephemeris.service.ts` includes NASA API client
- `calendar.service.ts` includes the instant event builder
- `Dockerfile` includes container build config
