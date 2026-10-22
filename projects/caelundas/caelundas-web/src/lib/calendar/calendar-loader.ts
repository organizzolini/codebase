import { getMonthWindow, parseCalendarDate } from "./calendar-window";

import type {
  CalendarEventRecord,
  EventsDatabase,
  EventsDataset,
  EventsWindow,
} from "../events-database/events-database.types";

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
  window: EventsWindow;
}

/**
 * Why a loaded window shows no events, so the page can say which: the
 * database holds none, the window lies outside the dates it covers, or
 * nothing in the window matches.
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
  | { kind: "match" };

/**
 * Reads the events around the day a search parameter names, together with
 * the dataset's span and zone.
 */
export async function loadCalendarMonth(
  database: EventsDatabase,
  date: string | undefined,
): Promise<CalendarData> {
  const anchor = parseCalendarDate(date, new Date());
  const window = getMonthWindow(anchor);
  const [dataset, events] = await Promise.all([
    database.describeDataset(),
    database.findEvents({ window }),
  ]);
  const emptiness = describeEmptiness({ dataset, events, window });

  return { anchor, dataset, emptiness, events, window };
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
