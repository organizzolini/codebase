import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NightSkyBackdrop } from "./night-sky-backdrop";

describe(NightSkyBackdrop, () => {
  it("applies its class name", () => {
    render(<NightSkyBackdrop className="night-sky-backdrop" />);

    expect(screen.getByTestId("night-sky-backdrop").className).toBe(
      "night-sky-backdrop",
    );
  });

  it("draws the sky it is given, out of reach of assistive technology", () => {
    render(<NightSkyBackdrop sky='<svg role="img"><circle r="1"/></svg>' />);

    const backdrop = screen.getByTestId("night-sky-backdrop");

    expect(backdrop.getAttribute("aria-hidden")).toBe("true");
    expect(backdrop.querySelector("circle")).not.toBeNull();
  });

  it("draws nothing without a sky", () => {
    render(<NightSkyBackdrop />);

    expect(
      screen.getByTestId("night-sky-backdrop").querySelector("svg"),
    ).toBeNull();
  });
});
