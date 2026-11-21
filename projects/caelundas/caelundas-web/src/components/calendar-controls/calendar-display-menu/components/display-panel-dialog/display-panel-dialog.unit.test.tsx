import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DisplayPanelDialog } from "./display-panel-dialog";

import type { DisplayPanelDialogProperties } from "./display-panel-dialog";

vi.mock(
  import("../../../../../hooks/use-night-sky/hooks/use-night-sky-settings/use-night-sky-settings"),
  async () => {
    const { readNightSkyOverrides } =
      await import("../../../../../hooks/use-night-sky/use-night-sky.utilities");

    return {
      useNightSkySettings: () => ({
        change: vi.fn<() => void>(),
        constellations: [],
        settings: readNightSkyOverrides({}),
      }),
    };
  },
);

const PROPERTIES: DisplayPanelDialogProperties = {
  colorBy: undefined,
  colors: true,
  facets: [],
  onClose: () => {},
  onColorByChange: () => {},
  onColorsChange: () => {},
  panel: undefined,
};

describe(DisplayPanelDialog, () => {
  it("draws nothing while no panel is open", () => {
    render(<DisplayPanelDialog {...PROPERTIES} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the Color settings for the color panel", async () => {
    render(
      <DisplayPanelDialog
        {...PROPERTIES}
        panel="color"
      />,
    );

    await expect(
      screen.findByRole("dialog", { name: "Color settings" }),
    ).resolves.toBeDefined();
    expect(screen.getByTestId("calendar-color-menu")).toBeDefined();
  });

  it("opens the Sky settings for the sky panel", async () => {
    render(
      <DisplayPanelDialog
        {...PROPERTIES}
        panel="sky"
      />,
    );

    await expect(
      screen.findByRole("dialog", { name: "Sky settings" }),
    ).resolves.toBeDefined();
    expect(screen.getByTestId("night-sky-menu")).toBeDefined();
  });

  it("asks to close when its close button is pressed", async () => {
    const onClose = vi.fn<() => void>();

    render(
      <DisplayPanelDialog
        {...PROPERTIES}
        onClose={onClose}
        panel="color"
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledExactlyOnceWith();
  });
});
