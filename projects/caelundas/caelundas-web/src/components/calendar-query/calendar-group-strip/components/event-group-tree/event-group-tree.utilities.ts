import {
  ALL_TAGS_FIELD,
  DEFAULT_GROUP_LABEL,
} from "../event-group-model/event-group-fields.constants";
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
 * Groups events into a tree, a level each; an event falls in every group it has a key for.
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
        const split = splitParent(parent, level, context).toSorted(
          (left, right) => compareNatural(left.order, right.order),
        );

        promoteGroups(split, parent, next);
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
  keyLists: readonly (readonly CalendarEventGroupKey[])[],
): GroupBucket[] {
  const buckets = new Map<string, GroupBucket>();
  const lacking: CalendarEventRecord[] = [];

  for (const [index, event] of events.entries()) {
    const keys = keyLists[index] ?? [];

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

  // A metric orders the metric layouts' groups; events have none to measure.
  const measure = (node: EventGroupNode): number => {
    if (sort.key === "count") {
      return node.count;
    }

    return sort.key === "first" ? (node.events[0]?.start.getTime() ?? 0) : 0;
  };

  return sign * (measure(left) - measure(right));
}

/**
 * Describes a group for one key: a tag's name and path, a derived value's heading, or the "No …" group.
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

  return {
    field: current.field,
    fieldLabel: nameLevel(field, parent, current),
    only: onlyLevel(previous, current, parent),
    scoped: current.field === ALL_TAGS_FIELD && current.depth !== undefined,
    skip: skipLevel(parent, current),
  };
}

/**
 * The keys each event has at a level, kept to those beneath a tag path when given one.
 */
function listLevelKeys(
  events: readonly CalendarEventRecord[],
  level: number,
  within: string | undefined,
): (readonly CalendarEventGroupKey[])[] {
  const lists: (readonly CalendarEventGroupKey[])[] = [];

  // Loops rather than filter callbacks keep the call stacks shallow.
  for (const event of events) {
    const keys: CalendarEventGroupKey[] = [];

    for (const key of event.groups[level] ?? []) {
      if (within === undefined || key.path?.startsWith(within) === true) {
        keys.push(key);
      }
    }

    lists.push(keys);
  }

  return lists;
}

/**
 * The name a level's "No …" group uses: its parent tag's, its field's, or the field's id; the default's over every root's tags.
 */
function nameLevel(
  field: EventGroupField | undefined,
  parent: GroupNodeOption | undefined,
  current: EventGroupLevel,
): string {
  return current.field === ALL_TAGS_FIELD
    ? DEFAULT_GROUP_LABEL
    : (parent?.name ?? field?.label ?? current.field);
}

/**
 * The tag id of the only group a level splits: its parent tag, when it refines the level before it.
 */
function onlyLevel(
  previous: EventGroupLevel | undefined,
  current: EventGroupLevel,
  parent: GroupNodeOption | undefined,
): string | undefined {
  return previous?.field === current.field && parent !== undefined
    ? current.parent
    : undefined;
}

/**
 * Adds the groups of a split to their parent and to the parents of the next level.
 */
function promoteGroups(
  split: readonly OrderedGroupNode[],
  parent: GroupParent,
  next: GroupParent[],
): void {
  for (const { node, tagPath } of split) {
    parent.children.push(node);
    next.push({
      children: node.children,
      events: node.events,
      id: node.id,
      key: node.key,
      label: node.label,
      tagPath,
    });
  }
}

/**
 * Where a group falls when sorted by a tag: the lowest place of any tag its events carry beneath it.
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
 * What a level over every root's tags reads of a parent: its tag path and "No …" name; none without a tag.
 */
function scopeLevel(
  parent: GroupParent,
  context: LevelContext,
): null | { named: LevelContext; within: string | undefined } {
  if (context.scoped !== true) {
    return { named: context, within: undefined };
  }

  if (parent.tagPath === null) {
    return null;
  }

  return {
    named:
      parent.label === undefined
        ? context
        : { ...context, fieldLabel: parent.label },
    within:
      parent.tagPath === undefined
        ? undefined
        : `${parent.tagPath}${PATH_SEPARATOR}`,
  };
}

/**
 * How many names of a tag's path, from beneath the root, the level's parent already holds; the roots keep all theirs.
 */
function skipLevel(
  parent: GroupNodeOption | undefined,
  current: EventGroupLevel,
): number {
  return current.field === ALL_TAGS_FIELD
    ? (current.depth ?? 0) - 1
    : (parent?.depth ?? 0);
}

/**
 * Splits one parent's events into the groups of a level, each with the text it is ordered by, in no order yet.
 */
function splitParent(
  parent: GroupParent,
  level: number,
  context: LevelContext,
): OrderedGroupNode[] {
  const scope = scopeLevel(parent, context);

  if (scope === null) {
    return [];
  }

  const buckets = collectGroups(
    parent.events,
    listLevelKeys(parent.events, level, scope.within),
  );

  // A group none of whose events have a tag beneath its own stays whole.
  if (context.scoped === true && buckets[0]?.groupKey === null) {
    return [];
  }

  const descriptions: GroupDescription[] = [];

  // Described here rather than by the node builder, so describing a key
  // adds no frame beneath it. A derived key is formatted here too, beside
  // the description rather than beneath it, for the same reason.
  for (const bucket of buckets) {
    const heading = formatDerivedKey(context.field, bucket.groupKey?.key ?? "");

    descriptions.push(describeGroup(bucket.groupKey, scope.named, heading));
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
      tagPath: bucket.groupKey?.path ?? null,
    });
  }

  return ordered;
}
