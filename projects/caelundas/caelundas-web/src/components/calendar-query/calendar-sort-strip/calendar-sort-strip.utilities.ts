import type {
  GroupSort,
  GroupSortKey,
} from "../calendar-group-by/components/event-group-tree/event-group-tree.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The same sort the other way round.
 */
export function flipSortDirection(sort: GroupSort): GroupSort {
  return { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" };
}

/**
 * Picking a key sorts by it, ascending; picking the key already sorted by clears the sort.
 */
export function pickSortKey(
  sort: GroupSort | undefined,
  key: GroupSortKey,
): GroupSort | undefined {
  return sort?.key === key ? undefined : { direction: "asc", key };
}
