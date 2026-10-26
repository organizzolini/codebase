## Develop

```bash
nx run caelundas-web:start
```

The dev and preview servers listen on port 8967, derived from the project name
with `scripts/shell/text-to-port.sh caelundas-web` as every other application's
is, and `nx run caelundas-web:stop` frees it.

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
| Callables | 120 |
| Files | 38 |
| Calls traced | 110 |
| Call stacks | 22 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 24 |

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

**2. `EventsCalendar`** — depth 6 · orphan-root

```text
🚀 EventsCalendar(properties: Readonly<EventsCalendarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:43]
   ↳ Renders the month view under a single toolbar row, filling its container.
  └─> useMemo(…)(): Map<string, string> [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:55]
    └─> map(…)(event: CalendarEventRecord): [string, string] [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:55]
      └─> describeEvent(event: CalendarEventRecord): string [projects/caelundas/caelundas-web/src/components/events-calendar.tsx:109]
         ↳ Spells out an event's tag paths and its duration.
        └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:34]
           ↳ Names a duration in days, hours, and minutes, leaving out any unit that is zero, or "Instant" for an event with no…
          └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:47]
```

**3. `loader`** — depth ≥ 6 · orphan-root

```text
🚀 loader(…): Promise<CalendarData> [projects/caelundas/caelundas-web/src/routes/index.tsx:41]
  └─> loadCalendarMonth(database: EventsDatabase, search: CalendarSearch): Promise<CalendarData> [projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:61]
     ↳ Reads the events around the day the search parameters name that pass their filter, together with the dataset's span and…
    └─> compileEventFilter(node: EventFilterNode | undefined): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:22]
       ↳ Compiles the ReUI filter tree to one parameterized boolean expression over the derived events view, aliased `e`.
      └─> compileRule(rule: EventFilterRule): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:69]
         ↳ Compiles one rule by its field, flipping it when the rule is negated.
        └─> compileTagRule(operator: string, tagIds: readonly string[]): CompiledEventFilter | null [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:86]
           ↳ Compiles a rule on a tag field.
          └─> replace(…)(): string [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:99]
```

<details>
<summary>19 more call stacks</summary>

**4. `handleQueryChange`** — depth ≥ 5 · orphan-root

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

**5. `IndexPage`** — depth 5 · orphan-root

```text
🚀 IndexPage(): ReactNode [projects/caelundas/caelundas-web/src/routes/index.tsx:72]
   ↳ Renders the landing page's heading.
  └─> useMemo(…)(): EventFilterField[] [projects/caelundas/caelundas-web/src/routes/index.tsx:77]
    └─> createEventFilterFields(facets: readonly EventFacet[]): EventFilterField[] [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:154]
       ↳ Builds the filter builder's fields: one per tag root in the database's facets, offering every tag beneath it, then the…
      └─> toTagField(facet: EventFacet): EventFilterField [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:185]
         ↳ Builds the field for one tag root.
        └─> formatEventCount(count: number): string [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:175]
           ↳ Names how many events a tag matches.
```

**6. `describeDataset`** — depth ≥ 5 · orphan-root

```text
🚀 describeDataset(): Promise<EventsDataset | null> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:34]
  └─> map(…)(row: Readonly<Record<string, unknown>>): EventsDataset [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:37]
    └─> toDataset(row: SqlRow): EventsDataset [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:90]
       ↳ Maps the dataset summary row.
      └─> readDate(row: SqlRow, column: string): Date [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:67]
         ↳ Reads an ISO 8601 text column as an instant.
        └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:74]
           ↳ Reads a column the schema declares `not null` as text.
```

**7. `findEvents`** — depth ≥ 5 · orphan-root

```text
🚀 findEvents(query: EventsQuery): Promise<CalendarEventRecord[]> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:40]
  └─> map(…)(row: Readonly<Record<string, unknown>>): CalendarEventRecord [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:55]
    └─> toEventRecord(row: SqlRow): CalendarEventRecord [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:103]
       ↳ Maps one event row, whose tags arrive as a JSON array, to the calendar's event shape.
      └─> readDate(row: SqlRow, column: string): Date [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:67]
         ↳ Reads an ISO 8601 text column as an instant.
        └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:74]
           ↳ Reads a column the schema declares `not null` as text.
```

**8. `findFacets`** — depth ≥ 3 · orphan-root

```text
🚀 findFacets(): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:58]
  └─> toFacets(rows: readonly SqlRow[]): EventFacet[] [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:121]
     ↳ Gathers the tag rows, roots first in path order, into one facet per root.
    └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:74]
       ↳ Reads a column the schema declares `not null` as text.
```

**9. `select`** — depth ≥ 3 · orphan-root

```text
🚀 select(…): Promise<Readonly<Record<string, unknown>>[]> [projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:49]
  └─> startWorker(): Worker [projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:111]
     ↳ Starts the worker that owns the sqlite-wasm database.
    └─> UnsupportedBrowserError.constructor(): UnsupportedBrowserError [projects/caelundas/caelundas-web/src/lib/events-database/events-database.errors.ts:7]
```

**10. `getRouter`** — depth 3 · orphan-root

```text
🚀 getRouter(): Router<typeof routeTree> [projects/caelundas/caelundas-web/src/router.tsx:10]
   ↳ Creates the application router, which TanStack Start calls once per request on the server and once on the client.
  └─> createBrowserEventsDatabase(): EventsDatabase [projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:35]
     ↳ The events database the browser reads, served by a sqlite-wasm worker.
    └─> createEventsDatabase(executor: SqlExecutor): EventsDatabase [projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:32]
       ↳ Builds the events database over any executor.
```

**11. `addEventListener(…)`** — depth 3 · orphan-root

```text
🚀 addEventListener(…)(event: MessageEvent<WorkerRequest>): void [projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:83]
  └─> then(…)(rows: Readonly<Record<string, unknown>>[]): void [projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:87]
    └─> respond(response: WorkerResponse): void [projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:55]
       ↳ Answers the page.
```

**12. `validateCalendarSearch`** — depth 2 · orphan-root

```text
🚀 validateCalendarSearch(search: Readonly<Record<string, unknown>>): CalendarSearch [projects/caelundas/caelundas-web/src/lib/calendar/calendar-search.ts:52]
   ↳ Reads the calendar's search parameters.
  └─> normalizeEventFilter(group: LooseEventFilterGroup): EventFilterQuery [projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-tree.ts:78]
     ↳ Rebuilds a filter tree with every node's keys in one fixed order, leaving out a `negated` that was never set, so equal…
```

**13. `OutsideDataset`** — depth 2 · orphan-root

```text
🚀 OutsideDataset(…): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-empty.tsx:102]
   ↳ Names the dates the data covers and offers to jump to the nearest of them.
  └─> format(date: Date): string [projects/caelundas/caelundas-web/src/components/calendar-empty.tsx:110]
```

**14. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:80]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:46]
```

**15. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:92]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:46]
```

**16. `FilterChipRow`** — depth 2 · orphan-root

```text
🚀 FilterChipRow(): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:158]
   ↳ Draws one chip per rule of the tree in the surrounding `Filters`, nested ones included, in a row that scrolls sideways…
  └─> map(…)(rule: FilterRule<EventFilterValue>, index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:172]
```

**17. `CalendarSkeleton`** — depth 2 · orphan-root

```text
🚀 CalendarSkeleton(properties: Readonly<CalendarSkeletonProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton.tsx:27]
   ↳ Renders the month view's shape, a toolbar row over a grid of days, while the events database loads.
  └─> map(…)(key: string): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton.tsx:56]
```

**18. `CalendarToolbar`** — depth 2 · orphan-root

```text
🚀 CalendarToolbar(properties: Readonly<CalendarToolbarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-toolbar.tsx:32]
   ↳ Renders the calendar's one toolbar row: today, previous and next, the period's title, the filters, and the view…
  └─> map(…)(availableView: CalendarView): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-toolbar.tsx:91]
```

**19. `search`** — depth 2 · orphan-root

```text
🚀 search(…): { date: string; filter?: EventFilterQuery | undefined; } [projects/caelundas/caelundas-web/src/routes/index.tsx:93]
  └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:16]
     ↳ Writes the day an instant falls on in a zone as a `YYYY-MM-DD` search parameter, the way the calendar's navigation…
```

**20. `localDate`** — depth 2 · orphan-root

```text
🚀 localDate(instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:63]
   ↳ The calendar day an instant falls on in a zone, as `YYYY-MM-DD`.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:34]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**21. `localHour`** — depth 2 · orphan-root

```text
🚀 localHour(instant: unknown, timeZone: unknown): null | number [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:70]
   ↳ The hour of the day an instant falls in in a zone, from 0 to 23.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/lib/events-database/events-database.local-time.ts:34]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**22. `localWeekday`** — depth 2 · orphan-root

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
| `loadCalendarMonth` | 5 | `parseCalendarDate`, `getMonthWindow`, `compileEventFilter`, `findFacetsOnce`, `describeEmptiness` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:61` |
| `CalendarFilters` | 4 | `isSameEventFilter`, `toLinkedEventFilter`, `renderFiltersButton`, `countActiveEventFilterRules` | `projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:79` |

<details>
<summary>51 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `select` | 4 | `startWorker`, `listen`, `addEventListener(…)`, `anonymous` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:49` |
| `compileRule` | 3 | `compileTagRule`, `readTexts`, `compileDerivedRule` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:69` |
| `EventsCalendar` | 3 | `useMemo(…)`, `useMemo(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:43` |
| `toEventRecord` | 3 | `readText`, `readRequiredText`, `readDate` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:103` |
| `addEventListener(…)` | 3 | `then(…)`, `then(…)`, `select` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:83` |
| `compileEventFilter` | 2 | `compileRule`, `combine` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:22` |
| `combine` | 2 | `flatMap(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:52` |
| `handleQueryChange` | 2 | `compileEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:103` |
| `formatDuration` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-format.ts:34` |
| `describeEvent` | 2 | `map(…)`, `formatDuration` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:109` |
| `findEvents` | 2 | `replace(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:40` |
| `toDataset` | 2 | `readDate`, `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:90` |
| `createBrowserEventsDatabase` | 2 | `createEventsDatabase`, `createWorkerSqlExecutor` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.browser.ts:35` |
| `select` | 2 | `catch(…)`, `openDatabase` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.worker.ts:62` |
| `compileTagRule` | 1 | `replace(…)` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-compiler.ts:86` |
| `parseCalendarDate` | 1 | `anchorDay` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-window.ts:43` |
| `countActiveEventFilterRules` | 1 | `compileEventFilter` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-tree.ts:46` |
| `isSameEventFilter` | 1 | `normalizeEventFilter` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-tree.ts:64` |
| `validateCalendarSearch` | 1 | `normalizeEventFilter` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-search.ts:52` |
| `findFacetsOnce` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/lib/calendar/calendar-loader.ts:121` |
| `OutsideDataset` | 1 | `format` | `projects/caelundas/caelundas-web/src/components/calendar-empty.tsx:102` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:80` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/filter-date-range-editor.tsx:92` |
| `FilterChipRow` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters.tsx:158` |
| `CalendarSkeleton` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton.tsx:27` |
| `CalendarToolbar` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-toolbar.tsx:32` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:51` |
| `map(…)` | 1 | `toCalendarEvent` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:51` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:55` |
| `map(…)` | 1 | `describeEvent` | `projects/caelundas/caelundas-web/src/components/events-calendar.tsx:55` |
| `createEventFilterFields` | 1 | `toTagField` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:154` |
| `toTagField` | 1 | `formatEventCount` | `projects/caelundas/caelundas-web/src/lib/event-filters/event-filter-fields.ts:185` |
| `loader` | 1 | `loadCalendarMonth` | `projects/caelundas/caelundas-web/src/routes/index.tsx:41` |
| `IndexPage` | 1 | `useMemo(…)` | `projects/caelundas/caelundas-web/src/routes/index.tsx:72` |
| `useMemo(…)` | 1 | `createEventFilterFields` | `projects/caelundas/caelundas-web/src/routes/index.tsx:77` |
| `search` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:93` |
| `describeDataset` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:34` |
| `map(…)` | 1 | `toDataset` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:37` |
| `map(…)` | 1 | `toEventRecord` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:55` |
| `findFacets` | 1 | `toFacets` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:58` |
| `readDate` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:67` |
| `toFacets` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/lib/events-database/events-database.ts:121` |
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

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-4892-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-157.23_kB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-11-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-55-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-55-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-34-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-0-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-144-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-11-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-16-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-1-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-245-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-6-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-179-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-72-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-208-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-168-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-100-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-315-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-575-475569?style=flat-square)
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
![JSON Strings](https://img.shields.io/badge/JSON_Strings-85-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-2-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-38-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-144-dc2626?style=flat-square)
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
![SQL Lines](https://img.shields.io/badge/SQL_Lines-200-f29111?style=flat-square)
![SQL Statements](https://img.shields.io/badge/SQL_Statements-15-7c3aed?style=flat-square)
![SQL Selects](https://img.shields.io/badge/SQL_Selects-10-16a34a?style=flat-square)
![SQL Inserts](https://img.shields.io/badge/SQL_Inserts-5-22c55e?style=flat-square)
![SQL Updates](https://img.shields.io/badge/SQL_Updates-0-0ea5e9?style=flat-square)
![SQL Deletes](https://img.shields.io/badge/SQL_Deletes-0-dc2626?style=flat-square)
![SQL Creates](https://img.shields.io/badge/SQL_Creates-10-0284c7?style=flat-square)
![SQL Joins](https://img.shields.io/badge/SQL_Joins-3-8b5cf6?style=flat-square)
![SQL CTEs](https://img.shields.io/badge/SQL_CTEs-0-059669?style=flat-square)
![SQL Comments](https://img.shields.io/badge/SQL_Comments-19-64748b?style=flat-square)

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
![Constants Files](https://img.shields.io/badge/Constants_Files-2-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-4-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-0-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-3-ca8a04?style=flat-square)
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
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-218-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-6-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-7-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-40-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-26-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-0-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-0-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-9-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-6-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-64-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->
