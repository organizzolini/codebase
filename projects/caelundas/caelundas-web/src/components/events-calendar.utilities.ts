import {
  OVERFLOW_CLASS_NAMES,
  SCROLLING_WEEK_CLASS_NAMES,
} from "./events-calendar.constants";

import type { CalendarViewName } from "../types/calendar-views.types";

/**
 * How the calendar lays a view out: a phone's week scrolls sideways in the
 * content area under a sticky hour column, and every other view scrolls
 * inside itself.
 */
export function getViewLayout(
  view: CalendarViewName,
  compact: boolean,
): {
  classNames: Record<string, string>;
  contentClassName: string | undefined;
  scrollMode: "contained" | "page";
} {
  return compact && view === "week"
    ? {
        classNames: SCROLLING_WEEK_CLASS_NAMES,
        contentClassName: "overflow-auto",
        scrollMode: "page",
      }
    : {
        classNames: OVERFLOW_CLASS_NAMES,
        contentClassName: undefined,
        scrollMode: "contained",
      };
}
