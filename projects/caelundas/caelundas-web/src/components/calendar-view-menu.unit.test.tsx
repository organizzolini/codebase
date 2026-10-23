import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarViewMenu } from "./calendar-view-menu";

function renderMenu(
  overrides: Partial<Parameters<typeof CalendarViewMenu>[0]> = {},
): {
  onClustersChange: ReturnType<typeof vi.fn<(enabled: boolean) => void>>;
  onColorsChange: ReturnType<typeof vi.fn<(enabled: boolean) => void>>;
} {
  const onClustersChange = vi.fn<(enabled: boolean) => void>();
  const onColorsChange = vi.fn<(enabled: boolean) => void>();

  render(
    <CalendarViewMenu
      onClustersChange={onClustersChange}
      onColorsChange={onColorsChange}
      clusters
      colors
      {...overrides}
    />,
  );

  return { onClustersChange, onColorsChange };
}

describe(CalendarViewMenu, () => {
  it("applies its class name", () => {
    render(
      <CalendarViewMenu
        className="calendar-view-menu"
        onClustersChange={vi.fn<(enabled: boolean) => void>()}
        onColorsChange={vi.fn<(enabled: boolean) => void>()}
        clusters
        colors
      />,
    );

    expect(screen.getByTestId("calendar-view-menu").className).toBe(
      "calendar-view-menu",
    );
  });

  it("reads View", () => {
    renderMenu();

    expect(screen.getByRole("button", { name: "View options" })).toBeDefined();
    expect(screen.getByText("View")).toBeDefined();
  });

  it("has no collections, which belong to the filter panel", async () => {
    renderMenu();
    fireEvent.click(screen.getByRole("button", { name: "View options" }));
    await screen.findByRole("menuitemcheckbox", {
      name: "Color events",
    });

    expect(screen.queryByText("Collections")).toBeNull();
    expect(screen.queryByText("All events")).toBeNull();
  });

  it("turns colors off from the menu", async () => {
    const { onColorsChange } = renderMenu();

    fireEvent.click(screen.getByRole("button", { name: "View options" }));
    fireEvent.click(
      await screen.findByRole("menuitemcheckbox", {
        name: "Color events",
      }),
    );

    expect(onColorsChange).toHaveBeenCalledWith(false);
  });

  it("shows the colors' state in the checkbox", async () => {
    renderMenu({ colors: false });
    fireEvent.click(screen.getByRole("button", { name: "View options" }));

    const checkbox = await screen.findByRole("menuitemcheckbox", {
      name: "Color events",
    });

    expect(checkbox.getAttribute("aria-checked")).toBe("false");
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

  it("draws the Color by submenu it is given after the colors switch", async () => {
    renderMenu({ colorOptions: <p>Color by: Planet</p> });
    fireEvent.click(screen.getByRole("button", { name: "View options" }));

    await expect(screen.findByText("Color by: Planet")).resolves.toBeDefined();
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
