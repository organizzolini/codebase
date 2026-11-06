import {
  DEFAULT_EVENT_FILTER_COLLECTION_ID,
  EVENT_FILTER_COLLECTIONS,
} from "../calendar-filters/event-filter-collections.constants";
import { resolveEventFilterCollection } from "../calendar-filters/event-filter-collections.utilities";
import { toEventFilterInput } from "../calendar-filters/event-filter-input.utilities";
import {
  createEventGroupFields,
  getDefaultGrouping,
  resolveEventGrouping,
} from "../calendar-group-by/event-group-fields.utilities";

import {
  CACHED_READS,
  DATASET_CACHE,
  EVENTS_CACHE,
  FACETS_CACHE,
} from "./calendar-loader.constants";
import { getViewWindows, parseCalendarDate } from "./calendar-window.utilities";
import {
  describeDataset,
  findEvents,
  findFacets,
} from "./events-api.utilities";

import type { CalendarSearch } from "../../hooks/use-calendar-search/calendar-search.types";
import type { EventFilterQuery } from "../calendar-filters/event-filters.types";
import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type { CalendarData, CalendarEmptiness } from "./calendar-loader.types";
import type { EventsReadQuery } from "./events-api.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
  EventsWindow,
} from "./events-database.types";

/**
 * Forgets every read the loader kept, so the next load asks the API again.
 */
export function clearCalendarCaches(): void {
  DATASET_CACHE.clear();
  EVENTS_CACHE.clear();
  FACETS_CACHE.clear();
}

/**
 * Reads the events in the window the search parameters' view and day show,
 * plus a buffer, that pass their filter, together with the dataset's span
 * and zone, all through the API. Reads go through a cache keyed by window and
 * filter, so going back to a window already seen answers at once.
 */
export async function loadCalendar(
  search: CalendarSearch,
): Promise<CalendarData> {
  const { anchor, visible, window } = resolveWindows(search);
  // The facets are read for the visible days, and the default filter and the
  // grouping are resolved against them, so a later load waits on nothing here.
  const facets = await findFacetsCached(visible);
  const effectiveFilter = search.filter ?? resolveDefaultFilter(facets);
  const filter = toEventFilterInput(effectiveFilter);
  const { colorBy, grouping } = resolveGroups(search, facets);
  const [dataset, events] = await Promise.all([
    readCached(DATASET_CACHE, "dataset", describeDataset),
    findEventsCached({ filter, window }),
  ]);
  const filtered = filter !== null;
  let emptiness = describeEmptiness({ dataset, events, visible });

  // Whether the filters emptied the days, or they hold nothing to filter, is
  // asked only when they are empty, so a filtered window costs no second
  // query.
  if (emptiness?.kind === "match" && filtered) {
    const unfiltered = await findEventsCached({ window });

    if (describeEmptiness({ dataset, events: unfiltered, visible }) === null) {
      emptiness = { kind: "filter" };
    }
  }

  return {
    anchor,
    colorBy,
    dataset,
    emptiness,
    events,
    facets,
    filter: effectiveFilter,
    filtered,
    grouping,
    window,
  };
}

/**
 * Tells why the days a view shows hold no events, or nothing when they hold
 * some. Only those days count, not the buffer read around them.
 */
function describeEmptiness(data: {
  dataset: EventsDataset | null;
  events: readonly CalendarEventRecord[];
  visible: EventsWindow;
}): CalendarEmptiness | null {
  const { dataset, events, visible } = data;

  if (
    events.some(
      (event) => event.start < visible.end && event.end >= visible.start,
    )
  ) {
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

  return { kind: "match" };
}

/**
 * Reads the events for a window and filter through a small cache, keeping
 * the most recent reads. The data never changes while the page is open, so a
 * cached read stays right.
 */
async function findEventsCached(
  query: EventsReadQuery,
): Promise<CalendarEventRecord[]> {
  return readCached(
    EVENTS_CACHE,
    JSON.stringify([
      query.window.start,
      query.window.end,
      query.filter ?? null,
      query.grouping ?? null,
    ]),
    async () => findEvents(query),
  );
}

/**
 * Reads the facets for the days a view shows through a small cache, keeping
 * the most recent windows: the tags are the same whatever the window, but
 * each counts only the events in it.
 */
async function findFacetsCached(window: EventsWindow): Promise<EventFacet[]> {
  return readCached(
    FACETS_CACHE,
    `${window.start.toISOString()}|${window.end.toISOString()}`,
    async () => findFacets(window),
  );
}

/**
 * Answers a read from a cache of promises, starting it when the key is new
 * and keeping the most recent ones. A failed read is forgotten, so Retry
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
 * The filter a link with none opens on: the default collection's, resolved
 * against the data, or nothing when the data has none of the tags it names.
 */
function resolveDefaultFilter(
  facets: readonly EventFacet[],
): EventFilterQuery | undefined {
  const collection = EVENT_FILTER_COLLECTIONS.find(
    (candidate) => candidate.id === DEFAULT_EVENT_FILTER_COLLECTION_ID,
  );

  return collection === undefined
    ? undefined
    : resolveEventFilterCollection(collection, facets)?.filter;
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
 * The day the search anchors on, today without one, and the window the view
 * shows around it, with the buffer read beyond it.
 */
function resolveWindows(search: CalendarSearch): {
  anchor: Date;
  visible: EventsWindow;
  window: EventsWindow;
} {
  const anchor = parseCalendarDate(search.date, new Date());

  return {
    anchor,
    ...getViewWindows(search.view, anchor, {
      agendaDays: search.days,
      scale: search.scale,
    }),
  };
}
