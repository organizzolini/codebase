import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";

// ♟️ Constants

export const TITLE = "Sort";

/**
 * What groups can be ordered by, with what each orders.
 */
export const SORT_OPTIONS = [
  {
    description: "Alphabetical by the group's name.",
    key: "name",
    label: "Name",
  },
  {
    description: "By how many events the group holds.",
    key: "count",
    label: "Event count",
  },
  {
    description: "By the time of the group's first event.",
    key: "first",
    label: "First event",
  },
] as const;

/**
 * The sort when none is chosen: the first group's names, A to Z.
 */
export const DEFAULT_SORTS: readonly GroupSort[] = [
  { direction: "asc", key: "name" },
];
