## Develop

```bash
nx run caelundas-web:start
```

The dev and preview servers listen on port 8967, derived from the project name
with `scripts/shell/text-to-port.sh caelundas-web` as every other application's
is, and `nx run caelundas-web:stop` frees it.

This serves the committed seed: a handful of events from `data/events-seed.sql`.

## Build with real events

The app bundles one SQLite file, `output/events.sqlite`, which is gitignored
and rebuilt before every build by `scripts/build-events-database.ts`. To fill
it with the events `caelundas-cli` calculates instead of the seed:

```bash
# 1. Ingest events; the first run creates caelundas-cli/output/database.sqlite,
#    and every run leaves the read model this app queries up to date in it
nx run caelundas-cli:download-ephemeris
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env
nx run caelundas-cli:start

# 2. Copy that file and build
nx run caelundas-web:build:ingested
nx run caelundas-web:preview:ingested   # or start:ingested for the dev server
```

The `ingested` configuration of `build-database`, which `build`, `start` and
`preview` pass down, copies `caelundas-cli/output/database.sqlite` to
`output/events.sqlite`, and stops, naming the file, when it does not exist yet.
Without it the build creates a database from `caelundas-cli`'s migration and
the committed rows in `caelundas-cli/data/events-seed.sql`, which tests and CI
rely on.

## Test

```bash
nx run caelundas-web:vitest
```

## Night sky link parameters

The backdrop reads these from the page link; a value that does not parse falls
back to its default. Colors are text of three or six hexadecimal digits, with
or without the `#`. Write the `#` as `%23`, for example `sky.top=%23102040`:
the router reads an all-digit value such as `123456` or `1e5` as a number,
which cannot be told from the color it was meant to be, so a number falls back
to the default.

- `sky=off` removes the backdrop.
- `sky.lat` and `sky.lon` move the observer, New York by default; a latitude of
  0 or below draws nothing.
- `sky.vFov` sets the degrees of altitude shown, and `sky.altBottom` the
  altitude at the bottom edge.
- `sky.pixelsPerSecond` sets the drift speed in on-screen pixels per second.
- `sky.maxMag` sets the faintest magnitude drawn, and `sky.starScale`
  multiplies the dot size.
- `sky.top` and `sky.bottom` set the colors at the top and bottom of the
  background, `04060f` and `0d1533` by default.
- `sky.debug=true` draws the zoomed-out tuning view.

## Star catalog

The night sky backdrop draws from `src/hooks/use-night-sky/use-night-sky.catalog.json`,
the [HYG star database](https://github.com/astronexus/HYG-Database) v4.1
trimmed to stars at or brighter than magnitude 6.5 at declination -30 degrees or
north, brightest first. HYG is licensed
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) and the
trimmed catalog is a derived work, so it carries the same license and credit
to David Nash and the HYG contributors. To rebuild it from a downloaded copy of
the CSV (never committed), check the columns `id`, `ra`, `dec`, `mag` and `ci`
exist in the release first, then run:

```bash
nx run caelundas-web:build-star-catalog -- hyg.csv src/hooks/use-night-sky/use-night-sky.catalog.json
```

## 👔 Conformetry

This project was generated from the [tanstack-application](/configuration/conformetry-templates/tanstack-application) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 506 |
| Files | 249 |
| Calls traced | 479 |
| Call stacks | 80 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 85 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `toggle`** — depth ≥ 6 · orphan-root

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

**2. `FilterTagEditor`** — depth 6 · orphan-root

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

**3. `CalendarFilters`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarFilters(properties: Readonly<CalendarFiltersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters/calendar-filters.tsx:105]
   ↳ Renders the active filters as chips, then the Filters button with a count of the finished rules, which opens the nested…
  └─> useFilterQuery(…): UseFilterQueryResult [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:27]
     ↳ Holds the filter tree the builder edits and the collections it can be replaced with.
    └─> useMemo(…)(): ResolvedEventFilterCollection[] [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:34]
      └─> resolveEventFilterCollections(facets: readonly EventFacet[]): ResolvedEventFilterCollection[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:43]
         ↳ Resolves every collection the database's tags can serve, in menu order.
        └─> resolveGroup(group: CollectionGroup, context: ResolveContext): EventFilterQuery | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:75]
           ↳ Resolves a group's rules and nested groups, leaving out any that name no tag the data has and any group left with…
          └─> resolveRule(…): EventFilterNode | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:122]
             ↳ Resolves one rule to the tags of the data that its paths name, or `null` when the data has no such root or none of the…
```

<details>
<summary>77 more call stacks</summary>

**4. `CalendarTimeline`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarTimeline(properties: Readonly<CalendarTimelineProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:91]
   ↳ Renders the events as a Gantt timeline: a row per group, nested and collapsible as the grouping nests, each counting…
  └─> useMemo(…)(): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:122]
    └─> toTimelineRows(…): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:59]
       ↳ Lays events out as Gantt rows by a grouping.
      └─> map(…)(record: CalendarEventRecord): GanttEvent<TimelineBar> [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:67]
        └─> toGanttEvent(record: CalendarEventRecord, rowId: string): GanttEvent<TimelineBar> [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:235]
           ↳ One event drawn in one row: read-only, colored as the data colors it, and carrying its record for the bar to render.
          └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
             ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**5. `CalendarAgenda`** — depth 6 · orphan-root

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

**6. `CalendarGrid`** — depth ≥ 6 · orphan-root

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

**7. `EventsCalendar`** — depth ≥ 6 · orphan-root

```text
🚀 EventsCalendar(properties: Readonly<EventsCalendarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:95]
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

**8. `loader`** — depth ≥ 6 · orphan-root

```text
🚀 loader(…): Promise<CalendarData> [projects/caelundas/caelundas-web/src/routes/index.tsx:64]
  └─> loadCalendar(database: EventsDatabase, search: CalendarSearch): Promise<CalendarData> [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:41]
     ↳ Reads the events in the window the search parameters' view and day show, plus a buffer, that pass their filter,…
    └─> resolveWindows(…): { anchor: Date; visible: EventsWindow; window: EventsWindow; } [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:289]
       ↳ The day the search anchors on, today without one, and the window the view shows around it, with the buffer read beyond…
      └─> getViewWindows(…): ViewWindows [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:58]
         ↳ The days a view shows around the day it opens on, as UTC midnights, and the window read for them, a day wider either…
        └─> getTimelineDays(scale: TimelineScale, anchor: Date): EventsWindow [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:136]
           ↳ The days the timeline's axis spans at a scale, as the Gantt lays them out: the day, the week from Sunday, the month,…
          └─> shiftDays(date: Date, days: number): Date [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:229]
             ↳ An instant a number of whole days later, or earlier for a negative one.
```

**9. `IndexPage`** — depth ≥ 6 · orphan-root

```text
🚀 IndexPage(): ReactNode [projects/caelundas/caelundas-web/src/routes/index.tsx:100]
   ↳ Renders the landing page's heading.
  └─> useMemo(…)(): EventFilterField[] [projects/caelundas/caelundas-web/src/routes/index.tsx:105]
    └─> createEventFilterFields(facets: readonly EventFacet[]): EventFilterField[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:28]
       ↳ Builds the filter builder's fields: one per tag root in the database's facets, offering every tag beneath it, then the…
      └─> toTagField(facet: EventFacet): EventFilterField [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:98]
         ↳ Builds the field for one tag root.
        └─> isNumericFacet(facet: EventFacet): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:90]
           ↳ Whether every tag beneath a root is named for a number it ends in, such as "Harmonic 6", so the root reads as a number…
          └─> every(…)(value: EventFacetValue): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:91]
```

**10. `handleQueryChange`** — depth ≥ 5 · orphan-root

```text
🚀 handleQueryChange(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:51]
  └─> compileEventFilter(node: EventFilterNode | undefined): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:28]
     ↳ Compiles the ReUI filter tree to one parameterized boolean expression over the derived events view, aliased `e`.
    └─> compileRule(rule: EventFilterRule): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:75]
       ↳ Compiles one rule by its field, flipping it when the rule is negated.
      └─> compileTagNumberRule(…): SqlCondition | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:93]
         ↳ Compiles a numeric rule on a tag root whose tags are named for numbers: events with a tag beneath the root whose number…
        └─> isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:150]
           ↳ Whether an operator compares a number with a range of two.
```

**11. `CalendarCollectionPicker`** — depth 5 · orphan-root

```text
🚀 CalendarCollectionPicker(properties: Readonly<CalendarCollectionPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:42]
   ↳ Renders the collection the filters below come from, as a dropdown to pick another from.
  └─> compileEventFilter(node: EventFilterNode | undefined): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:28]
     ↳ Compiles the ReUI filter tree to one parameterized boolean expression over the derived events view, aliased `e`.
    └─> compileRule(rule: EventFilterRule): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:75]
       ↳ Compiles one rule by its field, flipping it when the rule is negated.
      └─> compileTagNumberRule(…): SqlCondition | null [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:93]
         ↳ Compiles a numeric rule on a tag root whose tags are named for numbers: events with a tag beneath the root whose number…
        └─> isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:150]
           ↳ Whether an operator compares a number with a range of two.
```

**12. `CalendarColorBy`** — depth 5 · orphan-root

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

**13. `EventGlyphs`** — depth 5 · orphan-root

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

**14. `CalendarOverflowList`** — depth 5 · orphan-root

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

**15. `describeDataset`** — depth ≥ 5 · orphan-root

```text
🚀 describeDataset(): Promise<EventsDataset | null> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:28]
  └─> map(…)(row: Readonly<Record<string, unknown>>): EventsDataset [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:31]
    └─> toDataset(row: SqlRow): EventsDataset [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:93]
       ↳ Maps the dataset summary row.
      └─> readDate(row: SqlRow, column: string): Date [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:70]
         ↳ Reads an ISO 8601 text column as an instant.
        └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:77]
           ↳ Reads a column the schema declares `not null` as text.
```

**16. `findEvents`** — depth ≥ 5 · orphan-root

```text
🚀 findEvents(query: EventsQuery): Promise<CalendarEventRecord[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:34]
  └─> replace(…)(): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:40]
    └─> toGroupColumns(groups: readonly SqlGroupSource[]): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:158]
       ↳ The select list's extra columns, one JSON array of group keys per level, named `group_0` onward.
      └─> map(…)(group: SqlGroupSource, level: number): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:160]
        └─> replace(…)(): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:161]
```

**17. `GroupLevelRow`** — depth 4 · orphan-root

```text
🚀 GroupLevelRow(properties: Readonly<GroupLevelRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:46]
   ↳ Draws one level like a filter: its field, what it goes by, and a button that removes it, with the tag tree open beneath…
  └─> describeTags(field: EventGroupField, level: EventGroupLevel): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:9]
     ↳ Names what a level goes by: the tags picked, or the level of the root's tree it goes by, the first unless an older link…
    └─> flatMap(…)(this: undefined, tag: string): string[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:21]
      └─> find(…)(candidate: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:22]
```

**18. `CalendarGroupBy`** — depth 4 · orphan-root

```text
🚀 CalendarGroupBy(properties: Readonly<CalendarGroupByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:40]
   ↳ Renders the list of the grouping's levels, each shaped like a filter: a field, the same ones the filter offers, and…
  └─> useMemo(…)(): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:46]
    └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27]
       ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
      └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
         ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**19. `measure`** — depth ≥ 4 · orphan-root

```text
🚀 measure(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:117]
  └─> getVisibleTimelineRows(…): ReadonlySet<string> | null [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:19]
     ↳ The ids of the rows on screen, and a few beyond each edge, or `null` while the body has not been laid out and so every…
    └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27]
       ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
      └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:56]
         ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**20. `addEventListener(…)`** — depth 4 · orphan-root

```text
🚀 addEventListener(…)(event: MessageEvent<WorkerRequest>): void [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:83]
  └─> select(request: WorkerRequest): Promise<SqlRow[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:62]
     ↳ Runs one select against the opened database.
    └─> openDatabase(url: string): Promise<Database> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:22]
       ↳ Downloads the bundled database file and opens it read-only in memory, so no persistent storage and no cross-origin…
      └─> listLocalTimeFunctions(): Readonly<Record<string, LocalTimeFunction>> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:11]
         ↳ Every local-time function by the name SQL calls it.
```

**21. `close`** — depth ≥ 3 · orphan-root

```text
🚀 close(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:112]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:70]
```

**22. `open`** — depth ≥ 3 · orphan-root

```text
🚀 open(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:119]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:70]
```

**23. `colorOf`** — depth 3 · orphan-root

```text
🚀 colorOf(event: CalendarEventRecord): string | null [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:54]
  └─> hashColor(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:79]
     ↳ The color of a key from its own text, for a value with no place in a legend.
    └─> pickColor(position: number): string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:162]
       ↳ The color at a position in the palette, which starts over after its last.
```

**24. `CalendarColorOptions`** — depth 3 · orphan-root

```text
🚀 CalendarColorOptions(properties: Readonly<CalendarColorOptionsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-color-options/calendar-color-options.tsx:33]
   ↳ Renders the View menu's Color by submenu, which says what the events are colored by and opens the picker for it.
  └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27]
     ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
    └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
       ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**25. `SkeletonBody`** — depth 3 · orphan-root

```text
🚀 SkeletonBody(properties: Readonly<SkeletonBodyProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:29]
   ↳ Draws the body of the skeleton for one view.
  └─> from(…)(_: unknown, column: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:93]
    └─> map(…)(height: "h-8" | "h-12" | "h-16", index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:99]
```

**26. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:92]
  └─> replaceLevel(index: number, level: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:56]
    └─> flatMap(…)(this: undefined, current: EventGroupLevel, position: number): EventGroupLevel[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:58]
```

**27. `CalendarViewOptions`** — depth 3 · orphan-root

```text
🚀 CalendarViewOptions(properties: Readonly<CalendarViewOptionsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-options/calendar-view-options.tsx:47]
   ↳ Renders the View menu's arrangement of the view: a Group by submenu for the agenda and the timeline, which group their…
  └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27]
     ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
    └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
       ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**28. `EventTagPills`** — depth 3 · orphan-root

```text
🚀 EventTagPills(properties: Readonly<EventTagPillsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:23]
   ↳ Draws each tag as a pill, tinted in the color of its tree so that tags of a kind read alike wherever they are shown.
  └─> map(…)(tag: CalendarEventTag): React.JSX.Element [projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:48]
    └─> getTagColor(tag: CalendarEventTag): string [projects/caelundas/caelundas-web/src/components/event-tag-pills/calendar-tag-colors.utilities.ts:17]
       ↳ The color of a tag's tree: one for each tag root, so every tag beneath a root shares it.
```

**29. `CalendarEventRow`** — depth 3 · orphan-root

```text
🚀 CalendarEventRow(properties: Readonly<CalendarEventRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-row/calendar-event-row.tsx:39]
   ↳ Renders one event as a list row: its time in the data's zone, its color, its symbols, drawn as the symbols setting…
  └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:38]
     ↳ Names a duration in days, hours, and minutes, leaving out any unit that is zero, or "Instant" for an event with no…
    └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:51]
```

**30. `VirtualList`** — depth ≥ 3 · orphan-root

```text
🚀 VirtualList<Row>(properties: Readonly<VirtualListProperties<Row>>): ReactNode [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:54]
   ↳ Renders a vertically scrolling list that draws only the rows in view, plus a few on each side, however long the list…
  └─> useMemo(…)(): number[] [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:74]
    └─> getRowOffsets(heights: readonly number[]): number[] [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:10]
       ↳ Lays rows of the given heights end to end, returning each row's top and, last, the height of them all.
```

**31. `handleScroll`** — depth ≥ 3 · orphan-root

```text
🚀 handleScroll(event: UIEvent<HTMLDivElement>): void [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:92]
  └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27]
     ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
    └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:56]
       ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**32. `handleEventClick`** — depth ≥ 3 · orphan-root

```text
🚀 handleEventClick(occurrence: GanttOccurrence<TimelineBar>): void [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.ts:35]
  └─> describeBar(bar: TimelineBar | undefined): OpenedBar | undefined [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.utilities.ts:14]
     ↳ What opens when a marker is clicked: the events it holds, titled by their count, or by the name of the one event.
    └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
       ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**33. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:103]
  └─> handleValueChange(values: readonly unknown[]): void [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:70]
    └─> parseCalendarView(value: unknown): CalendarViewName | undefined [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-views.utilities.ts:22]
       ↳ Reads a value as a view, or nothing when it names none, such as a stale link's or an unpressed toggle's.
```

**34. `findFacets`** — depth ≥ 3 · orphan-root

```text
🚀 findFacets(window?: EventsWindow | undefined): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:56]
  └─> toFacets(rows: readonly SqlRow[]): EventFacet[] [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:129]
     ↳ Gathers the tag rows, roots first in path order, into one facet per root.
    └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:77]
       ↳ Reads a column the schema declares `not null` as text.
```

**35. `select`** — depth ≥ 3 · orphan-root

```text
🚀 select(…): Promise<Readonly<Record<string, unknown>>[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:34]
  └─> startWorker(): Worker [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:96]
     ↳ Starts the worker that owns the sqlite-wasm database.
    └─> UnsupportedBrowserError.constructor(): UnsupportedBrowserError [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:131]
```

**36. `getRouter`** — depth 3 · orphan-root

```text
🚀 getRouter(): Router<typeof routeTree> [projects/caelundas/caelundas-web/src/router.tsx:10]
   ↳ Creates the application router, which TanStack Start calls once per request on the server and once on the client.
  └─> createBrowserEventsDatabase(): EventsDatabase [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:20]
     ↳ The events database the browser reads, served by a sqlite-wasm worker.
    └─> createEventsDatabase(executor: SqlExecutor): EventsDatabase [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:26]
       ↳ Builds the events database over any executor.
```

**37. `OutsideDataset`** — depth 2 · orphan-root

```text
🚀 OutsideDataset(properties: Readonly<OutsideDatasetProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:30]
   ↳ Names the dates the data covers and offers to jump to the nearest of them.
  └─> format(date: Date): string [projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:38]
```

**38. `transform(…)`** — depth 2 · orphan-root

```text
🚀 transform(…)(…): { key: string; label: string | null; path: string | null; }[] [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:157]
  └─> flatMap(…)(…): { key: string; label: string | null; path: string | null; }[] [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:158]
```

**39. `handleCollectionSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleCollectionSelect(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:61]
  └─> toLinkedEventFilter(query: EventFilterQuery): EventFilterQuery [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:70]
     ↳ The filter a link should hold for a tree.
```

**40. `handleChange`** — depth ≥ 2 · orphan-root

```text
🚀 handleChange(picked: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:70]
  └─> find(…)(candidate: ResolvedEventFilterCollection): boolean [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:71]
```

**41. `GroupFieldPicker`** — depth 2 · orphan-root

```text
🚀 GroupFieldPicker(properties: Readonly<GroupFieldPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:50]
   ↳ Renders the field of a level of a grouping as the filter renders its attributes: a button that opens a searchable list,…
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:72]
```

**42. `handleSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleSelect(picked: string): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:75]
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:76]
```

**43. `handleSearchKeyDown`** — depth ≥ 2 · orphan-root

```text
🚀 handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:82]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**44. `down`** — depth 2 · orphan-root

```text
🚀 down(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:115]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**45. `up`** — depth 2 · orphan-root

```text
🚀 up(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:125]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**46. `GroupTagPicker`** — depth 2 · orphan-root

```text
🚀 GroupTagPicker(properties: Readonly<GroupTagPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:35]
   ↳ Renders the tag tree a level of a grouping picks its groups from: the same tree, with the same search, folding and…
  └─> filter(…)(option: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:48]
```

**47. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(next: EventGroupField): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:83]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:128]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**48. `duration`** — depth 2 · orphan-root

```text
🚀 duration(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:18]
  └─> find(…)(…): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:19]
```

**49. `week`** — depth 2 · orphan-root

```text
🚀 week(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:37]
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**50. `getEventColor`** — depth 2 · orphan-root

```text
🚀 getEventColor(event: CalendarEventRecord): null | string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:32]
   ↳ The color of an event's kind: that of its kind's rule, or its own color from the data when it has none.
  └─> getEventKind(event: CalendarEventRecord): EventColorRule | null [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:40]
     ↳ The kind of an event: the most specific rule any of its tags falls under, or none when no rule does.
```

**51. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:80]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:46]
```

**52. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:92]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:46]
```

**53. `FilterChipRow`** — depth 2 · orphan-root

```text
🚀 FilterChipRow(properties: Readonly<FilterChipRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:30]
   ↳ Draws one chip per rule of the tree in the surrounding `Filters`, nested ones included, in a row that wraps onto more…
  └─> map(…)(rule: FilterRule<EventFilterValue>, index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:59]
```

**54. `subscribeToDesktopViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToDesktopViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:22]
   ↳ Calls back whenever the page crosses the desktop width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**55. `subscribeToViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:30]
   ↳ Calls back whenever the page crosses the tablet width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**56. `CalendarSkeleton`** — depth 2 · orphan-root

```text
🚀 CalendarSkeleton(properties: Readonly<CalendarSkeletonProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton/calendar-skeleton.tsx:37]
   ↳ Renders the shape of the view the page opens on, a toolbar row over that view's layout: a grid of days for the month,…
  └─> getDefaultCalendarView(isWide: boolean): CalendarViewName [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-views.utilities.ts:14]
     ↳ The view to show when the link names none: the agenda, which reads at a phone's width, or the whole month on anything…
```

**57. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:103]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:128]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**58. `CalendarScaleSelect`** — depth 2 · orphan-root

```text
🚀 CalendarScaleSelect(properties: Readonly<CalendarScaleSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:29]
   ↳ Renders one button for each of the timeline's scales, from a day of minutes to a year of months, the one shown pressed.
  └─> map(…)(option: "day" | "month" | "quarter" | "week" | "year"): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:51]
```

**59. `getAgendaRowHeight`** — depth 2 · orphan-root

```text
🚀 getAgendaRowHeight(row: AgendaListRow, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:60]
   ↳ How tall an agenda row is drawn: a heading is shorter than an event, an event is as tall as its tags need, and the…
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**60. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(record: CalendarEventRecord, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-cluster-dialog/calendar-cluster-dialog.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**61. `CalendarEventTooltip`** — depth 2 · orphan-root

```text
🚀 CalendarEventTooltip(properties: Readonly<CalendarEventTooltipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-tooltip/calendar-event-tooltip.tsx:40]
   ↳ Wraps what is drawn for an event, its glyphs, in a tooltip that follows the pointer, with the event's name in English,…
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
     ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**62. `CalendarEventChip`** — depth 2 · orphan-root

```text
🚀 CalendarEventChip(properties: Readonly<CalendarEventChipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-chip/calendar-event-chip.tsx:33]
   ↳ Draws an event as its glyphs alone, with a tooltip of its name in English and what the database says of it, and for a…
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
     ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**63. `TimelineNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 TimelineNavigation(properties: Readonly<TimelineNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:24]
   ↳ Reports the timeline's own navigation, which only a child of the Gantt can read, to the toolbar above it, and draws…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:40]
```

**64. `CalendarViewSelect`** — depth 2 · orphan-root

```text
🚀 CalendarViewSelect(properties: Readonly<CalendarViewSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:51]
   ↳ Renders one pressed button per view on a desktop, or on a narrower row, a tablet's included, a menu button naming the…
  └─> map(…)(…): Element [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:108]
```

**65. `AgendaRowContent`** — depth 2 · orphan-root

```text
🚀 AgendaRowContent(properties: Readonly<AgendaRowContentProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-agenda/agenda-row-content.tsx:35]
   ↳ Draws one agenda row: a group's or a day's heading, an event, or the button that lists later days.
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**66. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(row: Readonly<{ record: CalendarEventRecord; }>, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**67. `CalendarGridNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 CalendarGridNavigation(properties: Readonly<CalendarGridNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:24]
   ↳ Reports the event calendar's own navigation, which only a child of the calendar can read, to the toolbar above it, and…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:40]
```

**68. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:42]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**69. `handleClustersChange`** — depth 2 · orphan-root

```text
🚀 handleClustersChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:54]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**70. `handleColorByChange`** — depth 2 · orphan-root

```text
🚀 handleColorByChange(color: EventGroupLevel | undefined): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:57]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**71. `handleColorsChange`** — depth 2 · orphan-root

```text
🚀 handleColorsChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:60]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**72. `handleDateChange`** — depth 2 · orphan-root

```text
🚀 handleDateChange(date: Date): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:63]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**73. `handleFilterChange`** — depth 2 · orphan-root

```text
🚀 handleFilterChange(filter: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:66]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**74. `handleGroupingChange`** — depth 2 · orphan-root

```text
🚀 handleGroupingChange(group: EventGrouping): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:69]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**75. `handleScaleChange`** — depth 2 · orphan-root

```text
🚀 handleScaleChange(scale: "day" | "month" | "quarter" | "week" | "year"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:72]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**76. `handleSymbolsChange`** — depth 2 · orphan-root

```text
🚀 handleSymbolsChange(symbols: CalendarSymbols): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:75]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**77. `handleViewChange`** — depth 2 · orphan-root

```text
🚀 handleViewChange(view: "day" | "month" | "week" | "three-day" | "agenda" | "timeline"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:81]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**78. `localDate`** — depth 2 · orphan-root

```text
🚀 localDate(instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:24]
   ↳ The calendar day an instant falls on in a zone, as `YYYY-MM-DD`.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:55]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**79. `localHour`** — depth 2 · orphan-root

```text
🚀 localHour(instant: unknown, timeZone: unknown): null | number [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:31]
   ↳ The hour of the day an instant falls in in a zone, from 0 to 23.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:55]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**80. `localWeekday`** — depth 2 · orphan-root

```text
🚀 localWeekday(instant: unknown, timeZone: unknown): null | number [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:41]
   ↳ The day of the week an instant falls on in a zone, 0 for Sunday, the way SQLite's `%w` numbers it: the weekday of its…
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:55]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `compileDerivedRule` | 8 | `compileRange`, `readDateRange`, `compileDurationRule`, `readTexts`, `readIntegerRange`, `compileSetRule`, `compileTextRule`, `readIntegers` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-derived.utilities.ts:30` |
| `CalendarTimeline` | 8 | `useBarDialog`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useCallback(…)`, `useMemo(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:91` |
| `CalendarGrid` | 8 | `useCalendarClusters`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `toEventCalendarView`, `getViewLayout`, `useCallback(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:61` |

<details>
<summary>228 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `compileRule` | 7 | `isNumberOperator`, `compileTagNumberRule`, `compileTagRule`, `readTexts`, `isDerivedNumberRule`, `compileDerivedNumberRule`, `compileDerivedRule` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:75` |
| `toggleTag` | 7 | `findIndex(…)`, `measureTags`, `filter(…)`, `coverLeaves`, `fillFromLeaves`, `numberAt`, `readPicks` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:94` |
| `loadCalendar` | 7 | `resolveWindows`, `findFacetsCached`, `resolveDefaultFilter`, `compileEventFilter`, `resolveGroups`, `findEventsCached`, `describeEmptiness` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:41` |
| `toTimelineRows` | 7 | `map(…)`, `map(…)`, `buildEventGroups`, `placeGroupRows`, `map(…)`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:59` |
| `buildEventGroups` | 6 | `find(…)`, `collectGroups`, `describeGroup`, `map(…)`, `toSorted(…)`, `toGroupNodes` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:29` |
| `compileTagNumberRule` | 5 | `isRangeOperator`, `readNumberRange`, `readSingleNumber`, `compileNumberCondition`, `replace(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:93` |
| `CalendarColorBy` | 5 | `useMemo(…)`, `find(…)`, `toGroupLevel`, `createColorScheme`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-by.tsx:44` |
| `validateCalendarSearch` | 5 | `normalizeEventFilter`, `parseGrouping`, `parseTimelineScale`, `parseCalendarSymbols`, `parseCalendarView` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:24` |
| `IndexPage` | 5 | `useMemo(…)`, `useMemo(…)`, `getDefaultCalendarView`, `readTimeZone`, `useCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:100` |
| `compileDerivedNumberRule` | 4 | `isRangeOperator`, `readNumberRange`, `readSingleNumber`, `compileNumberCondition` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:28` |
| `useFilterQuery` | 4 | `useMemo(…)`, `getDefaultFilter`, `isSameEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:27` |
| `createEventGroupFields` | 4 | `describeRoot`, `map(…)`, `createTagOptions`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27` |
| `getTagStates` | 4 | `measureTags`, `coverLeaves`, `fillFromLeaves`, `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:49` |
| `createColorScheme` | 4 | `find(…)`, `map(…)`, `listTags`, `listValues` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:32` |
| `SkeletonBody` | 4 | `map(…)`, `map(…)`, `map(…)`, `from(…)` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:29` |
| `getViewWindows` | 4 | `joinWindows`, `getTimelineDays`, `getVisibleDays`, `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:58` |
| `useCalendarNavigation` | 4 | `isDayShown`, `formatCalendarDate`, `useMemo(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-navigation/use-calendar-navigation.ts:23` |
| `CalendarEventRow` | 4 | `getEventLabel`, `formatEventTime`, `formatDuration`, `formatEventSpan` | `projects/caelundas/caelundas-web/src/components/calendar-event-row/calendar-event-row.tsx:39` |
| `VirtualList` | 4 | `useMemo(…)`, `getVirtualWindow`, `useEffect(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:54` |
| `clusterRow` | 4 | `toSorted(…)`, `collectRun`, `toCluster`, `previewEvents` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-clusters.utilities.ts:63` |
| `getVisibleTimelineRows` | 4 | `getVirtualWindow`, `getRowOffsets`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:19` |
| `clusterEvents` | 4 | `toSorted(…)`, `getRunKey`, `mergeRuns`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:29` |
| `EventsCalendar` | 4 | `useCalendarNavigation`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:95` |
| `findEvents` | 4 | `replace(…)`, `replace(…)`, `flatMap(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:34` |
| `toEventRecord` | 4 | `readText`, `readRequiredText`, `readDate`, `from(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:106` |
| `select` | 4 | `startWorker`, `listen`, `addEventListener(…)`, `anonymous` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:34` |
| `CalendarCollectionPicker` | 3 | `compileEventFilter`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:42` |
| `toTagField` | 3 | `isNumericFacet`, `describeRoot`, `createTagOptions` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:98` |
| `resolveEventGrouping` | 3 | `find(…)`, `some(…)`, `resolveLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:104` |
| `toTagTreeRows` | 3 | `readDepth`, `toTagTreeRow`, `countSelectedBelow` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:121` |
| `useTagPicker` | 3 | `useState(…)`, `toTagTreeRows`, `getTagStates` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:29` |
| `GroupLevelRow` | 3 | `find(…)`, `hasTagOptions`, `describeTags` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:46` |
| `CalendarFilters` | 3 | `useFilterQuery`, `countActiveEventFilterRules`, `renderFiltersButton` | `projects/caelundas/caelundas-web/src/components/calendar-filters/calendar-filters.tsx:105` |
| `CalendarGroupBy` | 3 | `useMemo(…)`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:40` |
| `resolveGrouping` | 3 | `createEventGroupFields`, `resolveEventGrouping`, `getDefaultGrouping` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:243` |
| `resolveGroups` | 3 | `resolveGrouping`, `resolveColorBy`, `compileEventGrouping` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:265` |
| `toGlyphParts` | 3 | `toCharacters`, `readNamedIcon`, `appendSymbol` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:22` |
| `toAgendaRows` | 3 | `getAgendaListing`, `flatMap(…)`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:124` |
| `toGroupedAgendaRows` | 3 | `toAgendaRows`, `filter(…)`, `buildEventGroups` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:155` |
| `createTimelineLayout` | 3 | `getClusterSpan`, `packTimelineLanes`, `clusterTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-lanes.utilities.ts:22` |
| `measure` | 3 | `getVisibleTimelineRows`, `readRowBoxes`, `readViewport` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:117` |
| `mergeRuns` | 3 | `splitRuns`, `getEventKind`, `createStandIn` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:147` |
| `useCalendarClusters` | 3 | `useMemo(…)`, `useCallback(…)`, `find(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:26` |
| `useMemo(…)` | 3 | `filter(…)`, `toAgendaRows`, `getAgendaRange` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.tsx:49` |
| `addEventListener(…)` | 3 | `then(…)`, `then(…)`, `select` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:83` |
| `compileEventFilter` | 2 | `compileRule`, `combine` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:28` |
| `combine` | 2 | `flatMap(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:58` |
| `handleQueryChange` | 2 | `compileEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:51` |
| `measureTags` | 2 | `readDepth`, `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:242` |
| `toTagTreeRow` | 2 | `readDepth`, `readName` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:331` |
| `handleToggle` | 2 | `toggleTag`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:59` |
| `FilterTagEditor` | 2 | `useTagPicker`, `map(…)` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/filter-tag-editor.tsx:38` |
| `describeEvent` | 2 | `map(…)`, `formatDuration` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:14` |
| `formatDuration` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:38` |
| `colorOf` | 2 | `some(…)`, `hashColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:54` |
| `listTags` | 2 | `readDepth`, `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:95` |
| `listValues` | 2 | `formatDerivedKey`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:125` |
| `CalendarColorOptions` | 2 | `createEventGroupFields`, `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-color-options/calendar-color-options.tsx:33` |
| `CalendarViewOptions` | 2 | `createEventGroupFields`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-view-options/calendar-view-options.tsx:47` |
| `compileGroupLevel` | 2 | `from(…)`, `isDerivedGroupId` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-compiler.utilities.ts:41` |
| `resolveColorBy` | 2 | `resolveEventGrouping`, `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:213` |
| `resolveDefaultFilter` | 2 | `find(…)`, `resolveEventFilterCollection` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:226` |
| `resolveWindows` | 2 | `parseCalendarDate`, `getViewWindows` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:289` |
| `appendSymbol` | 2 | `readSymbol`, `appendText` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:43` |
| `readSymbol` | 2 | `findSymbolFiles`, `toIcons` | `projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-icons.utilities.ts:128` |
| `EventGlyphs` | 2 | `toGlyphParts`, `map(…)` | `projects/caelundas/caelundas-web/src/components/event-glyphs/event-glyphs.tsx:26` |
| `useMemo(…)` | 2 | `getRowOffsets`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:74` |
| `handleScroll` | 2 | `getVirtualWindow`, `setAnswered(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:92` |
| `describeGroup` | 2 | `formatDerivedKey`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:112` |
| `packTimelineLanes` | 2 | `assignLanes`, `addLaneRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-lanes.utilities.ts:45` |
| `assignLanes` | 2 | `toSorted(…)`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-lanes.utilities.ts:114` |
| `useEffect(…)` | 2 | `watchVisibleRows(…)`, `watchVisibleRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:156` |
| `CalendarViewSelect` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:51` |
| `getRunKey` | 2 | `getEventKind`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:118` |
| `useMemo(…)` | 2 | `getViewWindows`, `clusterEvents` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:40` |
| `AgendaRowContent` | 2 | `formatCalendarDay`, `formatEventCount` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/agenda-row-content.tsx:35` |
| `CalendarAgenda` | 2 | `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.tsx:57` |
| `CalendarOverflowList` | 2 | `useMemo(…)`, `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.tsx:40` |
| `useMemo(…)` | 2 | `getAgendaRange`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:99` |
| `handleDateChange` | 2 | `updateSearch`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:63` |
| `loader` | 2 | `loadCalendar`, `validateCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:64` |
| `toDataset` | 2 | `readDate`, `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:93` |
| `createBrowserEventsDatabase` | 2 | `createEventsDatabase`, `createWorkerSqlExecutor` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:20` |
| `select` | 2 | `catch(…)`, `openDatabase` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:62` |
| `OutsideDataset` | 1 | `format` | `projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:30` |
| `transform(…)` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:157` |
| `resolveEventFilterCollection` | 1 | `resolveGroup` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:18` |
| `resolveEventFilterCollections` | 1 | `resolveGroup` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:43` |
| `resolveGroup` | 1 | `resolveRule` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-collections.utilities.ts:75` |
| `compileTagRule` | 1 | `replace(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:107` |
| `countActiveEventFilterRules` | 1 | `compileEventFilter` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:10` |
| `isSameEventFilter` | 1 | `normalizeEventFilter` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:28` |
| `getDefaultFilter` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.utilities.ts:15` |
| `useMemo(…)` | 1 | `resolveEventFilterCollections` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:34` |
| `handleCollectionSelect` | 1 | `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:61` |
| `handleChange` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:70` |
| `createEventFilterFields` | 1 | `toTagField` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:28` |
| `isNumericFacet` | 1 | `every(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:90` |
| `GroupFieldPicker` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:50` |
| `handleSelect` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:75` |
| `describeTags` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:9` |
| `flatMap(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:21` |
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
| `GroupTagPicker` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:35` |
| `anonymous` | 1 | `toGroupLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:83` |
| `formatEventSpan` | 1 | `write` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:59` |
| `duration` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:18` |
| `week` | 1 | `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:37` |
| `getEventColor` | 1 | `getEventKind` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:32` |
| `hashColor` | 1 | `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:79` |
| `map(…)` | 1 | `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:153` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-by.tsx:50` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:80` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:92` |
| `FilterChipRow` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:30` |
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
| `compileEventGrouping` | 1 | `compileGroupLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-compiler.utilities.ts:25` |
| `isDayShown` | 1 | `getViewWindows` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:91` |
| `parseCalendarDate` | 1 | `anchorDay` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:113` |
| `getTimelineDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:136` |
| `getVisibleDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:177` |
| `describeEmptiness` | 1 | `some(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:88` |
| `findEventsCached` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:124` |
| `findFacetsCached` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:172` |
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
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:120` |
| `useMemo(…)` | 1 | `toTimelineRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:122` |
| `useMemo(…)` | 1 | `createTimelineLayout` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:127` |
| `useMemo(…)` | 1 | `windowTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:134` |
| `useMemo(…)` | 1 | `toCountColumns` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:143` |
| `watchVisibleRows(…)` | 1 | `setMeasured(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:159` |
| `setMeasured(…)` | 1 | `isSameRowSet` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:160` |
| `handleValueChange` | 1 | `parseCalendarView` | `projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:70` |
| `anonymous` | 1 | `handleValueChange` | `projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:103` |
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
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:124` |
| `useMemo(…)` | 1 | `createColorScheme` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:126` |
| `useMemo(…)` | 1 | `colorEvents` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:130` |
| `parseGrouping` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:55` |
| `anonymous` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:42` |
| `handleClustersChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:54` |
| `handleColorByChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:57` |
| `handleColorsChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:60` |
| `handleFilterChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:66` |
| `handleGroupingChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:69` |
| `handleScaleChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:72` |
| `handleSymbolsChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:75` |
| `handleViewChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:81` |
| `useMemo(…)` | 1 | `createEventFilterFields` | `projects/caelundas/caelundas-web/src/routes/index.tsx:105` |
| `useMemo(…)` | 1 | `parseCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:115` |
| `describeDataset` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:28` |
| `map(…)` | 1 | `toDataset` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:31` |
| `replace(…)` | 1 | `toGroupColumns` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:40` |
| `map(…)` | 1 | `toEventRecord` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:53` |
| `findFacets` | 1 | `toFacets` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:56` |
| `readDate` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:70` |
| `from(…)` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:112` |
| `toFacets` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:129` |
| `toGroupColumns` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:158` |
| `map(…)` | 1 | `replace(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:160` |
| `addEventListener(…)` | 1 | `rejectAll` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:38` |
| `listen` | 1 | `addEventListener(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:64` |
| `startWorker` | 1 | `UnsupportedBrowserError.constructor` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:96` |
| `getRouter` | 1 | `createBrowserEventsDatabase` | `projects/caelundas/caelundas-web/src/router.tsx:10` |
| `localDate` | 1 | `formatLocalPart` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:24` |
| `localHour` | 1 | `formatLocalPart` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:31` |
| `localWeekday` | 1 | `formatLocalPart` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:41` |
| `openDatabase` | 1 | `listLocalTimeFunctions` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:22` |
| `then(…)` | 1 | `respond` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:87` |
| `then(…)` | 1 | `respond` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:90` |

</details>
<!-- callidescope:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-21195-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-774.64_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-14-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-158-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-158-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-97-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-2-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-502-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-61-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-17-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-2-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-1281-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-7-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-1090-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-198-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-1085-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-647-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-293-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-1099-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-2125-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-183-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-47-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-15-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-116-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-98-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-2-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-49-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-168-dc2626?style=flat-square)
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
![Constants Files](https://img.shields.io/badge/Constants_Files-3-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-5-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-26-ca8a04?style=flat-square)
![Integration Tests](https://img.shields.io/badge/Integration_Tests-0-7c3aed?style=flat-square)
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
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-364-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-6-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-8-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-56-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-39-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-1-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-7-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-9-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-6-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-115-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
