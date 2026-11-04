import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SKY_SLIDERS } from "./night-sky-menu.constants";
import { NightSkySlider } from "./night-sky-slider";

const [LATITUDE] = SKY_SLIDERS;

if (LATITUDE === undefined) {
  throw new Error("The menu lists no slider");
}

describe(NightSkySlider, () => {
  it("applies its class name", () => {
    render(
      <NightSkySlider
        className="night-sky-slider"
        control={LATITUDE}
        onValueChange={vi.fn<() => void>()}
        value={40.73}
      />,
    );

    expect(screen.getByTestId("night-sky-slider").className).toBe(
      "night-sky-slider",
    );
  });

  it("shows its label and value, and steps with the arrow keys", () => {
    const onValueChange = vi.fn<(key: string, value: number) => void>();

    render(
      <NightSkySlider
        control={LATITUDE}
        onValueChange={onValueChange}
        value={40}
      />,
    );

    // Base UI keeps the range input visually hidden, which jsdom reads as
    // hidden from the accessibility tree, so it is found by its label.
    const [slider] = screen.getAllByLabelText("Latitude", {
      selector: "input",
    });

    expect(slider?.getAttribute("type")).toBe("range");

    expect(screen.getByText("40°")).toBeDefined();

    if (slider === undefined) {
      throw new Error("No slider is labelled Latitude");
    }

    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(onValueChange).toHaveBeenCalledWith("sky.lat", 40.5);
  });
});
