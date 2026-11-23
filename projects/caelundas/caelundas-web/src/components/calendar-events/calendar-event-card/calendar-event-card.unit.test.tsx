import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarEventCard } from "./calendar-event-card";

import type { CalendarEventRecord } from "../../calendar-display/events-calendar/components/calendar-loader/calendar-records.types";

const EVENT: CalendarEventRecord = {
  color: null,
  description: "",
  durationMinutes: 0,
  end: new Date("2026-03-04T10:00:00Z"),
  groups: [],
  id: "event",
  location: null,
  start: new Date("2026-03-04T10:00:00Z"),
  summary: "Mars Retrograde",
  tags: [
    { depth: 1, id: "tag", name: "Retrograde", path: "Type / Retrograde" },
  ],
  timezone: "UTC",
};

describe(CalendarEventCard, () => {
  it("applies its class name", () => {
    render(
      <CalendarEventCard
        className="calendar-event-card"
        event={EVENT}
      />,
    );

    expect(screen.getByTestId("calendar-event-card").className).toBe(
      "calendar-event-card",
    );
  });

  it("says the event's name and its tags", () => {
    render(<CalendarEventCard event={EVENT} />);

    expect(screen.getByText("Mars Retrograde")).toBeDefined();
    expect(screen.getByText("Retrograde")).toBeDefined();
  });

  it("says what a marker for several events is given to say, in place of the event's own", () => {
    render(
      <CalendarEventCard
        event={EVENT}
        label={{ details: "Click to list them.", name: "3 events" }}
      />,
    );

    expect(screen.getByText("3 events")).toBeDefined();
    expect(screen.getByText("Click to list them.")).toBeDefined();
    expect(screen.queryByText("Mars Retrograde")).toBeNull();
  });
});
