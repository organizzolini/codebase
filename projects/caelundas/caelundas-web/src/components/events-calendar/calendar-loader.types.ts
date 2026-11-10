import type { EventFilterQuery } from "../calendar-filters/event-filters.types";
import type { ResolvedPreset } from "../calendar-filters/presets.types";
import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";
import type {
  CalendarEventRecord,
  EventFacet,
  EventsDataset,
  Period,
} from "./calendar-records.types";

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
   * preset's when the link names none.
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
  period: Period;
  /**
   * The named filters the calendar offers, resolved against the data's tags
   * by the API.
   */
  presets: ResolvedPreset[];
}

/**
 * Why a loaded period shows no events, so the page can say which: the
 * database holds none, the period lies outside the dates it covers, the
 * filters leave nothing, or nothing in the period exists at all.
 */
export type CalendarEmptiness =
  | {
      dataset: EventsDataset;
      /**
       * The covered day nearest the period: the first for a period before
       * the data, the last for one after it.
       */
      jumpTo: Date;
      kind: "range";
    }
  | { kind: "database" }
  | { kind: "filter" }
  | { kind: "match" };
