import {
  DURATION_UNITS,
  PERCENT_SCALE,
  SMALLEST_UNIT,
  TICK_FORMAT,
  TICK_GAPS,
} from "./calendar-charts.constants";

import type { MetricDescriptor } from "../calendar-metrics/calendar-metrics.types";
import type {
  ChartAxis,
  ChartBar,
  DurationUnit,
} from "./calendar-charts.types";

// 🔏 Private Functions

/**
 * A value axis: a share's whole; for a duration, whole ticks in the unit its biggest value calls for; else to the biggest value.
 */
export function buildChartAxis(
  metric: Readonly<MetricDescriptor>,
  maximum: number,
): ChartAxis {
  if (metric.unit === "NONE") {
    return { domain: [0, PERCENT_SCALE], ticks: undefined, unit: undefined };
  }

  if (metric.unit !== "DURATION") {
    return { domain: [0, "auto"], ticks: undefined, unit: undefined };
  }

  const unit = pickDurationUnit(maximum);
  const count = maximum / unit.minutes;
  const step = pickTickStep(count / TICK_GAPS);
  const gaps = Math.max(1, Math.ceil(count / step));
  const spacing = step * unit.minutes;
  const ticks = Array.from(
    { length: gaps + 1 },
    (_value, index) => index * spacing,
  );

  return { domain: [0, gaps * spacing], ticks, unit };
}

/**
 * The tallest a chart's columns stand: its biggest stack, or previous value.
 */
export function findChartMaximum(bars: readonly ChartBar[]): number {
  let maximum = 0;

  for (const bar of bars) {
    let stack = 0;

    for (const { value } of bar.segments) {
      stack += value;
    }

    maximum = Math.max(maximum, stack, bar.previous ?? 0);
  }

  return maximum;
}

/**
 * A tick of the value axis kept short: counts compact, durations in the axis's unit, shares as percents.
 */
export function formatChartTick(
  metric: Readonly<MetricDescriptor>,
  value: number,
  unit?: DurationUnit,
): string {
  if (unit !== undefined) {
    return `${TICK_FORMAT.format(value / unit.minutes)} ${unit.label}`;
  }

  return metric.unit === "NONE"
    ? `${TICK_FORMAT.format(value)}%`
    : TICK_FORMAT.format(value);
}

// 🌎 Public Functions

/**
 * The largest unit the value holds at least twice over, else the smallest.
 */
function pickDurationUnit(minutes: number): DurationUnit {
  return (
    DURATION_UNITS.findLast((unit) => minutes >= unit.minutes * 2) ??
    SMALLEST_UNIT
  );
}

/**
 * The smallest 1, 2, 5 or 10 times a power of ten, no less than a size or one.
 */
function pickTickStep(size: number): number {
  const wanted = Math.max(1, size);
  const magnitude = 10 ** Math.floor(Math.log10(wanted));
  const mantissa = wanted / magnitude;

  if (mantissa <= 1) {
    return magnitude;
  }

  if (mantissa <= 2) {
    return 2 * magnitude;
  }

  return (mantissa <= 5 ? 5 : 10) * magnitude;
}
