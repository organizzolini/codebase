// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The pages loaded, kept within the pages there are, since fewer exist at a larger page size.
 */
export function clampPages(pages: number, count: number): number {
  return Math.min(Math.max(1, pages), count);
}

/**
 * How many pages the longest list takes at a page size: at least one.
 */
export function getPageCount(longest: number, limit: number): number {
  return Math.max(1, Math.ceil(longest / limit));
}

/**
 * The events a page covers in the longest list, such as "26–50"; the last page ends where the list does.
 */
export function getPageRange(
  page: number,
  limit: number,
  longest: number,
): string {
  const start = (page - 1) * limit + 1;
  const end = Math.max(start, Math.min(page * limit, longest));

  return `${String(start)}–${String(end)}`;
}

/**
 * The pages loaded after a page is checked or unchecked: pages load from the first on, which stays.
 */
export function toLoadedPages(page: number, checked: boolean): number {
  return checked ? page : Math.max(1, page - 1);
}
