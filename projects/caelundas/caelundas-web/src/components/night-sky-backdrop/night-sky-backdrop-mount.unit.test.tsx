import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NightSkyBackdropMount } from "./night-sky-backdrop-mount";

vi.mock(import("../../hooks/use-night-sky/use-night-sky"), () => ({
  useNightSky: () => ({ sky: '<svg role="img"><circle r="1"/></svg>' }),
}));

describe(NightSkyBackdropMount, () => {
  it("applies its class name", () => {
    render(<NightSkyBackdropMount className="night-sky-backdrop-mount" />);

    expect(screen.getByTestId("night-sky-backdrop-mount").className).toBe(
      "night-sky-backdrop-mount",
    );
  });

  it("draws the sky the hook builds, fixed behind the page", () => {
    render(<NightSkyBackdropMount />);

    const backdrop = screen.getByTestId("night-sky-backdrop");

    expect(backdrop.className).toContain("fixed inset-0 -z-10");
    expect(backdrop.querySelector("circle")).not.toBeNull();
  });
});
