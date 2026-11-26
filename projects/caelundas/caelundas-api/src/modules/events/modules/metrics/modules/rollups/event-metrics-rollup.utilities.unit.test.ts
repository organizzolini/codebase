import { describe, expect, it } from "vitest";

import { createRequest } from "../../../../../../../testing/metric-catalog";

import {
  compileRollupGuard,
  compileRollupRead,
  findRollupTarget,
  isRollupRequest,
} from "./event-metrics-rollup.utilities";

import type { RequestParts } from "../../../../../../../testing/metric-catalog";
import type { EventMetricsQueryRequest } from "../../event-metrics.types";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";

/** A request for March in the default scope, which the facts are built for. */
function request(rest: RequestParts = {}): EventMetricsQueryRequest {
  return createRequest(rest);
}

/** A request for the tag level of `field`, with the level's parts given. */
function tagLevel(
  level: Partial<EventMetricsQueryRequest["grouping"][number]> = {},
  field = `tag:${ROOT}`,
  rest: RequestParts = {},
): EventMetricsQueryRequest {
  return request({
    grouping: [{ field, tags: [], ...level }],
    level: 0,
    ...rest,
  });
}

describe("event metrics rollup utilities", () => {
  describe(isRollupRequest, () => {
    it("accepts an unfiltered request of measures that merge, in the default scope", () => {
      expect(isRollupRequest(request())).toBe(true);
    });

    it("refuses a scope that keeps the phase boundaries, which the facts leave out", () => {
      expect(
        isRollupRequest(
          createRequest({ scope: { includePhaseBoundaries: true } }),
        ),
      ).toBe(false);
    });

    it("refuses a filter, a percent and a measure that does not merge", () => {
      expect(
        isRollupRequest(
          request({ filter: { combinator: "and", groups: [], rules: [] } }),
        ),
      ).toBe(false);
      expect(isRollupRequest(request({ metrics: ["covered-percent"] }))).toBe(
        false,
      );

      for (const metric of [
        "unique-names",
        "unique-tags",
        "covered-duration",
        "median-duration",
        "longest-duration",
        "shortest-duration",
      ]) {
        expect(isRollupRequest(request({ metrics: [metric] }))).toBe(false);
      }
    });
  });

  describe(findRollupTarget, () => {
    it("reads the whole set from the days' facts", () => {
      expect(findRollupTarget(request())).toMatchObject({
        group: null,
        root: null,
      });
    });

    it("reads a calendar field from the days' facts by its column", () => {
      const target = findRollupTarget(
        request({ grouping: [{ field: "month", tags: [] }], level: 0 }),
      );

      expect(target?.group).toBe("month");
      expect(target?.rollupExtra).toBe(
        ', date_trunc(\'month\', r."day"::timestamp)::date as "month"',
      );
    });

    it("adds no column for a day, which every row has", () => {
      const target = findRollupTarget(
        request({ grouping: [{ field: "day", tags: [] }], level: 0 }),
      );

      expect(target?.rollupExtra).toBe("");
      expect(target?.crossingExtra).toBe("");
    });

    it("reads the first level of a root's children from the tag filters", () => {
      const target = findRollupTarget(tagLevel({ depth: 1 }));

      expect(target).toMatchObject({ group: "tag_id", root: ROOT });
      expect(target?.cells).toContain("join filters tf on tf.group_id =");
    });

    it("refuses every level it cannot answer", () => {
      const levels = [
        tagLevel({ parent: MARS }),
        tagLevel({ tags: [MARS] }),
        tagLevel({ depth: 2 }),
        tagLevel({}, "tag:not-a-tag"),
        tagLevel({}, `tag:${ROOT.toUpperCase()}`),
        tagLevel({}, "week"),
        tagLevel({}, "hour"),
        request({ grouping: [{ field: "year", tags: [] }], level: 1 }),
        request({ grouping: [], level: 0 }),
      ];

      for (const level of levels) {
        expect(findRollupTarget(level)).toBeNull();
      }
    });
  });

  describe(compileRollupGuard, () => {
    it("binds each period", () => {
      const compiled = compileRollupGuard(
        request({
          previous: {
            end: "2026-03-01T00:00:00.000Z",
            start: "2026-01-29T00:00:00.000Z",
          },
        }),
      );

      expect(compiled.parameters).toStrictEqual([
        "2026-03-01T00:00:00.000Z",
        "2026-04-01T00:00:00.000Z",
        "2026-01-29T00:00:00.000Z",
        "2026-03-01T00:00:00.000Z",
      ]);
      expect(compiled.sql).toContain(
        "(0, $1::timestamptz, $2::timestamptz), (1, $3::timestamptz, $4::timestamptz)",
      );
    });
  });

  describe(compileRollupRead, () => {
    it("reads the events no tag of a level names, for a tag level only", () => {
      const tagged = compileRollupRead(tagLevel(), "UTC");
      const whole = compileRollupRead(request(), "UTC");

      expect(tagged?.sql).toContain("c as not materialized");
      expect(tagged?.sql).toContain('select c.period, c."day", null::uuid');
      expect(whole?.sql).not.toContain("c as not materialized");
    });

    it("is none for a level the rollups cannot answer", () => {
      expect(compileRollupRead(tagLevel({ depth: 2 }), "UTC")).toBeNull();
    });

    it("reads each measure of the whole set from the day filters' facts", () => {
      const compiled = compileRollupRead(
        request({ metrics: ["events", "first-start"] }),
        "UTC",
      );

      expect(compiled?.parameters).toStrictEqual([
        "2026-03-01T00:00:00.000Z",
        "2026-04-01T00:00:00.000Z",
        "UTC",
      ]);
      expect(compiled?.sql).toContain(`((t."m_events")::float8)::float8 as m0`);
      expect(compiled?.sql).toContain(
        `((t."m_first-start")::float8)::float8 as m1`,
      );
      expect(compiled?.sql).toContain(
        "join calendar_event_facts r on r.filter_id = df.id",
      );
      expect(compiled?.sql).not.toMatch(/\{[a-zA-Z]+\}/u);
    });

    it("binds the root of a tag level", () => {
      const compiled = compileRollupRead(tagLevel(), "UTC");

      expect(compiled?.parameters).toStrictEqual([
        "2026-03-01T00:00:00.000Z",
        "2026-04-01T00:00:00.000Z",
        "UTC",
        ROOT,
      ]);
      expect(compiled?.sql).toContain("ct.parent_id = $4::uuid");
      expect(compiled?.sql).toContain(
        "join calendar_event_facts r on r.filter_id = tf.id",
      );
    });

    it("computes each measure that merges once, over the pivoted rows", () => {
      const compiled = compileRollupRead(
        request({
          grouping: [{ field: "month", tags: [] }],
          level: 0,
          metrics: ["average-duration", "days-with-events"],
        }),
        "UTC",
      );

      expect(compiled?.sql).toContain(`sum(w."duration_minutes")`);
      expect(compiled?.sql).toContain(`count(distinct w."day")`);
      expect(compiled?.sql).not.toContain("range_agg");
      expect(compiled?.sql).not.toContain("unnest");
    });
  });

  describe("scope", () => {
    it("leaves the phase boundaries out of the events it reads, as the facts do", () => {
      expect.hasAssertions();

      const sql = compileRollupRead(tagLevel(), "UTC")?.sql;

      expect(sql).toContain("Aspect / Phase");
      expect(sql).toContain("not (f.tag_ids &&");
    });

    it("reads the events whole when the scope keeps the boundaries", () => {
      expect.hasAssertions();

      const sql = compileRollupRead(
        tagLevel({}, `tag:${ROOT}`, {
          scope: { includePhaseBoundaries: true },
        }),
        "UTC",
      )?.sql;

      expect(sql).not.toContain("not (f.tag_ids &&");
    });
  });
});
