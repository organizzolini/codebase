// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The rows a page shows, as "first to last of total". A single row reads "1 of
 * 1", and none, or a page past the last row, reads "0 of total".
 */
export function formatRange(
  page: number,
  limit: number,
  totalCount: number,
): string {
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, totalCount);

  if (first > last) {
    return `0 of ${String(totalCount)}`;
  }

  return first === last
    ? `${String(first)} of ${String(totalCount)}`
    : `${String(first)} to ${String(last)} of ${String(totalCount)}`;
}

/** The page numbers a library of this many pages offers, at least the first. */
export function listPages(pageCount: number): number[] {
  return Array.from(
    { length: Math.max(pageCount, 1) },
    (_, index) => index + 1,
  );
}
