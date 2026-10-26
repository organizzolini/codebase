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

  it("picks another scale from its menu", async () => {
    const onScaleChange = vi.fn<(scale: string) => void>();

    render(
      <CalendarScaleSelect
        onScaleChange={onScaleChange}
        scale="month"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Scale: Month" }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Quarter" }),
    );

    expect(onScaleChange).toHaveBeenCalledWith("quarter");
  });

  it("keeps the scale shown when it is picked again", async () => {
    const onScaleChange = vi.fn<(scale: string) => void>();

    render(
      <CalendarScaleSelect
        onScaleChange={onScaleChange}
        scale="month"
        compact
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Scale: Month" }));
    fireEvent.click(
      await screen.findByRole("menuitemradio", { name: "Month" }),
    );

    expect(onScaleChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Scale: Month" }).textContent,
    ).toBe("Month");
  });
});
