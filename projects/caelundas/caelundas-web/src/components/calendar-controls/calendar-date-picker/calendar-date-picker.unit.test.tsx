import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarDatePicker } from "./calendar-date-picker";

import type { DateRangeValue } from "./calendar-date-picker.types";

const RANGE = { from: "2026-11-24", to: "2026-12-23" };

describe(CalendarDatePicker, () => {
  it("applies its class name", () => {
    render(
      <CalendarDatePicker
        className="calendar-date-picker"
        onApply={() => {}}
        onOpenChange={() => {}}
        open={false}
        range={RANGE}
        timeZone="UTC"
        title="Title"
      />,
    );

    expect(screen.getByTestId("calendar-date-picker").className).toBe(
      "calendar-date-picker",
    );
  });

  it("opens from its title, a button", () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();

    render(
      <CalendarDatePicker
        onApply={() => {}}
        onOpenChange={onOpenChange}
        open={false}
        range={RANGE}
        timeZone="UTC"
        title="2026-11-24 – 2026-12-23"
        triggerClassName="title"
      />,
    );

    const title = screen.getByRole("button", {
      name: "2026-11-24 – 2026-12-23",
    });

    expect(title.className).toBe("title");

    fireEvent.click(title);

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("applies a whole month at once and closes", () => {
    const onApply = vi.fn<(range: DateRangeValue) => void>();
    const onOpenChange = vi.fn<(open: boolean) => void>();

    render(
      <CalendarDatePicker
        onApply={onApply}
        onOpenChange={onOpenChange}
        range={RANGE}
        timeZone="UTC"
        title="Title"
        open
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Month" }));
    fireEvent.click(screen.getByRole("button", { name: "Mar" }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hides the modes its layout cannot show", () => {
    render(
      <CalendarDatePicker
        onApply={() => {}}
        onOpenChange={() => {}}
        range={RANGE}
        timeZone="UTC"
        title="Title"
        view="month"
        open
      />,
    );

    expect(screen.queryByRole("button", { name: "Day" })).toBeNull();
    expect(screen.getByRole("button", { name: "Month" })).toBeDefined();
  });
});
