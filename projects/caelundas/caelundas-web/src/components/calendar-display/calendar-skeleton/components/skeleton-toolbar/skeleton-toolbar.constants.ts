import type { CalendarViewName } from "../../../events-calendar/components/calendar-views/calendar-views.types";

// ♟️ Constants

/**
 * The toolbar's tablet height: four rows with a Select strip, else three.
 */
export const TOOLBAR_HEIGHTS: Readonly<Record<CalendarViewName, string>> = {
  charts: "md:h-38",
  day: "md:h-29",
  month: "md:h-29",
  table: "md:h-38",
  timeline: "md:h-29",
  totals: "md:h-38",
  week: "md:h-29",
};

/**
 * The widths of the toolbar's chips, in the order they wrap.
 */
export const TOOLBAR_CHIPS = [
  "w-20",
  "w-24",
  "w-28",
  "w-24",
  "w-32",
  "w-28",
  "w-24",
  "w-40",
  "w-24",
  "w-48",
  "w-28",
  "w-20",
  "w-36",
  "w-44",
  "w-24",
  "w-32",
  "w-52",
  "w-28",
  "w-24",
  "w-40",
  "w-20",
  "w-28",
  "w-48",
  "w-24",
  "w-32",
  "w-36",
  "w-20",
  "w-44",
  "w-28",
  "w-24",
  "w-52",
  "w-28",
  "w-20",
  "w-36",
  "w-24",
  "w-32",
] as const;
