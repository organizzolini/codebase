// 🏷️ Types

/**
 * What one `gh` invocation produced.
 *
 * Standard output and standard error are kept apart rather than merged. `gh`
 * writes its own notices to standard error even when the call succeeds, so a
 * merged stream leaves a successful call returning a document that no longer
 * parses as JSON.
 */
export interface GithubCliResult {
  /** Whether the `gh` binary could be executed at all. */
  readonly available: boolean;
  readonly standardError: string;
  readonly standardOutput: string;
  readonly succeeded: boolean;
}

/**
 * The issues a pull request closes, or why they could not be read.
 *
 * `exempt` is true for a pull request whose author cannot be asked to link an
 * issue, so the check passes it without looking at `issueNumbers`.
 */
export type PullRequestIssuesResolution =
  | {
      readonly exempt: boolean;
      readonly issueNumbers: readonly number[];
      readonly resolved: true;
    }
  | { readonly failure: string; readonly resolved: false };
