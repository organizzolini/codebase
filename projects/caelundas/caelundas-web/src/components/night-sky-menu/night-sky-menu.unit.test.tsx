import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DropdownMenu, DropdownMenuContent } from "@codebase/presentation";

import { NightSkyMenu } from "./night-sky-menu";

import type { ReactNode } from "react";

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

/**
 * An open dropdown menu, which the submenu belongs inside.
 */
function OpenMenu(properties: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <DropdownMenu open>
      <DropdownMenuContent>{properties.children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

describe(NightSkyMenu, () => {
  it("applies its class name", () => {
    render(<NightSkyMenu className="night-sky-menu" />, { wrapper: OpenMenu });

    expect(screen.getByTestId("night-sky-menu").className).toBe(
      "night-sky-menu",
    );
    expect(screen.getByText("Night sky")).toBeDefined();
  });
});
