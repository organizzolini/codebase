import { formatCalendarDay } from "../utilities/calendar-format.utilities";

import { DURATION_BUCKETS, WEEKDAY_LABELS } from "./event-filters.constants";

import type { DerivedGroupId } from "../types/event-groups.types";

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

export const KEY_FORMATS_BY_FIELD = new Map<string, (key: string) => string>(
  Object.entries(DERIVED_KEY_FORMATS),
);
