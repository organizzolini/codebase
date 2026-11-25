import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DatePickerFooter } from "../date-picker-footer/date-picker-footer";

const RANGE = { from: "2026-11-24", to: "2026-12-23" };

describe(DatePickerFooter, () => {
  it("applies its class name", () => {
    render(
      <DatePickerFooter
        className="date-picker-footer"
        onToday={() => {}}
        range={RANGE}
      />,
    );

    expect(screen.getByTestId("date-picker-footer").className).toBe(
      "date-picker-footer",
    );
  });

  it("says the range and how many days it holds", () => {
    const { rerender } = render(
      <DatePickerFooter
        onToday={() => {}}
        range={RANGE}
      />,
    );

    expect(screen.getByText(/2026-11-24 – 2026-12-23/u)).toBeDefined();
    expect(screen.getByText("30 days")).toBeDefined();

    rerender(
      <DatePickerFooter
        onToday={() => {}}
        range={{ from: "2026-11-24", to: "2026-11-24" }}
      />,
    );

    expect(screen.getByText("1 day")).toBeDefined();
  });

  it("has no Apply or Cancel, only Go to today", () => {
    const onToday = vi.fn<() => void>();

    render(
      <DatePickerFooter
        onToday={onToday}
        range={RANGE}
      />,
    );

    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Go to today" }));

    expect(onToday).toHaveBeenCalledTimes(1);
  });

  it("shows a hint only when given one", () => {
    const { rerender } = render(
      <DatePickerFooter
        onToday={() => {}}
        range={RANGE}
      />,
    );

    expect(screen.queryByText("Shows the month of the start")).toBeNull();

    rerender(
      <DatePickerFooter
        hint="Shows the month of the start"
        onToday={() => {}}
        range={RANGE}
      />,
    );

    expect(screen.getByText("Shows the month of the start")).toBeDefined();
  });
});
