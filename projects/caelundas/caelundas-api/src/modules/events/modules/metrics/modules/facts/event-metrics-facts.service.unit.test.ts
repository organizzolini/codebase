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

import { EventMetricsFactsService } from "./event-metrics-facts.service";

import type { EventGroupLevel } from "../../../grouping/event-grouping.types";
import type { EventMetricsQueryRequest } from "../../event-metrics.types";

const ROOT = "0199b1a0-0000-7000-8000-000000000002";
const MARS = "0199b1a0-0000-7000-8000-000000000001";
const MOON = "0199b1a0-0000-7000-8000-000000000003";
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

describe(EventMetricsFactsService, () => {
  let service: EventMetricsFactsService;

  const providers = [
    EventFilterCalendarFieldsService,
    EventFilterNumbersService,
    EventFilterParametersService,
    EventFilterService,
    EventFilterValuesService,
    EventGroupingService,
  ];

  /** Compiles a request the facts answer, failing the test if they do not. */
  function compile(
    rest: Partial<EventMetricsQueryRequest> = {},
  ): NonNullable<ReturnType<EventMetricsFactsService["compile"]>> {
    const compiled = service.compile(request(rest));

    if (compiled === null) {
      throw new Error("The facts do not answer the request.");
    }

    return compiled;
  }

  beforeAll(async () => {
    ({ instance: service } = await buildTestingModule(
      EventMetricsFactsService,
      { providers },
    ));
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(EventMetricsFactsService, {
      providers,
    });

    expect(instance).toBeInstanceOf(EventMetricsFactsService);
  });

  describe("compile the whole set", () => {
    it("selects each measure a metric reads as a float, grouped by period", () => {
      expect.hasAssertions();

      const compiled = compile({
        metrics: [EventMetric.EVENTS, EventMetric.TOTAL_DURATION_MINUTES],
      });

      expect(compiled.levels).toBe(0);
      expect(compiled.measures).toStrictEqual(["events", "seconds"]);
      expect(compiled.parameters).toStrictEqual([PERIOD.start, PERIOD.end]);
      expect(compiled.sql).toContain(
        "values (0, $1::timestamptz, $2::timestamptz)",
      );
      expect(compiled.sql).toContain(`(count(*))::float8 as "m_events"`);
      expect(compiled.sql).toContain(`as "m_seconds"`);
      expect(compiled.sql).not.toContain(`"m_spans"`);
      expect(compiled.sql).toContain("group by x.period\n");
      expect(compiled.sql).toContain("from ev x");
      expect(compiled.sql).not.toContain("lateral unnest(coalesce");
    });

    it("overlaps the facts' extent with each period, as the events do", () => {
      expect.hasAssertions();

      const compiled = compile({ previous: PREVIOUS });

      expect(compiled.sql).toContain(
        "f.extent && tstzrange(p.period_start, p.period_end, '[)')",
      );
      expect(compiled.sql).toContain("(1, $3::timestamptz, $4::timestamptz)");
      expect(compiled.parameters).toStrictEqual([
        PERIOD.start,
        PERIOD.end,
        PREVIOUS.start,
        PREVIOUS.end,
      ]);
    });

    it("clips to the period for the percents and unions for the covered time", () => {
      expect.hasAssertions();

      const compiled = compile({
        metrics: [
          EventMetric.TOTAL_TIME_PERCENT,
          EventMetric.PROGRESSIVE_COVERED_PERCENT,
          EventMetric.COVERED_MINUTES,
        ],
      });

      expect(compiled.measures).toStrictEqual([
        "clippedSeconds",
        "coveredSeconds",
        "periodSeconds",
        "progressiveCoveredClippedSeconds",
      ]);
      expect(compiled.sql).toContain('least(x."end", x.period_end)');
      expect(compiled.sql).toContain("range_agg(");
    });
  });

  describe("compile a grouping", () => {
    it("expands the events by the picked tags they carry, a step a level", () => {
      expect.hasAssertions();

      const compiled = compile({
        grouping: [
          level(`tag:${ROOT}`, { tags: [MARS] }),
          level(`tag:${ROOT}`, { depth: 1, tags: [MOON, "not-a-tag"] }),
        ],
      });

      expect(compiled.levels).toBe(2);
      expect(compiled.parameters).toContainEqual([MARS]);
      // A pick that is no tag id is dropped, not cast.
      expect(compiled.parameters).toContainEqual([MOON]);
      expect(compiled.sql).toContain("unnest(e.tag_ids) as u (id)");
      expect(compiled.sql).toContain("x0 as (");
      expect(compiled.sql).toContain("from x0 e");
      expect(compiled.sql).toContain("x1 as (");
      expect(compiled.sql).toContain("a_total as (");
      expect(compiled.sql).toContain("a0 as (");
      expect(compiled.sql).toContain("a1 as (");
      expect(compiled.sql).toContain("group by x.period, x.t0, x.t1");
      expect(compiled.sql).toContain("null::text as t1");
      expect(compiled.sql).toContain("left join dim d on d.key = r.leaf");
      expect(compiled.sql).toContain("from tag_info t");
    });

    it("names no tags for a grouping of calendar fields", () => {
      expect.hasAssertions();

      const compiled = compile({
        grouping: [level("year"), level("weekday"), level("nonsense")],
      });

      expect(compiled.levels).toBe(3);
      expect(compiled.sql).toContain("e.start_local_day");
      expect(compiled.sql).not.toContain("left join dim");
      expect(compiled.sql).toContain(`null::text as label`);
    });

    it("answers a tag level that picks none, or one under a parent, with none", () => {
      expect.hasAssertions();

      expect(
        service.compile(request({ grouping: [level(`tag:${ROOT}`)] })),
      ).toBeNull();
      expect(
        service.compile(
          request({
            grouping: [
              level("year"),
              level(`tag:${ROOT}`, { parent: MARS, tags: [MARS] }),
            ],
          }),
        ),
      ).toBeNull();
    });
  });

  describe("compile a filter", () => {
    it("reads the tags from each fact's own array", () => {
      expect.hasAssertions();

      const compiled = compile({
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
      });

      expect(compiled.sql).toContain("where ((exists (");
      expect(compiled.sql).toContain("from unnest(e.tag_ids) as m (tag_id)");
      expect(compiled.sql).not.toContain("from calendar_event_tags et");
      expect(compiled.parameters).toContainEqual([MARS]);
    });

    it("reads the calendar fields from the event columns the facts expose", () => {
      expect.hasAssertions();

      const compiled = compile({
        filter: {
          combinator: "and",
          groups: [],
          rules: [
            {
              negated: false,
              operator: "is_any_of",
              path: ["temporality"],
              values: ["Instant"],
            },
          ],
        },
      });

      expect(compiled.sql).toContain("e.temporality");
      expect(compiled.sql).toContain(
        "case when f.is_instant then 'Instant' else 'Duration' end as temporality",
      );
    });

    it("adds no condition for a filter with no usable rule", () => {
      expect.hasAssertions();

      const compiled = compile({
        filter: { combinator: "and", groups: [], rules: [] },
      });

      expect(compiled.sql).not.toContain("where (");
    });
  });

  describe("compile the unique tags", () => {
    it("counts the direct tags of each group's events apart", () => {
      expect.hasAssertions();

      const compiled = compile({
        grouping: [level("year")],
        metrics: [EventMetric.UNIQUE_TAGS],
      });

      expect(compiled.measures).toStrictEqual(["tags"]);
      expect(compiled.sql).toContain("tags_total as (");
      expect(compiled.sql).toContain("tags0 as (");
      expect(compiled.sql).toContain("unnest(x.direct_tag_ids) as d (id)");
      expect(compiled.sql).toContain(
        "coalesce(d_tags.t0, '~null~') = coalesce(a.t0, '~null~')",
      );
      expect(compiled.sql).not.toContain("c.ancestor_id = $");
    });

    it("limits them to the tags beneath a root", () => {
      expect.hasAssertions();

      const compiled = compile({
        metrics: [EventMetric.UNIQUE_TAGS],
        tagRoot: ROOT,
      });

      expect(compiled.sql).toContain("from tags_closure c");
      expect(compiled.parameters).toContain(ROOT);
    });

    it("matches no tag for a root that is no tag id", () => {
      expect.hasAssertions();

      const compiled = compile({
        metrics: [EventMetric.UNIQUE_TAGS],
        tagRoot: "not-a-tag",
      });

      expect(compiled.parameters).toContain(null);
      expect(compiled.parameters).not.toContain("not-a-tag");
    });

    it("counts none apart when the metric is not asked for", () => {
      expect.hasAssertions();

      expect(compile({ tagRoot: ROOT }).sql).not.toContain("tags_total");
    });

    it("counts names and days within the group, not apart", () => {
      expect.hasAssertions();

      const compiled = compile({
        grouping: [level("year")],
        metrics: [EventMetric.UNIQUE_NAMES, EventMetric.DAYS_WITH_EVENTS],
      });

      expect(compiled.measures).toStrictEqual(["days", "names"]);
      expect(compiled.sql).toContain("count(distinct x.summary)");
      expect(compiled.sql).toContain("count(distinct x.start_local_day)");
      expect(compiled.sql).not.toContain("names0 as (");
    });
  });

  describe("pin the grain and the scope", () => {
    it("pins every read of the facts to the event grain", () => {
      expect.hasAssertions();

      const requests = [
        request(),
        request({
          grouping: [level("year")],
          metrics: [EventMetric.UNIQUE_TAGS],
        }),
        request({ grouping: [level("tag:*", { tags: [MARS] })] }),
      ];

      for (const rest of requests) {
        const sql = service.compile(rest)?.sql ?? "";

        expect(sql.match(/calendar_event_facts/gu)).toHaveLength(
          sql.match(/\."filter" = '/gu)?.length ?? 0,
        );
        expect(sql).toContain(`f."filter" = 'event'`);
      }
    });

    it("leaves out the phase boundaries unless the scope asks for them", () => {
      expect.hasAssertions();

      expect(compile().sql).toContain(
        `f."filter" = 'event' and f.is_phase_boundary = false`,
      );

      const included = compile({ scope: { includePhaseBoundaries: true } });

      expect(included.sql).toContain(`f."filter" = 'event'`);
      expect(included.sql).not.toContain("is_phase_boundary");
    });
  });
});
