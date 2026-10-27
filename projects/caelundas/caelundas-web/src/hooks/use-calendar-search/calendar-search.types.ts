import type { EventFilterQuery } from "../../components/calendar-filters/event-filters.types";
import type {
  EventGrouping,
  EventGroupLevel,
} from "../../components/calendar-group-by/event-groups.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../components/events-calendar/calendar-views.types";

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
   * The night sky backdrop's overrides, `sky=off` and the `sky.*` keys. The
   * calendar neither reads nor validates them: the backdrop does, and they
   * are named here so validating the search does not drop them. Each is a number, a boolean
   * or text, as the router read it.
   */
  sky?: SkySearchValue | undefined;
  "sky.altBottom"?: SkySearchValue | undefined;
  "sky.debug"?: SkySearchValue | undefined;
  "sky.lat"?: SkySearchValue | undefined;
  "sky.lon"?: SkySearchValue | undefined;
  "sky.maxMag"?: SkySearchValue | undefined;
  "sky.pixelsPerSecond"?: SkySearchValue | undefined;
  "sky.starScale"?: SkySearchValue | undefined;
  "sky.vFov"?: SkySearchValue | undefined;
  /**
   * `emojis` when events are drawn with their emoji; their icons when absent.
   */
  symbols?: "emojis" | undefined;
  /**
   * The view the calendar shows; the month when absent.
   */
  view?: CalendarViewName | undefined;
}

/**
 * What a sky key of the link holds, as the router read it.
 */
export type SkySearchValue = boolean | number | string;
