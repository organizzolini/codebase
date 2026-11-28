import { readAlsoUnder } from "./event-filter-tag-tree.utilities";

import type { TagTreeRow } from "./event-filter-tag-tree.types";
import type { FilterOption } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * A short "also Benefic" and a title of full paths for a tag under several parents; none otherwise.
 */
export function describeAlsoUnder(
  item: FilterOption,
): undefined | { text: string; title: string } {
  const paths = readAlsoUnder(item);

  if (paths.length === 0) {
    return undefined;
  }

  return {
    text: `also ${paths.map((path) => path.split(" / ").at(-1) ?? path).join(", ")}`,
    title: `Also under ${paths.join(", ")}`,
  };
}

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
