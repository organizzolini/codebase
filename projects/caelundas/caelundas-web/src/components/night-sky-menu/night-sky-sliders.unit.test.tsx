import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readNightSkyOverrides } from "../../hooks/use-night-sky/use-night-sky.utilities";

import { STAR_SLIDERS } from "./night-sky-menu.constants";
import { NightSkySliders } from "./night-sky-sliders";

describe(NightSkySliders, () => {
  it("applies its class name", () => {
    render(
      <NightSkySliders
        className="night-sky-sliders"
        controls={STAR_SLIDERS}
        onValueChange={vi.fn<() => void>()}
        settings={readNightSkyOverrides({})}
      />,
    );

    expect(screen.getByTestId("night-sky-sliders").className).toBe(
      "night-sky-sliders",
    );
  });

  it("draws a slider for each control, showing its setting", () => {
    render(
      <NightSkySliders
        controls={STAR_SLIDERS}
        onValueChange={vi.fn<() => void>()}
        settings={readNightSkyOverrides({ "sky.starScale": 2 })}
      />,
    );

    expect(screen.getAllByTestId("night-sky-slider")).toHaveLength(3);
    expect(screen.getByText("2×")).toBeDefined();
  });
});
