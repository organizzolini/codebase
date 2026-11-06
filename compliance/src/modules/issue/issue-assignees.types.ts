// 🏷️ Types

/** Whether listing unassigned issues succeeded or why it could not. */
export type ListUnassignedOpenIssueNumbersResult =
  | { readonly error: string; readonly success: false }
  | { readonly issueNumbers: readonly number[]; readonly success: true };
