import { useLayoutEffect } from "react";

import { useEventCalendarNavigation } from "@codebase/presentation";

import type { CalendarNavigation } from "../calendar-navigation-group/calendar-navigation-group.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Where to report the event calendar's navigation.
 */
export interface CalendarGridNavigationProperties {
  className?: string;
  onNavigationChange: (navigation: CalendarNavigation) => void;
}

// 🧩 Component

/**
 * Reports the event calendar's own navigation, which only a child of the
 * calendar can read, to the toolbar above it, and draws nothing visible.
 */
export function CalendarGridNavigation(
  properties: Readonly<CalendarGridNavigationProperties>,
): ReactNode {
  const { className, onNavigationChange } = properties;

  // 🪝 Hooks
  const navigation = useEventCalendarNavigation();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle
  // Before paint, so the toolbar never shows the title of the view before.
  // Every render reports, which ends there: the toolbar re-renders only when
  // the title it is handed differs.
  useLayoutEffect(() => {
    onNavigationChange(navigation);
  });

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-grid-navigation"
      hidden
    >
      {navigation.title}
    </div>
  );
}
