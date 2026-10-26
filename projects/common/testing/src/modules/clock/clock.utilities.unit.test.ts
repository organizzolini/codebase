import { describe, expect, it, vi } from "vitest";

import { DEFAULT_TEST_DATE } from "./clock.constants";
import { mockDates } from "./clock.utilities";

// 🧪 Tests

describe(mockDates, () => {
  describe("with no date", () => {
    mockDates();

    it("fixes the clock at the default test date", () => {
      expect(new Date()).toStrictEqual(DEFAULT_TEST_DATE);
      expect(Date.now()).toBe(DEFAULT_TEST_DATE.getTime());
    });

    it("fakes timers, so time moves only when advanced", () => {
      vi.advanceTimersByTime(1000);

      expect(Date.now()).toBe(DEFAULT_TEST_DATE.getTime() + 1000);
    });
  });

  describe("with a date", () => {
    const date = new Date("2000-01-01T00:00:00Z");

    mockDates(date);

    it("fixes the clock at that date", () => {
      expect(new Date()).toStrictEqual(date);
    });
  });

  it("leaves real timers in place outside the suites that fix the clock", () => {
    expect(vi.isFakeTimers()).toBe(false);
  });
});
