# CaelundasWeb: TanStack Start Web Application

## Quick Start

**Type**: Server-rendered web application (TanStack Start)

**Build**: Fully static, in TanStack Start's single-page mode: the build
renders one shell page ahead of time, every route renders in the browser, and
there are no server functions. All data comes from the `caelundas-api` GraphQL
API, which the browser calls directly

**Purpose**: Browse the astronomical events `caelundas-cli` calculates, as a
calendar over the `caelundas-api` GraphQL API, which reads the Caelundas
Postgres

### Run Locally

```bash
nx run caelundas-web:start
```

It needs the API, which needs a migrated and ingested Postgres:

```bash
nx run caelundas-db:migration:run   # Local Postgres and its schema
nx run caelundas-cli:start          # Ingest events (see caelundas-cli)
nx run caelundas-api:start          # The API, on port 6173
```

The app reads the API at `VITE_CAELUNDAS_API_URL`, `http://localhost:6173/graphql`
when unset. The API must allow this app's origin (CORS), as the browser calls it
directly.

## Data Pipeline

Nothing is bundled and nothing is built from data: `build` and `start` run Vite
and nothing else, and the project holds no schema, seed, or database. The data
flows one way:

1. `caelundas-cli` ingests events into the Caelundas Postgres and rewrites its
   read model; `caelundas-db` owns the schema.
2. `caelundas-api` answers GraphQL over that read model: the events in a
   window, the facets, the filter collections, the calendar windows (a view's
   visible days and the window a load must read), grouping, and the night sky.
   Filters and groupings are compiled to SQL there, not here.
3. The browser sends one generated document per query through `queryApi`. The
   client holds only what the API cannot know: lane packing, clustering, and
   the tree of groups a view draws.

Tests run on the mocked API: `serveGraphqlApi(...handlers)` from
`testing/graphql-api.ts` registers the generated MSW handlers on the shared
server in `testing/setup.ts`, with fixtures from `testing/calendar-api.ts`.

## GraphQL Code Generation

The web app reads the `caelundas-api` schema through typed operations, as
`lexico-web` does. `codegen.ts` reads the documents in `src/graphql/operations/` (one per query:
dataset, events with filter and grouping, facets, filter collections, calendar
windows, night sky) and writes `operations.ts` (types and typed documents) and
`mocks.ts` (MSW handlers) to `src/graphql/generated/`. The generated files are
committed and never edited. It does not use `@codebase/interface/client`'s
shared configuration, which also emits the schema's own types and Zod
validators: those redeclare the enums and inputs these operations take.

```bash
nx run caelundas-web:codegen          # Regenerate from the API's schema
nx run caelundas-web:codegen:check    # Fail when a committed file is stale
nx run caelundas-web:codegen-watch    # Start the API and regenerate on change
```

The API emits its schema to the gitignored `caelundas-api/src/schema.gql` each
time it boots, so boot it first (`nx run caelundas-api:start`) when the file is
missing.

`src/components/events-calendar/events-api.utilities.ts` sends a generated
document to the API with `queryApi`. The API's address is the
`VITE_CAELUNDAS_API_URL` build variable, `http://localhost:6173/graphql` when
unset.

## Architecture Overview

### Tech Stack

- **Framework**: TanStack Start (server rendering, server functions) on Vite
- **Routing**: TanStack Router, file-based, from `src/routes/`
- **UI**: React 19 with Tailwind CSS 4
- **Calendar**: the vendored ReUI event calendar from `@codebase/presentation`,
  composed here and never edited
- **Data**: the `caelundas-api` GraphQL API, through typed documents generated from its schema
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
    <component>/
      <component>.tsx              # The folder's component and its Properties
      <component>.unit.test.tsx
      <component>.types.ts
      <component>.constants.ts
      <component>.utilities.ts
      <part>.tsx                   # More components the folder's is built from
      <module>.<kind>.ts           # Shared code the folder owns, tested beside it
  hooks/
    use-<hook>/
      use-<hook>.ts                # The folder's hook
      use-<hook>.unit.test.ts
      use-<hook>.types.ts
      use-<hook>.constants.ts
      use-<hook>.utilities.ts
  modules/
    <feature>/                   # Server functions and the utilities behind them
  styles/
    application.css
testing/
  render-route.tsx               # Renders a route through a real router
  setup.ts                       # Shared test setup
```

The calendar adds its data layer:

```text
src/
  components/
    events-calendar/             # The calendar, its views, windows, loader, and the
                                 # API client and the record types the views share
    calendar-filters/            # The filter builder and the filter tree it sends
    calendar-group-by/           # The grouping picker and the event groups it builds
    calendar-timeline/           # The timeline and its clusters, lanes, and window
    night-sky-backdrop/          # The night sky behind every page, and its mount
  graphql/
    operations/                  # One .graphql document per query
    generated/                   # Generated typed documents and MSW handlers
  hooks/
    use-night-sky/               # The night sky's link overrides, settings, and request
testing/
  graphql-api.ts                 # Serves generated MSW handlers over the shared server
  calendar-api.ts, calendar-fixture.ts
                                 # Fixtures the mocked API answers with
```

### Night Sky Data

The API draws the night sky: its `nightSky` query reads the `stars`,
`constellations` and `constellation_lines` tables that `caelundas-cli`'s
`night-sky` command fills and returns an SVG, which `useNightSky` hands to the
backdrop. The stars are the HYG star database v4.1 (CC BY-SA 4.0, David Nash
and the HYG contributors, <https://github.com/astronexus/HYG-Database>), stored
to magnitude 6.5 and declination -45 degrees or north; the stored catalog is a
derived work under the same license, so keep this credit wherever it is
documented. The figures are d3-celestial's (BSD-3-Clause, Olaf Frohn,
<https://github.com/ofrohn/d3-celestial>). The 88 constellations the menu
lists are a constant in `night-sky.constants.ts`. This app owns the link:
`readNightSkyOverrides` reads `sky.*` keys, reading a color like `sky.top`,
clamping the opacity to 0-1 and the width to 0-10 pixels, and falling back to
the `DEFAULT_OPTIONS` default with one console warning for a value it cannot
read, as for an unknown constellation name; `toNightSkyInput` turns them into
the query's input. `sky.constellations` (the zodiac when absent, none for `none`
or empty) selects the figures, and `sky.ecliptic` with its three style keys
the ecliptic, both drawn by the API. `src/components/night-sky-menu/`
is the toolbar's Sky menu, with no headings: each control's label says what
it sets ("Sky top color", "Star drift speed", "Ecliptic line width"), and
`NightSkySection` names its group with a hidden legend. Four columns on a wide
screen, one on a phone: the sky and stars, the angles, the constellation
lines over the ecliptic, then the constellation tree. The tree's column has no visible
heading, its folder checkboxes picking all or none; it takes
no height of its own on a wide screen, so the other columns set the panel's
height and the tree scrolls inside it. An absent `sky.constellations` is the
zodiac everywhere, the tree included: `useNightSkySettings` reads the same keys through
`readNightSkyOverrides` and writes them with `navigate({ replace: true })`, the
`night-sky-menu.utilities.ts` mappings remove a key set back to its default
and the Default button beside the sky's switch removes them all but
`sky.debug`, the colors are the
ReUI color picker, and the panel keeps arrow and letter keys from the menu
around it so a slider keeps focus.

## Development

Scaffold with the generators rather than writing these shapes by hand — each one
is also the standard its files are validated against:

```bash
nx g conformetry:tanstack-route --name=<file-stem> --path=<url-path> --project=caelundas-web
nx g conformetry:tanstack-server-function --name=<feature> --project=caelundas-web
nx g conformetry:react-component-folder --name=<component> --project=caelundas-web
nx g conformetry:react-component-file --name=<part> --module=<component> --project=caelundas-web
nx g conformetry:react-hook-folder --name=use-<hook> --project=caelundas-web
nx g conformetry:react-hook-file --name=use-<other> --module=use-<hook> --project=caelundas-web
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

The views' route tests live in `src/components/events-calendar/calendar-views.utilities.integration.test.tsx`, beside
the route's own, only to keep each file under the line limit; shared steps
live in `testing/calendar-page.ts`.

See the [write-react skill](/.agents/skills/write-react/SKILL.md) for
component conventions and the
[testing-strategy skill](/.agents/skills/testing-strategy/SKILL.md) for
test tiers.

## Layout

The page is the calendar across the whole viewport under a toolbar of two
rows: the View, Color and Sky menus, with today, previous and next and the
period's title at the right; then the Filters button with a count of the
finished rules, Clear and the active filters as chips, with the view selector
at the right. The menus' triggers carry an icon and no arrow. Times render in the zone the dataset's events carry.

- The views are month, week, three-day, day, agenda, and timeline, listed in
  `src/components/events-calendar/calendar-views.constants.ts`; the app owns that list, so a view is
  added or cut there. The `view` search parameter holds the one picked.
  Without it, the view follows the width: the agenda below 768 pixels, the
  month above, read synchronously so the first render is already right.
- Three widths are told apart, in `src/components/events-calendar/calendar-viewport.utilities.ts`: a
  phone below 768 pixels, a tablet from 768, and a desktop from 1024. Below a
  desktop the view selector is a menu, as six buttons do not fit beside the
  other controls. On a phone the week also scrolls sideways with a sticky
  hour column (the time grid in page scroll mode inside a scrolling content
  area), the menus and filter controls take a row of their own under the title, and the title
  wraps rather than being cut.
- One toolbar sits above every view and is never remounted by a change of
  view, so the focus on its view selector survives it: each view reports how
  it moves (`onNavigationChange`), because only a child of the vendored
  calendar or Gantt can read that, and the toolbar calls the latest report.
- The agenda and a month cell's "+N more" list are the app's own, windowed by
  `VirtualList` over the pure functions in
  `src/components/virtual-list/calendar-virtual-window.utilities.ts`. An event is listed once, on
  the day it begins, or on the first day for one already under way.
- Each load reads only the days the view shows plus a day either side
  (`getViewWindows` in `src/components/events-calendar/calendar-window.utilities.ts`), through a cache
  keyed by window and filter. The agenda lists 30 days and grows by 30, up to
  366, when scrolled to its end or its last row's button is pressed; the
  `days` search parameter holds how many.
- The route reads its search from the location and reloads with
  `shouldReload: true`, rather than through loader dependencies, so a later
  load runs in the background and the page it replaces stays on screen.

- The agenda and the timeline group their events, through the Group by
  submenu of the View menu: an ordered list of up to three levels, each laid
  out like a filter rule, a field and what to group it by. A tag root opens
  the filter's own tag tree (`GroupTagPicker` over `FilterTagEditor`), and
  each tag ticked becomes a group of the events under it, so several tags are
  one pick; with none ticked it groups by the root's first level, and a link
  from before tags could be picked still names a `depth`. A level may instead
  be a year, quarter, month, week, day, weekday, hour, or duration bucket
  read in each event's own zone.
  `toEventGroupingInput` in `src/components/calendar-group-by/` turns a grouping
  into the query's grouping input, and the API returns each event's group keys
  in its `groups`; `buildEventGroups` builds the tree from them. An event
  falls in every group of a level it has a key for, so an event of two
  planets is listed under both, and a group counts its distinct events. A
  tag above the chosen depth stands for itself, and events with no key at a
  level, or under none of the tags ticked, gather in a last "No …" group.
- Without a `group` search parameter, the agenda groups by Type and the
  timeline by Type, then Planet; an empty list groups by nothing. Levels that
  do not parse or name a field the data lacks are dropped one by one.
- Events are colored by a level picked the way a grouping's level is: the
  `color` search parameter holds one, a field and, for a tag root, the tags or
  the depth of its tree, from the same fields the filters and the grouping
  offer, and the Color menu's panel picks it, under its Color events switch, with the same field
  picker and tag tree. The loader reads it as one more level after the
  grouping's, so each event arrives with its keys for it in `groups`;
  `createColorScheme` (`src/components/calendar-color-by/calendar-color-schemes.utilities.ts`) turns
  them into colors, handing out the palette in the tree's order, from the
  weekdays, hours and durations known ahead, or from a key's own text for a
  period. An event with several values, such as an aspect between two planets,
  takes the first in the legend's order; one with none keeps the color the
  data gave it. With no `color`, events are colored by type, kind by kind
  (`EVENT_COLOR_RULES`); `colors=false` draws none.
- The timeline is the vendored ReUI Gantt, composed in `CalendarTimeline`:
  a row per group, nested and collapsible, a tag group grouped below its
  root's children nested under each tag between, and a column counting each
  row's events. The `scale` search parameter holds the span it shows, from a
  day in fifteen-minute columns (zoomed up to fifteen times, so minutes read
  apart) to a year in months, and a load reads only the span the scale shows.
  Instants are drawn as circles, and a cluster of them as a circle holding its count, at their moment, spans as bars of their
  true length, and markers closer than one marker's width at the scale and
  zoom shown are clustered into a count
  (`src/components/calendar-timeline/calendar-timeline-clusters.utilities.ts`). Bars that still overlap
  are packed into lanes (`calendar-timeline-lanes.ts`): a row that needs more
  than one gets a row without a title beneath it for each further lane, so
  nothing is drawn over anything else. Lanes are packed over every bar of the
  row, not only those on screen, so scrolling never moves a row.
- The Gantt draws every row and bar it is handed, windowing neither, so the
  timeline hands bars only to the rows scrolled into view and a few beyond
  (`src/components/calendar-timeline/calendar-timeline-window.utilities.ts`). Rows keep one track
  each, so a row's height stays put as its bars come and go; overlapping
  bars in one row are drawn over each other rather than stacked.

- The Filters button opens the vendored ReUI builder, nested AND/OR groups
  included: as a popover from 1024 pixels wide, a drawer from the side from
  768, and a bottom sheet below that. It never stays open over the calendar.
- The chips wrap onto more rows, and are left out below 768 pixels, where
  the count stands for them. `CalendarFilters` holds
  the tree being edited, so an edit shows before the link catches up, and
  writes it to the link only when the compiled query changes: an unfinished
  rule does not reload the calendar. The facets are read per window and filter.
- Collections are named sets of filters, applied in one step from the menu
  beside the Filters button (`event-filter-collections.ts`). They are written
  by tag names, such as `Type` and `Aspect / Simple Aspect / Major Aspect`,
  and resolved against the data's facets, so a collection that names a tag
  the data lacks applies to the ones it has, and an `and` that loses a
  condition is dropped whole. A link with no `filter` opens on the default
  collection, Highlights: major aspects and sign ingresses without the Moon,
  plus stations, eclipses, and the long cycles. "No filter" is therefore
  written to the link as an empty group, never left out.
- A tag field's value editor (`filter-tag-editor.tsx`) is a searchable list of
  checkboxes, one for each tag by its own name, indented by its depth, not a
  list of paths. A tag with tags beneath it has a handle (or the right and
  left arrows) that opens and closes them; the list opens folded to the first
  level, showing the tags the rule holds, and a closed tag counts the picks
  inside it. A search lists every match flat. Each tag's count is of the events in the days the view
  shows (the facets are read for that window and cached per window), not of
  the whole dataset.
- The fields come from the data: one per tag root, offering every tag beneath
  it, so a new root needs no code change. A root whose tags all end in a
  number, such as Aspect Harmonic, offers comparisons (equals, greater and
  less than, between) on that number instead of a pick list. Date range,
  weekday, hour, duration bucket, duration in minutes, temporality, and text
  search follow them; a tag root
  named like one of those is left to the derived field.
- Date, weekday, and hour are read in each event's own zone by the API, from
  the read model's `start_local_day` and `start_local_hour`.

- While the API answers, `CalendarSkeleton` stands in for the page: a
  grid of days from a tablet's width, a list of rows on a phone, which opens
  on the agenda.
- A failed load, including an API that cannot be reached, shows
  `CalendarError`, announced as an alert, with Retry.
- Days with no events keep the calendar and lay `CalendarEmpty` over it:
  "No events yet" for an empty dataset, "Outside the data" with a jump to the
  first covered day, or "No events this month" (or week, or day) inside the
  covered dates. It is announced as a status. When the filters are what
  emptied the period, "No events match the filters" offers Clear filters.
  While a reload runs the page is marked busy and the notice waits.
- The `date` search parameter (`YYYY-MM-DD`) holds the day the view opens on;
  one that does not parse falls back to today.
- The `filter` search parameter holds the ReUI filter tree as JSON, validated
  by the schemas in `src/hooks/use-calendar-search/calendar-search.constants.ts`; one that does not parse is
  dropped. `toEventFilterInput` in `src/components/calendar-filters/` turns it into the
  query's filter input, leaving out unfinished rules, and a
  month the filters empty says so apart from one with no events at all.

### Verified at each width

Checked by hand in the browser against a seeded local API, at 320 and 375 pixels
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
`src/components/events-calendar/calendar-views.constants.ts`, which the compiler then follows to
every other place that names it. Not checked: the "+N more" list of a busy
month, as the seeded data holds no busy day, and keyboard-only scrolling of the
agenda and the timeline in browsers that do not make a scrollable region
focusable by themselves.

## Key Files

- [src/router.tsx](src/router.tsx): Router factory
- [src/routes/\_\_root.tsx](src/routes/__root.tsx): Document shell
- [vite.config.mts](vite.config.mts): TanStack Start, Tailwind, and React plugins
- [vitest.config.ts](vitest.config.ts): Test configuration
- [src/components/events-calendar/calendar-records.types.ts](src/components/events-calendar/calendar-records.types.ts):
  The event, facet, dataset and window types the views share
- [src/components/events-calendar/events-api.utilities.ts](src/components/events-calendar/events-api.utilities.ts):
  `queryApi`, the one way the app reaches the API
- [codegen.ts](codegen.ts): GraphQL Code Generator configuration
- [src/routes/index.tsx](src/routes/index.tsx): The calendar page
