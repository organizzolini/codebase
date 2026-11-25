import { describe, expect, it } from "vitest";

import {
  createChartBar,
  createChartSegment,
} from "../../../../testing/chart-bars";
import { EMPTY_VALUE } from "../calendar-metrics/calendar-metrics.constants";
import { formatMetricValueCompact } from "../calendar-metrics/components/calendar-metrics-compact/calendar-metrics-compact.utilities";

import {
  buildChartBars,
  colorMetricGroups,
  cycleMetricSort,
  findChartSegment,
  findChartsNotice,
  findMetricSortDirection,
  findPreviousPaint,
  findSeriesPaint,
  isMonochrome,
  limitTooltipRows,
  listChartSeries,
  truncateChartLabel,
} from "./calendar-charts.utilities";

import type { EventMetric } from "../../../graphql/generated/operations";
import type { GroupSort } from "../../calendar-query/calendar-group-strip/components/event-group-tree/event-group-tree.types";
import type {
  MetricGroup,
  MetricNode,
} from "../calendar-metrics/calendar-metrics.types";

const OPTIONS = {
  colors: undefined,
  compare: false,
  format: (metric: EventMetric, value: null | number) =>
    formatMetricValueCompact(metric, value, "UTC"),
};

function createGroup(
  id: string,
  values: Record<string, [null | number, null | number]>,
  children?: readonly MetricGroup[],
): MetricGroup {
  return {
    ...(children === undefined ? {} : { children }),
    id,
    key: id.split(":").at(-1) ?? null,
    label: id,
    level: 0,
    orderKey: null,
    path: null,
    values: Object.entries(values).map(([metric, [value, previous]]) => ({
      metric: metric as MetricGroup["values"][number]["metric"],
      previous,
      value,
    })),
  };
}

const CHILD_ONE = createGroup("/0:a/1:one", { EVENTS: [4, 2], SPANS: [3, 3] });
const CHILD_TWO = createGroup("/0:a/1:two", { EVENTS: [2, 2], SPANS: [1, 1] });
const PARENT = createGroup(
  "/0:a",
  {
    COVERED_PERCENT: [50, 25],
    EVENTS: [6, 4],
    UNIQUE_NAMES: [5, null],
  },
  [CHILD_ONE, CHILD_TWO],
);
const OTHER = createGroup("/0:b", {
  EVENTS: [null, null],
  UNIQUE_NAMES: [8, 8],
});

function toNode(
  group: MetricGroup,
  ancestors: readonly MetricGroup[] = [],
): MetricNode {
  return {
    ancestors,
    group,
    isExpandable: (group.children?.length ?? 0) > 0,
  };
}

describe("calendar charts utilities", () => {
  describe(cycleMetricSort, () => {
    const ascending: GroupSort = {
      direction: "asc",
      key: "metric",
      metric: "EVENTS",
    };

    it("appends an ascending sort by the metric", () => {
      expect(cycleMetricSort(undefined, "EVENTS")).toStrictEqual([ascending]);
      expect(
        cycleMetricSort([{ direction: "asc", key: "name" }], "EVENTS"),
      ).toStrictEqual([{ direction: "asc", key: "name" }, ascending]);
    });

    it("turns an ascending sort descending, and keeps the others", () => {
      const other: GroupSort = {
        direction: "asc",
        key: "metric",
        metric: "SPANS",
      };

      expect(cycleMetricSort([other, ascending], "EVENTS")).toStrictEqual([
        other,
        { ...ascending, direction: "desc" },
      ]);
    });

    it("removes a descending sort, and is nothing when none is left", () => {
      const descending: GroupSort = { ...ascending, direction: "desc" };

      expect(
        cycleMetricSort(
          [{ direction: "asc", key: "name" }, descending],
          "EVENTS",
        ),
      ).toStrictEqual([{ direction: "asc", key: "name" }]);
      expect(cycleMetricSort([descending], "EVENTS")).toBeUndefined();
    });
  });

  describe(findMetricSortDirection, () => {
    it("is the way the metric's sort goes, or nothing without one", () => {
      const sorts: GroupSort[] = [
        { direction: "asc", key: "name" },
        { direction: "desc", key: "metric", metric: "EVENTS" },
      ];

      expect(findMetricSortDirection(sorts, "EVENTS")).toBe("desc");
      expect(findMetricSortDirection(sorts, "SPANS")).toBeUndefined();
      expect(findMetricSortDirection(undefined, "EVENTS")).toBeUndefined();
    });
  });

  describe(findSeriesPaint, () => {
    it("paints a piece in its color with no border, or the default fill", () => {
      expect(findSeriesPaint("red", false)).toStrictEqual({ fill: "red" });
      expect(findSeriesPaint(undefined, false).fill).toBe("var(--primary)");
    });

    it("paints a piece black with a white border when colors are off", () => {
      expect(findSeriesPaint("red", true)).toStrictEqual({
        fill: "#000000",
        stroke: "#ffffff",
      });
    });
  });

  describe(findPreviousPaint, () => {
    it("paints the previous period muted, or black with a white border when colors are off", () => {
      expect(findPreviousPaint(false).fill).toBe("var(--muted-foreground)");
      expect(findPreviousPaint(true)).toStrictEqual({
        fill: "#000000",
        fillOpacity: 0.4,
        stroke: "#ffffff",
      });
    });
  });

  describe(isMonochrome, () => {
    it("is true when no bar nor piece has a color", () => {
      expect(
        isMonochrome([
          createChartBar({
            color: undefined,
            segments: [createChartSegment({ color: undefined })],
          }),
        ]),
      ).toBe(true);
    });

    it("is false when a bar or a piece has one", () => {
      expect(isMonochrome([createChartBar()])).toBe(false);
      expect(
        isMonochrome([
          createChartBar({
            color: undefined,
            segments: [createChartSegment()],
          }),
        ]),
      ).toBe(false);
    });
  });

  describe(truncateChartLabel, () => {
    it("keeps a short label and cuts a long one with an ellipsis", () => {
      expect(truncateChartLabel("Mars")).toBe("Mars");
      expect(truncateChartLabel()).toBe("");
      expect(truncateChartLabel("A very long group label")).toBe(
        "A very long g…",
      );
    });
  });

  describe(listChartSeries, () => {
    it("lists one series for each position of the tallest stack, however many ids there are", () => {
      const first = createChartBar();
      const second = createChartBar({
        segments: [
          createChartSegment({ id: "two" }),
          createChartSegment({ id: "three" }),
          createChartSegment({ id: "four" }),
        ],
      });

      expect(listChartSeries([first, second])).toStrictEqual([0, 1, 2]);
      expect(listChartSeries([])).toStrictEqual([]);
    });
  });

  describe(findChartSegment, () => {
    it("is the piece at a position, or nothing where the bar has fewer", () => {
      const bar = createChartBar();

      expect(findChartSegment(bar, 1)?.label).toBe("Two");
      expect(findChartSegment(bar, 5)).toBeUndefined();
      expect(findChartSegment(bar)).toBeUndefined();
      expect(findChartSegment(bar, Number("previous"))).toBeUndefined();
    });
  });

  describe(limitTooltipRows, () => {
    const rows = Array.from({ length: 10 }, (_, index) => ({
      name: String(index),
    }));

    it("keeps the first rows and the previous period's, and counts the rest", () => {
      const { hidden, shown } = limitTooltipRows([
        ...rows,
        { name: "previous" },
      ]);

      expect(shown).toHaveLength(9);
      expect(hidden).toBe(2);
      expect(shown.at(-1)?.name).toBe("previous");
    });

    it("is nothing without rows", () => {
      expect(limitTooltipRows(undefined)).toStrictEqual({
        hidden: 0,
        shown: [],
      });
    });
  });

  describe(buildChartBars, () => {
    it("stacks a group's bar by its subgroups for an additive metric", () => {
      const [bar] = buildChartBars([toNode(PARENT)], "EVENTS", OPTIONS);

      expect(bar?.segments.map((segment) => segment.id)).toStrictEqual([
        CHILD_ONE.id,
        CHILD_TWO.id,
      ]);
      expect(bar?.segments.map((segment) => segment.value)).toStrictEqual([
        4, 2,
      ]);
      expect(bar?.segments.map((segment) => segment.share)).toStrictEqual([
        "67%",
        "33%",
      ]);
      expect(bar?.ariaLabel).toBe("/0:a: 6");
      expect(bar?.target).toBe("/0:a");
      expect(bar?.change).toBeUndefined();
      expect(bar?.previous).toBeNull();
    });

    it("takes a segment's share of every bar shown", () => {
      const bars = buildChartBars(
        [toNode(CHILD_ONE, [PARENT]), toNode(CHILD_TWO, [PARENT])],
        "EVENTS",
        OPTIONS,
      );

      expect(bars.map((bar) => bar.segments[0]?.share)).toStrictEqual([
        "67%",
        "33%",
      ]);
    });

    it("draws one bar for a metric that does not add up, with no share", () => {
      const [bar] = buildChartBars([toNode(PARENT)], "UNIQUE_NAMES", OPTIONS);

      expect(bar?.segments).toHaveLength(1);
      expect(bar?.segments[0]?.id).toBe("/0:a");
      expect(bar?.segments[0]?.value).toBe(5);
      expect(bar?.segments[0]?.share).toBe("");
    });

    it("colors each segment by its group", () => {
      const colors = new Map([[CHILD_ONE.id, "red"]]);
      const [bar] = buildChartBars([toNode(PARENT)], "EVENTS", {
        ...OPTIONS,
        colors,
      });

      expect(bar?.segments.map((segment) => segment.color)).toStrictEqual([
        "red",
        undefined,
      ]);
    });

    it("colors a bar by its group and marks the pieces that have subgroups", () => {
      const colors = new Map([[PARENT.id, "blue"]]);
      const [bar] = buildChartBars([toNode(PARENT)], "EVENTS", {
        ...OPTIONS,
        colors,
      });

      expect(bar?.color).toBe("blue");
      expect(
        bar?.segments.map((segment) => segment.isExpandable),
      ).toStrictEqual([false, false]);

      const [stacked] = buildChartBars(
        [
          toNode({
            ...PARENT,
            children: [{ ...CHILD_ONE, children: [OTHER] }],
          }),
        ],
        "EVENTS",
        OPTIONS,
      );

      expect(
        stacked?.segments.map((segment) => segment.isExpandable),
      ).toStrictEqual([true]);
      expect(
        buildChartBars([toNode(PARENT)], "EVENTS", OPTIONS)[0]?.color,
      ).toBeUndefined();
    });

    it("shows the previous period and the change when compared", () => {
      const [bar] = buildChartBars([toNode(PARENT)], "EVENTS", {
        ...OPTIONS,
        compare: true,
      });

      expect(bar?.previous).toBe(4);
      expect(bar?.previousText).toBe("4");
      expect(bar?.change?.direction).toBe("up");
    });

    it("shows no change for a group with no previous value", () => {
      const [bar] = buildChartBars([toNode(PARENT)], "UNIQUE_NAMES", {
        ...OPTIONS,
        compare: true,
      });

      expect(bar?.change).toBeUndefined();
      expect(bar?.previous).toBeNull();
    });

    it("writes a missing value as a dash with no height", () => {
      const [bar] = buildChartBars([toNode(OTHER)], "EVENTS", OPTIONS);

      expect(bar?.text).toBe(EMPTY_VALUE);
      expect(bar?.segments[0]?.value).toBe(0);
      expect(bar?.segments[0]?.share).toBe("");
      expect(bar?.target).toBeUndefined();
    });

    it("closes the open group above a subgroup", () => {
      const [bar] = buildChartBars(
        [toNode(CHILD_ONE, [PARENT])],
        "EVENTS",
        OPTIONS,
      );

      expect(bar?.target).toBe(PARENT.id);
      expect(bar?.isExpandable).toBe(false);
    });
  });

  describe("compact durations", () => {
    it("writes a bar's duration with the compact span, the segment's and the previous's too", () => {
      const group = createGroup("/0:d", {
        TOTAL_DURATION_MINUTES: [525_600 + 43_200 + 4320 + 720, 1440],
      });
      const [bar] = buildChartBars([toNode(group)], "TOTAL_DURATION_MINUTES", {
        ...OPTIONS,
        compare: true,
      });

      expect(bar?.text).toBe("1 y 1 mo 3 d");
      expect(bar?.ariaLabel).toBe("/0:d: 1 y 1 mo 3 d");
      expect(bar?.segments[0]?.text).toBe("1 y 1 mo 3 d");
      expect(bar?.previousText).toBe("1 d");
    });
  });

  describe(colorMetricGroups, () => {
    it("is nothing when colors are off", () => {
      expect(colorMetricGroups([PARENT], undefined)).toBeUndefined();
    });

    it("gives a tag its own color and a subgroup a shade near its parent's", () => {
      const colors = colorMetricGroups(
        [PARENT, OTHER],
        new Map([["a", "oklch(0.7 0.15 30)"]]),
      );

      expect(colors?.get(PARENT.id)).toBe("oklch(0.7 0.15 30)");
      expect(colors?.get(CHILD_ONE.id)).toMatch(/^oklch/);
      expect(colors?.get(CHILD_ONE.id)).not.toBe(colors?.get(CHILD_TWO.id));
      expect(colors?.has(OTHER.id)).toBe(false);
    });

    it("leaves a group with no key uncolored", () => {
      const colors = colorMetricGroups(
        [{ ...OTHER, key: null }],
        new Map([["b", "red"]]),
      );

      expect(colors?.size).toBe(0);
    });
  });

  describe(findChartsNotice, () => {
    it("names a failed read first", () => {
      expect(
        findChartsNotice({ data: undefined, rows: [], status: "error" }),
      ).toBe("error");
    });

    it("is loading until an answer arrives", () => {
      expect(
        findChartsNotice({ data: undefined, rows: [], status: "loading" }),
      ).toBe("loading");
    });

    it("is empty when the answer holds no group", () => {
      const data = { groups: [], timezone: "UTC", total: [] };

      expect(findChartsNotice({ data, rows: [], status: "ready" })).toBe(
        "empty",
      );
    });

    it("is nothing when there are groups to chart", () => {
      const data = { groups: [PARENT], timezone: "UTC", total: [] };

      expect(
        findChartsNotice({ data, rows: [toNode(PARENT)], status: "ready" }),
      ).toBeUndefined();
    });
  });
});
