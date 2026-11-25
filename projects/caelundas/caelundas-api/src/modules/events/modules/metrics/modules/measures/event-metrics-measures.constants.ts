import { EventMetric } from "../inputs/event-metric.entities";

import { divide, read } from "./event-metrics-measures-math.utilities";

import type {
  EventDistinctMeasure,
  EventMeasure,
  EventMetricDefinition,
} from "./event-metrics-measures.types";

// ♟️ Constants

/** Seconds in a minute. */
const MINUTE = 60;

/** Seconds in an hour. */
const HOUR = 3600;

/** The union of ranges in seconds, over `{ranges}`. */
const UNION_SECONDS_SQL = `(select coalesce(sum(extract(epoch from upper(r) - lower(r))), 0) from unnest({ranges}) r)`;

/** An event's span clipped to its period, as a range. */
const CLIPPED_RANGE_SQL = `tstzrange(greatest(x."start", x.period_start), least(x."end", x.period_end))`;

/** An event's seconds inside its period. */
const CLIPPED_SECONDS_SQL = `extract(epoch from least(x."end", x.period_end) - greatest(x."start", x.period_start))`;

/** Narrows an aggregate to events that carry the progressive tag. */
const PROGRESSIVE_SQL = ` filter (where x.is_progressive)`;

/** Narrows an aggregate to events that last. */
const SPAN_SQL = ` filter (where x."end" > x."start")`;

/** What each distinct measure counts, and the rows it reads it from. */
export const DISTINCT_MEASURE_SQL: Readonly<
  Record<EventDistinctMeasure, { column: string; join: string }>
> = {
  tags: {
    column: "d.id",
    join: "cross join lateral unnest(x.direct_tag_ids) as d (id)",
  },
};

/** The SQL of each measure counted within its group. */
export const MEASURE_SQL: Readonly<
  Record<Exclude<EventMeasure, EventDistinctMeasure>, string>
> = {
  clippedSeconds: `coalesce(sum(${CLIPPED_SECONDS_SQL}), 0)`,
  coveredClippedSeconds: UNION_SECONDS_SQL.replace(
    "{ranges}",
    `range_agg(${CLIPPED_RANGE_SQL})`,
  ),
  coveredSeconds: UNION_SECONDS_SQL.replace(
    "{ranges}",
    `range_agg(tstzrange(x."start", x."end"))`,
  ),
  days: `count(distinct x.start_local_day)`,
  events: `count(*)`,
  firstStart: `extract(epoch from min(x."start")) * 1000`,
  instants: `count(*) filter (where x."end" = x."start")`,
  lastStart: `extract(epoch from max(x."start")) * 1000`,
  longestSeconds: `max(x.duration_seconds)${SPAN_SQL}`,
  medianSeconds: `percentile_cont(0.5) within group (order by x.duration_seconds)${SPAN_SQL}`,
  names: `count(distinct x.summary)`,
  periodSeconds: `extract(epoch from (min(x.period_end) - min(x.period_start)))`,
  progressiveClippedSeconds: `coalesce(sum(${CLIPPED_SECONDS_SQL})${PROGRESSIVE_SQL}, 0)`,
  progressiveCoveredClippedSeconds: UNION_SECONDS_SQL.replace(
    "{ranges}",
    `range_agg(${CLIPPED_RANGE_SQL})${PROGRESSIVE_SQL}`,
  ),
  progressiveSeconds: `coalesce(sum(x.duration_seconds)${PROGRESSIVE_SQL}, 0)`,
  seconds: `coalesce(sum(x.duration_seconds), 0)`,
  shortestSeconds: `min(x.duration_seconds)${SPAN_SQL}`,
  spans: `count(*) filter (where x."end" > x."start")`,
};

/** Each metric as a calculation, evaluated once per group in the service. */
export const METRIC_DEFINITIONS: Readonly<
  Record<EventMetric, EventMetricDefinition>
> = {
  [EventMetric.AVERAGE_DURATION_MINUTES]: {
    compute: (_measures, metric) =>
      divide(
        metric(EventMetric.TOTAL_DURATION_MINUTES),
        metric(EventMetric.SPANS),
        1,
      ),
    measures: [],
    metrics: [EventMetric.TOTAL_DURATION_MINUTES, EventMetric.SPANS],
  },
  [EventMetric.COVERED_MINUTES]: {
    compute: (measures) => divide(measures.coveredSeconds, MINUTE, 1),
    measures: ["coveredSeconds"],
    metrics: [],
  },
  [EventMetric.COVERED_PERCENT]: {
    compute: (measures) =>
      divide(measures.coveredClippedSeconds, measures.periodSeconds, 100),
    measures: ["coveredClippedSeconds", "periodSeconds"],
    metrics: [],
  },
  [EventMetric.DAYS_WITH_EVENTS]: {
    compute: (measures) => read(measures.days),
    measures: ["days"],
    metrics: [],
  },
  [EventMetric.EVENTS]: {
    compute: (measures) => read(measures.events),
    measures: ["events"],
    metrics: [],
  },
  [EventMetric.FIRST_START]: {
    compute: (measures) => read(measures.firstStart),
    measures: ["firstStart"],
    metrics: [],
  },
  [EventMetric.INSTANTS]: {
    compute: (measures) => read(measures.instants),
    measures: ["instants"],
    metrics: [],
  },
  [EventMetric.LAST_START]: {
    compute: (measures) => read(measures.lastStart),
    measures: ["lastStart"],
    metrics: [],
  },
  [EventMetric.LONGEST_DURATION_MINUTES]: {
    compute: (measures) => divide(measures.longestSeconds, MINUTE, 1),
    measures: ["longestSeconds"],
    metrics: [],
  },
  [EventMetric.MEDIAN_DURATION_MINUTES]: {
    compute: (measures) => divide(measures.medianSeconds, MINUTE, 1),
    measures: ["medianSeconds"],
    metrics: [],
  },
  [EventMetric.PROGRESSIVE_COVERED_PERCENT]: {
    compute: (measures) =>
      divide(
        measures.progressiveCoveredClippedSeconds,
        measures.periodSeconds,
        100,
      ),
    measures: ["periodSeconds", "progressiveCoveredClippedSeconds"],
    metrics: [],
  },
  [EventMetric.PROGRESSIVE_HOURS]: {
    compute: (measures) => divide(measures.progressiveSeconds, HOUR, 1),
    measures: ["progressiveSeconds"],
    metrics: [],
  },
  [EventMetric.PROGRESSIVE_TOTAL_PERCENT]: {
    compute: (measures) =>
      divide(measures.progressiveClippedSeconds, measures.periodSeconds, 100),
    measures: ["periodSeconds", "progressiveClippedSeconds"],
    metrics: [],
  },
  [EventMetric.SHORTEST_DURATION_MINUTES]: {
    compute: (measures) => divide(measures.shortestSeconds, MINUTE, 1),
    measures: ["shortestSeconds"],
    metrics: [],
  },
  [EventMetric.SPANS]: {
    compute: (measures) => read(measures.spans),
    measures: ["spans"],
    metrics: [],
  },
  [EventMetric.TOTAL_DURATION_MINUTES]: {
    compute: (measures) => divide(measures.seconds, MINUTE, 1),
    measures: ["seconds"],
    metrics: [],
  },
  [EventMetric.TOTAL_TIME_PERCENT]: {
    compute: (measures) =>
      divide(measures.clippedSeconds, measures.periodSeconds, 100),
    measures: ["clippedSeconds", "periodSeconds"],
    metrics: [],
  },
  [EventMetric.UNIQUE_NAMES]: {
    compute: (measures) => read(measures.names),
    measures: ["names"],
    metrics: [],
  },
  [EventMetric.UNIQUE_TAGS]: {
    compute: (measures) => read(measures.tags),
    measures: ["tags"],
    metrics: [],
  },
};
