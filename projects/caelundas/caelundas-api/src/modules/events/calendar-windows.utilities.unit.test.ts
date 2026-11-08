import { describe, expect, it } from "vitest";

import { CalendarView } from "./calendar-view.entities";
import { getCalendarWindows } from "./calendar-windows.utilities";
import { TimelineScale } from "./timeline-scale.entities";

import type { TimeWindow } from "./calendar-windows.types";

/** Thursday the 22nd of October 2026, at noon UTC. */
const THURSDAY = new Date("2026-10-22T12:00:00.000Z");

/** A window as its ISO instants, for comparing at a glance. */
function iso({ end, start }: TimeWindow): [string, string] {
  return [start.toISOString(), end.toISOString()];
}

describe(getCalendarWindows, () => {
  it("shows the day a day view opens on, and reads a day either side", () => {
    expect.hasAssertions();

    const windows = getCalendarWindows(CalendarView.DAY, THURSDAY);

    expect(iso(windows.visible)).toStrictEqual([
      "2026-10-22T00:00:00.000Z",
      "2026-10-23T00:00:00.000Z",
    ]);
    expect(iso(windows.window)).toStrictEqual([
      "2026-10-21T00:00:00.000Z",
      "2026-10-24T00:00:00.000Z",
    ]);
    expect(windows.columnMinutes).toBeNull();
  });

  it("shows the three days from the one it opens on", () => {
    expect.hasAssertions();

    expect(
      iso(getCalendarWindows(CalendarView.THREE_DAY, THURSDAY).visible),
    ).toStrictEqual(["2026-10-22T00:00:00.000Z", "2026-10-25T00:00:00.000Z"]);
  });

  it("shows the week from the Sunday before", () => {
    expect.hasAssertions();

    expect(
      iso(getCalendarWindows(CalendarView.WEEK, THURSDAY).visible),
    ).toStrictEqual(["2026-10-18T00:00:00.000Z", "2026-10-25T00:00:00.000Z"]);
  });

  it("shows the month with a week before and two after, for the six-week grid", () => {
    expect.hasAssertions();

    expect(
      iso(getCalendarWindows(CalendarView.MONTH, THURSDAY).visible),
    ).toStrictEqual(["2026-09-24T00:00:00.000Z", "2026-11-15T00:00:00.000Z"]);
  });

  it("lists thirty days of agenda unless asked for more, up to 366", () => {
    expect.hasAssertions();

    expect(
      iso(getCalendarWindows(CalendarView.AGENDA, THURSDAY).visible),
    ).toStrictEqual(["2026-10-22T00:00:00.000Z", "2026-11-21T00:00:00.000Z"]);
    expect(
      iso(
        getCalendarWindows(CalendarView.AGENDA, THURSDAY, { agendaDays: 60 })
          .visible,
      ),
    ).toStrictEqual(["2026-10-22T00:00:00.000Z", "2026-12-21T00:00:00.000Z"]);
    expect(
      iso(
        getCalendarWindows(CalendarView.AGENDA, THURSDAY, {
          agendaDays: 5000,
        }).visible,
      ),
    ).toStrictEqual(["2026-10-22T00:00:00.000Z", "2027-10-23T00:00:00.000Z"]);
    expect(
      iso(
        getCalendarWindows(CalendarView.AGENDA, THURSDAY, { agendaDays: 0 })
          .visible,
      ),
    ).toStrictEqual(["2026-10-22T00:00:00.000Z", "2026-10-23T00:00:00.000Z"]);
  });

  it("joins the month and agenda windows for no view", () => {
    expect.hasAssertions();

    const windows = getCalendarWindows(undefined, THURSDAY);

    expect(iso(windows.visible)).toStrictEqual([
      "2026-09-24T00:00:00.000Z",
      "2026-11-21T00:00:00.000Z",
    ]);
    expect(iso(windows.window)).toStrictEqual([
      "2026-09-23T00:00:00.000Z",
      "2026-11-22T00:00:00.000Z",
    ]);
  });

  describe("the timeline", () => {
    /** The visible span and column of the timeline at one scale. */
    function timeline(scale: TimelineScale | undefined): {
      columnMinutes: null | number;
      visible: [string, string];
    } {
      const { columnMinutes, visible } = getCalendarWindows(
        CalendarView.TIMELINE,
        THURSDAY,
        { scale },
      );

      return { columnMinutes, visible: iso(visible) };
    }

    it("reads a day in fifteen-minute columns", () => {
      expect.hasAssertions();

      expect(timeline(TimelineScale.DAY)).toStrictEqual({
        columnMinutes: 15,
        visible: ["2026-10-22T00:00:00.000Z", "2026-10-23T00:00:00.000Z"],
      });
    });

    it("reads a week from its Sunday, in days", () => {
      expect.hasAssertions();

      expect(timeline(TimelineScale.WEEK)).toStrictEqual({
        columnMinutes: 1440,
        visible: ["2026-10-18T00:00:00.000Z", "2026-10-25T00:00:00.000Z"],
      });
    });

    it("reads a month, which is the default scale, in days", () => {
      expect.hasAssertions();

      const month = {
        columnMinutes: 1440,
        visible: ["2026-10-01T00:00:00.000Z", "2026-11-01T00:00:00.000Z"],
      };

      expect(timeline(TimelineScale.MONTH)).toStrictEqual(month);
      expect(timeline(undefined)).toStrictEqual(month);
    });

    it("reads a quarter widened to whole weeks, in weeks", () => {
      expect.hasAssertions();

      expect(timeline(TimelineScale.QUARTER)).toStrictEqual({
        columnMinutes: 10_080,
        visible: ["2026-09-27T00:00:00.000Z", "2027-01-03T00:00:00.000Z"],
      });
    });

    it("reads a year in months", () => {
      expect.hasAssertions();

      const { columnMinutes, visible } = timeline(TimelineScale.YEAR);

      expect(visible).toStrictEqual([
        "2026-01-01T00:00:00.000Z",
        "2027-01-01T00:00:00.000Z",
      ]);
      expect(columnMinutes).toBeCloseTo(43_829.1, 1);
    });

    it("reads a day either side of what it shows", () => {
      expect.hasAssertions();

      const { window } = getCalendarWindows(CalendarView.TIMELINE, THURSDAY, {
        scale: TimelineScale.WEEK,
      });

      expect(iso(window)).toStrictEqual([
        "2026-10-17T00:00:00.000Z",
        "2026-10-26T00:00:00.000Z",
      ]);
    });

    it("widens another quarter to the whole weeks around it", () => {
      expect.hasAssertions();

      // 1 July 2026 is a Wednesday and 1 October a Thursday.
      const july = getCalendarWindows(
        CalendarView.TIMELINE,
        new Date("2026-07-15T12:00:00.000Z"),
        { scale: TimelineScale.QUARTER },
      );

      expect(iso(july.visible)).toStrictEqual([
        "2026-06-28T00:00:00.000Z",
        "2026-10-04T00:00:00.000Z",
      ]);
    });
  });
});
