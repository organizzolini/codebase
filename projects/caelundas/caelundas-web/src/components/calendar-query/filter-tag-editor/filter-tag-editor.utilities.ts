import type { TagTreeRow } from "./event-filter-tag-tree.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * What a row's handle does, as its accessible name: collapse the row when open, expand it when closed.
 */
export function describeHandle(row: TagTreeRow): string {
  return `${row.isExpanded ? "Collapse" : "Expand"} ${row.name}`;
}

/**
 * Whether a row shows how many tags beneath it are picked: when it has tags beneath, is closed, and has some picked.
 */
export function showsPickCount(row: TagTreeRow): boolean {
  return row.hasChildren && !row.isExpanded && row.selectedBelow > 0;
}
