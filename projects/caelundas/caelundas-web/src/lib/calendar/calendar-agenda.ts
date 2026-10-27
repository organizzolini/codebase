import { buildEventGroups } from "../event-groups/event-group-tree";

import { AGENDA_DAY_COUNT } from "./calendar-views";
import { addCalendarDays, formatCalendarDate } from "./calendar-window";

import type {
  EventGroupField,
  EventGrouping,
  EventGroupNode,
} from "../event-groups/event-groups.types";
import type {
  CalendarEventRecord,
  CalendarEventTag,
} from "../events-database/events-database.types";

// An event row's chrome beside its text: padding, the time, the dot and the
// gaps between them, and a scrollbar.
const EVENT_ROW_CHROME_WIDTH = 160;
// What an event row holds above its tags: padding, the name and the duration.
const EVENT_ROW_BASE_HEIGHT = 52;
// A pill is drawn at about this width per character, plus its border and
// padding, and a gap of 4px lies between pills and between lines of them.
const PILL_CHARACTER_WIDTH = 5.8;
const PILL_CHROME_WIDTH = 14;
const PILL_GAP = 4;
const PILL_LINE_HEIGHT = 20;

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
 * How tall an event row is drawn in a list `width` pixels wide: as tall as
 * its name and duration, and a line for every line its tags wrap onto, so
 * that all of them show.
 */
export function getEventRowHeight(
  tags: readonly CalendarEventTag[],
  width: number,
): number {
  const available = width - EVENT_ROW_CHROME_WIDTH;
  let lines = 0;
  let used = 0;

  for (const tag of tags) {
    const pill = tag.name.length * PILL_CHARACTER_WIDTH + PILL_CHROME_WIDTH;

    if (lines === 0 || used + PILL_GAP + pill > available) {
      lines += 1;
      used = pill;
    } else {
      used += PILL_GAP + pill;
    }
  }

  return Math.max(
    AGENDA_ROW_HEIGHTS.event,
    EVENT_ROW_BASE_HEIGHT + lines * PILL_LINE_HEIGHT,
  );
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
