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
    label: "Tags",
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
  {
    description: "By when the event, or the group's first, starts.",
    icon: "calendar-arrow-down",
    key: "start",
    label: "Start",
  },
  {
    description: "By when the event, or the group's first, ends.",
    icon: "calendar-arrow-up",
    key: "end",
    label: "End",
  },
  {
    description: "By how long the event, or the group's events, last.",
    icon: "timer",
    key: "duration",
    label: "Duration",
  },
] as const;

/** Marks a tag sort in the list. */
export const TAG_SORT_PREFIX = "by:";

/** The row holding the tag roots without a tag order. */
export const TAG_SORT_PARENT = `${TAG_SORT_PREFIX}tag:*`;

/** Marks a metric sort in the list. */
export const METRIC_SORT_PREFIX = "metric:";

/** The default sort: each group's tag order, first to last. */
export const DEFAULT_SORTS: readonly GroupSort[] = [
  { direction: "asc", key: "order" },
];

/** The name of the default sort. */
export const DEFAULT_SORT_LABEL = "Tags";
