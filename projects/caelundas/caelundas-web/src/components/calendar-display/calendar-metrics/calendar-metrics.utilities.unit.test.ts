import { describe, expect, it } from "vitest";

import {
  ALL_METRICS,
  DEFAULT_METRICS,
  METRIC_BRANCHES,
  METRIC_CATALOG,
} from "./calendar-metrics.constants";
import {
  findMetricValue,
  formatDuration,
  formatMetricChange,
  formatMetricValue,
  getMetricOptions,
  isAdditiveMetric,
  isInstantMetric,
  listChartMetrics,
  parseMetrics,
  resolveMetrics,
} from "./calendar-metrics.utilities";

import type { EventMetric } from "../../../graphql/generated/operations";

describe("calendar-metrics utilities", () => {
  describe(formatDuration, () => {
    it.each([
      [0, "0 min"],
      [45, "45 min"],
      [60, "1 h"],
      [200, "3 h 20 min"],
      [200.4, "3 h 20 min"],
      [100_000, "2 months, 1 week, 2 days, 10 hours, 40 minutes"],
    ])("writes %d minutes as %s", (minutes, text) => {
      expect(formatDuration(minutes)).toBe(text);
    });

    it("abbreviates a compact duration", () => {
      expect(formatDuration(100_000, { compact: true })).toBe("2 mo 1 w 2 d");
    });
  });

  describe(formatMetricValue, () => {
    it("writes a count with a thousands separator", () => {
      expect(formatMetricValue("EVENTS", 12_345)).toBe("12,345");
    });

    it("writes a duration as hours and minutes", () => {
      expect(formatMetricValue("TOTAL_DURATION_MINUTES", 200)).toBe(
        "3 h 20 min",
      );
    });

    it("writes hours with one decimal below a day", () => {
      expect(formatMetricValue("PROGRESSIVE_HOURS", 12.34)).toBe("12.3 h");
    });

    it("writes a day or more of hours as a span", () => {
      expect(formatMetricValue("PROGRESSIVE_HOURS", 123.44)).toBe(
        "5 days, 3 hours, 26 minutes",
      );
    });

    it("writes a share of time as a percent with one decimal", () => {
      expect(formatMetricValue("COVERED_PERCENT", 12.34)).toBe("12.3%");
      expect(formatMetricValue("TOTAL_TIME_PERCENT", 150)).toBe("150.0%");
      expect(formatMetricValue("PROGRESSIVE_COVERED_PERCENT", 0)).toBe("0.0%");
      expect(formatMetricValue("PROGRESSIVE_TOTAL_PERCENT", null)).toBe("–");
    });

    it("writes a start in the zone, as a date and a time", () => {
      const start = Date.UTC(2026, 2, 5, 15, 40);
      // Newer ICU data puts a narrow no-break space before the meridiem.
      const read = (
        metric: "FIRST_START" | "LAST_START",
        zone: string,
      ): string => formatMetricValue(metric, start, zone).replaceAll(" ", " ");

      expect(read("FIRST_START", "UTC")).toBe("Mar 5, 2026, 3:40 PM");
      expect(read("FIRST_START", "America/New_York")).toBe(
        "Mar 5, 2026, 10:40 AM",
      );
      // The zone's format is kept for the next.
      expect(read("LAST_START", "America/New_York")).toBe(
        "Mar 5, 2026, 10:40 AM",
      );
    });

    it("writes UTC when no zone is given", () => {
      expect(
        formatMetricValue("LAST_START", Date.UTC(2026, 0, 1, 0, 5)).replaceAll(
          " ",
          " ",
        ),
      ).toBe("Jan 1, 2026, 12:05 AM");
    });

    it("writes a dash for a value it does not have", () => {
      expect(formatMetricValue("MEDIAN_DURATION_MINUTES", null)).toBe("–");
    });
  });

  describe(formatMetricChange, () => {
    it("says nothing without a previous value", () => {
      expect(formatMetricChange("EVENTS", 5, null)).toStrictEqual({
        direction: "flat",
        percent: null,
        percentText: "",
        text: "",
      });
    });

    it("writes a rise of a count in its units, with its percent", () => {
      expect(formatMetricChange("EVENTS", 112, 100)).toStrictEqual({
        direction: "up",
        percent: 12,
        percentText: "+12%",
        text: "+12 events",
      });
    });

    it("writes a fall to one, in the singular", () => {
      expect(formatMetricChange("UNIQUE_NAMES", 9, 10)).toStrictEqual({
        direction: "down",
        percent: -10,
        percentText: "-10%",
        text: "-1 name",
      });
    });

    it("rounds a percent to one decimal", () => {
      expect(formatMetricChange("EVENTS", 1031, 1000).percentText).toBe(
        "+3.1%",
      );
    });

    it("reads a missing value as none", () => {
      expect(formatMetricChange("EVENTS", null, 4)).toStrictEqual({
        direction: "down",
        percent: -100,
        percentText: "-100%",
        text: "-4 events",
      });
    });

    it("has no percent from a previous value of none", () => {
      expect(formatMetricChange("DAYS_WITH_EVENTS", 3, 0)).toStrictEqual({
        direction: "up",
        percent: null,
        percentText: "",
        text: "+3 days",
      });
    });

    it("writes a change of duration in hours and minutes", () => {
      expect(formatMetricChange("TOTAL_DURATION_MINUTES", 500, 300).text).toBe(
        "+3 h 20 min",
      );
    });

    it("writes a long change compactly, with its sign", () => {
      expect(
        formatMetricChange("TOTAL_DURATION_MINUTES", 100_000, 0).text,
      ).toBe("+2 mo 1 w 2 d");
      expect(formatMetricChange("PROGRESSIVE_HOURS", 0, 78_512.4).text).toBe(
        "-8 y 11 mo 3 w",
      );
    });

    it("writes a change of hours with a decimal", () => {
      expect(formatMetricChange("PROGRESSIVE_HOURS", 10, 12.5).text).toBe(
        "-2.5 h",
      );
    });

    it("writes a change of a share in points", () => {
      expect(formatMetricChange("COVERED_PERCENT", 12.5, 10).text).toBe(
        "+2.5 pts",
      );
    });

    it("keeps every share of time out of the additive metrics", () => {
      const shares: EventMetric[] = [
        "COVERED_PERCENT",
        "TOTAL_TIME_PERCENT",
        "PROGRESSIVE_COVERED_PERCENT",
        "PROGRESSIVE_TOTAL_PERCENT",
      ];

      expect(
        shares.map((metric) => METRIC_CATALOG[metric].additive),
      ).toStrictEqual([false, false, false, false]);
    });

    it("writes a change of a start as the time it moved", () => {
      const day = 24 * 60 * 60_000;

      expect(formatMetricChange("FIRST_START", day * 2, day).text).toBe("+1 d");
    });

    it("calls a number that did not move flat", () => {
      expect(formatMetricChange("EVENTS", 7, 7)).toStrictEqual({
        direction: "flat",
        percent: 0,
        percentText: "0%",
        text: "No change",
      });
    });

    it("calls none against none flat with no percent", () => {
      expect(formatMetricChange("EVENTS", 0, 0)).toStrictEqual({
        direction: "flat",
        percent: null,
        percentText: "",
        text: "No change",
      });
    });

    it("leaves out a percent that rounds to none", () => {
      expect(formatMetricChange("EVENTS", 100_001, 100_000).percentText).toBe(
        "",
      );
    });
  });

  describe(findMetricValue, () => {
    it("finds the value of the metric, or nothing", () => {
      const values = [{ metric: "EVENTS", previous: null, value: 4 }] as const;

      expect(findMetricValue(values, "EVENTS")?.value).toBe(4);
      expect(findMetricValue(values, "SPANS")).toBeUndefined();
    });
  });

  describe(getMetricOptions, () => {
    it("nests every metric once under its branch", () => {
      const options = getMetricOptions();

      expect(options.map((option) => option.value)).toStrictEqual(
        METRIC_BRANCHES.map((branch) => branch.value),
      );
      expect(
        options.flatMap((option) =>
          (option.children ?? []).map((child) => child.value),
        ),
      ).toStrictEqual(METRIC_BRANCHES.flatMap((branch) => [...branch.metrics]));
    });

    it("leaves the dates out of the Charts' options, and their branch", () => {
      const options = getMetricOptions("charts");
      const values = options.flatMap((option) =>
        (option.children ?? []).map((child) => child.value),
      );

      expect(values).not.toContain("FIRST_START");
      expect(values).not.toContain("LAST_START");
      expect(options.map((option) => option.value)).not.toContain(
        "branch:times",
      );
      expect(getMetricOptions("totals")).toHaveLength(METRIC_BRANCHES.length);
    });

    it("gives each metric its label and note", () => {
      const [counts] = getMetricOptions();
      const [events] = counts?.children ?? [];

      expect(events?.label).toBe("Events");
      expect(events?.description).toBe(METRIC_CATALOG.EVENTS.description);
    });
  });

  describe(isAdditiveMetric, () => {
    it("adds up counts of events and durations, but not distinct counts", () => {
      expect(
        ALL_METRICS.filter((metric) => isAdditiveMetric(metric)),
      ).toStrictEqual([
        "EVENTS",
        "INSTANTS",
        "SPANS",
        "TOTAL_DURATION_MINUTES",
        "PROGRESSIVE_HOURS",
      ]);
    });
  });

  describe(parseMetrics, () => {
    it("reads a list and a lone name", () => {
      expect(parseMetrics(["SPANS", "EVENTS"])).toStrictEqual([
        "SPANS",
        "EVENTS",
      ]);
      expect(parseMetrics("EVENTS")).toStrictEqual(["EVENTS"]);
    });

    it("drops names it does not know, and repeats", () => {
      expect(parseMetrics(["EVENTS", "STALE", 3, "EVENTS"])).toStrictEqual([
        "EVENTS",
      ]);
    });

    it("reads nothing as nothing", () => {
      expect(parseMetrics(["STALE"])).toBeUndefined();
      expect(parseMetrics(undefined)).toBeUndefined();
      expect(parseMetrics([])).toBeUndefined();
    });
  });

  describe(isInstantMetric, () => {
    it("tells a date from a duration and a count", () => {
      expect(isInstantMetric("FIRST_START")).toBe(true);
      expect(isInstantMetric("TOTAL_DURATION_MINUTES")).toBe(false);
      expect(isInstantMetric("EVENTS")).toBe(false);
    });
  });

  describe(listChartMetrics, () => {
    it("drops the dates and keeps the rest in order", () => {
      expect(
        listChartMetrics(["FIRST_START", "SPANS", "LAST_START", "EVENTS"]),
      ).toStrictEqual(["SPANS", "EVENTS"]);
    });

    it("falls back to the Charts' defaults when only dates are left", () => {
      expect(listChartMetrics(["FIRST_START"])).toBe(DEFAULT_METRICS.charts);
    });
  });

  describe(resolveMetrics, () => {
    it("drops the dates from the Charts' metrics, not the Totals'", () => {
      expect(resolveMetrics("charts", ["FIRST_START", "SPANS"])).toStrictEqual([
        "SPANS",
      ]);
      expect(resolveMetrics("totals", ["FIRST_START"])).toStrictEqual([
        "FIRST_START",
      ]);
    });

    it("keeps the link's metrics", () => {
      expect(resolveMetrics("totals", ["SPANS"])).toStrictEqual(["SPANS"]);
    });

    it("falls back to the layout's defaults", () => {
      expect(resolveMetrics("charts", undefined)).toBe(DEFAULT_METRICS.charts);
      expect(resolveMetrics("totals", [])).toBe(DEFAULT_METRICS.totals);
    });

    it("falls back to the charts' defaults for any other layout", () => {
      expect(resolveMetrics("table", undefined)).toBe(DEFAULT_METRICS.charts);
      expect(resolveMetrics(undefined, undefined)).toBe(DEFAULT_METRICS.charts);
    });
  });
});
