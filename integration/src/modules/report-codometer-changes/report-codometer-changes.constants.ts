// ♟️ Constants

/** The workflow whose latest green run on `main` holds the baseline. */
export const BASELINE_WORKFLOW = "continuous-integration.yml";

/** The artifact `collect-codometer-baseline`'s output is uploaded as. */
export const BASELINE_ARTIFACT = "codometer-reports-main";

/** The pull request body, as a file `codometer changes` rewrites in place. */
export const BODY_FILE_NAME = ".pull-request-body.md";

export const PULL_REQUEST_UNSET_MESSAGE =
  "❌ PULL_REQUEST is unset; name the pull request to report on";

export const NO_BASELINE_MESSAGE =
  "ℹ️ No successful main run to compare against yet.";

/** Reports a baseline that could not be fetched, and that the report goes on without. */
export const baselineSkippedMessage = (reason: string): string =>
  `::warning::Reporting without a codometer baseline: ${reason}`;

/** Reports which run the baseline came from. */
export const baselineFoundMessage = (url: string): string =>
  `📥 Comparing against the codometer baseline of ${url}`;

/** Reports a step of the report that failed, and what it printed. */
export const failedMessage = (step: string, reason: string): string =>
  `❌ ${step} failed${reason === "" ? "" : `: ${reason}`}`;
