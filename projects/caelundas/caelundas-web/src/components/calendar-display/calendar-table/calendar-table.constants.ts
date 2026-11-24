// ♟️ Constants

import type { TableColumn } from "./calendar-table.types";

/**
 * The columns that name an event or time it, whichever tags the data has.
 */
export const BASE_COLUMNS: readonly TableColumn[] = [
  { id: "name", kind: "name", label: "Name" },
  { id: "start", kind: "start", label: "Start" },
  { id: "end", kind: "end", label: "End" },
];

/**
 * The first column of a grouped table, which holds each group's pill and nothing of an event.
 */
export const GROUP_COLUMN: TableColumn = {
  id: "group",
  kind: "group",
  label: "Group",
};

/**
 * The columns shown when the link names none.
 */
export const DEFAULT_COLUMN_IDS: readonly string[] = ["name", "start", "end"];

export const NO_COLUMNS: readonly string[] = [];

/**
 * How far a group's row is indented for each level it sits beneath.
 */
export const INDENT_REM = 1.25;

/**
 * The time formats built so far, one for each zone.
 */
export const TIME_FORMATS = new Map<string, Intl.DateTimeFormat>();

/**
 * The opaque pill every value in a body cell sits in, so it reads against the starfield.
 */
export const PILL_CLASS_NAME =
  "bg-background inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5";

/**
 * How many events of a list show at first, and each time it shows more.
 */
export const PAGE_SIZE = 25;

/**
 * The list key of the events when they are not grouped.
 */
export const FLAT_LIST_ID = "flat";

/**
 * No list has been paged yet.
 */
export const NO_LIMITS: ReadonlyMap<string, number> = new Map();

/**
 * How tall the table's header row is, in rem, so a group's header can stick right beneath it.
 */
export const HEADER_HEIGHT_REM = 2.5;

/**
 * How tall a group's header row is, in rem; a nested header sticks this far below the one above it.
 */
export const GROUP_ROW_HEIGHT_REM = 2.25;
