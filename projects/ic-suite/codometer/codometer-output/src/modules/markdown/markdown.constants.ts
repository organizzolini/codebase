// ♟️ Constants

/**
 * Section heading every rendered statistics block sits under.
 *
 * Rendered rather than hand-written, so no document's heading can drift from the figures.
 */
export const CODOMETER_SECTION_HEADING = "## ⏲️ Codometer";

/**
 * Characters with meaning inside a regular expression.
 *
 * Marker text is configurable, so it must be escaped before it is searched for.
 */
export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

/**
 * The newlines a file already ends with, however many there are.
 *
 * Stripped before appending, so the separator is exactly one blank line.
 */
export const TRAILING_NEWLINES = /\n+$/;

// 🚨 Errors

/** Raised when the anchor helper is asked to write a file nothing named. */
export class MissingMarkdownPathError extends Error {
  constructor() {
    super(
      "No markdown path to write to. Set output.markdown.path, pass --markdown, or give syncAnchoredBlock a path of its own.",
    );
    this.name = "MissingMarkdownPathError";
  }
}
