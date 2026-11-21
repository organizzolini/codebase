import {
  CalendarDays,
  CalendarRange,
  ChartGantt,
  Columns3,
  List,
  Square,
} from "lucide-react";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

export const TITLE = "Calendar";

export const VIEW_ICONS: Readonly<Record<CalendarViewName, LucideIcon>> = {
  agenda: List,
  day: Square,
  month: CalendarDays,
  "three-day": Columns3,
  timeline: ChartGantt,
  week: CalendarRange,
};

/**
 * Joins the trigger to its chip: flat inner edges, one border between.
 */
export const STRIP_CLASS_NAME =
  "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none";
