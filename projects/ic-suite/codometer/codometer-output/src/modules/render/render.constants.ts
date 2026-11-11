// ♟️ Constants

/** Heading the rendered section is filed under. */
export const HEADING = "## ⏲️ Codometer";

/** Report's block in a shared document, between HTML comments. */
export const CODOMETER_MARKERS = {
  end: "<!-- codometer-changes:end -->",
  start: "<!-- codometer-changes:start -->",
};

/** Column headers for a project's metrics table. */
export const TABLE_HEADER = [
  "| | Metric | Value | `main` | Change |",
  "|--|--------|-------|--------|--------|",
];
