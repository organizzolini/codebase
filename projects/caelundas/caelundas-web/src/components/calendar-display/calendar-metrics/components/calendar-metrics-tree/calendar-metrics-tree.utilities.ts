import { compareNatural } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-order.utilities";
import { SORT_SIGNS } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.constants";
import {
  findMetricValue,
  parseMetrics,
} from "../../calendar-metrics.utilities";

import { NO_RANK } from "./calendar-metrics-tree.constants";

import type { EventMetric } from "../../../../../graphql/generated/operations";
import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  MetricGroup,
  MetricNode,
  MetricTreeIds,
} from "../../calendar-metrics.types";

// 🔏 Private Functions

/**
 * The sorted ids of every group, each one's level, and the first path: what the table's shared state is told.
 */
export function describeMetricGroups(
  groups: readonly MetricGroup[],
): MetricTreeIds {
  const entries: { id: string; level: number }[] = [];
  const firstPath: string[] = [];
  const pending = [...groups];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    entries.push({ id: node.id, level: node.level });
    pending.push(...(node.children ?? []));
  }

  for (let node = groups[0]; node !== undefined; node = node.children?.[0]) {
    firstPath.push(node.id);
  }

  const sorted = entries.toSorted((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );

  return {
    firstPath,
    groupIds: sorted.map((entry) => entry.id),
    groupLevels: sorted.map((entry) => entry.level),
  };
}

/**
 * The groups the tree shows with some open: each open group gives way to its subgroups, and the rest show themselves, in order.
 */
export function flattenMetricGroups(
  groups: readonly MetricGroup[],
  expanded: ReadonlySet<string>,
): MetricNode[] {
  const nodes: MetricNode[] = [];
  const pending: { ancestors: readonly MetricGroup[]; group: MetricGroup }[] =
    groups.map((group) => ({ ancestors: [], group })).toReversed();

  for (let item = pending.pop(); item !== undefined; item = pending.pop()) {
    const { ancestors, group } = item;
    const children = group.children ?? [];

    if (children.length > 0 && expanded.has(group.id)) {
      const next = [...ancestors, group];

      pending.push(
        ...children
          .map((child) => ({ ancestors: next, group: child }))
          .toReversed(),
      );
    } else {
      nodes.push({ ancestors, group, isExpandable: children.length > 0 });
    }
  }

  return nodes;
}

/**
 * The tree with every level ordered by the sorts, the first sort first; the same tree when there are none.
 */
export function sortMetricGroups(
  groups: readonly MetricGroup[],
  sorts: readonly GroupSort[] | undefined,
): readonly MetricGroup[] {
  if (sorts === undefined || sorts.length === 0) {
    return groups;
  }

  const compare = (left: MetricGroup, right: MetricGroup): number => {
    for (const sort of sorts) {
      const result = compareMetricGroups(sort, [left, right]);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
  const sorted = groups.map((group) => ({ ...group })).toSorted(compare);
  // A loop rather than recursion keeps the stack flat however deep it goes.
  const pending = [...sorted];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    if (node.children !== undefined) {
      node.children = node.children
        .map((child) => ({ ...child }))
        .toSorted(compare);
      pending.push(...node.children);
    }
  }

  return sorted;
}

/**
 * How two groups order under one sort: by tag rank, name, or a metric's value, a missing value counting as zero.
 */
function compareMetricGroups(
  sort: GroupSort,
  pair: readonly [MetricGroup, MetricGroup],
): number {
  const [left, right] = pair;
  const sign = SORT_SIGNS[sort.direction];
  const metric = getSortMetric(sort);

  if (metric !== undefined) {
    return sign * (readValue(left, metric) - readValue(right, metric));
  }

  if (sort.key === "name") {
    return sign * compareNatural(left.label, right.label);
  }

  return sign * compareNatural(left.rank ?? NO_RANK, right.rank ?? NO_RANK);
}

/**
 * The metric a sort measures: its own, or the event count or first start; none for a name or order.
 */
function getSortMetric(sort: GroupSort): EventMetric | undefined {
  if (sort.key === "count") {
    return "EVENTS";
  }

  if (sort.key === "first") {
    return "FIRST_START";
  }

  return sort.key === "metric" ? parseMetrics(sort.metric)?.[0] : undefined;
}

/**
 * A group's number for a metric, zero when it has none.
 */
function readValue(group: MetricGroup, metric: EventMetric): number {
  return findMetricValue(group.values, metric)?.value ?? 0;
}
