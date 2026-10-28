import { buildEventGroups } from "../calendar-group-by/event-group-tree.utilities";
import { AGENDA_DAY_COUNT } from "../events-calendar/calendar-views.constants";
import {
  addCalendarDays,
  formatCalendarDate,
} from "../events-calendar/calendar-window.utilities";

import {
  AGENDA_ROW_HEIGHTS,
  EVENT_COUNT_RULES,
  EVENT_ROW_BASE_HEIGHT,
  EVENT_ROW_CHROME_WIDTH,
  PILL_CHARACTER_WIDTH,
  PILL_CHROME_WIDTH,
  PILL_GAP,
  PILL_LINE_HEIGHT,
} from "./calendar-agenda.constants";

import type {
  EventGroupField,
  EventGrouping,
} from "../calendar-group-by/event-groups.types";
import type {
  CalendarEventRecord,
  CalendarEventTag,
} from "../events-calendar/events-database.types";
import type {
  AgendaListRow,
  AgendaRange,
  AgendaRow,
} from "./calendar-agenda.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Counts a group's events, such as "1 event" or "12 events".
 */
export function formatEventCount(count: number): string {
  return `${String(count)} ${EVENT_COUNT_RULES.select(count) === "one" ? "event" : "events"}`;
}

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
 * How tall an agenda row is drawn: a heading is shorter than an event, an
 * event is as tall as its tags need, and the button that lists more is as tall
 * as an event with none.
 */
export function getAgendaRowHeight(row: AgendaListRow, width: number): number {
  if (row.kind === "event") {
    return getEventRowHeight(row.record.tags, width);
  }

  return row.kind === "later"
    ? AGENDA_ROW_HEIGHTS.event
    : AGENDA_ROW_HEIGHTS[row.kind];
}

/**
 * Names an agenda row by its group, its day or its event within its group,
 * each of which appears once.
 */
export function getAgendaRowKey(row: AgendaListRow): string {
  if (row.kind === "group") {
    return row.node.id;
  }

  if (row.kind === "later") {
    return row.kind;
  }

  const name = row.kind === "day" ? row.day : row.record.id;

  return `${row.group ?? ""}|${name}`;
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
