// ♟️ Constants

import type { TableColumn } from "./calendar-table.types";

/**
 * The columns every event has.
 */
export const BASE_COLUMNS: readonly TableColumn[] = [
  { icon: "text", id: "name", kind: "name", label: "Name" },
  { icon: "calendar-arrow-down", id: "start", kind: "start", label: "Start" },
  { icon: "calendar-arrow-up", id: "end", kind: "end", label: "End" },
  { icon: "timer", id: "duration", kind: "duration", label: "Duration" },
];

/**
 * The first column of a grouped table, holding group pills.
 */
export const GROUP_COLUMN: TableColumn = {
  icon: "list-tree",
  id: "group",
  kind: "group",
  label: "Group",
};

/**
 * The first column of an ungrouped table: each event's place.
 */
export const NUMBER_COLUMN: TableColumn = {
  icon: "hash",
  id: "number",
  kind: "number",
  label: "#",
};

/**
 * The columns shown when the link names none.
 */
export const DEFAULT_COLUMN_IDS: readonly string[] = ["name", "start", "end"];

export const NO_COLUMNS: readonly string[] = [];

/**
 * How far a group row indents per level.
 */
export const INDENT_REM = 1.25;

/**
 * The time formats built so far, one for each zone.
 */
export const TIME_FORMATS = new Map<string, Intl.DateTimeFormat>();

/**
 * The opaque pill each body cell value sits in.
 */
export const PILL_CLASS_NAME =
  "bg-background inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5";

/**
 * How many events of a list show per page.
 */
export const PAGE_SIZE = 100;

/**
 * The list key of the events when they are not grouped.
 */
export const FLAT_LIST_ID = "flat";

/**
 * No list has been paged yet.
 */
export const NO_LIMITS: ReadonlyMap<string, number> = new Map();

/**
 * Each kind of column's width in rem.
 */
export const COLUMN_WIDTH_REM: Readonly<Record<TableColumn["kind"], number>> = {
  duration: 10,
  end: 13,
  group: 18,
  name: 20,
  number: 4,
  start: 13,
  tag: 14,
};

/**
 * A group header's height in rem.
 */
export const GROUP_ROW_HEIGHT_REM = 2.25;

/**
 * How much of a group's color tints its pill, in percent.
 */
export const GROUP_TINT_PERCENT = 32;

/**
 * How near its place a row counts as stuck.
 */
export const STICKY_TOLERANCE = 1;

/**
 * The clip that hides a whole row.
 */
export const FULL_CLIP = "inset(100%)";

/**
 * The row before the first, so no group has a section end.
 */
export const NO_ROW = { depth: -1, top: Infinity };
