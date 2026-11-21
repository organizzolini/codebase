import { createElement } from "react";

import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";

import { VIEW_ICONS } from "./calendar-views-menu.constants";

import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The choices: each calendar view, with its icon.
 */
export function createViewItems(): CascaderNode[] {
  return CALENDAR_VIEWS.map((view) => ({
    icon: createElement(VIEW_ICONS[view], { "aria-hidden": "true" }),
    label: CALENDAR_VIEW_LABELS[view],
    value: view,
  }));
}
