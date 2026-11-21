// 🔏 Private Functions

// 🌎 Public Functions

/** Whether a page number lies beyond the last page of a library that has authors. */
export function isPastEnd(
  page: number,
  totalCount: number,
  pageCount: number,
): boolean {
  return totalCount > 0 && page > pageCount;
}

/**
 * The page numbers to offer: the first, the last, and the pages around the
 * current one, with a gap wherever pages are skipped.
 */
export function pageNumbers(
  page: number,
  pageCount: number,
): ("gap" | number)[] {
  const shown = Array.from(
    { length: pageCount },
    (_, index) => index + 1,
  ).filter(
    (candidate) =>
      candidate === 1 ||
      candidate === pageCount ||
      Math.abs(candidate - page) <= 1,
  );

  return shown.flatMap((candidate, index) => {
    const previous = shown[index - 1];
    return previous !== undefined && candidate - previous > 1
      ? ["gap", candidate]
      : [candidate];
  });
}

/** Tells a reader the page they asked for does not exist, and how many do. */
export function pastEndMessage(page: number, pageCount: number): string {
  const pages = `${String(pageCount)} ${pageCount === 1 ? "page" : "pages"}`;
  return `Page ${String(page)} does not exist; the library has ${pages}.`;
}
