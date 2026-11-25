import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  CaelundasDatabaseService,
  CalendarEventTag,
  Tag,
} from "@codebase/caelundas-db";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startEventsApplication,
} from "../../../../../../../testing/events-application";
import { EventsService } from "../../../../events.service";
import { EventFilterCombinator } from "../../../filtering/modules/rules/event-filter-combinator.entities";
import { EventMetricsService } from "../../event-metrics.service";
import { EventMetric } from "../inputs/event-metric.entities";

import {
  DAY_ROLLUP_TABLE,
  DAY_TAG_ROLLUP_TABLE,
} from "./event-metrics-rollup.constants";

import type { EventsApplication } from "../../../../../../../testing/events-application";
import type { EventMetricsInputEntity } from "../inputs/event-metrics-input.entities";

/** A period of ten New York days, from and to a local midnight. */
const WINDOW = {
  end: "2026-01-20T05:00:00.000Z",
  start: "2026-01-10T05:00:00.000Z",
};

/** The same ten days, but for an event reaching into it from before. */
const NARROWER = {
  end: "2026-01-20T05:00:00.000Z",
  start: "2026-01-13T05:00:00.000Z",
};

/** Every metric the rollups answer. */
const ROLLUP_METRICS = [
  EventMetric.AVERAGE_DURATION_MINUTES,
  EventMetric.COVERED_MINUTES,
  EventMetric.DAYS_WITH_EVENTS,
  EventMetric.EVENTS,
  EventMetric.FIRST_START,
  EventMetric.INSTANTS,
  EventMetric.LAST_START,
  EventMetric.LONGEST_DURATION_MINUTES,
  EventMetric.MEDIAN_DURATION_MINUTES,
  EventMetric.PROGRESSIVE_HOURS,
  EventMetric.SHORTEST_DURATION_MINUTES,
  EventMetric.SPANS,
  EventMetric.TOTAL_DURATION_MINUTES,
  EventMetric.UNIQUE_NAMES,
  EventMetric.UNIQUE_TAGS,
];

/** One event of the fixture, in New York, with the tags it is given. */
interface Seed {
  end: string;
  start: string;
  summary: string;
  tags: string[];
}

/** The tags, each with the one it sits beneath. */
const TAGS: [string, string | undefined][] = [
  ["Body", undefined],
  ["Mars", "Body"],
  ["Moon", "Body"],
  ["Sun", "Body"],
  ["Aspect", undefined],
  ["Conjunct", "Aspect"],
  ["Trine", "Aspect"],
  ["Phase", "Aspect"],
  ["Forming", "Phase"],
  ["Temporality", undefined],
  ["Progressive", "Temporality"],
];

/** The events: ten days of the window, and the ten before it. */
const SEEDS: Seed[] = [
  {
    end: "2026-01-13T09:00:00.000Z",
    start: "2026-01-11T03:00:00.000Z",
    summary: "Mars Retrograde",
    tags: ["Mars", "Progressive", "Conjunct"],
  },
  {
    end: "2026-01-12T12:00:00.000Z",
    start: "2026-01-12T12:00:00.000Z",
    summary: "Moon Conjunct Mars",
    tags: ["Moon", "Mars", "Conjunct"],
  },
  {
    end: "2026-01-12T13:30:00.000Z",
    start: "2026-01-12T12:00:00.000Z",
    summary: "Moon Trine Sun",
    tags: ["Moon", "Sun", "Trine"],
  },
  {
    end: "2026-01-12T15:00:00.000Z",
    start: "2026-01-12T13:00:00.000Z",
    summary: "Mars Station",
    tags: ["Mars", "Progressive"],
  },
  {
    end: "2026-01-15T10:45:00.000Z",
    start: "2026-01-15T10:00:00.000Z",
    summary: "Mars Station",
    tags: ["Mars"],
  },
  {
    end: "2026-01-18T05:00:00.000Z",
    start: "2026-01-18T04:00:00.000Z",
    summary: "Sun Day",
    tags: ["Sun", "Progressive", "Conjunct"],
  },
  {
    end: "2026-01-16T12:00:00.000Z",
    start: "2026-01-16T12:00:00.000Z",
    summary: "Forming",
    tags: ["Mars", "Forming"],
  },
  {
    end: "2026-01-05T11:00:00.000Z",
    start: "2026-01-05T10:00:00.000Z",
    summary: "Mars Station",
    tags: ["Mars"],
  },
  {
    end: "2026-01-08T12:00:00.000Z",
    start: "2026-01-08T12:00:00.000Z",
    summary: "Moon Past",
    tags: ["Moon", "Conjunct"],
  },
  {
    end: "2026-01-01T05:00:00.000Z",
    start: "2026-01-01T05:00:00.000Z",
    summary: "New Year",
    tags: ["Sun"],
  },
];

/** Rounds every number to the microsecond, so floats compare equal. */
function normalize(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, item: unknown) =>
      typeof item === "number" ? Math.round(item * 1e6) / 1e6 : item,
    ),
  );
}

/**
 * Measures a New York fixture over the rollups and over the events, and asserts
 * each answer is the other's, in every grouping the rollups read.
 */
describe("event metrics rollups", () => {
  let application: EventsApplication;
  let eventsService: EventsService;
  let fallback = false;
  let metricsService: EventMetricsService;
  let queries: string[] = [];
  const tags = new Map<string, Tag>();

  /** Measures with the rollups, or without, and says what ran. */
  async function measure(
    input: EventMetricsInputEntity,
    withoutRollups: boolean,
  ): Promise<{ result: unknown; sql: string }> {
    fallback = withoutRollups;
    queries = [];

    const result = normalize(await metricsService.findMetrics(input));

    return { result, sql: queries.join("\n") };
  }

  /** Asserts both paths agree, and returns the SQL the rollup path ran. */
  async function expectEqual(input: EventMetricsInputEntity): Promise<string> {
    const rollup = await measure(input, false);
    const events = await measure(input, true);

    expect(rollup.result).toStrictEqual(events.result);

    return rollup.sql;
  }

  /** Saves a tag, beneath `parent` when one is named. */
  async function addTag(name: string, parent?: string): Promise<void> {
    const repository = application.database.dataSource.getTreeRepository(Tag);
    const above = tags.get(parent ?? "");

    tags.set(
      name,
      await repository.save(
        repository.create(
          above === undefined ? { name } : { name, parent: above },
        ),
      ),
    );
  }

  /** Inserts an event and links its tags. */
  async function addEvent(seed: Seed): Promise<void> {
    const [event] = await application.database.dataSource.query<
      [{ id: string }]
    >(
      `insert into calendar_events
         (summary, description, "start", "end", latitude, longitude, timezone)
       values ($1, $1, $2, $3, 40.7128, -74.006, 'America/New_York')
       returning id`,
      [seed.summary, seed.start, seed.end],
    );

    for (const name of seed.tags) {
      await application.database.repository(CalendarEventTag).insert({
        calendarEventId: event.id,
        tagId: tags.get(name)?.id ?? "",
      });
    }
  }

  /** Rebuilds the read model and the metrics views. */
  async function refresh(): Promise<void> {
    await application.database.module
      .get(CaelundasDatabaseService)
      .refreshReadModel(application.database.dataSource.manager);
  }

  beforeAll(async () => {
    application = await startEventsApplication();
    eventsService = application.database.module.get(EventsService, {
      strict: false,
    });
    metricsService = application.database.module.get(EventMetricsService, {
      strict: false,
    });

    const select = eventsService.select.bind(eventsService);

    vi.spyOn(eventsService, "select").mockImplementation(
      async (sql, parameters, schema) => {
        queries.push(sql);

        return fallback && sql.includes("from zone z")
          ? []
          : select(sql, parameters, schema);
      },
    );

    for (const [name, parent] of TAGS) {
      await addTag(name, parent);
    }

    for (const seed of SEEDS) {
      await addEvent(seed);
    }

    await refresh();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("reads the whole set from the day rollup, as the events read", async () => {
    expect.hasAssertions();

    const sql = await expectEqual({
      compareToPrevious: true,
      metrics: ROLLUP_METRICS,
      period: WINDOW,
    });

    const { total } = await metricsService.findMetrics({
      metrics: [EventMetric.EVENTS],
      period: WINDOW,
    });

    expect(sql).toContain(`from ${DAY_ROLLUP_TABLE} r`);
    expect(sql).not.toContain("calendar_event_derived_times");
    // Six events start in the window; the forming one is left out.
    expect(total[0]?.value).toBe(6);
  });

  it("counts the tags beneath a root, as the events count them", async () => {
    expect.hasAssertions();

    await expectEqual({
      compareToPrevious: true,
      metrics: [EventMetric.EVENTS, EventMetric.UNIQUE_TAGS],
      period: WINDOW,
      tagRoot: tags.get("Aspect")?.id ?? "",
    });
  });

  it("reads the children of a root from the day and tag rollup", async () => {
    expect.hasAssertions();

    const sql = await expectEqual({
      compareToPrevious: true,
      grouping: [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
      metrics: ROLLUP_METRICS,
      period: WINDOW,
    });

    const { groups } = await metricsService.findMetrics({
      grouping: [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
      metrics: [EventMetric.EVENTS],
      period: WINDOW,
    });

    expect(sql).toContain(`from ${DAY_TAG_ROLLUP_TABLE} r`);
    expect(groups.map(({ label }) => label)).toStrictEqual([
      "Mars",
      "Moon",
      "Sun",
    ]);
  });

  it("reads each calendar field from the day rollup", async () => {
    expect.hasAssertions();

    for (const field of ["day", "month", "quarter", "year"]) {
      const sql = await expectEqual({
        compareToPrevious: true,
        grouping: [{ field }],
        metrics: ROLLUP_METRICS,
        period: WINDOW,
      });

      expect(sql).toContain(`from ${DAY_ROLLUP_TABLE} r`);
    }
  });

  it("reads the first level of a deeper grouping from the rollups", async () => {
    expect.hasAssertions();

    await expectEqual({
      grouping: [
        { field: `tag:${tags.get("Body")?.id ?? ""}` },
        { field: "month" },
      ],
      metrics: ROLLUP_METRICS,
      period: WINDOW,
    });
  });

  it("reads the events a root does not name as the group of no tag", async () => {
    expect.hasAssertions();

    const grouping = [{ field: `tag:${tags.get("Aspect")?.id ?? ""}` }];
    const sql = await expectEqual({
      compareToPrevious: true,
      grouping,
      metrics: ROLLUP_METRICS,
      period: WINDOW,
    });
    const { groups } = await metricsService.findMetrics({
      grouping,
      metrics: [EventMetric.EVENTS],
      period: WINDOW,
    });

    expect(sql).toContain(`from ${DAY_TAG_ROLLUP_TABLE} r`);
    // Both Mars Stations carry no aspect.
    expect(groups.map(({ key, label }) => [key, label])).toContainEqual([
      null,
      "No Aspect",
    ]);
  });

  it("adds the events that reach into the period from before it", async () => {
    expect.hasAssertions();

    for (const grouping of [
      [],
      [{ field: "month" }],
      [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
    ]) {
      const sql = await expectEqual({
        compareToPrevious: true,
        grouping,
        metrics: ROLLUP_METRICS,
        period: NARROWER,
      });

      expect(sql).toContain("calendar_event_facts f on f.extent");
    }

    // Mars Retrograde starts on the 10th and reaches the 13th, with two more.
    const { total } = await metricsService.findMetrics({
      metrics: [EventMetric.EVENTS],
      period: NARROWER,
    });

    expect(total[0]?.value).toBe(3);
  });

  it("falls back to the events for a period that starts mid-day", async () => {
    expect.hasAssertions();

    const sql = await expectEqual({
      metrics: ROLLUP_METRICS,
      period: { end: WINDOW.end, start: "2026-01-10T06:00:00.000Z" },
    });

    expect(sql).not.toContain(`from ${DAY_ROLLUP_TABLE} r`);
  });

  it("falls back to the events for percents, a filter and a deeper tag level", async () => {
    expect.hasAssertions();

    const body = tags.get("Body")?.id ?? "";

    await expectEqual({
      metrics: [EventMetric.EVENTS, EventMetric.COVERED_PERCENT],
      period: WINDOW,
    });
    await expectEqual({
      filter: {
        combinator: EventFilterCombinator.AND,
        rules: [
          {
            operator: "is_any_of",
            path: [`tag:${tags.get("Temporality")?.id ?? ""}`],
            values: [tags.get("Progressive")?.id ?? ""],
          },
        ],
      },
      metrics: ROLLUP_METRICS,
      period: WINDOW,
    });
    await expectEqual({
      grouping: [{ depth: 2, field: `tag:${body}` }],
      metrics: ROLLUP_METRICS,
      period: WINDOW,
    });
  });

  it("counts an untagged event in the whole set and the group of no tag", async () => {
    expect.hasAssertions();

    await addEvent({
      end: "2026-01-14T15:00:00.000Z",
      start: "2026-01-14T15:00:00.000Z",
      summary: "Untagged",
      tags: [],
    });
    await refresh();

    for (const grouping of [
      [],
      [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
    ]) {
      const sql = await expectEqual({
        compareToPrevious: true,
        grouping,
        metrics: ROLLUP_METRICS,
        period: WINDOW,
      });

      expect(sql).toContain("calendar_event_day_");
    }

    const { groups, total } = await metricsService.findMetrics({
      grouping: [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
      metrics: [EventMetric.EVENTS],
      period: WINDOW,
    });

    expect(total[0]?.value).toBe(7);
    expect(groups.at(-1)).toMatchObject({ key: null, label: "No Body" });
  });
});
