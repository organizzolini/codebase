// ♟️ Constants

/** Where the baseline of codometer reports is gathered and downloaded to. */
export const BASELINE_DIRECTORY = "codometer-baseline";

/** The report every measured project writes beside its sources. */
export const REPORT_FILE_NAME = "codometer-report.json";

/** Directories that hold no project's own report, so the search skips them. */
export const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set([
  ".git",
  ".nx",
  BASELINE_DIRECTORY,
  "node_modules",
]);

/** The measured examples are fixtures, not a project, so they stay out of the baseline. */
export const EXAMPLES_PREFIX =
  "projects/ic-suite/codometer/codometer-examples/";

export const NO_REPORTS_MESSAGE =
  "ℹ️ No codometer reports were found for this run.";

/** Reports how many reports were gathered. */
export const collectedMessage = (count: number): string =>
  `📦 Gathered ${count} codometer ${count === 1 ? "report" : "reports"} into ${BASELINE_DIRECTORY}`;
