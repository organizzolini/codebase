import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePickerWeeks } from "../date-picker-weeks/date-picker-weeks";

const RANGE = { from: "2026-11-22", to: "2026-11-28" };

describe(DatePickerWeeks, () => {
  it("applies its class name", () => {
    render(
      <DatePickerWeeks
        className="date-picker-weeks"
        onSelect={() => {}}
        range={RANGE}
        today="2026-11-24"
      />,
    );

    expect(screen.getByTestId("date-picker-weeks").className).toBe(
      "date-picker-weeks",
    );
  });

  it("lists a chip for each week of the month, across month ends", () => {
    render(
      <DatePickerWeeks
        onSelect={() => {}}
        range={RANGE}
        today="2026-11-24"
      />,
    );

    expect(screen.getByText("Nov 2026")).toBeDefined();
    expect(screen.getByRole("button", { name: "Nov 22 – 28" })).toBeDefined();
    expect(
      screen.getByRole("button", { name: "Nov 29 – Dec 5" }),
    ).toBeDefined();
  });

  it("presses the week picked and marks today's week", () => {
    render(
      <DatePickerWeeks
        onSelect={() => {}}
        range={RANGE}
        today="2026-11-24"
      />,
    );

    const week = screen.getByRole("button", { name: "Nov 22 – 28" });

    expect(week.getAttribute("aria-pressed")).toBe("true");
    expect(week.getAttribute("aria-current")).toBe("date");
    expect(
      screen
        .getByRole("button", { name: "Nov 15 – 21" })
        .getAttribute("aria-current"),
    ).toBeNull();
  });

  it("hands over the week a chip names", () => {
    const onSelect = vi.fn<(range: { from: string; to: string }) => void>();

    render(
      <DatePickerWeeks
        onSelect={onSelect}
        range={RANGE}
        today="2026-11-24"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Nov 29 – Dec 5" }));

    expect(onSelect).toHaveBeenCalledWith({
      from: "2026-11-29",
      to: "2026-12-05",
    });
  });

  it("moves a month with the arrows", () => {
    render(
      <DatePickerWeeks
        onSelect={() => {}}
        range={RANGE}
        today="2026-11-24"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Dec 2026")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));

    expect(screen.getByText("Oct 2026")).toBeDefined();
  });
});
