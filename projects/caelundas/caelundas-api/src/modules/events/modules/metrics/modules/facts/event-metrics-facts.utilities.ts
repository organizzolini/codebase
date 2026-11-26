import { metricValueSchema } from "../../event-metrics.constants";

import { FACTS_EVENT_COLUMN_SQL } from "./event-metrics-facts.constants";

import type { EventMetricsRow } from "../../event-metrics.types";
import type { FactsRow, MeasuredRows } from "./event-metrics-facts.types";

// 🌎 Public Functions

/**
 * The SQL that reads an event row's column from the facts row `f`: the
 * column, or its formula where the view holds none.
 */
export function readEventColumn(column: string): string {
  return Object.hasOwn(FACTS_EVENT_COLUMN_SQL, column)
    ? (FACTS_EVENT_COLUMN_SQL[column] ?? "")
    : `f."${column}"`;
}

/**
 * Turns the rows of the facts statement into the rows each level and the
 * total are read from, reading each metric's column.
 */
export function toMeasuredRows(
  rows: readonly FactsRow[],
  request: Readonly<{ levels: number; metrics: number }>,
): MeasuredRows {
  const levels: EventMetricsRow[][] = [];
  const total: EventMetricsRow[] = [];

  for (let level = 0; level < request.levels; level++) {
    levels.push([]);
  }

  for (const row of rows) {
    const measured = toRow(row, request.metrics);

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
 * One row of a level or of the total, with its group's ids and the values of
 * its `count` metric columns.
 */
function toRow(row: FactsRow, count: number): EventMetricsRow {
  let id = "";
  let parentId = "";

  for (let level = 0; level <= row.level; level++) {
    parentId = id;
    id += `/${String(level)}:${readKey(row, level) ?? ""}`;
  }

  const values: (null | number)[] = [];

  for (let index = 0; index < count; index++) {
    values.push(metricValueSchema.parse(row[`m${String(index)}`]));
  }

  return {
    id,
    key: readKey(row, row.level),
    label: row.label,
    parentId,
    path: row.path,
    period: row.period,
    rank: row.rank,
    values,
  };
}
