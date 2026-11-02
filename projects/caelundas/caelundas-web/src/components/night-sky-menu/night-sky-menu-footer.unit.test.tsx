import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NightSkyMenuFooter } from "./night-sky-menu-footer";
import { toFullViewChange, toResetChange } from "./night-sky-menu.utilities";

import type { SkySearchChange } from "./night-sky-menu.types";

describe(NightSkyMenuFooter, () => {
  it("applies its class name", () => {
    render(
      <NightSkyMenuFooter
        className="night-sky-menu-footer"
        onChange={vi.fn<(change: SkySearchChange) => void>()}
      />,
    );

    expect(screen.getByTestId("night-sky-menu-footer").className).toBe(
      "night-sky-menu-footer",
    );
  });

  it("sends the pole's whole sky from Full and every default from Default", () => {
    const onChange = vi.fn<(change: SkySearchChange) => void>();
    render(<NightSkyMenuFooter onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Full" }));
    fireEvent.click(screen.getByRole("button", { name: "Default" }));

    expect(onChange.mock.calls).toStrictEqual([
      [toFullViewChange()],
      [toResetChange()],
    ]);
  });
});
