// 🔏 Private Functions

// 🌎 Public Functions

/** The values with the one at an index moved by an offset, or unchanged when it would leave the list. */
export function moveValue(
  values: readonly string[],
  index: number,
  offset: -1 | 1,
): string[] {
  const target = index + offset;
  const moved = values[index];
  const displaced = values[target];
  if (moved === undefined || displaced === undefined) {
    return [...values];
  }

  return values.map((value, position) => {
    if (position === index) {
      return displaced;
    }

    return position === target ? moved : value;
  });
}
