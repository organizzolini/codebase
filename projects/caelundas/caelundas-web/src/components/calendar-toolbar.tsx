import { Button, useEventCalendarNavigation } from "@codebase/presentation";

import { CalendarViewSelect } from "./calendar-view-select";

import type { CalendarViewName } from "../lib/calendar/calendar-views";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The toolbar shows the calendar it sits inside, plus whatever filter
 * controls the page hands it and the view the page shows.
 */
export interface CalendarToolbarProperties {
  className?: string;
  /**
   * Narrows the row for a phone, listing the views in a menu.
   */
  compact?: boolean | undefined;
  /**
   * Drawn between the period's title and the view selector.
   */
  filters?: ReactNode;
  /**
   * Called with the view picked; the selector is left out without it.
   */
  onViewChange?: ((view: CalendarViewName) => void) | undefined;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the calendar's one toolbar row: today, previous and next, the
 * period's title, the filters, and the view selector. It must sit inside an
 * `EventCalendar`, whose state it reads.
 */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const { className, compact, filters, onViewChange, view } = properties;

  // 🪝 Hooks
  const navigation = useEventCalendarNavigation();

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
        <div className="flex min-w-0 grow items-center justify-end gap-1">
          {filters}
        </div>
        {view === undefined || onViewChange === undefined ? null : (
          <CalendarViewSelect
            compact={compact}
            onViewChange={onViewChange}
            view={view}
          />
        )}
      </div>
    </div>
  );
}
