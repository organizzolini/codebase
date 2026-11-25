import { COUNT_FORMAT, HOURS_FORMAT } from "../../calendar-metrics.constants";

import {
  DAY_HOURS,
  DAY_MINUTES,
  DEFAULT_MAX_UNITS,
  SPAN_SEPARATORS,
  SPAN_UNITS,
  ZERO_SPAN,
} from "./calendar-metrics-span.constants";

import type { DurationSpanOptions } from "./calendar-metrics-span.types";

// 🌎 Public Functions

/**
 * A duration in minutes as its units, largest first, to the minute: `8 years, 11 months`; under a day, `3 h 20 min`.
 */
export function formatDurationSpan(
  minutes: number,
  options: Readonly<DurationSpanOptions> = {},
): string {
  const total = Math.round(Math.abs(minutes));
  const compact = options.compact === true;
  const abbreviated = compact || total < DAY_MINUTES;
  const limit = options.maxUnits ?? DEFAULT_MAX_UNITS[`${compact}`];
  const parts: string[] = [];
  let rest = total;

  for (const unit of SPAN_UNITS) {
    const count = Math.floor(rest / unit.minutes);

    if (count > 0) {
      const label = unit.labels[`${abbreviated}`][`${count === 1}`];

      parts.push(`${COUNT_FORMAT.format(count)} ${label}`);
      rest -= count * unit.minutes;
    }
  }

  return (
    parts.slice(0, limit).join(SPAN_SEPARATORS[`${abbreviated}`]) || ZERO_SPAN
  );
}

/**
 * A number of hours as text: one decimal below a day, a span from a day up.
 */
export function formatHoursSpan(
  hours: number,
  options: Readonly<DurationSpanOptions> = {},
): string {
  return Math.abs(hours) < DAY_HOURS
    ? `${HOURS_FORMAT.format(hours)} h`
    : formatDurationSpan(hours * 60, options);
}
