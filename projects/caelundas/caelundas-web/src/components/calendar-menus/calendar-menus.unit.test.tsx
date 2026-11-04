import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CalendarMenus } from "./calendar-menus";

vi.mock(
  import("../../hooks/use-night-sky/use-night-sky-settings"),
  async () => {
    const { readNightSkyOverrides } =
      await import("../../hooks/use-night-sky/use-night-sky.utilities");

    return {
      useNightSkySettings: () => ({
        change: vi.fn<() => void>(),
        constellations: [],
        settings: readNightSkyOverrides({}),
      }),
    };
  },
);

describe(CalendarMenus, () => {
  it("applies its class name", () => {
    render(<CalendarMenus className="calendar-menus" />);

    expect(screen.getByTestId("calendar-menus").className).toBe(
      "calendar-menus",
    );
  });

  it("draws View, Color and Sky in that order", () => {
    render(<CalendarMenus />);

    expect(
      screen
        .getAllByRole("button", { name: /options$/u })
        .map((button) => button.getAttribute("aria-label")),
    ).toStrictEqual(["View options", "Color options", "Sky options"]);
  });
});
