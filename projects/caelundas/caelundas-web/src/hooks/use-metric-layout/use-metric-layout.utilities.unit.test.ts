import { describe, expect, it } from "vitest";

import {
  addEventsMetric,
  addSortMetrics,
  hideEmptyMetricGroups,
  keepShownTotals,
  listReadMetrics,
} from "./use-metric-layout.utilities";

import type {
  EventMetricsData,
  MetricGroup,
} from "../../components/calendar-display/calendar-metrics/calendar-metrics.types";

describe("use-metric-layout utilities", () => {
  describe(addSortMetrics, () => {
    it("reads the metrics a sort orders by that are not shown", () => {
      expect(
        addSortMetrics(
          ["unique-names"],
          [
            { direction: "desc", key: "count" },
            { direction: "asc", key: "first" },
            { direction: "asc", key: "metric", metric: "duration" },
            { direction: "asc", key: "name" },
          ],
        ),
      ).toStrictEqual(["unique-names", "events", "first-start", "duration"]);
    });

    it("keeps the same list when every sort metric is shown or there are none", () => {
      const metrics = ["events"];

      expect(addSortMetrics(metrics, undefined)).toBe(metrics);
      expect(
        addSortMetrics(metrics, [{ direction: "asc", key: "count" }]),
      ).toBe(metrics);
    });
  });

  describe(keepShownTotals, () => {
    const data: EventMetricsData = {
      groups: [],
      timezone: "UTC",
      total: [
        { metric: "events", previous: null, value: 1 },
        { metric: "progressive-events", previous: null, value: 2 },
      ],
    };

    it("drops the totals of metrics read only to sort by", () => {
      expect(keepShownTotals(data, ["progressive-events"]).total).toStrictEqual(
        [{ metric: "progressive-events", previous: null, value: 2 }],
      );
    });

    it("returns the answer itself when every total is shown", () => {
      expect(keepShownTotals(data, ["events", "progressive-events"])).toBe(
        data,
      );
    });
  });

  describe(addEventsMetric, () => {
    it("reads the event count too when empty groups are hidden and it is not shown", () => {
      expect(addEventsMetric(["duration"], true)).toStrictEqual([
        "duration",
        "events",
      ]);
    });

    it("keeps the same list when they are shown or the count already is", () => {
      const metrics = ["events", "progressive-events"];

      expect(addEventsMetric(metrics, true)).toBe(metrics);
      expect(addEventsMetric(["progressive-events"], false)).toStrictEqual([
        "progressive-events",
      ]);
    });
  });

  describe(hideEmptyMetricGroups, () => {
    /**
     * A group with a count of events and a duration, and its subgroups.
     */
    function group(
      id: string,
      events: null | number,
      children?: MetricGroup[],
    ): MetricGroup {
      return {
        ...(children === undefined ? {} : { children }),
        id,
        key: id,
        label: id,
        level: 0,
        path: null,
        rank: null,
        values: [
          { metric: "duration", previous: null, value: 0 },
          { metric: "events", previous: 5, value: events },
        ],
      };
    }

    it("leaves out the groups with no events, whatever their other values or previous period", () => {
      const kept = hideEmptyMetricGroups([
        group("some", 2),
        group("none", 0),
        group("unknown", null),
      ]);

      expect(kept.map((one) => one.id)).toStrictEqual(["some"]);
    });

    it("leaves out a group with only empty subgroups, and keeps one with a subgroup that has events", () => {
      const kept = hideEmptyMetricGroups([
        group("hollow", 0, [group("a", 0), group("b", 0)]),
        group("parent", 0, [group("empty", 0), group("full", 3)]),
      ]);

      expect(kept.map((one) => one.id)).toStrictEqual(["parent"]);
      expect(kept[0]?.children?.map((one) => one.id)).toStrictEqual(["full"]);
    });

    it("leaves out an empty preview child, and keeps the group that holds the others", () => {
      const kept = hideEmptyMetricGroups([
        group("host", 4, [
          { ...group("seen", 3), isPreview: true },
          { ...group("unseen", 0), isPreview: true },
        ]),
      ]);

      expect(kept[0]?.children?.map((one) => one.id)).toStrictEqual(["seen"]);
    });

    it("treats a group with no event count as empty", () => {
      expect(
        hideEmptyMetricGroups([
          { ...group("bare", 1), values: [] },
          group("some", 1),
        ]).map((one) => one.id),
      ).toStrictEqual(["some"]);
    });
  });

  describe(listReadMetrics, () => {
    it("reads the metrics shown, those a sort orders by, and the event count when empty groups are hidden", () => {
      expect(
        listReadMetrics(["progressive-events"], {
          hideEmpty: true,
          sort: [{ direction: "asc", key: "duration" }],
        }),
      ).toStrictEqual(["progressive-events", "duration", "events"]);
    });

    it("reads only the metrics shown when nothing asks for more", () => {
      const metrics = ["progressive-events"];

      expect(
        listReadMetrics(metrics, { hideEmpty: false, sort: undefined }),
      ).toBe(metrics);
    });
  });
});
