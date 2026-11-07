// ♟️ Constants

/**
 * The client a live read goes through.
 *
 * Named rather than spelled at the call site, so what a PATH-shadowed
 * executable in a test has to be called is stated in one place.
 */
export const GITHUB_CLI_BINARY = "gh";

/** The variable GitHub Actions sets to the file a step's summary is read from. */
export const STEP_SUMMARY_VARIABLE = "GITHUB_STEP_SUMMARY";

/** Said when the mirror fails, so a silent summary is never a silent bug. */
export const STEP_SUMMARY_FAILURE_MESSAGE =
  "⚠️ Unable to write the report to GITHUB_STEP_SUMMARY";
