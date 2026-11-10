// 🏷️ Types

/**
 * What one `gh` invocation produced. Stdout and stderr stay apart: `gh` writes
 * notices to stderr even on success.
 */
export interface GithubCliResult {
  /** Whether the `gh` binary could be executed at all. */
  readonly available: boolean;
  readonly standardError: string;
  readonly standardOutput: string;
  readonly succeeded: boolean;
}
