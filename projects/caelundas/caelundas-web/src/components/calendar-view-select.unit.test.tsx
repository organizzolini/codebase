import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { setViewportWidth } from "../../testing/viewport";

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

  it("lists the views in a menu below a desktop's width, tablet included", () => {
    render(
      <CalendarViewSelect
        onViewChange={() => {}}
        view="month"
      />,
    );

    expect(screen.queryByRole("button", { name: "View: Month" })).toBeNull();

    act(() => {
      setViewportWidth(800);
    });

    expect(screen.getByRole("button", { name: "View: Month" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "Week" })).toBeNull();
  });
});
