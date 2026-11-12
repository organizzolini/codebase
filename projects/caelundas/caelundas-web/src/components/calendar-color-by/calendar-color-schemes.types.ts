import type { CalendarEventRecord } from "../events-calendar/calendar-records.types";

// 🏷️ Types

/**
 * One color of a scheme and what it stands for.
 */
export interface ColorLegendEntry {
  color: string;
  key: string;
  label: string;
}

/**
 * The legend's colors, and the color an event gets.
 */
export interface ColorScheme {
  colorOf: (event: CalendarEventRecord) => null | string;
  legend: readonly ColorLegendEntry[];
}
