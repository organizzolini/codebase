import {
  DISTINCT_MEASURE_SQL,
  METRIC_DEFINITIONS,
} from "./event-metrics-measures.constants";

import type { EventMetric } from "../inputs/event-metric.entities";
import type {
  EventDistinctMeasure,
  EventMeasure,
  EventMeasureValues,
  EventMetricReader,
} from "./event-metrics-measures.types";

// 🌎 Public Functions

/**
 * Computes each metric asked for, in order, from a group's measures.
 */
export function evaluateMetrics(
  metrics: readonly EventMetric[],
  measures: EventMeasureValues,
): (null | number)[] {
  const cache = new Map<EventMetric, null | number>();
  const read: EventMetricReader = (metric) => {
    const cached = cache.get(metric);

    if (cached !== undefined) {
      return cached;
    }

    const value = METRIC_DEFINITIONS[metric].compute(measures, read);

    cache.set(metric, value);

    return value;
  };
  const values: (null | number)[] = [];

  for (const metric of metrics) {
    values.push(read(metric));
  }

  return values;
}

/**
 * The measures the metrics read, directly or through other metrics, sorted.
 */
export function findMeasures(metrics: readonly EventMetric[]): EventMeasure[] {
  const measures = new Set<EventMeasure>();
  const seen = new Set<EventMetric>();
  const pending = [...metrics];

  for (
    let metric = pending.pop();
    metric !== undefined;
    metric = pending.pop()
  ) {
    if (!seen.has(metric)) {
      const definition = METRIC_DEFINITIONS[metric];

      seen.add(metric);

      for (const measure of definition.measures) {
        measures.add(measure);
      }

      pending.push(...definition.metrics);
    }
  }

  return [...measures].toSorted();
}

/**
 * Whether a measure counts distinct values, and so is counted apart.
 */
export function isDistinctMeasure(
  measure: EventMeasure,
): measure is EventDistinctMeasure {
  return measure in DISTINCT_MEASURE_SQL;
}
