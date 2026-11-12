/** A child process being described, fluently, before it runs. */
export interface Command {
  /** Sets the directory the command runs in; `node_modules/.bin` there is on its `PATH`. */
  readonly inDirectory: (directory: string) => Command;
  readonly run: () => Promise<CommandResult>;
  /** Adds variables on top of the sanitized environment. */
  readonly withEnvironment: (
    variables: Readonly<Record<string, string>>,
  ) => Command;
  readonly withTimeout: (milliseconds: number) => Command;
}

/** What a finished command left behind. */
export interface CommandResult {
  /** The exit code, or `undefined` when the command never started or was killed. */
  readonly exitCode: number | undefined;
  readonly stderr: string;
  readonly stdout: string;
  /** Whether the command was stopped for outliving its timeout. */
  readonly timedOut: boolean;
}
