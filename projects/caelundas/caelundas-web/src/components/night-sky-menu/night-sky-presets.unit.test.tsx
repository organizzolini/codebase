import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { toFullViewChange, toResetChange } from "./night-sky-menu.utilities";
import { NightSkyPresets } from "./night-sky-presets";

import type { SkySearchChange } from "./night-sky-menu.types";

describe(NightSkyPresets, () => {
  it("applies its class name", () => {
    render(
      <NightSkyPresets
        className="night-sky-presets"
        onChange={vi.fn<(change: SkySearchChange) => void>()}
      />,
    );

    expect(screen.getByTestId("night-sky-presets").className).toBe(
      "night-sky-presets",
    );
  });

  it("joins Full and Default in one labelled group", () => {
    render(
      <NightSkyPresets onChange={vi.fn<(change: SkySearchChange) => void>()} />,
    );

    const group = screen.getByRole("group", { name: "Sky presets" });

    expect(
      [...group.querySelectorAll("button")].map((button) => button.textContent),
    ).toStrictEqual(["Full", "Default"]);
  });

  it("sends the pole's whole sky from Full and every default from Default", () => {
    const onChange = vi.fn<(change: SkySearchChange) => void>();
    render(<NightSkyPresets onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Full" }));
    fireEvent.click(screen.getByRole("button", { name: "Default" }));

    expect(onChange.mock.calls).toStrictEqual([
      [toFullViewChange()],
      [toResetChange()],
    ]);
  });
});
