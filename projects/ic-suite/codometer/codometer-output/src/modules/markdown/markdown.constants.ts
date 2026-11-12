// ♟️ Constants

/** Heading over rendered statistics, so it never drifts from figures. */
export const CODOMETER_SECTION_HEADING = "## ⏲️ Codometer";

/** Regex metacharacters; configured marker text must be escaped before search. */
export const REGEX_SPECIAL_CHARACTERS = /[.*+?^${}()|[\]\\]/g;

/** Trailing newlines, stripped before appending so one blank line separates. */
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
