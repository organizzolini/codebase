import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createRecord } from "../../../../../../../../testing/calendar/calendar-records";

import { CalendarAllDay } from "./calendar-all-day";

import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { AllDayMode } from "./calendar-all-day.types";
import type { EventCalendarSegment } from "@codebase/presentation";

const DAY = new Date("2026-03-03T00:00:00Z");
const SEGMENTS = [
  createRecord("a", "2026-03-02T00:00:00Z", "2026-03-05T00:00:00Z"),
  createRecord("b", "2026-03-02T06:00:00Z", "2026-03-05T00:00:00Z", ["Sign"]),
].map(
  (record): EventCalendarSegment<CalendarEventRecord> =>
    ({ day: DAY, occurrence: { event: { data: record } } }) as never,
);

function renderAllDay(
  mode: AllDayMode,
  onModeChange = vi.fn<(mode: AllDayMode) => void>(),
): void {
  render(
    <CalendarAllDay
      days={[DAY]}
      groupColors={undefined}
      grouping={[{ field: "tag:*", tags: ["a"] }]}
      mode={mode}
      onModeChange={onModeChange}
      segments={SEGMENTS}
      timeZone="UTC"
    />,
  );
}

describe(CalendarAllDay, () => {
  it("applies its class name", () => {
    render(
      <CalendarAllDay
        className="calendar-all-day"
        days={[]}
        groupColors={undefined}
        grouping={[]}
        mode="grouped"
        onModeChange={() => {}}
        segments={[]}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("calendar-all-day").className).toContain(
      "calendar-all-day",
    );
  });

  it("groups the day's events, each group closed", () => {
    renderAllDay("grouped");

    expect(screen.getAllByTestId("calendar-group-chip")).toHaveLength(2);
    expect(screen.queryByTestId("calendar-group-list")).toBeNull();
  });

  it("opens a group in place and closes it again", () => {
    renderAllDay("grouped");

    const chip = screen.getByRole("button", { name: "Aspect, 1 events" });

    fireEvent.click(chip);

    expect(chip.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(1);

    fireEvent.click(chip);

    expect(screen.queryByTestId("calendar-group-list")).toBeNull();
  });

  it("lists every event when expanded, with no group to toggle", () => {
    renderAllDay("expanded");

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /events$/u })).toBeNull();
  });

  it("is one slim row of counts when contracted", () => {
    renderAllDay("contracted");

    expect(screen.getAllByTestId("calendar-group-count")).toHaveLength(2);
    expect(screen.queryByTestId("calendar-group-list")).toBeNull();
  });

  it("offers the next state from a button that says whether it is open", () => {
    const onModeChange = vi.fn<(mode: AllDayMode) => void>();

    renderAllDay("grouped", onModeChange);

    const control = screen.getByRole("button", {
      name: "All day: grouped. Show every event.",
    });

    expect(control.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(control);

    expect(onModeChange).toHaveBeenCalledWith("expanded");
  });

  it("says a contracted row is not open", () => {
    renderAllDay("contracted");

    expect(
      screen
        .getByRole("button", {
          name: "All day: one row of counts. Show grouped.",
        })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
