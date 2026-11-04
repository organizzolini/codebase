import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NightSkyMenu } from "./night-sky-menu";

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

describe(NightSkyMenu, () => {
  it("applies its class name", () => {
    render(<NightSkyMenu className="night-sky-menu" />);

    expect(screen.getByTestId("night-sky-menu").className).toBe(
      "night-sky-menu",
    );
  });

  it("opens from its Sky button onto every group, with no headings, and its Default button", async () => {
    render(<NightSkyMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Sky options" }));

    await screen.findByRole("group", { name: "Night sky settings" });

    for (const title of [
      "Sky",
      "Stars",
      "Angles",
      "Constellation lines",
      "Ecliptic",
    ]) {
      expect(screen.getByRole("group", { name: title })).toBeDefined();
    }

    expect(screen.queryByRole("heading")).toBeNull();

    expect(
      screen.getByRole("group", { name: "Constellations to draw" }),
    ).toBeDefined();
    expect(screen.queryByRole("button", { name: "Full" })).toBeNull();
    expect(screen.getByRole("button", { name: "Default" })).toBeDefined();
  });
});
