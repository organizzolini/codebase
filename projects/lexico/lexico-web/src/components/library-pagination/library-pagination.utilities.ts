// 🔏 Private Functions

// 🌎 Public Functions

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
