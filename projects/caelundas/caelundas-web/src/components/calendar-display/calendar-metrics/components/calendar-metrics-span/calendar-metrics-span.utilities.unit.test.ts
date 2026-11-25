import { describe, expect, it } from "vitest";

import {
  formatDurationSpan,
  formatHoursSpan,
} from "./calendar-metrics-span.utilities";

const HOUR = 60;
const DAY = 24 * HOUR;

describe("calendar-metrics span utilities", () => {
  describe(formatDurationSpan, () => {
    it.each([
      [0, "0 min"],
      [0.4, "0 min"],
      [1, "1 min"],
      [59, "59 min"],
      [59.6, "1 h"],
      [60, "1 h"],
      [200, "3 h 20 min"],
      [23 * HOUR + 59, "23 h 59 min"],
      [24 * HOUR - 0.4, "1 day"],
      [24 * HOUR - 0.6, "23 h 59 min"],
    ])("keeps %d minutes short as %s", (minutes, text) => {
      expect(formatDurationSpan(minutes)).toBe(text);
    });

    it.each([
      [DAY, "1 day"],
      [DAY + 1, "1 day, 1 minute"],
      [DAY + HOUR, "1 day, 1 hour"],
      [6 * DAY, "6 days"],
      [7 * DAY, "1 week"],
      [7 * DAY + 2 * HOUR + 5, "1 week, 2 hours, 5 minutes"],
      [29 * DAY, "4 weeks, 1 day"],
      [30 * DAY, "1 month"],
      [31 * DAY, "1 month, 1 day"],
      [364 * DAY, "12 months, 4 days"],
      [365 * DAY, "1 year"],
      [366 * DAY, "1 year, 1 day"],
      [100_000, "2 months, 1 week, 2 days, 10 hours, 40 minutes"],
    ])("writes %d minutes as %s", (minutes, text) => {
      expect(formatDurationSpan(minutes)).toBe(text);
    });

    it("writes 78,512 h 23 min as years down to minutes", () => {
      expect(formatDurationSpan(78_512 * HOUR + 23)).toBe(
        "8 years, 11 months, 3 weeks, 8 hours, 23 minutes",
      );
    });

    it("writes the years with a thousands separator", () => {
      expect(formatDurationSpan(1234 * 365 * DAY)).toBe("1,234 years");
      expect(formatDurationSpan(10 * 365 * DAY + 3 * DAY)).toBe(
        "10 years, 3 days",
      );
    });

    it("rounds fractional minutes and carries into the next unit", () => {
      expect(formatDurationSpan(DAY + 59.6)).toBe("1 day, 1 hour");
    });

    it("writes a negative duration without its sign", () => {
      expect(formatDurationSpan(-(DAY + HOUR))).toBe("1 day, 1 hour");
    });

    it("limits the units to the first few", () => {
      expect(formatDurationSpan(78_512 * HOUR + 23, { maxUnits: 2 })).toBe(
        "8 years, 11 months",
      );
      expect(formatDurationSpan(200, { maxUnits: 1 })).toBe("3 h");
    });

    it("abbreviates a compact span to its first three units", () => {
      expect(formatDurationSpan(78_512 * HOUR + 23, { compact: true })).toBe(
        "8 y 11 mo 3 w",
      );
      expect(formatDurationSpan(DAY + HOUR, { compact: true })).toBe("1 d 1 h");
      expect(formatDurationSpan(200, { compact: true })).toBe("3 h 20 min");
      expect(formatDurationSpan(0, { compact: true })).toBe("0 min");
    });

    it("lets a compact span take its own limit", () => {
      expect(
        formatDurationSpan(78_512 * HOUR + 23, { compact: true, maxUnits: 5 }),
      ).toBe("8 y 11 mo 3 w 8 h 23 min");
    });
  });

  describe(formatHoursSpan, () => {
    it.each([
      [0, "0.0 h"],
      [12.5, "12.5 h"],
      [23.5, "23.5 h"],
    ])("keeps %d hours below a day as %s", (hours, text) => {
      expect(formatHoursSpan(hours)).toBe(text);
    });

    it("writes a day or more as a span", () => {
      expect(formatHoursSpan(24)).toBe("1 day");
      expect(formatHoursSpan(78_512.4)).toBe(
        "8 years, 11 months, 3 weeks, 8 hours, 24 minutes",
      );
      expect(formatHoursSpan(78_512.4, { compact: true })).toBe(
        "8 y 11 mo 3 w",
      );
    });
  });
});
