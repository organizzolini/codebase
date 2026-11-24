import {
  getAgendaListing,
  getAgendaRange,
} from "../calendar-agenda/calendar-agenda.utilities";
import {
  addCalendarDays,
  formatCalendarDate,
  parseCalendarDate,
} from "../events-calendar/components/calendar-window/calendar-window.utilities";

import {
  BASE_COLUMNS,
  DEFAULT_COLUMN_IDS,
  FLAT_LIST_ID,
  NO_LIMITS,
  PAGE_SIZE,
  TIME_FORMATS,
} from "./calendar-table.constants";

import type { CalendarNavigation } from "../../calendar-controls/calendar-navigation-group/calendar-navigation-group.types";
import type {
  EventGroupField,
  EventGroupNode,
} from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { AgendaRange } from "../calendar-agenda/calendar-agenda.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";
import type {
  TableColumn,
  TablePaging,
  TableRowModel,
  TagCellEntry,
} from "./calendar-table.types";

// 🔏 Private Functions

/**
 * How many distinct values a column has among a group's events, which the group's row says in place of a value: the group's own count for the name column, none for the group column, and for the rest the distinct texts of the cells, for a tag column the distinct tags.
 */
export function countGroupValues(
  node: EventGroupNode,
  column: TableColumn,
  timeZone: string,
): number {
  if (column.kind === "group") {
    return 0;
  }

  if (column.kind === "name") {
    return node.count;
  }

  const values = new Set<string>();

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const record of node.events) {
    if (column.kind === "tag") {
      for (const entry of getTagCellEntries(record, column.prefix ?? "")) {
        values.add(entry.label);
      }
    } else {
      // Not through getCellText, which would count as more frames.
      values.add(
        formatCellTime(
          column.kind === "start" ? record.start : record.end,
          timeZone,
        ),
      );
    }
  }

  values.delete("");

  return values.size;
}

/**
 * What the toolbar calls on the table: the days it lists a period at a time, stepped forward or back, and today.
 */
export function createTableNavigation(
  context: Readonly<{
    anchor: Date;
    dayCount: number;
    onDateChange: (date: Date) => void;
    timeZone: string;
  }>,
): CalendarNavigation {
  const { anchor, dayCount, onDateChange, timeZone } = context;
  const range = getTableRange(anchor, timeZone, dayCount);

  return {
    next: () => {
      onDateChange(
        parseCalendarDate(addCalendarDays(range.from, dayCount), new Date()),
      );
    },
    prev: () => {
      onDateChange(
        parseCalendarDate(addCalendarDays(range.from, -dayCount), new Date()),
      );
    },
    title: `${range.from} – ${addCalendarDays(range.through, -1)}`,
    today: () => {
      onDateChange(new Date());
    },
  };
}

/**
 * What a column's cell shows for an event: its name, a time, or the tags it has beneath the column's tag.
 */
export function getCellText(
  record: CalendarEventRecord,
  column: TableColumn,
  timeZone: string,
): string {
  if (column.kind === "name") {
    return record.summary;
  }

  if (column.kind === "group") {
    return "";
  }

  if (column.kind === "tag") {
    return getTagCellText(record, column.prefix ?? "");
  }

  return formatCellTime(
    column.kind === "start" ? record.start : record.end,
    timeZone,
  );
}

/**
 * How many distinct values a group's row says for each column, in the columns' order.
 */
export function getGroupCounts(
  node: EventGroupNode,
  columns: readonly TableColumn[],
  timeZone: string,
): number[] {
  const counts: number[] = [];

  for (const column of columns) {
    counts.push(countGroupValues(node, column, timeZone));
  }

  return counts;
}

/**
 * The days the table lists: a count of them from the anchor's day, read in the data's zone.
 */
export function getTableRange(
  anchor: Date,
  timeZone: string,
  dayCount: number,
): AgendaRange {
  return getAgendaRange(
    formatCalendarDate(anchor, timeZone),
    timeZone,
    dayCount,
  );
}

// 🌎 Public Functions

/**
 * The tags an event has at or beneath a path, each with its id and its name, a tag beneath the path by its path past it.
 */
export function getTagCellEntries(
  record: CalendarEventRecord,
  prefix: string,
): TagCellEntry[] {
  const entries: TagCellEntry[] = [];

  for (const tag of record.tags) {
    if (tag.path === prefix) {
      entries.push({ id: tag.id, label: tag.name });
    } else if (tag.path.startsWith(`${prefix} / `)) {
      entries.push({ id: tag.id, label: tag.path.slice(prefix.length + 3) });
    }
  }

  return entries;
}

/**
 * The ids of the first path through the groups: the first group at each level, down its first branch to the first leaf group.
 */
export function listFirstPath(groups: readonly EventGroupNode[]): string[] {
  const path: string[] = [];

  for (let node = groups[0]; node !== undefined; node = node.children[0]) {
    path.push(node.id);
  }

  return path;
}

/**
 * The id of every group of the tree, at every level, so a group inside a closed one counts too; sorted, so the same groups give the same list.
 */
export function listGroupIds(groups: readonly EventGroupNode[]): string[] {
  const ids: string[] = [];
  const pending = [...groups];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    ids.push(node.id);
    pending.push(...node.children);
  }

  return ids.toSorted();
}

/**
 * The events the table lists: those the agenda lists within the days from the anchor, in the data's zone.
 */
export function listTableEvents(
  context: Readonly<{
    anchor: Date;
    dayCount: number;
    events: readonly CalendarEventRecord[];
    timeZone: string;
  }>,
): CalendarEventRecord[] {
  // Not through getTableRange, which would count as one more frame.
  const range = getAgendaRange(
    formatCalendarDate(context.anchor, context.timeZone),
    context.timeZone,
    context.dayCount,
  );
  const listed: CalendarEventRecord[] = [];

  // A loop rather than a filter callback, which would count as one more frame.
  for (const record of context.events) {
    if (getAgendaListing(record, range) !== null) {
      listed.push(record);
    }
  }

  return listed;
}

/**
 * The columns a link's ids name, in its order: Name, Start and End, or a tag root or tag; an id the data does not have is left out, and no ids mean the defaults.
 */
export function resolveColumns(
  ids: readonly string[] | undefined,
  fields: readonly EventGroupField[],
): TableColumn[] {
  const columns: TableColumn[] = [];

  for (const id of ids === undefined || ids.length === 0
    ? DEFAULT_COLUMN_IDS
    : ids) {
    const column = findColumn(id, fields);

    if (column !== undefined) {
      columns.push(column);
    }
  }

  return columns;
}

/**
 * The open groups with one more opened, or closed again if it was open.
 */
export function toggleExpanded(
  expanded: ReadonlySet<string>,
  id: string,
): Set<string> {
  const next = new Set(expanded);

  if (!next.delete(id)) {
    next.add(id);
  }

  return next;
}

/**
 * How big the table's lists are: the most events in one, the events in all of them, and the rows of events shown; a list is each leaf group's events, or all of them when not grouped.
 */
export function toListStats(
  groups: readonly EventGroupNode[],
  events: readonly CalendarEventRecord[],
  rows: readonly TableRowModel[],
): { longest: number; shown: number; total: number } {
  let longest = groups.length === 0 ? events.length : 0;
  let total = groups.length === 0 ? events.length : 0;
  let shown = 0;
  const pending = [...groups];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    if (node.children.length === 0) {
      longest = Math.max(longest, node.events.length);
      total += node.events.length;
    }

    pending.push(...node.children);
  }

  for (const row of rows) {
    if (row.kind === "event") {
      shown += 1;
    }
  }

  return { longest, shown, total };
}

/**
 * What the table's data is, by value: when it is the same, the pages loaded stay, however the lists and objects it was built from were made again.
 */
export function toResetKey(
  data: Readonly<{
    anchor: Date;
    dayCount: number;
    grouping: unknown;
    idsKey: string;
    listed: readonly CalendarEventRecord[];
    sort: unknown;
    timeZone: string;
  }>,
): string {
  return [
    data.anchor.getTime(),
    data.dayCount,
    data.timeZone,
    data.listed.length,
    data.listed[0]?.id,
    data.listed.at(-1)?.id,
    JSON.stringify(data.grouping),
    JSON.stringify(data.sort),
    data.idsKey,
  ].join("|");
}

/**
 * The table's rows, depth first: each group, then what is open beneath it, its sub-groups or its events, a page of each list at a time.
 */
export function toTableRows(
  groups: readonly EventGroupNode[],
  events: readonly CalendarEventRecord[],
  view: Readonly<TablePaging & { expanded: ReadonlySet<string> }>,
): TableRowModel[] {
  const { expanded: open } = view;
  const rows: TableRowModel[] = [];

  if (groups.length === 0) {
    appendEvents(rows, {
      depth: 0,
      events: events.toSorted(
        (left, right) => left.start.getTime() - right.start.getTime(),
      ),
      listId: FLAT_LIST_ID,
      paging: view,
    });

    return rows;
  }

  // Depth first without recursion, so the stack stays flat.
  const pending = groups.map((node) => ({ depth: 0, node })).toReversed();

  for (let item = pending.pop(); item !== undefined; item = pending.pop()) {
    const { depth, node } = item;
    const expanded = open.has(node.id);

    rows.push({ depth, expanded, id: node.id, kind: "group", node });

    if (expanded && node.children.length === 0) {
      appendEvents(rows, {
        depth: depth + 1,
        events: node.events,
        listId: node.id,
        paging: view,
      });
    } else if (expanded) {
      pending.push(
        ...node.children
          .map((child) => ({ depth: depth + 1, node: child }))
          .toReversed(),
      );
    }
  }

  return rows;
}

/**
 * Adds the first events of a list as rows, as many as its limit allows, then a row to show more when some are left.
 */
function appendEvents(
  rows: TableRowModel[],
  list: Readonly<{
    depth: number;
    events: readonly CalendarEventRecord[];
    listId: string;
    paging: Readonly<TablePaging>;
  }>,
): void {
  const {
    limit: pageSize = PAGE_SIZE,
    limits = NO_LIMITS,
    pages = 1,
  } = list.paging;
  // A list shows the pages loaded for the whole table, or as many as its own Show more row has loaded, whichever is more.
  const limit = Math.max(pageSize * pages, limits.get(list.listId) ?? 0);

  for (const record of list.events.slice(0, limit)) {
    rows.push({
      depth: list.depth,
      id:
        list.listId === FLAT_LIST_ID
          ? record.id
          : `${list.listId}|${record.id}`,
      kind: "event",
      record,
    });
  }

  if (list.events.length > limit) {
    rows.push({
      depth: list.depth,
      groupId: list.listId,
      id: `${list.listId}|more`,
      kind: "more",
      next: Math.min(pageSize, list.events.length - limit),
      remaining: list.events.length - limit,
      shown: limit,
      total: list.events.length,
    });
  }
}

/**
 * The column an id names: a base column, a tag root, or a tag with tags beneath it.
 */
function findColumn(
  id: string,
  fields: readonly EventGroupField[],
): TableColumn | undefined {
  const base = BASE_COLUMNS.find((column) => column.id === id);

  if (base !== undefined) {
    return base;
  }

  for (const field of fields) {
    if (field.id === id) {
      return { id, kind: "tag", label: field.label, prefix: field.label };
    }

    const node = field.nodes.find((candidate) => candidate.id === id);

    if (node !== undefined) {
      return {
        id,
        kind: "tag",
        label: `${field.label} › ${node.name}`,
        prefix: node.path,
      };
    }
  }

  return undefined;
}

/**
 * A time as the table writes it, in the data's zone.
 */
function formatCellTime(date: Date, timeZone: string): string {
  let format = TIME_FORMATS.get(timeZone);

  if (format === undefined) {
    format = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    });
    TIME_FORMATS.set(timeZone, format);
  }

  return format.format(date);
}

/**
 * The names of the tags an event has at or beneath a path, a tag beneath it by its path past the prefix.
 */
function getTagCellText(record: CalendarEventRecord, prefix: string): string {
  const names = new Set<string>();

  // A loop rather than a mapping callback keeps the call stacks shallow.
  for (const entry of getTagCellEntries(record, prefix)) {
    names.add(entry.label);
  }

  return [...names].join(", ");
}
