// 🏷️ Types

/** What bounding the base came to: the lines to print, and how to exit. */
export interface BoundBaseReport {
  exitCode: number;
  /** Lines for the log, in order; a line starting `❌` goes to standard error. */
  lines: readonly string[];
}
