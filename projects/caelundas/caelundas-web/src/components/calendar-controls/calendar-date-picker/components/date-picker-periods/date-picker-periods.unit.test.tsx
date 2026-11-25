import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePickerPeriods } from "../date-picker-periods/date-picker-periods";

const RANGE = { from: "2026-11-01", to: "2026-11-30" };

describe(DatePickerPeriods, () => {
  it("applies its class name", () => {
    render(
      <DatePickerPeriods
        className="date-picker-periods"
        mode="month"
        onSelect={() => {}}
        range={RANGE}
      />,
    );

    expect(screen.getByTestId("date-picker-periods").className).toBe(
      "date-picker-periods",
    );
  });

  it("picks a month's whole span", () => {
    const onSelect = vi.fn<(range: { from: string; to: string }) => void>();

    render(
      <DatePickerPeriods
        mode="month"
        onSelect={onSelect}
        range={RANGE}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Feb" }));

    expect(onSelect).toHaveBeenCalledWith({
      from: "2026-02-01",
      to: "2026-02-28",
    });
  });

  it("moves to the next year with the arrow", () => {
    render(
      <DatePickerPeriods
        mode="quarter"
        onSelect={() => {}}
        range={RANGE}
      />,
    );

    expect(screen.getByText("2026")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("2027")).toBeDefined();
  });

  it("lists twelve years, pressing the one picked", () => {
    render(
      <DatePickerPeriods
        mode="year"
        onSelect={() => {}}
        range={{ from: "2026-01-01", to: "2026-12-31" }}
      />,
    );

    expect(screen.getByText("2016 – 2027")).toBeDefined();
    expect(
      screen.getByRole("button", { name: "2026" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});
