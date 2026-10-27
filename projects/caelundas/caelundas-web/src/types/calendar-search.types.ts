import type { CalendarViewName, TimelineScale } from "./calendar-views.types";
import type { EventFilterQuery } from "./event-filters.types";
import type { EventGrouping, EventGroupLevel } from "./event-groups.types";

/**
 * The calendar's URL search parameters.
 */
export interface CalendarSearch {
  /**
   * `false` when the views of hours leave events unmerged; merged when
   * absent.
   */
  clusters?: false | undefined;
  /**
   * What the events are colored by, a level like a grouping's: a field and,
   * for a tag root, the tags or the depth of its tree whose tags each get a
   * color. Colored by type, kind by kind, when absent.
   */
  color?: EventGroupLevel | undefined;
  /**
   * `false` when events are drawn without their colors; colored when absent.
   */
  colors?: false | undefined;
  /**
   * The day the calendar shows, as `YYYY-MM-DD`; today when absent.
   */
  date?: string | undefined;
  /**
   * How many days the agenda lists, grown as it scrolls; a month's worth
   * when absent.
   */
  days?: number | undefined;
  /**
   * The ReUI filter tree; no filter when absent.
   */
  filter?: EventFilterQuery | undefined;
  /**
   * The levels the agenda and the timeline group events by, outermost
   * first, empty for none; each view's default when absent.
   */
  group?: EventGrouping | undefined;
  /**
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
  /**
   * `emojis` when events are drawn with their emoji; their icons when absent.
   */
  symbols?: "emojis" | undefined;
  /**
   * The view the calendar shows; the month when absent.
   */
  view?: CalendarViewName | undefined;
}
