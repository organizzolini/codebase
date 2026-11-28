import type { DurationUnit } from "./calendar-charts.types";

// ♟️ Constants

/**
 * The scale of a share, which a bar of 100 fills.
 */
export const PERCENT_SCALE = 100;

/**
 * The longest a group's label runs under its column, in characters.
 */
export const LABEL_LENGTH = 14;

/**
 * Writes a tick of the value axis short: `1.2K`.
 */
export const TICK_FORMAT = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
  notation: "compact",
});

/**
 * The smallest unit a duration's ticks fall on.
 */
export const SMALLEST_UNIT: DurationUnit = { label: "min", minutes: 1 };

/**
 * The units a duration's ticks fall on, smallest first.
 */
export const DURATION_UNITS: readonly DurationUnit[] = [
  SMALLEST_UNIT,
  { label: "h", minutes: 60 },
  { label: "d", minutes: 1440 },
  { label: "wk", minutes: 10_080 },
  { label: "mo", minutes: 43_200 },
  { label: "yr", minutes: 525_600 },
];

/**
 * About how many gaps a value axis divides its span into.
 */
export const TICK_GAPS = 4;

/**
 * The fill of a bar when colors are off.
 */
export const MONOCHROME_FILL = "#000000";

/**
 * The border and separators of a bar when colors are off.
 */
export const MONOCHROME_STROKE = "#ffffff";

/**
 * The most pieces of a bar a tooltip lists.
 */
export const TOOLTIP_ROWS = 8;

/**
 * The name of the series that draws the previous period.
 */
export const PREVIOUS_SERIES = "previous";

/**
 * The fill of a bar whose group has no color.
 */
export const DEFAULT_FILL = "var(--primary)";
