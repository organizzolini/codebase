// 🏷️ Types

/** One `gh` call's output. Stderr stays apart: `gh` writes notices there. */
export interface GithubCliResult {
  /** Whether the `gh` binary could be executed at all. */
  readonly available: boolean;
  readonly standardError: string;
  readonly standardOutput: string;
  readonly succeeded: boolean;
}
