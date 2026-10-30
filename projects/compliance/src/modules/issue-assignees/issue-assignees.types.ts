// 🏷️ Types

/** What one `gh` invocation produced. */
export interface GithubCliResult {
  readonly available: boolean;
  readonly standardError: string;
  readonly standardOutput: string;
  readonly succeeded: boolean;
}

/** Whether listing unassigned issues succeeded or why it could not. */
export type ListUnassignedOpenIssueNumbersResult =
  | { readonly error: string; readonly success: false }
  | { readonly issueNumbers: readonly number[]; readonly success: true };
