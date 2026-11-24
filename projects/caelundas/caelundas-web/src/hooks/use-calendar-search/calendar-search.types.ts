import type {
  CalendarViewName,
  TimelineScale,
} from "../../components/calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { EventFilterQuery } from "../../components/calendar-query/calendar-filters/components/event-filter-model/event-filters.types";
import type { EventGrouping } from "../../components/calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../../components/calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";

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
   * `false` when events are drawn without their colors; colored when absent.
   */
  colors?: false | undefined;
  /**
   * The columns the table shows, first first: `name`, `start`, `end`, or a tag's id; its default columns when absent.
   */
  columns?: readonly string[] | undefined;
  /**
   * The day the calendar shows, as `YYYY-MM-DD`; today when absent.
   */
  date?: string | undefined;
  /**
   * How many days the table lists, grown as it scrolls; a month's worth
   * when absent.
   */
  days?: number | undefined;
  /**
   * The ReUI filter tree; no filter when absent.
   */
  filter?: EventFilterQuery | undefined;
  /**
   * The levels the table and the timeline group events by, outermost
   * first, empty for none; each view's default when absent.
   */
  group?: EventGrouping | undefined;
  /**
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
  /**
   * The night sky backdrop's overrides, named here so search validation keeps them.
   */
  sky?: SkySearchValue | undefined;
  "sky.altBottom"?: SkySearchValue | undefined;
  "sky.bottom"?: SkySearchValue | undefined;
  "sky.constellations"?: SkySearchValue | undefined;
  "sky.debug"?: SkySearchValue | undefined;
  "sky.ecliptic"?: SkySearchValue | undefined;
  "sky.eclipticColor"?: SkySearchValue | undefined;
  "sky.eclipticOpacity"?: SkySearchValue | undefined;
  "sky.eclipticWidth"?: SkySearchValue | undefined;
  "sky.lat"?: SkySearchValue | undefined;
  "sky.lineColor"?: SkySearchValue | undefined;
  "sky.lineOpacity"?: SkySearchValue | undefined;
  "sky.lineWidth"?: SkySearchValue | undefined;
  "sky.lon"?: SkySearchValue | undefined;
  "sky.maxMag"?: SkySearchValue | undefined;
  "sky.opacity"?: SkySearchValue | undefined;
  "sky.pixelsPerSecond"?: SkySearchValue | undefined;
  "sky.starScale"?: SkySearchValue | undefined;
  "sky.surfaceOpacity"?: SkySearchValue | undefined;
  "sky.top"?: SkySearchValue | undefined;
  "sky.vFov"?: SkySearchValue | undefined;
  /**
   * How the timeline orders its groups, the first sort first; by the first group's name when absent.
   */
  sort?: readonly GroupSort[] | undefined;
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
 * A sky key's value as the router read it.
 */
export type SkySearchValue = boolean | number | string;
