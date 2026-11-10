import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarViewMenu } from "./calendar-view-menu";

function renderMenu(
  overrides: Partial<Parameters<typeof CalendarViewMenu>[0]> = {},
): {
  onClustersChange: ReturnType<typeof vi.fn<(enabled: boolean) => void>>;
} {
  const onClustersChange = vi.fn<(enabled: boolean) => void>();

  render(
    <CalendarViewMenu
      onClustersChange={onClustersChange}
      clusters
      {...overrides}
    />,
  );

  return { onClustersChange };
}

describe(CalendarViewMenu, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewMenu
        className="calendar-view-menu"
        onClustersChange={vi.fn<(enabled: boolean) => void>()}
        clusters
      />,
    );

    expect(screen.getByTestId("calendar-view-menu").className).toBe(
      "calendar-view-menu",
    );
  });

  it("reads View, with no arrow", () => {
    renderMenu();

    const trigger = screen.getByRole("button", { name: "View options" });

    expect(trigger.textContent).toBe("View");
    expect(trigger.querySelectorAll("svg")).toHaveLength(1);
  });

  it("has no presets or colors, which belong elsewhere", async () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "View options" }));
    await screen.findByRole("menuitemcheckbox", {
      name: "Group similar events",
    });

    expect(screen.queryByText("Presets")).toBeNull();
    expect(screen.queryByText("Color events")).toBeNull();
  });

  it("turns merging off from the menu", async () => {
    const { onClustersChange } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "View options" }));
    fireEvent.click(
      await screen.findByRole("menuitemcheckbox", {
        name: "Group similar events",
      }),
    );

    expect(onClustersChange).toHaveBeenCalledWith(false);
  });

  it("offers glyphs and emojis, glyphs by default, and reports the pick", async () => {
    const onSymbolsChange = vi.fn<(symbols: "emojis" | "glyphs") => void>();

    renderMenu({ onSymbolsChange });
    fireEvent.click(screen.getByRole("button", { name: "View options" }));

    const glyphs = await screen.findByRole("menuitemradio", { name: "Glyphs" });

    expect(glyphs.getAttribute("aria-checked")).toBe("true");

    fireEvent.click(screen.getByRole("menuitemradio", { name: "Emojis" }));

    expect(onSymbolsChange).toHaveBeenCalledWith("emojis");
  });
});
