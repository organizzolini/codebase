import { createElement } from "react";

import {
  CALENDAR_VIEW_LABELS,
  CALENDAR_VIEWS,
  TIMELINE_SCALE_LABELS,
  TIMELINE_SCALES,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.constants";
import { parseCalendarView } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.utilities";

import {
  SCALE_DESCRIPTIONS,
  SCALE_ICONS,
  VIEW_DESCRIPTIONS,
  VIEW_ICONS,
} from "./calendar-layout-menu.constants";

import type { UseCalendarDisplayResult } from "../../../hooks/use-calendar-display/use-calendar-display.types";
import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { CascaderNode } from "@codebase/presentation";
import type { LucideIcon } from "lucide-react";

// 🔏 Private Functions

/**
 * Writes a layout choice to the link: a view sets the view, and a scale sets the timeline's, showing the timeline first.
 */
export function applyLayoutLeaf(
  leaf: string,
  context: Readonly<{
    handlers: UseCalendarDisplayResult["handlers"];
    view: CalendarViewName;
  }>,
): void {
  const { handlers, view } = context;
  const colon = leaf.indexOf(":");
  const group = leaf.slice(0, colon);
  const value = leaf.slice(colon + 1);

  if (group === "calendar") {
    const next = parseCalendarView(value);

    if (next !== undefined) {
      handlers.handleViewChange(next);
    }
  } else if (group === "scale") {
    const scale = TIMELINE_SCALES.find((candidate) => candidate === value);

    if (scale !== undefined) {
      if (view !== "timeline") {
        handlers.handleViewChange("timeline");
      }

      handlers.handleScaleChange(scale);
    }
  }
}

/**
 * The layouts as radio rows, the timeline's scales nested beneath it.
 */
export function createLayoutItems(): CascaderNode[] {
  return CALENDAR_VIEWS.map((value) => toViewItem(value));
}

// 🌎 Public Functions

/**
 * Whether a row can be picked: every layout, the timeline among them, though it holds its scales.
 */
export function isLayoutChoice(): boolean {
  return true;
}

/**
 * The branches that stay open whatever is closed: the timeline while it is the layout.
 */
export function toForcedBranches(view: CalendarViewName): string[] {
  return view === "timeline" ? ["calendar:timeline"] : [];
}

/**
 * What to tick in the list: the layout shown, and the timeline's scale while it is.
 */
export function toLayoutValue(
  view: CalendarViewName,
  scale: TimelineScale,
): string[] {
  return [
    `calendar:${view}`,
    ...(view === "timeline" ? [`scale:${scale}`] : []),
  ];
}

/**
 * The branches open: the ones the user opened, and the forced ones.
 */
export function toOpenBranches(
  opened: readonly string[],
  view: CalendarViewName,
): string[] {
  return [...new Set([...opened, ...toForcedBranches(view)])];
}

/**
 * An icon as the element a node draws.
 */
function toIcon(icon: LucideIcon): CascaderNode["icon"] {
  return createElement(icon, { "aria-hidden": "true" });
}

/**
 * A view as a radio row; the timeline carries its scales beneath it.
 */
function toViewItem(value: CalendarViewName): CascaderNode {
  return {
    ...(value === "timeline"
      ? {
          children: TIMELINE_SCALES.map((scale) => ({
            description: SCALE_DESCRIPTIONS[scale],
            icon: toIcon(SCALE_ICONS[scale]),
            label: TIMELINE_SCALE_LABELS[scale],
            radio: true,
            value: `scale:${scale}`,
          })),
        }
      : {}),
    description: VIEW_DESCRIPTIONS[value],
    icon: toIcon(VIEW_ICONS[value]),
    label: CALENDAR_VIEW_LABELS[value],
    radio: true,
    value: `calendar:${value}`,
  };
}
