import type {
  CalendarEventGroupKey,
  CalendarEventRecord,
} from "../../src/components/calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

/**
 * An event record from its id, its span and the tag roots it falls under, for the views' tests.
 */
export function createRecord(
  id: string,
  start: string,
  end: string = start,
  roots: readonly string[] = ["Aspect"],
): CalendarEventRecord {
  const from = new Date(start);
  const to = new Date(end);

  return {
    color: null,
    durationMinutes: Math.round((to.getTime() - from.getTime()) / 60_000),
    end: to,
    groups: [roots.map((root) => createRootKey(root))],
    id,
    name: id,
    note: id,
    start: from,
    tags: [],
    timezone: "UTC",
  };
}

/**
 * A group key of a tag root, as the API returns it for the default grouping.
 */
export function createRootKey(root: string): CalendarEventGroupKey {
  return { key: `id-${root}`, label: root, path: root, rank: root };
}
