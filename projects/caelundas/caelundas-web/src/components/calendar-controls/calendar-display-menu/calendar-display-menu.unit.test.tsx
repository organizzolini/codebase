import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { CalendarDisplayMenu } from "./calendar-display-menu";

const display = vi.hoisted(() => ({
  change: vi.fn<() => void>(),
  handlers: {
    handleClustersChange: vi.fn<(enabled: boolean) => void>(),
    handleColorByChange: vi.fn<() => void>(),
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
  colorBy: undefined,
  facets: [],
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

  it("names the view shown on a chip beside the Display button", () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);

    expect(screen.getByRole("group", { name: "Display" }).textContent).toBe(
      "DisplayTimeline",
    );
  });

  it("opens its list from the chip as well as the button", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Timeline" }));

    await expect(screen.findByTestId("query-cascader")).resolves.toBeDefined();
  });

  it("nests Calendar, Color and Sky in its list", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));

    for (const label of ["Calendar", "Color", "Sky", "Scale", "Symbols"]) {
      await expect(screen.findByText(label)).resolves.toBeDefined();
    }

    expect(screen.queryByText("Color settings…")).toBeNull();
    expect(screen.queryByText("Sky settings…")).toBeNull();
  });

  it("writes a choice from the list: a switch flips, and a view is set from the toggle group", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.click(await screen.findByText("Crowded days"));
    fireEvent.click(await screen.findByText("Group similar events"));

    expect(display.handlers.handleClustersChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: /^back$/iu }));
    fireEvent.click(await screen.findByText("Calendar"));
    fireEvent.click(await screen.findByRole("radio", { name: "Week" }));

    expect(display.handlers.handleViewChange).toHaveBeenCalledWith("week");
  });

  it("finds a view by searching for it", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.change(
      await screen.findByPlaceholderText("Search display options"),
      {
        target: { value: "agenda" },
      },
    );
    fireEvent.click(await screen.findByRole("option", { name: /^Agenda/u }));

    expect(display.handlers.handleViewChange).toHaveBeenCalledWith("agenda");
  });
});
