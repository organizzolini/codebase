import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarSymbolsContext } from "../constants/calendar-symbols.constants";

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
          groups: [],
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

  const symbolic = {
    color: null,
    description: "Mars Conjunct Venus",
    durationMinutes: 0,
    end: new Date("2026-03-04T15:20:00.000Z"),
    groups: [],
    id: "event-mars-conjunct-venus",
    location: null,
    start: new Date("2026-03-04T15:20:00.000Z"),
    summary: "♂️☌♀️ Mars Conjunct Venus",
    tags: [],
    timezone: "America/New_York",
  };

  it("draws the symbols as icons by default setting of glyphs", () => {
    render(
      <CalendarSymbolsContext value="glyphs">
        <CalendarEventRow
          record={symbolic}
          timeZone="America/New_York"
        />
      </CalendarSymbolsContext>,
    );

    expect(screen.getByTestId("event-glyphs").dataset["testid"]).toBe(
      "event-glyphs",
    );
    expect(screen.getByText("Mars Conjunct Venus").textContent).toBe(
      "Mars Conjunct Venus",
    );
  });

  it("writes the symbols as emojis when the setting says so", () => {
    render(
      <CalendarSymbolsContext value="emojis">
        <CalendarEventRow
          record={symbolic}
          timeZone="America/New_York"
        />
      </CalendarSymbolsContext>,
    );

    expect(screen.queryByTestId("event-glyphs")).toBeNull();
    expect(screen.getByText("♂️☌♀️").textContent).toBe("♂️☌♀️");
  });

  it("draws the duration and the tags as pills", () => {
    render(
      <CalendarEventRow
        record={{
          ...symbolic,
          tags: [
            { depth: 1, id: "aspect", name: "Aspect", path: "Type / Aspect" },
          ],
        }}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByText("Aspect").dataset["path"]).toBe("Type / Aspect");
    expect(screen.getByText("Instant").textContent).toBe("Instant");
  });

  it("gives the start and end of an event that lasts", () => {
    render(
      <CalendarEventRow
        record={{
          ...symbolic,
          durationMinutes: 90,
          end: new Date("2026-03-04T16:50:00.000Z"),
        }}
        timeZone="America/New_York"
      />,
    );

    expect(
      screen.getByText("Mar 4, 10:20 AM – Mar 4, 11:50 AM · 1 hour, 30 minutes")
        .textContent,
    ).toContain("10:20 AM – Mar 4, 11:50 AM");
  });
});
