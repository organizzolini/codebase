import type { Period } from "./calendar-records.types";
import type { CalendarViewName, TimelineScale } from "./calendar-views.types";

/**
 * Options for the view's days: agenda length and timeline scale.
 */
export interface ViewWindowOptions {
  agendaDays?: number | undefined;
  scale?: TimelineScale | undefined;
}

/**
 * The view's days, and the period read around them.
 */
export interface ViewWindows {
  read: Period;
  visible: Period;
}

/**
 * The API query for a view's days: anchor, view, and options.
 */
export interface ViewWindowSearch extends ViewWindowOptions {
  anchor: Date;
  view?: CalendarViewName | undefined;
}
