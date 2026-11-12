// ♟️ Constants

/** Start marker of an anchored block. Replacement stops at other blocks. */
export const FOREIGN_ANCHOR_PATTERN =
  /<!--\s*(?:[A-Za-z0-9_-]+:start|[A-Z0-9_]+_START)\b/i;

// 🚨 Errors

/** Raised when the anchor helper is asked to write a file nothing named. */
export class MissingMarkdownPathError extends Error {
  constructor() {
    super(
      "No markdown path to write to. Set write.markdown.path, pass --markdown, or give syncAnchoredBlock a path of its own.",
    );
    this.name = "MissingMarkdownPathError";
  }
}
