// 🏷️ Types

/** The rules `validate-branch-name.config.cjs` declares, as this check reads them. */
export interface BranchNameRules {
  /** The text printed for a branch that breaks the pattern. */
  readonly errorMessage: string;
  readonly pattern: RegExp;
}

/** How one `git` invocation ended, and what it printed on standard output. */
export interface GitResult {
  /** False when the `git` executable could not be started at all. */
  readonly available: boolean;
  readonly status: null | number;
  readonly stdout: string;
}

/**
 * What the current branch's name amounts to.
 *
 * No branch at all — a detached HEAD, a directory outside a repository, or no
 * `git` to ask — is its own answer, since there is nothing to judge.
 */
export type SessionBranchNameResult =
  | { readonly errorMessage: string; readonly kind: "non-compliant" }
  | { readonly kind: "compliant" }
  | { readonly kind: "no-branch" };
