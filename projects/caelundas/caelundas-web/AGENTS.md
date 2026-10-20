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
   everything the app reads beyond them: `tag_nodes` (each tag's depth, root,
   and path), `calendar_event_tag_nodes` (one row per event and tag, ancestors
   included, `is_direct` marking the tags given), and the view
   `calendar_events_derived` (each event with its duration, temporality, and
   UTC time parts). The first two are written out as indexed tables rather
   than views: the file never changes once built, and as views every grouping
   and tag filter recomputed the tree's depth, root, and path per tag, which
   made a grouped read twenty to fifty times slower.
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

The views' route tests live in `src/lib/calendar/calendar-views.integration.test.tsx`, beside
the route's own, only to keep each file under the line limit; shared steps
live in `testing/calendar-page.ts`.

See the [write-react skill](/.agents/skills/write-react/SKILL.md) for
component conventions and the
[testing-strategy skill](/.agents/skills/testing-strategy/SKILL.md) for
test tiers.

## Layout

The page is the calendar across the whole viewport under a single toolbar
row: today, previous and next, the period's title, the active filters as
chips, the Filters button with a count of the finished rules, and the view
selector. Times render in the zone the dataset's events carry.

- The views are month, week, three-day, day, agenda, and timeline, listed in
  `src/lib/calendar/calendar-views.ts`; the app owns that list, so a view is
  added or cut there. The `view` search parameter holds the one picked.
  Without it, the view follows the width: the agenda below 768 pixels, the
  month above, read synchronously so the first render is already right.
- Three widths are told apart, in `src/lib/calendar/calendar-viewport.ts`: a
  phone below 768 pixels, a tablet from 768, and a desktop from 1024. Below a
  desktop the view selector is a menu, as six buttons do not fit beside the
  other controls. On a phone the week also scrolls sideways with a sticky
  hour column (the time grid in page scroll mode inside a scrolling content
  area), the controls take a row of their own under the title, and the title
  wraps rather than being cut.
- One toolbar sits above every view and is never remounted by a change of
  view, so the focus on its view selector survives it: each view reports how
  it moves (`onNavigationChange`), because only a child of the vendored
  calendar or Gantt can read that, and the toolbar calls the latest report.
- The agenda and a month cell's "+N more" list are the app's own, windowed by
  `VirtualList` over the pure functions in
  `src/lib/calendar/calendar-virtual-window.ts`. An event is listed once, on
  the day it begins, or on the first day for one already under way.
- Each load reads only the days the view shows plus a day either side
  (`getViewWindows` in `src/lib/calendar/calendar-window.ts`), through a cache
  keyed by window and filter. The agenda lists 30 days and grows by 30, up to
  366, when scrolled to its end or its last row's button is pressed; the
  `days` search parameter holds how many.
- The route reads its search from the location and reloads with
  `shouldReload: true`, rather than through loader dependencies, so a later
  load runs in the background and the page it replaces stays on screen.

- The agenda and the timeline group their events, through the Group by
  popover in the toolbar: an ordered list of up to three levels, each a tag
  root, taken to a chosen depth of its tree, or a year, quarter, month, week,
  day, weekday, hour, or duration bucket read in each event's own zone.
  `compileEventGrouping` in `src/lib/event-groups/` turns a grouping into one
  SQL source of group keys per level, which `findEvents` reads into each
  event's `groups`; `buildEventGroups` builds the tree from them. An event
  falls in every group of a level it has a key for, so an event of two
  planets is listed under both, and a group counts its distinct events. A
  tag above the chosen depth stands for itself, and events with no key at a
  level gather in a last "No …" group.
- Without a `group` search parameter, the agenda groups by Type and the
  timeline by Type, then Planet; an empty list groups by nothing. Levels that
  do not parse or name a field the data lacks are dropped one by one.
- The timeline is the vendored ReUI Gantt, composed in `CalendarTimeline`:
  a row per group, nested and collapsible, a tag group grouped below its
  root's children nested under each tag between, and a column counting each
  row's events. The `scale` search parameter holds the span it shows, from a
  day in fifteen-minute columns (zoomed up to fifteen times, so minutes read
  apart) to a year in months, and a load reads only the span the scale shows.
  Instants are drawn as diamonds at their moment, spans as bars of their
  true length, and markers closer than one marker's width at the scale and
  zoom shown are clustered into a count
  (`src/lib/calendar/calendar-timeline-clusters.ts`).
- The Gantt draws every row and bar it is handed, windowing neither, so the
  timeline hands bars only to the rows scrolled into view and a few beyond
  (`src/lib/calendar/calendar-timeline-window.ts`). Rows keep one track
  each, so a row's height stays put as its bars come and go; overlapping
  bars in one row are drawn over each other rather than stacked.

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

- While the database loads, `CalendarSkeleton` stands in for the page: a
  grid of days from a tablet's width, a list of rows on a phone, which opens
  on the agenda.
- A failed load shows `CalendarError`, announced as an alert, with Retry; a
  browser without WebAssembly or Web Workers gets an explanation and no
  retry.
- Days with no events keep the calendar and lay `CalendarEmpty` over it:
  "No events yet" for an empty database, "Outside the data" with a jump to the
  first covered day, or "No events this month" (or week, or day) inside the
  covered dates. It is announced as a status. When the filters are what
  emptied the period, "No events match the filters" offers Clear filters.
  While a reload runs the page is marked busy and the notice waits.
- The `date` search parameter (`YYYY-MM-DD`) holds the day the view opens on;
  one that does not parse falls back to today.
- The `filter` search parameter holds the ReUI filter tree as JSON, validated
  in `src/lib/calendar/calendar-search.ts`; one that does not parse is
  dropped. `compileEventFilter` in `src/lib/event-filters/` turns it into the
  SQL condition `findEvents` applies, leaving out unfinished rules, and a
  month the filters empty says so apart from one with no events at all.

### Verified at each width

Checked by hand in the browser against the seeded data, at 320 and 375 pixels
(a phone), 768 and 800 (a tablet), and 1024 and 1280 (a desktop). At each,
the toolbar's buttons sit inside the width, the page never scrolls sideways,
and the title shows whole. The Filters button opens its popover on a desktop,
a drawer on a tablet, and a bottom sheet on a phone.

| View      | Phone (375)                                    | Tablet (800) | Desktop (1280) |
| --------- | ---------------------------------------------- | ------------ | -------------- |
| Month     | Works                                          | Works        | Works          |
| Week      | Works; the grid scrolls sideways, hours fixed  | Works        | Works          |
| Three-day | Works                                          | Works        | Works          |
| Day       | Works                                          | Works        | Works          |
| Agenda    | Works; it is the default                       | Works        | Works          |
| Timeline  | Works, tight: about three days beside the rows | Works        | Works          |

No view is withheld at any width. One that stops working at some width is
cut by deleting it from `CALENDAR_VIEWS` and the records keyed by it in
`src/lib/calendar/calendar-views.ts`, which the compiler then follows to
every other place that names it. Not checked: the "+N more" list of a busy
month, as the seed holds no busy day, and keyboard-only scrolling of the
agenda and the timeline in browsers that do not make a scrollable region
focusable by themselves.

## Key Files

- [src/router.tsx](src/router.tsx): Router factory
- [src/routes/\_\_root.tsx](src/routes/__root.tsx): Document shell
- [vite.config.mts](vite.config.mts): TanStack Start, Tailwind, and React plugins
- [vitest.config.ts](vitest.config.ts): Test configuration
- [src/lib/events-database/events-database.types.ts](src/lib/events-database/events-database.types.ts):
  The `EventsDatabase` interface
- [src/routes/index.tsx](src/routes/index.tsx): The calendar page
- [data/events-views.sql](data/events-views.sql): The post-export tables and views
