import { describe, expect, it } from "vitest";

import { formatMetricValueCompact } from "./calendar-metrics-compact.utilities";

const HOUR = 60;
const DAY = 24 * HOUR;

describe("calendar-metrics compact utilities", () => {
  describe(formatMetricValueCompact, () => {
    it("abbreviates a long duration to its three leading units", () => {
      const minutes = 365 * DAY + 30 * DAY + 3 * DAY + 12 * HOUR + 14;

      expect(formatMetricValueCompact("TOTAL_DURATION_MINUTES", minutes)).toBe(
        "1 y 1 mo 3 d",
      );
    });

    it("abbreviates a short duration", () => {
      expect(formatMetricValueCompact("TOTAL_DURATION_MINUTES", 200)).toBe(
        "3 h 20 min",
      );
    });

    it("abbreviates hours from a day up and keeps fewer as hours", () => {
      expect(formatMetricValueCompact("PROGRESSIVE_HOURS", 50)).toBe("2 d 2 h");
      expect(formatMetricValueCompact("PROGRESSIVE_HOURS", 1.5)).toBe("1.5 h");
    });

    it("leaves counts, instants and unknowns as they are written", () => {
      expect(formatMetricValueCompact("EVENTS", 1234)).toBe("1,234");
      expect(formatMetricValueCompact("EVENTS", null)).toBe("–");
      expect(
        formatMetricValueCompact("FIRST_START", 1_772_366_400_000, "UTC"),
      ).toContain("2026");
    });
  });
});
