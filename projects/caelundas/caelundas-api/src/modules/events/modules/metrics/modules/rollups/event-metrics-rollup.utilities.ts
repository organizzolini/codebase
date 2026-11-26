import { TAG_FIELD_PREFIX } from "../../../filtering/modules/query-building/event-filter-fields.constants";
import { compileFactsScope } from "../../../filtering/modules/query-building/event-scope.utilities";
import { UUID_PATTERN } from "../../../filtering/modules/values/event-filter-values.constants";
import { collectMeasures } from "../catalog/event-metrics-catalog.utilities";
import {
  compileMetricColumns,
  compileRolledMeasure,
  isRolledMeasure,
} from "../measures/event-metrics-measures.utilities";

import {
  ROLLUP_CALENDAR_COLUMNS_SQL,
  ROLLUP_CALENDAR_KEYS,
  ROLLUP_FACTS_SQL,
  ROLLUP_GUARD_SQL,
  ROLLUP_TAG_TARGET,
  ROLLUP_TOTAL_TARGET,
} from "./event-metrics-rollup.constants";

import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type {
  CompiledEventMetricsQuery,
  EventMetricsQueryRequest,
} from "../../event-metrics.types";
import type { CatalogMeasure } from "../catalog/event-metrics-catalog.types";
import type {
  RollupCalendarKey,
  RollupTarget,
} from "./event-metrics-rollup.types";

// 🌎 Public Functions

/**
 * The statement that checks the zone and the periods suit the rollups.
 */
export function compileRollupGuard(
  request: EventMetricsQueryRequest,
): CompiledEventMetricsQuery {
  const parameters: unknown[] = [];
  const periods = bindPeriods(request, parameters);

  return {
    parameters,
    sql: fill(ROLLUP_GUARD_SQL, [["{periods}", periods]]),
  };
}

/**
 * The statement that reads the request from the rollups, or none for a level
 * they cannot answer.
 */
export function compileRollupRead(
  request: EventMetricsQueryRequest,
  zone: string,
): CompiledEventMetricsQuery | null {
  const target = findRollupTarget(request);

  if (target === null) {
    return null;
  }

  const parameters: unknown[] = [];
  const periods = bindPeriods(request, parameters);
  const bound = bind(parameters, zone);
  const root = target.root === null ? "" : bind(parameters, target.root);
  const measures = collectMeasures(request.metrics, request.catalog);
  const group = target.group === null ? "" : `, w.${target.group}`;

  return {
    parameters,
    sql: fill(ROLLUP_FACTS_SQL, [
      ["{cells}", target.cells],
      ["{untagged}", target.untagged],
      ["{untaggedRows}", target.untaggedRows],
      ["{totals}", compileColumns(measures)],
      ["{rollupExtra}", target.rollupExtra],
      ["{crossingExtra}", target.crossingExtra],
      ["{crossingJoin}", target.crossingJoin],
      ["{group}", group],
      ["{columns}", target.columns],
      [
        "{metrics}",
        compileMetricColumns(request.metrics, {
          catalog: request.catalog,
          resolve: (measure) => `(t."m_${measure.slug}")::float8`,
        }),
      ],
      ["{joins}", target.join],
      ["{periods}", periods],
      ["{zone}", `${bound}::text`],
      ["{root}", root],
      ["{eventRows}", `true${compileFactsScope(request.scope, "f")}`],
    ]),
  };
}

/**
 * What a request groups by in the rollups: the whole set, a calendar field or
 * a tag's children at the first level; else none.
 */
export function findRollupTarget(
  request: EventMetricsQueryRequest,
): null | RollupTarget {
  if (request.level === undefined) {
    return ROLLUP_TOTAL_TARGET;
  }

  const level = request.level === 0 ? request.grouping[0] : undefined;
  const calendar = ROLLUP_CALENDAR_KEYS.get(level?.field ?? "");

  if (level === undefined) {
    return null;
  }

  return calendar === undefined
    ? describeTag(level)
    : describeCalendar(calendar);
}

// The facts are built for the default scope and cannot drop an event by its
// tags, so a scope that keeps the phase boundaries reads the events.
/**
 * Whether the rollups answer the request: no filter, metrics that merge, the default scope.
 */
export function isRollupRequest(request: EventMetricsQueryRequest): boolean {
  return (
    !request.scope.includePhaseBoundaries &&
    request.filter === null &&
    collectMeasures(request.metrics, request.catalog).every((measure) =>
      isRolledMeasure(measure),
    )
  );
}

// 🔏 Private Functions

/**
 * Binds a value and answers the placeholder that stands for it.
 */
function bind(values: unknown[], value: unknown): string {
  values.push(value);

  return `$${String(values.length)}`;
}

/**
 * The periods as the rows of a `values` list, numbered current then previous.
 */
function bindPeriods(
  request: EventMetricsQueryRequest,
  values: unknown[],
): string {
  const rows: string[] = [];

  for (const [index, period] of [request.period, request.previous].entries()) {
    if (period !== null) {
      const start = bind(values, period.start);
      const end = bind(values, period.end);

      rows.push(
        `(${String(index)}, ${start}::timestamptz, ${end}::timestamptz)`,
      );
    }
  }

  return rows.join(", ");
}

/**
 * One column a measure, named `m_<slug>`, over the rollup rows `w`.
 */
function compileColumns(measures: readonly CatalogMeasure[]): string {
  let sql = "";

  for (const measure of measures) {
    const rolled = compileRolledMeasure(measure);

    if (rolled !== null) {
      sql += `,\n      ${rolled.sql} as "m_${measure.slug}"`;
    }
  }

  return sql;
}

/**
 * The target of a calendar field's groups.
 */
function describeCalendar({
  column,
  key,
  source,
}: RollupCalendarKey): RollupTarget {
  // Every row already carries its day.
  const own = column === "day";
  const read = (alias: string): string =>
    `, ${source.replaceAll("{r}", () => alias)} as "${column}"`;

  return {
    ...ROLLUP_TOTAL_TARGET,
    columns: ROLLUP_CALENDAR_COLUMNS_SQL.replaceAll("{key}", () => key),
    crossingExtra: `${ROLLUP_TOTAL_TARGET.crossingExtra}${own ? "" : read("x")}`,
    group: column,
    rollupExtra: `${ROLLUP_TOTAL_TARGET.rollupExtra}${own ? "" : read("r")}`,
  };
}

/**
 * The target of a level of a root's children, or none for any other tag level.
 */
function describeTag(level: EventGroupLevel): null | RollupTarget {
  const root = level.field.slice(TAG_FIELD_PREFIX.length);
  const plain =
    level.field.startsWith(TAG_FIELD_PREFIX) &&
    level.parent === undefined &&
    level.tags.length === 0 &&
    (level.depth ?? 1) === 1 &&
    UUID_PATTERN.test(root) &&
    root === root.toLowerCase();

  return plain ? { ...ROLLUP_TAG_TARGET, root } : null;
}

/**
 * Replaces each token with its text, in order, so a text may bring tokens
 * for a later one.
 */
function fill(
  sql: string,
  replacements: readonly (readonly [string, string])[],
): string {
  let filled = sql;

  for (const [token, text] of replacements) {
    filled = filled.replaceAll(token, () => text);
  }

  return filled;
}
