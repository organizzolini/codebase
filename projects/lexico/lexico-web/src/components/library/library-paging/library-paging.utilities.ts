// 🔏 Private Functions

// 🌎 Public Functions

/** The page numbers a library of this many pages offers, at least the first. */
export function listPages(pageCount: number): number[] {
  return Array.from(
    { length: Math.max(pageCount, 1) },
    (_, index) => index + 1,
  );
}
