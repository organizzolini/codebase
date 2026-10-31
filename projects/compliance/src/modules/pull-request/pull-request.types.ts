// 🏷️ Types

/** What one validation check found. */
export interface CheckOutcome {
  readonly failures: readonly string[];
  readonly heading: string;
  readonly remediationCommands: readonly string[];
  readonly successMessage: string;
}

/** The description after linking parents, and what the step did. */
export interface LinkResult {
  readonly body: string;
  readonly outcome: WriteOutcome;
}

/** The shape of one invocation: where it came from and what it may do. */
export interface PullRequestInvocation {
  readonly eventName: string;
  readonly number: string;
  readonly writable: boolean;
}

/** A value, or the one line saying why there is none. */
export type PullRequestResult<Value> =
  | { readonly failure: string; readonly ok: false }
  | { readonly ok: true; readonly value: Value };

/** What a write-phase step did: report lines, and what it could not do. */
export interface WriteOutcome {
  readonly failures: readonly string[];
  readonly lines: readonly string[];
}
