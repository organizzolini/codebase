import { useCallback, useMemo, useRef as useReference, useState } from "react";

import {
  formatCalendarDate,
  isDayShown,
} from "../../utilities/calendar-window.utilities";

import type { CalendarNavigation } from "../../components/calendar-navigation-group.types";
import type {
  UseCalendarNavigationProperties,
  UseCalendarNavigationResult,
} from "./use-calendar-navigation.types";

// 🧩 Hook

/**
 * Holds the navigation the toolbar draws, in one place above every view, so
 * switching views keeps the toolbar, and the focus on its view selector,
 * rather than mounting a new one. The views report how they move; the buttons
 * call the latest report, and the title is state because it is drawn. Today
 * is switched off once the days the view shows include today.
 */
export function useCalendarNavigation(
  properties: Readonly<UseCalendarNavigationProperties>,
): UseCalendarNavigationResult {
  const { agendaDays, anchor, scale, timeZone, view } = properties;

  // 🪝 Hooks
  const [title, setTitle] = useState("");
  const latest = useReference<CalendarNavigation | null>(null);

  // 🏗 Setup
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

  // 💪 Handlers
  const handleNavigationChange = useCallback(
    (reported: CalendarNavigation) => {
      latest.current = reported;
      setTitle(reported.title);
    },
    [latest],
  );

  // ♻️ Lifecycle

  // 🎁 Result
  return { handleNavigationChange, navigation };
}
