import { afterEach, beforeEach, vi } from "vitest";

import { DEFAULT_TEST_DATE } from "./clock.constants";

/**
 * Fakes timers at a fixed system time around each test, restoring real timers
 * after. Call it inside a `describe`.
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
