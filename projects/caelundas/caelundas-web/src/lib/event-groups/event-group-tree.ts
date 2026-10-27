import { DURATION_BUCKETS } from "../event-filters/event-filters.constants";

import { formatDerivedKey } from "./event-group-labels";
import { DERIVED_GROUP_IDS } from "./event-groups.constants";

import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../events-database/events-database.types";
import type {
  EventGroupField,
  EventGrouping,
  EventGroupNode,
} from "./event-groups.types";

const PATH_SEPARATOR = " / ";

/**
 * Where the events with no value at a level go: after every other group.
 */
const NO_GROUP_ORDER = "￿";

/**
 * The events of one group at one level, gathered under the first key that
 * named it.
 */
interface GroupBucket {
  events: CalendarEventRecord[];
  groupKey: CalendarEventGroupKey | null;
}

/**
 * How a group reads and sorts, apart from the events in it.
 */
interface GroupDescription {
  label: string;
  order: string;
  path: readonly string[];
}

/**
 * A group whose events are split at the next level, and the list its
 * sub-groups go in.
 */
interface GroupParent {
  children: EventGroupNode[];
  events: readonly CalendarEventRecord[];
  id: string;
}

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
      const ordered: { node: EventGroupNode; order: string }[] = [];

      // A loop rather than a mapping callback, which would count as one
      // more frame on every stack beneath it.
      for (const bucket of collectGroups(parent.events, level)) {
        const description = describeGroup(bucket.groupKey, {
          field: groupLevel.field,
          fieldLabel,
        });

        ordered.push({
          node: {
            children: [],
            count: bucket.events.length,
            events: bucket.events,
            id: `${parent.id}/${String(level)}:${bucket.groupKey?.key ?? ""}`,
            key: bucket.groupKey?.key ?? null,
            label: description.label,
            level,
            path: description.path,
          },
          order: description.order,
        });
      }

      const nodes = ordered
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
    const keys = event.groups[level] ?? [];

    for (const groupKey of keys.length === 0 ? [null] : keys) {
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
