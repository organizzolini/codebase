---
type: testing-guide
title: Caelundas Testing
description: Caelundas-specific testing strategy covering NestJS CLI command testing, Swiss Ephemeris calculation verification, event detection accuracy tests against reference fixtures, Postgres integration tests with Testcontainers, and TanStack Start web component testing.
tags: [caelundas, testing, nestjs, swiss-ephemeris, vitest, tanstack-start, testcontainers]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-22T00:18:20.862Z
sources:
  - id: openwiki-source-694bf562c061967517e6158b
    resource: repo://projects/caelundas/caelundas-cli/configuration/vitest.config.ts
  - id: openwiki-source-e32c9a740194ebef315a645b
    resource: repo://projects/caelundas/caelundas-cli/src/caelundas-cli.main.end-to-end.test.ts
  - id: openwiki-source-2721637f4b2014ef3882c3e2
    resource: repo://projects/caelundas/caelundas-cli/src/caelundas-cli.main.unit.test.ts
  - id: openwiki-source-4117a805f81c95fc92ec4b7d
    resource: repo://projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.integration.test.ts
  - id: openwiki-source-92352ff85a64b8546a23cc5f
    resource: repo://projects/caelundas/caelundas-cli/src/modules/perfective/modules/retrogrades/retrogrades.service.unit.test.ts
  - id: openwiki-source-0ea97f77bae1975a6252d157
    resource: repo://projects/caelundas/caelundas-cli/testing/aspects/compound-aspect-seeding.end-to-end.test.ts
  - id: openwiki-source-2ceb9d03ca475945a8b308ae
    resource: repo://projects/caelundas/caelundas-cli/testing/aspects/compound-aspects.end-to-end.test.ts
  - id: openwiki-source-8e8e12018a2251c948b82dee
    resource: repo://projects/caelundas/caelundas-cli/testing/aspects/stellium-reference.unit.test.ts
  - id: openwiki-source-5b3ad21bcba216905df9219d
    resource: repo://projects/caelundas/caelundas-cli/testing/pipeline/moon-phases-reference.end-to-end.test.ts
  - id: openwiki-source-083456f3ce513b04bbf8fb59
    resource: repo://projects/caelundas/caelundas-cli/testing/pipeline/pipeline-window.functions.ts
  - id: openwiki-source-a66a3213614922c12a408987
    resource: repo://projects/caelundas/caelundas-cli/testing/pipeline/pipeline-window.module.ts
  - id: openwiki-source-5c1abf299bd75bc050fa0253
    resource: repo://projects/caelundas/caelundas-cli/testing/reference/reference-fixtures.constants.ts
  - id: openwiki-source-b16814f256e6d154ce64ad35
    resource: repo://projects/caelundas/caelundas-cli/testing/reference/reference-fixtures.utilities.ts
  - id: openwiki-source-7fddd845db3c2245e1686b29
    resource: repo://projects/caelundas/caelundas-cli/testing/reference/reference-fixtures.utilities.unit.test.ts
  - id: openwiki-source-13c692d8873d1ab0210b3024
    resource: repo://projects/caelundas/caelundas-cli/testing/support/calendar-command.utilities.ts
  - id: openwiki-source-0e5cf6f8d0ad4b2a32ad923d
    resource: repo://projects/caelundas/caelundas-cli/testing/support/database.ts
  - id: openwiki-source-c36af5283e8413e936075b4a
    resource: repo://projects/caelundas/caelundas-web/configuration/vitest.config.ts
  - id: openwiki-source-0e076c9da0cc0b4557956f93
    resource: repo://projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-toolbar/calendar-toolbar.unit.test.tsx
  - id: openwiki-source-54fa9c76a245b90330f4568f
    resource: repo://projects/caelundas/caelundas-web/src/routes/index.integration.test.tsx
  - id: openwiki-source-46c49a779c15dfd3a8e23b9c
    resource: repo://projects/caelundas/caelundas-web/testing/calendar-api.ts
  - id: openwiki-source-3feddf5fa3628b08e66f1dbb
    resource: repo://projects/caelundas/caelundas-web/testing/calendar-fixture.ts
  - id: openwiki-source-61817297cf780fb768ba742e
    resource: repo://projects/caelundas/caelundas-web/testing/graphql-api.ts
  - id: openwiki-source-71656a267ec0ff8ea3453fe1
    resource: repo://projects/caelundas/caelundas-web/testing/render-route.tsx
  - id: openwiki-source-03b4584f177b586a2be47d96
    resource: repo://projects/caelundas/caelundas-web/testing/setup.ts
  - id: openwiki-source-dfbf5d9f3d237bbb281c86bb
    resource: repo://projects/caelundas/caelundas-web/testing/viewport.ts
  - id: openwiki-source-6616b722900016f930b42ae1
    resource: repo://projects/common/persistence/testing/database-testing/database-testing.types.ts
  - id: openwiki-source-d43cf1b76d511df31f2fb62d
    resource: repo://projects/common/persistence/testing/database-testing/database-testing.utilities.ts
generated: { by: "claude-code", at: "2026-11-22T00:18:20.862Z" }
---

# Caelundas Testing

Caelundas operates two distinct test suites: a **CLI application** (`caelundas-cli`) that computes astronomical calendars using the Swiss Ephemeris, and a **web application** (`caelundas-web`) that renders those calendars in a TanStack Start SPA. Each suite has its own Vitest configuration, test utilities, and integration patterns, while sharing a common persistence testing layer for PostgreSQL.

## Architecture Overview

```mermaid
flowchart TD
    subgraph CLI["caelundas-cli"]
        CLI_UNIT["Unit Tests\n(nest-commander mocking,\nservice logic)"]
        CLI_E2E["End-to-End Tests\n(real NestJS app,\nstand-in detectors,\nPostgres persistence)"]
        CLI_DETECTION["Event Detection Tests\n(reference fixtures:\nUSNO, JPL Horizons, NASA)"]
        CLI_PIPELINE["Pipeline Window Tests\n(full detection sweep\nminute-by-minute)"]
    end

    subgraph WEB["caelundas-web"]
        WEB_UNIT["Component Unit Tests\n(React Testing Library,\njsdom)"]
        WEB_INTEGRATION["Route Integration Tests\n(TanStack Router,\nin-memory history)"]
        WEB_DB["Mocked API Tests\n(MSW GraphQL handlers,\nfixture calendar)"]
    end

    subgraph COMMON["common/persistence/testing"]
        PG_TEST["PostgreSQL Testcontainers\n(startDatabaseTestingModule)"]
        PG_FIXTURES["Persistence Fixtures"]
    end

    CLI_E2E --> CLI_DETECTION
    CLI_PIPELINE --> CLI_DETECTION
    WEB_INTEGRATION --> WEB_DB
    CLI_E2E --> PG_TEST
    WEB_DB --> PG_TEST
```

---

## CLI Application Testing (`caelundas-cli`)

### Vitest Configuration

The CLI suite extends a shared base configuration (`vitestConfig` from `@codebase/configuration/vitest.config.ts`) with CLI-specific coverage rules:

- **Environment**: Node (default)
- **Coverage exclusions**: Entity files (`*.entity.ts`) and test files (`*.test.ts`)
- **Setup**: the shared `@codebase/testing/setup` file listed by the base config

### NestJS CLI Command Testing with `nest-commander`

The entry point `CaelundasCommand` (decorated with `@Command`) is tested at two levels:

#### Unit Tests (`src/caelundas-cli.main.unit.test.ts`)

Mocks `nest-commander`'s `CommandFactory.run` to verify bootstrap behavior without executing the command:

```typescript
vi.mock("nest-commander", async (importOriginal) => {
  const actual = await importOriginal<typeof NestCommanderModule>();
  return {
    ...actual,
    CommandFactory: { run: mockCommandFactoryRun },
  };
});
```

**Verified behaviors**:
- CommandFactory runs exactly once with `MainModule` as root module
- Options include `bufferLogs: true` and a logger instance
- `serviceErrorHandler` sets `process.exitCode = 1` and logs the error

#### End-to-End Tests (`src/caelundas-cli.main.end-to-end.test.ts`)

Boots a **real NestJS application context** per test run via the `runCalendarCommand` utility. Only the two event detectors (`PerfectiveService`, `ProgressiveService`) are replaced with stand-ins; everything else (input parsing, ephemeris verification, calendar rendering, Postgres persistence) runs for real.

**Key utility**: `testing/support/calendar-command.utilities.ts`
- `runCalendarCommand(run, detectableEvents)` — stubs env vars (`START_DATE`, `END_DATE`, `LATITUDE`, `LONGITUDE`, `OUTPUT_DIRECTORY`), creates a dynamic module with stand-in detectors, executes `CaelundasCommand.run()`, reads generated `.ics` and `.json` files
- `detectable(summary, start, end?)` — factory for test events with UTC moments

**E2E test categories**:
| Category | Coverage |
|----------|----------|
| **ICS file generation** | Structure, VTIMEZONE, VEVENT, optional fields (LOCATION, COLOR) |
| **Input validation** | Coordinate transformation, timezone inference (IANA zones) |
| **Event detection** | Zodiac signs from longitude, major aspects with orb, progressive pairing |
| **Math utilities** | Degree normalization (360°, negative), angle across 0° boundary, combinations |
| **Postgres persistence** | Row upsert idempotency, overlapping range updates, multi-location separation, cross-range spanning events, boundary-day inclusion |

**Database**: `testing/support/database.ts` exports `startCaelundasDatabase`, which wraps `startDatabaseTestingModule` from `@codebase/persistence/testing`: a throwaway Postgres 18 Testcontainers instance, the real `caelundas-db` migration applied, and `CAELUNDAS_POSTGRES_*` set for the test (Docker must be running). The suites that need a database wait up to `DATABASE_TIMEOUT_MILLISECONDS` (120 s) for the container to start.

---

### Event Detection Accuracy Tests

The core of Caelundas testing is verifying Swiss Ephemeris calculations against **authoritative reference data**. Three categories of reference fixtures are committed:

| Source | Authority | Coverage |
|--------|-----------|----------|
| **USNO** | U.S. Naval Observatory | Moon phases, equinoxes/solstices, rise/set/twilight, solar/lunar eclipses (topocentric) |
| **JPL Horizons** | NASA JPL Solar System Dynamics | Planetary positions (longitude, latitude, distance), stelliums, compound aspects |
| **NASA** | NASA Eclipse Website | Solar/lunar eclipse circumstances (geocentric) |

Fixtures live in `testing/reference-fixtures/` and `testing/reference-longitudes/`. Each JSON file includes:
- `source`: { `name`, `url` }
- `retrieved`: ISO date of retrieval
- `toleranceMinutes`: acceptable delta (typically 1–5 minutes)
- `window`: { `startDate`, `endDate`, `latitude`, `longitude` }
- `events[]`: { `summary`, `start`, `end?`, `toleranceMinutes?` }
- `absent[]`: summaries that **must not** be detected
- `counts`: { `summary`: expected count }

#### Assertion Utility: `assertReferenceEvents`

Located in `testing/reference/reference-fixtures.utilities.ts`, this is the primary verification function:

```typescript
assertReferenceEvents(detectedEvents: DetectedCalendarEvent[], fixture: ReferenceFixture): void
```

**Algorithm**:
1. Pair each reference event with the nearest detected event sharing its `summary`
2. Compute `startDeltaMinutes` (and `endDeltaMinutes` for spans)
3. Pass if `|delta| ≤ toleranceMinutes` (per-event or fixture default)
4. Fail if any `absent` summary appears, or any `counts` summary occurs ≠ expected times
5. Error message cites fixture source, retrieval date, and per-event deltas

**Unit tests for the assertion utility** (`reference-fixtures.utilities.unit.test.ts`) verify:
- Pass/fail at tolerance boundaries
- Nearest-event pairing (ignoring other summaries)
- End-time checking for spans
- Absent and counts enforcement

#### Detection Test Patterns

Each event family has dedicated test files using the reference fixtures:

| Test File | Event Family | Approach |
|-----------|--------------|----------|
| `moon-phases-reference.end-to-end.test.ts` | Primary Moon phases (New, 1Q, Full, 3Q) | Sweeps ±30 min around each USNO 2026 phase; computes Moon/Sun ephemeris via real `EphemerisService`; runs `MonthlyLunarCycleService.detect` minute-by-minute |
| `compound-aspects.end-to-end.test.ts` | T-squares, kites, stelliums | Runs full `PipelineWindowModule` (both perfective & progressive passes) over real windows; checks deduplication, T-square emission (1 boundary pair + 1 span), dissolution alignment with leg endings |
| `compound-aspect-seeding.end-to-end.test.ts` | Aspect seeding correctness | Verifies simple aspects forming at window start were **out of orb** one minute earlier using real ephemeris (not caelundas' own state) |
| `eclipse-test.utilities.ts` + `pipeline-window` tests | Solar/lunar eclipses | Synthetic track coordinates (Moon along/cross track through antisolar/Sun point); verifies contact limits (P1/P4, U1/U3) against independently computed geometry |
| `retrogrades.service.unit.test.ts` + `retrogrades.service.integration.test.ts` | Planetary stations (retrograde/direct) | Unit: spies private `isRetrograde`/`isDirect` predicates; Integration: 61-minute longitude windows (30 before/after) for all `retrogradeBodies`; verifies event shape (tags, summary, timestamp) |
| `stellium-reference.unit.test.ts` | Stelliums (≥3 conjunct bodies) | JPL Horizons longitude fixtures; builds conjunction registry at each boundary minute; runs `StelliumService.detect`/`detectProgressive`; compares boundaries and spans against fixture |

#### Pipeline Window Tests

`testing/pipeline/pipeline-window.module.ts` assembles a minimal Nest module (`PerfectiveModule` + `ProgressiveModule`) for full detection sweeps. `testing/pipeline/pipeline-window.functions.ts` provides `runPipelineWindow(window)` which:
1. Boots `PipelineWindowModule`
2. Computes ephemerides for the window
3. Runs perfective detection day-by-day, minute-by-minute
4. Runs progressive detection on perfective output
5. Returns `{ input, perfective, progressive, events }`

Used by compound-aspect, moon-phase, and seeding tests to exercise the **entire detection pipeline** against real ephemeris data.

---

### Swiss Ephemeris Calculation Verification

The `EphemerisService` orchestrates four computation types through sub-services:

| Sub-service | Computation | Swiss Ephemeris Calls |
|-------------|-------------|----------------------|
| `EphemerisCoordinateService` | Ecliptic longitude, latitude, distance | `calc()` per body per minute |
| `EphemerisHorizonService` | Azimuth, elevation, rise/set/transit | `calc()` + `azalt()` |
| `EphemerisPhenomenaService` | Phase angle, illumination, elongation | Derived from coordinate results |
| `EphemerisAggregationService` | Combines all four in single pass | Eliminates redundant `calc()` calls |

**Verification strategy**:
- **Unit level**: `EphemerisCoordinateService` etc. have unit tests with known inputs
- **Integration level**: Pipeline window tests compare aggregated output against reference fixtures
- **Regression level**: Reference fixtures are **committed JSON**; any Swiss Ephemeris version change or algorithm change will cause fixture mismatches, flagging the change

**Ephemeris file verification**: `EphemerisService.verifyFiles()` asserts required `.se1`/`.se2` files exist before any computation runs.

---

## Web Application Testing (`caelundas-web`)

### Vitest Configuration

Extends shared base config with web-specific settings:
- **Environment**: `jsdom`
- **Coverage exclusions**: Test files, server functions (`*.functions.ts`, which only run inside Start), generated GraphQL client code, and router entry points (`client.tsx`, `router.tsx`, `routeTree.gen.ts`, `__root.tsx`)
- **Timeout**: fifteen seconds per test, since a jsdom test that opens the calendar's menus can take over five on a loaded CI runner
- **Path alias**: `@` → `../../common/presentation/src` for vendored components

### Global Test Setup (`testing/setup.ts`)

jsdom lacks layout, scrolling, animation, and resize. Setup installs:
- `Element.prototype.scrollTo` → no-op
- `Element.prototype.getAnimations` → `[]`
- `globalThis.ResizeObserver` → fires callback immediately with `target.getBoundingClientRect()`
- `installViewport()` from `testing/viewport.ts` — simulates viewport dimensions for responsive components
- The shared `@codebase/testing/react/setup` jsdom setup (Testing Library cleanup), the mock GraphQL server started once and reset after each test, and the calendar loader caches cleared after each test

### Component Unit Tests

Located in `src/components/*.unit.test.tsx`, using **React Testing Library** + Vitest:
- Render component with props
- Query by role/test-id/text
- Assert class names, structure, accessibility attributes
- Fire events (`fireEvent.click`, `fireEvent.keyDown`) for interactions
- Use `vi.fn()` for callback props

**Example**: `calendar-toolbar.unit.test.tsx` verifies:
- Class name application
- Period title rendering
- Compact (phone) vs. wide layout
- Navigation group (Previous/Next/Today) with heading
- Today button disabled state when current month includes today

### Route Integration Tests

`testing/render-route.tsx` renders the **full TanStack Start router** at a given path:

```typescript
export async function renderRoute(path: string, options: RenderRouteOptions = {}) {
  const router = getRouter();
  router.update({
    ...router.options,
    context: { eventsDatabase: options.eventsDatabase ?? createTestEventsDatabase() },
    history: createMemoryHistory({ initialEntries: [path] }),
    scrollRestoration: false,
  });
  if (options.waitForLoad === false) {
    render(<RouterProvider router={router} />);
    return;
  }
  await router.load();
  render(<RouterProvider router={router} />);
}
```

**Key features**:
- Mocks `__root.tsx` (which renders `<html>`) with a bare root route
- Serves the mocked calendar API (the fixture calendar) the route loader queries
- Runs route loader (`await router.load()`) before rendering
- Uses `createMemoryHistory` for navigation simulation

**Route test utilities** (`testing/calendar-page.ts`):
- `findToolbar()` — locates calendar toolbar
- `pickOption(name)` — clicks combobox option
- `startFilterRule(field, operator)` — opens filter builder, selects field & operator

**Event filter test utilities** (`testing/event-filters.ts`):
- `tagRule(root, operator, tags[])` — builds rule for seed tag hierarchy
- `filterGroup(combinator, rules[])` — builds filter query
- `filterLink(date, filter)` — encodes filter as URL search param
- `findMatchingEventIds(query, options?)` — compiles filter to SQL, executes against test database, returns event IDs

### Mocked API Testing

`caelundas-web` holds no data of its own, so its tests serve a **mocked GraphQL API** instead of a database:

- `testing/graphql-api.ts` — `serveGraphqlApi(...handlers)` registers typed generated handlers on the shared `graphqlMockServer` from `@codebase/interface/testing` (an MSW server that `testing/setup.ts` starts, resets after each test and stops).
- `testing/calendar-fixture.ts` — the fixture calendar: a few weeks around March 2026 with a gap until late June, one New York observer, and a tag tree, with short ids such as `tag-mars` standing in for database uuids.
- `testing/calendar-api.ts` — `serveCalendarApi(options)` answers the events, facets, dataset, windows, presets and night-sky queries from that fixture, using the mock handlers GraphQL Code Generator emits into `src/graphql/generated/mocks`.
- `testing/render-route.tsx` — renders a route under a bare root (the real `__root` renders a whole `<html>` document) with `createMemoryHistory`, on top of `renderRoute` from `@codebase/testing/react`.

**Integration test example** (`src/routes/index.integration.test.tsx`): renders the `/` route against the mocked API, then exercises month navigation, the filter builder and the error and recovery states by overriding the handlers a test serves.

---

## Common Persistence Testing (`common/persistence/testing`)

Provides **PostgreSQL Testcontainers** integration for any project needing a real database.

### `startDatabaseTestingModule(options)`

```typescript
const database = await startDatabaseTestingModule({
  project: "myproject",
  entities: [MyEntity],
  migrations: [Migration123],
  imports: [FeatureModule],
});
const repo = database.repository(MyEntity);
// ... test ...
await database.close();
```

**What it does**:
1. Starts throwaway PostgreSQL container via `startPostgresContainer` (Testcontainers)
2. Sets container's `<PROJECT>_POSTGRES_*` env vars on `process.env` (overriding existing)
3. Compiles NestJS testing module with:
   - Global `ConfigModule` (validates via optional `validate` fn)
   - `PostgresqlModule.forRoot({ entities, project, namingStrategy })` **or** project's own database module
   - `TypeOrmModule.forFeature(entities)`
   - Any additional `imports`/`providers`
4. Runs migrations
5. Returns `{ close, container, dataSource, module, repository }`
6. `close()`: destroys module, restores environment, stops container

**Use cases**: Integration tests requiring real PostgreSQL behavior (constraints, indexes, JSONB, full-text search) that an in-memory database cannot replicate.

---

## Test Organization Summary

### CLI Test Files

| Path | Purpose |
|------|---------|
| `src/caelundas-cli.main.unit.test.ts` | CLI bootstrap, error handling |
| `src/caelundas-cli.main.end-to-end.test.ts` | Full pipeline: input, detection, persistence, ICS/JSON |
| `testing/support/calendar-command.utilities.ts` | E2E command runner with stand-in detectors |
| `testing/support/database.ts` | `startCaelundasDatabase`: a throwaway migrated Postgres per suite |
| `testing/support/eclipse-test.utilities.ts` | Synthetic eclipse track coordinates, contact limits |
| `testing/reference/reference-fixtures.utilities.ts` | `assertReferenceEvents`, fixture loading, comparison |
| `testing/reference/reference-fixtures/*/*.json` | Committed USNO, JPL Horizons and NASA reference fixtures, by event family |
| `testing/reference/reference-longitudes/*.json` | Horizons longitudes for stellium tests |
| `testing/aspect-test.utilities.ts`, `testing/aspects/major-aspects.utilities.ts` | Ephemeris fixtures and services for aspect detection |
| `testing/aspects/compound-aspects.end-to-end.test.ts` | Compound aspect deduplication, T-square shape |
| `testing/aspects/compound-aspect-seeding.end-to-end.test.ts` | Seeding correctness at window boundaries |
| `testing/aspects/stellium-reference.unit.test.ts` | JPL Horizons stellium verification |
| `testing/pipeline/pipeline-window.*` | Full detection sweep module and runner |
| `testing/pipeline/moon-phases-reference.end-to-end.test.ts` | USNO Moon phase verification |
| `testing/pipeline/pipeline-reference-*.end-to-end.test.ts` | Pipeline sweeps checked against the reference fixtures |
| `src/modules/**/*.integration.test.ts` | Per-service integration tests (aspects, retrogrades, ingresses, phases, calendar events, night sky) |

### Web Test Files

| Path | Purpose |
|------|---------|
| `testing/setup.ts` | jsdom polyfills, MSW server lifecycle, calendar cache reset |
| `testing/render-route.tsx` | Full router render against the mocked API |
| `testing/graphql-api.ts`, `testing/calendar-api.ts` | Mock GraphQL handlers answering from the fixture |
| `testing/calendar-fixture.ts`, `testing/calendar-facets.ts` | The fixture calendar and its facets |
| `testing/event-filters.ts`, `testing/calendar-page.ts` | Filter helpers and interaction helpers |
| `testing/viewport.ts` | Viewport simulation for responsive components |
| `src/routes/index.integration.test.tsx` | Full route: render, navigation, filtering, error recovery |

### API and Database Test Files

| Path | Purpose |
|------|---------|
| `caelundas-api/testing/events-application.ts` | An events application over a migrated Testcontainers Postgres |
| `caelundas-api/testing/no-database.module.ts` | Stand-in module for suites that need no database |
| `caelundas-db/src/modules/caelundas-database/*.integration.test.ts` | The real migration, base rows, and the refreshed read model against Postgres |

### Common Persistence Test Files

| Path | Purpose |
|------|---------|
| `testing/database-testing/database-testing.utilities.ts` | `startDatabaseTestingModule` |
| `testing/database-testing/database-testing.types.ts` | `DatabaseTestingModule`, options types |
| `testing/postgres-container/postgres-container.utilities.ts` | `startPostgresContainer` |
| `testing/fixture-persistence.ts` | Fixture loading for persistence tests |
| `testing/command-line-runner.ts` | CLI test runner for persistence |
| `testing/mocks.ts` | Mock repositories, datasources |

---

## Running Tests

### CLI Suite
```bash
# From caelundas-cli directory
pnpm test                    # All tests
pnpm test -- --run           # CI mode (no watch)
pnpm test src/caelundas-cli.main.end-to-end.test.ts  # Specific file
```

### Web Suite
```bash
# From caelundas-web directory
pnpm test                    # All tests (jsdom)
pnpm test -- --run           # CI mode
```

### Coverage
Both suites generate coverage reports (exclusions defined in each project's `configuration/vitest.config.ts`). CLI excludes entities; web excludes server functions, generated GraphQL code and router entry points.

---

## Key Testing Principles

1. **Reference fixtures as contracts**: Committed JSON from USNO/JPL/NASA are the source of truth. Algorithm changes must update fixtures intentionally.
2. **Real ephemeris in detection tests**: Pipeline window tests compute actual Swiss Ephemeris positions; only detectors are stood in for E2E command tests.
3. **Stand-in detectors for speed**: `PerfectiveService`/`ProgressiveService` replaced in `runCalendarCommand` because Swiss Ephemeris computation takes minutes per day.
4. **Real Postgres for persistence tests**: CLI, API and database-package suites start a throwaway Testcontainers Postgres and run the real migration, so tests exercise the production schema (Docker must be running).
5. **A mocked API for web tests**: `caelundas-web` holds no data, so its tests serve typed GraphQL handlers from a fixture calendar through MSW rather than a database.
6. **Testcontainers only where a database is the point**: unit tests stay free of Docker; only the integration and end-to-end suites start a container.
7. **jsdom polyfills for layout-dependent components**: ResizeObserver, scroll, animations mocked to avoid flakiness.
8. **TanStack Router integration tests**: Full router with loaders, not shallow component tests, to catch loader/context bugs.
