import { describe, expect, it } from "vitest";

import { getMetric } from "../../../../../../testing/metrics/metric-catalog";

import { formatMetricValueCompact } from "./calendar-metrics-compact.utilities";

const MINUTE = 1;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("calendar-metrics compact utilities", () => {
  describe(formatMetricValueCompact, () => {
    it("abbreviates a long duration to its three leading units", () => {
      const minutes = 365 * DAY + 30 * DAY + 3 * DAY + 12 * HOUR + 14 * MINUTE;

      expect(formatMetricValueCompact(getMetric("duration"), minutes)).toBe(
        "1 y 1 mo 3 d",
      );
    });

    it("abbreviates a short duration", () => {
      expect(
        formatMetricValueCompact(getMetric("duration"), 200 * MINUTE),
      ).toBe("3 h 20 min");
    });

    it("abbreviates every duration metric alike, by its unit", () => {
      expect(formatMetricValueCompact(getMetric("duration"), 50 * HOUR)).toBe(
        "2 d 2 h",
      );
      expect(formatMetricValueCompact(getMetric("duration"), 1.5 * HOUR)).toBe(
        "1 h 30 min",
      );
    });

    it("leaves counts, shares, instants and unknowns as they are written", () => {
      expect(formatMetricValueCompact(getMetric("events"), 1234)).toBe("1,234");
      expect(formatMetricValueCompact(getMetric("events"), null)).toBe("–");
      expect(
        formatMetricValueCompact(getMetric("covered-percent"), 12.34),
      ).toBe("12.3%");
      expect(
        formatMetricValueCompact(
          getMetric("first-start"),
          1_772_366_400_000,
          "UTC",
        ),
      ).toContain("2026");
    });
  });
});
