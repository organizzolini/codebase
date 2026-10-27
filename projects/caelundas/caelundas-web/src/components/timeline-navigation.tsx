import { useLayoutEffect } from "react";

import { useGanttNavigation } from "@codebase/presentation";

import type { CalendarNavigation } from "./calendar-navigation-group.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * Where to report the timeline's navigation.
 */
export interface TimelineNavigationProperties {
  className?: string;
  onNavigationChange: (navigation: CalendarNavigation) => void;
}

// 🧩 Component

/**
 * Reports the timeline's own navigation, which only a child of the Gantt can
 * read, to the toolbar above it, and draws nothing visible.
 */
export function TimelineNavigation(
  properties: Readonly<TimelineNavigationProperties>,
): ReactNode {
  const { className, onNavigationChange } = properties;

  // 🪝 Hooks
  const navigation = useGanttNavigation();

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
      data-testid="timeline-navigation"
      hidden
    >
      {navigation.title}
    </div>
  );
}
