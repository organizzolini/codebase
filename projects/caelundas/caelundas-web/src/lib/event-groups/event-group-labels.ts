import { formatCalendarDay } from "../calendar/calendar-format";
import {
  DURATION_BUCKETS,
  WEEKDAY_LABELS,
} from "../event-filters/event-filters.constants";

import type { DerivedGroupId } from "./event-groups.types";

const HOURS_PER_HALF_DAY = 12;

/**
 * How each derived field writes its keys for a heading.
 */
const DERIVED_KEY_FORMATS: Readonly<
  Record<DerivedGroupId, (key: string) => string>
> = {
  day: formatCalendarDay,
  duration: (key) =>
    DURATION_BUCKETS.find((bucket) => bucket.value === key)?.label ?? key,
  hour: (key) => {
    const hour = Number(key);
    const twelveHour = hour % HOURS_PER_HALF_DAY || HOURS_PER_HALF_DAY;

    return `${String(twelveHour)} ${hour < HOURS_PER_HALF_DAY ? "AM" : "PM"}`;
  },
  month: (key) =>
    new Date(`${key}-15T12:00:00.000Z`).toLocaleDateString("en-US", {
      month: "long",
      timeZone: "UTC",
      year: "numeric",
    }),
  quarter: (key) => {
    const [year = "", quarter = ""] = key.split("-");

    return `${quarter} ${year}`;
  },
  week: (key) => `Week of ${formatCalendarDay(key).replace(/^\w+, /u, "")}`,
  weekday: (key) => WEEKDAY_LABELS[Number(key)] ?? key,
  year: (key) => key,
};

const KEY_FORMATS_BY_FIELD = new Map<string, (key: string) => string>(
  Object.entries(DERIVED_KEY_FORMATS),
);

/**
 * Writes a derived group key the way a heading reads it, such as "Q1 2026",
 * "Week of March 1, 2026", "3 PM" or "Hours"; any other key as it is.
 */
export function formatDerivedKey(field: string, key: string): string {
  const format = KEY_FORMATS_BY_FIELD.get(field);

  return format === undefined ? key : format(key);
}
