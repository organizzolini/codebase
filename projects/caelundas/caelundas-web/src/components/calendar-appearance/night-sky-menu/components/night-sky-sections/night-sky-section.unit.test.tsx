import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NightSkySection } from "./night-sky-section";

describe(NightSkySection, () => {
  it("applies its class name", () => {
    render(
      <NightSkySection
        className="night-sky-section"
        title="Stars"
      />,
    );

    expect(screen.getByTestId("night-sky-section").className).toBe(
      "night-sky-section",
    );
  });

  it("names its group for a screen reader, with no heading on screen", () => {
    render(
      <NightSkySection title="Stars">
        <p>The sliders</p>
      </NightSkySection>,
    );

    expect(screen.getByRole("group", { name: "Stars" })).toBeDefined();
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("The sliders")).toBeDefined();
  });
});
