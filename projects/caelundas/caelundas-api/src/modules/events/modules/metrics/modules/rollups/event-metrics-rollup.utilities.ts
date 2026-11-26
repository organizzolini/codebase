import { TAG_FIELD_PREFIX } from "../../../filtering/modules/query-building/event-filter-fields.constants";
import { compileFactsScope } from "../../../filtering/modules/query-building/event-scope.utilities";
import { UUID_PATTERN } from "../../../filtering/modules/values/event-filter-values.constants";
import { METRIC_COLUMN_PREFIX } from "../../event-metrics.constants";
import { pinGrain } from "../../event-metrics.utilities";
import { EventMetric } from "../inputs/event-metric.entities";

import {
  ROLLUP_CALENDAR_COLUMNS_SQL,
  ROLLUP_CALENDAR_KEYS,
  ROLLUP_COVERED_SQL,
  ROLLUP_DIRECTS_SQL,
  ROLLUP_DURATIONS_SQL,
  ROLLUP_FACTS_SQL,
  ROLLUP_FAMILY_ALIASES,
  ROLLUP_GUARD_SQL,
  ROLLUP_METRIC_FAMILIES,
  ROLLUP_METRIC_SQL,
  ROLLUP_TAG_ROOT_SQL,
  ROLLUP_TAG_TARGET,
  ROLLUP_TOTAL_TARGET,
} from "./event-metrics-rollup.constants";

import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type {
  CompiledEventMetricsQuery,
  EventMetricsQueryRequest,
  FactsGrain,
} from "../../event-metrics.types";
import type {
  RollupCalendarKey,
  RollupFamily,
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
  const families = findFamilies(request.metrics);
  const unique = compileUniqueRoot(request, parameters);
  const group = target.group === null ? "" : `, w.${target.group}`;
  const zGroup = target.group === null ? "" : `, z.${target.group}`;

  return {
    parameters,
    sql: fill(ROLLUP_FACTS_SQL, [
      ["{untagged}", target.untagged],
      ["{untaggedRows}", target.untaggedRows],
      ["{families}", compileFamilies(families, target)],
      [
        "{covered}",
        request.metrics.includes(EventMetric.COVERED_MINUTES)
          ? ROLLUP_COVERED_SQL
          : "",
      ],
      ["{rollupExtra}", target.rollupExtra],
      ["{crossingExtra}", target.crossingExtra],
      ["{crossingJoin}", target.crossingJoin],
      ["{restrict}", target.restrict],
      ["{tagRoot}", unique],
      ["{group}", group],
      ["{zGroup}", zGroup],
      ["{columns}", target.columns],
      ["{metrics}", compileMetrics(request.metrics)],
      ["{joins}", compileJoins(families, target)],
      ["{periods}", periods],
      ["{zone}", `${bound}::text`],
      ["{root}", root],
      ["{rollupRows}", scoped(request, "r", target.grain)],
      ["{nameRows}", scoped(request, "r", "dayTagName")],
      ["{eventRows}", scoped(request, "f", "event")],
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

/**
 * Whether the request's filter and metrics are ones the rollups answer.
 */
export function isRollupRequest(request: EventMetricsQueryRequest): boolean {
  return (
    request.filter === null &&
    request.metrics.every((metric) => ROLLUP_METRIC_SQL[metric] !== undefined)
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
 * The side statements the metrics read, each of a family once.
 */
function compileFamilies(
  families: readonly RollupFamily[],
  target: RollupTarget,
): string {
  const sources: Readonly<Record<RollupFamily, string>> = {
    directs: ROLLUP_DIRECTS_SQL,
    durations: ROLLUP_DURATIONS_SQL,
    names: target.names,
  };

  return families.map((family) => sources[family]).join("");
}

/**
 * The joins of the side statements to the totals of each group.
 */
function compileJoins(
  families: readonly RollupFamily[],
  target: RollupTarget,
): string {
  const group = target.group;
  let sql = "";

  for (const family of families) {
    const alias = ROLLUP_FAMILY_ALIASES[family];

    sql += ` left join ${family} ${alias} on ${alias}.period = t.period${group === null ? "" : ` and ${alias}.${group} is not distinct from t.${group}`}`;
  }

  return sql + target.join;
}

/**
 * One metric column a metric, in the order asked.
 */
function compileMetrics(metrics: readonly EventMetric[]): string {
  let sql = "";

  for (const [index, metric] of metrics.entries()) {
    sql += `,\n    (${ROLLUP_METRIC_SQL[metric] ?? ""})::float8 as ${METRIC_COLUMN_PREFIX}${String(index)}`;
  }

  return sql;
}

/**
 * The condition that limits the unique tags to those beneath the tag root,
 * binding the root once the metric is asked for.
 */
function compileUniqueRoot(
  request: EventMetricsQueryRequest,
  values: unknown[],
): string {
  const { tagRoot } = request;

  if (tagRoot === null || !request.metrics.includes(EventMetric.UNIQUE_TAGS)) {
    return "";
  }

  // A root that is no tag id has no tags beneath it, as a null matches.
  const bound = bind(values, UUID_PATTERN.test(tagRoot) ? tagRoot : null);

  return ROLLUP_TAG_ROOT_SQL.replaceAll("{unique}", () => bound);
}

/**
 * The target of a calendar field's groups.
 */
function describeCalendar({ column, key }: RollupCalendarKey): RollupTarget {
  // Every row already carries its day.
  const own = column === "local_day";

  return {
    ...ROLLUP_TOTAL_TARGET,
    columns: ROLLUP_CALENDAR_COLUMNS_SQL.replaceAll("{key}", () => key),
    crossingExtra: `${ROLLUP_TOTAL_TARGET.crossingExtra}${own ? "" : `, x.${column}`}`,
    group: column,
    rollupExtra: `${ROLLUP_TOTAL_TARGET.rollupExtra}${own ? "" : `, r.${column}`}`,
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

/**
 * The side statements the metrics need, each once, in the order asked.
 */
function findFamilies(metrics: readonly EventMetric[]): RollupFamily[] {
  const families = new Set<RollupFamily>();

  for (const metric of metrics) {
    const family = ROLLUP_METRIC_FAMILIES.get(metric);

    if (family !== undefined) {
      families.add(family);
    }
  }

  return [...families];
}

/**
 * The condition that pins the facts rows `alias` names to one grain and the
 * request's scope.
 */
function scoped(
  request: EventMetricsQueryRequest,
  alias: string,
  grain: FactsGrain,
): string {
  return `${pinGrain(alias, grain)}${compileFactsScope(request.scope, alias)}`;
}
