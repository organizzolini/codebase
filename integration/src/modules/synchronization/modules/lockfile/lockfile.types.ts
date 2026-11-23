// 🏷️ Types

/** What one frozen `pnpm install` printed, with both streams merged. */
export interface FrozenInstallResult {
  /**
   * Whether the `pnpm` binary could run at all. A missing binary means the
   * check did not run; a refusal means it failed.
   */
  readonly available: boolean;
  readonly output: string;
  readonly succeeded: boolean;
}
