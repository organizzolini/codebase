import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, onTestFinished, vi } from "vitest";

import type { ProcessRunnerService } from "../src/modules/process-runner/process-runner.service";
import type { CapturedProcess } from "../src/modules/process-runner/process-runner.types";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

/**
 * Where temporary workspaces are made: inside this project, never the
 * operating system's temporary directory, and ignored by git.
 */
const TEMPORARY_ROOT = path.resolve(import.meta.dirname, "../tmp");

/** One call a command made to the process runner. */
export interface RecordedCall {
  args: readonly string[];
  executable: string;
  input?: string;
}

/**
 * How a scripted command line answers: one result every time, or one result
 * per call in turn, the last repeating.
 */
export type ScriptedAnswer<Result> = readonly Result[] | Result;

/** Something a scripted command line does to the disk when it is called. */
export type ScriptedEffect = (args: readonly string[]) => void;

/** Tells a sequence of answers from a single one. */
const isSequence = <Result>(
  answer: ScriptedAnswer<Result>,
): answer is readonly Result[] => Array.isArray(answer);

/** Picks the answer for the given call, the last one repeating. */
const answerFor = <Result>(
  answer: ScriptedAnswer<Result>,
  call: number,
): Result => {
  if (!isSequence(answer)) {
    return answer;
  }

  const picked = answer[Math.min(call, answer.length - 1)];

  if (picked === undefined) {
    throw new Error("A scripted answer sequence is empty");
  }

  return picked;
};

/**
 * Finds what the script says about a command line: its exact entry, or the
 * longest entry ending in ` *` whose text before the `*` starts the line.
 */
const lookUp = <Value>(
  script: Readonly<Record<string, Value>>,
  line: string,
): undefined | Value => {
  if (Object.hasOwn(script, line)) {
    return script[line];
  }

  const prefix = Object.keys(script)
    .filter((key) => key.endsWith(" *") && line.startsWith(key.slice(0, -1)))
    .toSorted((left, right) => right.length - left.length)[0];

  return prefix === undefined ? undefined : script[prefix];
};

/**
 * A process runner that answers `capture` and `captureAsync` from a script
 * and records every call, so a command test runs the real service against no
 * real process.
 *
 * @param script - Answers a captured call by its full command line, such as
 * `git merge-base a b`, or by a prefix ending in ` *`; a line it does not
 * name fails the test.
 * @param streamStatus - The exit code a streamed call returns when
 * `streamScript` does not name its line.
 * @param streamScript - Exit codes for streamed calls, by command line.
 */
export class FakeProcessRunner implements Pick<
  ProcessRunnerService,
  "capture" | "captureAsync" | "stream"
> {
  constructor(
    private readonly script: Readonly<
      Record<string, ScriptedAnswer<CapturedProcess>>
    >,
    private readonly streamStatus = 0,
    private readonly streamScript: Readonly<
      Record<string, ScriptedAnswer<number>>
    > = {},
  ) {}

  private readonly counts = new Map<string, number>();

  public readonly captured: RecordedCall[] = [];

  /** What each scripted command line does to the disk, by line or prefix. */
  public readonly effects: Record<string, ScriptedEffect> = {};

  /** Every command line called, captured or streamed, in order. */
  public readonly lines: string[] = [];

  public readonly streamed: RecordedCall[] = [];

  /** Records a call, runs its effect, and counts how often its line ran. */
  private record(executable: string, args: readonly string[]): string {
    const line = [executable, ...args].join(" ");
    this.lines.push(line);
    lookUp(this.effects, line)?.(args);

    return line;
  }

  /** Counts a call of the given line, returning how many came before. */
  private take(line: string): number {
    const count = this.counts.get(line) ?? 0;
    this.counts.set(line, count + 1);

    return count;
  }

  /** Answers a captured call from the script, and records it. */
  public capture(executable: string, args: readonly string[]): CapturedProcess {
    this.captured.push({ args, executable });
    const line = this.record(executable, args);
    const answer = lookUp(this.script, line);

    if (answer === undefined) {
      throw new Error(`Unscripted command line: ${line}`);
    }

    return answerFor(answer, this.take(line));
  }

  /** Answers a call made without blocking exactly as `capture` would. */
  public async captureAsync(
    executable: string,
    args: readonly string[],
  ): Promise<CapturedProcess> {
    await Promise.resolve();

    return this.capture(executable, args);
  }

  /** Records a streamed call, and ends it with its scripted exit code. */
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
    const line = this.record(executable, args);
    const answer = lookUp(this.streamScript, line);

    return answer === undefined
      ? this.streamStatus
      : answerFor(answer, this.take(line));
  }
}

/** A finished process that printed the given output and exited 0. */
export const succeeded = (stdout = ""): CapturedProcess => ({
  status: 0,
  stderr: "",
  stdout,
});

/** A finished process that printed the given error and exited non-zero. */
export const failed = (stderr = "", status = 1): CapturedProcess => ({
  status,
  stderr,
  stdout: "",
});

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
 * Makes an empty directory inside this project for the current test, removed
 * once that test finishes. Call it from a test or a `beforeEach` hook.
 *
 * @returns A function that makes a new directory and returns its path.
 */
export function useTemporaryDirectories(): () => string {
  return () => {
    fs.mkdirSync(TEMPORARY_ROOT, { recursive: true });
    const directory = fs.mkdtempSync(path.join(TEMPORARY_ROOT, "workspace-"));
    onTestFinished(() => {
      fs.rmSync(directory, { force: true, recursive: true });
    });

    return directory;
  };
}

/**
 * Writes a file beneath a directory, making its parent directories.
 *
 * @param root - The directory the path is relative to.
 * @param relative - The file's path beneath it.
 * @param content - What the file holds.
 */
export function writeFile(
  root: string,
  relative: string,
  content: string,
): void {
  const file = path.join(root, relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
