import { createContext } from "react";

import type { CalendarViewName } from "../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { DatePickerMode } from "./calendar-date-picker.types";

// ♟️ Constants

/** What the Filter list calls to open the picker. */
export const OpenDatePickerContext = createContext<(() => void) | null>(null);

/** The modes, finest first, as the picker's strip lists them. */
export const DATE_PICKER_MODES: readonly {
  id: DatePickerMode;
  label: string;
}[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "half-year", label: "Half-year" },
  { id: "year", label: "Year" },
];

/** The unit a layout draws from the start date. */
export const LAYOUT_UNITS: Readonly<
  Partial<Record<CalendarViewName, DatePickerMode>>
> = {
  day: "day",
  month: "month",
  week: "week",
};

/** The modes' sizes, finest first, to compare them. */
export const MODE_RANKS: Readonly<Record<DatePickerMode, number>> = {
  day: 0,
  "half-year": 4,
  month: 2,
  quarter: 3,
  week: 1,
  year: 5,
};

/** How many months a month, quarter, half-year or year span holds. */
export const MODE_MONTHS: Readonly<
  Record<"half-year" | "month" | "quarter" | "year", number>
> = {
  "half-year": 6,
  month: 1,
  quarter: 3,
  year: 12,
};

/** A month's short name by its index. */
export const MONTH_LABELS: readonly string[] = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
