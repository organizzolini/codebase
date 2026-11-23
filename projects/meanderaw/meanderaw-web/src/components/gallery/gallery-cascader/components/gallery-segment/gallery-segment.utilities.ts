// 🔏 Private Functions

// 🌎 Public Functions

/**
 * Moves the item at an index one step, or leaves the list as it is at an end.
 */
export function moveItem<Item>(
  items: readonly Item[],
  index: number,
  step: -1 | 1,
): Item[] {
  const target = index + step;
  const moved = [...items];
  const [item] = moved.splice(index, 1);

  if (target < 0 || target >= items.length || item === undefined) {
    return [...items];
  }

  moved.splice(target, 0, item);

  return moved;
}
