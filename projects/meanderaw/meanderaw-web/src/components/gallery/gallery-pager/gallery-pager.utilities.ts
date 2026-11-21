// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Words the range a page covers: "1 to 24 of 182,397", or "0 of 0" for none.
 */
export function describeRange(
  range: Readonly<{
    position: number;
    shown: number;
    size: number;
    total: number;
  }>,
): string {
  const { position, shown, size, total } = range;

  if (shown === 0) {
    return `0 of ${total.toLocaleString("en-US")}`;
  }

  const start = position * size + 1;

  return `${start.toLocaleString("en-US")} to ${(start + shown - 1).toLocaleString("en-US")} of ${total.toLocaleString("en-US")}`;
}

/**
 * Reads the page a person typed, from 1, as a place from 0, or none for a
 * number that is no page.
 */
export function toPosition(
  typed: string,
  pageCount: number,
): number | undefined {
  const page = Number(typed);

  return typed.trim() !== "" &&
    Number.isInteger(page) &&
    page >= 1 &&
    page <= pageCount
    ? page - 1
    : undefined;
}
