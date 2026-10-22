import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarTimeline } from "./calendar-timeline";

describe(CalendarTimeline, () => {
  it("applies its class name", () => {
    render(
      <CalendarTimeline
        anchor={new Date("2026-03-15T12:00:00.000Z")}
        className="calendar-timeline"
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        renderToolbar={(navigation) => <h2>{navigation.title}</h2>}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByTestId("calendar-timeline").className).toBe(
      "calendar-timeline",
    );
  });

  it("draws every event in one row when not grouped", () => {
    render(
      <CalendarTimeline
        anchor={new Date("2026-03-15T12:00:00.000Z")}
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        renderToolbar={(navigation) => <h2>{navigation.title}</h2>}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByText("All events")).toBeDefined();
    expect(screen.getByRole("heading", { name: "March 2026" })).toBeDefined();
  });

  it("zooms a phone's day in", () => {
    render(
      <CalendarTimeline
        anchor={new Date("2026-03-15T12:00:00.000Z")}
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        renderToolbar={(navigation) => <h2>{navigation.title}</h2>}
        scale="day"
        timeZone="America/New_York"
        compact
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(
      screen.getByRole("heading", { name: "Sunday, March 15, 2026" }),
    ).toBeDefined();
  });
});
