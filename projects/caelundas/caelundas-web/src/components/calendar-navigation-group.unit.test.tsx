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

  it("holds one width, or lets a phone's title shrink", () => {
    const { rerender } = render(
      <CalendarNavigationGroup navigation={NAVIGATION} />,
    );

    expect(screen.getByRole("heading").className).toContain("w-60");

    rerender(
      <CalendarNavigationGroup
        navigation={NAVIGATION}
        compact
      />,
    );

    expect(screen.getByRole("heading").className).not.toContain("w-60");
  });

  it("switches Today off while the days shown include today", () => {
    const { rerender } = render(
      <CalendarNavigationGroup navigation={{ ...NAVIGATION, isToday: true }} />,
    );

    expect(screen.getByRole("button", { name: "Today" })).toHaveProperty(
      "disabled",
      true,
    );

    rerender(
      <CalendarNavigationGroup
        navigation={{ ...NAVIGATION, isToday: false }}
      />,
    );

    expect(screen.getByRole("button", { name: "Today" })).toHaveProperty(
      "disabled",
      false,
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
