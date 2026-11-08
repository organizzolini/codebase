## Develop

```bash
nx run caelundas-web:start
```

The app holds no data of its own: every event, facet, filter collection,
calendar window and night-sky star comes from the `caelundas-api` GraphQL
API, which reads the Caelundas Postgres. Bring those up first, then the app:

```bash
# 1. Start the local Postgres (docker compose) and create the schema
nx run caelundas-db:migration:run

# 2. Fill it with events and the night sky, as caelundas-cli's README describes
nx run caelundas-cli:download-ephemeris
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env
nx run caelundas-cli:start

# 3. Serve the API on port 6173, then the app
cp projects/caelundas/caelundas-api/.env.default projects/caelundas/caelundas-api/.env
nx run caelundas-api:start
```

The dev and preview servers listen on port 8967, derived from the project name
with `scripts/shell/text-to-port.sh caelundas-web` as every other application's
is, and `nx run caelundas-web:stop` frees it.

The API's address is the `VITE_CAELUNDAS_API_URL` variable, read when the app
is built or served, `http://localhost:6173/graphql` when unset. Point it at
another API before a build:

```bash
VITE_CAELUNDAS_API_URL=https://api.example.test/graphql nx run caelundas-web:build
```

The browser calls the API directly, so the API must allow this app's origin.

## Generate the API client

`src/graphql/generated/` is committed output of GraphQL Code Generator, from
the documents in `src/graphql/operations/` and the schema `caelundas-api` writes
to the gitignored `caelundas-api/src/schema.gql` each time it boots. Boot the
API once before generating. The build never needs it: it reads the committed
files.

```bash
nx run caelundas-web:codegen          # Regenerate from the API's schema
nx run caelundas-web:codegen:check    # Fail when a committed file is stale
nx run caelundas-web:codegen-watch    # Start the API and regenerate on change
```

## Test

```bash
nx run caelundas-web:vitest
```

## Night sky link parameters

The backdrop reads these from the page link; a value that does not parse falls
back to its default. The toolbar's Sky menu sets every one of them
but `sky.debug`, reading the link and writing it back as a control moves, and
removes a key set back to its default. Its Default button removes them all
but `sky.debug`. Colors are text of three or six hexadecimal digits,
with or without the `#`. Write the `#` as `%23`, for example `sky.top=%23102040`:
the router reads an all-digit value such as `123456` or `1e5` as a number,
which cannot be told from the color it was meant to be, so a number falls back
to the default.

- `sky=off` removes the backdrop.
- `sky.lat` and `sky.lon` move the observer, the north pole (90) and New
  York's longitude by default; a latitude of 0 or below draws nothing. The
  view faces north, and at the pole altitude is declination.
- `sky.vFov` sets the degrees of altitude shown, 90 by default, and
  `sky.altBottom` the altitude at the bottom edge, from -45 to 89 and 0 by
  default, so the default view, the whole sky above the horizon from the
  pole, holds the northern half of the ecliptic and the northern zodiac's
  figures as they turn past; a bottom below the horizon reaches further south. The pole
  stays a degree above the top edge, so a field of view that would show it is
  cut to fit, 89° at the defaults, and a cut of more than that degree is
  warned of once.
- `sky.pixelsPerSecond` sets the drift speed in on-screen pixels per second,
  3 by default.
- `sky.maxMag` sets the faintest magnitude drawn, and `sky.starScale`
  multiplies the dot size.
- `sky.top` and `sky.bottom` set the colors at the top and bottom of the
  background, `04060f` and `0d1533` by default.
- `sky.constellations` draws constellation figures beneath the stars: a
  comma-separated list of full names, lower case with spaces or hyphens as
  underscores, such as `ursa_major` or `canis_major`, and the words `all` and
  `zodiac` (the twelve zodiac constellations), combined as in
  `sky.constellations=zodiac,ursa_major`. Absent, it draws the zodiac's; `all`
  draws all 88, and `none`,
  or an empty value (`sky.constellations=`), draws none. A name it does not know
  is left out, with one console warning. Facing north from mid-northern
  latitudes the zodiac lies below the window, so its figures show there only
  with a lower `sky.altBottom`.
- `sky.lineColor`, `sky.lineOpacity` and `sky.lineWidth` stroke the figures:
  a color like `sky.top`'s, `ffffff` by default; an opacity from 0 to 1,
  `0.24` by default; and a width in on-screen pixels from 0 to 10, `0.8` by
  default. A number out of range is clamped, and a value that does not parse
  falls back to the default with one console warning.
- The ecliptic, the Sun's yearly path and the line the zodiac lies along, is
  drawn as a dashed path beneath the stars; `sky.ecliptic=false` hides it.
  `sky.eclipticColor`, `sky.eclipticOpacity` and `sky.eclipticWidth` stroke it
  like the figures' keys, `ffffff`, `0.12` and `1` by default. It lies within
  23.44° of the celestial equator, so it shows only where the window reaches
  that far south; the default band holds its northern half.
- `sky.debug=true` draws the zoomed-out tuning view.

## Stars and constellations

The API draws the night sky from its `stars`, `constellations` and
`constellation_lines` tables, which `caelundas-cli`'s `night-sky` command fills,
and this app shows the SVG its `nightSky` query returns. The list of all 88
constellations in the Sky menu is a constant in `night-sky.constants.ts`.

The stars are the [HYG star database](https://github.com/astronexus/HYG-Database)
v4.1, stored to magnitude 6.5 at declination -45 degrees or north, plus any
fainter star a figure joins. HYG is licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and the stored
catalog is a derived work, so it carries the same license and credit to David
Nash and the HYG contributors. The constellations and their figures come from
[d3-celestial](https://github.com/ofrohn/d3-celestial), BSD-3-Clause, Olaf
Frohn, after the IAU's constellation charts.

## 👔 Conformetry

This project was generated from the [tanstack-application](/configuration/conformetry-templates/tanstack-application) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 553 |
| Files | 268 |
| Calls traced | 525 |
| Call stacks | 89 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 89 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `select`** — depth 6 · orphan-root

```text
🚀 select(…): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:44]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:99]
     ↳ Reads the backdrop's settings from the link.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:305]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:271]
         ↳ Reads one stroke from the link: `<prefix>Color` like the background's colors, and `<prefix>Opacity` and `<prefix>Width`…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:10]
           ↳ Reads a hexadecimal color of three or six digits, with or without the `#`, as lowercase `#rrggbb`, or answers the…
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:21]
```

**2. `toggle`** — depth ≥ 6 · orphan-root

```text
🚀 toggle(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:122]
  └─> handleToggle(id: string): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:59]
    └─> toggleTag(…): string[] [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:94]
       ↳ Toggles a tag with everything beneath it: a checked or partly picked tag is checked, and a checked one cleared, then…
      └─> measureTags(items: readonly FilterOption[]): TagShape [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:242]
         ↳ Finds where each tag's own tags end in the depth-first list, and which tags have none.
        └─> readDepth(item: FilterOption): number [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:84]
           ↳ Reads how deep a tag option sits, 0 for one with no depth.
          └─> readData(item: FilterOption): TagOptionData | undefined [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:279]
             ↳ Reads what a tag option carries beyond its label, or nothing for an option of another kind.
```

**3. `FilterTagEditor`** — depth 6 · orphan-root

```text
🚀 FilterTagEditor(properties: Readonly<FilterTagEditorProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/filter-tag-editor/filter-tag-editor.tsx:38]
   ↳ Renders the value editor of a tag field: a search box over the tag tree, each tag a checkbox by its own name with the…
  └─> useTagPicker(properties: Readonly<UseTagPickerProperties>): UseTagPickerResult [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:29]
     ↳ Holds what the tag picker needs from the builder's editor properties: the tags the rule holds, which tags are open, and…
    └─> useState(…)(): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:47]
      └─> findAncestors(items: readonly FilterOption[], ids: readonly unknown[]): Set<string> [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:15]
         ↳ Finds every tag above any of the given tags, so a list opens already showing the tags a rule holds.
        └─> readDepth(item: FilterOption): number [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:84]
           ↳ Reads how deep a tag option sits, 0 for one with no depth.
          └─> readData(item: FilterOption): TagOptionData | undefined [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:279]
             ↳ Reads what a tag option carries beyond its label, or nothing for an option of another kind.
```

<details>
<summary>86 more call stacks</summary>

**4. `select`** — depth 6 · orphan-root

```text
🚀 select(…): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:21]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:99]
     ↳ Reads the backdrop's settings from the link.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:305]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:271]
         ↳ Reads one stroke from the link: `<prefix>Color` like the background's colors, and `<prefix>Opacity` and `<prefix>Width`…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:10]
           ↳ Reads a hexadecimal color of three or six digits, with or without the `#`, as lowercase `#rrggbb`, or answers the…
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:21]
```

**5. `CalendarTimeline`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarTimeline(properties: Readonly<CalendarTimelineProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:92]
   ↳ Renders the events as a Gantt timeline: a row per group, nested and collapsible as the grouping nests, each counting…
  └─> useMemo(…)(): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:123]
    └─> toTimelineRows(…): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:59]
       ↳ Lays events out as Gantt rows by a grouping.
      └─> map(…)(record: CalendarEventRecord): GanttEvent<TimelineBar> [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:67]
        └─> toGanttEvent(record: CalendarEventRecord, rowId: string): GanttEvent<TimelineBar> [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:235]
           ↳ One event drawn in one row: read-only, colored as the data colors it, and carrying its record for the bar to render.
          └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
             ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**6. `CalendarAgenda`** — depth 6 · orphan-root

```text
🚀 CalendarAgenda(properties: Readonly<CalendarAgendaProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.tsx:57]
   ↳ Renders the agenda: each day that has events as a heading over its events in order, in a list that draws only the rows…
  └─> useMemo(…)(): AgendaListRow[] [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.tsx:73]
    └─> toGroupedAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:155]
       ↳ Lays events out as agenda rows in the groups of a grouping: each group's heading, counting the distinct events listed…
      └─> toAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:124]
         ↳ Lays events out as agenda rows, a heading for each day that has any and the day's events beneath it in order.
        └─> getAgendaListing(…): { day: string; ongoing: boolean; } | null [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:208]
           ↳ The day the agenda lists an event under, and whether it was already under way then, or `null` when none of its days…
          └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:36]
             ↳ Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search parameter, the way the calendar's navigation…
```

**7. `CalendarGrid`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarGrid(properties: Readonly<CalendarGridProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:61]
   ↳ Renders every view but the timeline in the vendored event calendar, under the toolbar it is handed.
  └─> useCalendarClusters(properties: Readonly<UseCalendarClustersProperties>): UseCalendarClustersResult [projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:26]
     ↳ Merges the events of one kind that run together in a week, three days or a day, for the days that view shows, when…
    └─> useMemo(…)(): ClusteredEvents [projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:40]
      └─> getViewWindows(…): ViewWindows [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:58]
         ↳ The days a view shows around the day it opens on, as UTC midnights, and the window read for them, a day wider either…
        └─> getTimelineDays(scale: TimelineScale, anchor: Date): EventsWindow [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:136]
           ↳ The days the timeline's axis spans at a scale, as the Gantt lays them out: the day, the week from Sunday, the month,…
          └─> shiftDays(date: Date, days: number): Date [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:229]
             ↳ An instant a number of whole days later, or earlier for a negative one.
```

**8. `EventsCalendar`** — depth ≥ 6 · orphan-root

```text
🚀 EventsCalendar(properties: Readonly<EventsCalendarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:99]
   ↳ Renders a single toolbar row over the view the page picked, filling its container: the timeline as a Gantt, every other…
  └─> useCalendarNavigation(…): UseCalendarNavigationResult [projects/caelundas/caelundas-web/src/hooks/use-calendar-navigation/use-calendar-navigation.ts:23]
     ↳ Holds the navigation the toolbar draws, in one place above every view, so switching views keeps the toolbar, and the…
    └─> isDayShown(…): boolean [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:91]
       ↳ Whether a day, as `YYYY-MM-DD`, is among those a view shows around the day it opens on.
      └─> getViewWindows(…): ViewWindows [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:58]
         ↳ The days a view shows around the day it opens on, as UTC midnights, and the window read for them, a day wider either…
        └─> getTimelineDays(scale: TimelineScale, anchor: Date): EventsWindow [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:136]
           ↳ The days the timeline's axis spans at a scale, as the Gantt lays them out: the day, the week from Sunday, the month,…
          └─> shiftDays(date: Date, days: number): Date [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:229]
             ↳ An instant a number of whole days later, or earlier for a negative one.
```

**9. `loader`** — depth ≥ 6 · orphan-root

```text
🚀 loader(…): Promise<CalendarData> [projects/caelundas/caelundas-web/src/routes/index.tsx:72]
  └─> loadCalendar(search: CalendarSearch): Promise<CalendarData> [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:52]
     ↳ Reads the events in the window the search parameters' view and day show, plus a buffer, that pass their filter,…
    └─> readBasics(…): Promise<{ collections: ResolvedEventFilterCollection[]; dataset: EventsDataset | null; defaultFilter: EventFilterQuery | undefined; facets: EventFacet[]; }> [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:156]
       ↳ Reads what the loader needs before the events: the facets of the days the view shows, and what holds whatever the…
      └─> readCached(…)(): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:166]
        └─> findFacets(window?: EventsWindow): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:79]
           ↳ Reads every tag root and the tags beneath it, each counting the events that overlap the window, or every event without…
          └─> queryApi(…): Promise<TResult> [projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:126]
             ↳ Runs one typed GraphQL operation against the Caelundas API, at the address the `VITE_CAELUNDAS_API_URL` build variable…
```

**10. `IndexPage`** — depth ≥ 6 · orphan-root

```text
🚀 IndexPage(): ReactNode [projects/caelundas/caelundas-web/src/routes/index.tsx:110]
   ↳ Renders the landing page's heading.
  └─> useMemo(…)(): EventFilterField[] [projects/caelundas/caelundas-web/src/routes/index.tsx:120]
    └─> createEventFilterFields(facets: readonly EventFacet[]): EventFilterField[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:28]
       ↳ Builds the filter builder's fields: one per tag root in the database's facets, offering every tag beneath it, then the…
      └─> toTagField(facet: EventFacet): EventFilterField [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:98]
         ↳ Builds the field for one tag root.
        └─> isNumericFacet(facet: EventFacet): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:90]
           ↳ Whether every tag beneath a root is named for a number it ends in, such as "Harmonic 6", so the root reads as a number…
          └─> every(…)(value: EventFacetValue): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:91]
```

**11. `NightSkyBackdropMount`** — depth ≥ 5 · orphan-root

```text
🚀 NightSkyBackdropMount(properties: Readonly<NightSkyBackdropMountProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-backdrop/night-sky-backdrop-mount.tsx:23]
   ↳ Renders the night sky the link asks for behind the page.
  └─> useNightSky(): UseNightSkyResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:39]
     ↳ Asks the API for the night sky behind the page as an SVG, or nothing while it is on its way, when the link turns it…
    └─> useWindowSize(): UseWindowSizeResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:12]
       ↳ The window's size, read after mount and again once a resize has settled.
      └─> useEffect(…)(): () => void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:21]
        └─> measure(): void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:23]
```

**12. `CalendarFilters`** — depth ≥ 5 · orphan-root

```text
🚀 CalendarFilters(properties: Readonly<CalendarFiltersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters/calendar-filters.tsx:59]
   ↳ Renders the active filters as chips, then the Filters button with a count of the finished rules, which opens the nested…
  └─> countActiveEventFilterRules(node: EventFilterNode): number [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:10]
     ↳ Counts the rules in a tree that are finished, which are the ones the query applies, however deeply they are nested.
    └─> toEventFilterInput(node: EventFilterNode | undefined): EventFilterGroupInput | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:20]
       ↳ Writes the ReUI filter tree as the API's filter input, a group of rules and of nested groups with every value as text.
      └─> toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:85]
         ↳ Writes one rule, or answers `null` while it is not finished: a range needs both its ends.
        └─> toRuleValues(value: EventFilterValue | undefined): string[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:109]
           ↳ Writes the values a rule holds as text, dropping the empty ones.
```

**13. `CalendarColorBy`** — depth 5 · orphan-root

```text
🚀 CalendarColorBy(properties: Readonly<CalendarColorByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-by.tsx:44]
   ↳ Renders what the events are colored by, picked the way a grouping's level is: any field the events can be filtered or…
  └─> createColorScheme(…): ColorScheme [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:32]
     ↳ Builds how events are colored for a level: the way events are grouped, a field and, for a tag root, the tags or the…
    └─> listTags(field: EventGroupField, level: EventGroupLevel): ColorLegendEntry[] [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:95]
       ↳ The tags a tag root's level makes a color of, each with the next color: those picked, or those at its depth beneath the…
      └─> readDepth(item: FilterOption): number [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:84]
         ↳ Reads how deep a tag option sits, 0 for one with no depth.
        └─> readData(item: FilterOption): TagOptionData | undefined [projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:279]
           ↳ Reads what a tag option carries beyond its label, or nothing for an option of another kind.
```

**14. `toggleConstellation`** — depth 5 · orphan-root

```text
🚀 toggleConstellation(…): string[] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:148]
   ↳ Shows or hides one constellation's figure among those chosen, naming the choice again in its fewest words.
  └─> toggleConstellations(…): string[] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:160]
     ↳ Shows every constellation of a folder when any is hidden, or hides them all when all show, naming the choice again in…
    └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45]
       ↳ The names of the constellations a choice of figures shows.
      └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54]
        └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:88]
           ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**15. `handleToggle`** — depth ≥ 5 · orphan-root

```text
🚀 handleToggle(names: readonly string[]): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:45]
  └─> toggleConstellations(…): string[] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:160]
     ↳ Shows every constellation of a folder when any is hidden, or hides them all when all show, naming the choice again in…
    └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45]
       ↳ The names of the constellations a choice of figures shows.
      └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54]
        └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:88]
           ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**16. `EventGlyphs`** — depth 5 · orphan-root

```text
🚀 EventGlyphs(properties: Readonly<EventGlyphsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/event-glyphs/event-glyphs.tsx:26]
   ↳ Draws an event's symbols as icons, one for each symbol and in its order, so that they read as the emoji they stand for…
  └─> toGlyphParts(glyphs: string, name?: string): GlyphPart[] [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:22]
     ↳ Splits an event's symbols into the icons that stand for them and the text of what has no icon, one icon for each symbol…
    └─> appendSymbol(parts: GlyphPart[], chars: readonly string[], index: number): number [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:43]
       ↳ Adds the symbol at an index to the parts, as its icons or as text, and answers how many characters it took.
      └─> readSymbol(…): { icons: { file: string; url: string; }[]; length: number; } | undefined [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:128]
         ↳ Reads the symbol at an index: the icons it is drawn as and how many characters it takes, or `undefined` when it has no…
        └─> findSymbolFiles(…): { files: readonly (string | undefined)[]; length: number; } [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:81]
           ↳ The files the symbol at an index is drawn with, and how many characters it takes: a decan's digit with its keycap, or…
```

**17. `CalendarOverflowList`** — depth 5 · orphan-root

```text
🚀 CalendarOverflowList(properties: Readonly<CalendarOverflowListProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.tsx:40]
   ↳ Renders the whole of a month cell's "+N more" day as a list that draws only the rows on screen, so a day with hundreds…
  └─> useMemo(…)(…): { group?: string | undefined; kind: "event"; ongoing: boolean; record: CalendarEventRecord; }[] [projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.tsx:49]
    └─> toAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:124]
       ↳ Lays events out as agenda rows, a heading for each day that has any and the day's events beneath it in order.
      └─> getAgendaListing(…): { day: string; ongoing: boolean; } | null [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:208]
         ↳ The day the agenda lists an event under, and whether it was already under way then, or `null` when none of its days…
        └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:36]
           ↳ Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search parameter, the way the calendar's navigation…
```

**18. `shouldReload`** — depth 5 · orphan-root

```text
🚀 shouldReload(…): boolean [projects/caelundas/caelundas-web/src/routes/index.tsx:67]
  └─> getCalendarReloadKey(search: Readonly<Record<string, unknown>>): string [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:25]
     ↳ Answers what the loader's result depends on: the calendar's own search, so the route reloads for a calendar change and…
    └─> readCalendarSearch(search: Readonly<Record<string, unknown>>): CalendarSearch [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:35]
       ↳ Reads the calendar's own search parameters, leaving out the backdrop's, so a page that shows the calendar is not…
      └─> parseGrouping(value: unknown): EventGrouping | undefined [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:98]
         ↳ Reads a grouping from the link: a list whose levels that do not parse are dropped one by one, cut to the most levels a…
        └─> flatMap(…)(…): never[] | { field: string; depth?: number | undefined; tags?: string[] | undefined; } [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:101]
```

**19. `handleQueryChange`** — depth ≥ 4 · orphan-root

```text
🚀 handleQueryChange(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:46]
  └─> toEventFilterInput(node: EventFilterNode | undefined): EventFilterGroupInput | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:20]
     ↳ Writes the ReUI filter tree as the API's filter input, a group of rules and of nested groups with every value as text.
    └─> toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:85]
       ↳ Writes one rule, or answers `null` while it is not finished: a range needs both its ends.
      └─> toRuleValues(value: EventFilterValue | undefined): string[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:109]
         ↳ Writes the values a rule holds as text, dropping the empty ones.
```

**20. `CalendarCollectionPicker`** — depth 4 · orphan-root

```text
🚀 CalendarCollectionPicker(properties: Readonly<CalendarCollectionPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:42]
   ↳ Renders the collection the filters below come from, as a dropdown to pick another from.
  └─> toEventFilterInput(node: EventFilterNode | undefined): EventFilterGroupInput | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:20]
     ↳ Writes the ReUI filter tree as the API's filter input, a group of rules and of nested groups with every value as text.
    └─> toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:85]
       ↳ Writes one rule, or answers `null` while it is not finished: a range needs both its ends.
      └─> toRuleValues(value: EventFilterValue | undefined): string[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:109]
         ↳ Writes the values a rule holds as text, dropping the empty ones.
```

**21. `GroupLevelRow`** — depth 4 · orphan-root

```text
🚀 GroupLevelRow(properties: Readonly<GroupLevelRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:46]
   ↳ Draws one level like a filter: its field, what it goes by, and a button that removes it, with the tag tree open beneath…
  └─> describeTags(field: EventGroupField, level: EventGroupLevel): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:9]
     ↳ Names what a level goes by: the tags picked, or the level of the root's tree it goes by, the first unless an older link…
    └─> flatMap(…)(this: undefined, tag: string): string[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:21]
      └─> find(…)(candidate: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:22]
```

**22. `NightSkyConstellationPicker`** — depth 4 · orphan-root

```text
🚀 NightSkyConstellationPicker(properties: Readonly<NightSkyConstellationPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:33]
   ↳ Renders which constellations' figures the sky draws: a tree of two folders, the zodiac's twelve, open, and every other,…
  └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45]
     ↳ The names of the constellations a choice of figures shows.
    └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54]
      └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:88]
         ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**23. `CalendarGroupBy`** — depth 4 · orphan-root

```text
🚀 CalendarGroupBy(properties: Readonly<CalendarGroupByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:40]
   ↳ Renders the list of the grouping's levels, each shaped like a filter: a field, the same ones the filter offers, and…
  └─> useMemo(…)(): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:46]
    └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:26]
       ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
      └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
         ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**24. `measure`** — depth ≥ 4 · orphan-root

```text
🚀 measure(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:117]
  └─> getVisibleTimelineRows(…): ReadonlySet<string> | null [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:19]
     ↳ The ids of the rows on screen, and a few beyond each edge, or `null` while the body has not been laid out and so every…
    └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27]
       ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
      └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:56]
         ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**25. `close`** — depth ≥ 3 · orphan-root

```text
🚀 close(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:112]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:70]
```

**26. `open`** — depth ≥ 3 · orphan-root

```text
🚀 open(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:119]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:70]
```

**27. `colorOf`** — depth 3 · orphan-root

```text
🚀 colorOf(event: CalendarEventRecord): string | null [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:54]
  └─> hashColor(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:79]
     ↳ The color of a key from its own text, for a value with no place in a legend.
    └─> pickColor(position: number): string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:162]
       ↳ The color at a position in the palette, which starts over after its last.
```

**28. `NightSkyConstellationFolder`** — depth 3 · orphan-root

```text
🚀 NightSkyConstellationFolder(properties: Readonly<NightSkyConstellationFolderProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-folder.tsx:39]
   ↳ Renders one folder of the constellation picker, the way a file tree draws one: a chevron that opens it, a checkbox that…
  └─> readFolderState(shown: ReadonlySet<string>, names: readonly string[]): FolderState [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:66]
     ↳ Whether a folder's constellations all show, some do, or none.
    └─> filter(…)(name: string): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:70]
```

**29. `NightSkySlider`** — depth 3 · orphan-root

```text
🚀 NightSkySlider(properties: Readonly<NightSkySliderProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-slider.tsx:29]
   ↳ Renders one of the night sky's numbers as a labeled slider showing its value and unit.
  └─> formatSliderValue(value: number, control: SkySliderControl): string [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:23]
     ↳ A slider's value with its unit, rounded to its step.
    └─> roundToStep(value: number, step: number): number [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:97]
       ↳ Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes `0.3` to the link.
```

**30. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: number | readonly number[]): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-slider.tsx:62]
  └─> readSliderValue(…): number [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:83]
     ↳ A slider's moved value, rounded to its step, or the value it had for anything it cannot read.
    └─> roundToStep(value: number, step: number): number [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:97]
       ↳ Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes `0.3` to the link.
```

**31. `handleSettingChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleSettingChange(key: SkyParameterKey, value: string | number): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-lines-section.tsx:50]
  └─> toSkyParameterChange(key: SkyParameterKey, value: number | string): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:190]
     ↳ The change that writes one setting, or removes it when it is set back to its default, so a link names only what differs.
    └─> isDefault(key: SkyParameterKey, value: number | string): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:208]
       ↳ Whether a value is its key's default, a color in any case.
```

**32. `NightSkyMenu`** — depth 3 · orphan-root

```text
🚀 NightSkyMenu(properties: Readonly<NightSkyMenuProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:56]
   ↳ Renders the toolbar's Sky menu: every setting of the night sky behind the page, read from the link and written back to…
  └─> useNightSkySettings(): UseNightSkySettingsResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:18]
     ↳ The night sky's settings as the link sets them, the constellations the sky has figures for, and how to change the link:…
    └─> useCallback(…)(next: Partial<CalendarSearch>): void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:31]
```

**33. `handleSettingChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleSettingChange(key: SkyParameterKey, value: string | number): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:67]
  └─> toSkyParameterChange(key: SkyParameterKey, value: number | string): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:190]
     ↳ The change that writes one setting, or removes it when it is set back to its default, so a link names only what differs.
    └─> isDefault(key: SkyParameterKey, value: number | string): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:208]
       ↳ Whether a value is its key's default, a color in any case.
```

**34. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:120]
  └─> toResetChange(): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:182]
     ↳ The change the Default button makes: every key the menu sets, removed.
    └─> map(…)(key: SkyParameterKey): [SkyParameterKey, undefined] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:183]
```

**35. `SkeletonBody`** — depth 3 · orphan-root

```text
🚀 SkeletonBody(properties: Readonly<SkeletonBodyProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:29]
   ↳ Draws the body of the skeleton for one view.
  └─> from(…)(_: unknown, column: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:93]
    └─> map(…)(height: "h-8" | "h-12" | "h-16", index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:99]
```

**36. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:92]
  └─> replaceLevel(index: number, level: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:56]
    └─> flatMap(…)(this: undefined, current: EventGroupLevel, position: number): EventGroupLevel[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:58]
```

**37. `CalendarViewOptions`** — depth 3 · orphan-root

```text
🚀 CalendarViewOptions(properties: Readonly<CalendarViewOptionsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-options/calendar-view-options.tsx:47]
   ↳ Renders the View menu's arrangement of the view: a Group by submenu for the agenda and the timeline, which group their…
  └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:26]
     ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
    └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
       ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**38. `readConstants`** — depth 3 · orphan-root

```text
🚀 readConstants(…): Promise<{ collections: ResolvedEventFilterCollection[]; dataset: EventsDataset | null; defaultFilter: EventFilterQuery | undefined; }> [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:215]
   ↳ Reads the dataset, and the collections the calendar offers with the filter of the one it opens on, which the API…
  └─> describeDataset(): Promise<EventsDataset | null> [projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:39]
     ↳ Reads the span and zone of the whole dataset, or nothing when it is empty.
    └─> queryApi(…): Promise<TResult> [projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:126]
       ↳ Runs one typed GraphQL operation against the Caelundas API, at the address the `VITE_CAELUNDAS_API_URL` build variable…
```

**39. `EventTagPills`** — depth 3 · orphan-root

```text
🚀 EventTagPills(properties: Readonly<EventTagPillsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:23]
   ↳ Draws each tag as a pill, tinted in the color of its tree so that tags of a kind read alike wherever they are shown.
  └─> map(…)(tag: CalendarEventTag): React.JSX.Element [projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:48]
    └─> getTagColor(tag: CalendarEventTag): string [projects/caelundas/caelundas-web/src/components/event-tag-pills/calendar-tag-colors.utilities.ts:17]
       ↳ The color of a tag's tree: one for each tag root, so every tag beneath a root shares it.
```

**40. `CalendarEventRow`** — depth 3 · orphan-root

```text
🚀 CalendarEventRow(properties: Readonly<CalendarEventRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-row/calendar-event-row.tsx:39]
   ↳ Renders one event as a list row: its time in the data's zone, its color, its symbols, drawn as the symbols setting…
  └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:38]
     ↳ Names a duration in days, hours, and minutes, leaving out any unit that is zero, or "Instant" for an event with no…
    └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:51]
```

**41. `VirtualList`** — depth ≥ 3 · orphan-root

```text
🚀 VirtualList<Row>(properties: Readonly<VirtualListProperties<Row>>): ReactNode [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:54]
   ↳ Renders a vertically scrolling list that draws only the rows in view, plus a few on each side, however long the list…
  └─> useMemo(…)(): number[] [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:74]
    └─> getRowOffsets(heights: readonly number[]): number[] [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:10]
       ↳ Lays rows of the given heights end to end, returning each row's top and, last, the height of them all.
```

**42. `handleScroll`** — depth ≥ 3 · orphan-root

```text
🚀 handleScroll(event: UIEvent<HTMLDivElement>): void [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:92]
  └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27]
     ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
    └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:56]
       ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**43. `handleEventClick`** — depth ≥ 3 · orphan-root

```text
🚀 handleEventClick(occurrence: GanttOccurrence<TimelineBar>): void [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.ts:35]
  └─> describeBar(bar: TimelineBar | undefined): OpenedBar | undefined [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.utilities.ts:14]
     ↳ What opens when a marker is clicked: the events it holds, titled by their count, or by the name of the one event.
    └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
       ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**44. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:103]
  └─> handleValueChange(values: readonly unknown[]): void [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:70]
    └─> parseCalendarView(value: unknown): CalendarViewName | undefined [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-views.utilities.ts:22]
       ↳ Reads a value as a view, or nothing when it names none, such as a stale link's or an unpressed toggle's.
```

**45. `OutsideDataset`** — depth 2 · orphan-root

```text
🚀 OutsideDataset(properties: Readonly<OutsideDatasetProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:32]
   ↳ Names the dates the data covers and offers to jump to the nearest of them.
  └─> format(date: Date): string [projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:40]
```

**46. `handleCollectionSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleCollectionSelect(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:56]
  └─> toLinkedEventFilter(query: EventFilterQuery): EventFilterQuery [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:70]
     ↳ The filter a link should hold for a tree.
```

**47. `handleChange`** — depth ≥ 2 · orphan-root

```text
🚀 handleChange(picked: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:71]
  └─> find(…)(candidate: ResolvedEventFilterCollection): boolean [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:72]
```

**48. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:80]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:46]
```

**49. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:92]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:46]
```

**50. `handleSearchKeyDown`** — depth ≥ 2 · orphan-root

```text
🚀 handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:82]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**51. `down`** — depth 2 · orphan-root

```text
🚀 down(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:115]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**52. `up`** — depth 2 · orphan-root

```text
🚀 up(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:125]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**53. `FilterChipRow`** — depth 2 · orphan-root

```text
🚀 FilterChipRow(properties: Readonly<FilterChipRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:30]
   ↳ Draws one chip per rule of the tree in the surrounding `Filters`, nested ones included, in a row that wraps onto more…
  └─> map(…)(rule: FilterRule<EventFilterValue>, index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:59]
```

**54. `GroupFieldPicker`** — depth 2 · orphan-root

```text
🚀 GroupFieldPicker(properties: Readonly<GroupFieldPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:50]
   ↳ Renders the field of a level of a grouping as the filter renders its attributes: a button that opens a searchable list,…
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:72]
```

**55. `handleSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleSelect(picked: string): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:75]
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:76]
```

**56. `GroupTagPicker`** — depth 2 · orphan-root

```text
🚀 GroupTagPicker(properties: Readonly<GroupTagPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:35]
   ↳ Renders the tag tree a level of a grouping picks its groups from: the same tree, with the same search, folding and…
  └─> filter(…)(option: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:48]
```

**57. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(next: EventGroupField): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:83]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:120]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**58. `duration`** — depth 2 · orphan-root

```text
🚀 duration(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:18]
  └─> find(…)(…): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:19]
```

**59. `week`** — depth 2 · orphan-root

```text
🚀 week(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:37]
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**60. `getEventColor`** — depth 2 · orphan-root

```text
🚀 getEventColor(event: CalendarEventRecord): null | string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:32]
   ↳ The color of an event's kind: that of its kind's rule, or its own color from the data when it has none.
  └─> getEventKind(event: CalendarEventRecord): EventColorRule | null [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:40]
     ↳ The kind of an event: the most specific rule any of its tags falls under, or none when no rule does.
```

**61. `NightSkySliders`** — depth 2 · orphan-root

```text
🚀 NightSkySliders(properties: Readonly<NightSkySlidersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-sliders.tsx:25]
   ↳ Renders one section's sliders in order, each showing its setting.
  └─> map(…)(control: SkySliderControl): React.JSX.Element [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-sliders.tsx:46]
```

**62. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(checked: boolean): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-lines-section.tsx:84]
  └─> toEclipticChange(visible: boolean): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:140]
     ↳ The change that hides the ecliptic, with `sky.ecliptic=false`, or removes the key to draw it, its default.
```

**63. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(checked: boolean): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:114]
  └─> toVisibilityChange(visible: boolean): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:201]
     ↳ The change that shows the sky, by removing `sky`, or hides it with `sky=off`.
```

**64. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(words: string[]): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:160]
  └─> toConstellationsChange(words: readonly string[]): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:124]
     ↳ The change that writes a choice of figures: removed for the zodiac, the default, `none` for no figure, and the words…
```

**65. `subscribeToDesktopViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToDesktopViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:22]
   ↳ Calls back whenever the page crosses the desktop width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**66. `subscribeToViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:30]
   ↳ Calls back whenever the page crosses the tablet width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**67. `CalendarSkeleton`** — depth 2 · orphan-root

```text
🚀 CalendarSkeleton(properties: Readonly<CalendarSkeletonProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton/calendar-skeleton.tsx:37]
   ↳ Renders the shape of the view the page opens on, a toolbar row over that view's layout: a grid of days for the month,…
  └─> getDefaultCalendarView(isWide: boolean): CalendarViewName [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-views.utilities.ts:14]
     ↳ The view to show when the link names none: the agenda, which reads at a phone's width, or the whole month on anything…
```

**68. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:103]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:120]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**69. `CalendarScaleSelect`** — depth 2 · orphan-root

```text
🚀 CalendarScaleSelect(properties: Readonly<CalendarScaleSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:29]
   ↳ Renders one button for each of the timeline's scales, from a day of minutes to a year of months, the one shown pressed.
  └─> map(…)(option: "day" | "week" | "month" | "quarter" | "year"): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:51]
```

**70. `getAgendaRowHeight`** — depth 2 · orphan-root

```text
🚀 getAgendaRowHeight(row: AgendaListRow, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:60]
   ↳ How tall an agenda row is drawn: a heading is shorter than an event, an event is as tall as its tags need, and the…
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**71. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(record: CalendarEventRecord, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-cluster-dialog/calendar-cluster-dialog.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**72. `CalendarEventTooltip`** — depth 2 · orphan-root

```text
🚀 CalendarEventTooltip(properties: Readonly<CalendarEventTooltipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-tooltip/calendar-event-tooltip.tsx:40]
   ↳ Wraps what is drawn for an event, its glyphs, in a tooltip that follows the pointer, with the event's name in English,…
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
     ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**73. `CalendarEventChip`** — depth 2 · orphan-root

```text
🚀 CalendarEventChip(properties: Readonly<CalendarEventChipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-chip/calendar-event-chip.tsx:33]
   ↳ Draws an event as its glyphs alone, with a tooltip of its name in English and what the database says of it, and for a…
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
     ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**74. `TimelineNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 TimelineNavigation(properties: Readonly<TimelineNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:24]
   ↳ Reports the timeline's own navigation, which only a child of the Gantt can read, to the toolbar above it, and draws…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:40]
```

**75. `CalendarViewSelect`** — depth 2 · orphan-root

```text
🚀 CalendarViewSelect(properties: Readonly<CalendarViewSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:51]
   ↳ Renders one pressed button per view on a desktop, or on a narrower row, a tablet's included, a menu button naming the…
  └─> map(…)(…): Element [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:108]
```

**76. `CalendarToolbar`** — depth 2 · orphan-root

```text
🚀 CalendarToolbar(properties: Readonly<CalendarToolbarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-toolbar/calendar-toolbar.tsx:48]
   ↳ Renders the calendar's toolbar in two rows over whichever view's navigation it is handed: the menus, then the date with…
  └─> hasContent(node: ReactNode): boolean [projects/caelundas/caelundas-web/src/components/calendar-toolbar/calendar-toolbar.utilities.ts:10]
     ↳ Whether a slot the page handed the toolbar holds anything to draw.
```

**77. `AgendaRowContent`** — depth 2 · orphan-root

```text
🚀 AgendaRowContent(properties: Readonly<AgendaRowContentProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-agenda/agenda-row-content.tsx:36]
   ↳ Draws one agenda row: a group's or a day's heading, an event, or the button that lists later days.
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**78. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(row: Readonly<{ record: CalendarEventRecord; }>, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**79. `CalendarGridNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 CalendarGridNavigation(properties: Readonly<CalendarGridNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:24]
   ↳ Reports the event calendar's own navigation, which only a child of the calendar can read, to the toolbar above it, and…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:40]
```

**80. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:42]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**81. `handleClustersChange`** — depth 2 · orphan-root

```text
🚀 handleClustersChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:54]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**82. `handleColorByChange`** — depth 2 · orphan-root

```text
🚀 handleColorByChange(color: EventGroupLevel | undefined): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:57]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**83. `handleColorsChange`** — depth 2 · orphan-root

```text
🚀 handleColorsChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:60]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**84. `handleDateChange`** — depth 2 · orphan-root

```text
🚀 handleDateChange(date: Date): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:63]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**85. `handleFilterChange`** — depth 2 · orphan-root

```text
🚀 handleFilterChange(filter: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:66]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**86. `handleGroupingChange`** — depth 2 · orphan-root

```text
🚀 handleGroupingChange(group: EventGrouping): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:69]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**87. `handleScaleChange`** — depth 2 · orphan-root

```text
🚀 handleScaleChange(scale: "day" | "week" | "month" | "quarter" | "year"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:72]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**88. `handleSymbolsChange`** — depth 2 · orphan-root

```text
🚀 handleSymbolsChange(symbols: CalendarSymbols): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:75]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**89. `handleViewChange`** — depth 2 · orphan-root

```text
🚀 handleViewChange(view: "day" | "week" | "month" | "three-day" | "agenda" | "timeline"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:81]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `loadCalendar` | 8 | `resolveWindows`, `readBasics`, `toEventFilterInput`, `resolveGroups`, `toEventGroupingInput`, `readCached(…)`, `readCached`, `describeEmptiness` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:52` |
| `CalendarTimeline` | 8 | `useBarDialog`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useCallback(…)`, `useMemo(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:92` |
| `CalendarGrid` | 8 | `useCalendarClusters`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `toEventCalendarView`, `getViewLayout`, `useCallback(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:61` |

<details>
<summary>249 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `toggleTag` | 7 | `findIndex(…)`, `measureTags`, `filter(…)`, `coverLeaves`, `fillFromLeaves`, `numberAt`, `readPicks` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:94` |
| `toTimelineRows` | 7 | `map(…)`, `map(…)`, `buildEventGroups`, `placeGroupRows`, `map(…)`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:59` |
| `readStroke` | 6 | `isHexadecimalColor`, `isFiniteNumber`, `normalizeHexadecimalColor`, `clampNumber`, `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:271` |
| `useNightSky` | 6 | `useWindowSize`, `useSyncExternalStore(…)`, `useMemo(…)`, `useEffect(…)`, `useEffect(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:39` |
| `buildEventGroups` | 6 | `find(…)`, `collectGroups`, `describeGroup`, `map(…)`, `toSorted(…)`, `toGroupNodes` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:29` |
| `CalendarColorBy` | 5 | `useMemo(…)`, `find(…)`, `toGroupLevel`, `createColorScheme`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-by.tsx:44` |
| `toConstellationWords` | 5 | `every(…)`, `filter(…)`, `every(…)`, `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:220` |
| `readCalendarSearch` | 5 | `normalizeEventFilter`, `parseGrouping`, `parseTimelineScale`, `parseCalendarSymbols`, `parseCalendarView` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:35` |
| `IndexPage` | 5 | `useMemo(…)`, `useMemo(…)`, `getDefaultCalendarView`, `readTimeZone`, `useCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:110` |
| `readNightSkyOverrides` | 4 | `normalizeHexadecimalColor`, `readNumber`, `readConstellationNames`, `readStrokes` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:99` |
| `getTagStates` | 4 | `measureTags`, `coverLeaves`, `fillFromLeaves`, `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:49` |
| `createEventGroupFields` | 4 | `describeRoot`, `map(…)`, `createTagOptions`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:26` |
| `createColorScheme` | 4 | `find(…)`, `map(…)`, `listTags`, `listValues` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:32` |
| `NightSkyConstellationFolder` | 4 | `map(…)`, `readFolderState`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-folder.tsx:39` |
| `SkeletonBody` | 4 | `map(…)`, `map(…)`, `map(…)`, `from(…)` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:29` |
| `getViewWindows` | 4 | `joinWindows`, `getTimelineDays`, `getVisibleDays`, `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:58` |
| `describeEmptiness` | 4 | `some(…)`, `readCached(…)`, `readCached`, `some(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:103` |
| `useCalendarNavigation` | 4 | `isDayShown`, `formatCalendarDate`, `useMemo(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-navigation/use-calendar-navigation.ts:23` |
| `CalendarEventRow` | 4 | `getEventLabel`, `formatEventTime`, `formatDuration`, `formatEventSpan` | `projects/caelundas/caelundas-web/src/components/calendar-event-row/calendar-event-row.tsx:39` |
| `VirtualList` | 4 | `useMemo(…)`, `getVirtualWindow`, `useEffect(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:54` |
| `clusterRow` | 4 | `toSorted(…)`, `collectRun`, `toCluster`, `previewEvents` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-clusters.utilities.ts:63` |
| `getVisibleTimelineRows` | 4 | `getVirtualWindow`, `getRowOffsets`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:19` |
| `clusterEvents` | 4 | `toSorted(…)`, `getRunKey`, `mergeRuns`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:29` |
| `EventsCalendar` | 4 | `useCalendarNavigation`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:99` |
| `findEvents` | 3 | `queryApi`, `toWindowInput`, `toEventRecord` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:56` |
| `useEffect(…)` | 3 | `catch(…)`, `then(…)`, `queryApi` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:73` |
| `toEventFilterInput` | 3 | `toRuleInput`, `pushWritten`, `joinInputs` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:20` |
| `useFilterQuery` | 3 | `getDefaultFilter`, `isSameEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:26` |
| `CalendarCollectionPicker` | 3 | `toEventFilterInput`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:42` |
| `toTagTreeRows` | 3 | `readDepth`, `toTagTreeRow`, `countSelectedBelow` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:121` |
| `useTagPicker` | 3 | `useState(…)`, `toTagTreeRows`, `getTagStates` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:29` |
| `CalendarFilters` | 3 | `useFilterQuery`, `countActiveEventFilterRules`, `renderFiltersButton` | `projects/caelundas/caelundas-web/src/components/calendar-filters/calendar-filters.tsx:59` |
| `toTagField` | 3 | `isNumericFacet`, `describeRoot`, `createTagOptions` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:98` |
| `resolveEventGrouping` | 3 | `find(…)`, `some(…)`, `resolveLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:96` |
| `GroupLevelRow` | 3 | `find(…)`, `hasTagOptions`, `describeTags` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:46` |
| `splitConstellations` | 3 | `toSorted(…)`, `filter(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:107` |
| `toggleConstellations` | 3 | `listShownConstellations`, `every(…)`, `toConstellationWords` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:160` |
| `CalendarGroupBy` | 3 | `useMemo(…)`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:40` |
| `readConstants` | 3 | `describeDataset`, `findFilterCollections`, `toEventFilterCollection` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:215` |
| `resolveGrouping` | 3 | `createEventGroupFields`, `resolveEventGrouping`, `getDefaultGrouping` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:257` |
| `toGlyphParts` | 3 | `toCharacters`, `readNamedIcon`, `appendSymbol` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:22` |
| `toAgendaRows` | 3 | `getAgendaListing`, `flatMap(…)`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:124` |
| `toGroupedAgendaRows` | 3 | `toAgendaRows`, `filter(…)`, `buildEventGroups` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:155` |
| `createTimelineLayout` | 3 | `getClusterSpan`, `packTimelineLanes`, `clusterTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-lanes.utilities.ts:22` |
| `measure` | 3 | `getVisibleTimelineRows`, `readRowBoxes`, `readViewport` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:117` |
| `mergeRuns` | 3 | `splitRuns`, `getEventKind`, `createStandIn` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:147` |
| `useCalendarClusters` | 3 | `useMemo(…)`, `useCallback(…)`, `find(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:26` |
| `useMemo(…)` | 3 | `filter(…)`, `toAgendaRows`, `getAgendaRange` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.tsx:49` |
| `loader` | 3 | `getCalendarReloadKey`, `loadCalendar`, `validateCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:72` |
| `findFacets` | 2 | `queryApi`, `toWindowInput` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:79` |
| `describeNightSkyProblems` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:29` |
| `findUnknownConstellationNames` | 2 | `normalizeConstellationName`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:47` |
| `readConstellationNames` | 2 | `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:242` |
| `useEffect(…)` | 2 | `describeNightSkyProblems`, `findUnknownConstellationNames` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:108` |
| `handleQueryChange` | 2 | `toEventFilterInput`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:46` |
| `measureTags` | 2 | `readDepth`, `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:242` |
| `toTagTreeRow` | 2 | `readDepth`, `readName` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:331` |
| `handleToggle` | 2 | `toggleTag`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:59` |
| `FilterTagEditor` | 2 | `useTagPicker`, `map(…)` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/filter-tag-editor.tsx:38` |
| `describeEvent` | 2 | `map(…)`, `formatDuration` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:14` |
| `formatDuration` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:38` |
| `colorOf` | 2 | `some(…)`, `hashColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:54` |
| `listTags` | 2 | `readDepth`, `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:95` |
| `listValues` | 2 | `formatDerivedKey`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:125` |
| `listShownConstellations` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45` |
| `NightSkyConstellationPicker` | 2 | `listShownConstellations`, `splitConstellations` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:33` |
| `NightSkyMenu` | 2 | `useNightSkySettings`, `map(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:56` |
| `CalendarViewOptions` | 2 | `createEventGroupFields`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-view-options/calendar-view-options.tsx:47` |
| `readBasics` | 2 | `readCached(…)`, `readCached` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:156` |
| `resolveColorBy` | 2 | `resolveEventGrouping`, `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:243` |
| `resolveGroups` | 2 | `resolveColorBy`, `resolveGrouping` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:278` |
| `resolveWindows` | 2 | `parseCalendarDate`, `findViewWindows` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:295` |
| `appendSymbol` | 2 | `readSymbol`, `appendText` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:43` |
| `readSymbol` | 2 | `findSymbolFiles`, `toIcons` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:128` |
| `EventGlyphs` | 2 | `toGlyphParts`, `map(…)` | `projects/caelundas/caelundas-web/src/components/event-glyphs/event-glyphs.tsx:26` |
| `useMemo(…)` | 2 | `getRowOffsets`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:74` |
| `handleScroll` | 2 | `getVirtualWindow`, `setAnswered(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:92` |
| `describeGroup` | 2 | `formatDerivedKey`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:112` |
| `packTimelineLanes` | 2 | `assignLanes`, `addLaneRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-lanes.utilities.ts:45` |
| `assignLanes` | 2 | `toSorted(…)`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-lanes.utilities.ts:114` |
| `useEffect(…)` | 2 | `watchVisibleRows(…)`, `watchVisibleRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:157` |
| `CalendarViewSelect` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:51` |
| `getRunKey` | 2 | `getEventKind`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:118` |
| `useMemo(…)` | 2 | `getViewWindows`, `clusterEvents` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:40` |
| `AgendaRowContent` | 2 | `formatCalendarDay`, `formatEventCount` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/agenda-row-content.tsx:36` |
| `CalendarAgenda` | 2 | `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.tsx:57` |
| `CalendarOverflowList` | 2 | `useMemo(…)`, `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.tsx:40` |
| `useMemo(…)` | 2 | `getAgendaRange`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:99` |
| `validateCalendarSearch` | 2 | `readCalendarSearch`, `parseSkyValue` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:65` |
| `handleDateChange` | 2 | `updateSearch`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:63` |
| `describeDataset` | 1 | `queryApi` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:39` |
| `findFilterCollections` | 1 | `queryApi` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:91` |
| `findViewWindows` | 1 | `queryApi` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-api.utilities.ts:99` |
| `normalizeHexadecimalColor` | 1 | `from(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:10` |
| `clampNumber` | 1 | `isFiniteNumber` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:212` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:249` |
| `readStrokes` | 1 | `readStroke` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:305` |
| `useWindowSize` | 1 | `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:12` |
| `useEffect(…)` | 1 | `measure` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:21` |
| `select` | 1 | `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:44` |
| `useMemo(…)` | 1 | `toNightSkyInput` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:61` |
| `useEffect(…)` | 1 | `isFieldOfViewCut` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:95` |
| `NightSkyBackdropMount` | 1 | `useNightSky` | `projects/caelundas/caelundas-web/src/components/night-sky-backdrop/night-sky-backdrop-mount.tsx:23` |
| `OutsideDataset` | 1 | `format` | `projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:32` |
| `toRuleInput` | 1 | `toRuleValues` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-input.utilities.ts:85` |
| `countActiveEventFilterRules` | 1 | `toEventFilterInput` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:10` |
| `isSameEventFilter` | 1 | `normalizeEventFilter` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:28` |
| `getDefaultFilter` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.utilities.ts:15` |
| `handleCollectionSelect` | 1 | `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:56` |
| `handleChange` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:71` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:80` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:92` |
| `findAncestors` | 1 | `readDepth` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:15` |
| `readDepth` | 1 | `readData` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:84` |
| `countSelectedBelow` | 1 | `readDepth` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:164` |
| `coverLeaves` | 1 | `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:189` |
| `fillFromLeaves` | 1 | `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:214` |
| `readName` | 1 | `readData` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:300` |
| `useState(…)` | 1 | `findAncestors` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:47` |
| `handleOpen` | 1 | `setExpanded(…)` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69` |
| `handleSearchKeyDown` | 1 | `focusSibling` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:82` |
| `close` | 1 | `handleOpen` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:112` |
| `down` | 1 | `focusSibling` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:115` |
| `open` | 1 | `handleOpen` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:119` |
| `toggle` | 1 | `handleToggle` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:122` |
| `up` | 1 | `focusSibling` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:125` |
| `FilterChipRow` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:30` |
| `createEventFilterFields` | 1 | `toTagField` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:28` |
| `isNumericFacet` | 1 | `every(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:90` |
| `GroupFieldPicker` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:50` |
| `handleSelect` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:75` |
| `describeTags` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:9` |
| `flatMap(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:21` |
| `GroupTagPicker` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:35` |
| `anonymous` | 1 | `toGroupLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:83` |
| `formatEventSpan` | 1 | `write` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:59` |
| `duration` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:18` |
| `week` | 1 | `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:37` |
| `getEventColor` | 1 | `getEventKind` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:32` |
| `hashColor` | 1 | `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:79` |
| `map(…)` | 1 | `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:153` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-by.tsx:50` |
| `formatSliderValue` | 1 | `roundToStep` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:23` |
| `filter(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54` |
| `readFolderState` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:66` |
| `readSliderValue` | 1 | `roundToStep` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:83` |
| `toggleConstellation` | 1 | `toggleConstellations` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:148` |
| `toResetChange` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:182` |
| `toSkyParameterChange` | 1 | `isDefault` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:190` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:236` |
| `useNightSkySettings` | 1 | `useCallback(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:18` |
| `select` | 1 | `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:21` |
| `handleToggle` | 1 | `toggleConstellations` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:45` |
| `NightSkySlider` | 1 | `formatSliderValue` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-slider.tsx:29` |
| `anonymous` | 1 | `readSliderValue` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-slider.tsx:62` |
| `NightSkySliders` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-sliders.tsx:25` |
| `handleSettingChange` | 1 | `toSkyParameterChange` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-lines-section.tsx:50` |
| `anonymous` | 1 | `toEclipticChange` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-lines-section.tsx:84` |
| `handleSettingChange` | 1 | `toSkyParameterChange` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:67` |
| `anonymous` | 1 | `toVisibilityChange` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:114` |
| `anonymous` | 1 | `toResetChange` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:120` |
| `anonymous` | 1 | `toConstellationsChange` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:160` |
| `subscribeToDesktopViewport` | 1 | `subscribeToQuery` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:22` |
| `subscribeToViewport` | 1 | `subscribeToQuery` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:30` |
| `from(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:93` |
| `CalendarSkeleton` | 1 | `getDefaultCalendarView` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton/calendar-skeleton.tsx:37` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:46` |
| `filter(…)` | 1 | `some(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:51` |
| `replaceLevel` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:56` |
| `map(…)` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:83` |
| `anonymous` | 1 | `replaceLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:92` |
| `anonymous` | 1 | `toGroupLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:103` |
| `CalendarScaleSelect` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:29` |
| `map(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-view-options/calendar-view-options.tsx:66` |
| `toEventFilterCollection` | 1 | `toGroup` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:12` |
| `toEventGroupingInput` | 1 | `toLevelInput` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-input.utilities.ts:13` |
| `isDayShown` | 1 | `getViewWindows` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:91` |
| `parseCalendarDate` | 1 | `anchorDay` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:113` |
| `getTimelineDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:136` |
| `getVisibleDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:177` |
| `readCached(…)` | 1 | `findEvents` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:71` |
| `some(…)` | 1 | `isShown` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:112` |
| `readCached(…)` | 1 | `findEvents` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:136` |
| `some(…)` | 1 | `isShown` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:139` |
| `readCached(…)` | 1 | `findFacets` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:166` |
| `readCached` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:180` |
| `readNamedIcon` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:108` |
| `EventTagPills` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:23` |
| `map(…)` | 1 | `getTagColor` | `projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:48` |
| `getVirtualWindow` | 1 | `findFirstRowEndingAfter` | `projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27` |
| `useEffect(…)` | 1 | `anonymous` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:112` |
| `toSorted(…)` | 1 | `compareText` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:60` |
| `collectGroups` | 1 | `readGroupKeys` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:76` |
| `getAgendaRange` | 1 | `addCalendarDays` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:47` |
| `getAgendaRowHeight` | 1 | `getEventRowHeight` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:60` |
| `filter(…)` | 1 | `getAgendaListing` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:168` |
| `getAgendaListing` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:208` |
| `getRowHeight` | 1 | `getEventRowHeight` | `projects/caelundas/caelundas-web/src/components/calendar-cluster-dialog/calendar-cluster-dialog.utilities.ts:19` |
| `describeBar` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.utilities.ts:14` |
| `handleEventClick` | 1 | `describeBar` | `projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.ts:35` |
| `clusterTimelineBars` | 1 | `clusterRow` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-clusters.utilities.ts:21` |
| `isSameRowSet` | 1 | `every(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:41` |
| `windowTimelineBars` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:56` |
| `map(…)` | 1 | `toGanttEvent` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:67` |
| `map(…)` | 1 | `toGanttEvent` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:85` |
| `watchVisibleRows` | 1 | `attach` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:111` |
| `attach` | 1 | `schedule` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:130` |
| `readRowBoxes` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:205` |
| `toGanttEvent` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:235` |
| `CalendarEventTooltip` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-event-tooltip/calendar-event-tooltip.tsx:40` |
| `CalendarEventChip` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-event-chip/calendar-event-chip.tsx:33` |
| `TimelineNavigation` | 1 | `useLayoutEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:24` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:121` |
| `useMemo(…)` | 1 | `toTimelineRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:123` |
| `useMemo(…)` | 1 | `createTimelineLayout` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:128` |
| `useMemo(…)` | 1 | `windowTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:135` |
| `useMemo(…)` | 1 | `toCountColumns` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:144` |
| `watchVisibleRows(…)` | 1 | `setMeasured(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:160` |
| `setMeasured(…)` | 1 | `isSameRowSet` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:161` |
| `handleValueChange` | 1 | `parseCalendarView` | `projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:70` |
| `anonymous` | 1 | `handleValueChange` | `projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:103` |
| `CalendarToolbar` | 1 | `hasContent` | `projects/caelundas/caelundas-web/src/components/calendar-toolbar/calendar-toolbar.tsx:48` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.tsx:71` |
| `useMemo(…)` | 1 | `toGroupedAgendaRows` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.tsx:73` |
| `getRowHeight` | 1 | `getEventRowHeight` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.utilities.ts:19` |
| `toCalendarEvent` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-events.utilities.ts:14` |
| `CalendarGridNavigation` | 1 | `useLayoutEffect(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:24` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:91` |
| `map(…)` | 1 | `toCalendarEvent` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:91` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:95` |
| `map(…)` | 1 | `describeEvent` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:95` |
| `useCallback(…)` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:132` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:129` |
| `useMemo(…)` | 1 | `createColorScheme` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:131` |
| `useMemo(…)` | 1 | `colorEvents` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:135` |
| `getCalendarReloadKey` | 1 | `readCalendarSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:25` |
| `parseGrouping` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:98` |
| `anonymous` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:42` |
| `handleClustersChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:54` |
| `handleColorByChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:57` |
| `handleColorsChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:60` |
| `handleFilterChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:66` |
| `handleGroupingChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:69` |
| `handleScaleChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:72` |
| `handleSymbolsChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:75` |
| `handleViewChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:81` |
| `shouldReload` | 1 | `getCalendarReloadKey` | `projects/caelundas/caelundas-web/src/routes/index.tsx:67` |
| `useMemo(…)` | 1 | `createEventFilterFields` | `projects/caelundas/caelundas-web/src/routes/index.tsx:120` |
| `useMemo(…)` | 1 | `parseCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:130` |

</details>
<!-- callidescope:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-28133-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-996.85_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-49-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-378-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-378-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-125-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-9-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-734-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-97-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-19-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-1-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-1753-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-2-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-1518-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-237-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-1288-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-1131-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-594-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-1712-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-3043-475569?style=flat-square)
![TODO Comments](https://img.shields.io/badge/TODO_Comments-1-ca8a04?style=flat-square)

### Python

![Python Files](https://img.shields.io/badge/Python_Files-0-3776ab?style=flat-square)
![Python Lines](https://img.shields.io/badge/Python_Lines-0-4b8bbe?style=flat-square)
![Python Classes](https://img.shields.io/badge/Python_Classes-0-7c3aed?style=flat-square)
![Python Functions](https://img.shields.io/badge/Python_Functions-0-16a34a?style=flat-square)
![Python Protocols](https://img.shields.io/badge/Python_Protocols-0-0ea5e9?style=flat-square)
![Python Constants](https://img.shields.io/badge/Python_Constants-0-dc2626?style=flat-square)
![Python Imports](https://img.shields.io/badge/Python_Imports-0-0284c7?style=flat-square)
![Python Decorators](https://img.shields.io/badge/Python_Decorators-0-db2777?style=flat-square)
![Docstrings](https://img.shields.io/badge/Docstrings-0-6366f1?style=flat-square)
![Docstring Lines](https://img.shields.io/badge/Docstring_Lines-0-818cf8?style=flat-square)
![Python Comments](https://img.shields.io/badge/Python_Comments-0-64748b?style=flat-square)
![Python Comment Lines](https://img.shields.io/badge/Python_Comment_Lines-0-475569?style=flat-square)

### JSON

![JSON Files](https://img.shields.io/badge/JSON_Files-3-a16207?style=flat-square)
![JSON Lines](https://img.shields.io/badge/JSON_Lines-193-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-43-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-15-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-125-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-114-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-2-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-52-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-180-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-6-ea580c?style=flat-square)

### YAML

![YAML Files](https://img.shields.io/badge/YAML_Files-0-cb171e?style=flat-square)
![YAML Lines](https://img.shields.io/badge/YAML_Lines-0-e34c26?style=flat-square)
![YAML Documents](https://img.shields.io/badge/YAML_Documents-0-f97316?style=flat-square)
![YAML Mappings](https://img.shields.io/badge/YAML_Mappings-0-7c3aed?style=flat-square)
![YAML Sequences](https://img.shields.io/badge/YAML_Sequences-0-8b5cf6?style=flat-square)
![YAML Keys](https://img.shields.io/badge/YAML_Keys-0-0284c7?style=flat-square)
![YAML Scalars](https://img.shields.io/badge/YAML_Scalars-0-16a34a?style=flat-square)
![YAML Anchors](https://img.shields.io/badge/YAML_Anchors-0-059669?style=flat-square)
![YAML Aliases](https://img.shields.io/badge/YAML_Aliases-0-10b981?style=flat-square)
![YAML Comments](https://img.shields.io/badge/YAML_Comments-0-64748b?style=flat-square)
![YAML Max Depth](https://img.shields.io/badge/YAML_Max_Depth-0-ea580c?style=flat-square)

### TOML

![TOML Files](https://img.shields.io/badge/TOML_Files-0-9c4221?style=flat-square)
![TOML Lines](https://img.shields.io/badge/TOML_Lines-0-b45309?style=flat-square)
![TOML Tables](https://img.shields.io/badge/TOML_Tables-0-7c3aed?style=flat-square)
![TOML Array Tables](https://img.shields.io/badge/TOML_Array_Tables-0-8b5cf6?style=flat-square)
![TOML Keys](https://img.shields.io/badge/TOML_Keys-0-0284c7?style=flat-square)
![TOML Arrays](https://img.shields.io/badge/TOML_Arrays-0-16a34a?style=flat-square)
![TOML Comments](https://img.shields.io/badge/TOML_Comments-0-64748b?style=flat-square)

### Shell

![Shell Files](https://img.shields.io/badge/Shell_Files-0-89e051?style=flat-square)
![Shell Lines](https://img.shields.io/badge/Shell_Lines-0-4eaa25?style=flat-square)
![Shell Functions](https://img.shields.io/badge/Shell_Functions-0-16a34a?style=flat-square)
![Shell Variables](https://img.shields.io/badge/Shell_Variables-0-0284c7?style=flat-square)
![Shell Exports](https://img.shields.io/badge/Shell_Exports-0-ea580c?style=flat-square)
![Shell Conditionals](https://img.shields.io/badge/Shell_Conditionals-0-7c3aed?style=flat-square)
![Shell Loops](https://img.shields.io/badge/Shell_Loops-0-8b5cf6?style=flat-square)
![Shell Pipelines](https://img.shields.io/badge/Shell_Pipelines-0-059669?style=flat-square)
![Shebangs](https://img.shields.io/badge/Shebangs-0-6b7280?style=flat-square)
![Shell Comments](https://img.shields.io/badge/Shell_Comments-0-64748b?style=flat-square)
![Shell Comment Lines](https://img.shields.io/badge/Shell_Comment_Lines-0-475569?style=flat-square)

### SQL

![SQL Files](https://img.shields.io/badge/SQL_Files-0-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-0-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-0-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-0-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-0-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-0-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-0-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-0-64748b?style=flat-square)

### HCL

![HCL Files](https://img.shields.io/badge/HCL_Files-0-844fba?style=flat-square)
![HCL Lines](https://img.shields.io/badge/HCL_Lines-0-a78bfa?style=flat-square)
![HCL Blocks](https://img.shields.io/badge/HCL_Blocks-0-7c3aed?style=flat-square)
![HCL Resources](https://img.shields.io/badge/HCL_Resources-0-0284c7?style=flat-square)
![HCL Variables](https://img.shields.io/badge/HCL_Variables-0-16a34a?style=flat-square)
![HCL Outputs](https://img.shields.io/badge/HCL_Outputs-0-059669?style=flat-square)
![HCL Attributes](https://img.shields.io/badge/HCL_Attributes-0-0ea5e9?style=flat-square)
![HCL Interpolations](https://img.shields.io/badge/HCL_Interpolations-0-db2777?style=flat-square)
![HCL Comments](https://img.shields.io/badge/HCL_Comments-0-64748b?style=flat-square)

### CSS

![CSS Files](https://img.shields.io/badge/CSS_Files-1-264de4?style=flat-square)
![CSS Lines](https://img.shields.io/badge/CSS_Lines-3-2965f1?style=flat-square)
![CSS Rules](https://img.shields.io/badge/CSS_Rules-0-7c3aed?style=flat-square)
![CSS Selectors](https://img.shields.io/badge/CSS_Selectors-0-8b5cf6?style=flat-square)
![CSS Declarations](https://img.shields.io/badge/CSS_Declarations-0-0284c7?style=flat-square)
![CSS At Rules](https://img.shields.io/badge/CSS_At_Rules-2-f97316?style=flat-square)
![CSS Media Queries](https://img.shields.io/badge/CSS_Media_Queries-0-ea580c?style=flat-square)
![CSS Custom Properties](https://img.shields.io/badge/CSS_Custom_Properties-0-16a34a?style=flat-square)
![CSS Comments](https://img.shields.io/badge/CSS_Comments-0-64748b?style=flat-square)

### Conventions

![Module Files](https://img.shields.io/badge/Module_Files-0-7c3aed?style=flat-square)
![Service Files](https://img.shields.io/badge/Service_Files-0-0284c7?style=flat-square)
![Command Files](https://img.shields.io/badge/Command_Files-0-16a34a?style=flat-square)
![Constants Files](https://img.shields.io/badge/Constants_Files-69-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-62-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-67-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-37-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-1-7c3aed?style=flat-square)
![End To End Tests](https://img.shields.io/badge/End_To_End_Tests-0-0284c7?style=flat-square)
![CSS Comment Budget](https://img.shields.io/badge/CSS_Comment_Budget-0-16a34a?style=flat-square)
![HCL Comment Budget](https://img.shields.io/badge/HCL_Comment_Budget-0-ea580c?style=flat-square)
![Python Comment Budget](https://img.shields.io/badge/Python_Comment_Budget-0-db2777?style=flat-square)
![SQL Comment Budget](https://img.shields.io/badge/SQL_Comment_Budget-0-0ea5e9?style=flat-square)
![TOML Comment Budget](https://img.shields.io/badge/TOML_Comment_Budget-0-059669?style=flat-square)
![TypeScript Comment Budget](https://img.shields.io/badge/TypeScript_Comment_Budget-0-ca8a04?style=flat-square)
![YAML Comment Budget](https://img.shields.io/badge/YAML_Comment_Budget-0-7c3aed?style=flat-square)
![Shell Comment Budget](https://img.shields.io/badge/Shell_Comment_Budget-0-0284c7?style=flat-square)

### Jupyter

![Notebooks](https://img.shields.io/badge/Notebooks-0-f37626?style=flat-square)
![Notebook Cells](https://img.shields.io/badge/Notebook_Cells-0-e8a33d?style=flat-square)
![Code Cells](https://img.shields.io/badge/Code_Cells-0-3776ab?style=flat-square)
![Markdown Cells](https://img.shields.io/badge/Markdown_Cells-0-083fa1?style=flat-square)
![Raw Cells](https://img.shields.io/badge/Raw_Cells-0-9ca3af?style=flat-square)
![Executed Cells](https://img.shields.io/badge/Executed_Cells-0-16a34a?style=flat-square)
![Cell Outputs](https://img.shields.io/badge/Cell_Outputs-0-059669?style=flat-square)
![Notebook Code Lines](https://img.shields.io/badge/Notebook_Code_Lines-0-4b8bbe?style=flat-square)
![Notebook Classes](https://img.shields.io/badge/Notebook_Classes-0-7c3aed?style=flat-square)
![Notebook Functions](https://img.shields.io/badge/Notebook_Functions-0-22c55e?style=flat-square)
![Notebook Imports](https://img.shields.io/badge/Notebook_Imports-0-0284c7?style=flat-square)
![Notebook Decorators](https://img.shields.io/badge/Notebook_Decorators-0-db2777?style=flat-square)
![Notebook Prose Lines](https://img.shields.io/badge/Notebook_Prose_Lines-0-1f6feb?style=flat-square)
![Notebook Headings](https://img.shields.io/badge/Notebook_Headings-0-a78bfa?style=flat-square)
![Notebook Links](https://img.shields.io/badge/Notebook_Links-0-10b981?style=flat-square)
![Notebook Images](https://img.shields.io/badge/Notebook_Images-0-34d399?style=flat-square)
![Notebook Code Blocks](https://img.shields.io/badge/Notebook_Code_Blocks-0-dc2626?style=flat-square)
![Notebook Properties](https://img.shields.io/badge/Notebook_Properties-0-ca8a04?style=flat-square)
![Notebook Nodes](https://img.shields.io/badge/Notebook_Nodes-0-a16207?style=flat-square)
![Notebook Max Depth](https://img.shields.io/badge/Notebook_Max_Depth-0-ea580c?style=flat-square)

### Markdown

![Markdown Files](https://img.shields.io/badge/Markdown_Files-1-083fa1?style=flat-square)
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-437-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-7-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-9-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-62-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-39-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-1-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-7-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-12-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-8-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-136-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-web:coinagerie-check:write`.

- **air**: One of the four sign elements used as a filter field, with a value of fire, earth, air or water.
- **alt**: Short form in the sky settings key altBottom, the lowest altitude the night sky draws, beneath the horizon.
- **altitude**: Height of a star above the horizon in degrees, where the pole observer sees altitude equal declination, shown by the night sky.
- **anchor**: Names a date or position a calendar timeline is laid out from, passed as the anchor date prop to the timeline.
- **angle**: Degree rotation the night sky star group is drawn at, derived from sidereal time as the sky turns.
- **aquarius**: Zodiac sign and constellation name whose sign glyph maps to its icon file in the calendar glyphs.
- **aspect**: Angular relationship between two bodies, such as a conjunction or a harmonic, filtered and colored as a tag root.
- **astraea**: Asteroid whose name the project does not use in code; it appears only in the glossary list here.
- **astronomical**: Twilight stage, such as Astronomical Dawn or Dusk, that the calendar labels and draws with a glyph icon.
- **beltane**: Cross-quarter festival date, which the calendar marks with a flower glyph and its own icon image.
- **binovile**: Harmonic aspect at two novile steps that appears in the glossary list but has no code or icon in this project.
- **biquintile**: Aspect of 144 degrees, two quintile steps, drawn with a dedicated 144-degree icon in calendar glyphs.
- **biseptile**: Aspect of about 103 degrees, two septile steps, that the project lists only in its glossary.
- **boomerang**: Emoji-keyed glyph image that the calendar draws for one event category, mapped from the boomerang emoji.
- **border**: Outline drawn around agenda date and group surfaces, through class names that set their edges in the calendar.
- **boundary**: Index splitting an event summary into its glyph symbols and English name, so the name is cut at that index.
- **breadth**: Callidescope limit on how many calls a callable fans out to, declared as maximumBreadth in its configuration.
- **brightness**: Glyph for the maximum brightness event, keyed by a bright emoji and drawn from maximum-brightness-icon.svg.
- **butterfly**: Emoji-keyed icon image, butterfly-icon.png, the calendar shows for one of its event label symbols.
- **cancer**: Zodiac sign whose ingress event, such as event-sun-ingress-cancer, the filter tests and collections reference by id.
- **capricorn**: Zodiac sign whose glyph maps to capricorn-icon.svg, which the calendar icon utilities test checks by name.
- **cardinal**: Modality value for a zodiac sign, one of cardinal, fixed or mutable, offered as a filter value.
- **cascade**: Tag picker prop that, when true, makes ticking a parent tag tick the tags beneath it; group picker sets it false.
- **chiron**: Centaur asteroid whose symbol maps to chiron-icon.svg in the calendar glyph constants and utility tests.
- **civil**: Twilight stage of dawn or dusk labeled Civil Dawn or Civil Dusk, each with its own calendar glyph icon.
- **conjunction**: Aspect at zero degrees between two bodies, with harmonic 1 and its own conjunction-0 icon in the glyph map.
- **constellation**: Named star pattern the night sky draws with its own lines, from catalog records, listed as folders in the sky menu.
- **contraparallel**: Aspect between bodies with equal declination on opposite sides of the equator; the project lists it only here.
- **cradle**: Calendar glyph mapped from the bed emoji to cradle-icon.png, used for one event label in the glyph map.
- **crescent**: Moon phase between new and quarter, offered as a filter value and drawn with waxing or waning crescent icons.
- **cut**: Verb for removing or trimming: a view is added or cut from the list, and night sky rings are cut at the window edge.
- **dawn**: Twilight start of morning, labeled Astronomical or Civil Dawn, each with its glyph in calendar icon constants.
- **daylight**: Event label for the sun above the horizon, mapped to day-icon.svg as its calendar glyph.
- **decan**: Ten-degree third of a zodiac sign, numbered and drawn with the decan digit keycap in calendar glyphs.
- **decile**: Aspect of 36 degrees, one tenth of the circle, drawn with its own decile-36 icon image in calendar glyphs.
- **decuple**: Tenth-harmonic group of 36-degree aspects, labeled a stellium in the CLI symbol map and absent from this project.
- **degree**: Angle unit for all night sky coordinates, such as the 90-degree default vertical field and full turns.
- **dignity**: Filter field for planet strength in a sign, such as domicile or exaltation, used as a tag root.
- **domain**: Tag group recording whether an event belongs to the solar, lunar or planetary sphere, and the Nx domain tag this project carries.
- **duodecuple**: Twelfth-harmonic group of 30-degree aspects, labeled a stellium in the CLI symbol map and absent from this project.
- **dusk**: Evening twilight stage, labeled Astronomical Dusk, Astronomical Twilight Evening or Civil Dusk, each with its own icon.
- **earth**: Earth-centered reference in the Eclipse Frame filter, and the element name of earth signs in the Element filter.
- **eclipse**: Event type for solar or lunar eclipses, colored red in the Type color scheme and offered in the Eclipse Frame filter.
- **ecliptic**: Yearly path the Sun appears to follow across the sky, drawn as a line with style keys for color and width.
- **element**: Classification of a zodiac sign as fire, earth, air or water, offered as a filter field and tag group.
- **elongation**: Angular distance of a planet from the Sun, its stage shown by east or west arrow glyphs on the calendar.
- **eris**: Dwarf planet Eris, a body whose aspects the CLI's triple-aspect tests tag; the web app never names it.
- **fire**: A value of the Element filter that marks a sign as belonging to the fire element.
- **focal**: The body a pattern points at, such as a T-square's apex, named in the event filter's Focal Body field.
- **fov**: The vertical angle in degrees the night sky shows, set by the sky.vFov link key read from the page link.
- **gap**: The spacing between a flex or grid layout's items, set with Tailwind gap utilities such as gap-2 in the calendar.
- **gemini**: The zodiac sign of the twins, mapped from ♊ to its icon and drawn as a night-sky constellation figure.
- **geocentric**: An Earth-centered eclipse marker, drawn as a globe emoji with its own SVG icon in the event glyph table.
- **gibbous**: The Moon's phase between quarter and full, as the phase filter and its waxing and waning icons name it.
- **gonggong**: A trans-Neptunian dwarf planet whose name no source or test file uses; only the glossary mentions it.
- **grand**: Part of a three-or-more-body aspect pattern name, like grand trine or grand cross, in the collections and icon table.
- **hammer**: The event glyph for the hammer emoji, mapped to its PNG icon file in the calendar icon table.
- **hang**:
- **harmonic**: A numbered aspect family, such as Harmonic 4, whose tags the calendar filters and agenda group under Type.
- **hebe**: A main-belt asteroid whose name no source or test file uses, leaving only the glossary headword.
- **hexadecan**: A sixteenth-harmonic point of the zodiac, named by ordinal such as Fifth Hexadecan, which the CLI emits as an event.
- **hexagram**: The dotted six-pointed star emoji, mapped to its PNG icon in the calendar icon table.
- **hourglass**: The ⏳ emoji event glyph, mapped to its PNG icon in the calendar icon table.
- **hygiea**: A main-belt asteroid no source or test file names, so this headword lives only in the glossary.
- **imbolc**: The cross-quarter festival of early February, mapped to its PNG icon in the event glyph table.
- **ingress**: A planet's entry into a new zodiac sign, tagged Type / Ingress so the calendar can color and filter it.
- **instant**: A zero-length event: a moment with no duration, which the duration filter and legend list as Instant.
- **ixion**: A trans-Neptunian plutino dwarf planet, not named in any source or test file, so only the glossary records it.
- **juno**: The asteroid symbol ⚵ mapped to juno-icon.svg in the event glyph table, so that body's events get an icon.
- **jupiter**: The planet symbol ♃ mapped to jupiter-icon.svg in the event glyph table, and named in glyph test event titles.
- **kite**: An aspect pattern shape named in the focal body filter, whose emoji 🪁 maps to kite-icon.png.
- **lamma**: The cross-quarter festival at 135 degrees, emitted as a CLI event and mapped to a PNG icon in the web glyph table.
- **latitude**: The observer's north-south angle, read from sky.lat to place the night sky, and a column of each calendar event.
- **leaf**: A tag or group with no children, which stands for itself: a leaf is its own group at any depth below it.
- **leo**: The zodiac sign of the lion, whose ♌ glyph maps to leo-icon.svg and tags events as Sign / Leo.
- **libra**: The scales sign of the zodiac, ♎ mapped to libra-icon.svg, and a constellation folder the night-sky picker lists.
- **lilith**: The Black Moon point, the lunar apogee body whose ⚸ glyph maps to its SVG icon in the glyph table.
- **litha**: The summer solstice festival whose 🌞 emoji maps to litha-icon.png in the event glyph table.
- **longitude**: The observer's east-west angle, read from sky.lon to place the night sky, and the zodiacal longitude of an event.
- **lunar**: Tied to the Moon: the daily and monthly lunar cycle tags, colored by the calendar's color-by scheme.
- **mabon**: The autumn equinox festival whose 🍂 emoji maps to mabon-icon.png in the calendar's event glyph table.
- **mag**: The magnitude unit suffix, written as mag after a star's brightness value in the night-sky menu's labels.
- **magnitude**: A star's brightness on the astronomical scale, lower being brighter, stored per star and capped by the faintest-star setting.
- **makemake**: A dwarf planet of the Kuiper belt that no source or test file names, leaving only this glossary entry.
- **mercury**: The innermost planet, named in the calendar's color scheme tests and in a Mercury retrograde filter fixture.
- **modality**: A zodiac sign's quality, cardinal, fixed or mutable, offered as a filter field and tag group for events.
- **moon**: Tag path naming the Moon, whose events a without-the-Moon collection excludes from its planetary aspect set.
- **mutable**: One of the three sign modalities, alongside cardinal and fixed, offered as a value in the event filters.
- **mystic**: Name root of the aspect pattern whose door emoji maps to a PNG icon in the event glyph set.
- **nadir**: Event name for the lowest point of the Sun or a planet below the horizon, shown with a down-arrow icon.
- **nautical**: Sun-altitude twilight events, the Dawn, Dusk and Evening variants, each mapped to its own SVG icon.
- **negative**: The polarity of a sign, either positive or negative, offered as a filter value.
- **neptune**: A planet whose glyph and icon label its events, as in Moon sextile Neptune.
- **nessus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **nonuple**: Stellium label for a cluster of nine bodies, mapped to a symbol in the stellium constants.
- **north**: The lunar north node glyph, mapped to its own SVG icon, and the north pole facing the sky view.
- **novile**: Harmonic aspect at 40 degrees, the ninth harmonic, named in event labels such as Sun novile Pluto.
- **observer**: The viewer position on Earth, from which local times, horizons and eclipses are measured.
- **octile**: An aspect at 45 degrees, the eighth harmonic, mapped to its own PNG icon.
- **octuple**: Stellium label for a cluster of eight bodies, mapped to a symbol in the stellium constants.
- **ophicus**: Constellation name for a body or sign outside the twelve zodiac signs, unused by any code here.
- **opposition**: The 180-degree aspect, harmonic 2, mapped to its own PNG icon in the glyph set.
- **orcus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **ostara**: Seasonal festival event, the spring equinox name here, mapped to a PNG icon in the glyph set.
- **palla**: Asteroid Pallas, named in event labels such as Mars biquintile Pallas, with its own glyph.
- **pentagram**: The star glyph for a five-pointed pattern, mapped to its own PNG icon in the glyph set.
- **phase**: Lunar or planetary cycle stage, a filter and color field grouping events by cycle position.
- **pholus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **pisce**: Zodiac sign whose glyph maps to its own SVG icon, and a constellation listed in the sky menu.
- **place**: A position in a color legend where values without one take their color from their own text.
- **planet**: A celestial body whose glyph, name and events the calendar shows, such as Mars or Jupiter.
- **pluto**: Dwarf-planet body whose glyph maps to its own SVG icon and appears in event names.
- **polarity**: Whether a zodiac sign is positive or negative, offered as a filter field and a color group.
- **pole**: The north celestial pole at the top of the night-sky view, where altitude equals declination.
- **presentation**: The shared UI primitives package of Button and Skeleton, which the app imports from.
- **prograde**: Direction of a planet moving forward through the zodiac, mapped to its own SVG icon.
- **prop**: React inputs passed to a component, named as properties in this codebase rather than props.
- **quadruple**: Stellium label for four bodies clustered together, mapped to a PNG icon in the glyph set.
- **quaoar**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **quarter**: Calendar quarter of the year, a group field keying events like 2026-Q1, and a Moon phase.
- **quiet**: Class string that hides the timeline bar labels, keeping the timeline uncluttered.
- **quincunx**: The 150-degree minor aspect, mapped to its own PNG icon in the glyph set.
- **quintile**: The 72-degree aspect, a fifth-harmonic, mapped to its own PNG icon in the glyph set.
- **quintuple**: Label for the CLI quintuple aspects module, computing five-fold harmonic aspect groupings.
- **radial**: A radialGradient SVG fill, the star glow and ground shading drawn behind the night sky.
- **rectangle**: Shape word in the Mystic Rectangle aspect name, mapped to its own PNG icon via a door emoji.
- **retrograde**: Apparent backward motion of a planet, a station event with its own icon in the glyph set.
- **rise**: A planet stage relative to the Sun, such as rising or setting, in the planetary phase filter.
- **role**: ARIA attribute on a status or alert region, so screen readers announce empty and error states.
- **samhain**: Seasonal festival event at a cross-quarter day, mapped to its own PNG icon in the glyph set.
- **saturn**: Ringed planet whose glyph and aspect events, such as Mars squares, appear across the calendar.
- **scorpio**: Zodiac sign of the scorpion, whose glyph maps to its own SVG icon in the glyph set.
- **season**: A filter and color field giving the time of year an event falls in, such as spring.
- **sedna**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **selector**: A control that picks one option from a list, such as the view or scale menu in the toolbar.
- **semisextile**: The 30-degree minor aspect, mapped to its own PNG icon in the glyph set.
- **septile**: The 51.43-degree aspect, a seventh harmonic, mapped to its own PNG icon in the glyph set.
- **septuple**: Stellium label for a cluster of seven bodies, mapped to a symbol in the stellium constants.
- **sextile**: The 60-degree aspect, a harmonic-six pattern, shown in event names with the star glyph.
- **sextuple**: Stellium label for six bodies clustered together, mapped to its own PNG icon in the glyph set.
- **sibling**: A neighboring element under the same parent, which focus moves between in the tag picker.
- **sky**: The night-sky backdrop behind the calendar and its settings, such as sky.top, sky.lat and sky.lon.
- **south**: The descending lunar node glyph, mapped to its own SVG icon beside the north node.
- **square**: The 90-degree aspect, a harmonic-four pattern, shown in event names beside its glyph.
- **star**: Celestial point in the night sky, as in the morning-star and evening-star icons and the sky backdrop.
- **stellium**: Cluster of three or more bodies in one sign or spot, named by its count and given a glyph icon.
- **sun**: Central body of the solar system, whose glyph and events label Sun-relative stages and twilight.
- **synodic**: Planet-with-Sun cycle label, a filter field and tag group for each planet stage.
- **taurus**: Zodiac sign of the bull, whose glyph maps to its own SVG icon, and a constellation in the sky menu.
- **temporality**: Derived filter field classing an event as past, ongoing or upcoming relative to the current time.
- **trapeze**: Four-body aspect pattern that no code in this project uses, so only this glossary names it.
- **tridecile**: The 108-degree aspect, mapped to its own PNG icon in the glyph set.
- **trine**: The 120-degree aspect, a harmonic-three pattern, shown in event names with a triangle glyph.
- **trioctile**: The 135-degree aspect, mapped to its own PNG icon in the glyph set.
- **triple**: Compound aspect group of three bodies, mapped to the three-body stellium icon.
- **triseptile**: A 154.29-degree aspect in the seventh-harmonic family, which no code in this project uses.
- **twilight**: Sun-altitude dusk and dawn stage, a Type value with civil, nautical and astronomical bands.
- **typhon**: Centaur body name that no code in this project uses, so it survives only as a glossary entry.
- **undecile**: The 32.7-degree aspect, an eleventh-harmonic pattern, shown in event names with its own SVG icon.
- **undecuple**: Stellium label for eleven bodies clustered together, mapped to a symbol in the stellium constants.
- **unfinished**:
- **unmeasured**: Stand-in size used before a virtual list is measured, a 720 by 640 default height and width.
- **unmount**:
- **uranus**: Ice giant body whose glyph maps to its own SVG icon in the glyph set.
- **vesta**: Asteroid body whose glyph maps to its own SVG icon in the event glyph set.
- **vigintile**: A 18-degree aspect, a twentieth-harmonic division, which no code in this project uses.
- **virgo**: Zodiac sign of the maiden, whose glyph maps to its own SVG icon, and a constellation in the sky menu.
- **visibility**: Eclipse filter field saying whether an eclipse is measured from Earth center or the observer.
- **visible**: Shown on screen, such as the visible rows the virtual list computes for its window.
- **water**: Elemental class of a zodiac sign, one of fire, earth, air or water, offered as a filter value.
- **weekday**: Calendar day of the week as a grouping and color field, such as Monday through Sunday.
- **yod**: Compound aspect pattern, the Yod, a Compound Aspect variant in the color path tests.
- **york**:
- **yule**: Seasonal festival event at the winter solstice, mapped to its own PNG icon in the glyph set.
- **zenith**: Point directly overhead, shown as an upward-arrow event glyph with its own SVG icon.
- **zodiac**: Twelve signs along the ecliptic, the sky backdrop default constellation set and a filter group.

<!-- coinagerie:end -->
