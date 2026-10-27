import {
  CACHED_READS,
  EVENTS_BY_DATABASE,
  FACETS_BY_DATABASE,
} from "../constants/calendar-loader.constants";
import {
  DEFAULT_EVENT_FILTER_COLLECTION_ID,
  EVENT_FILTER_COLLECTIONS,
} from "../constants/event-filter-collections.constants";

import { getViewWindows, parseCalendarDate } from "./calendar-window.utilities";
import { resolveEventFilterCollection } from "./event-filter-collections.utilities";
import { compileEventFilter } from "./event-filter-compiler.utilities";
import { compileEventGrouping } from "./event-group-compiler.utilities";
import {
  createEventGroupFields,
  getDefaultGrouping,
  resolveEventGrouping,
} from "./event-group-fields.utilities";

import type {
  CalendarData,
  CalendarEmptiness,
} from "../types/calendar-loader.types";
import type { CalendarSearch } from "../types/calendar-search.types";
import type { EventFilterQuery } from "../types/event-filters.types";
import type { EventGroupLevel } from "../types/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDatabase,
  EventsDataset,
  EventsQuery,
  EventsWindow,
  SqlGroupSource,
} from "../types/events-database.types";

/**
 * Reads the events in the window the search parameters' view and day show,
 * plus a buffer, that pass their filter, together with the dataset's span
 * and zone. Reads go through a cache keyed by window and filter, so going
 * back to a window already seen answers at once.
 */
export async function loadCalendar(
  database: EventsDatabase,
  search: CalendarSearch,
): Promise<CalendarData> {
  const { anchor, visible, window } = resolveWindows(search);
  // The facets are read once per database, and the default filter and the
  // grouping are resolved against them, so a later load waits on nothing here.
  const facets = await findFacetsCached(database, visible);
  const effectiveFilter = search.filter ?? resolveDefaultFilter(facets);
  const filter = compileEventFilter(effectiveFilter);
  const { colorBy, grouping, groups } = resolveGroups(search, facets);
  const [dataset, events] = await Promise.all([
    database.describeDataset(),
    findEventsCached(database, { filter, groups, window }),
  ]);
  const filtered = filter !== null;
  let emptiness = describeEmptiness({ dataset, events, visible });

  // Whether the filters emptied the days, or they hold nothing to filter, is
  // asked only when they are empty, so a filtered window costs no second
  // query.
  if (emptiness?.kind === "match" && filtered) {
    const unfiltered = await findEventsCached(database, { window });

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
 * Reads the events for a window and filter through a small cache per
 * database, keeping the most recent reads. The data never changes while the
 * page is open, so a cached read stays right; a failed one is forgotten, so
 * Retry reads it again.
 */
async function findEventsCached(
  database: EventsDatabase,
  query: EventsQuery,
): Promise<CalendarEventRecord[]> {
  let cache = EVENTS_BY_DATABASE.get(database);

  if (cache === undefined) {
    cache = new Map();
    EVENTS_BY_DATABASE.set(database, cache);
  }

  const key = JSON.stringify([
    query.window.start,
    query.window.end,
    query.filter ?? null,
    query.groups ?? [],
  ]);
  let events = cache.get(key);

  if (events === undefined) {
    events = database.findEvents(query);
    events.catch(() => {
      cache.delete(key);
    });
  } else {
    // Moved to the back, so the least recently read goes first.
    cache.delete(key);
  }

  cache.set(key, events);

  for (const oldest of cache.keys()) {
    if (cache.size <= CACHED_READS) {
      break;
    }

    cache.delete(oldest);
  }

  return events;
}

/**
 * Reads a database's facets for the days a view shows through a small cache,
 * keeping the most recent windows: the tags are the same whatever the window,
 * but each counts only the events in it. A failed read is forgotten, so Retry
 * reads it again.
 */
async function findFacetsCached(
  database: EventsDatabase,
  window: EventsWindow,
): Promise<EventFacet[]> {
  let cache = FACETS_BY_DATABASE.get(database);

  if (cache === undefined) {
    cache = new Map();
    FACETS_BY_DATABASE.set(database, cache);
  }

  const key = `${window.start.toISOString()}|${window.end.toISOString()}`;
  let facets = cache.get(key);

  if (facets === undefined) {
    facets = database.findFacets(window);
    facets.catch(() => {
      cache.delete(key);
    });
  } else {
    // Moved to the back, so the least recently read goes first.
    cache.delete(key);
  }

  cache.set(key, facets);

  for (const oldest of cache.keys()) {
    if (cache.size <= CACHED_READS) {
      break;
    }

    cache.delete(oldest);
  }

  return facets;
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
 * The levels each event is read with keys for: the grouping's, then the one
 * the events are colored by, each compiled to its source of keys.
 */
function resolveGroups(
  search: CalendarSearch,
  facets: readonly EventFacet[],
): {
  colorBy: EventGroupLevel | undefined;
  grouping: EventGroupLevel[];
  groups: SqlGroupSource[];
} {
  const grouping = resolveGrouping(search, facets);
  const colorBy = resolveColorBy(search, facets);

  return {
    colorBy,
    grouping,
    groups: compileEventGrouping(
      colorBy === undefined ? grouping : [...grouping, colorBy],
    ),
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
