import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarEventChip } from "./calendar-event-chip";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";

const EVENT: CalendarEventRecord = {
  color: null,
  description: "Mars perfective square Saturn",
  durationMinutes: 0,
  end: new Date("2026-03-03T10:00:00.000Z"),
  groups: [],
  id: "event-mars-square-saturn",
  location: null,
  start: new Date("2026-03-03T10:00:00.000Z"),
  summary: "🎯 ♂ □ ♄ Mars perfective square Saturn",
  tags: [],
  timezone: "America/New_York",
};

describe(CalendarEventChip, () => {
  it("applies its class name", () => {
    render(
      <CalendarEventChip
        className="calendar-event-chip"
        event={EVENT}
      />,
    );

    expect(screen.getByTestId("calendar-event-chip").className).toBe(
      "calendar-event-chip",
    );
  });

  it("draws the glyphs alone", () => {
    render(<CalendarEventChip event={EVENT} />);

    expect(screen.getByText("🎯 ♂ □ ♄").className).not.toContain("sr-only");
    expect(screen.getByText("Mars perfective square Saturn.").className).toBe(
      "sr-only",
    );
  });

  it("spells out the name and description for a screen reader", () => {
    render(
      <CalendarEventChip
        description="Type / Aspect. Instant"
        event={EVENT}
      />,
    );

    expect(
      screen.getByText("Mars perfective square Saturn. Type / Aspect. Instant")
        .className,
    ).toBe("sr-only");
  });

  it("draws an event with no glyphs by its name, said once", () => {
    render(
      <CalendarEventChip
        description="Duration"
        event={{ ...EVENT, description: "", summary: "Mars Retrograde" }}
      />,
    );

    expect(screen.getAllByText("Mars Retrograde")).toHaveLength(1);
    expect(screen.getByText("Duration").className).toBe("sr-only");
  });
});
