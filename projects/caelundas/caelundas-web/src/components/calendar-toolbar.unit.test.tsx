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
});
