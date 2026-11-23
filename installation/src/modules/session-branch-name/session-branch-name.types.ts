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

/** The current branch's name verdict. No branch is its own answer. */
export type SessionBranchNameResult =
  | { readonly errorMessage: string; readonly kind: "non-compliant" }
  | { readonly kind: "compliant" }
  | { readonly kind: "no-branch" };
