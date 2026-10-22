import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarEventTooltip } from "./calendar-event-tooltip";

import type { CalendarEventRecord } from "../lib/events-database/events-database.types";

const EVENT: CalendarEventRecord = {
  color: null,
  description: "Mars and Saturn stand ninety degrees apart",
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

describe(CalendarEventTooltip, () => {
  it("applies its class name", () => {
    render(
      <CalendarEventTooltip
        className="calendar-event-tooltip"
        event={EVENT}
      />,
    );

    expect(screen.getByTestId("calendar-event-tooltip").className).toBe(
      "calendar-event-tooltip",
    );
  });

  it("draws what it is given", () => {
    render(<CalendarEventTooltip event={EVENT}>🎯 ♂ □ ♄</CalendarEventTooltip>);

    expect(screen.getByText("🎯 ♂ □ ♄")).toBeDefined();
  });

  it("says the name in English and the description on hover", async () => {
    render(<CalendarEventTooltip event={EVENT}>🎯 ♂ □ ♄</CalendarEventTooltip>);
    fireEvent.focus(screen.getByText("🎯 ♂ □ ♄"));

    await expect(
      screen.findByText("Mars perfective square Saturn"),
    ).resolves.toBeDefined();
    await expect(
      screen.findByText("Mars and Saturn stand ninety degrees apart"),
    ).resolves.toBeDefined();
  });
});
