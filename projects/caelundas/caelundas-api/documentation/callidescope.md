<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-api`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 302 |
| Files | 77 |
| Calls traced | 219 |
| Call stacks | 15 |
| Deepest stack | 9 |
| Stacks through recursion | 0 |
| Unfollowable calls | 6 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | none |

### Call stacks (depth)

**1. `EventsResolver.defaultFilterCollection`** — depth 9 · decorated-method

```text
🚀 EventsResolver.defaultFilterCollection(): Promise<EventFilterCollectionEntity | null> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:64]
   ↳ The collection the calendar opens on.
  └─> EventsService.findFilterCollections(): Promise<ResolvedEventFilterCollection[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:159]
     ↳ The named filter collections resolved against the tags the whole dataset has, in menu order.
    └─> EventsService.findFacets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:119]
       ↳ Every tag root with the tags beneath it, each counting the events that overlap the window and meet the filter, or every…
      └─> compileEventFilter(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:34]
         ↳ Compiles the filter tree to one parameterized boolean expression over the derived events view, aliased `e`, whose…
        └─> compileGroup(group: EventFilterGroup, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:53]
           ↳ Joins a group's compiled rules and nested groups under its combinator, in parentheses so that nesting keeps its…
          └─> compileRule(rule: EventFilterRule, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:83]
             ↳ Compiles one rule by its field, flipping it when the rule is negated.
            └─> compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:100]
               ↳ Compiles a numeric rule on a tag root whose tags are named for numbers: events with a tag beneath the root whose number…
              └─> compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:56]
                 ↳ Compiles a numeric comparison over a SQL expression for the events whose number meets it, reading the operands the…
                └─> isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:145]
                   ↳ Whether an operator compares a number with a range of two.
```

**2. `EventsResolver.filterCollections`** — depth 9 · decorated-method

```text
🚀 EventsResolver.filterCollections(): Promise<EventFilterCollectionEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:134]
   ↳ The named filter collections.
  └─> EventsService.findFilterCollections(): Promise<ResolvedEventFilterCollection[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:159]
     ↳ The named filter collections resolved against the tags the whole dataset has, in menu order.
    └─> EventsService.findFacets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:119]
       ↳ Every tag root with the tags beneath it, each counting the events that overlap the window and meet the filter, or every…
      └─> compileEventFilter(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:34]
         ↳ Compiles the filter tree to one parameterized boolean expression over the derived events view, aliased `e`, whose…
        └─> compileGroup(group: EventFilterGroup, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:53]
           ↳ Joins a group's compiled rules and nested groups under its combinator, in parentheses so that nesting keeps its…
          └─> compileRule(rule: EventFilterRule, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:83]
             ↳ Compiles one rule by its field, flipping it when the rule is negated.
            └─> compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:100]
               ↳ Compiles a numeric rule on a tag root whose tags are named for numbers: events with a tag beneath the root whose number…
              └─> compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:56]
                 ↳ Compiles a numeric comparison over a SQL expression for the events whose number meets it, reading the operands the…
                └─> isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:145]
                   ↳ Whether an operator compares a number with a range of two.
```

**3. `NightSkyResolver.nightSky`** — depth 9 · decorated-method

```text
🚀 NightSkyResolver.nightSky(input: NightSkyInput): NightSkyEntity [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.resolver.ts:24]
   ↳ The night sky for a place and a window size.
  └─> NightSkyService.build(input: NightSkyInput): NightSky [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:88]
     ↳ Builds the night sky a query asks for, from the stars and figures held in memory, refusing input the builder cannot…
    └─> NightSkyService.draw(input: ParsedNightSkyInput): NightSky [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:50]
       ↳ Draws the sky for a canonical input.
      └─> buildNightSky(options: NightSkyOptions): NightSky [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:68]
         ↳ Builds the night sky for a place and moment: the real fixed stars, drawn about the north celestial pole, which sits…
        └─> selectStars(geometry: SkyGeometry, options: ResolvedNightSkyOptions): SelectedStars [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:455]
           ↳ Draws the stars bright enough and on rings that cross the window.
          └─> map(…)(star: StarRow): RenderedStar | undefined [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:463]
            └─> renderStar(…): RenderedStar | undefined [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:424]
               ↳ Draws one star, or returns nothing when its ring never crosses the window.
              └─> projectSkyPoint(…): ProjectedPoint [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-projection.utilities.ts:32]
                 ↳ Projects a point of the sky about the north celestial pole with a stereographic projection.
                └─> tangentOfHalfAngle(degrees: number): number [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-projection.utilities.ts:72]
                   ↳ The tangent of half an angle given in degrees, as the projection needs.
```

<details>
<summary>12 more call stacks</summary>

**4. `EventsResolver.events`** — depth 8 · decorated-method

```text
🚀 EventsResolver.events(…): Promise<CalendarEventEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:82]
   ↳ The events that overlap a window and meet a filter.
  └─> EventsService.findEvents(…): Promise<CalendarEventEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:75]
     ↳ The events that overlap the window and meet the filter, earliest first, each with the tags it was given and, for each…
    └─> compileEventFilter(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:34]
       ↳ Compiles the filter tree to one parameterized boolean expression over the derived events view, aliased `e`, whose…
      └─> compileGroup(group: EventFilterGroup, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:53]
         ↳ Joins a group's compiled rules and nested groups under its combinator, in parentheses so that nesting keeps its…
        └─> compileRule(rule: EventFilterRule, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:83]
           ↳ Compiles one rule by its field, flipping it when the rule is negated.
          └─> compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:100]
             ↳ Compiles a numeric rule on a tag root whose tags are named for numbers: events with a tag beneath the root whose number…
            └─> compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:56]
               ↳ Compiles a numeric comparison over a SQL expression for the events whose number meets it, reading the operands the…
              └─> isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:145]
                 ↳ Whether an operator compares a number with a range of two.
```

**5. `EventsResolver.facets`** — depth 8 · decorated-method

```text
🚀 EventsResolver.facets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:113]
   ↳ The tag facets, counted over a window.
  └─> EventsService.findFacets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:119]
     ↳ Every tag root with the tags beneath it, each counting the events that overlap the window and meet the filter, or every…
    └─> compileEventFilter(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:34]
       ↳ Compiles the filter tree to one parameterized boolean expression over the derived events view, aliased `e`, whose…
      └─> compileGroup(group: EventFilterGroup, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:53]
         ↳ Joins a group's compiled rules and nested groups under its combinator, in parentheses so that nesting keeps its…
        └─> compileRule(rule: EventFilterRule, binder: EventFilterBinder): null | string [projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:83]
           ↳ Compiles one rule by its field, flipping it when the rule is negated.
          └─> compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:100]
             ↳ Compiles a numeric rule on a tag root whose tags are named for numbers: events with a tag beneath the root whose number…
            └─> compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:56]
               ↳ Compiles a numeric comparison over a SQL expression for the events whose number meets it, reading the operands the…
              └─> isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:145]
                 ↳ Whether an operator compares a number with a range of two.
```

**6. `EventsResolver.calendarWindows`** — depth 5 · decorated-method

```text
🚀 EventsResolver.calendarWindows(args: CalendarWindowsArguments): CalendarWindowsEntity [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:37]
   ↳ The days a view shows and the window to read events for.
  └─> EventsService.findCalendarWindows(args: CalendarWindowsArguments): CalendarWindows [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:63]
     ↳ The days a calendar view or a timeline scale shows around a day, and the window of events to read for them.
    └─> getCalendarWindows(…): CalendarWindows [projects/caelundas/caelundas-api/src/modules/events/calendar-windows.utilities.ts:33]
       ↳ The days a view shows around the day it opens on, as UTC midnights, and the window read for them, a day wider either…
      └─> getTimelineDays(scale: TimelineScale, anchor: Date): TimeWindow [projects/caelundas/caelundas-api/src/modules/events/calendar-windows.utilities.ts:71]
         ↳ The days the timeline's axis spans at a scale, as the Gantt lays them out: the day, the week from Sunday, the month,…
        └─> startOfDay(anchor: Date): Date [projects/caelundas/caelundas-api/src/modules/events/calendar-windows.utilities.ts:173]
           ↳ The UTC midnight that starts the day an instant falls on.
```

**7. `EventsResolver.dataset`** — depth 4 · decorated-method

```text
🚀 EventsResolver.dataset(): Promise<EventsDatasetEntity | null> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:51]
   ↳ The span and zone of the whole dataset.
  └─> EventsService.describeDataset(): Promise<EventsDatasetEntity | null> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:53]
     ↳ The span and zone of the whole dataset, or null when it holds no event.
    └─> EventsService.select(…): Promise<Row[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:170]
       ↳ Runs one statement with its `$n` parameters on the shared connection and parses every row with `schema`, so a column…
      └─> EventsService.map(…)(row: unknown): Row [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:177]
```

**8. `decodeOffsetCursor`** — depth ≥ 3 · orphan-root

```text
🚀 decodeOffsetCursor(cursor?: null | string, defaultOffset?: number): number [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:75]
   ↳ Decodes an offset-based cursor, returning the specified default offset if missing or invalid.
  └─> fromCursorSafe<T = unknown>(cursor?: null | string, parse?: (value: unknown) => T): null | T [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:117]
     ↳ Safely decodes a cursor string, returning null if invalid, null, or undefined.
    └─> fromCursor<T = unknown>(cursor: string, parse?: (value: unknown) => T): T [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:103]
       ↳ Decodes an opaque Base64 cursor string into structured data.
```

**9. `paginateArray`** — depth ≥ 3 · orphan-root

```text
🚀 paginateArray(…): { edges: Edge<T>[]; hasNextPage: boolean; hasPreviousPage: boolean; } [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:134]
   ↳ Slices an array of items according to forward (first, after) Relay pagination parameters.
  └─> map(…)(item: T): Edge<T> [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:169]
    └─> createEdge<T>(node: T, cursor: string): Edge<T> [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:43]
       ↳ Creates a Relay Edge from a node and an encoded cursor string.
```

**10. `Paginated`** — depth ≥ 3 · orphan-root

```text
🚀 Paginated<T>(classReference: ClassConstructor<T>): ClassConstructor<Connection<T>> [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:180]
   ↳ Mixin type factory producing a Relay Connection ObjectType for GraphQL schema generation.
  └─> createEdgeType<T>(classReference: ClassConstructor<T>): ClassConstructor<Edge<T>> [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:50]
     ↳ Mixin type factory producing a Relay Edge ObjectType for GraphQL schema generation.
    └─> Field(…)(): StringConstructor [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:60]
```

**11. `HealthResolver.health`** — depth 2 · decorated-method

```text
🚀 HealthResolver.health(): boolean [projects/caelundas/caelundas-api/src/modules/health/health.resolver.ts:22]
   ↳ Health check query.
  └─> HealthService.isHealthy(): boolean [projects/caelundas/caelundas-api/src/modules/health/health.service.ts:23]
     ↳ Returns true if the service is operational.
```

**12. `NightSkyService.onModuleInit`** — depth 2 · lifecycle

```text
🚀 NightSkyService.onModuleInit(): Promise<void> [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:115]
   ↳ Reads the stars and constellation figures from the database, and sorts the stars brightest first, which is the order…
  └─> NightSkyService.flatMap(…)(…): { from: [number, number]; name: string; to: [number, number]; zodiac: boolean; }[] [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:124]
```

**13. `encodeOffsetCursor`** — depth 2 · orphan-root

```text
🚀 encodeOffsetCursor(offset: number): string [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:96]
   ↳ Encodes an offset-based integer cursor.
  └─> toCursor(data: unknown): string [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:208]
     ↳ Encodes structured data into an opaque Base64 cursor string.
```

**14. `transform(…)`** — depth 2 · orphan-root

```text
🚀 transform(…)(origins: string): string[] [projects/caelundas/caelundas-api/src/caelundas-api.constants.ts:13]
  └─> filter(…)(origin: string): boolean [projects/caelundas/caelundas-api/src/caelundas-api.constants.ts:17]
```

**15. `bootstrap`** — depth 2 · orphan-root

```text
🚀 bootstrap(): Promise<void> [projects/caelundas/caelundas-api/src/caelundas-api.ts:16]
   ↳ Bootstraps the NestJS GraphQL API application.
  └─> corsOptions(origins: string[]): CorsOptions [projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:12]
     ↳ Builds the CORS options from the allowed origins: `*` allows every origin, otherwise only the listed ones are echoed…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `compileDerivedRule` | 10 | `compileDateRule`, `readDateRange`, `compileDurationRule`, `readTexts`, `compileHourRule`, `readIntegerRange`, `compileTemporalityRule`, `compileTextRule`, `compileWeekdayRule`, `readIntegers` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:27` |
| `buildNightSky` | 8 | `resolveOptions`, `computeGeometry`, `selectStars`, `computeMotion`, `buildViewport`, `formatConstellationLines`, `assembleSvg`, `formatEcliptic` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:68` |
| `compileRule` | 7 | `isNumberOperator`, `compileTagNumberRule`, `compileTagRule`, `readTexts`, `isDerivedNumberRule`, `compileDerivedNumberRule`, `compileDerivedRule` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:83` |

<details>
<summary>94 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `EventsService.findEvents` | 7 | `compileEventFilter`, `compileEventGrouping`, `EventsService.select`, `EventsService.replace(…)`, `EventsService.replace(…)`, `toIsoString`, `EventsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:75` |
| `compileGroupLevel` | 5 | `filter(…)`, `replace(…)`, `bindParameter`, `find(…)`, `replace(…)` | `projects/caelundas/caelundas-api/src/modules/events/event-grouping-compiler.utilities.ts:49` |
| `getCalendarWindows` | 4 | `joinWindows`, `getTimelineDays`, `getVisibleDays`, `shiftDays` | `projects/caelundas/caelundas-api/src/modules/events/calendar-windows.utilities.ts:33` |
| `compileNumberCondition` | 4 | `isRangeOperator`, `readNumberRange`, `readSingleNumber`, `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:56` |
| `compileTagNumberRule` | 4 | `compileNumberCondition`, `bindParameter`, `replace(…)`, `replace(…)` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:100` |
| `EventsService.findFacets` | 4 | `compileEventFilter`, `EventsService.select`, `EventsService.replace(…)`, `toIsoString` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:119` |
| `formatEcliptic` | 4 | `splitIntoRuns`, `traceEcliptic`, `normalizeHexadecimalColor`, `map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-ecliptic.utilities.ts:24` |
| `formatConstellationLines` | 4 | `filter(…)`, `map(…)`, `formatStroke`, `map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-lines.utilities.ts:29` |
| `resolveOptions` | 4 | `resolveAppearance`, `resolveView`, `resolveLineStyle`, `resolveEcliptic` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-options.utilities.ts:15` |
| `assembleSvg` | 4 | `formatSpin`, `formatGlowGroup`, `formatStarGroups`, `formatSkyDefinitions` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:158` |
| `renderStar` | 4 | `projectSkyPoint`, `isOnVisibleRing`, `starRadius`, `colorBucketOf` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:424` |
| `EventsResolver.events` | 3 | `EventsService.findEvents`, `parseEventFilter`, `parseEventGrouping` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:82` |
| `createInputSchema` | 3 | `color`, `transform(…)`, `default(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:103` |
| `splitIntoRuns` | 3 | `projectSkyPoint`, `isOnVisibleRing`, `filter(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-projection.utilities.ts:50` |
| `selectStars` | 3 | `filter(…)`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:455` |
| `NightSkyService.draw` | 3 | `buildNightSky`, `selectConstellationSegments`, `computeStartingSiderealDegrees` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:50` |
| `NightSkyService.build` | 3 | `canonicalizeNightSkyInput`, `parseNightSkyInput`, `NightSkyService.draw` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:88` |
| `NightSkyService.onModuleInit` | 3 | `NightSkyService.flatMap(…)`, `NightSkyService.toSorted(…)`, `NightSkyService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:115` |
| `createEdgeType` | 2 | `Field(…)`, `Field(…)` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:50` |
| `paginateArray` | 2 | `findIndex(…)`, `map(…)` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:134` |
| `transform(…)` | 2 | `filter(…)`, `map(…)` | `projects/caelundas/caelundas-api/src/caelundas-api.constants.ts:13` |
| `getTimelineDays` | 2 | `startOfDay`, `shiftDays` | `projects/caelundas/caelundas-api/src/modules/events/calendar-windows.utilities.ts:71` |
| `getVisibleDays` | 2 | `startOfDay`, `shiftDays` | `projects/caelundas/caelundas-api/src/modules/events/calendar-windows.utilities.ts:113` |
| `compileDurationRule` | 2 | `filter(…)`, `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:90` |
| `compileTagRule` | 2 | `replace(…)`, `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:114` |
| `EventsService.findFilterCollections` | 2 | `resolveEventFilterCollections`, `EventsService.findFacets` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:159` |
| `EventsResolver.defaultFilterCollection` | 2 | `EventsService.findFilterCollections`, `EventsResolver.find(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:64` |
| `EventsResolver.facets` | 2 | `EventsService.findFacets`, `parseEventFilter` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:113` |
| `transform(…)` | 2 | `filter(…)`, `map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:118` |
| `map(…)` | 2 | `splitIntoRuns`, `interpolate` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-lines.utilities.ts:35` |
| `interpolate` | 2 | `toVector`, `from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-lines.utilities.ts:69` |
| `colorFromIndex` | 2 | `find(…)`, `map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:240` |
| `computeGeometry` | 2 | `limitFieldOfView`, `tangentOfHalfAngle` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:267` |
| `bootstrap` | 2 | `corsOptions`, `registerShutdownHandler(…)` | `projects/caelundas/caelundas-api/src/caelundas-api.ts:16` |
| `decodeOffsetCursor` | 1 | `fromCursorSafe` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:75` |
| `encodeOffsetCursor` | 1 | `toCursor` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:96` |
| `fromCursorSafe` | 1 | `fromCursor` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:117` |
| `map(…)` | 1 | `createEdge` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:169` |
| `Paginated` | 1 | `createEdgeType` | `projects/caelundas/caelundas-api/src/caelundas-api.utilities.ts:180` |
| `HealthResolver.health` | 1 | `HealthService.isHealthy` | `projects/caelundas/caelundas-api/src/modules/health/health.resolver.ts:22` |
| `resolveEventFilterCollections` | 1 | `resolveGroup` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-collections.utilities.ts:20` |
| `resolveGroup` | 1 | `resolveRule` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-collections.utilities.ts:46` |
| `readIntegerRange` | 1 | `readInteger` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-values.utilities.ts:33` |
| `readIntegers` | 1 | `readInteger` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-values.utilities.ts:57` |
| `readTexts` | 1 | `filter(…)` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-values.utilities.ts:116` |
| `compileDateRule` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:66` |
| `compileHourRule` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:127` |
| `compileTemporalityRule` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:150` |
| `compileTextRule` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:174` |
| `compileWeekdayRule` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-derived.utilities.ts:204` |
| `compileDerivedNumberRule` | 1 | `compileNumberCondition` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:32` |
| `isDerivedNumberRule` | 1 | `isNumberOperator` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:122` |
| `isNumberOperator` | 1 | `isRangeOperator` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-numbers.utilities.ts:138` |
| `compileEventFilter` | 1 | `compileGroup` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:34` |
| `compileGroup` | 1 | `compileRule` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:53` |
| `replace(…)` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-filter-compiler.utilities.ts:131` |
| `compileEventGrouping` | 1 | `replace(…)` | `projects/caelundas/caelundas-api/src/modules/events/event-grouping-compiler.utilities.ts:29` |
| `replace(…)` | 1 | `compileGroupLevel` | `projects/caelundas/caelundas-api/src/modules/events/event-grouping-compiler.utilities.ts:38` |
| `replace(…)` | 1 | `bindParameter` | `projects/caelundas/caelundas-api/src/modules/events/event-grouping-compiler.utilities.ts:58` |
| `EventsService.describeDataset` | 1 | `EventsService.select` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:53` |
| `EventsService.findCalendarWindows` | 1 | `getCalendarWindows` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:63` |
| `EventsService.map(…)` | 1 | `EventsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:96` |
| `EventsService.select` | 1 | `EventsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:170` |
| `EventsResolver.calendarWindows` | 1 | `EventsService.findCalendarWindows` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:37` |
| `EventsResolver.dataset` | 1 | `EventsService.describeDataset` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:51` |
| `EventsResolver.filterCollections` | 1 | `EventsService.findFilterCollections` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:134` |
| `formatSkyDefinitions` | 1 | `normalizeHexadecimalColor` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-colors.utilities.ts:14` |
| `normalizeHexadecimalColor` | 1 | `from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-colors.utilities.ts:31` |
| `canonicalizeNightSkyInput` | 1 | `bucket` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:25` |
| `parseNightSkyInput` | 1 | `createInputSchema` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:60` |
| `selectConstellationSegments` | 1 | `filter(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:74` |
| `filter(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:81` |
| `color` | 1 | `transform(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:91` |
| `transform(…)` | 1 | `normalizeHexadecimalColor` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:96` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-input.utilities.ts:120` |
| `formatPolyline` | 1 | `map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-projection.utilities.ts:10` |
| `projectSkyPoint` | 1 | `tangentOfHalfAngle` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-projection.utilities.ts:32` |
| `map(…)` | 1 | `formatPolyline` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-ecliptic.utilities.ts:39` |
| `traceEcliptic` | 1 | `from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-ecliptic.utilities.ts:63` |
| `from(…)` | 1 | `toEclipticPoint` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-ecliptic.utilities.ts:64` |
| `map(…)` | 1 | `formatPolyline` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-lines.utilities.ts:43` |
| `formatStroke` | 1 | `normalizeHexadecimalColor` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-lines.utilities.ts:56` |
| `from(…)` | 1 | `toSkyPoint` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky-lines.utilities.ts:73` |
| `computeLocalSiderealDegrees` | 1 | `computeGreenwichMeanSiderealHours` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:126` |
| `computeStartingSiderealDegrees` | 1 | `computeLocalSiderealDegrees` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:142` |
| `buildDebugViewport` | 1 | `formatDebugOverlay` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:188` |
| `buildViewport` | 1 | `buildDebugViewport` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:208` |
| `formatDebugOverlay` | 1 | `formatRing` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:314` |
| `formatGlowGroup` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:336` |
| `formatStarGroups` | 1 | `from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:377` |
| `from(…)` | 1 | `colorFromIndex` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:389` |
| `map(…)` | 1 | `renderStar` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:463` |
| `filter(…)` | 1 | `isRendered` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.utilities.ts:464` |
| `NightSkyResolver.nightSky` | 1 | `NightSkyService.build` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.resolver.ts:24` |

</details>
<!-- callidescope:end -->
