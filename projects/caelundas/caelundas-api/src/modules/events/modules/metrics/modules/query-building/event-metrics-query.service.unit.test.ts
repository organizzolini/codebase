import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { createRequest as request } from "../../../../../../../testing/metric-catalog";
import { EventFilterService } from "../../../filtering/event-filter.service";
import { EventFilterCalendarFieldsService } from "../../../filtering/modules/query-building/event-filter-calendar-fields.service";
import { EventFilterParametersService } from "../../../filtering/modules/query-building/event-filter-parameters.service";
import { EventFilterNumbersService } from "../../../filtering/modules/values/event-filter-numbers.service";
import { EventFilterValuesService } from "../../../filtering/modules/values/event-filter-values.service";
import { EventGroupingService } from "../../../grouping/event-grouping.service";

import { EventMetricsQueryService } from "./event-metrics-query.service";

import type { EventGroupLevel } from "../../../grouping/event-grouping.types";

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
        request({ metrics: ["events", "progressive-events"] }),
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

      const unique = ["unique-tags"];
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
    function compileMetric(metric: string): string {
      return service.compile(request({ metrics: [metric] })).sql;
    }

    it("hands each period's bounds to the events, to clip them", () => {
      expect.hasAssertions();

      expect(compileMetric("events")).toContain(
        "select p.period, p.period_start, p.period_end, e.*",
      );
      expect(compileMetric("events")).toContain(`e.*, 1 as "events"`);
    });

    it("clips the union of the intervals to the period and divides by its minutes", () => {
      expect.hasAssertions();

      const sql = compileMetric("covered-percent");

      expect(sql).toContain("range_agg(tstzrange(");
      expect(sql).toContain('greatest(e."start", e.period_start)');
      expect(sql).toContain('least(e."end", e.period_end)');
      expect(sql).toContain("(100.0 * ((select coalesce(sum(");
      expect(sql).toContain("/ nullif((extract(epoch from (min(e.period_end)");
      expect(sql).not.toContain("tag_path = 'Temporality / Progressive'");
    });

    it("sums the clipped intervals, overlaps once per event", () => {
      expect.hasAssertions();

      const sql = compileMetric("total-time-percent");

      expect(sql).toContain(
        'sum(extract(epoch from least(e."end", e.period_end) - greatest(e."start", e.period_start)) / 60)',
      );
      expect(sql).not.toContain("range_agg");
      expect(sql).not.toContain("Temporality");
    });

    it("narrows the progressive percents to the progressive tag", () => {
      expect.hasAssertions();

      const covered = compileMetric("progressive-covered-percent");
      const counted = compileMetric("progressive-total-percent");

      expect(covered).toContain("range_agg(");
      expect(covered).toContain('filter (where e."is_progressive")');
      expect(covered).toContain("tag_path = 'Temporality / Progressive'");
      expect(counted).not.toContain("range_agg");
      expect(counted).toContain('filter (where e."is_progressive")');
      expect(counted).toContain("tag_path = 'Temporality / Progressive'");
    });

    it("measures them per group at a level and in the previous period", () => {
      expect.hasAssertions();

      const compiled = service.compile(
        request({
          grouping: [level("year")],
          level: 0,
          metrics: ["covered-percent"],
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

    it("measures the children of the last chain row's tag, skipped levels included, and names them once grouped", () => {
      expect.hasAssertions();

      const field = `tag:${ROOT}`;
      const compiled = service.compile(
        request({
          children: true,
          grouping: [level(field), level(field, { parent: MARS })],
        }),
      );

      expect(compiled.sql).toContain("join calendar_event_tag_sets ts on");
      expect(compiled.sql).toContain("kids as (");
      expect(compiled.sql).toContain("from tag_edges ed");
      expect(compiled.sql).toContain(
        "ed.target_node = any(e.tag_ids || e.ancestor_tag_ids)",
      );
      expect(compiled.sql).toContain("(case when l1.effective ~");
      expect(compiled.sql).toContain("l1.id as parent_id");
      expect(compiled.sql).toContain(
        'group by e.period, l1.id, l1.effective, lc."key"',
      );
      expect(compiled.sql).toContain("p.tag_parent_id::text = k.host");
      expect(compiled.sql).toContain("k.m0");
      expect(compiled.sql).not.toContain("where not l1.skipped");
    });

    it("measures no children for no grouping", () => {
      expect.hasAssertions();

      const compiled = service.compile(request({ children: true }));

      expect(compiled.sql).not.toContain("lc.");
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
