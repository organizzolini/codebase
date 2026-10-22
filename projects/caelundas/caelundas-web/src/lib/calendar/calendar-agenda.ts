import { buildEventGroups } from "../event-groups/event-group-tree";

import { AGENDA_DAY_COUNT } from "./calendar-views";
import { addCalendarDays, formatCalendarDate } from "./calendar-window";

import type {
  EventGroupField,
  EventGrouping,
  EventGroupNode,
} from "../event-groups/event-groups.types";
import type { CalendarEventRecord } from "../events-database/events-database.types";

/**
 * How tall each kind of agenda row is drawn, in pixels, so the list can be
 * windowed without measuring a row.
 */
export const AGENDA_ROW_HEIGHTS: Readonly<Record<AgendaRow["kind"], number>> = {
  day: 36,
  event: 56,
  group: 40,
};

/**
 * The days an agenda lists: `from` is included and `through` is not, both as
 * `YYYY-MM-DD` in `timeZone`.
 */
export interface AgendaRange {
  from: string;
  through: string;
  timeZone: string;
}

/**
 * One row of the agenda: a group's heading, a day's heading, or one event
 * under it. A day or an event in a group carries the group's id, because an
 * event in two groups is listed in both.
 */
export type AgendaRow =
  | {
      /**
       * The day as `YYYY-MM-DD` in the data's zone.
       */
      day: string;
      group?: string | undefined;
      kind: "day";
    }
  | {
      group?: string | undefined;
      kind: "event";
      /**
       * Whether the event began before the agenda's first day, under which
       * it is listed rather than under the day it began.
       */
      ongoing: boolean;
      record: CalendarEventRecord;
    }
  | { kind: "group"; node: EventGroupNode };

/**
 * The agenda's range from the day it opens on.
 */
export function getAgendaRange(
  from: string,
  timeZone: string,
  dayCount = AGENDA_DAY_COUNT,
): AgendaRange {
  return { from, through: addCalendarDays(from, dayCount), timeZone };
}

/**
 * Lays events out as agenda rows, a heading for each day that has any and
 * the day's events beneath it in order. An event is listed once, on the day
 * it begins, however long it lasts; one already under way on the first day
 * is listed there, so a long span is neither repeated daily nor lost.
 */
export function toAgendaRows(
  events: readonly CalendarEventRecord[],
  range: AgendaRange,
  group?: string,
): AgendaRow[] {
  const byDay = new Map<string, AgendaRow[]>();

  for (const record of events.toSorted(compareStarts)) {
    const listing = getAgendaListing(record, range);

    if (listing !== null) {
      const rows = byDay.get(listing.day) ?? [];

      rows.push({ group, kind: "event", ongoing: listing.ongoing, record });
      byDay.set(listing.day, rows);
    }
  }

  return [...byDay.entries()]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .flatMap(([day, rows]) => [{ day, group, kind: "day" as const }, ...rows]);
}

/**
 * Lays events out as agenda rows in the groups of a grouping: each group's
 * heading, counting the distinct events listed in it, then its sub-groups,
 * or in the innermost groups their days and events as the ungrouped agenda
 * lists them. Only events the agenda's days list are grouped, so a count
 * never includes an event the agenda leaves out. With no grouping, the
 * rows are the ungrouped agenda's.
 */
export function toGroupedAgendaRows(
  events: readonly CalendarEventRecord[],
  range: AgendaRange,
  grouping: Readonly<{
    fields: readonly EventGroupField[];
    levels: EventGrouping;
  }>,
): AgendaRow[] {
  if (grouping.levels.length === 0) {
    return toAgendaRows(events, range);
  }

  const listed = events.filter(
    (record) => getAgendaListing(record, range) !== null,
  );
  const rows: AgendaRow[] = [];
  // Depth first without recursion, so the stack stays flat.
  const pending = buildEventGroups(
    listed,
    grouping.levels,
    grouping.fields,
  ).toReversed();

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    rows.push({ kind: "group", node });

    if (node.children.length === 0) {
      rows.push(...toAgendaRows(node.events, range, node.id));
    } else {
      pending.push(...node.children.toReversed());
    }
  }

  return rows;
}

/**
 * Orders events by when they begin, then by name.
 */
function compareStarts(
  left: CalendarEventRecord,
  right: CalendarEventRecord,
): number {
  return (
    left.start.getTime() - right.start.getTime() ||
    left.summary.localeCompare(right.summary)
  );
}

/**
 * The day the agenda lists an event under, and whether it was already under
 * way then, or `null` when none of its days lists it.
 */
function getAgendaListing(
  record: CalendarEventRecord,
  range: AgendaRange,
): null | { day: string; ongoing: boolean } {
  const { from, through, timeZone } = range;
  const startDay = formatCalendarDate(record.start, timeZone);
  // An end is not part of the event, so one ending at midnight does not
  // reach into the day that midnight begins.
  const ongoing =
    startDay < from &&
    formatCalendarDate(new Date(record.end.getTime() - 1), timeZone) >= from;
  const day = ongoing ? from : startDay;

  return day >= from && day < through ? { day, ongoing } : null;
}
