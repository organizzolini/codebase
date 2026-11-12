// 🏷️ Types

/** What a finished child process printed, and how it ended. */
export interface CapturedProcess {
  /** Exit code. A process that never started or died to a signal reports 1. */
  status: number;
  stderr: string;
  stdout: string;
}

/** Where a child process runs: its working directory and environment. */
export interface CaptureLocation {
  readonly cwd?: string;
  readonly env?: NodeJS.ProcessEnv;
}

/** A program and its arguments, run with no shell between. */
export type Command = readonly [executable: string, ...args: string[]];
