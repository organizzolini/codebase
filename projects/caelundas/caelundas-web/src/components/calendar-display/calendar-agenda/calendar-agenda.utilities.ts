import { compareNatural } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-group-order.utilities";
import { buildEventGroups } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.utilities";
import { getEventKind } from "../events-calendar/components/calendar-colors/calendar-colors.utilities";
import { AGENDA_DAY_COUNT } from "../events-calendar/components/calendar-views/calendar-views.constants";
import {
  addCalendarDays,
  formatCalendarDate,
} from "../events-calendar/components/calendar-window/calendar-window.utilities";

import {
  AGENDA_CLUSTER_MINIMUM,
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
} from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type {
  CalendarEventRecord,
  CalendarEventTag,
} from "../events-calendar/components/calendar-loader/calendar-records.types";
import type {
  AgendaClustering,
  AgendaEventRow,
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
 * How tall an agenda row is drawn: headings are shorter than events, and an event is as tall as its tags need.
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

  if (row.kind === "cluster") {
    return row.id;
  }

  if (row.kind === "later") {
    return row.kind;
  }

  const name = row.kind === "day" ? row.day : row.record.id;

  return `${row.group ?? ""}|${name}`;
}

/**
 * Height of an event row `width` pixels wide: its name and duration, plus a line per wrapped tag line.
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
 * Lays events out as agenda rows: a heading per day, then its events, each listed once on its first day.
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
      const kindLabel = getEventKind(record)?.label ?? "Other";

      rows.push({
        clusterKey: `${listing.ongoing ? "ongoing" : "day"}|${kindLabel}`,
        group,
        kind: "event",
        kindLabel,
        ongoing: listing.ongoing,
        record,
      });
      byDay.set(listing.day, rows);
    }
  }

  return [...byDay.entries()]
    .toSorted(([left], [right]) => left.localeCompare(right))
    .flatMap(([day, rows]) => [{ day, group, kind: "day" as const }, ...rows]);
}

/**
 * Lays events out as agenda rows in a grouping's groups, counting each group's distinct listed events; with no grouping, the agenda's rows.
 */
export function toGroupedAgendaRows(
  events: readonly CalendarEventRecord[],
  range: AgendaRange,
  grouping: Readonly<{
    cluster?: AgendaClustering | undefined;
    fields: readonly EventGroupField[];
    levels: EventGrouping;
  }>,
): AgendaRow[] {
  const { cluster } = grouping;

  if (grouping.levels.length === 0) {
    return clusterAgendaRows(toAgendaRows(events, range), cluster);
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

  return clusterAgendaRows(rows, cluster);
}

/**
 * Gathers each day's similar events under a row that opens, when clustering; the rows as they are otherwise.
 */
function clusterAgendaRows(
  rows: readonly AgendaRow[],
  cluster: AgendaClustering | undefined,
): AgendaRow[] {
  if (cluster === undefined) {
    return [...rows];
  }

  const result: AgendaRow[] = [];
  let day = "";
  let events: AgendaEventRow[] = [];

  for (const row of rows) {
    if (row.kind === "event") {
      events.push(row);
    } else {
      result.push(...clusterDayRows(events, cluster, day), row);
      events = [];
      day = row.kind === "day" ? row.day : day;
    }
  }

  return [...result, ...clusterDayRows(events, cluster, day)];
}

/**
 * Gathers a day's events of one kind, ongoing or not, into a cluster row when there are enough of them, listing the events beneath it only while it is open.
 */
function clusterDayRows(
  rows: readonly AgendaEventRow[],
  cluster: AgendaClustering,
  day: string,
): AgendaRow[] {
  const counts = countKinds(rows);
  const seen = new Set<string>();
  const result: AgendaRow[] = [];

  for (const row of rows) {
    const key = row.clusterKey;

    if (!isClustered(key, counts)) {
      result.push(row);
      continue;
    }

    const id = `${row.group ?? ""}|${day}|${key}`;

    if (!seen.has(key)) {
      seen.add(key);
      result.push(
        toClusterRow(row, id, {
          count: counts.get(key) ?? 0,
          expanded: cluster.expanded.has(id),
        }),
      );
    }

    if (cluster.expanded.has(id)) {
      result.push(row);
    }
  }

  return result;
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
    compareNatural(left.summary, right.summary)
  );
}

/**
 * How many of a day's events there are of each kind, told apart by whether they were already under way.
 */
function countKinds(rows: readonly AgendaEventRow[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const key = row.clusterKey;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

/**
 * The day the agenda lists an event under, and whether it was already under way, or `null` if no day lists it.
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

/**
 * Whether enough of a day's events share a kind to be gathered.
 */
function isClustered(
  key: string,
  counts: ReadonlyMap<string, number>,
): boolean {
  return (counts.get(key) ?? 0) >= AGENDA_CLUSTER_MINIMUM;
}

/**
 * The row that stands for a cluster, led by an event of its kind.
 */
function toClusterRow(
  first: AgendaEventRow,
  id: string,
  size: Readonly<{ count: number; expanded: boolean }>,
): AgendaRow {
  return {
    ...size,
    group: first.group,
    id,
    kind: "cluster",
    label: `${first.ongoing ? "Ongoing " : ""}${first.kindLabel}`,
    ongoing: first.ongoing,
  };
}
