import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePickerModes } from "../date-picker-modes/date-picker-modes";

import type { DatePickerMode } from "../../calendar-date-picker.types";

describe(DatePickerModes, () => {
  it("applies its class name", () => {
    render(
      <DatePickerModes
        className="date-picker-modes"
        mode="day"
        onModeChange={() => {}}
      />,
    );

    expect(screen.getByTestId("date-picker-modes").className).toBe(
      "date-picker-modes",
    );
  });

  it("lists the six modes and presses the one picked", () => {
    render(
      <DatePickerModes
        mode="quarter"
        onModeChange={() => {}}
      />,
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toStrictEqual(["Day", "Week", "Month", "Quarter", "Half-year", "Year"]);
    expect(
      screen
        .getByRole("button", { name: "Quarter" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });

  it("lists only the modes a layout can show", () => {
    render(
      <DatePickerModes
        mode="month"
        onModeChange={() => {}}
        view="month"
      />,
    );

    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toStrictEqual(["Month", "Quarter", "Half-year", "Year"]);
  });

  it("hands over the mode pressed", () => {
    const onModeChange = vi.fn<(mode: DatePickerMode) => void>();

    render(
      <DatePickerModes
        mode="day"
        onModeChange={onModeChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Half-year" }));

    expect(onModeChange).toHaveBeenCalledWith("half-year");
  });
});
