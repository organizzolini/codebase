import { compareNatural } from "../../../../calendar-query/calendar-group-strip/components/event-group-model/event-group-order.utilities";
import { SORT_SIGNS } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.constants";

import { EVENT_SORT_KEYS } from "./calendar-groups-sort.constants";

import type {
  GroupSort,
  TagRanks,
} from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CalendarEventRecord } from "../calendar-loader/calendar-records.types";
import type { CalendarEventGroup } from "./calendar-groups.types";

/**
 * Orders groups and their events by the sorts as the table does; as they came when none applies.
 */
export function sortCalendarGroups(
  groups: readonly CalendarEventGroup[],
  sorts: readonly GroupSort[] | undefined,
  ranks: TagRanks | undefined,
): CalendarEventGroup[] {
  const applicable = listApplicableSorts(sorts);

  if (applicable.length === 0) {
    return [...groups];
  }

  // Measured once per group, so comparing two of them calls nothing deeper.
  const measures = new Map<string, (number | string)[]>();

  for (const group of groups) {
    const values: (number | string)[] = [];

    for (const sort of applicable) {
      values.push(measureGroup(group, sort, ranks));
    }

    measures.set(group.id, values);
  }

  numberTexts(measures, applicable.length);

  const ordered = groups.toSorted((left, right) =>
    compareGroups(applicable, measures, [left, right]),
  );

  const result: CalendarEventGroup[] = [];

  for (const group of ordered) {
    result.push({ ...group, events: orderEvents(group.events, applicable) });
  }

  return result;
}

/**
 * Orders two groups by their numbers or texts under each sort, later sorts breaking ties.
 */
function compareGroups(
  sorts: readonly GroupSort[],
  measures: ReadonlyMap<string, readonly (number | string)[]>,
  pair: readonly [CalendarEventGroup, CalendarEventGroup],
): number {
  const [left, right] = pair;
  const leftValues = measures.get(left.id) ?? [];
  const rightValues = measures.get(right.id) ?? [];

  for (const [index, sort] of sorts.entries()) {
    const result =
      Number(leftValues[index] ?? 0) - Number(rightValues[index] ?? 0);

    if (result !== 0) {
      return SORT_SIGNS[sort.direction] * result;
    }
  }

  return 0;
}

/**
 * The lowest place of any tag a group's events carry beneath the sort's tag; past every one when none.
 */
function getTagPlace(
  group: CalendarEventGroup,
  sort: GroupSort,
  ranks: TagRanks | undefined,
): number {
  const prefix = ranks?.prefixes.get(sort.tag ?? "");
  const places = group.events
    .flatMap((event) => event.tags)
    .filter((tag) => prefix !== undefined && tag.path.startsWith(prefix))
    .map((tag) => ranks?.ranks.get(tag.id) ?? Number.MAX_SAFE_INTEGER);

  return Math.min(Number.MAX_SAFE_INTEGER, ...places);
}

/**
 * The sorts that measure groups here: every one but a metric, which has nothing to measure.
 */
function listApplicableSorts(
  sorts: readonly GroupSort[] | undefined,
): GroupSort[] {
  const applicable: GroupSort[] = [];

  for (const sort of sorts ?? []) {
    if (sort.key !== "metric") {
      applicable.push(sort);
    }
  }

  return applicable;
}

/**
 * A group's number or text under one sort: its tag path, name, count, first start, first end, total duration, or lowest tag place.
 */
function measureGroup(
  group: CalendarEventGroup,
  sort: GroupSort,
  ranks: TagRanks | undefined,
): number | string {
  const { events } = group;
  const starts = events.map((event) => event.start.getTime());
  const measures: Record<string, () => number | string> = {
    count: () => events.length,
    duration: () =>
      events.reduce((sum, event) => sum + event.durationMinutes, 0),
    end: () => Math.min(...events.map((event) => event.end.getTime())),
    first: () => Math.min(...starts),
    name: () => group.label,
    order: () => group.rank,
    start: () => Math.min(...starts),
    tag: () => getTagPlace(group, sort, ranks),
  };

  return measures[sort.key]?.() ?? 0;
}

/**
 * Turns each text measure into its place among the texts, ordered naturally, so comparing two groups is a difference.
 */
function numberTexts(
  measures: ReadonlyMap<string, (number | string)[]>,
  width: number,
): void {
  for (let index = 0; index < width; index += 1) {
    const texts = new Set<string>();

    for (const values of measures.values()) {
      const value = values[index];

      if (typeof value === "string") {
        texts.add(value);
      }
    }

    const ordered = [...texts].toSorted(compareNatural);

    for (const values of measures.values()) {
      const value = values[index];

      if (typeof value === "string") {
        values[index] = ordered.indexOf(value);
      }
    }
  }
}

/**
 * The events by the sorts that order events, later ones breaking ties; as given when none does.
 */
function orderEvents(
  events: readonly CalendarEventRecord[],
  sorts: readonly GroupSort[],
): CalendarEventRecord[] {
  const applicable: GroupSort[] = [];

  for (const sort of sorts) {
    if (EVENT_SORT_KEYS.has(sort.key)) {
      applicable.push(sort);
    }
  }

  return events.toSorted((left, right) => {
    for (const sort of applicable) {
      const differences: Record<string, number> = {
        duration: left.durationMinutes - right.durationMinutes,
        end: left.end.getTime() - right.end.getTime(),
        name: left.name.localeCompare(right.name, undefined, { numeric: true }),
        start: left.start.getTime() - right.start.getTime(),
      };
      const result = SORT_SIGNS[sort.direction] * (differences[sort.key] ?? 0);

      if (result !== 0) {
        return result;
      }
    }

    return 0;
  });
}
