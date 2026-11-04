import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarAgenda } from "./calendar-agenda";

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
});
