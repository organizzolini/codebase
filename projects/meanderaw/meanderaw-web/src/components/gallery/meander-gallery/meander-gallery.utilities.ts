import { CARD_MIN_WIDTH_PIXELS, GAP_PIXELS } from "./meander-gallery.constants";

import type {
  GalleryView,
  SortEntry,
} from "../../../hooks/use-gallery-search/use-gallery-search.types";
import type { FilterGroup } from "../gallery-filters/components/filter-model/filter-model.types";
import type { GalleryMeander } from "./meanders-api.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * How many cards fit a row: as many as the width holds at the narrowest a
 * card gets, and one in the list.
 */
export function getColumnCount(width: number, view: GalleryView): number {
  return view === "list"
    ? 1
    : Math.max(
        1,
        Math.floor((width + GAP_PIXELS) / (CARD_MIN_WIDTH_PIXELS + GAP_PIXELS)),
      );
}

/**
 * Lists each key the page is grouped, sorted or filtered by, once.
 */
export function listActiveKeys(
  request: Readonly<{
    filter: FilterGroup | undefined;
    grouping: readonly string[];
    sorts: readonly SortEntry[];
  }>,
): string[] {
  const keys = new Set<string>(request.grouping);

  for (const { field } of request.sorts) {
    keys.add(field);
  }

  // A stack rather than recursion keeps the frames flat however deep it nests.
  const stack = request.filter === undefined ? [] : [request.filter];

  for (let group = stack.pop(); group !== undefined; group = stack.pop()) {
    for (const node of group.rules) {
      if ("rules" in node) {
        stack.push(node);
      } else {
        keys.add(node.field);
      }
    }
  }

  return [...keys];
}

/**
 * Splits the meanders into rows of `size`, the last holding what is left.
 */
export function toRows(
  meanders: readonly GalleryMeander[],
  size: number,
): GalleryMeander[][] {
  const rows: GalleryMeander[][] = [];

  for (let start = 0; start < meanders.length; start += size) {
    rows.push(meanders.slice(start, start + size));
  }

  return rows;
}
