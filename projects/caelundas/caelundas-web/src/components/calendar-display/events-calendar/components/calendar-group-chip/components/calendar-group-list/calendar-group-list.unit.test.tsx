import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createRecord } from "../../../../../../../../testing/calendar/calendar-records";

import { CalendarGroupList } from "./calendar-group-list";

const EVENTS = [
  createRecord("a", "2026-03-03T10:00:00Z"),
  createRecord("b", "2026-03-03T11:00:00Z"),
  createRecord("c", "2026-03-03T12:00:00Z"),
];

describe(CalendarGroupList, () => {
  it("applies its class name", () => {
    render(
      <CalendarGroupList
        className="calendar-group-list"
        day="2026-03-03"
        events={EVENTS}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("calendar-group-list").className).toContain(
      "calendar-group-list",
    );
  });

  it("lists every event with its time", () => {
    render(
      <CalendarGroupList
        day="2026-03-03"
        events={EVENTS}
        timeZone="UTC"
      />,
    );

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(3);
    expect(screen.getByText("10:00 AM")).toBeDefined();
  });

  it("leaves out the times when asked", () => {
    render(
      <CalendarGroupList
        day="2026-03-03"
        events={EVENTS}
        showTime={false}
        timeZone="UTC"
      />,
    );

    expect(screen.queryByText("10:00 AM")).toBeNull();
  });

  it("lists up to its cap, the rest behind +N more", () => {
    render(
      <CalendarGroupList
        cap={2}
        day="2026-03-03"
        events={EVENTS}
        timeZone="UTC"
      />,
    );

    expect(screen.getAllByTestId("calendar-event-chip")).toHaveLength(2);

    fireEvent.click(screen.getByRole("button", { name: "+1 more" }));

    expect(screen.getByTestId("calendar-overflow-list")).toBeDefined();
  });
});
