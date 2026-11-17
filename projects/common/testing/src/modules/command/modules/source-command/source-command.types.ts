/** What `runSourceCommand` runs, and where. */
export interface SourceCommandOptions {
  /** Extra arguments after the entry file. */
  readonly args?: readonly string[];
  /** The directory the command runs in; keep it inside the workspace, where `@swc-node/register` resolves. */
  readonly directory?: string;
  /** The TypeScript entry file to run. */
  readonly entry: string;
  /** Variables added on top of the sanitized environment. */
  readonly environment?: Readonly<Record<string, string>>;
  /** Milliseconds before the run is stopped; defaults to 120 seconds. */
  readonly timeout?: number;
  /** The `tsconfig.json` swc compiles the entry with, for its decorator settings. */
  readonly tsconfig?: string;
}

/** What a run of a source command left behind. */
export interface SourceCommandResult {
  /** The exit code, or 1 when the process never started or was stopped. */
  readonly exitCode: number;
  readonly stderr: string;
  readonly stdout: string;
}
