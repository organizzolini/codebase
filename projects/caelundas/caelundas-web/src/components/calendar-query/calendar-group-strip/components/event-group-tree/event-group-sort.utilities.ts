import { TAG_FIELD_PREFIX } from "../../../calendar-filters/components/event-filter-model/event-filters.constants";

import { PATH_SEPARATOR, SORT_SIGNS } from "./event-group-tree.constants";

import type {
  CalendarEventRecord,
  EventFacet,
} from "../../../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";
import type { EventGroupNode } from "../event-group-model/event-groups.types";
import type {
  GroupSort,
  GroupSortKey,
  TagRanks,
} from "./event-group-tree.types";

/**
 * How tags rank when sorting by a tag: each tag's tree-order place, and the path prefix beneath each field or tag.
 */
export function createTagRanks(facets: readonly EventFacet[]): TagRanks {
  const prefixes = new Map<string, string>();
  const ranks = new Map<string, number>();
  let rank = 0;

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const facet of facets) {
    prefixes.set(
      `${TAG_FIELD_PREFIX}${facet.id}`,
      `${facet.name}${PATH_SEPARATOR}`,
    );

    for (const value of facet.values) {
      ranks.set(value.id, rank);
      prefixes.set(
        value.id,
        `${facet.name}${PATH_SEPARATOR}${value.path}${PATH_SEPARATOR}`,
      );
      rank += 1;
    }
  }

  return { prefixes, ranks };
}

/**
 * A group's number for a sort key: its event count, first start or end, or total duration.
 */
export function measureGroup(key: GroupSortKey, node: EventGroupNode): number {
  if (key === "count") {
    return node.count;
  }

  if (key === "first" || key === "start") {
    return node.events[0]?.start.getTime() ?? 0;
  }

  return measureSpan(key, node.events);
}

/**
 * The events ordered by the sorts, later ones breaking ties; as given when none orders events.
 */
export function sortGroupEvents(
  events: readonly CalendarEventRecord[],
  sorts: readonly GroupSort[] | undefined,
  ranks: TagRanks | undefined,
): CalendarEventRecord[] {
  const applicable: GroupSort[] = [];

  // Loops rather than callbacks keep the call stacks shallow.
  for (const sort of sorts ?? []) {
    if (isEventSort(sort.key)) {
      applicable.push(sort);
    }
  }

  if (applicable.length === 0) {
    return [...events];
  }

  // The tags' places are read once for all the events, so comparing two of them calls nothing deeper.
  const places = new Map<GroupSort, Map<CalendarEventRecord, number>>();

  for (const sort of applicable) {
    if (sort.key === "tag" && ranks !== undefined) {
      places.set(sort, rankEvents(events, sort, ranks));
    }
  }

  const compare = (
    left: CalendarEventRecord,
    right: CalendarEventRecord,
  ): number => {
    for (const sort of applicable) {
      const result =
        SORT_SIGNS[sort.direction] * compareEvents(sort, [left, right], places);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  };

  return events.toSorted(compare);
}

/**
 * The events by start, then by the sorts, as the table lists them without a grouping.
 */
export function sortListedEvents(
  events: readonly CalendarEventRecord[],
  sorts: readonly GroupSort[] | undefined,
  ranks: TagRanks | undefined,
): CalendarEventRecord[] {
  return sortGroupEvents(
    events.toSorted(
      (left, right) => left.start.getTime() - right.start.getTime(),
    ),
    sorts,
    ranks,
  );
}

/**
 * How two events order under a sort: by name, start, end, duration, or the tag they carry beneath a tag.
 */
function compareEvents(
  sort: GroupSort,
  pair: readonly [CalendarEventRecord, CalendarEventRecord],
  places: ReadonlyMap<GroupSort, ReadonlyMap<CalendarEventRecord, number>>,
): number {
  const [left, right] = pair;

  if (sort.key === "name") {
    return left.name.localeCompare(right.name, undefined, { numeric: true });
  }

  const differences: Partial<Record<GroupSortKey, number>> = {
    duration: left.durationMinutes - right.durationMinutes,
    end: left.end.getTime() - right.end.getTime(),
    start: left.start.getTime() - right.start.getTime(),
  };

  return differences[sort.key] ?? compareTagPlaces(places.get(sort), pair);
}

/**
 * How two events order by where the tag they carry falls; none for events with no place read.
 */
function compareTagPlaces(
  places: ReadonlyMap<CalendarEventRecord, number> | undefined,
  pair: readonly [CalendarEventRecord, CalendarEventRecord],
): number {
  const [left, right] = pair;

  return (
    (places?.get(left) ?? Number.MAX_SAFE_INTEGER) -
    (places?.get(right) ?? Number.MAX_SAFE_INTEGER)
  );
}

/**
 * Whether a key orders the events within a group, as against the groups themselves.
 */
function isEventSort(key: GroupSortKey): boolean {
  return (
    key === "duration" ||
    key === "end" ||
    key === "name" ||
    key === "start" ||
    key === "tag"
  );
}

/**
 * The number a group's events give for a key of their spans: their total duration, or when the first ends; else nothing.
 */
function measureSpan(
  key: GroupSortKey,
  events: readonly CalendarEventRecord[],
): number {
  if (key === "duration") {
    return events.reduce((sum, event) => sum + event.durationMinutes, 0);
  }

  return key === "end"
    ? events.reduce(
        (first, event) => Math.min(first, event.end.getTime()),
        events[0]?.end.getTime() ?? 0,
      )
    : 0;
}

/**
 * Where each event falls when sorted by a tag: the lowest place of any tag it carries beneath it, or past every one.
 */
function rankEvents(
  events: readonly CalendarEventRecord[],
  sort: GroupSort,
  ranks: TagRanks,
): Map<CalendarEventRecord, number> {
  const places = new Map<CalendarEventRecord, number>();
  const prefix = ranks.prefixes.get(sort.tag ?? "");

  for (const event of events) {
    let lowest = Number.MAX_SAFE_INTEGER;

    for (const tag of event.tags) {
      if (prefix !== undefined && tag.path.startsWith(prefix)) {
        lowest = Math.min(lowest, ranks.ranks.get(tag.id) ?? lowest);
      }
    }

    places.set(event, lowest);
  }

  return places;
}
