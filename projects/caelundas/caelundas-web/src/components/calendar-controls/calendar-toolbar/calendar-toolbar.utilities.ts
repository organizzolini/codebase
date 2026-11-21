import { createElement } from "react";

import { CalendarViewsMenu } from "../calendar-views-menu/calendar-views-menu";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { ReactNode } from "react";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The Calendar menu for the view shown, or nothing when the page gave no view or no way to change it.
 */
export function createViewsMenu(
  view: CalendarViewName | undefined,
  onViewChange: ((view: CalendarViewName) => void) | undefined,
): ReactNode {
  return view === undefined || onViewChange === undefined
    ? null
    : createElement(CalendarViewsMenu, {
        className: "contents",
        onViewChange,
        view,
      });
}

/**
 * Whether a slot the page handed the toolbar holds anything to draw.
 */
export function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null;
}
