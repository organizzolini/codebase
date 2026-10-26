import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
  useEventCalendarNavigation,
  useEventCalendarView,
} from "@codebase/presentation";

import type { ReactNode } from "react";

// 🔖 Type

/**
 * The toolbar takes only a class name; everything it shows comes from the
 * calendar it sits inside.
 */
export interface CalendarToolbarProperties {
  className?: string;
}

// 🧩 Component

/**
 * Renders the calendar's one toolbar row: today, previous and next, the
 * period's title, and the view selector. It must sit inside an
 * `EventCalendar`, whose state it reads.
 */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const { className } = properties;

  // 🪝 Hooks
  const navigation = useEventCalendarNavigation();
  const { availableViews, view } = useEventCalendarView();

  // 🏗 Setup

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-toolbar"
    >
      <div className="flex min-w-0 items-center gap-1 px-2 py-2">
        <Button
          onClick={navigation.today}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
        <Button
          aria-label="Previous"
          onClick={navigation.prev}
          size="sm"
          variant="ghost"
        >
          ‹
        </Button>
        <Button
          aria-label="Next"
          onClick={navigation.next}
          size="sm"
          variant="ghost"
        >
          ›
        </Button>
        <h2 className="ms-2 truncate text-base font-semibold">
          {navigation.title}
        </h2>
        <div className="grow" />
        <ToggleGroup
          aria-label="View"
          size="sm"
          value={[view]}
          variant="outline"
        >
          {availableViews.map((availableView) => (
            <ToggleGroupItem
              key={availableView}
              value={availableView}
            >
              {availableView.charAt(0).toUpperCase() + availableView.slice(1)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}
