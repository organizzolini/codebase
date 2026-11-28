import { ALL_TAGS_FIELD } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-fields.constants";
import { compareNatural } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-order.utilities";

import { sortCalendarGroups } from "./calendar-groups-sort.utilities";
import {
  NO_GROUP_ID,
  NO_GROUP_LABEL,
  TAG_PATH_SEPARATOR,
} from "./calendar-groups.constants";

import type { EventGrouping } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
  EventFacet,
} from "../calendar-loader/calendar-records.types";
import type {
  CalendarEventGroup,
  CalendarGroupBucket,
  CalendarGroupReference,
  CalendarGroupSort,
} from "./calendar-groups.types";

/**
 * Names the group an event falls under; each falls under one, so a cell's counts add up.
 */
export function createGroupOf(
  grouping: EventGrouping,
  roots?: ReadonlyMap<string, number>,
  level = 0,
): (event: CalendarEventRecord) => CalendarGroupReference {
  const first = grouping[level];
  // Read here rather than by isDefaultGrouping, which would add a frame to every stack beneath.
  const isDefault =
    first?.field === ALL_TAGS_FIELD && first.depth === undefined;

  return (event) => {
    const key = getPrimaryKey(event, { isDefault, level, roots });

    return key === undefined
      ? { id: NO_GROUP_ID, key: null, label: NO_GROUP_LABEL }
      : { id: key.key, key: key.key, label: key.label ?? key.key };
  };
}

/**
 * Each tag root's place in the order the API lists them, those that group by default ahead of the rest.
 */
export function getRootOrder(
  facets: readonly EventFacet[],
): Map<string, number> {
  const order = new Map<string, number>();

  for (const [index, facet] of facets.entries()) {
    order.set(
      facet.name,
      facet.isDefaultGroup === false ? facets.length + index : index,
    );
  }

  return order;
}

/**
 * Splits events into groups of the first grouping level, in tag order, the group with no key last.
 */
export function groupCalendarEvents(
  events: readonly CalendarEventRecord[],
  options: Readonly<
    Partial<CalendarGroupSort> & {
      colors?: ReadonlyMap<string, string> | undefined;
      grouping: EventGrouping;
      level?: number;
    }
  >,
): CalendarEventGroup[] {
  const groups: CalendarEventGroup[] = [];

  for (const bucket of collectBuckets(events, {
    grouping: options.grouping,
    level: options.level ?? 0,
    roots: options.roots,
  })) {
    const { key } = bucket.ref;

    groups.push({
      ...bucket.ref,
      color:
        (key === null ? undefined : options.colors?.get(key)) ??
        getDominantColor(bucket.events),
      events: bucket.events,
      rank: bucket.rank,
    });
  }

  return sortCalendarGroups(groups, options.sorts, options.ranks);
}

/**
 * Whether the grouping is the default: every tag root at its first level.
 */
export function isDefaultGrouping(grouping: EventGrouping): boolean {
  const [first] = grouping;

  return first?.field === ALL_TAGS_FIELD && first.depth === undefined;
}

/**
 * Gathers the events of each group, the groups in the order of their tags and the group of events with none last.
 */
function collectBuckets(
  events: readonly CalendarEventRecord[],
  options: Readonly<{
    grouping: EventGrouping;
    level: number;
    roots: ReadonlyMap<string, number> | undefined;
  }>,
): CalendarGroupBucket[] {
  const { grouping, level, roots } = options;
  const isDefault = level === 0 && isDefaultGrouping(grouping);
  const groupOf = createGroupOf(grouping, roots, level);
  const ordering = isDefault ? roots : undefined;
  const buckets = new Map<string, CalendarGroupBucket>();

  for (const event of events) {
    const reference = groupOf(event);
    const key = getPrimaryKey(event, { isDefault, level, roots });
    const bucket =
      buckets.get(reference.id) ?? createBucket(reference, key, ordering);

    bucket.events.push(event);
    buckets.set(reference.id, bucket);
  }

  return [...buckets.values()].toSorted(compareGroups);
}

/**
 * Orders groups by their tags' order, the group of events with no key last.
 */
function compareGroups(
  left: CalendarGroupBucket,
  right: CalendarGroupBucket,
): number {
  if (left.ref.key === null || right.ref.key === null) {
    return Number(left.ref.key === null) - Number(right.ref.key === null);
  }

  return left.order === right.order
    ? compareNatural(left.rank, right.rank)
    : left.order - right.order;
}

/**
 * An empty bucket for a group, ranked by its key's tag and its root's place.
 */
function createBucket(
  reference: CalendarGroupReference,
  key: CalendarEventGroupKey | undefined,
  ordering: ReadonlyMap<string, number> | undefined,
): CalendarGroupBucket {
  return {
    events: [],
    order: getRootPlace(key, ordering),
    rank: key?.rank ?? key?.path ?? reference.label,
    ref: reference,
  };
}

/**
 * The color most of the events share, the first met winning a tie; none when none has one.
 */
function getDominantColor(
  events: readonly CalendarEventRecord[],
): string | undefined {
  const counts = new Map<string, number>();
  let best: string | undefined;
  let bestCount = 0;

  for (const event of events) {
    if (event.color !== null) {
      const count = (counts.get(event.color) ?? 0) + 1;

      counts.set(event.color, count);

      if (count > bestCount) {
        best = event.color;
        bestCount = count;
      }
    }
  }

  return best;
}

/**
 * The key an event is grouped under: by default that of its first root in order, a default root before any other.
 */
function getPrimaryKey(
  event: CalendarEventRecord,
  options: Readonly<{
    isDefault: boolean;
    level: number;
    roots: ReadonlyMap<string, number> | undefined;
  }>,
): CalendarEventGroupKey | undefined {
  const { isDefault, level, roots } = options;
  const keys = event.groups[level] ?? [];
  let best: CalendarEventGroupKey | undefined;
  let bestOrder = Number.POSITIVE_INFINITY;

  for (const key of isDefault && roots !== undefined ? keys : []) {
    const order = getRootPlace(key, roots);

    if (order < bestOrder) {
      best = key;
      bestOrder = order;
    }
  }

  return best ?? keys[0];
}

/**
 * A key's root's place in the order of roots, past every root when it has none.
 */
function getRootPlace(
  key: CalendarEventGroupKey | undefined,
  roots: ReadonlyMap<string, number> | undefined,
): number {
  // The root is the path's first name; a key with no path has its label.
  const root = `${key?.path ?? key?.label}`
    .split(TAG_PATH_SEPARATOR, 1)
    .join("");

  return roots?.get(root) ?? Number.POSITIVE_INFINITY;
}
