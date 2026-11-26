import { listKeys } from "../../calendar-skeleton.utilities";

import type { SkeletonTableRow } from "./skeleton-table.types";

// ♟️ Constants

/**
 * The real table's column proportions: Group, Name, Start, End.
 */
export const TABLE_COLUMNS = "grid-cols-[18fr_20fr_13fr_13fr]";

/**
 * The widths of the column head pills.
 */
export const TABLE_HEADS = ["w-18", "w-16", "w-16", "w-14"] as const;

/**
 * How far a group indents per level, in rem.
 */
export const INDENT_REM = 1.25;

const BLOCK: readonly Omit<SkeletonTableRow, "id">[] = [
  { depth: 0, kind: "group", width: "w-28" },
  { depth: 1, kind: "group", width: "w-24" },
  { depth: 2, kind: "group", width: "w-24" },
  { depth: 3, kind: "group", width: "w-28" },
  { depth: 0, kind: "event", width: "w-52" },
  { depth: 0, kind: "event", width: "w-44" },
  { depth: 0, kind: "event", width: "w-56" },
  { depth: 0, kind: "event", width: "w-48" },
  { depth: 0, kind: "event", width: "w-52" },
  { depth: 3, kind: "group", width: "w-24" },
  { depth: 2, kind: "group", width: "w-28" },
  { depth: 1, kind: "group", width: "w-20" },
  { depth: 0, kind: "group", width: "w-24" },
  { depth: 0, kind: "event", width: "w-48" },
  { depth: 0, kind: "event", width: "w-56" },
  { depth: 0, kind: "event", width: "w-44" },
];

const ROW_KEYS = listKeys("row", BLOCK.length * 2);

/**
 * Groups holding groups and events, enough to fill a tall screen.
 */
export const TABLE_ROWS: readonly SkeletonTableRow[] = [...BLOCK, ...BLOCK].map(
  (row, index) => ({ ...row, id: ROW_KEYS[index] ?? String(index) }),
);
