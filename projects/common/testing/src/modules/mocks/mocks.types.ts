import type * as ChildProcess from "node:child_process";
import type { ExecException } from "node:child_process";
import type { Mock } from "vitest";

/** `node:child_process` with process starters replaced by pass-through spies. */
export type ChildProcessMock = Omit<typeof ChildProcess, ProcessStarter> & {
  readonly [Name in ProcessStarter]: Mock<(typeof ChildProcess)[Name]>;
};

/** How a faked `execFile` process exits; every field defaults to success. */
export interface ExecFileExit {
  readonly error?: ExecException;
  readonly stderr?: string;
  readonly stdout?: string;
}

/** `node:child_process` whose `execFile` exits as a test's callback decides. */
export type ExecFileMock = Omit<ChildProcessMock, "execFile"> & {
  readonly execFile: Mock<(...parameters: ExecFileParameters) => void>;
};

/** The file, arguments, options, and exit callback `execFile` takes. */
export type ExecFileParameters = [
  file: string,
  args: readonly string[],
  options: { readonly env?: NodeJS.ProcessEnv },
  callback: ExecFileCallback,
];

/** One process a faked `execFile` was asked to start. */
export interface ExecFileStart {
  readonly args: readonly string[];
  readonly environment: NodeJS.ProcessEnv | undefined;
  readonly file: string;
}

/**
 * The answers one `prompts` call resolves with, keyed by question name.
 */
export type PromptAnswers = Readonly<Record<string, unknown>>;

/** The callback `execFile` reports a process's exit to. */
type ExecFileCallback = (
  error: ExecException | null,
  stdout: string,
  stderr: string,
) => void;

/** The `node:child_process` functions that start a process. */
type ProcessStarter =
  | "exec"
  | "execFile"
  | "execFileSync"
  | "execSync"
  | "fork"
  | "spawn"
  | "spawnSync";
