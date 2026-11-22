import { DURATION_BUCKETS } from "../../../calendar-filters/components/event-filter-model/event-filters.constants";
import { formatDerivedKey } from "../event-group-model/event-group-labels.utilities";
import { DERIVED_GROUP_IDS } from "../event-group-model/event-groups.constants";

import { NO_GROUP_ORDER, PATH_SEPARATOR } from "./event-group-tree.constants";

import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupNode,
} from "../event-group-model/event-groups.types";
import type {
  GroupBucket,
  GroupDescription,
  GroupParent,
  GroupSort,
} from "./event-group-tree.types";

/**
 * Groups events into a tree, one level per grouping level; an event falls in each group it has a key for.
 */
export function buildEventGroups(
  events: readonly CalendarEventRecord[],
  grouping: EventGrouping,
  fields: readonly EventGroupField[],
): EventGroupNode[] {
  const roots: EventGroupNode[] = [];
  // Built a level at a time rather than by recursion, keeping the stack
  // flat however deep the grouping goes.
  let parents: GroupParent[] = [{ children: roots, events, id: "" }];

  for (const [level, groupLevel] of grouping.entries()) {
    const field = fields.find((candidate) => candidate.id === groupLevel.field);
    const fieldLabel = field?.label ?? groupLevel.field;
    const next: EventGroupNode[] = [];

    for (const parent of parents) {
      const buckets = collectGroups(parent.events, level);
      const descriptions: GroupDescription[] = [];

      // Described here rather than by the node builder, so describing a key
      // adds no frame beneath it.
      for (const bucket of buckets) {
        descriptions.push(
          describeGroup(bucket.groupKey, {
            field: groupLevel.field,
            fieldLabel,
          }),
        );
      }

      const nodes = toGroupNodes(parent, { buckets, descriptions }, level)
        .toSorted((left, right) => compareText(left.order, right.order))
        .map(({ node }) => node);

      parent.children.push(...nodes);
      next.push(...nodes);
    }

    parents = next;
  }

  return roots;
}

/**
 * Orders every level of a group tree by sorts, the first sort first and each later one breaking its ties; the groups as built when there are none.
 */
export function sortEventGroups(
  nodes: EventGroupNode[],
  sorts: readonly GroupSort[] | undefined,
): EventGroupNode[] {
  if (sorts === undefined || sorts.length === 0) {
    return nodes;
  }

  const compare = (left: EventGroupNode, right: EventGroupNode): number => {
    for (const sort of sorts) {
      const result = compareBy(sort, left, right);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };
  const sorted = nodes.toSorted(compare);
  // A loop rather than recursion keeps the stack flat however deep it goes.
  const pending = [...sorted];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    node.children = node.children.toSorted(compare);
    pending.push(...node.children);
  }

  return sorted;
}

/**
 * Gathers the events of one level into a bucket per key, each event once.
 */
function collectGroups(
  events: readonly CalendarEventRecord[],
  level: number,
): GroupBucket[] {
  const buckets = new Map<null | string, GroupBucket>();

  for (const event of events) {
    for (const groupKey of readGroupKeys(event, level)) {
      const key = groupKey?.key ?? null;
      const bucket = buckets.get(key) ?? { events: [], groupKey };

      // A tag listed twice for one event, through two of its own tags,
      // still puts the event in the group once.
      if (bucket.events.at(-1) !== event) {
        bucket.events.push(event);
      }

      buckets.set(key, bucket);
    }
  }

  return [...buckets.values()];
}

/**
 * How two groups order under one sort.
 */
function compareBy(
  sort: GroupSort,
  left: EventGroupNode,
  right: EventGroupNode,
): number {
  const sign = sort.direction === "asc" ? 1 : -1;

  if (sort.key === "name") {
    return sign * left.label.localeCompare(right.label);
  }

  const measure = (node: EventGroupNode): number =>
    sort.key === "count" ? node.count : (node.events[0]?.start.getTime() ?? 0);

  return sign * (measure(left) - measure(right));
}

/**
 * Orders text by code point, the way the API orders the facets' paths.
 */
function compareText(left: string, right: string): number {
  return left < right ? -1 : Number(left > right);
}

/**
 * Describes a group for one key: a tag's name and path, a derived value, or the "No …" group for no key.
 */
function describeGroup(
  groupKey: CalendarEventGroupKey | null,
  context: Readonly<{ field: string; fieldLabel: string }>,
): GroupDescription {
  if (groupKey === null) {
    const label = `No ${context.fieldLabel}`;

    return { label, order: NO_GROUP_ORDER, path: [label] };
  }

  if (groupKey.path !== null) {
    return {
      label: groupKey.label ?? groupKey.key,
      order: groupKey.path,
      path: groupKey.path.split(PATH_SEPARATOR).slice(1),
    };
  }

  const label = formatDerivedKey(context.field, groupKey.key);
  const order =
    context.field === DERIVED_GROUP_IDS.duration
      ? String(
          DURATION_BUCKETS.findIndex((bucket) => bucket.value === groupKey.key),
        ).padStart(2, "0")
      : groupKey.key;

  return { label, order, path: [label] };
}

/**
 * The keys an event was read with for one level, or a single missing key
 * that files it under the level's "No …" group.
 */
function readGroupKeys(
  event: CalendarEventRecord,
  level: number,
): (CalendarEventGroupKey | null)[] {
  const keys = event.groups[level] ?? [];

  return keys.length === 0 ? [null] : keys;
}

/**
 * The groups one parent's events fall into at a level, each with the text it
 * is ordered by.
 */
function toGroupNodes(
  parent: GroupParent,
  groups: Readonly<{
    buckets: readonly GroupBucket[];
    descriptions: readonly GroupDescription[];
  }>,
  level: number,
): { node: EventGroupNode; order: string }[] {
  const ordered: { node: EventGroupNode; order: string }[] = [];

  // A loop rather than a mapping callback, which would count as one more
  // frame on every stack beneath it.
  for (const [index, bucket] of groups.buckets.entries()) {
    const description = groups.descriptions[index];
    const key = bucket.groupKey?.key ?? null;

    if (description === undefined) {
      continue;
    }

    ordered.push({
      node: {
        children: [],
        count: bucket.events.length,
        events: bucket.events,
        id: `${parent.id}/${String(level)}:${key ?? ""}`,
        key,
        label: description.label,
        level,
        path: description.path,
      },
      order: description.order,
    });
  }

  return ordered;
}
