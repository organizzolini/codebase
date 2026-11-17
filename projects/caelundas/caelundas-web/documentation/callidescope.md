<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 555 |
| Files | 272 |
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
