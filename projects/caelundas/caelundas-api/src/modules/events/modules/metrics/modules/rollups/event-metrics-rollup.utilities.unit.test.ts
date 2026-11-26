import { describe, expect, it } from "vitest";

import { DEFAULT_EVENT_SCOPE } from "../../../filtering/event-filter.constants";
import { EventMetric } from "../inputs/event-metric.entities";

import {
  compileRollupGuard,
  compileRollupRead,
  findRollupTarget,
  isRollupRequest,
} from "./event-metrics-rollup.utilities";

import type { EventMetricsQueryRequest } from "../../event-metrics.types";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";

/** A request for March, with the parts given changed. */
function request(
  rest: Partial<EventMetricsQueryRequest> = {},
): EventMetricsQueryRequest {
  return {
    filter: null,
    grouping: [],
    metrics: [EventMetric.EVENTS],
    period: {
      end: "2026-04-01T00:00:00.000Z",
      start: "2026-03-01T00:00:00.000Z",
    },
    previous: null,
    scope: DEFAULT_EVENT_SCOPE,
    tagRoot: null,
    ...rest,
  };
}

/** A request for the tag level of `field`, with the level's parts given. */
function tagLevel(
  level: Partial<EventMetricsQueryRequest["grouping"][number]> = {},
  field = `tag:${ROOT}`,
): EventMetricsQueryRequest {
  return request({ grouping: [{ field, tags: [], ...level }], level: 0 });
}

describe("event metrics rollup utilities", () => {
  describe(isRollupRequest, () => {
    it("accepts an unfiltered request of metrics the rollups answer", () => {
      expect(isRollupRequest(request())).toBe(true);
    });

    it("refuses a filter and a percent", () => {
      expect(
        isRollupRequest(
          request({ filter: { combinator: "and", groups: [], rules: [] } }),
        ),
      ).toBe(false);
      expect(
        isRollupRequest(request({ metrics: [EventMetric.COVERED_PERCENT] })),
      ).toBe(false);
    });
  });

  describe(findRollupTarget, () => {
    it("reads the whole set from the day grain", () => {
      expect(findRollupTarget(request())?.grain).toBe("day");
    });

    it("reads a calendar field from the day rollup by its column", () => {
      const target = findRollupTarget(
        request({ grouping: [{ field: "month", tags: [] }], level: 0 }),
      );

      expect(target?.grain).toBe("day");
      expect(target?.group).toBe("local_month");
      expect(target?.rollupExtra).toBe(", r.event_names, r.local_month");
    });

    it("adds no column for a day, which every row has", () => {
      const target = findRollupTarget(
        request({ grouping: [{ field: "day", tags: [] }], level: 0 }),
      );

      expect(target?.rollupExtra).toBe(", r.event_names");
      expect(target?.crossingExtra).toBe(", array[x.name] as event_names");
    });

    it("reads the first level of a root's children from the day-tag grain", () => {
      const target = findRollupTarget(tagLevel({ depth: 1 }));

      expect(target).toMatchObject({ grain: "dayTag", root: ROOT });
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
      expect(tagged?.sql).toContain("select c.period, c.local_day, null::uuid");
      expect(whole?.sql).not.toContain("c as not materialized");
    });

    it("is none for a level the rollups cannot answer", () => {
      expect(compileRollupRead(tagLevel({ depth: 2 }), "UTC")).toBeNull();
    });

    it("reads each metric of the whole set", () => {
      const compiled = compileRollupRead(
        request({
          metrics: [EventMetric.EVENTS, EventMetric.UNIQUE_NAMES],
        }),
        "UTC",
      );

      expect(compiled?.parameters).toStrictEqual([
        "2026-03-01T00:00:00.000Z",
        "2026-04-01T00:00:00.000Z",
        "UTC",
      ]);
      expect(compiled?.sql).toContain("(t.events)::float8 as m0");
      expect(compiled?.sql).toContain("unnest(w.event_names)");
      expect(compiled?.sql).not.toMatch(/\{[a-zA-Z]+\}/u);
    });

    it("binds the root of a tag level and of a unique tag count", () => {
      const compiled = compileRollupRead(
        {
          ...tagLevel(),
          metrics: [EventMetric.UNIQUE_NAMES, EventMetric.UNIQUE_TAGS],
          tagRoot: MARS,
        },
        "UTC",
      );

      expect(compiled?.parameters).toStrictEqual([
        "2026-03-01T00:00:00.000Z",
        "2026-04-01T00:00:00.000Z",
        "UTC",
        ROOT,
        MARS,
      ]);
      expect(compiled?.sql).toContain("r.tag_root_id = $4::uuid");
      expect(compiled?.sql).toContain("c.ancestor_id = $5::uuid");
      expect(compiled?.sql).toContain(`r."filter" = 'day-tag-name'`);
      expect(compiled?.sql).toContain(`r."filter" = 'day-tag'`);
    });

    it("reads each side statement once and joins it by the group", () => {
      const compiled = compileRollupRead(
        request({
          grouping: [{ field: "month", tags: [] }],
          level: 0,
          metrics: [
            EventMetric.AVERAGE_DURATION_MINUTES,
            EventMetric.MEDIAN_DURATION_MINUTES,
            EventMetric.COVERED_MINUTES,
          ],
        }),
        "UTC",
      );

      expect(compiled?.sql.match(/durations as \(/gu)).toHaveLength(1);
      expect(compiled?.sql).toContain(
        "left join durations d on d.period = t.period and d.local_month is not distinct from t.local_month",
      );
      expect(compiled?.sql).toContain("range_agg(w.covered_range)");
    });

    it("binds a root that is no tag id as none", () => {
      const compiled = compileRollupRead(
        request({ metrics: [EventMetric.UNIQUE_TAGS], tagRoot: "no-tag" }),
        "UTC",
      );

      expect(compiled?.parameters.at(-1)).toBeNull();
    });

    it("binds no root for a unique tag count without one", () => {
      const compiled = compileRollupRead(
        request({ metrics: [EventMetric.UNIQUE_TAGS] }),
        "UTC",
      );

      expect(compiled?.parameters).toHaveLength(3);
      expect(compiled?.sql).not.toContain("c.ancestor_id = $");
    });
  });

  describe("grain and scope", () => {
    it("pins every read of the facts to one grain", () => {
      expect.hasAssertions();

      const requests = [
        request({ metrics: [EventMetric.UNIQUE_NAMES] }),
        {
          ...tagLevel(),
          metrics: [EventMetric.UNIQUE_NAMES, EventMetric.UNIQUE_TAGS],
        },
      ];

      for (const rest of requests) {
        const sql = compileRollupRead(rest, "UTC")?.sql ?? "";

        expect(sql).toContain("calendar_event_facts");
        expect(sql.match(/calendar_event_facts/gu)).toHaveLength(
          sql.match(/\."filter" = '/gu)?.length ?? 0,
        );
      }
    });

    it("leaves out the phase boundaries unless the scope asks for them", () => {
      expect.hasAssertions();

      const excluded = compileRollupRead(request(), "UTC")?.sql;
      const included = compileRollupRead(
        request({ scope: { includePhaseBoundaries: true } }),
        "UTC",
      )?.sql;

      expect(excluded).toContain("r.is_phase_boundary = false");
      expect(included).not.toContain("is_phase_boundary");
    });
  });
});
