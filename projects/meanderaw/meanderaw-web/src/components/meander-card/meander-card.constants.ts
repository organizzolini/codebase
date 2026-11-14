// ♟️ Constants

/**
 * How long the copy button says it copied, in milliseconds.
 */
export const COPIED_MILLISECONDS = 1500;

/**
 * The classes a card wears per view: a column, or a row.
 */
export const VIEW_CLASSES = {
  grid: { drawing: "w-full aspect-square", root: "flex-col", size: 256 },
  list: { drawing: "size-24 shrink-0", root: "flex-row items-start", size: 96 },
} as const;

/**
 * What the copy button says in each state.
 */
export const COPY_LABELS = {
  copied: "Copied",
  failed: "Copy failed",
  idle: "Copy",
} as const;
