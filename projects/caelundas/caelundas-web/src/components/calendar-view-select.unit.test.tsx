import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarViewSelect } from "./calendar-view-select";

describe(CalendarViewSelect, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewSelect
        className="calendar-view-select"
        onViewChange={() => {}}
        view="month"
      />,
    );

    expect(screen.getByTestId("calendar-view-select").className).toBe(
      "calendar-view-select",
    );
  });

  it("keeps the view shown when its own button is pressed again", () => {
    const onViewChange = vi.fn<(view: string) => void>();

    render(
      <CalendarViewSelect
        onViewChange={onViewChange}
        view="month"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Month" }));

    expect(onViewChange).not.toHaveBeenCalled();
  });
});
