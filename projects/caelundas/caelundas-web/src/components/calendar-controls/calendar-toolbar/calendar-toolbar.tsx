import { CalendarNavigationGroup } from "../calendar-navigation-group/calendar-navigation-group";
import { CalendarNavigationSlot } from "../calendar-navigation-group/calendar-navigation-slot.constants";

import { createViewsMenu, hasContent } from "./calendar-toolbar.utilities";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CalendarNavigation } from "../calendar-navigation-group/calendar-navigation-group.types";
import type { ReactNode } from "react";

// 🔖 Type

/**
 * The toolbar's navigation, plus the menus and filters it shows.
 */
export interface CalendarToolbarProperties {
  className?: string;
  /**
   * Narrows the row for a phone, with the date above the controls.
   */
  compact?: boolean | undefined;
  /**
   * Drawn after the menus, on the same line: the View, Group and Sort
   * strips, then Filter with the date selector and the filters' chips.
   */
  filters?: ReactNode;
  /**
   * Drawn after the Calendar menu, on the same line: Display, Color and Sky.
   */
  menus?: ReactNode;
  navigation: CalendarNavigation;
  /**
   * Called with the view picked; the Calendar menu is left out without it.
   */
  onViewChange?: ((view: CalendarViewName) => void) | undefined;
  view?: CalendarViewName | undefined;
}

// 🧩 Component

/**
 * Renders the toolbar's controls on one line, wrapping when cramped: the Calendar menu, the menus, then the strips, with the date selector joined to Filter; a phone's date takes its own row.
 */
export function CalendarToolbar(
  properties: Readonly<CalendarToolbarProperties>,
): ReactNode {
  const { className, compact, filters, menus, navigation, onViewChange, view } =
    properties;

  // 🪝 Hooks

  // 🏗 Setup
  const hasFilters = hasContent(filters);
  const viewsMenu = createViewsMenu(view, onViewChange);

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
          {viewsMenu}
        </div>
      ) : (
        <div
          className="flex min-w-0 flex-wrap items-start gap-2 px-2 py-2 [&_[data-slot=button]]:active:translate-y-0!"
          data-testid="calendar-toolbar-row"
        >
          {viewsMenu}
          {menus}
          <CalendarNavigationSlot
            value={
              hasFilters ? (
                <CalendarNavigationGroup
                  className="contents"
                  navigation={navigation}
                />
              ) : null
            }
          >
            {filters}
          </CalendarNavigationSlot>
          {hasFilters ? null : (
            <CalendarNavigationGroup navigation={navigation} />
          )}
        </div>
      )}
      {compact && (hasFilters || hasContent(menus)) ? (
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
