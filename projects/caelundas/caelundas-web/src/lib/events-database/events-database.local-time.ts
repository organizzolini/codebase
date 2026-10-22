// SQLite knows no time zones, so the times an event happens at where it was
// observed are read through these functions, which every executor registers
// on its database under the names below before running a select.

/**
 * A scalar SQL function of an ISO 8601 instant and an IANA zone. It answers
 * `null` for anything it cannot read, as SQLite's own date functions do.
 */
export type LocalTimeFunction = (
  instant: unknown,
  timeZone: unknown,
) => null | number | string;

/**
 * What a formatter writes: the `YYYY-MM-DD` day, or the hour from 00 to 23.
 */
type LocalPart = "day" | "hour";

// Canadian English writes dates in ISO order.
const PART_OPTIONS: Readonly<
  Record<LocalPart, [string, Intl.DateTimeFormatOptions]>
> = {
  day: ["en-CA", { day: "2-digit", month: "2-digit", year: "numeric" }],
  hour: ["en-US", { hour: "2-digit", hourCycle: "h23" }],
};

const formats = new Map<string, Intl.DateTimeFormat>();

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

/**
 * The calendar day an instant falls on in a zone, as `YYYY-MM-DD`.
 */
function localDate(instant: unknown, timeZone: unknown): null | string {
  return formatLocalPart("day", instant, timeZone);
}

/**
 * The hour of the day an instant falls in in a zone, from 0 to 23.
 */
function localHour(instant: unknown, timeZone: unknown): null | number {
  const hour = formatLocalPart("hour", instant, timeZone);

  return hour === null ? null : Number(hour);
}

/**
 * The day of the week an instant falls on in a zone, 0 for Sunday, the way
 * SQLite's `%w` numbers it: the weekday of its local day.
 */
function localWeekday(instant: unknown, timeZone: unknown): null | number {
  const day = formatLocalPart("day", instant, timeZone);

  return day === null ? null : new Date(`${day}T00:00:00Z`).getUTCDay();
}

/**
 * Every local-time function by the name SQL calls it.
 */
export const LOCAL_TIME_FUNCTIONS: Readonly<Record<string, LocalTimeFunction>> =
  {
    event_local_date: localDate,
    event_local_hour: localHour,
    event_local_weekday: localWeekday,
  };
