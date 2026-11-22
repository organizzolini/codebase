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

/** The artifact the baseline is uploaded as, and later downloaded by name. */
export const BASELINE_ARTIFACT = "codometer-reports-main";

/** The file that makes a folder a project. */
export const PROJECT_FILE_NAME = "project.json";

export const NO_REPORTS_MESSAGE =
  "ℹ️ No codometer reports were found for this run.";

/** Reports how many reports were gathered. */
export const collectedMessage = (count: number): string =>
  `📦 Gathered ${count} codometer ${count === 1 ? "report" : "reports"} into ${BASELINE_DIRECTORY}`;

/** Says no earlier baseline was found, so this run's reports stand alone. */
export const NO_PREVIOUS_BASELINE_MESSAGE =
  "ℹ️ No earlier codometer baseline was found; starting from this run's reports.";

/** Says the earlier baseline could not be restored, and why. */
export const previousBaselineSkippedMessage = (reason: string): string =>
  `::warning::Gathering without the earlier codometer baseline: ${reason}`;

/** Says how many reports the earlier baseline carried forward. */
export const restoredMessage = (count: number): string =>
  `♻️ Carried ${count} ${count === 1 ? "report" : "reports"} forward from the earlier baseline`;

/** Says how many carried-forward reports belong to projects that are gone. */
export const prunedMessage = (count: number): string =>
  `🧹 Dropped ${count} ${count === 1 ? "report" : "reports"} of projects that no longer exist`;
