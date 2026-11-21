// 🏷️ Types

/** What one conventional subject line, a commit's or title's, declares. */
export interface ConventionalSubject {
  readonly breaking: boolean;
  /** Trimmed, lowercased, and de-duplicated; empty when the subject named none. */
  readonly scopes: readonly string[];
  readonly type: string;
}

/** One reachable commit and its parsed subject, if it parses. */
export interface PullRequestCommit {
  readonly convention: ConventionalSubject | undefined;
  readonly sha: string;
  readonly subject: string;
}

/** The title and commits, or the reason there are none. */
export type PullRequestCommitsResolution =
  | {
      readonly commits: readonly PullRequestCommit[];
      readonly resolved: true;
      readonly title: string;
    }
  | { readonly failure: string; readonly resolved: false };

/**
 * One entry of `release.config.cjs`'s `releaseRules`, as much as this check
 * reads.
 */
export interface ReleaseRule {
  readonly breaking?: boolean | undefined;
  readonly release: "major" | "minor" | "patch" | false;
  readonly revert?: boolean | undefined;
  readonly scope?: string | undefined;
  readonly type?: string | undefined;
}

/** Every way one pull request's title understates its own commits. */
export interface SignificanceVerdict {
  readonly failures: readonly string[];
}
