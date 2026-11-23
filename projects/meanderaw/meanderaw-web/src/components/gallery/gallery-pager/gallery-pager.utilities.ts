// 🔏 Private Functions

/**
 * Words the range the pages showing cover: "1 to 48 of 182,397", or "0 of 0"
 * for none.
 */
export function describeRange(
  range: Readonly<{
    first: number;
    last: number;
    size: number;
    total: number;
  }>,
): string {
  const { first, last, size, total } = range;

  if (total === 0) {
    return "0 of 0";
  }

  return `${format((first - 1) * size + 1)} to ${format(Math.min(last * size, total))} of ${format(total)}`;
}

// 🌎 Public Functions

/**
 * Words a count with its thousands set apart.
 */
function format(count: number): string {
  return count.toLocaleString("en-US");
}
