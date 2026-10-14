import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, vi } from "vitest";

import type { ProcessRunnerService } from "../src/modules/process-runner/process-runner.service";
import type { CapturedProcess } from "../src/modules/process-runner/process-runner.types";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

/** One call a command made to the process runner. */
export interface RecordedCall {
  args: readonly string[];
  executable: string;
  input?: string;
}

/**
 * A task-database directory inside the workspace, for a test to fill.
 *
 * It sits under `.nx`, which is ignored, and never in the operating system's
 * temporary directory: a fixture there passes on macOS and fails on a runner.
 */
export interface TaskDatabaseWorkspace {
  /** Writes one database, and the companion files named by suffix. */
  add: (name: string, ageSeconds: number, companions?: string[]) => void;
  /** Removes the whole workspace. */
  cleanup: () => void;
  /** The absolute directory of databases the commands are pointed at. */
  directory: string;
  /** Every file in the directory, by name. */
  names: () => string[];
  /** The text of one file in the directory. */
  read: (name: string) => string;
  /** Writes a file beside the database directory, and returns its path. */
  writeBeside: (name: string, text: string) => string;
}

/**
 * A process runner that answers `capture` from a script and records every
 * call, so a command test runs the real service against no real process.
 *
 * @param script - Answers a captured call by its full command line, such as
 * `git merge-base a b`; a line it does not name fails the test.
 * @param streamStatus - The exit code every streamed call returns.
 */
export class FakeProcessRunner implements Pick<
  ProcessRunnerService,
  "capture" | "stream"
> {
  constructor(
    private readonly script: Readonly<Record<string, CapturedProcess>>,
    private readonly streamStatus = 0,
  ) {}
  public readonly captured: RecordedCall[] = [];

  public readonly streamed: RecordedCall[] = [];

  /** Answers a captured call from the script, and records it. */
  public capture(executable: string, args: readonly string[]): CapturedProcess {
    this.captured.push({ args, executable });
    const line = [executable, ...args].join(" ");
    const answer = this.script[line];

    if (answer === undefined) {
      throw new Error(`Unscripted command line: ${line}`);
    }

    return answer;
  }

  /** Records a streamed call, and ends it with the configured exit code. */
  public stream(
    executable: string,
    args: readonly string[],
    input?: string,
  ): number {
    this.streamed.push({
      args,
      executable,
      ...(input === undefined ? {} : { input }),
    });

    return this.streamStatus;
  }
}

/** Makes an empty task-database directory in the workspace. */
export function createTaskDatabaseWorkspace(): TaskDatabaseWorkspace {
  const parent = path.resolve(import.meta.dirname, "../../../.nx");

  fs.mkdirSync(parent, { recursive: true });

  const root = fs.mkdtempSync(path.join(parent, "publication-test-"));
  const directory = path.join(root, "workspace-data");

  fs.mkdirSync(directory);

  return {
    add: (name, ageSeconds, companions = []) => {
      const when = new Date(Date.now() - ageSeconds * 1000);

      for (const suffix of ["", ...companions]) {
        const file = path.join(directory, `${name}${suffix}`);

        fs.writeFileSync(file, `${name}${suffix}`);
        fs.utimesSync(file, when, when);
      }
    },
    cleanup: () => {
      fs.rmSync(root, { force: true, recursive: true });
    },
    directory,
    names: () => fs.readdirSync(directory).toSorted(),
    read: (name) => fs.readFileSync(path.join(directory, name), "utf8"),
    writeBeside: (name, text) => {
      const file = path.join(root, name);

      fs.writeFileSync(file, text);

      return file;
    },
  };
}

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
