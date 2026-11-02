import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { readNightSkyOverrides } from "../../hooks/use-night-sky/use-night-sky.utilities";

import { NightSkyLinesSection } from "./night-sky-lines-section";

import type { SkySearchChange } from "./night-sky-menu.types";

describe(NightSkyLinesSection, () => {
  it("applies its class name", () => {
    render(
      <NightSkyLinesSection
        className="night-sky-lines-section"
        onChange={vi.fn<(change: SkySearchChange) => void>()}
        settings={readNightSkyOverrides({})}
      />,
    );

    expect(screen.getByTestId("night-sky-lines-section").className).toBe(
      "night-sky-lines-section",
    );
  });

  it("sends the ecliptic switch to the link", () => {
    const onChange = vi.fn<(change: SkySearchChange) => void>();
    render(
      <NightSkyLinesSection
        onChange={onChange}
        settings={readNightSkyOverrides({})}
      />,
    );

    fireEvent.click(screen.getByRole("switch", { name: "Show the ecliptic" }));

    expect(onChange).toHaveBeenCalledWith({ "sky.ecliptic": true });
  });

  it("holds the ecliptic and the figures' strokes under one Lines heading", () => {
    render(
      <NightSkyLinesSection
        onChange={vi.fn<(change: SkySearchChange) => void>()}
        settings={readNightSkyOverrides({})}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Lines" }),
    ).toBeDefined();
    expect(screen.getAllByRole("heading")).toHaveLength(1);
    expect(screen.getAllByTestId("night-sky-slider")).toHaveLength(4);
  });
});
