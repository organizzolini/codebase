import { onTestFinished, vi } from "vitest";

import { promptsMock } from "./mocks.constants";

import type {
  ChildProcessMock,
  ExecFileExit,
  ExecFileMock,
  ExecFileParameters,
  ExecFileStart,
  PromptAnswers,
} from "./mocks.types";
import type * as ChildProcess from "node:child_process";
import type { ExecException } from "node:child_process";

/**
 * Queues the answers the next `prompts` calls resolve with, one object per
 * call, and drops any left unused once the running test finishes.
 */
export function answerPrompts(...answers: readonly PromptAnswers[]): void {
  for (const answer of answers) {
    promptsMock.mockResolvedValueOnce(answer);
  }

  onTestFinished(() => {
    promptsMock.mockReset().mockResolvedValue({});
  });
}

/**
 * The `node:child_process` module with each process-starting function wrapped
 * in a spy that runs the real process until a test stages a result.
 */
export function mockChildProcess(
  actual: typeof ChildProcess,
): ChildProcessMock {
  return {
    ...actual,
    exec: vi.fn(actual.exec),
    execFile: vi.fn(actual.execFile),
    execFileSync: vi.fn(actual.execFileSync),
    execSync: vi.fn(actual.execSync),
    fork: vi.fn(actual.fork),
    spawn: vi.fn(actual.spawn),
    spawnSync: vi.fn(actual.spawnSync),
  };
}

/**
 * `node:child_process` with `execFile` replaced by a fake that starts nothing:
 * it asks `decide` how each call exits, then reports that to its callback.
 */
export function mockExecFile(
  actual: typeof ChildProcess,
  decide: (start: ExecFileStart) => ExecFileExit | undefined,
): ExecFileMock {
  return {
    ...mockChildProcess(actual),
    execFile: vi.fn(
      (...[file, args, options, callback]: ExecFileParameters) => {
        const {
          error = null,
          stderr = "",
          stdout = "",
        } = decide({ args, environment: options.env, file }) ?? {};

        callback(error, stdout, stderr);
      },
    ),
  };
}

/**
 * Replaces only the given members of a module, keeping the rest of the real
 * module, for a `vi.mock` factory.
 */
export function mockPartially<Module extends object>(
  actual: Module,
  overrides: Partial<Module>,
): Module {
  return { ...actual, ...overrides };
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
 * Replaces global `fetch` with a mock that answers each request with the next
 * response or error, in order, and restores the real one afterwards.
 */
export function stubFetch(
  ...outcomes: readonly (Error | Response)[]
): ReturnType<typeof vi.fn<typeof fetch>> {
  const realFetch = globalThis.fetch;
  const fetchMock = vi.fn<typeof fetch>();

  for (const outcome of outcomes) {
    if (outcome instanceof Error) {
      fetchMock.mockRejectedValueOnce(outcome);
    } else {
      fetchMock.mockResolvedValueOnce(outcome);
    }
  }

  globalThis.fetch = fetchMock;
  onTestFinished(() => {
    globalThis.fetch = realFetch;
  });

  return fetchMock;
}
