import { formatDerivedKey } from "../event-group-model/event-group-labels.utilities";
import { compareNatural } from "../event-group-model/event-group-order.utilities";
import { DERIVED_GROUP_IDS } from "../event-group-model/event-groups.constants";

import {
  DURATION_ORDERS,
  NO_GROUP_ORDER,
  PATH_SEPARATOR,
  SORT_SIGNS,
} from "./event-group-tree.constants";

import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupLevel,
  EventGroupNode,
  GroupNodeOption,
} from "../event-group-model/event-groups.types";
import type {
  GroupBucket,
  GroupDescription,
  GroupParent,
  GroupSort,
  LevelContext,
  OrderedGroupNode,
  TagRanks,
} from "./event-group-tree.types";

/**
 * Groups events into a tree, one level per grouping level; an event falls in each group it has a key for. A level that refines the one before it in the same tag root splits only the group of its parent tag, and the others stay whole.
 */
export function buildEventGroups(
  events: readonly CalendarEventRecord[],
  grouping: EventGrouping,
  fields: readonly EventGroupField[],
): EventGroupNode[] {
  const roots: EventGroupNode[] = [];
  // Built a level at a time rather than by recursion, keeping the stack
  // flat however deep the grouping goes.
  let parents: GroupParent[] = [{ children: roots, events, id: "", key: null }];

  for (const [level, groupLevel] of grouping.entries()) {
    const context = describeLevel(grouping[level - 1], groupLevel, fields);
    const next: GroupParent[] = [];

    for (const parent of parents) {
      if (context.only === undefined || parent.key === context.only) {
        // Ordered here rather than where the groups are made, which would
        // put the comparison one frame deeper.
        const nodes = splitParent(parent, level, context)
          .toSorted((left, right) => compareNatural(left.order, right.order))
          .map(({ node }) => node);

        parent.children.push(...nodes);
        next.push(...nodes);
      } else {
        next.push(parent);
      }
    }

    parents = next;
  }

  return roots;
}

/** Orders every level of a group tree by sorts, the first first and later ones breaking ties; as built when none. */
export function sortEventGroups(
  nodes: EventGroupNode[],
  sorts: readonly GroupSort[] | undefined,
  ranks?: TagRanks,
): EventGroupNode[] {
  if (sorts === undefined || sorts.length === 0) {
    return nodes;
  }

  const compare = (left: EventGroupNode, right: EventGroupNode): number => {
    for (const sort of sorts) {
      const result = compareBy(sort, [left, right], ranks);

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
  const buckets = new Map<string, GroupBucket>();
  const lacking: CalendarEventRecord[] = [];

  for (const event of events) {
    const keys = event.groups[level] ?? [];

    // An event with no key at the level goes under its "No …" group.
    if (keys.length === 0) {
      lacking.push(event);
    }

    for (const groupKey of keys) {
      const bucket = buckets.get(groupKey.key) ?? { events: [], groupKey };

      // A tag listed twice for one event, through two of its own tags,
      // still puts the event in the group once.
      if (bucket.events.at(-1) !== event) {
        bucket.events.push(event);
      }

      buckets.set(groupKey.key, bucket);
    }
  }

  return lacking.length === 0
    ? [...buckets.values()]
    : [...buckets.values(), { events: lacking, groupKey: null }];
}

/**
 * How two groups order under one sort.
 */
function compareBy(
  sort: GroupSort,
  pair: readonly [EventGroupNode, EventGroupNode],
  ranks: TagRanks | undefined,
): number {
  const [left, right] = pair;
  const sign = SORT_SIGNS[sort.direction];

  if (sort.key === "tag") {
    const prefix = ranks?.prefixes.get(sort.tag ?? "");

    return (
      sign * (rankGroup(left, prefix, ranks) - rankGroup(right, prefix, ranks))
    );
  }

  if (sort.key === "order") {
    return (
      sign *
      compareNatural(left.order ?? left.label, right.order ?? right.label)
    );
  }

  if (sort.key === "name") {
    return sign * compareNatural(left.label, right.label);
  }

  const measure = (node: EventGroupNode): number =>
    sort.key === "count" ? node.count : (node.events[0]?.start.getTime() ?? 0);

  return sign * (measure(left) - measure(right));
}

/**
 * Describes a group for one key: a tag's name and path beneath the level's parent, a derived value as its heading, or the "No …" group for no key.
 */
function describeGroup(
  groupKey: CalendarEventGroupKey | null,
  context: LevelContext,
  heading: string,
): GroupDescription {
  if (groupKey === null) {
    const label = `No ${context.fieldLabel}`;

    return { label, order: NO_GROUP_ORDER, path: [label] };
  }

  if (groupKey.path !== null) {
    return {
      label: groupKey.label ?? groupKey.key,
      order: groupKey.orderKey ?? groupKey.path,
      path: groupKey.path.split(PATH_SEPARATOR).slice(1 + context.skip),
    };
  }

  const order =
    context.field === DERIVED_GROUP_IDS.duration
      ? (DURATION_ORDERS.get(groupKey.key) ?? "-1")
      : groupKey.key;

  return { label: heading, order, path: [heading] };
}

/**
 * What describes a level's groups: its field, the name of what it splits, and where in a tag root's tree its parent sits.
 */
function describeLevel(
  previous: EventGroupLevel | undefined,
  current: EventGroupLevel,
  fields: readonly EventGroupField[],
): LevelContext {
  const field = fields.find((candidate) => candidate.id === current.field);
  const parent = field?.nodes.find((node) => node.id === current.parent);
  const refines = previous?.field === current.field && parent !== undefined;

  return {
    field: current.field,
    fieldLabel: nameLevel(field, parent, current.field),
    only: refines ? current.parent : undefined,
    skip: parent?.depth ?? 0,
  };
}

/**
 * The name a level's "No …" group uses: its parent tag's, or its field's, or the field's id when the data lacks it.
 */
function nameLevel(
  field: EventGroupField | undefined,
  parent: GroupNodeOption | undefined,
  fallback: string,
): string {
  return parent?.name ?? field?.label ?? fallback;
}

/**
 * Where a group falls when sorted by a tag: the lowest place, in its root's tree order, of any tag its events carry beneath that tag. A group with none comes last.
 */
function rankGroup(
  node: EventGroupNode,
  prefix: string | undefined,
  ranks: TagRanks | undefined,
): number {
  let lowest = Number.POSITIVE_INFINITY;

  if (prefix === undefined || ranks === undefined) {
    return lowest;
  }

  // Loops rather than callbacks, which would count as frames on every sort.
  for (const event of node.events) {
    for (const eventTag of event.tags) {
      if (eventTag.path.startsWith(prefix)) {
        lowest = Math.min(lowest, ranks.ranks.get(eventTag.id) ?? lowest);
      }
    }
  }

  return lowest;
}

/**
 * Splits one parent's events into the groups of a level, each with the text it is ordered by, in no order yet.
 */
function splitParent(
  parent: GroupParent,
  level: number,
  context: LevelContext,
): OrderedGroupNode[] {
  const buckets = collectGroups(parent.events, level);
  const descriptions: GroupDescription[] = [];

  // Described here rather than by the node builder, so describing a key
  // adds no frame beneath it. A derived key is formatted here too, beside
  // the description rather than beneath it, for the same reason.
  for (const bucket of buckets) {
    const heading = formatDerivedKey(context.field, bucket.groupKey?.key ?? "");

    descriptions.push(describeGroup(bucket.groupKey, context, heading));
  }

  return toGroupNodes(parent, { buckets, descriptions }, level);
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
): OrderedGroupNode[] {
  const ordered: OrderedGroupNode[] = [];

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
        order: description.order,
        path: description.path,
      },
      order: description.order,
    });
  }

  return ordered;
}
