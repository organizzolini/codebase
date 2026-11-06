// 🏷️ Types

/** What one phase of an issue run found. */
export interface IssueOutcome {
  readonly failures: readonly string[];
  readonly lines: readonly string[];
}

/** What one invocation has been asked to do. */
export interface IssuePlan {
  /** Every open issue is audited, and assigned when `writable`. */
  readonly allIssues: boolean;
  /** The body a new issue was filed with, for its form answers. */
  readonly body: string;
  /** The labels the one issue carried when the event fired. */
  readonly labelNames: readonly string[];
  /** Whether the one issue lacks an assignee, or is not known to have one. */
  readonly needsAssignee: boolean;
  /** Whether the issue was just filed, so its form labels are due. */
  readonly newlyOpened: boolean;
  /** The one issue to act on, when there is one. */
  readonly number?: string;
  /** Whether this run may change anything. */
  readonly writable: boolean;
}

/** A plan, or the one line saying why there is none. */
export type IssuePlanResolution =
  | { readonly failure: string; readonly ok: false }
  | { readonly ok: true; readonly plan: IssuePlan };
