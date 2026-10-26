import { compileEventFilter } from "../event-filters/event-filter-compiler";

import { getMonthWindow, parseCalendarDate } from "./calendar-window";

import type {
  CalendarEventRecord,
  EventFacet,
  EventsDatabase,
  EventsDataset,
  EventsWindow,
} from "../events-database/events-database.types";
import type { CalendarSearch } from "./calendar-search";

const FACETS_BY_DATABASE = new WeakMap<EventsDatabase, Promise<EventFacet[]>>();

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
   * Whether a filter with at least one finished rule narrowed the events.
   */
  filtered: boolean;
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
 * Reads the events around the day the search parameters name that pass their
 * filter, together with the dataset's span and zone.
 */
export async function loadCalendarMonth(
  database: EventsDatabase,
  search: CalendarSearch,
): Promise<CalendarData> {
  const anchor = parseCalendarDate(search.date, new Date());
  const window = getMonthWindow(anchor);
  const filter = compileEventFilter(search.filter);
  const [dataset, events, facets] = await Promise.all([
    database.describeDataset(),
    database.findEvents({ filter, window }),
    findFacetsOnce(database),
  ]);
  const filtered = filter !== null;
  let emptiness = describeEmptiness({ dataset, events, window });

  // Whether the filters emptied the month, or it holds nothing to filter, is
  // asked only when it is empty, so a filtered month costs no second query.
  if (emptiness?.kind === "match" && filtered) {
    const unfiltered = await database.findEvents({ window });

    if (unfiltered.length > 0) {
      emptiness = { kind: "filter" };
    }
  }

  return { anchor, dataset, emptiness, events, facets, filtered, window };
}

/**
 * Tells why a window holds no events, or nothing when it holds some.
 */
function describeEmptiness(
  data: Pick<CalendarData, "dataset" | "events" | "window">,
): CalendarEmptiness | null {
  const { dataset, events, window } = data;

  if (events.length > 0) {
    return null;
  }

  if (dataset === null) {
    return { kind: "database" };
  }

  if (window.end <= dataset.start) {
    return { dataset, jumpTo: dataset.start, kind: "range" };
  }

  if (window.start > dataset.end) {
    return { dataset, jumpTo: dataset.end, kind: "range" };
  }

  return { kind: "match" };
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
