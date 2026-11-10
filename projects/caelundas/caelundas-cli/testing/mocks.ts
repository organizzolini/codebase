/**
 * Mock patterns for event tests. Vitest hoists `vi.mock()` above imports, so
 * these cannot be imported as helpers: copy them into the test file. Used by every
 * event generation test and the `write*Events` tests.
 */

import { afterEach, beforeEach, vi } from "vitest";

export const MOCK_PATTERNS = {
  databaseUtilities: `vi.mock("../../database.utilities", () => ({
  upsertEvents: vi.fn(),
}));`,

  fileSystem: `vi.mock("fs", () => ({
  default: {
    writeFileSync: vi.fn(),
  },
}));`,
};

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
