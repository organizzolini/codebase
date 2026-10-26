import { describe, expect, it } from "vitest";

import { isDayShown, parseCalendarDate } from "./calendar-window";

const THURSDAY = parseCalendarDate("2026-10-22", new Date());

describe(isDayShown, () => {
  it("shows the day a day view opens on, and no other", () => {
    expect(isDayShown("2026-10-22", { anchor: THURSDAY, view: "day" })).toBe(
      true,
    );
    expect(isDayShown("2026-10-21", { anchor: THURSDAY, view: "day" })).toBe(
      false,
    );
    expect(isDayShown("2026-10-23", { anchor: THURSDAY, view: "day" })).toBe(
      false,
    );
  });

  it("shows the three days from the one it opens on", () => {
    expect(
      isDayShown("2026-10-24", { anchor: THURSDAY, view: "three-day" }),
    ).toBe(true);
    expect(
      isDayShown("2026-10-25", { anchor: THURSDAY, view: "three-day" }),
    ).toBe(false);
  });

  it("shows the whole week around the day it opens on", () => {
    expect(isDayShown("2026-10-18", { anchor: THURSDAY, view: "week" })).toBe(
      true,
    );
    expect(isDayShown("2026-10-24", { anchor: THURSDAY, view: "week" })).toBe(
      true,
    );
    expect(isDayShown("2026-10-17", { anchor: THURSDAY, view: "week" })).toBe(
      false,
    );
    expect(isDayShown("2026-10-25", { anchor: THURSDAY, view: "week" })).toBe(
      false,
    );
  });

  it("shows the days of the month around the day it opens on", () => {
    expect(isDayShown("2026-10-01", { anchor: THURSDAY, view: "month" })).toBe(
      true,
    );
    expect(isDayShown("2026-10-31", { anchor: THURSDAY, view: "month" })).toBe(
      true,
    );
    expect(isDayShown("2026-12-15", { anchor: THURSDAY, view: "month" })).toBe(
      false,
    );
  });

  it("follows the agenda's days and the timeline's scale", () => {
    expect(
      isDayShown("2026-11-10", {
        anchor: THURSDAY,
        options: { agendaDays: 30 },
        view: "agenda",
      }),
    ).toBe(true);
    expect(
      isDayShown("2026-12-30", {
        anchor: THURSDAY,
        options: { agendaDays: 30 },
        view: "agenda",
      }),
    ).toBe(false);
    expect(
      isDayShown("2026-10-20", {
        anchor: THURSDAY,
        options: { scale: "week" },
        view: "timeline",
      }),
    ).toBe(true);
    expect(
      isDayShown("2026-10-29", {
        anchor: THURSDAY,
        options: { scale: "week" },
        view: "timeline",
      }),
    ).toBe(false);
  });
});
