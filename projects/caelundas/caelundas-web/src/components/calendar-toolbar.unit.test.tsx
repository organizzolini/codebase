import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarToolbar } from "./calendar-toolbar";

const NAVIGATION = {
  next: () => {},
  prev: () => {},
  title: "March 2026",
  today: () => {},
};

describe(CalendarToolbar, () => {
  it("applies its class name", () => {
    render(
      <CalendarToolbar
        className="calendar-toolbar"
        navigation={NAVIGATION}
      />,
    );

    expect(screen.getByTestId("calendar-toolbar").className).toBe(
      "calendar-toolbar",
    );
  });

  it("titles the period it is handed", () => {
    render(<CalendarToolbar navigation={NAVIGATION} />);

    expect(screen.getByRole("heading", { name: "March 2026" })).toBeDefined();
  });

  it("gives a phone's controls a row of their own under the title", () => {
    render(
      <CalendarToolbar
        filters={<button type="button">Filters</button>}
        navigation={NAVIGATION}
        compact
      />,
    );

    const controls = screen.getByTestId("calendar-toolbar-controls");

    expect(
      controls.contains(screen.getByRole("button", { name: "Filters" })),
    ).toBe(true);
    expect(
      controls.contains(screen.getByRole("heading", { name: "March 2026" })),
    ).toBe(false);
  });

  it("keeps one row when wide, and when a phone has no controls", () => {
    const { rerender } = render(
      <CalendarToolbar
        filters={<button type="button">Filters</button>}
        navigation={NAVIGATION}
      />,
    );

    expect(screen.queryByTestId("calendar-toolbar-controls")).toBeNull();

    rerender(
      <CalendarToolbar
        navigation={NAVIGATION}
        compact
      />,
    );

    expect(screen.queryByTestId("calendar-toolbar-controls")).toBeNull();
  });
});
