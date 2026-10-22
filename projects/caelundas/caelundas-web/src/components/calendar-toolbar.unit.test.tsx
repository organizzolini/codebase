import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EventCalendar } from "@codebase/presentation";

import { CalendarToolbar } from "./calendar-toolbar";

describe(CalendarToolbar, () => {
  it("applies its class name", () => {
    // The toolbar reads the state of the calendar it sits inside.
    render(<CalendarToolbar className="calendar-toolbar" />, {
      wrapper: EventCalendar,
    });

    expect(screen.getByTestId("calendar-toolbar").className).toBe(
      "calendar-toolbar",
    );
  });
});
