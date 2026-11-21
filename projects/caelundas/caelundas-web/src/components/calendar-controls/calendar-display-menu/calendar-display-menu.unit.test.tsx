import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

vi.mock(
  import("../../../hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings"),
  async () => {
    const { readNightSkyOverrides } =
      await import("../../../hooks/use-night-sky/use-night-sky.utilities");

    return {
      useNightSkySettings: () => ({
        change: vi.fn<() => void>(),
        constellations: [],
        settings: readNightSkyOverrides({}),
      }),
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

  it("nests Calendar, Color and Sky in its list, with panels for Color and Sky beneath", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));

    for (const label of ["Calendar", "Color", "Sky", "Scale", "Symbols"]) {
      await expect(screen.findByText(label)).resolves.toBeDefined();
    }

    expect(screen.getByText("Color settings…")).toBeDefined();
    expect(screen.getByText("Sky settings…")).toBeDefined();
  });

  it("writes a choice from the list: a switch flips and a view is set", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.click(await screen.findByText("Crowded days"));
    fireEvent.click(await screen.findByText("Group similar events"));

    expect(display.handlers.handleClustersChange).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText("Calendar"));
    fireEvent.click(await screen.findByText("Week"));

    expect(display.handlers.handleViewChange).toHaveBeenCalledWith("week");
  });

  it.each([
    { action: "Color settings…", title: "Color settings" },
    { action: "Sky settings…", title: "Sky settings" },
  ])("opens $title from its footer action", async ({ action, title }) => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.click(await screen.findByText(action));

    await expect(
      screen.findByRole("dialog", { name: title }),
    ).resolves.toBeDefined();
  });

  it("closes the panel with its close button", async () => {
    render(<CalendarDisplayMenu {...PROPERTIES} />);
    fireEvent.click(screen.getByRole("button", { name: "Display" }));
    fireEvent.click(await screen.findByText("Color settings…"));
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
