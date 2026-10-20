// 🏷️ Types

/** How one `git` invocation ended, and what it printed on standard output. */
export interface GitResult {
  /** False when the `git` executable could not be started at all. */
  readonly available: boolean;
  readonly status: null | number;
  readonly stdout: string;
}

/** Where a linked worktree sits, as this check needs to judge it. */
export interface LinkedWorktree {
  /** The main checkout the worktree was added from. */
  readonly mainCheckoutRoot: string;
  /** The worktree's own root, which this check runs in. */
  readonly root: string;
}
