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

export const TITLE = "Display";

/**
 * Joins the trigger to its chip: flat inner edges, one border between.
 */
export const STRIP_CLASS_NAME =
  "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none";

/**
 * A chip looks like the buttons beside it, not shaded as set apart.
 */
export const CHIP_CLASS_NAME = "bg-background dark:bg-input/30";

/**
 * The choices of figures the sky can draw, with the words that name each.
 */
export const CONSTELLATION_CHOICES = [
  { label: "All", value: "all", words: ["all"] },
  { label: "Zodiac", value: "zodiac", words: ["zodiac"] },
  { label: "None", value: "none", words: [] },
] as const;

/**
 * The choice that colors events by their kind, which colors them when none is named.
 */
export const DEFAULT_COLOR_BY = "default";

/**
 * The icon each calendar view carries in the list.
 */
export const VIEW_ICONS: Readonly<Record<CalendarViewName, LucideIcon>> = {
  agenda: List,
  day: Square,
  month: CalendarDays,
  "three-day": Columns3,
  timeline: ChartGantt,
  week: CalendarRange,
};

/**
 * The colors a sky color can be set to from the list, each named.
 */
export const COLOR_SWATCHES = [
  { label: "Midnight", value: "#04060f" },
  { label: "Navy", value: "#0d1533" },
  { label: "Indigo", value: "#1b2a5c" },
  { label: "Plum", value: "#3b1f5e" },
  { label: "Wine", value: "#5c1f2a" },
  { label: "White", value: "#ffffff" },
  { label: "Sky blue", value: "#7dd3fc" },
  { label: "Amber", value: "#fbbf24" },
] as const;

/**
 * How many values a numeric setting offers, from its least to its most.
 */
export const STEP_COUNT = 5;
