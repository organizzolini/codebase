import { PAGE_ITEM_HEIGHT, PAGES_ABOVE } from "./page-list.constants";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Where the list starts: a little above the first page showing, in pixels.
 */
export function startOffset(first: number): number {
  return Math.max(0, first - 1 - PAGES_ABOVE) * PAGE_ITEM_HEIGHT;
}
