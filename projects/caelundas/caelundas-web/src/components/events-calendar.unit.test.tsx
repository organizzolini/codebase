import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventsCalendar } from "./events-calendar";

describe(EventsCalendar, () => {
  it("applies its class name", () => {
    render(
      <EventsCalendar
        anchor={new Date("2026-03-01T12:00:00.000Z")}
        className="events-calendar"
        events={[]}
        onDateChange={() => {}}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByTestId("events-calendar").className).toBe(
      "events-calendar",
    );
  });
});
