import { describe, expect, it } from "vitest";

import { createSeedCatalog } from "../../../../../../../testing/metric-catalog";

import {
  compileEventAggregate,
  compileExpression,
  compileMetricColumns,
  compileRolledMeasure,
  deriveAdditive,
  deriveEmptyValue,
  isRolledMeasure,
  isSideMeasure,
  listEventColumns,
} from "./event-metrics-measures.utilities";

import type {
  CatalogMeasure,
  ExpressionNode,
} from "../catalog/event-metrics-catalog.types";

const catalog = createSeedCatalog();

/** A seeded measure by slug. */
function measureOf(slug: string): CatalogMeasure {
  const measure = catalog.measures.get(slug);

  if (measure === undefined) {
    throw new Error(`No seeded measure ${slug}`);
  }

  return measure;
}

/** Reads each measure as its slug in quotes. */
const resolve = (measure: CatalogMeasure): string => `"${measure.slug}"`;

describe("event metrics measures utilities", () => {
  describe(compileEventAggregate, () => {
    it("sums a column, none counting as zero", () => {
      expect.hasAssertions();

      expect(compileEventAggregate(measureOf("duration"), "x")).toBe(
        `coalesce(sum(x."duration_minutes"), 0)`,
      );
    });

    it("reads an instant in epoch milliseconds", () => {
      expect.hasAssertions();

      expect(compileEventAggregate(measureOf("first-start"), "e")).toBe(
        `extract(epoch from min(e."first_start")) * 1000`,
      );
      expect(compileEventAggregate(measureOf("last-start"), "e")).toBe(
        `extract(epoch from max(e."last_start")) * 1000`,
      );
    });

    it("counts distinct days and names", () => {
      expect.hasAssertions();

      expect(compileEventAggregate(measureOf("days-with-events"), "x")).toBe(
        `count(distinct x."day")`,
      );
      expect(compileEventAggregate(measureOf("unique-names"), "x")).toBe(
        'count(distinct x."name")',
      );
    });

    it("reads the spans' durations through the events that last", () => {
      expect.hasAssertions();

      expect(
        compileEventAggregate(measureOf("median-progressive-duration"), "x"),
      ).toBe(
        `percentile_cont(0.5) within group (order by x.duration_minutes) filter (where x."end" > x."start")`,
      );
      expect(
        compileEventAggregate(measureOf("longest-progressive-duration"), "x"),
      ).toContain(`max(x.duration_minutes) filter (where x."end" > x."start")`);
      expect(
        compileEventAggregate(measureOf("shortest-progressive-duration"), "x"),
      ).toContain(`min(x.duration_minutes)`);
    });

    it("unions ranges, clipped to the period for the shares", () => {
      expect.hasAssertions();

      expect(
        compileEventAggregate(measureOf("covered-duration"), "x"),
      ).toContain(`unnest(range_agg(x."covered_range"))`);
      expect(
        compileEventAggregate(measureOf("covered-clipped-duration"), "x"),
      ).toContain(
        `range_agg(tstzrange(greatest(x."start", x.period_start), least(x."end", x.period_end)))`,
      );
      expect(
        compileEventAggregate(measureOf("clipped-duration"), "x"),
      ).toContain(`least(x."end", x.period_end)`);
      expect(compileEventAggregate(measureOf("period-length"), "x")).toBe(
        "extract(epoch from (min(x.period_end) - min(x.period_start))) / 60",
      );
    });

    it("narrows an aggregate to the rows where its condition column is true", () => {
      expect.hasAssertions();

      const sql = compileEventAggregate(
        measureOf("progressive-covered-clipped-duration"),
        "x",
      );
      const counted = compileEventAggregate(
        measureOf("progressive-clipped-duration"),
        "x",
      );

      expect(sql).toContain(`filter (where x."is_progressive")`);
      expect(counted).toContain(`/ 60) filter (where x."is_progressive"), 0)`);
      expect(
        compileEventAggregate(
          {
            ...measureOf("longest-progressive-duration"),
            conditionColumn: "is_progressive",
          },
          "x",
        ),
      ).toContain(`and x."is_progressive")`);
    });

    it("counts the tags of the events, beneath the root when given", () => {
      expect.hasAssertions();

      const sql = compileEventAggregate(
        measureOf("unique-tags"),
        "e",
        " and t.tag_id <> $3::uuid",
      );

      expect(sql).toContain("any(array_agg(e.id)) and t.tag_id <> $3::uuid");
      expect(compileEventAggregate(measureOf("unique-tags"), "e")).toContain(
        "any(array_agg(e.id)))",
      );
    });
  });

  describe(compileExpression, () => {
    const context = { catalog, resolve };

    it("reads a measure as the resolver says", () => {
      expect.hasAssertions();

      expect(
        compileExpression({ kind: "measure", slug: "events" }, context),
      ).toBe(`"events"`);
    });

    it("guards the divisor so a zero reads none", () => {
      expect.hasAssertions();

      expect(
        compileExpression(
          catalog.metrics.get("covered-percent")?.expression ?? {
            kind: "measure",
            slug: "events",
          },
          context,
        ),
      ).toBe(
        `(100.0 * "covered-clipped-duration" / nullif("period-length", 0))`,
      );
    });

    it("compiles a metric it reads in place", () => {
      expect.hasAssertions();

      expect(
        compileExpression(
          catalog.metrics.get("average-duration")?.expression ?? {
            kind: "measure",
            slug: "events",
          },
          context,
        ),
      ).toBe(`("duration" / nullif("progressive-events", 0))`);
    });

    it("applies every operator to its two operands", () => {
      expect.hasAssertions();

      const operands: ExpressionNode[] = [
        { kind: "measure", slug: "events" },
        { kind: "measure", slug: "progressive-events" },
      ];
      const sql = (
        operator:
          | "add"
          | "coalesce"
          | "divide"
          | "greatest"
          | "least"
          | "multiply"
          | "percent"
          | "subtract",
      ): string =>
        compileExpression({ kind: "operator", operands, operator }, context);

      expect(sql("add")).toBe(`("events" + "progressive-events")`);
      expect(sql("subtract")).toBe(`("events" - "progressive-events")`);
      expect(sql("multiply")).toBe(`("events" * "progressive-events")`);
      expect(sql("divide")).toBe(
        `("events" / nullif("progressive-events", 0))`,
      );
      expect(sql("percent")).toBe(
        `(100.0 * "events" / nullif("progressive-events", 0))`,
      );
      expect(sql("coalesce")).toBe(`coalesce("events", "progressive-events")`);
      expect(sql("greatest")).toBe(`greatest("events", "progressive-events")`);
      expect(sql("least")).toBe(`least("events", "progressive-events")`);
    });

    it("reads what the catalog lacks as none", () => {
      expect.hasAssertions();

      expect(
        compileExpression({ kind: "measure", slug: "nothing" }, context),
      ).toBe("null");
      expect(
        compileExpression({ kind: "metric", slug: "nothing" }, context),
      ).toBe("null");
      expect(
        compileExpression(
          { kind: "operator", operands: [], operator: "add" },
          context,
        ),
      ).toBe("(null + null)");
    });
  });

  describe(compileMetricColumns, () => {
    it("selects a float a metric, m0, m1, in the order given", () => {
      expect.hasAssertions();

      const metrics = ["progressive-events", "events"].flatMap(
        (slug) => catalog.metrics.get(slug) ?? [],
      );

      expect(compileMetricColumns(metrics, { catalog, resolve })).toBe(
        `,\n    ("progressive-events")::float8 as m0,\n    ("events")::float8 as m1`,
      );
    });
  });

  describe(compileRolledMeasure, () => {
    it("computes the sums, the extremes and the days, the instants already in milliseconds", () => {
      expect.hasAssertions();

      expect(compileRolledMeasure(measureOf("events"))).toStrictEqual({
        sql: `sum(w."events")`,
      });
      expect(compileRolledMeasure(measureOf("first-start"))?.sql).toBe(
        `min(w."first_start")`,
      );
      expect(compileRolledMeasure(measureOf("last-start"))?.sql).toBe(
        `max(w."last_start")`,
      );
      expect(compileRolledMeasure(measureOf("days-with-events"))?.sql).toBe(
        `count(distinct w."day")`,
      );
    });

    it("answers none for what does not merge across days", () => {
      expect.hasAssertions();

      for (const slug of [
        "covered-duration",
        "longest-progressive-duration",
        "median-progressive-duration",
        "shortest-progressive-duration",
        "unique-names",
        "unique-tags",
      ]) {
        expect(compileRolledMeasure(measureOf(slug))).toBeNull();
      }
    });

    it("answers none for what the rollups cannot answer", () => {
      expect.hasAssertions();

      expect(compileRolledMeasure(measureOf("clipped-duration"))).toBeNull();
      expect(compileRolledMeasure(measureOf("period-length"))).toBeNull();
      expect(
        compileRolledMeasure({
          ...measureOf("events"),
          conditionColumn: "is_progressive",
        }),
      ).toBeNull();
    });
  });

  describe("measures without a column, or an operator it does not know", () => {
    it("reads a rolled measure with no column as an empty column", () => {
      expect.hasAssertions();

      expect(
        compileRolledMeasure({ ...measureOf("events"), factsColumn: null })
          ?.sql,
      ).toBe("sum()");
    });

    it("reads an unknown operator as none", () => {
      expect.hasAssertions();

      expect(
        compileExpression(
          {
            kind: "operator",
            operands: [],
            operator: "power" as never,
          },
          { catalog, resolve },
        ),
      ).toBe("null");
    });
  });

  describe(isRolledMeasure, () => {
    it("needs the day grain, no condition, and an aggregate the rollups compute", () => {
      expect.hasAssertions();

      expect(isRolledMeasure(measureOf("events"))).toBe(true);
      expect(isRolledMeasure(measureOf("unique-names"))).toBe(false);
      expect(isRolledMeasure(measureOf("covered-duration"))).toBe(false);
      expect(isRolledMeasure(measureOf("clipped-duration"))).toBe(false);
      expect(
        isRolledMeasure({ ...measureOf("events"), grains: ["event"] }),
      ).toBe(false);
      expect(
        isRolledMeasure({
          ...measureOf("events"),
          conditionColumn: "is_progressive",
        }),
      ).toBe(false);
      expect(
        isRolledMeasure({ ...measureOf("events"), aggregate: "period" }),
      ).toBe(false);
    });
  });

  describe(isSideMeasure, () => {
    it("tells the measure counted apart, the tags, from the rest", () => {
      expect.hasAssertions();

      expect(isSideMeasure(measureOf("unique-tags"))).toBe(true);
      expect(isSideMeasure(measureOf("unique-names"))).toBe(false);
      expect(isSideMeasure(measureOf("events"))).toBe(false);
    });
  });

  describe(listEventColumns, () => {
    it("lists the columns the measures read, past the ones every event row has", () => {
      expect.hasAssertions();

      const measures = [
        "events",
        "duration",
        "covered-clipped-duration",
        "progressive-clipped-duration",
        "median-progressive-duration",
        "unique-names",
      ].map((slug) => measureOf(slug));

      expect(listEventColumns(measures)).toStrictEqual([
        "events",
        "is_progressive",
      ]);
      expect(listEventColumns(measures, new Set())).toStrictEqual([
        "duration_minutes",
        "events",
        "is_progressive",
      ]);
    });
  });

  describe(deriveAdditive, () => {
    it("is true for one measure that sums, directly or through a metric it reads", () => {
      expect.hasAssertions();

      const expression = (slug: string): ExpressionNode =>
        catalog.metrics.get(slug)?.expression ?? {
          kind: "metric",
          slug: "nothing",
        };

      expect(deriveAdditive(expression("events"), catalog)).toBe(true);
      expect(deriveAdditive(expression("duration"), catalog)).toBe(true);
      expect(
        deriveAdditive({ kind: "metric", slug: "progressive-events" }, catalog),
      ).toBe(true);
    });

    it("is false for a union, a count of distinct values, or an operator", () => {
      expect.hasAssertions();

      expect(
        deriveAdditive({ kind: "measure", slug: "covered-duration" }, catalog),
      ).toBe(false);
      expect(
        deriveAdditive({ kind: "measure", slug: "unique-tags" }, catalog),
      ).toBe(false);
      expect(
        deriveAdditive(
          catalog.metrics.get("average-duration")?.expression ?? {
            kind: "measure",
            slug: "events",
          },
          catalog,
        ),
      ).toBe(false);
      expect(deriveAdditive({ kind: "metric", slug: "nothing" }, catalog)).toBe(
        false,
      );
    });
  });

  describe(deriveEmptyValue, () => {
    const read = (node: ExpressionNode): ReturnType<typeof deriveEmptyValue> =>
      deriveEmptyValue(node, catalog);
    const measure = (slug: string): ExpressionNode => ({
      kind: "measure",
      slug,
    });
    const operate = (
      operator:
        | "add"
        | "coalesce"
        | "divide"
        | "greatest"
        | "least"
        | "multiply"
        | "percent"
        | "subtract",
      ...operands: ExpressionNode[]
    ): ExpressionNode => ({ kind: "operator", operands, operator });

    it("reads 0 for a count, a sum or a union, and none for a least, a greatest or a span", () => {
      expect.hasAssertions();

      expect(read(measure("events"))).toBe(0);
      expect(read(measure("unique-tags"))).toBe(0);
      expect(read(measure("covered-duration"))).toBe(0);
      expect(read(measure("median-progressive-duration"))).toBeNull();
      expect(read(measure("first-start"))).toBeNull();
      expect(read(measure("period-length"))).toBe(1);
    });

    it("works the empty values through the operators as Postgres does", () => {
      expect.hasAssertions();

      const none = measure("first-start");
      const zero = measure("events");
      const two = operate(
        "add",
        measure("period-length"),
        measure("period-length"),
      );

      expect(read(operate("add", two, two))).toBe(4);
      expect(read(operate("subtract", none, two))).toBeNull();
      expect(read(operate("multiply", none, two))).toBeNull();
      expect(read(operate("divide", none, two))).toBeNull();
      expect(read(operate("coalesce", two, none))).toBe(2);
      expect(read(operate("greatest", two, none))).toBe(2);
      expect(read(operate("least", none, two))).toBe(2);
      expect(read(operate("least", two, zero))).toBe(0);
      expect(read(operate("divide", zero, zero))).toBeNull();
      expect(read(operate("divide", two, two))).toBe(1);
      expect(read(operate("add", two, none))).toBeNull();
      expect(read(operate("subtract", two, two))).toBe(0);
      expect(read(operate("multiply", zero, two))).toBe(0);
      expect(read(operate("coalesce", none, two))).toBe(2);
      expect(read(operate("greatest", none, two))).toBe(2);
      expect(read(operate("least", two, none))).toBe(2);
      expect(read(operate("greatest", zero, two))).toBe(2);
      expect(read(operate("least", zero, two))).toBe(0);
      expect(read(operate("percent", two, two))).toBe(100);
      expect(read(operate("percent", zero, two))).toBe(0);
      expect(read(operate("percent", none, two))).toBeNull();
      expect(read(operate("percent", two, none))).toBeNull();
      expect(read(operate("percent", two, zero))).toBeNull();
    });

    it("follows a metric it reads, and reads what the catalog lacks as none", () => {
      expect.hasAssertions();

      expect(read({ kind: "metric", slug: "duration" })).toBe(0);
      expect(read({ kind: "metric", slug: "nothing" })).toBeNull();
      expect(read(measure("nothing"))).toBeNull();
      expect(read(operate("add", measure("events")))).toBeNull();
    });
  });
});
