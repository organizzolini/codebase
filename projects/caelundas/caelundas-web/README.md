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
and rebuilt before every build. To fill it with the events `caelundas-cli`
calculates instead of the seed:

```bash
# 1. Start the local Postgres container, which creates the caelundas role,
#    database and schema on an empty volume (it reads the root .env)
nx run infrastructure:postgres:up

# 2. Ingest events into the caelundas schema (see caelundas-cli's README)
nx run caelundas-cli:download-ephemeris
cp projects/caelundas/caelundas-cli/.env.default projects/caelundas/caelundas-cli/.env
nx run caelundas-cli:migration:run
nx run caelundas-cli:start

# 3. Export those tables, apply the app's views, and build
nx run caelundas-web:build:export
nx run caelundas-web:preview:export   # or start:export for the dev server
```

The `export` configuration of `build-database`, which `build`, `start` and
`preview` pass down, runs `persistence export --sqlite` over the
`calendar_events`, `tags`, `tags_closure` and `calendar_event_tags` tables
into `output/events-export.sqlite`, then applies `data/events-views.sql` over
a copy of it. It connects as ingestion does: the `CAELUNDAS_POSTGRES_*`
variables in the shell, then those in `caelundas-cli/.env`, then the local
defaults. When nothing answers at that address it stops, naming it, and the
last built file is left in place.

## Test

```bash
nx run caelundas-web:vitest
```

## 👔 Conformetry

This project was generated from the [tanstack-application](/configuration/conformetry-templates/tanstack-application) conformetry template.

<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 325 |
| Files | 59 |
| Calls traced | 290 |
| Call stacks | 47 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 50 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `CalendarFilters`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarFilters(properties: Readonly<CalendarFiltersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:79]
   ↳ Renders the active filters as chips, then the Filters button with a count of the finished rules, which opens the nested…
  └─> countActiveEventFilterRules(node: EventFilterNode): number [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-tree.ts:46]
     ↳ Counts the rules in a tree that are finished, which are the ones the query applies, however deeply they are nested.
    └─> compileEventFilter(node: EventFilterNode | undefined): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:22]
       ↳ Compiles the ReUI filter tree to one parameterized boolean expression over the derived events view, aliased `e`.
      └─> compileRule(rule: EventFilterRule): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:69]
         ↳ Compiles one rule by its field, flipping it when the rule is negated.
        └─> compileTagRule(operator: string, tagIds: readonly string[]): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:86]
           ↳ Compiles a rule on a tag field.
          └─> replace(…)(): string [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:99]
```

**2. `CalendarAgenda`** — depth 6 · orphan-root

```text
🚀 CalendarAgenda(properties: Readonly<CalendarAgendaProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:73]
   ↳ Renders the agenda: each day that has events as a heading over its events in order, in a list that draws only the rows…
  └─> useMemo(…)(): AgendaListRow[] [projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:89]
    └─> toGroupedAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:107]
       ↳ Lays events out as agenda rows in the groups of a grouping: each group's heading, counting the distinct events listed…
      └─> toAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:76]
         ↳ Lays events out as agenda rows, a heading for each day that has any and the day's events beneath it in order.
        └─> getAgendaListing(…): { day: string; ongoing: boolean; } | null [projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:160]
           ↳ The day the agenda lists an event under, and whether it was already under way then, or `null` when none of its days…
          └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:62]
             ↳ Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search parameter, the way the calendar's navigation…
```

**3. `CalendarTimeline`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarTimeline(properties: Readonly<CalendarTimelineProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:117]
   ↳ Renders the events as a Gantt timeline: a row per group, nested and collapsible as the grouping nests, each counting…
  └─> useMemo(…)(): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:147]
    └─> toTimelineRows(…): TimelineRows [projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline.ts:63]
       ↳ Lays events out as Gantt rows by a grouping.
      └─> buildEventGroups(…): EventGroupNode[] [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-tree.ts:58]
         ↳ Groups events into a tree, a level per level of the grouping, from the group keys each event was read with.
        └─> describeGroup(…): GroupDescription [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-tree.ts:154]
           ↳ Describes a group for one key: a tag's name and path below its root, a derived value written out, or the level's "No …"…
          └─> formatDerivedKey(field: string, key: string): string [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-labels.ts:50]
             ↳ Writes a derived group key the way a heading reads it, such as "Q1 2026", "Week of March 1, 2026", "3 PM" or "Hours";…
```

<details>
<summary>44 more call stacks</summary>

**4. `CalendarGrid`** — depth 6 · orphan-root

```text
🚀 CalendarGrid(…): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:252]
   ↳ Renders every view but the timeline in the vendored event calendar, under the toolbar it is handed.
  └─> useMemo(…)(): Map<string, string> [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:279]
    └─> map(…)(event: CalendarEventRecord): [string, string] [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:279]
      └─> describeEvent(event: CalendarEventRecord): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:36]
         ↳ Spells out an event's tag paths and its duration, for the screen readers an event's short label leaves them out for.
        └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:60]
           ↳ Names a duration in days, hours, and minutes, leaving out any unit that is zero, or "Instant" for an event with no…
          └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:73]
```

**5. `loader`** — depth ≥ 6 · orphan-root

```text
🚀 loader(…): Promise<CalendarData> [projects/caelundas/caelundas-web/src/routes/index.tsx:60]
  └─> loadCalendar(database: EventsDatabase, search: CalendarSearch): Promise<CalendarData> [projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:85]
     ↳ Reads the events in the window the search parameters' view and day show, plus a buffer, that pass their filter,…
    └─> compileEventFilter(node: EventFilterNode | undefined): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:22]
       ↳ Compiles the ReUI filter tree to one parameterized boolean expression over the derived events view, aliased `e`.
      └─> compileRule(rule: EventFilterRule): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:69]
         ↳ Compiles one rule by its field, flipping it when the rule is negated.
        └─> compileTagRule(operator: string, tagIds: readonly string[]): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:86]
           ↳ Compiles a rule on a tag field.
          └─> replace(…)(): string [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:99]
```

**6. `handleQueryChange`** — depth ≥ 5 · orphan-root

```text
🚀 handleQueryChange(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:103]
  └─> compileEventFilter(node: EventFilterNode | undefined): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:22]
     ↳ Compiles the ReUI filter tree to one parameterized boolean expression over the derived events view, aliased `e`.
    └─> compileRule(rule: EventFilterRule): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:69]
       ↳ Compiles one rule by its field, flipping it when the rule is negated.
      └─> compileTagRule(operator: string, tagIds: readonly string[]): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:86]
         ↳ Compiles a rule on a tag field.
        └─> replace(…)(): string [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:99]
```

**7. `CalendarGroupBy`** — depth 5 · orphan-root

```text
🚀 CalendarGroupBy(properties: Readonly<CalendarGroupByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:53]
   ↳ Renders the Group by button, naming the grouping, which opens the list of its levels: each a field, a tag root or a…
  └─> useMemo(…)(): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:65]
    └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:30]
       ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
      └─> map(…)(facet: EventFacet): { id: string; label: string; levels: string[][]; } [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:33]
        └─> map(…)(names: string[]): string[] [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:46]
```

**8. `CalendarOverflowList`** — depth 5 · orphan-root

```text
🚀 CalendarOverflowList(properties: Readonly<CalendarOverflowListProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-overflow-list.tsx:37]
   ↳ Renders the whole of a month cell's "+N more" day as a list that draws only the rows on screen, so a day with hundreds…
  └─> useMemo(…)(…): { group?: string | undefined; kind: "event"; ongoing: boolean; record: CalendarEventRecord; }[] [projects/caelundas/caelundas-web/src/components/calendar-overflow-list.tsx:46]
    └─> toAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:76]
       ↳ Lays events out as agenda rows, a heading for each day that has any and the day's events beneath it in order.
      └─> getAgendaListing(…): { day: string; ongoing: boolean; } | null [projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:160]
         ↳ The day the agenda lists an event under, and whether it was already under way then, or `null` when none of its days…
        └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:62]
           ↳ Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search parameter, the way the calendar's navigation…
```

**9. `IndexPage`** — depth 5 · orphan-root

```text
🚀 IndexPage(): ReactNode [projects/caelundas/caelundas-web/src/routes/index.tsx:96]
   ↳ Renders the landing page's heading.
  └─> useMemo(…)(): EventFilterField[] [projects/caelundas/caelundas-web/src/routes/index.tsx:102]
    └─> createEventFilterFields(facets: readonly EventFacet[]): EventFilterField[] [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:154]
       ↳ Builds the filter builder's fields: one per tag root in the database's facets, offering every tag beneath it, then the…
      └─> toTagField(facet: EventFacet): EventFilterField [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:185]
         ↳ Builds the field for one tag root.
        └─> formatEventCount(count: number): string [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:175]
           ↳ Names how many events a tag matches.
```

**10. `describeDataset`** — depth ≥ 5 · orphan-root

```text
🚀 describeDataset(): Promise<EventsDataset | null> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:52]
  └─> map(…)(row: Readonly<Record<string, unknown>>): EventsDataset [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:55]
    └─> toDataset(row: SqlRow): EventsDataset [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:112]
       ↳ Maps the dataset summary row.
      └─> readDate(row: SqlRow, column: string): Date [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:89]
         ↳ Reads an ISO 8601 text column as an instant.
        └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:96]
           ↳ Reads a column the schema declares `not null` as text.
```

**11. `findEvents`** — depth ≥ 5 · orphan-root

```text
🚀 findEvents(query: EventsQuery): Promise<CalendarEventRecord[]> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:58]
  └─> replace(…)(): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:64]
    └─> toGroupColumns(groups: readonly SqlGroupSource[]): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:177]
       ↳ The select list's extra columns, one JSON array of group keys per level, named `group_0` onward.
      └─> map(…)(group: SqlGroupSource, level: number): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:179]
        └─> replace(…)(): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:180]
```

**12. `CalendarEventRow`** — depth 4 · orphan-root

```text
🚀 CalendarEventRow(properties: Readonly<CalendarEventRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-row.tsx:31]
   ↳ Renders one event as a list row: its time in the data's zone, its color, its name, and beneath that its tags and…
  └─> describeEvent(event: CalendarEventRecord): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:36]
     ↳ Spells out an event's tag paths and its duration, for the screen readers an event's short label leaves them out for.
    └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:60]
       ↳ Names a duration in days, hours, and minutes, leaving out any unit that is zero, or "Instant" for an event with no…
      └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:73]
```

**13. `measure`** — depth ≥ 4 · orphan-root

```text
🚀 measure(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:352]
  └─> getVisibleTimelineRows(…): ReadonlySet<string> | null [projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-window.ts:33]
     ↳ The ids of the rows on screen, and a few beyond each edge, or `null` while the body has not been laid out and so every…
    └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/lib/calendar/calendar-virtual-window.ts:48]
       ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
      └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/lib/calendar/calendar-virtual-window.ts:77]
         ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**14. `VirtualList`** — depth ≥ 3 · orphan-root

```text
🚀 VirtualList<Row>(properties: Readonly<VirtualListProperties<Row>>): ReactNode [projects/caelundas/caelundas-web/src/components/virtual-list.tsx:56]
   ↳ Renders a vertically scrolling list that draws only the rows in view, plus a few on each side, however long the list…
  └─> useMemo(…)(): number[] [projects/caelundas/caelundas-web/src/components/virtual-list.tsx:75]
    └─> getRowOffsets(heights: readonly number[]): number[] [projects/caelundas/caelundas-web/src/lib/calendar/calendar-virtual-window.ts:31]
       ↳ Lays rows of the given heights end to end, returning each row's top and, last, the height of them all.
```

**15. `handleScroll`** — depth ≥ 3 · orphan-root

```text
🚀 handleScroll(event: UIEvent<HTMLDivElement>): void [projects/caelundas/caelundas-web/src/components/virtual-list.tsx:93]
  └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/lib/calendar/calendar-virtual-window.ts:48]
     ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
    └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/lib/calendar/calendar-virtual-window.ts:77]
       ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**16. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:129]
  └─> replaceLevel(index: number, level: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:78]
    └─> flatMap(…)(this: undefined, current: EventGroupLevel, position: number): EventGroupLevel[] [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:80]
```

**17. `GroupLevelRow`** — depth 3 · orphan-root

```text
🚀 GroupLevelRow(…): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:168]
   ↳ Draws one level of the grouping: its field, its depth for a tag root, and a button that removes it, reporting the…
  └─> map(…)(names: readonly string[], depth: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:214]
    └─> describeDepth(names: readonly string[]): string [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:157]
       ↳ Names a depth of a tag root by the first few tags found there, such as "Aspect, Ingress, Retrograde…".
```

**18. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:102]
  └─> handleValueChange(values: readonly unknown[]): void [projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:69]
    └─> parseCalendarView(value: unknown): CalendarViewName | undefined [projects/caelundas/caelundas-web/src/lib/calendar/calendar-views.ts:108]
       ↳ Reads a value as a view, or nothing when it names none, such as a stale link's or an unpressed toggle's.
```

**19. `findFacets`** — depth ≥ 3 · orphan-root

```text
🚀 findFacets(): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:80]
  └─> toFacets(rows: readonly SqlRow[]): EventFacet[] [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:148]
     ↳ Gathers the tag rows, roots first in path order, into one facet per root.
    └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:96]
       ↳ Reads a column the schema declares `not null` as text.
```

**20. `select`** — depth ≥ 3 · orphan-root

```text
🚀 select(…): Promise<Readonly<Record<string, unknown>>[]> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:49]
  └─> startWorker(): Worker [projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:111]
     ↳ Starts the worker that owns the sqlite-wasm database.
    └─> UnsupportedBrowserError.constructor(): UnsupportedBrowserError [projects/caelundas/caelundas-web/src/lib/events-database/events-database.errors.ts:7]
```

**21. `getRouter`** — depth 3 · orphan-root

```text
🚀 getRouter(): Router<typeof routeTree> [projects/caelundas/caelundas-web/src/router.tsx:10]
   ↳ Creates the application router, which TanStack Start calls once per request on the server and once on the client.
  └─> createBrowserEventsDatabase(): EventsDatabase [projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:35]
     ↳ The events database the browser reads, served by a sqlite-wasm worker.
    └─> createEventsDatabase(executor: SqlExecutor): EventsDatabase [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:50]
       ↳ Builds the events database over any executor.
```

**22. `addEventListener(…)`** — depth 3 · orphan-root

```text
🚀 addEventListener(…)(event: MessageEvent<WorkerRequest>): void [projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:83]
  └─> then(…)(rows: Readonly<Record<string, unknown>>[]): void [projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:87]
    └─> respond(response: WorkerResponse): void [projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:55]
       ↳ Answers the page.
```

**23. `OutsideDataset`** — depth 2 · orphan-root

```text
🚀 OutsideDataset(…): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-empty.tsx:138]
   ↳ Names the dates the data covers and offers to jump to the nearest of them.
  └─> format(date: Date): string [projects/caelundas/caelundas-web/src/components/calendar-empty.tsx:146]
```

**24. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:80]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:46]
```

**25. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:92]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:46]
```

**26. `FilterChipRow`** — depth 2 · orphan-root

```text
🚀 FilterChipRow(): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:158]
   ↳ Draws one chip per rule of the tree in the surrounding `Filters`, nested ones included, in a row that scrolls sideways…
  └─> map(…)(rule: FilterRule<EventFilterValue>, index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:172]
```

**27. `subscribeToDesktopViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToDesktopViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/lib/calendar/calendar-viewport.ts:28]
   ↳ Calls back whenever the page crosses the desktop width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/lib/calendar/calendar-viewport.ts:43]
     ↳ Watches a media query, returning how to stop.
```

**28. `subscribeToViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/lib/calendar/calendar-viewport.ts:36]
   ↳ Calls back whenever the page crosses the tablet width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/lib/calendar/calendar-viewport.ts:43]
     ↳ Watches a media query, returning how to stop.
```

**29. `CalendarSkeleton`** — depth 2 · orphan-root

```text
🚀 CalendarSkeleton(properties: Readonly<CalendarSkeletonProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton.tsx:39]
   ↳ Renders the shape of the view the page opens on, a toolbar row over a grid of days on a wide page, or over the agenda's…
  └─> map(…)(key: string): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton.tsx:78]
```

**30. `duration`** — depth 2 · orphan-root

```text
🚀 duration(key: string): string [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-labels.ts:18]
  └─> find(…)(…): boolean [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-labels.ts:19]
```

**31. `week`** — depth 2 · orphan-root

```text
🚀 week(key: string): string [projects/caelundas/caelundas-web/src/lib/event-groups/event-group-labels.ts:37]
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:45]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**32. `AgendaRowContent`** — depth 2 · orphan-root

```text
🚀 AgendaRowContent(…): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:135]
   ↳ Draws one agenda row: a day's heading, an event, or the button that lists later days.
  └─> formatEventCount(count: number): string [projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:201]
     ↳ Counts a group's events, such as "1 event" or "12 events".
```

**33. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:138]
  └─> toLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:241]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**34. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLSelectElement, HTMLSelectElement>): void [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:185]
  └─> find(…)(candidate: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:187]
```

**35. `CalendarScaleSelect`** — depth 2 · orphan-root

```text
🚀 CalendarScaleSelect(properties: Readonly<CalendarScaleSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-scale-select.tsx:40]
   ↳ Renders a menu button naming the timeline's scale that lists every scale, from a day of minutes to a year of months.
  └─> map(…)(option: "day" | "month" | "quarter" | "week" | "year"): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-scale-select.tsx:87]
```

**36. `handleValueChange`** — depth ≥ 2 · orphan-root

```text
🚀 handleValueChange(value: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-scale-select.tsx:50]
  └─> parseTimelineScale(value: unknown): TimelineScale | undefined [projects/caelundas/caelundas-web/src/lib/calendar/calendar-views.ts:117]
     ↳ Reads a value as a timeline scale, or nothing when it names none.
```

**37. `CalendarViewSelect`** — depth 2 · orphan-root

```text
🚀 CalendarViewSelect(properties: Readonly<CalendarViewSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:50]
   ↳ Renders one pressed button per view on a desktop, or on a narrower row, a tablet's included, a menu button naming the…
  └─> map(…)(…): Element [projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:107]
```

**38. `CalendarToolbar`** — depth 2 · orphan-root

```text
🚀 CalendarToolbar(properties: Readonly<CalendarToolbarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-toolbar.tsx:58]
   ↳ Renders the calendar's one toolbar row: today, previous and next, the period's title, the filters, the grouping, and…
  └─> some(…)(…): boolean [projects/caelundas/caelundas-web/src/components/calendar-toolbar.tsx:76]
```

**39. `TimelineNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 TimelineNavigation(…): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:306]
   ↳ Reports the timeline's own navigation, which only a child of the Gantt can read, to the toolbar above it, and draws…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:317]
```

**40. `EventsCalendar`** — depth ≥ 2 · orphan-root

```text
🚀 EventsCalendar(properties: Readonly<EventsCalendarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:129]
   ↳ Renders a single toolbar row over the view the page picked, filling its container: the timeline as a Gantt, every other…
  └─> useMemo(…)(): { next: () => void; prev: () => void; title: string; today: () => void; } [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:158]
```

**41. `CalendarGridNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 CalendarGridNavigation(…): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:360]
   ↳ Reports the event calendar's own navigation, which only a child of the calendar can read, to the toolbar above it, and…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:371]
```

**42. `search`** — depth 2 · orphan-root

```text
🚀 search(…): { date: string; days?: number | undefined; filter?: EventFilterQuery | undefined; group?: EventGrouping | undefined; scale?: "day" | "month" | "quarter" | "week" | "year" | undefined; view?: "day" | ... 5 more ... | undefined; } [projects/caelundas/caelundas-web/src/routes/index.tsx:158]
  └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:62]
     ↳ Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search parameter, the way the calendar's navigation…
```

**43. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/routes/index.tsx:213]
  └─> handleFilterChange(next?: EventFilterQuery): void [projects/caelundas/caelundas-web/src/routes/index.tsx:149]
```

**44. `transform(…)`** — depth 2 · orphan-root

```text
🚀 transform(…)(…): { key: string; label: string | null; path: string | null; }[] [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:40]
  └─> flatMap(…)(…): { key: string; label: string | null; path: string | null; }[] [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:41]
```

**45. `localDate`** — depth 2 · orphan-root

```text
🚀 localDate(instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:63]
   ↳ The calendar day an instant falls on in a zone, as `YYYY-MM-DD`.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:34]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**46. `localHour`** — depth 2 · orphan-root

```text
🚀 localHour(instant: unknown, timeZone: unknown): null | number [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:70]
   ↳ The hour of the day an instant falls in in a zone, from 0 to 23.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:34]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**47. `localWeekday`** — depth 2 · orphan-root

```text
🚀 localWeekday(instant: unknown, timeZone: unknown): null | number [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:80]
   ↳ The day of the week an instant falls on in a zone, 0 for Sunday, the way SQLite's `%w` numbers it: the weekday of its…
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:34]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `compileDerivedRule` | 8 | `compileRange`, `readDateRange`, `compileDurationRule`, `readTexts`, `readIntegerRange`, `compileSetRule`, `compileTextRule`, `readIntegers` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-derived.ts:33` |
| `loadCalendar` | 8 | `parseCalendarDate`, `getViewWindows`, `compileEventFilter`, `findFacetsOnce`, `resolveGrouping`, `findEventsCached`, `compileEventGrouping`, `describeEmptiness` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:85` |
| `toTimelineRows` | 7 | `map(…)`, `map(…)`, `buildEventGroups`, `placeGroupRows`, `map(…)`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline.ts:63` |

<details>
<summary>140 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CalendarTimeline` | 7 | `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useCallback(…)`, `useMemo(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:117` |
| `CalendarGrid` | 7 | `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `toEventCalendarView`, `getViewLayout`, `useCallback(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:252` |
| `buildEventGroups` | 5 | `find(…)`, `collectGroups`, `describeGroup`, `map(…)`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-tree.ts:58` |
| `getViewWindows` | 4 | `joinWindows`, `getTimelineDays`, `getVisibleDays`, `shiftDays` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:84` |
| `validateCalendarSearch` | 4 | `normalizeEventFilter`, `parseGrouping`, `parseTimelineScale`, `parseCalendarView` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-search.ts:101` |
| `CalendarFilters` | 4 | `isSameEventFilter`, `toLinkedEventFilter`, `renderFiltersButton`, `countActiveEventFilterRules` | `projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:79` |
| `VirtualList` | 4 | `useMemo(…)`, `getVirtualWindow`, `useEffect(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list.tsx:56` |
| `CalendarGroupBy` | 4 | `useMemo(…)`, `map(…)`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:53` |
| `getVisibleTimelineRows` | 4 | `getVirtualWindow`, `getRowOffsets`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-window.ts:33` |
| `findEvents` | 4 | `replace(…)`, `replace(…)`, `flatMap(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:58` |
| `toEventRecord` | 4 | `readText`, `readRequiredText`, `readDate`, `from(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:125` |
| `select` | 4 | `startWorker`, `listen`, `addEventListener(…)`, `anonymous` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:49` |
| `compileRule` | 3 | `compileTagRule`, `readTexts`, `compileDerivedRule` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:69` |
| `resolveGrouping` | 3 | `createEventGroupFields`, `resolveEventGrouping`, `getDefaultGrouping` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:239` |
| `toAgendaRows` | 3 | `getAgendaListing`, `flatMap(…)`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:76` |
| `toGroupedAgendaRows` | 3 | `toAgendaRows`, `filter(…)`, `buildEventGroups` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:107` |
| `GroupLevelRow` | 3 | `find(…)`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:168` |
| `useMemo(…)` | 3 | `filter(…)`, `toAgendaRows`, `getAgendaRange` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list.tsx:46` |
| `measure` | 3 | `getVisibleTimelineRows`, `readRowBoxes`, `readViewport` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:352` |
| `IndexPage` | 3 | `useMemo(…)`, `useMemo(…)`, `getDefaultCalendarView` | `projects/caelundas/caelundas-web/src/routes/index.tsx:96` |
| `addEventListener(…)` | 3 | `then(…)`, `then(…)`, `select` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:83` |
| `compileEventFilter` | 2 | `compileRule`, `combine` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:22` |
| `combine` | 2 | `flatMap(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:52` |
| `createEventGroupFields` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:30` |
| `resolveEventGrouping` | 2 | `find(…)`, `some(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:93` |
| `handleQueryChange` | 2 | `compileEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:103` |
| `CalendarSkeleton` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton.tsx:39` |
| `describeEvent` | 2 | `map(…)`, `formatDuration` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:36` |
| `formatDuration` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:60` |
| `describeGroup` | 2 | `formatDerivedKey`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-tree.ts:154` |
| `CalendarEventRow` | 2 | `formatEventTime`, `describeEvent` | `projects/caelundas/caelundas-web/src/components/calendar-event-row.tsx:31` |
| `useMemo(…)` | 2 | `getRowOffsets`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list.tsx:75` |
| `handleScroll` | 2 | `getVirtualWindow`, `setAnswered(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list.tsx:93` |
| `CalendarAgenda` | 2 | `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:73` |
| `AgendaRowContent` | 2 | `formatEventCount`, `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:135` |
| `anonymous` | 2 | `find(…)`, `toLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:185` |
| `CalendarOverflowList` | 2 | `useMemo(…)`, `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-overflow-list.tsx:37` |
| `clusterRow` | 2 | `toSorted(…)`, `toCluster` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-clusters.ts:95` |
| `CalendarViewSelect` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:50` |
| `useMemo(…)` | 2 | `clusterTimelineBars`, `getClusterSpan` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:151` |
| `useEffect(…)` | 2 | `watchVisibleRows(…)`, `watchVisibleRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:180` |
| `EventsCalendar` | 2 | `useMemo(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:129` |
| `useMemo(…)` | 2 | `getAgendaRange`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:283` |
| `loader` | 2 | `loadCalendar`, `validateCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:60` |
| `toDataset` | 2 | `readDate`, `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:112` |
| `createBrowserEventsDatabase` | 2 | `createEventsDatabase`, `createWorkerSqlExecutor` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:35` |
| `select` | 2 | `catch(…)`, `openDatabase` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:62` |
| `compileTagRule` | 1 | `replace(…)` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:86` |
| `map(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:33` |
| `getDefaultGrouping` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:63` |
| `flatMap(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-fields.ts:70` |
| `compileEventGrouping` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-compiler.ts:39` |
| `map(…)` | 1 | `compileGroupLevel` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-compiler.ts:42` |
| `compileGroupLevel` | 1 | `isDerivedGroupId` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-compiler.ts:48` |
| `parseCalendarDate` | 1 | `anchorDay` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:117` |
| `getTimelineDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:140` |
| `getVisibleDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:181` |
| `countActiveEventFilterRules` | 1 | `compileEventFilter` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-tree.ts:46` |
| `isSameEventFilter` | 1 | `normalizeEventFilter` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-tree.ts:64` |
| `parseGrouping` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-search.ts:122` |
| `describeEmptiness` | 1 | `some(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:137` |
| `findEventsCached` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:173` |
| `findFacetsOnce` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:220` |
| `OutsideDataset` | 1 | `format` | `projects/caelundas/caelundas-web/src/components/calendar-empty.tsx:138` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:80` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:92` |
| `FilterChipRow` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:158` |
| `subscribeToDesktopViewport` | 1 | `subscribeToQuery` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-viewport.ts:28` |
| `subscribeToViewport` | 1 | `subscribeToQuery` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-viewport.ts:36` |
| `duration` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-labels.ts:18` |
| `week` | 1 | `formatCalendarDay` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-labels.ts:37` |
| `toSorted(…)` | 1 | `compareText` | `projects/caelundas/caelundas-web/src/lib/event-groups/event-group-tree.ts:100` |
| `getAgendaRange` | 1 | `addCalendarDays` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:62` |
| `filter(…)` | 1 | `getAgendaListing` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:120` |
| `getAgendaListing` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-agenda.ts:160` |
| `getVirtualWindow` | 1 | `findFirstRowEndingAfter` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-virtual-window.ts:48` |
| `useEffect(…)` | 1 | `anonymous` | `projects/caelundas/caelundas-web/src/components/virtual-list.tsx:113` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:87` |
| `useMemo(…)` | 1 | `toGroupedAgendaRows` | `projects/caelundas/caelundas-web/src/components/calendar-agenda.tsx:89` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:65` |
| `map(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:69` |
| `filter(…)` | 1 | `some(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:73` |
| `replaceLevel` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:78` |
| `map(…)` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:121` |
| `anonymous` | 1 | `replaceLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:129` |
| `anonymous` | 1 | `toLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:138` |
| `map(…)` | 1 | `describeDepth` | `projects/caelundas/caelundas-web/src/components/calendar-group-by.tsx:214` |
| `CalendarScaleSelect` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-scale-select.tsx:40` |
| `handleValueChange` | 1 | `parseTimelineScale` | `projects/caelundas/caelundas-web/src/components/calendar-scale-select.tsx:50` |
| `map(…)` | 1 | `toGanttEvent` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline.ts:71` |
| `map(…)` | 1 | `toGanttEvent` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline.ts:89` |
| `clusterTimelineBars` | 1 | `clusterRow` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-clusters.ts:53` |
| `toCluster` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-clusters.ts:135` |
| `isSameRowSet` | 1 | `every(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-window.ts:55` |
| `windowTimelineBars` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-timeline-window.ts:70` |
| `handleValueChange` | 1 | `parseCalendarView` | `projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:69` |
| `anonymous` | 1 | `handleValueChange` | `projects/caelundas/caelundas-web/src/components/calendar-view-select.tsx:102` |
| `CalendarToolbar` | 1 | `some(…)` | `projects/caelundas/caelundas-web/src/components/calendar-toolbar.tsx:58` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:145` |
| `useMemo(…)` | 1 | `toTimelineRows` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:147` |
| `useMemo(…)` | 1 | `windowTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:158` |
| `useMemo(…)` | 1 | `toCountColumns` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:167` |
| `watchVisibleRows(…)` | 1 | `setMeasured(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:183` |
| `setMeasured(…)` | 1 | `isSameRowSet` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:184` |
| `readRowBoxes` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:244` |
| `TimelineNavigation` | 1 | `useLayoutEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:306` |
| `watchVisibleRows` | 1 | `attach` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:346` |
| `attach` | 1 | `schedule` | `projects/caelundas/caelundas-web/src/components/calendar-timeline.tsx:365` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:275` |
| `map(…)` | 1 | `toCalendarEvent` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:275` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:279` |
| `map(…)` | 1 | `describeEvent` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:279` |
| `useCallback(…)` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:312` |
| `CalendarGridNavigation` | 1 | `useLayoutEffect(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:360` |
| `createEventFilterFields` | 1 | `toTagField` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:154` |
| `toTagField` | 1 | `formatEventCount` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:185` |
| `useMemo(…)` | 1 | `createEventFilterFields` | `projects/caelundas/caelundas-web/src/routes/index.tsx:102` |
| `useMemo(…)` | 1 | `parseCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:112` |
| `search` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:158` |
| `anonymous` | 1 | `handleFilterChange` | `projects/caelundas/caelundas-web/src/routes/index.tsx:213` |
| `transform(…)` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:40` |
| `describeDataset` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:52` |
| `map(…)` | 1 | `toDataset` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:55` |
| `replace(…)` | 1 | `toGroupColumns` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:64` |
| `map(…)` | 1 | `toEventRecord` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:77` |
| `findFacets` | 1 | `toFacets` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:80` |
| `readDate` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:89` |
| `from(…)` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:131` |
| `toFacets` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:148` |
| `toGroupColumns` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:177` |
| `map(…)` | 1 | `replace(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:179` |
| `addEventListener(…)` | 1 | `rejectAll` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:53` |
| `listen` | 1 | `addEventListener(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:79` |
| `startWorker` | 1 | `UnsupportedBrowserError.constructor` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:111` |
| `getRouter` | 1 | `createBrowserEventsDatabase` | `projects/caelundas/caelundas-web/src/router.tsx:10` |
| `localDate` | 1 | `formatLocalPart` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:63` |
| `localHour` | 1 | `formatLocalPart` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:70` |
| `localWeekday` | 1 | `formatLocalPart` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:80` |
| `then(…)` | 1 | `respond` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:87` |
| `then(…)` | 1 | `respond` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:90` |

</details>
<!-- callidescope:end -->

<!-- codometer:start -->

## ⏲️ Codometer

### Project

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-11184-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-342.29_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-12-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-95-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-95-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-62-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-2-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-314-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-29-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-16-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-2-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-678-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-7-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-538-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-147-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-563-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-346-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-194-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-659-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-1245-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-152-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-37-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-14-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-103-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-86-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-2-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-39-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-145-dc2626?style=flat-square)
![JSON Max Depth](https://img.shields.io/badge/JSON_Max_Depth-5-ea580c?style=flat-square)

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

![SQL Files](https://img.shields.io/badge/SQL_Files-3-e38c00?style=flat-square)
![SQL Lines](https://img.shields.io/badge/SQL_Lines-207-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-18-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-10-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-5-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-13-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-3-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-23-64748b?style=flat-square)

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
![Unit Tests](https://img.shields.io/badge/Unit_Tests-9-ca8a04?style=flat-square)
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
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-315-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-6-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-8-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-53-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-36-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-1-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-7-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-9-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-6-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-88-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
