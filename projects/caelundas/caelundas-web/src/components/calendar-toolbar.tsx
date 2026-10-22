import { CalendarNavigationGroup } from "./calendar-navigation-group";
import { CalendarViewSelect } from "./calendar-view-select";

import type { CalendarViewName } from "../lib/calendar/calendar-views";
import type { CalendarNavigation } from "./calendar-navigation-group";
import type { ReactNode } from "react";

// 🔖 Type

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
   * Drawn after the view selector, from the left.
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
  const viewSelect =
    view === undefined || onViewChange === undefined ? null : (
      <CalendarViewSelect
        compact={compact}
        onViewChange={onViewChange}
        view={view}
      />
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
      {compact ? (
        <div className="flex min-w-0 items-start gap-2 px-2 py-2">
          <div className="min-w-0 grow">
            <CalendarNavigationGroup
              navigation={navigation}
              compact
            />
          </div>
          {viewSelect}
        </div>
      ) : (
        // The date and its buttons sit apart at the right, holding one width,
        // so changing the view moves nothing; the views, the filters and
        // their chips flow from the left and wrap under each other.
        <div className="flex min-w-0 items-start gap-2 px-2 py-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-start gap-1">
            {viewSelect}
            {controls}
          </div>
          <div className="shrink-0">
            <CalendarNavigationGroup navigation={navigation} />
          </div>
        </div>
      )}
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
