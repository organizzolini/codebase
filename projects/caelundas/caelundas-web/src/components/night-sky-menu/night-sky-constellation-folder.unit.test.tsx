import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NightSkyConstellationFolder } from "./night-sky-constellation-folder";

import type { ConstellationListing } from "../../hooks/use-night-sky/night-sky.types";

const ZODIAC: readonly ConstellationListing[] = [
  "Aquarius",
  "Aries",
  "Cancer",
  "Capricornus",
  "Gemini",
  "Leo",
  "Libra",
  "Pisces",
  "Sagittarius",
  "Scorpius",
  "Taurus",
  "Virgo",
].map((name) => ({ name, zodiac: true }));

const NAMES = ZODIAC.map(({ name }) => name);

/**
 * The folder's own checkbox.
 */
function findFolder(): HTMLElement {
  return screen.getByRole("checkbox", { name: "Zodiac" });
}

describe(NightSkyConstellationFolder, () => {
  it("applies its class name", () => {
    render(
      <NightSkyConstellationFolder
        className="night-sky-constellation-folder"
        constellations={ZODIAC}
        label="Zodiac"
        onToggle={vi.fn<() => void>()}
        shown={new Set()}
      />,
    );

    expect(screen.getByTestId("night-sky-constellation-folder").className).toBe(
      "night-sky-constellation-folder",
    );
  });

  it("checks its box for all twelve, dashes it for some, and clears it for none", () => {
    const { rerender } = render(
      <NightSkyConstellationFolder
        constellations={ZODIAC}
        label="Zodiac"
        onToggle={vi.fn<() => void>()}
        shown={new Set(NAMES)}
      />,
    );

    expect(findFolder().getAttribute("aria-checked")).toBe("true");

    rerender(
      <NightSkyConstellationFolder
        constellations={ZODIAC}
        label="Zodiac"
        onToggle={vi.fn<() => void>()}
        shown={new Set(["Leo", "Virgo"])}
      />,
    );

    expect(findFolder().getAttribute("aria-checked")).toBe("mixed");

    rerender(
      <NightSkyConstellationFolder
        constellations={ZODIAC}
        label="Zodiac"
        onToggle={vi.fn<() => void>()}
        shown={new Set()}
      />,
    );

    expect(findFolder().getAttribute("aria-checked")).toBe("false");
  });

  it("toggles all twelve from its box, and one from its own", () => {
    const onToggle = vi.fn<(names: readonly string[]) => void>();

    render(
      <NightSkyConstellationFolder
        constellations={ZODIAC}
        label="Zodiac"
        onToggle={onToggle}
        shown={new Set(["Leo"])}
        defaultOpen
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Zodiac" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Virgo" }));

    expect(onToggle.mock.calls).toStrictEqual([[NAMES], [["Virgo"]]]);
  });

  it("opens and closes with its chevron, closed unless told otherwise", () => {
    render(
      <NightSkyConstellationFolder
        constellations={ZODIAC}
        label="Zodiac"
        onToggle={vi.fn<() => void>()}
        shown={new Set()}
      />,
    );

    expect(screen.queryByRole("checkbox", { name: "Leo" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Expand Zodiac" }));

    expect(screen.getByRole("checkbox", { name: "Leo" })).toBeDefined();
    expect(
      screen
        .getByRole("button", { name: "Collapse Zodiac" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
  });
});
