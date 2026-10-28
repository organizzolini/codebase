// ♟️ Constants

import { z } from "zod";

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

/** A pull request number, as an argument or the environment may spell one. */
export const PULL_REQUEST_NUMBER_PATTERN = /^\d+$/u;

/** How to run this check, printed whenever the input could not be used. */
export const USAGE_LINES = [
  "Usage: validation pull-request-issue <pull-request-number>",
  "   or: PULL_REQUEST_NUMBER=… validation pull-request-issue",
];

/** How to give a pull request the issue link this check wants. */
export const REMEDIATION_LINES = [
  "Link an issue GitHub records, either way:",
  "- Add `Closes #<issue-number>` as the first bullet of the 🔗 Related section",
  "- Or add the issue under Development in the pull request sidebar",
  "No issue yet? File or backfill one with the link-issue skill.",
];

/** The shape a `gh pr view --json closingIssuesReferences` document is read as. */
export const pullRequestDocumentSchema = z.object({
  closingIssuesReferences: z.array(z.object({ number: z.number() })).optional(),
});
