// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The list with the item at an index moved by a step, one place left or right; the list as it was when the move would leave it.
 */
export function moveListItem<Item>(
  list: readonly Item[],
  index: number,
  step: -1 | 1,
): Item[] {
  const target = index + step;
  const item = list[index];

  if (item === undefined || target < 0 || target >= list.length) {
    return [...list];
  }

  const rest = list.filter((_, position) => position !== index);

  return [...rest.slice(0, target), item, ...rest.slice(target)];
}
