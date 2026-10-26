import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarScaleSelect } from "./calendar-scale-select";

describe(CalendarScaleSelect, () => {
  it("applies its class name", () => {
    render(
      <CalendarScaleSelect
        className="calendar-scale-select"
        onScaleChange={() => {}}
        scale="month"
      />,
    );

    expect(screen.getByTestId("calendar-scale-select").className).toBe(
      "calendar-scale-select",
    );
  });

  it("picks another scale with its buttons", () => {
    const onScaleChange = vi.fn<(scale: string) => void>();

    render(
      <CalendarScaleSelect
        onScaleChange={onScaleChange}
        scale="month"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Quarter" }));

    expect(onScaleChange).toHaveBeenCalledWith("quarter");
  });

  it("presses the scale shown, and keeps it when it is picked again", () => {
    const onScaleChange = vi.fn<(scale: string) => void>();

    render(
      <CalendarScaleSelect
        onScaleChange={onScaleChange}
        scale="month"
      />,
    );

    const month = screen.getByRole("button", { name: "Month" });

    expect(month.getAttribute("aria-pressed")).toBe("true");
    expect(
      screen.getByRole("button", { name: "Week" }).getAttribute("aria-pressed"),
    ).toBe("false");

    fireEvent.click(month);

    expect(onScaleChange).not.toHaveBeenCalled();
  });
});
