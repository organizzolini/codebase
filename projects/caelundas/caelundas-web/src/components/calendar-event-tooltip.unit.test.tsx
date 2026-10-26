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
  summary: "♂ □ ♄ Mars perfective square Saturn",
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
    render(<CalendarEventTooltip event={EVENT}>♂ □ ♄</CalendarEventTooltip>);

    expect(screen.getByText("♂ □ ♄")).toBeDefined();
  });

  it("says the name in English and the description on hover", async () => {
    render(<CalendarEventTooltip event={EVENT}>♂ □ ♄</CalendarEventTooltip>);
    fireEvent.focus(screen.getByText("♂ □ ♄"));

    await expect(
      screen.findByText("Mars perfective square Saturn"),
    ).resolves.toBeDefined();
    await expect(
      screen.findByText("Mars and Saturn stand ninety degrees apart"),
    ).resolves.toBeDefined();
  });

  it("says a label of its own in place of the event's", async () => {
    render(
      <CalendarEventTooltip
        event={EVENT}
        label={{ details: "Click to list them.", name: "2 events" }}
      >
        2
      </CalendarEventTooltip>,
    );
    fireEvent.focus(screen.getByText("2"));

    await expect(screen.findByText("2 events")).resolves.toBeDefined();
    await expect(
      screen.findByText("Click to list them."),
    ).resolves.toBeDefined();
    expect(screen.queryByText("Mars perfective square Saturn")).toBeNull();
  });

  it("shows the event's tags as pills on hover", async () => {
    render(
      <CalendarEventTooltip
        event={{
          ...EVENT,
          tags: [
            { depth: 1, id: "square", name: "Square", path: "Type / Square" },
          ],
        }}
      >
        ♂ □ ♄
      </CalendarEventTooltip>,
    );
    fireEvent.focus(screen.getByText("♂ □ ♄"));

    await expect(screen.findByText("Square")).resolves.toBeDefined();
  });

  it("draws the event's symbols above its name, so a cut-off chip can be read", async () => {
    render(<CalendarEventTooltip event={EVENT}>♂ □ ♄</CalendarEventTooltip>);
    fireEvent.focus(screen.getByText("♂ □ ♄"));

    await expect(
      screen.findByTestId("calendar-event-tooltip-symbols"),
    ).resolves.toBeDefined();
  });

  it("draws no symbols for a marker with a label of its own", async () => {
    render(
      <CalendarEventTooltip
        event={EVENT}
        label={{ name: "2 events" }}
      >
        2
      </CalendarEventTooltip>,
    );
    fireEvent.focus(screen.getByText("2"));
    await screen.findByText("2 events");

    expect(screen.queryByTestId("calendar-event-tooltip-symbols")).toBeNull();
  });
});
