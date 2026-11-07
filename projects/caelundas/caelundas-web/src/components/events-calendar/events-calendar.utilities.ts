import {
  OVERFLOW_CLASS_NAMES,
  SCROLLING_WEEK_CLASS_NAMES,
} from "./events-calendar.constants";

import type { CalendarViewName } from "./calendar-views.types";
import type { EventsDataset } from "./events-database.types";

// 🔏 Private Functions

// 🌎 Public Functions

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

/**
 * The zone the calendar renders times in: the one the data's events were
 * computed for, or the browser's own before any data is known.
 */
export function readTimeZone(dataset: EventsDataset | null): string {
  return dataset?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}
