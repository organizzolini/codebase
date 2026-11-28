import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DatePickerPanel } from "../date-picker-panel/date-picker-panel";

import type { CalendarViewName } from "../../../../calendar-display/events-calendar/components/calendar-views/calendar-views.types";
import type { DateRangeValue } from "../../calendar-date-picker.types";

const RANGE = { from: "2026-11-24", to: "2026-12-23" };

/** Renders the panel, handing back the Apply and close handlers. */
function renderPanel(view?: CalendarViewName): {
  onApply: (range: DateRangeValue) => void;
  onClose: () => void;
} {
  const onApply = vi.fn<(range: DateRangeValue) => void>();
  const onClose = vi.fn<() => void>();

  render(
    <DatePickerPanel
      onApply={onApply}
      onClose={onClose}
      range={RANGE}
      timeZone="UTC"
      view={view}
    />,
  );

  return { onApply, onClose };
}

describe(DatePickerPanel, () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(Date.UTC(2026, 10, 24, 12)));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies its class name", () => {
    render(
      <DatePickerPanel
        className="date-picker-panel"
        onApply={() => {}}
        onClose={() => {}}
        range={RANGE}
        timeZone="UTC"
      />,
    );

    expect(screen.getByTestId("date-picker-panel").className).toBe(
      "date-picker-panel",
    );
  });

  it("has no Apply or Cancel", () => {
    renderPanel();

    expect(screen.queryByRole("button", { name: "Apply" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
  });

  it("offers no presets or time fields", () => {
    renderPanel();

    expect(screen.queryByRole("button", { name: "Last month" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Next 90 days" })).toBeNull();
    expect(screen.queryByTestId("date-picker-time-fields")).toBeNull();
  });

  it("applies the first day alone, then the range on the second click", () => {
    const { onApply, onClose } = renderPanel();

    fireEvent.click(
      screen.getByRole("button", { name: /November 9th, 2026/u }),
    );

    expect(onApply).toHaveBeenLastCalledWith({
      from: "2026-11-09",
      to: "2026-11-09",
    });
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(
      screen.getByRole("button", { name: /November 3rd, 2026/u }),
    );

    expect(onApply).toHaveBeenLastCalledWith({
      from: "2026-11-03",
      to: "2026-11-09",
    });
    expect(onApply).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies a whole week from its chip and closes", () => {
    const { onApply, onClose } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Week" }));
    fireEvent.click(screen.getByRole("button", { name: "Nov 8 – 14" }));

    expect(onApply).toHaveBeenCalledWith({
      from: "2026-11-08",
      to: "2026-11-14",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies a whole month and a year from their grids", () => {
    const { onApply, onClose } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Mar" }));

    expect(onApply).toHaveBeenLastCalledWith({
      from: "2026-03-01",
      to: "2026-03-31",
    });

    fireEvent.click(screen.getByRole("button", { name: "Year" }));
    fireEvent.click(screen.getByRole("button", { name: "2027" }));

    expect(onApply).toHaveBeenLastCalledWith({
      from: "2027-01-01",
      to: "2027-12-31",
    });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("applies today's span with Go to today", () => {
    const { onApply, onClose } = renderPanel();

    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Go to today" }));

    expect(onApply).toHaveBeenCalledWith({
      from: "2026-11-01",
      to: "2026-11-30",
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offers neither Day nor Week in the month layout, and says what it shows", () => {
    renderPanel("month");

    expect(screen.queryByRole("button", { name: "Day" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Week" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Month" })
        .getAttribute("aria-pressed"),
    ).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Quarter" }));

    expect(
      screen.getByText("The month view shows the month of the start."),
    ).toBeDefined();
  });

  it("offers Week chips but no Day in the week layout", () => {
    renderPanel("week");

    expect(screen.queryByRole("button", { name: "Day" })).toBeNull();
    expect(screen.getByTestId("date-picker-weeks")).toBeDefined();
  });
});
