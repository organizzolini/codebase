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
import { SEEDED_METRIC_SLUGS } from "../../../../../testing/metric-catalog";

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
  path: null | string;
  rank: null | string;
  values: ValueResponse[];
}

/** An input variable, as a client writes it. */
interface InputVariable {
  compareToPrevious?: boolean;
  filter?: unknown;
  grouping?: { depth?: number; field: string; parent?: string }[];
  metrics: string[];
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
  metric: string;
  previous: null | number;
  value: null | number;
}

const MARCH = {
  end: "2026-04-01T00:00:00.000Z",
  start: "2026-03-01T00:00:00.000Z",
};

const EVERY_METRIC = SEEDED_METRIC_SLUGS;

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
        id key label level rank path
        values { ...Values }
        children {
          id key label level rank path
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
    name: string;
    start: string;
    tags: Tag[];
  }): Promise<void> {
    const [event] = await application.database.dataSource.query<
      [{ id: string }]
    >(
      `insert into calendar_events
         (name, note, "start", "end", latitude, longitude, timezone)
       values ($1, $1, $2, $3, 40.7128, -74.006, 'America/New_York')
       returning id`,
      [seed.name, seed.start, seed.end],
    );

    for (const tag of seed.tags) {
      await application.database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  /** Links tags to an event the fixture seeded, by its name. */
  async function tagEvent(name: string, tags: Tag[]): Promise<void> {
    const [event] = await application.database.dataSource.query<
      [{ id: string }]
    >(`select id from calendar_events where "name" = $1`, [name]);

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
  function read(values: ValueResponse[], metric: string): null | number {
    return values.find((value) => value.metric === metric)?.value ?? null;
  }

  /** The previous value of one metric among a list. */
  function readPrevious(
    values: ValueResponse[],
    metric: string,
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
    temporality = await tags.save(
      tags.create({ name: "Temporality", slug: "temporality" }),
    );

    progressive = await tags.save(
      tags.create({
        name: "Progressive",
        parent: temporality,
        slug: "progressive",
      }),
    );
    await tags.save(
      tags.create({
        name: "Perfective",
        parent: temporality,
        slug: "perfective",
      }),
    );
    venus = await tags.save(
      tags.create({ name: "Venus", parent: filterTags.planet, slug: "venus" }),
    );

    // Moon Conjunct Mars is under two planets, so it falls in two groups.
    await tagEvent("Moon Conjunct Mars", [tagOf("mars")]);
    await tagEvent("Mars Retrograde", [progressive]);
    await tagEvent("Equinox Watch", [progressive]);
    await insertEvent({
      end: "2026-03-05T06:00:00.000Z",
      name: "Mars Station",
      start: "2026-03-05T04:00:00.000Z",
      tags: [tagOf("retrograde"), progressive],
    });
    await insertEvent({
      end: "2026-02-10T02:00:00.000Z",
      name: "February Mars",
      start: "2026-02-10T00:00:00.000Z",
      tags: [tagOf("retrograde"), progressive],
    });
    await insertEvent({
      end: "2026-02-15T00:00:00.000Z",
      name: "February Venus",
      start: "2026-02-15T00:00:00.000Z",
      tags: [venus],
    });
    await application.database.module
      .get(CaelundasDatabaseService)
      .refreshMetrics(application.database.dataSource.manager);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("measures every metric over the whole set, in the order asked", async () => {
    expect.hasAssertions();

    const { timezone, total } = await measure({ metrics: EVERY_METRIC });
    const expected: Record<string, unknown> = {
      "average-duration": 110,
      "covered-duration": 270,
      "covered-percent": minutesPercent(270),
      "days-with-events": 3,
      duration: 330,
      events: 5,
      "first-start": Date.parse("2026-03-05T03:30:00.000Z"),
      "last-start": Date.parse("2026-03-20T22:00:00.000Z"),
      "longest-duration": 120,
      "median-duration": 120,
      "perfective-events": 2,
      "progressive-covered-percent": minutesPercent(270),
      "progressive-events": 3,
      "progressive-total-percent": minutesPercent(330),
      "shortest-duration": 90,
      "total-time-percent": minutesPercent(330),
      "unique-names": 5,
      "unique-tags": 12,
    };

    expect(timezone).toBe("America/New_York");
    expect(total.map(({ metric }) => metric)).toStrictEqual(EVERY_METRIC);
    expect(
      Object.fromEntries(total.map((v) => [v.metric, v.value])),
    ).toStrictEqual(expected);
    expect(total.every(({ previous }) => previous === null)).toBe(true);
  });

  it("lists the catalog of metrics and measures, from the tables", async () => {
    expect.hasAssertions();

    const body = await application.query(`
      query {
        eventMetricCatalog {
          measures { slug name icon note unit }
          metrics { slug name icon note unit additive measures }
        }
      }
    `);

    expect(body.errors).toBeUndefined();

    const { measures, metrics } = (
      body.data as {
        eventMetricCatalog: {
          measures: { slug: string; unit: string }[];
          metrics: {
            additive: boolean;
            icon: string;
            measures: string[];
            note: string;
            slug: string;
            unit: string;
          }[];
        };
      }
    ).eventMetricCatalog;
    const metric = (slug: string): (typeof metrics)[number] | undefined =>
      metrics.find((candidate) => candidate.slug === slug);

    expect(metrics.map(({ slug }) => slug)).toStrictEqual(EVERY_METRIC);
    expect(measures).toHaveLength(18);
    expect(
      measures.find(({ slug }) => slug === "median-progressive-duration")?.unit,
    ).toBe("DURATION");
    expect(metric("events")).toMatchObject({
      additive: true,
      icon: "hash",
      measures: ["events"],
      unit: "COUNT",
    });
    expect(metric("duration")?.unit).toBe("DURATION");
    expect(metric("covered-percent")?.unit).toBe("NONE");
    expect(metric("first-start")?.unit).toBe("INSTANT");
    expect(metric("average-duration")).toMatchObject({
      additive: false,
      measures: ["duration", "progressive-events"],
    });
    expect(metrics.every(({ icon, note }) => icon !== "" && note !== "")).toBe(
      true,
    );
  });

  it("refuses a metric that is not in the catalog, naming the ones that are", async () => {
    expect.hasAssertions();

    const body = await application.query(QUERY, {
      input: { metrics: ["TOTAL_DURATION_MINUTES"], period: MARCH },
    });

    expect(body.errors?.[0]?.message).toMatch(
      /Unknown metric "TOTAL_DURATION_MINUTES"; the metrics are events, unique-names/u,
    );
  });

  it("answers only the metrics asked for, each once", async () => {
    expect.hasAssertions();

    const { total } = await measure({
      metrics: ["progressive-events", "events", "progressive-events"],
    });

    expect(total.map(({ metric }) => metric)).toStrictEqual([
      "progressive-events",
      "events",
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
    expect(read(total, "events")).toBe(0);
    expect(read(total, "duration")).toBe(0);
    expect(read(total, "median-duration")).toBeNull();
    expect(read(total, "first-start")).toBeNull();
  });

  it("includes an event ending at the period's start and leaves out one starting at its end", async () => {
    expect.hasAssertions();

    const { total } = await measure({
      metrics: ["events", "progressive-events"],
      period: {
        end: "2026-03-10T12:00:00.000Z",
        start: "2026-03-05T05:00:00.000Z",
      },
    });

    // Mars Retrograde ends at 05:00 and Mars Station at 06:00; Moon Conjunct
    // Mars starts at the period's end.
    expect(read(total, "events")).toBe(2);
    expect(read(total, "progressive-events")).toBe(2);
  });

  it("groups by a tag root, counting an event in each group it falls in and the keyless events last", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: [
        "events",
        "duration",
        "covered-duration",
        "perfective-events",
        "average-duration",
        "days-with-events",
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
    expect(none).toMatchObject({ key: null, rank: null });
    expect(mars.values.map(({ value }) => value)).toStrictEqual([
      3, 210, 150, 1, 105, 2,
    ]);
    expect(moon.values.map(({ value }) => value)).toStrictEqual([
      1,
      0,
      0,
      1,
      null,
      1,
    ]);
    expect(none.values.map(({ value }) => value)).toStrictEqual([
      2, 120, 120, 1, 120, 1,
    ]);
  });

  it("nests the groups of each level beneath their parent", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }, { field: "day" }],
      metrics: ["events"],
    });
    const mars = find(groups, "Mars");

    expect(mars.children.map(({ key, level }) => [key, level])).toStrictEqual([
      ["2026-03-04", 1],
      ["2026-03-10", 1],
    ]);
    expect(
      mars.children.map(({ values }) => read(values, "events")),
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
      metrics: ["events"],
    });
    const mars = find(groups, "Mars");
    const moon = find(groups, "Moon");

    // Mars is split by its own children, with the event that has none apart.
    expect(labels(mars.children)).toStrictEqual(["Retrograde", "No Mars"]);
    expect(mars.children.map(({ level }) => level)).toStrictEqual([1, 1]);
    expect(
      mars.children.map(({ values }) => read(values, "events")),
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
      metrics: ["events", "duration"],
    });

    expect(read(total, "events")).toBe(3);
    expect(labels(groups)).toStrictEqual(["Mars", "No Planet"]);
    expect(read(find(groups, "Mars").values, "events")).toBe(2);
    expect(read(find(groups, "No Planet").values, "events")).toBe(1);
  });

  it("counts the tags beneath a root only", async () => {
    expect.hasAssertions();

    const unique = ["unique-tags"];
    const { groups, total } = await measure({
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: unique,
      tagRoot: filterTags.planet.id,
    });
    const none = await measure({ metrics: unique, tagRoot: "not-a-tag" });

    // Retrograde, the Moon and Mars, none of them the root itself.
    expect(read(total, "unique-tags")).toBe(3);
    expect(read(find(groups, "Mars").values, "unique-tags")).toBe(3);
    expect(read(find(groups, "No Planet").values, "unique-tags")).toBe(0);
    expect(read(none.total, "unique-tags")).toBe(0);
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
      "average-duration": 120,
      "covered-duration": 120,
      "covered-percent": minutesPercent(120),
      "days-with-events": 2,
      duration: 120,
      events: 2,
      "first-start": Date.parse("2026-02-10T00:00:00.000Z"),
      "last-start": Date.parse("2026-02-15T00:00:00.000Z"),
      "longest-duration": 120,
      "median-duration": 120,
      "perfective-events": 1,
      "progressive-covered-percent": minutesPercent(120),
      "progressive-events": 1,
      "progressive-total-percent": minutesPercent(120),
      "shortest-duration": 120,
      "total-time-percent": minutesPercent(120),
      "unique-names": 2,
      "unique-tags": 3,
    });

    const mars = find(groups, "Mars");
    const moon = find(groups, "Moon");

    expect(readPrevious(mars.values, "events")).toBe(1);
    expect(readPrevious(mars.values, "duration")).toBe(120);
    expect(read(mars.values, "events")).toBe(3);
    // The Moon had nothing before: counts read 0 and the rest nothing.
    expect(readPrevious(moon.values, "events")).toBe(0);
    expect(readPrevious(moon.values, "median-duration")).toBeNull();
  });

  it("returns a group only the previous period had, with empty values", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      compareToPrevious: true,
      grouping: [{ field: `tag:${filterTags.planet.id}` }],
      metrics: ["events", "average-duration"],
    });
    const gone = find(groups, "Venus");

    expect(gone.key).toBe(venus.id);
    expect(gone.values).toStrictEqual([
      { metric: "events", previous: 1, value: 0 },
      { metric: "average-duration", previous: null, value: null },
    ]);
  });

  it("matches the previous period's subgroups by key", async () => {
    expect.hasAssertions();

    const { groups } = await measure({
      compareToPrevious: true,
      grouping: [{ field: `tag:${filterTags.planet.id}` }, { field: "month" }],
      metrics: ["events"],
    });
    const mars = find(groups, "Mars");

    expect(mars.children.map(({ key }) => key)).toStrictEqual([
      "2026-02",
      "2026-03",
    ]);
    expect(
      mars.children.map(({ values }) => [
        read(values, "events"),
        readPrevious(values, "events"),
      ]),
    ).toStrictEqual([
      [0, 1],
      [3, 0],
    ]);
  });
});
