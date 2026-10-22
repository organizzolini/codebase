import type { CalendarEventRecord } from "../events-database/events-database.types";

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

/**
 * The units a duration is spelled out in, largest first.
 */
type DurationUnit = "day" | "hour" | "minute";

/**
 * One formatter per unit, which names a count such as "1 day" or "12 hours".
 */
const UNIT_FORMATS: Readonly<Record<DurationUnit, Intl.NumberFormat>> = {
  day: new Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "day",
    unitDisplay: "long",
  }),
  hour: new Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "hour",
    unitDisplay: "long",
  }),
  minute: new Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "minute",
    unitDisplay: "long",
  }),
};

/**
 * Spells out an event's tag paths and its duration, for the screen readers
 * an event's short label leaves them out for.
 */
export function describeEvent(event: CalendarEventRecord): string {
  const tagPaths = event.tags.map((tag) => tag.path).join("; ");

  return `${tagPaths}. ${formatDuration(event.durationMinutes)}`;
}

/**
 * Writes a `YYYY-MM-DD` day in full, such as "Wednesday, March 4, 2026".
 */
export function formatCalendarDay(day: string): string {
  // Noon UTC of the day reads as that same day in UTC, whatever the zone.
  return new Date(`${day}T12:00:00.000Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
  });
}

/**
 * Names a duration in days, hours, and minutes, leaving out any unit that is
 * zero, or "Instant" for an event with no duration at all.
 */
export function formatDuration(minutes: number): string {
  if (minutes === 0) {
    return "Instant";
  }

  const counts: [number, DurationUnit][] = [
    [Math.floor(minutes / MINUTES_PER_DAY), "day"],
    [Math.floor((minutes % MINUTES_PER_DAY) / MINUTES_PER_HOUR), "hour"],
    [minutes % MINUTES_PER_HOUR, "minute"],
  ];

  return counts
    .filter(([count]) => count > 0)
    .map(([count, unit]) => UNIT_FORMATS[unit].format(count))
    .join(", ");
}

/**
 * Writes the time of day an instant falls on in a zone, such as "10:20 AM",
 * with a plain space where the locale data may put a narrow one.
 */
export function formatEventTime(date: Date, timeZone: string): string {
  return date
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    })
    .replaceAll(" ", " ");
}
