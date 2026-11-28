import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createRecord } from "../../../../../../../../testing/calendar/calendar-records";

import { CalendarMonthCell } from "./calendar-month-cell";

import type { CalendarEventRecord } from "../../../calendar-loader/calendar-records.types";
import type { DayOpener } from "../../calendar-month.types";

const GROUPING = [{ field: "tag:*", tags: ["a"] }];
const EVENTS = [
  createRecord("a", "2026-03-10T10:00:00Z"),
  createRecord("b", "2026-03-10T11:00:00Z"),
  createRecord("c", "2026-03-10T12:00:00Z", undefined, ["Sign"]),
];

function renderCell(
  properties: Partial<{ isOutside: boolean; isToday: boolean }> & {
    events?: readonly CalendarEventRecord[];
    onOpenDay?: DayOpener | undefined;
  } = {},
): void {
  render(
    <CalendarMonthCell
      day="2026-03-10"
      events={properties.events ?? EVENTS}
      groupColors={undefined}
      grouping={GROUPING}
      isOutside={properties.isOutside ?? false}
      isToday={properties.isToday ?? false}
      onOpenDay={properties.onOpenDay}
      timeZone="UTC"
    />,
  );
}

describe(CalendarMonthCell, () => {
  it("applies its class name", () => {
    render(
      <CalendarMonthCell
        className="calendar-month-cell"
        day="2026-03-10"
        events={[]}
        groupColors={undefined}
        grouping={GROUPING}
        isOutside={false}
        isToday={false}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("calendar-month-cell").className).toContain(
      "calendar-month-cell",
    );
  });

  it("shows the day's number and its events as groups with their counts", () => {
    renderCell();

    expect(screen.getByText("10")).toBeDefined();
    expect(
      screen
        .getAllByTestId("calendar-group-count")
        .map((count) => count.textContent),
    ).toStrictEqual(["2", "1"]);
  });

  it("opens a group in place, growing the cell", () => {
    renderCell();

    fireEvent.click(screen.getByRole("button", { name: "Aspect, 2 events" }));

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "Aspect, 2 events" }));

    expect(screen.queryByTestId("calendar-group-list")).toBeNull();
  });

  it("opens the week from the number alone, not from the cell, a group or its events", () => {
    const onOpenDay = vi.fn<DayOpener>();

    renderCell({ onOpenDay });

    fireEvent.click(screen.getByTestId("calendar-month-cell"));
    fireEvent.click(screen.getByRole("button", { name: "Aspect, 2 events" }));
    fireEvent.click(screen.getByTestId("calendar-group-list"));

    expect(onOpenDay).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: "Open the week of 2026-03-10" }),
    );

    expect(onOpenDay).toHaveBeenCalledExactlyOnceWith("week", "2026-03-10");
  });

  it("is plain without a way to open a day", () => {
    renderCell({ isOutside: true, isToday: true });

    expect(screen.queryByTestId("calendar-month-cell-area")).toBeNull();
    expect(
      screen.getByTestId("calendar-month-cell").matches("[data-today=true]"),
    ).toBe(true);
  });

  it("puts the groups past its cap behind +N more groups", () => {
    const many = Array.from({ length: 12 }, (_, index) =>
      createRecord(`e${String(index)}`, "2026-03-10T10:00:00Z", undefined, [
        `Root${String(index).padStart(2, "0")}`,
      ]),
    );

    renderCell({ events: many });

    expect(screen.getAllByTestId("calendar-group-chip")).toHaveLength(10);

    fireEvent.click(screen.getByRole("button", { name: "+2 more groups" }));

    expect(screen.getByTestId("calendar-overflow-list")).toBeDefined();
  });
});
