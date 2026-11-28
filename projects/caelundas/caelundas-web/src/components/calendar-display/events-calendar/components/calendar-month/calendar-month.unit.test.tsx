import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createRecord } from "../../../../../../testing/calendar/calendar-records";

import { CalendarMonth } from "./calendar-month";

import type { DayOpener } from "./calendar-month.types";

const GROUPING = [{ field: "tag:*", tags: ["a"] }];
const MARCH = new Date("2026-03-10T12:00:00Z");

function renderMonth(
  events = [createRecord("a", "2026-03-10T10:00:00Z")],
  onOpenDay?: DayOpener,
): void {
  render(
    <CalendarMonth
      anchor={MARCH}
      events={events}
      groupColors={undefined}
      grouping={GROUPING}
      onOpenDay={onOpenDay}
      timeZone="UTC"
    />,
  );
}

describe(CalendarMonth, () => {
  it("applies its class name", () => {
    render(
      <CalendarMonth
        anchor={MARCH}
        className="calendar-month"
        events={[]}
        groupColors={undefined}
        grouping={GROUPING}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("calendar-month").className).toContain(
      "calendar-month",
    );
  });

  it("draws the weekday header and a cell for every day of the weeks", () => {
    renderMonth();

    expect(screen.getAllByRole("columnheader")).toHaveLength(7);
    expect(screen.getAllByTestId("calendar-month-cell")).toHaveLength(35);
    expect(screen.getByRole("grid", { name: "March 2026" })).toBeDefined();
  });

  it("lists the events that run through the whole month once, in a band, and in no day", () => {
    renderMonth([
      createRecord("whole", "2026-02-01T00:00:00Z", "2026-05-01T00:00:00Z"),
    ]);

    const band = screen.getByTestId("calendar-month-band");

    expect(within(band).getByText("All month")).toBeDefined();
    expect(within(band).getByTestId("calendar-group-count").textContent).toBe(
      "1",
    );
    expect(
      screen
        .getAllByTestId("calendar-month-cell")
        .every(
          (cell) =>
            cell.querySelector("[data-testid=calendar-group-chip]") === null,
        ),
    ).toBe(true);
  });

  it("opens a band group to its events", () => {
    renderMonth([
      createRecord("whole", "2026-02-01T00:00:00Z", "2026-05-01T00:00:00Z"),
    ]);

    fireEvent.click(screen.getByRole("button", { name: "Aspect, 1 events" }));

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Aspect, 1 events" }));

    expect(screen.queryByTestId("calendar-group-list")).toBeNull();
  });

  it("has no band when no event runs through the whole month", () => {
    renderMonth();

    expect(screen.queryByTestId("calendar-month-band")).toBeNull();
  });

  it("opens a day's week", () => {
    const onOpenDay = vi.fn<DayOpener>();

    renderMonth(undefined, onOpenDay);

    fireEvent.click(
      screen.getByRole("button", { name: "Open the week of 2026-03-12" }),
    );

    expect(onOpenDay).toHaveBeenCalledWith("week", "2026-03-12");
  });
});
