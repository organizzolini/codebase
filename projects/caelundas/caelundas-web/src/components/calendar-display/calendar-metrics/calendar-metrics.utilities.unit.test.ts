import { describe, expect, it } from "vitest";

import { CATALOG, getMetric } from "../../../../testing/metrics/metric-catalog";

import {
  METRIC_BRANCHES,
  OLD_METRIC_ALIASES,
} from "./calendar-metrics.constants";
import {
  findMetricValue,
  formatMetricChange,
  formatMetricValue,
  getMetricOptions,
  isInstantMetric,
  listChartMetrics,
  parseMetrics,
  resolveMetrics,
  toMetricSlug,
} from "./calendar-metrics.utilities";
import { EMPTY_CATALOG } from "./components/metric-catalog-provider/metric-catalog-provider.constants";

const MINUTE = 1;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("calendar-metrics utilities", () => {
  describe(formatMetricValue, () => {
    it("writes a count with a thousands separator", () => {
      expect(formatMetricValue(getMetric("events"), 12_345)).toBe("12,345");
    });

    it("writes a duration, in minutes, as hours and minutes", () => {
      expect(formatMetricValue(getMetric("duration"), 200 * MINUTE)).toBe(
        "3 h 20 min",
      );
    });

    it("writes a long duration as a span of years down to minutes", () => {
      expect(formatMetricValue(getMetric("duration"), 123.44 * HOUR)).toBe(
        "5 days, 3 hours, 26 minutes",
      );
    });

    it("writes every duration metric the same way, by its unit", () => {
      const durations = CATALOG.metrics.filter(
        (metric) => metric.unit === "DURATION",
      );

      expect(durations).toHaveLength(6);

      for (const metric of durations) {
        expect(formatMetricValue(metric, DAY + HOUR)).toBe("1 day, 1 hour");
      }
    });

    it("writes a share of time as a percent with one decimal", () => {
      expect(formatMetricValue(getMetric("covered-percent"), 12.34)).toBe(
        "12.3%",
      );
      expect(formatMetricValue(getMetric("total-time-percent"), 150)).toBe(
        "150.0%",
      );
      expect(
        formatMetricValue(getMetric("progressive-covered-percent"), 0),
      ).toBe("0.0%");
      expect(
        formatMetricValue(getMetric("progressive-total-percent"), null),
      ).toBe("–");
    });

    it("writes a start in the zone, as a date and a time", () => {
      const start = Date.UTC(2026, 2, 5, 15, 40);
      // Newer ICU data puts a narrow no-break space before the meridiem.
      const read = (slug: "first-start" | "last-start", zone: string): string =>
        formatMetricValue(getMetric(slug), start, zone).replaceAll(" ", " ");

      expect(read("first-start", "UTC")).toBe("Mar 5, 2026, 3:40 PM");
      expect(read("first-start", "America/New_York")).toBe(
        "Mar 5, 2026, 10:40 AM",
      );
      // The zone's format is kept for the next.
      expect(read("last-start", "America/New_York")).toBe(
        "Mar 5, 2026, 10:40 AM",
      );
    });

    it("writes UTC when no zone is given", () => {
      expect(
        formatMetricValue(
          getMetric("last-start"),
          Date.UTC(2026, 0, 1, 0, 5),
        ).replaceAll(" ", " "),
      ).toBe("Jan 1, 2026, 12:05 AM");
    });

    it("writes a dash for a value it does not have", () => {
      expect(formatMetricValue(getMetric("median-duration"), null)).toBe("–");
    });
  });

  describe(formatMetricChange, () => {
    it("says nothing without a previous value", () => {
      expect(formatMetricChange(getMetric("events"), 5, null)).toStrictEqual({
        direction: "flat",
        percent: null,
        percentText: "",
        text: "",
      });
    });

    it("writes a rise of a count in its noun, with its percent", () => {
      expect(formatMetricChange(getMetric("events"), 112, 100)).toStrictEqual({
        direction: "up",
        percent: 12,
        percentText: "+12%",
        text: "+12 events",
      });
    });

    it("writes a fall to one, in the singular", () => {
      expect(
        formatMetricChange(getMetric("unique-names"), 9, 10),
      ).toStrictEqual({
        direction: "down",
        percent: -10,
        percentText: "-10%",
        text: "-1 unique name",
      });
    });

    it("names a count by the metric's name, singular for one, word by word", () => {
      expect(formatMetricChange(getMetric("days-with-events"), 4, 3).text).toBe(
        "+1 day with event",
      );
      expect(formatMetricChange(getMetric("unique-tags"), 7, 5).text).toBe(
        "+2 unique tags",
      );
    });

    it("rounds a percent to one decimal", () => {
      expect(
        formatMetricChange(getMetric("events"), 1031, 1000).percentText,
      ).toBe("+3.1%");
    });

    it("reads a missing value as none", () => {
      expect(formatMetricChange(getMetric("events"), null, 4)).toStrictEqual({
        direction: "down",
        percent: -100,
        percentText: "-100%",
        text: "-4 events",
      });
    });

    it("has no percent from a previous value of none", () => {
      expect(
        formatMetricChange(getMetric("days-with-events"), 3, 0),
      ).toStrictEqual({
        direction: "up",
        percent: null,
        percentText: "",
        text: "+3 days with events",
      });
    });

    it("writes a change of duration in hours and minutes", () => {
      expect(
        formatMetricChange(getMetric("duration"), 500 * MINUTE, 300 * MINUTE)
          .text,
      ).toBe("+3 h 20 min");
    });

    it("writes a long change compactly, with its sign", () => {
      expect(
        formatMetricChange(getMetric("duration"), 100_000 * MINUTE, 0).text,
      ).toBe("+2 mo 1 w 2 d");
      expect(
        formatMetricChange(getMetric("duration"), 0, 78_512.4 * HOUR).text,
      ).toBe("-8 y 11 mo 3 w");
    });

    it("writes a change of a share in points", () => {
      expect(
        formatMetricChange(getMetric("covered-percent"), 12.5, 10).text,
      ).toBe("+2.5 pts");
    });

    it("keeps every share of time out of the additive metrics", () => {
      expect(
        CATALOG.metrics
          .filter((metric) => metric.unit === "NONE")
          .map((metric) => metric.additive),
      ).toStrictEqual([false, false, false, false]);
    });

    it("writes a change of a start, in milliseconds, as the time it moved", () => {
      expect(
        formatMetricChange(
          getMetric("first-start"),
          2 * DAY * 60_000,
          DAY * 60_000,
        ).text,
      ).toBe("+1 d");
    });

    it("calls a number that did not move flat", () => {
      expect(formatMetricChange(getMetric("events"), 7, 7)).toStrictEqual({
        direction: "flat",
        percent: 0,
        percentText: "0%",
        text: "No change",
      });
    });

    it("calls none against none flat with no percent", () => {
      expect(formatMetricChange(getMetric("events"), 0, 0)).toStrictEqual({
        direction: "flat",
        percent: null,
        percentText: "",
        text: "No change",
      });
    });

    it("leaves out a percent that rounds to none", () => {
      expect(
        formatMetricChange(getMetric("events"), 100_001, 100_000).percentText,
      ).toBe("");
    });
  });

  describe(findMetricValue, () => {
    it("finds the value of the metric, or nothing", () => {
      const values = [{ metric: "events", previous: null, value: 4 }] as const;

      expect(findMetricValue(values, "events")?.value).toBe(4);
      expect(findMetricValue(values, "progressive-events")).toBeUndefined();
    });
  });

  describe(getMetricOptions, () => {
    it("nests every metric once under the branch of its unit, by position", () => {
      const options = getMetricOptions(CATALOG);

      expect(options.map((option) => option.value)).toStrictEqual(
        METRIC_BRANCHES.map((branch) => branch.value),
      );
      expect(
        options.flatMap((option) =>
          (option.children ?? []).map((child) => child.value),
        ),
      ).toStrictEqual(
        METRIC_BRANCHES.flatMap((branch) =>
          CATALOG.metrics
            .filter((metric) => metric.unit === branch.unit)
            .map((metric) => metric.slug),
        ),
      );
    });

    it("leaves the dates out of the Charts' options, and their branch", () => {
      const options = getMetricOptions(CATALOG, "charts");
      const values = options.flatMap((option) =>
        (option.children ?? []).map((child) => child.value),
      );

      expect(values).not.toContain("first-start");
      expect(values).not.toContain("last-start");
      expect(options.map((option) => option.value)).not.toContain(
        "branch:times",
      );
      expect(getMetricOptions(CATALOG, "totals")).toHaveLength(
        METRIC_BRANCHES.length,
      );
    });

    it("gives each metric its name and note from the catalog", () => {
      const [counts] = getMetricOptions(CATALOG);
      const [events] = counts?.children ?? [];

      expect(events?.label).toBe("Events");
      expect(events?.description).toBe(getMetric("events").note);
    });

    it("offers nothing until the catalog is read", () => {
      expect(getMetricOptions(EMPTY_CATALOG)).toStrictEqual([]);
    });
  });

  describe(parseMetrics, () => {
    it("reads a list and a lone slug", () => {
      expect(parseMetrics(["progressive-events", "events"])).toStrictEqual([
        "progressive-events",
        "events",
      ]);
      expect(parseMetrics("events")).toStrictEqual(["events"]);
    });

    it("reads an old name as its slug", () => {
      expect(parseMetrics("TOTAL_DURATION_MINUTES")).toStrictEqual([
        "duration",
      ]);
      expect(parseMetrics(["PROGRESSIVE_HOURS", "events"])).toStrictEqual([
        "duration",
        "events",
      ]);
      expect(parseMetrics(["total-duration", "spans"])).toStrictEqual([
        "duration",
        "progressive-events",
      ]);
    });

    it("maps every old name to a slug of the catalog", () => {
      expect(Object.keys(OLD_METRIC_ALIASES)).toHaveLength(23);

      for (const slug of Object.values(OLD_METRIC_ALIASES)) {
        expect(CATALOG.bySlug.has(slug)).toBe(true);
      }
    });

    it("drops what is no slug, and repeats, even under another name", () => {
      expect(
        parseMetrics(["events", "STALE", 3, "EVENTS", "events"]),
      ).toStrictEqual(["events"]);
    });

    it("reads nothing as nothing", () => {
      expect(parseMetrics(["STALE"])).toBeUndefined();
      expect(parseMetrics(undefined)).toBeUndefined();
      expect(parseMetrics([])).toBeUndefined();
    });
  });

  describe(toMetricSlug, () => {
    it("keeps a slug, maps an old name, and forgets anything else", () => {
      expect(toMetricSlug("unique-names")).toBe("unique-names");
      expect(toMetricSlug("UNIQUE_NAMES")).toBe("unique-names");
      expect(toMetricSlug("Not A Slug")).toBeUndefined();
      expect(toMetricSlug("constructor")).toBe("constructor");
      expect(toMetricSlug("toString")).toBeUndefined();
      expect(toMetricSlug(7)).toBeUndefined();
      expect(toMetricSlug("")).toBeUndefined();
    });
  });

  describe(isInstantMetric, () => {
    it("tells a date from a duration and a count", () => {
      expect(isInstantMetric(getMetric("first-start"))).toBe(true);
      expect(isInstantMetric(getMetric("duration"))).toBe(false);
      expect(isInstantMetric(getMetric("events"))).toBe(false);
      expect(isInstantMetric(undefined)).toBe(false);
    });
  });

  describe(listChartMetrics, () => {
    it("drops the dates and keeps the rest in order", () => {
      expect(
        listChartMetrics(CATALOG, [
          "first-start",
          "progressive-events",
          "last-start",
          "events",
        ]),
      ).toStrictEqual(["progressive-events", "events"]);
    });

    it("keeps the metrics as given when there is no date among them", () => {
      const slugs = ["progressive-events", "events"];

      expect(listChartMetrics(CATALOG, slugs)).toBe(slugs);
    });

    it("falls back to the Charts' defaults when only dates are left", () => {
      expect(listChartMetrics(CATALOG, ["first-start"])).toBe(
        CATALOG.defaults.charts,
      );
    });
  });

  describe(resolveMetrics, () => {
    it("drops the dates from the Charts' metrics, not the Totals'", () => {
      expect(
        resolveMetrics(CATALOG, "charts", [
          "first-start",
          "progressive-events",
        ]),
      ).toStrictEqual(["progressive-events"]);
      expect(resolveMetrics(CATALOG, "totals", ["first-start"])).toStrictEqual([
        "first-start",
      ]);
    });

    it("keeps the link's metrics the catalog knows, and drops the rest", () => {
      expect(
        resolveMetrics(CATALOG, "totals", [
          "progressive-events",
          "unknown-slug",
        ]),
      ).toStrictEqual(["progressive-events"]);
    });

    it("falls back to the layout's defaults", () => {
      expect(resolveMetrics(CATALOG, "charts", undefined)).toBe(
        CATALOG.defaults.charts,
      );
      expect(resolveMetrics(CATALOG, "totals", [])).toBe(
        CATALOG.defaults.totals,
      );
      expect(resolveMetrics(CATALOG, "totals", ["unknown-slug"])).toBe(
        CATALOG.defaults.totals,
      );
    });

    it("falls back to the charts' defaults for any other layout", () => {
      expect(resolveMetrics(CATALOG, "table", undefined)).toBe(
        CATALOG.defaults.charts,
      );
      expect(resolveMetrics(CATALOG, undefined, undefined)).toBe(
        CATALOG.defaults.charts,
      );
    });

    it("resolves to none until the catalog is read", () => {
      expect(
        resolveMetrics(EMPTY_CATALOG, "totals", ["progressive-events"]),
      ).toStrictEqual([]);
    });
  });
});
