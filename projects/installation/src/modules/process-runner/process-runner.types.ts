// 🏷️ Types

/** How one child process is run. */
export interface ProcessOptions {
  /** Collect the output instead of showing it. Off, the child writes to this terminal. */
  capture?: boolean;
  /** Where the child runs. Defaults to the current working directory. */
  cwd?: string;
  /** Variables laid over this process's own for the child. */
  environment?: NodeJS.ProcessEnv;
}

/** What one child process did. */
export interface ProcessResult {
  /** Standard output and standard error together, as a shell's `2>&1` would. Empty unless captured. */
  output: string;
  /** The exit code, or `null` when the child could not be started or was killed. */
  status: null | number;
  /** Standard output alone. Empty unless captured. */
  stdout: string;
}
