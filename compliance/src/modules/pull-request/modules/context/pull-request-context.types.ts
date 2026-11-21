// 🏷️ Types

/** The live state of one pull request, shared by every phase. */
export interface PullRequestContext {
  readonly assignees: readonly string[];
  readonly author: string;
  readonly body: string;
  readonly draft: boolean;
  readonly labels: readonly string[];
  readonly number: number;
  readonly title: string;
}
