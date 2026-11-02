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

  it("shows its heading and, always, its controls", () => {
    render(
      <NightSkySection title="Stars">
        <p>The sliders</p>
      </NightSkySection>,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Stars" }),
    ).toBeDefined();
    expect(screen.getByText("The sliders")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
