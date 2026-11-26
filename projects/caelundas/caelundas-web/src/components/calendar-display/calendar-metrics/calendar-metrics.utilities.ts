import { createElement } from "react";

import { TagIcon } from "../../calendar-query/tag-icon/tag-icon";
import { isMetricView } from "../events-calendar/components/calendar-views/calendar-views.utilities";

import {
  COUNT_FORMAT,
  EMPTY_VALUE,
  INSTANT_FORMATS,
  METRIC_BRANCHES,
  METRIC_SLUG_PATTERN,
  MINUTE_MILLISECONDS,
  OLD_METRIC_ALIASES,
  PERCENT_FORMAT,
  SHARE_FORMAT,
} from "./calendar-metrics.constants";
import { COMPACT_SPAN } from "./components/calendar-metrics-span/calendar-metrics-span.constants";
import { formatDurationSpan } from "./components/calendar-metrics-span/calendar-metrics-span.utilities";

import type { CalendarViewName } from "../events-calendar/components/calendar-views/calendar-views.types";
import type {
  MetricCatalog,
  MetricChange,
  MetricDescriptor,
  MetricValue,
} from "./calendar-metrics.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * One metric's value among a group's or the total's, or nothing when it was not asked for.
 */
export function findMetricValue(
  values: readonly MetricValue[],
  slug: string,
): MetricValue | undefined {
  for (const candidate of values) {
    if (candidate.metric === slug) {
      return candidate;
    }
  }

  return undefined;
}

/**
 * How a metric moved from the previous period: the change in its units, its percent, and its direction; nothing without a previous value.
 */
export function formatMetricChange(
  metric: Readonly<MetricDescriptor>,
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
    text: `${delta > 0 ? "+" : "-"}${formatDelta(metric, Math.abs(delta))}`,
  };
}

/**
 * A metric's number as text, by its unit: separated counts, a span of time, a percent, or a date and time in the zone.
 */
export function formatMetricValue(
  metric: Readonly<MetricDescriptor>,
  value: null | number,
  timeZone = "UTC",
): string {
  if (value === null) {
    return EMPTY_VALUE;
  }

  if (metric.unit === "DURATION") {
    return formatDurationSpan(value);
  }

  if (metric.unit === "NONE") {
    return `${SHARE_FORMAT.format(value)}%`;
  }

  return metric.unit === "INSTANT"
    ? formatInstant(value, timeZone)
    : COUNT_FORMAT.format(value);
}

/**
 * The picker's nested choices: the catalog's metrics under Counts, Durations, Share of time and Times, each with its icon and note.
 */
export function getMetricOptions(
  catalog: Readonly<MetricCatalog>,
  view?: CalendarViewName,
): CascaderNode[] {
  const options: CascaderNode[] = [];

  for (const branch of METRIC_BRANCHES) {
    const offered = catalog.metrics.filter(
      (metric) => metric.unit === branch.unit && isOffered(metric, view),
    );

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
 * Whether a metric is a date, not a duration or a count, so a chart's axis cannot scale it.
 */
export function isInstantMetric(
  metric: Readonly<MetricDescriptor> | undefined,
): boolean {
  return metric?.unit === "INSTANT";
}

/**
 * The metrics the Charts draw: those given without the dates, or the Charts' defaults when none is left.
 */
export function listChartMetrics(
  catalog: Readonly<MetricCatalog>,
  slugs: readonly string[],
): readonly string[] {
  const kept: string[] = [];

  // A loop rather than a filter callback keeps the call stacks shallow.
  for (const slug of slugs) {
    if (catalog.bySlug.get(slug)?.unit !== "INSTANT") {
      kept.push(slug);
    }
  }

  if (kept.length === slugs.length) {
    return slugs;
  }

  return kept.length === 0 ? catalog.defaults.charts : kept;
}

/**
 * Reads a link's metrics, a slug or a list: old names become slugs; non-slugs and repeats are dropped.
 */
export function parseMetrics(value: unknown): string[] | undefined {
  const slugs: string[] = [];

  const items: unknown[] = Array.isArray(value) ? value : [value];

  for (const item of items) {
    const slug = toMetricSlug(item);

    if (slug !== undefined && !slugs.includes(slug)) {
      slugs.push(slug);
    }
  }

  return slugs.length === 0 ? undefined : slugs;
}

/**
 * The metrics a layout shows: the link's that the catalog knows, else the layout's defaults; none until the catalog loads.
 */
export function resolveMetrics(
  catalog: Readonly<MetricCatalog>,
  view: CalendarViewName | undefined,
  slugs?: readonly string[],
): readonly string[] {
  const layout = isMetricView(view) ? view : "charts";
  const known = (slugs ?? []).filter((slug) => catalog.bySlug.has(slug));
  const chosen = known.length > 0 ? known : catalog.defaults[layout];

  return view === "charts" ? listChartMetrics(catalog, chosen) : chosen;
}

/**
 * A metric's slug as a link wrote it: a slug, or an old name taken for its slug; nothing for anything else.
 */
export function toMetricSlug(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const slug =
    (Object.hasOwn(OLD_METRIC_ALIASES, value)
      ? OLD_METRIC_ALIASES[value]
      : undefined) ?? value;

  return METRIC_SLUG_PATTERN.test(slug) ? slug : undefined;
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
function formatDelta(
  metric: Readonly<MetricDescriptor>,
  amount: number,
): string {
  if (metric.unit === "DURATION") {
    return formatDurationSpan(amount, COMPACT_SPAN);
  }

  if (metric.unit === "INSTANT") {
    return formatDurationSpan(amount / MINUTE_MILLISECONDS, COMPACT_SPAN);
  }

  if (metric.unit === "NONE") {
    return `${SHARE_FORMAT.format(amount)} pts`;
  }

  const noun = metric.name.toLowerCase();
  // A single one drops the trailing s of each word: `1 day with event`.
  const named = amount === 1 ? noun.replaceAll(/s(?=\s|$)/gu, "") : noun;

  return `${COUNT_FORMAT.format(amount)} ${named}`;
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
function isOffered(
  metric: Readonly<MetricDescriptor>,
  view?: CalendarViewName,
): boolean {
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
function toMetricItem(metric: Readonly<MetricDescriptor>): CascaderNode {
  return {
    description: metric.note,
    icon: createElement(TagIcon, { name: metric.icon }),
    keywords: [metric.name],
    label: metric.name,
    value: metric.slug,
  };
}
