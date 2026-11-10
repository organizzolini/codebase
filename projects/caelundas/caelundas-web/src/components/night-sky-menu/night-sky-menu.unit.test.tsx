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

  it("offers an opacity slider for the sky and one for the calendar over it", async () => {
    render(<NightSkyMenu />);

    fireEvent.click(screen.getByRole("button", { name: "Sky options" }));

    await screen.findByRole("group", { name: "Night sky settings" });

    // Base UI keeps the range input visually hidden, which jsdom reads as
    // hidden from the accessibility tree, so it is found by its label.
    const [sky] = screen.getAllByLabelText("Sky opacity", {
      selector: "input",
    });
    const [calendar] = screen.getAllByLabelText("Calendar opacity", {
      selector: "input",
    });

    expect(sky?.getAttribute("value")).toBe("0.6");
    expect(calendar?.getAttribute("value")).toBe("0.7");
  });
});
