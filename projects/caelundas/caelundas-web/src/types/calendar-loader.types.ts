import type { EventFilterQuery } from "./event-filters.types";
import type { EventGroupLevel } from "./event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
  EventsWindow,
} from "./events-database.types";

/**
 * Everything the calendar page renders from one load.
 */
export interface CalendarData {
  anchor: Date;
  /**
   * The level the events are colored by, read for each event after the
   * grouping's levels, or nothing when they are colored by type, kind by
   * kind: the link's, holding only a field the data has.
   */
  colorBy: EventGroupLevel | undefined;
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
