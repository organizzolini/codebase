// 🏷️ Types

/** Lines to print, and the exit code to end with. */
export interface BoundBaseReport {
  exitCode: number;
  /** Lines for the log, in order; a line starting `❌` goes to standard error. */
  lines: readonly string[];
}
