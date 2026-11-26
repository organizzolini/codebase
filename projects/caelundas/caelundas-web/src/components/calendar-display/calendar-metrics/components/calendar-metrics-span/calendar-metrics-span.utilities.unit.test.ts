import { describe, expect, it } from "vitest";

import { formatDurationSpan } from "./calendar-metrics-span.utilities";

import type { DurationSpanOptions } from "./calendar-metrics-span.types";

const MINUTE = 1;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// The spans are written from minutes, to the minute.
function span(minutes: number, options?: DurationSpanOptions): string {
  return formatDurationSpan(minutes, options);
}

describe("calendar-metrics span utilities", () => {
  describe(formatDurationSpan, () => {
    it.each([
      [0, "0 min"],
      [0.4 * MINUTE, "0 min"],
      [29 / 60, "0 min"],
      [30 / 60, "1 min"],
      [MINUTE, "1 min"],
      [59 * MINUTE, "59 min"],
      [59.6 * MINUTE, "1 h"],
      [HOUR, "1 h"],
      [200 * MINUTE, "3 h 20 min"],
      [23 * HOUR + 59 * MINUTE, "23 h 59 min"],
      [DAY - 0.4 * MINUTE, "1 day"],
      [DAY - 0.6 * MINUTE, "23 h 59 min"],
    ])("keeps %d minutes short as %s", (minutes, text) => {
      expect(span(minutes)).toBe(text);
    });

    it.each([
      [DAY, "1 day"],
      [DAY + MINUTE, "1 day, 1 minute"],
      [DAY + HOUR, "1 day, 1 hour"],
      [6 * DAY, "6 days"],
      [7 * DAY, "1 week"],
      [7 * DAY + 2 * HOUR + 5 * MINUTE, "1 week, 2 hours, 5 minutes"],
      [29 * DAY, "4 weeks, 1 day"],
      [30 * DAY, "1 month"],
      [31 * DAY, "1 month, 1 day"],
      [364 * DAY, "12 months, 4 days"],
      [365 * DAY, "1 year"],
      [366 * DAY, "1 year, 1 day"],
      [100_000 * MINUTE, "2 months, 1 week, 2 days, 10 hours, 40 minutes"],
    ])("writes %d minutes as %s", (minutes, text) => {
      expect(span(minutes)).toBe(text);
    });

    it("writes 78,512 h 23 min as years down to minutes", () => {
      expect(span(78_512 * HOUR + 23 * MINUTE)).toBe(
        "8 years, 11 months, 3 weeks, 8 hours, 23 minutes",
      );
    });

    it("writes the years with a thousands separator", () => {
      expect(span(1234 * 365 * DAY)).toBe("1,234 years");
      expect(span(10 * 365 * DAY + 3 * DAY)).toBe("10 years, 3 days");
    });

    it("rounds fractional minutes and carries into the next unit", () => {
      expect(span(DAY + 59.6 * MINUTE)).toBe("1 day, 1 hour");
    });

    it("writes a negative duration without its sign", () => {
      expect(span(-(DAY + HOUR))).toBe("1 day, 1 hour");
    });

    it("limits the units to the first few", () => {
      expect(span(78_512 * HOUR + 23 * MINUTE, { maxUnits: 2 })).toBe(
        "8 years, 11 months",
      );
      expect(span(200 * MINUTE, { maxUnits: 1 })).toBe("3 h");
    });

    it("abbreviates a compact span to its first three units", () => {
      expect(span(78_512 * HOUR + 23 * MINUTE, { compact: true })).toBe(
        "8 y 11 mo 3 w",
      );
      expect(span(DAY + HOUR, { compact: true })).toBe("1 d 1 h");
      expect(span(200 * MINUTE, { compact: true })).toBe("3 h 20 min");
      expect(span(0, { compact: true })).toBe("0 min");
    });

    it("lets a compact span take its own limit", () => {
      expect(
        span(78_512 * HOUR + 23 * MINUTE, { compact: true, maxUnits: 5 }),
      ).toBe("8 y 11 mo 3 w 8 h 23 min");
    });
  });
});
