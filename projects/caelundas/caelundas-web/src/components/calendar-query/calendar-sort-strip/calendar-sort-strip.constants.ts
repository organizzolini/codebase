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
 * Joins the trigger to its chip: flat inner edges, one border between.
 */
export const STRIP_CLASS_NAME =
  "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none";

/**
 * The sort when none is chosen: the first group's names, A to Z.
 */
export const DEFAULT_SORTS: readonly GroupSort[] = [
  { direction: "asc", key: "name" },
];
