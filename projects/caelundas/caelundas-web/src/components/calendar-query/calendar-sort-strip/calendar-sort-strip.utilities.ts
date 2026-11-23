import { labelGroupLevel } from "../calendar-group-strip/calendar-group-strip.utilities";

import { SORT_OPTIONS } from "./calendar-sort-strip.constants";

import type {
  EventGroupField,
  EventGrouping,
} from "../calendar-group-strip/components/event-group-model/event-groups.types";
import type { GroupSort } from "../calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type { CascaderNode } from "@codebase/presentation";

// 🔏 Private Functions

/**
 * The nested choices: each key with its two directions beneath it.
 */
export function createSortItems(): CascaderNode[] {
  return SORT_OPTIONS.map((option) => ({
    children: [
      { label: "Ascending", value: `${option.key}:asc` },
      { label: "Descending", value: `${option.key}:desc` },
    ],
    description: option.description,
    keywords: [option.label],
    label: option.label,
    value: option.key,
  }));
}

// 🌎 Public Functions

/**
 * The same sorts with the one at an index turned the other way round.
 */
export function flipSortAt(
  sorts: readonly GroupSort[],
  index: number,
): GroupSort[] {
  return sorts.map((sort, position) =>
    position === index
      ? { ...sort, direction: sort.direction === "asc" ? "desc" : "asc" }
      : sort,
  );
}

/**
 * The name of the default sort: the first group it orders, or the groups' names when there are none.
 */
export function labelDefaultSort(
  grouping: EventGrouping,
  fields: readonly EventGroupField[],
): string {
  const [first] = grouping;

  return first === undefined ? "Name" : labelGroupLevel(first, fields);
}

/** The sorts after a list click: a ticked one is added, replacing its key's other direction; a cleared one is removed. */
export function toSorts(
  next: readonly string[],
  previous: readonly GroupSort[],
): GroupSort[] | undefined {
  const before = toSortValue(previous);
  const leaf = [
    ...before.filter((value) => !next.includes(value)),
    ...next.filter((value) => !before.includes(value)),
  ][0];
  const picked = leaf === undefined ? undefined : parseSortLeaf(leaf);

  if (leaf === undefined || picked === undefined) {
    return previous.length === 0 ? undefined : [...previous];
  }

  const rest = previous.filter((sort) => sort.key !== picked.key);
  const sorts = next.includes(leaf)
    ? [...rest, picked]
    : previous.filter((sort) => `${sort.key}:${sort.direction}` !== leaf);

  return sorts.length === 0 ? undefined : sorts;
}

/**
 * The values ticked for sorts: each one's key and direction.
 */
export function toSortValue(sorts: readonly GroupSort[]): string[] {
  return sorts.map((sort) => `${sort.key}:${sort.direction}`);
}

/**
 * The sort a ticked value names, or nothing for a stale value.
 */
function parseSortLeaf(leaf: string): GroupSort | undefined {
  const [key, direction] = leaf.split(":");
  const option = SORT_OPTIONS.find((candidate) => candidate.key === key);

  return option === undefined || (direction !== "asc" && direction !== "desc")
    ? undefined
    : { direction, key: option.key };
}
