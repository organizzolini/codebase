import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarEventRow } from "./calendar-event-row";

describe(CalendarEventRow, () => {
  it("applies its class name", () => {
    render(
      <CalendarEventRow
        className="calendar-event-row"
        record={{
          color: null,
          description: "Mars and Venus meet",
          durationMinutes: 0,
          end: new Date("2026-03-04T15:20:00.000Z"),
          id: "event-mars-conjunct-venus",
          location: null,
          start: new Date("2026-03-04T15:20:00.000Z"),
          summary: "Mars Conjunct Venus",
          tags: [],
          timezone: "America/New_York",
        }}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByTestId("calendar-event-row").className).toBe(
      "calendar-event-row",
    );
  });
});
