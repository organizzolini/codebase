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
   * How much of the week and day's all-day row shows: `c` one slim row, `e` every event; the facet groups when absent.
   */
  ad?: "c" | "e" | undefined;
  /**
   * `false` when events are drawn without their colors; colored when absent.
   */
  colors?: false | undefined;
  /**
   * The columns the table shows, first first: `name`, `start`, `end`, or a tag's id; its default columns when absent.
   */
  columns?: readonly string[] | undefined;
  /**
   * `true` when the metric layouts also measure the period before, to show the change; off when absent.
   */
  compare?: true | undefined;
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
   * The folded query strips, comma-separated (`select,group`); none folded when absent.
   */
  fold?: string | undefined;
  /**
   * The levels the table and the timeline group events by, outermost
   * first, empty for none; each view's default when absent.
   */
  group?: EventGrouping | undefined;
  /**
   * `true` to leave out groups with no events; shown when absent.
   */
  hideEmpty?: true | undefined;
  /**
   * The metrics the metric layouts measure, first first; each layout's defaults when absent.
   */
  metrics?: readonly string[] | undefined;
  /**
   * The span the timeline shows at once; a month when absent.
   */
  scale?: TimelineScale | undefined;
  /**
   * The night sky backdrop's overrides, named here so search validation keeps them.
   */
  skyfield?: SkySearchValue | undefined;
  "skyfield.altBottom"?: SkySearchValue | undefined;
  "skyfield.bottom"?: SkySearchValue | undefined;
  "skyfield.constellations"?: SkySearchValue | undefined;
  "skyfield.debug"?: SkySearchValue | undefined;
  "skyfield.ecliptic"?: SkySearchValue | undefined;
  "skyfield.eclipticColor"?: SkySearchValue | undefined;
  "skyfield.eclipticOpacity"?: SkySearchValue | undefined;
  "skyfield.eclipticWidth"?: SkySearchValue | undefined;
  "skyfield.lat"?: SkySearchValue | undefined;
  "skyfield.lineColor"?: SkySearchValue | undefined;
  "skyfield.lineOpacity"?: SkySearchValue | undefined;
  "skyfield.lineWidth"?: SkySearchValue | undefined;
  "skyfield.lon"?: SkySearchValue | undefined;
  "skyfield.maxMag"?: SkySearchValue | undefined;
  "skyfield.opacity"?: SkySearchValue | undefined;
  "skyfield.pixelsPerSecond"?: SkySearchValue | undefined;
  "skyfield.starScale"?: SkySearchValue | undefined;
  "skyfield.top"?: SkySearchValue | undefined;
  "skyfield.vFov"?: SkySearchValue | undefined;
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
