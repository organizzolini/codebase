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
   * Drawn from the left: the View and Filter buttons and the filters' chips.
   */
  filters?: ReactNode;
  navigation: CalendarNavigation;
  /**
   * Called with the view picked; the selector is left out without it.
   */
  onViewChange?: ((view: CalendarViewName) => void) | undefined;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the calendar's one toolbar row: the filter controls from the left,
 * and at the right the view selector and the date with its buttons, over
 * whichever view's navigation it is handed. A phone's row has the date and
 * the views' menu, with the filters on a row under them.
 */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const { className, compact, filters, navigation, onViewChange, view } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const hasControls = filters !== undefined && filters !== null;
  const viewSelect =
    view === undefined || onViewChange === undefined ? null : (
      <CalendarViewSelect
        compact={compact}
        onViewChange={onViewChange}
        view={view}
      />
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
        // The views and the date sit apart at the right, the date holding one
        // width so changing the view moves nothing; the View and Filter
        // buttons and the filters' chips flow from the left and wrap under
        // each other. Where the row is too narrow to hold both side by side,
        // the views and the date take a row above the filters.
        <div className="@container">
          <div className="grid min-w-0 gap-1 px-2 py-2 @7xl:grid-cols-[minmax(0,1fr)_auto] @7xl:items-start @7xl:gap-2">
            <div className="flex min-w-0 flex-wrap items-start gap-1">
              {filters}
            </div>
            <div className="order-first flex items-start justify-end gap-2 @7xl:order-none">
              {viewSelect}
              <CalendarNavigationGroup navigation={navigation} />
            </div>
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
          {filters}
        </div>
      ) : null}
    </div>
  );
}
