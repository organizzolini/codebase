import { toEventFilterInput } from "../calendar-filters/event-filter-input.utilities";
import { toPreset } from "../calendar-filters/presets.utilities";
import {
  createEventGroupFields,
  getDefaultGrouping,
  resolveEventGrouping,
} from "../calendar-group-by/event-group-fields.utilities";
import { toEventGroupingInput } from "../calendar-group-by/event-group-input.utilities";

import {
  CACHED_READS,
  CONSTANTS_CACHE,
  EVENTS_CACHE,
  FACETS_CACHE,
} from "./calendar-loader.constants";
import { parseCalendarDate } from "./calendar-window.utilities";
import {
  describeDataset,
  findEvents,
  findFacets,
  findPresets,
  findViewWindows,
} from "./events-api.utilities";

import type { CalendarSearch } from "../../hooks/use-calendar-search/calendar-search.types";
import type { EventFilterQuery } from "../calendar-filters/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/presets.types";
import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { CalendarData, CalendarEmptiness } from "./calendar-loader.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
  Period,
} from "./calendar-records.types";

/**
 * Forgets every read the loader kept, so the next load asks the API again.
 */
export function clearCalendarCaches(): void {
  CONSTANTS_CACHE.clear();
  EVENTS_CACHE.clear();
  FACETS_CACHE.clear();
}

/**
 * Reads the events in the period the search parameters' view and day show,
 * plus a buffer, that pass their filter, together with the dataset's span
 * and zone, all through the API. Reads go through a cache keyed by period and
 * filter, so going back to a period already seen answers at once.
 */
export async function loadCalendar(
  search: CalendarSearch,
): Promise<CalendarData> {
  const { anchor, read, visible } = await resolveWindows(search);
  // The facets are read for the visible days, and the grouping is resolved
  // against them, so a later load waits on nothing here.
  const { dataset, defaultFilter, facets, presets } = await readBasics(visible);
  const effectiveFilter = search.filter ?? defaultFilter;
  const filter = toEventFilterInput(effectiveFilter);
  const { colorBy, grouping } = resolveGroups(search, facets);
  const query = {
    filter,
    grouping: toEventGroupingInput(grouping, colorBy),
    period: read,
  };
  const events = await readCached(
    EVENTS_CACHE,
    JSON.stringify(query),
    async () => findEvents(query),
  );
  const emptiness = await describeEmptiness({
    dataset,
    events,
    filtered: filter !== null,
    period: read,
    visible,
  });

  return {
    anchor,
    colorBy,
    dataset,
    emptiness,
    events,
    facets,
    filter: effectiveFilter,
    filtered: filter !== null,
    grouping,
    period: read,
    presets,
  };
}

/**
 * Tells why the days a view shows hold no events, or nothing when they hold
 * some. Only those days count, not the buffer read around them. Whether the
 * filters emptied the days, or they hold nothing to filter, is asked only
 * when they are empty and filtered, so a filtered period costs no second
 * query.
 */
async function describeEmptiness(data: {
  dataset: EventsDataset | null;
  events: readonly CalendarEventRecord[];
  filtered: boolean;
  period: Period;
  visible: Period;
}): Promise<CalendarEmptiness | null> {
  const { dataset, events, filtered, period, visible } = data;

  if (events.some((event) => isShown(event, visible))) {
    return null;
  }

  if (dataset === null) {
    return { kind: "database" };
  }

  if (visible.end <= dataset.start) {
    return { dataset, jumpTo: dataset.start, kind: "range" };
  }

  if (visible.start > dataset.end) {
    return { dataset, jumpTo: dataset.end, kind: "range" };
  }

  if (!filtered) {
    return { kind: "match" };
  }

  const everything = { period };
  const unfiltered = await readCached(
    EVENTS_CACHE,
    JSON.stringify(everything),
    async () => findEvents(everything),
  );

  return unfiltered.some((event) => isShown(event, visible))
    ? { kind: "filter" }
    : { kind: "match" };
}

/**
 * Whether an event overlaps the days a view shows.
 */
function isShown(event: CalendarEventRecord, visible: Period): boolean {
  return event.start < visible.end && event.end >= visible.start;
}

/**
 * Reads what the loader needs before the events: the facets of the days the
 * view shows, and what holds whatever the period, the dataset and the
 * presets.
 */
async function readBasics(visible: Period): Promise<{
  dataset: EventsDataset | null;
  defaultFilter: EventFilterQuery | undefined;
  facets: EventFacet[];
  presets: ResolvedPreset[];
}> {
  const [facets, constants] = await Promise.all([
    readCached(
      FACETS_CACHE,
      `${visible.start.toISOString()}|${visible.end.toISOString()}`,
      async () => findFacets(visible),
    ),
    readCached(CONSTANTS_CACHE, "constants", readConstants),
  ]);

  return { ...constants, facets };
}

/**
 * Answers a read from a cache of promises, starting it when the key is new
 * and keeping the most recent ones. The data never changes while the page is
 * open, so a cached read stays right; a failed one is forgotten, so Retry
 * reads it again.
 */
async function readCached<TValue>(
  cache: Map<string, Promise<TValue>>,
  key: string,
  read: () => Promise<TValue>,
): Promise<TValue> {
  let value = cache.get(key);

  if (value === undefined) {
    value = read();
    value.catch(() => {
      cache.delete(key);
    });
  } else {
    // Moved to the back, so the least recently read goes first.
    cache.delete(key);
  }

  cache.set(key, value);

  for (const oldest of cache.keys()) {
    if (cache.size <= CACHED_READS) {
      break;
    }

    cache.delete(oldest);
  }

  return value;
}

/**
 * Reads the dataset, and the presets the calendar offers with the filter
 * of the one it opens on, which the API resolved against the data: none when
 * the data has none of the tags that preset names.
 */
async function readConstants(): Promise<{
  dataset: EventsDataset | null;
  defaultFilter: EventFilterQuery | undefined;
  presets: ResolvedPreset[];
}> {
  const [dataset, { defaultPreset, presets: found }] = await Promise.all([
    describeDataset(),
    findPresets(),
  ]);
  const presets: ResolvedPreset[] = [];

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const preset of found) {
    presets.push(toPreset(preset));
  }

  return {
    dataset,
    defaultFilter:
      defaultPreset === null ? undefined : toPreset(defaultPreset).filter,
    presets,
  };
}

/**
 * The level the search colors events by, kept to a field the data has, or
 * nothing for the default of type, kind by kind.
 */
function resolveColorBy(
  search: CalendarSearch,
  facets: readonly EventFacet[],
): EventGroupLevel | undefined {
  return search.color === undefined
    ? undefined
    : resolveEventGrouping([search.color], createEventGroupFields(facets))[0];
}

/**
 * The grouping the search's view shows: the link's, or the view's default,
 * kept to the fields the data has. Only the agenda and the timeline group;
 * with no view, the agenda a phone opens on is grouped.
 */
function resolveGrouping(
  search: CalendarSearch,
  facets: readonly EventFacet[],
): EventGroupLevel[] {
  const view = search.view ?? "agenda";

  if (view !== "agenda" && view !== "timeline") {
    return [];
  }

  const fields = createEventGroupFields(facets);

  return resolveEventGrouping(
    search.group ?? getDefaultGrouping(view, fields),
    fields,
  );
}

/**
 * The grouping the search's view shows and the level it colors events by.
 */
function resolveGroups(
  search: CalendarSearch,
  facets: readonly EventFacet[],
): {
  colorBy: EventGroupLevel | undefined;
  grouping: EventGroupLevel[];
} {
  return {
    colorBy: resolveColorBy(search, facets),
    grouping: resolveGrouping(search, facets),
  };
}

/**
 * The day the search anchors on, today without one, and the period the view
 * shows around it, with the buffer read beyond it.
 */
async function resolveWindows(search: CalendarSearch): Promise<{
  anchor: Date;
  read: Period;
  visible: Period;
}> {
  const anchor = parseCalendarDate(search.date, new Date());

  return {
    anchor,
    ...(await findViewWindows({
      agendaDays: search.days,
      anchor,
      scale: search.scale,
      view: search.view,
    })),
  };
}
