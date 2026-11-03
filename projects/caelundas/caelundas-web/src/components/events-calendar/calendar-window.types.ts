import type { TimelineScale } from "./calendar-views.types";
import type { EventsWindow } from "./events-database.types";

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
