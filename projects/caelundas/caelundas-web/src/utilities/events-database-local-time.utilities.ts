import {
  formats,
  PART_OPTIONS,
} from "../constants/events-database-local-time.constants";

import type {
  LocalPart,
  LocalTimeFunction,
} from "../types/events-database-local-time.types";

/**
 * Every local-time function by the name SQL calls it.
 */
export function listLocalTimeFunctions(): Readonly<
  Record<string, LocalTimeFunction>
> {
  return {
    event_local_date: localDate,
    event_local_hour: localHour,
    event_local_weekday: localWeekday,
  };
}

/**
 * The calendar day an instant falls on in a zone, as `YYYY-MM-DD`.
 */
export function localDate(instant: unknown, timeZone: unknown): null | string {
  return formatLocalPart("day", instant, timeZone);
}

/**
 * The hour of the day an instant falls in in a zone, from 0 to 23.
 */
export function localHour(instant: unknown, timeZone: unknown): null | number {
  const hour = formatLocalPart("hour", instant, timeZone);

  return hour === null ? null : Number(hour);
}

/**
 * The day of the week an instant falls on in a zone, 0 for Sunday, the way
 * SQLite's `%w` numbers it: the weekday of its local day.
 */
export function localWeekday(
  instant: unknown,
  timeZone: unknown,
): null | number {
  const day = formatLocalPart("day", instant, timeZone);

  return day === null ? null : new Date(`${day}T00:00:00Z`).getUTCDay();
}

/**
 * Writes one part of an instant in a zone, keeping one formatter per part
 * and zone, or `null` when the instant or the zone does not parse: either
 * makes the formatter throw.
 */
function formatLocalPart(
  part: LocalPart,
  instant: unknown,
  timeZone: unknown,
): null | string {
  const key = `${part} ${String(timeZone)}`;

  try {
    let format = formats.get(key);

    if (format === undefined) {
      const [locale, options] = PART_OPTIONS[part];

      format = new Intl.DateTimeFormat(locale, {
        ...options,
        timeZone: String(timeZone),
      });
      formats.set(key, format);
    }

    return format.format(new Date(String(instant)));
  } catch {
    return null;
  }
}
