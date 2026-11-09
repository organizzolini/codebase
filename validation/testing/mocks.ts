import { afterEach, beforeEach, vi } from "vitest";

import type { MockInstance } from "vitest";

/**
 * Default test date used across time-sensitive tests.
 */
export const DEFAULT_TEST_DATE = new Date("2025-03-20T14:46:00Z");

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

/**
 * Mocks process.exit by throwing an Error with the exit code.
 * Useful for command tests that assert exit behavior.
 */
export function mockProcessExit(): MockInstance<typeof process.exit> {
  return vi
    .spyOn(process, "exit")
    .mockImplementation((code?: null | number | string): never => {
      throw new Error(`process.exit:${code ?? 0}`);
    });
}
