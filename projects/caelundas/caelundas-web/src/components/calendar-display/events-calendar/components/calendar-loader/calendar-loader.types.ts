import type { EventFilterQuery } from "../../../../calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type { ResolvedPreset } from "../../../../calendar-query/calendar-filters/components/presets/presets.types";
import type { EventGroupLevel } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
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
   * The levels each event's `groups` were read for; the first colors events.
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
 * Why a period is empty: no data, out of range, filters.
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
