import type { DurationUnit } from "../types/calendar-format.types";

export const MINUTES_PER_HOUR = 60;

export const MINUTES_PER_DAY = 1440;

/**
 * One formatter per unit, which names a count such as "1 day" or "12 hours".
 */
export const UNIT_FORMATS: Readonly<Record<DurationUnit, Intl.NumberFormat>> = {
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
