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

/** A pull request number, as an argument spells one. */
export const PULL_REQUEST_NUMBER_PATTERN = /^\d+$/u;

/**
 * The pull request number inside a merge queue's temporary ref.
 *
 * A merge group carries no pull request payload, only its
 * `gh-readonly-queue/<base>/pr-<number>-<sha>` ref, so the workflow hands that
 * over as it is and this reads the number out of it.
 */
export const MERGE_GROUP_REF_PATTERN = /(?:^|\/)pr-(\d+)-[0-9a-f]+$/u;

/**
 * A pull request Dependabot opened, however `gh` spells the author.
 *
 * `gh pr view` reports a bot as `app/dependabot`, the REST API as
 * `dependabot[bot]`. Dependabot writes its own body, so it cannot be asked to
 * carry an issue link.
 */
export const DEPENDABOT_AUTHOR_PATTERN = /^(?:app\/)?dependabot(?:\[bot\])?$/u;

/** How to run this check, printed whenever the input could not be used. */
export const USAGE_LINES = [
  "Usage: validation pull-request-issue <pull-request-number | merge-group-ref>",
];

/** How to give a pull request the issue link this check wants. */
export const REMEDIATION_LINES = [
  "Link an issue GitHub records, either way:",
  "- Add `Closes #<issue-number>` as the first bullet of the 🔗 Related section",
  "- Or add the issue under Development in the pull request sidebar",
  "No issue yet? File or backfill one with the link-issue skill.",
];

/** The shape a `gh pr view --json author,closingIssuesReferences` document is read as. */
export const pullRequestDocumentSchema = z.object({
  author: z.object({ login: z.string() }).optional(),
  closingIssuesReferences: z.array(z.object({ number: z.number() })).optional(),
});
