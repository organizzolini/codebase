import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  CaelundasDatabaseService,
  CalendarEventTag,
  type Tag,
} from "@codebase/caelundas-db";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startEventsApplication,
} from "../../../../../../../testing/events-application";
import { tagRepository } from "../../../../../../../testing/tag-repository";
import { EventsService } from "../../../../events.service";
import { EventFilterCombinator } from "../../../filtering/modules/rules/event-filter-combinator.entities";
import { EventMetricsService } from "../../event-metrics.service";
import { EventMetricsCatalogService } from "../catalog/event-metrics-catalog.service";

import { EventMetricsFactsService } from "./event-metrics-facts.service";

import type { EventsApplication } from "../../../../../../../testing/events-application";
import type { EventFilterRuleEntity } from "../../../filtering/modules/rules/event-filter-rule.entities";
import type { EventFilterGroupEntity } from "../../../filtering/modules/rules/event-filter.entities";
import type { EventMetricsInputEntity } from "../inputs/event-metrics-input.entities";

/** Ten New York days, from and to a local midnight. */
const WINDOW = {
  end: "2026-01-20T05:00:00.000Z",
  start: "2026-01-10T05:00:00.000Z",
};

/** The same days, but from noon, which no day rollup can read. */
const MIDDAY = { end: WINDOW.end, start: "2026-01-12T17:00:00.000Z" };

/** A window with no event in it. */
const EMPTY = {
  end: "2026-06-02T05:00:00.000Z",
  start: "2026-06-01T05:00:00.000Z",
};

/** The four percent metrics. */
const PERCENTS = [
  "total-time-percent",
  "covered-percent",
  "progressive-total-percent",
  "progressive-covered-percent",
];

/** The tags, each with the one it sits beneath. */
const TAGS: [string, string | undefined][] = [
  ["Body", undefined],
  ["Planet", "Body"],
  ["Mars", "Planet"],
  ["Venus", "Planet"],
  ["Luminary", "Body"],
  ["Moon", "Luminary"],
  ["Sun", "Luminary"],
  ["Aspect", undefined],
  ["Conjunct", "Aspect"],
  ["Trine", "Aspect"],
  ["Phase", "Aspect"],
  ["Forming", "Phase"],
  ["Temporality", undefined],
  ["Progressive", "Temporality"],
];

/** One New York event of the fixture, with its tags. */
interface Seed {
  end: string;
  name: string;
  start: string;
  tags: string[];
}

/** The events: before, across, in and after the window, and one untagged. */
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
    end: "2026-01-14T15:00:00.000Z",
    name: "Untagged",
    start: "2026-01-14T15:00:00.000Z",
    tags: [],
  },
  {
    end: "2026-01-17T22:00:00.000Z",
    name: "Venus Long",
    start: "2026-01-17T03:00:00.000Z",
    tags: ["Venus", "Trine", "Progressive"],
  },
  {
    end: "2026-01-19T20:00:00.000Z",
    name: "Venus Moon",
    start: "2026-01-18T18:00:00.000Z",
    tags: ["Venus", "Moon", "Conjunct", "Progressive"],
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
    end: "2026-01-21T12:00:00.000Z",
    name: "Sun After",
    start: "2026-01-21T12:00:00.000Z",
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

/** The tag's name as the slug the table keeps. */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");
}

/**
 * Measures a New York fixture over the facts and over the events, and asserts
 * each answer is the other's, for the groupings and filters the web asks.
 */
describe("event metrics over the facts", () => {
  let application: EventsApplication;
  let events = false;
  let metrics: string[] = [];
  let metricsService: EventMetricsService;
  let queries: string[] = [];
  const tags = new Map<string, Tag>();

  /** The id of a tag by name. */
  function id(name: string): string {
    return tags.get(name)?.id ?? "";
  }

  /** The level that picks the tags named, as the web's default grouping does. */
  function pick(
    names: string[],
    depth?: number,
  ): { depth?: number; field: string; tags: string[] } {
    return {
      ...(depth === undefined ? {} : { depth }),
      field: "tag:*",
      tags: names.map((name) => id(name)),
    };
  }

  /** The web's default grouping: the roots, then each depth beneath them. */
  function defaultGrouping(): ReturnType<typeof pick>[] {
    return [
      pick(["Body", "Aspect", "Temporality"]),
      pick(
        ["Planet", "Luminary", "Conjunct", "Trine", "Phase", "Progressive"],
        1,
      ),
      pick(["Mars", "Venus", "Moon", "Sun", "Forming"], 2),
      pick(["Mars"], 3),
    ];
  }

  /** A filter of the groups of rules given, joined by `or`. */
  function anyOf(...groups: EventFilterRuleEntity[][]): EventFilterGroupEntity {
    return {
      combinator: EventFilterCombinator.OR,
      groups: groups.map((rules) => ({
        combinator: EventFilterCombinator.AND,
        groups: [],
        rules,
      })),
      rules: [],
    };
  }

  /** Measures over the facts, or over the events alone, and says what ran. */
  async function measure(
    input: EventMetricsInputEntity,
    onEvents: boolean,
  ): Promise<{ result: unknown; sql: string }> {
    events = onEvents;
    queries = [];

    const result = normalize(await metricsService.findMetrics(input));

    return { result, sql: queries.join("\n") };
  }

  /** Asserts both paths agree, and returns the SQL the facts path ran. */
  async function expectEqual(input: EventMetricsInputEntity): Promise<string> {
    const facts = await measure(input, false);
    const raw = await measure(input, true);

    expect(facts.result).toStrictEqual(raw.result);
    expect(raw.sql).toContain("from calendar_events c");

    return facts.sql;
  }

  /** Saves a tag, beneath `parent` when one is named. */
  async function addTag(name: string, parent?: string): Promise<void> {
    const repository = tagRepository(application.database.dataSource);
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
        tagId: id(name),
      });
    }
  }

  beforeAll(async () => {
    application = await startEventsApplication();
    metricsService = application.database.module.get(EventMetricsService, {
      strict: false,
    });

    const catalog = await application.database.module
      .get(EventMetricsCatalogService, { strict: false })
      .getCatalog();

    metrics = [...catalog.metrics.keys()];

    const eventsService = application.database.module.get(EventsService, {
      strict: false,
    });
    const factsService = application.database.module.get(
      EventMetricsFactsService,
      { strict: false },
    );
    const select = eventsService.select.bind(eventsService);
    const compile = factsService.compile.bind(factsService);

    vi.spyOn(eventsService, "select").mockImplementation(
      async (sql, parameters, schema) => {
        queries.push(sql);

        return events && sql.includes("from zone z")
          ? []
          : select(sql, parameters, schema);
      },
    );
    vi.spyOn(factsService, "compile").mockImplementation((request) =>
      events ? null : compile(request),
    );

    for (const [name, parent] of TAGS) {
      await addTag(name, parent);
    }

    for (const seed of SEEDS) {
      await addEvent(seed);
    }

    await application.database.module
      .get(CaelundasDatabaseService)
      .refreshMetrics(application.database.dataSource.manager);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("measures the web's default grouping, with and without a filter and a comparison", async () => {
    expect.hasAssertions();

    const filter = anyOf(
      [
        {
          operator: "is_any_of",
          path: [`tag:${id("Body")}`],
          values: [id("Mars")],
        },
      ],
      [
        {
          operator: "is_any_of",
          path: [`tag:${id("Aspect")}`],
          values: [id("Trine")],
        },
      ],
    );

    for (const compareToPrevious of [false, true]) {
      for (const filtered of [false, true]) {
        const sql = await expectEqual({
          compareToPrevious,
          grouping: defaultGrouping(),
          metrics,
          period: WINDOW,
          ...(filtered ? { filter } : {}),
        });

        expect(sql).toContain("on true and not (f.tag_ids && (");
        expect(sql).not.toContain("events_in_periods");
      }
    }

    const { groups } = await metricsService.findMetrics({
      grouping: defaultGrouping(),
      metrics: ["events"],
      period: WINDOW,
    });

    // Groups nest as deep as the grouping does, beneath the group of each root.
    expect(groups.length).toBeGreaterThan(0);
    expect(groups.flatMap(({ children }) => children).length).toBeGreaterThan(
      0,
    );
  });

  it("measures each percent alone, over a period that starts mid-day", async () => {
    expect.hasAssertions();

    for (const metric of PERCENTS) {
      for (const period of [WINDOW, MIDDAY]) {
        await expectEqual({
          compareToPrevious: true,
          grouping: [
            pick(["Body", "Aspect"]),
            pick(["Mars", "Moon", "Conjunct"], 2),
          ],
          metrics: ["events", metric],
          period,
        });
        await expectEqual({ metrics: [metric], period });
      }
    }
  });

  it("filters by every kind of rule, as the events filter", async () => {
    expect.hasAssertions();

    const body = `tag:${id("Body")}`;
    const filters = [
      anyOf([{ operator: "is_none_of", path: [body], values: [id("Mars")] }]),
      anyOf([
        {
          operator: "has_all_of",
          path: [body],
          values: [id("Moon"), id("Mars")],
        },
      ]),
      anyOf([
        {
          negated: true,
          operator: "is_any_of",
          path: [body],
          values: [id("Moon")],
        },
      ]),
      anyOf([
        {
          operator: "is_any_of",
          path: [body],
          values: [id("Moon"), "not-a-tag"],
        },
      ]),
      anyOf([
        { operator: "is_any_of", path: ["temporality"], values: ["Instant"] },
      ]),
      anyOf([{ operator: "contains", path: ["text"], values: ["mars"] }]),
      anyOf([{ operator: "is_any_of", path: ["weekday"], values: ["1", "2"] }]),
      anyOf(
        [{ operator: "is_any_of", path: [body], values: [id("Sun")] }],
        [{ operator: "is_any_of", path: ["hour"], values: ["12"] }],
      ),
    ];

    for (const filter of filters) {
      await expectEqual({
        compareToPrevious: true,
        filter,
        grouping: [
          pick(["Body", "Aspect", "Temporality"]),
          { field: "day", tags: [] },
        ],
        metrics,
        period: WINDOW,
      });
    }
  });

  it("measures groupings that mix calendar fields and picked tags", async () => {
    expect.hasAssertions();

    for (const grouping of [
      [{ field: "month", tags: [] }, pick(["Body", "Aspect"])],
      [pick(["Moon", "Sun"], 2), { field: "day", tags: [] }],
      [
        { field: "weekday", tags: [] },
        { field: "hour", tags: [] },
        { field: "duration", tags: [] },
      ],
      [
        { field: "quarter", tags: [] },
        { field: "year", tags: [] },
        { field: "week", tags: [] },
      ],
      [pick(["Planet", "not-a-tag"], 1), { field: "unknown", tags: [] }],
      [],
    ]) {
      await expectEqual({
        compareToPrevious: true,
        grouping,
        metrics,
        period: WINDOW,
      });
    }
  });

  it("counts the tags beneath a root, over the facts as over the events", async () => {
    expect.hasAssertions();

    for (const tagRoot of [id("Body"), id("Aspect"), "not-a-tag"]) {
      await expectEqual({
        grouping: [
          pick(["Body", "Aspect"]),
          pick(["Mars", "Moon", "Trine"], 2),
        ],
        metrics: ["events", "unique-tags"],
        period: WINDOW,
        tagRoot,
      });
    }
  });

  it("reads zero events from a window that has none", async () => {
    expect.hasAssertions();

    await expectEqual({
      compareToPrevious: true,
      grouping: defaultGrouping(),
      metrics,
      period: EMPTY,
    });

    const { groups, total } = await metricsService.findMetrics({
      grouping: defaultGrouping(),
      metrics: ["events", "total-time-percent"],
      period: EMPTY,
    });

    expect(groups).toStrictEqual([]);
    expect(total.map(({ value }) => value)).toStrictEqual([0, 0]);
  });

  it("names the events that carry none of a level's tags as its group of no tag", async () => {
    expect.hasAssertions();

    const { groups } = await metricsService.findMetrics({
      grouping: [pick(["Body"])],
      metrics: ["events"],
      period: WINDOW,
    });

    // The untagged event, and the Sun Day that carries Body: only the first has none.
    expect(groups.at(-1)).toMatchObject({ key: null, label: "No tag" });
  });
});
