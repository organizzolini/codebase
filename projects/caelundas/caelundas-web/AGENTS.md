# caelundas-web

**Build**: Fully static, in TanStack Start's single-page mode: the build
renders one shell page ahead of time, every route renders in the browser, and
there are no server functions. All data comes from the `caelundas-api` GraphQL
API, which the browser calls directly

**Purpose**: Browse the astronomical events `caelundas-cli` calculates, as a
calendar over the `caelundas-api` GraphQL API, which reads the Caelundas
Postgres

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
   period, the facets, the presets, the windows (a view's visible days and
   the period a load must read), grouping, and the night sky.
   Filters and groupings are compiled to SQL there, not here.
3. The browser sends one generated document per query through `queryApi`. The
   client holds only what the API cannot know: lane packing, clustering, and
   the tree of groups a view draws.

Tests run on the mocked API: `serveGraphqlApi(...handlers)` from
`testing/graphql-api.ts` registers the generated MSW handlers on the shared
server in `testing/setup.ts`, with fixtures from `testing/calendar/calendar-api.ts`.

## GraphQL Code Generation

The web app reads the `caelundas-api` schema through typed operations, as
`lexico-web` does. `codegen.ts` reads the documents in `src/graphql/operations/` (one per query:
dataset, events with filter and grouping, facets, presets, windows, night sky, event metrics and the metric catalog) and writes `operations.ts` (types and typed documents) and
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

`src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts` sends a generated
document to the API with `queryApi`. The API's address is the
`VITE_CAELUNDAS_API_URL` build variable, `http://localhost:6173/graphql` when
unset.

- **Calendar**: the vendored ReUI event calendar from `@codebase/presentation`, composed here and never edited.

The calendar adds its data layer:

```text
src/
  components/
    calendar-display/            # events-calendar (with its grid, loader, API client, views,
                                 # windows, and formats), the table, the timeline, and virtual list
    calendar-query/              # calendar-filters (the filter builder and the filter tree it sends)
                                 # and calendar-group-by (the grouping picker and the event groups)
    calendar-appearance/         # Color-by, the color menu, and the night sky menu and backdrop
  graphql/
    operations/                  # One .graphql document per query
    generated/                   # Generated typed documents and MSW handlers
  hooks/
    use-night-sky/               # The night sky's link overrides, settings, and request
testing/
  graphql-api.ts                 # Serves generated MSW handlers over the shared server
  calendar/calendar-api.ts, calendar/calendar-fixture.ts
                                 # Fixtures the mocked API answers with
```

### Night Sky Data

The API draws the night sky: its `nightSky` query reads the `stars`,
`constellations` and `constellation_edges` tables that `caelundas-cli`'s
`night-sky` command fills and returns an SVG, which `useNightSky` hands to the
backdrop. The stars are the HYG star database v4.1 (CC BY-SA 4.0, David Nash
and the HYG contributors, <https://github.com/astronexus/HYG-Database>), stored
to magnitude 6.5 and declination -45 degrees or north; the stored catalog is a
derived work under the same license, so keep this credit wherever it is
documented. The figures are d3-celestial's (BSD-3-Clause, Olaf Frohn,
<https://github.com/ofrohn/d3-celestial>). The 88 constellations the menu
lists are a constant in `night-sky.constants.ts`. This app owns the link:
`readNightSkyOverrides` reads `skyfield.*` keys, reading a color like `skyfield.top`,
clamping the opacity to 0-1 and the width to 0-10 pixels, and falling back to
the `DEFAULT_OPTIONS` default with one console warning for a value it cannot
read, as for an unknown constellation name; `toNightSkyInput` turns them into
the query's input. `skyfield.constellations` (the zodiac when absent, none for `none`
or empty) selects the figures, and `skyfield.ecliptic` with its three style keys
the ecliptic, both drawn by the API. `src/components/calendar-appearance/night-sky-menu/`
is the toolbar's Skyfield menu, with no headings: each control's label says what
it sets ("Skyfield top color", "Star drift speed", "Ecliptic line width"), and
`NightSkySection` names its group with a hidden legend. Four columns on a wide
screen, one on a phone: the sky and stars, the angles, the constellation
lines over the ecliptic, then the constellation tree. The tree's column has no visible
heading, its folder checkboxes picking all or none; it takes
no height of its own on a wide screen, so the other columns set the panel's
height and the tree scrolls inside it. An absent `skyfield.constellations` is the
zodiac everywhere, the tree included: `useNightSkySettings` reads the same keys through
`readNightSkyOverrides` and writes them with `navigate({ replace: true })`, the
`night-sky-menu.utilities.ts` mappings remove a key set back to its default
and the Default button beside the sky's switch removes them all but
`skyfield.debug`, the colors are the
ReUI color picker, and the panel keeps arrow and letter keys from the menu
around it so a slider keeps focus.

The calendar's tests call `renderCalendarRoute` from `testing/render-route.tsx`,
which first serves the mocked calendar API, or the one a test passes, and then
renders through that same function.

The views' route tests live in `src/components/calendar-display/events-calendar/components/calendar-views/calendar-views.utilities.integration.test.tsx`, beside
the route's own, only to keep each file under the line limit; shared steps
live in `testing/calendar/calendar-page.ts`.

## Layout

The page is the calendar across the whole viewport under a toolbar of two
rows: the View, Color and Skyfield menus, with today, previous and next and the
period's title at the right; then the Filters button with a count of the
finished rules, Clear and the active filters as chips, with the view selector
at the right. The menus' triggers carry an icon and no arrow. Times render in the zone the dataset's events carry.

- The views are month, week, day, table, and timeline, listed in
  `src/components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants.ts`; the app owns that list, so a view is
  added or cut there. The `view` search parameter holds the one picked.
  Without it, the view follows the width: the table below 768 pixels, the
  month above, read synchronously so the first render is already right. A link
  from before the agenda and the three-day view were cut still opens: `view=agenda`
  as the table, `view=three-day` as the week (`RETIRED_VIEWS`).
- Charts and Totals measure the events of the table's days (`date` and `days`,
  the same window and the same filter and grouping) instead of listing them.
  `useEventMetrics` reads the API's `eventMetrics` query through `queryApi`,
  keyed by its input and keeping the last answer while the next loads;
  `useMetricLayout` adds the sorts, navigation by days and the table's shared
  open groups (`TableGroupsContext`, which both layouts register their group ids
  in, so open groups carry across Table, Charts and Totals), and
  `useMetricGroupRows` flattens the tree to the groups shown now. The metric
  catalog is not in this app: `MetricCatalogProvider` (mounted on the page beside
  the other providers) reads the API's `eventMetricCatalog` query once, keeps it in
  memory, and `useMetricCatalog()` hands every consumer `{ catalog, error, retry,
  status }`, where `catalog` holds `metrics` in the order the API returns them (the picker's order), `bySlug`, the
  `measures` and each layout's `defaults`, the web's `DEFAULT_METRICS` kept to those the catalog has. Until it is `ready` the metric layouts
  show a skeleton, or the error with Retry, and ask for nothing. The `metrics`
  search parameter lists metric slugs (`total-duration`), and so does a `metric`
  sort; `parseMetrics` maps an old enum name through `OLD_METRIC_ALIASES`
  (`TOTAL_DURATION_MINUTES`) and drops what is no slug, and `resolveMetrics` drops
  the slugs the loaded catalog lacks, falling back to the layout's defaults.
  `compare` asks for the period before. `hideEmpty=true` (the Display menu's
  Hide empty groups, offered on the table, timeline, Charts and Totals only; the
  month, week and day have no groups and ignore it) leaves out every group with
  no events in the days shown, and every parent all of whose subgroups are left
  out and which has none of its own; a group with events but zero of a shown
  metric stays. `pruneEmptyGroups`
  (`src/components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-prune.utilities.ts`)
  does it for every layout: the table's and the timeline's event trees (which
  events can only build with some, so it changes nothing there), and the metric
  layouts' API tree in `useMetricLayout`, which counts the `events` metric and
  reads it too when it is not shown (the totals drop it again). Colors are shaped
  from the tree before any group is left out, so the groups that stay keep theirs
  (`colorGroups`); a total is the API's, never the visible groups' sum. The
  clustering of crowded hours in the day and week views is always on (the retired
  `clusters` parameter is ignored and dropped from a rewritten link). A metric's unit drives its formatting in
  `formatMetricValue`, `formatMetricValueCompact` and `formatMetricChange`
  (`src/components/calendar-display/calendar-metrics/`): `DURATION` is minutes
  written as years down to minutes, `COUNT` a separated number (a change names the
  metric's lowercased name, singular for one), `NONE` a percent on a 0 to 100 scale (a change in points) and
  `INSTANT` epoch milliseconds as a date and time in the dataset's zone. The picker
  groups metrics by unit (Counts, Durations, Share of time, Times); the Charts hide
  the `INSTANT` ones; `additive` says a stack adds up to its bar. Every group
  the API returns also carries its child tags (`isPreview: true`, one level
  only), so every bar with subgroups stacks by them and a row opens at once; a
  preview is data of its parent, never a group of the table, so
  `describeMetricGroups` lists none of them (nor lets the first path open into
  one) and the shared open groups gain no id. Their Select strip
  lists metrics, there is no Page strip, and Sort may order by a metric (`key:
  "metric"`).
- The Select, Group, Sort and Filter strips fold: the Fold item in any chip's
  menu leaves the strip's title button and a `<N> Facets` button that unfolds
  it. `fold=select,group` in the link lists the folded strips (unknown names
  are ignored, `getCalendarReloadKey` leaves it out, so folding never reloads).
  A strip with no chip to fold, below a tablet for Filter, stays plain; the
  link keeps its entry for when chips return. Unselecting a table column also
  drops the sorts that need it (`dropHiddenSorts`).
- Three widths are told apart, in `src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts`: a
  phone below 768 pixels, a tablet from 768, and a desktop from 1024. Below a
  desktop the view selector is a menu, as five buttons do not fit beside the
  other controls. On a phone the week also scrolls sideways with a sticky
  hour column (the time grid in page scroll mode inside a scrolling content
  area), the menus and filter controls take a row of their own under the title, and the title
  wraps rather than being cut.
- One toolbar sits above every view and is never remounted by a change of
  view, so the focus on its view selector survives it: each view reports how
  it moves (`onNavigationChange`), because only a child of the vendored
  calendar or Gantt can read that, and the toolbar calls the latest report.
- A busy `+N more` list is the app's own, windowed by
  `VirtualList` over the pure functions in
  `src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts`. An event is listed once, on
  the day it begins, or on the first day for one already under way.
- The month is drawn by the app (`CalendarMonth`), not the vendored calendar,
  which is handed no events for it. An "All month" band under the weekday
  header lists the events running through every day of the month once; the
  day cells do not repeat them, and grow downward with their groups. The week
  and day views keep the vendored time grid and replace its all-day row
  (`CalendarAllDay`) and day headings through its render props.
- Busy cells show **facet groups**, never per-event bars or kind counters:
  `groupCalendarEvents` puts each event under one group, so a cell's counts add
  up. With the default Tags grouping it is the event's first tag root in the API's order (`getRootOrder`)
  whose facet has `isDefaultGroup` (the data flags Body and
  Temporality out, which come last), because every root-level group overlapped
  (3.5 groups an event) and Temporality held every event; with a grouping the link names it is
  the first key of its first level. Chips show the group's icon, name and count
  and open in place; the Sort strip's sorts order the groups and the events in
  them (`sortCalendarGroups`, no metric sorts). The week and day's all-day row
  has three states, kept in the `ad` link parameter (`c` one slim row of counts,
  `e` every event, none the groups), which a reload ignores. A cluster in the
  hour grid is a group chip that opens in place.
- A long event also draws, in the hour grid, a block from its start to midnight
  on its first day and one from midnight to its end on its last
  (`addEdgeBlocks`); the days between show it in the all-day row alone. The
  clipped side of a block is squared off, with no marker.
- Only a day's number opens the view below it: a month's day number opens its
  week, a week's day heading its day (`onDayOpen`), keeping every other link
  parameter; the day view has nothing below.
- Each load reads only the days the view shows plus a day either side
  (`getViewWindows` in `src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts`), through a cache
  keyed by window and filter. The table lists 30 days from the one it opens on, or
  as many as the `days` search parameter holds, up to 366.
- The route reads its search from the location and reloads with
  `shouldReload: true`, rather than through loader dependencies, so a later
  load runs in the background and the page it replaces stays on screen.

- The table and the timeline group their events, through the Group by
  submenu of the View menu: an ordered list of up to three levels, each laid
  out like a filter rule, a field and what to group it by. A tag root opens
  the filter's own tag tree (`GroupTagPicker` over `FilterTagEditor`), and
  each tag ticked becomes a group of the events under it, so several tags are
  one pick; with none ticked it groups by the root's first level, and a link
  from before tags could be picked still names a `depth`. A level may instead
  be a year, quarter, month, week, day, weekday, or hour
  read in each event's own zone; how long an event lasts is the unit tags beneath Temporality / Progressive (Minutes to Centuries), picked like any tag, and a link from before that names the retired duration bucket field has the level dropped.
  `toEventGroupingInput` in `src/components/calendar-query/calendar-group-by/` turns a grouping
  into the query's grouping input, and the API returns each event's group keys
  in its `groups`; `buildEventGroups` builds the tree from them. An event
  falls in every group of a level it has a key for, so an event of two
  planets is listed under both, and a group counts its distinct events. A
  tag above the chosen depth stands for itself, and events with no key at a
  level, or under none of the tags ticked, gather in a last "No …" group.
- Without a `group` search parameter, or with an empty or unparsable one,
  every view groups by Tags: every tag root, in order, one "Tags" chip
  whose menu cannot remove it. Removing the last chip, or clearing every
  root, returns to it, and the link drops the parameter. The sort follows
  the same rule: an empty `sort` is the "Tags" sort, which cannot be
  removed. Levels that do not parse or name a field the data lacks are
  dropped one by one.
- Events are colored by a level picked the way a grouping's level is: the
  `color` search parameter holds one, a field and, for a tag root, the tags or
  the depth of its tree, from the same fields the filters and the grouping
  offer, and the Color menu's panel picks it, under its Color events switch, with the same field
  picker and tag tree. The loader reads it as one more level after the
  grouping's, so each event arrives with its keys for it in `groups`;
  `createColorScheme` (`src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts`) turns
  them into colors, handing out the palette in the tree's order, from the
  weekdays, hours and durations known ahead, or from a key's own text for a
  period. An event with several values, such as an aspect between two planets,
  takes the first in the legend's order; one with none keeps the color of its
  kind, the API storing no color of its own. With no `color`, events are colored by type, kind by kind
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
  (`src/components/calendar-display/calendar-timeline/components/timeline-clusters/calendar-timeline-clusters.utilities.ts`). Bars that still overlap
  are packed into lanes (`calendar-timeline-lanes.ts`): a row that needs more
  than one gets a row without a title beneath it for each further lane, so
  nothing is drawn over anything else. Lanes are packed over every bar of the
  row, not only those on screen, so scrolling never moves a row.
- The Gantt draws every row and bar it is handed, windowing neither, so the
  timeline hands bars only to the rows scrolled into view and a few beyond
  (`src/components/calendar-display/calendar-timeline/components/timeline-window/calendar-timeline-window.utilities.ts`). Rows keep one track
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
- Presets are named sets of filters, applied in one step from the menu
  beside the Filters button (`presets.ts`). They are written
  by tag names, such as `Type` and `Aspect / Simple Aspect / Major Aspect`,
  and resolved against the data's facets, so a preset that names a tag
  the data lacks applies to the ones it has, and an `and` that loses a
  condition is dropped whole. A link with no `filter` opens on the default
  preset, Highlights: major aspects and sign ingresses without the Moon,
  plus stations, eclipses, and the long cycles. "No filter" is therefore
  written to the link as an empty group, never left out.
- The View menu's views (`calendar-view-strip.constants.ts`: Body Signs, Major
  Aspects, Retrogrades, Daily Cycles, Lunar Phases, Planetary Cycles, Eclipses,
  All Events) are the web's own, written by tag names and resolved against the
  facets (a view whose tags the data lacks is left out). Each sets three link
  parameters at once: `filter` to its tags, `group` to the tag's children, and
  `sort` by its tag order. The date, layout and display are untouched, and the
  chip reads Custom once the three stop matching one view.
- A tag field's value editor (`filter-tag-editor.tsx`) is a searchable list of
  checkboxes, one for each tag by its own name, indented by its depth, not a
  list of paths. A tag with tags beneath it has a handle (or the right and
  left arrows) that opens and closes them; the list opens folded to the first
  level, showing the tags the rule holds, and a closed tag counts the picks
  inside it. A tag under two parents (the API lists it once a path, with the same id and
count, and `alsoUnder` naming its other parents) is a row under each, with a small link
mark and "also Benefic" under its name; ticking it anywhere ticks it everywhere, a
parent's partial and full states count it once, and the rule's chip carries the same
link mark. Event pills show it once. The Filter menu's tree (`filter-cascader.utilities.ts`) gives a shared tag the same `id@@path` row values, a click on any row ticking or clearing it everywhere and its parents showing partly ticked, and draws a folder (a tag Filter leaves out) with only its caret, icon and name, no checkbox slot. The Group menu lists the groupable tags, leaves too,
and a shared tag is a row under each parent with "also Benefic" in its description and one id
(the cascader holds one row to a value, so a shared row's value is `id@@path` and
`toTaggedIds` and `toRowValues` make a click on any row tick or clear the tag everywhere).
Ticking a tag with tags beneath it groups by its children, as before; ticking tags with none
makes one level of groups of those tags (`tags` on the level), in place of the root's own
level; a new level follows the last of its field's, so it refines that run. Each tag has four
flags the API passes on (`isFilterable`, `isGroupable`, `isSelectable`, `isSortable`; absent
means on) and each menu offers only its own: Filter's value picker, Group's levels, Sort's
tag order and Select's columns. A tag a menu leaves out stays as a folder, a row that only
opens, when a tag beneath it is offered, and goes with none, so no folder is empty; the flags
shape the menus, and a link naming such a tag has it dropped, silently: the API ignores it in a filter or grouping, and `useUnofferedTagCleanup` rewrites the link without it (filter picks, group levels, sorts and columns) once the facets load.
A search lists every match flat, folders left out. Each tag's count is of the events in the days the view
  shows (the facets are read for that window and cached per window), not of
  the whole dataset.
- The fields come from the data: one per tag root, offering every tag beneath
  it, so a new root needs no code change. A root whose tags all end in a
  number, such as Aspect Harmonic, offers comparisons (equals, greater and
  less than, between) on that number instead of a pick list. Date range,
  weekday, hour, duration in minutes, temporality, and text
  search follow them; a tag root
  named like one of those is left to the derived field.
- Date, weekday, and hour are read in each event's own zone by the API, from
  the read model's `start_local_day` and `start_local_hour`.

- While the API answers, `CalendarSkeleton` stands in for the page: a
  grid of days from a tablet's width, a list of rows on a phone, which opens
  on the table.
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
  dropped. `toEventFilterInput` in `src/components/calendar-query/calendar-filters/` turns it into the
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
| Day       | Works                                          | Works        | Works          |
| Table     | Works; it is the default                       | Works        | Works          |
| Timeline  | Works, tight: about three days beside the rows | Works        | Works          |

No view is withheld at any width. One that stops working at some width is
cut by deleting it from `CALENDAR_VIEWS` and the records keyed by it in
`src/components/calendar-display/events-calendar/components/calendar-views/calendar-views.constants.ts`, which the compiler then follows to
every other place that names it. Not checked: the "+N more" list of a busy
month, as the seeded data holds no busy day, and keyboard-only scrolling of the
table and the timeline in browsers that do not make a scrollable region
focusable by themselves.

## Key files

- [src/components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types.ts](src/components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types.ts): The event, facet, dataset and window types the views share
- [src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts](src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts): `queryApi`, the one way the app reaches the API
- [configuration/codegen.ts](configuration/codegen.ts): GraphQL Code Generator configuration
- [src/routes/index.tsx](src/routes/index.tsx): The calendar page
