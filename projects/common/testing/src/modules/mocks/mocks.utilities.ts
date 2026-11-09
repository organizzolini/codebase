import { onTestFinished, vi } from "vitest";

import { promptsMock } from "./mocks.constants";

import type { ChildProcessMock, PromptAnswers } from "./mocks.types";
import type * as ChildProcess from "node:child_process";

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
 * in a spy that runs the real process until a test stages a result. A test
 * file hands it the real module from its `vi.mock` factory:
 *
 * ```ts
 * vi.mock("node:child_process", async (importOriginal) => {
 *   const { mockChildProcess } = await import("@codebase/testing");
 *   return mockChildProcess(await importOriginal());
 * });
 *
 * vi.mocked(execFile).mockImplementation(…);
 * ```
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
 * A module with only the given members replaced, for a `vi.mock` factory that
 * keeps the rest of the real module:
 *
 * ```ts
 * vi.mock("./reader", async (importOriginal) => {
 *   const { mockPartially } = await import("@codebase/testing");
 *   return mockPartially(await importOriginal<typeof Reader>(), { read: vi.fn() });
 * });
 * ```
 */
export function mockPartially<Module extends object>(
  actual: Module,
  overrides: Partial<Module>,
): Module {
  return { ...actual, ...overrides };
}

/**
 * Replaces the global `fetch` for the running test with a mock that answers
 * each request with the next response, or rejects with the next error, in
 * order, and restores the real `fetch` once the test finishes.
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
