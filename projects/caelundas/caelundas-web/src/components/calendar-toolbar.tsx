import { Button } from "@codebase/presentation";

import { CalendarViewSelect } from "./calendar-view-select";

import type { CalendarViewName } from "../lib/calendar/calendar-views";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * How the toolbar moves the view it sits over, and the title of the period
 * shown: the event calendar's or the timeline's.
 */
export interface CalendarNavigation {
  next: () => void;
  prev: () => void;
  title: string;
  today: () => void;
}

/**
 * The toolbar moves the view it sits over, and shows whatever filter
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
   * Drawn after the filters, for the views that group their events.
   */
  groupBy?: ReactNode;
  navigation: CalendarNavigation;
  /**
   * Called with the view picked; the selector is left out without it.
   */
  onViewChange?: ((view: CalendarViewName) => void) | undefined;
  /**
   * Drawn before the view selector, for the timeline's scale.
   */
  scaleSelect?: ReactNode;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the calendar's one toolbar row: today, previous and next, the
 * period's title, the filters, the grouping, and the view selector, over
 * whichever view's navigation it is handed.
 */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const {
    className,
    compact,
    filters,
    groupBy,
    navigation,
    onViewChange,
    scaleSelect,
    view,
  } = properties;

  // 🪝 Hooks

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
        {compact ? (
          // A phone's row is too narrow for every control, so they scroll
          // sideways together, never over each other.
          <div className="flex min-w-0 grow items-center overflow-x-auto">
            <div className="ms-auto flex shrink-0 items-center gap-1">
              {filters}
              {groupBy}
              {scaleSelect}
            </div>
          </div>
        ) : (
          <div className="flex min-w-0 grow items-center justify-end gap-1">
            {filters}
            {groupBy}
            {scaleSelect}
          </div>
        )}
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
