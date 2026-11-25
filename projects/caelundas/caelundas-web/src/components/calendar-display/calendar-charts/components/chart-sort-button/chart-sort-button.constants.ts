import type { GroupSort } from "../../../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";

// ♟️ Constants

/**
 * How each way of sorting is said.
 */
export const SORT_DIRECTIONS: Readonly<Record<GroupSort["direction"], string>> =
  {
    asc: "ascending",
    desc: "descending",
  };
