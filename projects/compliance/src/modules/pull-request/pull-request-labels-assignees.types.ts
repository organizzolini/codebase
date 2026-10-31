// 🏷️ Types

/** The label families one pull request's labels fall into. */
export interface GroupedLabels {
  readonly doNotMergePresent: boolean;
  readonly scopeLabels: readonly string[];
  readonly sourceLabels: readonly string[];
  readonly typeLabels: readonly string[];
}

/**
 * Everything wrong with one pull request, and the commands that fix it.
 *
 * Both lists rather than a first failure: a pull request with three problems
 * is three edits, and finding them one run at a time is three round trips
 * through a required check.
 */
export interface MetadataVerdict {
  readonly failures: readonly string[];
  readonly remediationCommands: readonly string[];
}

/** The metadata one pull request carries, whatever it was read from. */
export interface PullRequestLabelsAssignees {
  readonly assigneeLogins: readonly string[];
  readonly labelNames: readonly string[];
  readonly title: string;
}

/** What a conventional title declares about itself. */
export interface TitleConvention {
  /** Trimmed, lowercased, and de-duplicated; empty when the title named none. */
  readonly scopes: readonly string[];
  readonly type: string;
}
