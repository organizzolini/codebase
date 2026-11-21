// ♟️ Constants

/**
 * How long the copy button says it copied, in milliseconds.
 */
export const COPIED_MILLISECONDS = 1500;

/**
 * The size assumed for a drawing whose SVG names none.
 */
export const FALLBACK_DRAWING_SIZE = { height: 128, width: 256 } as const;

/**
 * What the copy button says in each state.
 */
export const COPY_LABELS = {
  copied: "Copied",
  failed: "Copy failed",
  idle: "Copy",
} as const;
