// 🔏 Private Functions

// 🌎 Public Functions

/**
 * How many of a list's items lie, wholly or partly, below its bottom edge.
 */
export function countClipped(list: HTMLElement): number {
  return [...list.children].filter(
    (item) =>
      item instanceof HTMLElement &&
      item.offsetTop + item.offsetHeight > list.clientHeight,
  ).length;
}
