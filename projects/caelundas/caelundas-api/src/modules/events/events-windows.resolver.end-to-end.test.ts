import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  DATABASE_TIMEOUT_MILLISECONDS,
  seedEvents,
  startEventsApplication,
} from "../../../testing/events-application";

import type { EventsApplication } from "../../../testing/events-application";

/** The two windows of one windows answer, as ISO instants. */
interface Windows {
  columnMinutes: null | number;
  read: { end: string; start: string };
  visible: { end: string; start: string };
}

/**
 * Sends the windows query over HTTP and reads the events of the
 * period it answers, so a view or a timeline scale reads only the span it
 * shows.
 */
describe("events windows end-to-end suite", () => {
  let application: EventsApplication;

  /** The windows of one view or scale around an anchor. */
  async function windowsOf(
    variables: Record<string, unknown>,
  ): Promise<Windows> {
    const body = await application.query(
      `query Windows($anchor: DateTime!, $window: CalendarWindow, $scale: TimelineScale, $agendaDays: Int) {
        windows(anchor: $anchor, window: $window, scale: $scale, agendaDays: $agendaDays) {
          columnMinutes
          visible { start end }
          read { start end }
        }
      }`,
      variables,
    );

    expect(body.errors).toBeUndefined();

    return (body.data as { windows: Windows }).windows;
  }

  /** The summaries of the events in the period a timeline scale reads. */
  async function readTimeline(
    anchor: string,
    scale: string,
  ): Promise<string[]> {
    const { read } = await windowsOf({ anchor, scale, window: "TIMELINE" });
    const body = await application.query(
      `query Events($period: PeriodInput!) {
        events(period: $period) { summary }
      }`,
      { period: read },
    );

    expect(body.errors).toBeUndefined();

    return (body.data as { events: { summary: string }[] }).events.map(
      ({ summary }) => summary,
    );
  }

  beforeAll(async () => {
    application = await startEventsApplication();
    await seedEvents(application.database);
  }, DATABASE_TIMEOUT_MILLISECONDS);

  afterAll(async () => {
    await application.stop();
  }, DATABASE_TIMEOUT_MILLISECONDS);

  it("answers the days a view shows and the period a day wider either side", async () => {
    expect.hasAssertions();

    await expect(
      windowsOf({ anchor: "2026-10-22T12:00:00.000Z", window: "THREE_DAY" }),
    ).resolves.toStrictEqual({
      columnMinutes: null,
      read: {
        end: "2026-10-26T00:00:00.000Z",
        start: "2026-10-21T00:00:00.000Z",
      },
      visible: {
        end: "2026-10-25T00:00:00.000Z",
        start: "2026-10-22T00:00:00.000Z",
      },
    });
  });

  it("lists the agenda's days up to 366 and no more", async () => {
    expect.hasAssertions();

    const anchor = "2026-10-22T12:00:00.000Z";
    const month = await windowsOf({ anchor, window: "AGENDA" });
    const year = await windowsOf({
      agendaDays: 9999,
      anchor,
      window: "AGENDA",
    });

    expect(month.visible.end).toBe("2026-11-21T00:00:00.000Z");
    expect(year.visible.end).toBe("2027-10-23T00:00:00.000Z");
  });

  it("answers a timeline's column length at each scale", async () => {
    expect.hasAssertions();

    const anchor = "2026-10-22T12:00:00.000Z";
    const columns: Record<string, null | number> = {};

    for (const scale of ["DAY", "WEEK", "MONTH", "QUARTER", "YEAR"]) {
      const { columnMinutes } = await windowsOf({
        anchor,
        scale,
        window: "TIMELINE",
      });

      columns[scale] = columnMinutes;
    }

    expect(columns["DAY"]).toBe(15);
    expect(columns["WEEK"]).toBe(1440);
    expect(columns["MONTH"]).toBe(1440);
    expect(columns["QUARTER"]).toBe(10_080);
    expect(columns["YEAR"]).toBeCloseTo(43_829.1, 1);
  });

  it("opens a timeline on a month when it names no scale", async () => {
    expect.hasAssertions();

    const { visible } = await windowsOf({
      anchor: "2026-10-22T12:00:00.000Z",
      window: "TIMELINE",
    });

    expect(visible).toStrictEqual({
      end: "2026-11-01T00:00:00.000Z",
      start: "2026-10-01T00:00:00.000Z",
    });
  });

  it("holds the month and the agenda for no view", async () => {
    expect.hasAssertions();

    const { columnMinutes, visible } = await windowsOf({
      anchor: "2026-10-22T12:00:00.000Z",
    });

    expect(columnMinutes).toBeNull();
    expect(visible).toStrictEqual({
      end: "2026-11-21T00:00:00.000Z",
      start: "2026-09-24T00:00:00.000Z",
    });
  });

  it("refuses a view or scale the calendar does not offer", async () => {
    expect.hasAssertions();

    const body = await application.query(
      `query { windows(anchor: "2026-10-22T12:00:00.000Z", window: FORTNIGHT) { columnMinutes } }`,
    );

    expect(body.errors?.at(0)?.message).toContain("FORTNIGHT");
  });

  describe("reading only the span a scale shows", () => {
    it("reads a day, and a day either side, for the day scale", async () => {
      expect.hasAssertions();

      await expect(
        readTimeline("2026-03-20T12:00:00.000Z", "DAY"),
      ).resolves.toStrictEqual(["Sun Enters Aries", "Equinox Watch"]);
    });

    it("reads the whole month for the month scale, and nothing of the next", async () => {
      expect.hasAssertions();

      await expect(
        readTimeline("2026-03-10T12:00:00.000Z", "MONTH"),
      ).resolves.toStrictEqual([
        "Mars Retrograde",
        "Moon Conjunct Mars",
        "Sun Enters Aries",
        "Equinox Watch",
      ]);
      await expect(
        readTimeline("2026-04-10T12:00:00.000Z", "MONTH"),
      ).resolves.toStrictEqual([]);
    });

    it("reads a week from its Sunday for the week scale", async () => {
      expect.hasAssertions();

      await expect(
        readTimeline("2026-03-10T12:00:00.000Z", "WEEK"),
      ).resolves.toStrictEqual(["Moon Conjunct Mars"]);
    });

    it("reads the year, in months, for the year scale", async () => {
      expect.hasAssertions();

      await expect(
        readTimeline("2026-03-10T12:00:00.000Z", "YEAR"),
      ).resolves.toHaveLength(4);
    });
  });
});
