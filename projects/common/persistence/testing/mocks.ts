import fs from "node:fs";

import { afterEach, beforeEach, onTestFinished, vi } from "vitest";

import { mockChildProcess } from "@codebase/testing";

import type * as ChildProcess from "node:child_process";
import type { ExecException, ExecFileOptions } from "node:child_process";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

/** What the next process the mocked `execFile` starts does, and every start so far. */
const processes: { outcome: ProcessOutcome; spawned: SpawnedProcess[] } = {
  outcome: {},
  spawned: [],
};

/** What the fake `execFile` does: record the start, then exit as staged. */
const fakeExecFile = vi.fn(
  (
    file: string,
    args: readonly string[],
    options: ExecFileOptions,
    callback: ExecFileCallback,
  ): void => {
    const {
      error = null,
      stderr = "",
      stdout = "",
    } = outcomeFor(file, args, processes.outcome);
    processes.spawned.push({
      args,
      environment: options.env,
      file,
      useList: useListOf(args),
    });
    // A pg_dump that succeeds has written the file it was given.
    for (const argument of args) {
      if (
        error === null &&
        file === "pg_dump" &&
        argument.startsWith("--file=")
      ) {
        fs.writeFileSync(argument.slice("--file=".length), "dump");
      }
    }
    callback(error, stdout, stderr);
  },
);

/**
 * One process the mocked `execFile` was asked to start.
 */
export interface SpawnedProcess {
  readonly args: readonly string[];
  readonly environment: NodeJS.ProcessEnv | undefined;
  readonly file: string;

  /**
   * What the `--use-list=<path>` file it was handed held when it started;
   * the caller may remove the file once the process exits.
   */
  readonly useList: string | undefined;
}

/** The callback `execFile` reports a process's exit to. */
type ExecFileCallback = (
  error: ExecException | null,
  stdout: string,
  stderr: string,
) => void;

/**
 * How every process the mocked `execFile` starts will exit.
 */
interface ProcessOutcome {
  readonly error?: ExecException;

  /**
   * How a `pg_restore --list` of a dump's contents exits; by default as
   * the rest of the outcome.
   */
  readonly list?: StepOutcome;

  readonly stderr?: string;
  readonly stdout?: string;

  /**
   * How a `--version` check exits, which never follows the rest of the
   * outcome; by default the tool reports version 18.
   */
  readonly version?: StepOutcome;
}

/** How one kind of process, such as a `--version` check, exits. */
type StepOutcome = Pick<ProcessOutcome, "error" | "stderr" | "stdout">;

/**
 * Fakes timers at a fixed system time before each test and restores real
 * timers after.
 */
export function mockDates(date: Date = DEFAULT_TEST_DATE): void {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

/** The shared `node:child_process` mock, its `execFile` replaced by a fake that follows {@link mockProcesses}. */
export function mockPostgresChildProcess(actual: typeof ChildProcess): Omit<
  ReturnType<typeof mockChildProcess>,
  "execFile"
> & {
  readonly execFile: typeof fakeExecFile;
} {
  return { ...mockChildProcess(actual), execFile: fakeExecFile };
}

/**
 * Makes each process the mocked `execFile` starts exit as `outcome` says; returns the recorded starts.
 * Replace `node:child_process` with {@link mockPostgresChildProcess}.
 */
export function mockProcesses(outcome: ProcessOutcome = {}): SpawnedProcess[] {
  const spawned: SpawnedProcess[] = [];
  processes.outcome = outcome;
  processes.spawned = spawned;
  return spawned;
}

/**
 * Lets a test set whether `process.stdin` reads as a terminal, restoring the
 * real value after that test.
 */
export function mockStandardInputTerminal(): (isTerminal: boolean) => void {
  const original = Object.getOwnPropertyDescriptor(process.stdin, "isTTY");

  return (isTerminal) => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: isTerminal,
      writable: true,
    });

    onTestFinished(() => {
      if (original) {
        Object.defineProperty(process.stdin, "isTTY", original);
      } else {
        Reflect.deleteProperty(process.stdin, "isTTY");
      }
    });
  };
}

/**
 * An `execFile` error as Node reports it: a process that exited with a
 * numeric `code`, or one that never started, with a string `code`.
 */
export function processFailure(
  code: number | string,
  message = "Command failed",
): ExecException {
  return Object.assign(new Error(message), { cmd: "", code });
}

/**
 * The outcome of `file` run with `args`: a `--version` check as
 * `outcome.version` says, a `--list` as `outcome.list`, and anything else as
 * the outcome.
 */
function outcomeFor(
  file: string,
  args: readonly string[],
  outcome: ProcessOutcome,
): StepOutcome {
  if (args.length === 1 && args[0] === "--version") {
    return outcome.version ?? { stdout: `${file} (PostgreSQL) 18.6\n` };
  }
  if (args.includes("--list")) return outcome.list ?? outcome;
  return outcome;
}

/** The contents of the `--use-list` file named in `args`, if any. */
function useListOf(args: readonly string[]): string | undefined {
  const option = args.find((argument) => argument.startsWith("--use-list="));
  return option === undefined
    ? undefined
    : fs.readFileSync(option.slice("--use-list=".length), "utf8");
}
