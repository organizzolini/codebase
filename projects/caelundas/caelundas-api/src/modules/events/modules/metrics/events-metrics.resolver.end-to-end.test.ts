import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CaelundasDatabaseService,
  CalendarEventTag,
  Tag,
} from "@codebase/caelundas-db";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedEvents,
  seedFilterTags,
  startEventsApplication,
} from "../../../../../testing/events-application";

import { EventMetric } from "./modules/inputs/event-metric.entities";

import type {
  EventsApplication,
  FilterTags,
} from "../../../../../testing/events-application";

/** One group of a response, with its subgroups. */
interface GroupResponse {
  children: GroupResponse[];
  id: string;
  key: null | string;
  label: string;
  level: number;
  orderKey: null | string;
  path: null | string;
  values: ValueResponse[];
}

/** An input variable, as a client writes it. */
interface InputVariable {
  compareToPrevious?: boolean;
  filter?: unknown;
  grouping?: { depth?: number; field: string; parent?: string }[];
  metrics: EventMetric[];
  period?: { end: string; start: string };
  tagRoot?: string;
}

/** The `eventMetrics` result of a response. */
interface MetricsResponse {
  groups: GroupResponse[];
  timezone: string;
  total: ValueResponse[];
}

/** One metric's value in a response. */
interface ValueResponse {
  metric: EventMetric;
  previous: null | number;
  value: null | number;
}

const MARCH = {
  end: "2026-04-01T00:00:00.000Z",
  start: "2026-03-01T00:00:00.000Z",
};

const EVERY_METRIC = Object.values(EventMetric);

/** Percent of a 31-day period one minute makes. */
const MARCH_PERCENT = 100 / (31 * 24 * 60);

/** Matches the percent of a 31-day period that some minutes make. */
function minutesPercent(minutes: number): unknown {
  return expect.closeTo(MARCH_PERCENT * minutes, 8);
}

/** The query every test sends: the tree three levels deep. */
const QUERY = `
  fragment Values on EventMetricValue { metric value previous }
  query Metrics($input: EventMetricsInput!) {
    eventMetrics(input: $input) {
      timezone
      total { ...Values }
      groups {
        id key label level orderKey path
        values { ...Values }
        children {
          id key label level orderKey path
          values { ...Values }
          children { id key label level values { ...Values } }
        }
      }
    }
  }
`;

/**
 * Sends the eventMetrics query over HTTP to the events module on a Postgres
 * built by the real migration, measuring a seeded fixture.
 *
 * March holds five events: Mars Retrograde and Mars Station overlap, Moon
 * Conjunct Mars is an instant under Mars and the Moon, and Sun Enters Aries
 * and Equinox Watch carry no planet. February holds a Mars span and a Venus
 * instant, which the previous period reads.
 */
describe("events metrics end-to-end suite", () => {
  let application: EventsApplication;
  let base: Record<string, Tag>;
  let filterTags: FilterTags;
  let progressive: Tag;
  let temporality: Tag;
  let venus: Tag;

  /** Inserts an event, tagged, and returns nothing. */
  async function insertEvent(seed: {
    end: string;
    start: string;
    summary: string;
    tags: Tag[];
  }): Promise<void> {
    const [event] = await application.database.dataSource.query<
      [{ id: string }]
    >(
      `insert into calendar_events
         (summary, description, "start", "end", latitude, longitude, timezone)
       values ($1, $1, $2, $3, 40.7128, -74.006, 'America/New_York')
       returning id`,
      [seed.summary, seed.start, seed.end],
    );

    for (const tag of seed.tags) {
      await application.database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  /** Links tags to an event the fixture seeded, by its summary. */
  async function tagEvent(summary: string, tags: Tag[]): Promise<void> {
    const [event] = await application.database.dataSource.query<
      [{ id: string }]
    >(`select id from calendar_events where "summary" = $1`, [summary]);

    for (const tag of tags) {
      await application.database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  /** Reads the metrics, failing on any error. */
  async function measure(input: InputVariable): Promise<MetricsResponse> {
    const body = await application.query(QUERY, {
      input: { period: MARCH, ...input },
    });

    expect(body.errors).toBeUndefined();

    return (body.data as { eventMetrics: MetricsResponse }).eventMetrics;
  }

  /** The value of one metric among a list. */
  function read(values: ValueResponse[], metric: EventMetric): null | number {
    return values.find((value) => value.metric === metric)?.value ?? null;
  }

  /** The previous value of one metric among a list. */
  function readPrevious(
    values: ValueResponse[],
    metric: EventMetric,
  ): null | number {
    return values.find((value) => value.metric === metric)?.previous ?? null;
  }

  /** A seeded tag by name. */
  function tagOf(name: string): Tag {
    const tag = base[name];

    if (tag === undefined) {
      throw new Error(`The fixture seeds no tag ${name}`);
    }

    return tag;
  }

  /** The id of a seeded tag by name. */
  function idOf(name: string): string {
    return tagOf(name).id;
  }

  /** The groups' keys and labels, in order. */
  function labels(groups: GroupResponse[]): string[] {
    return groups.map(({ label }) => label);
  }

  /** The group with a label. */
  function find(groups: GroupResponse[], label: string): GroupResponse {
    const group = groups.find((candidate) => candidate.label === label);

    if (group === undefined) {
      throw new Error(`No group ${label} in ${labels(groups).join(", ")}`);
    }

    return group;
  }

  beforeAll(async () => {
    application = await startEventsApplication();
    base = await seedEvents(application.database);
    filterTags = await seedFilterTags(application.database);

    const tags = application.database.dataSource.getTreeRepository(Tag);
    temporality = await tags.save(tags.create({ name: "Temporality" }));

    progressive = await tags.save(
      tags.create({ name: "Progressive", parent: temporality }),
    );
    await tags.save(tags.create({ name: "Perfective", parent: temporality }));
    venus = await tags.save(
      tags.create({ name: "Venus", parent: filterTags.planet }),
    );

    // Moon Conjunct Mars is under two planets, so it falls in two groups.
    await tagEvent("Moon Conjunct Mars", [tagOf("mars")]);
    await tagEvent("Mars Retrograde", [progressive]);
    await tagEvent("Equinox Watch", [progressive]);
    await insertEvent({
      end: "2026-03-05T06:00:00.000Z",
      start: "2026-03-05T04:00:00.000Z",
      summary: "Mars Station",
      tags: [tagOf("retrograde"), progressive],
    });
    await insertEvent({
      end: "2026-02-10T02:00:00.000Z",
      start: "2026-02-10T00:00:00.000Z",
      summary: "February Mars",
      tags: [tagOf("retrograde"), progressive],
    });
    await insertEvent({
      end: "2026-02-15T00:00:00.000Z",
      start: "2026-02-15T00:00:00.000Z",
      summary: "February Venus",
      tags: [venus],
    });
    await application.database.module
      .get(CaelundasDatabaseService)
      .refreshReadModel(application.database.dataSource.manager);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("measures every metric over the whole set, in the order asked", async () => {
    expect.hasAssertions();

    const { timezone, total } = await measure({ metrics: EVERY_METRIC });
    const expected: Record<EventMetric, unknown> = {
      AVERAGE_DURATION_MINUTES: 110,
      COVERED_MINUTES: 270,
      COVERED_PERCENT: minutesPercent(270),
      DAYS_WITH_EVENTS: 3,
      EVENTS: 5,
      FIRST_START: Date.parse("2026-03-05T03:30:00.000Z"),
      INSTANTS: 2,
      LAST_START: Date.parse("2026-03-20T22:00:00.000Z"),
      LONGEST_DURATION_MINUTES: 120,
      MEDIAN_DURATION_MINUTES: 120,
      PROGRESSIVE_COVERED_PERCENT: minutesPercent(270),
      PROGRESSIVE_HOURS: 5.5,
      PROGRESSIVE_TOTAL_PERCENT: minutesPercent(330),
      SHORTEST_DURATION_MINUTES: 90,
      SPANS: 3,
      TOTAL_DURATION_MINUTES: 330,
      TOTAL_TIME_PERCENT: minutesPercent(330),
      UNIQUE_NAMES: 5,
      UNIQUE_TAGS: 12,
    };

    expect(timezone).toBe("America/New_York");
    expect(total.map(({ metric }) => metric)).toStrictEqual(EVERY_METRIC);
    expect(
      Object.fromEntries(total.map((v) => [v.metric, v.value])),
    ).toStrictEqual(expected);
    expect(total.every(({ previous }) => previous === null)).toBe(true);
  });

  it("answers only the metrics asked for, each once", async () => {
    expect.hasAssertions();

    const { total } = await measure({
      metrics: [EventMetric.SPANS, EventMetric.EVENTS, EventMetric.SPANS],
    });

    expect(total.map(({ metric }) => metric)).toStrictEqual([
      "SPANS",
      "EVENTS",
    ]);
  });

  it("reads an empty period as no events", async () => {
    expect.hasAssertions();

    const { groups, total } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: EVERY_METRIC,
      period: {
        end: "2025-01-02T00:00:00.000Z",
        start: "2025-01-01T00:00:00.000Z",
      },
    });

    expect(groups).toStrictEqual([]);
    expect(read(total, EventMetric.EVENTS)).toBe(0);
    expect(read(total, EventMetric.TOTAL_DURATION_MINUTES)).toBe(0);
    expect(read(total, EventMetric.PROGRESSIVE_HOURS)).toBe(0);
    expect(read(total, EventMetric.MEDIAN_DURATION_MINUTES)).toBeNull();
    expect(read(total, EventMetric.FIRST_START)).toBeNull();
  });

  it("includes an event ending at the period's start and leaves out one starting at its end", async () => {
    expect.hasAssertions();

    const { total } = await measure({
      metrics: [EventMetric.EVENTS, EventMetric.SPANS],
      period: {
        end: "2026-03-10T12:00:00.000Z",
        start: "2026-03-05T05:00:00.000Z",
      },
    });

    // Mars Retrograde ends at 05:00 and Mars Station at 06:00; Moon Conjunct
    // Mars starts at the period's end.
    expect(read(total, EventMetric.EVENTS)).toBe(2);
    expect(read(total, EventMetric.SPANS)).toBe(2);
  });

  it("groups by a tag root, counting an event in each group it falls in and the keyless events last", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: [
        EventMetric.EVENTS,
        EventMetric.TOTAL_DURATION_MINUTES,
        EventMetric.COVERED_MINUTES,
        EventMetric.PROGRESSIVE_HOURS,
        EventMetric.INSTANTS,
        EventMetric.AVERAGE_DURATION_MINUTES,
        EventMetric.DAYS_WITH_EVENTS,
      ],
    });
    const mars = find(groups, "Mars");
    const moon = find(groups, "Moon");
    const none = find(groups, "No Planet");

    expect(labels(groups)).toStrictEqual(["Mars", "Moon", "No Planet"]);
    expect(mars).toMatchObject({
      key: idOf("mars"),
      level: 0,
      path: "Planet / Mars",
    });
    expect(none).toMatchObject({ key: null, orderKey: null });
    expect(mars.values.map(({ value }) => value)).toStrictEqual([
      3, 210, 150, 3.5, 1, 105, 2,
    ]);
    expect(moon.values.map(({ value }) => value)).toStrictEqual([
      1,
      0,
      0,
      0,
      1,
      null,
      1,
    ]);
    expect(none.values.map(({ value }) => value)).toStrictEqual([
      2, 120, 120, 2, 1, 120, 1,
    ]);
  });

  it("nests the groups of each level beneath their parent", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }, { field: "day" }],
      metrics: [EventMetric.EVENTS],
    });
    const mars = find(groups, "Mars");

    expect(mars.children.map(({ key, level }) => [key, level])).toStrictEqual([
      ["2026-03-04", 1],
      ["2026-03-10", 1],
    ]);
    expect(
      mars.children.map(({ values }) => read(values, EventMetric.EVENTS)),
    ).toStrictEqual([2, 1]);
    expect(find(groups, "Moon").children.map(({ key }) => key)).toStrictEqual([
      "2026-03-10",
    ]);
    expect(mars.children[0]?.id).toBe(`${mars.id}/1:2026-03-04`);
  });

  it("splits only the group of the parent tag when a level refines the one before", async () => {
    expect.hasAssertions();

    const field = `tag:${filterTags.planet.id}`;
    const { groups } = await measure({
      grouping: [{ field }, { field, parent: idOf("mars") }, { field: "day" }],
      metrics: [EventMetric.EVENTS],
    });
    const mars = find(groups, "Mars");
    const moon = find(groups, "Moon");

    // Mars is split by its own children, with the event that has none apart.
    expect(labels(mars.children)).toStrictEqual(["Retrograde", "No Mars"]);
    expect(mars.children.map(({ level }) => level)).toStrictEqual([1, 1]);
    expect(
      mars.children.map(({ values }) => read(values, EventMetric.EVENTS)),
    ).toStrictEqual([2, 1]);
    expect(
      find(mars.children, "Retrograde").children.map(({ level }) => level),
    ).toStrictEqual([2]);
    // The Moon is not split by it: its next level is the day.
    expect(moon.children.map(({ key, level }) => [key, level])).toStrictEqual([
      ["2026-03-10", 2],
    ]);
  });

  it("keeps only the events a filter meets, in every group", async () => {
    expect.hasAssertions();

    const { groups, total } = await measure({
      filter: {
        combinator: "AND",
        rules: [
          {
            operator: "is_any_of",
            path: [`tag:${temporality.id}`],
            values: [progressive.id],
          },
        ],
      },
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: [EventMetric.EVENTS, EventMetric.PROGRESSIVE_HOURS],
    });

    expect(read(total, EventMetric.EVENTS)).toBe(3);
    expect(labels(groups)).toStrictEqual(["Mars", "No Planet"]);
    expect(read(find(groups, "Mars").values, EventMetric.EVENTS)).toBe(2);
    expect(read(find(groups, "No Planet").values, EventMetric.EVENTS)).toBe(1);
  });

  it("counts the tags beneath a root only", async () => {
    expect.hasAssertions();

    const unique = [EventMetric.UNIQUE_TAGS];
    const { groups, total } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: unique,
      tagRoot: filterTags.planet.id,
    });
    const none = await measure({ metrics: unique, tagRoot: "not-a-tag" });

    // Retrograde, the Moon and Mars, none of them the root itself.
    expect(read(total, EventMetric.UNIQUE_TAGS)).toBe(3);
    expect(read(find(groups, "Mars").values, EventMetric.UNIQUE_TAGS)).toBe(3);
    expect(
      read(find(groups, "No Planet").values, EventMetric.UNIQUE_TAGS),
    ).toBe(0);
    expect(read(none.total, EventMetric.UNIQUE_TAGS)).toBe(0);
  });

  it("compares every metric to the previous period of equal length", async () => {
    expect.hasAssertions();

    const { groups, total } = await measure({
      compareToPrevious: true,
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: EVERY_METRIC,
    });

    // 2026-01-29 to 2026-03-01 holds a Mars span and a Venus instant.
    expect(
      Object.fromEntries(total.map((v) => [v.metric, v.previous])),
    ).toStrictEqual({
      AVERAGE_DURATION_MINUTES: 120,
      COVERED_MINUTES: 120,
      COVERED_PERCENT: minutesPercent(120),
      DAYS_WITH_EVENTS: 2,
      EVENTS: 2,
      FIRST_START: Date.parse("2026-02-10T00:00:00.000Z"),
      INSTANTS: 1,
      LAST_START: Date.parse("2026-02-15T00:00:00.000Z"),
      LONGEST_DURATION_MINUTES: 120,
      MEDIAN_DURATION_MINUTES: 120,
      PROGRESSIVE_COVERED_PERCENT: minutesPercent(120),
      PROGRESSIVE_HOURS: 2,
      PROGRESSIVE_TOTAL_PERCENT: minutesPercent(120),
      SHORTEST_DURATION_MINUTES: 120,
      SPANS: 1,
      TOTAL_DURATION_MINUTES: 120,
      TOTAL_TIME_PERCENT: minutesPercent(120),
      UNIQUE_NAMES: 2,
      UNIQUE_TAGS: 3,
    });

    const mars = find(groups, "Mars");
    const moon = find(groups, "Moon");

    expect(readPrevious(mars.values, EventMetric.EVENTS)).toBe(1);
    expect(readPrevious(mars.values, EventMetric.PROGRESSIVE_HOURS)).toBe(2);
    expect(read(mars.values, EventMetric.EVENTS)).toBe(3);
    // The Moon had nothing before: counts read 0 and the rest nothing.
    expect(readPrevious(moon.values, EventMetric.EVENTS)).toBe(0);
    expect(
      readPrevious(moon.values, EventMetric.MEDIAN_DURATION_MINUTES),
    ).toBeNull();
  });

  it("returns a group only the previous period had, with empty values", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      compareToPrevious: true,
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: [EventMetric.EVENTS, EventMetric.AVERAGE_DURATION_MINUTES],
    });
    const gone = find(groups, "Venus");

    expect(gone.key).toBe(venus.id);
    expect(gone.values).toStrictEqual([
      { metric: "EVENTS", previous: 1, value: 0 },
      { metric: "AVERAGE_DURATION_MINUTES", previous: null, value: null },
    ]);
  });

  it("matches the previous period's subgroups by key", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      compareToPrevious: true,
      grouping: [{ field: `tag:${filterTags.planet.id}` }, { field: "month" }],
      metrics: [EventMetric.EVENTS],
    });
    const mars = find(groups, "Mars");

    expect(mars.children.map(({ key }) => key)).toStrictEqual([
      "2026-02",
      "2026-03",
    ]);
    expect(
      mars.children.map(({ values }) => [
        read(values, EventMetric.EVENTS),
        readPrevious(values, EventMetric.EVENTS),
      ]),
    ).toStrictEqual([
      [0, 1],
      [3, 0],
    ]);
  });
});
