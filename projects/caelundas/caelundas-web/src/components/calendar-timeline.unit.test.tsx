import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
        onNavigationChange={() => {}}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByTestId("calendar-timeline").className).toBe(
      "calendar-timeline",
    );
  });

  it("draws every event in one row when not grouped, titling its period", () => {
    const onNavigationChange = vi.fn();
    render(
      <CalendarTimeline
        anchor={new Date("2026-03-15T12:00:00.000Z")}
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        onNavigationChange={onNavigationChange}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByText("All events")).toBeDefined();
    expect(onNavigationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "March 2026" }),
    );
  });

  it("zooms a phone's day in", () => {
    const onNavigationChange = vi.fn();
    render(
      <CalendarTimeline
        anchor={new Date("2026-03-15T12:00:00.000Z")}
        events={[]}
        facets={[]}
        grouping={[]}
        onDateChange={() => {}}
        onNavigationChange={onNavigationChange}
        scale="day"
        timeZone="America/New_York"
        compact
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));

    expect(onNavigationChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ title: "Sunday, March 15, 2026" }),
    );
  });
});
