import { Button, ButtonGroup } from "@codebase/presentation";

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
  const hasControls = [filters, groupBy, scaleSelect].some(
    (control) => control !== undefined && control !== null,
  );
  const controls = (
    <>
      {filters}
      {groupBy}
      {scaleSelect}
    </>
  );

  // 💪 Handlers

  // ♻️ Lifecycle

  // 🏁 Early Returns

  // 🎨 Markup
  return (
    <div
      className={className}
      data-testid="calendar-toolbar"
    >
      <div className="flex min-w-0 flex-wrap items-start gap-x-2 gap-y-1 px-2 py-2">
        <h2
          className={`font-semibold ${compact ? "min-w-0 grow text-sm leading-tight" : "min-w-28 truncate text-base leading-7"}`}
        >
          {navigation.title}
        </h2>
        <ButtonGroup aria-label="Navigate">
          <Button
            aria-label="Previous"
            onClick={navigation.prev}
            size="sm"
            variant="outline"
          >
            ‹
          </Button>
          <Button
            aria-label="Next"
            onClick={navigation.next}
            size="sm"
            variant="outline"
          >
            ›
          </Button>
          <Button
            onClick={navigation.today}
            size="sm"
            variant="outline"
          >
            Today
          </Button>
        </ButtonGroup>
        {view === undefined || onViewChange === undefined ? null : (
          <CalendarViewSelect
            compact={compact}
            onViewChange={onViewChange}
            view={view}
          />
        )}
        {
          // The controls are items of this row, not a row of their own: the
          // filters flow on beside the date and the buttons, anchored to the
          // top with them, and wrap under them when the row runs out. A
          // phone's row has no room for them, so they take one below.
          compact ? null : controls
        }
      </div>
      {compact && hasControls ? (
        // A phone's row has no room beside the title for the controls, so
        // they take a row under it, wrapping onto more rows if they outgrow it.
        <div
          className="flex min-w-0 flex-wrap items-center gap-1 px-2 pb-2"
          data-testid="calendar-toolbar-controls"
        >
          {controls}
        </div>
      ) : null}
    </div>
  );
}
