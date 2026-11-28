import { listKeys } from "../../calendar-skeleton.utilities";

// ♟️ Constants

const WEEKS = 6;

const DAYS_PER_WEEK = 7;

/**
 * The widths of the event bars a day holds, in turn.
 */
export const DAY_BARS: readonly (readonly string[])[] = [
  ["w-full", "w-full"],
  ["w-full"],
  ["w-full", "w-2/3"],
  [],
  ["w-1/2", "w-full"],
  ["w-full"],
  ["w-2/3"],
];

export const WEEKDAY_KEYS = listKeys("weekday", DAYS_PER_WEEK);

export const CELLS = listKeys("cell", WEEKS * DAYS_PER_WEEK).map(
  (id, index) => ({
    // Each bar is keyed by its place, since a day may hold two of one width.
    bars: (DAY_BARS[index % DAY_BARS.length] ?? []).map((width, position) => ({
      key: `${id}-bar-${String(position)}`,
      width,
    })),
    id,
  }),
);
