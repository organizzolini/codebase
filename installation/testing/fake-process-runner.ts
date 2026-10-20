import { createMock } from "@golevelup/ts-vitest";
import { vi } from "vitest";

import type { ProcessRunnerService } from "../src/modules/process-runner/process-runner.service";
import type {
  ProcessOptions,
  ProcessResult,
} from "../src/modules/process-runner/process-runner.types";
import type { DeepMocked } from "@golevelup/ts-vitest";

/** What a fake machine is made of. */
export interface FakeMachine {
  /** Commands that exist on `PATH`. */
  installed?: string[];
  /** The operating system the machine runs. Defaults to macOS, which setup was written for. */
  platform?: NodeJS.Platform;
  /**
   * What a command line prints, keyed by the line itself, such as
   * `"uv --version"`. A line not listed succeeds and prints nothing.
   */
  responses?: Record<string, Partial<ProcessResult>>;
  /**
   * What a command line prints on each successive run, keyed like `responses`.
   * The last entry repeats once the list is used up. Wins over `responses`.
   */
  sequences?: Record<string, Partial<ProcessResult>[]>;
}

/** A fake process runner and the account it keeps of itself. */
export interface FakeProcessRunner {
  /** Every command line asked to run, in order. A wait is recorded as `sleep <seconds>`. */
  commands: string[];
  /** Every command line started detached, in order. */
  detached: string[];
  /** The options each command line was run with, keyed by the line, last run winning. */
  options: Map<string, ProcessOptions>;
  /** The fake, ready to be provided in place of the real service. */
  runner: DeepMocked<ProcessRunnerService>;
}

/**
 * Builds a process runner that touches no real process.
 *
 * It answers from the given machine and keeps every command line it was asked
 * to run, so a test reads the whole setup as a list.
 */
export function createFakeProcessRunner(
  machine: FakeMachine = {},
): FakeProcessRunner {
  const commands: string[] = [];
  const detached: string[] = [];
  const installed = new Set(machine.installed);
  const counts = new Map<string, number>();

  const options = new Map<string, ProcessOptions>();

  const run = (
    command: string,
    args: string[],
    runOptions: ProcessOptions = {},
  ): ProcessResult => {
    const line = toLine(command, args);
    options.set(line, runOptions);
    commands.push(line);
    const sequence = machine.sequences?.[line];
    const response =
      (sequence === undefined
        ? undefined
        : sequence[Math.min(counts.get(line) ?? 0, sequence.length - 1)]) ??
      machine.responses?.[line] ??
      {};
    counts.set(line, (counts.get(line) ?? 0) + 1);
    const stdout = response.stdout ?? "";

    return {
      output: response.output ?? stdout,
      status: response.status ?? 0,
      stdout,
    };
  };

  const runOrThrow = (
    command: string,
    args: string[],
    runOptions: ProcessOptions = {},
  ): ProcessResult => {
    const result = run(command, args, runOptions);

    if (result.status !== 0) {
      throw new Error(`\`${toLine(command, args)}\` failed`);
    }

    return result;
  };

  const runner = createMock<ProcessRunnerService>({
    locate: vi.fn<ProcessRunnerService["locate"]>((command) =>
      installed.has(command) ? `/usr/local/bin/${command}` : undefined,
    ),
    platform: vi.fn<ProcessRunnerService["platform"]>(
      () => machine.platform ?? "darwin",
    ),
    run: vi.fn<ProcessRunnerService["run"]>(run),
    runOrThrow: vi.fn<ProcessRunnerService["runOrThrow"]>(runOrThrow),
    sleep: vi.fn<ProcessRunnerService["sleep"]>(async (seconds) => {
      commands.push(`sleep ${String(seconds)}`);
      await Promise.resolve();
    }),
    startDetached: vi.fn<ProcessRunnerService["startDetached"]>(
      (command, args) => {
        detached.push(toLine(command, args));
      },
    ),
  });

  return { commands, detached, options, runner };
}

/** Renders a command and its arguments as one line. */
function toLine(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}
