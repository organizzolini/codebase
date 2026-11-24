import { DERIVED_GROUP_ICONS } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.constants";

import {
  formatCellTime,
  getTagCellEntries,
  isPositionColumn,
} from "./calendar-table.utilities";

import type { EventGroupNode } from "../../calendar-query/calendar-group-strip/components/event-group-model/event-groups.types";
import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";
import type { TableColumn, TableRowModel } from "./calendar-table.types";

// 🔏 Private Functions

/**
 * How many distinct values a column has among a group's events: its own count for the name column, none for the group column.
 */
export function countGroupValues(
  node: EventGroupNode,
  column: TableColumn,
  timeZone: string,
): number {
  if (isPositionColumn(column)) {
    return 0;
  }

  if (column.kind === "name") {
    return node.count;
  }

  const values = new Set<string>();

  // Loops rather than mapping callbacks keep the call stacks shallow.
  for (const record of node.events) {
    addCellValues(values, record, { column, timeZone });
  }

  values.delete("");

  return values.size;
}

// 🌎 Public Functions

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
 * The icon of each grouping level's field, for a derived field such as a period.
 */
export function getLevelIcons(levelsKey: string): (string | undefined)[] {
  const derived = new Map(Object.entries(DERIVED_GROUP_ICONS));
  const icons: (string | undefined)[] = [];

  for (const field of levelsKey === "" ? [] : levelsKey.split("|")) {
    icons.push(derived.get(field));
  }

  return icons;
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
 * The id of every group of the tree, at every level, sorted.
 */
export function listGroupIds(groups: readonly EventGroupNode[]): string[] {
  return listGroupEntries(groups).map((entry) => entry.id);
}

/**
 * The level of every group of the tree, in the order of their sorted ids.
 */
export function listGroupLevels(groups: readonly EventGroupNode[]): number[] {
  return listGroupEntries(groups).map((entry) => entry.level);
}

/**
 * The most events in one list, the events in all lists, and the rows shown; a list is a leaf group's events.
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
 * The table's data by value, so the pages loaded stay when the same data is made anew.
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
 * Adds what one event shows in a column to a set: its start or end time, or the tags beneath a tag column's path.
 */
function addCellValues(
  values: Set<string>,
  record: CalendarEventRecord,
  cell: Readonly<{ column: TableColumn; timeZone: string }>,
): void {
  const { column, timeZone } = cell;

  if (column.kind === "tag") {
    for (const entry of getTagCellEntries(record, column.prefix ?? "")) {
      values.add(entry.label);
    }

    return;
  }

  values.add(
    formatCellTime(
      column.kind === "start" ? record.start : record.end,
      timeZone,
    ),
  );
}

/**
 * Every group's id and level, sorted by id.
 */
function listGroupEntries(
  groups: readonly EventGroupNode[],
): { id: string; level: number }[] {
  const entries: { id: string; level: number }[] = [];
  const pending = [...groups];

  for (let node = pending.pop(); node !== undefined; node = pending.pop()) {
    entries.push({ id: node.id, level: node.level });
    pending.push(...node.children);
  }

  return entries.toSorted((left, right) =>
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0,
  );
}
