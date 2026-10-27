import type { CalendarEventRecord } from "./events-database.types";

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
 * How events are colored: the colors with what each stands for, and the color
 * an event gets.
 */
export interface ColorScheme {
  colorOf: (event: CalendarEventRecord) => null | string;
  legend: readonly ColorLegendEntry[];
}
