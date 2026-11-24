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
    {
      depth: 1,
      id: "tag",
      name: "Retrograde",
      path: "Planetary / Direction / Retrograde Period",
    },
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

  it("says the day and time of an instant in the event's zone", () => {
    render(<CalendarEventCard event={EVENT} />);

    expect(screen.getByTestId("calendar-event-card-time").textContent).toBe(
      "Mar 4, 10:00 AM",
    );
  });

  it("says the span of an event and how long it lasts", () => {
    render(
      <CalendarEventCard
        event={{
          ...EVENT,
          durationMinutes: 11 * 24 * 60 + 15 * 60,
          end: new Date("2026-03-15T01:00:00Z"),
        }}
      />,
    );

    expect(screen.getByTestId("calendar-event-card-time").textContent).toBe(
      "Mar 4, 10:00 AM – Mar 15, 1:00 AM · 11 days, 15 hours",
    );
  });

  it("says no time for a marker that stands for several events", () => {
    render(
      <CalendarEventCard
        event={EVENT}
        label={{ name: "3 events" }}
      />,
    );

    expect(screen.queryByTestId("calendar-event-card-time")).toBeNull();
  });
});
