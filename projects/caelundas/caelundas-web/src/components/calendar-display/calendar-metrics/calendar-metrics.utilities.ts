import { createElement } from "react";

import { TagIcon } from "../../calendar-query/tag-icon/tag-icon";
import { isMetricView } from "../events-calendar/components/calendar-views/calendar-views.utilities";

import {
  ALL_METRICS,
  COUNT_FORMAT,
  DEFAULT_METRICS,
  EMPTY_VALUE,
  INSTANT_FORMATS,
  METRIC_BRANCHES,
  METRIC_CATALOG,
  MINUTE_MILLISECONDS,
  PERCENT_FORMAT,
  SHARE_FORMAT,
} from "./calendar-metrics.constants";
import { COMPACT_SPAN } from "./components/calendar-metrics-span/calendar-metrics-span.constants";
import {
  formatDurationSpan,
  formatHoursSpan,
} from "./components/calendar-metrics-span/calendar-metrics-span.utilities";

import type { EventMetric } from "../../../graphql/generated/operations";
import type { CalendarViewName } from "../events-calendar/components/calendar-views/calendar-views.types";
import type {
  MetricChange,
  MetricDescriptor,
  MetricValue,
} from "./calendar-metrics.types";
import type { DurationSpanOptions } from "./components/calendar-metrics-span/calendar-metrics-span.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * One metric's value among a group's or the total's, or nothing when it was not asked for.
 */
export function findMetricValue(
  values: readonly MetricValue[],
  metric: EventMetric,
): MetricValue | undefined {
  for (const candidate of values) {
    if (candidate.metric === metric) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * A duration in minutes: `3 h 20 min` under a day, from a day up its years, months, weeks, days, hours and minutes.
 */
export function formatDuration(
  minutes: number,
  options?: Readonly<DurationSpanOptions>,
): string {
  return formatDurationSpan(minutes, options);
}

/**
 * How a metric moved from the previous period: the change in its units, its percent, and its direction; nothing without a previous value.
 */
export function formatMetricChange(
  metric: EventMetric,
  value: null | number,
  previous: null | number,
): MetricChange {
  if (previous === null) {
    return { direction: "flat", percent: null, percentText: "", text: "" };
  }

  const delta = (value ?? 0) - previous;
  const percent = toChangePercent(delta, previous);

  if (delta === 0) {
    return {
      direction: "flat",
      percent,
      percentText: percent === null ? "" : "0%",
      text: "No change",
    };
  }

  return {
    direction: delta > 0 ? "up" : "down",
    percent,
    percentText: formatChangePercent(percent),
    text: `${delta > 0 ? "+" : "-"}${formatDelta(METRIC_CATALOG[metric], Math.abs(delta))}`,
  };
}

/**
 * A metric's number as text: separated counts, hours and minutes, percents, or a date and time in the zone.
 */
export function formatMetricValue(
  metric: EventMetric,
  value: null | number,
  timeZone = "UTC",
): string {
  if (value === null) {
    return EMPTY_VALUE;
  }

  const { format } = METRIC_CATALOG[metric];

  if (format === "duration") {
    return formatDurationSpan(value);
  }

  if (format === "hours") {
    return formatHoursSpan(value);
  }

  if (format === "percent") {
    return `${SHARE_FORMAT.format(value)}%`;
  }

  return format === "instant"
    ? formatInstant(value, timeZone)
    : COUNT_FORMAT.format(value);
}

/**
 * The picker's nested choices: the metrics under Counts, Durations and Times, each with its icon and note.
 */
export function getMetricOptions(view?: CalendarViewName): CascaderNode[] {
  const options: CascaderNode[] = [];

  for (const branch of METRIC_BRANCHES) {
    const metrics: readonly EventMetric[] = branch.metrics;
    const offered = metrics.filter((metric) => isOffered(metric, view));

    if (offered.length > 0) {
      options.push({
        children: offered.map((metric) => toMetricItem(metric)),
        icon: createElement(TagIcon, { name: branch.icon }),
        label: branch.label,
        value: branch.value,
      });
    }
  }

  return options;
}

// 🌎 Public Functions

/**
 * Whether a group's value is the sum of its subgroups', so a stack of them adds up to the group's bar.
 */
export function isAdditiveMetric(metric: EventMetric): boolean {
  return METRIC_CATALOG[metric].additive;
}

/**
 * Whether a metric is a date, not a duration or a count, so a chart's axis cannot scale it.
 */
export function isInstantMetric(metric: EventMetric): boolean {
  return METRIC_CATALOG[metric].format === "instant";
}

/**
 * The metrics the Charts draw: those given without the dates, or the Charts' defaults when none is left.
 */
export function listChartMetrics(
  metrics: readonly EventMetric[],
): readonly EventMetric[] {
  const kept = metrics.filter(
    (metric) => METRIC_CATALOG[metric].format !== "instant",
  );

  if (kept.length === metrics.length) {
    return metrics;
  }

  return kept.length === 0 ? DEFAULT_METRICS.charts : kept;
}

/**
 * Reads a link's metrics, one name or a list: unknown names and repeats are dropped, and none left is nothing.
 */
export function parseMetrics(value: unknown): EventMetric[] | undefined {
  const metrics: EventMetric[] = [];

  const items: unknown[] = Array.isArray(value) ? value : [value];

  for (const item of items) {
    const known = ALL_METRICS.find((candidate) => candidate === item);

    if (known !== undefined && !metrics.includes(known)) {
      metrics.push(known);
    }
  }

  return metrics.length === 0 ? undefined : metrics;
}

/**
 * The metrics a layout shows: the link's, else the layout's defaults.
 */
export function resolveMetrics(
  view: CalendarViewName | undefined,
  metrics?: readonly EventMetric[],
): readonly EventMetric[] {
  const layout = isMetricView(view) ? view : "charts";
  const chosen =
    metrics !== undefined && metrics.length > 0
      ? metrics
      : DEFAULT_METRICS[layout];

  return view === "charts" ? listChartMetrics(chosen) : chosen;
}

/**
 * A change in percent as text with its sign; empty when there is none, or it rounds to none.
 */
function formatChangePercent(percent: null | number): string {
  if (percent === null || percent === 0) {
    return "";
  }

  return `${percent > 0 ? "+" : "-"}${PERCENT_FORMAT.format(Math.abs(percent))}%`;
}

/**
 * A change in a metric's units, without its sign.
 */
function formatDelta(descriptor: MetricDescriptor, amount: number): string {
  if (descriptor.format === "duration") {
    return formatDurationSpan(amount, COMPACT_SPAN);
  }

  if (descriptor.format === "instant") {
    return formatDurationSpan(amount / MINUTE_MILLISECONDS, COMPACT_SPAN);
  }

  if (descriptor.format === "hours") {
    return formatHoursSpan(amount, COMPACT_SPAN);
  }

  if (descriptor.format === "percent") {
    return `${SHARE_FORMAT.format(amount)} pts`;
  }

  return `${COUNT_FORMAT.format(amount)} ${amount === 1 ? descriptor.unit.slice(0, -1) : descriptor.unit}`;
}

/**
 * An instant as a date and time in a zone.
 */
function formatInstant(epochMilliseconds: number, timeZone: string): string {
  let format = INSTANT_FORMATS.get(timeZone);

  if (format === undefined) {
    format = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    });
    INSTANT_FORMATS.set(timeZone, format);
  }

  return format.format(epochMilliseconds);
}

/**
 * Whether the picker offers a metric on a view: the Charts leave out the dates.
 */
function isOffered(metric: EventMetric, view?: CalendarViewName): boolean {
  return view !== "charts" || !isInstantMetric(metric);
}

/**
 * A change as a percent of the previous value, to one decimal; none when the previous was none.
 */
function toChangePercent(delta: number, previous: number): null | number {
  return previous === 0
    ? null
    : Math.round((delta / Math.abs(previous)) * 1000) / 10;
}

/**
 * A metric as a row of the picker.
 */
function toMetricItem(metric: EventMetric): CascaderNode {
  const descriptor = METRIC_CATALOG[metric];

  return {
    description: descriptor.description,
    icon: createElement(TagIcon, { name: descriptor.icon }),
    keywords: [descriptor.label, descriptor.shortLabel],
    label: descriptor.label,
    value: metric,
  };
}
