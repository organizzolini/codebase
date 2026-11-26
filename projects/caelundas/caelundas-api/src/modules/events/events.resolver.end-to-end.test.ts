import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedEvents,
  startEventsApplication,
} from "../../../testing/events-application";
import { tagRepository } from "../../../testing/tag-repository";

import type { EventsApplication } from "../../../testing/events-application";

/**
 * Sends the dataset, events and facets queries over HTTP to the events
 * module backed by a Postgres built by the real migration and a seeded
 * fixture.
 */
describe("events resolver end-to-end suite", () => {
  let application: EventsApplication;

  /** Executes an operation expected to succeed and returns its data. */
  async function query(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const body = await application.query(document, variables);

    expect(body.errors).toBeUndefined();

    return body.data ?? {};
  }

  beforeAll(async () => {
    application = await startEventsApplication();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  describe("dataset", () => {
    it("is null while the dataset is empty", async () => {
      expect.hasAssertions();

      await expect(
        query("{ dataset { count start end timezone } }"),
      ).resolves.toStrictEqual({ dataset: null });
    });

    it("answers the span, the count and the most common zone", async () => {
      expect.hasAssertions();

      await seedEvents(application.database);

      await expect(
        query("{ dataset { count start end timezone } }"),
      ).resolves.toStrictEqual({
        dataset: {
          count: 5,
          end: "2026-03-21T00:00:00.000Z",
          start: "2026-03-05T03:30:00.000Z",
          timezone: "America/New_York",
        },
      });
    });
  });

  describe("events", () => {
    const EVENTS = `
      query Events($period: PeriodInput!) {
        events(period: $period) {
          name
          note
          start
          end
          durationMinutes
          timezone
          startLocalDay
          startLocalHour
          tags { depth name path slug }
        }
      }
    `;

    it("answers each event that overlaps the period, earliest first, with its tags and local time", async () => {
      expect.hasAssertions();

      const { events } = await query(EVENTS, {
        period: {
          end: "2026-03-11T00:00:00.000Z",
          start: "2026-03-01T00:00:00.000Z",
        },
      });

      expect(events).toStrictEqual([
        {
          durationMinutes: 90,
          end: "2026-03-05T05:00:00.000Z",
          name: "Mars Retrograde",
          note: "Mars Retrograde description",
          start: "2026-03-05T03:30:00.000Z",
          startLocalDay: "2026-03-04",
          startLocalHour: 22,
          tags: [
            {
              depth: 2,
              name: "Retrograde",
              path: "Planet / Mars / Retrograde",
              slug: "retrograde",
            },
          ],
          timezone: "America/New_York",
        },
        {
          durationMinutes: 0,
          end: "2026-03-10T12:00:00.000Z",
          name: "Moon Conjunct Mars",
          note: "Moon Conjunct Mars description",
          start: "2026-03-10T12:00:00.000Z",
          startLocalDay: "2026-03-10",
          startLocalHour: 8,
          tags: [
            {
              depth: 1,
              name: "Conjunct",
              path: "Aspect / Conjunct",
              slug: "conjunct",
            },
          ],
          timezone: "America/New_York",
        },
      ]);
    });

    it("includes an instant at the period's first moment and excludes one at its end", async () => {
      expect.hasAssertions();

      const { events } = await query(EVENTS, {
        period: {
          end: "2026-03-20T09:00:00.000Z",
          start: "2026-03-10T12:00:00.000Z",
        },
      });

      expect(
        (events as { name: string }[]).map(({ name }) => name),
      ).toStrictEqual(["Moon Conjunct Mars"]);
    });

    it("leaves out the instants where an aspect begins forming", async () => {
      expect.hasAssertions();

      const { events } = await query(EVENTS, {
        period: {
          end: "2026-03-11T00:00:00.000Z",
          start: "2026-03-10T00:00:00.000Z",
        },
      });

      expect(
        (events as { name: string }[]).map(({ name }) => name),
      ).not.toContain("Moon Conjunct Mars Forming");
    });

    it("answers no events for a period the data does not reach", async () => {
      expect.hasAssertions();

      await expect(
        query(EVENTS, {
          period: {
            end: "2030-01-02T00:00:00.000Z",
            start: "2030-01-01T00:00:00.000Z",
          },
        }),
      ).resolves.toStrictEqual({ events: [] });
    });
  });

  describe("facets", () => {
    const FACETS = `
      query Facets($period: PeriodInput) {
        facets(period: $period) {
          name
          values { name depth path count }
        }
      }
    `;

    const WHOLE_DATASET = [
      {
        name: "Aspect",
        values: [
          { count: 2, depth: 1, name: "Conjunct", path: "Conjunct" },
          { count: 1, depth: 1, name: "Phase", path: "Phase" },
          { count: 1, depth: 2, name: "Forming", path: "Phase / Forming" },
        ],
      },
      {
        name: "Planet",
        values: [
          { count: 1, depth: 1, name: "Mars", path: "Mars" },
          { count: 1, depth: 2, name: "Retrograde", path: "Mars / Retrograde" },
        ],
      },
    ];

    it("counts every event under each tag, descendants included, without a period", async () => {
      expect.hasAssertions();

      await expect(query(FACETS)).resolves.toStrictEqual({
        facets: WHOLE_DATASET,
      });
    });

    it("counts only the events that overlap the period", async () => {
      expect.hasAssertions();

      const { facets } = await query(FACETS, {
        period: {
          end: "2026-03-06T00:00:00.000Z",
          start: "2026-03-01T00:00:00.000Z",
        },
      });

      expect(facets).toStrictEqual([
        {
          name: "Aspect",
          values: [
            { count: 0, depth: 1, name: "Conjunct", path: "Conjunct" },
            { count: 0, depth: 1, name: "Phase", path: "Phase" },
            { count: 0, depth: 2, name: "Forming", path: "Phase / Forming" },
          ],
        },
        {
          name: "Planet",
          values: [
            { count: 1, depth: 1, name: "Mars", path: "Mars" },
            {
              count: 1,
              depth: 2,
              name: "Retrograde",
              path: "Mars / Retrograde",
            },
          ],
        },
      ]);
    });

    it("lists a tag under each of its parents with one id and one count", async () => {
      expect.hasAssertions();

      const repository = tagRepository(application.database.dataSource);
      const mars = await repository.findOneByOrFail({ name: "Mars" });
      const benefic = await repository.save({
        name: "Benefic",
        slug: "benefic",
      });

      await application.database.dataSource
        .getRepository("TagEdge")
        .insert({ sourceNode: benefic.id, targetNode: mars.id });
      await application.database.dataSource.query(
        "refresh materialized view tag_closures",
      );

      const { facets } = (await query(`
        { facets { name values { id name path depth count alsoUnder } } }
      `)) as {
        facets: {
          name: string;
          values: {
            alsoUnder: string[];
            count: number;
            id: string;
            path: string;
          }[];
        }[];
      };
      const planet = facets.find(({ name }) => name === "Planet");
      const under = facets.find(({ name }) => name === "Benefic");

      expect(planet?.values.find(({ path }) => path === "Mars")).toMatchObject({
        alsoUnder: ["Benefic"],
        count: 1,
        id: mars.id,
      });
      expect(under?.values).toMatchObject([
        { alsoUnder: ["Planet"], count: 1, id: mars.id, path: "Mars" },
        { alsoUnder: [], path: "Mars / Retrograde" },
      ]);
    });
  });
});
