/**
 * What a test wrote to the process's two output streams while captured.
 */
export interface CapturedOutput {
  /** Everything written to standard error so far. */
  readonly stderr: () => string;

  /** Everything written to standard output so far. */
  readonly stdout: () => string;
}
