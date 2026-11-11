// ♟️ Constants

/** The `gh` binary live reads run, so tests can shadow it. */
export const GITHUB_CLI_BINARY = "gh";

/** The variable GitHub Actions sets to the step summary file. */
export const STEP_SUMMARY_VARIABLE = "GITHUB_STEP_SUMMARY";

/** Said when the mirror fails, so no failure stays silent. */
export const STEP_SUMMARY_FAILURE_MESSAGE =
  "⚠️ Unable to write the report to GITHUB_STEP_SUMMARY";
