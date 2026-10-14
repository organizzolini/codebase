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
