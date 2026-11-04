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

The night sky reads its stars and constellation figures from the same SQLite
file as the events: the `star`, `constellation` and `constellation_line` tables
that `caelundas-cli`'s `night-sky` command fills. The default build loads the
committed seed in `caelundas-cli/data/night-sky-seed.sql`: all 88
constellations and their figures, with only the stars those figures join and
the brightest; `build:ingested` copies the full catalog a `night-sky` run
wrote.

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
| Callables | 683 |
| Files | 290 |
| Calls traced | 665 |
| Call stacks | 102 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 108 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 6 |
| `maximumBreadth` | 8 |

### Call stacks (depth)

**1. `buildNightSky`** — depth 6 · orphan-root

```text
🚀 buildNightSky(options: NightSkyOptions): NightSky [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:68]
   ↳ Builds the night sky for a place and moment: the real fixed stars, drawn about the north celestial pole, which sits…
  └─> selectStars(geometry: SkyGeometry, options: ResolvedNightSkyOptions): SelectedStars [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:455]
     ↳ Draws the stars bright enough and on rings that cross the window.
    └─> map(…)(star: StarRow): RenderedStar | undefined [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:463]
      └─> renderStar(…): RenderedStar | undefined [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:424]
         ↳ Draws one star, or returns nothing when its ring never crosses the window.
        └─> projectSkyPoint(…): ProjectedPoint [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-projection.utilities.ts:32]
           ↳ Projects a point of the sky about the north celestial pole with a stereographic projection.
          └─> tangentOfHalfAngle(degrees: number): number [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-projection.utilities.ts:72]
             ↳ The tangent of half an angle given in degrees, as the projection needs.
```

**2. `select`** — depth 6 · orphan-root

```text
🚀 select(…): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:37]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:101]
     ↳ Reads the backdrop's settings from the link.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:287]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:253]
         ↳ Reads one stroke from the link: `<prefix>Color` like the background's colors, and `<prefix>Opacity` and `<prefix>Width`…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:31]
           ↳ Reads a hexadecimal color of three or six digits, with or without the `#`, as lowercase `#rrggbb`, or answers the…
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:42]
```

**3. `NightSkyBackdropMount`** — depth ≥ 6 · orphan-root

```text
🚀 NightSkyBackdropMount(properties: Readonly<NightSkyBackdropMountProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-backdrop/night-sky-backdrop-mount.tsx:23]
   ↳ Renders the night sky the link asks for behind the page.
  └─> useNightSky(): UseNightSkyResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:32]
     ↳ Builds the night sky behind the page as an SVG, or nothing while its stars load, when the link turns it off, and for a…
    └─> useMemo(…)(): NightSky | undefined [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:53]
      └─> selectConstellationSegments(…): ConstellationSegment[] [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:163]
         ↳ The figure segments the link asks for: every one for `all`, the twelve zodiac constellations' for `zodiac`, and those…
        └─> filter(…)(segment: ConstellationSegment): boolean [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:170]
          └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:90]
             ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

<details>
<summary>99 more call stacks</summary>

**4. `toggle`** — depth ≥ 6 · orphan-root

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

**5. `FilterTagEditor`** — depth 6 · orphan-root

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

**6. `CalendarFilters`** — depth ≥ 6 · orphan-root

```text
🚀 CalendarFilters(properties: Readonly<CalendarFiltersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters/calendar-filters.tsx:59]
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

**7. `select`** — depth 6 · orphan-root

```text
🚀 select(…): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:21]
  └─> readNightSkyOverrides(search: Readonly<Record<string, unknown>>): NightSkyOverrides [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:101]
     ↳ Reads the backdrop's settings from the link.
    └─> readStrokes(…): Pick<NightSkyOverrides, "eclipticColor" | "eclipticOpacity" | "eclipticWidth" | "lineColor" | "lineOpacity" | "lineWidth" | "rejectedKeys"> [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:287]
       ↳ Reads how the figures and the ecliptic are stroked, naming every key the link gives a value it cannot read.
      └─> readStroke(…): { color: string; opacity: number; rejected: string[]; width: number; } [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:253]
         ↳ Reads one stroke from the link: `<prefix>Color` like the background's colors, and `<prefix>Opacity` and `<prefix>Width`…
        └─> normalizeHexadecimalColor(value: unknown, fallback: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:31]
           ↳ Reads a hexadecimal color of three or six digits, with or without the `#`, as lowercase `#rrggbb`, or answers the…
          └─> from(…)(digit: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:42]
```

**8. `CalendarTimeline`** — depth ≥ 6 · orphan-root

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

**9. `CalendarAgenda`** — depth 6 · orphan-root

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

**10. `CalendarGrid`** — depth ≥ 6 · orphan-root

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

**11. `EventsCalendar`** — depth ≥ 6 · orphan-root

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

**12. `loader`** — depth ≥ 6 · orphan-root

```text
🚀 loader(…): Promise<CalendarData> [projects/caelundas/caelundas-web/src/routes/index.tsx:72]
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

**13. `IndexPage`** — depth ≥ 6 · orphan-root

```text
🚀 IndexPage(): ReactNode [projects/caelundas/caelundas-web/src/routes/index.tsx:113]
   ↳ Renders the landing page's heading.
  └─> useMemo(…)(): EventFilterField[] [projects/caelundas/caelundas-web/src/routes/index.tsx:123]
    └─> createEventFilterFields(facets: readonly EventFacet[]): EventFilterField[] [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:28]
       ↳ Builds the filter builder's fields: one per tag root in the database's facets, offering every tag beneath it, then the…
      └─> toTagField(facet: EventFacet): EventFilterField [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:98]
         ↳ Builds the field for one tag root.
        └─> isNumericFacet(facet: EventFacet): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:90]
           ↳ Whether every tag beneath a root is named for a number it ends in, such as "Harmonic 6", so the root reads as a number…
          └─> every(…)(value: EventFacetValue): boolean [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:91]
```

**14. `handleQueryChange`** — depth ≥ 5 · orphan-root

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

**15. `CalendarCollectionPicker`** — depth 5 · orphan-root

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

**16. `CalendarColorBy`** — depth 5 · orphan-root

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

**17. `toggleConstellation`** — depth 5 · orphan-root

```text
🚀 toggleConstellation(…): string[] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:148]
   ↳ Shows or hides one constellation's figure among those chosen, naming the choice again in its fewest words.
  └─> toggleConstellations(…): string[] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:160]
     ↳ Shows every constellation of a folder when any is hidden, or hides them all when all show, naming the choice again in…
    └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45]
       ↳ The names of the constellations a choice of figures shows.
      └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54]
        └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:90]
           ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**18. `handleToggle`** — depth ≥ 5 · orphan-root

```text
🚀 handleToggle(names: readonly string[]): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:45]
  └─> toggleConstellations(…): string[] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:160]
     ↳ Shows every constellation of a folder when any is hidden, or hides them all when all show, naming the choice again in…
    └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45]
       ↳ The names of the constellations a choice of figures shows.
      └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54]
        └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:90]
           ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**19. `EventGlyphs`** — depth 5 · orphan-root

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

**20. `CalendarOverflowList`** — depth 5 · orphan-root

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

**21. `shouldReload`** — depth 5 · orphan-root

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

**22. `describeDataset`** — depth ≥ 5 · orphan-root

```text
🚀 describeDataset(): Promise<EventsDataset | null> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:37]
  └─> map(…)(row: Readonly<Record<string, unknown>>): EventsDataset [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:40]
    └─> toDataset(row: SqlRow): EventsDataset [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:120]
       ↳ Maps the dataset summary row.
      └─> readDate(row: SqlRow, column: string): Date [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:97]
         ↳ Reads an ISO 8601 text column as an instant.
        └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:104]
           ↳ Reads a column the schema declares `not null` as text.
```

**23. `findEvents`** — depth ≥ 5 · orphan-root

```text
🚀 findEvents(query: EventsQuery): Promise<CalendarEventRecord[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:43]
  └─> replace(…)(): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:49]
    └─> toGroupColumns(groups: readonly SqlGroupSource[]): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:185]
       ↳ The select list's extra columns, one JSON array of group keys per level, named `group_0` onward.
      └─> map(…)(group: SqlGroupSource, level: number): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:187]
        └─> replace(…)(): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:188]
```

**24. `GroupLevelRow`** — depth 4 · orphan-root

```text
🚀 GroupLevelRow(properties: Readonly<GroupLevelRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:46]
   ↳ Draws one level like a filter: its field, what it goes by, and a button that removes it, with the tag tree open beneath…
  └─> describeTags(field: EventGroupField, level: EventGroupLevel): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:9]
     ↳ Names what a level goes by: the tags picked, or the level of the root's tree it goes by, the first unless an older link…
    └─> flatMap(…)(this: undefined, tag: string): string[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:21]
      └─> find(…)(candidate: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.utilities.ts:22]
```

**25. `NightSkyConstellationPicker`** — depth 4 · orphan-root

```text
🚀 NightSkyConstellationPicker(properties: Readonly<NightSkyConstellationPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:33]
   ↳ Renders which constellations' figures the sky draws: a tree of two folders, the zodiac's twelve, open, and every other,…
  └─> listShownConstellations(…): Set<string> [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45]
     ↳ The names of the constellations a choice of figures shows.
    └─> filter(…)({ name, zodiac }: ConstellationListing): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:54]
      └─> normalizeConstellationName(name: string): string [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:90]
         ↳ A constellation's name as a link writes it: lower case, with spaces and hyphens as underscores, so `Ursa Major` is…
```

**26. `NightSkyMenu`** — depth ≥ 4 · orphan-root

```text
🚀 NightSkyMenu(properties: Readonly<NightSkyMenuProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:56]
   ↳ Renders the toolbar's Sky menu: every setting of the night sky behind the page, read from the link and written back to…
  └─> useNightSkySettings(): UseNightSkySettingsResult [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:18]
     ↳ The night sky's settings as the link sets them, the constellations the database lists, and how to change the link: the…
    └─> useEffect(…)(): () => void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:45]
      └─> catch(…)(error: unknown): void [projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:55]
```

**27. `CalendarGroupBy`** — depth 4 · orphan-root

```text
🚀 CalendarGroupBy(properties: Readonly<CalendarGroupByProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:40]
   ↳ Renders the list of the grouping's levels, each shaped like a filter: a field, the same ones the filter offers, and…
  └─> useMemo(…)(): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:46]
    └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27]
       ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
      └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
         ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**28. `measure`** — depth ≥ 4 · orphan-root

```text
🚀 measure(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:117]
  └─> getVisibleTimelineRows(…): ReadonlySet<string> | null [projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:19]
     ↳ The ids of the rows on screen, and a few beyond each edge, or `null` while the body has not been laid out and so every…
    └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27]
       ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
      └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:56]
         ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**29. `addEventListener(…)`** — depth 4 · orphan-root

```text
🚀 addEventListener(…)(event: MessageEvent<WorkerRequest>): void [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:83]
  └─> select(request: WorkerRequest): Promise<SqlRow[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:62]
     ↳ Runs one select against the opened database.
    └─> openDatabase(url: string): Promise<Database> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:22]
       ↳ Downloads the bundled database file and opens it read-only in memory, so no persistent storage and no cross-origin…
      └─> listLocalTimeFunctions(): Readonly<Record<string, LocalTimeFunction>> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:11]
         ↳ Every local-time function by the name SQL calls it.
```

**30. `computeStartingSiderealDegrees`** — depth 3 · orphan-root

```text
🚀 computeStartingSiderealDegrees(date: Date, longitudeDegrees: number): number [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:142]
   ↳ The angle the sky starts at for a place and moment, from astronomy-engine's apparent sidereal time.
  └─> computeLocalSiderealDegrees(date: Date, longitudeDegrees: number, greenwichSiderealHours?: number): number [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:126]
     ↳ Local sidereal time in degrees, from 0 up to 360.
    └─> computeGreenwichMeanSiderealHours(date: Date): number [projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:112]
       ↳ Greenwich mean sidereal time in hours.
```

**31. `close`** — depth ≥ 3 · orphan-root

```text
🚀 close(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:112]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:70]
```

**32. `open`** — depth ≥ 3 · orphan-root

```text
🚀 open(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:119]
  └─> handleOpen(id: string, open: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:69]
    └─> setExpanded(…)(previous: Set<string>): Set<string> [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:70]
```

**33. `colorOf`** — depth 3 · orphan-root

```text
🚀 colorOf(event: CalendarEventRecord): string | null [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:54]
  └─> hashColor(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:79]
     ↳ The color of a key from its own text, for a value with no place in a legend.
    └─> pickColor(position: number): string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:162]
       ↳ The color at a position in the palette, which starts over after its last.
```

**34. `NightSkyConstellationFolder`** — depth 3 · orphan-root

```text
🚀 NightSkyConstellationFolder(properties: Readonly<NightSkyConstellationFolderProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-folder.tsx:39]
   ↳ Renders one folder of the constellation picker, the way a file tree draws one: a chevron that opens it, a checkbox that…
  └─> readFolderState(shown: ReadonlySet<string>, names: readonly string[]): FolderState [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:66]
     ↳ Whether a folder's constellations all show, some do, or none.
    └─> filter(…)(name: string): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:70]
```

**35. `NightSkySlider`** — depth 3 · orphan-root

```text
🚀 NightSkySlider(properties: Readonly<NightSkySliderProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-slider.tsx:29]
   ↳ Renders one of the night sky's numbers as a labeled slider showing its value and unit.
  └─> formatSliderValue(value: number, control: SkySliderControl): string [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:23]
     ↳ A slider's value with its unit, rounded to its step.
    └─> roundToStep(value: number, step: number): number [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:97]
       ↳ Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes `0.3` to the link.
```

**36. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: number | readonly number[]): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-slider.tsx:62]
  └─> readSliderValue(…): number [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:83]
     ↳ A slider's moved value, rounded to its step, or the value it had for anything it cannot read.
    └─> roundToStep(value: number, step: number): number [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:97]
       ↳ Rounds a slider's value to the decimals of its step, so `0.1 * 3` writes `0.3` to the link.
```

**37. `handleSettingChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleSettingChange(key: SkyParameterKey, value: string | number): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-lines-section.tsx:50]
  └─> toSkyParameterChange(key: SkyParameterKey, value: number | string): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:190]
     ↳ The change that writes one setting, or removes it when it is set back to its default, so a link names only what differs.
    └─> isDefault(key: SkyParameterKey, value: number | string): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:208]
       ↳ Whether a value is its key's default, a color in any case.
```

**38. `handleSettingChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleSettingChange(key: SkyParameterKey, value: string | number): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:67]
  └─> toSkyParameterChange(key: SkyParameterKey, value: number | string): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:190]
     ↳ The change that writes one setting, or removes it when it is set back to its default, so a link names only what differs.
    └─> isDefault(key: SkyParameterKey, value: number | string): boolean [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:208]
       ↳ Whether a value is its key's default, a color in any case.
```

**39. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:120]
  └─> toResetChange(): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:182]
     ↳ The change the Default button makes: every key the menu sets, removed.
    └─> map(…)(key: SkyParameterKey): [SkyParameterKey, undefined] [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:183]
```

**40. `SkeletonBody`** — depth 3 · orphan-root

```text
🚀 SkeletonBody(properties: Readonly<SkeletonBodyProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:29]
   ↳ Draws the body of the skeleton for one view.
  └─> from(…)(_: unknown, column: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:93]
    └─> map(…)(height: "h-8" | "h-12" | "h-16", index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:99]
```

**41. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:92]
  └─> replaceLevel(index: number, level: EventGroupLevel | null): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:56]
    └─> flatMap(…)(this: undefined, current: EventGroupLevel, position: number): EventGroupLevel[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:58]
```

**42. `CalendarViewOptions`** — depth 3 · orphan-root

```text
🚀 CalendarViewOptions(properties: Readonly<CalendarViewOptionsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-options/calendar-view-options.tsx:47]
   ↳ Renders the View menu's arrangement of the view: a Group by submenu for the agenda and the timeline, which group their…
  └─> createEventGroupFields(facets: readonly EventFacet[]): EventGroupField[] [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27]
     ↳ The fields the events can be grouped by: one per tag root, in the facets' order, then the periods and the duration…
    └─> describeRoot(facet: EventFacet): string [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:78]
       ↳ What a tag root means, for the list of attributes: its own description, or a plain one from its name for a root added…
```

**43. `EventTagPills`** — depth 3 · orphan-root

```text
🚀 EventTagPills(properties: Readonly<EventTagPillsProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:23]
   ↳ Draws each tag as a pill, tinted in the color of its tree so that tags of a kind read alike wherever they are shown.
  └─> map(…)(tag: CalendarEventTag): React.JSX.Element [projects/caelundas/caelundas-web/src/components/event-tag-pills/event-tag-pills.tsx:48]
    └─> getTagColor(tag: CalendarEventTag): string [projects/caelundas/caelundas-web/src/components/event-tag-pills/calendar-tag-colors.utilities.ts:17]
       ↳ The color of a tag's tree: one for each tag root, so every tag beneath a root shares it.
```

**44. `CalendarEventRow`** — depth 3 · orphan-root

```text
🚀 CalendarEventRow(properties: Readonly<CalendarEventRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-row/calendar-event-row.tsx:39]
   ↳ Renders one event as a list row: its time in the data's zone, its color, its symbols, drawn as the symbols setting…
  └─> formatDuration(minutes: number): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:38]
     ↳ Names a duration in days, hours, and minutes, leaving out any unit that is zero, or "Instant" for an event with no…
    └─> map(…)([count, unit]: [number, DurationUnit]): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:51]
```

**45. `VirtualList`** — depth ≥ 3 · orphan-root

```text
🚀 VirtualList<Row>(properties: Readonly<VirtualListProperties<Row>>): ReactNode [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:54]
   ↳ Renders a vertically scrolling list that draws only the rows in view, plus a few on each side, however long the list…
  └─> useMemo(…)(): number[] [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:74]
    └─> getRowOffsets(heights: readonly number[]): number[] [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:10]
       ↳ Lays rows of the given heights end to end, returning each row's top and, last, the height of them all.
```

**46. `handleScroll`** — depth ≥ 3 · orphan-root

```text
🚀 handleScroll(event: UIEvent<HTMLDivElement>): void [projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:92]
  └─> getVirtualWindow(input: VirtualWindowInput): VirtualWindow [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:27]
     ↳ Picks the rows a viewport scrolled to `scrollTop` shows, plus the overscan on each side, so a list of any length…
    └─> findFirstRowEndingAfter(offsets: readonly number[], pixel: number): number [projects/caelundas/caelundas-web/src/components/virtual-list/calendar-virtual-window.utilities.ts:56]
       ↳ The first row whose bottom edge lies below a pixel, or the row count when none does.
```

**47. `handleEventClick`** — depth ≥ 3 · orphan-root

```text
🚀 handleEventClick(occurrence: GanttOccurrence<TimelineBar>): void [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.ts:35]
  └─> describeBar(bar: TimelineBar | undefined): OpenedBar | undefined [projects/caelundas/caelundas-web/src/hooks/use-bar-dialog/use-bar-dialog.utilities.ts:14]
     ↳ What opens when a marker is clicked: the events it holds, titled by their count, or by the name of the one event.
    └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
       ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**48. `anonymous`** — depth ≥ 3 · orphan-root

```text
🚀 anonymous(next: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:103]
  └─> handleValueChange(values: readonly unknown[]): void [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:70]
    └─> parseCalendarView(value: unknown): CalendarViewName | undefined [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-views.utilities.ts:22]
       ↳ Reads a value as a view, or nothing when it names none, such as a stale link's or an unpressed toggle's.
```

**49. `findFacets`** — depth ≥ 3 · orphan-root

```text
🚀 findFacets(window?: EventsWindow | undefined): Promise<EventFacet[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:71]
  └─> toFacets(rows: readonly SqlRow[]): EventFacet[] [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:156]
     ↳ Gathers the tag rows, roots first in path order, into one facet per root.
    └─> readRequiredText(row: SqlRow, column: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:104]
       ↳ Reads a column the schema declares `not null` as text.
```

**50. `select`** — depth ≥ 3 · orphan-root

```text
🚀 select(…): Promise<Readonly<Record<string, unknown>>[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:34]
  └─> startWorker(): Worker [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:96]
     ↳ Starts the worker that owns the sqlite-wasm database.
    └─> UnsupportedBrowserError.constructor(): UnsupportedBrowserError [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:169]
```

**51. `getRouter`** — depth 3 · orphan-root

```text
🚀 getRouter(): Router<typeof routeTree, "never", true> [projects/caelundas/caelundas-web/src/router.tsx:10]
   ↳ Creates the application router, which TanStack Start calls once per request on the server and once on the client.
  └─> createBrowserEventsDatabase(): EventsDatabase [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:20]
     ↳ The events database the browser reads, served by a sqlite-wasm worker.
    └─> createEventsDatabase(executor: SqlExecutor): EventsDatabase [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:35]
       ↳ Builds the events database over any executor.
```

**52. `OutsideDataset`** — depth 2 · orphan-root

```text
🚀 OutsideDataset(properties: Readonly<OutsideDatasetProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:32]
   ↳ Names the dates the data covers and offers to jump to the nearest of them.
  └─> format(date: Date): string [projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:40]
```

**53. `transform(…)`** — depth 2 · orphan-root

```text
🚀 transform(…)(…): { key: string; label: string | null; path: string | null; }[] [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:195]
  └─> flatMap(…)(…): { key: string; label: string | null; path: string | null; }[] [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:196]
```

**54. `handleCollectionSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleCollectionSelect(next: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:61]
  └─> toLinkedEventFilter(query: EventFilterQuery): EventFilterQuery [projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-tree.utilities.ts:70]
     ↳ The filter a link should hold for a tree.
```

**55. `handleChange`** — depth ≥ 2 · orphan-root

```text
🚀 handleChange(picked: unknown): void [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:70]
  └─> find(…)(candidate: ResolvedEventFilterCollection): boolean [projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:71]
```

**56. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:80]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:46]
```

**57. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(event: React.ChangeEvent<HTMLInputElement, HTMLInputElement>): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:92]
  └─> handleChange(index: 0 | 1, day: string): void [projects/caelundas/caelundas-web/src/components/filter-date-range-editor/filter-date-range-editor.tsx:46]
```

**58. `handleSearchKeyDown`** — depth ≥ 2 · orphan-root

```text
🚀 handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:82]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**59. `down`** — depth 2 · orphan-root

```text
🚀 down(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:115]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**60. `up`** — depth 2 · orphan-root

```text
🚀 up(): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:125]
  └─> focusSibling(element: HTMLElement, step: number): void [projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.utilities.ts:9]
     ↳ Moves focus to the row a number of rows from an element, among the rows of its list; from the search box, where the…
```

**61. `FilterChipRow`** — depth 2 · orphan-root

```text
🚀 FilterChipRow(properties: Readonly<FilterChipRowProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:30]
   ↳ Draws one chip per rule of the tree in the surrounding `Filters`, nested ones included, in a row that wraps onto more…
  └─> map(…)(rule: FilterRule<EventFilterValue>, index: number): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-filters/filter-chip-row.tsx:59]
```

**62. `GroupFieldPicker`** — depth 2 · orphan-root

```text
🚀 GroupFieldPicker(properties: Readonly<GroupFieldPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:50]
   ↳ Renders the field of a level of a grouping as the filter renders its attributes: a button that opens a searchable list,…
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:72]
```

**63. `handleSelect`** — depth ≥ 2 · orphan-root

```text
🚀 handleSelect(picked: string): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:75]
  └─> find(…)(field: EventGroupField): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-field-picker.tsx:76]
```

**64. `GroupTagPicker`** — depth 2 · orphan-root

```text
🚀 GroupTagPicker(properties: Readonly<GroupTagPickerProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:35]
   ↳ Renders the tag tree a level of a grouping picks its groups from: the same tree, with the same search, folding and…
  └─> filter(…)(option: FilterOption<unknown>): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-tag-picker.tsx:48]
```

**65. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(next: EventGroupField): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:83]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:128]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**66. `duration`** — depth 2 · orphan-root

```text
🚀 duration(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:18]
  └─> find(…)(…): boolean [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:19]
```

**67. `week`** — depth 2 · orphan-root

```text
🚀 week(key: string): string [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-labels.constants.ts:37]
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**68. `getEventColor`** — depth 2 · orphan-root

```text
🚀 getEventColor(event: CalendarEventRecord): null | string [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:32]
   ↳ The color of an event's kind: that of its kind's rule, or its own color from the data when it has none.
  └─> getEventKind(event: CalendarEventRecord): EventColorRule | null [projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-colors.utilities.ts:40]
     ↳ The kind of an event: the most specific rule any of its tags falls under, or none when no rule does.
```

**69. `NightSkySliders`** — depth 2 · orphan-root

```text
🚀 NightSkySliders(properties: Readonly<NightSkySlidersProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-sliders.tsx:25]
   ↳ Renders one section's sliders in order, each showing its setting.
  └─> map(…)(control: SkySliderControl): React.JSX.Element [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-sliders.tsx:46]
```

**70. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(checked: boolean): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-lines-section.tsx:84]
  └─> toEclipticChange(visible: boolean): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:140]
     ↳ The change that hides the ecliptic, with `sky.ecliptic=false`, or removes the key to draw it, its default.
```

**71. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(checked: boolean): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:114]
  └─> toVisibilityChange(visible: boolean): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:201]
     ↳ The change that shows the sky, by removing `sky`, or hides it with `sky=off`.
```

**72. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(words: string[]): void [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:160]
  └─> toConstellationsChange(words: readonly string[]): SkySearchChange [projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:124]
     ↳ The change that writes a choice of figures: removed for the zodiac, the default, `none` for no figure, and the words…
```

**73. `subscribeToDesktopViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToDesktopViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:22]
   ↳ Calls back whenever the page crosses the desktop width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**74. `subscribeToViewport`** — depth 2 · orphan-root

```text
🚀 subscribeToViewport(onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:30]
   ↳ Calls back whenever the page crosses the tablet width, and returns how to stop, in the shape `useSyncExternalStore`…
  └─> subscribeToQuery(query: string, onChange: () => void): () => void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-viewport.utilities.ts:37]
     ↳ Watches a media query, returning how to stop.
```

**75. `CalendarSkeleton`** — depth 2 · orphan-root

```text
🚀 CalendarSkeleton(properties: Readonly<CalendarSkeletonProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-skeleton/calendar-skeleton.tsx:37]
   ↳ Renders the shape of the view the page opens on, a toolbar row over that view's layout: a grid of days for the month,…
  └─> getDefaultCalendarView(isWide: boolean): CalendarViewName [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-views.utilities.ts:14]
     ↳ The view to show when the link names none: the agenda, which reads at a phone's width, or the whole month on anything…
```

**76. `anonymous`** — depth ≥ 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/components/calendar-group-by/calendar-group-by.tsx:103]
  └─> toGroupLevel(field: EventGroupField): EventGroupLevel [projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:128]
     ↳ A field's first level: a tag root's children, or the derived value.
```

**77. `CalendarScaleSelect`** — depth 2 · orphan-root

```text
🚀 CalendarScaleSelect(properties: Readonly<CalendarScaleSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:29]
   ↳ Renders one button for each of the timeline's scales, from a day of minutes to a year of months, the one shown pressed.
  └─> map(…)(option: "day" | "week" | "month" | "quarter" | "year"): React.JSX.Element [projects/caelundas/caelundas-web/src/components/calendar-scale-select/calendar-scale-select.tsx:51]
```

**78. `getAgendaRowHeight`** — depth 2 · orphan-root

```text
🚀 getAgendaRowHeight(row: AgendaListRow, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:60]
   ↳ How tall an agenda row is drawn: a heading is shorter than an event, an event is as tall as its tags need, and the…
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**79. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(record: CalendarEventRecord, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-cluster-dialog/calendar-cluster-dialog.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**80. `CalendarEventTooltip`** — depth 2 · orphan-root

```text
🚀 CalendarEventTooltip(properties: Readonly<CalendarEventTooltipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-tooltip/calendar-event-tooltip.tsx:40]
   ↳ Wraps what is drawn for an event, its glyphs, in a tooltip that follows the pointer, with the event's name in English,…
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
     ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**81. `CalendarEventChip`** — depth 2 · orphan-root

```text
🚀 CalendarEventChip(properties: Readonly<CalendarEventChipProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-event-chip/calendar-event-chip.tsx:33]
   ↳ Draws an event as its glyphs alone, with a tooltip of its name in English and what the database says of it, and for a…
  └─> getEventLabel(event: CalendarEventRecord): EventLabel [projects/caelundas/caelundas-web/src/components/event-glyphs/calendar-glyphs.utilities.ts:17]
     ↳ Splits an event's summary, which an ingested event writes as its symbols followed by its name in English, into the two.
```

**82. `TimelineNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 TimelineNavigation(properties: Readonly<TimelineNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:24]
   ↳ Reports the timeline's own navigation, which only a child of the Gantt can read, to the toolbar above it, and draws…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/calendar-timeline/timeline-navigation.tsx:40]
```

**83. `CalendarViewSelect`** — depth 2 · orphan-root

```text
🚀 CalendarViewSelect(properties: Readonly<CalendarViewSelectProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:51]
   ↳ Renders one pressed button per view on a desktop, or on a narrower row, a tablet's included, a menu button naming the…
  └─> map(…)(…): Element [projects/caelundas/caelundas-web/src/components/calendar-view-select/calendar-view-select.tsx:108]
```

**84. `CalendarToolbar`** — depth 2 · orphan-root

```text
🚀 CalendarToolbar(properties: Readonly<CalendarToolbarProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-toolbar/calendar-toolbar.tsx:48]
   ↳ Renders the calendar's toolbar in two rows over whichever view's navigation it is handed: the menus, then the date with…
  └─> hasContent(node: ReactNode): boolean [projects/caelundas/caelundas-web/src/components/calendar-toolbar/calendar-toolbar.utilities.ts:10]
     ↳ Whether a slot the page handed the toolbar holds anything to draw.
```

**85. `AgendaRowContent`** — depth 2 · orphan-root

```text
🚀 AgendaRowContent(properties: Readonly<AgendaRowContentProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/calendar-agenda/agenda-row-content.tsx:36]
   ↳ Draws one agenda row: a group's or a day's heading, an event, or the button that lists later days.
  └─> formatCalendarDay(day: string): string [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-format.utilities.ts:23]
     ↳ Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
```

**86. `getRowHeight`** — depth 2 · orphan-root

```text
🚀 getRowHeight(row: Readonly<{ record: CalendarEventRecord; }>, width: number): number [projects/caelundas/caelundas-web/src/components/calendar-overflow-list/calendar-overflow-list.utilities.ts:19]
   ↳ Every row of the list is one event's, as tall as its tags need.
  └─> getEventRowHeight(tags: readonly CalendarEventTag[], width: number): number [projects/caelundas/caelundas-web/src/components/calendar-agenda/calendar-agenda.utilities.ts:93]
     ↳ How tall an event row is drawn in a list `width` pixels wide: as tall as its name and duration, and a line for every…
```

**87. `CalendarGridNavigation`** — depth ≥ 2 · orphan-root

```text
🚀 CalendarGridNavigation(properties: Readonly<CalendarGridNavigationProperties>): ReactNode [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:24]
   ↳ Reports the event calendar's own navigation, which only a child of the calendar can read, to the toolbar above it, and…
  └─> useLayoutEffect(…)(): void [projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid-navigation.tsx:40]
```

**88. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:42]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**89. `handleClustersChange`** — depth 2 · orphan-root

```text
🚀 handleClustersChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:54]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**90. `handleColorByChange`** — depth 2 · orphan-root

```text
🚀 handleColorByChange(color: EventGroupLevel | undefined): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:57]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**91. `handleColorsChange`** — depth 2 · orphan-root

```text
🚀 handleColorsChange(enabled: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:60]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**92. `handleDateChange`** — depth 2 · orphan-root

```text
🚀 handleDateChange(date: Date): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:63]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**93. `handleFilterChange`** — depth 2 · orphan-root

```text
🚀 handleFilterChange(filter: EventFilterQuery): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:66]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**94. `handleGroupingChange`** — depth 2 · orphan-root

```text
🚀 handleGroupingChange(group: EventGrouping): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:69]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**95. `handleScaleChange`** — depth 2 · orphan-root

```text
🚀 handleScaleChange(scale: "day" | "week" | "month" | "quarter" | "year"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:72]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**96. `handleSymbolsChange`** — depth 2 · orphan-root

```text
🚀 handleSymbolsChange(symbols: CalendarSymbols): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:75]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**97. `handleViewChange`** — depth 2 · orphan-root

```text
🚀 handleViewChange(view: "day" | "week" | "month" | "three-day" | "agenda" | "timeline"): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:81]
  └─> updateSearch(change: Partial<CalendarSearch>, replace?: boolean): void [projects/caelundas/caelundas-web/src/hooks/use-calendar-search/use-calendar-search.ts:26]
```

**98. `findConstellations`** — depth ≥ 2 · orphan-root

```text
🚀 findConstellations(): Promise<ConstellationListing[]> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:65]
  └─> map(…)(row: Readonly<Record<string, unknown>>): ConstellationListing [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:68]
```

**99. `findNightSky`** — depth ≥ 2 · orphan-root

```text
🚀 findNightSky(): Promise<{ segments: ConstellationSegment[]; stars: StarRow[]; }> [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:80]
  └─> map(…)(row: Readonly<Record<string, unknown>>): ConstellationSegment [projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:87]
```

**100. `localDate`** — depth 2 · orphan-root

```text
🚀 localDate(instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:24]
   ↳ The calendar day an instant falls on in a zone, as `YYYY-MM-DD`.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:55]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**101. `localHour`** — depth 2 · orphan-root

```text
🚀 localHour(instant: unknown, timeZone: unknown): null | number [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:31]
   ↳ The hour of the day an instant falls in in a zone, from 0 to 23.
  └─> formatLocalPart(part: LocalPart, instant: unknown, timeZone: unknown): null | string [projects/caelundas/caelundas-web/src/components/events-calendar/events-database-local-time.utilities.ts:55]
     ↳ Writes one part of an instant in a zone, keeping one formatter per part and zone, or `null` when the instant or the…
```

**102. `localWeekday`** — depth 2 · orphan-root

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
| `buildNightSky` | 8 | `resolveOptions`, `computeGeometry`, `selectStars`, `computeMotion`, `buildViewport`, `formatConstellationLines`, `assembleSvg`, `formatEcliptic` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:68` |
| `compileDerivedRule` | 8 | `compileRange`, `readDateRange`, `compileDurationRule`, `readTexts`, `readIntegerRange`, `compileSetRule`, `compileTextRule`, `readIntegers` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-derived.utilities.ts:30` |
| `CalendarTimeline` | 8 | `useBarDialog`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `useCallback(…)`, `useMemo(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.tsx:92` |

<details>
<summary>314 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `CalendarGrid` | 8 | `useCalendarClusters`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)`, `toEventCalendarView`, `getViewLayout`, `useCallback(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-grid.tsx:61` |
| `compileRule` | 7 | `isNumberOperator`, `compileTagNumberRule`, `compileTagRule`, `readTexts`, `isDerivedNumberRule`, `compileDerivedNumberRule`, `compileDerivedRule` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-compiler.utilities.ts:75` |
| `toggleTag` | 7 | `findIndex(…)`, `measureTags`, `filter(…)`, `coverLeaves`, `fillFromLeaves`, `numberAt`, `readPicks` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:94` |
| `loadCalendar` | 7 | `resolveWindows`, `findFacetsCached`, `resolveDefaultFilter`, `compileEventFilter`, `resolveGroups`, `findEventsCached`, `describeEmptiness` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-loader.utilities.ts:41` |
| `toTimelineRows` | 7 | `map(…)`, `map(…)`, `buildEventGroups`, `placeGroupRows`, `map(…)`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline.utilities.ts:59` |
| `readStroke` | 6 | `isHexadecimalColor`, `isFiniteNumber`, `normalizeHexadecimalColor`, `clampNumber`, `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:253` |
| `useNightSky` | 6 | `useNightSkyEngine`, `useWindowSize`, `useSyncExternalStore(…)`, `useMemo(…)`, `useEffect(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:32` |
| `buildEventGroups` | 6 | `find(…)`, `collectGroups`, `describeGroup`, `map(…)`, `toSorted(…)`, `toGroupNodes` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-tree.utilities.ts:29` |
| `compileTagNumberRule` | 5 | `isRangeOperator`, `readNumberRange`, `readSingleNumber`, `compileNumberCondition`, `replace(…)` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:93` |
| `CalendarColorBy` | 5 | `useMemo(…)`, `find(…)`, `toGroupLevel`, `createColorScheme`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-by.tsx:44` |
| `toConstellationWords` | 5 | `every(…)`, `filter(…)`, `every(…)`, `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:220` |
| `readCalendarSearch` | 5 | `normalizeEventFilter`, `parseGrouping`, `parseTimelineScale`, `parseCalendarSymbols`, `parseCalendarView` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-search/calendar-search.utilities.ts:35` |
| `IndexPage` | 5 | `useMemo(…)`, `useMemo(…)`, `getDefaultCalendarView`, `readTimeZone`, `useCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:113` |
| `formatEcliptic` | 4 | `splitIntoRuns`, `traceEcliptic`, `normalizeHexadecimalColor`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-ecliptic.utilities.ts:24` |
| `formatConstellationLines` | 4 | `filter(…)`, `map(…)`, `formatStroke`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-lines.utilities.ts:29` |
| `resolveOptions` | 4 | `resolveAppearance`, `resolveView`, `resolveLineStyle`, `resolveEcliptic` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-options.utilities.ts:15` |
| `assembleSvg` | 4 | `formatSpin`, `formatGlowGroup`, `formatStarGroups`, `formatSkyDefinitions` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:158` |
| `renderStar` | 4 | `projectSkyPoint`, `isOnVisibleRing`, `starRadius`, `colorBucketOf` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:424` |
| `readNightSkyOverrides` | 4 | `normalizeHexadecimalColor`, `readNumber`, `readConstellationNames`, `readStrokes` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:101` |
| `compileDerivedNumberRule` | 4 | `isRangeOperator`, `readNumberRange`, `readSingleNumber`, `compileNumberCondition` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-numbers.utilities.ts:28` |
| `useFilterQuery` | 4 | `useMemo(…)`, `getDefaultFilter`, `isSameEventFilter`, `toLinkedEventFilter` | `projects/caelundas/caelundas-web/src/hooks/use-filter-query/use-filter-query.ts:27` |
| `getTagStates` | 4 | `measureTags`, `coverLeaves`, `fillFromLeaves`, `numberAt` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:49` |
| `createEventGroupFields` | 4 | `describeRoot`, `map(…)`, `createTagOptions`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:27` |
| `createColorScheme` | 4 | `find(…)`, `map(…)`, `listTags`, `listValues` | `projects/caelundas/caelundas-web/src/components/calendar-color-by/calendar-color-schemes.utilities.ts:32` |
| `NightSkyConstellationFolder` | 4 | `map(…)`, `readFolderState`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-folder.tsx:39` |
| `SkeletonBody` | 4 | `map(…)`, `map(…)`, `map(…)`, `from(…)` | `projects/caelundas/caelundas-web/src/components/calendar-skeleton/skeleton-body.tsx:29` |
| `getViewWindows` | 4 | `joinWindows`, `getTimelineDays`, `getVisibleDays`, `shiftDays` | `projects/caelundas/caelundas-web/src/components/events-calendar/calendar-window.utilities.ts:58` |
| `useCalendarNavigation` | 4 | `isDayShown`, `formatCalendarDate`, `useMemo(…)`, `useCallback(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-navigation/use-calendar-navigation.ts:23` |
| `CalendarEventRow` | 4 | `getEventLabel`, `formatEventTime`, `formatDuration`, `formatEventSpan` | `projects/caelundas/caelundas-web/src/components/calendar-event-row/calendar-event-row.tsx:39` |
| `VirtualList` | 4 | `useMemo(…)`, `getVirtualWindow`, `useEffect(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/virtual-list/virtual-list.tsx:54` |
| `clusterRow` | 4 | `toSorted(…)`, `collectRun`, `toCluster`, `previewEvents` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-clusters.utilities.ts:63` |
| `getVisibleTimelineRows` | 4 | `getVirtualWindow`, `getRowOffsets`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-timeline/calendar-timeline-window.utilities.ts:19` |
| `clusterEvents` | 4 | `toSorted(…)`, `getRunKey`, `mergeRuns`, `toSorted(…)` | `projects/caelundas/caelundas-web/src/hooks/use-calendar-clusters/calendar-clusters.utilities.ts:29` |
| `EventsCalendar` | 4 | `useCalendarNavigation`, `useMemo(…)`, `useMemo(…)`, `useMemo(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-calendar.tsx:99` |
| `findEvents` | 4 | `replace(…)`, `replace(…)`, `flatMap(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:43` |
| `toEventRecord` | 4 | `readText`, `readRequiredText`, `readDate`, `from(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:133` |
| `select` | 4 | `startWorker`, `listen`, `addEventListener(…)`, `anonymous` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:34` |
| `splitIntoRuns` | 3 | `projectSkyPoint`, `isOnVisibleRing`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-projection.utilities.ts:50` |
| `selectStars` | 3 | `filter(…)`, `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:455` |
| `CalendarCollectionPicker` | 3 | `compileEventFilter`, `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/calendar-collection-picker/calendar-collection-picker.tsx:42` |
| `toTagTreeRows` | 3 | `readDepth`, `toTagTreeRow`, `countSelectedBelow` | `projects/caelundas/caelundas-web/src/components/filter-tag-editor/event-filter-tag-tree.utilities.ts:121` |
| `useTagPicker` | 3 | `useState(…)`, `toTagTreeRows`, `getTagStates` | `projects/caelundas/caelundas-web/src/hooks/use-tag-picker/use-tag-picker.ts:29` |
| `CalendarFilters` | 3 | `useFilterQuery`, `countActiveEventFilterRules`, `renderFiltersButton` | `projects/caelundas/caelundas-web/src/components/calendar-filters/calendar-filters.tsx:59` |
| `toTagField` | 3 | `isNumericFacet`, `describeRoot`, `createTagOptions` | `projects/caelundas/caelundas-web/src/components/calendar-filters/event-filter-fields.utilities.ts:98` |
| `resolveEventGrouping` | 3 | `find(…)`, `some(…)`, `resolveLevel` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/event-group-fields.utilities.ts:104` |
| `GroupLevelRow` | 3 | `find(…)`, `hasTagOptions`, `describeTags` | `projects/caelundas/caelundas-web/src/components/calendar-group-by/group-level-row.tsx:46` |
| `splitConstellations` | 3 | `toSorted(…)`, `filter(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:107` |
| `toggleConstellations` | 3 | `listShownConstellations`, `every(…)`, `toConstellationWords` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:160` |
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
| `loader` | 3 | `getCalendarReloadKey`, `loadCalendar`, `validateCalendarSearch` | `projects/caelundas/caelundas-web/src/routes/index.tsx:72` |
| `addEventListener(…)` | 3 | `then(…)`, `then(…)`, `select` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:83` |
| `map(…)` | 2 | `splitIntoRuns`, `interpolate` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-lines.utilities.ts:35` |
| `interpolate` | 2 | `toVector`, `from(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-lines.utilities.ts:69` |
| `colorFromIndex` | 2 | `find(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:240` |
| `computeGeometry` | 2 | `limitFieldOfView`, `tangentOfHalfAngle` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:267` |
| `useEffect(…)` | 2 | `catch(…)`, `then(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-engine.ts:28` |
| `describeNightSkyProblems` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:29` |
| `findUnknownConstellationNames` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:47` |
| `readConstellationNames` | 2 | `filter(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:224` |
| `useEffect(…)` | 2 | `findUnknownConstellationNames`, `describeNightSkyProblems` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:92` |
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
| `listShownConstellations` | 2 | `map(…)`, `filter(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.utilities.ts:45` |
| `useNightSkySettings` | 2 | `useCallback(…)`, `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:18` |
| `useEffect(…)` | 2 | `catch(…)`, `then(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-settings.ts:45` |
| `NightSkyConstellationPicker` | 2 | `listShownConstellations`, `splitConstellations` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-constellation-picker.tsx:33` |
| `NightSkyMenu` | 2 | `useNightSkySettings`, `map(…)` | `projects/caelundas/caelundas-web/src/components/night-sky-menu/night-sky-menu.tsx:56` |
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
| `findNightSky` | 2 | `map(…)`, `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:80` |
| `toDataset` | 2 | `readDate`, `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:120` |
| `createBrowserEventsDatabase` | 2 | `createEventsDatabase`, `createWorkerSqlExecutor` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database-browser.utilities.ts:20` |
| `select` | 2 | `catch(…)`, `openDatabase` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.worker.ts:62` |
| `formatSkyDefinitions` | 1 | `normalizeHexadecimalColor` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:14` |
| `normalizeHexadecimalColor` | 1 | `from(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-colors.utilities.ts:31` |
| `formatPolyline` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-projection.utilities.ts:10` |
| `projectSkyPoint` | 1 | `tangentOfHalfAngle` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-projection.utilities.ts:32` |
| `map(…)` | 1 | `formatPolyline` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-ecliptic.utilities.ts:39` |
| `traceEcliptic` | 1 | `from(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-ecliptic.utilities.ts:63` |
| `from(…)` | 1 | `toEclipticPoint` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-ecliptic.utilities.ts:64` |
| `map(…)` | 1 | `formatPolyline` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-lines.utilities.ts:43` |
| `formatStroke` | 1 | `normalizeHexadecimalColor` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-lines.utilities.ts:56` |
| `from(…)` | 1 | `toSkyPoint` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky-lines.utilities.ts:73` |
| `computeLocalSiderealDegrees` | 1 | `computeGreenwichMeanSiderealHours` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:126` |
| `computeStartingSiderealDegrees` | 1 | `computeLocalSiderealDegrees` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:142` |
| `buildDebugViewport` | 1 | `formatDebugOverlay` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:188` |
| `buildViewport` | 1 | `buildDebugViewport` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:208` |
| `formatDebugOverlay` | 1 | `formatRing` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:314` |
| `formatGlowGroup` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:336` |
| `formatStarGroups` | 1 | `from(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:377` |
| `from(…)` | 1 | `colorFromIndex` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:389` |
| `map(…)` | 1 | `renderStar` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:463` |
| `filter(…)` | 1 | `isRendered` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/night-sky.utilities.ts:464` |
| `useNightSkyEngine` | 1 | `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky-engine.ts:18` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:53` |
| `selectConstellationSegments` | 1 | `filter(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:163` |
| `filter(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:170` |
| `clampNumber` | 1 | `isFiniteNumber` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:194` |
| `map(…)` | 1 | `normalizeConstellationName` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:231` |
| `readStrokes` | 1 | `readStroke` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.utilities.ts:287` |
| `useWindowSize` | 1 | `useEffect(…)` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:12` |
| `useEffect(…)` | 1 | `measure` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-window-size.ts:21` |
| `select` | 1 | `readNightSkyOverrides` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:37` |
| `useMemo(…)` | 1 | `selectConstellationSegments` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:53` |
| `useEffect(…)` | 1 | `isFieldOfViewCut` | `projects/caelundas/caelundas-web/src/hooks/use-night-sky/use-night-sky.ts:79` |
| `NightSkyBackdropMount` | 1 | `useNightSky` | `projects/caelundas/caelundas-web/src/components/night-sky-backdrop/night-sky-backdrop-mount.tsx:23` |
| `OutsideDataset` | 1 | `format` | `projects/caelundas/caelundas-web/src/components/calendar-empty/outside-dataset.tsx:32` |
| `transform(…)` | 1 | `flatMap(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.constants.ts:195` |
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
| `useMemo(…)` | 1 | `createEventFilterFields` | `projects/caelundas/caelundas-web/src/routes/index.tsx:123` |
| `useMemo(…)` | 1 | `parseCalendarDate` | `projects/caelundas/caelundas-web/src/routes/index.tsx:133` |
| `describeDataset` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:37` |
| `map(…)` | 1 | `toDataset` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:40` |
| `replace(…)` | 1 | `toGroupColumns` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:49` |
| `map(…)` | 1 | `toEventRecord` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:62` |
| `findConstellations` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:65` |
| `findFacets` | 1 | `toFacets` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:71` |
| `readDate` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:97` |
| `from(…)` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:139` |
| `toFacets` | 1 | `readRequiredText` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:156` |
| `toGroupColumns` | 1 | `map(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:185` |
| `map(…)` | 1 | `replace(…)` | `projects/caelundas/caelundas-web/src/components/events-calendar/events-database.utilities.ts:187` |
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

![Lines of Code](https://img.shields.io/badge/Lines_of_Code-30671-22c55e?style=flat-square)
![Repository Size](https://img.shields.io/badge/Repository_Size-1.05_MB-6b7280?style=flat-square)
![Folders](https://img.shields.io/badge/Folders-47-4a4a4a?style=flat-square)
![Source Files](https://img.shields.io/badge/Source_Files-400-3178c6?style=flat-square)

### TypeScript

![TypeScript Files](https://img.shields.io/badge/TypeScript_Files-400-3178c6?style=flat-square)
![Interfaces](https://img.shields.io/badge/Interfaces-147-0ea5e9?style=flat-square)
![Generic Declarations](https://img.shields.io/badge/Generic_Declarations-2-0369a1?style=flat-square)
![Enums](https://img.shields.io/badge/Enums-0-f97316?style=flat-square)
![Decorators](https://img.shields.io/badge/Decorators-0-db2777?style=flat-square)
![Doc Comments](https://img.shields.io/badge/Doc_Comments-760-6366f1?style=flat-square)
![Static Methods](https://img.shields.io/badge/Static_Methods-0-166534?style=flat-square)

### JavaScript

![JavaScript Files](https://img.shields.io/badge/JavaScript_Files-0-f7df1e?style=flat-square)
![Test Files](https://img.shields.io/badge/Test_Files-103-10b981?style=flat-square)
![External Packages](https://img.shields.io/badge/External_Packages-18-8b5cf6?style=flat-square)
![Classes](https://img.shields.io/badge/Classes-2-7c3aed?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-1921-16a34a?style=flat-square)
![Methods](https://img.shields.io/badge/Methods-9-15803d?style=flat-square)
![Sync Functions](https://img.shields.io/badge/Sync_Functions-1667-4ade80?style=flat-square)
![Async Functions](https://img.shields.io/badge/Async_Functions-263-059669?style=flat-square)
![Constants](https://img.shields.io/badge/Constants-1544-dc2626?style=flat-square)
![Imports](https://img.shields.io/badge/Imports-1198-0284c7?style=flat-square)
![Exported Symbols](https://img.shields.io/badge/Exported_Symbols-652-ea580c?style=flat-square)
![Comments](https://img.shields.io/badge/Comments-1816-64748b?style=flat-square)
![Comment Lines](https://img.shields.io/badge/Comment_Lines-3198-475569?style=flat-square)
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
![JSON Lines](https://img.shields.io/badge/JSON_Lines-185-ca8a04?style=flat-square)
![JSON Objects](https://img.shields.io/badge/JSON_Objects-47-7c3aed?style=flat-square)
![JSON Arrays](https://img.shields.io/badge/JSON_Arrays-15-8b5cf6?style=flat-square)
![JSON Properties](https://img.shields.io/badge/JSON_Properties-117-0284c7?style=flat-square)
![JSON Strings](https://img.shields.io/badge/JSON_Strings-100-16a34a?style=flat-square)
![JSON Numbers](https://img.shields.io/badge/JSON_Numbers-2-059669?style=flat-square)
![JSON Booleans](https://img.shields.io/badge/JSON_Booleans-6-0ea5e9?style=flat-square)
![JSON Nulls](https://img.shields.io/badge/JSON_Nulls-0-64748b?style=flat-square)
![JSON Items](https://img.shields.io/badge/JSON_Items-50-475569?style=flat-square)
![JSON Nodes](https://img.shields.io/badge/JSON_Nodes-170-dc2626?style=flat-square)
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
![Constants Files](https://img.shields.io/badge/Constants_Files-74-ea580c?style=flat-square)
![Types Files](https://img.shields.io/badge/Types_Files-65-db2777?style=flat-square)
![Utilities Files](https://img.shields.io/badge/Utilities_Files-77-0ea5e9?style=flat-square)
![TypeORM Entities](https://img.shields.io/badge/TypeORM_Entities-0-059669?style=flat-square)
![Unit Tests](https://img.shields.io/badge/Unit_Tests-44-ca8a04?style=flat-square)
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
![Markdown Lines](https://img.shields.io/badge/Markdown_Lines-425-1f6feb?style=flat-square)
![H1](https://img.shields.io/badge/H1-1-7c3aed?style=flat-square)
![H2](https://img.shields.io/badge/H2-6-8b5cf6?style=flat-square)
![H3](https://img.shields.io/badge/H3-9-a78bfa?style=flat-square)
![H4](https://img.shields.io/badge/H4-0-c4b5fd?style=flat-square)
![H5](https://img.shields.io/badge/H5-0-ddd6fe?style=flat-square)
![H6](https://img.shields.io/badge/H6-0-ede9fe?style=flat-square)
![Paragraphs](https://img.shields.io/badge/Paragraphs-57-64748b?style=flat-square)
![Lists](https://img.shields.io/badge/Lists-4-16a34a?style=flat-square)
![List Items](https://img.shields.io/badge/List_Items-39-22c55e?style=flat-square)
![Task List Items](https://img.shields.io/badge/Task_List_Items-0-4ade80?style=flat-square)
![Tables](https://img.shields.io/badge/Tables-1-0284c7?style=flat-square)
![Table Rows](https://img.shields.io/badge/Table_Rows-7-0ea5e9?style=flat-square)
![Links](https://img.shields.io/badge/Links-11-059669?style=flat-square)
![Images](https://img.shields.io/badge/Images-0-10b981?style=flat-square)
![Code Blocks](https://img.shields.io/badge/Code_Blocks-6-dc2626?style=flat-square)
![Inline Code](https://img.shields.io/badge/Inline_Code-143-ef4444?style=flat-square)
![Block Quotes](https://img.shields.io/badge/Block_Quotes-0-ca8a04?style=flat-square)
![Thematic Breaks](https://img.shields.io/badge/Thematic_Breaks-0-a16207?style=flat-square)
<!-- codometer:end -->

<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses that the root glossary does not define, regenerated with `nx run caelundas-web:coinagerie-check:write`.

- **above**: Places a region higher on screen, such as the one toolbar that sits above every calendar view without remounting.
- **act**: Imported from Testing Library in unit tests to flush React state updates before the assertions that read them.
- **advance**: Part of the advancedMode prop that calendar filters passes as inline to the vendored filter builder.
- **agenda**: Names the list view that lists events by day, the default view below 768 pixels, windowed over a growing 30-day range.
- **air**: One of the four sign elements used as a filter field, with a value of fire, earth, air or water.
- **align**: Positions popover menus and pickers against their trigger by the start or end value passed to the component.
- **alt**: Short form in the sky settings key altBottom, the lowest altitude the night sky draws, beneath the horizon.
- **altitude**: Height of a star above the horizon in degrees, where the pole observer sees altitude equal declination, shown by the night sky.
- **ancestor**: A tag higher in the tag tree that an event tag is nested under, listed with each event in the tag view.
- **anchor**: Names a date or position a calendar timeline is laid out from, passed as the anchor date prop to the timeline.
- **angle**: Degree rotation the night sky star group is drawn at, derived from sidereal time as the sky turns.
- **animation**: The sole motion driving the night sky star group, which turns as one group from its drawn starting angle.
- **appearance**: Order of first sighting used to list distinct whole numbers in a filter rule, where an empty list marks an unfinished rule.
- **april**: Month name the calendar loader tests use for a seeded window that holds no events, as a negative case.
- **aquarius**: Zodiac sign and constellation name whose sign glyph maps to its icon file in the calendar glyphs.
- **argv**: The process argument list that the events database build script checks for its ingested flag.
- **aria**: Prefix of the accessibility attributes such as aria-label that name the calendar pickers and menus for screen readers.
- **arity**: Filter field setting, many or one, that says whether a rule holds a list of picked values or a single value.
- **arrow**: Keyboard keys that move through the color picker and menus, and the dropdown indicator the menu triggers leave out.
- **article**: Semantic container element that wraps each calendar event row in the list views, one row per event.
- **ascension**: Sky coordinate in hours from 0 to 24, with declination, that positions each star the night sky draws.
- **asin**: JavaScript inverse sine call that yields declination from obliquity and latitude in the night sky ecliptic conversion.
- **aspect**: Angular relationship between two bodies, such as a conjunction or a harmonic, filtered and colored as a tag root.
- **assemble**: Function that joins the night sky parts into one SVG string drawn behind every page.
- **assembly**: Stem of assembleSvg, the night sky helper that joins SVG parts into one string; no standalone assembly term here.
- **astraea**: Asteroid whose name the project does not use in code; it appears only in the glossary list here.
- **astronomical**: Twilight stage, such as Astronomical Dawn or Dusk, that the calendar labels and draws with a glyph icon.
- **axi**: Stem of axis, as in the timeline axis that places markers and the swipe axis on drawers.
- **azimuth**: Compass bearing of a body along the horizon, used by night sky tests to tell the west half from the east.
- **back**: Reverting a setting to its default, such as a key set back to default when a night sky override is removed.
- **backdrop**: The night sky layer drawn behind every page, mounted by the NightSkyBackdrop component.
- **background**: Inline style color painted behind a calendar event row, taken from its record color.
- **badge**: Small label component from the shared presentation package, used by calendar filters to show counts beside a control.
- **bar**: Rectangle spanning the true length of an event in the timeline, packed into lanes so overlapping rectangles never cover each other.
- **bare**: Unwrapped root, the plain div that test helpers render routes beneath in memory-history routers.
- **below**: Names the width range under a breakpoint, such as the agenda below 768 pixels and the bottom sheet for filters.
- **beltane**: Cross-quarter festival date, which the calendar marks with a flower glyph and its own icon image.
- **binovile**: Harmonic aspect at two novile steps that appears in the glossary list but has no code or icon in this project.
- **biquintile**: Aspect of 144 degrees, two quintile steps, drawn with a dedicated 144-degree icon in calendar glyphs.
- **biseptile**: Aspect of about 103 degrees, two septile steps, that the project lists only in its glossary.
- **blue**: Hue the night sky uses for blue-white stars and the default pale line color, mapped from the B-V color index.
- **boomerang**: Emoji-keyed glyph image that the calendar draws for one event category, mapped from the boomerang emoji.
- **border**: Outline drawn around agenda date and group surfaces, through class names that set their edges in the calendar.
- **bottom**: Lower edge of a view, used for the bottom sheet of filters on phones and the altBottom sky limit.
- **bound**: Attaches a value to a ? placeholder in SQL, in order, so queries never splice text in.
- **boundary**: Index splitting an event summary into its glyph symbols and English name, so the name is cut at that index.
- **box**: Bordered square checkbox beside each tag in the filter tag editor, showing a dash when only part of a tag is ticked.
- **breadth**: Callidescope limit on how many calls a callable fans out to, declared as maximumBreadth in its configuration.
- **bright**: Star magnitude cutoff deciding which night sky stars are drawn, along with the glows placed behind the brightest.
- **brightness**: Glyph for the maximum brightness event, keyed by a bright emoji and drawn from maximum-brightness-icon.svg.
- **browser**: Runtime the calendar uses for everything: the SQLite file downloads and queries inside the tab of each visitor.
- **busy**: Page state while a calendar reload runs; the notice waits until the reload settles, rather than replacing the view.
- **butterfly**: Emoji-keyed icon image, butterfly-icon.png, the calendar shows for one of its event label symbols.
- **button**: Clickable control such as the toolbar Filters and Clear buttons, and the view and menu triggers around the calendar.
- **calendar**: Event view component from the shared presentation package that this app wraps for month, week, and agenda layouts.
- **cancer**: Zodiac sign whose ingress event, such as event-sun-ingress-cancer, the filter tests and collections reference by id.
- **capi**: Low-level C-style interface object of the sqlite-wasm build, reached through sqlite3 to create the database file.
- **capricorn**: Zodiac sign whose glyph maps to capricorn-icon.svg, which the calendar icon utilities test checks by name.
- **card**: Stem found only inside cardinal, the modality value for signs, so no separate card concept exists here.
- **cardinal**: Modality value for a zodiac sign, one of cardinal, fixed or mutable, offered as a filter value.
- **cascade**: Tag picker prop that, when true, makes ticking a parent tag tick the tags beneath it; group picker sets it false.
- **cascader**: Nested menu component that the group field picker uses to choose a grouping field, sharing the filter wording.
- **center**: Layout alignment that places agenda date and group content in the middle of their cells with flex classes.
- **channel**: One of the red, green or blue color channels that the night sky converts to a hex pair in its color output.
- **chart**: Word that appears only in this glossary list here; the graphics of the project are a timeline and a night sky SVG.
- **checkbox**: Input that picks a tag in the filter tag editor list, one per tag, labeled by its own name.
- **chevron**: Disclosure icon that opens and closes a night sky constellation folder, beside its checkbox, in the sky menu.
- **chip**: Small colored pill that shows one event in a month cell, plus the removable active filter tokens in the toolbar.
- **chiron**: Centaur asteroid whose symbol maps to chiron-icon.svg in the calendar glyph constants and utility tests.
- **chrome**: Surrounding padding and frame drawn around an agenda event row beside its text, kept in agenda layout constants.
- **circle**: Marker drawn for an instant on the timeline, and a cluster of instants drawn as a circle holding a count.
- **civil**: Twilight stage of dawn or dusk labeled Civil Dawn or Civil Dusk, each with its own calendar glyph icon.
- **clamp**: Limits a value to a range, as the night sky clamps opacity and the calendar window clamps its day count.
- **click**: Pointer activation of a calendar control, exercised in tests with fireEvent, such as opening a cluster dialog.
- **clip**: SVG clip-path that trims an icon shape, such as the undecile 32.7 asset in the icon folder.
- **closest**: DOM method walking up from an element to its nearest ancestor matching a selector, used to find the filter editor.
- **cluster**: Group of nearby events or markers collapsed into one count, which the cluster dialog opens to list its events.
- **combinator**: Field on a filter group that is and or or, joining its child rules into a single condition.
- **combine**: Local helper that joins compiled filter fragments into one SQL condition using the group operator.
- **compact**: Boolean prop on navigation groups that shrinks their controls, such as today, previous and next, to fit a narrow toolbar.
- **comparison**: Operator compiled into SQL for a number-valued field, such as equals, greater than, less than, or between.
- **composite**: Term listed only in this glossary; tags use Compound Aspect, with no separate composite type in code.
- **compound**: Aspect tag under Type and Aspect that the calendar color menu gives its own color.
- **condition**: SQL clause that compileEventFilter builds from each finished filter rule, dropping unfinished rules before the query.
- **configurable**: Property descriptor flag set in test helpers, letting a viewport value be redefined during a test.
- **conjunct**: Aspect name in event summaries, such as Mars Conjunct Venus, used as sample data in calendar row tests.
- **conjunction**: Aspect at zero degrees between two bodies, with harmonic 1 and its own conjunction-0 icon in the glyph map.
- **connect**: Stem seen only inside disconnect calls that tear down the timeline resize and mutation observers.
- **constellation**: Named star pattern the night sky draws with its own lines, from catalog records, listed as folders in the sky menu.
- **contraparallel**: Aspect between bodies with equal declination on opposite sides of the equator; the project lists it only here.
- **cover**: Verb sense for a loaded window whose days span what the view shows, plus a day either side.
- **cradle**: Calendar glyph mapped from the bed emoji to cradle-icon.png, used for one event label in the glyph map.
- **crescent**: Moon phase between new and quarter, offered as a filter value and drawn with waxing or waning crescent icons.
- **crowd**: Threshold at which nearby events merge into one cluster, so the calendar merges only what would overfill the view.
- **cut**: Verb for removing or trimming: a view is added or cut from the list, and night sky rings are cut at the window edge.
- **cycle**: Event type group for recurring rhythms, such as the Daily solar cycle or Daily lunar cycle, used in color and filter paths.
- **dataset**: Events file the calendar reads, a SQLite database built ahead of time and shipped in the static build.
- **dawn**: Twilight start of morning, labeled Astronomical or Civil Dawn, each with its glyph in calendar icon constants.
- **daylight**: Event label for the sun above the horizon, mapped to day-icon.svg as its calendar glyph.
- **db**: Handle to the events SQLite database that the worker opens read-only through the sqlite3 interface.
- **debounce**: Timer delay of 250 milliseconds that waits for window resizing to settle before the night sky remeasures.
- **decan**: Ten-degree third of a zodiac sign, numbered and drawn with the decan digit keycap in calendar glyphs.
- **decile**: Aspect of 36 degrees, one tenth of the circle, drawn with its own decile-36 icon image in calendar glyphs.
- **decimal**: Count of digits after the point in a slider step, used to round values so floating errors never reach the menu.
- **declination**: Angle north or south of the celestial equator, used as the vertical star coordinate, equal to altitude at the pole.
- **decuple**: Tenth-harmonic group of 36-degree aspects, labeled a stellium in the CLI symbol map and absent from this project.
- **degree**: Angle unit for all night sky coordinates, such as the 90-degree default vertical field and full turns.
- **delay**: Pause in milliseconds before an action, such as the calendar tooltip opening after 100 ms and test database answers.
- **derive**: Verb for computing a field from raw data, such as the derived field that holds each event duration.
- **desktop**: Widest layout tier from 1024 pixels, where the view selector sits as buttons and filters open as a popover.
- **detail**: Secondary text under an event label in its tooltip, passed as the details field of the label object.
- **deterministic**: SQLite function flag set true so the local time function returns the same result for the same inputs.
- **device**: Value of width=device-width in the root route viewport meta tag, sizing the page to the phone screen.
- **dialog**: Modal window that lists the events behind a clicked cluster, the calendar cluster dialog component.
- **digit**: Numeric character a decan glyph keeps, drawn with a keycap, after the non-digit prefix is removed.
- **dignity**: Filter field for planet strength in a sign, such as domicile or exaltation, used as a tag root.
- **direction**: Tag root grouping apparent motion of a body, such as direct or retrograde, colored by the calendar Type group.
- **disconnect**: Cleanup call that stops a browser observer from watching, as the timeline does for its resize and mutation observers.
- **distance**: Angular span from the celestial pole, which decides whether the night sky window can show a star ring.
- **div**: Generic HTML block element used for layout boxes in agenda rows and as the root element tests render into.
- **domain**: Tag group recording whether an event belongs to the solar, lunar or planetary sphere, and the Nx domain tag this project carries.
- **down**: Direction toward a lower value, such as the group tree descending to the depth a link asks for.
- **drag**: Pointer gesture the calendar turns off in its interactions, while the night sky slider thumb stays large enough to grab.
- **draw**: Renders graphics for the night sky and timeline, such as stars, lines and markers, into SVG output.
- **drawer**: Side panel that opens the filter builder from 768 pixels wide, with the bottom sheet used on phones.
- **dropdown**: Menu that opens from a toolbar trigger, such as the View, Color and Sky menus or the calendar view options.
- **duodecuple**: Twelfth-harmonic group of 30-degree aspects, labeled a stellium in the CLI symbol map and absent from this project.
- **duration**: Length of an event, read as minutes or a bucket such as a range of hours, used by filters and grouping.
- **dusk**: Evening twilight stage, labeled Astronomical Dusk, Astronomical Twilight Evening or Civil Dusk, each with its own icon.
- **eager**: Setting that loads a module or image up front rather than on demand, such as the glyph icons and database.
- **earth**: Earth-centered reference in the Eclipse Frame filter, and the element name of earth signs in the Element filter.
- **east**: Elongation stage with the planet east of the Sun, drawn as a right arrow glyph, east-elongation-icon.svg.
- **eclipse**: Event type for solar or lunar eclipses, colored red in the Type color scheme and offered in the Eclipse Frame filter.
- **ecliptic**: Yearly path the Sun appears to follow across the sky, drawn as a line with style keys for color and width.
- **effect**: SVG vector-effect set to non-scaling-stroke, so the night sky lines keep their width under zoom.
- **effective**: Filter the loader applies, the search filter when set, otherwise the default resolved from data facets.
- **element**: Classification of a zodiac sign as fire, earth, air or water, offered as a filter field and tag group.
- **eleventh**: Division label, eleventh hexadecan, paired with its own icon in the calendar glyph map.
- **elongation**: Angular distance of a planet from the Sun, its stage shown by east or west arrow glyphs on the calendar.
- **emptiness**: Kind of empty state that decides which notice the calendar shows, such as an empty range or an empty month.
- **enter**: Keyboard key that confirms a pick in the collection picker and filter rows, used by keyboard tests.
- **envelope**: Term listed only in this glossary list; the project has no envelope code or type behind it.
- **epoch**: The reference instant that night-sky code counts astronomical time from: the Unix epoch and J2000.
- **eris**: Dwarf planet Eris, a body whose aspects the CLI's triple-aspect tests tag; the web app never names it.
- **even**: Ordinary English in comments and test names, such as hiding a closed tag's children even when one beneath is open.
- **expand**: The filter tag editor's control that opens a collapsed tag's children, labelled Expand plus the tag's name in the tree.
- **extent**: Half the side of the debug box drawn around the sky's pole, the outer ring radius plus a debug margin.
- **eye**: A Lucide glyph beside one calendar view menu option, hidden from screen readers, which name each control by its label.
- **facet**: An event field with its values, read from the database, that a filter collection chooses to narrow events by.
- **factor**: A multiplier in the night sky's glow and debug constants, such as the glow radius factor, which scales a star's drawn radius.
- **faint**: Dim drawing for stars and figures: the night sky's zodiac figures stay faint so the stars read first.
- **faintest**: The dimmest star magnitude the night sky draws, 6.5 by default, which the sky.maxMag link key can lower.
- **fewer**: Used in the calendar's clustering and timeline comments, as in fewer than fifteen minutes or fewer clusters a view wants.
- **fieldset**: An HTML group element wrapping a calendar color menu's controls and the night sky constellation picker's full-height layout.
- **fifteenth**: Ordinal naming the fifteenth hexadecan event, which the CLI emits and the event glyph table maps to an icon.
- **fifth**: Ordinal naming the fifth hexadecan event, mapped to its own icon file in the event glyph table.
- **figure**: The constellation line drawing, a set of segments per constellation, that the night sky draws over its stars.
- **fill**: An SVG paint attribute, such as fill none on icon roots or the color of drawn night-sky stars.
- **fire**: A value of the Element filter that marks a sign as belonging to the fire element.
- **flatten**: Used by the filter rules' flattenFilterRules, which turns a nested filter query into one flat list of rules.
- **flip**: Negation in the number filter: a negated rule tells its caller to flip the comparison.
- **float**: The decimal-reading call Number.parseFloat, which the night sky's tests use to read a rotation angle back out of the SVG.
- **floor**: The Math.floor rounding that splits minutes into whole days and hours, and that the virtual list's binary search uses.
- **focal**: The body a pattern points at, such as a T-square's apex, named in the event filter's Focal Body field.
- **focus**: Used for the browser focus state in tests, where a calendar tooltip opens when an event's symbols receive focus.
- **follow**: Plain English in comments for one value tracking another, such as the day and view following the link at once.
- **footer**: The bottom bar of the group-by field picker, rendered as a CascaderFooter beneath its options.
- **fov**: The vertical angle in degrees the night sky shows, set by the sky.vFov link key read from the page link.
- **fraction**: The 0 to 1 share of one step between two sky points, used to interpolate constellation line segments.
- **frame**: A call-stack frame, which the filter compiler avoids adding per nested group by looping instead of calling back.
- **free**: A timeline lane is free at a bar's start when its last bar ended by then, so the bar can take it.
- **galaxy**: The Lucide icon, drawn as a galaxy, on the night sky menu's toolbar button that opens the Sky controls.
- **gantt**: The bar-chart layout the calendar timeline uses to place events across each day's time columns.
- **gap**: The spacing between a flex or grid layout's items, set with Tailwind gap utilities such as gap-2 in the calendar.
- **gemini**: The zodiac sign of the twins, mapped from ♊ to its icon and drawn as a night-sky constellation figure.
- **geocentric**: An Earth-centered eclipse marker, drawn as a globe emoji with its own SVG icon in the event glyph table.
- **geometry**: The SkyGeometry the night sky's ecliptic and constellation line utilities pass in to split paths into visible runs.
- **gibbous**: The Moon's phase between quarter and full, as the phase filter and its waxing and waning icons name it.
- **glow**: The soft halo drawn behind a bright star, sized by the glow radius factor and tinted by the sky's glow color.
- **glyph**: A calendar event's symbol drawn from the event glyph table, such as a planet sign or a Moon phase icon.
- **gonggong**: A trans-Neptunian dwarf planet whose name no source or test file uses; only the glossary mentions it.
- **grand**: Part of a three-or-more-body aspect pattern name, like grand trine or grand cross, in the collections and icon table.
- **green**: Not a color name in this project; it appears only inside the Greenwich mean sidereal time function name.
- **greenwich**: The mean sidereal time at Greenwich, in hours, which night-sky code computes by hand to place stars.
- **grid**: The skeleton layout the month view takes: a grid of days, against columns for week and hour views.
- **grind**: Not used in this project's source, where it appears only as a glossary headword with no code behind it.
- **gte**: Greater-than-or-equal, the numeric filter operator that matches values at or above a bound, such as hour gte 22.
- **gutter**: The left column of a calendar grid, the data-slot time gutter, holding the hour labels down each day's rows.
- **half**: A half-open span of time: start is included and end is not, as the events database type states.
- **hammer**: The event glyph for the hammer emoji, mapped to its PNG icon file in the calendar icon table.
- **handle**: The filter tag tree's row control that opens or closes a tag's children, absent while searching.
- **harmonic**: A numbered aspect family, such as Harmonic 4, whose tags the calendar filters and agenda group under Type.
- **hebe**: A main-belt asteroid whose name no source or test file uses, leaving only the glossary headword.
- **height**: The vertical size of the night-sky SVG, set from its options and used to place the sky's pole.
- **hexadecan**: A sixteenth-harmonic point of the zodiac, named by ordinal such as Fifth Hexadecan, which the CLI emits as an event.
- **hexadecimal**: A base-16 color form, such as #rrggbb, that the night-sky color settings read as three or six digits.
- **hexagram**: The dotted six-pointed star emoji, mapped to its PNG icon in the calendar icon table.
- **high**: The upper index bound of the virtual list's binary search over row offsets, narrowed until it finds the scroll row.
- **highest**: The top bound of a night-sky color index or bucket range, as named by the index and bucket highest constants.
- **history**: The browser history entry the page link writes, replaced by each night-sky settings change instead of extended.
- **horizon**: The zero-altitude line the night sky's view is cut by, with sky.altBottom allowed to reach just below it.
- **hour**: One of 24 clock hours, the unit of the hour color scheme's legend and the hour filter field.
- **hourglass**: The ⏳ emoji event glyph, mapped to its PNG icon in the calendar icon table.
- **html**: The root route's shell, which renders the full page markup as an HTML document around whichever route matches.
- **hydrate**: The React hydrateRoot call in the client entry that attaches interactivity to server-rendered markup.
- **hygiea**: A main-belt asteroid no source or test file names, so this headword lives only in the glossary.
- **hypot**: The JavaScript call that takes the square root of summed squares, measuring distance on the projected sky.
- **icon**: An image asset, a PNG or SVG file, that the calendar icon table maps each event symbol to.
- **imbolc**: The cross-quarter festival of early February, mapped to its PNG icon in the event glyph table.
- **incomplete**: A filter rule missing its operator, values, or field, which the compiler turns into no SQL at all.
- **indeterminate**: The checkbox partial state, shown when a tag row's children are only partly picked, set by the indeterminate prop.
- **indicator**: A Cascader prop that the group-by field picker sets to false, hiding the selection indicator beside each option.
- **infinite**: The timeline's infiniteScroll prop, set to false so the calendar timeline never grows its range on scroll.
- **infinity**: A non-finite number the night-sky tests guard against, asserting the SVG never contains NaN or Infinity text.
- **ingest**: The caelundas-cli step that calculates and stores events, which the web build's ingested configuration then copies.
- **ingress**: A planet's entry into a new zodiac sign, tagged Type / Ingress so the calendar can color and filter it.
- **inscribe**: A shape drawn inside another; the unused icon files name such designs, like hourglass-inscribed-icon.png.
- **instant**: A zero-length event: a moment with no duration, which the duration filter and legend list as Instant.
- **integer**: A whole-number check in the number filter, which accepts a value only when Number.isInteger holds and it is within bounds.
- **interaction**: Switches the timeline passes to the event calendar that turn off drag, resize and slot selection.
- **interpolate**: Computes points between two constellation vertices by sampling steps, so each figure segment draws as a smooth curve.
- **intl**: The JavaScript internationalization API the calendar uses for en-US plural rules and number and day formatting.
- **invalidate**: Asks the router to reload the current route's data through router.invalidate, skipped when only sky keys change.
- **inverse**: The opposite operator a filter field pairs with each one, such as isNoneOf as the inverse of isAnyOf.
- **iso**: The standard date-time string format, with a year-first order, that the events database stores instants in.
- **ixion**: A trans-Neptunian plutino dwarf planet, not named in any source or test file, so only the glossary records it.
- **j2000**: The standard astronomical reference date of 1 January 2000 that the night-sky star catalog's coordinates are measured from.
- **julian**: Day-number system, counting Julian days from a fixed origin, that the night sky converts instants into.
- **jump**: The calendar-empty action that moves the view to the nearest dates the data covers, when the view is outside them.
- **juno**: The asteroid symbol ⚵ mapped to juno-icon.svg in the event glyph table, so that body's events get an icon.
- **jupiter**: The planet symbol ♃ mapped to jupiter-icon.svg in the event glyph table, and named in glyph test event titles.
- **keyboard**: Input by arrow and letter keys, which the night-sky menu keeps working and the tag editor uses to toggle focused rows.
- **keycap**: The combining mark U+20E3 that turns a decan's digit into a keycap symbol, drawn in the event glyph table.
- **kite**: An aspect pattern shape named in the focal body filter, whose emoji 🪁 maps to kite-icon.png.
- **know**: Plain English in code comments, such as a field the calendar does not know being skipped rather than failing.
- **labelledby**: The ARIA attribute that points a night-sky color field or slider at its visible label for screen readers.
- **lamma**: The cross-quarter festival at 135 degrees, emitted as a CLI event and mapped to a PNG icon in the web glyph table.
- **lane**: A horizontal track in the calendar timeline; each bar takes the first lane free at its start, so bars never overlap.
- **lang**: The HTML root's language attribute, set to en, so browsers and screen readers know the document is English.
- **late**: Plain English for a time near day's end, as the hour filter tests name events from 22 to 23 hours.
- **later**: Plain English here, but an agenda row of kind later is the button that lists later events.
- **latitude**: The observer's north-south angle, read from sky.lat to place the night sky, and a column of each calendar event.
- **leaf**: A tag or group with no children, which stands for itself: a leaf is its own group at any depth below it.
- **legend**: The key of a color scheme's values and swatches, listed beside the calendar's color-by picker and its color menu.
- **leo**: The zodiac sign of the lion, whose ♌ glyph maps to leo-icon.svg and tags events as Sign / Leo.
- **li**: A list item element, one per legend entry in the calendar color-by panel's legend list.
- **libra**: The scales sign of the zodiac, ♎ mapped to libra-icon.svg, and a constellation folder the night-sky picker lists.
- **lilith**: The Black Moon point, the lunar apogee body whose ⚸ glyph maps to its SVG icon in the glyph table.
- **litha**: The summer solstice festival whose 🌞 emoji maps to litha-icon.png in the event glyph table.
- **longitude**: The observer's east-west angle, read from sky.lon to place the night sky, and the zodiacal longitude of an event.
- **loose**: Plain English in tests, such as the timeline window test's loose bar, which starts and ends at the same instant.
- **low**: The lower index bound of the virtual list's binary search over row offsets, moved up as the search narrows.
- **lowest**: The altitude floor the night sky's bottom edge can sit at, set by sky.altBottom and kept below the horizon.
- **lte**: Less-than-or-equal, the numeric filter operator matching values at or below a bound, such as hour lte 23.
- **lunar**: Tied to the Moon: the daily and monthly lunar cycle tags, colored by the calendar's color-by scheme.
- **mabon**: The autumn equinox festival whose 🍂 emoji maps to mabon-icon.png in the calendar's event glyph table.
- **mag**: The magnitude unit suffix, written as mag after a star's brightness value in the night-sky menu's labels.
- **magnitude**: A star's brightness on the astronomical scale, lower being brighter, stored per star and capped by the faintest-star setting.
- **makemake**: A dwarf planet of the Kuiper belt that no source or test file names, leaving only this glossary entry.
- **many**: Plain English in comments, and the filter field arity marking a field that takes several values at once.
- **mar**: The three-letter month abbreviation in date ranges like Mar 4, 10:20 AM, that the calendar's formatters print.
- **march**: A month name in the agenda's day headings, such as Wednesday, March 4, 2026, and in date filter tests.
- **margin**: The clearance a cut keeps past the pole or the window's edge, such as the debug margin and the pole's own margin.
- **marker**: The dot a timeline draws for an event or a cluster of events, with its width set by the scale.
- **markup**: A section comment, tagged with a paint palette emoji, that opens the JSX output of a calendar component.
- **mask**: The CSS property that shapes an event glyph's icon image so its color comes from the glyph's own style.
- **mean**: Averaged, as in the mean sidereal time the night sky computes by hand for star positions, not the apparent kind.
- **measure**: Plain English for measuring: the callidescope config's TODO to measure the app's stacks before setting its limits.
- **measurement**: The counts and figures a night-sky build reports back, such as starsDrawn, segmentsDrawn, and the field-of-view clamp.
- **memo**: A value React caches between renders, so the navigation hook reads its state outside the memo to avoid extra frames.
- **menu**: A popover of controls: the calendar color menu, the night-sky Sky menu, and the view menu, each opened from a toolbar button.
- **mercury**: The innermost planet, named in the calendar's color scheme tests and in a Mercury retrograde filter fixture.
- **middle**: The midpoint index of the virtual list's binary search, computed as the average of low and high, then checked against offsets.
- **mismatch**: A star the night-sky test finds drawn at a position the window does not show, which the test expects to be none.
- **modality**: A zodiac sign's quality, cardinal, fixed or mutable, offered as a filter field and tag group for events.
- **month**: The calendar's month view, a grid of days, and a color-by scheme that groups events by the calendar month.
- **moon**: Tag path naming the Moon, whose events a without-the-Moon collection excludes from its planetary aspect set.
- **more**: Plain English in comments, such as the agenda's button that lists more days when its end is reached.
- **morning**: One half of the Time of Day filter, which splits events between morning and evening, with dawn twilight icons.
- **motion**: A tag root for planetary movement, with Direct and retrograde children that the event filter fixtures and tests use.
- **mount**: The night-sky backdrop component that renders the sky into the page, exported as NightSkyBackdropMount.
- **move**: The calendar navigation action that shifts the view through time, reported back by each view as it moves.
- **ms**: A Tailwind logical margin-start utility, such as ms with a percentage offset, that offsets a loading skeleton bar from its start edge.
- **multiple**: The night sky's realTimeMultiple, how many times faster than the real sky the backdrop turns.
- **multiselectable**: The ARIA flag marking the filter tag editor as a listbox where a user may choose several tags together.
- **mutable**: One of the three sign modalities, alongside cardinal and fixed, offered as a value in the event filters.
- **mutation**: Watch for DOM changes via a MutationObserver, so the timeline re-attaches its measurement when rows change.
- **mystic**: Name root of the aspect pattern whose door emoji maps to a PNG icon in the event glyph set.
- **nadir**: Event name for the lowest point of the Sun or a planet below the horizon, shown with a down-arrow icon.
- **narrow**: A width too small for the row tags to fit side by side, so they wrap onto more lines.
- **native**: The built-in title text the calendar gives each event, unless a setting drops it.
- **nature**: Classification of an aspect as hard, soft or neutral, used as a filter field and a tag color group.
- **nautical**: Sun-altitude twilight events, the Dawn, Dusk and Evening variants, each mapped to its own SVG icon.
- **nav**: Stem of the navigation words, as in CascaderNav and the calendar navigation group component.
- **navigate**: Accessible name of the toolbar group holding the previous, today and next buttons.
- **navigation**: The view-moving controls and their CalendarNavigation type that the toolbar passes to its group.
- **needle**: The lowercased search text a group tag picker matches against each option label.
- **negate**: Flip a filter rule so a negated rule compiles to the opposite of its condition.
- **negative**: The polarity of a sign, either positive or negative, offered as a filter value.
- **neptune**: A planet whose glyph and icon label its events, as in Moon sextile Neptune.
- **neq**: The not-equal operator a filter rule uses, compiled into a SQL condition for numeric fields.
- **nessus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **night**: The sky between sunset and dawn, shown as the night-sky backdrop that the calendar draws behind events.
- **ninth**: Hexadecan-division label for the ninth harmonic, mapped to its own SVG icon among the glyphs.
- **nonuple**: Stellium label for a cluster of nine bodies, mapped to a symbol in the stellium constants.
- **normal**: The default, unaltered night-sky drift speed compared against a faster one in a backdrop test.
- **north**: The lunar north node glyph, mapped to its own SVG icon, and the north pole facing the sky view.
- **nothing**: The empty result of a filter or view, shown as a state with an offer to clear the filters.
- **notify**: Call each registered listener with the new media query match, as the test viewport helper does.
- **novile**: Harmonic aspect at 40 degrees, the ninth harmonic, named in event labels such as Sun novile Pluto.
- **numeric**: Field kind whose values are numbers, so filters compare them with equality and ordering operators.
- **obliquity**: Tilt of the Earth axis, a constant that turns ecliptic longitude into equatorial coordinates.
- **observe**: Attach a ResizeObserver or MutationObserver so the timeline re-measures when its body changes size.
- **observer**: The viewer position on Earth, from which local times, horizons and eclipses are measured.
- **occurrence**: Which repeat of a recurring event a timeline bar shows, passed down into the bar content component.
- **octile**: An aspect at 45 degrees, the eighth harmonic, mapped to its own PNG icon.
- **octuple**: Stellium label for a cluster of eight bodies, mapped to a symbol in the stellium constants.
- **off**: The disabled state of a toggle, such as turning colors off so events keep no color.
- **offer**: To present a choice to the user, such as the operators a derived field offers in filters.
- **oldest**: The least recently used entry of the events loader cache, evicted first when it grows too large.
- **onchange**: React change callback each filter, color and group control fires with its next selected value.
- **ongoing**: Flag for an event already begun but not yet ended, so the agenda shows Ongoing in place of its time.
- **opacity**: Transparency setting, applied as Tailwind opacity classes or SVG attributes to dim details and icons.
- **operand**: A value a filter rule compares, such as a bound of a numeric range or a set of tags.
- **operator**: The comparison a filter rule applies, such as is any of, chosen per field type.
- **ophicus**: Constellation name for a body or sign outside the twelve zodiac signs, unused by any code here.
- **opposition**: The 180-degree aspect, harmonic 2, mapped to its own PNG icon in the glyph set.
- **orcus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **ostara**: Seasonal festival event, the spring equinox name here, mapped to a PNG icon in the glyph set.
- **overflow**: Tailwind classes that let a long list or menu scroll inside a fixed height instead of growing.
- **overlie**: Verb for one layer lying over another, used in no code here and kept only as a glossary entry.
- **overscan**: Extra rows rendered beyond the visible window in each direction, so fast scrolling shows no blank gap.
- **pad**: Inner spacing around agenda row content, counted in the row height constants.
- **palette**: The ordered list of colors a color scheme hands out in turn to each new value.
- **palla**: Asteroid Pallas, named in event labels such as Mars biquintile Pallas, with its own glyph.
- **passive**: Option for a scroll listener that never calls preventDefault, letting the browser scroll smoothly.
- **peak**: Summit of an ingress event, shown with a mountain glyph and its own SVG icon.
- **pentagram**: The star glyph for a five-pointed pattern, mapped to its own PNG icon in the glyph set.
- **period**: The date range the calendar is showing, such as a month or week, named in empty-state messages.
- **phase**: Lunar or planetary cycle stage, a filter and color field grouping events by cycle position.
- **pholus**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **pi**: The mathematical constant Math.PI, used to convert degrees into radians for the night-sky math.
- **pill**: A small rounded tag chip in the agenda, sized by its character count, which wraps onto more lines.
- **pisce**: Zodiac sign whose glyph maps to its own SVG icon, and a constellation listed in the sky menu.
- **pixel**: A screen unit, such as a scroll offset in CSS pixels, used by the virtual list to find visible rows.
- **place**: A position in a color legend where values without one take their color from their own text.
- **planet**: A celestial body whose glyph, name and events the calendar shows, such as Mars or Jupiter.
- **plural**: Chooses the singular or plural form of a count label through Intl.PluralRules for en-US.
- **pluto**: Dwarf-planet body whose glyph maps to its own SVG icon and appears in event names.
- **polar**: Relating to a celestial pole such as the bottom polar degrees the night-sky projection computes.
- **polarity**: Whether a zodiac sign is positive or negative, offered as a filter field and a color group.
- **pole**: The north celestial pole at the top of the night-sky view, where altitude equals declination.
- **polyline**: The SVG line shape drawing each constellation figure as a connected run of stars.
- **popover**: The floating panel that opens over the calendar for a filter builder or event tooltip.
- **posix**: Sqlite-wasm call that writes the database bytes into the worker in-memory file system.
- **prefer**: A browser media preference, such as reduced motion, read to turn off animations like the sky drift.
- **preload**: Router flag for loading a route ahead of a visit, which the landing page loader must not count as a visit.
- **prerender**: Vite and TanStack Start setting that renders the static shell page ahead of time at build.
- **presentation**: The shared UI primitives package of Button and Skeleton, which the app imports from.
- **press**: Activating a control, such as the agenda last-row button that loads more days.
- **prev**: The handler that moves the calendar back one period, wired to the navigation group back button.
- **prevent**: Keep a linter or formatter from checking a generated file, as the route tree header comment advises.
- **prograde**: Direction of a planet moving forward through the zodiac, mapped to its own SVG icon.
- **projection**: Math that maps sky coordinates onto the flat night-sky view, in the night-sky projection utilities.
- **prop**: React inputs passed to a component, named as properties in this codebase rather than props.
- **propagation**: Stopping an event from bubbling up to parent handlers, such as on a tag row click.
- **quadruple**: Stellium label for four bodies clustered together, mapped to a PNG icon in the glyph set.
- **quaoar**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **quarter**: Calendar quarter of the year, a group field keying events like 2026-Q1, and a Moon phase.
- **quiet**: Class string that hides the timeline bar labels, keeping the timeline uncluttered.
- **quincunx**: The 150-degree minor aspect, mapped to its own PNG icon in the glyph set.
- **quintile**: The 72-degree aspect, a fifth-harmonic, mapped to its own PNG icon in the glyph set.
- **quintuple**: Label for the CLI quintuple aspects module, computing five-fold harmonic aspect groupings.
- **radial**: A radialGradient SVG fill, the star glow and ground shading drawn behind the night sky.
- **radian**: The unit of angle in the night-sky math, with the radians-per-degree constant converting degrees into it.
- **radio**: Single-choice menu items, a DropdownMenuRadioGroup used for picking one calendar view at a time.
- **radius**: Distance from the pole to a declination ring, in pixels, used when drawing the night sky.
- **ratio**: Number relating two quantities, used for no named value here; it appears only as a glossary entry.
- **recover**: Restore the events database after a test made every read fail, returning reads to normal.
- **rect**: SVG rectangle element, used for the night-sky ground and the icon background fill.
- **rectangle**: Shape word in the Mystic Rectangle aspect name, mapped to its own PNG icon via a door emoji.
- **red**: Color name used in night-sky tests, including one value that tries to inject markup into the SVG.
- **rel**: Link relation attribute on the root route stylesheet entry, which loads the app CSS.
- **reload**: Dev-server mode with hot reload, and the loader reload on night-sky setting changes.
- **rem**: CSS unit of root font size, used for indent and timeline marker widths in the calendar.
- **removable**: Flag that hides the remove control on a group level row, set false for the color-by list.
- **rerender**: Re-run a React Testing Library render with new props, to check a component updates in place.
- **resize**: Dragging a timeline bar edge to change its length, turned off by the timeline interactions setting.
- **respond**: Posts a result or error from the events worker back to the page, matched to its request id.
- **restoration**: Router setting that returns the page to its previous scroll spot on back navigation.
- **retrograde**: Apparent backward motion of a planet, a station event with its own icon in the glyph set.
- **reverse**: Order a list the opposite way, via toReversed, for agenda and timeline row trees.
- **ring**: A circle of the night-sky projection, such as the ecliptic ring or a declination ring.
- **rise**: A planet stage relative to the Sun, such as rising or setting, in the planetary phase filter.
- **role**: ARIA attribute on a status or alert region, so screen readers announce empty and error states.
- **rotation**: The sidereal rotation rate of the Earth, in radians per second, a constant for the sky clock.
- **route**: A TanStack Router page definition, such as the index route whose loader reads the events database.
- **same**: Ordinary English word, here meaning a value equal to another, as in tests comparing two colors.
- **samhain**: Seasonal festival event at a cross-quarter day, mapped to its own PNG icon in the glyph set.
- **sample**: A small slice of rows or stars passed to a test, such as a StarRow list fed to buildNightSky.
- **saturn**: Ringed planet whose glyph and aspect events, such as Mars squares, appear across the calendar.
- **scale**: The zoom level of the timeline, such as day, week or month, chosen in the scale select.
- **scheme**: A set of colors that assigns palette entries to each value of the color-by field.
- **scorpio**: Zodiac sign of the scorpion, whose glyph maps to its own SVG icon in the glyph set.
- **scorpius**: Constellation figure name in the sky menu and tests, drawn as one of the star-line figures.
- **screen**: The Testing Library object that queries the rendered DOM, used in every component unit test.
- **scroll**: Movement of a list visible window, which the virtual list recomputes on each scroll event.
- **scrollbar**: Styled bar that a timeline or virtual list keeps over its spacer, shown as a rail and thumb.
- **season**: A filter and color field giving the time of year an event falls in, such as spring.
- **sedna**: Trans-Neptunian body name that no code in this project uses, so it survives only as a glossary entry.
- **selector**: A control that picks one option from a list, such as the view or scale menu in the toolbar.
- **semisextile**: The 30-degree minor aspect, mapped to its own PNG icon in the glyph set.
- **septile**: The 51.43-degree aspect, a seventh harmonic, mapped to its own PNG icon in the glyph set.
- **septuple**: Stellium label for a cluster of seven bodies, mapped to a symbol in the stellium constants.
- **seventh**: Hexadecan-division label for the seventh harmonic, mapped to its own SVG icon in glyphs.
- **sextile**: The 60-degree aspect, a harmonic-six pattern, shown in event names with the star glyph.
- **sextuple**: Stellium label for six bodies clustered together, mapped to its own PNG icon in the glyph set.
- **sheet**: A bottom or side panel that holds the filter builder on narrow screens, below 768 pixels.
- **should**: Ordinary English modal in comments describing expected behavior, such as what a link holds.
- **sibling**: A neighboring element under the same parent, which focus moves between in the tag picker.
- **side**: The edge of a surface a panel or tooltip opens from, such as the bottom side of a sheet.
- **sidereal**: Star-based clock, computed per observer, that sets which part of the night sky is overhead.
- **sin**: The sine function from Math.sin, used in night-sky math to project coordinates onto the view.
- **single**: Describes one item or key rather than many, such as a timeline set to single scheduling.
- **skeleton**: Placeholder loading layout shown in each calendar view while events load, one grid per view.
- **sky**: The night-sky backdrop behind the calendar and its settings, such as sky.top, sky.lat and sky.lon.
- **slider**: Range control in the night-sky menu, bound to one sky setting such as its drift speed or magnitude.
- **slot**: Data attribute naming a component part, such as data-slot=button-group, used by styles and tests.
- **slow**: Used in tests for a delayed read, such as a move whose database answer arrives late.
- **south**: The descending lunar node glyph, mapped to its own SVG icon beside the north node.
- **spa**: Vite single-page application mode, in which the build renders one shell page and every route renders in the browser.
- **space**: Blank room a layout leaves for the calendar, or the word gap in an event summary.
- **span**: An inline HTML span element, or the length of time a timeline bar or cluster covers.
- **speak**: Comment verb for a stale loader answer that would still stand in for days no longer shown.
- **spin**: Animated rotation group of the night sky, left empty when the still option freezes it.
- **spirit**: Name that no code in this project uses, so it survives only as a glossary entry.
- **spread**: A test array of timeline bars placed far apart, to check that clustering leaves them separate.
- **square**: The 90-degree aspect, a harmonic-four pattern, shown in event names beside its glyph.
- **ssr**: Server-side rendering flag on a route, set false so the app renders in the browser only.
- **stamp**: A fixed timestamp constant that test database rows use, so their dates are stable across runs.
- **stand**: Ordinary English verb in fixture descriptions, such as two planets standing ninety degrees apart.
- **star**: Celestial point in the night sky, as in the morning-star and evening-star icons and the sky backdrop.
- **station**: Point where a planet turns between direct and retrograde motion, a Type and Motion value.
- **stellium**: Cluster of three or more bodies in one sign or spot, named by its count and given a glyph icon.
- **still**: Option or flag that freezes the night-sky drift, leaving the stars in place.
- **store**: Verb for how the calendar keeps its filter tree, as one condition of the ReUI filter tree.
- **stroke**: SVG stroke attribute that outlines each glyph shape in the bundled icon files.
- **structural**: Reuse of unchanged objects between router results, so a search keeps the same identity.
- **sub**: Prefix or fragment, as in subgroup, subtree and sub-group; in the code it names nested levels.
- **subscribe**: Register a viewport listener, so a component re-renders when the window width crosses a breakpoint.
- **subtree**: The DOM option that watches all descendants of an observed node, passed to the MutationObserver.
- **summarize**: Test helper that turns grouped nodes into label and count strings for assertions.
- **sun**: Central body of the solar system, whose glyph and events label Sun-relative stages and twilight.
- **sunday**: Weekday label numbered zero, the first day of the week in SQLite numbering used by filters.
- **svg**: Vector image format of the glyph icon files and the sky backdrop, drawn as inline elements.
- **swipe**: Touch gesture axis the filter drawer reads, set through a swipe-axis data attribute in its classes.
- **symbolic**: Test fixture record for an event row shown as symbols only, with its name left out.
- **synodic**: Planet-with-Sun cycle label, a filter field and tag group for each planet stage.
- **tab**: Keyboard Tab key, which the night-sky menu uses to leave its panel and move focus on.
- **tablet**: Mid-width screen size between phone and desktop, where the calendar changes its menus and filter layout.
- **tan**: The tangent function, Math.tan, used by the night-sky projection to map a half angle onto the view.
- **tangent**: Half-angle value the night-sky projection computes from degrees, used to place points on its view.
- **taurus**: Zodiac sign of the bull, whose glyph maps to its own SVG icon, and a constellation in the sky menu.
- **temporality**: Derived filter field classing an event as past, ongoing or upcoming relative to the current time.
- **ten**: Number ten, as in the ten-degree decan and the hour-of-day filter tests.
- **testid**: Attribute naming a DOM node for tests, such as data-testid on the agenda row.
- **third**: The ten-degree decan of a zodiac sign, offered as a filter value.
- **thirteenth**: Hexadecan-division label for the thirteenth harmonic, mapped to its own SVG icon in glyphs.
- **three**: The number three, as in the triple stellium and the aspects among three bodies.
- **through**: End bound of an agenda day range, which is excluded from the days listed.
- **thursday**: Weekday label numbered four, in the SQLite order the filter weekday field uses.
- **timeline**: The Gantt-style view of events as bars on a scrollable axis, grouped by type then planet.
- **today**: Navigation button that jumps to the current period, switched off while that period is shown.
- **toggle**: Switch control that flips one setting on or off, such as a color menu switch with aria-checked.
- **toolbar**: The control row above the calendar views, holding navigation, filters, color and view menus.
- **tooltip**: The hover popup with an event name, symbols and details, drawn as a popover over its chip.
- **top**: Upper edge of a surface or background, as in the sky.top color and the timeline viewport.
- **trace**: Function that walks the night-sky ecliptic and returns its sky points for drawing.
- **track**: A timeline lane that keeps the row height steady as its bars come and go.
- **trail**: Days past the end of a month kept in the loaded window, fixed at 14 for the month view.
- **transform**: Attribute that rotates or moves SVG icon shapes, as in the icon matrix values.
- **transition**: React startTransition call that hydrates the app as a low-priority update, keeping the page responsive.
- **trapeze**: Four-body aspect pattern that no code in this project uses, so only this glossary names it.
- **tridecile**: The 108-degree aspect, mapped to its own PNG icon in the glyph set.
- **trine**: The 120-degree aspect, a harmonic-three pattern, shown in event names with a triangle glyph.
- **trioctile**: The 135-degree aspect, mapped to its own PNG icon in the glyph set.
- **triple**: Compound aspect group of three bodies, mapped to the three-body stellium icon.
- **triseptile**: A 154.29-degree aspect in the seventh-harmonic family, which no code in this project uses.
- **tune**: To adjust a visual setting, such as the sky backdrop balance between stars and legibility.
- **twelve**: Count of the zodiac signs, used to check all twelve constellation boxes at once in the sky menu.
- **twice**: Two times over, as a tag listed a second time for one event counts only once.
- **twilight**: Sun-altitude dusk and dawn stage, a Type value with civil, nautical and astronomical bands.
- **typhon**: Centaur body name that no code in this project uses, so it survives only as a glossary entry.
- **ul**: The unordered HTML list element, which the color-by menu uses for its legend entries.
- **undecile**: The 32.7-degree aspect, an eleventh-harmonic pattern, shown in event names with its own SVG icon.
- **undecuple**: Stellium label for eleven bodies clustered together, mapped to a symbol in the stellium constants.
- **unfiltered**: The full event list before any filter is applied, used to decide what an empty state says.
- **ungrouped**: Agenda or view shown without grouping, the flat list of days and events the groups replace.
- **unix**: The 1970 origin of Unix time, whose Julian day the night-sky clock computes from.
- **unmeasured**: Stand-in size used before a virtual list is measured, a 720 by 640 default height and width.
- **unobserve**: Method that stops a ResizeObserver watching elements, stubbed to ignore in the test setup.
- **unreadable**: Marker for an event whose time zone the database cannot read, used in filter tests.
- **unsupported**: Error for a browser lacking a needed feature, shown by the error view as an unsupported browser.
- **uranus**: Ice giant body whose glyph maps to its own SVG icon in the glyph set.
- **ursa**: Constellation prefix in names such as Ursa Major, a figure the sky menu can draw.
- **variant**: Style option of a button or badge, such as outline, passed to the presentation components.
- **variation**: Unicode modifier after a symbol that picks its text or emoji look, used in glyph keys.
- **vector**: Three-part unit array representing a sky point, built before the night-sky projection.
- **vendored**: Copied third-party code kept in this repository, such as the calendar and filter chip row.
- **vertical**: Top-to-bottom gradient that fills the sky backdrop between its top and bottom colors.
- **vesta**: Asteroid body whose glyph maps to its own SVG icon in the event glyph set.
- **viewport**: The browser visible area, whose width the calendar reads to choose its layout and breakpoints.
- **vigintile**: A 18-degree aspect, a twentieth-harmonic division, which no code in this project uses.
- **virgo**: Zodiac sign of the maiden, whose glyph maps to its own SVG icon, and a constellation in the sky menu.
- **visibility**: Eclipse filter field saying whether an eclipse is measured from Earth center or the observer.
- **visible**: Shown on screen, such as the visible rows the virtual list computes for its window.
- **want**: Stem of the wanted set in the night-sky menu, the constellation names the user asked to draw.
- **water**: Elemental class of a zodiac sign, one of fire, earth, air or water, offered as a filter value.
- **weak**: Fragment of WeakMap, the garbage-collected cache keyed by database objects in the loader.
- **webkit**: Vendor prefix on the WebkitMask CSS property that masks each event glyph with its icon file.
- **week**: Seven-day span the week view shows, named in empty-state phrases such as this week.
- **weekday**: Calendar day of the week as a grouping and color field, such as Monday through Sunday.
- **west**: Elongation glyph pointing left for a planet west of the Sun, mapped to its own SVG icon.
- **whole**: Entire filter tree, written back to the link on every edit rather than a partial change.
- **width**: Horizontal size of an element, such as an SVG icon, a timeline column or the viewport.
- **window**: The slice of rows or days currently loaded and rendered, held by the calendar and virtual list.
- **within**: Inside a range or bound, such as events starting within an hour, as the filter operator.
- **year**: Calendar year, a group and color field that keys events by the year they fall in.
- **yod**: Compound aspect pattern, the Yod, a Compound Aspect variant in the color path tests.
- **yule**: Seasonal festival event at the winter solstice, mapped to its own PNG icon in the glyph set.
- **zenith**: Point directly overhead, shown as an upward-arrow event glyph with its own SVG icon.
- **zodiac**: Twelve signs along the ecliptic, the sky backdrop default constellation set and a filter group.
- **zone**: The IANA time zone that event local times are read in, passed to agenda rows and filters.
- **zoom**: Timeline scale change, the amount of time a marker width covers at a given zoom level.

<!-- coinagerie:end -->
