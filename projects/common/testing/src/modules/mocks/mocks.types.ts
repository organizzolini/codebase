import type * as ChildProcess from "node:child_process";
import type { Mock } from "vitest";

/** `node:child_process` with process starters replaced by pass-through spies. */
export type ChildProcessMock = Omit<typeof ChildProcess, ProcessStarter> & {
  readonly [Name in ProcessStarter]: Mock<(typeof ChildProcess)[Name]>;
};

/**
 * The answers one `prompts` call resolves with, keyed by question name.
 */
export type PromptAnswers = Readonly<Record<string, unknown>>;

/** The `node:child_process` functions that start a process. */
type ProcessStarter =
  | "exec"
  | "execFile"
  | "execFileSync"
  | "execSync"
  | "fork"
  | "spawn"
  | "spawnSync";
