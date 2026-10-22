import { useCallback, useMemo, useRef as useReference, useState } from "react";

import {
  formatCalendarDate,
  isDayShown,
} from "../lib/calendar/calendar-window";

import type {
  CalendarViewName,
  TimelineScale,
} from "../lib/calendar/calendar-views";
import type { CalendarNavigation } from "./calendar-navigation-group";

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
 * is switched off once the days the view shows include today.
 */
export function useCalendarNavigation(
  properties: Readonly<{
    agendaDays?: number | undefined;
    anchor: Date;
    scale?: TimelineScale | undefined;
    timeZone: string;
    view: CalendarViewName;
  }>,
): CalendarNavigationState {
  const { agendaDays, anchor, scale, timeZone, view } = properties;
  const [title, setTitle] = useState("");
  const latest = useReference<CalendarNavigation | null>(null);
  // Read here and not inside the memo, which would add a frame to the
  // call stack of every render.
  const isToday = isDayShown(formatCalendarDate(new Date(), timeZone), {
    anchor,
    options: { agendaDays, scale },
    view,
  });
  const navigation = useMemo<CalendarNavigation>(
    () => ({
      isToday,
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
    [isToday, latest, title],
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
