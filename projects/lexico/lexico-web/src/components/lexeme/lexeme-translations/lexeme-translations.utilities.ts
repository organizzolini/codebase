// 🔏 Private Functions

// 🌎 Public Functions

/**
 * How many of a list's items end below its first two lines, whatever its state.
 */
export function countClipped(list: HTMLElement): number {
  const lineHeight = Number.parseFloat(getComputedStyle(list).lineHeight);
  const limit = 2 * (Number.isNaN(lineHeight) ? 20 : lineHeight);
  const top = list.getBoundingClientRect().top;

  return [...list.children].filter(
    (item) => item.getBoundingClientRect().bottom - top > limit + 0.5,
  ).length;
}
