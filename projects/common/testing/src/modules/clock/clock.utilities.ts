import { afterEach, beforeEach, vi } from "vitest";

import { DEFAULT_TEST_DATE } from "./clock.constants";

/**
 * Sets up fake timers with a fixed system time before each test
 * and restores real timers after each test.
 *
 * Usage in test files:
 * ```ts
 * import { mockDates } from "@codebase/testing";
 *
 * describe("my suite", () => {
 *   mockDates();
 *   // your tests here
 * });
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
