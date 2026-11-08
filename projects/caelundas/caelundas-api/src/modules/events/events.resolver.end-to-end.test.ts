import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedEvents,
  startEventsApplication,
} from "../../../testing/events-application";

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
      query Events($window: EventsWindowInput!) {
        events(window: $window) {
          summary
          start
          end
          durationMinutes
          timezone
          startLocalDay
          startLocalHour
          color
          location
          tags { depth name path }
        }
      }
    `;

    it("answers each event that overlaps the window, earliest first, with its tags and local time", async () => {
      expect.hasAssertions();

      const { events } = await query(EVENTS, {
        window: {
          end: "2026-03-11T00:00:00.000Z",
          start: "2026-03-01T00:00:00.000Z",
        },
      });

      expect(events).toStrictEqual([
        {
          color: null,
          durationMinutes: 90,
          end: "2026-03-05T05:00:00.000Z",
          location: null,
          start: "2026-03-05T03:30:00.000Z",
          startLocalDay: "2026-03-04",
          startLocalHour: 22,
          summary: "Mars Retrograde",
          tags: [
            {
              depth: 2,
              name: "Retrograde",
              path: "Planet / Mars / Retrograde",
            },
          ],
          timezone: "America/New_York",
        },
        {
          color: null,
          durationMinutes: 0,
          end: "2026-03-10T12:00:00.000Z",
          location: null,
          start: "2026-03-10T12:00:00.000Z",
          startLocalDay: "2026-03-10",
          startLocalHour: 8,
          summary: "Moon Conjunct Mars",
          tags: [{ depth: 1, name: "Conjunct", path: "Aspect / Conjunct" }],
          timezone: "America/New_York",
        },
      ]);
    });

    it("includes an instant at the window's first moment and excludes one at its end", async () => {
      expect.hasAssertions();

      const { events } = await query(EVENTS, {
        window: {
          end: "2026-03-20T09:00:00.000Z",
          start: "2026-03-10T12:00:00.000Z",
        },
      });

      expect(
        (events as { summary: string }[]).map(({ summary }) => summary),
      ).toStrictEqual(["Moon Conjunct Mars"]);
    });

    it("leaves out the instants where an aspect begins forming", async () => {
      expect.hasAssertions();

      const { events } = await query(EVENTS, {
        window: {
          end: "2026-03-11T00:00:00.000Z",
          start: "2026-03-10T00:00:00.000Z",
        },
      });

      expect(
        (events as { summary: string }[]).map(({ summary }) => summary),
      ).not.toContain("Moon Conjunct Mars Forming");
    });

    it("answers no events for a window the data does not reach", async () => {
      expect.hasAssertions();

      await expect(
        query(EVENTS, {
          window: {
            end: "2030-01-02T00:00:00.000Z",
            start: "2030-01-01T00:00:00.000Z",
          },
        }),
      ).resolves.toStrictEqual({ events: [] });
    });
  });

  describe("facets", () => {
    const FACETS = `
      query Facets($window: EventsWindowInput) {
        facets(window: $window) {
          name
          values { name depth path count }
        }
      }
    `;

    const WHOLE_DATASET = [
      {
        name: "Aspect",
        values: [{ count: 2, depth: 1, name: "Conjunct", path: "Conjunct" }],
      },
      {
        name: "Phase",
        values: [{ count: 1, depth: 1, name: "Forming", path: "Forming" }],
      },
      {
        name: "Planet",
        values: [
          { count: 1, depth: 1, name: "Mars", path: "Mars" },
          { count: 1, depth: 2, name: "Retrograde", path: "Mars / Retrograde" },
        ],
      },
    ];

    it("counts every event under each tag, descendants included, without a window", async () => {
      expect.hasAssertions();

      await expect(query(FACETS)).resolves.toStrictEqual({
        facets: WHOLE_DATASET,
      });
    });

    it("counts only the events that overlap the window", async () => {
      expect.hasAssertions();

      const { facets } = await query(FACETS, {
        window: {
          end: "2026-03-06T00:00:00.000Z",
          start: "2026-03-01T00:00:00.000Z",
        },
      });

      expect(facets).toStrictEqual([
        {
          name: "Aspect",
          values: [{ count: 0, depth: 1, name: "Conjunct", path: "Conjunct" }],
        },
        {
          name: "Phase",
          values: [{ count: 0, depth: 1, name: "Forming", path: "Forming" }],
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
  });
});
