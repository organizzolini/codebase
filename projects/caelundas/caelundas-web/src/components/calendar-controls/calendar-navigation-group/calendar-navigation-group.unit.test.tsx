import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarNavigationGroup } from "./calendar-navigation-group";

const NAVIGATION = {
  next: () => {},
  prev: () => {},
  title: "March 2026",
  today: () => {},
};

describe(CalendarNavigationGroup, () => {
  it("applies its class name", () => {
    render(
      <CalendarNavigationGroup
        className="calendar-navigation-group"
        navigation={NAVIGATION}
      />,
    );

    expect(screen.getByTestId("calendar-navigation-group").className).toBe(
      "calendar-navigation-group",
    );
  });

  it("moves the view with its buttons", () => {
    const next = vi.fn<() => void>();
    const previous = vi.fn<() => void>();
    const today = vi.fn<() => void>();

    render(
      <CalendarNavigationGroup
        navigation={{ ...NAVIGATION, next, prev: previous, today }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Today" }));

    expect(previous).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect(today).toHaveBeenCalledTimes(1);
  });

  it("titles the period between the arrows", () => {
    render(<CalendarNavigationGroup navigation={NAVIGATION} />);

    expect(screen.getByRole("heading", { name: "March 2026" })).toBeDefined();
  });

  it("sizes the title to its text so no space pads the arrows, but lets a phone's title shrink", () => {
    const { rerender } = render(
      <CalendarNavigationGroup navigation={NAVIGATION} />,
    );

    expect(screen.getByRole("heading").className).not.toMatch(/\bw-\d/u);
    expect(screen.getByRole("heading").className).toContain("px-0");

    rerender(
      <CalendarNavigationGroup
        navigation={NAVIGATION}
        compact
      />,
    );

    expect(screen.getByRole("heading").className).toContain("grow");
  });

  it("opens the date picker from the title when it is given one", () => {
    const onOpenChange = vi.fn<(open: boolean) => void>();

    render(
      <CalendarNavigationGroup
        navigation={NAVIGATION}
        picker={{
          onApply: () => {},
          onOpenChange,
          open: false,
          range: { from: "2026-03-01", to: "2026-03-31" },
          timeZone: "UTC",
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "March 2026" }));

    expect(onOpenChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("leaves the title plain without a picker", () => {
    render(<CalendarNavigationGroup navigation={NAVIGATION} />);

    expect(screen.queryByRole("button", { name: "March 2026" })).toBeNull();
  });

  it("hides Today while the days shown include today", () => {
    const { rerender } = render(
      <CalendarNavigationGroup navigation={{ ...NAVIGATION, isToday: true }} />,
    );

    expect(screen.queryByRole("button", { name: "Today" })).toBeNull();

    rerender(
      <CalendarNavigationGroup
        navigation={{ ...NAVIGATION, isToday: false }}
      />,
    );

    expect(screen.getByRole("button", { name: "Today" }).textContent).toBe(
      "Today",
    );
  });

  it("puts Today before the previous button", () => {
    render(<CalendarNavigationGroup navigation={NAVIGATION} />);

    const [first, second, third] = screen.getAllByRole("button");

    expect(first?.textContent).toBe("Today");
    expect(second?.getAttribute("aria-label")).toBe("Previous");
    expect(third?.getAttribute("aria-label")).toBe("Next");
  });
});
