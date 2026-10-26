# CaelundasWeb: TanStack Start Web Application

## Quick Start

**Type**: Server-rendered web application (TanStack Start)

**Build**: Fully static, in TanStack Start's single-page mode: the build
renders one shell page ahead of time, every route renders in the browser, and
there are no server functions and no API

**Purpose**: Browse the astronomical events `caelundas-cli` calculates, as a
calendar over a SQLite database that ships inside the static build

### Run Locally

```bash
nx run caelundas-web:start
```

## Data Pipeline

The app reads one SQLite file in the browser. Nothing is fetched from a server
but that file:

1. `database export --sqlite` will write the `caelundas` schema's tables to a
   SQLite file. Until that lands, `build-database` stands in for it by loading
   `data/events-schema.sql` and the text seed `data/events-seed.sql`.
2. `data/events-views.sql` is applied over whatever wrote the tables. It owns
   every view the app reads: `tag_nodes` (each tag's depth, root, and path),
   `calendar_event_tags` (one row per event and tag, ancestors included,
   `is_direct` marking the tags given), and `calendar_events_derived` (each
   event with its duration, temporality, and UTC time parts).
3. `nx run caelundas-web:build-database` writes the result to
   `output/events.sqlite`, which is gitignored. `build` and `start` depend on
   it, and Vite emits it, the worker, and sqlite-wasm's `.wasm` file as
   fingerprinted assets.
4. In the browser, `events-database.worker.ts` downloads the file, opens it
   read-only in memory with sqlite-wasm, and answers selects. No persistent
   storage is used, so no cross-origin isolation headers are needed.

Every query lives in `src/lib/events-database/events-database.ts`, behind the
`EventsDatabase` interface, over a `SqlExecutor`. The browser's executor posts
each select to the worker; the tests' executor runs it on `node:sqlite` over
the same three SQL files. The route reads the database from the router
context, which is how a test hands it another one.

## Architecture Overview

### Tech Stack

- **Framework**: TanStack Start (server rendering, server functions) on Vite
- **Routing**: TanStack Router, file-based, from `src/routes/`
- **UI**: React 19 with Tailwind CSS 4
- **Calendar**: the vendored ReUI event calendar from `@codebase/presentation`,
  composed here and never edited
- **Data**: sqlite-wasm in a Web Worker, over a SQLite file bundled at build
- **Testing**: Vitest and React Testing Library under jsdom

### Directory Layout

```text
src/
  client.tsx                     # Client entry, hydrates the document
  router.tsx                     # Creates the router; TanStack Start requires it here
  routeTree.gen.ts               # Generated route tree — never edit
  routes/
    __root.tsx                   # Document shell every route renders inside
    <route>.tsx                  # One file per route, e.g. index.tsx, word.$id.tsx
    <route>.integration.test.tsx # Ignored by the route generator
  components/
    <component>.tsx
    <component>.unit.test.tsx
  hooks/
    use-<hook>.ts
    use-<hook>.unit.test.ts
  modules/
    <feature>/                   # Server functions and the utilities behind them
  styles/
    application.css
testing/
  render-route.tsx               # Renders a route through a real router
  setup.ts                       # Shared test setup
```

The calendar adds its data layer and the files that build its database:

```text
src/
  lib/
    calendar/                    # Search parameters, windows, loader, formatting
    events-database/             # EventsDatabase, its SQL, worker, and client
data/
  events-schema.sql              # The exported tables, for tests and the build
  events-seed.sql                # Text seed standing in for exported rows
  events-views.sql               # Views applied over the export
scripts/
  build-events-database.ts       # Writes output/events.sqlite
output/                          # Gitignored build artifact
testing/
  events-database.ts             # node:sqlite EventsDatabase over data/*.sql
```

## Development

Scaffold with the generators rather than writing these shapes by hand — each one
is also the standard its files are validated against:

```bash
nx g conformetry:tanstack-route --name=<file-stem> --path=<url-path> --project=caelundas-web
nx g conformetry:tanstack-server-function --name=<feature> --project=caelundas-web
nx g conformetry:react-component --name=<component> --project=caelundas-web
nx g conformetry:react-hook --name=use-<hook> --project=caelundas-web
```

### Routes

A route's name is its file stem — `index`, `search`, `word.$id` — and its route
path is the URL it serves: `/`, `/search`, `/word/$id`. TanStack's route
generator rewrites the path argument to match the file whenever they disagree,
and regenerates `src/routeTree.gen.ts` on every `start` or `build`. Each page
is a `<section>` with an `<h1>`, named after its route — `word.$id` renders
`WordIdPage` — inside the layout the root route renders.

Keep a route file to its `Route` and the page it renders. Reusable pieces belong
in `src/components/`, stateful logic in `src/hooks/`, and anything that runs on
the server in `src/modules/`.

### Loaders and Actions

TanStack Start has no separate loader or action files. Data is read by a GET
server function called from the route's `loader`, then read in the page with
`Route.useLoaderData()`. Data is written by a POST server function called from a
component through `useServerFn`, followed by `router.invalidate()` so every
loader on the page runs again.

A generated server function module keeps that logic in `<feature>.utilities.ts`,
outside `createServerFn`, so it is unit tested without the Start runtime. Add
`zod` to this project's dependencies before generating the first one:

```bash
pnpm add --filter caelundas-web zod
```

### Key Commands

```bash
nx run caelundas-web:start      # Development server
nx run caelundas-web:build        # Production build into dist/
nx run caelundas-web:preview      # Serve the production build
nx run caelundas-web:vitest       # Unit tests
nx run caelundas-web:typecheck-code,lint-code,format-code,deprecate-code,guard-code
```

### Testing

Route tests call `renderRoute` from `testing/render-route.tsx`, which loads
the real route tree in a memory-history router under a bare root, so the
route's loader, head, and page all run as a navigation would run them. They are
integration tests for that reason, and the distinct suffix is also what tells a
route's files apart from a component's when conformance is checked.
`vitest.config.ts` deliberately leaves the TanStack Start plugin out, so route
components are not code-split into lazy chunks under test.

See the [write-react skill](/.agents/skills/write-react/SKILL.md) for
component conventions and the
[testing-strategy skill](/.agents/skills/testing-strategy/SKILL.md) for
test tiers.

## Layout

The page is the month view across the whole viewport under a single toolbar
row: today, previous and next, the month's title, the active filters as chips,
the Filters button with a count of the finished rules, and the view selector,
which holds only Month so far. Times render in the zone the dataset's events
carry.

- The Filters button opens the vendored ReUI builder, nested AND/OR groups
  included: as a popover from 1024 pixels wide, a drawer from the side from
  768, and a bottom sheet below that. It never stays open over the calendar.
- The chips scroll sideways in the row rather than wrap it, and are left out
  below 768 pixels, where the count stands for them. `CalendarFilters` holds
  the tree being edited, so an edit shows before the link catches up, and
  writes it to the link only when the compiled query changes: an unfinished
  rule does not reload the calendar. The facets are read once per database.
- The fields come from the data: one per tag root, offering every tag beneath
  it, so a new root needs no code change. Date range, weekday, hour,
  duration bucket, temporality, and text search follow them; a tag root
  named like one of those is left to the derived field.
- Date, weekday, and hour are read in each event's own zone through the
  `event_local_*` SQL functions in
  `src/lib/events-database/events-database.local-time.ts`, which the worker
  and the tests' executor both register: SQLite itself knows no zones.

- While the database loads, `CalendarSkeleton` stands in for the page.
- A failed load shows `CalendarError` with Retry; a browser without
  WebAssembly or Web Workers gets an explanation and no retry.
- A month with no events keeps the calendar and lays `CalendarEmpty` over it:
  "No events yet" for an empty database, "Outside the data" with a jump to the
  first covered day, or "No events this month" inside the covered dates.
- The `date` search parameter (`YYYY-MM-DD`) holds the month; one that does
  not parse falls back to today.
- The `filter` search parameter holds the ReUI filter tree as JSON, validated
  in `src/lib/calendar/calendar-search.ts`; one that does not parse is
  dropped. `compileEventFilter` in `src/lib/event-filters/` turns it into the
  SQL condition `findEvents` applies, leaving out unfinished rules, and a
  month the filters empty says so apart from one with no events at all.

## Key Files

- [src/router.tsx](src/router.tsx): Router factory
- [src/routes/\_\_root.tsx](src/routes/__root.tsx): Document shell
- [vite.config.mts](vite.config.mts): TanStack Start, Tailwind, and React plugins
- [vitest.config.ts](vitest.config.ts): Test configuration
- [src/lib/events-database/events-database.types.ts](src/lib/events-database/events-database.types.ts):
  The `EventsDatabase` interface
- [src/routes/index.tsx](src/routes/index.tsx): The calendar page
- [data/events-views.sql](data/events-views.sql): The post-export views
