import { DURATION_BUCKETS } from "../calendar-filters/event-filters.constants";

import { formatDerivedKey } from "./event-group-labels.utilities";
import { NO_GROUP_ORDER, PATH_SEPARATOR } from "./event-group-tree.constants";
import { DERIVED_GROUP_IDS } from "./event-groups.constants";

import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../events-calendar/events-database.types";
import type {
  GroupBucket,
  GroupDescription,
  GroupParent,
} from "./event-group-tree.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupNode,
} from "./event-groups.types";

/**
 * Groups events into a tree, a level per level of the grouping, from the
 * group keys each event was read with. An event falls in every group of a
 * level it has a key for, or in the level's "No …" group when it has none,
 * and each group counts the distinct events it holds, so an event under two
 * planets is in both and counted once in the group above them.
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
 * Orders text by code point, the way SQLite orders the facets' paths.
 */
function compareText(left: string, right: string): number {
  return left < right ? -1 : Number(left > right);
}

/**
 * Describes a group for one key: a tag's name and path below its root, a
 * derived value written out, or the level's "No …" group for no key. Derived
 * keys sort as written, except the duration buckets, shortest first.
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
