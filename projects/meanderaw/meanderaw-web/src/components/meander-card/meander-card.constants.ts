// ♟️ Constants

/**
 * How long the copy button says it copied, in milliseconds.
 */
export const COPIED_MILLISECONDS = 1500;

/**
 * The classes a card wears per view: a column, or a row.
 */
export const VIEW_CLASSES = {
  grid: {
    drawing: "h-32 w-full",
    height: 128,
    root: "flex-col",
    width: 256,
  },
  list: {
    drawing: "h-16 w-48 shrink-0",
    height: 64,
    root: "flex-row items-start",
    width: 192,
  },
} as const;

/**
 * What the copy button says in each state.
 */
export const COPY_LABELS = {
  copied: "Copied",
  failed: "Copy failed",
  idle: "Copy",
} as const;
