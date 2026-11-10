// ♟️ Constants

/** Heading the rendered section is filed under. */
export const HEADING = "## ⏲️ Codometer";

/**
 * The block this report claims inside a shared document.
 *
 * HTML comment markers are invisible when rendered, so reports can share one document.
 */
export const CODOMETER_MARKERS = {
  end: "<!-- codometer-changes:end -->",
  start: "<!-- codometer-changes:start -->",
};

/** Column headers for a project's metrics table. */
export const TABLE_HEADER = [
  "| | Metric | Value | `main` | Change |",
  "|--|--------|-------|--------|--------|",
];
