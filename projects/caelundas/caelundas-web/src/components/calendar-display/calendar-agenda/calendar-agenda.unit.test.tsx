import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarAgenda } from "./calendar-agenda";

import type { CalendarEventRecord } from "../events-calendar/components/calendar-loader/calendar-records.types";

const RANGE = {
  from: "2026-03-01",
  through: "2026-03-31",
  timeZone: "UTC",
};

function aspect(id: string): CalendarEventRecord {
  const at = new Date("2026-03-04T10:00:00.000Z");

  return {
    color: null,
    description: "",
    durationMinutes: 0,
    end: at,
    groups: [],
    id,
    location: null,
    start: at,
    summary: `Aspect ${id}`,
    tags: [
      {
        depth: 3,
        id: "kind",
        name: "Major Aspect",
        path: "Type / Aspect / Simple Aspect / Major Aspect",
      },
    ],
    timezone: "UTC",
  };
}

describe(CalendarAgenda, () => {
  it("applies its class name", () => {
    render(
      <CalendarAgenda
        className="calendar-agenda"
        events={[]}
        range={{
          from: "2026-03-01",
          through: "2026-03-31",
          timeZone: "America/New_York",
        }}
      />,
    );

    expect(screen.getByTestId("calendar-agenda").className).toBe(
      "calendar-agenda",
    );
  });

  it("gathers similar events under a row that opens and closes", () => {
    render(
      <CalendarAgenda
        events={["a", "b", "c"].map((id) => aspect(id))}
        range={RANGE}
        clusters
      />,
    );

    const toggle = screen.getByRole("button", { name: /Major aspects/u });

    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);

    expect(
      screen
        .getByRole("button", { name: /Major aspects/u })
        .getAttribute("aria-expanded"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: /Major aspects/u }));

    expect(
      screen
        .getByRole("button", { name: /Major aspects/u })
        .getAttribute("aria-expanded"),
    ).toBe("false");
  });
});
