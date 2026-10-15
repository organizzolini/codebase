import fs from "node:fs";

import { afterEach, beforeEach, onTestFinished, vi } from "vitest";

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

/**
 * A stand-in for `node:child_process` whose `execFile` records each start
 * and exits as {@link mockProcesses} last said.
 */
export const childProcessMock = {
  execFile: vi.fn(
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
  ),
};

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
 * Sets up fake timers with a fixed system time before each test
 * and restores real timers after each test.
 *
 * Usage in test files:
 * ```ts
 * import { mockDates } from '../testing/mocks'
 *
 * describe('my suite', () => {
 *   mockDates()
 *   // your tests here
 * })
 * ```
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

/**
 * Makes every process the mocked `execFile` starts exit as `outcome` says,
 * and returns the list each start is recorded into. The calling test file
 * replaces the module with {@link childProcessMock}:
 *
 * ```ts
 * vi.mock("node:child_process", async () => {
 *   const { childProcessMock } = await import("../../../testing/mocks")
 *   return childProcessMock
 * })
 *
 * const spawned = mockProcesses({ stderr: "pg_dump: error: …", error })
 * expect(spawned[0]?.args).not.toContain(password)
 * ```
 */
export function mockProcesses(outcome: ProcessOutcome = {}): SpawnedProcess[] {
  const spawned: SpawnedProcess[] = [];
  processes.outcome = outcome;
  processes.spawned = spawned;
  return spawned;
}

/**
 * Lets a test decide whether `process.stdin` reads as a terminal. The setter
 * may be called from a test or its `beforeEach`; the real value captured here
 * is restored when that test finishes.
 *
 * Usage in test files:
 * ```ts
 * const setStandardInputTerminal = mockStandardInputTerminal()
 *
 * it('prompts', () => { setStandardInputTerminal(true) })
 * ```
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
 * How `file` run with `args` exits: a `--version` check as
 * `outcome.version` says, else as version 18; a `--list` as `outcome.list`
 * says, else as the rest of the outcome; anything else as the outcome.
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
