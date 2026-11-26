import {
  CalendarDays,
  CalendarRange,
  ChartColumn,
  ChartGantt,
  Grid2x2,
  Orbit,
  Sigma,
  Square,
  Sun,
  Table,
} from "lucide-react";

import type {
  CalendarViewName,
  TimelineScale,
} from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { LucideIcon } from "lucide-react";

// ♟️ Constants

export const TITLE = "Layout";

/** Hides the checkbox spacer and indents nested rows by depth. */
export const LAYOUT_TREE_CLASS_NAME = [
  "[&_[data-slot=cascader-item-checkbox-spacer]]:hidden",
  "[&_[data-slot=cascader-item]]:ps-[calc(var(--cascader-row-inset,6px)+var(--cascader-indent,0px)*2)]!",
].join(" ");

/**
 * What each timeline scale shows.
 */
export const SCALE_DESCRIPTIONS: Readonly<Record<TimelineScale, string>> = {
  day: "Fifteen-minute columns across a day.",
  month: "Days across a month.",
  quarter: "Weeks across a quarter.",
  week: "Days across a week.",
  year: "Months across a year.",
};

/**
 * What each calendar view shows.
 */
export const VIEW_DESCRIPTIONS: Readonly<Record<CalendarViewName, string>> = {
  charts: "Bar charts of metrics over the groups, stacked by subgroup.",
  day: "One day by the hour.",
  month: "Every day of the month in a grid, with its events as chips.",
  table: "Events as rows nested under their groups, with the columns you pick.",
  timeline: "Events along a time axis, in rows by group.",
  totals: "Cards of totals and unique counts over the filtered events.",
  week: "Seven days by the hour.",
};

/**
 * The icon each timeline scale carries beside its name.
 */
export const SCALE_ICONS: Readonly<Record<TimelineScale, LucideIcon>> = {
  day: Sun,
  month: CalendarDays,
  quarter: Grid2x2,
  week: CalendarRange,
  year: Orbit,
};

/**
 * The icon each calendar view carries beside its name.
 */
export const VIEW_ICONS: Readonly<Record<CalendarViewName, LucideIcon>> = {
  charts: ChartColumn,
  day: Square,
  month: CalendarDays,
  table: Table,
  timeline: ChartGantt,
  totals: Sigma,
  week: CalendarRange,
};
