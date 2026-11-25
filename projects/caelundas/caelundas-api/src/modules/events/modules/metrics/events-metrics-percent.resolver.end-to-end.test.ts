import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  CaelundasDatabaseService,
  CalendarEventTag,
  Tag,
} from "@codebase/caelundas-db";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  startEventsApplication,
} from "../../../../../testing/events-application";

import { EventMetric } from "./modules/inputs/event-metric.entities";

import type { EventsApplication } from "../../../../../testing/events-application";

/** One group of a response. */
interface GroupResponse {
  label: string;
  values: ValueResponse[];
}

/** The `eventMetrics` result of a response. */
interface MetricsResponse {
  groups: GroupResponse[];
  total: ValueResponse[];
}

/** One metric's value in a response. */
interface ValueResponse {
  metric: EventMetric;
  previous: null | number;
  value: null | number;
}

const PERCENTS = [
  EventMetric.COVERED_PERCENT,
  EventMetric.TOTAL_TIME_PERCENT,
  EventMetric.PROGRESSIVE_COVERED_PERCENT,
  EventMetric.PROGRESSIVE_TOTAL_PERCENT,
];

/** Ten days, 14400 minutes. */
const PERIOD = {
  end: "2026-05-11T00:00:00.000Z",
  start: "2026-05-01T00:00:00.000Z",
};

const QUERY = `
  fragment Values on EventMetricValue { metric value previous }
  query Metrics($input: EventMetricsInput!) {
    eventMetrics(input: $input) {
      total { ...Values }
      groups { label values { ...Values } }
    }
  }
`;

/**
 * Measures the percent-of-time metrics over a seeded fixture of ten days:
 * Alpha holds two overlapping progressive spans, a plain span and a
 * progressive instant; Beta one progressive span crossing the period's start
 * and one plain span crossing its end; Gamma one progressive span, before the
 * period only.
 */
describe("events metrics percent end-to-end suite", () => {
  let application: EventsApplication;
  let kind: Tag;
  let progressive: Tag;

  /** Inserts an event with its tags. */
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
       values ($1, $1, $2, $3, 40.7128, -74.006, 'UTC')
       returning id`,
      [seed.summary, seed.start, seed.end],
    );

    for (const tag of seed.tags) {
      await application.database
        .repository(CalendarEventTag)
        .insert({ calendarEventId: event.id, tagId: tag.id });
    }
  }

  /** Reads the percents, failing on any error. */
  async function measure(
    period: { end: string; start: string },
    compareToPrevious = false,
  ): Promise<MetricsResponse> {
    const body = await application.query(QUERY, {
      input: {
        compareToPrevious,
        grouping: [{ field: `tag:${kind.id}` }],
        metrics: PERCENTS,
        period,
      },
    });

    expect(body.errors).toBeUndefined();

    return (body.data as { eventMetrics: MetricsResponse }).eventMetrics;
  }

  /** The values of a list, in the order of the percents, to six decimals. */
  function percents(
    values: ValueResponse[],
    key: "previous" | "value" = "value",
  ): (null | number)[] {
    return values.map((value) => {
      const percent = value[key];

      return percent === null ? null : Math.round(percent * 1e6) / 1e6;
    });
  }

  /** The values of the group with a label. */
  function valuesOf(groups: GroupResponse[], label: string): ValueResponse[] {
    const group = groups.find((candidate) => candidate.label === label);

    if (group === undefined) {
      throw new Error(`No group ${label}`);
    }

    return group.values;
  }

  beforeAll(async () => {
    application = await startEventsApplication();

    const repository = application.database.dataSource.getTreeRepository(Tag);
    const temporality = await repository.save(
      repository.create({ name: "Temporality" }),
    );

    progressive = await repository.save(
      repository.create({ name: "Progressive", parent: temporality }),
    );
    kind = await repository.save(repository.create({ name: "Kind" }));

    const alpha = await repository.save(
      repository.create({ name: "Alpha", parent: kind }),
    );
    const beta = await repository.save(
      repository.create({ name: "Beta", parent: kind }),
    );
    const gamma = await repository.save(
      repository.create({ name: "Gamma", parent: kind }),
    );

    await insertEvent({
      end: "2026-05-02T12:00:00.000Z",
      start: "2026-05-02T00:00:00.000Z",
      summary: "Alpha One",
      tags: [alpha, progressive],
    });
    await insertEvent({
      end: "2026-05-02T18:00:00.000Z",
      start: "2026-05-02T06:00:00.000Z",
      summary: "Alpha Two",
      tags: [alpha, progressive],
    });
    await insertEvent({
      end: "2026-05-03T06:00:00.000Z",
      start: "2026-05-03T00:00:00.000Z",
      summary: "Alpha Plain",
      tags: [alpha],
    });
    await insertEvent({
      end: "2026-05-04T00:00:00.000Z",
      start: "2026-05-04T00:00:00.000Z",
      summary: "Alpha Instant",
      tags: [alpha, progressive],
    });
    await insertEvent({
      end: "2026-05-01T12:00:00.000Z",
      start: "2026-04-30T12:00:00.000Z",
      summary: "Beta Entering",
      tags: [beta, progressive],
    });
    await insertEvent({
      end: "2026-05-11T12:00:00.000Z",
      start: "2026-05-10T12:00:00.000Z",
      summary: "Beta Leaving",
      tags: [beta],
    });
    await insertEvent({
      end: "2026-04-25T06:00:00.000Z",
      start: "2026-04-25T00:00:00.000Z",
      summary: "Gamma Before",
      tags: [gamma, progressive],
    });
    await application.database.module
      .get(CaelundasDatabaseService)
      .refreshReadModel(application.database.dataSource.manager);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("counts overlaps once when covered and per event when counted, of the period's length", async () => {
    expect.hasAssertions();

    const { groups } = await measure(PERIOD);

    // Alpha: 1440 minutes covered (the 1080 of the overlapping pair and 360),
    // 1800 counted; progressive 1080 covered and 1440 counted; of 14400.
    expect(percents(valuesOf(groups, "Alpha"))).toStrictEqual([
      10, 12.5, 7.5, 10,
    ]);
  });

  it("clips the events that cross the period's edges to it", async () => {
    expect.hasAssertions();

    const { groups } = await measure(PERIOD);

    // Beta's two spans last a day each, and half of each lies in the period.
    expect(percents(valuesOf(groups, "Beta"))).toStrictEqual([10, 10, 5, 5]);
  });

  it("adds no time for an instant, and measures the whole set", async () => {
    expect.hasAssertions();

    const { total } = await measure(PERIOD);

    expect(total.map(({ metric }) => metric)).toStrictEqual(PERCENTS);
    expect(percents(total)).toStrictEqual([20, 22.5, 12.5, 15]);
  });

  it("may count more than the period when events overlap", async () => {
    expect.hasAssertions();

    const { total } = await measure({
      end: "2026-05-02T18:00:00.000Z",
      start: "2026-05-02T06:00:00.000Z",
    });

    // Alpha One covers the first half of the 12 hours and Two all of it: the
    // whole is covered, and 18 hours counted make 150%.
    expect(percents(total).slice(0, 2)).toStrictEqual([100, 150]);
  });

  it("clips to the previous period and reads 0 for a group that has none now", async () => {
    expect.hasAssertions();

    const { groups, total } = await measure(PERIOD, true);

    // 2026-04-21 to 2026-05-01: Beta's first half-day and Gamma's six hours.
    expect(percents(total, "previous")).toStrictEqual([7.5, 7.5, 7.5, 7.5]);
    expect(percents(valuesOf(groups, "Beta"), "previous")).toStrictEqual([
      5, 5, 5, 5,
    ]);
    expect(percents(valuesOf(groups, "Gamma"))).toStrictEqual([0, 0, 0, 0]);
    expect(percents(valuesOf(groups, "Gamma"), "previous")).toStrictEqual([
      2.5, 2.5, 2.5, 2.5,
    ]);
    expect(percents(valuesOf(groups, "Alpha"), "previous")).toStrictEqual([
      0, 0, 0, 0,
    ]);
  });

  it("reads nothing for a period of no length", async () => {
    expect.hasAssertions();

    const instant = "2026-05-02T09:00:00.000Z";
    const { groups, total } = await measure({ end: instant, start: instant });

    expect(percents(total)).toStrictEqual([null, null, null, null]);
    expect(percents(valuesOf(groups, "Alpha"))).toStrictEqual([
      null,
      null,
      null,
      null,
    ]);
  });

  it("reads 0 over a period without events", async () => {
    expect.hasAssertions();

    const { groups, total } = await measure({
      end: "2025-01-02T00:00:00.000Z",
      start: "2025-01-01T00:00:00.000Z",
    });

    expect(groups).toStrictEqual([]);
    expect(percents(total)).toStrictEqual([0, 0, 0, 0]);
  });
});
