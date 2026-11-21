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
  "[&>[data-slot=button]:not(:first-child)]:rounded-l-none [&>[data-slot=button]:not(:first-child)]:border-l-0 [&>[data-slot=button]:not(:last-child)]:rounded-r-none";

/**
 * Only the active item is shaded; cmdk writes `data-selected="false"` on the rest.
 */
export const ITEM_CLASS_NAME = "data-[selected=false]:bg-transparent";
