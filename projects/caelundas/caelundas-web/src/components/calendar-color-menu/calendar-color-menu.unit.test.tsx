import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarColorMenu } from "./calendar-color-menu";

import type { EventGroupLevel } from "../calendar-group-by/event-groups.types";

const FACETS = [
  {
    id: "planet",
    name: "Planet",
    values: [{ count: 2, depth: 1, id: "mars", name: "Mars", path: "Mars" }],
  },
];

function renderMenu(colors = true): {
  onColorsChange: ReturnType<typeof vi.fn<(enabled: boolean) => void>>;
} {
  const onColorsChange = vi.fn<(enabled: boolean) => void>();

  render(
    <CalendarColorMenu
      colorBy={undefined}
      colors={colors}
      facets={FACETS}
      onColorByChange={vi.fn<(level: EventGroupLevel | undefined) => void>()}
      onColorsChange={onColorsChange}
    />,
  );

  return { onColorsChange };
}

describe(CalendarColorMenu, () => {
  it("applies its class name", () => {
    render(
      <CalendarColorMenu
        className="calendar-color-menu"
        colorBy={undefined}
        facets={FACETS}
        onColorByChange={vi.fn<(level: EventGroupLevel | undefined) => void>()}
        onColorsChange={vi.fn<(enabled: boolean) => void>()}
        colors
      />,
    );

    expect(screen.getByTestId("calendar-color-menu").className).toBe(
      "calendar-color-menu",
    );
  });

  it("reads Color beside its palette, with no arrow", () => {
    renderMenu();

    const trigger = screen.getByRole("button", { name: "Color options" });

    expect(trigger.textContent).toBe("Color");
    expect(trigger.querySelectorAll("svg")).toHaveLength(1);
  });

  it("turns colors off, showing their state in the switch", async () => {
    const { onColorsChange } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "Color options" }));

    const toggle = await screen.findByRole("switch", { name: "Color events" });

    expect(toggle.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(toggle);

    expect(onColorsChange).toHaveBeenCalledWith(false);
  });

  it("shows what the events are colored by in the panel, with its legend", async () => {
    renderMenu(false);
    fireEvent.click(screen.getByRole("button", { name: "Color options" }));

    const toggle = await screen.findByRole("switch", { name: "Color events" });

    expect(toggle.getAttribute("aria-checked")).toBe("false");
    expect(screen.getByRole("list", { name: "Colors" })).toBeDefined();
    expect(screen.queryByRole("menuitem", { name: /^Color by/u })).toBeNull();
  });
});
