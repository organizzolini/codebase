import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { DEFAULT_EVENT_SCOPE } from "../../../filtering/event-filter.constants";
import { EventFilterService } from "../../../filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "../../../filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "../../../filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "../../../filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "../../../filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "../../../grouping/event-grouping.service";
import { EventMetric } from "../inputs/event-metric.entities";

import { EventMetricsQueryService } from "./event-metrics-query.service";

import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type { EventMetricsQueryRequest } from "../../event-metrics.types";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";
const PERIOD = {
  end: "2026-04-01T00:00:00.000Z",
  start: "2026-03-01T00:00:00.000Z",
};
const PREVIOUS = {
  end: "2026-03-01T00:00:00.000Z",
  start: "2026-01-29T00:00:00.000Z",
};

/** One level with the optional parts defaulted. */
function level(
  field: string,
  rest: Partial<EventGroupLevel> = {},
): EventGroupLevel {
  return { field, tags: [], ...rest };
}

/** A request for the whole set, with the parts given changed. */
function request(
  rest: Partial<EventMetricsQueryRequest> = {},
): EventMetricsQueryRequest {
  return {
    filter: null,
    grouping: [],
    metrics: [EventMetric.EVENTS],
    period: PERIOD,
    previous: null,
    scope: DEFAULT_EVENT_SCOPE,
    tagRoot: null,
    ...rest,
  };
}

describe(EventMetricsQueryService, () => {
  let service: EventMetricsQueryService;

  const providers = [
    EventFilterCalendarFieldsService,
    EventFilterNumbersService,
    EventFilterParametersService,
    EventFilterService,
    EventFilterValuesService,
    EventGroupingService,
  ];

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      EventMetricsQueryService,
      { providers },
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EventMetricsQueryService, {
      providers,
    });

    expect(instance).toBeInstanceOf(EventMetricsQueryService);
  });

  describe("compile the whole set", () => {
    it("binds the period and selects each metric as a float, grouped by period", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({ metrics: [EventMetric.EVENTS, EventMetric.SPANS] }),
      );

      expect(compiled.parameters).toStrictEqual([PERIOD.start, PERIOD.end]);
      expect(compiled.sql).toContain(
        "values (0, $1::timestamptz, $2::timestamptz)",
      );
      expect(compiled.sql).toContain("::float8 as m0");
      expect(compiled.sql).toContain("::float8 as m1");
      expect(compiled.sql).toContain("group by e.period\n");
      expect(compiled.sql).not.toContain("lateral");
    });

    it("adds the previous period as a second row", () => {
      expect.hasAssertions();

      const compiled = service.compile(request({ previous: PREVIOUS }));

      expect(compiled.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        PREVIOUS.start,
        PREVIOUS.end,
      ]);
      expect(compiled.sql).toContain("(1, $3::timestamptz, $4::timestamptz)");
    });

    it("numbers the filter's placeholders after the periods", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({
          filter: {
            combinator: "and",
            groups: [],
            rules: [
              {
                negated: false,
                operator: "is_any_of",
                path: [`tag:${ROOT}`],
                values: [MARS],
              },
            ],
          },
          previous: PREVIOUS,
        }),
      );

      expect(compiled.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        PREVIOUS.start,
        PREVIOUS.end,
        [MARS],
      ]);
      expect(compiled.sql).toContain("$5");
    });

    it("measures no metrics when none are asked for", () => {
      expect.hasAssertions();

      expect(service.compile(request({ metrics: [] })).sql).not.toContain(
        "float8",
      );
    });

    it("binds a tag root only for the unique tags it limits", () => {
      expect.hasAssertions();

      const unique = [EventMetric.UNIQUE_TAGS];
      const rooted = service.compile(
        request({ metrics: unique, tagRoot: ROOT }),
      );
      const invalid = service.compile(
        request({ metrics: unique, tagRoot: "Planet" }),
      );
      const unrooted = service.compile(request({ metrics: unique }));
      const ignored = service.compile(request({ tagRoot: ROOT }));

      expect(rooted.parameters).toStrictEqual([PERIOD.start, PERIOD.end, ROOT]);
      expect(rooted.sql).toContain("c.ancestor_id = $3::uuid");
      expect(rooted.sql).toContain("t.tag_id <> $3::uuid");
      expect(invalid.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        null,
      ]);
      expect(unrooted.parameters).toHaveLength(2);
      expect(unrooted.sql).not.toContain("c.ancestor_id = $");
      expect(ignored.parameters).toHaveLength(2);
    });
  });

  describe("compile the percent metrics", () => {
    /** The statement for one metric. */
    function compileMetric(metric: EventMetric): string {
      return service.compile(request({ metrics: [metric] })).sql;
    }

    it("hands each period's bounds to the events, to clip them", () => {
      expect.hasAssertions();

      expect(compileMetric(EventMetric.EVENTS)).toContain(
        "select p.period, p.period_start, p.period_end, e.*",
      );
    });

    it("clips the union of the intervals to the period and divides by its minutes", () => {
      expect.hasAssertions();

      const sql = compileMetric(EventMetric.COVERED_PERCENT);

      expect(sql).toContain("range_agg(tstzrange(");
      expect(sql).toContain('greatest(e."start", e.period_start)');
      expect(sql).toContain('least(e."end", e.period_end)');
      expect(sql).toContain("* 100 / nullif(");
      expect(sql).toContain("min(e.period_end) - min(e.period_start)");
      expect(sql).not.toContain("tag_path = 'Temporality / Progressive'");
    });

    it("sums the clipped intervals, overlaps once per event", () => {
      expect.hasAssertions();

      const sql = compileMetric(EventMetric.TOTAL_TIME_PERCENT);

      expect(sql).toContain(
        'sum(extract(epoch from least(e."end", e.period_end) - greatest(e."start", e.period_start)) / 60)',
      );
      expect(sql).not.toContain("range_agg");
      expect(sql).not.toContain("Temporality");
    });

    it("narrows the progressive percents to the progressive tag", () => {
      expect.hasAssertions();

      const covered = compileMetric(EventMetric.PROGRESSIVE_COVERED_PERCENT);
      const counted = compileMetric(EventMetric.PROGRESSIVE_TOTAL_PERCENT);

      expect(covered).toContain("range_agg(");
      expect(covered).toContain("filter (where exists (");
      expect(covered).toContain("tag_path = 'Temporality / Progressive'");
      expect(counted).not.toContain("range_agg");
      expect(counted).toContain("tag_path = 'Temporality / Progressive'");
    });

    it("measures them per group at a level and in the previous period", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({
          grouping: [level("year")],
          level: 0,
          metrics: [EventMetric.COVERED_PERCENT],
          previous: PREVIOUS,
        }),
      );

      expect(compiled.sql).toContain("(1, $3::timestamptz, $4::timestamptz)");
      expect(compiled.sql).toContain("range_agg(");
      expect(compiled.sql).toContain('group by e.period, l0.id, l0."key"');
    });
  });

  describe("compile a level", () => {
    it("joins the first level, naming no parent", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({ grouping: [level(`tag:${ROOT}`)], level: 0 }),
      );

      expect(compiled.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        ROOT,
        1,
      ]);
      expect(compiled.sql).toContain(") l0");
      expect(compiled.sql).toContain("''::text || '/0:'");
      expect(compiled.sql).toContain("''::text as parent_id");
      expect(compiled.sql).toContain("where not l0.skipped");
      expect(compiled.sql).toContain('group by e.period, l0.id, l0."key"');
    });

    it("joins every level up to the one measured, each after its parent", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({
          grouping: [level("year"), level("month"), level("day")],
          level: 1,
        }),
      );

      expect(compiled.sql).toContain(") l0");
      expect(compiled.sql).toContain(") l1");
      expect(compiled.sql).not.toContain(") l2");
      expect(compiled.sql).toContain("l0.id || '/1:'");
      expect(compiled.sql).toContain("l0.id as parent_id");
      expect(compiled.sql).toContain(
        'group by e.period, l1.id, l0.id, l1."key"',
      );
    });

    it("lets a level that refines the one before split only its parent's group", () => {
      expect.hasAssertions();

      const field = `tag:${ROOT}`;
      const compiled = service.compile(
        request({
          grouping: [level(field), level(field, { parent: MARS })],
          level: 1,
        }),
      );

      expect(compiled.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        ROOT,
        1,
        MARS,
        MARS,
      ]);
      expect(compiled.sql).toContain("l0.effective is distinct from $6::text");
      expect(compiled.sql).toContain("not one.skipped");
    });

    it("does not refine a level of another field that names a parent", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({
          grouping: [level("year"), level(`tag:${ROOT}`, { parent: MARS })],
          level: 1,
        }),
      );

      expect(compiled.sql).not.toContain("is distinct from");
      expect(compiled.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        MARS,
      ]);
    });
  });

  describe("scope", () => {
    it("leaves out the phase boundaries by default", () => {
      expect.hasAssertions();

      expect(service.compile(request()).sql).toContain("where not exists (");
    });

    it("reads them when the scope asks for them", () => {
      expect.hasAssertions();

      const { sql } = service.compile(
        request({ scope: { includePhaseBoundaries: true } }),
      );

      expect(sql).toContain("where true");
      expect(sql).not.toContain("pet.calendar_event_id");
    });
  });
});
