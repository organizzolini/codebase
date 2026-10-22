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
