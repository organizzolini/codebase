import { useCallback, useMemo, useRef as useReference, useState } from "react";

import { formatCalendarDate } from "../lib/calendar/calendar-window";

import type { CalendarNavigation } from "./calendar-toolbar";

/**
 * The toolbar's navigation, and where the views report theirs.
 */
export interface CalendarNavigationState {
  /**
   * Handed each view's own navigation, which only a child of it can read.
   */
  handleNavigationChange: (reported: CalendarNavigation) => void;
  navigation: CalendarNavigation;
}

/**
 * Holds the navigation the toolbar draws, in one place above every view, so
 * switching views keeps the toolbar, and the focus on its view selector,
 * rather than mounting a new one. The views report how they move; the buttons
 * call the latest report, and the title is state because it is drawn. Today
 * is left to the button once the day anchored on is today.
 */
export function useCalendarNavigation(
  anchor: Date,
  timeZone: string,
): CalendarNavigationState {
  const [title, setTitle] = useState("");
  const latest = useReference<CalendarNavigation | null>(null);
  const navigation = useMemo<CalendarNavigation>(
    () => ({
      isToday:
        formatCalendarDate(anchor, timeZone) ===
        formatCalendarDate(new Date(), timeZone),
      next: () => {
        latest.current?.next();
      },
      prev: () => {
        latest.current?.prev();
      },
      title,
      today: () => {
        latest.current?.today();
      },
    }),
    [anchor, latest, timeZone, title],
  );
  const handleNavigationChange = useCallback(
    (reported: CalendarNavigation) => {
      latest.current = reported;
      setTitle(reported.title);
    },
    [latest],
  );

  return { handleNavigationChange, navigation };
}
