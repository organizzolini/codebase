import { CalendarNavigationGroup } from "../calendar-navigation-group/calendar-navigation-group";
import { CalendarViewSelect } from "../calendar-view-select/calendar-view-select";

import { ROW_CLASS_NAME } from "./calendar-toolbar.constants";
import { hasContent } from "./calendar-toolbar.utilities";

import type { CalendarNavigation } from "../calendar-navigation-group/calendar-navigation-group.types";
import type { CalendarViewName } from "../events-calendar/calendar-views.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The toolbar moves the view it sits over, and shows the menus and filter controls the page hands it.
 */
export interface CalendarToolbarProperties {
  className?: string;
  /**
   * Narrows the row for a phone, listing the views in a menu.
   */
  compact?: boolean | undefined;
  /**
   * Drawn from the left of the second row: the Filter and Clear buttons and
   * the filters' chips.
   */
  filters?: ReactNode;
  /**
   * Drawn from the left of the first row: the View, Color and Sky menus.
   */
  menus?: ReactNode;
  navigation: CalendarNavigation;
  /**
   * Called with the view picked; the selector is left out without it.
   */
  onViewChange?: ((view: CalendarViewName) => void) | undefined;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the toolbar in two rows over the view's navigation: menus and date on top, filters and view selector beneath.
 */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const { className, compact, filters, menus, navigation, onViewChange, view } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const hasControls = hasContent(filters) || hasContent(menus);
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
  // A button presses down a pixel when it is clicked, which in a row of
  // buttons that change what is shown reads as a bounce; the buttons here stay
  // put, the way the menu buttons, which are exempt from it, already do.
  return (
    <div
      className={className}
      data-testid="calendar-toolbar"
    >
      {compact ? (
        <div className="flex min-w-0 items-start gap-2 px-2 py-2 [&_[data-slot=button]]:active:translate-y-0!">
          <div className="min-w-0 grow">
            <CalendarNavigationGroup
              navigation={navigation}
              compact
            />
          </div>
          {viewSelect}
        </div>
      ) : (
        // Two rows, each with its own end at the right: the menus and the
        // date, then the filters and the views. A row too narrow for both
        // ends wraps its right end under its left, and the views scroll
        // sideways rather than overflow the page.
        <div className="flex min-w-0 flex-col gap-2 px-2 py-2 [&_[data-slot=button]]:active:translate-y-0!">
          <div
            className={ROW_CLASS_NAME}
            data-testid="calendar-toolbar-menus"
          >
            <div className="flex min-w-0 flex-wrap items-start gap-2">
              {menus}
            </div>
            <CalendarNavigationGroup navigation={navigation} />
          </div>
          <div
            className={ROW_CLASS_NAME}
            data-testid="calendar-toolbar-filters"
          >
            <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
              {filters}
            </div>
            <div className="max-w-full overflow-x-auto">{viewSelect}</div>
          </div>
        </div>
      )}
      {compact && hasControls ? (
        // A phone's row has no room beside the title for the controls, so
        // they take a row under it, wrapping onto more rows if they outgrow it.
        <div
          className="flex min-w-0 flex-wrap items-center gap-2 px-2 pb-2 [&_[data-slot=button]]:active:translate-y-0!"
          data-testid="calendar-toolbar-controls"
        >
          {menus}
          {filters}
        </div>
      ) : null}
    </div>
  );
}
