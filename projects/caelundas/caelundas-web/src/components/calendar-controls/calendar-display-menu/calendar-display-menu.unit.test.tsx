import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarDisplayMenu } from "./calendar-display-menu";

const display = vi.hoisted(() => ({
  change: vi.fn<() => void>(),
  handlers: {
    handleClustersChange: vi.fn<(enabled: boolean) => void>(),
    handleColorsChange: vi.fn<() => void>(),
    handleScaleChange: vi.fn<() => void>(),
    handleSymbolsChange: vi.fn<() => void>(),
    handleViewChange: vi.fn<(view: string) => void>(),
  },
}));

vi.mock(
  import("../../../hooks/use-calendar-display/use-calendar-display"),
  async () => {
    const { readNightSkyOverrides } =
      await import("../../../hooks/use-night-sky/use-night-sky.utilities");

    return {
      useCalendarDisplay: () =>
        ({
          change: display.change,
          constellations: [],
          handlers: display.handlers,
          sky: readNightSkyOverrides({}),
          state: {
            clusters: true,
            colors: true,
            scale: "month",
            symbols: "glyphs",
          },
        }) as never,
    };
  },
);

const PROPERTIES = {
  timeZone: "UTC",
  view: "timeline",
} as const;

describe(CalendarDisplayMenu, () => {
  // The list scrolls its active item into view, which jsdom cannot do.
  beforeAll(() => {
    globalThis.HTMLElement.prototype.scrollIntoView = vi.fn<() => void>();
  });

  it("applies its class name", () => {
    render(
      <CalendarDisplayMenu
        {...PROPERTIES}
        className="calendar-display-menu"
      />,
    );

    expect(screen.getByTestId("calendar-display-menu").className).toBe(
      "calendar-display-menu",
    );
  });

  it("joins the Display button to a chip naming the symbols drawn, not the view", () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);

    expect(screen.getByRole("group", { name: "Display" }).textContent).toBe(
      "DisplayGlyphs",
    );
  });

  it("leads the chip with the icon the symbol set has in the list", () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);

    expect(
      screen
        .getByRole("button", { name: "Glyphs" })
        .querySelector("svg")
        ?.classList.contains("lucide-shapes"),
    ).toBe(true);
  });

  it("opens its list from the chip as well as the button", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Glyphs" }));

    await expect(screen.findByTestId("query-cascader")).resolves.toBeDefined();
  });

  it("lists Symbols, Colors, Crowded days and Skyfield, and no Layout", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));

    for (const label of ["Symbols", "Colors", "Crowded days", "Skyfield"]) {
      await expect(screen.findByText(label)).resolves.toBeDefined();
    }

    expect(screen.queryByText("Layout")).toBeNull();
    expect(screen.queryByText("Quarter")).toBeNull();

    expect(screen.queryByText("Skyfield settings…")).toBeNull();
  });

  it("writes a choice from the list: a switch flips, and a symbol set is ticked in its branch", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.click(await screen.findByText("Crowded days"));

    expect(display.handlers.handleClustersChange).toHaveBeenCalledWith(false);

    // Symbols is open already, so its Emojis row needs no click on the branch.
    fireEvent.click(await screen.findByText("Emojis"));

    expect(display.handlers.handleSymbolsChange).toHaveBeenCalledWith("emojis");
  });

  it("opens with Symbols expanded and the other branches closed", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));

    await expect(
      screen.findByRole("treeitem", { name: /^Emojis/u }),
    ).resolves.toBeDefined();
    expect(
      screen.queryByRole("treeitem", { name: /^Constellations/u }),
    ).toBeNull();
  });

  it("lists its choices as a tree, each branch opening beneath itself", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));

    await expect(
      screen.findByRole("treeitem", { name: /^Symbols/u }),
    ).resolves.toBeDefined();
    expect(screen.queryByRole("button", { name: /^back$/iu })).toBeNull();
  });

  it("finds a choice by searching for it", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.change(
      await screen.findByPlaceholderText("Search display options"),
      {
        target: { value: "emojis" },
      },
    );
    fireEvent.click(await screen.findByRole("treeitem", { name: /^Emojis/u }));

    expect(display.handlers.handleSymbolsChange).toHaveBeenCalledWith("emojis");
  });
});
