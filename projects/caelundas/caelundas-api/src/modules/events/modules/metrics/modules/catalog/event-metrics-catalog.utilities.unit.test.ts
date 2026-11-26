import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import {
  createSeedCatalog,
  createSeedRows,
  createSeedTrees,
  FIXTURE_VIEW_COLUMNS,
  SEEDED_METRIC_SLUGS,
} from "../../../../../../../testing/metric-catalog";
import {
  MEASURE_REGISTRY,
  METRIC_ORDER,
} from "../measures/event-metrics-measures.constants";

import { EventMetricUnit } from "./event-metric-unit.entities";
import {
  buildCatalog,
  collectMeasures,
  describeCatalog,
  flattenExpressionTrees,
  orderMetrics,
  resolveMetrics,
} from "./event-metrics-catalog.utilities";

import type { MetricCatalogRows } from "./event-metrics-catalog.types";

/** The seeded rows, changed by `change`, built into a catalog. */
function build(change: (rows: MetricCatalogRows) => void): void {
  const rows = createSeedRows();

  change(rows);
  buildCatalog(rows);
}

/** The value, failing the test when there is none. */
function only<Value>(value: undefined | Value): Value {
  if (value === undefined) {
    throw new Error("The seeded rows lack a row the test needs");
  }

  return value;
}

describe("event metrics catalog utilities", () => {
  describe(buildCatalog, () => {
    it("builds every seeded metric and measure by slug, each tree resolved", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();

      expect([...catalog.metrics.keys()]).toStrictEqual(SEEDED_METRIC_SLUGS);
      expect(catalog.measures.size).toBe(18);
      expect(catalog.metrics.get("average-duration")?.expression).toStrictEqual(
        {
          kind: "operator",
          operands: [
            { kind: "metric", slug: "duration" },
            { kind: "measure", slug: "progressive-events" },
          ],
          operator: "divide",
        },
      );
      expect(catalog.metrics.get("covered-percent")?.expression).toStrictEqual({
        kind: "operator",
        operands: [
          { kind: "measure", slug: "covered-clipped-duration" },
          { kind: "measure", slug: "period-length" },
        ],
        operator: "percent",
      });
    });

    it("orders the operands of a node by their position", () => {
      expect.hasAssertions();

      const rows = createSeedRows();
      const divide = rows.expressions.find(
        ({ operator }) => operator === "divide",
      );
      const operands = rows.expressions.filter(
        ({ parent_id: parent }) => parent === divide?.id,
      );

      for (const operand of operands) {
        operand.position = 1 - operand.position;
      }

      expect(
        buildCatalog(rows).metrics.get("average-duration")?.expression,
      ).toMatchObject({
        operands: [{ slug: "progressive-events" }, { slug: "duration" }],
      });
    });

    it("refuses a slug that is not lowercase words and hyphens", () => {
      expect.hasAssertions();

      expect(() => {
        build(({ measures }) => {
          const [first] = measures;

          if (first !== undefined) {
            first.slug = "Total Duration";
          }
        });
      }).toThrow(/measure slug Total Duration/u);
      expect(() => {
        build(({ metrics }) => {
          const [first] = metrics;

          if (first !== undefined) {
            first.slug = "events; drop table";
          }
        });
      }).toThrow(/metric slug/u);
    });

    it("refuses a measure the registry lacks, or a unit it disagrees with", () => {
      expect.hasAssertions();

      expect(() => {
        build(({ measures }) => {
          only(measures[0]).slug = "no-such-measure";
        });
      }).toThrow(/measure no-such-measure has no registry entry/u);
      expect(() => {
        build(({ measures }) => {
          only(measures[0]).slug = "constructor";
        });
      }).toThrow(/measure constructor has no registry entry/u);
      expect(() => {
        build(({ measures }) => {
          only(measures[0]).unit = "duration";
        });
      }).toThrow(/is duration, but the registry says count/u);
    });

    it("refuses a registry column an event row lacks", () => {
      expect.hasAssertions();

      for (const column of ["events", "duration_minutes", "covered_range"]) {
        expect(() => {
          build((rows) => {
            rows.eventColumns = new Set(
              [...FIXTURE_VIEW_COLUMNS].filter((name) => name !== column),
            );
          });
        }).toThrow(/names \w+, which is no column of an event row/u);
      }
    });

    it("derives whether a metric is additive and whether it reads 0 over no events", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();
      const slugs = (
        pick: (metric: { additive: boolean; zeroIfEmpty: boolean }) => boolean,
      ): string[] =>
        [...catalog.metrics.values()]
          .filter((metric) => pick(metric))
          .map(({ slug }) => slug);

      expect(slugs(({ additive }) => additive)).toStrictEqual([
        "events",
        "perfective-events",
        "progressive-events",
        "duration",
      ]);
      expect(slugs(({ zeroIfEmpty }) => !zeroIfEmpty)).toStrictEqual([
        "average-duration",
        "median-duration",
        "longest-duration",
        "shortest-duration",
        "first-start",
        "last-start",
      ]);
    });

    it("refuses a tree that is missing, malformed or reads what is not there", () => {
      expect.hasAssertions();

      expect(() => {
        build((rows) => {
          only(rows.metrics[0]).expression_id = null;
        });
      }).toThrow(/metric events has no expression/u);
      expect(() => {
        build(({ expressions }) => {
          const node = expressions.find(({ kind }) => kind === "measure");

          only(node).measure_id = "m-nothing";
        });
      }).toThrow(/missing row m-nothing/u);
      expect(() => {
        build(({ expressions }) => {
          const node = expressions.find(({ kind }) => kind === "measure");

          only(node).measure_id = null;
        });
      }).toThrow(/missing row null/u);
      expect(() => {
        build(({ expressions, metrics }) => {
          const root = expressions.find(
            ({ id }) => id === metrics[0]?.expression_id,
          );

          expressions.splice(expressions.indexOf(only(root)), 1);
        });
      }).toThrow(/metric events has no expression/u);
      expect(() => {
        build(({ expressions }) => {
          const node = expressions.find(({ kind }) => kind === "operator");

          only(node).operator = "power";
        });
      }).toThrow(/no known operator/u);
      expect(() => {
        build(({ expressions }) => {
          const node = expressions.find(
            ({ operator }) => operator === "divide",
          );

          only(node).operator = "multiply";
          expressions.splice(
            expressions.findIndex(
              ({ parent_id: parent }) => parent === node?.id,
            ),
            1,
          );
        });
      }).toThrow(/takes 2 operands, not 1/u);
    });

    it("refuses an operator with no operands", () => {
      expect.hasAssertions();

      expect(() => {
        build(({ expressions }) => {
          const divide = only(
            expressions.find(({ operator }) => operator === "divide"),
          );

          for (const row of expressions.filter(
            ({ parent_id: parent }) => parent === divide.id,
          )) {
            expressions.splice(expressions.indexOf(row), 1);
          }
        });
      }).toThrow(/takes 2 operands, not 0/u);
    });

    it("refuses a metric that reads itself, directly or through another", () => {
      expect.hasAssertions();

      expect(() => {
        build(({ expressions }) => {
          const node = expressions.find(({ kind }) => kind === "metric");

          only(node).metric_id = "t-average-duration";
        });
      }).toThrow(/metric average-duration reads itself/u);
      expect(() => {
        build(({ expressions, metrics }) => {
          const total = expressions.find(
            ({ id }) =>
              id ===
              metrics.find(({ slug }) => slug === "duration")?.expression_id,
          );

          Object.assign(only(total), {
            kind: "metric",
            measure_id: null,
            metric_id: "t-average-duration",
          });
        });
      }).toThrow(/reads itself/u);
    });
  });

  describe(flattenExpressionTrees, () => {
    it("lists every node of the trees with its parent's id", () => {
      expect.hasAssertions();

      const flat = flattenExpressionTrees(createSeedTrees());
      const seeded = createSeedRows().expressions;
      const byId = (rows: typeof flat): typeof flat =>
        rows.toSorted((left, right) => left.id.localeCompare(right.id));

      expect(byId(flat)).toStrictEqual(byId(seeded));
    });

    it("reads a node with no children and no optional parts", () => {
      expect.hasAssertions();

      expect(
        flattenExpressionTrees([
          { id: "a", kind: "measure", position: 0 } as never,
        ]),
      ).toStrictEqual([
        {
          id: "a",
          kind: "measure",
          measure_id: null,
          metric_id: null,
          operator: null,
          parent_id: null,
          position: 0,
        },
      ]);
    });
  });

  describe(collectMeasures, () => {
    it("lists the measures a metric reads, through the metrics it reads, sorted", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();
      const slugs = (metrics: string[]): string[] =>
        collectMeasures(resolveMetrics(catalog, metrics), catalog).map(
          ({ slug }) => slug,
        );

      expect(slugs(["average-duration"])).toStrictEqual([
        "duration",
        "progressive-events",
      ]);
      expect(slugs(["covered-percent"])).toStrictEqual([
        "covered-clipped-duration",
        "period-length",
      ]);
      expect(slugs(["events", "average-duration", "duration"])).toStrictEqual([
        "duration",
        "events",
        "progressive-events",
      ]);
    });
  });

  describe("collectMeasures over odd expressions", () => {
    it("reads a metric it meets twice once, and skips one the catalog lacks", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();
      const events = only(catalog.metrics.get("events"));
      const twice = {
        ...events,
        expression: {
          kind: "operator",
          operands: [
            { kind: "metric", slug: "duration" },
            { kind: "metric", slug: "duration" },
          ],
          operator: "add",
        },
      } as const;
      const lacking = {
        ...events,
        expression: { kind: "metric", slug: "nothing" },
      } as const;

      expect(
        collectMeasures([twice, lacking], catalog).map(({ slug }) => slug),
      ).toStrictEqual(["duration"]);
    });
  });

  describe(resolveMetrics, () => {
    it("answers each metric once, in the order given", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();

      expect(
        resolveMetrics(catalog, [
          "progressive-events",
          "events",
          "progressive-events",
        ]).map(({ slug }) => slug),
      ).toStrictEqual(["progressive-events", "events"]);
    });

    it("resolves a renamed slug, and the merged one, to today's metric, once", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();

      expect(
        resolveMetrics(catalog, [
          "instants",
          "spans",
          "total-duration",
          "progressive-duration",
          "duration",
        ]).map(({ slug }) => slug),
      ).toStrictEqual(["perfective-events", "progressive-events", "duration"]);
    });

    it("refuses an unknown slug, naming the ones there are", () => {
      expect.hasAssertions();

      const catalog = createSeedCatalog();

      expect(() =>
        resolveMetrics(catalog, ["events", "TOTAL_DURATION_MINUTES"]),
      ).toThrow(BadRequestException);
      expect(() => resolveMetrics(catalog, ["nothing"])).toThrow(
        /Unknown metric "nothing"; the metrics are events, unique-names/u,
      );
    });
  });

  describe(describeCatalog, () => {
    it("lists the measures and each metric with the measures it reads, in the picker's order", () => {
      expect.hasAssertions();

      const described = describeCatalog(createSeedCatalog());

      expect(described.measures).toHaveLength(18);
      expect(
        described.measures.find(
          ({ slug }) => slug === "median-progressive-duration",
        ),
      ).toStrictEqual({
        icon: "hash",
        name: "median-progressive-duration",
        note: "median-progressive-duration",
        slug: "median-progressive-duration",
        unit: EventMetricUnit.DURATION,
      });
      expect(described.metrics.map(({ slug }) => slug)).toStrictEqual(
        SEEDED_METRIC_SLUGS,
      );
      expect(
        described.metrics.find(({ slug }) => slug === "average-duration"),
      ).toStrictEqual({
        additive: false,
        icon: "hash",
        measures: ["duration", "progressive-events"],
        name: "average-duration",
        note: "average-duration",
        slug: "average-duration",
        unit: EventMetricUnit.DURATION,
      });
      expect(
        described.metrics
          .filter(({ unit }) => unit === EventMetricUnit.NONE)
          .map(({ slug }) => slug),
      ).toHaveLength(4);
      expect(
        described.metrics.find(({ slug }) => slug === "first-start")?.unit,
      ).toBe(EventMetricUnit.INSTANT);
      expect(
        described.metrics.find(({ slug }) => slug === "events")?.unit,
      ).toBe(EventMetricUnit.COUNT);
    });
  });

  describe(orderMetrics, () => {
    it("lists the metrics the order names as it does, then any other by slug", () => {
      expect.hasAssertions();

      const seeded = createSeedCatalog();
      const extra = only(seeded.metrics.get("events"));
      const metrics = new Map([
        ...seeded.metrics,
        ["aa-extra", { ...extra, slug: "aa-extra" }],
        ["zz-extra", { ...extra, slug: "zz-extra" }],
      ]);

      expect(
        orderMetrics({ measures: seeded.measures, metrics }).map(
          ({ slug }) => slug,
        ),
      ).toStrictEqual([...METRIC_ORDER, "aa-extra", "zz-extra"]);
    });
  });

  describe("a catalog missing a metric of the order", () => {
    it("lists the others", () => {
      expect.hasAssertions();

      const seeded = createSeedCatalog();
      const metrics = new Map(
        [...seeded.metrics].filter(([slug]) => slug !== "events"),
      );

      expect(
        orderMetrics({ measures: seeded.measures, metrics }).map(
          ({ slug }) => slug,
        ),
      ).toStrictEqual(METRIC_ORDER.filter((slug) => slug !== "events"));
    });
  });

  describe("the measure registry", () => {
    it("holds an entry for each of the 18 measures, each valid", () => {
      expect.hasAssertions();

      const entries = Object.entries(MEASURE_REGISTRY);

      expect(entries).toHaveLength(18);

      for (const [, spec] of entries) {
        expect(spec.grains.length).toBeGreaterThan(0);
        expect(spec.grains).toContain("event");
      }

      expect(
        entries
          .filter(([, spec]) => spec.aggregate === "progressive-percentile")
          .map(([, spec]) => spec.argument),
      ).toStrictEqual([0.5]);
    });

    it("lists each metric of the order once, and no other", () => {
      expect.hasAssertions();

      expect(METRIC_ORDER).toStrictEqual(SEEDED_METRIC_SLUGS);
    });
  });
});
