import { describe, expect, it } from "vitest";

import {
  createChartBar,
  createChartSegment,
} from "../../../../testing/chart-bars";

import {
  buildChartAxis,
  findChartMaximum,
  formatChartTick,
} from "./calendar-charts-axis.utilities";

const MINUTES = {
  day: 1440,
  hour: 60,
  month: 43_200,
  week: 10_080,
  year: 525_600,
};

describe("calendar charts axis utilities", () => {
  describe(buildChartAxis, () => {
    it("runs from none to a hundred for a share", () => {
      expect(buildChartAxis("COVERED_PERCENT", 40)).toStrictEqual({
        domain: [0, 100],
        ticks: undefined,
        unit: undefined,
      });
    });

    it("runs from none to the biggest value for a count", () => {
      expect(buildChartAxis("EVENTS", 40)).toStrictEqual({
        domain: [0, "auto"],
        ticks: undefined,
        unit: undefined,
      });
    });

    it("lands a few minutes' ticks on whole minutes", () => {
      const { ticks, unit } = buildChartAxis("TOTAL_DURATION_MINUTES", 8);

      expect(unit?.label).toBe("min");
      expect(ticks).toStrictEqual([0, 2, 4, 6, 8]);
    });

    it("lands hours' ticks on whole hours", () => {
      const { domain, ticks, unit } = buildChartAxis(
        "TOTAL_DURATION_MINUTES",
        5 * MINUTES.hour,
      );

      expect(unit?.label).toBe("h");
      expect(ticks?.every((tick) => tick % MINUTES.hour === 0)).toBe(true);
      expect(domain[1]).toBeGreaterThanOrEqual(5 * MINUTES.hour);
    });

    it.each([
      ["d", 3 * MINUTES.day, [0, 1, 2, 3].map((n) => n * MINUTES.day)],
      ["wk", 3 * MINUTES.week, [0, 1, 2, 3].map((n) => n * MINUTES.week)],
      ["mo", 4 * MINUTES.month, [0, 1, 2, 3, 4].map((n) => n * MINUTES.month)],
      ["yr", 2 * MINUTES.year, [0, 1, 2].map((n) => n * MINUTES.year)],
    ])("picks %s from a maximum of that many", (label, maximum, ticks) => {
      const axis = buildChartAxis("TOTAL_DURATION_MINUTES", maximum);

      expect(axis.unit?.label).toBe(label);
      expect(axis.ticks?.slice(0, ticks.length)).toStrictEqual(ticks);
      expect(axis.domain[1]).toBeGreaterThanOrEqual(maximum);
    });

    it("keeps a larger maximum's ticks few and whole", () => {
      const { ticks, unit } = buildChartAxis(
        "TOTAL_DURATION_MINUTES",
        120 * MINUTES.day,
      );

      expect(unit?.label).toBe("mo");
      expect(ticks).toStrictEqual(
        [0, 1, 2, 3, 4].map((n) => n * MINUTES.month),
      );
    });

    it("counts a metric of hours in hours, and a zero in one gap", () => {
      const hours = buildChartAxis("PROGRESSIVE_HOURS", 3);

      expect(hours.unit?.label).toBe("h");
      expect(hours.ticks).toStrictEqual([0, 1, 2, 3]);
      expect(buildChartAxis("TOTAL_DURATION_MINUTES", 0).ticks).toStrictEqual([
        0, 1,
      ]);
    });
  });

  describe(findChartMaximum, () => {
    it("is the biggest stack or previous value, and none without bars", () => {
      expect(findChartMaximum([])).toBe(0);
      expect(findChartMaximum([createChartBar()])).toBe(6);
      expect(
        findChartMaximum([
          createChartBar(),
          createChartBar({ previous: 9, segments: [createChartSegment()] }),
        ]),
      ).toBe(9);
    });
  });

  describe(formatChartTick, () => {
    it("writes counts short and shares as percents", () => {
      expect(formatChartTick("EVENTS", 1200)).toBe("1.2K");
      expect(formatChartTick("COVERED_PERCENT", 50)).toBe("50%");
    });

    it("writes a duration in the axis's unit", () => {
      const unit = { label: "d", minutes: MINUTES.day };

      expect(
        formatChartTick("TOTAL_DURATION_MINUTES", 2 * MINUTES.day, unit),
      ).toBe("2 d");
      expect(
        formatChartTick("PROGRESSIVE_HOURS", 48, {
          label: "d",
          minutes: MINUTES.day,
        }),
      ).toBe("2 d");
      expect(
        formatChartTick("TOTAL_DURATION_MINUTES", 3 * MINUTES.week, {
          label: "wk",
          minutes: MINUTES.week,
        }),
      ).toBe("3 wk");
    });
  });
});
