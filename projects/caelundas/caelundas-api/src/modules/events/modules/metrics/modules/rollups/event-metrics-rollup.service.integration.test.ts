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
import { EventMetricsFactsService } from "../facts/event-metrics-facts.service";

import type { EventsApplication } from "../../../../../../../testing/events-application";
import type { EventMetricsInputEntity } from "../inputs/event-metrics-input.entities";

/** Ten New York days, midnight to midnight. */
const WINDOW = {
  end: "2026-01-20T05:00:00.000Z",
  start: "2026-01-10T05:00:00.000Z",
};

/** The same days, less three, so an event reaches in. */
const NARROWER = {
  end: "2026-01-20T05:00:00.000Z",
  start: "2026-01-13T05:00:00.000Z",
};

/** Every metric the rollups answer: those whose measures merge across days. */
const ROLLUP_METRICS = [
  "average-duration",
  "days-with-events",
  "events",
  "first-start",
  "perfective-events",
  "last-start",
  "progressive-events",
  "duration",
];

/** The metrics whose measures do not merge, which only the events answer. */
const EVENT_METRICS = [
  "covered-duration",
  "longest-duration",
  "median-duration",
  "shortest-duration",
  "unique-names",
  "unique-tags",
];

/** The scope that keeps the phase boundaries, which the facts leave out. */
const WITH_BOUNDARIES = { includePhaseBoundaries: true };

/** The SQL of the whole set's facts, and of a tag level's. */
const WHOLE_FACTS = "join calendar_event_facts r on r.filter_id = df.id";
const TAG_FACTS = "join calendar_event_facts r on r.filter_id = tf.id";

/** One New York event of the fixture, with its tags. */
interface Seed {
  end: string;
  name: string;
  start: string;
  tags: string[];
}

/** The tag's name as the slug the table keeps. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");
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
    name: "Mars Retrograde",
    start: "2026-01-11T03:00:00.000Z",
    tags: ["Mars", "Progressive", "Conjunct"],
  },
  {
    end: "2026-01-12T12:00:00.000Z",
    name: "Moon Conjunct Mars",
    start: "2026-01-12T12:00:00.000Z",
    tags: ["Moon", "Mars", "Conjunct"],
  },
  {
    end: "2026-01-12T13:30:00.000Z",
    name: "Moon Trine Sun",
    start: "2026-01-12T12:00:00.000Z",
    tags: ["Moon", "Sun", "Trine"],
  },
  {
    end: "2026-01-12T15:00:00.000Z",
    name: "Mars Station",
    start: "2026-01-12T13:00:00.000Z",
    tags: ["Mars", "Progressive"],
  },
  {
    end: "2026-01-15T10:45:00.000Z",
    name: "Mars Station",
    start: "2026-01-15T10:00:00.000Z",
    tags: ["Mars"],
  },
  {
    end: "2026-01-18T05:00:00.000Z",
    name: "Sun Day",
    start: "2026-01-18T04:00:00.000Z",
    tags: ["Sun", "Progressive", "Conjunct"],
  },
  {
    end: "2026-01-16T12:00:00.000Z",
    name: "Forming",
    start: "2026-01-16T12:00:00.000Z",
    tags: ["Mars", "Forming"],
  },
  {
    end: "2026-01-05T11:00:00.000Z",
    name: "Mars Station",
    start: "2026-01-05T10:00:00.000Z",
    tags: ["Mars"],
  },
  {
    end: "2026-01-08T12:00:00.000Z",
    name: "Moon Past",
    start: "2026-01-08T12:00:00.000Z",
    tags: ["Moon", "Conjunct"],
  },
  {
    end: "2026-01-01T05:00:00.000Z",
    name: "New Year",
    start: "2026-01-01T05:00:00.000Z",
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

  /** Measures the input in the default scope, which the rollups answer. */
  async function findMetrics(
    input: EventMetricsInputEntity,
  ): ReturnType<EventMetricsService["findMetrics"]> {
    return metricsService.findMetrics(input);
  }

  /** Measures with the rollups, or without, and says what ran. */
  async function measure(
    input: EventMetricsInputEntity,
    withoutRollups: boolean,
  ): Promise<{ result: unknown; sql: string }> {
    fallback = withoutRollups;
    queries = [];

    const result = normalize(await findMetrics(input));

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
          above === undefined
            ? { name, slug: slugify(name) }
            : { name, parent: above, slug: slugify(name) },
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
         (name, note, "start", "end", latitude, longitude, timezone)
       values ($1, $1, $2, $3, 40.7128, -74.006, 'America/New_York')
       returning id`,
      [seed.name, seed.start, seed.end],
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
      .refreshMetrics(application.database.dataSource.manager);
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
    const factsService = application.database.module.get(
      EventMetricsFactsService,
      { strict: false },
    );
    const compile = factsService.compile.bind(factsService);

    vi.spyOn(eventsService, "select").mockImplementation(
      async (sql, parameters, schema) => {
        queries.push(sql);

        return fallback && sql.includes("from zone z")
          ? []
          : select(sql, parameters, schema);
      },
    );
    // The fallback is the events themselves, so the facts stand aside too.
    vi.spyOn(factsService, "compile").mockImplementation((request) =>
      fallback ? null : compile(request),
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

    const { total } = await findMetrics({
      metrics: ["events"],
      period: WINDOW,
    });

    expect(sql).toContain(WHOLE_FACTS);
    expect(sql).not.toContain("events_in_periods");
    // Six events start in the window; the forming boundary is left out.
    expect(total[0]?.value).toBe(6);
  });

  it("counts the tags beneath a root, as the events count them", async () => {
    expect.hasAssertions();

    await expectEqual({
      compareToPrevious: true,
      metrics: ["events", "unique-tags"],
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

    const { groups } = await findMetrics({
      grouping: [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
      metrics: ["events"],
      period: WINDOW,
    });

    expect(sql).toContain(TAG_FACTS);
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

      expect(sql).toContain(WHOLE_FACTS);
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
    const { groups } = await findMetrics({
      grouping,
      metrics: ["events"],
      period: WINDOW,
    });

    expect(sql).toContain(TAG_FACTS);
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

      expect(sql).toContain(
        'f."start" < p.period_start and f."end" >= p.period_start',
      );
    }

    // Mars Retrograde starts on the 10th and reaches the 13th, with two more.
    const { total } = await findMetrics({
      metrics: ["events"],
      period: NARROWER,
    });

    expect(total[0]?.value).toBe(3);
  });

  it("reads the events, not the rollups, when the scope keeps the phase boundaries", async () => {
    expect.hasAssertions();

    fallback = false;
    queries = [];

    const { total } = await metricsService.findMetrics(
      { metrics: ["events"], period: WINDOW },
      WITH_BOUNDARIES,
    );

    expect(queries.join("\n")).not.toContain(WHOLE_FACTS);
    // Seven events start in the window, the forming boundary included.
    expect(total[0]?.value).toBe(7);
  });

  it("falls back to the events for a period that starts mid-day", async () => {
    expect.hasAssertions();

    const sql = await expectEqual({
      metrics: ROLLUP_METRICS,
      period: { end: WINDOW.end, start: "2026-01-10T06:00:00.000Z" },
    });

    expect(sql).not.toContain(WHOLE_FACTS);
  });

  it("falls back to the events for the measures that do not merge", async () => {
    expect.hasAssertions();

    const sql = await expectEqual({
      grouping: [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
      metrics: ["events", ...EVENT_METRICS],
      period: WINDOW,
    });

    expect(sql).not.toContain(TAG_FACTS);
    expect(sql).not.toContain(WHOLE_FACTS);
  });

  it("falls back to the events for percents, a filter and a deeper tag level", async () => {
    expect.hasAssertions();

    const body = tags.get("Body")?.id ?? "";

    await expectEqual({
      metrics: ["events", "covered-percent"],
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
      name: "Untagged",
      start: "2026-01-14T15:00:00.000Z",
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

      expect(sql).toMatch(
        /join calendar_event_facts r on r\.filter_id = (df|tf)\.id/u,
      );
    }

    const { groups, total } = await findMetrics({
      grouping: [{ field: `tag:${tags.get("Body")?.id ?? ""}` }],
      metrics: ["events"],
      period: WINDOW,
    });

    expect(total[0]?.value).toBe(7);
    expect(groups.at(-1)).toMatchObject({ key: null, label: "No Body" });
  });
});
