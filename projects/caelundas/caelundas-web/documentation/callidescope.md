<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/caelundas/caelundas-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 561 |
| Files | 276 |
| Calls traced | 534 |
| Call stacks | 91 |
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
🚀 select(state: { location: { search: Readonly<Record<string, unknown>>; }; }): number [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-opacity/use-night-sky-opacity.ts:13]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:97]
     ↳ Reads the backdrop's settings from the link; a key that does not parse falls back to its default.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:317]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:283]
         ↳ Reads one stroke from the link: `<prefix>Color`, `Opacity` and `Width`, clamped; an unreadable key falls back and is…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:8]
           ↳ Reads a three or six digit hexadecimal color as lowercase `#rrggbb`, or the fallback; a number is never read.
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:19]
```

**2. `select`** — depth 6 · orphan-root

```text
🚀 select(state: { location: { search: Readonly<Record<string, unknown>>; }; }): number [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-opacity/use-night-sky-opacity.ts:18]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:97]
     ↳ Reads the backdrop's settings from the link; a key that does not parse falls back to its default.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:317]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:283]
         ↳ Reads one stroke from the link: `<prefix>Color`, `Opacity` and `Width`, clamped; an unreadable key falls back and is…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:8]
           ↳ Reads a three or six digit hexadecimal color as lowercase `#rrggbb`, or the fallback; a number is never read.
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:19]
```

**3. `select`** — depth 6 · orphan-root

```text
🚀 select(…): NightSkyDrawing [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:40]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:97]
     ↳ Reads the backdrop's settings from the link; a key that does not parse falls back to its default.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:317]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:283]
         ↳ Reads one stroke from the link: `<prefix>Color`, `Opacity` and `Width`, clamped; an unreadable key falls back and is…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:8]
           ↳ Reads a three or six digit hexadecimal color as lowercase `#rrggbb`, or the fallback; a number is never read.
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:19]
```

<details>
<summary>88 more call stacks</summary>

**4. `toggle`** — depth ≥ 6 · orphan-root

```text
🚀 toggle(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:118]
  └─> handleToggle(id: string): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:55]
    └─> toggleTag(…): string[] [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:89]
       ↳ Toggles a tag with everything beneath it, then the tags above follow; picks are the fewest tags that cover them.
      └─> measureTags(items: readonly FilterOption[]): TagShape [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:234]
         ↳ Finds where each tag's own tags end in the depth-first list, and which tags have none.
        └─> readDepth(item: FilterOption): number [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:82]
           ↳ Reads how deep a tag option sits, 0 for one with no depth.
          └─> readData(item: FilterOption): TagOptionData | undefined [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:271]
             ↳ Reads what a tag option carries beyond its label, or nothing for an option of another kind.
```

**5. `FilterTagEditor`** — depth 6 · orphan-root

```text
🚀 FilterTagEditor(properties: Readonly<FilterTagEditorProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/filter-tag-editor.tsx:28]
   ↳ Renders a tag field's value editor: a searchable checkbox tree, where ticking a tag takes all beneath it; Escape closes…
  └─> useTagPicker(properties: Readonly<UseTagPickerProperties>): UseTagPickerResult [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:25]
     ↳ Holds what the tag picker needs from the builder's editor: the tags the rule holds, which are open, and the handlers…
    └─> useState(…)(): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:43]
      └─> findAncestors(items: readonly FilterOption[], ids: readonly unknown[]): Set<string> [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:15]
         ↳ Finds every tag above any of the given tags, so a list opens already showing the tags a rule holds.
        └─> readDepth(item: FilterOption): number [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:82]
           ↳ Reads how deep a tag option sits, 0 for one with no depth.
          └─> readData(item: FilterOption): TagOptionData | undefined [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:271]
             ↳ Reads what a tag option carries beyond its label, or nothing for an option of another kind.
```

**6. `select`** — depth 6 · orphan-root

```text
🚀 select(…): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings.ts:18]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:97]
     ↳ Reads the backdrop's settings from the link; a key that does not parse falls back to its default.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:317]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:283]
         ↳ Reads one stroke from the link: `<prefix>Color`, `Opacity` and `Width`, clamped; an unreadable key falls back and is…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:8]
           ↳ Reads a three or six digit hexadecimal color as lowercase `#rrggbb`, or the fallback; a number is never read.
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:19]
```

**7. `CalendarTimeline`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarTimeline(properties: Readonly<CalendarTimelineProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:87]
   ↳ Renders the events as a Gantt timeline: a row per group, instants as circles, spans as true-length bars, and clustered…
  └─> useMemo(…)(): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:118]
    └─> toTimelineRows(…): TimelineRows [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:53]
       ↳ Lays events out as Gantt rows by a grouping, each group nested under the one above, and counts each row's distinct…
      └─> map(…)(record: CalendarEventRecord): GanttEvent<TimelineBar> [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:61]
        └─> toGanttEvent(record: CalendarEventRecord, rowId: string): GanttEvent<TimelineBar> [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:222]
           ↳ One event drawn in one row: read-only, colored as the data colors it, and carrying its record for the bar to render.
          └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-glyphs/calendar-glyphs.utilities.ts:13]
             ↳ Splits an event's summary into symbols and English name, the name starting where its description says; a cluster is all…
```

**8. `CalendarAgenda`** — depth 6 · orphan-root

```text
🚀 CalendarAgenda(properties: Readonly<CalendarAgendaProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.tsx:51]
   ↳ Renders the agenda: each day's events under a heading, drawn windowed so large ranges scroll smoothly.
  └─> useMemo(…)(): AgendaListRow[] [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.tsx:67]
    └─> toGroupedAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:143]
       ↳ Lays events out as agenda rows in a grouping's groups, counting each group's distinct listed events; with no grouping,…
      └─> toAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:117]
         ↳ Lays events out as agenda rows: a heading per day, then its events, each listed once on its first day.
        └─> getAgendaListing(…): { day: string; ongoing: boolean; } | null [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:195]
           ↳ The day the agenda lists an event under, and whether it was already under way, or `null` if no day lists it.
          └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:39]
             ↳ Writes the zone's calendar day for an instant as `YYYY-MM-DD`, the search parameter's form.
```

**9. `CalendarGrid`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarGrid(properties: Readonly<CalendarGridProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:64]
   ↳ Renders every view but the timeline in the vendored event calendar, under the toolbar it is handed.
  └─> useCalendarClusters(properties: Readonly<UseCalendarClustersProperties>): UseCalendarClustersResult [projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:24]
     ↳ Merges events of one kind that run together for the days the view shows, and holds which cluster is open.
    └─> useMemo(…)(): ClusteredEvents [projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:38]
      └─> getViewWindows(…): ViewWindows [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:55]
         ↳ The view's days as UTC midnights, and the period read around them. With no view, both width defaults are covered.
        └─> getTimelineDays(scale: TimelineScale, anchor: Date): Period [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:132]
           ↳ The timeline's axis days at a scale, from Sunday for weeks and in whole weeks for quarters.
          └─> shiftDays(date: Date, days: number): Date [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:225]
             ↳ An instant a number of whole days later, or earlier for a negative one.
```

**10. `EventsCalendar`** — depth ≥ 6 · orphan-root

```text
🚀 EventsCalendar(properties: Readonly<EventsCalendarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/events-calendar.tsx:103]
   ↳ Renders one toolbar row over the picked view: the timeline as a Gantt, every other view in the event calendar.
  └─> useCalendarNavigation(…): UseCalendarNavigationResult [projects/caelundas/caelundas-web/src/hooks/use-calendar-navigation/use-calendar-navigation.ts:19]
     ↳ Holds the toolbar's navigation in one place above every view, so switching views keeps the focus on its view selector.
    └─> isDayShown(…): boolean [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:88]
       ↳ Whether a day, as `YYYY-MM-DD`, is among those a view shows around the day it opens on.
      └─> getViewWindows(…): ViewWindows [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:55]
         ↳ The view's days as UTC midnights, and the period read around them. With no view, both width defaults are covered.
        └─> getTimelineDays(scale: TimelineScale, anchor: Date): Period [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:132]
           ↳ The timeline's axis days at a scale, from Sunday for weeks and in whole weeks for quarters.
          └─> shiftDays(date: Date, days: number): Date [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:225]
             ↳ An instant a number of whole days later, or earlier for a negative one.
```

**11. `loader`** — depth ≥ 6 · orphan-root

```text
🚀 loader(…): Promise<CalendarData> [projects/caelundas/caelundas-web/src/routes/index.tsx:63]
  └─> loadCalendar(search: CalendarSearch): Promise<CalendarData> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:50]
     ↳ Reads the events in the view's period, plus a buffer, that pass the filter. Reads are cached by period and filter.
    └─> readBasics(…): Promise<{ dataset: EventsDataset | null; defaultFilter: EventFilterQuery | undefined; facets: EventFacet[]; presets: ResolvedPreset[]; }> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:149]
       ↳ Reads the view's facets, plus the dataset and presets, which hold for any period.
      └─> readCached(…)(): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:159]
        └─> findFacets(period?: Period): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:82]
           ↳ Reads every tag root and the tags beneath it, each counting the events that overlap the period, or every event without…
          └─> queryApi(…): Promise<TResult> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:128]
             ↳ Runs a typed GraphQL operation at `VITE_CAELUNDAS_API_URL`, throwing the first error the API reports.
```

**12. `IndexPage`** — depth ≥ 6 · orphan-root

```text
🚀 IndexPage(): ReactNode [projects/caelundas/caelundas-web/src/routes/index.tsx:97]
   ↳ Renders the landing page's heading.
  └─> useMemo(…)(): EventFilterField[] [projects/caelundas/caelundas-web/src/routes/index.tsx:107]
    └─> createEventFilterFields(facets: readonly EventFacet[]): EventFilterField[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:24]
       ↳ Builds the filter fields: one per tag root in the facets, then the derived fields; a root named like one of those is…
      └─> toTagField(facet: EventFacet): EventFilterField [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:89]
         ↳ Builds the field for one tag root.
        └─> isNumericFacet(facet: EventFacet): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:81]
           ↳ Whether every tag beneath a root ends in a number, such as "Harmonic 6", so the root reads as a number to compare.
          └─> every(…)(value: EventFacetValue): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:82]
```

**13. `NightSkyBackdropMount`** — depth ≥ 5 · orphan-root

```text
🚀 NightSkyBackdropMount(properties: Readonly<NightSkyBackdropMountProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-backdrop/night-sky-backdrop-mount.tsx:28]
   ↳ Renders the night sky the link asks for behind the page; draws nothing until the sky is built in the browser.
  └─> useNightSky(): UseNightSkyResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:33]
     ↳ Asks the API for the night sky behind the page as an SVG, keeping the last one until the next arrives.
    └─> useWindowSize(): UseWindowSizeResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-window-size/use-window-size.ts:12]
       ↳ The window's size, read after mount and again once a resize has settled.
      └─> useEffect(…)(): () => void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-window-size/use-window-size.ts:21]
        └─> measure(): void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-window-size/use-window-size.ts:23]
```

**14. `CalendarColorBy`** — depth 5 · orphan-root

```text
🚀 CalendarColorBy(properties: Readonly<CalendarColorByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/calendar-color-by.tsx:39]
   ↳ Renders the Color-by picker: any groupable field, with tags or depth for a tag root, and the legend; the type is the…
  └─> createColorScheme(…): ColorScheme [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:26]
     ↳ Builds how events are colored for a level, a color per tag or value; `index` locates the level's keys in `groups`.
    └─> listTags(field: EventGroupField, level: EventGroupLevel): ColorLegendEntry[] [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:88]
       ↳ The tags a tag root's level colors, each with the next color: those picked, or those at its depth.
      └─> readDepth(item: FilterOption): number [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:82]
         ↳ Reads how deep a tag option sits, 0 for one with no depth.
        └─> readData(item: FilterOption): TagOptionData | undefined [projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:271]
           ↳ Reads what a tag option carries beyond its label, or nothing for an option of another kind.
```

**15. `toggleConstellation`** — depth 5 · orphan-root

```text
🚀 toggleConstellation(…): string[] [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:147]
   ↳ Shows or hides one constellation's figure among those chosen, naming the choice again in its fewest words.
  └─> toggleConstellations(…): string[] [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:158]
     ↳ Shows every constellation of a folder when any is hidden, or hides them all when all show.
    └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:44]
       ↳ The names of the constellations a choice of figures shows.
      └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:53]
        └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:87]
           ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**16. `handleToggle`** — depth ≥ 5 · orphan-root

```text
🚀 handleToggle(names: readonly string[]): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-constellations/night-sky-constellation-picker.tsx:42]
  └─> toggleConstellations(…): string[] [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:158]
     ↳ Shows every constellation of a folder when any is hidden, or hides them all when all show.
    └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:44]
       ↳ The names of the constellations a choice of figures shows.
      └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:53]
        └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:87]
           ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**17. `EventGlyphs`** — depth 5 · orphan-root

```text
🚀 EventGlyphs(properties: Readonly<EventGlyphsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/event-glyphs.tsx:24]
   ↳ Draws an event's symbols as icons, one per symbol in order; a symbol with no icon is drawn as written.
  └─> toGlyphParts(glyphs: string, name?: string): GlyphPart[] [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:19]
     ↳ Splits an event's symbols into icons, one per symbol in order, and text for what has no icon.
    └─> appendSymbol(parts: GlyphPart[], chars: readonly string[], index: number): number [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:40]
       ↳ Adds the symbol at an index to the parts, as its icons or as text, and answers how many characters it took.
      └─> readSymbol(…): { icons: { file: string; url: string; }[]; length: number; } | undefined [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:121]
         ↳ Reads the symbol at an index: its icons and character count, or `undefined` when it has no icon among the files.
        └─> findSymbolFiles(…): { files: readonly (string | undefined)[]; length: number; } [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:76]
           ↳ The files a symbol at an index is drawn with, and how many characters it takes.
```

**18. `CalendarOverflowList`** — depth 5 · orphan-root

```text
🚀 CalendarOverflowList(properties: Readonly<CalendarOverflowListProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-overflow-list/calendar-overflow-list.tsx:39]
   ↳ Renders a month cell's "+N more" day as a list drawing only the rows on screen.
  └─> useMemo(…)(…): { group?: string | undefined; kind: "event"; ongoing: boolean; record: CalendarEventRecord; }[] [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-overflow-list/calendar-overflow-list.tsx:48]
    └─> toAgendaRows(…): AgendaRow[] [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:117]
       ↳ Lays events out as agenda rows: a heading per day, then its events, each listed once on its first day.
      └─> getAgendaListing(…): { day: string; ongoing: boolean; } | null [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:195]
         ↳ The day the agenda lists an event under, and whether it was already under way, or `null` if no day lists it.
        └─> formatCalendarDate(date: Date, timeZone: string): string [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:39]
           ↳ Writes the zone's calendar day for an instant as `YYYY-MM-DD`, the search parameter's form.
```

**19. `CalendarFilters`** — depth ≥ 5 · orphan-root

```text
🚀 CalendarFilters(properties: Readonly<CalendarFiltersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/calendar-filters.tsx:52]
   ↳ Renders the active filters as chips and the Filters button; edits show at once and only query-changing ones are written…
  └─> countActiveEventFilterRules(node: EventFilterNode): number [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.utilities.ts:10]
     ↳ Counts the rules in a tree that are finished, which are the ones the query applies, however deeply they are nested.
    └─> toEventFilterInput(node: EventFilterNode | undefined): EventFilterGroupInput | null [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:16]
       ↳ Writes the filter tree as the API's filter input, leaving out unfinished rules and empty groups; an empty tree answers…
      └─> toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:81]
         ↳ Writes one rule, or answers `null` while it is not finished: a range needs both its ends.
        └─> toRuleValues(value: EventFilterValue | undefined): string[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:105]
           ↳ Writes the values a rule holds as text, dropping the empty ones.
```

**20. `shouldReload`** — depth 5 · orphan-root

```text
🚀 shouldReload(…): boolean [projects/caelundas/caelundas-web/src/routes/index.tsx:58]
  └─> getCalendarReloadKey(search: Readonly<Record<string, unknown>>): string [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:24]
     ↳ The loader's result depends on the calendar's own search, so the route reloads for a calendar change, not a sky one.
    └─> readCalendarSearch(search: Readonly<Record<string, unknown>>): CalendarSearch [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:33]
       ↳ Reads the calendar's own search parameters, leaving out the backdrop's, so a sky change does not re-render the page.
      └─> parseGrouping(value: unknown): EventGrouping | undefined [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:93]
         ↳ Reads a grouping from the link, dropping unparsable levels and keeping at most the levels a grouping nests.
        └─> flatMap(…)(…): never[] | { field: string; depth?: number | undefined; tags?: string[] | undefined; } [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:96]
```

**21. `GroupLevelRow`** — depth 4 · orphan-root

```text
🚀 GroupLevelRow(properties: Readonly<GroupLevelRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.tsx:46]
   ↳ Draws one grouping level like a filter: its field, what it goes by, and a button that removes it, with the tag tree…
  └─> describeTags(field: EventGroupField, level: EventGroupLevel): string [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.utilities.ts:11]
     ↳ Names what a level goes by: its picked tags, or else the tree level, the first unless an older link says otherwise.
    └─> flatMap(…)(this: undefined, tag: string): string[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.utilities.ts:23]
      └─> find(…)(candidate: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.utilities.ts:24]
```

**22. `NightSkyConstellationPicker`** — depth 4 · orphan-root

```text
🚀 NightSkyConstellationPicker(properties: Readonly<NightSkyConstellationPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-constellations/night-sky-constellation-picker.tsx:30]
   ↳ Renders which constellations' figures the sky draws: a tree of folders in a list that scrolls on its own.
  └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:44]
     ↳ The names of the constellations a choice of figures shows.
    └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:53]
      └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:87]
         ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**23. `CalendarGroupBy`** — depth 4 · orphan-root

```text
🚀 CalendarGroupBy(properties: Readonly<CalendarGroupByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:34]
   ↳ Renders the grouping's levels, each a field and what to group it by; a tag root opens its tag tree.
  └─> useMemo(…)(): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:40]
    └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities.ts:25]
       ↳ The fields events group by: one per tag root in facet order, then the periods and duration derived from each event.
      └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:71]
         ↳ What a tag root means: its own description, or one derived from its name for a root added to the data.
```

**24. `measure`** — depth ≥ 4 · orphan-root

```text
🚀 measure(): void [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:108]
  └─> getVisibleTimelineRows(…): ReadonlySet<string> | null [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-window/calendar-timeline-window.utilities.ts:18]
     ↳ Ids of rows on screen plus a few beyond each edge; `null` until laid out, when every row counts as visible.
    └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts:25]
       ↳ Picks the rows shown for a scroll position, plus overscan on each side, found by binary search over the offsets.
      └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts:54]
         ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**25. `handleQueryChange`** — depth ≥ 4 · orphan-root

```text
🚀 handleQueryChange(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:41]
  └─> toEventFilterInput(node: EventFilterNode | undefined): EventFilterGroupInput | null [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:16]
     ↳ Writes the filter tree as the API's filter input, leaving out unfinished rules and empty groups; an empty tree answers…
    └─> toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:81]
       ↳ Writes one rule, or answers `null` while it is not finished: a range needs both its ends.
      └─> toRuleValues(value: EventFilterValue | undefined): string[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:105]
         ↳ Writes the values a rule holds as text, dropping the empty ones.
```

**26. `PresetPicker`** — depth 4 · orphan-root

```text
🚀 PresetPicker(properties: Readonly<PresetPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/preset-picker/preset-picker.tsx:36]
   ↳ Renders a dropdown of presets, showing the one the filter tree matches, else All events, or Custom for an edit.
  └─> toEventFilterInput(node: EventFilterNode | undefined): EventFilterGroupInput | null [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:16]
     ↳ Writes the filter tree as the API's filter input, leaving out unfinished rules and empty groups; an empty tree answers…
    └─> toRuleInput(rule: EventFilterRule): EventFilterRuleInput | null [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:81]
       ↳ Writes one rule, or answers `null` while it is not finished: a range needs both its ends.
      └─> toRuleValues(value: EventFilterValue | undefined): string[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:105]
         ↳ Writes the values a rule holds as text, dropping the empty ones.
```

**27. `close`** — depth ≥ 3 · orphan-root

```text
🚀 close(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:108]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:65]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:66]
```

**28. `open`** — depth ≥ 3 · orphan-root

```text
🚀 open(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:115]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:65]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:66]
```

**29. `colorOf`** — depth 3 · orphan-root

```text
🚀 colorOf(event: CalendarEventRecord): string | null [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:48]
  └─> hashColor(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:73]
     ↳ The color of a key from its own text, for a value with no place in a legend.
    └─> pickColor(position: number): string [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:153]
       ↳ The color at a position in the palette, which starts over after its last.
```

**30. `NightSkyConstellationFolder`** — depth 3 · orphan-root

```text
🚀 NightSkyConstellationFolder(properties: Readonly<NightSkyConstellationFolderProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-constellations/night-sky-constellation-folder.tsx:35]
   ↳ Renders one folder of the constellation picker: a chevron to open it, a checkbox toggling all its constellations, and…
  └─> readFolderState(shown: ReadonlySet<string>, names: readonly string[]): FolderState [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:65]
     ↳ Whether a folder's constellations all show, some do, or none.
    └─> filter(…)(name: string): boolean [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:69]
```

**31. `NightSkySlider`** — depth 3 · orphan-root

```text
🚀 NightSkySlider(properties: Readonly<NightSkySliderProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-slider.tsx:34]
   ↳ Renders one night sky number as a labeled slider showing its value and unit; it sends every step as it moves.
  └─> formatSliderValue(value: number, control: SkySliderControl): string [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:23]
     ↳ A slider's value with its unit, rounded to its step.
    └─> roundToStep(value: number, step: number): number [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:96]
       ↳ Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes `0.3` to the link.
```

**32. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: number | readonly number[]): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-slider.tsx:67]
  └─> readSliderValue(…): number [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:82]
     ↳ A slider's moved value, rounded to its step, or the value it had for anything it cannot read.
    └─> roundToStep(value: number, step: number): number [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:96]
       ↳ Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes `0.3` to the link.
```

**33. `handleSettingChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleSettingChange(key: SkyParameterKey, value: string | number): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-sections/night-sky-lines-section.tsx:50]
  └─> toSkyParameterChange(key: SkyParameterKey, value: number | string): SkySearchChange [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:188]
     ↳ The change that writes one setting, or removes it when it is set back to its default, so a link names only what differs.
    └─> isDefault(key: SkyParameterKey, value: number | string): boolean [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:206]
       ↳ Whether a value is its key's default, a color in any case.
```

**34. `NightSkyMenu`** — depth 3 · orphan-root

```text
🚀 NightSkyMenu(properties: Readonly<NightSkyMenuProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:53]
   ↳ Renders the toolbar's Sky menu: each night sky setting, read from and written back to the link as it changes.
  └─> useNightSkySettings(): UseNightSkySettingsResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings.ts:15]
     ↳ The night sky's settings as the link sets them, and how to change the link; controls and link never disagree.
    └─> useCallback(…)(next: Partial<CalendarSearch>): void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings.ts:28]
```

**35. `handleSettingChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleSettingChange(key: SkyParameterKey, value: string | number): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:64]
  └─> toSkyParameterChange(key: SkyParameterKey, value: number | string): SkySearchChange [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:188]
     ↳ The change that writes one setting, or removes it when it is set back to its default, so a link names only what differs.
    └─> isDefault(key: SkyParameterKey, value: number | string): boolean [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:206]
       ↳ Whether a value is its key's default, a color in any case.
```

**36. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:117]
  └─> toResetChange(): SkySearchChange [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:180]
     ↳ The change the Default button makes: every key the menu sets, removed.
    └─> map(…)(key: SkyParameterKey): [SkyParameterKey, undefined] [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:181]
```

**37. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:86]
  └─> replaceLevel(index: number, level: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:50]
    └─> flatMap(…)(this: undefined, current: EventGroupLevel, position: number): EventGroupLevel[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:52]
```

**38. `CalendarViewOptions`** — depth 3 · orphan-root

```text
🚀 CalendarViewOptions(properties: Readonly<CalendarViewOptionsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-options/calendar-view-options.tsx:42]
   ↳ Renders the View menu's arrangement of the view: Group by for agenda and timeline, and Scale for the timeline; nothing…
  └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities.ts:25]
     ↳ The fields events group by: one per tag root in facet order, then the periods and duration derived from each event.
    └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:71]
       ↳ What a tag root means: its own description, or one derived from its name for a root added to the data.
```

**39. `SkeletonBody`** — depth 3 · orphan-root

```text
🚀 SkeletonBody(properties: Readonly<SkeletonBodyProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/skeleton-body.tsx:29]
   ↳ Draws the body of the skeleton for one view.
  └─> from(…)(_: unknown, column: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/skeleton-body.tsx:93]
    └─> map(…)(height: "h-8" | "h-12" | "h-16", index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/skeleton-body.tsx:99]
```

**40. `readConstants`** — depth 3 · orphan-root

```text
🚀 readConstants(…): Promise<{ dataset: EventsDataset | null; defaultFilter: EventFilterQuery | undefined; presets: ResolvedPreset[]; }> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:205]
   ↳ Reads the dataset and the presets, with the default one's filter, which the API resolved against the data.
  └─> describeDataset(): Promise<EventsDataset | null> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:42]
     ↳ Reads the span and zone of the whole dataset, or nothing when it is empty.
    └─> queryApi(…): Promise<TResult> [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:128]
       ↳ Runs a typed GraphQL operation at `VITE_CAELUNDAS_API_URL`, throwing the first error the API reports.
```

**41. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:100]
  └─> handleValueChange(values: readonly unknown[]): void [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:67]
    └─> parseCalendarView(value: unknown): CalendarViewName | undefined [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-views/calendar-views.utilities.ts:22]
       ↳ Reads a value as a view, or nothing when it names none, such as a stale link's or an unpressed toggle's.
```

**42. `VirtualList`** — depth ≥ 3 · orphan-root

```text
🚀 VirtualList<Row>(properties: Readonly<VirtualListProperties<Row>>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:51]
   ↳ Renders a vertical list drawing only the rows in view plus a few on each side, with a spacer keeping the scrollbar true.
  └─> useMemo(…)(): number[] [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:71]
    └─> getRowOffsets(heights: readonly number[]): number[] [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts:10]
       ↳ Lays rows of the given heights end to end, returning each row's top and, last, the height of them all.
```

**43. `handleScroll`** — depth ≥ 3 · orphan-root

```text
🚀 handleScroll(event: UIEvent<HTMLDivElement>): void [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:87]
  └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts:25]
     ↳ Picks the rows shown for a scroll position, plus overscan on each side, found by binary search over the offsets.
    └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts:54]
       ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**44. `EventTagPills`** — depth 3 · orphan-root

```text
🚀 EventTagPills(properties: Readonly<EventTagPillsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-events/event-tag-pills/event-tag-pills.tsx:21]
   ↳ Draws each tag as a pill tinted in its tree's color, with its path from the root as the title.
  └─> map(…)(tag: CalendarEventTag): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-events/event-tag-pills/event-tag-pills.tsx:46]
    └─> getTagColor(tag: CalendarEventTag): string [projects/caelundas/caelundas-web/src/components/calendar-events/event-tag-pills/calendar-tag-colors.utilities.ts:15]
       ↳ The color of a tag's tree: one per tag root, shared by every tag beneath it; an unknown root takes the next color.
```

**45. `CalendarEventRow`** — depth 3 · orphan-root

```text
🚀 CalendarEventRow(properties: Readonly<CalendarEventRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-event-row/calendar-event-row.tsx:37]
   ↳ Renders one event as a list row: time, color, symbols, name, then its duration and tags as pills.
  └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:37]
     ↳ Names a duration in days, hours and minutes, skipping zero units; "Instant" for no duration.
    └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:50]
```

**46. `handleEventClick`** — depth ≥ 3 · orphan-root

```text
🚀 handleEventClick(occurrence: GanttOccurrence<TimelineBar>): void [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.ts:35]
  └─> describeBar(bar: TimelineBar | undefined): OpenedBar | undefined [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.utilities.ts:14]
     ↳ What opens when a marker is clicked: the events it holds, titled by their count, or by the name of the one event.
    └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-glyphs/calendar-glyphs.utilities.ts:13]
       ↳ Splits an event's summary into symbols and English name, the name starting where its description says; a cluster is all…
```

**47. `GroupFieldPicker`** — depth 2 · orphan-root

```text
🚀 GroupFieldPicker(properties: Readonly<GroupFieldPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-field-picker/group-field-picker.tsx:48]
   ↳ Renders a grouping level's field as the filter renders its attributes: a button opening a searchable list of fields.
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-field-picker/group-field-picker.tsx:70]
```

**48. `handleSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleSelect(picked: string): void [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-field-picker/group-field-picker.tsx:73]
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-field-picker/group-field-picker.tsx:74]
```

**49. `handleSearchKeyDown`** — depth ≥ 2 · orphan-root

```text
🚀 handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:78]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:8]
     ↳ Moves focus to the row a number of rows from an element, within its list; from the search box, 0 is the first row.
```

**50. `down`** — depth 2 · orphan-root

```text
🚀 down(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:111]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:8]
     ↳ Moves focus to the row a number of rows from an element, within its list; from the search box, 0 is the first row.
```

**51. `up`** — depth 2 · orphan-root

```text
🚀 up(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:121]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:8]
     ↳ Moves focus to the row a number of rows from an element, within its list; from the search box, 0 is the first row.
```

**52. `GroupTagPicker`** — depth 2 · orphan-root

```text
🚀 GroupTagPicker(properties: Readonly<GroupTagPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-tag-picker/group-tag-picker.tsx:31]
   ↳ Renders the tag tree a level picks its groups from, with the filter's search, folding and counts; each tag ticked is a…
  └─> filter(…)(option: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-tag-picker/group-tag-picker.tsx:44]
```

**53. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(next: EventGroupField): void [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.tsx:83]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities.ts:113]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**54. `duration`** — depth 2 · orphan-root

```text
🚀 duration(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-labels.constants.ts:18]
  └─> find(…)(…): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-labels.constants.ts:19]
```

**55. `week`** — depth 2 · orphan-root

```text
🚀 week(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-labels.constants.ts:37]
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**56. `getEventColor`** — depth 2 · orphan-root

```text
🚀 getEventColor(event: CalendarEventRecord): null | string [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-colors/calendar-colors.utilities.ts:30]
   ↳ The color of an event's kind: that of its kind's rule, or its own color from the data when it has none.
  └─> getEventKind(event: CalendarEventRecord): EventColorRule | null [projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-colors/calendar-colors.utilities.ts:38]
     ↳ The kind of an event: the most specific rule any of its tags falls under, or none when no rule does.
```

**57. `NightSkySliders`** — depth 2 · orphan-root

```text
🚀 NightSkySliders(properties: Readonly<NightSkySlidersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-sliders.tsx:27]
   ↳ Renders one section's sliders in order, each showing its setting.
  └─> map(…)(control: SkySliderControl): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-sliders.tsx:48]
```

**58. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(checked: boolean): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-sections/night-sky-lines-section.tsx:84]
  └─> toEclipticChange(visible: boolean): SkySearchChange [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:139]
     ↳ The change that hides the ecliptic, with `sky.ecliptic=false`, or removes the key to draw it, its default.
```

**59. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(checked: boolean): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:111]
  └─> toVisibilityChange(visible: boolean): SkySearchChange [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:199]
     ↳ The change that shows the sky, by removing `sky`, or hides it with `sky=off`.
```

**60. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(words: string[]): void [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:162]
  └─> toConstellationsChange(words: readonly string[]): SkySearchChange [projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:123]
     ↳ The change that writes a choice of figures: removed for the zodiac, the default, `none` for no figure, and the words…
```

**61. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:97]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities.ts:113]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**62. `CalendarScaleSelect`** — depth 2 · orphan-root

```text
🚀 CalendarScaleSelect(properties: Readonly<CalendarScaleSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-scale-select/calendar-scale-select.tsx:27]
   ↳ Renders one button per timeline scale, from a day of minutes to a year of months, the shown one pressed.
  └─> map(…)(option: "day" | "week" | "month" | "quarter" | "year"): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-scale-select/calendar-scale-select.tsx:49]
```

**63. `OutsideDataset`** — depth 2 · orphan-root

```text
🚀 OutsideDataset(properties: Readonly<OutsideDatasetProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-empty/outside-dataset.tsx:32]
   ↳ Names the dates the data covers and offers to jump to the nearest of them.
  └─> format(date: Date): string [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-empty/outside-dataset.tsx:40]
```

**64. `subscribeToDesktopViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToDesktopViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts:22]
   ↳ Calls back whenever the page crosses the desktop width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**65. `subscribeToViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts:30]
   ↳ Calls back whenever the page crosses the tablet width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**66. `CalendarSkeleton`** — depth 2 · orphan-root

```text
🚀 CalendarSkeleton(properties: Readonly<CalendarSkeletonProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/calendar-skeleton.tsx:33]
   ↳ Renders the shape of the view the page opens on, shown while the events load.
  └─> getDefaultCalendarView(isWide: boolean): CalendarViewName [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-views/calendar-views.utilities.ts:14]
     ↳ The view to show when the link names none: the agenda, which reads at a phone's width, or the whole month on anything…
```

**67. `CalendarViewSelect`** — depth 2 · orphan-root

```text
🚀 CalendarViewSelect(properties: Readonly<CalendarViewSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:48]
   ↳ Renders one pressed button per view on a desktop, or a menu button naming the current view on narrower rows.
  └─> map(…)(…): Element [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:105]
```

**68. `CalendarToolbar`** — depth 2 · orphan-root

```text
🚀 CalendarToolbar(properties: Readonly<CalendarToolbarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-toolbar/calendar-toolbar.tsx:44]
   ↳ Renders the toolbar in two rows over the view's navigation: menus and date on top, filters and view selector beneath.
  └─> hasContent(node: ReactNode): boolean [projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-toolbar/calendar-toolbar.utilities.ts:10]
     ↳ Whether a slot the page handed the toolbar holds anything to draw.
```

**69. `getAgendaRowHeight`** — depth 2 · orphan-root

```text
🚀 getAgendaRowHeight(row: AgendaListRow, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:58]
   ↳ How tall an agenda row is drawn: headings are shorter than events, and an event is as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:89]
     ↳ Height of an event row `width` pixels wide: its name and duration, plus a line per wrapped tag line.
```

**70. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(record: CalendarEventRecord, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-cluster-dialog/calendar-cluster-dialog.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:89]
     ↳ Height of an event row `width` pixels wide: its name and duration, plus a line per wrapped tag line.
```

**71. `CalendarEventTooltip`** — depth 2 · orphan-root

```text
🚀 CalendarEventTooltip(properties: Readonly<CalendarEventTooltipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-event-tooltip/calendar-event-tooltip.tsx:38]
   ↳ Wraps an event's glyphs in a tooltip that follows the pointer, showing its name in English and its tags as pills.
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-glyphs/calendar-glyphs.utilities.ts:13]
     ↳ Splits an event's summary into symbols and English name, the name starting where its description says; a cluster is all…
```

**72. `CalendarEventChip`** — depth 2 · orphan-root

```text
🚀 CalendarEventChip(properties: Readonly<CalendarEventChipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-event-chip/calendar-event-chip.tsx:30]
   ↳ Draws an event as its glyphs, with a tooltip of its name; a screen reader gets the name and description in full.
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-glyphs/calendar-glyphs.utilities.ts:13]
     ↳ Splits an event's summary into symbols and English name, the name starting where its description says; a cluster is all…
```

**73. `TimelineNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 TimelineNavigation(properties: Readonly<TimelineNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-navigation/timeline-navigation.tsx:24]
   ↳ Reports the timeline's own navigation, which only a child of the Gantt can read, to the toolbar above it, and draws…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-navigation/timeline-navigation.tsx:40]
```

**74. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(row: Readonly<{ record: CalendarEventRecord; }>, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-events/calendar-overflow-list/calendar-overflow-list.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:89]
     ↳ Height of an event row `width` pixels wide: its name and duration, plus a line per wrapped tag line.
```

**75. `AgendaRowContent`** — depth 2 · orphan-root

```text
🚀 AgendaRowContent(properties: Readonly<AgendaRowContentProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/agenda-row-content.tsx:35]
   ↳ Draws one agenda row: a group's or a day's heading, an event, or the button that lists later days.
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**76. `CalendarGridNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 CalendarGridNavigation(properties: Readonly<CalendarGridNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid-navigation.tsx:24]
   ↳ Reports the event calendar's own navigation, which only a child of the calendar can read, to the toolbar above it, and…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid-navigation.tsx:40]
```

**77. `handlePresetSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handlePresetSelect(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:51]
  └─> toLinkedEventFilter(query: EventFilterQuery): EventFilterQuery [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.utilities.ts:69]
     ↳ An empty tree is kept, not dropped: a link with no filter opens on the default preset.
```

**78. `handleChange`** — depth ≥ 2 · orphan-root

```text
🚀 handleChange(picked: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-query/preset-picker/preset-picker.tsx:65]
  └─> find(…)(candidate: ResolvedPreset): boolean [projects/caelundas/caelundas-web/src/components/calendar-query/preset-picker/preset-picker.tsx:66]
```

**79. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/calendar-query/filter-date-range-editor/filter-date-range-editor.tsx:76]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/calendar-query/filter-date-range-editor/filter-date-range-editor.tsx:42]
```

**80. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/calendar-query/filter-date-range-editor/filter-date-range-editor.tsx:88]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/calendar-query/filter-date-range-editor/filter-date-range-editor.tsx:42]
```

**81. `FilterChipRow`** — depth 2 · orphan-root

```text
🚀 FilterChipRow(properties: Readonly<FilterChipRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/filter-chip-row/filter-chip-row.tsx:26]
   ↳ Draws one chip per rule of the tree, nested ones included, in a row that wraps; it leaves out the Add filter button.
  └─> map(…)(rule: FilterRule<EventFilterValue>, index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/filter-chip-row/filter-chip-row.tsx:55]
```

**82. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:40]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**83. `handleClustersChange`** — depth 2 · orphan-root

```text
🚀 handleClustersChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:52]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**84. `handleColorByChange`** — depth 2 · orphan-root

```text
🚀 handleColorByChange(color: EventGroupLevel | undefined): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:55]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**85. `handleColorsChange`** — depth 2 · orphan-root

```text
🚀 handleColorsChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:58]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**86. `handleDateChange`** — depth 2 · orphan-root

```text
🚀 handleDateChange(date: Date): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:61]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**87. `handleFilterChange`** — depth 2 · orphan-root

```text
🚀 handleFilterChange(filter: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:64]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**88. `handleGroupingChange`** — depth 2 · orphan-root

```text
🚀 handleGroupingChange(group: EventGrouping): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:67]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**89. `handleScaleChange`** — depth 2 · orphan-root

```text
🚀 handleScaleChange(scale: "day" | "week" | "month" | "quarter" | "year"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:70]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**90. `handleSymbolsChange`** — depth 2 · orphan-root

```text
🚀 handleSymbolsChange(symbols: CalendarSymbols): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:73]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

**91. `handleViewChange`** — depth 2 · orphan-root

```text
🚀 handleViewChange(view: "day" | "week" | "month" | "three-day" | "agenda" | "timeline"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:79]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:24]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `loadCalendar` | 8 | `resolveWindows`, `readBasics`, `toEventFilterInput`, `resolveGroups`, `toEventGroupingInput`, `readCached(…)`, `readCached`, `describeEmptiness` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:50` |
| `CalendarTimeline` | 8 | `useBarDialog`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useCallback(…)`, `useMemo(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:87` |
| `CalendarGrid` | 8 | `useCalendarClusters`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `toEventCalendarView`, `getViewLayout`, `useCallback(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:64` |

<details>
<summary>251 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `toggleTag` | 7 | `findIndex(…)`, `measureTags`, `filter(…)`, `coverLeaves`, `fillFromLeaves`, `numberAt`, `readPicks` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:89` |
| `toTimelineRows` | 7 | `map(…)`, `map(…)`, `buildEventGroups`, `placeGroupRows`, `map(…)`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:53` |
| `readStroke` | 6 | `isHexadecimalColor`, `isFiniteNumber`, `normalizeHexadecimalColor`, `clampNumber`, `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:283` |
| `useNightSky` | 6 | `useWindowSize`, `useSyncExternalStore(…)`, `useMemo(…)`, `useEffect(…)`, `useEffect(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:33` |
| `buildEventGroups` | 6 | `find(…)`, `collectGroups`, `describeGroup`, `map(…)`, `toSorted(…)`, `toGroupNodes` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-tree/event-group-tree.utilities.ts:25` |
| `readNightSkyOverrides` | 5 | `normalizeHexadecimalColor`, `readNumber`, `readConstellationNames`, `readStrokes`, `clampNumber` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:97` |
| `CalendarColorBy` | 5 | `useMemo(…)`, `find(…)`, `toGroupLevel`, `createColorScheme`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/calendar-color-by.tsx:39` |
| `toConstellationWords` | 5 | `every(…)`, `filter(…)`, `every(…)`, `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:218` |
| `readCalendarSearch` | 5 | `normalizeEventFilter`, `parseGrouping`, `parseTimelineScale`, `parseCalendarSymbols`, `parseCalendarView` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:33` |
| `IndexPage` | 5 | `useMemo(…)`, `useMemo(…)`, `getDefaultCalendarView`, `readTimeZone`, `useCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:97` |
| `createEventGroupFields` | 4 | `describeRoot`, `map(…)`, `createTagOptions`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities.ts:25` |
| `getTagStates` | 4 | `measureTags`, `coverLeaves`, `fillFromLeaves`, `numberAt` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:47` |
| `createColorScheme` | 4 | `find(…)`, `map(…)`, `listTags`, `listValues` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:26` |
| `NightSkyConstellationFolder` | 4 | `map(…)`, `readFolderState`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-constellations/night-sky-constellation-folder.tsx:35` |
| `SkeletonBody` | 4 | `map(…)`, `map(…)`, `map(…)`, `from(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/skeleton-body.tsx:29` |
| `getViewWindows` | 4 | `joinPeriods`, `getTimelineDays`, `getVisibleDays`, `shiftDays` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:55` |
| `describeEmptiness` | 4 | `some(…)`, `readCached(…)`, `readCached`, `some(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:97` |
| `useCalendarNavigation` | 4 | `isDayShown`, `formatCalendarDate`, `useMemo(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-navigation/use-calendar-navigation.ts:19` |
| `VirtualList` | 4 | `useMemo(…)`, `getVirtualWindow`, `useEffect(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:51` |
| `CalendarEventRow` | 4 | `getEventLabel`, `formatEventTime`, `formatDuration`, `formatEventSpan` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-event-row/calendar-event-row.tsx:37` |
| `getVisibleTimelineRows` | 4 | `getVirtualWindow`, `getRowOffsets`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-window/calendar-timeline-window.utilities.ts:18` |
| `clusterRow` | 4 | `toSorted(…)`, `collectRun`, `toCluster`, `previewEvents` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-clusters/calendar-timeline-clusters.utilities.ts:56` |
| `clusterEvents` | 4 | `toSorted(…)`, `getRunKey`, `mergeRuns`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:22` |
| `EventsCalendar` | 4 | `useCalendarNavigation`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/events-calendar.tsx:103` |
| `findEvents` | 3 | `queryApi`, `toPeriodInput`, `toEventRecord` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:59` |
| `useEffect(…)` | 3 | `catch(…)`, `then(…)`, `queryApi` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:69` |
| `NightSkyBackdropMount` | 3 | `useNightSky`, `useNightSkyOpacity`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-backdrop/night-sky-backdrop-mount.tsx:28` |
| `toTagField` | 3 | `isNumericFacet`, `describeRoot`, `createTagOptions` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:89` |
| `resolveEventGrouping` | 3 | `find(…)`, `some(…)`, `resolveLevel` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-fields.utilities.ts:89` |
| `toTagTreeRows` | 3 | `readDepth`, `toTagTreeRow`, `countSelectedBelow` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:114` |
| `useTagPicker` | 3 | `useState(…)`, `toTagTreeRows`, `getTagStates` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:25` |
| `GroupLevelRow` | 3 | `find(…)`, `hasTagOptions`, `describeTags` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.tsx:46` |
| `splitConstellations` | 3 | `toSorted(…)`, `filter(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:106` |
| `toggleConstellations` | 3 | `listShownConstellations`, `every(…)`, `toConstellationWords` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:158` |
| `CalendarGroupBy` | 3 | `useMemo(…)`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:34` |
| `toEventFilterInput` | 3 | `toRuleInput`, `pushWritten`, `joinInputs` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:16` |
| `readConstants` | 3 | `describeDataset`, `findPresets`, `toPreset` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:205` |
| `resolveGrouping` | 3 | `createEventGroupFields`, `resolveEventGrouping`, `getDefaultGrouping` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:246` |
| `toGlyphParts` | 3 | `toCharacters`, `readNamedIcon`, `appendSymbol` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:19` |
| `toAgendaRows` | 3 | `getAgendaListing`, `flatMap(…)`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:117` |
| `toGroupedAgendaRows` | 3 | `toAgendaRows`, `filter(…)`, `buildEventGroups` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:143` |
| `measure` | 3 | `getVisibleTimelineRows`, `readRowBoxes`, `readViewport` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:108` |
| `createTimelineLayout` | 3 | `getClusterSpan`, `packTimelineLanes`, `clusterTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-lanes/calendar-timeline-lanes.utilities.ts:21` |
| `mergeRuns` | 3 | `splitRuns`, `getEventKind`, `createStandIn` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:135` |
| `useCalendarClusters` | 3 | `useMemo(…)`, `useCallback(…)`, `find(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:24` |
| `useMemo(…)` | 3 | `filter(…)`, `toAgendaRows`, `getAgendaRange` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-overflow-list/calendar-overflow-list.tsx:48` |
| `useFilterQuery` | 3 | `getDefaultFilter`, `isSameEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:21` |
| `PresetPicker` | 3 | `toEventFilterInput`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/preset-picker/preset-picker.tsx:36` |
| `CalendarFilters` | 3 | `useFilterQuery`, `countActiveEventFilterRules`, `renderFiltersButton` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/calendar-filters.tsx:52` |
| `loader` | 3 | `getCalendarReloadKey`, `loadCalendar`, `validateCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:63` |
| `describeNightSkyProblems` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:30` |
| `findUnknownConstellationNames` | 2 | `normalizeConstellationName`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:48` |
| `readConstellationNames` | 2 | `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:256` |
| `findFacets` | 2 | `queryApi`, `toPeriodInput` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:82` |
| `select` | 2 | `toNightSkyDrawing`, `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:40` |
| `useEffect(…)` | 2 | `describeNightSkyProblems`, `findUnknownConstellationNames` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:104` |
| `measureTags` | 2 | `readDepth`, `numberAt` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:234` |
| `toTagTreeRow` | 2 | `readDepth`, `readName` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:323` |
| `handleToggle` | 2 | `toggleTag`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:55` |
| `FilterTagEditor` | 2 | `useTagPicker`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/filter-tag-editor.tsx:28` |
| `describeEvent` | 2 | `map(…)`, `formatDuration` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:14` |
| `formatDuration` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:37` |
| `colorOf` | 2 | `some(…)`, `hashColor` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:48` |
| `listTags` | 2 | `readDepth`, `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:88` |
| `listValues` | 2 | `formatDerivedKey`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:116` |
| `listShownConstellations` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:44` |
| `NightSkyConstellationPicker` | 2 | `listShownConstellations`, `splitConstellations` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-constellations/night-sky-constellation-picker.tsx:30` |
| `NightSkyMenu` | 2 | `useNightSkySettings`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:53` |
| `CalendarViewOptions` | 2 | `createEventGroupFields`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-options/calendar-view-options.tsx:42` |
| `readBasics` | 2 | `readCached(…)`, `readCached` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:149` |
| `resolveColorBy` | 2 | `resolveEventGrouping`, `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:233` |
| `resolveGroups` | 2 | `resolveColorBy`, `resolveGrouping` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:267` |
| `resolveWindows` | 2 | `parseCalendarDate`, `findViewWindows` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:284` |
| `CalendarViewSelect` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:48` |
| `useMemo(…)` | 2 | `getRowOffsets`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:71` |
| `handleScroll` | 2 | `getVirtualWindow`, `setAnswered(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:87` |
| `appendSymbol` | 2 | `readSymbol`, `appendText` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:40` |
| `readSymbol` | 2 | `findSymbolFiles`, `toIcons` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:121` |
| `EventGlyphs` | 2 | `toGlyphParts`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/event-glyphs.tsx:24` |
| `describeGroup` | 2 | `formatDerivedKey`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-tree/event-group-tree.utilities.ts:106` |
| `packTimelineLanes` | 2 | `assignLanes`, `addLaneRows` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-lanes/calendar-timeline-lanes.utilities.ts:37` |
| `assignLanes` | 2 | `toSorted(…)`, `findIndex(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-lanes/calendar-timeline-lanes.utilities.ts:102` |
| `useEffect(…)` | 2 | `watchVisibleRows(…)`, `watchVisibleRows` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:149` |
| `getRunKey` | 2 | `getEventKind`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:106` |
| `useMemo(…)` | 2 | `getViewWindows`, `clusterEvents` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/use-calendar-clusters.ts:38` |
| `CalendarOverflowList` | 2 | `useMemo(…)`, `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-overflow-list/calendar-overflow-list.tsx:39` |
| `AgendaRowContent` | 2 | `formatCalendarDay`, `formatEventCount` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/agenda-row-content.tsx:35` |
| `CalendarAgenda` | 2 | `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.tsx:51` |
| `useMemo(…)` | 2 | `getAgendaRange`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:102` |
| `handleQueryChange` | 2 | `toEventFilterInput`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:41` |
| `validateCalendarSearch` | 2 | `readCalendarSearch`, `parseSkyValue` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:61` |
| `handleDateChange` | 2 | `updateSearch`, `formatCalendarDate` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:61` |
| `normalizeHexadecimalColor` | 1 | `from(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:8` |
| `clampNumber` | 1 | `isFiniteNumber` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:228` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:263` |
| `readStrokes` | 1 | `readStroke` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:317` |
| `select` | 1 | `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-opacity/use-night-sky-opacity.ts:13` |
| `select` | 1 | `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-opacity/use-night-sky-opacity.ts:18` |
| `describeDataset` | 1 | `queryApi` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:42` |
| `findPresets` | 1 | `queryApi` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:94` |
| `findViewWindows` | 1 | `queryApi` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/events-api/events-api.utilities.ts:102` |
| `useWindowSize` | 1 | `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-window-size/use-window-size.ts:12` |
| `useEffect(…)` | 1 | `measure` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-window-size/use-window-size.ts:21` |
| `useMemo(…)` | 1 | `toNightSkyInput` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:57` |
| `useEffect(…)` | 1 | `isFieldOfViewCut` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:91` |
| `createEventFilterFields` | 1 | `toTagField` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:24` |
| `isNumericFacet` | 1 | `every(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-fields.utilities.ts:81` |
| `GroupFieldPicker` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-field-picker/group-field-picker.tsx:48` |
| `handleSelect` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-field-picker/group-field-picker.tsx:73` |
| `findAncestors` | 1 | `readDepth` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:15` |
| `readDepth` | 1 | `readData` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:82` |
| `countSelectedBelow` | 1 | `readDepth` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:156` |
| `coverLeaves` | 1 | `numberAt` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:181` |
| `fillFromLeaves` | 1 | `numberAt` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:206` |
| `readName` | 1 | `readData` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities.ts:292` |
| `useState(…)` | 1 | `findAncestors` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:43` |
| `handleOpen` | 1 | `setExpanded(…)` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:65` |
| `handleSearchKeyDown` | 1 | `focusSibling` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:78` |
| `close` | 1 | `handleOpen` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:108` |
| `down` | 1 | `focusSibling` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:111` |
| `open` | 1 | `handleOpen` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:115` |
| `toggle` | 1 | `handleToggle` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:118` |
| `up` | 1 | `focusSibling` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:121` |
| `GroupTagPicker` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-tag-picker/group-tag-picker.tsx:31` |
| `describeTags` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.utilities.ts:11` |
| `flatMap(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.utilities.ts:23` |
| `anonymous` | 1 | `toGroupLevel` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/group-level-row/group-level-row.tsx:83` |
| `formatEventSpan` | 1 | `write` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-format/calendar-format.utilities.ts:58` |
| `duration` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-labels.constants.ts:18` |
| `week` | 1 | `formatCalendarDay` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-labels.constants.ts:37` |
| `getEventColor` | 1 | `getEventKind` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-colors/calendar-colors.utilities.ts:30` |
| `hashColor` | 1 | `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:73` |
| `map(…)` | 1 | `pickColor` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/components/calendar-color-schemes/calendar-color-schemes.utilities.ts:144` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/calendar-color-by/calendar-color-by.tsx:45` |
| `formatSliderValue` | 1 | `roundToStep` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:23` |
| `filter(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:53` |
| `readFolderState` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:65` |
| `readSliderValue` | 1 | `roundToStep` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:82` |
| `toggleConstellation` | 1 | `toggleConstellations` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:147` |
| `toResetChange` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:180` |
| `toSkyParameterChange` | 1 | `isDefault` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:188` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.utilities.ts:234` |
| `useNightSkySettings` | 1 | `useCallback(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings.ts:15` |
| `select` | 1 | `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings.ts:18` |
| `handleToggle` | 1 | `toggleConstellations` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-constellations/night-sky-constellation-picker.tsx:42` |
| `NightSkySlider` | 1 | `formatSliderValue` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-slider.tsx:34` |
| `anonymous` | 1 | `readSliderValue` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-slider.tsx:67` |
| `NightSkySliders` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-fields/night-sky-sliders.tsx:27` |
| `handleSettingChange` | 1 | `toSkyParameterChange` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-sections/night-sky-lines-section.tsx:50` |
| `anonymous` | 1 | `toEclipticChange` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/components/night-sky-sections/night-sky-lines-section.tsx:84` |
| `handleSettingChange` | 1 | `toSkyParameterChange` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:64` |
| `anonymous` | 1 | `toVisibilityChange` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:111` |
| `anonymous` | 1 | `toResetChange` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:117` |
| `anonymous` | 1 | `toConstellationsChange` | `projects/caelundas/caelundas-web/src/components/calendar-appearance/night-sky-menu/night-sky-menu.tsx:162` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:40` |
| `filter(…)` | 1 | `some(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:45` |
| `replaceLevel` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:50` |
| `map(…)` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:77` |
| `anonymous` | 1 | `replaceLevel` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:86` |
| `anonymous` | 1 | `toGroupLevel` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/calendar-group-by.tsx:97` |
| `CalendarScaleSelect` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-scale-select/calendar-scale-select.tsx:27` |
| `map(…)` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-options/calendar-view-options.tsx:61` |
| `OutsideDataset` | 1 | `format` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-empty/outside-dataset.tsx:32` |
| `subscribeToDesktopViewport` | 1 | `subscribeToQuery` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts:22` |
| `subscribeToViewport` | 1 | `subscribeToQuery` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-viewport.utilities.ts:30` |
| `from(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/skeleton-body.tsx:93` |
| `CalendarSkeleton` | 1 | `getDefaultCalendarView` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-skeleton/calendar-skeleton.tsx:33` |
| `toRuleInput` | 1 | `toRuleValues` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-input.utilities.ts:81` |
| `toPreset` | 1 | `toGroup` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/presets/presets.utilities.ts:15` |
| `toEventGroupingInput` | 1 | `toLevelInput` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-model/event-group-input.utilities.ts:10` |
| `isDayShown` | 1 | `getViewWindows` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:88` |
| `parseCalendarDate` | 1 | `anchorDay` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:110` |
| `getTimelineDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:132` |
| `getVisibleDays` | 1 | `shiftDays` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-window/calendar-window.utilities.ts:173` |
| `readCached(…)` | 1 | `findEvents` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:68` |
| `some(…)` | 1 | `isShown` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:106` |
| `readCached(…)` | 1 | `findEvents` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:130` |
| `some(…)` | 1 | `isShown` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:133` |
| `readCached(…)` | 1 | `findFacets` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:159` |
| `readCached` | 1 | `catch(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-loader.utilities.ts:171` |
| `handleValueChange` | 1 | `parseCalendarView` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:67` |
| `anonymous` | 1 | `handleValueChange` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-view-select/calendar-view-select.tsx:100` |
| `CalendarToolbar` | 1 | `hasContent` | `projects/caelundas/caelundas-web/src/components/calendar-controls/calendar-toolbar/calendar-toolbar.tsx:44` |
| `getVirtualWindow` | 1 | `findFirstRowEndingAfter` | `projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/calendar-virtual-window.utilities.ts:25` |
| `useEffect(…)` | 1 | `anonymous` | `projects/caelundas/caelundas-web/src/components/calendar-display/virtual-list/virtual-list.tsx:107` |
| `readNamedIcon` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-glyphs/components/calendar-icons/calendar-icons.utilities.ts:103` |
| `EventTagPills` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-tag-pills/event-tag-pills.tsx:21` |
| `map(…)` | 1 | `getTagColor` | `projects/caelundas/caelundas-web/src/components/calendar-events/event-tag-pills/event-tag-pills.tsx:46` |
| `toSorted(…)` | 1 | `compareText` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-tree/event-group-tree.utilities.ts:56` |
| `collectGroups` | 1 | `readGroupKeys` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-group-by/components/event-group-tree/event-group-tree.utilities.ts:72` |
| `getAgendaRange` | 1 | `addCalendarDays` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:47` |
| `getAgendaRowHeight` | 1 | `getEventRowHeight` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:58` |
| `filter(…)` | 1 | `getAgendaListing` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:156` |
| `getAgendaListing` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.utilities.ts:195` |
| `getRowHeight` | 1 | `getEventRowHeight` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-cluster-dialog/calendar-cluster-dialog.utilities.ts:19` |
| `describeBar` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.utilities.ts:14` |
| `handleEventClick` | 1 | `describeBar` | `projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.ts:35` |
| `isSameRowSet` | 1 | `every(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-window/calendar-timeline-window.utilities.ts:40` |
| `windowTimelineBars` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-window/calendar-timeline-window.utilities.ts:54` |
| `map(…)` | 1 | `toGanttEvent` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:61` |
| `map(…)` | 1 | `toGanttEvent` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:79` |
| `watchVisibleRows` | 1 | `attach` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:102` |
| `attach` | 1 | `schedule` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:121` |
| `readRowBoxes` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:193` |
| `toGanttEvent` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.utilities.ts:222` |
| `CalendarEventTooltip` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-event-tooltip/calendar-event-tooltip.tsx:38` |
| `CalendarEventChip` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-event-chip/calendar-event-chip.tsx:30` |
| `clusterTimelineBars` | 1 | `clusterRow` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-clusters/calendar-timeline-clusters.utilities.ts:16` |
| `TimelineNavigation` | 1 | `useLayoutEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/components/timeline-navigation/timeline-navigation.tsx:24` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:116` |
| `useMemo(…)` | 1 | `toTimelineRows` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:118` |
| `useMemo(…)` | 1 | `createTimelineLayout` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:123` |
| `useMemo(…)` | 1 | `windowTimelineBars` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:130` |
| `useMemo(…)` | 1 | `toCountColumns` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:139` |
| `watchVisibleRows(…)` | 1 | `setMeasured(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:152` |
| `setMeasured(…)` | 1 | `isSameRowSet` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-timeline/calendar-timeline.tsx:153` |
| `getRowHeight` | 1 | `getEventRowHeight` | `projects/caelundas/caelundas-web/src/components/calendar-events/calendar-overflow-list/calendar-overflow-list.utilities.ts:19` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.tsx:65` |
| `useMemo(…)` | 1 | `toGroupedAgendaRows` | `projects/caelundas/caelundas-web/src/components/calendar-display/calendar-agenda/calendar-agenda.tsx:67` |
| `toCalendarEvent` | 1 | `getEventLabel` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-loader/calendar-events.utilities.ts:11` |
| `CalendarGridNavigation` | 1 | `useLayoutEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid-navigation.tsx:24` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:94` |
| `map(…)` | 1 | `toCalendarEvent` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:94` |
| `useMemo(…)` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:98` |
| `map(…)` | 1 | `describeEvent` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:98` |
| `useCallback(…)` | 1 | `formatCalendarDate` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/components/calendar-grid/calendar-grid.tsx:135` |
| `useMemo(…)` | 1 | `createEventGroupFields` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/events-calendar.tsx:133` |
| `useMemo(…)` | 1 | `createColorScheme` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/events-calendar.tsx:135` |
| `useMemo(…)` | 1 | `colorEvents` | `projects/caelundas/caelundas-web/src/components/calendar-display/events-calendar/events-calendar.tsx:139` |
| `countActiveEventFilterRules` | 1 | `toEventFilterInput` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.utilities.ts:10` |
| `isSameEventFilter` | 1 | `normalizeEventFilter` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/event-filter-model/event-filter-tree.utilities.ts:28` |
| `getDefaultFilter` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.utilities.ts:15` |
| `handlePresetSelect` | 1 | `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:51` |
| `handleChange` | 1 | `find(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/preset-picker/preset-picker.tsx:65` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-date-range-editor/filter-date-range-editor.tsx:76` |
| `anonymous` | 1 | `handleChange` | `projects/caelundas/caelundas-web/src/components/calendar-query/filter-date-range-editor/filter-date-range-editor.tsx:88` |
| `FilterChipRow` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-query/calendar-filters/components/filter-chip-row/filter-chip-row.tsx:26` |
| `getCalendarReloadKey` | 1 | `readCalendarSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:24` |
| `parseGrouping` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:93` |
| `anonymous` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:40` |
| `handleClustersChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:52` |
| `handleColorByChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:55` |
| `handleColorsChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:58` |
| `handleFilterChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:64` |
| `handleGroupingChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:67` |
| `handleScaleChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:70` |
| `handleSymbolsChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:73` |
| `handleViewChange` | 1 | `updateSearch` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:79` |
| `shouldReload` | 1 | `getCalendarReloadKey` | `projects/caelundas/caelundas-web/src/routes/index.tsx:58` |
| `useMemo(…)` | 1 | `createEventFilterFields` | `projects/caelundas/caelundas-web/src/routes/index.tsx:107` |
| `useMemo(…)` | 1 | `parseCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:117` |

</details>
<!-- callidescope:end -->
