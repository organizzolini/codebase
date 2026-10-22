import {
  DEFAULT_EVENT_FILTER_COLLECTION_ID,
  EVENT_FILTER_COLLECTIONS,
  resolveEventFilterCollection,
} from "../event-filters/event-filter-collections";
import { compileEventFilter } from "../event-filters/event-filter-compiler";
import { compileEventGrouping } from "../event-groups/event-group-compiler";
import {
  createEventGroupFields,
  getDefaultGrouping,
  resolveEventGrouping,
} from "../event-groups/event-group-fields";

import { getViewWindows, parseCalendarDate } from "./calendar-window";

import type { EventFilterQuery } from "../event-filters/event-filters.types";
import type { EventGroupLevel } from "../event-groups/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDatabase,
  EventsDataset,
  EventsQuery,
  EventsWindow,
} from "../events-database/events-database.types";
import type { CalendarSearch } from "./calendar-search";

const FACETS_BY_DATABASE = new WeakMap<EventsDatabase, Promise<EventFacet[]>>();

const EVENTS_BY_DATABASE = new WeakMap<
  EventsDatabase,
  Map<string, Promise<CalendarEventRecord[]>>
>();

// Enough recent windows to step back and forth through a few months, or
// views, without reading any of them twice.
const CACHED_READS = 24;

/**
 * Everything the calendar page renders from one load.
 */
export interface CalendarData {
  anchor: Date;
  dataset: EventsDataset | null;
  /**
   * Set only when no events were found.
   */
  emptiness: CalendarEmptiness | null;
  events: CalendarEventRecord[];
  /**
   * Every tag root and the tags beneath it, which the filters offer.
   */
  facets: EventFacet[];
  /**
   * The filter the events were read through: the link's, or the default
   * collection's when the link names none.
   */
  filter: EventFilterQuery | undefined;
  /**
   * Whether a filter with at least one finished rule narrowed the events.
   */
  filtered: boolean;
  /**
   * The levels each event's `groups` were read for: the link's grouping, or
   * the view's default, holding only fields the data has.
   */
  grouping: EventGroupLevel[];
  window: EventsWindow;
}

/**
 * Why a loaded window shows no events, so the page can say which: the
 * database holds none, the window lies outside the dates it covers, the
 * filters leave nothing, or nothing in the window exists at all.
 */
export type CalendarEmptiness =
  | {
      dataset: EventsDataset;
      /**
       * The covered day nearest the window: the first for a window before
       * the data, the last for one after it.
       */
      jumpTo: Date;
      kind: "range";
    }
  | { kind: "database" }
  | { kind: "filter" }
  | { kind: "match" };

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
  const facets = await findFacetsOnce(database);
  const effectiveFilter = search.filter ?? resolveDefaultFilter(facets);
  const filter = compileEventFilter(effectiveFilter);
  const grouping = resolveGrouping(search, facets);
  const [dataset, events] = await Promise.all([
    database.describeDataset(),
    findEventsCached(database, {
      filter,
      groups: compileEventGrouping(grouping),
      window,
    }),
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
 * Reads a database's facets once and keeps them for every later load: they
 * change only with the data, not with the filter or the month. A failed read
 * is forgotten, so Retry reads them again.
 */
async function findFacetsOnce(database: EventsDatabase): Promise<EventFacet[]> {
  let facets = FACETS_BY_DATABASE.get(database);

  if (facets === undefined) {
    facets = database.findFacets();
    FACETS_BY_DATABASE.set(database, facets);
    facets.catch(() => {
      FACETS_BY_DATABASE.delete(database);
    });
  }

  return facets;
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
