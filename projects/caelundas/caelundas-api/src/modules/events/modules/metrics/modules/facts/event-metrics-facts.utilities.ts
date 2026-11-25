import { metricValueSchema } from "../../event-metrics.constants";
import {
  evaluateMetrics,
  isDistinctMeasure,
} from "../measures/event-metrics-measures.utilities";

import type { EventMetricsRow } from "../../event-metrics.types";
import type { EventMetric } from "../inputs/event-metric.entities";
import type { EventMeasure } from "../measures/event-metrics-measures.types";
import type { FactsRow, MeasuredRows } from "./event-metrics-facts.types";

// 🌎 Public Functions

/**
 * Turns the rows of the facts statement into the rows each level and the
 * total are read from, computing each metric from its measures.
 */
export function toMeasuredRows(
  rows: readonly FactsRow[],
  request: Readonly<{
    levels: number;
    measures: readonly EventMeasure[];
    metrics: readonly EventMetric[];
  }>,
): MeasuredRows {
  const levels: EventMetricsRow[][] = [];
  const total: EventMetricsRow[] = [];

  for (let level = 0; level < request.levels; level++) {
    levels.push([]);
  }

  for (const row of rows) {
    const measured = toRow(row, request);

    (levels[row.level] ?? total).push(measured);
  }

  return { levels, total };
}

// 🔏 Private Functions

/**
 * The key a row has at a level, none for the group with no key.
 */
function readKey(row: FactsRow, level: number): null | string {
  const key = row[`t${String(level)}`];

  return typeof key === "string" ? key : null;
}

/**
 * One row of a level or of the total, with its group's ids and values.
 */
function toRow(
  row: FactsRow,
  request: Readonly<{
    measures: readonly EventMeasure[];
    metrics: readonly EventMetric[];
  }>,
): EventMetricsRow {
  let id = "";
  let parentId = "";

  for (let level = 0; level <= row.level; level++) {
    parentId = id;
    id += `/${String(level)}:${readKey(row, level) ?? ""}`;
  }

  const measures: Partial<Record<EventMeasure, null | number>> = {};

  for (const measure of request.measures) {
    measures[measure] = metricValueSchema.parse(
      row[isDistinctMeasure(measure) ? measure : `m_${measure}`],
    );
  }

  return {
    id,
    key: readKey(row, row.level),
    label: row.label,
    parentId,
    path: row.path,
    period: row.period,
    rank: row.rank,
    values: evaluateMetrics(request.metrics, measures),
  };
}
