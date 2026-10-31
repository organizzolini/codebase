// 🏷️ Types

/** The live state of one pull request, as every later phase reads it. */
export interface PullRequestContext {
  readonly assignees: readonly string[];
  readonly author: string;
  readonly body: string;
  readonly labels: readonly string[];
  readonly number: number;
  readonly title: string;
}
