<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-api`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 295 |
| Files | 75 |
| Calls traced | 210 |
| Call stacks | 11 |
| Deepest stack | 9 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 17 |
| `maximumBreadth` | none |

### Call stacks (depth)

**1. `EventsResolver.defaultPreset`** — depth 9 · decorated-method

```text
🚀 EventsResolver.defaultPreset(): Promise<null | PresetEntity> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:54]
   ↳ The preset the calendar opens on.
  └─> EventsService.findPresets(): Promise<ResolvedPreset[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:163]
     ↳ The named presets resolved against the tags the whole dataset has, in menu order.
    └─> EventsService.findFacets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:123]
       ↳ Every tag root and its tags, counting events in the period and filter.
      └─> EventFilterService.compile(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:153]
         ↳ Compiles the filter tree to boolean SQL, numbering placeholders after `offset`.
        └─> EventFilterService.compileGroup(group: EventFilterGroup, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:44]
           ↳ Joins a group's compiled parts under its combinator; `null` when empty.
          └─> EventFilterService.compileRule(rule: EventFilterRule, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:76]
             ↳ Compiles one rule by its field, flipping it when the rule is negated.
            └─> EventFilterNumbersService.compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:115]
               ↳ Compiles a numeric rule on a number-named tag root: events with a tag beneath it meeting the comparison; `neq` and…
              └─> EventFilterNumbersService.compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:67]
                 ↳ Compiles a numeric comparison over a SQL expression. Answers `null` for unusable operands.
                └─> EventFilterNumbersService.isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:162]
                   ↳ Whether an operator compares a number with a range of two.
```

**2. `EventsResolver.presets`** — depth 9 · decorated-method

```text
🚀 EventsResolver.presets(): Promise<PresetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:124]
   ↳ The named presets.
  └─> EventsService.findPresets(): Promise<ResolvedPreset[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:163]
     ↳ The named presets resolved against the tags the whole dataset has, in menu order.
    └─> EventsService.findFacets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:123]
       ↳ Every tag root and its tags, counting events in the period and filter.
      └─> EventFilterService.compile(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:153]
         ↳ Compiles the filter tree to boolean SQL, numbering placeholders after `offset`.
        └─> EventFilterService.compileGroup(group: EventFilterGroup, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:44]
           ↳ Joins a group's compiled parts under its combinator; `null` when empty.
          └─> EventFilterService.compileRule(rule: EventFilterRule, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:76]
             ↳ Compiles one rule by its field, flipping it when the rule is negated.
            └─> EventFilterNumbersService.compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:115]
               ↳ Compiles a numeric rule on a number-named tag root: events with a tag beneath it meeting the comparison; `neq` and…
              └─> EventFilterNumbersService.compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:67]
                 ↳ Compiles a numeric comparison over a SQL expression. Answers `null` for unusable operands.
                └─> EventFilterNumbersService.isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:162]
                   ↳ Whether an operator compares a number with a range of two.
```

**3. `NightSkyResolver.nightSky`** — depth 9 · decorated-method

```text
🚀 NightSkyResolver.nightSky(input: NightSkyInput): NightSkyEntity [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.resolver.ts:24]
   ↳ The night sky for a place and a window size.
  └─> NightSkyService.build(input: NightSkyInput): NightSky [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:84]
     ↳ Builds the sky for a query from memory, caching by snapped input.
    └─> NightSkyService.draw(input: ParsedNightSkyInput): NightSky [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:49]
       ↳ Draws the sky for a snapped input.
      └─> NightSkySvgService.build(options: NightSkyOptions): NightSky [projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-svg.service.ts:102]
         ↳ Builds the sky for a place and moment; the stars turn as one group about the celestial pole.
        └─> NightSkyStarsService.select(geometry: SkyGeometry, options: ResolvedNightSkyOptions): SelectedStars [projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:179]
           ↳ Draws the stars bright enough and on rings that cross the window.
          └─> NightSkyStarsService.map(…)(star: StarRow): RenderedStar | undefined [projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:187]
            └─> NightSkyStarsService.renderStar(…): RenderedStar | undefined [projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:94]
               ↳ Draws one star, or returns nothing when its ring never crosses the window.
              └─> NightSkyProjectionService.project(…): ProjectedPoint [projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-projection.service.ts:55]
                 ↳ Projects a point of the sky about the north celestial pole with a stereographic projection.
                └─> NightSkyProjectionService.tangentOfHalfAngle(degrees: number): number [projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-projection.service.ts:96]
                   ↳ The tangent of half an angle given in degrees, as the projection needs.
```

<details>
<summary>8 more call stacks</summary>

**4. `EventsResolver.events`** — depth 8 · decorated-method

```text
🚀 EventsResolver.events(…): Promise<CalendarEventEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:69]
   ↳ The events that overlap a period and meet a filter.
  └─> EventsService.findEvents(…): Promise<CalendarEventEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:77]
     ↳ Events overlapping the period and meeting the filter, earliest first, with their tags and group keys.
    └─> EventFilterService.compile(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:153]
       ↳ Compiles the filter tree to boolean SQL, numbering placeholders after `offset`.
      └─> EventFilterService.compileGroup(group: EventFilterGroup, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:44]
         ↳ Joins a group's compiled parts under its combinator; `null` when empty.
        └─> EventFilterService.compileRule(rule: EventFilterRule, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:76]
           ↳ Compiles one rule by its field, flipping it when the rule is negated.
          └─> EventFilterNumbersService.compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:115]
             ↳ Compiles a numeric rule on a number-named tag root: events with a tag beneath it meeting the comparison; `neq` and…
            └─> EventFilterNumbersService.compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:67]
               ↳ Compiles a numeric comparison over a SQL expression. Answers `null` for unusable operands.
              └─> EventFilterNumbersService.isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:162]
                 ↳ Whether an operator compares a number with a range of two.
```

**5. `EventsResolver.facets`** — depth 8 · decorated-method

```text
🚀 EventsResolver.facets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:100]
   ↳ The tag facets, counted over a period.
  └─> EventsService.findFacets(…): Promise<EventFacetEntity[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:123]
     ↳ Every tag root and its tags, counting events in the period and filter.
    └─> EventFilterService.compile(…): CompiledEventFilter | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:153]
       ↳ Compiles the filter tree to boolean SQL, numbering placeholders after `offset`.
      └─> EventFilterService.compileGroup(group: EventFilterGroup, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:44]
         ↳ Joins a group's compiled parts under its combinator; `null` when empty.
        └─> EventFilterService.compileRule(rule: EventFilterRule, parameters: EventFilterParameters): null | string [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:76]
           ↳ Compiles one rule by its field, flipping it when the rule is negated.
          └─> EventFilterNumbersService.compileTagNumberRule(…): string | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:115]
             ↳ Compiles a numeric rule on a number-named tag root: events with a tag beneath it meeting the comparison; `neq` and…
            └─> EventFilterNumbersService.compileNumberCondition(…): NumberCondition | null [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:67]
               ↳ Compiles a numeric comparison over a SQL expression. Answers `null` for unusable operands.
              └─> EventFilterNumbersService.isRangeOperator(operator: string): boolean [projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:162]
                 ↳ Whether an operator compares a number with a range of two.
```

**6. `EventsResolver.windows`** — depth 5 · decorated-method

```text
🚀 EventsResolver.windows(args: WindowsArguments): WindowsEntity [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:136]
   ↳ The days a view shows and the period to read events for.
  └─> EventsService.findWindows(args: WindowsArguments): Windows [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:171]
     ↳ The days a calendar view or a timeline scale shows around a day, and the period of events to read for them.
    └─> WindowsService.getWindows(…): Windows [projects/caelundas/caelundas-api/src/modules/events/modules/windows/windows.service.ts:145]
       ↳ The days a view shows, and the period read for them, with a day's buffer either side.
      └─> WindowsService.getTimelineDays(scale: TimelineScale, anchor: Date): Period [projects/caelundas/caelundas-api/src/modules/events/modules/windows/windows.service.ts:29]
         ↳ The timeline axis span at a scale, with quarters widened to whole weeks.
        └─> WindowsService.startOfDay(anchor: Date): Date [projects/caelundas/caelundas-api/src/modules/events/modules/windows/windows.service.ts:131]
           ↳ The UTC midnight that starts the day an instant falls on.
```

**7. `EventsResolver.dataset`** — depth 4 · decorated-method

```text
🚀 EventsResolver.dataset(): Promise<EventsDatasetEntity | null> [projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:41]
   ↳ The span and zone of the whole dataset.
  └─> EventsService.describeDataset(): Promise<EventsDatasetEntity | null> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:67]
     ↳ The span and zone of the whole dataset, or null when it holds no event.
    └─> EventsService.select(…): Promise<Row[]> [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:182]
       ↳ Runs one statement and parses each row with `schema`, failing on unexpected shapes.
      └─> EventsService.map(…)(row: unknown): Row [projects/caelundas/caelundas-api/src/modules/events/events.service.ts:189]
```

**8. `HealthResolver.health`** — depth 2 · decorated-method

```text
🚀 HealthResolver.health(): boolean [projects/caelundas/caelundas-api/src/modules/health/health.resolver.ts:22]
   ↳ Health check query.
  └─> HealthService.isHealthy(): boolean [projects/caelundas/caelundas-api/src/modules/health/health.service.ts:23]
     ↳ Returns true if the service is operational.
```

**9. `NightSkyService.onModuleInit`** — depth 2 · lifecycle

```text
🚀 NightSkyService.onModuleInit(): Promise<void> [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:111]
   ↳ Reads the stars and constellation figures from the database, and sorts the stars brightest first, which is the order…
  └─> NightSkyService.flatMap(…)(…): { from: [number, number]; name: string; to: [number, number]; zodiac: boolean; }[] [projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:120]
```

**10. `transform(…)`** — depth 2 · orphan-root

```text
🚀 transform(…)(origins: string): string[] [projects/caelundas/caelundas-api/src/caelundas-api.constants.ts:13]
  └─> filter(…)(origin: string): boolean [projects/caelundas/caelundas-api/src/caelundas-api.constants.ts:17]
```

**11. `bootstrap`** — depth 2 · orphan-root

```text
🚀 bootstrap(): Promise<void> [projects/caelundas/caelundas-api/src/caelundas-api.ts:16]
   ↳ Bootstraps the NestJS GraphQL API application.
  └─> CorsService.getOptions(origins: string[]): CorsOptions [projects/caelundas/caelundas-api/src/cors.service.ts:14]
     ↳ Builds the CORS options from the allowed origins: `*` allows every origin, otherwise only the listed ones are echoed…
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `EventFilterCalendarFieldsService.compileCalendarRule` | 10 | `EventFilterCalendarFieldsService.compileDateRule`, `EventFilterValuesService.readDateRange`, `EventFilterCalendarFieldsService.compileDurationRule`, `EventFilterValuesService.readTexts`, `EventFilterCalendarFieldsService.compileHourRule`, `EventFilterValuesService.readIntegerRange`, `EventFilterCalendarFieldsService.compileTemporalityRule`, `EventFilterCalendarFieldsService.compileTextRule`, `EventFilterCalendarFieldsService.compileWeekdayRule`, `EventFilterValuesService.readIntegers` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:200` |
| `NightSkySvgService.build` | 8 | `NightSkyOptionsService.withDefaults`, `NightSkyViewService.computeGeometry`, `NightSkyStarsService.select`, `NightSkyViewService.computeMotion`, `NightSkyViewService.buildViewport`, `NightSkyLinesService.formatConstellationLines`, `NightSkySvgService.assemble`, `NightSkyEclipticService.formatEcliptic` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-svg.service.ts:102` |
| `EventFilterService.compileRule` | 7 | `EventFilterNumbersService.isNumberOperator`, `EventFilterNumbersService.compileTagNumberRule`, `EventFilterService.compileTagRule`, `EventFilterValuesService.readTexts`, `EventFilterNumbersService.isCalendarNumberRule`, `EventFilterNumbersService.compileCalendarNumberRule`, `EventFilterCalendarFieldsService.compileCalendarRule` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:76` |

<details>
<summary>87 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `EventsService.findEvents` | 7 | `EventFilterService.compile`, `EventGroupingService.compile`, `EventsService.select`, `EventsService.replace(…)`, `EventsService.replace(…)`, `EventsService.toIsoString`, `EventsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:77` |
| `EventGroupingService.compileGroupLevel` | 5 | `EventGroupingService.filter(…)`, `EventGroupingService.replace(…)`, `EventFilterParametersService.bind`, `EventGroupingService.find(…)`, `EventGroupingService.replace(…)` | `projects/caelundas/caelundas-api/src/modules/events/modules/grouping/event-grouping.service.ts:39` |
| `EventFilterNumbersService.compileNumberCondition` | 4 | `EventFilterNumbersService.isRangeOperator`, `EventFilterValuesService.readNumberRange`, `EventFilterValuesService.readSingleNumber`, `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:67` |
| `EventFilterNumbersService.compileTagNumberRule` | 4 | `EventFilterNumbersService.compileNumberCondition`, `EventFilterParametersService.bind`, `EventFilterNumbersService.replace(…)`, `EventFilterNumbersService.replace(…)` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:115` |
| `WindowsService.getWindows` | 4 | `WindowsService.joinPeriods`, `WindowsService.getTimelineDays`, `WindowsService.getVisibleDays`, `WindowsService.shiftDays` | `projects/caelundas/caelundas-api/src/modules/events/modules/windows/windows.service.ts:145` |
| `EventsService.findFacets` | 4 | `EventFilterService.compile`, `EventsService.select`, `EventsService.replace(…)`, `EventsService.toIsoString` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:123` |
| `NightSkyEclipticService.formatEcliptic` | 4 | `NightSkyProjectionService.splitIntoRuns`, `NightSkyEclipticService.trace`, `NightSkyColorsService.readColor`, `NightSkyEclipticService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-ecliptic.service.ts:46` |
| `NightSkyLinesService.formatConstellationLines` | 4 | `NightSkyLinesService.filter(…)`, `NightSkyLinesService.map(…)`, `NightSkyLinesService.formatStroke`, `NightSkyLinesService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-lines.service.ts:108` |
| `NightSkyStarsService.renderStar` | 4 | `NightSkyProjectionService.project`, `NightSkyProjectionService.isOnVisibleRing`, `NightSkyStarsService.starRadius`, `NightSkyStarsService.colorBucketOf` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:94` |
| `NightSkyOptionsService.withDefaults` | 4 | `NightSkyOptionsService.fillAppearance`, `NightSkyOptionsService.fillView`, `NightSkyOptionsService.fillLineStyle`, `NightSkyOptionsService.fillEcliptic` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-options.service.ts:109` |
| `NightSkySvgService.assemble` | 4 | `NightSkySvgService.formatSpin`, `NightSkyStarsService.formatGlowGroup`, `NightSkyStarsService.formatStarGroups`, `NightSkyColorsService.formatSkyDefinitions` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-svg.service.ts:53` |
| `EventsResolver.events` | 3 | `EventsService.findEvents`, `EventFilterService.parse`, `EventGroupingService.parse` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:69` |
| `NightSkyProjectionService.splitIntoRuns` | 3 | `NightSkyProjectionService.project`, `NightSkyProjectionService.isOnVisibleRing`, `NightSkyProjectionService.filter(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-projection.service.ts:74` |
| `NightSkyStarsService.select` | 3 | `NightSkyStarsService.filter(…)`, `NightSkyStarsService.filter(…)`, `NightSkyStarsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:179` |
| `NightSkyInputService.createInputSchema` | 3 | `NightSkyInputService.color`, `NightSkyInputService.transform(…)`, `NightSkyInputService.default(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:49` |
| `NightSkyService.draw` | 3 | `NightSkySvgService.build`, `NightSkyInputService.selectConstellationSegments`, `NightSkySiderealTimeService.startingDegrees` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:49` |
| `NightSkyService.build` | 3 | `NightSkyInputService.snap`, `NightSkyInputService.parse`, `NightSkyService.draw` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:84` |
| `NightSkyService.onModuleInit` | 3 | `NightSkyService.flatMap(…)`, `NightSkyService.toSorted(…)`, `NightSkyService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.service.ts:111` |
| `transform(…)` | 2 | `filter(…)`, `map(…)` | `projects/caelundas/caelundas-api/src/caelundas-api.constants.ts:13` |
| `EventFilterCalendarFieldsService.compileDurationRule` | 2 | `EventFilterCalendarFieldsService.filter(…)`, `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:65` |
| `EventFilterService.compileTagRule` | 2 | `EventFilterService.replace(…)`, `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:117` |
| `WindowsService.getTimelineDays` | 2 | `WindowsService.startOfDay`, `WindowsService.shiftDays` | `projects/caelundas/caelundas-api/src/modules/events/modules/windows/windows.service.ts:29` |
| `WindowsService.getVisibleDays` | 2 | `WindowsService.startOfDay`, `WindowsService.shiftDays` | `projects/caelundas/caelundas-api/src/modules/events/modules/windows/windows.service.ts:71` |
| `EventsService.findPresets` | 2 | `PresetsService.resolve`, `EventsService.findFacets` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:163` |
| `EventsResolver.defaultPreset` | 2 | `EventsService.findPresets`, `EventsResolver.find(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:54` |
| `EventsResolver.facets` | 2 | `EventsService.findFacets`, `EventFilterService.parse` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:100` |
| `NightSkyLinesService.interpolate` | 2 | `NightSkyLinesService.toVector`, `NightSkyLinesService.from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-lines.service.ts:57` |
| `NightSkyLinesService.map(…)` | 2 | `NightSkyProjectionService.splitIntoRuns`, `NightSkyLinesService.interpolate` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-lines.service.ts:114` |
| `NightSkyStarsService.colorFromIndex` | 2 | `NightSkyStarsService.find(…)`, `NightSkyStarsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:60` |
| `NightSkyViewService.computeGeometry` | 2 | `NightSkyViewService.limitFieldOfView`, `NightSkyProjectionService.tangentOfHalfAngle` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-view.service.ts:137` |
| `NightSkyInputService.transform(…)` | 2 | `NightSkyInputService.filter(…)`, `NightSkyInputService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:64` |
| `bootstrap` | 2 | `CorsService.getOptions`, `registerShutdownHandler(…)` | `projects/caelundas/caelundas-api/src/caelundas-api.ts:16` |
| `HealthResolver.health` | 1 | `HealthService.isHealthy` | `projects/caelundas/caelundas-api/src/modules/health/health.resolver.ts:22` |
| `EventFilterValuesService.readIntegerRange` | 1 | `EventFilterValuesService.readInteger` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-values.service.ts:45` |
| `EventFilterValuesService.readIntegers` | 1 | `EventFilterValuesService.readInteger` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-values.service.ts:68` |
| `EventFilterValuesService.readTexts` | 1 | `EventFilterValuesService.filter(…)` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-values.service.ts:124` |
| `EventFilterCalendarFieldsService.compileDateRule` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:41` |
| `EventFilterCalendarFieldsService.compileHourRule` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:102` |
| `EventFilterCalendarFieldsService.compileTemporalityRule` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:125` |
| `EventFilterCalendarFieldsService.compileTextRule` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:148` |
| `EventFilterCalendarFieldsService.compileWeekdayRule` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/query-building/event-filter-calendar-fields.service.ts:177` |
| `EventFilterNumbersService.compileCalendarNumberRule` | 1 | `EventFilterNumbersService.compileNumberCondition` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:45` |
| `EventFilterNumbersService.isCalendarNumberRule` | 1 | `EventFilterNumbersService.isNumberOperator` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:139` |
| `EventFilterNumbersService.isNumberOperator` | 1 | `EventFilterNumbersService.isRangeOperator` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/modules/values/event-filter-numbers.service.ts:153` |
| `EventFilterService.compileGroup` | 1 | `EventFilterService.compileRule` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:44` |
| `EventFilterService.replace(…)` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:134` |
| `EventFilterService.compile` | 1 | `EventFilterService.compileGroup` | `projects/caelundas/caelundas-api/src/modules/events/modules/filtering/event-filter.service.ts:153` |
| `EventGroupingService.replace(…)` | 1 | `EventFilterParametersService.bind` | `projects/caelundas/caelundas-api/src/modules/events/modules/grouping/event-grouping.service.ts:48` |
| `EventGroupingService.compile` | 1 | `EventGroupingService.replace(…)` | `projects/caelundas/caelundas-api/src/modules/events/modules/grouping/event-grouping.service.ts:76` |
| `EventGroupingService.replace(…)` | 1 | `EventGroupingService.compileGroupLevel` | `projects/caelundas/caelundas-api/src/modules/events/modules/grouping/event-grouping.service.ts:85` |
| `PresetsService.resolveGroup` | 1 | `PresetsService.resolveRule` | `projects/caelundas/caelundas-api/src/modules/events/modules/presets/presets.service.ts:26` |
| `PresetsService.resolve` | 1 | `PresetsService.resolveGroup` | `projects/caelundas/caelundas-api/src/modules/events/modules/presets/presets.service.ts:106` |
| `EventsService.describeDataset` | 1 | `EventsService.select` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:67` |
| `EventsService.map(…)` | 1 | `EventsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:101` |
| `EventsService.findWindows` | 1 | `WindowsService.getWindows` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:171` |
| `EventsService.select` | 1 | `EventsService.map(…)` | `projects/caelundas/caelundas-api/src/modules/events/events.service.ts:182` |
| `EventsResolver.dataset` | 1 | `EventsService.describeDataset` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:41` |
| `EventsResolver.presets` | 1 | `EventsService.findPresets` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:124` |
| `EventsResolver.windows` | 1 | `EventsService.findWindows` | `projects/caelundas/caelundas-api/src/modules/events/events.resolver.ts:136` |
| `NightSkyColorsService.formatSkyDefinitions` | 1 | `NightSkyColorsService.readColor` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-colors.service.ts:30` |
| `NightSkyColorsService.readColor` | 1 | `NightSkyColorsService.from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-colors.service.ts:43` |
| `NightSkyProjectionService.formatPolyline` | 1 | `NightSkyProjectionService.map(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-projection.service.ts:35` |
| `NightSkyProjectionService.project` | 1 | `NightSkyProjectionService.tangentOfHalfAngle` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-projection.service.ts:55` |
| `NightSkyEclipticService.map(…)` | 1 | `NightSkyProjectionService.formatPolyline` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-ecliptic.service.ts:58` |
| `NightSkyEclipticService.trace` | 1 | `NightSkyEclipticService.from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-ecliptic.service.ts:81` |
| `NightSkyEclipticService.from(…)` | 1 | `NightSkyEclipticService.toPoint` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-ecliptic.service.ts:82` |
| `NightSkySiderealTimeService.localDegrees` | 1 | `NightSkySiderealTimeService.greenwichMeanHours` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-sidereal-time.service.ts:46` |
| `NightSkySiderealTimeService.startingDegrees` | 1 | `NightSkySiderealTimeService.localDegrees` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/astronomy/night-sky-sidereal-time.service.ts:59` |
| `NightSkyLinesService.formatStroke` | 1 | `NightSkyColorsService.readColor` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-lines.service.ts:44` |
| `NightSkyLinesService.from(…)` | 1 | `NightSkyLinesService.toSkyPoint` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-lines.service.ts:63` |
| `NightSkyLinesService.map(…)` | 1 | `NightSkyProjectionService.formatPolyline` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-lines.service.ts:124` |
| `NightSkyStarsService.formatGlowGroup` | 1 | `NightSkyStarsService.flatMap(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:145` |
| `NightSkyStarsService.formatStarGroups` | 1 | `NightSkyStarsService.from(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:159` |
| `NightSkyStarsService.from(…)` | 1 | `NightSkyStarsService.colorFromIndex` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:171` |
| `NightSkyStarsService.map(…)` | 1 | `NightSkyStarsService.renderStar` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:187` |
| `NightSkyStarsService.filter(…)` | 1 | `NightSkyStarsService.isRendered` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-stars.service.ts:188` |
| `NightSkyViewService.debugViewport` | 1 | `NightSkyViewService.formatDebugOverlay` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-view.service.ts:43` |
| `NightSkyViewService.formatDebugOverlay` | 1 | `NightSkyViewService.formatRing` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-view.service.ts:63` |
| `NightSkyViewService.buildViewport` | 1 | `NightSkyViewService.debugViewport` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/drawing/night-sky-view.service.ts:118` |
| `NightSkyInputService.color` | 1 | `NightSkyInputService.transform(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:37` |
| `NightSkyInputService.transform(…)` | 1 | `NightSkyColorsService.readColor` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:42` |
| `NightSkyInputService.map(…)` | 1 | `NightSkyInputService.toSlug` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:66` |
| `NightSkyInputService.parse` | 1 | `NightSkyInputService.createInputSchema` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:114` |
| `NightSkyInputService.selectConstellationSegments` | 1 | `NightSkyInputService.filter(…)` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:129` |
| `NightSkyInputService.filter(…)` | 1 | `NightSkyInputService.toSlug` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:136` |
| `NightSkyInputService.snap` | 1 | `NightSkyInputService.bucket` | `projects/caelundas/caelundas-api/src/modules/night-sky/modules/options/night-sky-input.service.ts:146` |
| `NightSkyResolver.nightSky` | 1 | `NightSkyService.build` | `projects/caelundas/caelundas-api/src/modules/night-sky/night-sky.resolver.ts:24` |

</details>
<!-- callidescope:end -->
