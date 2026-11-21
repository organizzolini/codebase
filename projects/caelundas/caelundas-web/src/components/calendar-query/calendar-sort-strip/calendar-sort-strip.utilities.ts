import { DEFAULT_ORDER, SORT_OPTIONS } from "./calendar-sort-strip.constants";

import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The nested choices: the default order, then each key with its two directions beneath it.
 */
export function createSortItems(): CascaderNode[] {
  return [
    {
      description: "The groups as they were built.",
      label: "Default order",
      value: DEFAULT_ORDER,
    },
    ...SORT_OPTIONS.map((option) => ({
      children: [
        { label: "Ascending", value: `${option.key}:asc` },
        { label: "Descending", value: `${option.key}:desc` },
      ],
      description: option.description,
      keywords: [option.label],
      label: option.label,
      value: option.key,
    })),
  ];
}

/**
 * The same sort the other way round.
 */
export function flipSortDirection(sort: GroupSort): GroupSort {
  return { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" };
}

/**
 * The sort a ticked value means; none for the default order.
 */
export function toSort(value: readonly string[]): GroupSort | undefined {
  const [key, direction] = (value[0] ?? "").split(":");
  const option = SORT_OPTIONS.find((candidate) => candidate.key === key);

  return option === undefined || (direction !== "asc" && direction !== "desc")
    ? undefined
    : { direction, key: option.key };
}

/**
 * The value ticked for a sort: its key and direction, or the default order for none.
 */
export function toSortValue(sort: GroupSort | undefined): string[] {
  return sort === undefined
    ? [DEFAULT_ORDER]
    : [`${sort.key}:${sort.direction}`];
}
