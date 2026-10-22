import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EVENT_COLOR_RULES } from "../lib/calendar/calendar-colors";

import { CalendarColorsMenu } from "./calendar-colors-menu";

describe(CalendarColorsMenu, () => {
  it("applies its class name", () => {
    render(
      <CalendarColorsMenu
        className="calendar-colors-menu"
        onEnabledChange={vi.fn<(enabled: boolean) => void>()}
        enabled
      />,
    );

    expect(screen.getByTestId("calendar-colors-menu").className).toBe(
      "calendar-colors-menu",
    );
  });

  it("says whether colors are on", () => {
    const { rerender } = render(
      <CalendarColorsMenu
        onEnabledChange={vi.fn<(enabled: boolean) => void>()}
        enabled
      />,
    );

    expect(screen.getByRole("button", { name: "Colors: on" })).toBeDefined();

    rerender(
      <CalendarColorsMenu
        enabled={false}
        onEnabledChange={vi.fn<(enabled: boolean) => void>()}
      />,
    );

    expect(screen.getByRole("button", { name: "Colors: off" })).toBeDefined();
  });

  it("turns colors off from the menu", async () => {
    const onEnabledChange = vi.fn<(enabled: boolean) => void>();

    render(
      <CalendarColorsMenu
        onEnabledChange={onEnabledChange}
        enabled
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Colors: on" }));
    fireEvent.click(
      await screen.findByRole("menuitemcheckbox", {
        name: "Color events by type",
      }),
    );

    expect(onEnabledChange).toHaveBeenCalledWith(false);
  });

  it("names the color of every kind of event", async () => {
    render(
      <CalendarColorsMenu
        onEnabledChange={vi.fn<(enabled: boolean) => void>()}
        enabled
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Colors: on" }));

    for (const rule of EVENT_COLOR_RULES) {
      await expect(screen.findByText(rule.label)).resolves.toBeDefined();
    }
  });
});
