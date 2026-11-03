import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarOverflowList } from "./calendar-overflow-list";

describe(CalendarOverflowList, () => {
  it("applies its class name", () => {
    render(
      <CalendarOverflowList
        className="calendar-overflow-list"
        day="2026-03-12"
        events={[]}
        timeZone="America/New_York"
      />,
    );

    expect(screen.getByTestId("calendar-overflow-list").className).toBe(
      "calendar-overflow-list",
    );
  });
});
