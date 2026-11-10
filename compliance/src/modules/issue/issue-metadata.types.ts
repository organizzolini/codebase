// 🏷️ Types

/** Result of a bulk issues sweep. */
export interface BulkIssuesVerdict {
  readonly failureCount: number;
  readonly failures: readonly string[];
  readonly hierarchyViolations: readonly HierarchyViolation[];
  readonly totalIssues: number;
}

/**
 * What one `gh` invocation produced. Stdout and stderr stay apart: `gh` writes
 * notices to stderr even on success.
 */
export interface GithubCliResult {
  /**
   * Whether the `gh` binary could run at all. A missing binary is an
   * environment to fix, not an answer from GitHub.
   */
  readonly available: boolean;
  readonly standardError: string;
  readonly standardOutput: string;
  readonly succeeded: boolean;
}

/** The label families one issue's labels fall into. */
export interface GroupedLabels {
  readonly scopeLabels: readonly string[];
  readonly sourceLabels: readonly string[];
  readonly typeLabels: readonly string[];
}

/** A violation in issue hierarchy. */
export interface HierarchyViolation {
  readonly childNumber: number;
  readonly message: string;
  readonly parentNumber?: number;
}

/**
 * Type and Scope answers from an `issue.yml` body. Absent when the issue was
 * opened without the template, which is normal.
 */
export interface IssueFormAnswers {
  readonly scope?: string;
  readonly type?: string;
}

/** The metadata one issue carries, whatever it was read from. */
export interface IssueMetadata {
  readonly body: string;
  /**
   * Whether the issue has a native parent. Omitted when the source cannot
   * say, such as the environment mode that skips the type check.
   */
  readonly hasParent?: boolean;
  /** The GitHub Issue Type's name, or `null` when none is set. */
  readonly issueType?: null | string;
  readonly labelNames: readonly string[];
}

/**
 * Either the metadata, or the one-line reason there is none. Input-read
 * failures share the failed-check report path.
 */
export type IssueMetadataResolution =
  | { readonly failure: string; readonly resolved: false }
  | { readonly metadata: IssueMetadata; readonly resolved: true };

/** Summary representation of a GitHub issue from list API. */
export interface IssueSummary {
  readonly body: string;
  readonly issueType?: null | { readonly name: string };
  readonly labels: readonly { readonly name: string }[];
  readonly number: number;
  readonly parent?: null | { readonly number: number };
  readonly title: string;
}

/** An issue's type and parentage, where the source could say. */
export type IssueTypeFacts = Pick<IssueMetadata, "hasParent" | "issueType">;

/** Result of listing open issues through gh CLI. */
export interface ListIssuesResult {
  readonly error?: string;
  readonly issues?: readonly IssueSummary[];
  readonly success: boolean;
}

/**
 * Everything wrong with one issue, and the commands that fix it.
 *
 * All problems are reported in one pass.
 */
export interface MetadataVerdict {
  readonly failures: readonly string[];
  readonly remediationCommands: readonly string[];
}
