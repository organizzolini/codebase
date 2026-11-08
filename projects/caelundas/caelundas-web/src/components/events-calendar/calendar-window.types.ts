import type { EventsWindow } from "./calendar-records.types";
import type { CalendarViewName, TimelineScale } from "./calendar-views.types";

/**
 * What else decides the days a view shows: how many the agenda lists, and
 * the span the timeline shows at once.
 */
export interface ViewWindowOptions {
  agendaDays?: number | undefined;
  scale?: TimelineScale | undefined;
}

/**
 * The days a view shows, and the window of events read for them: those days
 * plus a buffer either side.
 */
export interface ViewWindows {
  visible: EventsWindow;
  window: EventsWindow;
}

/**
 * What the API is asked for the days a view shows: the day it opens on, the
 * view, and what else decides the days.
 */
export interface ViewWindowSearch extends ViewWindowOptions {
  anchor: Date;
  view?: CalendarViewName | undefined;
}
