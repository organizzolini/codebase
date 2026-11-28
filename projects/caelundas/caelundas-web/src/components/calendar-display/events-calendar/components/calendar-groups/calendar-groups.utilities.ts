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
  CalendarGroupReference,
  CalendarGroupSort,
  GroupBucket,
} from "./calendar-groups.types";

/**
 * Names the group an event falls under; each falls under one, so a cell's counts add up.
 */
export function createGroupOf(
  grouping: EventGrouping,
  roots?: ReadonlySet<string>,
): (event: CalendarEventRecord) => CalendarGroupReference {
  const [first] = grouping;
  // Read here rather than by isDefaultGrouping, which would add a frame to every stack beneath.
  const isDefault =
    first?.field === ALL_TAGS_FIELD && first.depth === undefined;

  return (event) => {
    const key = getPrimaryKey(event, isDefault, roots);

    return key === undefined
      ? { id: NO_GROUP_ID, key: null, label: NO_GROUP_LABEL }
      : { id: key.key, key: key.key, label: key.label ?? key.key };
  };
}

/**
 * The names of the tag roots that group by default: those the data does not flag otherwise.
 */
export function getDefaultRoots(facets: readonly EventFacet[]): Set<string> {
  const roots = new Set<string>();

  for (const facet of facets) {
    if (facet.isDefaultGroup !== false) {
      roots.add(facet.name);
    }
  }

  return roots;
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
    }
  >,
): CalendarEventGroup[] {
  const groups: CalendarEventGroup[] = [];

  for (const bucket of collectBuckets(
    events,
    options.grouping,
    options.roots,
  )) {
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
  grouping: EventGrouping,
  roots: ReadonlySet<string> | undefined,
): GroupBucket[] {
  const isDefault = isDefaultGrouping(grouping);
  const groupOf = createGroupOf(grouping, roots);
  const buckets = new Map<string, GroupBucket>();

  for (const event of events) {
    const reference = groupOf(event);
    const key = getPrimaryKey(event, isDefault, roots);
    const bucket = buckets.get(reference.id) ?? {
      events: [],
      rank: key?.rank ?? key?.path ?? reference.label,
      ref: reference,
    };

    bucket.events.push(event);
    buckets.set(reference.id, bucket);
  }

  return [...buckets.values()].toSorted(compareGroups);
}

/**
 * Orders groups by their tags' order, the group of events with no key last.
 */
function compareGroups(left: GroupBucket, right: GroupBucket): number {
  if (left.ref.key === null || right.ref.key === null) {
    return Number(left.ref.key === null) - Number(right.ref.key === null);
  }

  return compareNatural(left.rank, right.rank);
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
 * The key an event is grouped under: by default its first root that groups by default, else the first.
 */
function getPrimaryKey(
  event: CalendarEventRecord,
  isDefault: boolean,
  roots: ReadonlySet<string> | undefined,
): CalendarEventGroupKey | undefined {
  const keys = event.groups[0] ?? [];

  if (isDefault) {
    for (const key of keys) {
      // The root is the path's first name; a key with no path has its label.
      const root = `${key.path ?? key.label}`
        .split(TAG_PATH_SEPARATOR, 1)
        .join("");

      if (roots === undefined || roots.has(root)) {
        return key;
      }
    }
  }

  return keys[0];
}
