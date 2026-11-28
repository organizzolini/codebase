import { describe, expect, it } from "vitest";

import {
  createSeedCatalog,
  seedMetrics,
} from "../../../../../../../testing/metric-catalog";
import { MAXIMUM_METRIC_GROUPS } from "../../event-metrics.constants";

import {
  buildMetricTree,
  toMetricValues,
} from "./event-metrics-tree.utilities";

import type {
  EventMetricsRow,
  EventMetricsTreeSource,
} from "../../event-metrics.types";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";
const METRICS = seedMetrics(createSeedCatalog(), "events", "median-duration");

/** A row for a tag group, the optional parts defaulted. */
function row(
  parts: Partial<EventMetricsRow> & { id: string },
): EventMetricsRow {
  return {
    key: null,
    label: null,
    parentId: "",
    path: null,
    period: 0,
    rank: null,
    values: [1, 60],
    ...parts,
  };
}

/** A source for the tree, the optional parts defaulted. */
function source(
  rows: EventMetricsRow[][],
  rest: Partial<EventMetricsTreeSource> = {},
): EventMetricsTreeSource {
  return {
    children: [],
    compare: false,
    levels: [{ field: `tag:${ROOT}`, tags: [] }],
    metrics: METRICS,
    names: new Map([[ROOT, "Planet"]]),
    rows,
    ...rest,
  };
}

describe("event metrics utilities", () => {
  describe(toMetricValues, () => {
    it("reads each metric in the order asked, with nothing previous unless comparing", () => {
      expect.hasAssertions();

      expect(
        toMetricValues(METRICS, {
          compare: false,
          current: [3, null],
          previous: [1, 2],
        }),
      ).toStrictEqual([
        { metric: "events", previous: null, value: 3 },
        { metric: "median-duration", previous: null, value: null },
      ]);
    });

    it("reads a period with no row as zero counts and no other value", () => {
      expect.hasAssertions();

      expect(
        toMetricValues(METRICS, {
          compare: true,
          current: undefined,
          previous: undefined,
        }),
      ).toStrictEqual([
        { metric: "events", previous: 0, value: 0 },
        { metric: "median-duration", previous: null, value: null },
      ]);
    });

    it("sets what each period measured", () => {
      expect.hasAssertions();

      expect(
        toMetricValues(METRICS, {
          compare: true,
          current: [3],
          previous: [1, 90],
        }),
      ).toStrictEqual([
        { metric: "events", previous: 1, value: 3 },
        { metric: "median-duration", previous: 90, value: null },
      ]);
    });
  });

  describe(buildMetricTree, () => {
    it("hangs each child group beneath its host as a preview a level below it", () => {
      expect.hasAssertions();

      const [host] = buildMetricTree(
        source([[row({ id: "/0:a", key: "a", label: "A" })]], {
          children: [
            row({
              id: "ignored",
              key: "b",
              label: "B",
              parentId: "/0:a",
              path: "Planet / A / B",
              rank: "00000:A / 00001:B",
              values: [4, 9],
            }),
          ],
        }),
      );

      expect(host?.isPreview).toBe(false);
      expect(host?.children).toStrictEqual([
        expect.objectContaining({
          children: [],
          id: "/0:a/1:b",
          isPreview: true,
          key: "b",
          label: "B",
          level: 1,
          rank: "00000:A / 00001:B",
        }),
      ]);
    });

    it("sets a child's previous values from the previous period's row, and leaves out a child with no host", () => {
      expect.hasAssertions();

      const [host] = buildMetricTree(
        source([[row({ id: "/0:a", key: "a", label: "A", period: 1 })]], {
          children: [
            row({ id: "x", key: "b", label: "B", parentId: "/0:a", period: 1 }),
            row({ id: "y", key: "c", label: "C", parentId: "/0:missing" }),
          ],
          compare: true,
        }),
      );

      expect(host?.children).toHaveLength(1);
      expect(host?.children[0]?.values[0]).toStrictEqual({
        metric: "events",
        previous: 1,
        value: 0,
      });
    });

    it("nests each level's groups beneath their parent", () => {
      expect.hasAssertions();

      const tree = buildMetricTree(
        source(
          [
            [
              row({
                id: "/0:a",
                key: "a",
                label: "A",
                path: "Planet / A",
                rank: "00000:A",
              }),
            ],
            [row({ id: "/0:a/1:2026", key: "2026", parentId: "/0:a" })],
          ],
          {
            levels: [
              { field: `tag:${ROOT}`, tags: [] },
              { field: "year", tags: [] },
            ],
          },
        ),
      );

      expect(tree).toHaveLength(1);
      expect(tree[0]).toMatchObject({
        id: "/0:a",
        label: "A",
        level: 0,
        path: "Planet / A",
      });
      expect(tree[0]?.children[0]).toMatchObject({
        key: "2026",
        label: "2026",
        level: 1,
        rank: "2026",
      });
    });

    it("calls the group of events with no key after what the level splits, last", () => {
      expect.hasAssertions();

      const tree = buildMetricTree(
        source(
          [
            [
              row({ id: "/0:", key: null }),
              row({
                id: "/0:a",
                key: "a",
                label: "A",
                path: "Planet / A",
                rank: "00000:A",
              }),
            ],
          ],
          { levels: [{ field: `tag:${ROOT}`, tags: [] }] },
        ),
      );

      expect(tree.map(({ label }) => label)).toStrictEqual(["A", "No Planet"]);
      expect(tree[1]).toMatchObject({ key: null, rank: null });
    });

    it("names the no-key group after the parent tag, a derived field or a generic group", () => {
      expect.hasAssertions();

      const names = new Map([[MARS, "Mars"]]);
      const none = row({ id: "/0:" });
      const parent = buildMetricTree(
        source([[none]], {
          levels: [{ field: `tag:${ROOT}`, parent: MARS, tags: [] }],
          names,
        }),
      );
      const unnamed = buildMetricTree(source([[none]], { names: new Map() }));
      const derived = buildMetricTree(
        source([[none]], { levels: [{ field: "weekday", tags: [] }] }),
      );
      const missing = buildMetricTree(source([[none]], { levels: [] }));

      expect(parent[0]?.label).toBe("No Mars");
      expect(unnamed[0]?.label).toBe("No tag");
      expect(derived[0]?.label).toBe("No weekday");
      expect(missing[0]?.label).toBe("No group");
    });

    it("orders a tag by its rank, a duration by its bucket and a tag without a rank by its path", () => {
      expect.hasAssertions();

      const tags = buildMetricTree(
        source([
          [
            row({
              id: "1",
              key: "x",
              label: "Harmonic 10",
              path: "P / Harmonic 10",
              rank: "00000:Harmonic 10",
            }),
            row({
              id: "2",
              key: "y",
              label: "Harmonic 2",
              path: "P / Harmonic 2",
              rank: "00000:Harmonic 2",
            }),
            row({ id: "3", key: "z", label: "Z", path: "P / A" }),
          ],
        ]),
      );
      const durations = buildMetricTree(
        source(
          [
            [
              row({ id: "1", key: "days" }),
              row({ id: "2", key: "instant" }),
              row({ id: "3", key: "strange" }),
            ],
          ],
          { levels: [{ field: "duration", tags: [] }] },
        ),
      );

      expect(tags.map(({ id }) => id)).toStrictEqual(["2", "1", "3"]);
      expect(durations.map(({ key, rank }) => [key, rank])).toStrictEqual([
        ["strange", "-1"],
        ["instant", "00"],
        ["days", "03"],
      ]);
    });

    it("orders a parent before its children and breaks a tie by key", () => {
      expect.hasAssertions();

      const tree = buildMetricTree(
        source([
          [
            row({
              id: "1",
              key: "b",
              label: "B",
              path: "P",
              rank: "00000:A / 00000:B",
            }),
            row({
              id: "2",
              key: "d",
              label: "D",
              path: "P",
              rank: "00000:A",
            }),
            row({
              id: "3",
              key: "c",
              label: "C",
              path: "P",
              rank: "00000:A",
            }),
            row({
              id: "4",
              key: "e",
              label: "E",
              path: "P",
              rank: "00000:A / 00000:A",
            }),
          ],
        ]),
      );

      expect(tree.map(({ key }) => key)).toStrictEqual(["c", "d", "e", "b"]);
    });

    it("returns a group of the previous period alone with empty values and its previous set", () => {
      expect.hasAssertions();

      const tree = buildMetricTree(
        source(
          [
            [
              row({
                id: "/0:a",
                key: "a",
                label: "A",
                path: "P",
                rank: "a",
              }),
              row({
                id: "/0:a",
                key: "a",
                label: "A",
                path: "P",
                period: 1,
                rank: "a",
                values: [4, 30],
              }),
              row({
                id: "/0:b",
                key: "b",
                label: "B",
                path: "P",
                period: 1,
                rank: "b",
                values: [2, 10],
              }),
            ],
          ],
          { compare: true },
        ),
      );

      expect(tree[0]?.values).toStrictEqual([
        { metric: "events", previous: 4, value: 1 },
        { metric: "median-duration", previous: 30, value: 60 },
      ]);
      expect(tree[1]?.values).toStrictEqual([
        { metric: "events", previous: 2, value: 0 },
        { metric: "median-duration", previous: 10, value: null },
      ]);
    });

    it("returns at most the first groups a group may hold", () => {
      expect.hasAssertions();

      const rows = Array.from(
        { length: MAXIMUM_METRIC_GROUPS + 1 },
        (_, index) =>
          row({
            id: `/0:${String(index)}`,
            key: String(index),
            label: String(index),
            path: "P",
            rank: String(index).padStart(4, "0"),
          }),
      );
      const tree = buildMetricTree(source([rows]));

      expect(tree).toHaveLength(MAXIMUM_METRIC_GROUPS);
      expect(tree.at(-1)?.key).toBe(String(MAXIMUM_METRIC_GROUPS - 1));
    });

    it("holds a group without a known parent at the top", () => {
      expect.hasAssertions();

      const tree = buildMetricTree(
        source([
          [
            row({
              id: "/0:a/1:b",
              key: "b",
              label: "B",
              parentId: "/0:a",
              path: "P",
              rank: "b",
            }),
          ],
        ]),
      );

      expect(tree.map(({ id }) => id)).toStrictEqual(["/0:a/1:b"]);
    });
  });
});
