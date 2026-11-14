// ♟️ Constants

/**
 * How long the copy button says it copied, in milliseconds.
 */
export const COPIED_MILLISECONDS = 1500;

/**
 * The classes a card wears in each view: a column in the grid, a row in the
 * list.
 */
export const VIEW_CLASSES = {
  grid: { drawing: "w-full aspect-square", root: "flex-col" },
  list: { drawing: "size-24 shrink-0", root: "flex-row items-start" },
} as const;
