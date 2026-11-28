import { readFolder } from "../../components/calendar-query/filter-tag-editor/event-filter-tag-tree.utilities";

import type { FilterOption } from "@codebase/presentation";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Moves focus to the row a number of rows from an element, within its list; from the search box, 0 is the first row.
 */
export function focusSibling(element: HTMLElement, step: number): void {
  const scope =
    element.closest("[data-testid='filter-tag-editor']") ??
    element.parentElement;
  const rows = [
    ...(scope?.querySelectorAll<HTMLElement>("[role='option']") ?? []),
  ];
  const index = rows.indexOf(element);

  rows[index === -1 ? 0 : index + step]?.focus();
}

/**
 * The options that are tags to pick, leaving out the folders that only open.
 */
export function withoutFolders(items: readonly FilterOption[]): FilterOption[] {
  const tags: FilterOption[] = [];

  // A loop rather than a callback keeps the call stacks shallow.
  for (const item of items) {
    if (!readFolder(item)) {
      tags.push(item);
    }
  }

  return tags;
}
