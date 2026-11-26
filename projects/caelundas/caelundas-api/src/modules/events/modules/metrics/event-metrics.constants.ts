import { z } from "zod";

import { EventMetric } from "./modules/inputs/event-metric.entities";

// ♟️ Constants

/** The grains of `calendar_event_facts`, by the value of its `filter` column. */
export const FACTS_GRAINS = {
  day: "day",
  dayTag: "day-tag",
  dayTagName: "day-tag-name",
  event: "event",
} as const;

/** Most subgroups one group returns, in order. */
export const MAXIMUM_METRIC_GROUPS = 500;

/** Prefix of the column one metric is selected into. */
export const METRIC_COLUMN_PREFIX = "m";

/** Metrics that read 0 over no events, rather than nothing. */
export const ZERO_METRICS: ReadonlySet<EventMetric> = new Set([
  EventMetric.COVERED_MINUTES,
  EventMetric.COVERED_PERCENT,
  EventMetric.DAYS_WITH_EVENTS,
  EventMetric.EVENTS,
  EventMetric.INSTANTS,
  EventMetric.PROGRESSIVE_COVERED_PERCENT,
  EventMetric.PROGRESSIVE_HOURS,
  EventMetric.PROGRESSIVE_TOTAL_PERCENT,
  EventMetric.SPANS,
  EventMetric.TOTAL_DURATION_MINUTES,
  EventMetric.TOTAL_TIME_PERCENT,
  EventMetric.UNIQUE_NAMES,
  EventMetric.UNIQUE_TAGS,
]);

/** One row of the metrics query; the metric columns are read apart. */
export const metricRowSchema = z.looseObject({
  id: z.string().default(""),
  key: z.string().nullish().default(null),
  label: z.string().nullish().default(null),
  parent_id: z.string().default(""),
  path: z.string().nullish().default(null),
  period: z.coerce.number(),
  rank: z.string().nullish().default(null),
});

/** A metric's value in a row: a number, or null for none. */
export const metricValueSchema = z.number().nullable();

/** The tag names a "No …" group is called after. */
export const TAG_NAMES_SQL = `select t.id::text as id, t."name" from tags t where t.id::text = any($1::text[])`;

/** One row of {@link TAG_NAMES_SQL}. */
export const tagNameRowSchema = z.object({ id: z.string(), name: z.string() });
