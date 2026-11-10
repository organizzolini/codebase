// 🏷️ Types

/** What a finished child process printed, and how it ended. */
export interface CapturedProcess {
  /** Exit code. A process that never started or died to a signal reports 1. */
  status: number;
  stderr: string;
  stdout: string;
}
