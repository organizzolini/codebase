// 🏷️ Types

/** Context for reconciling parent issue references. */
export interface PullRequestParentLinksContext {
  readonly bodyPath: string;
  readonly pullRequestNumber: string;
}
