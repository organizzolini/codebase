import { describe, expect, it } from "vitest";

import {
  describeMetricGroups,
  flattenMetricGroups,
  sortMetricGroups,
} from "./calendar-metrics-tree.utilities";

import type { MetricGroup } from "../../calendar-metrics.types";

function group(
  id: string,
  label: string,
  events: number,
  children?: readonly MetricGroup[],
  rank: null | string = label,
): MetricGroup {
  return {
    ...(children === undefined ? {} : { children }),
    id,
    key: label,
    label,
    level: id.split("/").length - 2,
    path: null,
    rank,
    values: [
      { metric: "events", previous: null, value: events },
      { metric: "progressive-events", previous: null, value: events * 2 },
    ],
  };
}

const TREE: readonly MetricGroup[] = [
  group("/0:b", "B", 3, [group("/0:b/1:x", "X", 1), group("/0:b/1:y", "Y", 2)]),
  group("/0:a", "A", 9, [group("/0:a/1:x", "X", 5), group("/0:a/1:y", "Y", 4)]),
  group("/0:none", "No Body", 1, undefined, null),
];

describe("calendar-metrics tree utilities", () => {
  describe(describeMetricGroups, () => {
    it("lists every id sorted, its level, and the first path down", () => {
      expect(describeMetricGroups(TREE)).toStrictEqual({
        firstPath: ["/0:b", "/0:b/1:x"],
        groupIds: [
          "/0:a",
          "/0:a/1:x",
          "/0:a/1:y",
          "/0:b",
          "/0:b/1:x",
          "/0:b/1:y",
          "/0:none",
        ],
        groupLevels: [0, 1, 1, 0, 1, 1, 0],
      });
    });

    it("describes no groups as nothing", () => {
      expect(describeMetricGroups([])).toStrictEqual({
        firstPath: [],
        groupIds: [],
        groupLevels: [],
      });
    });
  });

  describe(flattenMetricGroups, () => {
    it("shows each group as itself while none is open", () => {
      const nodes = flattenMetricGroups(TREE, new Set());

      expect(nodes.map((node) => node.group.id)).toStrictEqual([
        "/0:b",
        "/0:a",
        "/0:none",
      ]);
      expect(nodes.map((node) => node.isExpandable)).toStrictEqual([
        true,
        true,
        false,
      ]);
    });

    it("gives an open group's place to its subgroups, in order", () => {
      const nodes = flattenMetricGroups(TREE, new Set(["/0:a"]));

      expect(nodes.map((node) => node.group.id)).toStrictEqual([
        "/0:b",
        "/0:a/1:x",
        "/0:a/1:y",
        "/0:none",
      ]);
      expect(nodes[1]?.ancestors.map((ancestor) => ancestor.id)).toStrictEqual([
        "/0:a",
      ]);
      expect(nodes[1]?.isExpandable).toBe(false);
    });

    it("goes down every open level", () => {
      const deep = [
        group("/0:a", "A", 3, [
          group("/0:a/1:x", "X", 3, [group("/0:a/1:x/2:q", "Q", 3)]),
        ]),
      ];

      expect(
        flattenMetricGroups(deep, new Set(["/0:a", "/0:a/1:x"])).map(
          (node) => node.group.id,
        ),
      ).toStrictEqual(["/0:a/1:x/2:q"]);
      expect(
        flattenMetricGroups(deep, new Set(["/0:a"])).map(
          (node) => node.group.id,
        ),
      ).toStrictEqual(["/0:a/1:x"]);
    });

    it("keeps an open group with no subgroups as itself", () => {
      expect(
        flattenMetricGroups(TREE, new Set(["/0:none"])).map(
          (node) => node.group.id,
        ),
      ).toStrictEqual(["/0:b", "/0:a", "/0:none"]);
    });

    it("shows nothing for no groups", () => {
      expect(flattenMetricGroups([], new Set())).toStrictEqual([]);
    });
  });

  describe(sortMetricGroups, () => {
    const ids = (groups: readonly MetricGroup[]): string[] =>
      groups.map((entry) => entry.id);

    it("leaves the tree as it is without sorts", () => {
      expect(sortMetricGroups(TREE, undefined)).toBe(TREE);
      expect(sortMetricGroups(TREE, [])).toBe(TREE);
    });

    it("orders by tag order, a group with no key last", () => {
      const sorted = sortMetricGroups(TREE, [
        { direction: "asc", key: "order" },
      ]);

      expect(ids(sorted)).toStrictEqual(["/0:a", "/0:b", "/0:none"]);
      expect(ids(sorted[0]?.children ?? [])).toStrictEqual([
        "/0:a/1:x",
        "/0:a/1:y",
      ]);
    });

    it("orders by name, reversed when descending", () => {
      expect(
        ids(sortMetricGroups(TREE, [{ direction: "desc", key: "name" }])),
      ).toStrictEqual(["/0:none", "/0:b", "/0:a"]);
    });

    it("orders every level by a metric's value", () => {
      const sorted = sortMetricGroups(TREE, [
        { direction: "desc", key: "metric", metric: "progressive-events" },
      ]);

      expect(ids(sorted)).toStrictEqual(["/0:a", "/0:b", "/0:none"]);
      expect(ids(sorted[0]?.children ?? [])).toStrictEqual([
        "/0:a/1:x",
        "/0:a/1:y",
      ]);
      expect(ids(sorted[1]?.children ?? [])).toStrictEqual([
        "/0:b/1:y",
        "/0:b/1:x",
      ]);
    });

    it("reads a count as the events, and the first as the first start", () => {
      expect(
        ids(sortMetricGroups(TREE, [{ direction: "asc", key: "count" }])),
      ).toStrictEqual(["/0:none", "/0:b", "/0:a"]);
      // No group has a first start, so none is before another.
      expect(
        ids(sortMetricGroups(TREE, [{ direction: "asc", key: "first" }])),
      ).toStrictEqual(["/0:b", "/0:a", "/0:none"]);
    });

    it("falls through to the next sort on a tie", () => {
      const sorted = sortMetricGroups(
        [group("/0:a", "A", 2), group("/0:c", "C", 2), group("/0:b", "B", 5)],
        [
          { direction: "asc", key: "metric", metric: "events" },
          { direction: "desc", key: "name" },
        ],
      );

      expect(ids(sorted)).toStrictEqual(["/0:c", "/0:a", "/0:b"]);
    });

    it("treats a metric name that is no slug as the tag order", () => {
      expect(
        ids(
          sortMetricGroups(TREE, [
            { direction: "asc", key: "metric", metric: "STALE" },
          ]),
        ),
      ).toStrictEqual(["/0:a", "/0:b", "/0:none"]);
    });

    it("treats a missing value as zero", () => {
      expect(
        ids(
          sortMetricGroups(TREE, [
            { direction: "asc", key: "metric", metric: "unique-tags" },
          ]),
        ),
      ).toStrictEqual(["/0:b", "/0:a", "/0:none"]);
    });

    it("does not change the tree it was given", () => {
      sortMetricGroups(TREE, [{ direction: "desc", key: "name" }]);

      expect(ids(TREE)).toStrictEqual(["/0:b", "/0:a", "/0:none"]);
    });
  });
});
