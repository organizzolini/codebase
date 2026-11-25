import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";

// ♟️ Constants

export const TITLE = "Sort";

/**
 * What groups can be ordered by, with what each orders.
 */
export const SORT_OPTIONS = [
  {
    description:
      "Each group's place among its siblings as its tag is meant to read; times and durations in their own order.",
    icon: "list-ordered",
    key: "order",
    label: "Tag order",
  },
  {
    description: "Alphabetical by the group's name.",
    icon: "arrow-down-a-z",
    key: "name",
    label: "Name",
  },
  {
    description: "By how many events the group holds.",
    icon: "hash",
    key: "count",
    label: "Event count",
  },
  {
    description: "By the time of the group's first event.",
    icon: "clock",
    key: "first",
    label: "First event",
  },
] as const;

/** Marks a tag sort in the list. */
export const TAG_SORT_PREFIX = "by:";

/** Marks a metric sort in the list. */
export const METRIC_SORT_PREFIX = "metric:";

/** The default sort: each group's tag order, first to last. */
export const DEFAULT_SORTS: readonly GroupSort[] = [
  { direction: "asc", key: "order" },
];

/** The name of the default sort. */
export const DEFAULT_SORT_LABEL = "Tags";
