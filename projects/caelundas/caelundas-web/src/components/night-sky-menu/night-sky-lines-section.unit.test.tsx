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

    expect(onChange).toHaveBeenCalledWith({ "sky.ecliptic": false });
  });

  it("puts the figures' stroke above the ecliptic's, with no heading", () => {
    render(
      <NightSkyLinesSection
        onChange={vi.fn<(change: SkySearchChange) => void>()}
        settings={readNightSkyOverrides({})}
      />,
    );

    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getAllByTestId("night-sky-slider")).toHaveLength(4);

    const figures = screen.getByRole("group", { name: "Constellation lines" });
    const ecliptic = screen.getByRole("group", { name: "Ecliptic" });

    expect(
      figures.compareDocumentPosition(ecliptic) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeGreaterThan(0);
  });
});
