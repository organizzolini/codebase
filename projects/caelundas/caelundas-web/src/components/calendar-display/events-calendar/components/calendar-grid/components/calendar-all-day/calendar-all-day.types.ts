import type { ALL_DAY_MODES } from "./calendar-all-day.constants";

// 🏷️ Types

/**
 * How much of the all-day row shows: slim, groups, or all.
 */
export type AllDayMode = (typeof ALL_DAY_MODES)[number];
