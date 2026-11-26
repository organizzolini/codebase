import { NATURAL_COLLATOR } from "../../../../events.constants";
import { TAG_FIELD_PREFIX } from "../../../filtering/modules/query-building/event-filter-fields.constants";
import { MAXIMUM_METRIC_GROUPS } from "../../event-metrics.constants";

import { DURATION_RANKS, RANK_SEPARATOR } from "./event-metrics-tree.constants";

import type {
  EventMetricsDraft,
  EventMetricsRow,
  EventMetricsTreeSource,
} from "../../event-metrics.types";
import type { CatalogMetric } from "../catalog/event-metrics-catalog.types";
import type { EventMetricGroupEntity } from "../results/event-metric-group.entities";
import type { EventMetricValueEntity } from "../results/event-metric-value.entities";

// 🔏 Private Functions

/**
 * Builds the tree of groups from each level's rows, each group in the order
 * of its key beneath the group that holds it.
 */
export function buildMetricTree(
  source: EventMetricsTreeSource,
): EventMetricGroupEntity[] {
  const drafts = collectGroups(source);
  const roots: EventMetricGroupEntity[] = [];

  for (const draft of drafts.values()) {
    draft.entity.values = toMetricValues(source.metrics, {
      compare: source.compare,
      current: draft.current,
      previous: draft.previous,
    });
    (drafts.get(draft.parentId)?.entity.children ?? roots).push(draft.entity);
  }

  for (const { entity } of drafts.values()) {
    entity.children = limit(entity.children);
  }

  return limit(roots);
}

/**
 * The metrics in the order asked, over the current and previous rows; a
 * period with no row reads as no events.
 */
export function toMetricValues(
  metrics: readonly CatalogMetric[],
  periods: Readonly<{
    compare: boolean;
    current: readonly (null | number)[] | undefined;
    previous: readonly (null | number)[] | undefined;
  }>,
): EventMetricValueEntity[] {
  const values: EventMetricValueEntity[] = [];
  const { compare, current, previous } = periods;

  for (const [index, metric] of metrics.entries()) {
    const empty = emptyValue(metric);
    const before = previous === undefined ? empty : (previous[index] ?? null);

    values.push({
      metric: metric.slug,
      previous: compare ? before : null,
      value: current === undefined ? empty : (current[index] ?? null),
    });
  }

  return values;
}

/**
 * Gathers the rows of every level into one group each, with the values of
 * the periods the rows are of.
 */
function collectGroups(
  source: EventMetricsTreeSource,
): Map<string, EventMetricsDraft> {
  const drafts = new Map<string, EventMetricsDraft>();

  for (const [level, rows] of source.rows.entries()) {
    for (const row of rows) {
      const draft = drafts.get(row.id) ?? startGroup(row, source, level);

      if (row.period === 0) {
        draft.current = row.values;
      } else {
        draft.previous = row.values;
      }

      drafts.set(row.id, draft);
    }
  }

  return drafts;
}

/**
 * Orders two groups by their ranks, the group with no rank last.
 */
function compareGroups(
  left: EventMetricGroupEntity,
  right: EventMetricGroupEntity,
): number {
  if (left.rank === null || right.rank === null) {
    return Number(left.rank === null) - Number(right.rank === null);
  }

  return (
    compareRanks(left.rank, right.rank) ||
    NATURAL_COLLATOR.compare(String(left.key), String(right.key))
  );
}

/**
 * Orders ranks a name at a time with digits as numbers, parents before children.
 */
function compareRanks(left: string, right: string): number {
  const rightNames = right.split(RANK_SEPARATOR);

  for (const [index, name] of left.split(RANK_SEPARATOR).entries()) {
    const other = rightNames[index];

    if (other === undefined) {
      return 1;
    }

    const result = NATURAL_COLLATOR.compare(name, other);

    if (result !== 0) {
      return result;
    }
  }

  return left.split(RANK_SEPARATOR).length === rightNames.length ? 0 : -1;
}

/**
 * What a metric reads over no events: 0 for a count or a sum, else nothing.
 */
function emptyValue(metric: CatalogMetric): null | number {
  return metric.zeroIfEmpty ? 0 : null;
}

/**
 * Orders the groups and keeps the first of them, as many as a group may have.
 */
function limit(groups: EventMetricGroupEntity[]): EventMetricGroupEntity[] {
  return groups.toSorted(compareGroups).slice(0, MAXIMUM_METRIC_GROUPS);
}

/**
 * The name the group with no key at a level is called after.
 */
function nameLevel(source: EventMetricsTreeSource, level: number): string {
  const group = source.levels[level];

  if (!group?.field.startsWith(TAG_FIELD_PREFIX)) {
    return group?.field ?? "group";
  }

  const id = group.parent ?? group.field.slice(TAG_FIELD_PREFIX.length);

  return source.names.get(id) ?? "tag";
}

// 🌎 Public Functions

/**
 * A group's rank: a tag's own, or a derived value's.
 */
function rankOf(
  row: EventMetricsRow,
  source: EventMetricsTreeSource,
  level: number,
): null | string {
  if (row.key === null) {
    return null;
  }

  if (row.path !== null) {
    return row.rank ?? row.path;
  }

  return source.levels[level]?.field === "duration"
    ? (DURATION_RANKS.get(row.key) ?? "-1")
    : row.key;
}

/**
 * Starts the group a row describes, its children and values not yet known.
 */
function startGroup(
  row: EventMetricsRow,
  source: EventMetricsTreeSource,
  level: number,
): EventMetricsDraft {
  const label =
    row.key === null
      ? `No ${nameLevel(source, level)}`
      : (row.label ?? row.key);

  return {
    current: undefined,
    entity: {
      children: [],
      id: row.id,
      key: row.key,
      label,
      level,
      path: row.path,
      rank: rankOf(row, source, level),
      values: [],
    },
    parentId: row.parentId,
    previous: undefined,
  };
}
